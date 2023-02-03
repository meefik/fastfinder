const puppeteer = require('puppeteer-core');
const { NODE_ENV, PUPPETEER_EXECUTABLE_PATH } = process.env;
const DEBUG_MODE = NODE_ENV === 'development';

/**
 * @typedef {Object} Item
 * @property {string} parser Name of parser.
 * @property {string} image - Item image link.
 * @property {string} title - Item title.
 * @property {string} partNumber - Item part number.
 * @property {number} price - Price per item.
 * @property {string} location Store address.
 * @property {boolean} availability Availability in the store.
 * @property {boolean} fits Item fits chosen vehicle.
 * @property {string} link Link to the item in the store.
 */

/**
 * Run a parser for www.oreillyauto.com
 *
 * @param {Object} params Input parameters.
 * @param {string} params.vin Vehicle VIN code
 * @param {string} params.zip Store ZIP code
 * @param {string} params.partNumber Part number
 * @returns {Item[]} List of found parts
 */

module.exports = async function (params) {
  const products = [];

  const browser = await puppeteer.launch(DEBUG_MODE
    ? { executablePath: PUPPETEER_EXECUTABLE_PATH, headless: false, devtools: true, args: ['--start-maximized'], defaultViewport: null }
    : { executablePath: PUPPETEER_EXECUTABLE_PATH, headless: true });

  try {
    let [page] = await browser.pages();
    if (!page) page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    });

    // fix for headless https://github.com/puppeteer/puppeteer/issues/665
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
    await page.goto('https://www.oreillyauto.com/shop/b');

    // choose vehicle
    await page.waitForSelector('[data-qa=header-vehicle-select]');
    const noCarSelectedText = await page.$eval('[data-qa=header-vehicle-select] >span >span:nth-child(2) >span', el => el.textContent);
    await page.$eval('[data-qa=header-vehicle-select]', el => el.click());
    // vehicle: set VIN
    // VIN example: https://vingenerator.org
    await page.waitForSelector('.button-link');
    await page.$eval('.button-link', el => el.click());
    await page.$eval('#vs-lookup-input', el => el.focus());
    await page.type('#vs-lookup-input', params.vin);
    await page.$eval('#vs-lookup-input', el => el.blur());
    await page.$eval('.lookup-form__submit', el => el.click());
    // wait for save the vehicle
    await page.waitForFunction(noCarSelectedText => {
      const carSelectedText = document.querySelector('[data-qa=header-vehicle-select] >span >span:nth-child(2) >span')?.textContent;
      return carSelectedText && carSelectedText !== noCarSelectedText;
    }, {}, noCarSelectedText);

    // search by part number
    const url = await page.$eval('form.header-search__form', el => el.action);
    await page.goto(`${url}?q=${encodeURIComponent(params.partNumber)}`);

    // add location by zip code (first store found)
    await page.waitForSelector('[data-qa=header-find-a-store]');
    const noStoreSelectedText = await page.$eval('[data-qa=header-find-a-store] >span >span:nth-child(2) >span', el => el.textContent);
    await page.$eval('[data-qa=header-find-a-store]', el => el.click());
    await page.waitForSelector('#find-a-store-search');
    await page.type('#find-a-store-search', params.zip);
    await page.waitForFunction(() => {
      return !document.querySelector('.fas-autocomplete__button').disabled;
    });
    await page.waitForSelector('.fas-autocomplete__button');
    await page.$eval('.fas-autocomplete__button', el => el.click());
    await page.waitForFunction(() => {
      return document.querySelector('.fas-autocomplete__button').disabled;
    });
    await page.waitForSelector('.fas-search-results__list >li:nth-child(1) button');
    const storeAddress = await page.$eval('.fas-search-results__list >li:nth-child(1) .store-info__text-wrap p:nth-child(1)', el => el.textContent?.replace('  ', ', ').trim());
    await page.$eval('.fas-search-results__list >li:nth-child(1) button', el => el.click());
    await page.waitForFunction(noStoreSelectedText => {
      const storeSelectedText = document.querySelector('[data-qa=header-find-a-store] >span >span:nth-child(2) >span')?.textContent;
      return storeSelectedText && storeSelectedText !== noStoreSelectedText;
    }, {}, noStoreSelectedText);

    // read product info from list
    try {
      await page.waitForSelector('.availability', { visible: true });
    } catch (err) {}
    const productList = await page.$$('article.product');
    for (let i = 0; i < productList.length; i++) {
      const productSection = productList[i];
      const image = await productSection.$eval('.product__image', async el => {
        el.scrollIntoView();
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!/^data/.test(el.src)) break;
        }
        return el.src;
      });
      const title = await productSection.$eval('a>h2', el => el.textContent?.trim());
      const partNumber = await productSection.$eval('.part-info__code.js-ga-product-line-number', el => el.textContent?.trim());
      const price = await productSection.$eval('strong.pricing_price', el => {
        const text = el.textContent;
        return text ? parseFloat(text.replace(/[^0-9.]+/g, '')) : null;
      });
      const availability = await productSection.$eval('.js-avail-pickup input', el => !el.disabled) && await productSection.$eval('.atc_btn', el => !el.disabled);
      const location = availability ? storeAddress : '';
      let fits = true;
      if (await productSection.$('.checkfit-banner span')) {
        fits = await productSection.$eval('.checkfit-banner span', el => el.textContent.trim().startsWith('Fits'));
      }
      const link = await productSection.$eval('.product__link', el => el.href);
      products.push({
        seller: 'oreillyauto',
        image,
        title,
        partNumber,
        price,
        location,
        availability,
        fits,
        link
      });
    }
  } catch (err) {
    await browser.close();
    throw err;
  }

  const partNumberRe = new RegExp(`^${params.partNumber}`, 'i');
  return products.filter(item => partNumberRe.test(item.partNumber));
};
