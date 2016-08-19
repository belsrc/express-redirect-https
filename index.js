'use strict';

// References for schemas taken from
// https://github.com/ahmadnassri/forwarded-http/blob/master/lib/schemas.js

const urlParse = require('url').parse;
const extend   = require('util')._extend;


/**
 * @module
 */
module.exports = function(options) {
  options = options || {};

  let defaults = {
    httpsPort: 443,
    message: 'Use HTTPS when submitting data',
    allowRFCHeader: false,
    allowForwardForHeader: false,
    allowNginxAltHeader: false,
    allowAzureHeader: false,
    allowZscalerHeader: false,
    allowFastlyHeader: false
  };

  let opts = extend(defaults, options);

  const parseRfcHeader = function(val) {
    if(!val) {
      return null;
    }

    let tmp = {};

    let split = val.split(/\s*;\s*/);

    for(let i=0, len=split.length; i < len; i++) {
      let innerTmp = split[i].split('=');
      if(innerTmp.length < 2) {
        return null;
      }

      tmp[innerTmp[0]] = innerTmp[1];
    }

    return tmp.proto || null;
  };

  const parseForwardedSslHeader = function(val) {
    return val === 'on' ? 'https' : null;
  };

  const parseFastlyHeader = function(val) {
    return ~['1', 'true'].indexOf(val) ? 'https' : null;
  };

  const parseAzureHeader = function(val) {
    return val ? 'https' : null;
  };

  const isSecure = function(request, headers) {
    return request.secure ||
      (opts.allowRFCHeader && headers.rfcHeader === 'https') ||
      (opts.allowForwardForHeader &&
          (headers.forwardedProtoHeader === 'https' || headers.forwardedSslHeader === 'https')) ||
      (opts.allowNginxAltHeader && headers.nginxHeader === 'https') ||
      (opts.allowZscalerHeader && headers.zscalerHeader === 'https') ||
      (opts.allowAzureHeader && headers.azureHeader === 'https') ||
      (opts.allowFastlyHeader && headers.fastlyHeader === 'https');
  };

  return function(request, response, next) {
    let method = request.method;
    let headers = {
      rfcHeader: parseRfcHeader(request.get('forwarded')),
      forwardedProtoHeader: request.get('x-forwarded-proto'),
      forwardedSslHeader: parseForwardedSslHeader(request.get('x-forwarded-ssl')),
      nginxHeader: request.get('x-real-proto'),
      azureHeader: parseAzureHeader(request.get('x-arr-ssl')),
      zscalerHeader: request.get('z-forwarded-proto'),
      fastlyHeader: parseFastlyHeader(request.get('fastly-ssl'))
    };

    if(!isSecure(request, headers)) {
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
