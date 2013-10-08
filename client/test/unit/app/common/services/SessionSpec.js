(function() {
  'use strict';

  describe('Session', function() {
    var Config, Session, deps, $httpBackend, $http;
    beforeEach(module('services.session'));
    beforeEach(inject(function($injector) {
      Config       = $injector.get('Config');
      $httpBackend = $injector.get('$httpBackend');
      $http        = $injector.get('$http');
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

      it('should point to /login', function() {
        expect(Session.loginUrl()).toContain('/login');
      });
    });

    describe('.logoutUrl', function() {
      it('should contain api endpoint', function() {
        expect(Session.logoutUrl()).toContain(Config.apiEndpoint);
      });

      it('should point to /logout', function() {
        expect(Session.logoutUrl()).toContain('/logout');
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

    describe('.logout', function() {
      describe('given loggedIn is false', function() {
        beforeEach(function() {
          Session.loggedIn = false;
        });

        it('should not DELETE to server', function() {
          spyOn($http, 'delete');
          Session.logout();
          expect($http.delete).not.toHaveBeenCalled();
        });

        it('should return undefined', function() {
          var logout = Session.logout();
          expect(logout).toBeUndefined();
        });
      });

      describe('given loggedIn is true', function() {
        beforeEach(function() {
          Session.loggedIn = true;
        });

        it('should DELETE to server', function() {
          var url = [Config.apiEndpoint, 'logout'].join('/');
          $httpBackend.expectDELETE(url).respond(200);
          Session.logout();
          $httpBackend.flush();
        });

        describe('given the server responds with success', function() {
          var logout;
          beforeEach(function() {
            var url = [Config.apiEndpoint, 'logout'].join('/');
            $httpBackend.expectDELETE(url).respond(200);
            logout = Session.logout();
            $httpBackend.flush();
          });

          it('should set loggedIn to false', function() {
            expect(Session.loggedIn).toBe(false);
          });

          it('should return a promise', function() {
            expect(logout.then).toBeDefined();
          });
        });

        describe('given the server responds with failur', function() {
          xit('should reject the promise', function() {
            
          });
        });
      });
    });
  });
}());
