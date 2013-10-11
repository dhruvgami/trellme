(function() {
  'use strict';

  angular.module('reports', ['ngRoute', 'services.config']).
    config(['$routeProvider', function($router) {
      $router.
        when('/reports', {
          controller  : 'ListCtrl',
          templateUrl : '/src/app/reports/list.html'
        });
    }]);
}());
