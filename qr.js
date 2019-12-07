const puppeteer = require("puppeteer");

const renderQR = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://blockarca.de/qr/widget");
  await page.setViewport({ width: 600, height: 420 });

  await page.waitForSelector('#ready-to-go');

  await page.screenshot({ path: "qr.png" });
  await browser.close();
};

renderQR();

module.exports = renderQR;
