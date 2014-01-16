(function() {
  'use strict';

  angular.
    module('resetPassword').
    factory('Password', ['Config', '$http', '$q', function(Config, $http, $q) {
      var Password = {};

      Password.requestPasswordResetUrl = function() {
        return [Config.apiEndpoint, 'password', 'reset'].join('/');
      };

      Password.requestPasswordReset = function(email) {
        if (_.isEmpty(email)) {
          throw new Error("Email can't be blank");
        }

        var deferred = $q.defer();

        $http.
          post(Password.requestPasswordResetUrl(), { email : email }).
          then(function(response) {
            deferred.resolve(response.data);
          }, function(response) {
            var error = new Error()
              , msg = [
              'Error',
              response.status,
              'while trying to request password reset:',
              response.data.error
            ].join(' ');
            error.message = msg;
            error.code    = response.status;
            deferred.reject(error);
          });

        return deferred.promise;
      };

      return Password;
    }]);
}());
