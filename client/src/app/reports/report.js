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

      /*\
      |*| `dateRange` should be a POJO with the following format:
      |*| {
      |*|   from : { year : String, month : String, day : String },
      |*|   to   : { year : String, month : String, day : String }
      |*| }
      |*| where `String` is a date in the format of YYYY-MM-DD
      |*| Example:
      |*| {
      |*|   from : { year : '2013', month : '01', day : '01' },
      |*|   to   : { year : '2013', month : '12', day : '30' }
      |*| }
      |*| This function will return a string of the form
      |*| /app/trello/reports/from/xxxx/yy/zz/to/aaaa/bb/cc
      |*| prepending the api endpoint, of course.
      \*/
      Report.advancedReportsUrl = function(dateRange) {
        if (!_.isObject(dateRange)) {
          throw new Error('dateRange param is not a POJO');
        }

        if (!_.isObject(dateRange.from) || !_.isObject(dateRange.to)) {
          throw new Error('dateRange is not valid');
        }

        return [
          Config.apiEndpoint,
          'app',
          'trello',
          'reports',
          'from',
          dateRange.from.year,
          dateRange.from.month,
          dateRange.from.day,
          'to',
          dateRange.to.year,
          dateRange.to.month,
          dateRange.to.day
        ].join('/');
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

      // TODO: Add support for `boards`
      Report.advancedReports = function(dateRange) {
        var deferred = $q.defer();

        $http.
          get(Report.advancedReportsUrl(dateRange)).
          then(function(response) {
            deferred.resolve(response.data);
          }, function(response) {
            var msg = [
              'Error',
              response.status,
              'while fetching advanced reports:',
              response.data
            ].join(' ');
            deferred.reject(new Error(msg));
          });

        return deferred.promise;
      };
      return Report;
    }]);
}());
