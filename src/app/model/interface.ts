import { EventEmitter } from 'events';

export interface IGlobalSocketFormat {
  start: any;
  separator: any;
  end: any;
}

export interface ISocketOptions {
  protocol: 'TCP' | 'UDP' | 'TWO';
  timeOut: number;
  tcpPort: number;
  udpPort: number;
  device_adapter: any;
}

export interface IAddressInfo {
  ip: string;
  port: number;
}

export interface IDeviceInfo {
  deviceId: number;
  deviceNo: string;
  simNo: string;
  simSn?: string;
}

export interface IDevice extends EventEmitter {
  socket: any;
  deviceInfo: IDeviceInfo;
  addressInfo: IAddressInfo;
  onData(data: any): void;
  onAlarm(msgParts: any): void;
  onlistening(): void;
  makeAction(action: any, msgParts: any): void;
  loginRequest(msgParts: any): void;
  loginAuthorized(val: any, msgParts: any): void;
  logout(): void;
  ping(msgParts: any): void;
  setRefreshTime(interval: any, duration: any): void;
  send(msg: any): void;
}

export interface IDeviceSocket extends IDevice {
  device: IDevice;
}

export interface IAdapter extends EventEmitter {
  protocol: string;
  adapterName: string;
  compatibleHardware: Array<any>;
  device: IDevice;
  parseData(data: any): any;
  parseAlarm(msg_parts: any): any;
  parseDefault(cmd: any, msg_parts: any): void;
  authorize(msgParts: any): void;
  synchronousClock(): void;
  logout(): void;
  requestLoginToDevice(): void;
  getPingData(msg_parts: any): any;
  setRefreshTime(interval: any, duration: any): void;
  sendCommand(cmd: any, data: any): void;
  formatData(params: any): any;
}
