(function() {
  'use strict';

  angular.
    module('resetPassword').
    controller('ResetPasswordCtrl', ['$routeParams', '$scope', 'Password', function($params, $scope, Password) {
      $scope.tokenFound    = false;
      $scope.tokenNotFound = false;
      $scope.passwordReset = false;
      $scope.invalidToken  = false;

      if (_.isEmpty($params.token)) {
        $scope.invalidToken = true;
      } else {
        Password.
          tokenExists($params.token).
          then(function() {
            $scope.tokenFound    = true;
            $scope.tokenNotFound = false;
            $scope.invalidToken  = false;
          }, function(err) {
            $scope.tokenFound    = false;
            $scope.tokenNotFound = true;
            $scope.invalidToken  = false;
          });
      }

      $scope.resetPassword = function() {
        Password.
          resetPassword($scope.password, $scope.passwordConfirmation);
      };
    }]);
}());
