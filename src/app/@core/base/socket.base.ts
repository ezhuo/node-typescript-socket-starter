import { EventEmitter } from 'events';
// import { Logger } from '../../helpers';
import { ISocketOptions, IAdapter, IDeviceSocket } from '../../model';
import * as config from '../../model/config';

export class SocketBaseServer extends EventEmitter {
  __opts: ISocketOptions;
  __deviceList: Array<IDeviceSocket> = [];
  __deviceAdapter: IAdapter | undefined;

  set Adapter(adapter: IAdapter | undefined) {
    this.__deviceAdapter = adapter;
  }

  get Adapter(): IAdapter | undefined {
    return this.__deviceAdapter;
  }

  constructor(_opts: ISocketOptions, _callback: Function) {
    super();

    //Merge default options with user options
    this.__opts = _opts;

    if (this.__opts.device_adapter === false) throw '没有发现适配器！';

    if (typeof this.__opts.device_adapter === 'string') {
      if (
        typeof config.__adaptersList__[this.__opts.device_adapter] ===
        'undefined'
      )
        throw '没有找到' + this.__opts.device_adapter + ' 适配器！';

      this.Adapter = config.__adaptersList__[this.__opts.device_adapter];
    } else {
      this.Adapter = this.__opts.device_adapter;
    }
  }

  /* Search a device by ID */
  findDevice(deviceId: any): IDeviceSocket | undefined {
    let dev: any = undefined;
    for (const i in this.__deviceList) {
      dev = this.__deviceList[i].device;
      if (dev.uid === deviceId) {
        return dev;
      }
    }
    return dev;
  }

  /* SEND A MESSAGE TO DEVICE ID X */
  sendTo(deviceId: any, msg: any): void {
    const dev: IDeviceSocket | undefined = this.findDevice(deviceId);
    if (dev) dev.send(msg);
  }
}
