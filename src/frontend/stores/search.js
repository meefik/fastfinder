import { SESSION_KEY } from 'config';

function getSessionToken () {
  return localStorage.getItem(SESSION_KEY) || '';
}

async function sendRequest (url, params) {
  const res = await fetch(url, {
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

export async function searchProducts (seller, params) {
  return await sendRequest(`/api/search/${seller}`, params);
}
