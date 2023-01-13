const express = require('express');
const router = express.Router();

router.get('/', async function (req, res, next) {
  const debugParser = require('../parsers/debug');
  const data = await debugParser();
  res.json(data);
});

module.exports = router;
