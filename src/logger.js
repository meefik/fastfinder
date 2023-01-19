const cluster = require('cluster');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf } = format;

const DEBUG_MODE = process.env.NODE_ENV === 'development';
const PRINT_FN = function ({ label, level, message, timestamp }) {
  if (!label) label = 'worker';
  return `${timestamp} ${level} [${label}-${
    cluster.isWorker ? cluster.worker.id : 0
  }]: ${message}`;
};

const logger = createLogger({
  level: DEBUG_MODE ? 'debug' : 'info',
  format: DEBUG_MODE
    ? combine(timestamp(), colorize(), printf(PRINT_FN))
    : combine(timestamp(), printf(PRINT_FN)),
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
      handleExceptions: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
