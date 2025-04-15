import winston, { format } from 'winston';
import 'winston-daily-rotate-file';
import { CONFIG } from '../config';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message }) => {
  return `[${level}] ${message}`;
});

export const logger = winston.createLogger({
  level: CONFIG.DEBUG_MODE ? 'debug' : 'info',
  format: combine(logFormat),
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});