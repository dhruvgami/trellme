(function() {
  'use strict';

  describe('TrellMe', function() {
    beforeEach(module('trellme'));
    beforeEach(function() {
      SpecHelper.setup(this);
    });

    describe('dependencies', function() {
      var app;
      beforeEach(function() {
        app = angular.module('trellme');
      });

      it('should depend on ngRoute', function() {
        expect(app).toDependOn('ngRoute');
      });

      it('should depend on signup', function() {
        expect(app).toDependOn('signup');
      });

      it('should depend on signin', function() {
        expect(app).toDependOn('signin');
      });

      it('should depend on reports', function() {
        expect(app).toDependOn('reports');
      });

      it('should depend on services.session', function() {
        expect(app).toDependOn('services.session');
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
