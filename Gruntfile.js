'use strict';

/*globals module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: [
                'lib/**/*.js',
                'test/*.js',
                '!lib/MicroEvent.js'
            ]
        },
        clean: {
            dist: ['./dist/**/*']
        },
        browserify: {
            standalone: {
                src: ['lib/selleckt.js'],
                dest: 'dist/selleckt.js',
                options: {
                    browserifyOptions: {
                        standalone: 'selleckt'
                    },
                    external: ['underscore', 'Mustache', 'jquery'],
                    transform: ['browserify-shim']
                }
            },
            legacy: {
                src: ['lib/shim/selleckt-legacy-shim.js'],
                dest: 'dist/selleckt-legacy.js',
                options: {
                    browserifyOptions: {
                        standalone: 'selleckt'
                    },
                    external: ['underscore', 'Mustache', 'jquery'],
                    transform: ['browserify-shim']
                }
            }
        },
        'connect': {
            'dev': {
                options: {
                    hostname: '0.0.0.0',
                    port: 8282,
                    keepalive: true
                }
            }
        },
        karma: {
            'saucelabs-integration': {
                configFile: 'karma.conf-saucelabs.js'
            },
            'saucelabs-integration-legacy': {
                configFile: 'karma.conf-saucelabs-legacyselleckt.js'
            },
            'travis-integration-browser': {
                configFile: 'karma.conf-travis.js'
            },
            'local-unit': {
                configFile: 'karma.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build', ['eslint', 'clean', 'browserify']);
    grunt.registerTask('start', ['build', 'connect:dev']);

    var isPr = (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0);
    var isTravis = !!process.env.TRAVIS_BUILD_NUMBER;

    if (!isTravis) {
        grunt.registerTask('test', ['karma:local-unit']);
    } else if (isPr) {
        grunt.registerTask('test', ['karma:travis-integration-browser']);
    } else {
        grunt.registerTask('test', ['karma:saucelabs-integration', 'karma:saucelabs-integration-legacy']);
    }
};
