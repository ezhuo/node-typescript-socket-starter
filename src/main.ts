import { App } from './app/app';
import { Logger } from './app/helpers/logger';

Logger.logTask('system', 'STARTING');

App.run();

Logger.logTask('system', 'FINISHED');
