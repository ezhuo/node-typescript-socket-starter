import { Logger } from '../helpers';
import { DeviceUdp } from './device.udp';
import { ISocketOptions, IDevice, IDeviceSocket } from '../model';
import * as dgram from 'dgram';
import { SocketBaseServer } from './base/socket.base';
const extend = require('node.extend');

export class SocketUdpServer extends SocketBaseServer {
  __server: dgram.Socket | undefined;

  static _new(_opts: ISocketOptions, _callback: Function): SocketUdpServer {
    return new SocketUdpServer(_opts, _callback);
  }

  constructor(_opts: ISocketOptions, _callback: Function) {
    super(_opts, _callback);

    this.createServer(_callback);
  }

  createServer(_callback: Function): void {
    try {
      this.__server = dgram.createSocket('udp4');
      this.__server.bind(this.__opts.udpPort, '127.0.0.1');
      console.log('---------', 222);
      const device: IDevice = new DeviceUdp(this.Adapter, this.__server, this);
    
      const socket: IDeviceSocket = extend(this.__server, { device });
      this.__deviceList.push(socket);

      socket.on('message', (data: any, rinfo: any) => {
        Logger.logTask('socket.data', data, rinfo);
        device.emit('data', data);
      });

      // Remove the device from the list when it leaves
      socket.on('end', () => {
        this.__deviceList.splice(this.__deviceList.indexOf(socket), 1);
        device.emit('disconnected');
      });

      socket.on('listening', () => {
        if (this.__server) {
          const address = this.__server.address();
          console.log(`服务器监听 ${address.address}:${address.port}`);
        }
      });

      if (typeof _callback === 'function') _callback(device, this.__server);

      device.emit('connected');
    } catch (err) {
      Logger.errorTask('bind.error', err);
    }
  }
}
