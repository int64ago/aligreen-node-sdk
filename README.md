aligreen-node-sdk
---

![API Version][api-version]
[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![Build Status][travis-image]][travis-url]

Unofficial Node SDK for aligreen.

阿里云 - 云盾 - [内容安全](https://yundun.console.aliyun.com/?p=cts) API 非官方 NodeJS SDK

> **Note:** Node >= v8 LTS

## Install

```bash
npm i @aligreen/sdk uuid -S
```

or

```bash
yarn add @aligreen/sdk uuid
```

> `uuid` is optional

## Usage

```js
const uuidV4 = require('uuid/v4');
const AliGreenSDK = require('@aligreen/sdk');

// Initialize a client
const client = new AliGreenSDK({
  accessKeyId: '<ak>',
  accessKeySecret: '<sk>',
  regionId: 'cn-shanghai',
});

(async () => {

  // detect with url
  const result1 = await client.request('ImageSyncScanRequest', {
    scenes: ['porn'],
    tasks: [
      {
        dataId: uuidV4(), // unique
        url: 'https://img.alicdn.com/tfs/TB1urBOQFXXXXbMXFXXXXXXXXXX-1442-257.png',
      }
    ],
  });
  console.log(result1);


  // detect with local file
  const url = await client.upload('/path/of/file');
  const result2 = await client.request('ImageSyncScanRequest', {
    scenes: ['porn'],
    tasks: [
      {
        dataId: uuidV4(),
        url,
      }
    ],
  });
  console.log(result2);

})();
```

## API

Here `action` is the same in [Python SDK](https://github.com/aliyun/aliyun-openapi-python-sdk/tree/master/aliyun-python-sdk-green/aliyunsdkgreen/request/v20180509), here's a [relation map](https://github.com/int64ago/aligreen-node-sdk/blob/master/lib/actions.json) between `action` and `path`.

For more details, please read the [official documents](https://help.aliyun.com/document_detail/70409.html).

```typescript
export = AliGreenSDK;

declare class AliGreenSDK {
  constructor(options: IOptions);

  /**
   * Make a detect request
   * @param action Request action name or url path
   * @param params Request parameters
   */
  request(action: string, params?: IJSON): Promise<any>;

  /**
   * Upload local file to OSS
   * @param filepath Absolute local file path
   */
  upload(filepath: string): Promise<string>;
}

interface IJSON {
  [k: string]: any;
}

interface IOptions {
  accessKeyId: string;
  accessKeySecret: string;
  regionId: string;
  // Optinal, default: 2018-05-09
  apiVersion?: string;
  // Optinal, default: {}
  clientInfo?: IClientInfo;
}

// Ref: https://help.aliyun.com/document_detail/53413.html#h2-url-2
interface IClientInfo {
  sdkVersion?: string;
  cfgVersion?: string;
  userType?: 'taobao' | 'others';
  userId?: string;
  userNick?: string;
  avatar?: string;
  imei?: string;
  imsi?: string;
  umid?: string;
  ip?: string;
  os?: string;
  channel?: string;
  hostAppName?: string;
  hostPackage?: string;
  hostVersion?: string;
}
```

## Developement

 - `git clone https://github.com/int64ago/aligreen-node-sdk.git`
 - `cd aligreen-node-sdk`
 - `npm install`
 - `npm run generate`
 - `AK=<AK> SK=<SK> npm test`

## LICENSE

MIT


 [api-version]: https://img.shields.io/badge/Version-2018--05--09-%23ff69b4.svg?style=flat-square
 [npm-image]: https://img.shields.io/npm/v/@aligreen/sdk.svg?style=flat-square
 [npm-url]: https://npmjs.org/package/@aligreen/sdk
 [download-image]: https://img.shields.io/npm/dm/@aligreen/sdk.svg?style=flat-square
 [download-url]: https://npmjs.org/package/@aligreen/sdk
 [travis-url]: https://travis-ci.com/int64ago/aligreen-node-sdk
 [travis-image]: https://img.shields.io/com/travis/int64ago/aligreen-node-sdk.svg?style=flat-square
