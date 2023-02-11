module.exports = async function (page, params) {
  const products = [];

  await page.goto('https://www.napaonline.com/');

  await page.waitForSelector('.footer-zipcode #find-a-store-input');

  return products;
};
