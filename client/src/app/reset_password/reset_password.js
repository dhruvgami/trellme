(function() {
  'use strict';

  angular.
    module('resetPassword', ['ngRoute', 'services.config']).
    config(['$routeProvider', function($router) {
      $router.
        when('/password/request-reset', {
          controller  : 'RequestPasswordResetCtrl',
          templateUrl : '/src/app/reset_password/request_reset.html'
        }).
        when('/password/reset', {
          controller  : 'ResetPasswordCtrl',
          templateUrl : '/src/app/reset_password/reset.html'
        });
    }]);
}());
