export interface IGlobalConfig {
  sharedConfigSetting: string;
}

export const globalConfig: IGlobalConfig = {
  sharedConfigSetting: 'this is a shared setting'
};

export interface IGlobalSocketFormat {
  start: any;
  separator: any;
  end: any;
}
