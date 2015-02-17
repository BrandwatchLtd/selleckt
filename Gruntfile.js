'use strict';

/*globals module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            all: ['lib/**/*.js', 'test/*.js'],
            options: {
                jshintrc: true
            }
        },
        clean: {
            dist: ['./dist/**/*']
        },
        browserify: {
            dist: {
                files: {
                    'dist/selleckt-browserify.js': [ 'lib/LegacySelleckt.js', 'lib/selleckt.js']
                },
                ignore: ['jquery', 'underscore', 'mustache'],
                options: {
                    transform: ['browserify-shim'],
                    plugin: [
                        ['factor-bundle', {
                                outputs : [
                                    'dist/selleckt-legacy.js'
                                ]
                            }
                        ]
                    ]
                }
            }
        },
        'http-server': {
            'dev': {
                host: '0.0.0.0',
                ext: 'html',
                showDir: false
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('build', [ 'jshint', 'clean', 'browserify']);
    grunt.registerTask('start', [ 'clean', 'browserify', 'http-server:dev']);
};
