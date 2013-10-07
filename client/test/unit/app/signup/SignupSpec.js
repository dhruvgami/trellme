(function() {
  'use strict';

  describe('Signup', function() {
    beforeEach(module('signup'));
    describe('dependencies', function() {
      var deps;
      beforeEach(function() {
        deps = angular.module('signup').requires;
      });

      it('should depend on ngRoute', function() {
        expect(_.contains(deps, 'ngRoute')).toBe(true);
      });
    });

    it('should enable html5 mode', function() {
      inject(function($injector) {
        var $location = $injector.get('$location');
        expect($location.$$html5).toBe(true);
      });
    });

    describe('routes', function() {
      var routes, route;
      beforeEach(inject(function($injector) {
        routes = $injector.get('$route').routes;
      }));

      describe('/signup', function() {
        beforeEach(function() {
          route = routes['/signup'];
        });

        describe('controller', function() {
          it('should be SignupCtrl', function() {
            expect(route.controller).toBe('SignupCtrl');
          });
        });

        describe('templateUrl', function() {
          it('should point to /app/signup/form.html', function() {
            expect(route.templateUrl).toEqual('/app/signup/form.html');
          });
        });
      });
    });
  });
}());
