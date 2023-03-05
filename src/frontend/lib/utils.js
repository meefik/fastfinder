import { SESSION_KEY } from 'config';

function getSessionToken () {
  return localStorage.getItem(SESSION_KEY) || '';
}

/**
 * Download a file.
 *
 * @param {string} [url]
 * @param {Object} [data]
 * @param {string} [filename]
 * @returns {Promise}
 */
export function downloadFile ({ url, data, filename }) {
  return new Promise(resolve => {
    const a = document.createElement('a');
    let objectUrl;
    if (url) {
      const seporator = url.indexOf('?') === -1 ? '?' : '&';
      a.href = `${url}${seporator}token=${getSessionToken()}`;
    }
    if (data) {
      if (typeof data === 'object') {
        data = JSON.stringify(data, null, '  ');
      }
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
    }
    if (filename) {
      a.download = filename;
    }
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.onclick = resolve;
    document.body.removeChild(a);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  });
}

/**
 * Send ajax request.
 *
 * @param {string} url
 * @param {string} [method="GET"]
 * @param {Object} [data]
 * @returns
 */
export async function sendRequest (url, method = 'GET', data) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getSessionToken()}`
    },
    body: data && JSON.stringify(data)
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    throw Error(`${res.statusText} (${res.status})`);
  }
}
