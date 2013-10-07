(function() {
  'use strict';

  describe('Config', function() {
    var Config;
    beforeEach(module('services.config'));
    beforeEach(inject(function($injector) {
      Config = $injector.get('Config');
    }));

    describe('dependencies', function() {
      it('should not depend on anybody', function() {
        expect(angular.module('services.config').requires.length).toBe(0);
      });
    });

    it('should define a config for the api endpoint', function() {
      expect(Config.apiEndpoint).toBeDefined();
    });
  });
}());
