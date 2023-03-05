import { sendRequest, downloadFile } from '../lib/utils';

export async function getLogsList () {
  return await sendRequest('/api/logs', 'GET');
}

export async function downloadLogsAsCSV (select) {
  await downloadFile({ url: `/api/csv/logs?select=${select.join(',')}` });
}
