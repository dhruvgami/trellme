(function() {
  'use strict';

  describe('AppCtrl', function() {
    var Session, $scope;
    beforeEach(module('trellme'));
    beforeEach(inject(function($injector) {
      $scope          = $injector.get('$rootScope').$new();
      Session         = $injector.get('Session');
      var $controller = $injector.get('$controller');
      $controller('AppCtrl', {
        'Session' : Session,
        '$scope'  : $scope
      });
    }));

    it('should expose the Session data to the scope', function() {
      expect($scope.session).toBe(Session);
    });
  });
}());
