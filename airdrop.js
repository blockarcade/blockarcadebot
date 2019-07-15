const https = require('https');
const { postToTelegram, postGifToTelegram } = require('./telegram');
const iostRequest = require('./iost');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });
const dateFormat = require('dateformat');
const cron = require('node-cron');
const level = require('level');
const exec = require('child_process').execSync;

const userdb = level('userdb');

userdb.put('Not_traceable', JSON.stringify({iostUsername: 'mi_amor'}))
userdb.put('saifsolo', JSON.stringify({iostUsername: 'noypi'}))
userdb.put('butt47jk ', JSON.stringify({iostUsername: 'noypi'}))
userdb.put('ShnealKonspiracyKamp ', JSON.stringify({iostUsername: 'shneal'}))
userdb.put('jmntn619 ', JSON.stringify({iostUsername: 'jmntn619'}))


const airdropAmount = 1000;

userdb.createReadStream()
  .on('data', function (data) {
    const username = `@${data.key}`;
    const user = JSON.parse(data.value);
    console.log(`iwallet --account blockarcade call token.iost transfer '["tix","blockarcade", "${user.iostUsername}", "${airdropAmount}", "AIRDROP!!!! Play now at https://blockarca.de!"]'`)
    // exec(``,{stdio: 'inherit'})
    postToTelegram(`AIRDROPPED ${airdropAmount} TIX to ${username}!!!!`);
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream ended')
  });


