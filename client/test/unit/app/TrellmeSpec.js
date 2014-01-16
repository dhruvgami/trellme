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

      it('should depend on userSettings', function() {
        expect(app).toDependOn('userSettings');
      });

      it('should depend on resetPassword', function() {
        expect(app).toDependOn('resetPassword');
      });

      it('should depend on services.userSession', function() {
        expect(app).toDependOn('services.userSession');
      });

      it('should depend on directives.spinner', function() {
        expect(app).toDependOn('directives.spinner');
      });

      it('should depend on services.httpMonitor', function() {
        expect(app).toDependOn('services.httpMonitor');
      });
    });

    describe('router', function() {
      describe('/', function() {
        it('should serve template app/common/views/home.html', function() {
          inject(function($injector) {
            var routes = $injector.get('$route').routes;
            expect(routes['/'].templateUrl).toBe('/src/app/common/views/home.html');
          });
        });
      });
    }); /* end router */

    describe('run block', function() {
      it('should call UserSession.bootstrap method', function() {
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
