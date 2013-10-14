(function() {
  'use strict';

  describe('HttpMonitor', function() {
    var HttpMonitor, $http, $httpBackend, $rootScope;
    beforeEach(module('services.httpMonitor'));
    beforeEach(inject(function($injector) {
      HttpMonitor  = $injector.get('HttpMonitor');
      $http        = $injector.get('$http');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope   = $injector.get('$rootScope');
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('runBlock for services.httpMonitor module', function() {
      it('should call the setup method on the HttpMonitor service', function() {
        var runBlock        = angular.module('services.httpMonitor')._runBlocks[0][1],
            HttpMonitorMock = { setup : function() {} };
        spyOn(HttpMonitorMock, 'setup');
        runBlock(HttpMonitorMock);
        expect(HttpMonitorMock.setup).toHaveBeenCalled();
      });
    });

    describe('.setup', function() {
      var returnedValue;
      beforeEach(function() {
        spyOn($http.defaults.transformRequest, 'push');
        spyOn($http.defaults.transformResponse, 'push');
        returnedValue = HttpMonitor.setup();
      });

      it('should add HttpMonitor.showSpinner handler to the $http.defaults.transformRequest array', function() {
        expect($http.defaults.transformRequest.push).toHaveBeenCalledWith(HttpMonitor.showSpinner);
      });

      it('should add HttpMonitor.hideSpinner handler to the $http.defaults.transformRequest array', function() {
        expect($http.defaults.transformResponse.push).toHaveBeenCalledWith(HttpMonitor.hideSpinner);
      });

      it('should return $http', function() {
        expect(returnedValue).toBe($http);
      });
    }); /* end .setup */

    describe('.showSpinner', function() {
      var returnedValue, passedValue;
      beforeEach(function() {
        spyOn($rootScope, '$emit');
        passedValue   = 'foobar';
        returnedValue = HttpMonitor.showSpinner(passedValue);
      });

      it('should emit a "spinner:start" event on the $rootScope', function() {
        expect($rootScope.$emit).toHaveBeenCalledWith('spinner:start');
      });

      it('should return the first argument that it got passed', function() {
        expect(returnedValue).toBe(passedValue);
      });
    }); /* end .showSpinner */

    describe('.hideSpinner', function() {
      var returnedValue, passedValue;
      beforeEach(function() {
        spyOn($rootScope, '$emit');
        passedValue   = 'foobar';
        returnedValue = HttpMonitor.hideSpinner(passedValue);
      });

      it('should emit a "spinner:stop" event on the $rootScope', function() {
        expect($rootScope.$emit).toHaveBeenCalledWith('spinner:stop');
      });

      it('should return the first argument that it got passed', function() {
        expect(returnedValue).toBe(passedValue);
      });
    }); /* end .hideSpinner */
  });
}());
