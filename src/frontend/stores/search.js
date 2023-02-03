import { SESSION_KEY } from 'config';

function getSessionToken () {
  return localStorage.getItem(SESSION_KEY) || '';
}

export async function searchProducts (params) {
  const res = await fetch('/api/parser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getSessionToken()}`
    },
    body: JSON.stringify(params || {})
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    throw Error(`${res.statusText} (${res.status})`);
  }
}
