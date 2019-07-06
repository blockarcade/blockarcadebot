const https = require('https');
const postToTelegram = require('./telegram');
const iostRequest = require('./iost');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });
const dateFormat = require('dateformat');
const cron = require('node-cron');

const getDate = () => {
  const now = new Date();
  return dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
}

cron.schedule('* * * * *', () => {
  console.log(getDate());
  iostRequest('/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/iost/true', (err, response) => {
    if (err) {
      console.log(err);
      return;
    }

    const body = JSON.parse(response);
    postToTelegram(`🤑🤑🤑🤑 Major jackpot is up to ${body.balance} IOST! 🤑🤑🤑🤑
![](https://media2.giphy.com/media/3o6gDWzmAzrpi5DQU8/giphy.gif?cid=790b76115d20c4a2444e325459959aa8&rid=giphy.gif)
*Who's going to win it?*`);
  })
});

console.log(getDate());

const processData = (data) => {
  const lines = data.toString('utf8').split("\n");
  lines.forEach(line => {
    try {
      const parsedLine = JSON.parse(line);
      const parsedData = JSON.parse(parsedLine.result.event.data);
      console.log(parsedData);
      if (parsedData.status === 'jackpotWin') {
        postToTelegram(`**${parsedData.player}** just went for the **${jackpot} jackpot** and won **${parsedData.paid}!!!!** Congratulations ${parsedData.player}!`);
      }
    }
    catch (e) {
      // console.log(e);
    }
  });
}

const waitForRequests = (callback) => {
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
    res.on('data', (d) => {
      console.log('got data');
      processData(d);
    })
  });

  req.on('error', (error) => {
    console.error(error);
    callback();
  });

  req.on('end', () => {
    console.log('closed');
    setTimeout(waitForRequests, 0);

  });

  req.write(data);
  req.end();
}

// Send waitForRequests as the callback causing a loop.
waitForRequests();
