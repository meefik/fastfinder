import test from 'node:test';
import assert from 'node:assert/strict';
import pptr from '../src/backend/lib/pptr.js';
import parser from '../src/backend/parsers/autozone.js';

test('autozone', async (_t) => {
  const params = {
    // year: '2009',
    // make: 'Ford',
    // model: 'F350 Super Duty P/U 2WD',
    // engine: '8 Cylinders 5 5.4L FI SOHC 330 CID'
    vin: '1FTSW21P75EA53447',
    zip: '98264',
    partNumber: 'S9549XL' // 'S2XL', 'H13XV'
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
