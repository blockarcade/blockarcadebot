const https = require('https');
const { postToTelegram, postGifToTelegram, deleteMessage } = require('./telegram');
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
  'https://media.giphy.com/media/8UGDqqQIegZLcMN2rO/giphy.gif',
  'http://giphygifs.s3.amazonaws.com/media/MAA3oWobZycms/giphy.gif',
  'https://media.giphy.com/media/AslZw11iNXkkx33XZM/giphy.gif',
];

let lastMessageId = 0;


const postRegisteredUsers = () => {
  const airdropped = new Map();
  userdb.createReadStream()
  .on('data', function (data) {
    let username;
    let user = {};
    try {
      username = `@${data.key.trim()}`;;
      user = JSON.parse(data.value);
    } catch (e) {
      console.log(e);
    }

    if (typeof user.iostAccount === 'undefined' || username === '@octalmage') {
      console.log('Skipping user:', user.iostAccount);
      return;
    }

    if (user.iostAccount) {
      airdropped.set(username, user.iostAccount);
    } else {
      console.log('no username', data);
    }
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', () => {
    console.log('Stream ended')
    const keys = Array.from( airdropped.keys() );
    console.log(airdropped);

    postToTelegram(`💰💰 There are *${keys.length}* $IOST accounts registered for the next AIRDROP! 50,000 $TIX airdrop happening on August 18th 💰💰`, undefined, true);
});
};

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

        const body = JSON.parse(response);
        const tixBalance = body.balance;

        iostRequest('/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/iplay/true', (err, response) => {
          if (err) {
            console.log(err);
            return;
          }

        const body = JSON.parse(response);
        const iplayBalance = body.balance;
        const cashGif = cashGifs[Math.floor(Math.random() * cashGifs.length)];
        postGifToTelegram(cashGif, `*Major jackpot is up to ${numberWithCommas((iostBalance / 10).toFixed(2))} $IOST, ${numberWithCommas((itrxBalance/ 10).toFixed(2))} $ITRX, ${numberWithCommas((tixBalance / 10).toFixed(2))} $TIX and ${numberWithCommas((iplayBalance / 10).toFixed(2))} $IPLAY!*\n\nWho's going to win it?\n\nPlay now at: https://blockarca.de`);
      
      });
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
    
    postGifToTelegram('https://media.giphy.com/media/3SLnytgfJTaxy/giphy.gif', `*BlockArcade's IOST node is already giving rewards as a parter node at ${numberWithCommas(totalVotes.toFixed(0))} votes!*\n\nOnly ${numberWithCommas(amountLeft.toFixed(0).toLocaleString())} votes left to become a servi node!\n\nVote now at: https://iostabc.com/account/blockarcade`);
  });
};

const postInstructionsToTelegram = (user) => {
  let teleUser = '';
  if (user) {
    teleUser = ` @${user}`;;
  }

  postToTelegram(`Welcome${teleUser}! Tell the bot your IOST account name using "/iost accountname" to participate in airdrops!`, undefined, false);

  // setTimeout(() => {
  //   postToTelegram('/iost YOUR IOST ACCOUNT');
  // }, 1000);
  
}

const getDate = () => {
  const now = new Date();
  return dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
}

cron.schedule('30 */12 * * *', () => {
  console.log(getDate());
  postJackpotToTelegram();
});

cron.schedule('0 */6 * * *', () => {
  console.log(getDate());
  postVotesToTelegram();
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

    if (line.message && typeof line.message.new_chat_members !== 'undefined') {
      console.log(line.message.new_chat_members);
      postInstructionsToTelegram(line.message.new_chat_members[0].username);
      return;
    }

    try {
      const room = `@${line.message.chat.username}`;
      const [command, args] = line.message.text.replace('@BlockArcadeBot', '').split(' ');
      switch (command.toLowerCase()) {
        case '/iost':
          const user = line.message.from.username;
          if (args) {
            if (!user) {
              postToTelegram('Please set a Telegram username before interacting with our bot! https://telegram.org/faq#q-what-are-usernames-how-do-i-get-one');
            } else {

              if (!isNaN(args.charAt(0))) {
                postToTelegram('IOST account can not start with a number, sorry!', undefined, false, line.message.message_id);
              } else {
                changes.set(user, { username: args, message_id: line.message.message_id, room });
              }
            }

            deleteMessage('@blockarcade', line.message.message_id);
          } else {
            postInstructionsToTelegram(user);
            deleteMessage('@blockarcade', line.message.message_id);
          }
          break;
        case '/jackpot':
            postJackpotToTelegram();
            deleteMessage('@blockarcade', line.message.message_id);
            break;
        case '/airdrop':
            postInstructionsToTelegram();
            deleteMessage('@blockarcade', line.message.message_id);
            break;
        case '/vote':
            postVotesToTelegram();
            deleteMessage('@blockarcade', line.message.message_id);
            break;
        case '/count':
            postRegisteredUsers();
            deleteMessage('@blockarcade', line.message.message_id);
            break;
        default:
          console.log('unreconized command', command);
      }


      changes.forEach((change, user) => {
        console.log(user, change);
        postToTelegram(
          `Thanks for signing up @${user}! Your IOST account is registered and we deleted your message.`,
          changes.room,
          false,
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