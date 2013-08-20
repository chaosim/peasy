module.exports = function(grunt) {
    grunt.initConfig({
        nodeunit: {
            all: ['test/**/test*.js']
        },
        'gh-pages': {
            options: {
                base: 'doc'
            },
            src: ['doc/**']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-gh-pages');
};