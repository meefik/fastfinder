const os = require('os');
const nconf = require('nconf');
nconf.use('memory');
nconf.env({
  separator: '_',
  lowerCase: true,
  parseValues: true
});
nconf.defaults({
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
});
const cluster = require('cluster');
if (cluster.isMaster) {
  const logger = require('./logger');
  const shutdown = async function () {
    if (shutdown.executed) return;
    shutdown.executed = true;
    const timeout = parseInt(nconf.get('timeout'));
    if (timeout > 0) {
      setTimeout(() => process.exit(1), timeout * 1000);
    }
    function killAllWorkers () {
      let allWorkersAreDead = true;
      for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (!worker.isDead()) {
          allWorkersAreDead = false;
          worker.process.kill('SIGTERM');
        }
      }
      if (!allWorkersAreDead) {
        setTimeout(killAllWorkers, 1000);
      } else {
        process.exit(0);
      }
    }
    killAllWorkers();
  };
  // Create workers
  for (let i = 0; i < nconf.get('threads'); i++) {
    cluster.fork();
  }
  // Restart workers
  cluster.on('exit', function (worker, code, signal) {
    if (shutdown.executed) return;
    cluster.fork();
  });
  // Message exchange between workers
  cluster.on('message', function (worker, data) {
    for (const id in cluster.workers) {
      cluster.workers[id].send(data);
    }
  });
  // Error handling
  process.on('uncaughtException', function (err) {
    logger.log({
      level: 'error',
      label: 'server',
      message: err.message
    });
  });
  // Process termination
  process.once('SIGTERM', shutdown);
  // Ctrl+C
  process.once('SIGINT', shutdown);
  // Graceful shutdown for nodemon
  process.once('SIGUSR2', shutdown);
} else if (cluster.isWorker) {
  const express = require('express');
  const fs = require('fs');
  const morgan = require('morgan');
  const compression = require('compression');
  const cors = require('cors');
  const logger = require('./logger');
  const app = express();
  const createServer = (app) => {
    const protocol = nconf.get('ssl:key') && nconf.get('ssl:cert')
      ? 'https'
      : 'http';
    const parseConf = (val) => {
      if (!val) return;
      try {
        if (/^-----/.test(val)) {
          return String(val).replace(/\\n/g, '\n');
        } else {
          return fs.readFileSync(val, { encoding: 'utf8' });
        }
      } catch (err) {
        logger.log({
          level: 'error',
          label: 'server',
          message: err.message || err
        });
      }
    };
    try {
      return protocol === 'https'
        ? require('https').Server(
          {
            key: parseConf(nconf.get('ssl:key')),
            cert: parseConf(nconf.get('ssl:cert')),
            ca: parseConf(nconf.get('ssl:ca'))
          },
          app
        )
        : require('http').Server(app);
    } catch (err) {
      logger.log({
        level: 'error',
        label: 'server',
        message: err.message || err
      });
    }
  };
  // create server
  const server = createServer(app);
  if (server) {
    // app server
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.use(
      morgan(function (tokens, req, res) {
        const ip = req.ip;
        const method = tokens.method(req, res);
        const url = tokens.url(req, res);
        const statusCode = tokens.status(req, res);
        const statusMessage = res.statusMessage;
        const size = tokens.res(req, res, 'content-length') || 0;
        const time = ~~tokens['response-time'](req, res);
        const message = `${ip} - ${method} ${url} ${statusCode} (${statusMessage}) ${size} bytes - ${time} ms`;
        const label = req.protocol;
        let level;
        if (res.statusCode >= 100) {
          level = 'info';
        } else if (res.statusCode >= 400) {
          level = 'warn';
        } else if (res.statusCode >= 500) {
          level = 'error';
        } else {
          level = 'verbose';
        }
        logger.log({ level, label, message });
      })
    );
    app.use(compression());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors({ origin: true }));
    // routing
    app.use('/api', require('./routes'));
    // static
    if (nconf.get('static:dir')) {
      app.use(express.static(nconf.get('static:dir'),
        nconf.get('static:expires')
          ? { maxAge: nconf.get('static:expires') * 60 * 1000 }
          : {}));
    }
    // default router
    app.use(function (req, res, next) {
      res.status(404);
      next();
    });
    // error handler
    app.use(function (err, req, res, next) {
      // fallback to default node handler
      if (res.headersSent) {
        return next(err);
      }
      // if status not changed
      if (res.statusCode === 200) {
        res.status(500);
      }
      // convert text to error object
      if (typeof err !== 'object') {
        err = new Error(err);
      }
      res.json({ name: err.name, message: err.message, code: err.code });
    });
    // run server
    server.once('close', function () {
      logger.log({
        level: 'info',
        label: 'server',
        message: 'Listener has been stopped'
      });
    });
    server.on('error', function (err) {
      logger.log({
        level: 'error',
        label: 'server',
        message: err.message || err
      });
    });
    server.listen(nconf.get('port'), nconf.get('host'), function () {
      const address = this.address();
      logger.log({
        level: 'info',
        label: 'server',
        message: `Listening on ${address.address}:${address.port}`
      });
    });
    const shutdown = async function () {
      if (shutdown.executed) return;
      shutdown.executed = true;
      const timeout = parseInt(nconf.get('timeout'));
      if (timeout > 0) {
        setTimeout(() => process.exit(1), timeout * 1000);
      }
      try {
        await Promise.all([
          new Promise(resolve => server.close(resolve))
        ]);
        process.exit(0);
      } catch (err) {
        logger.log({
          level: 'error',
          label: 'server',
          message: err.message
        });
        process.exit(1);
      }
    };
    // Error handling
    process.on('uncaughtException', function (err) {
      logger.log({
        level: 'error',
        label: 'server',
        message: err.message
      });
    });
    // Process termination
    process.once('SIGTERM', shutdown);
    // Ctrl+C
    process.once('SIGINT', shutdown);
    // Graceful shutdown for nodemon
    process.once('SIGUSR2', shutdown);
  }
}
