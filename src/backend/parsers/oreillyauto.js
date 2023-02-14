module.exports = async function (page, params) {
  const products = [];
  let storeAddress;

  await page.goto('https://www.oreillyauto.com');

  // Add location by ZIP code (first store found)
  await page.waitForSelector('button[data-qa="header-find-a-store"]');
  await page.$eval('button[data-qa="header-find-a-store"]', el => el.click());
  await page.waitForSelector('#find-a-store-search');
  await page.type('#find-a-store-search', params.zip);
  await page.waitForSelector('#find-a-store-search-suggestions');
  if (!await page.$('ul#find-a-store-search-suggestions > li')) {
    throw new Error('ZIP not found');
  }
  await page.$eval('.fas-autocomplete__button', el => el.click());
  await page.waitForSelector('.fas-list-item__confirm-button', { hidden: true });
  await page.waitForSelector('.fas-search-results__list .fas-list-item:nth-child(1) button');
  if (await page.$('.fas-search-results__list .pin-number')) {
    storeAddress = await page.$eval('.fas-search-results__list .store-info__address', el => el.textContent?.replace('  ', ', ').trim());
  } else {
    storeAddress = await page.$eval('.fas-search-results__list p', el => el.textContent?.replace('  ', ', ').trim());
  }
  await page.$eval('.fas-search-results__list .fas-list-item:nth-child(1) button', el => el.click());
  await page.waitForSelector('button[data-qa="header-find-a-store"][data-store-selected="true"]');

  // Search by part numbers
  for (const partNumber of params.partNumbers) {
    // const url = await page.$eval('form.header-search__form', el => el.action);
    const response = await page.goto(`https://www.oreillyauto.com/search?q=${encodeURIComponent(partNumber)}`);
    if (response.status() !== 200) {
      await page.reload();
    }
    await page.waitForSelector('.plp-container');

    // Hide ads
    await page.addStyleTag({ content: '.__fsr {display:none!important;}' });

    // Next if no results
    if (await page.$('.plp-no-results-header')) {
      continue;
    }

    // Read product info from list
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
      const link = await productSection.$eval('.product__link', el => el.href);
      products.push({
        seller: 'oreillyauto',
        image,
        title,
        partNumber,
        price,
        location,
        availability,
        link
      });
    }
  }

  return products;
};
