const puppeteer = require('puppeteer');
const DEBUG_MODE = process.env.NODE_ENV === 'development';

module.exports = async function (params) {
  const products = [];

  const browser = await puppeteer.launch(DEBUG_MODE
    ? { headless: false, devtools: true, args: ['--start-maximized'], defaultViewport: null }
    : { headless: true });
  let [page] = await browser.pages();
  if (!page) page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1
  });
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://www.autozone.com', ['geolocation']);
  // fix for headless https://github.com/puppeteer/puppeteer/issues/665
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
  await page.goto('https://www.autozone.com/parts');

  // hide ads
  await page.addStyleTag({ content: '.lilo3746-wrapper {display:none!important;}' });

  // add location by zip code (first store found)
  await page.waitForSelector('#nav_wrapper span[data-testid="store-name-text-top-header"]');
  const oldStoreName = await page.$eval('#nav_wrapper span[data-testid="store-name-text-top-header"]', el => el.textContent);
  await page.$eval('#nav_wrapper div[data-testid="at_store_locator_homepage"]', el => el.click());
  await page.waitForSelector('#changeStoreBtn');
  await page.$eval('#changeStoreBtn', el => el.click());
  await page.waitForSelector('#SearchInput');
  await page.$eval('#SearchInput', el => el.focus());
  await page.type('#SearchInput', params.location.zip);
  await page.$eval('button[data-testid="address-search-keyword"]', el => el.click());
  await page.waitForSelector('button[data-testid="set-store-btn-0"]');
  await page.$eval('button[data-testid="set-store-btn-0"]', el => el.click());
  await page.waitForFunction(oldStoreName => {
    const newStoreName = document.querySelector('#nav_wrapper span[data-testid="store-name-text-top-header"]')?.textContent;
    return newStoreName && newStoreName !== oldStoreName;
  }, {}, oldStoreName);

  // add vehicle
  await page.waitForSelector('#nav_wrapper button[data-testid="deskTopVehicle-menu-lg"]');
  await page.$eval('#nav_wrapper button[data-testid="deskTopVehicle-menu-lg"]', el => el.click());
  await page.waitForSelector('#yearheader');

  // vehicle: set year
  await page.$eval('#yearheader', el => el.focus());
  await page.waitForSelector('div[data-testid="yearheader-dropdown-list"]');
  await page.type('#yearheader', params.vehicle.year);
  await page.$eval('#yearheader', el => el.blur());

  // vehicle: set make
  await page.waitForFunction(() => {
    return !document.querySelector('#makeheader').disabled;
  });
  await page.$eval('#makeheader', el => el.focus());
  await page.waitForSelector('div[data-testid="makeheader-dropdown-list"]');
  await page.type('#makeheader', params.vehicle.make);
  await page.$eval('#makeheader', el => el.blur());

  // vehicle: set model
  await page.waitForFunction(() => {
    return !document.querySelector('#modelheader').disabled;
  });
  await page.$eval('#modelheader', el => el.focus());
  await page.waitForSelector('div[data-testid="modelheader-dropdown-list"]');
  await page.type('#modelheader', params.vehicle.model);
  await page.$eval('#modelheader', el => el.blur());

  // vehicle: set engine
  await page.waitForFunction(() => {
    return !document.querySelector('#engineheader').disabled;
  });
  await page.$eval('#engineheader', el => el.focus());
  await page.waitForSelector('div[data-testid="engineheader-dropdown-list"]');
  await page.type('#engineheader', params.vehicle.engine);
  await page.$eval('#engineheader', el => el.blur());

  // wait for save the vehicle
  await page.waitForSelector('div[data-testid="vehicle-text"]');

  // show specific category
  let categoryFound = false;
  const categories = [].concat(params.categories).slice();
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    await page.waitForSelector('h2[data-testid="ymme-title"]');
    // await page.waitForSelector('h2[data-testid="ymme-what-are-you-working-on-today"]');
    categoryFound = await page.$$eval('main ul>li>a>div>span', (elements, category) => {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const text = element.textContent;
        if (text === category) {
          document.querySelector('h2[data-testid="ymme-title"]')?.remove();
          element.parentElement.parentElement.click();
          return true;
        }
      }
      return false;
    }, category);
    if (!categoryFound) break;
  }

  // read procuct info
  if (categoryFound) {
    await page.waitForSelector('div[data-testid="productInfoSection"]');
    const productSections = await page.$$('div[data-testid="productInfoSection"]');
    for (let i = 0; i < productSections.length; i++) {
      const productSection = productSections[i];
      const image = await productSection.$eval('img[data-testid="shelf-product-image"]', async el => {
        el.scrollIntoView();
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!/^data/.test(el.src)) break;
        }
        return el.src;
      });
      const title = await productSection.$eval('div[data-testid="productInfo"] h3', el => el.textContent);
      const price = await productSection.$eval('div[data-testid="product-price-container"]', el => el.textContent);
      const availability = await productSection.$eval('span[data-testid*="availability-"]', el => el.textContent === 'In Stock');
      products.push({
        image,
        title,
        price: parseFloat(`${price}`.replace(/[^0-9.]+/g, '')),
        availability
      });
    }
  }

  await browser.close();

  return products;
};
