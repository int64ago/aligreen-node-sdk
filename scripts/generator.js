const fetch = require('node-fetch');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

const PYTHON_API_URL = 'https://github.com/aliyun/aliyun-openapi-python-sdk/tree/master/aliyun-python-sdk-green/aliyunsdkgreen/request/v20180509';

const RAW_CODE_URL = 'https://raw.githubusercontent.com/aliyun/aliyun-openapi-python-sdk/master/aliyun-python-sdk-green/aliyunsdkgreen/request/v20180509';

(async () => {
  const text = await fetch(PYTHON_API_URL).then(res => res.text());
  const reg = /v20180509\/([a-zA-Z]+)\.py/gm;

  const actions = {};
  while ((item = reg.exec(text))) {
    const content = await fetch(`${RAW_CODE_URL}/${item[1]}.py`).then(res => res.text());
    const match = content.match(/set_uri_pattern\('([\w\W]+?)'\)/);
    actions[item[1]] = match[1];
    console.log(`${item[1]} -> ${match[1]}`);
  }
  
  writeFileSync(
    resolve(__dirname, '../lib/actions.json'),
    JSON.stringify(actions, null, 2)
  );

})();
