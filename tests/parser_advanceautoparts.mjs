import test from 'node:test';
import assert from 'node:assert/strict';
import pptr from '../src/backend/lib/pptr.js';
import parser from '../src/backend/parsers/advanceautoparts.js';

test('advanceautoparts', async (_t) => {
  const params = {
    zip: '98264', // '1234' (invalid), '98264' (OK), '33333' (not found)
    partNumbers: ['yufkuyfkuf', '8302A', 'KTI45600', '4322P'] //, 'yufkuyfkuf', 'yufkuyfkuf'] // '8302A' (OK), 'yufkuyfkuf' (not found), 45700
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
