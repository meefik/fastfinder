const fs = require('node:fs');
const puppeteer = require('puppeteer-core');
const PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome';
const BASE_URL = 'https://www.rockauto.com/en/catalog/';

async function run () {
  // Connect to browser
  const browser = await puppeteer.launch({ executablePath: PUPPETEER_EXECUTABLE_PATH, headless: false, devtools: false, defaultViewport: null });
  const [page] = await browser.pages();

  async function listCatalog (catalog, url, selector, limit = Infinity) {
    console.log(url, selector, limit);
    let node;
    try {
      node = await page.waitForSelector(`${selector} > div`);
    } catch (err) {
      console.log(err);
      return;
    }
    const isLeaf = await page.evaluate((el) => el.classList.contains('listings-container'), node);
    if (isLeaf) {
      const getValue = async (el, selector, fn) => {
        const handler = await el.$(selector);
        return await handler?.evaluate(fn, handler) || '';
      };
      const elements = await node.$$('tbody.listing-inner');
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const data = {
          url,
          category: await node.$$eval('.tacenter a', (items) => items.map(item => item.textContent)),
          manufacturer: await getValue(el, 'span.listing-final-manufacturer', (el) => el.textContent),
          partnumber: await getValue(el, 'span.listing-final-partnumber', (el) => el.textContent),
          title: await getValue(el, 'span.span-link-underline-remover', (el) => el.textContent),
          link: await getValue(el, 'a.ra-btn-moreinfo', (el) => el.href),
          image: await getValue(el, 'img[id^="inlineimg_thumb"]', (el) => el.src),
          text: await getValue(el, 'div.listing-text-row', (el) => el.textContent?.trim())
        };
        catalog.push(data);
        await page.evaluate((el) => el.remove(), node);
      }
    } else {
      const elements = await page.$$(`${selector} > div.ranavnode:not(.ra-hide)`);
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const id = await el.$eval('.nchildren', (el) => el.id);
        const href = await el.$eval('.navlabellink', (el) => el.href);
        if (!href) continue;
        const level = href.split(',').length;
        if (level >= limit) {
          catalog.push({
            url: href,
            category: href.replace(BASE_URL, '').split(',')
          });
        } else {
          await el.$eval('a.navlabellink', (el) => el.click());
          await listCatalog(catalog, href, `div[id="${id}"]`, limit);
          await page.evaluate((el) => el.remove(), el);
        }
      }
    }
  }

  async function getTopSelector (url) {
    const pathname = new URL(url).pathname;
    const linkElement = await page.waitForSelector(`div.ranavnode:not(.ra-hide) a.navlabellink[href="${pathname}"]`);
    const parentId = await page.evaluate((el) => {
      let found = false;
      while (!found && el.parentElement) {
        el = el.parentElement;
        found = el.classList.contains('ranavnode');
      }
      const child = el.querySelector('.nchildren');
      return child.id;
    }, linkElement);
    return `div[id="${parentId}"]`;
  }

  async function getVihiclesDB () {
    const catalog = [];

    await page.goto(BASE_URL);
    await page.waitForNetworkIdle();
    await page.$eval('#cbxYear2003', (el) => el.click());
    await page.waitForNetworkIdle();
    await page.$eval('#cbxMX', (el) => el.click());
    await page.waitForNetworkIdle();
    // await page.$eval('#cbxCA', (el) => el.click());
    // await page.waitForNetworkIdle();
    // await page.$eval('#cbxUS', (el) => el.click());
    // await page.waitForNetworkIdle();
    const url = await page.url();
    const selector = 'div[id="treeroot[catalog]"]';
    await listCatalog(catalog, url, selector, 4);
    fs.writeFileSync('vihicles.json', JSON.stringify(catalog));
  }

  async function getPartsDB () {
    const vihicles = JSON.parse(fs.readFileSync('vihicles.json', { encoding: 'utf8' }));
    for (let i = 685; i < vihicles.length; i++) {
      const { url } = vihicles[i];
      await page.goto(url);
      await page.waitForNetworkIdle();
      const selector = await getTopSelector(url);
      const catalog = [];
      await listCatalog(catalog, url, selector);
      fs.writeFileSync(`parts_${('0000000' + i).slice(-8)}.json`, JSON.stringify(catalog));
    }
  }

  try {
    // get vihicles
    await getVihiclesDB();

    // get patrs
    await getPartsDB();
  } catch (err) {
    console.log(err);
  }

  // close all
  await page?.close();
  await browser?.close();
}

run();
