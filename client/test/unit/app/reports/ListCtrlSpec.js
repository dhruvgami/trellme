(function() {
  'use strict';

  describe('ListCtrl', function() {
    var Report, $httpBackend, $window, $controller, $scope, params;
    beforeEach(module('reports'));
    beforeEach(inject(function($injector) {
      Report       = $injector.get('Report');
      $httpBackend = $injector.get('$httpBackend');
      $window      = $injector.get('$window');
      $controller  = $injector.get('$controller');
      $scope       = $injector.get('$rootScope').$new();
      params       = {
        'Report'  : Report,
        '$scope'  : $scope,
        '$window' : $window
      };
      $httpBackend.when('GET', Report.collectUrl()).respond(200);
    }));

    it('should call the Report.collect method', function() {
      spyOn(Report, 'collect').andCallThrough();
      $controller('ListCtrl', params);
      expect(Report.collect).toHaveBeenCalled();
    });

    describe('given the service Report.collect resolves', function() {
      it('should call the Report.reports method', function() {
        spyOn(Report, 'reports').andCallThrough();
        $httpBackend.expectGET(Report.collectUrl()).respond(200);
        $httpBackend.expectGET(Report.reportsUrl()).respond(200);
        $controller('ListCtrl', params);
        $httpBackend.flush();
        expect(Report.reports).toHaveBeenCalled();
      });

      describe('given the Report.reports service resolves', function() {
        it('should assing the result to the scope', function() {
          var reports = [{ title : 'Foo' }, { title : 'Bar' }];
          $httpBackend.expectGET(Report.reportsUrl()).respond(200, reports);
          $controller('ListCtrl', params);
          $httpBackend.flush();
          expect($scope.reports).toEqual(reports);
        });
      });

      describe('given the service Report.reports rejects', function() {
        it('should notify the user', function() {
          spyOn($window, 'alert');
          $httpBackend.expectGET(Report.reportsUrl()).respond(500, "we failed");
          $controller('ListCtrl', params);
          $httpBackend.flush();
          expect($window.alert).toHaveBeenCalledWith('Error 500 while fetching reports: we failed');
        });
      });
    });

    describe('given the service Report.collect rejects', function() {
      it('should notify the user', function() {
          spyOn($window, 'alert');
          $httpBackend.expectGET(Report.collectUrl()).respond(500, "we failed");
          $controller('ListCtrl', params);
          $httpBackend.flush();
          expect($window.alert).toHaveBeenCalledWith('Error 500 while collecting: we failed');
      });
    });
  });
}());
