const https = require('https');
const { postToTelegram, postGifToTelegram } = require('./telegram');
const iostRequest = require('./iost');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });
const dateFormat = require('dateformat');
const cron = require('node-cron');
const level = require('level');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const userdb = level('userdb');

const airdropAmount = 5000;
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

    const dropAmount = Math.floor(airdropAmount / airdropped.size);

    try {
      keys.forEach(async (user) => {
        // console.log('user', user);
        // console.log('key', airdropped.get(user));
        exec(`iwallet --account blockarcade -s 18.209.137.246:30002 call token.iost transfer '["tix","blockarcade", "${airdropped.get(user)}", "${dropAmount}", "AIRDROP!!!! Play now at https://blockarca.de!"]'`,{stdio: 'inherit'});
        execSync('sleep 1');
      });
   } catch (e) {
     console.log(e);
   } 
  //  console.log(`AIRDROPPED ${dropAmount} TIX to ${keys.join(', ')}!!!!`);
    postToTelegram(`AIRDROPPED ${dropAmount} $TIX to ${keys.join(', ')}!!!!`, undefined, false);
  });


