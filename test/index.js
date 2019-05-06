const { resolve } = require('path');
const test = require('ava');
const uuidV4 = require('uuid/v4');

const AliGreenSDK = require('../lib/index');

const client = new AliGreenSDK({
  accessKeyId: process.env.AK,
  accessKeySecret: process.env.SK,
  regionId: 'cn-shanghai',
});

test('detect with url', async t => {
  const result = await client.request('ImageSyncScanRequest', {
    scenes: ['porn'],
    tasks: [
      {
        dataId: `dataId_${uuidV4()}`,
        url: 'https://img.alicdn.com/tfs/TB1urBOQFXXXXbMXFXXXXXXXXXX-1442-257.png',
      }
    ],
  });
  t.is(result.code, 200);
});

test('detect with local file', async t => {
  const url = await client.upload(resolve(__dirname, 'test.png'));
  const result = await client.request('ImageSyncScanRequest', {
    scenes: ['porn'],
    tasks: [
      {
        dataId: `dataId_${uuidV4()}`,
        url,
      }
    ],
  });
  t.is(result.code, 200);
});
