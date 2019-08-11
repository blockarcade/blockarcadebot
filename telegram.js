const https = require('https');
const room = '@blockarcade';

const editMessage = (messageId, text) => {
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/editMessageText?message_id=${encodeURIComponent(messageId)}&text=${encodeURIComponent(text)}`,
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

const deleteMessage = (chatId, messageId) => {
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/deleteMessage?chat_id=${encodeURIComponent(chatId)}&message_id=${encodeURIComponent(messageId)}`,
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

const postToTelegram = (text, roomToPost = room, markdown = true, reply_to_message_id) => {
  let replyLine = '';
  let markdownLine = '';

  if (typeof reply_to_message_id !== 'undefined') {
    replyLine = `&reply_to_message_id=${reply_to_message_id}`;
  }
  
  if (markdown === true){
    markdownLine = '&parse_mode=markdown';
  }

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/sendMessage?chat_id=${encodeURIComponent(roomToPost)}&text=${encodeURIComponent(text)}${markdownLine}${replyLine}&disable_web_page_preview=true`,
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

module.exports = { postToTelegram, postGifToTelegram, editMessage, deleteMessage };