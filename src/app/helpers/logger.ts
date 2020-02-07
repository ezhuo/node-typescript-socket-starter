export class Logger {
  static log(...message: any[]): void {
    // tslint:disable-next-line: no-console
    console.log(`[${Logger.getFormattedTime()}]`, ...message);
  }

  static error(...message: any[]): void {
    // tslint:disable-next-line: no-console
    console.error(`[${Logger.getFormattedTime()}]`, ...message);
  }

  static logTask(name: string, ...message: any[]): void {
    Logger.log(`${name}:`, ...message);
  }

  static errorTask(name: string, ...message: any[]): void {
    Logger.error(`${name}:`, ...message);
  }

  private static getFormattedTime(includeDate: boolean = true): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const date = new Date();
    const timeString = date.toLocaleTimeString('zh-CN', options);

    const year = date.getFullYear();
    const month = this.prependZeroIfNecessairy(date.getMonth() + 1); // months start from zero
    const day = this.prependZeroIfNecessairy(date.getDate());
    const dateString = `${year}/${month}/${day}`;

    return includeDate ? `${dateString} ${timeString}` : timeString;
  }

  private static prependZeroIfNecessairy(number: number): string {
    return (number < 10 ? '0' : '') + number;
  }
}
