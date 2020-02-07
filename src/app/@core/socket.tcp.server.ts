import { Logger } from '../helpers';
import { DeviceTcp } from './device.tcp';
import { ISocketOptions, IDevice, IDeviceSocket } from '../model';
import * as net from 'net';
import { SocketBaseServer } from './base/socket.base';
const extend = require('node.extend');

export class SocketTcpServer extends SocketBaseServer {
  __server: net.Server | undefined;

  static _new(_opts: ISocketOptions, _callback: Function): SocketTcpServer {
    return new SocketTcpServer(_opts, _callback);
  }

  constructor(_opts: ISocketOptions, _callback: Function) {
    super(_opts, _callback);

    this.createServer(_callback);
  }

  createServer(_callback: Function): void {
    try {
      this.__server = net
        .createServer((client: net.Socket) => {
          try {
            const device: IDevice = new DeviceTcp(this.Adapter, client, this);

            const socket: IDeviceSocket = extend(client, { device });
            this.__deviceList.push(socket);

            socket.on('data', (data: any) => {
              Logger.logTask('socket.data', data);
              device.emit('data', data);
            });

            // Remove the device from the list when it leaves
            socket.on('end', () => {
              this.__deviceList.splice(this.__deviceList.indexOf(socket), 1);
              device.emit('disconnected');
            });

            if (typeof _callback === 'function') _callback(device, client);

            device.emit('connected');
          } catch (err) {
            Logger.errorTask('bind.error', ...err);
          }
        })
        .listen(this.__opts.tcpPort);
    } catch (err) {
      Logger.errorTask('app.createServer.error', ...err);
    }
  }
}
