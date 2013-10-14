(function() {
  'use strict';

  describe('Spinner', function() {
    var $compile, $rootScope, $scope, template, element;
    beforeEach(module('directives.spinner'));
    beforeEach(inject(function($injector) {
      $compile   = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
      $scope     = $rootScope.$new();
      template   = "<spinner></spinner>";

      spyOn($rootScope, '$on').andCallThrough();
      element = $compile(template)($scope);
    }));

    it('should render a div containing a span with class "image"', function() {
      expect(element.hasClass('spinner')).toBe(true);
    });

    it('should render span within the container with "image" class', function() {
      var span = element.find('span');
      expect(span).toBeDefined();
      expect(span.hasClass('image')).toBe(true);
    });

    it('should expose the spin variable to the scope set to false by default', function() {
      expect($scope.spin).toBeDefined();
      expect($scope.spin).toBe(false);
    });

    it('should listen to "spinner:start" event on $rootScope', function() {
      expect($rootScope.$on).toHaveBeenCalledWith('spinner:start', jasmine.any(Function));
    });

    it('should listen to "spinner:stop" event on $rootScope', function() {
      expect($rootScope.$on).toHaveBeenCalledWith('spinner:stop', jasmine.any(Function));
    });

    describe('when emitting the "spinner:start" event on the $rootScope', function() {
      it('should set the spin variable on scope to true', function() {
        $scope.spin = false;
        $rootScope.$emit('spinner:start');
        expect($scope.spin).toBe(true);
      });
    });

    describe('when emitting the "spinner:stop" event on the $rootScope', function() {
      it('should set the spin variable on the scope to false', function() {
        $scope.spin = true;
        $rootScope.$emit('spinner:stop');
        expect($scope.spin).toBe(false);
      });
    });
  });
}());
