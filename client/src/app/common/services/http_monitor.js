(function() {
  'use strict';

  angular.module('services.httpMonitor', []).
    factory('HttpMonitor', ['$http', '$rootScope', function($http, $rootScope) {
      var self = this;

      this.showSpinner = function(data) {
        $rootScope.$emit('spinner:start');
        return data;
      };

      this.hideSpinner = function(data) {
        $rootScope.$emit('spinner:stop');
        return data;
      };

      this.setup = function() {
        $http.defaults.transformRequest.push(self.showSpinner);
        $http.defaults.transformResponse.push(self.hideSpinner);
        return $http;
      };
      return this;
    }]).
    run(['HttpMonitor', function(HttpMonitor) {
      HttpMonitor.setup();
    }]);
}());
