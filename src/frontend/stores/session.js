import { writable } from 'svelte/store';
import { SESSION_KEY, SESSION_TIMEOUT } from 'config';

function getSessionToken () {
  return localStorage.getItem(SESSION_KEY) || '';
}

export async function logIn ({ username, password }) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      session.set(data);
    } else {
      throw Error(`${res.statusText} (${res.status})`);
    }
  } catch (err) {
    console.error(err);
    session.set(null);
  }
}

async function syncSessionData () {
  try {
    const res = await fetch('/api/state', {
      headers: {
        Authorization: `Bearer ${getSessionToken()}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      session.set(data);
    } else {
      throw Error(`${res.statusText} (${res.status})`);
    }
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
