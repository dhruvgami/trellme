(function() {
  'use strict';

  angular.module('signin').
    controller('SigninCtrl', ['Config', 'UserSession', '$scope', '$window', '$location', function(Config, UserSession, $scope, $window, $location) {
      $scope.signin = function() {
        UserSession.
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
