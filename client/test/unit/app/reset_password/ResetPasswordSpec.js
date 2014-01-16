(function() {
  'use strict';

  describe('ResetPassword', function() {
    var app;

    beforeEach(module('resetPassword'));
    beforeEach(function() {
      SpecHelper.setup(this);
      app = angular.module('resetPassword');
    });

    describe('dependencies', function() {
      it('should depend on ngRoute', function() {
        expect(app).toDependOn('ngRoute');
      });

      it('should depend on services.config', function() {
        expect(app).toDependOn('services.config');
      });
    }); /* end dependencies */

    describe('routes', function() {
      var routes, route;
      beforeEach(inject(function($injector) {
        routes = $injector.get('$route').routes;
      }));

      describe('/password/reset', function() {
        beforeEach(function() {
          route = routes['/password/reset'];
        });

        describe('controller', function() {
          it('should be ResetPasswordCtrl', function() {
            expect(route.controller).toBe('ResetPasswordCtrl');
          });
        });

        describe('templateUrl', function() {
          it('should be /src/app/reset_password/reset_password.html', function() {
            expect(route.templateUrl).toBe('/src/app/reset_password/reset_password.html');
          });
        });
      });
    }); /* end routes */
  });
}());
