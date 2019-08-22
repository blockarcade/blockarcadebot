const puppeteer = require('puppeteer');

const renderRanking = () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });
  await page.goto('https://www.dapp.com/dapps/IOST');

  const bannerElement = await page.$('.banner-sec');
  const suggestElement = await page.$('.suggest-container');
  const selectBarElement = await page.$('.choose-select-bar');
  const searchElement = await page.$('.topsearch');

  page.addScriptTag({ content: `
  const removeElement = (element) => {
    if (element.parentNode !== null) {
      element.parentNode.removeChild(element);
    }
  };
  `})


  await page.evaluate((element) => {
    removeElement(element);
  }, bannerElement);

  await new Promise((resolve => setTimeout(resolve, 1000)));

  const secondBannerElement = await page.$('.banner-sec');

  await page.evaluate((element) => {
    removeElement(element);
  }, secondBannerElement);

  await page.evaluate((element) => {
    removeElement(element);
  }, bannerElement);

  await page.evaluate((element) => {
    removeElement(element);
  }, suggestElement);

  await page.evaluate((element) => {
    removeElement(element);
  }, selectBarElement);

  await page.evaluate((element) => {
    removeElement(element);
  }, searchElement);

  await page.screenshot({path: 'rank.png'});
  await browser.close();
};

module.exports = renderRanking;