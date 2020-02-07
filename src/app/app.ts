import { Logger } from './helpers/logger';
import { SocketTcpServer, SocketUdpServer } from './@core';
import { IDevice } from './model';
import * as net from 'net';
// import * as dgram from 'dgram';

let env: any = {};
if (!DEVELOP) {
  env = require('../config/environment.prod');
} else {
  env = require('../config/environment.dev');
}

export class App {
  socketTcp: SocketTcpServer | undefined;
  socketUdp: SocketUdpServer | undefined;

  static run(): App {
    return new App();
  }

  constructor() {
    if (env.__SocketOpts__.protocol === 'TCP') {
      env.__SocketOpts__.udpPort = null;
      this.createTcpServer();
    } else if (env.__SocketOpts__.protocol === 'UDP') {
      env.__SocketOpts__.tcpPort = null;
      // this.createUdpServer();
    } else if (env.__SocketOpts__.protocol === 'TWO') {
      this.createTcpServer();
      // this.createUdpServer();
    }

    this.logAppInfo();
  }

  private createTcpServer(): void {
    this.socketTcp = SocketTcpServer._new(
      env.__SocketOpts__,
      (device: IDevice, client: net.Socket) => {
        device.on('loginRequest', (device_id: any, msg_parts: any) => {
          // Some devices sends a login request before transmitting their position
          // Do some stuff before authenticate the device...

          // Accept the login request. You can set false to reject the device.
          device.loginAuthorized(true, null);
        });

        //PING -> When the gps sends their position
        device.on('ping', (data: any) => {
          //After the ping is received, but before the data is saved
          //console.log(data);
          return data;
        });
      }
    );
  }

  // private createUdpServer(): void {
  //   this.socketUdp = SocketUdpServer._new(
  //     env.__SocketOpts__,
  //     (device: IDevice, client: dgram.Socket) => {
  //       device.on('loginRequest', (device_id: any, msg_parts: any) => {
  //         // Some devices sends a login request before transmitting their position
  //         // Do some stuff before authenticate the device...

  //         // Accept the login request. You can set false to reject the device.
  //         device.loginAuthorized(true, null);
  //       });

  //       //PING -> When the gps sends their position
  //       device.on('ping', (data: any) => {
  //         //After the ping is received, but before the data is saved
  //         //console.log(data);
  //         return data;
  //       });
  //     }
  //   );
  // }

  private logAppInfo(): void {
    Logger.logTask('app', {
      develop: DEVELOP,
      version: VERSION,
      ...env
    });
  }
}
