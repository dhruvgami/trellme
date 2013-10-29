(function() {
  'use strict';

  describe('Reports', function() {
    var app;
    beforeEach(module('reports'));
    beforeEach(function() {
      SpecHelper.setup(this);
      app = angular.module('reports');
    });

    describe('dependencies', function() {
      it('should depend on ngRoute', function() {
        expect(app).toDependOn('ngRoute');
      });

      it('should depend on services.config', function() {
        expect(app).toDependOn('services.config');
      });

      it('should depend on services.userSettings', function() {
        expect(app).toDependOn('services.userSettings');
      });
    });

    describe('routes', function() {
      var routes, route;
      beforeEach(inject(function($injector) {
        routes = $injector.get('$route').routes;
      }));

      describe('/reports', function() {
        beforeEach(function() {
          route = routes['/reports'];
        });

        describe('controller', function() {
          it('should be ListCtrl', function() {
            expect(route.controller).toBe('ListCtrl');
          });
        });

        describe('templateUrl', function() {
          it('should be /src/app/reports/list.html', function() {
            expect(route.templateUrl).toBe('/src/app/reports/list.html');
          });
        });
      });
    });
  });
}());
