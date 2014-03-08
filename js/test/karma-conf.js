module.exports = function(config) {
  return config.set({
    basePath: '..',
    frameworks: ['jasmine'],
    reporters: ['dots', 'html'],
    htmlReporter: {
      outputDir: 'js/test/karma/html',
      templatePath: 'coffee/test/jasmine-template.html'
    },
    exclude: [],
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome']
  });
};
