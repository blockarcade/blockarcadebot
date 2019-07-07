const https = require('https');
const room = '@blockarcade';

const postToTelegram = (text, roomToPost = room, reply_to_message_id) => {
  let replyLine = '';

  if (typeof reply_to_message_id !== 'undefined') {
    replyLine = `&reply_to_message_id=${reply_to_message_id}`;
  }

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/sendMessage?chat_id=${encodeURIComponent(roomToPost)}&text=${encodeURIComponent(text)}&parse_mode=markdown${replyLine}`,
    method: 'GET'
  }

  const req = https.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d)
    })
  });

  req.on('error', (error) => {
    console.error(error)
  });

  req.end();
};

const postGifToTelegram = (photo, caption) => {
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/sendAnimation?chat_id=${encodeURIComponent(room)}&animation=${encodeURIComponent(photo)}&caption=${encodeURIComponent(caption)}&parse_mode=markdown`,
    method: 'GET'
  }

  const req = https.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d)
    })
  });

  req.on('error', (error) => {
    console.error(error)
  });

  req.end();
};

module.exports = { postToTelegram, postGifToTelegram };