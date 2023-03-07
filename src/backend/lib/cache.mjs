import Cache from '../db/models/cache.mjs';

export async function readCache (key, expires = 60) {
  const updatedAt = new Date(Date.now() - expires * 1000);
  const { data } = await Cache.findOne({ key, updatedAt: { $gte: updatedAt } }) || {};
  return data;
}

export async function writeCache (key, data) {
  await Cache.updateOne({ key }, { $set: { updatedAt: new Date(), key, data } }, { upsert: true });
}
