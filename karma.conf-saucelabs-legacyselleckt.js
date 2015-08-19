'use strict';

//Load the base configuration
var baseConfig = require('./karma.conf-saucelabs.js');

module.exports = function(config) {
    // Load base config
    baseConfig(config);

    // Browsers to run on Sauce Labs
    // Check out https://saucelabs.com/platforms for all browser/OS combos
    var customLaunchers = {
        'SL_IE_10': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '10.0'
        },
        'SL_IE_9': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '9.0'
        },
        'SL_IE_8': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '8.0'
        }
    };


    // Override base config
    config.set({

        files: [
            'shims/object-create-shim.js',
            'shims/es5-shim.min.js',
            'shims/mutationobserver-shim.js',
            'test/lib/*.js',
            'dist/selleckt-legacy.js',
            'test/specs/*.js'
        ],

        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers)

    });
};
