(function() {
  'use strict';

  angular.module('signup', ['ngRoute']).
    config(['$routeProvider', '$locationProvider', function($router, $location) {
      $router.when('/signup', {
        controller  : 'SignupCtrl',
        templateUrl : '/app/signup/form.html'
      });

      $location.html5Mode(true);
    }]);
}());
