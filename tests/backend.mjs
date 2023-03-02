import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/backend/config.mjs';
import db from '../src/backend/db/index.mjs';
import User from '../src/backend/db/models/user.mjs';

async function httpRequest (url, method = 'POST', data = {}) {
  const res = await fetch(`http://localhost:${config.get('port')}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    const json = await res.json();
    return json;
  } else {
    throw Error(res.statusText);
  }
}

test('backend-api-login', async (_t) => {
  const username = 'test';
  const password = 'changeme';
  try {
    await db.connect();
    const user = new User({
      role: 'admin',
      username,
      password
    });
    await user.save();
    const res = await httpRequest('/api/login', 'POST', { username, password });
    assert.ok(!!res.token);
  } catch (err) {
    assert.fail(err);
  } finally {
    await User.deleteOne({ username: 'test' });
    await db.disconnect();
  }
});
