const https = require('https');
const fs = require('fs');
const request = require('request');
const room = '@blockarcade';

const postImage = (file, caption, chatId = room) => {
  request.post({
    url: `https://api.telegram.org/${process.env.TELEGRAM_BOT}/sendPhoto?chat_id=${encodeURIComponent(chatId)}&caption=${encodeURIComponent(caption)}`,
    formData: {
        photo: fs.createReadStream(file),
        filetype: 'png',
        filename: 'render.png',
    },
}, function(error, response, body) {
    console.log(body);
});
};

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

const postToTelegram = (text, roomToPost = room, markdown = true, reply_to_message_id, disablePreview = true) => {
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
    path: `/${process.env.TELEGRAM_BOT}/sendMessage?chat_id=${encodeURIComponent(roomToPost)}&text=${encodeURIComponent(text)}${markdownLine}${replyLine}&disable_web_page_preview=${disablePreview}`,
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

const postWelcomeMessage = (text) => {
  const keyboard = {
    "inline_keyboard": [
        [
            {"text": "Play StackWave", "url": "https://blockarca.de/stackwave"},
            {"text": "Play Quantum Raffle", "url": "https://blockarca.de/qr"},
            {"text": "Whitepaper", "url": "https://blockarcade.github.io/whitepaper/whitepaper.pdf"},
        ]
    ]
  };
  const data = JSON.stringify({
    chat_id: room,
    text: text,
    parse_mode: 'markdown',
    reply_markup: JSON.stringify(keyboard),
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/${process.env.TELEGRAM_BOT}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
  }

  const req = https.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d)
    })
  });

  req.on('error', (error) => {
    console.error(error)
  });

  req.write(data);
  req.end();
}

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

module.exports = { postToTelegram, postGifToTelegram, editMessage, deleteMessage, postImage, postWelcomeMessage };