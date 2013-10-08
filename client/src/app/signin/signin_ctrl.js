(function() {
  'use strict';

  angular.module('signin').
    controller('SigninCtrl', ['Config', '$scope', '$http', '$window', function(Config, $scope, $http, $window) {
      $scope.signin = function() {
        // Workaround to circumvent a strange error
        delete $http.defaults.headers.common['X-Requested-With'];

        // Call /app/tokens API
        var url = [Config.apiEndpoint, 'app', 'tokens'].join('/');
        $http.post(url, $scope.user).
          success(function(data, status, headers, config) {
            // TODO: From here we should redirect to the report view.
            $scope.token = data.token;
          }).
        error(function(data, status, headers, config) {
          $window.alert(['Sign in failed:', data].join(' '));
        });
      };
    }]);
}());
