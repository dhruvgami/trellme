(function() {
  'use strict';

  angular.module('signup').
    controller('SignupCtrl', ['Config', '$window', '$scope', '$http', function(Config, $window, $scope, $http) {
      $scope.signup = function() {
        // TODO: Create the helper function in the model and call it from the
        //       controller.
        //$scope.signupu.tzdiff = tzdiff();

        // Workaround to circumvent an strange error
        delete $http.defaults.headers.common['X-Requested-With'];

        // Do this first to block the popup-block.
        $scope.popup = $window.open('', 'OAuth Popup', "height=800,width=800");

        // Add timezone difference value to post data
        // Call /app/tokens DELETE API
        // TODO: Move this out of the controller (to a service/model).
        var postUrl = [Config.apiEndpoint, 'app', 'users'].join('/');
        $http.post(postUrl, $scope.user, {}).
          success(function(data, status, headers, config) {
            // TODO: The redirect url should be dictated by the server.
            var redirectUrl = [
              Config.apiEndpoint,
              'app',
              'auths',
              'request',
              $scope.user.email
            ].join('/');
            // TODO: Move all this popup thing to a directive.
            $scope.popup.location.replace(redirectUrl);
            var checkClose = setInterval(function(){
              if ($scope.popup !== null) {
                if ($scope.popup.closed) {
                  $scope.popup = null;
                  clearInterval(checkClose);
                  // TODO: Instead of showing an alert, sign the user in right
                  //       away as we're not confirming users accounts.
                  alert('Welcome to TrellMe! Please sign in to get your report.');
                }
              }
            }, 100);
          }).
          error(function(data, status, headers, config) {
            $window.alert(['Sign up failed:', data].join(' '));
          });
      };
    }]);
}());
