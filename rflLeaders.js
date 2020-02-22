const puppeteer = require("puppeteer");

const renderRanking = async (title, results) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 550, height: 550 });

  
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
    <h1>${title}</h1>
    <table>
    <thead>
        <tr>
            <th>Place</th>
            <th>Player</th>
            <th>Tokens</th>
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

module.exports = renderRanking;
