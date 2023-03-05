import { sendRequest } from '../lib/utils';

export async function getUsersList () {
  return await sendRequest('/api/users', 'GET');
}

export async function createUser (data) {
  return await sendRequest('/api/users', 'POST', data);
}

export async function updateUser (id, data) {
  return await sendRequest(`/api/users/${id}`, 'PUT', data);
}

export async function deleteUser (id) {
  return await sendRequest(`/api/users/${id}`, 'DELETE');
}
