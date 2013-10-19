(function() {
  'use strict';

  describe('SinginCtrl', function() {
    var UserSession, $httpBackend, $window, $location, $scope, apiEndpoint;
    beforeEach(module('signin'));
    beforeEach(inject(function($injector) {
      UserSession     = $injector.get('UserSession');
      $httpBackend    = $injector.get('$httpBackend');
      $scope          = $injector.get('$rootScope').$new();
      $window         = $injector.get('$window');
      $location       = $injector.get('$location');
      var Config      = $injector.get('Config'),
          $controller = $injector.get('$controller');

      apiEndpoint = Config.apiEndpoint;

      $controller('SigninCtrl', {
        'Config'      : Config,
        'UserSession' : UserSession,
        '$scope'      : $scope,
        '$window'     : $window
      });

      $httpBackend.when('POST', UserSession.loginUrl()).respond(200);
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

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

      describe('given the UserSession login service resolves', function() {
        beforeEach(function() {
          spyOn($location, 'path');
          $httpBackend.expectPOST(UserSession.loginUrl()).respond(200, { token : 'abc123' });
          $scope.email    = 'john@doe.com';
          $scope.password = 'secret';
          $scope.signin();
          $httpBackend.flush();
        });

        it('should assign the returned token to the scope', function() {
          expect($scope.token).toBe('abc123');
        });

        it('should redirect to /reports', function() {
          expect($location.path).toHaveBeenCalledWith('/reports');
        });
      });

      describe('given the UserSession login serice rejects', function() {
        it('should alert the user about the error', function() {
          spyOn($window, 'alert');
          $httpBackend.
            expectPOST(UserSession.loginUrl()).
            respond(403, 'some error message');
          $scope.email    = 'john@doe.com';
          $scope.password = 'foobar';
          $scope.signin();
          $httpBackend.flush();
          expect($window.alert).toHaveBeenCalledWith('Sign in failed: some error message');
        });
      });
    });
  });
}());
