'use strict';

var $ = require('jquery');
var _ = require('underscore');

module.exports = {
    mixin: function(selleckt){
        $.fn.selleckt = function(options) {
            options = options || {};

            return this.each(function() {
                var $self = $(this),
                    sellecktPlugin = $self.data('selleckt'),
                    settings = _.extend( {
                        $selectEl: $self,
                        multiple: !!$self.attr('multiple')
                    }, options);

                if (sellecktPlugin) {
                    return;
                }

                sellecktPlugin = selleckt.create(settings);
                $self.data('selleckt', sellecktPlugin);

                sellecktPlugin.render();
            });
        };
    }
};
