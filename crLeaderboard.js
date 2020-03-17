const puppeteer = require('puppeteer');
const screenshotDOMElement = require('./screenshotDOMElement');

const renderCrLeaderboard = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });


  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log(dialog.message());
    await dialog.dismiss();
	});
  await page.goto("https://blockarca.de/alphacr/", { waitUntil: 'networkidle0' });
  
  page.addScriptTag({
    content: `
      const removeElement = (element) => {
        if (element.parentNode !== null) {
          element.parentNode.removeChild(element);
        }
      };
  `,
  });

  await page.$eval( '#leaderboardItem', tiers => tiers.click() );

  const menu = await page.$("#menu");
  await page.evaluate(element => {
    removeElement(element);
  }, menu);


  await screenshotDOMElement(page, {
    path: 'cr.png',
    selector: 'body',
    padding: 0,
  });
  await browser.close();
};

module.exports = renderCrLeaderboard;