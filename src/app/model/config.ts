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
