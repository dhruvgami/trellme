(function() {
  'use strict';

  angular.module('reports').
    controller('AdvancedReportsCtrl', ['Report', '$scope', function(Report, $scope) {
      $scope.from  = $scope.to = { year : 2013, month : 1 };
      $scope.years = (function() {
        var a = [];
        for (var i = 2013; i <= 2020; i++) {
          a.push(i);
        }
        return a;
      })();

      $scope.months = [
        {
          name  : 'January',
          value : 1
        },
        {
          name  : 'February',
          value : 2
        },
        {
          name  : 'March',
          value : 3
        },
        {
          name  : 'April',
          value : 4
        },
        {
          name  : 'May',
          value : 5
        },
        {
          name  : 'June',
          value : 6
        },
        {
          name  : 'July',
          value : 7
        },
        {
          name  : 'August',
          value : 8
        },
        {
          name  : 'September',
          value : 9
        },
        {
          name  : 'October',
          value : 10
        },
        {
          name  : 'November',
          value : 11
        },
        {
          name  : 'December',
          value : 12
        }
      ];

      $scope.getReport = function() {
        Report.reports({
          from : $scope.from,
          to   : $scope.to
        });
      };
    }]);
}());
