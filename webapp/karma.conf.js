// Karma configuration
// Generated on Sat Aug 15 2015 12:17:41 GMT-0700 (PDT)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // libs
            'bower_components/angular/angular.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/Datejs/build/date.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'bower_components/click-hide/ClickHide.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-filesystem/src/filesystem.js',
            'bower_components/AngularSugar/AngularSugar.js',
            'bower_components/ah-basement/Basement.js',
            'bower_components/angular-uuid-service/uuid-svc.js',
            'libs/**/*.js',

            // tests
            //'test/**/helperSpec.js',

            'src/modules/calc/CalcHelper.js',
            'test/**/calcSpec.js',

            // src
            //'src/Strive.js',
            'src/modules/calc/ReCalcService.js',

            'src/**/*.html'
        ],


        // list of files to exclude
        exclude: [],


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
        reporters: ['progress'],
        //specReporter: {maxLogLines: 5},
        //plugins: ["karma-spec-reporter", 'karma-jasmine', 'karma-chrome-launcher'],
        //

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
    })
}
