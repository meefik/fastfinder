module.exports = async function (page, params) {
  const products = [];

  await page.goto('https://www.napaonline.com');

  // Add location by ZIP code (first store found)
  await page.waitForSelector('.my-store > a.my-menu-a');
  await page.waitForSelector('button#change-my-store-link');
  await page.$eval('button#change-my-store-link', el => el.click());
  await page.waitForSelector('input#store-search-input');
  await page.type('input#store-search-input', params.zip);
  await page.$eval('a#store-search-button', el => el.click());
  await page.waitForSelector('.store-listing');
  await page.$eval('.store-listing a.select-store', el => el.click());
  await page.waitForSelector('#defaultStoreName');

  return products;
};
