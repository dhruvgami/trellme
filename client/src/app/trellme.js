(function() {
  'use strict';

  angular.module('trellme', ['ngRoute', 'signup']).
    config(['$routeProvider', function($router) {
      $router.otherwise({ redirectTo : '/signin' });
    }]);
}());
