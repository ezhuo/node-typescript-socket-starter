import { Logger } from './../../helpers/logger';
import { EventEmitter } from 'events';
import { IAdapter, IDeviceInfo } from '../../model';

export class DeviceBase extends EventEmitter {
  __adapter: IAdapter;
  __ip: string | undefined = '';

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

  constructor(_adapter: any) {
    super();
    this.__adapter = _adapter['_new'](this);
    this.on('data', this.onData);
    this.on('connected', this.connected);
    this.on('disconnected', this.disconnected);
  }

  onData(data: any): void {
    const msgParts = this.__adapter.parseData(data);
    Logger.log('-----------------', msgParts, '-----------------');

    if (msgParts === false) {
      //something bad happened
      Logger.log('The message (' + data + ") can't be parsed. Discarding...");
      return;
    }

    if (typeof msgParts.cmd === 'undefined') {
      // throw 'The adapter doesn\'t return the command (cmd) parameter';
    }

    //If the UID of the devices it hasn't been setted, do it now.
    if (this.deviceInfo.deviceId === 0) {
      this.deviceInfo.deviceId = msgParts.device_id;
    }

    this.makeAction(msgParts.action, msgParts);
  }

  makeAction(action: any, msgParts: any): void {
    if (action !== 'loginRequest') {
      this.__adapter.requestLoginToDevice();
      Logger.log(
        this.deviceInfo.deviceId +
          " is trying to '" +
          action +
          "' but it isn't loged. Action wasn't executed"
      );
      return;
    }

    switch (action) {
      case 'loginRequest':
        this.loginRequest(msgParts);
        break;
      case 'ping':
        this.ping(msgParts);
        break;
      case 'alarm':
        this.onAlarm(msgParts);
        break;
      case 'other':
        this.__adapter.parseDefault(msgParts.cmd, msgParts);
        break;
    }
  }

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
    Logger.logTask('device.connected', `${this.__ip} 设备上线！`);
  }

  disconnected(): void {
    Logger.logTask('device.disconnected', `${this.__ip} 设备下线！`);
  }
}
