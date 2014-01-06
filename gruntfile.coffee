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
    karma:
      auto: {configFile: 'js/test/karma-conf', autoWatch: true, singleRun: false}
      once: {configFile: 'js/test/karma-conf', autoWatch: false, singleRun: true}

  watchConfig =
    dev:
      options:{spawn: false, debounceDelay: 100}
      coffee:{files: coffeePatterns, tasks: ['coffee:dev']}

  grunt.option 'force', true
  for task in ['grunt-contrib-clean', 'grunt-contrib-coffee', 'grunt-karma', 'grunt-contrib-watch']
    grunt.loadNpmTasks(task)
  grunt.registerTask 'look', 'dynamic watch', ->
    target = grunt.task.current.args[0] or 'dev'
    grunt.config.set('watch', watchConfig[target])
    grunt.task.run 'watch'
    if target=='dev'
      grunt.event.on 'watch', (action, filepath) ->
        if action=='deleted' then return
        if grunt.file.isMatch coffeePatterns, [filepath]
          grunt.config.set 'coffee',
            options: {sourceRoot: '', bare: true} # , sourceMap: true
            dev: {expand: true, cwd: 'coffee', dest: 'js', src: filepath.slice(7), ext: '.js'}

  grunt.registerTask('build', ['clean:js', 'coffee'])
  grunt.registerTask('karm1', ['karma:once'])
  grunt.registerTask('karm', ['karma:auto'])
  grunt.registerTask('test', ['build', 'karm1'])
  grunt.registerTask 'default', ['test']
