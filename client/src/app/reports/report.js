(function() {
  'use strict';

  angular.module('reports').
    factory('Report', ['Config', '$q', '$http', function(Config, $q, $http) {
      var Report = {};

      Report.collectUrl = function() {
        return [Config.apiEndpoint, 'app', 'trello', 'collect'].join('/');
      };

      Report.reportsUrl = function() {
        return [Config.apiEndpoint, 'app', 'trello', 'reports'].join('/');
      };

      Report.collect = function() {
        var deferred = $q.defer();
        $http.
          get(Report.collectUrl()).
          then(function(response) {
            deferred.resolve(response.data);
          }, function(response) {
            var msg = [
              'Error',
              response.status,
              'while collecting:',
              response.data
            ].join(' ');
            deferred.reject(new Error(msg));
          });
        return deferred.promise;
      };

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
