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
    vin: '1FTSW21P75EA53447', // '2HKRM4H73CH623544' (OK), 'fdfgdfgdfgdfhddfsdgdfhdfhdfhdf' (invalid), '1PTSR21P75EA53447' (not found)
    zip: '98264', // '1234' (invalid), '98264' (OK), '33333' (not found)
    partNumber: 'S9549XL' // 'S2XL', 'H13XV', 'S9549XL' (OK), 'yufkuyfkuf' (not found), 'AL9432X' (OK)
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
