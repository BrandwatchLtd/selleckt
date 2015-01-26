'use strict';
/*globals process:false,module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 9000
                }
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

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-saucelabs');

    grunt.registerTask('test', ['connect', 'saucelabs-mocha']);
};
