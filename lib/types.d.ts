export = AliGreenSDK;

declare class AliGreenSDK {
  constructor(options: IOptions);

  request(action: string, params?: IJSON): Promise<any>;

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
