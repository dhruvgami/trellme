(function() {
  'use strict';

  angular.module('trellme', [
    'ngRoute',
    'signup',
    'signin',
    'reports',
    'userSettings',
    'services.session',
    'services.httpMonitor',
    'directives.spinner'
    ]).
    config(['$routeProvider', function($router) {
      $router.otherwise({ redirectTo : '/signin' });
    }]).
    run(['Session', function(Session) {
      Session.bootstrap();
    }]);
}());
