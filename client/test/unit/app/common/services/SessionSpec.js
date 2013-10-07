(function() {
  'use strict';

  describe('Session', function() {
    var Session, deps;
    beforeEach(module('services.session'));
    beforeEach(inject(function($injector) {
      Session = $injector.get('Session');
      deps = angular.module('services.session').requires;
    }));

    describe('dependencies', function() {
      it('should not depend on anybody', function() {
        expect(deps.length).toBe(0);
      });
    });

    describe('defaults', function() {
      describe('loggedIn', function() {
        it('should be false', function() {
          expect(Session.loggedIn).toBe(false);
        });
      });
    });
  });
}());
