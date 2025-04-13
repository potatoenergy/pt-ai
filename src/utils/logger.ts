import winston, { format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf } = format;

const logFormat = printf((info) => {
  return `${info.timestamp} [${info.level}]: ${info.message}`;
});

export const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      maxSize: '5m',
      maxFiles: '7d',
      zippedArchive: true
    }),
    new transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      maxSize: '10m',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
});