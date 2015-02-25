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
        copy: {
            shim: {
                src: 'lib/shim/selleckt-legacy-shim.js',
                dest: 'dist/selleckt-legacy-shim.js'
            }
        },
        browserify: {
            standalone: {
                src: [ 'lib/selleckt.js' ],
                dest: 'dist/selleckt.js',
                options: {
                    browserifyOptions: {
                        standalone: 'selleckt'
                    },
                    external: ['underscore', 'Mustache', 'jquery'],
                    transform: ['browserify-shim']
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
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build', [ 'jshint', 'clean', 'browserify', 'copy:shim']);
    grunt.registerTask('start', [ 'build', 'http-server:dev']);

    var isPr = (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0);
    var isTravis = !!process.env.TRAVIS_BUILD_NUMBER;

    if(!isTravis){
        grunt.registerTask('test', [ 'karma:local-unit']);
    } else if(isPr){
        grunt.registerTask('test', [ 'karma:travis-integration-browser']);
    } else {
        grunt.registerTask('test', [ 'karma:saucelabs-integration', 'karma:saucelabs-integration-legacy']);
    }

};
