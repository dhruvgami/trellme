(function() {
  'use strict';

  describe('ListCtrl', function() {
    var Report, $httpBackend, $window, $controller, controller, $scope, params,
        generateController, UserSettings;
    beforeEach(module('reports'));
    beforeEach(inject(function($injector) {
      Report       = $injector.get('Report');
      UserSettings = $injector.get('UserSettings');
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

      generateController = function(_params) {
        if (!_params) {
          _params = params;
        }
        controller = $controller('ListCtrl', _params);
        return controller;
      };
    }));

    describe('#assignReports()', function() {
      it('should be a function', function() {
        generateController();
        expect(_.isFunction(controller.assignReports)).toBeTruthy();
      });

      it('should expose whatever pass as param to reports variable in $scope', function() {
        generateController();
        $scope.reports = null;
        controller.assignReports({ foo : 'bar' });
        expect($scope.reports).toEqual({ foo : 'bar' });
      });
    }); /* end #assignReports() */

    describe('given the UserSettings.manualSyncEnabled returns true', function() {
      beforeEach(function() {
        spyOn(UserSettings, 'manualSyncEnabled').andReturn(true);
      });

      it('should call Report.reports', function() {
        spyOn(Report, 'reports').andCallThrough();
        generateController();
        expect(Report.reports).toHaveBeenCalled();
      });

      it('should not call Report.collect', function() {
        spyOn(Report, 'collect').andCallThrough();
        generateController();
        expect(Report.collect).not.toHaveBeenCalled();
      });
    });

    describe('given the UserSettings.manualSyncEnabled returns false', function() {
      beforeEach(function() {
        spyOn(UserSettings, 'manualSyncEnabled').andReturn(false);
      });

      it('should call the Report.collect method', function() {
        spyOn(Report, 'collect').andCallThrough();
        generateController();
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
          xit('should pass assignReports function as param to be called after all', function() {
          });

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
  });
}());
