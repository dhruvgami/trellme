(function() {
  'use strict';

  angular.module('trellme').
    controller('AppCtrl', ['Session', '$scope', '$location', '$window', function(Session, $scope, $location, $window) {
      $scope.session = Session;
      $scope.signout = function() {
        Session.
          logout().
          then(function() {
            $location.path('/signin');
          }, function(error) {
            $window.alert(error.message);
          });
      };
    }]);
}());
