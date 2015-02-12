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
                command: './testem -l Firefox'
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
                        ['Windows 7', 'internet explorer', 8],
                        ['Windows 7', 'internet explorer', 9],
                        ['Windows 7', 'internet explorer', 10],
                        ['Windows 7', 'internet explorer', 11]
                    ],
                    sauceConfig: {
                        'public': 'public' //make the logs publicly visible so README badges work
                    },
                    tags: [
                        process.env.TRAVIS_PULL_REQUEST || 'no pr',
                        process.env.TRAVIS_BRANCH || 'no branch'
                    ]
                }
            }
        },
        clean: {
          dist: ['./dist/**/*'],
          tests: ['./test/browserified_tests.js'],
        },
        browserify: {
            // These are the browserified tests. We need to browserify the tests to be
            // able to run the mocha tests while writing the tests as clean, simple
            // CommonJS mocha tests (that is, without cross-platform boilerplate
            // code). This build will also include the testing libs chai, sinon and
            // sinon-chai but must not include the module under test.
            tests: {
                src: [ './test/suite.js' ],
                dest: './test/browserified_tests.js',
                options: {
                    external: [ './selleckt.js' ],
                    // Embed source map for tests
                    debug: true
                }
            }
            // options: {
            //     browserifyOptions: {
            //         // debug: true,
            //         standalone: 'selleckt',
            //         'bundleExternal': false
            //     }
            // },
            // dist: {
            //     files: {
            //         'dist/selleckt.js': [
            //             'lib/selleckt.js'
            //         ]
            //     }
            // }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-saucelabs');
    grunt.loadNpmTasks('grunt-browserify');

    var isPr = (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0);

    if(isPr){
        grunt.registerTask('test', ['jshint', 'shell:runLocalTests']);
    } else {
        grunt.registerTask('test', ['jshint', 'shell:runLocalTests', 'connect', 'saucelabs-mocha']);
    }
};
