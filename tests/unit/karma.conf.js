 module.exports = function(config) {
      config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '../../',

        // frameworks to use
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
          'www/lib/ionic/js/ionic.bundle.js',
          'www/js/app.js',
          'www/js/controllers.js',
          'www/js/services.js',
          'www/lib/angular-youtube-mb/src/angular-youtube-embed.js',
          'www/lib/angular-mocks/angular-mocks.js',
          'www/lib/angular-md5/angular-md5.js',
          
          'tests/unit/tests/*.spec.js'
        ],

        preprocessors: {
          'js/*.js': 'coverage'
        },

        coverageReporter : {
          type : 'html',
          dir : '../coverage/'
        },

        plugins: [
          'karma-jasmine',
          'karma-phantomjs-launcher',
          'karma-chrome-launcher',
          'karma-coverage',
          'karma-junit-reporter'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
      });
    };
