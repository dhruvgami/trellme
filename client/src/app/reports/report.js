(function() {
  'use strict';

  angular.module('reports').
    factory('Report', ['Config', '$q', '$http', function(Config, $q, $http) {
      var Report = {};

      Report.reportsUrl = function() {
        return [Config.apiEndpoint, 'app', 'trello', 'reports'].join('/');
      }

      Report.reports = function() {
        var deferred = $q.defer();
        $http.
          get(Report.reportsUrl()).
          then(function(response) {
            deferred.resolve(response.data);
          }, function(response) {
            var msg = [
              'Error',
              response.status,
              'while fetching reports:',
              response.data
            ].join(' ');
            deferred.reject(new Error(msg));
          });
        return deferred.promise;
      };

      return Report;
    }]);
}());
