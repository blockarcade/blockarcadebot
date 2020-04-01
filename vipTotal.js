const puppeteer = require('puppeteer');
const screenshotDOMElement = require('./screenshotDOMElement');


const renderVIPTotal = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });


  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log(dialog.message());
    await dialog.dismiss();
	});
  await page.goto("https://blockarca.de/vip/widget");
  

  await page.waitForSelector('#done');

  await screenshotDOMElement(page, {
    path: 'viptotal.png',
    selector: '#capture',
    padding: 0,
  });
  await browser.close();
};

module.exports = renderVIPTotal;