import { EventEmitter } from 'events';
import { IAdapter, IDevice } from '../model';
import { Helpers } from './../helpers/helpers';

export class BYTAdapter extends EventEmitter implements IAdapter {
  protocol = 'BYT';
  adapterName = 'BYT';
  compatibleHardware = [''];

  device: IDevice;
  format: any = { start: '(', end: ')', separator: '' };
  __count: number = 1;

  static _new(_device: IDevice): IAdapter {
    return new BYTAdapter(_device);
  }

  constructor(_device: IDevice) {
    super();

    this.device = _device;
  }

  parseData(_data: any): any {
    const data = Helpers.bufferToHexString(_data);
    const parts: any = {
      start: data.substr(0, 4)
    };

    if (parts['start'] == '6868') {
      parts['length'] = parseInt(data.substr(4, 2), 16);
      parts['finish'] = data.substr(parts['length'] * 2 + 6, 4);

      if (parts['finish'] != '0d0a') {
        throw 'finish code incorrect!';
      }
      parts['power'] = parseInt(data.substr(6, 2), 16);
      parts['gsm'] = parseInt(data.substr(8, 2), 16);
      parts['device_id'] = data.substr(10, 16);
      parts['count'] = data.substr(26, 4);
      parts['protocal_id'] = data.substr(30, 2);

      parts['data'] = data.substr(32, parts['length']);

      if (parts['protocal_id'] == '1a') {
        parts.cmd = 'login_request';
        parts.action = 'login_request';
      } else if (parts['protocal_id'] == '10') {
        parts.cmd = 'ping';
        parts.action = 'ping';
      } else {
        parts.cmd = 'noop';
        parts.action = 'noop';
      }
    } else if (parts['start'] == '7979') {
      parts['length'] = parseInt(data.substr(4, 4), 16);
      parts['finish'] = data.substr(8 + parts['length'] * 2, 4);

      parts['protocal_id'] = data.substr(8, 2);

      if (parts['finish'] != '0d0a') {
        throw 'finish code incorrect!';
      }

      if (parts['protocal_id'] == '94') {
        parts['device_id'] = '';
        parts.cmd = 'noop';
        parts.action = 'noop';
      }
    } else if (parts['start'] == '7878') {
      parts['length'] = parseInt(data.substr(4, 2), 16);
      parts['finish'] = data.substr(6 + parts['length'] * 2, 4);

      parts['protocal_id'] = data.substr(6, 2);

      if (parts['finish'] != '0d0a') {
        throw 'finish code incorrect!';
      }

      if (parts['protocal_id'] == '8a') {
        parts['device_id'] = '';
        parts.cmd = 'clock';
        parts.action = 'clock';
      } else {
        parts['device_id'] = '';
        parts.cmd = 'noop';
        parts.action = 'noop';
      }
    }
    return parts;
  }

  parseAlarm(msg_parts: any): any {
    //@TODO: implement this
    //My device have no support of this feature
    return null;
  }

  parseDefault(cmd: any, msg_parts: any): void {
    switch (cmd) {
      case 'BP00': //Handshake
        this.device.send(
          this.formatData(this.device.deviceInfo.deviceId + 'AP01HSO')
        );
        break;
    }
  }

  authorize(msgParts: any): void {
    this.sendCommand('\u0054\u0068\u001a\u000d\u000a');
  }

  synchronousClock(): void {
    // const d = new Date();
    // const str =
    //   d
    //     .getFullYear()
    //     .toString()
    //     .substr(2, 2) +
    //   Helpers.zeroPad(d.getMonth() + 1, 2).toString() +
    //   Helpers.zeroPad(d.getDate(), 2).toString() +
    //   Helpers.zeroPad(d.getHours(), 2).toString() +
    //   Helpers.zeroPad(d.getMinutes(), 2).toString() +
    //   Helpers.zeroPad(d.getSeconds(), 2).toString() +
    //   Helpers.zeroPad(this.__count, 4).toString();
    // this.__count++;
    // const crc = require('/usr/lib/node_modules/crc/lib/index.js');
    // const f: any = '';
    // const crcResult = f.str_pad(crc.crc16(str).toString(16), 4, '0');
    // const buff = new Buffer(str + crcResult, 'hex');
    // this.send_comand('7878', buff);
  }

  logout(): void {}

  requestLoginToDevice(): void {
    //@TODO: Implement this.
  }

  getPingData(msg_parts: any): any {
    const str = msg_parts.data;

    const data = {
      date: str.substr(0, 12),
      latitude: Helpers.dexToDegrees(str.substr(12, 8)),
      longitude: Helpers.dexToDegrees(str.substr(20, 8)),
      speed: parseInt(str.substr(28, 2), 16),
      orientation: str.substr(30, 4)
    };

    const res = {
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      orientation: data.orientation
    };
    return res;
  }

  /* SET REFRESH TIME */
  setRefreshTime(interval: any, duration: any): void {}

  sendCommand(cmd: any, data: any = null): void {
    const msg = [cmd, data];
    this.device.send(this.formatData(msg));
  }

  formatData(params: any): any {
    /* FORMAT THE DATA TO BE SENT */
    let str = this.format.start;
    if (typeof params == 'string') {
      str += params;
    } else if (params instanceof Array) {
      str += params.join(this.format.separator);
    } else {
      throw 'The parameters to send to the device has to be a string or an array';
    }
    str += this.format.end;
    return str;
  }
}
