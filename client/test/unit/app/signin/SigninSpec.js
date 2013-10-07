(function() {
  'use strict';

  describe('Signin', function() {
    var deps;
    beforeEach(module('signin'));
    beforeEach(function() {
      deps = angular.module('signin').requires;
    });

    describe('dependencies', function() {
      it('should depend on ngRoute', function() {
        expect(_.contains(deps, 'ngRoute')).toBe(true);
      });

      it('should depend on services.config', function() {
        expect(_.contains(deps, 'services.config')).toBe(true);
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
