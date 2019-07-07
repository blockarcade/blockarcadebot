const https = require('https');
const { postToTelegram, postGifToTelegram } = require('./telegram');
const iostRequest = require('./iost');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });
const dateFormat = require('dateformat');
const cron = require('node-cron');

const reportedBets = new Map();

const getDate = () => {
  const now = new Date();
  return dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
}

cron.schedule('30 */2 * * *', () => {
  console.log(getDate());
  iostRequest('/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/iost/true', (err, response) => {
    if (err) {
      console.log(err);
      return;
    }

    const body = JSON.parse(response);
    postGifToTelegram('https://uproxx.files.wordpress.com/2016/03/silicon-valley-gif.gif', `*Major jackpot is up to ${(body.balance / 10).toFixed(2)} IOST!*\n\nWho's going to win it?\n\nPlay now at: https://blockarca.de`);
  })
});

console.log(getDate());

const processData = (data) => {
  const lines = data.toString('utf8').split("\n");
  lines.forEach(line => {
    try {
      const parsedLine = JSON.parse(line);
      const parsedData = JSON.parse(parsedLine.result.event.data);
      console.log(parsedData.status);
      const jackpot = parsedData.amount > 10 ? 'major' : 'minor';
      if (parsedData.status === 'jackpotWin') {
        // Prevent double reporting.
        if (!reportedBets.has(parsedData.paid)) {
          reportedBets.set(parsedData.paid, true);
          postToTelegram(`*${parsedData.player}* just went for the *${jackpot} jackpot* and won *${parsedData.paid}!!!!*\n\nCongratulations ${parsedData.player}!`);
        }
      }
    }
    catch (e) {
      // console.log(e);
    }
  });
}

const waitForRequests = (callback) => {
  console.log(getDate(), 'waiting for events');
  const options = {
    hostname: 'api.iost.io',
    port: 443,
    path: '/subscribe',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (d) => {
      console.log('got data');
      data += d;
    });

    res.on('end', () => {
      console.log('closed');
      processData(data);
      setTimeout(waitForRequests, 0);
    });
  });

  req.on('error', (error) => {
    console.error(error);
    callback();
  });

  req.write(data);
  req.end();
}

// Send waitForRequests as the callback causing a loop.
waitForRequests();
