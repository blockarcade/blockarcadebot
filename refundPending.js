const exec = require('child_process').execSync;
const fetch = require('node-fetch');
const cron = require('node-cron');
const readline = require('readline');
const level = require('level');
const shellescape = require('shell-escape');
const apiUrl = "https://api.iost.io";
const url = `${apiUrl}/getContractStorage`;
const defaultParams = {
  id: "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt",
  by_longest_chain: true
};

const gamesdb = level('gamesdb');

const data = { ...defaultParams,
  "key": "nonce"
};

const getDate = () => {
  const now = new Date();
  return dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
}

const getGames = async () => {
  let games = {};
  try {
    const pendingGames = await gamesdb.get('pending');
    games = JSON.parse(pendingGames);
  } catch (e) {
    console.log(e);
  }

  return games;
}

const storePending = async () => {
  const games = await getGames();
  return postData(url, data)
  .then(response => response.data)
  .then(async (total) => { 
      const response = await fetchGames(total, 50);

      response.forEach((game) => {
        if (game.status === 'pending' && typeof games[game.id] === 'undefined') {
          console.log(`Adding game ${game.id} to pending list.`);
          games[game.id] = game;
        }
      });

      await gamesdb.put('pending', JSON.stringify(games));
  });
};

const processPending = async () => {
  const games = await getGames();
  Object.keys(games).forEach(async (gameId) => {
    const game = games[gameId];
    const timestamp = new Date(game.timeFetched);

    if (Date.now() - timestamp > 300000) {
      console.log(`Time to refund game ${game.id}`);
      const command = ['iwallet', '--account', 'blockarcade', '-s', '18.209.137.246:30002', 'call', 'ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt', 'refund', `[${game.id}]`];
      console.log(command);
      try {
        exec(shellescape(command), { stdio: 'inherit' });
      } catch (e) {
        console.log('Encountered error refunding game');
      }

      // We're done! Remove it from the object.
      console.log('Done! Removing game from pending list.');
      delete games[game.id];
    } else {
      console.log(`Not enough time has passed, skipping game ${game.id}`)
    }
  });

  return gamesdb.put('pending', JSON.stringify(games));
};

const processGames = async () => {
  await storePending();
  await processPending();
}

// We want this to run every 5 minutes.
cron.schedule('*/5 * * * *', () => {
  console.log(getDate());
  processGames();
});

processGames();

const fetchGames = (total, number) => {
  const url = `${apiUrl}/getBatchContractStorage`;
  const keyFields = [];
  for (let x = total - number; x < total; x++) {
    keyFields.push({
      key: `bet${x}`
    });
  }
  const batchData = { ...defaultParams,
    key_fields: keyFields
  };

  return postData(url, batchData)
    .then((response => {
      return response.datas.map((data, i) => {
        const round = JSON.parse(data);
        return { ...round,
          id: i + (total - number),
          timeFetched: Date.now(),
        }
      });
    }))
}


function postData(url = '', data = {}) {
  // Default options are marked with *
  return fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.json()); // parses JSON response into native Javascript objects
}