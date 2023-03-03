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

export async function getYears (params) {
  return await sendRequest('/api/catalog/years', params);
}

export async function getMakes (params) {
  return await sendRequest('/api/catalog/makes', params);
}

export async function getModels (params) {
  return await sendRequest('/api/catalog/models', params);
}

export async function getEngines (params) {
  return await sendRequest('/api/catalog/engines', params);
}

export async function getCategories (params) {
  return await sendRequest('/api/catalog/categories', params);
}

export async function getGroups (params) {
  return await sendRequest('/api/catalog/groups', params);
}

export async function getPartNumbers (params) {
  return await sendRequest('/api/catalog/partnumbers', params);
}
