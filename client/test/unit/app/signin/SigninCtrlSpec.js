(function() {
  'use strict';

  describe('SinginCtrl', function() {
    var Session, $httpBackend, $window, $scope, apiEndpoint;
    beforeEach(module('signin'));
    beforeEach(inject(function($injector) {
      Session         = $injector.get('Session');
      $httpBackend    = $injector.get('$httpBackend');
      $scope          = $injector.get('$rootScope').$new();
      $window         = $injector.get('$window');
      var Config      = $injector.get('Config'),
          $controller = $injector.get('$controller');

      apiEndpoint = Config.apiEndpoint;

      $controller('SigninCtrl', {
        'Config'  : Config,
        'Session' : Session,
        '$scope'  : $scope,
        '$window' : $window
      });

      $httpBackend.when('POST', Session.loginUrl()).respond(200);
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('.signin', function() {
      it('should be defined in the scope', function() {
        expect($scope.signin).toBeDefined();
      });

      it('should call Session.login with email and password', function() {
        $scope.email    = 'john@doe.com';
        $scope.password = 'foobar';
        spyOn(Session, 'login').andCallThrough();
        $scope.signin();
        expect(Session.login).toHaveBeenCalledWith('john@doe.com', 'foobar');
      });

      describe('given the Session login service resolves', function() {
        beforeEach(function() {
          $httpBackend.expectPOST(Session.loginUrl()).respond(200, { token : 'abc123' });
          $scope.email    = 'john@doe.com';
          $scope.password = 'secret';
          $scope.signin();
          $httpBackend.flush();
        });

        it('should assign the returned token to the scope', function() {
          expect($scope.token).toBe('abc123');
        });
      });

      describe('given the Session login serice rejects', function() {
        it('should alert the user about the error', function() {
          spyOn($window, 'alert');
          $httpBackend.
            expectPOST(Session.loginUrl()).
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
