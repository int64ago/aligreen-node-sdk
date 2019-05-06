const { isAbsolute } = require('path');
const fetch = require('node-fetch');
const uuidV4 = require('uuid/v4');
const crypto = require('crypto');
const OSS = require('ali-oss');
const isPlainObject = require('is-plain-object');

const actions = require('./actions.json');

class AliGreenSDK {
  constructor(options = {}) {
    if (!options.accessKeyId) {
      throw new Error(`'accessKeyId' is required.`)
    }

    if (!options.accessKeySecret) {
      throw new Error(`'accessKeySecret' is required.`)
    }

    if (!options.regionId) {
      throw new Error(`'regionId' is required.`)
    }

    if (options.clientInfo && !isPlainObject(options.clientInfo)) {
      throw new Error(`'clientInfo' should be plain object.`)
    }

    this.options = Object.assign({
      clientInfo: {},
      apiVersion: '2018-05-09',
    }, options);
  }

  async request(action, params = {}) {
    const path = actions[action];

    if (!path) {
      throw new Error(`Can't find the action.`);
    }

    if (!isPlainObject(params)) {
      throw new Error(`'params' should be plain object.`)
    }

    const headers = this._buildHeaders(path, params);

    const encodedPath = encodeURI(`${path}?clientInfo=${JSON.stringify(this.options.clientInfo)}`);
    const url = `https://green.${this.options.regionId}.aliyuncs.com${encodedPath}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    return await res.json();
  }

  async upload(filepath) {
    if (!isAbsolute(filepath)) {
      throw new Error(`${filepath} should be an absolute path.`);
    }

    const credentials = await this.request('UploadCredentialsRequest');
    if (!credentials || !credentials.code || credentials.code !== 200 || !credentials.data) {
      throw new Error(`Get upload credentials error: ${JSON.stringify(credentials)}`);
    }

    const ossClient = new OSS({
      region: `oss-${this.options.regionId}`,
      accessKeyId: credentials.data.accessKeyId,
      accessKeySecret: credentials.data.accessKeySecret,
      stsToken: credentials.data.securityToken,
      bucket: credentials.data.uploadBucket,
    });
    const key = `${credentials.data.uploadFolder}/images/${uuidV4()}`;

    await ossClient.put(key, filepath);

    return `oss://${credentials.data.uploadBucket}/${key}`;
  }

  // Ref: https://help.aliyun.com/document_detail/53413.html#h2-url-1
  _buildHeaders(path, params = {}) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',  
      'Content-MD5':
        crypto.createHash('md5').update(JSON.stringify(params)).digest().toString('base64'),
      'Date': new Date().toUTCString(),
      'x-acs-version': this.options.apiVersion,
      'x-acs-signature-nonce': uuidV4(),
      'x-acs-signature-version': '1.0',
      'x-acs-signature-method': 'HMAC-SHA1',
    };

    const signature = [
      'POST\n',
      'application/json\n',
      `${headers['Content-MD5']}\n`,
      'application/json\n',
      `${headers['Date']}\n`,
      `x-acs-signature-method:${headers['x-acs-signature-method']}\n`,
      `x-acs-signature-nonce:${headers['x-acs-signature-nonce']}\n`,
      `x-acs-signature-version:${headers['x-acs-signature-version']}\n`,
      `x-acs-version:${headers['x-acs-version']}\n`,
      `${path}?clientInfo=${JSON.stringify(this.options.clientInfo)}`,
    ];

    const authorization = crypto.createHmac('sha1', this.options.accessKeySecret)
      .update(signature.join(''))
      .digest().toString('base64');

    headers['Authorization'] = `acs ${this.options.accessKeyId}:${authorization}`;

    return headers;
  }
}

module.exports = AliGreenSDK;
