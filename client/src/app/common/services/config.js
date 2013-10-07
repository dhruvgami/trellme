(function() {
  'use strict';

  angular.module('services.config', []).
    service('Config', [function() {
      return {
        apiEndpoint : 'http://localhost:3000'
      };
    }]);
}());
