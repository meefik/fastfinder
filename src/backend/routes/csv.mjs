import express from 'express';
import Log from '../db/models/log.mjs';

const router = express.Router();

router.get('/logs', async function (req, res, next) {
  try {
    const csv = await readAsCsv(Log, req.query.select, req.query.delimiter);
    const now = new Date()
      .toJSON()
      .substring(0, 19)
      .replace(/:/g, '-')
      .replace('T', '_');
    res.header(
      'Content-Disposition',
      `attachment; filename="logs_${now}.csv"`
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

async function readAsCsv (model, select, delimiter = ',') {
  const headers = (select || 'id').split(',');
  const arr = [headers.join(delimiter)];
  const cursor = model.find({}).populate('user').cursor();
  let doc = true;
  while (doc) {
    doc = await cursor.next();
    if (!doc) break;
    const row = [];
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      let val = getValueFromObject(doc, key);
      if (val === null || typeof val === 'undefined') val = '';
      val = String(val)
        .replace(/\r/g, '')
        .replace(/\n/g, '\\n')
        .replace(/"/g, '""');
      if (val.indexOf(delimiter) !== -1) val = `"${val}"`;
      row.push(val);
    }
    arr.push(row.join(delimiter));
  }
  return arr.join('\n');
}

function getValueFromObject (obj, key) {
  const path = typeof key === 'string' ? key.split('.') : key;
  let val = path.reduce(function (o, k, i) {
    if (Array.isArray(o)) {
      const subPath = path.splice(i);
      return o
        .map(function (v) {
          if (typeof v !== 'object') return v;
          return getValueFromObject(v, subPath.slice());
        })
        .join(', ');
    }
    return (o || {})[k];
  }, obj);
  if (val && typeof val.toJSON === 'function') {
    val = val.toJSON();
  }
  return val;
}

export default router;
