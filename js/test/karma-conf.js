module.exports = function(config) {
  return config.set({
    basePath: '..',
    frameworks: ['jasmine'],
    reporters: ['dots', 'html'],
    htmlReporter: {
      outputDir: 'js/test/karma/html',
      templatePath: 'coffee/test/jasmine-template.html'
    },
    files: ['twoside.js', 'peasy.js', 'logicpeasy.js', 'samples/dsl.js', 'samples/arithmatic.js', 'samples/statemachine.js', 'samples/arithmatic2.js', 'test/karma/testpeasy.js', 'test/karma/testlogicpeasy.js', 'test/karma/samples/testdsl.js', 'test/karma/samples/testarithmatic.js', 'test/karma/samples/testarithmatic2.js'],
    exclude: [],
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome']
  });
};
