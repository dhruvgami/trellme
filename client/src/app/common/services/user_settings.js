(function() {
  'use strict';

  angular.
    module('services.userSettings', ['services.session', 'services.config']).
    factory('UserSettings', ['$q', '$http', 'Session', 'Config', function($q, $http, Session, Config) {
      var UserSettings = {};

      UserSettings.settingsUrl = function() {
        return [Config.apiEndpoint, 'settings'].join('/');
      };

      UserSettings.load = function() {
        var deferred = $q.defer();
        if (Session.loggedIn) {
          $http.
            get(UserSettings.settingsUrl()).
            success(function(data) {
              return deferred.resolve(data);
            }).
            error(function() {
              return deferred.reject(new Error(["Error while loading user settings:", data].join(' ')));
            });
        } else {
          deferred.reject(new Error("User not logged in"));
        }
        return deferred.promise;
      };

      UserSettings.save = function() {
        var deferred = $q.defer();
        if (Session.loggedIn) {
          $http.
            post(UserSettings.settingsUrl());
        } else {
          deferred.reject(new Error("User not logged in"));
        }
        return deferred.promise;
      };

      return UserSettings;
    }]);
}());
