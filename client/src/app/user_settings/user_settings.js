(function() {
  'use strict';

  angular.module('userSettings', ['ngRoute', 'services.userSettings']).
    config(['$routeProvider', function($router) {
      $router.
        when('/settings', {
          controller  : 'SettingsCtrl',
          templateUrl : '/src/app/user_settings/settings.html'
        });
    }]);
}());
