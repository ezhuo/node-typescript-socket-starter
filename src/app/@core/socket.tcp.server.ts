import { Logger } from '../helpers';
import { DeviceTcp } from './device.tcp';
import { ISocketOptions, IDevice, IDeviceSocket } from '../model';
import * as net from 'net';
import { SocketBaseServer } from './base/socket.base';
const extend = require('node.extend');
import * as config from '../model/config';

export class SocketTcpServer extends SocketBaseServer {
  __server: net.Server;

  static _new(_opts: ISocketOptions, _callback: Function): SocketTcpServer {
    return new SocketTcpServer(_opts, _callback);
  }

  constructor(_opts: ISocketOptions, _callback: Function) {
    super(_opts, _callback);

    this.__server = net.createServer((client: net.Socket) => {
      try {
        const device: IDevice = new DeviceTcp(this.Adapter, client, this);
        const socket: IDeviceSocket = extend(client, { device });
        this.__deviceList.push(socket);

        client.on('data', (data: any) => {
          Logger.logTask('socket.data', data);
          device.emit('data', data);
        });

        client.on('end', () => {
          // console.log('end');
          this.socketDisconnected(socket);
          // device.emit('disconnected');
        });

        client.on('error', () => {
          this.socketDisconnected(socket);
          device.emit('disconnected');
        });

        client.on('close', () => {
          // console.log('close');
          // this.socketDisconnected(socket);
        });

        //设置超时时间
        client.setTimeout(config.env.__SocketOpts__.timeOut, () => {
          console.log(
            '客户端在' +
              config.env.__SocketOpts__.timeOut +
              's内未通信，将断开连接...'
          );
        });

        //监听到超时事件，断开连接
        client.on('timeout', () => {
          client.end();
        });

        if (typeof _callback === 'function') _callback(device, client);

        device.emit('connected');
      } catch (err) {
        Logger.errorTask('bind.error', ...err);
      }
    });

    this.__server.listen(this.__opts.tcpPort);

    this.__server.on('listening', () => {
      console.log(`TCP服务器监听：${this.__opts.tcpPort}`);
    });

    this.__server.on('close', () => {
      this.serverDisconnected();
    });

    this.__server.on('error', () => {
      this.serverDisconnected();
    });
  }

  createServer(_callback: Function): void {}

  socketDisconnected(socket: IDeviceSocket | undefined): void {
    if (!socket) return;
    socket.emit('disconnected');
    this.__deviceList.splice(this.__deviceList.indexOf(socket), 1);
    if (socket.socket) {
      socket.socket.destroyed();

      delete socket.device;
      delete socket.socket;
      socket = undefined;
    }
  }

  serverDisconnected(): void {
    Logger.logTask('TCPServer断开', '系统30s后自动重连...');
    setTimeout(() => {
      for (const idx of this.__deviceList) {
        delete idx.device;
        delete idx.socket;
      }
      this.__deviceList = [];
      this.__server.listen(this.__opts.tcpPort);
    }, 30 * 1000);
  }
}
