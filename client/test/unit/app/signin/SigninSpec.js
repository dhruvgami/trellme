(function() {
  'use strict';

  describe('Signin', function() {
    var app;
    beforeEach(module('signin'));
    beforeEach(function() {
      SpecHelper.setup(this);
      app = angular.module('signin');
    });

    describe('dependencies', function() {
      it('should depend on ngRoute', function() {
        expect(app).toDependOn('ngRoute');
      });

      it('should depend on services.config', function() {
        expect(app).toDependOn('services.config');
      });

      it('should depend on services.userSession', function() {
        expect(app).toDependOn('services.userSession');
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

      describe('/signin', function() {
        beforeEach(function() {
          route = routes['/signin'];
        });

        describe('controller', function() {
          it('should be SigninCtrl', function() {
            expect(route.controller).toBe('SigninCtrl');
          });
        });

        describe('templateUrl', function() {
          it('should be /src/app/sigin/form.html', function() {
            expect(route.templateUrl).toBe('/src/app/signin/form.html');
          });
        });
      });
    });
  });
}());
