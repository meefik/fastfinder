import Cache from '../db/models/cache.mjs';

export async function readCache (key, expires = 60) {
  const createdAt = new Date(Date.now() - expires * 1000);
  const { data } = await Cache.findOne({ key, createdAt: { $gte: createdAt } }) || {};
  return data;
}

export async function writeCache (key, data) {
  await Cache.updateOne({ key }, { $set: { key, data } }, { upsert: true });
}
