'use strict';

var jquery = require('jquery');
var underscore = require('underscore');

var SingleSelleckt = require('../lib/SingleSelleckt');
var MultiSelleckt = require('../lib/MultiSelleckt');
var templateUtils = require('../lib/templateUtils');

require('./specs/SingleSelleckt.specs.js')(SingleSelleckt, templateUtils, jquery, underscore);
require('./specs/MultiSelleckt.specs.js')(MultiSelleckt, templateUtils, jquery);
