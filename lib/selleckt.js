'use strict';

var SingleSelleckt = require('./SingleSelleckt');
var MultiSelleckt = require('./MultiSelleckt');
var jqueryPlugin = require('./sellecktJqueryPlugin');

//this is what we return in the CommonJS module.
var selleckt = {
    create : function(options){
        var Super = !!options.multiple ? MultiSelleckt : SingleSelleckt,
            o = Object.create(Super.prototype);

        Super.call(o, options);

        return o;
    },
    SingleSelleckt: SingleSelleckt,
    MultiSelleckt: MultiSelleckt
};

jqueryPlugin.mixin(selleckt);

module.exports = selleckt;
