import express from 'express';
import {
  loginUser,
  selectYear,
  selectMake,
  selectModel,
  selectEngine,
  doVinLookup,
  selectCategory,
  selectGroup
} from '../lib/epicor.mjs';
import {
  readCache,
  writeCache
} from '../lib/cache.mjs';

const CAHCE_EXPIRES = 60 * 60; // 1 hour
const router = express.Router();

router.post('/years', async function (req, res, next) {
  try {
    const CACHE_KEY = 'epicor-years';
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await loginUser();
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/makes', async function (req, res, next) {
  try {
    const { sid, year } = req.body;
    const CACHE_KEY = `epicor-makes:${year}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await selectYear(sid, year);
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/models', async function (req, res, next) {
  try {
    const { sid, year, make } = req.body;
    const CACHE_KEY = `epicor-models:${year}:${make}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await selectMake(sid, year, make);
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/engines', async function (req, res, next) {
  try {
    const { sid, year, make, model } = req.body;
    const CACHE_KEY = `epicor-engines:${year}:${make}:${model}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await selectModel(sid, year, make, model);
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/categories', async function (req, res, next) {
  try {
    const { sid, year, make, model, engine, vin } = req.body;
    if (vin) {
      const CACHE_KEY = `epicor-categories:${vin}`;
      let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
      if (!data) {
        data = await doVinLookup(sid, vin);
        await writeCache(CACHE_KEY, data);
      }
      res.json(data);
    } else {
      const CACHE_KEY = `epicor-categories:${year}:${make}:${model}:${engine}`;
      let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
      if (!data) {
        data = await selectEngine(sid, year, make, model, engine);
        await writeCache(CACHE_KEY, data);
      }
      res.json(data);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/groups', async function (req, res, next) {
  try {
    const { sid, category } = req.body;
    const CACHE_KEY = `epicor-groups:${category}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await selectCategory(sid, category);
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/partnumbers', async function (req, res, next) {
  try {
    const { sid, category, group } = req.body;
    const CACHE_KEY = `epicor-groups:${category}:${group}`;
    let data = await readCache(CACHE_KEY, CAHCE_EXPIRES);
    if (!data) {
      data = await selectGroup(sid, category, group);
      await writeCache(CACHE_KEY, data);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
