(function() {
  'use strict';

  angular.module('signin').
    controller('SigninCtrl', ['Config', 'Session', '$scope', '$window', '$location', function(Config, Session, $scope, $window, $location) {
      $scope.signin = function() {
        Session.
        login($scope.email, $scope.password).
        then(function(data) {
          $scope.token = data.token;
          $location.path('/reports');
        }, function(error) {
          $window.alert(error.message);
        });
      };
    }]);
}());
