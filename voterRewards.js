const fetch = require('node-fetch');
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;

const rewardSplit = 0.25;

const IOSTABC_API_KEY = process.env.IOSTABC_API_KEY;

const votesAPI = `https://api.iostabc.com/api/?apikey=${IOSTABC_API_KEY}&module=producer&action=get-producer-voter&producer=blockarcade`;
const totalVotesAPI = `https://api.iostabc.com/api/?apikey=${IOSTABC_API_KEY}&module=producer&action=get-producer-detail&producer=blockarcade`;

const rewards = new Map();

const rewardVoters = () => {
  fetch('https://www.iostabc.com/api/dividend/blockarcade?page=1&size=1')
    .then(res => res.json())
    .then(json => {
      const rewards = json.dividendlist[0].amount;
      return Math.floor(rewards * rewardSplit);
    })
    .then((amountToSplit) => {
      return fetch(totalVotesAPI)
        .then(res => res.json())
        .then(json => {
          const totalVotes = json.data.votes;
          return fetch(votesAPI)
            .then(res => res.json())
            .then(res => res.data.voters)
            .then((allVoters) => {
              allVoters.forEach(voter => {
                const voteAmount = voter.votes;
                const rewardSplit = (amountToSplit / (totalVotes / voteAmount)).toFixed(5);
                rewards.set(voter.account, rewardSplit);
              });
              
              rewards.forEach((amount, account) => {
                console.log(`/root/go/bin/iwallet --server 18.209.137.246:30002 --account blockarcade call Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5 "buyTIX" '[\"${amount}\", \"${account}\"]'`);
                exec(`/root/go/bin/iwallet --server 18.209.137.246:30002 --account blockarcade call Contract6sCJp6jz2cpUKVpV6utA1qP5BxFpHNYCYxC6VAMpkCq5 "buyTIX" '[\"${amount}\", \"${account}\"]'`, {stdio: 'inherit'});
                execSync('sleep 0.5');
              });
            });
        });
    })
}

rewardVoters();


// curl -X GET https://api.iostabc.com/api/?apikey=6cfb2325fd0d6ccbd2e61d5793769eb0&module=account&action=get-account-tx&account=blockarcade
// curl -X GET 
