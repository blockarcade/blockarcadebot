const https = require('https');
const { postToTelegram, postGifToTelegram } = require('./telegram');
const { iostRequest, iostABCRequest } = require('./iost');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });
const dateFormat = require('dateformat');
const cron = require('node-cron');
const level = require('level');

const userdb = level('userdb');

const reportedBets = new Map();

const cashGifs = [
  'https://media1.tenor.com/images/c8fc4c71fd9d5d1c6414da763bb5df51/tenor.gif',
  'https://uproxx.files.wordpress.com/2016/03/silicon-valley-gif.gif',
  'https://media1.tenor.com/images/42305eccf731de092494271770d6bd2d/tenor.gif',
  'https://media1.tenor.com/images/841f559c023d0da26f3b3e046ad5c7df/tenor.gif',
  'https://i.imgur.com/7OWL963.mp4',
  'https://media1.tenor.com/images/50ff9c09c94440d3051bd5bf13f2a36d/tenor.gif',
];

let lastMessageId = 0;

const postJackpotToTelegram = () => {
  iostRequest('/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/iost/true', (err, response) => {
    if (err) {
      console.log(err);
      return;
    }

    const body = JSON.parse(response);
    const iostBalance = body.balance; 

    iostRequest('/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/itrx/true', (err, response) => {
      if (err) {
        console.log(err);
        return;
      }
      const body = JSON.parse(response);
      const itrxBalance = body.balance;

      iostRequest('/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/tix/true', (err, response) => {
        if (err) {
          console.log(err);
          return;
        }
        const cashGif = cashGifs[Math.floor(Math.random() * cashGifs.length)];
        postGifToTelegram(cashGif, `*Major jackpot is up to ${numberWithCommas((iostBalance / 10).toFixed(2))} IOST, ${numberWithCommas((itrxBalance/ 10).toFixed(2))} ITRX, and ${numberWithCommas((body.balance / 10).toFixed(2))} TIX!*\n\nWho's going to win it?\n\nPlay now at: https://blockarca.de`);
      });
    });
  });
};

const postVotesToTelegram = () => {
  iostABCRequest('/api/voters/blockarcade', (err, response) => {
    if (err) {
      console.log(err);
      return;
    }

    const body = JSON.parse(response);
    const totalVotes = body.voters.reduce((acc, vote) => {
      return acc + vote.votes;
    }, 0);

    const amountLeft = 8000000 - totalVotes;
    
    postGifToTelegram('https://media.giphy.com/media/3SLnytgfJTaxy/giphy.gif', `*BlockArcade's IOST node is up to ${numberWithCommas(totalVotes.toFixed(0))} votes!*\n\nOnly ${numberWithCommas(amountLeft.toFixed(0).toLocaleString())} votes left!\n\nVote now at: https://iostabc.com/account/blockarcade`);
  });
};

const postInstructionsToTelegram = (user) => {
  let teleUser = '';
  if (user) {
    teleUser = ` @${user}`;;
  }

  postToTelegram(`Welcome${teleUser}! Tell the bot your IOST account name using "/iost accountname" to participate in airdrops!`, undefined, false);

  setTimeout(() => {
    postToTelegram('/iost YOUR IOST ACCOUNT');
  }, 1000);
  
}

const getDate = () => {
  const now = new Date();
  return dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
}

cron.schedule('30 */12 * * *', () => {
  console.log(getDate());
  postJackpotToTelegram();
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
          postToTelegram(`*${parsedData.player}* just went for the *${jackpot} jackpot* and won *${JSON.parse(parsedData.paid).join(' and ')}!!!!*\n\nCongratulations ${parsedData.player}!`);
        }
      }
    }
    catch (e) {
      // console.log(e);
    }
  });
}

const processMessages = (data) => {
  const lines = JSON.parse(data.toString('utf8'));
  const changes = new Map();
  if (!lines.result) {
    return;
  }

  lines.result.forEach(line => {
    lastMessageId = line.update_id;

    if (typeof line.message.new_chat_members !== 'undefined') {
      console.log(line.message.new_chat_members);
      postInstructionsToTelegram(line.message.new_chat_members[0].username);
      return;
    }

    try {
      const room = `@${line.message.chat.username}`;
      const [command, args] = line.message.text.replace('@BlockArcadeBot', '').split(' ');
      switch (command) {
        case '/iost':
          if (args) {
            const user = line.message.from.username;
            changes.set(user, { username: args, message_id: line.message.message_id, room });
          }
          break;
        case '/jackpot':
            postJackpotToTelegram();
            break;
        case '/airdrop':
            postInstructionsToTelegram();
            break;
        case '/vote':
            postVotesToTelegram();
            break;
        default:
          console.log('unreconized command', command);
      }


      changes.forEach((change, user) => {
        console.log(user, change);
        postToTelegram(
          `Thanks @${user}! IOST account name set to ${change.username}!`,
          changes.room,
          false,
          change.message_id,
        );
        userdb.put(user, JSON.stringify({ iostAccount: change.username }));
      });
    }
    catch (e) {
      // console.log(e);
    }
  });
};

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
      setTimeout(waitForRequests, 1000);
    });
  });

  req.on('error', (error) => {
    console.error(error);
    callback();
  });

  req.write(data);
  req.end();
}

const waitForBotMessage = () => {
  console.log(getDate(), 'waiting for messages');
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/getUpdates?offset=${lastMessageId + 1}`,
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
      processMessages(data);
      setTimeout(waitForBotMessage, 1000);
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
waitForBotMessage();


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}