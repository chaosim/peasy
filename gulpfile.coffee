_ = require 'lodash'
gulp = require('gulp')
gutil = require 'gulp-util'
changed = require('gulp-changed')
cache = require('gulp-cached')
plumber = require('gulp-plumber')
clean = require('gulp-clean')
#gulpFilter = require('gulp-filter')
#shell = require 'gulp-shell'
rename = require("gulp-rename")
coffee = require ('gulp-coffee')
#browserify = require('gulp-browserify')
concat = require('gulp-concat')
closureCompiler = require('gulp-closure-compiler')
size = require('gulp-size')
mocha = require('gulp-mocha')
karma = require('gulp-karma')
twoside = require './gulp-twoside'
#pluginwatch = require('gulp-watch')
#express = require('express')
#http://rhumaric.com/2014/01/livereload-magic-gulp-style/
#livereload = require('gulp-livereload')
#tinylr = require('tiny-lr')
runSequence = require('run-sequence')

task = gulp.task.bind(gulp)
watch = gulp.watch.bind(gulp)
src = gulp.src.bind(gulp)
dest = gulp.dest.bind(gulp)
from = (source, options={dest:folders_destjs, cache:'cache'}) ->
  options.dest ?= folders_destjs
  options.cache ?= 'cache'
  src(source).pipe(changed(options.dest)).pipe(cache(options.cache)).pipe(plumber())
GulpStream = src('').constructor
GulpStream::to = (dst) -> @pipe(dest(dst))#.pipe(livereload(tinylrServer))
GulpStream::pipelog = (obj, log=gutil.log) -> @pipe(obj).on('error', log)

rootOf = (path) -> path.slice(0, path.indexOf(''))
midOf = (path) -> path.slice(path.indexOf('')+1, path.indexOf('*'))

distributing = false

# below will put output js files in wrong directory structure!!!
# coffee: [coffeeroot+'*.coffee', coffeeroot+'samples/**/*.coffee', coffeeroot+'test/**/*.coffee']
# use the code below to solve this problem
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
    if @desttail then @dest = @destbase+@desttail
    else @dest = @destbase


folders_src = 'coffee/'
folders_coffee = folders_src
folders_dest = 'js/'
folders_destjs = folders_dest
folders_destjsClient = folders_destjs+'client/'
folders_dist = 'dist/'
folders_dev = 'dev/'
folders_pulic = 'public/'
folders_static = 'static/'

task 'clean', -> src([folders_destjs], {read:false}) .pipe(clean())

files_copy = (folders_src+name for name in ['**/*.js', '**/*.json', '**/*.jade', '**/*.html', '**/*.css', '**/*.tjv'])
task 'copy', -> from(files_copy, {cache:'copy'}).to(folders_destjs)

files_coffee = [folders_coffee+'**/*.coffee']
task 'coffee', -> from(files_coffee, {cache:'coffee'}).pipelog(coffee({bare: true})).to(folders_destjs)

#task 'stylus', -> from(['css/**/*.css']).pipe(styl({compress: true})).to(folders_destjs)

client = folders_destjsClient

files_twoside = [folders_destjs+'peasy.js', folders_destjs+'logicpeasy.js', folders_destjs+'linepeasy.js', folders_destjs+'index.js']

task 'transform:peasy', (cb) ->
  if not distributing then return src(files_twoside).pipelog(twoside(folders_destjs, 'peasy')).to(folders_destjs)
  src(files_twoside)
  .pipelog(twoside(folders_destjs, 'peasy', {only_wrap_for_browser:true})).to(client)
  .pipe(concat("full-peasy-package.js")).pipe(size()).to(client)
  #minify
  .pipe(closureCompiler()).pipe(rename(suffix: "-min")).pipe(size()).to(client)
  # generate index.js for part assembly.of the package
  src(files_twoside.slice(0, files_twoside.length-1)).pipelog(twoside(folders_destjs, 'peasy',
  {only_wrap_for_browser:true, 'peasy':'index', 'logicpeasy':'index', 'linepeasy':'index'}))
  .pipe(rename(suffix:'-index')).to(client)

  # peasy.js, peasy.js+logicpeasy.js, peasy.js+linepeasy.js can become thred packages
  # concat and min for partly assembled peasy package
  for part in [{name: 'peasy', files: [client+'peasy-index.js']},
                 {name: 'logicpeasy', files: [client+'peasy.js', client+'logicpeasy-index.js']},
                 {name: 'linepeasy', files: [client+'peasy.js', client+'linepeasy-index.js']}]
    src(part.files)
    .pipe(concat(part.name+'-package.js')).pipe(size()).to(client)
    .pipe(closureCompiler()).pipe(rename(suffix: "-min")).pipe(size()).to(client)

task 'make:samples', (cb) -> # twoside, concat
  # twoside and concat for samples
  files = 'statemachine dsl arithmatic arithmatic2'
  files = for name in files.split(' ') then folders_destjs+'samples/'+name+'.js'
#  console.log files.join(' ')
  stream = src(files).pipelog(twoside(folders_destjs+'samples', 'peasy/samples')) #, {only_wrap_for_browser:true}
  if not distributing then return stream.to(folders_destjs+'samples')
  stream.pipe(concat('sample-concat.js')).pipe(size()) # when debuggin, dont concat
  stream.to(folders_destjs+'samples')

task 'make:test', (cb) -> # twoside, concat, minify
  # twoside and concat for test/karma
  stream = src(folders_destjs+'test/karma/**/*.js')
  .pipelog(twoside(folders_destjs+'test/karma', 'peasy/karma', {only_wrap_for_browser:true}))
  if not distributing then return  stream.to(folders_destjs+'test/karma')
  stream.pipe(concat('karma-concat.js')) # when debugging, dont concat
  .to(folders_destjs+'test/karma')

build = (callback) ->
  runSequence('clean', ['copy', 'coffee'], ['transform:peasy', 'make:samples', 'make:test'], callback)
# make is for debugging and test, dont concat and minify
task 'make', (callback) -> distributing = false; build(callback)
# dist is for release, so concat and minify packages
task 'dist', (callback) -> distributing = true; build(callback)

gulp.task 'browserify', ['coffee'], ->
  src(folders_destjs+'test/karma/karma-bundle.js').pipe(browserify({
    insertGlobals : true,
  #debug : !gulp.env.production
  }))
  .to(folders_destjs+'test/karma')

files_mocha = folders_destjs+'test/mocha/**/*.js'

onErrorContinue = (err) -> console.log(err.stack); @emit 'end'
task 'mocha', ->  src(files_mocha).pipe(mocha({reporter: 'dot'})).on("error", onErrorContinue)

merge = (files) -> files = files.split(' '); path = files[0]; (for file in files.splice(1) then path+file).join(' ')
files_karma_debug = 'twoside peasy linepeasy logicpeasy index '+\
  merge('samples/ statemachine dsl arithmatic arithmatic2')+' '+\
  merge('test/karma/ peasy logicpeasy samples-arithmatic samples-arithmatic samples-arithmatic')
files_karma_debug = for item in files_karma_debug.split(' ') then folders_destjs+item+'.js'
files_karma_dist = 'twoside client/full-peasy-package samples/sample-concat test/karma/karma-concat'
files_karma_dist = for item in files_karma_dist.split(' ') then folders_destjs+item+'.js'
karmaOnce = karma({configFile: folders_destjs+'test/karma-conf.js', action: 'run'})
task 'karma1', -> src(files_karma_debug).pipe(karmaOnce)
task 'karma1/dist', -> src(files_karma_dist).pipe(karmaOnce)
karmaWatch = karma({configFile: folders_destjs+'test/karma-conf.js', action: 'watch'})
#console.log files_karma_dist.join(' ')
task 'karma', -> src(files_karma_debug).pipe(karmaWatch)
task 'karma/dist', -> src(files_karma_dist).pipe(karmaWatch)

#task 'runapp', shell.task ['node dist/examples/sockio/app.js']
#task 'express',  ->
#  app = express()
#  app.use(require('connect-livereload')()) # play with tiny-lr to livereload stuffs
#  app.use(express.static(__dirname))
#  app.listen(4000)
#task 'tinylr', -> server.listen 35729, (err) -> if err then console.log(err)

task 'watch/copy', -> watch files_copy, ['copy']
task 'watch/coffee', -> watch files_coffee, ['coffee']
task 'watch/mocha', -> watch [files_modulejs, files_serverjs, files_mocha], ['mocha']
#onWatchReload = (event) -> src(event.path, {read: false}).pipe(livereload(tinylrServer))
#task 'watch/reload', -> tinylrServer = tinylr(); tinylrServer.listen(35729); watch files_reload,onWatchReload
task 'watch/all', -> ['watch/copy', 'watch/coffee', 'watch/mocha'] #  , 'watch/reload'

task 'mocha/auto', ['watch/copy', 'watch/coffee', 'watch/mocha']
task 'test', (callback) -> runSequence('make', ['mocha', 'karma1'], callback)
task 'test/dist', (callback) -> runSequence('dist', ['mocha', 'karma1/dist'], callback)
task 'default',['test']

