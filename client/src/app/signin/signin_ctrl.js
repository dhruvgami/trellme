(function() {
  'use strict';

  angular.module('signin').
    controller('SigninCtrl', ['Config', 'UserSession', 'UserSettings', '$scope', '$window', '$location', function(Config, UserSession, UserSettings, $scope, $window, $location) {
      $scope.signin = function() {
        UserSession.
        login($scope.email, $scope.password).
        then(function() {
          UserSettings.load().then(function() {
            $location.path('/reports');
          });
        }, function(error) {
          $window.alert(error.message);
        });
      };
    }]);
}());
