module.exports = (config) ->
  config.set {
    basePath: '..'   # peasy/js
    # It doesnot work. module(should be property of window) or angular.mock.module throw error!!!
    # but failed with browserify, and protractor does not yet support mocha at the moment. sadly.
    #    frameworks: ['mocha']   #, 'chai', 'chai-as-promised'
    frameworks: ['jasmine']
    reporters:['dots', 'html']
    htmlReporter:
      outputDir: 'js/test/karma/html',
      templatePath: 'coffee/test/jasmine-template.html'
#    files: [
#      'twoside.js'
#      'client/full-peasy-package.js'
#      'samples/sample-concat.js'
#      'test/karma/karma-concat.js'
#     ],
    exclude: []
    #after switching from win7 64bit to win7 32bit, dsable many services, karma say chrome have not captured in 6000ms. use 9876 ok.
    #https://github.com/karma-runner/karma/issues/635
    port: 9876 #8080
    # level of logging
    # possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO
    #  autoWatch: true
    # - Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), PhantomJS, IE (only Windows)
    browsers: ['Chrome']
    # singleRun: false
  }

