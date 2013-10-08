(function() {
  'use strict';

  describe('AppCtrl', function() {
    var Session, $httpBackend, $location, $window, $scope;
    beforeEach(module('trellme'));
    beforeEach(inject(function($injector) {
      Session         = $injector.get('Session');
      $httpBackend    = $injector.get('$httpBackend');
      $location       = $injector.get('$location');
      $window         = $injector.get('$window');
      $scope          = $injector.get('$rootScope').$new();
      var $controller = $injector.get('$controller');
      $controller('AppCtrl', {
        'Session'   : Session,
        '$scope'    : $scope,
        '$location' : $location,
        '$window'   : $window
      });
    }));

    it('should expose the Session data to the scope', function() {
      expect($scope.session).toBe(Session);
    });

    describe('.signout', function() {
      it('should call on Session.logout method', function() {
        Session.loggedIn = true;
        spyOn(Session, 'logout').andCallThrough();
        $scope.signout();
        expect(Session.logout).toHaveBeenCalled();
      });

      describe('given the logout service resolves', function() {
        it('should redirect the user to the login page', function() {
          spyOn($location, 'path');
          Session.loggedIn = true;
          $httpBackend.expectDELETE(Session.logoutUrl()).respond(200);
          $scope.signout();
          $httpBackend.flush();
          expect($location.path).toHaveBeenCalledWith('/signin');
        });
      });

      describe('given the logout service rejects', function() {
        it('should alert the user about the error', function() {
          Session.loggedIn = true;
          spyOn($window, 'alert');
          $httpBackend.expectDELETE(Session.logoutUrl()).respond(401, 'some error message');
          $scope.signout();
          $httpBackend.flush();
          expect($window.alert).toHaveBeenCalledWith('Sign out failed: some error message');
        });
      });
    });
  });
}());
