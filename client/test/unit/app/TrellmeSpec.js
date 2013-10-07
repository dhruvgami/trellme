(function() {
  'use strict';

  describe('TrellMe', function() {
    beforeEach(module('trellme'));
    describe('dependencies', function() {
      var deps;
      beforeEach(function() {
        deps = angular.module('trellme').requires;
      });

      it('should depend on ngRoute', function() {
        expect(_.contains(deps, 'ngRoute')).toBe(true);
      });

      it('should depend on signup', function() {
        expect(_.contains(deps, 'signup')).toBe(true);
      });

      it('should depend on signin', function() {
        expect(_.contains(deps, 'signin')).toBe(true);
      });
    });

    describe('router', function() {
      it('should redirect to sign in route by default', function() {
        inject(function($injector) {
          var routes = $injector.get('$route').routes;
          expect(routes['null'].redirectTo).toBe('/signin');
        });
      });
    });
  });
}());
