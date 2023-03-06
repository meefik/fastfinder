export default async function (page, params) {
  const products = [];
  let storeAddress = '';

  // Add location by ZIP code (first store found)
  await page.goto('https://shop.advanceautoparts.com/web/StoreLocatorView');
  // await page.waitForSelector('header a[href^="/web/StoreLocatorView"]');
  // await page.$eval('header a[href^="/web/StoreLocatorView"]', el => el.click());
  await page.waitForSelector('#address');
  await page.type('#address-input', params.zip);
  await page.$eval('button[aria-label="Find a Store"]', el => {
    el.click();
    el.disabled = true;
  });
  await page.waitForSelector('button[aria-label="Find a Store"]:disabled', { hidden: true });
  if (!await page.$('button[aria-label="Make My Store"], button[aria-label="My Selected Store"]')) {
    throw new Error('ZIP not found');
  }
  if (!await page.$('button[aria-label="My Selected Store"]')) {
    await page.$eval('button[aria-label="Make My Store"]', el => el.click());
    await page.waitForSelector('button[aria-label="My Selected Store"]');
  }
  storeAddress = await page.$eval('header a[href^="/web/StoreLocatorView"]', el => el.textContent?.trim());

  // Search by part numbers
  for (const partNumber of params.partNumbers) {
    await page.goto(`https://shop.advanceautoparts.com/web/SearchResults?searchTerm=${encodeURIComponent(partNumber)}`);

    // Next if no results
    await page.waitForSelector('button[aria-label="Find My Store"], button[aria-label="ADD TO CART"]');
    if (await page.$('button[aria-label="Find My Store"]')) {
      continue;
    }

    // Read product info from list
    await page.waitForSelector('.css-ieskej', { hidden: true });
    const productList = await page.$$('div.css-1uv02u6');
    if (productList?.length) {
      for (let i = 0; i < productList.length; i++) {
        const productSection = productList[i];
        const image = await productSection.$eval('img.css-16w1p0l', el => el.src);
        const title = await productSection.$eval('.css-1bwgs0x p', el => el.title?.trim().replace('  ', ' '));
        const partNumber = await productSection.$eval('.css-scvhiv', el => el.textContent?.trim().slice(7));
        const price = await productSection.$$eval('[data-testid="price-box"] div[aria-label]', els => {
          let text;
          if (els.length > 1) {
            text = els[1]?.getAttribute('aria-label');
          } else {
            text = els[0]?.getAttribute('aria-label');
          }
          return text ? parseFloat(text.replace(/[^0-9.]+/g, '')) : null;
        });
        const availability = !!(await productSection.$('.css-1tq25me .css-3dklwr'));
        const location = availability ? storeAddress : '';
        const link = await productSection.$eval('a.css-vurnku', el => el.href);
        products.push({
          seller: 'advanceautoparts',
          image,
          title,
          partNumber,
          price,
          availability,
          location,
          link
        });
      }
    }
  }

  return products;
};
