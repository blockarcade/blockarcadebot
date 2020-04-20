const https = require('https');
const http = require('http');
const Table = require('cli-table');
const stripAnsi = require('strip-ansi');
const {
  postToTelegram,
  postGifToTelegram,
  deleteMessage,
  postImage,
  postWelcomeMessage,
} = require("./telegram");
const { iostRequest, iostABCRequest, iostPOSTRequest, waxRequest } = require("./iost");
const data = JSON.stringify({
  topics: ["CONTRACT_RECEIPT"],
  filter: {
    contract_id: "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt",
  },
});

const qrData = JSON.stringify({
  topics: ["CONTRACT_RECEIPT"],
  filter: {
    contract_id: "Contract857r7Xc6fyLidKkW26vuDKvDVXZRx8SZbwYxpKfX8PV9",
  },
});
const dateFormat = require("dateformat");
const cron = require("node-cron");
const level = require("level");
const writeScores = require("./leaderboard.js");
const renderRanking = require("./dappRanking.js");
const renderRFLLeaders = require("./rflLeaders.js");
const renderQR = require("./qr.js");
const validIOSTAccount = require("./validIOSTAccount.js");
const getTopRFL = require("./getTopRFL.js");
const userdb = level("userdb");
const activedb = level("activedb");
const watchWAX = require('./watchWAX');
const waitForCRRequests = require('./waitForCRRequests');
const renderWAXLeaderboard = require('./waxLeaderboard');
const renderGlobalLeaderboard = require('./globalLeaderboard');
const renderVIPLeaderboard = require('./vipLeaderboard');
const renderVIPTotal = require('./vipTotal');
const renderCRLeaderboard = require('./crLeaderboard');

const welcomeText = `👋 *Welcome to BlockArcade!*

Our goal with BlockArcade is to emulate the traditional arcade experience, just on the decentralized web! This vision includes arcade tokens using IOST, tickets for prizes using a custom token called TIX, and a prize counter to spend your tickets!

*Links:*
    [BlockArcade Homepage](https://blockarca.de)
    [IOST Node](https://www.iostabc.com/account/blockarcade)
    [Whitepaper](https://blockarcade.github.io/whitepaper/whitepaper.pdf)
    [Prize Exchange](https://blockarca.de/exchange)
    [Twitter](https://twitter.com/playblockarcade)
    [DEX](https://iostdex.io)

*IOST Wallets*
    [Jetstream (Desktop)](https://chrome.google.com/webstore/detail/jetstream/ijancdlmlahmfgcimhocmpibadokcdfc)
    [TokenPocket (Mobile)](https://www.tokenpocket.pro)

*WAX Wallets*
    [Scatter (Desktop)](https://get-scatter.com/)
    [WAX Cloud Wallet (Mobile)](https://all-access.wax.io)

Please post any questions or feedback in the room!`;

const getDate = () => {
  const now = new Date();
  return dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
};

cron.schedule("30 */12 * * *", () => {
  console.log(getDate());
  postJackpotToTelegram();
});

cron.schedule("0 */6 * * *", () => {
  console.log(getDate());
  postVotesToTelegram();
});

cron.schedule("15 */8 * * *", () => {
  console.log(getDate());
  postLeaderboard();
});

cron.schedule("0 10 * * 1", () => {
  console.log(getDate());
  postLeaderboardWinners();
});

function timeDifference(current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)} seconds ago`;
  }

  if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} minutes ago`;
  }

  if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} hours ago`;
  }

  if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)} days ago`;
  }

  if (elapsed < msPerYear) {
    return `${Math.round(elapsed / msPerMonth)} months ago`;
  }


  return `${Math.round(elapsed / msPerYear)} years ago`;
}

console.log(getDate());

const reportedBets = new Map();

const cashGifs = [
  "https://media1.tenor.com/images/c8fc4c71fd9d5d1c6414da763bb5df51/tenor.gif",
  "https://media.giphy.com/media/8UGDqqQIegZLcMN2rO/giphy.gif",
  "http://giphygifs.s3.amazonaws.com/media/MAA3oWobZycms/giphy.gif",
  "https://media.giphy.com/media/AslZw11iNXkkx33XZM/giphy.gif",
  "https://thumbs.gfycat.com/PrestigiousEmbellishedBlackrhino-size_restricted.gif",
  "https://thumbs.gfycat.com/LongAdeptAsiaticwildass-size_restricted.gif",
  "https://gfycat.com/griminformalfieldmouse-chaeyoung-jeongyeon-fansign-dahyun-size_restricted.gif",
  "https://gfycat.com/constanttensebasil-bojackhorseman-cartoon-netflix.gif",
  "https://gfycat.com/unpleasantweightybrant-make-it-rain.gif",
];

let lastMessageId = 0;

const formatNumber = (num) => numberWithCommas(Number(num).toFixed(2));

const postLeaderboardWinners = async () => {
  const scores = await new Promise((resolve) => {
    iostPOSTRequest(
      "/getContractStorage",
      {
        id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
        key: "lastLeaderboardWinners",
        by_longest_chain: true,
      },
      (_, response) => {
        resolve(JSON.parse(JSON.parse(response).data));
      });
  });

  let body = "* LAST LEADERBOARD WINNERS *\n\n";
  const table = new Table();

  body += '* 🥇1st Place *\n';
  table.push(
    ['Player', scores[0].user],
    ['Score', scores[0].score],
    ['Reward', `${formatNumber(scores[0].reward)} TIX`]
  );

  body += "```\n";
  body += stripAnsi(table.toString());
  body += "\n```\n";

  table.length = 0;

  body += '* 🥈2nd Place *\n';
  table.push(
    ['Player', scores[1].user],
    ['Score', scores[1].score],
    ['Reward', `${formatNumber(scores[1].reward)} TIX`]
  );

  body += "```\n";
  body += stripAnsi(table.toString());
  body += "\n```\n";

  table.length = 0;

  body += '* 🥉3rd Place *\n';
  table.push(
    ['Player', scores[2].user],
    ['Score', scores[2].score],
    ['Reward', `${formatNumber(scores[2].reward)} TIX`]
  );

  body += "```\n";
  body += stripAnsi(table.toString());
  body += "\n```\n";

  table.length = 0;

  body += "Play now at: [BlockArca.de](https://blockarca.de)"

  postToTelegram(
    body,
    undefined,
    true
  );
};

const postTopJPT = async () => {
  const users = await new Promise(resolve => {

    iostPOSTRequest(
      "/getContractStorage",
      {
        id: "Contract857r7Xc6fyLidKkW26vuDKvDVXZRx8SZbwYxpKfX8PV9",
        key: "jptLedger",
        by_longest_chain: true,
      },
      (err, response) => {
        resolve(JSON.parse(JSON.parse(response).data));
      });
  });

  let result = [];

  Object.keys(users).filter(user => ['octalmage', 'bac0n', 'officialmgo', 'blockarcade', 'taryn', 'iostparty'].indexOf(user) === -1).forEach(user => {
    result.push({
      user: user,
      amount: users[user],
    });
  });

  result = result.filter((item) => Number(item.amount) > 0)

  result.sort((a, b) => {
    return Number(b.amount) - Number(a.amount);
  });

  result = result.slice(0, 10);

  await renderRFLLeaders('TOP JPT HOLDERS', result);

  postImage(
    "./rflrank.png",
    "Play now at: https://blockarca.de/qr"
  );
};

const postTopRFL = async () => {
  const results = await getTopRFL();
  await renderRFLLeaders('TOP RFL STAKERS', results);

  postImage(
    "./rflrank.png",
    "Play now at: https://blockarca.de/qr"
  );
};

const postQRTickets = async () => {
  await renderQR();

  postImage(
    "./qr.png",
    "Play now at: https://blockarca.de/qr"
  );
};

const postWAXLeaderboard = async () => {
  await renderWAXLeaderboard();

  postImage(
    "./wax.png",
    "Play now at: https://wax.blockarca.de"
  );
};

const postGlobalLeaderboard = async () => {
  await renderGlobalLeaderboard();

  postImage(
    "./global.png",
    "Play now at: https://blockarca.de"
  );
};

const postVIPLeaderboard = async () => {
  await renderVIPLeaderboard();

  postImage(
    "./vip.png",
    "Stake now at: https://blockarca.de/vip"
  );
};

const postVIPTotal = async () => {
  await renderVIPTotal();

  postImage(
    "./viptotal.png",
    "Stake now at: https://blockarca.de/vip"
  );
};

const postCRLeaderboard = async () => {
  await renderCRLeaderboard();

  postImage(
    "./cr.png",
    "Play now at: https://blockarca.de/cryptorun (coming soon)"
  );
};

function chunk(arr, len) {

  var chunks = [],
    i = 0,
    n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }

  return chunks;
}

const postLeaderboard = async () => {

  const blacklist = await new Promise((resolve) => {
    iostPOSTRequest(
      "/getContractStorage",
      {
        id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
        key: "blacklist",
        by_longest_chain: true,
      },
      (_, response) => {
        resolve(JSON.parse(JSON.parse(response).data));
      });
  });

  iostPOSTRequest(
    "/getContractStorage",
    {
      id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
      key: "leaderboardReward",
      by_longest_chain: true,
    },
    (err, response) => {
      const totalReward = Number(JSON.parse(response).data) * 0.8;

      iostPOSTRequest(
        "/getContractStorage",
        {
          id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
          key: "issuedTIXUsers",
          by_longest_chain: true,
        },
        async (err, response) => {
          const users = JSON.parse(JSON.parse(response).data);
          const fields = users.map(user => {
            return { field: user, key: "issuedTIX" };
          });

          const chunks = chunk(fields, 50);

          const response2 = await new Promise((resolve) => {
            iostPOSTRequest(
              "/getBatchContractStorage",
              {
                id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
                key_fields: chunks[1],
                by_longest_chain: true,
              },
              (_, response) => {
                resolve(response);
              });
          });

          const amounts2 = JSON.parse(response2).datas;
          iostPOSTRequest(
            "/getBatchContractStorage",
            {
              id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
              key_fields: chunks[0],
              by_longest_chain: true,
            },
            (err, response) => {

              const amounts = (JSON.parse(response).datas).concat(amounts2);
              console.log(amounts);
              let scores = users.map((user, i) => {
                return { user, score: amounts[i] };
              });

              scores = scores.filter(score => !isNaN(score.score));

              scores.sort((a, b) => b.score - a.score);
              const newScores = scores
                .filter(a => blacklist.indexOf(a.user) === -1) // Scammed BlockArcade, is a bad person.
                .slice(0, 10)
                .map((score, i) => ({
                  ...score,
                  place: i + 1,
                  score: numberWithCommas(Number(score.score).toFixed(2)),
                }));

              writeScores(
                newScores,
                numberWithCommas(Number(totalReward).toFixed(2))
              ).then(() => {
                postImage(
                  "./render.png",
                  "Leaderboard resets Sunday at 11:59pm CST\n\nPlay now at: https://blockarca.de"
                );
              });
            }
          );
        }
      );
    }
  );
};

const getUsers = () => {
  return new Promise((resolve) => {
    const airdropped = new Map();
    userdb
      .createReadStream()
      .on("data", async data => {
        let username;
        let user = {};
        let key;

        console.log(data);

        try {
          key = `${data.key.trim()}`;
          username = `@${key}`;
          user = JSON.parse(data.value);
        } catch (e) {
          console.log(e);
        }

        if (
          typeof user.iostAccount === "undefined"
        ) {
          console.log("Skipping user:", data.key);
          return;
        }
        const values = Object.keys(airdropped).map((v) => airdropped[v]);
        if (user.iostAccount && !values.includes(user.iostAccount)) {
          airdropped.set(username, user.iostAccount);
        } else {
          console.log('no username', data);
        }
      })
      .on("error", function (err) {
        console.log("Oh my!", err);
      })
      .on("close", function () {
        console.log("Stream closed");
      })
      .on("end", async () => {
        resolve(airdropped);
      });
  });

}

const postRegisteredUsers = async () => {
  const airdropped = await getUsers();
  console.log("Stream ended");
  const keys = Array.from(airdropped.keys());
  console.log(airdropped);
  console.log('found accounts: ' + keys.length);
  let newKeys = await Promise.all(
    keys.map((username) => {
      const key = username.replace('@', '');
      return new Promise((resolve, reject) => {
        console.log('Checking: ', key, username);
        activedb.get(key, function (err) {
          if (err) return reject('user not found');
          console.log('found user!', key);
          resolve(username);
        });
      })
        .catch((e) => {
          console.log(e, username);
        })
    })
  );

  // Filter out users that haven't played.
  newKeys = await Promise.all(newKeys.map(async (key) => {
    const leaderboard = await new Promise((resolve) => {
      iostPOSTRequest(
        "/getContractStorage",
        {
          id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
          key: 'issuedTIX',
          field: airdropped.get(key),
          by_longest_chain: true,
        },
        (_, response) => {
          resolve(JSON.parse(response).data);
        });
    });

    if (leaderboard !== 'null') {
      return key;
    }

    return null;
  }));

  const filteredKeys = newKeys.filter(el => el != null);

  postToTelegram(
    `There are *${filteredKeys.length}* $IOST accounts eligible for the next AIRDROP!\n25,000 $TIX airdrop happening on April 27th.\n\nTo be eligible you need to be active in @blockarcade a week before the airdrop and play any BlockArcade game that pays $TIX.`,
    undefined,
    true
  );
};

const postTixPriceToTelegram = async () => {
  const response = await fetch('https://otbtrade.com/api/getRecentPrice/tix');
  const currentPrice = Number(await response.json()).toFixed(4);

  postToTelegram(
    `Current $TIX Price: *${currentPrice} IOST*\nTrade now at otbTRADE: https://otbtrade.com/iost-exchange/tix`,
    undefined,
    true
  );

};

const postJackpotToTelegram = async () => {
  const lastJackpot = await new Promise((resolve) => {
    iostPOSTRequest(
      "/getContractStorage",
      {
        id: "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt",
        key: "lastJackpot",
        by_longest_chain: true,
      },
      (_, response) => {
        resolve(JSON.parse(JSON.parse(response).data));
      });
  });

  const waxBalance = await new Promise((resolve) => {
    waxRequest(
      '/v1/chain/get_currency_balance',
      {
        code: 'eosio.token',
        account: 'blockarcade1',
        symbol: 'WAX'
      },
      (_, response) => {
        resolve(JSON.parse(response)[0]);
      });
  });

  iostRequest(
    "/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/iost/true",
    (err, response) => {
      if (err) {
        console.log(err);
        return;
      }

      const body = JSON.parse(response);
      const iostBalance = body.balance;

      iostRequest(
        "/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/itrx/true",
        (err, response) => {
          if (err) {
            console.log(err);
            return;
          }
          const body = JSON.parse(response);
          const itrxBalance = body.balance;

          iostRequest(
            "/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/tix/true",
            (err, response) => {
              if (err) {
                console.log(err);
                return;
              }

              const body = JSON.parse(response);
              const tixBalance = body.balance;

              iostRequest(
                "/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/iplay/true",
                (err, response) => {
                  if (err) {
                    console.log(err);
                    return;
                  }

                  const body = JSON.parse(response);
                  const iplayBalance = body.balance;

                  iostRequest(
                    "/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/metx/true",
                    (err, response) => {
                      if (err) {
                        console.log(err);
                        return;
                      }

                      const body = JSON.parse(response);
                      const metxBalance = body.balance;

                      iostRequest(
                        "/getTokenBalance/ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt/lol/true",
                        (err, response) => {
                          if (err) {
                            console.log(err);
                            return;
                          }

                          const body = JSON.parse(response);
                          const lolBalance = body.balance;
                          const cashGif =
                            cashGifs[
                            Math.floor(Math.random() * cashGifs.length)
                            ];

                          postGifToTelegram(
                            cashGif,
                            `*IOST major jackpot is up to:\n${numberWithCommas(
                              (iostBalance / 10).toFixed(2)
                            )} $IOST\n${numberWithCommas(
                              (tixBalance / 10).toFixed(2)
                            )} $TIX\n${numberWithCommas(
                              (metxBalance / 10).toFixed(2)
                            )} $METX\n${numberWithCommas(
                              (lolBalance / 10).toFixed(2)
                            )} $LOL*\n\nWho's going to win it? Last jackpot won ${timeDifference(Date.now(), Math.ceil(lastJackpot.time * 0.000001))}.\n\nPlay now at: https://blockarca.de\n\n*WAX major jackpot is up to:\n${numberWithCommas((Number(waxBalance.split(' ')[0]) / 10).toFixed(2))} $WAX*\n\nPlay now at: https://wax.blockarca.de`
                          );
                        }
                      );

                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

const postVotesToTelegram = () => {
  iostABCRequest("/api/voters/blockarcade", (err, response) => {
    if (err) {
      console.log(err);
      return;
    }

    const body = JSON.parse(response);
    const totalVotes = body.voters.reduce((acc, vote) => {
      return acc + vote.votes;
    }, 0);

    const amountLeft = 8000000 - totalVotes;

    postImage(
      "./vote.jpg",
      `BlockArcade's IOST node is giving rewards as a block producer at ${numberWithCommas(
        totalVotes.toFixed(0)
      )} votes!\n\nVote now to receive an additional 25% of voter rewards paid in $TIX daily at:\nhttps://iostabc.com/account/blockarcade\n\n25% of block rewards will be paid in $TIX weekly.`
    );
  });
};

const postInstructionsToTelegram = user => {
  let teleUser = "";
  if (user) {
    teleUser = ` @${user}`;
  }

  postToTelegram(
    `Welcome${teleUser}! Tell the bot your IOST account name using "/iost accountname" to participate in airdrops!`,
    undefined,
    false
  );

  // setTimeout(() => {
  //   postToTelegram('/iost YOUR IOST ACCOUNT');
  // }, 1000);
};

const postWAXInstructionsToTelegram = user => {
  let teleUser = "";
  if (user) {
    teleUser = ` @${user}`;
  }

  postToTelegram(
    `Welcome${teleUser}! Tell the bot your WAX account name using "/wax accountname" to participate in airdrops!`,
    undefined,
    false
  );

  setTimeout(() => {
    postToTelegram('/iost YOUR IOST ACCOUNT');
  }, 1000);
};

const postDappRanking = async () => {
  await renderRanking();

  postImage(
    "./rank.png",
    "Dapp.com Ranking\n\nCheck out our stats and leave a review at: https://www.dapp.com/dapp/blockarcade"
  );
};

const processData = data => {
  const lines = data.toString("utf8").split("\n");
  lines.forEach(line => {
    if (line.charAt(0) !== '{') {
      return 'not a game';
    }

    try {
      const parsedLine = JSON.parse(line);
      const parsedData = JSON.parse(parsedLine.result.event.data);
      console.log(parsedData.status);
      const jackpot = parsedData.amount > 10 ? "major" : "mini";
      if (parsedData.status === "jackpotWin") {
        // Prevent double reporting.
        if (!reportedBets.has(parsedData.paid)) {
          reportedBets.set(parsedData.paid, true);
          postToTelegram(
            `*${
            parsedData.player
            }* just went for the *${jackpot} jackpot* and won\n*${JSON.parse(
              parsedData.paid
            ).map((paid) => {
              const [amount, token] = paid.split(' ');
              return `${Number(amount).toFixed(2)} ${token.toUpperCase()}`;
            }).join("\n")} *\n\nCongratulations ${parsedData.player}!`
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
};

const processQRData = data => {
  const lines = data.toString("utf8").split("\n");
  lines.forEach(line => {
    if (line.charAt(0) !== '{') {
      return 'not a game';
    }

    try {
      const parsedLine = JSON.parse(line);
      const parsedData = JSON.parse(parsedLine.result.event.data);
      console.log(parsedData);

      if (typeof parsedData.player === 'undefined') {
        throw 'not a raffle';
      }
      postToTelegram(
        `*${parsedData.player}* just won *${parsedData.amount} $TIX* from the ${parsedData.raffle} Quantum Raffle!\n\nPlay now at: https://blockarca.de/qr`
      );

    } catch (e) {
      console.log(e);
    }
  });
};

const processMessages = data => {
  const lines = JSON.parse(data.toString("utf8"));
  const changes = new Map();
  const waxChanges = new Map();
  if (!lines.result) {
    return;
  }

  lines.result.forEach(line => {
    lastMessageId = line.update_id;

    // TODO: Might need to modify this for WAX.
    // if (line.message && typeof line.message.new_chat_members !== "undefined") {
    //   console.log(line.message.new_chat_members);
    //   postInstructionsToTelegram(line.message.new_chat_members[0].username);
    //   return;
    // }


    try {
      const room = `@${line.message.chat.username}`;
      if (room !== "@blockarcade") {
        return;
      }

      const user = line.message.from.username;

      if (user) {
        activedb.put(user.trim(), JSON.stringify({ date: line.message.date }));
        console.log(`Marking ${user} as active!`);
      }

      const [command, args] = line.message.text
        .replace("@BlockArcadeBot", "")
        .replace("@", "")
        .replace("@null", "")
        .split(" ");
      switch (command.toLowerCase()) {
        case "/iost":
          if (args) {
            if (!user) {
              postToTelegram(
                "Please set a Telegram username before interacting with our bot! https://telegram.org/faq#q-what-are-usernames-how-do-i-get-one"
              );
            } else {
              if (!isNaN(args.charAt(0))) {
                postToTelegram(
                  "IOST account can not start with a number, sorry!",
                  undefined,
                  false,
                  line.message.message_id
                );
              } else if (!validIOSTAccount(args)) {
                postToTelegram(
                  "Invalid IOST account",
                  undefined,
                  false,
                  line.message.message_id
                );
              } else {
                changes.set(user, {
                  username: args,
                  message_id: line.message.message_id,
                  room,
                });
              }
            }

            deleteMessage("@blockarcade", line.message.message_id);
          } else {
            postInstructionsToTelegram(user);
            deleteMessage("@blockarcade", line.message.message_id);
          }
          break;
        case "/wax":
          if (args) {
            if (!user) {
              postToTelegram(
                "Please set a Telegram username before interacting with our bot! https://telegram.org/faq#q-what-are-usernames-how-do-i-get-one"
              );
            } else {
              waxChanges.set(user, {
                username: args,
                message_id: line.message.message_id,
                room,
              });
            }

            deleteMessage("@blockarcade", line.message.message_id);
          } else {
            postWAXInstructionsToTelegram(user);
            deleteMessage("@blockarcade", line.message.message_id);
          }
          break;
        case "/jackpot":
          postJackpotToTelegram();
          deleteMessage("@blockarcade", line.message.message_id);
          break;
        case "/check":
          activedb.get(line.message.from.username, async (err) => {
            if (err) {
              postToTelegram(
                "You're not on the list!",
                undefined,
                false,
                line.message.message_id
              );
            } else {
              const airdropped = await getUsers();
              let leaderboard;
              
              try {
              leaderboard = await new Promise((resolve) => {
                iostPOSTRequest(
                  "/getContractStorage",
                  {
                    id: "Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5",
                    key: 'issuedTIX',
                    field: airdropped.get(`@${line.message.from.username}`),
                    by_longest_chain: true,
                  },
                  (_, response) => {
                    resolve(JSON.parse(response).data);
                  });
              })
              } catch (e) {
                postToTelegram(
                  `Error processing request, I'm a bad robot 🤕`,
                  undefined,
                  false,
                  line.message.message_id
                );
              }
              let issued = false;

              if (leaderboard !== 'null') {
                issued = true;
              }

              if (!issued) {
                postToTelegram(
                  `You need to play a game this week to be included ${line.message.from.username}!`,
                  undefined,
                  false,
                  line.message.message_id
                );
              } else {
                postToTelegram(
                  `You're on the list ${line.message.from.username}!`,
                  undefined,
                  false,
                  line.message.message_id
                );
              }
            }
          });
          break;
        case "/airdrop":
          postInstructionsToTelegram();
          deleteMessage("@blockarcade", line.message.message_id);
          break;
        case "/vote":
          postVotesToTelegram();
          deleteMessage("@blockarcade", line.message.message_id);
          break;
        case "/tix":
          postTixPriceToTelegram();
          break;
        case "/rank":
          postDappRanking();
          deleteMessage("@blockarcade", line.message.message_id);
          break;
        case "/info":
          // postToTelegram(
          //   'Welcome! Learn more about BlockArcade here: https://telegra.ph/Welcome-to-BlockArcade-12-08-2',
          //   undefined,
          //   false,
          //   undefined,
          //   false,
          // );
          postWelcomeMessage(welcomeText);
          deleteMessage("@blockarcade", line.message.message_id);
          break;
        case "/count":
          deleteMessage("@blockarcade", line.message.message_id);
          postRegisteredUsers();
          break;
        case "/leaderboard":
          deleteMessage("@blockarcade", line.message.message_id);
          postLeaderboard();
          break;
        case "/rfl":
          deleteMessage("@blockarcade", line.message.message_id);
          postTopRFL();
          break;
        case "/jpt":
          deleteMessage("@blockarcade", line.message.message_id);
          postTopJPT();
          break;
        case "/qr":
          deleteMessage("@blockarcade", line.message.message_id);
          postQRTickets();
          break;
        case "/waxleaderboard":
          deleteMessage("@blockarcade", line.message.message_id);
          postWAXLeaderboard();
          break;
        case "/globalleaderboard":
          deleteMessage("@blockarcade", line.message.message_id);
          postGlobalLeaderboard();
          break;
        case "/vip":
          deleteMessage("@blockarcade", line.message.message_id);
          postVIPLeaderboard();
          break;
        case "/viptotal":
          deleteMessage("@blockarcade", line.message.message_id);
          postVIPTotal();
          break;
        case "/cr":
          deleteMessage("@blockarcade", line.message.message_id);
          postCRLeaderboard();
          break;
        case "/winners":
          postLeaderboardWinners();
          break;
        default:
          console.log("unreconized command", command);
      }


      changes.forEach((change, user) => {
        console.log(user, change);
        const record = new Promise((resolve) => {
          userdb.get(user, async (err, value) => {
            if (err) {
              resolve({});
              return;
            }

            resolve(value);
          });
        });
        postToTelegram(
          `Thanks for signing up @${user}! Your IOST account is registered and we deleted your message.`,
          changes.room,
          false
        );
        userdb.put(user, JSON.stringify({ ...record, iostAccount: change.username }));
      });

      waxChanges.forEach((change, user) => {
        console.log(user, change);
        const record = new Promise((resolve) => {
          userdb.get(user, async (err, value) => {
            if (err) {
              resolve({});
              return;
            }

            resolve(value);
          });
        });
        postToTelegram(
          `Thanks for signing up @${user}! Your WAX account is registered and we deleted your message.`,
          changes.room,
          false
        );
        userdb.put(user, JSON.stringify({ ...record, waxAccount: change.username }));
      });

    } catch (e) {
      console.log(e);
    }
  });
};

const waitForRequests = callback => {
  const options = {
    hostname: '159.89.128.94',
    port: 30001,
    path: "/subscribe",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, res => {
    let data = "";
    res.on("data", d => {
      data += d;
    });

    res.on("end", () => {
      processData(data);
      setTimeout(waitForRequests, 1000);
    });
  });

  req.on("error", error => {
    console.error(error);
  });

  req.write(data);
  req.end();
};

const waitForQRRequests = callback => {
  const options = {
    hostname: '159.89.128.94',
    port: 30001,
    path: "/subscribe",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": qrData.length,
    },
  };

  const req = http.request(options, res => {
    let temp = "";
    res.on("data", d => {
      temp += d;
    });

    res.on("end", () => {
      processQRData(temp);
      setTimeout(waitForQRRequests, 1000);
    });
  });

  req.on("error", error => {
    console.error(error);
    // callback();
  });

  req.write(qrData);
  req.end();
};

const waitForBotMessage = () => {
  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/getUpdates?offset=${lastMessageId + 1}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = https.request(options, res => {
    let data = "";
    res.on("data", d => {
      data += d;
    });

    res.on("end", () => {
      processMessages(data);
      setTimeout(waitForBotMessage, 1000);
    });
  });

  req.on("error", error => {
    console.error(error);
    callback();
  });

  req.write(data);
  req.end();
};


// Send waitForRequests as the callback causing a loop.
waitForRequests();
// waitForQRRequests();
watchWAX();
waitForCRRequests();
waitForBotMessage();


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
