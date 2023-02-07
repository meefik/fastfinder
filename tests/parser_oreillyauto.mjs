import test from 'node:test';
import assert from 'node:assert/strict';
import parser from '../src/backend/parsers/oreillyauto.js';

test('oreillyauto', async (_t) => {
  const params = {
    // year: '2009',
    // make: 'Ford',
    // model: 'F350 Super Duty P/U 2WD',
    // engine: '8 Cylinders 5 5.4L FI SOHC 330 CID'
    vin: '1FTSW21P75EA53447', // 1FTSW21P75EA53447 fdfgdfgdfgdfhddfsdgdfhdfhdfhdfhdhdh 1PTSR21P75EA53447
    zip: '98264',
    partNumber: 'MGA49883'
  };
  try {
    const data = await parser(params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
