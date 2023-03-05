import { sendRequest, downloadFile } from '../lib/utils';

export async function getLogsList (limit, skip) {
  return await sendRequest(`/api/logs?limit=${limit}&skip=${skip}`, 'GET');
}

export async function downloadLogsAsCSV (select) {
  await downloadFile({ url: `/api/csv/logs?select=${select.join(',')}` });
}
