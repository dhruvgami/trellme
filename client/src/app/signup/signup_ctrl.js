(function() {
  'use strict';

  angular.module('signup').
    controller('SignupCtrl', ['Config', '$window', '$scope', '$http', '$location', function(Config, $window, $scope, $http, $location) {
      $scope.signup = function(debug) {
        // TODO: Create the helper function in the model and call it from the
        //       controller.
        //$scope.signupu.tzdiff = tzdiff();

        // Do this first to block the popup-block.
        $scope.popup = $window.open('', 'OAuth Popup', "height=800,width=800");
        // TODO: Move this out of the controller (to a service/model).
        var postUrl = [Config.apiEndpoint, 'app', 'users'].join('/');
        $http.post(postUrl, $scope.user).
          success(function(data, status, headers, config) {
            var redirectUrl = [
              Config.apiEndpoint,
              'app',
              'auths',
              'request',
              $scope.user.email
            ].join('/');
            // TODO: Move all this popup thing to a directive.
            $scope.popup.location.replace(redirectUrl);
            var checkClose = setInterval(function() {
              $scope.$apply(function() {
                if ($scope.popup !== null) {
                  if ($scope.popup.closed) {
                    $scope.popup = null;
                    clearInterval(checkClose);
                    $location.path('/signin');
                  }
                }
              });
            }, 100);
          }).
          error(function(data, status, headers, config) {
            $window.alert(['Sign up failed:', data].join(' '));
          });
      };
    }]);
}());
