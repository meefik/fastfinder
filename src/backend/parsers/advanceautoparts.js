module.exports = async function (page, params) {
  const products = [];
  let storeAddress = '';

  await page.goto('https://shop.advanceautoparts.com/');

  // Hide ads
  await page.addStyleTag({ content: '#bx-shroud-1575058 {display:none!important;}' });
  await page.addStyleTag({ content: '.bx-slab {display:none!important;}' });
  await page.addStyleTag({ content: '#bx-shroud-2085869 {display:none!important;}' });

  // Add location by ZIP code (first store found)
  await page.waitForSelector('a.css-1jzuwcj');
  await page.$eval('a.css-1jzuwcj', el => el.click());
  await page.waitForSelector('h2.css-w92r0m');
  await page.type('#address-input', params.zip);
  await page.$eval('button[aria-label="Find a Store"]', el => el.click());
  await page.waitForSelector('button[aria-label="Find a Store"]:disabled', { hidden: true });
  if (!await page.$('div.css-1twpn9q')) {
    throw new Error('ZIP not found');
  }
  await page.$eval('div.css-1twpn9q button', el => el.click());
  await page.waitForSelector('div.css-1twpn9q div[data-testid="loading-animation"]', { hidden: true });
  storeAddress = await page.$$eval('a.css-1jzuwcj div div div', els => {
    storeAddress = els[0].textContent + ', ' + els[1].textContent;
    return storeAddress;
  });

  // Search by part numbers
  for (const partNumber of params.partNumbers) {
    await page.goto(`https://shop.advanceautoparts.com/web/SearchResults?searchTerm=${encodeURIComponent(partNumber)}`);

    // Hide ads
    await page.addStyleTag({ content: '#bx-shroud-1575058 {display:none!important;}' });
    await page.addStyleTag({ content: '.bx-slab {display:none!important;}' });
    await page.addStyleTag({ content: '#bx-shroud-2085869 {display:none!important;}' });

    // Next if no results
    await page.waitForSelector('.css-ieskej, div.css-cbtwv9', { visible: true });
    if (await page.$('div.css-cbtwv9')) {
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
            text = els[1].getAttribute('aria-label');
          } else {
            text = els[0].getAttribute('aria-label');
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
