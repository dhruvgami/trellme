(function() {
  'use strict';

  angular.module('directives.spinner', []).
    directive('spinner', [function() {
      return {
        restrict : 'E',
        replace  : true,
        template : '<div class="spinner" ng-show="spin"><span class="image"></span></div>',
        controller  : ['$rootScope', '$scope', function($rootScope, $scope) {
          $scope.spin = false;

          $rootScope.$on('spinner:start', function() {
            $scope.spin = true;
          });

          $rootScope.$on('spinner:stop', function() {
            $scope.spin = false;
          });
        }]
      };
    }]);
}());
