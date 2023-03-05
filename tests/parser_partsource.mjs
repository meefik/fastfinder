import test from 'node:test';
import assert from 'node:assert/strict';
import pptr from '../src/backend/lib/pptr.mjs';
import parser from '../src/backend/parsers/partsource.mjs';

test('partsource', async (_t) => {
  const params = {
    zip: 'M4B 1G5', // '1234' (invalid), 'M4B 1G5' (OK), '12345' (not found)
    partNumbers: ['Simoniz', 'yufkuyfkuf', 'FV412'] // 'FV412' (OK), 'yufkuyfkuf' (not found), 'rc-' (OK), 'Simoniz' (OK, sale + regular)
  };
  try {
    const data = await pptr(parser, params);
    console.log('OUTPUT: ', data);
    assert.ok(data.length > 0, 'Not found');
  } catch (err) {
    assert.fail(err);
  }
});
