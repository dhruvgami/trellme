(function() {
  'use strict';

  angular.module('signin').
    controller('SigninCtrl', ['Config', 'Session', '$scope', '$window', function(Config, Session, $scope, $window) {
      $scope.signin = function() {
        Session.
        login($scope.email, $scope.password).
        then(function(data) {
          $scope.token = data.token;
          // TODO: From here we should redirect to the report view.
        }, function(error) {
          $window.alert(error.message);
        });
      };
    }]);
}());
