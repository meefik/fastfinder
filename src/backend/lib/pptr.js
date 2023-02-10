const http = require('node:http');
const puppeteer = require('puppeteer-core');
const { NODE_ENV, PUPPETEER_EXECUTABLE_PATH, PUPPETEER_BROWSER_URL } = process.env;
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
 * @property {boolean} fits Item fits chosen vehicle.
 * @property {string} link Link to the item in the store.
 */

/**
 * Run a parser.
 *
 * @param {function} parser Parser start function.
 * @param {Object} params Input parameters.
 * @param {string} params.vin Vehicle VIN code
 * @param {string} params.zip Store ZIP code
 * @param {string} params.partNumber Part number
 * @returns {Item[]} List of found parts
 */
module.exports = async function (parser, params) {
  let browser, context, page;
  let products = [];

  try {
    // Connect to browser
    browser = PUPPETEER_BROWSER_URL
      ? await puppeteer.connect({
        browserURL: await resolveIpAddress(PUPPETEER_BROWSER_URL)
      })
      : await puppeteer.launch(DEBUG_MODE
        ? { executablePath: PUPPETEER_EXECUTABLE_PATH, headless: false, devtools: true }
        : { executablePath: PUPPETEER_EXECUTABLE_PATH, headless: true });

    // Create a new incognito browser context
    context = await browser.createIncognitoBrowserContext();

    // Prepare new page
    page = await context.newPage();
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');

    // Run the parser
    products = await parser(page, params);
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
  const partNumberRe = new RegExp(`^${params?.partNumber}`, 'i');
  return products.filter(item => partNumberRe.test(item.partNumber));
};