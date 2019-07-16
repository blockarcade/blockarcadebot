const https = require('https');
const { postToTelegram, postGifToTelegram } = require('./telegram');
const iostRequest = require('./iost');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });
const dateFormat = require('dateformat');
const cron = require('node-cron');
const level = require('level');
const exec = require('child_process').execSync;

const userdb = level('userdb');

const airdropAmount = 10;
const airdropped = [];
userdb.createReadStream()
  .on('data', function (data) {
    const username = `@${data.key.trim()}`;
    const user = JSON.parse(data.value);
    if (user.iostUsername === 'octalmage') {
      return;
    }
    airdropped.push(username);
    console.log(`Airdropping to ${$username}!`);
    exec(`iwallet --account blockarcade call token.iost transfer '["tix","blockarcade", "${user.iostUsername}", "${airdropAmount}", "AIRDROP!!!! Play now at https://blockarca.de!"]`,{stdio: 'inherit'})
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream ended')
    postToTelegram(`AIRDROPPED ${airdropAmount} TIX to ${airdropped.join(', ')}!!!!`);
  });


