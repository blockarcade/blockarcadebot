const https = require('https');
const {
  postToTelegram,
} = require('./telegram');

const crData = JSON.stringify({
  topics: ["CONTRACT_EVENT"],
  filter: {
    contract_id: "ContractEKfgnM7iWJRGnxg7aSh6CEom73mgbiQ3ef5jjm2ddbJS",
  },
});

function formatTime(dt) {
  var minutes = Math.floor(dt / 60);
  var seconds = Math.floor(dt - (minutes * 60));
  var tenths = Math.floor(10 * (dt - Math.floor(dt)));
  if (minutes > 0)
    return minutes + "." + (seconds < 10 ? "0" : "") + seconds + "." + tenths;
  else
    return seconds + "." + tenths;
}

const processCRData = data => {
  const lines = data.toString("utf8").split("\n");
  lines.forEach(line => {
    try {
      const parsedLine = JSON.parse(line);
      const parsedData = JSON.parse(parsedLine.result.event.data);
      console.log(parsedData);

      if (typeof parsedData.type === 'undefined' || parsedData.type !== 'NEW_BEST_LAP') {
        throw 'not a NEW_BEST_LAP';
      }

      postToTelegram(
        `*${parsedData.game.player}* just set a new record in CryptoRun: *${formatTime(parsedData.game.lapTime * .001)}*\n\nPlay now at: https://blockarca.de/cryptorun (coming soon)`
      );

    } catch (e) {
      // console.log(e);
    }
  });
};

const waitForCRRequests = callback => {
  const options = {
    hostname: "api.iost.io",
    port: 443,
    path: "/subscribe",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": crData.length,
    },
  };

  const req = https.request(options, res => {
    let temp = "";
    res.on("data", d => {
      temp += d;
    });

    res.on("end", () => {
      processCRData(temp);
      setTimeout(waitForCRRequests, 1000);
    });
  });

  req.on("error", error => {
    console.error(error);
    callback();
  });

  req.write(crData);
  req.end();
};

module.exports = waitForCRRequests;