export default async function (page, params) {
  const products = [];
  let storeAddress = '';

  page.on('dialog', async dialog => {
    await dialog.accept();
    await page.evaluate(() => {
      const parentDiv = document.getElementById('col-main');
      const currentDiv = document.getElementById('addresses_list');
      const newDiv = document.createElement('div');
      newDiv.id = 'notfound';
      parentDiv.insertBefore(newDiv, currentDiv);
    });
  });

  await page.goto('https://www.partsource.ca/apps/store-locator/');

  // Add location by ZIP code (first store found)
  await page.waitForSelector('#address_search');
  await page.type('#address_search', params.zip);
  await page.$eval('#submitBtn', el => el.click());
  await page.waitForSelector('#notfound, .btnStoreSelect', { hidden: true });
  if (await page.$('#notfound')) {
    throw new Error('ZIP not found');
  }
  await page.waitForSelector('.btnStoreSelect', { visible: true });
  await page.$eval('.btnStoreSelect', el => el.click());
  await page.waitForSelector('.btnStoreSelect[value="Selected"]');
  const addressSelector = await page.$('#addresses_list li');
  storeAddress = `${await addressSelector.$eval('.address', el => el.textContent?.trim())}, ${await addressSelector.$eval('.city', el => el.textContent?.trim())}, ${await addressSelector.$eval('.prov_state', el => el.textContent?.trim())} ${await addressSelector.$eval('.postal_zip', el => el.textContent?.trim())}`;

  // Search by part numbers
  for (const partNumber of params.partNumbers) {
    await page.goto(`https://www.partsource.ca/search?type=product&q=${encodeURIComponent(partNumber)}*`);

    // Next if no results
    await page.waitForSelector('span.boost-pfs-filter-total-product', { visible: true });
    if (await page.$eval('span.boost-pfs-filter-total-product', el => el.childNodes[0].nodeValue.trim()) === '0') {
      continue;
    };

    // Read product info from list
    await page.waitForSelector('div.boost-pfs-filter-product-skeleton-meta', { hidden: true });
    const productList = await page.$$('div.boost-pfs-filter-product-item-inner');
    if (productList?.length) {
      for (let i = 0; i < productList.length; i++) {
        const productSection = productList[i];
        const image = await productSection.$eval('img', async el => {
          el.scrollIntoView();
          for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!/^data/.test(el.src)) break;
          }
          return el.src;
        });
        const title = await productSection.$eval('a.boost-pfs-filter-product-item-title', el => el.textContent?.trim().slice(el.textContent?.trim().indexOf(' ') + 1));
        const partNumber = await productSection.$eval('a.boost-pfs-filter-product-item-title', el => el.textContent?.trim().slice(0, el.textContent?.trim().indexOf(' ')));
        let price;
        if (await productSection.$('span.boost-pfs-filter-product-item-sale-price')) {
          price = await productSection.$eval('span.boost-pfs-filter-product-item-sale-price', el => {
            return el.textContent ? parseFloat(el.textContent.replace(/[^0-9.]+/g, '')) : null;
          });
        } else {
          price = await productSection.$eval('span.boost-pfs-filter-product-item-regular-price', el => {
            return el.textContent ? parseFloat(el.textContent.replace(/[^0-9.]+/g, '')) : null;
          });
        }
        const link = await productSection.$eval('.boost-pfs-filter-product-bottom-inner a', el => el.href);

        products.push({
          seller: 'partsource',
          image,
          title,
          partNumber,
          price,
          location: storeAddress,
          link
        });
      }
    }
  }

  return products;
};
