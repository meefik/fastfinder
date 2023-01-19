import test from 'node:test';
import assert from 'node:assert/strict';
import autozoneParser from '../src/parsers/autozone.js';

test('autozone', async (_t) => {
  const params = {
    vehicle: {
      year: '2015',
      make: 'Ford',
      model: 'Transit-150',
      engine: '5 Cylinders V 3.2L Turbo Dsl DOHC 195 CID',
      vin: ''
    },
    location: {
      zip: '98264'
    },
    categories: [
      'Batteries, Starting and Charging',
      'Batteries',
      'Battery'
    ]
  };
  try {
    const data = await autozoneParser(params);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
