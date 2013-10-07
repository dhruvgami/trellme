(function() {
  'use strict';

  angular.module('services.session', []).
    service('Session', [function() {
      var Session = {
        loggedIn : false
      };
      return Session;
    }]);
}());
