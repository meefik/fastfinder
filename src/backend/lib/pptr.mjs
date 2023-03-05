import http from 'node:http';
import puppeteer from 'puppeteer-core';
import getUserAgent from './useragent.mjs';

const { NODE_ENV, PUPPETEER_EXECUTABLE_PATH, PUPPETEER_BROWSER_URL, PUPPETEER_TIMEOUT } = process.env;
const DEBUG_MODE = NODE_ENV === 'development';

/**
 * Replace hostname to IP address.
 *
 * @param {string} url Browser URL, e.g. http://localhost:9222.
 * @returns {string}
 */
function resolveIpAddress (url) {
  return new Promise((resolve, reject) => {
    const { protocol, hostname, port } = new URL(url);
    if (protocol !== 'http:') {
      return reject(new Error('Protocol not supported'));
    }
    http.get({
      hostname,
      port,
      path: '/',
      agent: false
    }, (res) => {
      const ip = res.socket?.remoteAddress;
      resolve(`${protocol}//${ip}:${port}`);
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * @typedef {Object} Item
 * @property {string} parser Name of parser.
 * @property {string} image Item image link.
 * @property {string} title Item title.
 * @property {string} partNumber Item part number.
 * @property {number} price Price per item.
 * @property {string} location Store address.
 * @property {boolean} availability Availability in the store.
 * @property {string} link Link to the item in the store.
 */

/**
 * Run a parser.
 *
 * @param {function} parser Parser start function.
 * @param {Object} params Input parameters.
 * @param {string} params.zip Store ZIP code
 * @param {string[]} params.partNumbers List of part numbers
 * @returns {Item[]} List of found parts
 */
export default async function (parser, params) {
  let browser, context, page;
  let products = [];

  try {
    // check params are valid
    if (!/^([ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d)|^(\d{5})$/i.test(params.zip)) {
      throw new Error('Invalid US or Canada ZIP');
    }

    // Connect to browser
    browser = PUPPETEER_BROWSER_URL
      ? await puppeteer.connect({
        browserURL: await resolveIpAddress(PUPPETEER_BROWSER_URL)
      })
      : await puppeteer.launch({ executablePath: PUPPETEER_EXECUTABLE_PATH, headless: !DEBUG_MODE });

    // Create a new incognito browser context
    context = await browser.createIncognitoBrowserContext();

    // Prepare new page
    page = await context.newPage();
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    });
    await page.setUserAgent(getUserAgent());
    await page.setDefaultTimeout(PUPPETEER_TIMEOUT || 30000);

    // Disable images and CSS to speed up web scraping
    if (!DEBUG_MODE) {
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.resourceType() === 'image') {
          req.respond({
            body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==', 'base64')
          });
        } else if (req.resourceType() === 'stylesheet') {
          req.respond({
            body: ''
          });
        } else if (req.resourceType() === 'font') {
          req.respond({
            body: ''
          });
        } else {
          req.continue();
        }
      });
    }

    // Run the parser
    products = await parser(page, params, context);
  } finally {
    await page?.close();
    await context?.close();
    if (PUPPETEER_BROWSER_URL) {
      await browser?.disconnect();
    } else {
      await browser?.close();
    }
  }

  // Return filtered products by part number
  let productsFiltered = [];
  for (const partNumber of params.partNumbers) {
    const partNumberRe = new RegExp(`^${partNumber}`, 'i');
    productsFiltered = productsFiltered.concat(products.filter(item => partNumberRe.test(item.partNumber)));
  }

  return productsFiltered;
};
