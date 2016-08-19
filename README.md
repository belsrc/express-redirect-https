# express-redirect-https

Simple middleware that redirects `GET` and `HEAD` requests to `https://` and sends a `403` for `POST`, `PUT`, `DELETE`, etc.

### Install
``` bash
$ npm install --save express-redirect-https
```

### Options

##### httpsPort
Defaults to `443`. The `https://` port to use in the redirect.

##### message
Defaults to `Use HTTPS when submitting data`. The message passed with the `403` when submitting data over `http://`.

##### allowRFCHeader
Defaults to `false`. Whether or not to allow the `forwarded` RFC 7239 header.

##### allowForwardForHeader
Defaults to `false`. Whether or not to allow the `x-forwarded-proto` header.

##### allowNginxAltHeader
Defaults to `false`. Whether or not to allow the `x-real-proto` header.

##### allowAzureHeader
Defaults to `false`. Whether or not to allow the `x-arr-ssl` header.

##### allowZscalerHeader
Defaults to `false`. Whether or not to allow the `z-forwarded-proto` header.

##### allowFastlyHeader
Defaults to `false`. Whether or not to allow the `fastly-ssl` header.


### Example
``` javascript
var express = require('express');
var app     = express();
var http    = require('http');
var https   = require('https');
var fs      = require('fs');

var sslOptions  = {
  key: fs.readFileSync('./ssl/privatekey.pem'),
  cert: fs.readFileSync('./ssl/certificate.pem')
};

var server    = http.createServer(app);
var sslServer = https.createServer(sslOptions, app);

let redirectHttps = require('express-redirect-https');
let redirectOptions = {
  allowForwardForHeader: true,
  httpsPort: 3043
};


// For all routes
app.use(redirectHttps(redirectOptions));
app.get('/', function(request, response, next) {
  response.send('HTTPS ALL THE THINGS');
});


// Or for a single
app.get('/', redirectHttps(redirectOptions), function(request, response, next) {
  response.send('HTTPS ALL THE THINGS');
});


server.listen(3000);
sslServer.listen(3043);
```

### Testing

Navigate to the `./test/ssl/` directory and generate keys for the ssl test server to use.

``` bash
openssl genrsa -out privatekey.pem 1024
openssl req -new -key privatekey.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

Then run `npm run test`.

### License

Headgear is licensed under the MIT license.

Copyright (c) 2016 Bryan Kizer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
