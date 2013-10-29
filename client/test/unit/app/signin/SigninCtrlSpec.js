(function() {
  'use strict';

  describe('SinginCtrl', function() {
    var UserSession, UserSettings, $q, $rootScope, $window, $location, $scope, apiEndpoint;
    beforeEach(module('signin'));
    beforeEach(inject(function($injector) {
      UserSession     = $injector.get('UserSession');
      UserSettings    = $injector.get('UserSettings');
      $q              = $injector.get('$q');
      $rootScope      = $injector.get('$rootScope');
      $window         = $injector.get('$window');
      $location       = $injector.get('$location');
      $scope          = $rootScope.$new();
      var Config      = $injector.get('Config'),
          $controller = $injector.get('$controller');

      apiEndpoint = Config.apiEndpoint;

      $controller('SigninCtrl', {
        'Config'      : Config,
        'UserSession' : UserSession,
        '$scope'      : $scope,
        '$window'     : $window
      });

    }));

    describe('.signin', function() {
      it('should be defined in the scope', function() {
        expect($scope.signin).toBeDefined();
      });

      it('should call UserSession.login with email and password', function() {
        $scope.email    = 'john@doe.com';
        $scope.password = 'foobar';
        spyOn(UserSession, 'login').andCallThrough();
        $scope.signin();
        expect(UserSession.login).toHaveBeenCalledWith('john@doe.com', 'foobar');
      });

      describe('given the UserSession.login service resolves', function() {
        beforeEach(function() {
          var deferred = $q.defer();
          deferred.resolve('yay!');
          spyOn($location, 'path');
          spyOn(UserSession, 'login').andReturn(deferred.promise);
          spyOn(UserSettings, 'load').andReturn(deferred.promise);
          $scope.email    = 'john@doe.com';
          $scope.password = 'secret';
          $scope.signin();
          $rootScope.$apply();
        });

        it('should call the UserSettings.load function', function() {
          expect(UserSettings.load).toHaveBeenCalled();
        });

        describe('given the UserSettings.load service resolves', function() {
          it('should redirect to /reports', function() {
            expect($location.path).toHaveBeenCalledWith('/reports');
          });
        });
      });

      describe('given the UserSession login serice rejects', function() {
        it('should alert the user about the error', function() {
          var deferred = $q.defer();
          deferred.reject({ message  : 'we have failed, master' });
          spyOn(UserSession, 'login').andReturn(deferred.promise);
          spyOn($window, 'alert');
          $scope.email    = 'john@doe.com';
          $scope.password = 'foobar';
          $scope.signin();
          $rootScope.$apply();
          expect($window.alert).toHaveBeenCalledWith('we have failed, master');
        });
      });
    });
  });
}());
