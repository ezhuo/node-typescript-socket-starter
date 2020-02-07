import { Logger } from '../helpers/logger';
import { IDevice } from '../model';
import { SocketUdpServer } from './socket.udp.server';
import * as dgram from 'dgram';
import { DeviceBase } from './base/device.base';

export class DeviceUdp extends DeviceBase implements IDevice {
  __socket: dgram.Socket;
  __server: SocketUdpServer;

  constructor(_adapter: any, _socket: dgram.Socket, _server: SocketUdpServer) {
    super(_adapter);
    this.__socket = _socket;
    this.__server = _server;
    this.__ip = _socket.remoteAddress().address;
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

    /************************************
     EXECUTE ACTION
     ************************************/
    this.makeAction(msgParts.action, msgParts);
  }

  makeAction(action: any, msgParts: any): void {
    //If we're not loged
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

  send(msg: any): void {
    this.emit('sendData', msg);
    this.__socket.send(msg);
    Logger.log('Sending to ' + this.deviceInfo.deviceId + ': ' + msg);
  }
}
