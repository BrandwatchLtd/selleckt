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
        },
        karma: {
            'saucelabs': {
                configFile: 'karma.conf-saucelabs.js'
            },
            'saucelabs-legacy': {
                configFile: 'karma.conf-saucelabs-legacyselleckt.js'
            },
            'travis-browser': {
                configFile: 'karma.conf-travis.js'
            },
            'local-browser': {
                configFile: 'karma.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build', [ 'jshint', 'clean', 'browserify']);
    grunt.registerTask('start', [ 'clean', 'browserify', 'http-server:dev']);

    var isPr = (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0);
    var isTravis = !!process.env.TRAVIS_BUILD_NUMBER;

    if(!isTravis){
        grunt.registerTask('test', [ 'karma:local-browser']);
    } else if(isPr){
        grunt.registerTask('test', [ 'karma:travis-browser']);
    } else {
        grunt.registerTask('test', [ 'karma:saucelabs', 'karma:saucelabs-legacy']);
    }

};
