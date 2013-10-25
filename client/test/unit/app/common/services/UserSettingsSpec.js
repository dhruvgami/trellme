(function() {
  'use strict';

  describe('Settings', function() {
    var app, $httpBackend, $rootScope, UserSettings, UserSession, Config;
    beforeEach(module('services.userSettings'));
    beforeEach(inject(function($injector) {
      SpecHelper.setup(this);
      app          = angular.module('services.userSettings');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope   = $injector.get('$rootScope');
      UserSettings = $injector.get('UserSettings');
      UserSession  = $injector.get('UserSession');
      Config       = $injector.get('Config');
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('dependencies', function() {
      it('should depend on services.userSession', function() {
        expect(app).toDependOn('services.userSession');
      });

      it('should depend on services.config', function() {
        expect(app).toDependOn('services.config');
      });
    });

    describe('#settingsUrl()', function() {
      it('should contain the Config.apiEndpoint', function() {
        expect(UserSettings.settingsUrl()).toContain(Config.apiEndpoint);
      });

      it('should contain /settings', function() {
        expect(UserSettings.settingsUrl()).toContain('/settings');
      });
    });

    describe('#load()', function() {
      it('should return a promise', function() {
        var result = UserSettings.load();
        expect(result).toBeAPromise();
      });

      describe('given the UserSession.loggedIn is false', function() {
        beforeEach(function() {
          UserSession.loggedIn = false;
        });

        it('should not hit the server', function() {
          inject(function($injector) {
            var $http = $injector.get('$http');
            spyOn($http, 'get').andCallThrough();
            UserSettings.load();
            expect($http.get).not.toHaveBeenCalled();
          });
        });

        it('should reject the promise with error message', function() {
          var errorMessage;
          UserSettings.load().then(null, function(err) {
            errorMessage = err.message;
          });
          $rootScope.$apply();
          expect(errorMessage).toBe('User not logged in');
        });
      });

      describe('given the UserSession.loggedIn is true', function() {
        beforeEach(function() {
          UserSession.loggedIn = true;
        });

        it('should GET settings from the server', function() {
          $httpBackend.expectGET(UserSettings.settingsUrl()).respond(200);
          UserSettings.load();
          $httpBackend.flush();
        });

        describe('given the server responds with success', function() {
          it('should resolve the promise passing along the retrieved settings', function() {
            var returnedValue,
                settings = { foo : 'foo', bar : 'bar' };
            $httpBackend.expectGET(UserSettings.settingsUrl()).respond(settings);
            UserSettings.load().then(function(s) {
              returnedValue = s;
            });
            $httpBackend.flush();
            expect(returnedValue).toEqual(settings);
          });
        });
      });
    });

    describe('#save()', function() {
      describe('given no params', function() {
        it('should raise an exception', function() {
          expect(function() {
            UserSettings.save();
          }).toThrow('Invalid "settings" param');
        });
      });

      it('should return a promise', function() {
        expect(UserSettings.save({})).toBeAPromise();
      });

      describe('given the UserSession.loggedIn is false', function() {
        beforeEach(function() {
          UserSession.loggedIn = false;
        });

        it('should not hit the server', function() {
          inject(function($injector) {
            var $http = $injector.get('$http');
            spyOn($http, 'post');
            UserSettings.save({});
            $rootScope.$apply();
            expect($http.post).not.toHaveBeenCalled();
          });
        });

        it('should reject the promise with error message', function() {
          var errorMessage;
          UserSettings.save({}).then(null, function(err) {
            errorMessage = err.message;
          });
          $rootScope.$apply();
          expect(errorMessage).toBe('User not logged in');
        });
      });

      describe('given the UserSession.loggedIn is true', function() {
        beforeEach(function() {
          UserSession.loggedIn = true;
        });

        it('should POST settings to the server', function() {
          var settings = { foo : 'foo', bar : 'bar' };
          $httpBackend.expectPOST(UserSettings.settingsUrl(), settings).respond(200);
          UserSettings.save(settings);
          $httpBackend.flush();
        });
      });
    }); /* end #save() */
  });
}());
