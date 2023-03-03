import crypto from 'node:crypto';
import jsdom from 'jsdom';
import getUserAgent from './useragent.mjs';

const { JSDOM } = jsdom;
const BACKEND_URL = 'https://mfr.activant.com/alliance/servlet';

export async function loginUser () {
  const sessionId = crypto.randomBytes(4).toString('hex');
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent()
    },
    body: new URLSearchParams({
      sessionId: `io.undertow.servlet.spec.HttpSessionImpl@${sessionId}`,
      command: 'loginUser',
      USER: 'allpubuser',
      PASSWORD: 'auT0ta1k'
    })
  });
  const jSessionId = res.headers.get('set-cookie').match(/JSESSIONID=([^;]+)/)[1];
  const text = await res.text();
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('select[name="yearSelectCombo"]>option');
  const list = [...nodes].map(el => el.value);
  return { sid: jSessionId, list };
}

export async function selectYear (sid, year) {
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'vehicleProfile',
      action: 'selectYear',
      yearSelectCombo: year
    })
  });
  const text = await res.text();
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('select[name="makeSelectCombo"]>option');
  const list = [...nodes].map(el => el.value);
  return { list };
}

export async function selectMake (sid, year, make) {
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'vehicleProfile',
      action: 'selectMake',
      yearSelectCombo: year,
      makeSelectCombo: make
    })
  });
  const text = await res.text();
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('select[name="modelSelectCombo"]>option');
  const list = [...nodes].map(el => el.value);
  return { list };
}

export async function selectModel (sid, year, make, model) {
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'vehicleProfile',
      action: 'selectModel',
      yearSelectCombo: year,
      makeSelectCombo: make,
      modelSelectCombo: model
    })
  });
  const text = await res.text();
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('select[name="engineSelectCombo"]>option');
  const list = [...nodes].map(el => el.value);
  return { list };
}

export async function selectEngine (sid, year, make, model, engine) {
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'vehicleProfile',
      action: 'selectEngine',
      yearSelectCombo: year,
      makeSelectCombo: make,
      modelSelectCombo: model,
      engineSelectCombo: engine
    })
  });
  const text = await res.text();
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('select[name="categorySelectCombo"]>option');
  const list = [...nodes].map(el => el.value);
  return { list };
}

export async function doVinLookup (sid, vin) {
  await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'vin',
      action: 'doVinLookup',
      vinNumber: vin
    })
  });
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'groupLookup'
    })
  });
  const text = await res.text();
  console.log(text);
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('select[name="categorySelectCombo"]>option');
  const list = [...nodes].map(el => el.value);
  return { list };
}

export async function selectCategory (sid, category) {
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'groupLookup',
      action: 'selectCategory',
      categorySelectCombo: category
    })
  });
  const text = await res.text();
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('select[name="groupSelectCombo"]>option');
  const list = [...nodes].map(el => el.value);
  return { list };
}

export async function selectGroup (sid, category, group) {
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'groupLookup',
      action: 'selectGroup',
      categorySelectCombo: category,
      groupSelectCombo: group
    })
  });
  const text = await res.text();
  const { window } = new JSDOM(text);
  if (window.document.querySelector('input[name="radio0"]')) {
    return await specificConditions(sid);
  } else {
    const nodes = window.document.querySelectorAll('td[align="center"]+td[align="left"] span.partNumber');
    const list = [...nodes].map(el => `${el.textContent}`.trim());
    return { list };
  }
}

async function specificConditions (sid) {
  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
      Cookie: `JSESSIONID=${sid}`
    },
    body: new URLSearchParams({
      command: 'specificConditions',
      radio0: 'Don\'t know'
    })
  });
  const text = await res.text();
  const { window } = new JSDOM(text);
  const nodes = window.document.querySelectorAll('td[align="center"]+td[align="left"] span.partNumber');
  const list = [...nodes].map(el => el.textContent);
  return { list };
}
