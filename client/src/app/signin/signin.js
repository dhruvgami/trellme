(function() {
  'use strict';

  angular.module('signin', [
    'ngRoute',
    'services.config',
    'services.userSession',
    'services.userSettings'
    ]).
    config(['$routeProvider', function($router) {
      $router.when('/signin', {
        controller  : 'SigninCtrl',
        templateUrl : '/src/app/signin/form.html'
      });
    }]);
}());
