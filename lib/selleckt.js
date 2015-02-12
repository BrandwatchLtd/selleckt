'use strict';

var SingleSelleckt = require('./SingleSelleckt');
var MultiSelleckt = require('./MultiSelleckt');
var $ = require('jquery');

//this is what we return in the AMD module.
var selleckt = {
    create : function(options){
        var Super = !!options.multiple ? MultiSelleckt : SingleSelleckt,
            o = Object.create(Super.prototype);

        Super.call(o, options);

        return o;
    }
};

//this is the jquery plugin code
$.fn.selleckt = function(options) {
    options = options || {};

    return this.each(function() {
        var $self = $(this),
            sellecktPlugin = $self.data('selleckt'),
            settings = _.extend( {
                $selectEl: $self,
                multiple: !!$self.attr('multiple')
            }, options);

        if(sellecktPlugin){
            return;
        }

        sellecktPlugin = selleckt.create(settings);
        $self.data('selleckt', sellecktPlugin);

        sellecktPlugin.render();
    });
};

module.exports = selleckt;
