import test from 'node:test';
import assert from 'node:assert/strict';
import autozoneParser from '../src/parsers/autozone.js';

test('autozone', async (_t) => {
  const params = {
    vehicle: {
      // year: '2009',
      // make: 'Ford',
      // model: 'F350 Super Duty P/U 2WD',
      // engine: '8 Cylinders 5 5.4L FI SOHC 330 CID'
      vin: '1FTSW21P75EA53447'
    },
    location: {
      zip: '98264'
    },
    search: {
      // with subcategories
      // partNumber: 'H13XV'
      // single product
      // partNumber: 'S2XL'
      partNumber: 'S9549XL'
    }
  };
  try {
    const data = await autozoneParser(params);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
