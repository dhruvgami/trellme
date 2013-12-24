(function() {
  'use strict';

  angular.module('reports', ['ngRoute', 'services.config', 'services.userSettings']).
    config(['$routeProvider', function($router) {
      $router.
        when('/reports', {
          controller  : 'ListCtrl',
          templateUrl : '/src/app/reports/list.html'
        }).
        when('/reports/advanced', {
          controller  : 'AdvancedReportsCtrl',
          templateUrl : '/src/app/reports/advanced.html'
        });
    }]);
}());
