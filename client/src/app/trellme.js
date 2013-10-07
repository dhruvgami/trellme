(function() {
  'use strict';

  angular.module('trellme', ['ngRoute', 'signup', 'signin']).
    config(['$routeProvider', '$locationProvider', function($router, $location) {
      $router.otherwise({ redirectTo : '/signin' });
    }]);
}());
