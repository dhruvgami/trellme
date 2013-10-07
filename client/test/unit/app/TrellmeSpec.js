(function() {
  'use strict';

  describe('TrellMe', function() {
    beforeEach(module('trellme'));
    describe('dependencies', function() {
      var deps;
      beforeEach(function() {
        deps = angular.module('trellme').requires;
      });

      it('should not depend on anybody', function() {
        expect(deps.length).toBe(0);
      });
    });
  });
}());
