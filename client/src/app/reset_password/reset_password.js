(function() {
  'use strict';

  angular.
    module('resetPassword', ['ngRoute', 'services.config']).
    config(['$routeProvider', function($router) {
      $router.when('/password/reset', {
        controller  : 'ResetPasswordCtrl',
        templateUrl : '/src/app/reset_password/reset_password.html'
      });
    }]);
}());
