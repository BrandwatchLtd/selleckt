'use strict';

var jquery = window.$;
var underscore = window._;

var selleckt = window.selleckt;

var SingleSelleckt = selleckt.SingleSelleckt;
var MultiSelleckt = selleckt.MultiSelleckt;
var templateUtils = selleckt.templateUtils;

SingleSellecktSpecs(SingleSelleckt, templateUtils, jquery, underscore);
MultiSellecktSpecs(MultiSelleckt, templateUtils, jquery);
