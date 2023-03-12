import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/backend/config.mjs';
import db from '../src/backend/db/index.mjs';
import User from '../src/backend/db/models/user.mjs';

async function httpRequest (url, method = 'POST', data, headers) {
  const res = await fetch(`http://localhost:${config.get('port')}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: data ? JSON.stringify(data) : null
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

test('backend-api-state', async (_t) => {
  try {
    const { token } = User.getToken({
      id: new mongoose.Types.ObjectId(),
      username: 'test',
      nickname: 'test',
      role: 'user'
    });
    const res = await httpRequest('/api/state', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    assert.ok(!!(res.token && res.user));
  } catch (err) {
    assert.fail(err);
  }
});
