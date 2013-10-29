(function() {
  'use strict';

  angular.module('reports', ['ngRoute', 'services.config', 'services.userSettings']).
    config(['$routeProvider', function($router) {
      $router.
        when('/reports', {
          controller  : 'ListCtrl',
          templateUrl : '/src/app/reports/list.html'
        });
    }]);
}());
