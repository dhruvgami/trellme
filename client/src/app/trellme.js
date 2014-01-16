(function() {
  'use strict';

  angular.module('trellme', [
    'ngRoute',
    'signup',
    'signin',
    'reports',
    'userSettings',
    'resetPassword',
    'services.userSession',
    'services.httpMonitor',
    'directives.spinner'
    ]).
    config(['$routeProvider', function($router) {
      $router.when('/', {
        templateUrl : '/src/app/common/views/home.html'
      });
    }]).
    run(['UserSession', function(UserSession) {
      UserSession.bootstrap();
    }]);
}());
