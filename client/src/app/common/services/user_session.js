(function() {
  'use strict';

  angular.module('services.userSession', ['services.config']).
    service('UserSession', ['Config', '$http', '$q', function(Config, $http, $q) {
      var UserSession = {
        loggedIn : false
      };

      UserSession.bootstrapUrl = function() {
        return [Config.apiEndpoint, 'me'].join('/');
      };

      UserSession.loginUrl = function() {
        return [Config.apiEndpoint, 'login'].join('/');
      };

      UserSession.logoutUrl = function() {
        return [Config.apiEndpoint, 'logout'].join('/');
      };

      UserSession.bootstrap = function() {
        var deferred = $q.defer();
        $http.
          get(UserSession.bootstrapUrl()).
          success(function(data) {
            UserSession.loggedIn = true;
            deferred.resolve(data);
          }).
          error(function(data) {
            UserSession.loggedIn = false;
            deferred.reject(new Error(['Session bootstrap failed:', data].join(' ')));
          });
        return deferred.promise;
      };

      UserSession.login = function(email, password) {
        if (!email) {
          throw new Error('missing email argument');
        }

        if (!password) {
          throw new Error('missing password argument');
        }

        var deferred = $q.defer();
        $http.
          post(UserSession.loginUrl(), { email : email, password : password }).
          success(function(data) {
            UserSession.loggedIn = true;
            deferred.resolve(data);
          }).
          error(function(data) {
            deferred.reject(new Error(['Sign in failed:', data].join(' ')));
          });

        return deferred.promise;
      }; /* end .login */

      UserSession.logout = function() {
        if (UserSession.loggedIn) {
          var deferred = $q.defer();
          $http.
            delete(UserSession.logoutUrl()).
            success(function(data) {
              UserSession.loggedIn = false;
              deferred.resolve(data);
            }).
            error(function(data) {
              deferred.reject(new Error(['Sign out failed:', data].join(' ')));
            });
          return deferred.promise;
        }
      };

      return UserSession;
    }]);
}());
