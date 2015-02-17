'use strict';

//Load the base configuration
var baseConfig = require('./karma.conf.js');

if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.error('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    process.exit(1);
}

module.exports = function(config) {
    // Load base config
    baseConfig(config);

    // Browsers to run on Sauce Labs
    // Check out https://saucelabs.com/platforms for all browser/OS combos
    var customLaunchers = {
        'SL_Chrome': {
            base: 'SauceLabs',
            browserName: 'chrome'
        },
        'SL_Firefox': {
            base: 'SauceLabs',
            browserName: 'firefox'
        },
        'SL_IE_11': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '11.0'
        }
    };

    // Override base config
    config.set({
        reporters: ['progress', 'saucelabs'],
        port: 9876,
        colors: true,
        sauceLabs: {
            testName: 'Selleckt',
            recordScreenshots: false,
            connectOptions: {
                port: 5757,
                logfile: 'sauce_connect.log'
            },
        },

        //logLevel: 'debug',

        // Increase timeout in case connection in CI is slow
        captureTimeout: 120000,

        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),

        singleRun: true,

        // Do no watch for file changes
        autoWatch : false
    });
};
