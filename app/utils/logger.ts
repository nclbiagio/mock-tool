import winston from 'winston';
import { environment } from '../../environments/environment';

const colors = {
   error: 'red',
   warn: 'yellow',
   info: 'blue',
   http: 'magenta',
   debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
   winston.format.colorize({ all: true }),
   winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
   new winston.transports.Console(),
   new winston.transports.File({
      filename: `${process.cwd()}${environment.baseFilePath}logs/express/error.log`,
      level: 'error',
   }),
   new winston.transports.File({ filename: `${process.cwd()}${environment.baseFilePath}logs/express/all.log` }),
];

export const Logger = winston.createLogger({
   level: 'debug',
   levels: {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
   },
   format,
   transports,
});
