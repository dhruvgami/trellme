(function() {
  'use strict';

  describe('Session', function() {
    var Config, $httpBackend, Session, deps;
    beforeEach(module('services.session'));
    beforeEach(inject(function($injector) {
      Config       = $injector.get('Config');
      $httpBackend = $injector.get('$httpBackend');
      Session      = $injector.get('Session');
      deps         = angular.module('services.session').requires;
    }));

    describe('dependencies', function() {
      it('should depend on services.config', function() {
        expect(_(deps).contains('services.config')).toBe(true);
      });
    });

    describe('defaults', function() {
      describe('loggedIn', function() {
        it('should be false', function() {
          expect(Session.loggedIn).toBe(false);
        });
      });
    }); /* end defaults */

    describe('.loginUrl', function() {
      it('should contain api endpoint', function() {
        expect(Session.loginUrl()).toContain(Config.apiEndpoint);
      });
    });

    describe('.login', function() {
      describe('given no email', function() {
        it('should raise an exception', function() {
          expect(function() {
            Session.login();
          }).toThrow('missing email argument');

          expect(function() {
            Session.login('');
          }).toThrow('missing email argument');
        });
      });

      describe('given no password', function() {
        it('should raise an exception', function() {
          expect(function() {
            Session.login('foo', null);
          }).toThrow('missing password argument');

          expect(function() {
            Session.login('foo', '');
          }).toThrow('missing password argument');
        });
      });

      it('should return a promise', function() {
        var login = Session.login('email@email.org', 'secret');
        expect(login.then).toBeDefined();
        expect(typeof login.then).toBe('function');
      });

      it('should POST credentials to /login', function() {
        var url            = [Config.apiEndpoint, 'login'].join('/'),
            expectedParams = {
          email    : 'john@doe.com',
          password : 'secret'
        };
        $httpBackend.expectPOST(url, expectedParams).respond(200);
        Session.login('john@doe.com', 'secret');
        $httpBackend.flush();
      });

      describe('given the server responds with success', function() {
        beforeEach(function() {
          var url = [Config.apiEndpoint, 'login'].join('/');
          $httpBackend.expectPOST(url).respond(200);
        });

        it('should set loggedIn to true', function() {
          expect(Session.loggedIn).toBe(false);
          Session.login('foo@bar.com', 'secret');
          $httpBackend.flush();
          expect(Session.loggedIn).toBe(true);
        });
      });
    }); /* end .login */
  });
}());
