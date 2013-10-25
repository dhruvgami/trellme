(function() {
  'use strict';

  angular.module('userSettings').
    controller('SettingsCtrl', ['$scope', 'UserSettings', function($scope, UserSettings) {
      $scope.saveFailed    = false;
      $scope.saveSucceeded = false;
      $scope.settings      = {};

      UserSettings.
        load().
        then(function(settings) {
          $scope.settings = settings;
        }, function(err) {
        });

      $scope.save = function() {
        UserSettings.
          save($scope.settings).
          then(function(data) {
            $scope.saveSucceeded = true;
            $scope.saveFailed    = false;
          }, function() {
            $scope.saveSucceeded = false;
            $scope.saveFailed    = true;
          });
      };
    }]);
}());
