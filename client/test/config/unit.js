module.exports = function(config) {
  config.set({
    basePath: '../../',

    frameworks: ['jasmine'],

    files: [
      'test/test_helper.js',
      'vendor/angular/angular.js',
      'vendor/**/*.js',
      'src/app/trellme.js',
      'src/app/reports/reports.js',
      'src/app/user_settings/user_settings.js',
      'src/**/*.js',
      'test/vendor/angular/angular.mocks.js',
      'test/unit/**/*Spec.js'
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    captureTimeout: 60000,

    singleRun: false
  });
};
