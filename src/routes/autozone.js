const express = require('express');
const router = express.Router();

router.post('/', async function (req, res, next) {
  try {
    const parser = require('../parsers/autozone');
    const data = await parser(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
