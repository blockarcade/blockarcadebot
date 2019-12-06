const puppeteer = require("puppeteer");
const getTopRFL = require('./getTopRFL');

const renderRanking = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 550, height: 550 });

  const results = await getTopRFL();
  const html = `<html>
    <head>
      <style type="text/css">
        body {
          background-color: #141221;
          color: white;
          margin: 0;
          padding: 0;
          padding-top: 1em;
          border: 5px solid #b900ff;
          font-family: 'Helvetica', 'Arial', sans-serif;
        }

        th {
          text-align: left;
          font-size: 1.1em;
          background-color: 
        }

        th, td {
          border: 1px solid #039DF3;
          padding: 8px;
        }

        table {
          font-size: 1.1em;
          width: 80%;
          margin: auto;
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
    <center>
    <h1>TOP RFL STAKERS</h1>
    <table>
    <thead>
        <tr>
            <th>Place</th>
            <th>Player</th>
            <th>RFL Staked</th>
        </tr>
    </thead>
    <tbody>
        ${results.map((result, i) => {
          let row = '<tr>';
          row += '<td>' + (i + 1) + '</td>';
          row += '<td>' + result.user + '</td>';
          row += '<td>' + result.amount + '</td>';
          row += '</tr>';
          return row;
        }).join(' ')}

        </tbody>
        </table>
        </center>
    </body>
  
    </html>
  `;
  await page.setContent(html);

  await page.screenshot({ path: "rflrank.png" });
  await browser.close();
};

renderRanking();

module.exports = renderRanking;
