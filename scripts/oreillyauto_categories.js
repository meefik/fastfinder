// $ node oreillyauto_categories.js | tee oreillyauto_categories.csv

const puppeteer = require('puppeteer');
const DEBUG_MODE = process.env.NODE_ENV === 'development';

(async function () {
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
  await context.overridePermissions('https://www.oreillyauto.com', ['geolocation']);
  // fix for headless https://github.com/puppeteer/puppeteer/issues/665
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');

  async function listCategories (url, categories) {
    for (let i = 0; i < 3; i++) {
      try {
        await page.goto(url, { referer: url });
        await page.waitForSelector('div.category-page-child-categories, div.plp-footer');
        break;
      } catch (err) {
      // error
      }
    }
    const shelf = await page.$('div.plp-footer');
    if (shelf) return;
    const list = await page.$$eval('div.category-page-child-categories a', (elements) => elements.map(el => ({
      text: `${el.textContent}`.trim(),
      link: el.href
    })));
    for (let i = 0; i < list.length; i++) {
      const leaf = list[i];
      const arr = categories.slice();
      arr.push(leaf.text);
      console.log(arr.join('; '));
      await listCategories(leaf.link, arr);
    }
  }

  await page.goto('https://www.oreillyauto.com');
  await page.waitForSelector('div.nav-shop_main-items');

  const topCategories = await page.$$eval('div.nav-shop_main-items a.js-nav-shop_item', (elements) => {
    return elements.map(el => ({
      text: `${el.textContent}`.trim(),
      link: el.href
    }));
  });

  for (let i = 0; i < topCategories.length; i++) {
    const topCategory = topCategories[i];
    await listCategories(topCategory.link, [topCategory.text]);
  }

  await browser.close();
})();
