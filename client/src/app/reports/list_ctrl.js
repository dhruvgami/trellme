(function() {
  'use strict';

  angular.module('reports').
    controller('ListCtrl', ['Report', 'UserSettings', '$scope', '$window', function(Report, UserSettings, $scope, $window) {
      var ctrl = this;
      this.assignReports = function(reports) {
        $scope.reports = reports;
      };

      if (UserSettings.manualSyncEnabled()) {
        Report.reports().then(ctrl.assignReports, function(err) {
          $window.alert(err.message);
        });
      } else {
        Report.collect().then(function() {
          Report.reports().then(ctrl.assignReports, function(err) {
            $window.alert(err.message);
          });
        }, function(err) {
          $window.alert(err.message);
        });
      }
    }]);
}());
