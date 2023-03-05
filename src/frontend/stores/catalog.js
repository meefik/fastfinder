import { sendRequest } from '../lib/utils';

export async function getYears (data) {
  return await sendRequest('/api/catalog/years', 'POST', data);
}

export async function getMakes (data) {
  return await sendRequest('/api/catalog/makes', 'POST', data);
}

export async function getModels (data) {
  return await sendRequest('/api/catalog/models', 'POST', data);
}

export async function getEngines (data) {
  return await sendRequest('/api/catalog/engines', 'POST', data);
}

export async function getCategories (data) {
  return await sendRequest('/api/catalog/categories', 'POST', data);
}

export async function getGroups (data) {
  return await sendRequest('/api/catalog/groups', 'POST', data);
}

export async function getPartNumbers (data) {
  return await sendRequest('/api/catalog/partnumbers', 'POST', data);
}
