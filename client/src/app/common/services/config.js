(function() {
  'use strict';

  angular.module('services.config', []).
    service('Config', [function() {
      return {
        apiEndpoint : 'http://dev.trellme.com:3000'
      };
    }]);
}());
