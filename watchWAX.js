const { createDfuseClient, dynamicMessageDispatcher } = require("@dfuse/client");
const {
  postToTelegram,
} = require('./telegram');
if (process.env.DFUSE_API_KEY == null) {
  console.log("You must define an enviorment variable DFUSE_API_KEY containing your API key to run this sample.")
  process.exit(1)
}

global.fetch = require('node-fetch')
global.WebSocket = require('ws')

async function main() {
  const client = createDfuseClient({
    apiKey: process.env.DFUSE_API_KEY,
    network: 'mainnet.wax.dfuse.io'
  })

  await client.streamActionTraces(
    { accounts: "blockarcade1", action_names: "receipt" },
    dynamicMessageDispatcher({
      action_trace: (message) => {
        const parsedData = message.data.trace.act.data;

        postToTelegram(
          `*${parsedData.nm}* just went for the *jackpot* and won\n*
            ${parsedData.paid * 0.00000001} WTIX*\n\nCongratulations ${parsedData.nm}!`
        );
      }
    })
  )
}

module.exports = main;

