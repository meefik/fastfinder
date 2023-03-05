import { writable } from 'svelte/store';
import { SESSION_KEY, SESSION_TIMEOUT } from 'config';
import { sendRequest } from '../lib/utils';

export async function logIn ({ username, password }) {
  try {
    const data = await sendRequest('/api/login', 'POST', { username, password });
    session.set(data);
  } catch (err) {
    console.error(err);
    session.set(null);
  }
}

async function syncSessionData () {
  try {
    const data = await sendRequest('/api/state', 'GET');
    session.set(data);
  } catch (err) {
    console.error(err);
    session.set(null);
  }
}

const session = writable(undefined, async () => {
  const unsubscribe = session.subscribe(data => {
    if (data === null) {
      localStorage.removeItem(SESSION_KEY);
    } else if (data?.token) {
      localStorage.setItem(SESSION_KEY, data?.token);
    }
  });
  await syncSessionData();
  const interval = setInterval(async () => {
    await syncSessionData();
  }, SESSION_TIMEOUT * 60 * 1000);
  return () => {
    clearInterval(interval);
    unsubscribe();
  };
});

export default session;
