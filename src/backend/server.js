const nconf = require('nconf');
nconf.use('memory');
nconf.env({
  separator: '_',
  lowerCase: true,
  parseValues: true
});
nconf.defaults(require('config'));
const cluster = require('node:cluster');
const logger = require('lib/logger');
// Error handling
process.on('uncaughtException', function (err) {
  logger.log({
    level: 'error',
    label: 'server',
    message: err.message
  });
});
if (cluster.isMaster) {
  // Shutdown process
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
  // Process termination
  process.once('SIGTERM', shutdown);
  // Ctrl+C
  process.once('SIGINT', shutdown);
  // Graceful shutdown for nodemon
  process.once('SIGUSR2', shutdown);
} else if (cluster.isWorker) {
  const express = require('express');
  const fs = require('node:fs');
  const path = require('node:path');
  const morgan = require('morgan');
  const compression = require('compression');
  const cors = require('cors');
  const db = require('db');
  const app = express();
  // Shutdown worker
  const shutdown = async function () {
    if (shutdown.executed) return;
    shutdown.executed = true;
    const timeout = parseInt(nconf.get('timeout'));
    if (timeout > 0) {
      setTimeout(() => process.exit(1), timeout * 1000);
    }
    try {
      await db?.disconnect();
      await Promise.all([
        new Promise(resolve => server ? server.close(resolve) : resolve()),
        new Promise(resolve => httpServer ? httpServer.close(resolve) : resolve())
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
  // Create web server
  const parseConf = function (val) {
    if (!val) return;
    try {
      if (/^-----/.test(val)) {
        return String(val).replace(/\\n/g, '\n');
      } else {
        const data = fs.readFileSync(val, { encoding: 'utf8' });
        fs.watchFile(val, shutdown);
        return data;
      }
    } catch (err) {
      logger.log({
        level: 'error',
        label: 'server',
        message: err.message || err
      });
    }
  };
  const protocol = nconf.get('ssl:key') && nconf.get('ssl:cert')
    ? 'https'
    : 'http';
  const server = (protocol === 'https')
    ? require('node:https').Server(
      {
        key: parseConf(nconf.get('ssl:key')),
        cert: parseConf(nconf.get('ssl:cert')),
        ca: parseConf(nconf.get('ssl:ca'))
      },
      app
    )
    : require('node:http').Server(app);
  // Setup app server
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
  // Routing
  app.use('/ping', function (req, res) {
    res.end('OK');
  });
  app.use('/api', require('./routes'));
  // Static
  [nconf.get('static:dir'), path.join(__dirname, 'public')].forEach(function (dir) {
    if (!dir) return;
    app.use(
      express.static(
        dir,
        nconf.get('static:expires')
          ? { maxAge: nconf.get('static:expires') * 60 * 1000 }
          : {}
      )
    );
  });
  // Default router
  app.use(function (req, res, next) {
    res.status(404);
    next();
  });
  // Error handler
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
  // Run server
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
  // HTTP web server
  let httpServer;
  if (protocol === 'https' && nconf.get('http:port')) {
    const http = require('node:http');
    httpServer = http.createServer(async function (req, res) {
      // ACME HTTP validation (from directory)
      // https://letsencrypt.org/docs/challenge-types/#http-01-challenge
      if (nconf.get('http:webroot') && /^\/\.well-known\/acme-challenge\//.test(req.url)) {
        return fs.readFile(path.join(nconf.get('http:webroot'), req.url), (err, data) => {
          if (err) {
            res.writeHead(404, {
              'Content-Type': 'text/plain'
            }).end('Not Found');
          } else {
            res.writeHead(200, {
              'Content-Length': Buffer.byteLength(data),
              'Content-Type': 'text/plain'
            }).end(data);
          }
        });
      }
      // Redirect from http to https
      const port = nconf.get('port');
      res.writeHead(301, {
        Location: `https://${req.headers.host}${port === '443' ? '' : ':' + port}${req.url}`
      }).end();
    });
    httpServer.listen(nconf.get('http:port'), nconf.get('host'), function () {
      const address = this.address();
      logger.log({
        level: 'info',
        label: 'server',
        message: `HTTP listening on ${address.address}:${address.port}`
      });
    });
  }
  // Process termination
  process.once('SIGTERM', shutdown);
  // Ctrl+C
  process.once('SIGINT', shutdown);
  // Graceful shutdown for nodemon
  process.once('SIGUSR2', shutdown);
  // Connect to DB
  db.connect();
}
