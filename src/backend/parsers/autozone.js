module.exports = async function (page, params) {
  const products = [];

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
  await page.type('#SearchInput', params.zip);
  await page.$eval('button[data-testid="address-search-keyword"]', el => el.click());
  await page.waitForSelector('div[data-testid="my-store-instructions"]', { hidden: true });
  if (!await page.$('button[data-testid="set-store-btn-0"]')) {
    throw new Error('ZIP not found');
  }
  await page.waitForSelector('button[data-testid="set-store-btn-0"]');
  await page.$eval('button[data-testid="set-store-btn-0"]', el => el.click());
  await page.waitForFunction(oldStoreName => {
    const newStoreName = document.querySelector('#nav_wrapper span[data-testid="store-name-text-top-header"]')?.textContent;
    return newStoreName && newStoreName !== oldStoreName;
  }, {}, oldStoreName);

  // search by part numbers
  for (const partNumber of params.partNumbers) {
    await page.goto(`https://www.autozone.com/searchresult?searchText=${encodeURIComponent(partNumber)}`);
    await page.waitForSelector('h1[data-testid="search-results-thin-header"], h1[data-testid="product-title"]');

    // go to the first category
    const categoryElement = await page.$('div[data-testid="search-result-list"] a');
    if (categoryElement) {
      const href = await categoryElement.evaluate(el => el.href, categoryElement);
      await page.goto(href);
      await page.waitForSelector('div[data-testid="productInfoSection"], h1[data-testid="product-title"]');
    }

    // read procuct info from list
    const productList = await page.$$('div[data-testid="productInfoSection"]');
    if (productList?.length) {
      for (let i = 0; i < productList.length; i++) {
        const productSection = productList[i];
        const image = await productSection.$eval('img[data-testid="shelf-product-image"]', async el => {
          el.scrollIntoView();
          for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!/^data/.test(el.src)) break;
          }
          return el.src;
        });
        const title = await productSection.$eval('div[data-testid="productInfo"] h3', el => el.textContent?.trim());
        const price = await productSection.$eval('div[data-testid="product-price-container"]', el => {
          const text = el.textContent;
          return text ? parseFloat(`${text}`.replace(/[^0-9.]+/g, '')) : null;
        });
        const partNumber = await productSection.$eval('div[data-testid="product-part-number"] >span:nth-child(2)', el => el.textContent?.trim());
        const availability = await productSection.$eval('span[data-testid^="availability-"]', el => /^In Stock/i.test(el.textContent));
        const location = availability ? await productSection.$eval('button[data-testid="search-store-button"]', el => el.textContent?.trim()) : '';
        const link = await productSection.$eval('div[data-testid="productInfo"] a', el => el.href);
        products.push({
          parser: 'autozone',
          image,
          title,
          partNumber,
          price,
          availability,
          location,
          link
        });
      }
    } else {
      // read product info from single page
      const titleElement = await page.$('h1[data-testid="product-title"]');
      if (titleElement) {
        const title = await titleElement.evaluate(el => el.textContent?.trim(), titleElement);
        // wait for the price to load
        await page.waitForFunction(() => {
          const el = document.querySelector('div[data-testid="price-quantity-wrapper"] div[data-testid="price-fragment"]');
          return !/^Price Not Available/i.test(el?.textContent);
        });
        const price = await page.$eval('div[data-testid="price-quantity-wrapper"] div[data-testid="price-fragment"]', el => {
          const text = el.textContent;
          return text ? parseFloat(`${text}`.replace(/[^0-9.]+/g, '')) : null;
        });
        const image = await page.$eval('div[data-testid="enlarged-image-box"] img', el => el.src);
        const partNumber = await page.$eval('div[data-testid="partNumber-container"] >span:nth-child(2)', el => el.textContent?.trim());
        const availability = await page.$eval('span[data-testid^="availability-"]', el => /^In Stock/i.test(el.textContent));
        const location = availability ? await page.$eval('button[data-testid="search-store-button"]', el => el.textContent?.trim()) : '';
        const link = await page.url();
        products.push({
          seller: 'autozone',
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
