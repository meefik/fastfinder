const mongoose = require('mongoose');
const nconf = require('nconf');
const logger = require('lib/logger');

const conn = mongoose.connection;

mongoose.set('strictQuery', true);

function connect () {
  return mongoose
    .connect(nconf.get('mongo:uri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .catch(function () {
      setTimeout(connect, 5000);
    });
}

function disconnect () {
  return mongoose.connection.close();
}

conn.once('open', function () {
  logger.log({ level: 'info', label: 'db', message: 'Database is connected' });
  if (logger.level === 'debug') {
    mongoose.set('debug', function (collectionName, method, query, doc) {
      // LOG format: rooms.find({}) { sort: {}, fields: undefined }
      logger.log({
        level: 'debug',
        label: 'db',
        message: `${collectionName}.${method}(${
          query ? JSON.stringify(query) : ''
        }) ${JSON.stringify(doc)}`
      });
    });
  }
  // mongoose.gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db);
  const errorLog = function (err) {
    if (!err) return;
    logger.log({ level: 'error', label: 'db', message: err.message });
  };
  // Add default user
  const User = require('db/models/user');
  User.on('index', async function (err) {
    if (err) return errorLog(err);
    try {
      let user = await User.findOne({ role: 'admin' });
      if (!user) {
        // Add default admin user
        user = new User({
          role: 'admin',
          username: 'admin',
          password: 'changeme'
        });
        await user.save();
      }
    } catch (err) {
      // ignore
    }
  });
});

conn.on('close', function () {
  logger.log({ level: 'info', label: 'db', message: 'Database has been closed' });
});

conn.on('error', function (err) {
  logger.log({ level: 'error', label: 'db', message: err });
});

module.exports = {
  get connection () {
    return mongoose.connection;
  },
  connect,
  disconnect
};
