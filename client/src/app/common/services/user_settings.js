(function() {
  'use strict';

  angular.
    module('services.userSettings', ['services.userSession', 'services.config']).
    factory('UserSettings', ['$q', '$http', 'UserSession', 'Config', function($q, $http, UserSession, Config) {
      var UserSettings = {};

      UserSettings.settingsUrl = function() {
        return [Config.apiEndpoint, 'settings'].join('/');
      };

      UserSettings.assignSettings = function(settings) {
        if (!_.isPlainObject(settings)) {
          throw new Error('Invalid type of argument. Object expected');
        }
        for (var key in settings) {
          UserSettings[key] = settings[key];
        }
      };

      UserSettings.manualSyncEnabled = function() {
        return !!UserSettings.manual_sync;
      };

      UserSettings.load = function() {
        var deferred = $q.defer();
        if (UserSession.loggedIn) {
          $http.
            get(UserSettings.settingsUrl()).
            success(function(data) {
              UserSettings.assignSettings(data);
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

      UserSettings.save = function(settings) {
        if (!_.isPlainObject(settings)) {
          throw new Error('Invalid "settings" param');
        }

        var deferred = $q.defer();
        if (UserSession.loggedIn) {
          $http.
            post(UserSettings.settingsUrl(), settings).
            success(function(response) {
              if (response) {
                UserSettings.assignSettings(response);
              }
            });
        } else {
          deferred.reject(new Error("User not logged in"));
        }
        return deferred.promise;
      };

      return UserSettings;
    }]);
}());
