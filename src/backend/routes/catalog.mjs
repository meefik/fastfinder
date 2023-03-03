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

const router = express.Router();

router.post('/years', async function (req, res, next) {
  try {
    const data = await loginUser();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/makes', async function (req, res, next) {
  try {
    const { sid, year } = req.body;
    const data = await selectYear(sid, year);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/models', async function (req, res, next) {
  try {
    const { sid, year, make } = req.body;
    const data = await selectMake(sid, year, make);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/engines', async function (req, res, next) {
  try {
    const { sid, year, make, model } = req.body;
    const data = await selectModel(sid, year, make, model);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/categories', async function (req, res, next) {
  try {
    const { sid, year, make, model, engine, vin } = req.body;
    const data = vin
      ? await doVinLookup(sid, vin)
      : await selectEngine(sid, year, make, model, engine);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/groups', async function (req, res, next) {
  try {
    const { sid, category } = req.body;
    const data = await selectCategory(sid, category);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/partnumbers', async function (req, res, next) {
  try {
    const { sid, category, group } = req.body;
    const data = await selectGroup(sid, category, group);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
