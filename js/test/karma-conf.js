module.exports = function(config) {
  return config.set({
    basePath: '..',
    frameworks: ['jasmine'],
    reporters: ['dots', 'html'],
    htmlReporter: {
      outputDir: 'js/test/karma/html',
      templatePath: 'coffee/test/jasmine-template.html'
    },
    files: ['twoside.js', 'peasy.js', 'logicpeasy.js', 'deprecated/logic.js', 'deprecated/autopeasy.js', 'deprecated/modularpeasy.js', 'deprecated/nonmodularpeasy.js', 'samples/dsl.js', 'samples/arithmatic.js', 'test/karma/testpeasy.js', 'test/karma/testlogicpeasy.js', 'test/karma/deprecated/testlogic.js', 'test/karma/deprecated/testautopeasy.js', 'test/karma/deprecated/testmodularpeasy.js', 'test/karma/deprecated/testnonmodularpeasy.js', 'test/karma/samples/testdsl.js', 'test/karma/samples/testarithmatic.js'],
    exclude: [],
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome']
  });
};
