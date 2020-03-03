const puppeteer = require('puppeteer');
const screenshotDOMElement = require('./screenshotDOMElement');

const renderGlobalLeaderboard = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://blockarca.de/leaderboardglobal");

  await page.waitForSelector('#table');

  await screenshotDOMElement(page, {
    path: 'global.png',
    selector: '#widget',
    padding: 0,
  });
  await browser.close();
};

module.exports = renderGlobalLeaderboard;