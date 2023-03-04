import test from 'node:test';
import assert from 'node:assert/strict';
import pptr from '../src/backend/lib/pptr.mjs';
import parser from '../src/backend/parsers/autozone.mjs';

test('autozone', async (_t) => {
  const params = {
    zip: '98264', // '1234' (invalid), '98264' (OK), '33333' (not found)
    partNumbers: ['DLG1906-16-4', 'S9549XL', 'AL9432X', 'S2XL', 'H13XV', '48-775']
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
