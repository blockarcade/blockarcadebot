const puppeteer = require('puppeteer');
const screenshotDOMElement = require('./screenshotDOMElement');

const renderWAXLeaderboard = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://wax.blockarca.de/leaderboard?hideback=true");
  // await page.setViewport({ width: 600, height: 375 });

  await page.waitForSelector('#table');

  await screenshotDOMElement(page, {
    path: 'wax.png',
    selector: '#widget',
    padding: 0,
  });
  await browser.close();
};

module.exports = renderWAXLeaderboard;