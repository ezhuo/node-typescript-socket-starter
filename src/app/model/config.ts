import { IGlobalSocketFormat } from './interface';
import { BYTAdapter } from '../adapters';

export const globalSocketFormat: IGlobalSocketFormat = {
  start: '',
  separator: '',
  end: ''
};

export const __adaptersList__: any = {
  BYT: BYTAdapter
};

let _env: any = {};
if (!DEVELOP) {
  _env = require('../../config/environment.prod');
} else {
  _env = require('../../config/environment.dev');
}

export const env = _env;
