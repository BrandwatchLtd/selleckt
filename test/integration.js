'use strict';
/*globals SingleSellecktSpecs:false, MultiSellecktSpecs:false  */
var jquery = window.$;
var underscore = window._;

var selleckt = window.selleckt;

var SingleSelleckt = selleckt.SingleSelleckt;
var MultiSelleckt = selleckt.MultiSelleckt;
var templateUtils = selleckt.templateUtils;

(function exec(){
    return new SingleSellecktSpecs(SingleSelleckt, templateUtils, jquery, underscore) &&
        new MultiSellecktSpecs(MultiSelleckt, templateUtils, jquery);
})();
