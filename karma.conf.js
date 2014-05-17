// Karma configuration
// Generated on Sat Apr 05 2014 12:53:57 GMT+0100 (BST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // libs
      'bower_components/jquery/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/Datejs/build/date.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-ui-router/angular-ui-router.min.js',
      'bower_components/click-hide/ClickHide.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-filesystem/src/filesystem.js',
      'bower_components/AngularSugar/AngularSugar.js',
      'bower_components/ah-basement/Basement.js',
      'libs/JsonStorage.js',

      // tests
      'test/**/*Spec.js',

      // src
      'src/Strive.js',
      'src/**/*.js',
      'src/**/*.html'
    ],


    // list of files to exclude
    exclude: [

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    	'src/**/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
	    // the name of the Angular module to create
	    moduleName: "strive.templates"
	},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
