const puppeteer = require("puppeteer");

const renderRanking = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 400 });
  await page.goto("https://www.dapp.com/dapps/IOST");

  const bannerElement = await page.$(".banner-sec");
  const suggestElement = await page.$(".suggest-container");
  const selectBarElement = await page.$(".choose-select-bar");
  const searchElement = await page.$(".topsearch");
  const menuElement = await page.$(".mobile-slider-generator");
  const moreSelections = await page.$(".more-selections");

  page.addScriptTag({
    content: `
      const removeElement = (element) => {
        if (element.parentNode !== null) {
          element.parentNode.removeChild(element);
        }
      };
  `,
  });

  await page.evaluate(element => {
    removeElement(element);
  }, bannerElement);

  await page.evaluate(element => {
    removeElement(element);
  }, menuElement);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const secondBannerElement = await page.$(".banner-sec");

  await page.evaluate(element => {
    removeElement(element);
  }, secondBannerElement);

  await page.evaluate(element => {
    removeElement(element);
  }, bannerElement);

  await page.evaluate(element => {
    removeElement(element);
  }, suggestElement);

  await page.evaluate(element => {
    removeElement(element);
  }, selectBarElement);

  await page.evaluate(element => {
    removeElement(element);
  }, searchElement);

  await page.evaluate(element => {
    removeElement(element);
  }, moreSelections);

  await page.evaluate(() => {
    const node = document.createElement('span');  
    node.style.color = 'rgb(70, 25, 106);';
    node.style.float = 'right';
    node.style.margin = '1em';
    node.style.fontWeight = 'bold';
    const textnode = document.createTextNode('https://blockarca.de');
    node.appendChild(textnode); 
    document.querySelector(".mobile-menu-header").appendChild(node); 
  });

  await page.evaluate(() => {
    const tags = document.querySelectorAll(".dapp-item-for-mobile-outer");
    for (let i = 0; i < tags.length; i++) {
      
      if (tags[i].textContent.indexOf("BlockArcade") !== -1) {
        const found = tags[i];
        found.firstChild.style.boxShadow = "0 10px 20px 0 rgba(237,92,158,.05), 0 5px 10px 0 rgba(237,92,158,.6)";
        found.style.margin = '25px 0px';
        found.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center'
        });
        window.scrollBy(0, -30);
        break;
      }
    }
  });

  await page.screenshot({ path: "rank.png" });
  await browser.close();
};

renderRanking();

module.exports = renderRanking;
