(function() {
  'use strict';

  angular.module('trellme').
    controller('AppCtrl', ['Session', '$scope', function(Session, $scope) {
      $scope.session = Session;
    }]);
}());
