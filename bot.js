const https = require('https');
const postToTelegram = require('./telegram');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });

const processData = (data) => {
  const lines = data.toString('utf8').split("\n");
  lines.forEach(line => {
    try {
      const parsedLine = JSON.parse(line);
      const parsedData = JSON.parse(parsedLine.result.event.data);
      if (parsedData.status === 'jackpotWin') {
        postToTelegram(`${parsedData.player} just went for the ${jackpot} jackpot and won ${parsedData.paid}!!!! Congradulations ${parsedData.player}!`);
      }
    }
    catch (e) {
      console.log(e);
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
      processData(d);
    })
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.on('end', () => {
    callback();
  });

  req.write(data);
  req.end();
}

// Send waitForRequests as the callback causing a loop.
waitForRequests(waitForRequests);