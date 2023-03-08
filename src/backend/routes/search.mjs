import express from 'express';
import pptr from '../lib/pptr.mjs';
import parserAutozone from '../parsers/autozone.mjs';
import parserOreillyauto from '../parsers/oreillyauto.mjs';
import parserAdvanceautoparts from '../parsers/advanceautoparts.mjs';
import parserPartsource from '../parsers/partsource.mjs';
import {
  readCache,
  writeCache
} from '../lib/cache.mjs';

const CAHCE_EXPIRES = 24 * 60 * 60; // 1 day
const router = express.Router();

router.post('/autozone', async function (req, res, next) {
  try {
    const params = {
      zip: req.body.zip,
      partNumbers: req.body.partNumbers
    };
    const CACHE_KEY = `autozone:${params.zip}:${params.partNumbers}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await pptr(parserAutozone, params);
      await writeCache(CACHE_KEY, data);
    }
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
    const CACHE_KEY = `oreillyauto:${params.zip}:${params.partNumbers}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await pptr(parserOreillyauto, params);
      await writeCache(CACHE_KEY, data);
    }
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
    const CACHE_KEY = `advanceautoparts:${params.zip}:${params.partNumbers}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await pptr(parserAdvanceautoparts, params);
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/partsource', async function (req, res, next) {
  try {
    const params = {
      zip: req.body.zip,
      partNumbers: req.body.partNumbers
    };
    const CACHE_KEY = `partsource:${params.zip}:${params.partNumbers}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await pptr(parserPartsource, params);
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
