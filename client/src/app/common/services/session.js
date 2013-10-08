(function() {
  'use strict';

  angular.module('services.session', ['services.config']).
    service('Session', ['Config', '$http', '$q', function(Config, $http, $q) {
      var Session = {
        loggedIn : false
      };

      Session.loginUrl = function() {
        return [Config.apiEndpoint, 'login'].join('/');
      };

      Session.login = function(email, password) {
        if (!email) {
          throw new Error('missing email argument');
        }

        if (!password) {
          throw new Error('missing password argument');
        }

        var deferred = $q.defer();
        $http.
          post(Session.loginUrl(), { email : email, password : password }).
          success(function(data) {
            Session.loggedIn = true;
            deferred.resolve(data);
          }).
          error(function(data) {
            deferred.reject(new Error(['Sign in failed:', data].join(' ')));
          });

        return deferred.promise;
      };

      return Session;
    }]);
}());
