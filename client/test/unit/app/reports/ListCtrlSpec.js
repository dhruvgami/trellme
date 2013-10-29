(function() {
  'use strict';

  describe('ListCtrl', function() {
    var Report, $q, $window, $controller, $rootScope, $scope, params,
        generateController, UserSettings, collectDeferred, reportsDeferred;
    beforeEach(module('reports'));
    beforeEach(inject(function($injector) {
      SpecHelper.setup(this);
      Report       = $injector.get('Report');
      UserSettings = $injector.get('UserSettings');
      $q           = $injector.get('$q');
      $window      = $injector.get('$window');
      $controller  = $injector.get('$controller');
      $rootScope   = $injector.get('$rootScope');
      $scope       = $rootScope.$new();
      params       = {
        'Report'  : Report,
        '$scope'  : $scope,
        '$window' : $window
      };

      collectDeferred = $q.defer();
      reportsDeferred = $q.defer();
      spyOn(Report, 'collect').andReturn(collectDeferred.promise);
      spyOn(Report, 'reports').andReturn(reportsDeferred.promise);

      generateController = function(_params) {
        if (!_params) {
          _params = params;
        }
        return $controller('ListCtrl', _params);
      };
    }));

    it('should expose UserSettings on userSettings to $scope', function() {
      generateController();
      expect($scope.userSettings).toBeDefined();
      expect($scope.userSettings).toBe(UserSettings);
    });

    describe('#assignReports()', function() {
      it('should be a function', function() {
        var ctrl = generateController();
        expect(ctrl.assignReports).toBeAFunction();
      });

      it('should expose whatever pass as param to reports variable in $scope', function() {
        var ctrl = generateController();
        $scope.reports = null;
        ctrl.assignReports({ foo : 'bar' });
        expect($scope.reports).toEqual({ foo : 'bar' });
      });
    }); /* end #assignReports() */

    describe('#sync()', function() {
      var ctrl;
      beforeEach(function() {
        ctrl = generateController();
      });

      it('should be exposed to the scope', function() {
        expect($scope.sync).toBeDefined();
        expect(_.isFunction($scope.sync)).toBeTruthy();
      });

      it('should invoke the Report.collect service', function() {
        $scope.sync();
        expect(Report.collect).toHaveBeenCalled();
      });

      describe('given the Report.collect service resolves', function() {
        beforeEach(function() {
          collectDeferred.resolve('yay');
          spyOn(ctrl, 'assignReports');
          $scope.sync();
          $rootScope.$apply();
        });

        it('should call the Report.reports service', function() {
          expect(Report.reports).toHaveBeenCalled();
        });

        xit('should call assignReports function', function() {
          expect(ctrl.assignReports).toHaveBeenCalled();
        });
      });

      describe('given the Report.collect service rejects', function() {
        it('should inform the user about the error', function() {
          collectDeferred.reject({ message : 'we have failed, master' });
          spyOn($window, 'alert');
          $scope.sync();
          $rootScope.$apply();
          expect($window.alert).toHaveBeenCalledWith('we have failed, master');
        });
      });
    }); /* end #sync() */

    describe('given the UserSettings.manualSyncEnabled returns true', function() {
      beforeEach(function() {
        spyOn(UserSettings, 'manualSyncEnabled').andReturn(true);
      });

      it('should call Report.reports', function() {
        generateController();
        expect(Report.reports).toHaveBeenCalled();
      });

      it('should not call Report.collect', function() {
        generateController();
        expect(Report.collect).not.toHaveBeenCalled();
      });
    });

    describe('given the UserSettings.manualSyncEnabled returns false', function() {
      beforeEach(function() {
        spyOn(UserSettings, 'manualSyncEnabled').andReturn(false);
      });

      it('should call the Report.collect method', function() {
        generateController();
        expect(Report.collect).toHaveBeenCalled();
      });

      describe('given the service Report.collect resolves', function() {
        beforeEach(function() {
          collectDeferred.resolve('yay');
        });

        it('should call the Report.reports method', function() {
          generateController();
          $rootScope.$apply();
          expect(Report.reports).toHaveBeenCalled();
        });

        describe('given the Report.reports service resolves', function() {
          beforeEach(function() {
            reportsDeferred.resolve('yay');
          });

          it('should pass assignReports function as param to be called after all', function() {
            var ctrl = generateController();
            spyOn(ctrl, 'assignReports');
            $rootScope.$apply();
            expect(ctrl.assignReports).toHaveBeenCalledWith('yay');
          });
        });

        describe('given the service Report.reports rejects', function() {
          it('should notify the user', function() {
            reportsDeferred.reject({ message : 'Error 500 while fetching reports: we failed' });
            spyOn($window, 'alert');
            generateController();
            $rootScope.$apply();
            expect($window.alert).toHaveBeenCalledWith('Error 500 while fetching reports: we failed');
          });
        });
      });

      describe('given the service Report.collect rejects', function() {
        it('should notify the user', function() {
          collectDeferred.reject({ message : 'Error 500 while collecting: we failed' });
          spyOn($window, 'alert');
          generateController();
          $rootScope.$apply();
          expect($window.alert).toHaveBeenCalledWith('Error 500 while collecting: we failed');
        });
      });
    });
  });
}());
