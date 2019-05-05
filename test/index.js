const test = require('ava');
const uuidV4 = require('uuid/v4');

const AliGreenSDK = require('../lib/index');

const client = new AliGreenSDK({
  accessKeyId: process.env.AK,
  accessKeySecret: process.env.SK,
  regionId: 'cn-shanghai',
});

test('bar', t => {
  return client.request('ImageSyncScanRequest', {
    scenes: ['porn'],
    tasks: [
      {
        dataId: `dataId_${uuidV4()}`,
        url: 'https://img.alicdn.com/tfs/TB1urBOQFXXXXbMXFXXXXXXXXXX-1442-257.png',
      }
    ],
  }).then(result => {
    t.is(result.code, 200);
  });
});
