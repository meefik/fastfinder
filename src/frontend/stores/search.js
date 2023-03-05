import { sendRequest } from '../lib/utils';

export async function searchProducts (seller, data) {
  return await sendRequest(`/api/search/${seller}`, 'POST', data);
}
