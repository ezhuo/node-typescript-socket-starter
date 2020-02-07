import { globalSocketFormat } from '../model';

// import * as crcItu from 'crc-itu';

export class Helpers {
  static rad(x: any): number {
    return (x * Math.PI) / 180;
  }

  static get_distance(p1: any, p2: any): number {
    const R = 6378137; // Earth’s mean radius in meter
    const dLat = this.rad(p2.lat - p1.lat);
    const dLong = this.rad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.lat)) *
        Math.cos(this.rad(p2.lat)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // returns the distance in meter
  }
  static send(socket: any, msg: any): void {
    socket.write(msg);
    console.log('Sending to ' + socket.name + ': ' + msg);
  }
  static parse_data(data: any): any {
    data = data.replace(/(\r\n|\n|\r)/gm, ''); //Remove 3 type of break lines
    const cmd_start = data.indexOf('B'); //al the incomming messages has a cmd starting with 'B'
    if (cmd_start > 13) throw 'Device ID is longer than 12 chars!';
    const parts = {
      start: data.substr(0, 1),
      device_id: data.substring(1, cmd_start),
      cmd: data.substr(cmd_start, 4),
      data: data.substring(cmd_start + 4, data.length - 1),
      finish: data.substr(data.length - 1, 1)
    };
    return parts;
  }
  static parse_gps_data(str: string): Object {
    const data = {
      date: str.substr(0, 6),
      availability: str.substr(6, 1),
      latitude: this.minute_to_decimal(parseFloat(str.substr(7, 9)), 'N'),
      latitude_i: str.substr(16, 1),
      longitude: this.minute_to_decimal(parseFloat(str.substr(17, 9)), 'E'),
      longitude_i: str.substr(27, 1),
      speed: str.substr(28, 5),
      time: str.substr(33, 6),
      orientation: str.substr(39, 6),
      io_state: str.substr(45, 8),
      mile_post: str.substr(53, 1),
      mile_data: parseInt(str.substr(54, 8), 16)
    };
    return data;
  }
  static send_to(socket: any, cmd: any, data: any): void {
    if (typeof socket.device_id == 'undefined')
      throw 'The socket is not paired with a device_id yet';
    let str = globalSocketFormat.start;
    str += socket.device_id + globalSocketFormat.separator + cmd;
    if (typeof data != 'undefined') str += globalSocketFormat.separator + data;
    str += globalSocketFormat.end;
    this.send(socket, str);
    //Example: (<DEVICE_ID>|<CMD>|<DATA>) - separator: | ,start: (, end: )
  }
  static minute_to_decimal(pos: number, pos_i: string): any {
    if (typeof pos_i === 'undefined') pos_i = 'N';
    const dg = parseInt((pos / 100).toString());
    const minutes = pos - dg * 100;
    const res = minutes / 60 + dg;
    return pos_i.toUpperCase() === 'N' || pos_i.toUpperCase() === 'E'
      ? res * -1
      : res;
  }
  static broadcast(message: any, sender: any): void {
    // clients.forEach(function(client) {
    //   if (client === sender) return;
    //   client.write(message);
    // });
    // process.stdout.write(message + '\n');
  }
  static data_to_hex_array(data: Array<any>): Array<any> {
    const arr = [];
    for (let i = 0; i < data.length; i++) arr.push(data[i].toString(16));
    return arr;
  }
  static hex_to_int(hex_char: any): number {
    return parseInt(hex_char, 16);
  }
  static sum_hex_array(hex_array: any): number {
    let sum: any = 0;
    for (const i in hex_array) {
      sum += this.hex_to_int(hex_array[i]);
    }
    return sum;
  }
  static hex_array_to_hex_str(hex_array: Array<any>): string {
    let str = '';
    let char = null;
    for (const i in hex_array) {
      char = null;
      if (typeof hex_array[i] === 'number') char = hex_array[i].toString(16);
      else char = hex_array[i].toString();
      str += this.str_pad(char, 2, '0');
    }
    return str;
  }
  static str_pad(input: string, length: number, string: string): string {
    string = string || '0';
    input = input + '';
    return input.length >= length
      ? input
      : new Array(length - input.length + 1).join(string) + input;
  }
  static crc_itu_get_verification(hex_data: any): any {
    return null;
    // const crc16 = crcItu.crc16;
    // let str = null;
    // if (typeof hex_data === 'string') str = hex_data;
    // else str = this.hex_array_to_hex_str(hex_data);
    // return crc16(str, 'hex');
  }

  static bufferToHexString(buffer: any): string {
    let str = '';
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] < 16) {
        str += '0';
      }
      str += buffer[i].toString(16);
    }
    return str;
  }

  static zeroPad(nNum: any, nPad: any): any {
    return ('' + (Math.pow(10, nPad) + nNum)).slice(1);
  }

  static dexToDegrees(dex: any): any {
    return parseInt(dex, 16) / 1800000;
  }
}
