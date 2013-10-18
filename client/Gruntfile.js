module.exports = function(grunt) {
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    concat : {
      js : {
        src : [
          'vendor/angular/angular.js',
          'vendor/**/*.js',
          'src/app/reports/reports.js',
          'src/app/reports/user_settings.js',
          'src/app/trellme.js',
          'src/**/*.js'
        ],
        dest : 'trellme.js'
      }
    },
    jshint : {
      all : ['Gruntfile.js', 'src/**/*.js', 'test/unit/**/*.js']
    },
    watch : {
      scripts : {
        files : ['src/**/*.js', 'vendor/**/*.js'],
        tasks : ['jshint', 'concat:js']
      },
      extras : {
        files : ['Gruntfile.js', 'test/unit/**/*.js'],
        tasks : ['jshint']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);
};
