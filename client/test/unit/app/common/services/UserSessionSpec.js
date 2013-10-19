(function() {
  'use strict';

  describe('UserSession', function() {
    var Config, UserSession, app, $httpBackend, $http;
    beforeEach(module('services.userSession'));
    beforeEach(inject(function($injector) {
      SpecHelper.setup(this);
      Config       = $injector.get('Config');
      $httpBackend = $injector.get('$httpBackend');
      $http        = $injector.get('$http');
      UserSession  = $injector.get('UserSession');
      app          = angular.module('services.userSession');
    }));

    describe('dependencies', function() {
      it('should depend on services.config', function() {
        expect(app).toDependOn('services.config');
      });
    });

    describe('defaults', function() {
      describe('loggedIn', function() {
        it('should be false', function() {
          expect(UserSession.loggedIn).toBe(false);
        });
      });
    }); /* end defaults */

    describe('.bootstrapUrl', function() {
      it('should be defined as a function', function() {
        expect(typeof UserSession.bootstrapUrl).toBe('function');
      });

      it('should contain api endpoint', function() {
        expect(UserSession.bootstrapUrl()).toContain(Config.apiEndpoint);
      });

      it('should point to /me', function() {
        expect(UserSession.bootstrapUrl()).toContain('/me');
      });
    });

    describe('.bootstrap', function() {
      it('should return a promise', function() {
        var bootstrap = UserSession.bootstrap();
        expect(bootstrap.then).toBeDefined();
        expect(typeof bootstrap.then).toBe('function');
      });

      it('should GET user info from the server', function() {
        var url = [Config.apiEndpoint, 'me'].join('/');
        $httpBackend.expectGET(url).respond(200);
        UserSession.bootstrap();
        $httpBackend.flush();
      });

      describe('given the server responds with success', function() {
        it('should set loggedIn to true', function() {
          UserSession.loggedIn = false;
          var url = [Config.apiEndpoint, 'me'].join('/');
          $httpBackend.expectGET(url).respond(200);
          UserSession.bootstrap();
          $httpBackend.flush();
          expect(UserSession.loggedIn).toBe(true);
        });
      });

      describe('given the server responds with failure', function() {
        var errorMessage;
        beforeEach(function() {
          UserSession.loggedIn = true;
          var url = [Config.apiEndpoint, 'me'].join('/');
          $httpBackend.expectGET(url).respond(401, 'Unauthenticated');
          UserSession.
            bootstrap().
            then(null, function(data) {
              errorMessage = data.message;
            });
          $httpBackend.flush();
        });

        it('should set loggedIn to false', function() {
          expect(UserSession.loggedIn).toBe(false);
        });

        it('should pass along error message', function() {
          expect(errorMessage).toBe('Session bootstrap failed: Unauthenticated');
        });
      });
    });

    describe('.loginUrl', function() {
      it('should contain api endpoint', function() {
        expect(UserSession.loginUrl()).toContain(Config.apiEndpoint);
      });

      it('should point to /login', function() {
        expect(UserSession.loginUrl()).toContain('/login');
      });
    });

    describe('.logoutUrl', function() {
      it('should contain api endpoint', function() {
        expect(UserSession.logoutUrl()).toContain(Config.apiEndpoint);
      });

      it('should point to /logout', function() {
        expect(UserSession.logoutUrl()).toContain('/logout');
      });
    });

    describe('.login', function() {
      describe('given no email', function() {
        it('should raise an exception', function() {
          expect(function() {
            UserSession.login();
          }).toThrow('missing email argument');

          expect(function() {
            UserSession.login('');
          }).toThrow('missing email argument');
        });
      });

      describe('given no password', function() {
        it('should raise an exception', function() {
          expect(function() {
            UserSession.login('foo', null);
          }).toThrow('missing password argument');

          expect(function() {
            UserSession.login('foo', '');
          }).toThrow('missing password argument');
        });
      });

      it('should return a promise', function() {
        var login = UserSession.login('email@email.org', 'secret');
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
        UserSession.login('john@doe.com', 'secret');
        $httpBackend.flush();
      });

      describe('given the server responds with success', function() {
        beforeEach(function() {
          var url = [Config.apiEndpoint, 'login'].join('/');
          $httpBackend.expectPOST(url).respond(200);
        });

        it('should set loggedIn to true', function() {
          expect(UserSession.loggedIn).toBe(false);
          UserSession.login('foo@bar.com', 'secret');
          $httpBackend.flush();
          expect(UserSession.loggedIn).toBe(true);
        });
      });
    }); /* end .login */

    describe('.logout', function() {
      describe('given loggedIn is false', function() {
        beforeEach(function() {
          UserSession.loggedIn = false;
        });

        it('should not DELETE to server', function() {
          spyOn($http, 'delete');
          UserSession.logout();
          expect($http.delete).not.toHaveBeenCalled();
        });

        it('should return undefined', function() {
          var logout = UserSession.logout();
          expect(logout).toBeUndefined();
        });
      });

      describe('given loggedIn is true', function() {
        beforeEach(function() {
          UserSession.loggedIn = true;
        });

        it('should DELETE to server', function() {
          var url = [Config.apiEndpoint, 'logout'].join('/');
          $httpBackend.expectDELETE(url).respond(200);
          UserSession.logout();
          $httpBackend.flush();
        });

        describe('given the server responds with success', function() {
          var logout;
          beforeEach(function() {
            var url = [Config.apiEndpoint, 'logout'].join('/');
            $httpBackend.expectDELETE(url).respond(200);
            logout = UserSession.logout();
            $httpBackend.flush();
          });

          it('should set loggedIn to false', function() {
            expect(UserSession.loggedIn).toBe(false);
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
