(function() {
  'use strict';

  angular.module('trellme').
    controller('AppCtrl', ['UserSession', '$scope', '$location', '$window', function(UserSession, $scope, $location, $window) {
      $scope.session = UserSession;
      $scope.signout = function() {
        UserSession.
          logout().
          then(function() {
            $location.path('/');
          }, function(error) {
            $window.alert(error.message);
          });
      };
    }]);
}());
