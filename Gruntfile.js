module.exports = function(grunt) {
    grunt.initConfig({
        nodeunit: {
            all: ['test/**/test*.js']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
};