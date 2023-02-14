import test from 'node:test';
import assert from 'node:assert/strict';
import pptr from '../src/backend/lib/pptr.js';
import parser from '../src/backend/parsers/napaonline.js';

test('napaonline', async (_t) => {
  const params = {
    zip: '98264', // 1234 (invalid), 98264 (OK), 33333 (not found)
    partNumbers: ['MGA49883', 'AL5661X', '304']
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
