const express = require('express');
const router = express.Router();
const nconf = require('nconf');

router.use('*', function (req, res, next) {
  const secretKey = req.headers[nconf.get('api:header')];
  if (secretKey === nconf.get('api:key')) {
    next();
  } else {
    res.status(401);
    next(new Error('Unauthorized'));
  }
});

router.use('/autozone', require('./autozone'));

module.exports = router;
