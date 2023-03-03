import express from 'express';
import pptr from '../lib/pptr.mjs';
import parserAutozone from '../parsers/autozone.mjs';
import parserOreillyauto from '../parsers/oreillyauto.mjs';
import parserAdvanceautoparts from '../parsers/advanceautoparts.mjs';

const router = express.Router();

router.post('/autozone', async function (req, res, next) {
  try {
    const params = {
      zip: req.body.zip,
      partNumbers: req.body.partNumbers
    };
    const data = await pptr(parserAutozone, params);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/oreillyauto', async function (req, res, next) {
  try {
    const params = {
      zip: req.body.zip,
      partNumbers: req.body.partNumbers
    };
    const data = await pptr(parserOreillyauto, params);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/advanceautoparts', async function (req, res, next) {
  try {
    const params = {
      zip: req.body.zip,
      partNumbers: req.body.partNumbers
    };
    const data = await pptr(parserAdvanceautoparts, params);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
