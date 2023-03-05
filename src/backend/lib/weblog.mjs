import Log from '../db/models/log.mjs';
import logger from './logger.mjs';

export default async function ({ user, ip, useragent, method, url, statusCode, statusMessage, duration, size }) {
  try {
    const log = new Log({ user, ip, useragent, method, url, statusCode, statusMessage, duration, size });
    await log.save();
  } catch (err) {
    logger.log({
      level: 'error',
      label: 'log',
      message: err.message
    });
  }
}
