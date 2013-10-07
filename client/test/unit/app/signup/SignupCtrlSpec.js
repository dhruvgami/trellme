(function() {
  'use strict';

  describe('SignupCtrl', function() {
    var $httpBackend, $window, $scope, apiEndpoint;
    beforeEach(module('signup'));
    beforeEach(inject(function($injector) {
      $window         = $injector.get('$window');
      $scope          = $injector.get('$rootScope').$new();
      $httpBackend    = $injector.get('$httpBackend');
      var Config      = $injector.get('Config'),
          $http       = $injector.get('$http'),
          $controller = $injector.get('$controller');
      $controller('SignupCtrl', {
        'Config'  : Config,
        '$window' : $window,
        '$scope'  : $scope,
        '$http'   : $http
      });

      apiEndpoint = Config.apiEndpoint;
      spyOn($window, 'open').andCallThrough();
      $httpBackend.
        when('POST', [apiEndpoint, 'app', 'users'].join('/')).
        respond(200);
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('.signup', function() {
      it('should call $window to create a popup', function() {
        $scope.signup();
        expect($window.open).toHaveBeenCalledWith('', 'OAuth Popup', 'height=800,width=800');
      });

      it('should assign the created popup to the scope', function() {
        expect($scope.poup).toBeUndefined();
        $scope.signup();
        expect($scope.popup).toBeDefined();
      });

      it('should POST user information to the server', function() {
        var user = {
          email            : 'john@doe.com',
          password         : 'secret',
          trellme_username : 'johnnydoe'
        };
        $scope.user = user;
        $httpBackend.
          expectPOST([apiEndpoint, 'app', 'users'].join('/'), user).
          respond(200);
        $scope.signup();
        $httpBackend.flush();
      });

      describe('given the server responds with success', function() {
        beforeEach(function() {
          $scope.user = {
            email            : 'john@doe.com',
            password         : 'secret',
            trellme_username : 'johnny'
          };
          var expectedUrl = [
            apiEndpoint,
            'app',
            'users',
          ].join('/');
          $httpBackend.expectPOST(expectedUrl).respond(200);
        });

        xit('should update the popup location to the OAuth authorization page', function() {
          $scope.signup();
          console.log($scope);
          $httpBackend.flush();
        });
      });

      describe('given the server responds with an error', function() {
        it('should be alerted to the user', function() {
          spyOn($window, 'alert');
          $httpBackend.expectPOST([apiEndpoint, 'app', 'users'].join('/')).respond(500, 'some error');
          $scope.signup();
          $httpBackend.flush();
          expect($window.alert).toHaveBeenCalledWith('Sign up failed: some error');
        });
      });
    });
  });
}());
