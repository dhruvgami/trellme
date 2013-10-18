(function() {
  'use strict';

  describe('Settings', function() {
    var app, routes, route;
    beforeEach(module('userSettings'));
    beforeEach(function() {
      SpecHelper.setup(this);
      app    = angular.module('userSettings');
      routes = app.routes;
    });

    describe('dependencies', function() {
      it('should depend on ngRoute', function() {
        expect(app).toDependOn('ngRoute');
      });

      it('should depend on the services.userSettings', function() {
        expect(app).toDependOn('services.userSettings');
      });
    });

    describe('routes', function() {
      describe('/settings', function() {
        beforeEach(inject(function($injector) {
          routes = $injector.get('$route').routes;
          route  = routes['/settings'];
        }));

        describe('controller', function() {
          it('should be SettingsCtrl', function() {
            expect(route.controller).toEqual('SettingsCtrl');
          });
        });

        describe('templateUrl', function() {
          it('should be /src/app/user_settings/settings.html', function() {
            expect(route.templateUrl).toEqual('/src/app/user_settings/settings.html');
          });
        });
      });
    });
  });
}());
