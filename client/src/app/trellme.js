(function() {
  'use strict';

  angular.module('trellme', [
    'ngRoute',
    'signup',
    'signin',
    'reports',
    'userSettings',
    'services.userSession',
    'services.httpMonitor',
    'directives.spinner'
    ]).
    config(['$routeProvider', function($router) {
      $router.otherwise({ redirectTo : '/signin' });
    }]).
    run(['UserSession', function(UserSession) {
      UserSession.bootstrap();
    }]);
}());
