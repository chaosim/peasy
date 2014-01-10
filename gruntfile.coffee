coffeeFolders = ['**/']
coffeePatterns = ('coffee/'+folder+'*.coffee' for folder in coffeeFolders)

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    clean: {js: 'js'}
    coffee:
        options: {sourceRoot: '', bare: true} # sourceMap: true
        dev: files: for folder in coffeeFolders
            {expand: true, cwd: 'coffee', src: folder+'*.coffee', dest:'js', ext:'.js'}
    uglify:
      options: {mangle: false}
      target:
        files:
          'js/twoside.min.js': ['js/twoside.js']
          'js/peasy.min.js': ['js/peasy.js']
          'js/logicpeasy.min.js': ['js/logicpeasy.js']
    karma:
      auto: {configFile: 'js/test/karma-conf', autoWatch: true, singleRun: false}
      once: {configFile: 'js/test/karma-conf', autoWatch: false, singleRun: true}
    mochaTest:
      test:
        options: {reporter: 'spec', clearRequireCache: true}
        src: ['js/test/mocha/**/*.js']
    concurrent:
      options: logConcurrentOutput: true
      dev: tasks: ['look:dev', 'karma:auto']

  watchConfig =
    dev:
      options:{spawn: false, debounceDelay: 100}
      coffee:{files: coffeePatterns, tasks: ['coffee:dev']}

  grunt.option 'force', true
  for task in ['grunt-contrib-clean', 'grunt-contrib-coffee', 'grunt-karma', 'grunt-contrib-watch',\
               'grunt-mocha-test', 'grunt-concurrent', 'grunt-contrib-uglify']
    grunt.loadNpmTasks(task)

  defaultMochaSrc = grunt.config('mochaTest.test.src')

  grunt.registerTask 'look', 'dynamic watch', ->
    target = grunt.task.current.args[0] or 'dev'
    grunt.config.set('watch', watchConfig[target])
    grunt.task.run 'watch'
    if target=='dev'
      grunt.event.on 'watch', (action, filepath) ->
        grunt.config('mochaTest.test.src', defaultMochaSrc)
        if filepath.match('js/test/mocha/') then grunt.config('mochaTest.test.src', filepath); return
        if action=='deleted' then return
        if grunt.file.isMatch coffeePatterns, [filepath]
          grunt.config.set 'coffee',
            options: {sourceRoot: '', bare: true} # , sourceMap: true
            dev: {expand: true, cwd: 'coffee', dest: 'js', src: filepath.slice(7), ext: '.js'}

  grunt.registerTask('build', ['clean:js', 'coffee', 'uglify'])
  grunt.registerTask('karm1', ['karma:once'])
  grunt.registerTask('karm', ['karma:auto'])
  grunt.registerTask('test', ['build', 'karm1'])
  grunt.registerTask('dev', ['build','mochaTest',  'concurrent'])
  grunt.registerTask 'default', ['dev']
