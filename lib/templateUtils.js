'use strict';

var Mustache = require('Mustache');

module.exports = {
    cacheTemplate: function(template) {
        if (typeof(template) !== 'string') {
            throw new Error('Please provide a valid mustache template.');
        }

        Mustache.parse(template);
    }
};
