import test from 'node:test';
import assert from 'node:assert/strict';
import pptr from '../src/backend/lib/pptr.mjs';
import parser from '../src/backend/parsers/oreillyauto.mjs';

test('oreillyauto', async (_t) => {
  const params = {
    zip: '98264', // 1234 (invalid), 98264 (OK), 33333 (not found)
    partNumbers: ['MGA49883', 'AL5661X', '304'] // MGA49883 (OK), yufkuyfkuf (not found), AL9432X (OK)
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
