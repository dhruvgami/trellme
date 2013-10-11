(function() {
  'use strict';

  angular.module('reports').
    controller('ListCtrl', ['Report', '$scope', '$window', function(Report, $scope, $window) {
      Report.reports().then(function(reports) {
        $scope.reports = reports;
      }, function(err) {
        $window.alert(err.message);
      });
    }]);
}());
