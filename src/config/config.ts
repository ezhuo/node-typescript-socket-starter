import { IConfig } from './config.interface';
import { globalConfig, IGlobalSocketFormat } from './config.global';

export const config: IConfig = {
  ...globalConfig,

  apiUrl: 'http://a-production-url'
};

export const globalSocketFormat: IGlobalSocketFormat = {
  start: '',
  separator: '',
  end: ''
};
