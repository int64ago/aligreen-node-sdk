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

  request(action, params = {}) {
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

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    }).then(res => res.json());
  }

  upload(filepath) {
    if (!isAbsolute(filepath)) {
      throw new Error(`${filepath} should be an absolute path.`);
    }

    return this.request('UploadCredentialsRequest').then(result => {
      if (!result || !result.code || result.code !== 200 || !result.data) {
        throw new Error(`Get upload credentials error: ${JSON.stringify(result)}`);
      }

      const ossClient = new OSS({
        region: `oss-${this.options.regionId}`,
        accessKeyId: result.data.accessKeyId,
        accessKeySecret: result.data.accessKeySecret,
        stsToken: result.data.securityToken,
        bucket: result.data.uploadBucket,
      });

      const key = `${result.data.uploadFolder}/images/${uuidV4()}`;
      return ossClient.put(key, filepath).then(() => {
        return `oss://${result.data.uploadBucket}/${key}`;
      });
    });
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
