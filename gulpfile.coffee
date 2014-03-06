_ = require 'lodash'
gulp = require('gulp')
gutil = require 'gulp-util'
changed = require('gulp-changed')
cache = require('gulp-cached')
plumber = require('gulp-plumber')
clean = require('gulp-clean')
shell = require 'gulp-shell'
rename = require("gulp-rename")
coffee = require ('gulp-coffee')
browserify = require('gulp-browserify')
concat = require('gulp-concat')
closureCompiler = require('gulp-closure-compiler')
size = require('gulp-size')
mocha = require('gulp-mocha')
karma = require('gulp-karma')
twoside = require './gulp-twoside'


#pluginwatch = require('gulp-watch')
#styl = require('gulp-styl')

express = require('express')

#http://rhumaric.com/2014/01/livereload-magic-gulp-style/
livereload = require('gulp-livereload')
tinylr = require('tiny-lr')

task = gulp.task.bind(gulp)
watch = gulp.watch.bind(gulp)
src = gulp.src.bind(gulp)
dest = gulp.dest.bind(gulp)
from = (source, options={dest:folders.destjs, cache:'cache'}) ->
  options.dest ?= folders.destjs
  options.cache ?= 'cache'
  src(source).pipe(changed(options.dest)).pipe(cache(options.cache)).pipe(plumber())
GulpStream = src('').constructor
GulpStream::to = (dst) -> @pipe(dest(dst))#.pipe(livereload(tinylrServer))
GulpStream::pipelog = (obj, log=gutil.log) -> @pipe(obj).on('error', log)

rootOf = (path) -> path.slice(0, path.indexOf('/'))
midOf = (path) -> path.slice(path.indexOf('/')+1, path.indexOf('/*'))
patterns = (args...) ->
  for arg in args
    if typeof arg =='string' then pattern(arg)
    else arg
gulpto = (destbase, args...) ->
  for arg in args
    if typeof arg =='string' then pattern(arg, destbase)
    else arg
pattern = (src, destbase, options) -> new Pattern(src, destbase, options)
class Pattern
  constructor: (@src, @destbase, options={}) ->
    if typeof destbase=='object' then options = destbase; @destbase = undefined
    srcRoot = rootOf(@src)
    if not @destbase then @destbase = rootOf(@src)
    if not options.desttail? then @desttail = midOf(@src)
    if @desttail then @dest = @destbase+'/'+@desttail
    else @dest = @destbase

# below will put output js files in wrong directory structure!!!
# coffee: [coffeeroot+'/*.coffee', coffeeroot+'/samples/**/*.coffee', coffeeroot+'/test/**/*.coffee']

folders =
  dest: 'dist'
  dist: 'dist'
  dev: 'dev'
  src: 'coffee'
  coffee: 'coffee'
  destjs: 'js'
  pulic: 'public'
  static: 'static'

files =
  copy: (folders.src+'/'+name for name in ['**/*.js', '**/*.json', '**/*.jade', '**/*.html', '**/*.css', '**/*.tjv'])
  coffee: [folders.coffee+'/**/*.coffee']
  mocha: folders.destjs+'/test/mocha/**/*.js'
  karma: folders.destjs+'/test/karma/**/*.js'
  modulejs: folders.destjs+'/lib/modules/**/*.js'
  serverjs: folders.destjs+'/lib/server/**/*.js'
  reload: ['*.html', folders.destjs+'/client/**/*.js', folders.destjs+'/modules/**/*.js', 'public/**/*.js', 'public/**/*.css']

task 'clean', -> src([folders.destjs], {read:false}) .pipe(clean())
task 'runapp', shell.task ['node dist/examples/sockio/app.js']
task 'express',  ->
  app = express()
  app.use(require('connect-livereload')()) # play with tiny-lr to livereload stuffs
  console.log __dirname
  app.use(express.static(__dirname))
  app.listen(4000)
task 'copy', -> from(files.copy, {cache:'copy'}).to(folders.destjs)
task 'coffee', -> from(files.coffee, {cache:'coffee'}).pipelog(coffee({bare: true})).to(folders.destjs)
task 'twoside', ['coffee'], (cb) ->
  for pattern in patterns(folders.destjs+'/*.js', folders.destjs+'/samples/**/*.js', folders.destjs+'/test/karma/**/*.js')
    stream = src(pattern.src).pipelog(twoside('f:/peasy/js', 'peasy')).to(pattern.dest)
  stream
gulp.task 'browserify', ['coffee'], ->
  src(folders.destjs+'/test/karma/karma-bundle.js').pipe(browserify({
    insertGlobals : true,
  #debug : !gulp.env.production
  }))
  .to(folders.destjs+'/test/karma')
gulp.task 'concat', ['twoside'], ->
  src([folders.destjs+'/parser.js', folders.destjs+'/lineparser.js', folders.destjs+'/logicparser.js', folders.destjs+'/index.js']).pipe(concat("peasy.js")).to(folders.destjs)
gulp.task 'min', ['concat'], -> src(folders.destjs+'/peasy.js').pipe(closureCompiler()).pipe(rename(suffix: "-min")).pipe(size(showFiles:true)).to(folders.destjs)

onErrorContinue = (err) -> console.log(err.stack); @emit 'end'
#onErrorContinue = (err) -> @emit 'end'
task 'mocha', ->
  src(files.mocha)
#  .pipelog(plumber())
  .pipe(mocha({reporter: 'dot'})).on("error", onErrorContinue)
task 'karma', -> src(files.karma).pipe(karma({configFile: folders.destjs+'/test/karma-conf', action: 'run'}))     # run: once, watch: autoWatch=true
task 'stylus', -> from(['css/**/*.css']).pipe(styl({compress: true})).to(folders.destjs)
task 'tinylr', -> server.listen 35729, (err) -> if err then console.log(err)
task 'watch/copy', -> watch files.copy, ['copy']
task 'watch/coffee', -> watch files.coffee, ['coffee']
task 'watch/mocha', -> watch [files.modulejs, files.serverjs, files.mocha], ['mocha']
#task 'watch:mocha', ->
#  src([files.modulejs, files.serverjs, files.mocha])
#  .pipe(plumber())
#  .pipe pluginwatch emit: 'all', (files) ->
#    files.pipe(mocha(reporter: 'dot' ))
#    .on 'error', onErrorContinue
onWatchReload = (event) -> src(event.path, {read: false}).pipe(livereload(tinylrServer))
task 'watch/reload', -> tinylrServer = tinylr(); tinylrServer.listen(35729); watch files.reload,onWatchReload
task 'watch/all', -> ['watch/copy', 'watch/coffee', 'watch/mocha', 'watch/reload'] #
task 'build', ['copy', 'coffee']
task 'mocha/auto', ['watch/copy', 'watch/coffee', 'watch/mocha']
task 'default',['build', 'watch:all']

