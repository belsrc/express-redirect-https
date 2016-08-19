'use strict';

const supertest = require('supertest');
const app = require('./init/server');
const agent = supertest.agent(app);
const assert = require('chai').assert;


suite('express-redirect-https', function() {
  suite('SIMPLE REDIRECT', function() {
    let methods = ['get', 'head'];

    methods.forEach(function(method) {

      test('redirects the requests [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('does NOT redirect for routes without [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/noredirect')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('redirects to correct location [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            assert.deepPropertyVal(response, 'headers.location', 'https://127.0.0.1:3043/');
            done();
          });
      });
    });
  });

  suite('ERROR ON POST, PUT & DELETE', function() {
    let methods = ['post', 'put', 'delete'];

    methods.forEach(function(method) {
      test('redirects to 403 [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .field('test', 'test data')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 403);
            done();
          });
      });

      test('has default error message [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .field('test', 'test data')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'text', 'Use HTTPS when submitting data');
            done();
          });
      });

      test('has user defined error message [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/message')
          .field('test', 'test data')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'text', 'This is a test error message');
            done();
          });
      });
    });
  });

  suite('RFC-7239 FORWARD HEADER', function() {
    let methods = ['get', 'head'];

    methods.forEach(function(method) {

      test('ignores RFC-7239 header if supplied but not trusted [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .set('forwarded', 'for=127.0.0.1; proto=https; by=127.0.0.1')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('trusts RFC-7239 header if supplied [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/rfc')
          .set('forwarded', 'for=127.0.0.1; proto=https; by=127.0.0.1')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('ignores RFC-7239 header if trusted but isn\'t https (empty string) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/rfc')
          .set('forwarded', '')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores RFC-7239 header if trusted but isn\'t https (http) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/rfc')
          .set('forwarded', 'for=127.0.0.1; proto=http; by=127.0.0.1')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

    });
  });

  suite('FORWARDED-FOR HEADER', function() {
    let methods = ['get', 'head'];

    methods.forEach(function(method) {

      test('ignores forwarded-for-proto header if supplied but not trusted [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .set('x-forwarded-proto', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores forwarded-for-ssl header if supplied but not trusted [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .set('x-forwarded-ssl', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('trusts forwarded-for-proto header if supplied [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/proto')
          .set('x-forwarded-proto', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('trusts forwarded-for-ssl header if supplied [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/proto')
          .set('x-forwarded-proto', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('ignores forwarded-for-proto header if trusted but isn\'t https (empty string) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/proto')
          .set('x-forwarded-proto', '')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores forwarded-for-ssl header if trusted but isn\'t https (empty string) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/proto')
          .set('x-forwarded-ssl', '')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores forwarded-for-proto header if trusted but isn\'t https (http) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/proto')
          .set('x-forwarded-proto', 'http')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores forwarded-for-ssl header if trusted but isn\'t https (no) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/proto')
          .set('x-forwarded-ssl', 'no')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

    });
  });

  suite('NGINX ALT FORWARD HEADER', function() {
    let methods = ['get', 'head'];

    methods.forEach(function(method) {

      test('ignores nginx alt header if supplied but not trusted [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .set('x-real-proto', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('trusts nginx alt header if supplied [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/nginx')
          .set('x-real-proto', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('ignores nginx alt header if trusted but isn\'t https (empty string) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/nginx')
          .set('x-real-proto', '')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores nginx alt header if trusted but isn\'t https (http) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/nginx')
          .set('x-real-proto', 'http')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

    });
  });

  suite('AZURE HEADER', function() {
    let methods = ['get', 'head'];

    methods.forEach(function(method) {

      test('ignores azure header if supplied but not trusted [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .set('x-arr-ssl', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('trusts azure header if supplied [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/azure')
          .set('x-arr-ssl', '2048|256|C=US, O=DigiCert Inc, OU=www.digicert.com, CN=DigiCert SHA2 High Assurance Server CA|C=US, S=WI')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('ignores azure header if trusted but isn\'t https (empty string) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/azure')
          .set('x-arr-ssl', '')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

    });
  });

  suite('ZSCALER HEADER', function() {
    let methods = ['get', 'head'];

    methods.forEach(function(method) {

      test('ignores zscaler header if supplied but not trusted [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .set('z-forwarded-proto', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('trusts zscaler header if supplied [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/zscaler')
          .set('z-forwarded-proto', 'https')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('ignores zscaler header if trusted but isn\'t https (empty string) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/zscaler')
          .set('z-forwarded-proto', '')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores zscaler header if trusted but isn\'t https (http) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/zscaler')
          .set('z-forwarded-proto', 'http')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

    });
  });

  suite('FASTLY HEADER', function() {
    let methods = ['get', 'head'];

    methods.forEach(function(method) {

      test('ignores fastly header if supplied but not trusted [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/')
          .set('fastly-ssl', 'true')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('trusts fastly header if supplied (value of "true") [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/fastly')
          .set('fastly-ssl', 'true')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('trusts fastly header if supplied (value of "1") [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/fastly')
          .set('fastly-ssl', '1')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 200);
            done();
          });
      });

      test('ignores fastly header if trusted but isn\'t https (empty string) [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/fastly')
          .set('fastly-ssl', '')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores fastly header if trusted but isn\'t https (http, value of "false") [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/fastly')
          .set('fastly-ssl', 'false')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

      test('ignores fastly header if trusted but isn\'t https (http, value of "0") [' + method.toUpperCase() + ']', function(done) {
        agent[method]('/fastly')
          .set('fastly-ssl', '0')
          .end(function(error, response) {
            if(error) {
              return done(error);
            }

            assert.propertyVal(response, 'statusCode', 301);
            done();
          });
      });

    });
  });
});
