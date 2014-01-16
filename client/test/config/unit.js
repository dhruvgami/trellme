module.exports = function(config) {
  config.set({
    basePath: '../../',

    frameworks: ['jasmine'],

    files: [
      'test/test_helper.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/lodash/dist/lodash.min.js',
      'bower_components/jquery/jquery.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'src/app/reports/reports.js',
      'src/app/user_settings/user_settings.js',
      'src/app/reset_password/reset_password.js',
      'src/app/trellme.js',
      'src/**/*.js',
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
