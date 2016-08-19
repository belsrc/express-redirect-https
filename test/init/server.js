'use strict';

const express = require('express');
const app     = module.exports = require('express')();
const http    = require('http');
const https   = require('https');
const fs      = require('fs');

const sslOptions  = {
  key: fs.readFileSync('./test/ssl/privatekey.pem'),
  cert: fs.readFileSync('./test/ssl/certificate.pem')
};

const server    = http.createServer(app);
const sslServer = https.createServer(sslOptions, app);

const redirect = require('./../../index');

app.get('/', redirect({ httpsPort: 3043 }), function(request, response, next) {
  response.status(200).end();
});

app.get('/noredirect', function(request, response, next) {
  response.status(200).end();
});

app.post('/', redirect({ httpsPort: 3043 }), function(request, response, next) {
  response.status(200).end();
});

app.put('/', redirect({ httpsPort: 3043 }), function(request, response, next) {
  response.status(200).end();
});

app.delete('/', redirect({ httpsPort: 3043 }), function(request, response, next) {
  response.status(200).end();
});

app.post('/message', redirect({ httpsPort: 3043, message: 'This is a test error message' }), function(request, response, next) {
  response.status(200).end();
});

app.put('/message', redirect({ httpsPort: 3043, message: 'This is a test error message' }), function(request, response, next) {
  response.status(200).end();
});

app.delete('/message', redirect({ httpsPort: 3043, message: 'This is a test error message' }), function(request, response, next) {
  response.status(200).end();
});

app.get('/proto', redirect({ httpsPort: 3043, allowForwardForHeader: true }), function(request, response, next) {
  response.status(200).end();
});

app.get('/rfc', redirect({ httpsPort: 3043, allowRFCHeader: true }), function(request, response, next) {
  response.status(200).end();
});

app.get('/nginx', redirect({ httpsPort: 3043, allowNginxAltHeader: true }), function(request, response, next) {
  response.status(200).end();
});

app.get('/azure', redirect({ httpsPort: 3043, allowAzureHeader: true }), function(request, response, next) {
  response.status(200).end();
});

app.get('/zscaler', redirect({ httpsPort: 3043, allowZscalerHeader: true }), function(request, response, next) {
  response.status(200).end();
});

app.get('/fastly', redirect({ httpsPort: 3043, allowFastlyHeader: true }), function(request, response, next) {
  response.status(200).end();
});


server.listen(3000);
sslServer.listen(3043);
