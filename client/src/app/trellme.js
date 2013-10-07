(function() {
  'use strict';

  angular.module('trellme', ['ngRoute', 'signup', 'signin', 'services.session']).
    config(['$routeProvider', function($router) {
      $router.otherwise({ redirectTo : '/signin' });
    }]);
}());
