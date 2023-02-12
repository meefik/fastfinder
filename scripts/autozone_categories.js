// $ node autozone_categories.js | tee autozone_categories.csv

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
  await context.overridePermissions('https://www.autozone.com', ['geolocation']);
  // fix for headless https://github.com/puppeteer/puppeteer/issues/665
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');

  async function navigateToCategory (categories) {
    await page.goto('https://www.autozone.com/parts');
    await page.addStyleTag({ content: '.lilo3746-wrapper {display:none!important;}' });
    if (!categories.length) return true;
    let categoryFound = false;
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await page.waitForSelector('h2[data-testid="ymme-what-are-you-working-on-today"]');
      categoryFound = await page.$$eval('main ul>li>a>div>span', (elements, category) => {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const text = element.textContent;
          if (text === category) {
            document.querySelector('h2[data-testid="ymme-what-are-you-working-on-today"]')?.remove();
            element.parentElement.parentElement.click();
            return true;
          }
        }
        return false;
      }, category);
      if (!categoryFound) break;
    }
    return categoryFound;
  }

  async function listCategories (categories) {
    const found = await navigateToCategory(categories);
    if (!found) return;
    await page.waitForSelector('h2[data-testid="ymme-what-are-you-working-on-today"], #shelf-result-list');
    const shelf = await page.$('#shelf-result-list');
    if (shelf) return;
    const list = await page.$$eval('main ul>li>a>div>span', (elements) => elements.map(el => el.textContent));
    for (let i = 0; i < list.length; i++) {
      const leaf = list[i];
      const arr = categories.slice();
      arr.push(leaf);
      console.log(arr.join('; '));
      await listCategories(arr);
    }
  }

  // const top = [
  //   'Batteries, Starting and Charging',
  //   'Brakes and Traction Control',
  //   'Collision, Body Parts and Hardware',
  //   'Cooling, Heating and Climate Control',
  //   'Drivetrain',
  //   'Electrical and Lighting',
  //   'Emission Control and Exhaust',
  //   'Engine Management',
  //   'EV Drive Motor and Components',
  //   'External Engine',
  //   'Filters and PCV',
  //   'Fuel Delivery',
  //   'Gaskets',
  //   'Ignition, Tune Up and Routine Maintenance',
  //   'Interior',
  //   'Internal Engine',
  //   'Powertrain',
  //   'Suspension, Steering, Tire and Wheel',
  //   'Truck and Towing'
  // ];
  // const categories = [top[0]];
  const categories = [];
  await listCategories(categories);

  await browser.close();
})();
