(function() {
  'use strict';

  angular.module('reports').
    controller('AdvancedReportsCtrl', ['Report', '$scope', '$window', function(Report, $scope, $window) {
      var ctrl = this;
      ctrl.assignReports = function(reports) {
        $scope.reports        = reports;
        $scope.fReports       = JSON.stringify(reports);
        $scope.noRecordsFound = _.isEmpty(reports.boards);
      };

      $scope.noRecordsFound = false;
      $scope.reports = [];
      $scope.fReports = '';
      $scope.from    = { year : '2013', month : '01', day : '01' };
      $scope.to      = { year : '2013', month : '01', day : '01' };

      $scope.years = (function() {
        var a = [];
        for (var i = 2013; i <= 2020; i++) {
          a.push(i.toString());
        }
        return a;
      })();

      $scope.days = (function() {
        var a = [];
        for (var i = 1; i <= 31; i++) {
          if (i < 10) {
            i = [0, i].join('');
          } else {
            i = i.toString();
          }
          a.push(i);
        }
        return a;
      })();

      $scope.months = [
        {
          name  : 'January',
          value : '01'
        },
        {
          name  : 'February',
          value : '02'
        },
        {
          name  : 'March',
          value : '03'
        },
        {
          name  : 'April',
          value : '04'
        },
        {
          name  : 'May',
          value : '05'
        },
        {
          name  : 'June',
          value : '06'
        },
        {
          name  : 'July',
          value : '07'
        },
        {
          name  : 'August',
          value : '08'
        },
        {
          name  : 'September',
          value : '09'
        },
        {
          name  : 'October',
          value : '10'
        },
        {
          name  : 'November',
          value : '11'
        },
        {
          name  : 'December',
          value : '12'
        }
      ];

      $scope.getReports = function() {
        Report.advancedReports({
          from : $scope.from,
          to   : $scope.to
        }).then(ctrl.assignReports, function(err) {
          $window.alert(err);
        });
      };
    }]);
}());
