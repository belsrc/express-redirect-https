'use strict';

const urlParse = require('url').parse;
const extend   = require('util')._extend;


/**
 * @module
 */
module.exports = function(options) {
  options = options || {};

  let defaults = {
    allowProtoHeader: false,
    allowAzureHeader: false,
    httpsPort: 443,
    message: 'Use HTTPS when submitting data'
  };

  let opts = extend(defaults, options);

  return function(request, response, next) {
    let method = request.method;
    let protoHeader = request.get('x-forwarded-proto');
    let azureHeader = request.get('x-arr-ssl');
    let isSecure = request.secure || (opts.allowProtoHeader && protoHeader === 'https') || (opts.allowAzureHeader && azureHeader);

    if(!isSecure) {
      if(method !== 'GET' && method !== 'HEAD') {
        return response.status(403).send(opts.message);
      }

      let original = urlParse(request.protocol + '://' + request.header('Host') + request.originalUrl);
      let url = 'https://' +  original.hostname + (opts.httpsPort == 443 ? '' : (':' + opts.httpsPort)) + request.originalUrl;

      return response.redirect(301, url);
    }

    return next();
  };
};
