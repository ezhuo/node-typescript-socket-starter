import { Logger } from './../../helpers/logger';
import { EventEmitter } from 'events';
import { IAdapter, IDeviceInfo, IAddressInfo } from '../../model';

export class DeviceBase extends EventEmitter {
  __adapter: IAdapter;

  __addressInfo: IAddressInfo;

  __deviceInfo: IDeviceInfo = {
    deviceId: 0,
    deviceNo: '',
    simNo: '',
    simSn: ''
  };

  // tslint:disable-next-line: typedef
  get deviceInfo() {
    return this.__deviceInfo;
  }

  set deviceInfo(value: IDeviceInfo) {
    this.__deviceInfo = value;
  }

  // tslint:disable-next-line: typedef
  get addressInfo() {
    return this.__addressInfo;
  }

  set addressInfo(value: IAddressInfo) {
    this.__addressInfo = value;
  }

  constructor(_adapter: any) {
    super();
    this.__adapter = _adapter['_new'](this);
    this.__addressInfo = { ip: 'localhost', port: 0 };
    this.on('connected', this.connected);
    this.on('disconnected', this.disconnected);
  }

  onData(data: any): void {}

  onlistening(): void {}

  makeAction(action: any, msgParts: any): void {}

  loginRequest(msgParts: any): void {
    Logger.log("I'm requesting to be loged.");
    this.emit('loginRequest', this.deviceInfo.deviceId, msgParts);
  }

  loginAuthorized(val: any, msgParts: any = true): void {
    if (val) {
      Logger.log(
        'Device ' + this.deviceInfo.deviceId + ' has been authorized. Welcome!'
      );

      this.__adapter.authorize(msgParts);
    } else {
      Logger.log(
        'Device ' +
          this.deviceInfo.deviceId +
          ' not authorized. Login request rejected'
      );
    }
  }

  logout(): void {
    this.__adapter.logout();
  }

  onAlarm(msgParts: any): void {
    const alarmData = this.__adapter.parseData(msgParts);
    this.emit('alarm', alarmData.code, alarmData, msgParts);
  }

  ping(msgParts: any): void {
    const gpsData = this.__adapter.getPingData(msgParts);
    if (gpsData === false) {
      //Something bad happened
      Logger.log("GPS Data can't be parsed. Discarding packet...");
      return;
    }

    /* Needs:
     latitude, longitude, time
     Optionals:
     orientation, speed, mileage, etc */

    Logger.log(
      'Position received ( ' + gpsData.latitude + ',' + gpsData.longitude + ' )'
    );
    gpsData.from_cmd = msgParts.cmd;
    this.emit('ping', gpsData, msgParts);
  }

  setRefreshTime(interval: any, duration: any): void {
    this.__adapter.setRefreshTime(interval, duration);
  }

  send(msg: any): void {}

  connected(): void {
    Logger.logTask(
      'device.connected',
      `${this.addressInfo.ip || ''} 设备上线！`
    );
  }

  disconnected(): void {
    Logger.logTask(
      'device.disconnected',
      `${this.addressInfo.ip || ''} 设备下线！`
    );
  }
}
