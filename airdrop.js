const https = require('https');
const { postToTelegram, postGifToTelegram } = require('./telegram');
const iostRequest = require('./iost');
const data = JSON.stringify({ "topics": ["CONTRACT_RECEIPT"], "filter": { "contract_id": "ContractEnn4aBKJKwqQCsQiqFYovWWqm6vnA6xV1tT1YH5jKKpt" } });
const dateFormat = require('dateformat');
const cron = require('node-cron');
const level = require('level');
const exec = require('child_process').execSync;

const userdb = level('userdb');

const airdropAmount = 100;
const airdropped = new Map();
userdb.createReadStream()
  .on('data', function (data) {
    let username
    let user = {};
    try {
      username = `@${data.key.trim()}`;;
      user = JSON.parse(data.value);
    } catch (e) {
      console.log(e);
    }

    if (typeof user.iostUsername === 'undefined' || username === '@octalmage') {
      console.log('Skipping user:', user.iostUsername);
      return;
    }

    if (user.iostUsername) {
      airdropped.set(username, true);
      try {
        exec(`iwallet --account blockarcade call token.iost transfer '["tix","blockarcade", "${user.iostUsername}", "${airdropAmount}", "AIRDROP\!\!\!\! Play now at https://blockarca.de!"]`,{stdio: 'inherit'});
      } catch(e) {
        console.log(e);
      }
    }
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream ended')
    const keys = Array.from( airdropped.keys() );
    console.log(airdropped);
    const dropAmount = airdropAmount / airdropped.size;
    postToTelegram(`AIRDROPPED ${airdropAmount} TIX to ${keys.join(', ')}!!!!`);
  });


