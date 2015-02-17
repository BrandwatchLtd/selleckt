'use strict';

var LegacySelleckt = require('../lib/LegacySelleckt');
var $ = require('jquery');

describe('LegacySelleckt', function(){
    var selleckt;
    var $el;
    var elHtml ='<select>' +
                    '<option selected value="1">foo</option>' +
                    '<option value="2" data-meh="whee" data-bah="oink">bar</option>' +
                    '<option value="3">baz</option>' +
                '</select>';

    beforeEach(function(){
        $el = $(elHtml).appendTo('body');
    });

    afterEach(function(){
        $el.remove();
        $el = undefined;

        if(selleckt){
            selleckt.destroy();
            selleckt = undefined;
        }
    });

    it('sets DELAY_TIMEOUT to window.MutationObserver._period', function(){
        expect(window.MutationObserver._period).toBeDefined();

        var selleckt = new LegacySelleckt({
            $selectEl : $el
        });

        expect(selleckt.DELAY_TIMEOUT).toEqual(60);
    });
});
