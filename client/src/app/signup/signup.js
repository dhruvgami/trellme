(function() {
  'use strict';

  angular.module('signup', ['ngRoute', 'services.config']).
    config(['$routeProvider', '$locationProvider', function($router, $location) {
      $router.when('/signup', {
        controller  : 'SignupCtrl',
        templateUrl : '/src/app/signup/form.html'
      });
    }]);
}());
