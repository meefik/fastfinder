import express from 'express';
import Log from '../db/models/log.mjs';

const router = express.Router();

router.get('/', async function (req, res, next) {
  try {
    const { limit = 100, skip = 0 } = req.query;
    const total = await Log.countDocuments({});
    const data = await Log.find({}).limit(limit).skip(skip).populate('user').exec();
    res.json({ total, limit, skip, data });
  } catch (err) {
    next(err);
  }
});

export default router;
