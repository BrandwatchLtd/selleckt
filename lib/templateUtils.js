'use strict';

var Mustache = require('Mustache');

module.exports = {
    parseTemplate: function(template) {
        if(typeof(template) === 'string'){
            Mustache.parse(template);
            return template;
        }

        throw new Error('Please provide a valid mustache template.');
    }
};
