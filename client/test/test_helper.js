(function() {
  'use strict';

  var SpecHelper = { matchers : {} };

  SpecHelper.setup = function(suite) {
    suite.addMatchers(SpecHelper.matchers);
  };

  SpecHelper.matchers.toDependOn = function(expected) {
    return _(this.actual.requires).contains(expected);
  }

  window.SpecHelper = SpecHelper;
}());
