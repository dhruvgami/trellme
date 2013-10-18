(function() {
  'use strict';

  describe('SettingsCtrl', function() {
    var $q, $scope, UserSettings, $controller, $httpBackend, $rootScope;
    beforeEach(module('userSettings'));
    beforeEach(inject(function($injector) {
      var Session  = $injector.get('Session');
      $q           = $injector.get('$q');
      $rootScope   = $injector.get('$rootScope');
      UserSettings = $injector.get('UserSettings');
      $controller  = $injector.get('$controller');
      $httpBackend = $injector.get('$httpBackend');
      $scope       = $rootScope.$new();

      Session.loggedIn = true;
      spyOn(UserSettings, 'load').andCallThrough();
      $httpBackend.when('GET', UserSettings.settingsUrl()).respond(200);
      $controller('SettingsCtrl', {
        '$scope'       : $scope,
        'UserSettings' : UserSettings
      });
      $httpBackend.flush();
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should expose the #save() method on the scope', function() {
      expect($scope.save).toBeDefined();
      expect(_.isFunction($scope.save)).toBe(true);
    });

    it('shuold expose saveSucceeded variable as false on the scope', function() {
      expect($scope.saveSucceeded).toBeDefined();
      expect($scope.saveSucceeded).toBe(false);
    });

    it('shuold expose saveFailed variable as false on the scope', function() {
      expect($scope.saveFailed).toBeDefined();
      expect($scope.saveFailed).toBe(false);
    });

    it('should call UserSettings.load service', function() {
      expect(UserSettings.load).toHaveBeenCalled();
    });

    describe('given the UserSettings.load service resolves', function() {
      it('should assign the settings to the scope', function() {
        $httpBackend.expectGET(UserSettings.settingsUrl()).respond(200, { foo : 'bar' });
        $controller('SettingsCtrl', {
          '$scope'       : $scope,
          'UserSettings' : UserSettings
        });
        $httpBackend.flush();
        expect($scope.settings).toEqual({ foo : 'bar' });
      });
    });

    describe('#save()', function() {
      it('should call on the UserSettings.save method', function() {
        spyOn(UserSettings, 'save').andCallThrough();
        $httpBackend.expectPOST(UserSettings.settingsUrl()).respond(200);
        $scope.save();
        $httpBackend.flush();
        expect(UserSettings.save).toHaveBeenCalled();
      });

      describe('given the UserSettings.save service resolves', function() {
        beforeEach(function() {
          var deferred = $q.defer();
          deferred.resolve('yay');
          spyOn(UserSettings, 'save').andReturn(deferred.promise);
          $scope.saveSucceeded = false;
          $scope.saveFailed = true;
          $scope.save();
          $rootScope.$apply();
        });

        it('should set saveSucceeded to true', function() {
          expect($scope.saveSucceeded).toBe(true);
        });

        it('should set saveFailed to false', function() {
          expect($scope.saveFailed).toBe(false);
        });
      });

      describe('given the UserSettings.save service rejects', function() {
        beforeEach(function() {
          var deferred = $q.defer();
          deferred.reject('some nasty error');
          spyOn(UserSettings, 'save').andReturn(deferred.promise);
          $scope.saveSucceeded = true;
          $scope.saveFailed    = false;
          $scope.save();
          $rootScope.$apply();
        });

        it('should set saveSucceeded to false', function() {
          expect($scope.saveSucceeded).toBe(false);
        });

        it('should set saveFailed to true', function() {
          expect($scope.saveFailed).toBe(true);
        });
      });
    });
  });
}());
