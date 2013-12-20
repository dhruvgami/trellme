(function() {
  'use strict';

  describe('AppCtrl', function() {
    var UserSession, $httpBackend, $location, $window, $scope;
    beforeEach(module('trellme'));
    beforeEach(inject(function($injector) {
      UserSession     = $injector.get('UserSession');
      $httpBackend    = $injector.get('$httpBackend');
      $location       = $injector.get('$location');
      $window         = $injector.get('$window');
      $scope          = $injector.get('$rootScope').$new();
      var $controller = $injector.get('$controller');
      $controller('AppCtrl', {
        'UserSession' : UserSession,
        '$scope'      : $scope,
        '$location'   : $location,
        '$window'     : $window
      });

      $httpBackend.when('GET', UserSession.bootstrapUrl()).respond(401);
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should expose the UserSession data to the scope', function() {
      expect($scope.session).toBe(UserSession);
    });

    describe('.signout', function() {
      it('should call on UserSession.logout method', function() {
        $httpBackend.expectDELETE(UserSession.logoutUrl()).respond(200);
        UserSession.loggedIn = true;
        spyOn(UserSession, 'logout').andCallThrough();
        $scope.signout();
        $httpBackend.flush();
        expect(UserSession.logout).toHaveBeenCalled();
      });

      describe('given the logout service resolves', function() {
        it('should redirect the user to the login page', function() {
          spyOn($location, 'path');
          UserSession.loggedIn = true;
          $httpBackend.expectDELETE(UserSession.logoutUrl()).respond(200);
          $scope.signout();
          $httpBackend.flush();
          expect($location.path).toHaveBeenCalledWith('/');
        });
      });

      describe('given the logout service rejects', function() {
        it('should alert the user about the error', function() {
          UserSession.loggedIn = true;
          spyOn($window, 'alert');
          $httpBackend.expectDELETE(UserSession.logoutUrl()).respond(401, 'some error message');
          $scope.signout();
          $httpBackend.flush();
          expect($window.alert).toHaveBeenCalledWith('Sign out failed: some error message');
        });
      });
    });
  });
}());
