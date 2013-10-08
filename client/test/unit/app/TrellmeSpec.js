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

      it('should depend on services.session', function() {
        expect(_.contains(deps, 'services.session')).toBe(true);
      });
    });

    describe('router', function() {
      it('should redirect to sign in route by default', function() {
        inject(function($injector) {
          var routes = $injector.get('$route').routes;
          expect(routes['null'].redirectTo).toBe('/signin');
        });
      });
    }); /* end router */

    describe('run block', function() {
      it('should call Session.bootstrap method', function() {
        var DummySession = { bootstrap : function() {} };
        spyOn(DummySession, 'bootstrap');

        // the runBlock function (as of the moment of writing this test
        // receives one argument: the Session service.
        var runBlock = angular.module('trellme')._runBlocks[0][1];
        runBlock(DummySession);
        expect(DummySession.bootstrap).toHaveBeenCalled();
      });
    });
  });
}());
