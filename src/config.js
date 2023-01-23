const os = require('os');

module.exports = {
  host: '0.0.0.0',
  port: 8080,
  threads: os.cpus().length, // cores
  timeout: 10, // seconds
  api: {
    header: 'x-api-key',
    key: 'secret'
  },
  ssl: {
    // key: '-----BEGIN RSA PRIVATE KEY-----\n...',
    // cert: '-----BEGIN CERTIFICATE-----\n...',
    // ca: '-----BEGIN CERTIFICATE-----\n...'
  },
  static: {
    // dir: '/path/to/dir',
    expires: 60 // minutes
  }
};
