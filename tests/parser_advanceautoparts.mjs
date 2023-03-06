import test from 'node:test';
import assert from 'node:assert/strict';
import pptr from '../src/backend/lib/pptr.mjs';
import parser from '../src/backend/parsers/advanceautoparts.mjs';

test('advanceautoparts', async (_t) => {
  const params = {
    zip: '98264', // '1234' (invalid), '98264' (OK), '33333' (not found)
    partNumbers: ['4322P', '8302A', 'KTI45600', 'ABCDEFGH']
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
