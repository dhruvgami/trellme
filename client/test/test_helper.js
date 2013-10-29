(function() {
  'use strict';

  var SpecHelper = { matchers : {} };

  SpecHelper.setup = function(suite) {
    suite.addMatchers(SpecHelper.matchers);
  };

  SpecHelper.matchers.toDependOn = function(expected) {
    return _(this.actual.requires).contains(expected);
  };

  SpecHelper.matchers.toBeAPromise = function(expected) {
    var thenPresent    = _.isFunction(this.actual.then),
        catchPresent   = _.isFunction(this.actual.catch),
        finallyPresent = _.isFunction(this.actual.finally);

    return thenPresent && catchPresent && finallyPresent;
  };

  SpecHelper.matchers.toBeAFunction = function() {
    return _.isFunction(this.actual);
  };

  window.SpecHelper = SpecHelper;
}());
