import { Logger } from '../helpers';
import { DeviceUdp } from './device.udp';
import { ISocketOptions, IDevice, IDeviceSocket } from '../model';
import * as dgram from 'dgram';
import { SocketBaseServer } from './base/socket.base';
const extend = require('node.extend');

export class SocketUdpServer extends SocketBaseServer {
  __server: dgram.Socket;

  static _new(_opts: ISocketOptions, _callback: Function): SocketUdpServer {
    return new SocketUdpServer(_opts, _callback);
  }

  constructor(_opts: ISocketOptions, _callback: Function) {
    super(_opts, _callback);
    this.__server = dgram.createSocket('udp4');
    this.createServer(_callback);
  }

  createServer(_callback: Function): void {
    try {
      let device: IDevice;
      let socket: IDeviceSocket;

      this.__server.bind(this.__opts.udpPort);

      this.__server.on('connect', () => {
        if (device) device.emit('connected');
      });

      this.__server.on('message', (data: any, rinfo: dgram.RemoteInfo) => {
        device = new DeviceUdp(this.Adapter, this.__server, this);

        device.addressInfo.ip = rinfo.address;
        device.addressInfo.port = rinfo.port;

        socket = extend(this.__server, { device });
        this.__deviceList.push(socket);

        Logger.logTask('socket.data', data, rinfo);
        device.emit('data', data);
      });

      // Remove the device from the list when it leaves
      this.__server.on('close', () => {
        if (socket) this.socketDisconnected(socket);
        device.emit('disconnected');
      });

      this.__server.on('listening', () => {
        if (this.__server) {
          console.log(
            `UDP服务器监听：${this.__server.address().address}:${
              this.__server.address().port
            }`
          );
        }
      });

      this.__server.on('error', () => {
        this.serverDisconnected();
      });
    } catch (err) {
      Logger.errorTask('bind.error', err);
    }
  }

  socketDisconnected(socket: IDeviceSocket | undefined): void {
    if (!socket) return;
    this.__deviceList.splice(this.__deviceList.indexOf(socket), 1);
    if (socket) {
      delete socket.device;
    }
  }

  serverDisconnected(): void {
    Logger.logTask('UDPServer断开', '系统30s后自动重连...');
    setTimeout(() => {
      for (const idx of this.__deviceList) {
        delete idx.device;
      }
      this.__deviceList = [];
      this.__server.bind(this.__opts.udpPort);
    }, 30 * 1000);
  }
}
