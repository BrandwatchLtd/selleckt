'use strict';

/*globals process:false,module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            all: ['lib/**/*.js', 'test/*.js']
        },
        connect: {
            server: {
                options: {
                    port: 9000
                }
            }
        },
        shell: {
            runLocalTests: {
                command: './testem -l Firefox,PhantomJS'
            }
        },
        'saucelabs-mocha': {
            all: {
                options: {
                    urls: ['localhost:9000/test/index.html'],
                    build: process.env.TRAVIS_BUILD_NUMBER,
                    testname: 'Sauce Unit Test for Selleckt',
                    browsers: [
                        {browserName: 'firefox'},
                        {browserName: 'chrome'},
                        ['OS X 10.10', 'safari', 8],
                        // ['Windows 7', 'internet explorer', 8],
                        ['Windows 7', 'internet explorer', 9],
                        ['Windows 7', 'internet explorer', 10],
                        ['Windows 7', 'internet explorer', 11]
                    ],
                    tags: [
                        process.env.TRAVIS_PULL_REQUEST || 'no pr',
                        process.env.TRAVIS_BRANCH || 'no branch'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-saucelabs');

    var isPr = (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0);

    if(isPr){
        grunt.registerTask('test', ['jshint', 'shell:runLocalTests']);
    } else {
        grunt.registerTask('test', ['jshint', 'shell:runLocalTests', 'connect', 'saucelabs-mocha']);
    }
};
