(function() {
  'use strict';

  angular.
    module('resetPassword').
    factory('Password', ['Config', '$http', '$q', function(Config, $http, $q) {
      var Password = {};

      Password.resetPasswordUrl = function() {
        return [Config.apiEndpoint, 'password'].join('/');
      };

      Password.requestPasswordResetUrl = function() {
        return [Config.apiEndpoint, 'password', 'reset'].join('/');
      };

      Password.tokenExistsUrl = function() {
        return [Config.apiEndpoint, 'password', 'reset'].join('/');
      };

      Password.tokenExists = function(token) {
        if (_.isEmpty(token)) {
          throw new Error("Token can't be blank");
        }

        var deferred = $q.defer()
          , config   = { params : { token : token } };
        $http.
          get(Password.tokenExistsUrl(), config).
          then(function() {
            deferred.resolve();
          }, function(response) {
            var error = new Error()
              , msg = [
              'Error',
              response.status,
              'while trying to verify token existence:',
              response.data.error
            ].join(' ');
            error.message = msg;
            error.code    = response.status;
            deferred.reject(error);
          });
        return deferred.promise;
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

      Password.resetPassword = function(password, passwordConfirmation) {
        if (!password) {
          throw new Error("Password can't be blank");
        }

        if (!passwordConfirmation) {
          throw new Error("Password confirmation can't be blank");
        }

        if (password !== passwordConfirmation) {
          throw new Error("Password does not match confirmation");
        }

      };

      return Password;
    }]);
}());
