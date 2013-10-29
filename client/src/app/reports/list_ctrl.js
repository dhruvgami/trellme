(function() {
  'use strict';

  angular.module('reports').
    controller('ListCtrl', ['Report', 'UserSettings', '$scope', '$window', function(Report, UserSettings, $scope, $window) {
      // TODO:
      // 1. Unify.
      // 2. Call UserSettings.load on controller initialization.
      var ctrl = this;
      ctrl.assignReports = function(reports) {
        $scope.reports = reports;
      };

      $scope.userSettings = UserSettings;

      $scope.sync = function() {
        Report.
          collect().
          then(function() {
            Report.
              reports().
              then(ctrl.assignReports, function(err) {
                $window.alert(err.message);
              });
          });
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
