const https = require('https');
const iostRequest = (endpoint, callback) => {
  const options = {
    hostname: 'api.iost.io',
    port: 443,
    path: endpoint,
    method: 'GET'
  }

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
      body += d;
    })

    res.on('end', () => {
      callback(null, body);
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.end();
};

const iostABCRequest = (endpoint, callback) => {
  const options = {
    hostname: 'www.iostabc.com',
    port: 443,
    path: endpoint,
    method: 'GET'
  }

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
      body += d;
    })

    res.on('end', () => {
      callback(null, body);
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.end();
};

module.exports = { iostRequest, iostABCRequest };