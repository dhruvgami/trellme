(function() {
  'use strict';

  angular.module('trellme', ['ngRoute', 'signup', 'signin']).
    config(['$routeProvider', function($router) {
      $router.otherwise({ redirectTo : '/signin' });
    }]);
}());
