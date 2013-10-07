(function() {
  'use strict';

  describe('SinginCtrl', function() {
    var $httpBackend, $window, $scope, apiEndpoint;
    beforeEach(module('signin'));
    beforeEach(inject(function($injector) {
      $httpBackend    = $injector.get('$httpBackend');
      $scope          = $injector.get('$rootScope').$new();
      $window         = $injector.get('$window');
      var Config      = $injector.get('Config'),
          $controller = $injector.get('$controller');

      apiEndpoint = Config.apiEndpoint;

      $controller('SigninCtrl', {
        'Config' : Config,
        '$scope' : $scope
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('.singin', function() {
      it('should be defined in the scope', function() {
        expect($scope.signin).toBeDefined();
      });

      it('should POST user credentials to the server', function() {
        var user        = { email : 'john@doe.com', password : 'secret' },
            expectedUrl = [apiEndpoint, 'app', 'tokens'].join('/'),
            response    = { data : { token : 'abc123' } };
        $httpBackend.expectPOST(expectedUrl, user).respond(200, response);
        $scope.user = user;
        $scope.signin();
        $httpBackend.flush();
      });

      describe('given the server responds with success', function() {
        beforeEach(function() {
          var expectedUrl = [apiEndpoint, 'app', 'tokens'].join('/'),
              response    = { token : 'abc123' };
          $httpBackend.expectPOST(expectedUrl).respond(200, response);
          $scope.signin();
          $httpBackend.flush();
        });

        it('should assign the returned token to the scope', function() {
          expect($scope.token).toBe('abc123');
        });
      });

      describe('given the server responds with error', function() {
        it('should alert the user about the error', function() {
          spyOn($window, 'alert');
          $httpBackend.
            expectPOST([apiEndpoint, 'app', 'tokens'].join('/')).
            respond(403, 'some error message');
          $scope.signin();
          $httpBackend.flush();
          expect($window.alert).toHaveBeenCalledWith('Sign in failed: some error message');
        });
      });
    });
  });
}());
