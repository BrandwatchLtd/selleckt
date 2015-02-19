'use strict';

var Mustache = require('Mustache');

module.exports = {
    cacheTemplate: function(template) {
        if(typeof(template) === 'string'){
            Mustache.parse(template);
            return;
        }

        throw new Error('Please provide a valid mustache template.');
    }
};
