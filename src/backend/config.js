const os = require('node:os');

module.exports = {
  host: '0.0.0.0',
  port: 3000,
  threads: os.cpus().length, // cores
  timeout: 10, // seconds
  mongo: {
    uri: 'mongodb://admin:secret@localhost:27017/fastfinder?authSource=admin'
  },
  ssl: {
    // key: '-----BEGIN RSA PRIVATE KEY-----\n...',
    // cert: '-----BEGIN CERTIFICATE-----\n...',
    // ca: '-----BEGIN CERTIFICATE-----\n...'
  },
  static: {
    // dir: '/path/to/dir',
    expires: 60 // minutes
  },
  session: {
    key: 'secret',
    expires: 6 * 60 // minutes
  },
  http: {
    // port: 80,
    // webroot: '/etc/acme/webroot'
  }
};
