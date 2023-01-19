const express = require('express');
const router = express.Router();
const nconf = require('nconf');

// authorization by x-api-key header
router.use('*', function (req, res, next) {
  const secretKey = req.headers[nconf.get('api:header')];
  if (secretKey === nconf.get('api:key')) {
    next();
  } else {
    res.status(401);
    next(new Error('Unauthorized'));
  }
});

// endpoint to run the parser
router.use('/:parser', async function (req, res, next) {
  try {
    const parser = require(`../parsers/${req.params.parser}`);
    const data = await parser(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
