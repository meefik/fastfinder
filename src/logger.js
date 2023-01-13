const cluster = require('cluster');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf } = format;

// Webpack устанавливает переменную `process.env.NODE_ENV` при сборке
const IS_PROD = process.env.NODE_ENV === 'production';
const PRINT_FN = function ({ label, level, message, timestamp }) {
  if (!label) label = 'worker';
  return `${timestamp} ${level} [${label}-${
    cluster.isWorker ? cluster.worker.id : 0
  }]: ${message}`;
};

const logger = createLogger({
  level: IS_PROD ? 'info' : 'debug',
  format: IS_PROD
    ? combine(timestamp(), printf(PRINT_FN))
    : combine(timestamp(), colorize(), printf(PRINT_FN)),
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
      handleExceptions: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
