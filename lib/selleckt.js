'use strict';

var SingleSelleckt = require('./SingleSelleckt');
var MultiSelleckt = require('./MultiSelleckt');
var SellecktPopup = require('./SellecktPopup');
var templateUtils = require('./templateUtils');
var jqueryPlugin = require('./sellecktJqueryPlugin');

//this is what we return in the CommonJS module.
var selleckt = {
    create: function(options){
        var Super = !!options.multiple ? MultiSelleckt : SingleSelleckt,
            o = Object.create(Super.prototype);

        Super.call(o, options);

        return o;
    },
    SingleSelleckt: SingleSelleckt,
    MultiSelleckt: MultiSelleckt,
    SellecktPopup: SellecktPopup,
    templateUtils: templateUtils
};

jqueryPlugin.mixin(selleckt);

module.exports = selleckt;
