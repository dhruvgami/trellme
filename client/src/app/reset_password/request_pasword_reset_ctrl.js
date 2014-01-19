(function() {
  'use strict';

  angular.
    module('resetPassword').
    controller('RequestPasswordResetCtrl', ['Password', '$window', '$scope', function(Password, $window, $scope) {
      $scope.emailSent     = false;
      $scope.emailNotFound = false;

      $scope.requestPasswordReset = function() {
        Password.
          requestPasswordReset($scope.email).
          then(function() {
            $scope.emailSent     = true;
            $scope.emailNotFound = false;
          }, function(err) {
            $scope.emailSent     = false;
            if (404 === err.code) {
              $scope.emailNotFound = 404 === err.code;
            } else {
              $window.alert(err.message);
            }
          });
      };
    }]);
}());
