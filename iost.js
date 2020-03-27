const https = require('https');
const http = require('http');

const iostRequest = (endpoint, callback) => {
  const options = {
    hostname: '159.89.128.94',
    port: 30001,
    path: endpoint,
    method: 'GET'
  }

  const req = http.request(options, (res) => {
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

const iostPOSTRequest = (endpoint, data, callback) => {
  const stringData = JSON.stringify(data);

  const options = {
    hostname: '159.89.128.94',
    port: 30001,
    method: 'POST',
    path: endpoint,
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
      body += d;
    });
    res.on('end', () => {
      callback(null, body);
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.write(stringData);
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

const waxRequest = (endpoint, data, callback) => {
  const stringData = JSON.stringify(data);

  const options = {
    hostname: 'chain.wax.io',
    port: 443,
    method: 'POST',
    path: endpoint,
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
      body += d;
    });
    res.on('end', () => {
      callback(null, body);
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.write(stringData);
  req.end();
};

module.exports = { iostRequest, iostABCRequest, iostPOSTRequest, waxRequest };
