import express from 'express';
import Log from '../db/models/log.mjs';

const router = express.Router();

router.get('/', async function (req, res, next) {
  try {
    const users = await Log.find({}).populate('user').exec();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
