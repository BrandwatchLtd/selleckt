/*
 * selleckt.js, another select replacement.
 *
 * Dependencies: jQuery, underscore.js, mustache.js
 *
 * License: MIT
**/
(function(root, factory){
    'use strict';

    // Full MicroEvents library @ 54e85c036c3f903b963a0e4a671f72c1089ae4d4
    // (added some missing semi-colons etc, that's it)
    /**
     * MicroEvent - to make any js object an event emitter (server or browser)
     *
     * - pure javascript - server compatible, browser compatible
     * - dont rely on the browser doms
     * - super simple - you get it immediatly, no mistery, no magic involved
     *
     * - create a MicroEventDebug with goodies to debug
     *   - make it safer to use
    */

    var MicroEvent  = function(){};
    MicroEvent.prototype    = {
        bind    : function(event, fct){
            this._events = this._events || {};
            this._events[event] = this._events[event]   || [];
            this._events[event].push(fct);
        },
        unbind  : function(event, fct){
            this._events = this._events || {};
            if( event in this._events === false  ) { return; }
            this._events[event].splice(this._events[event].indexOf(fct), 1);
        },
        trigger : function(event /* , args... */){
            this._events = this._events || {};
            if( event in this._events === false  ) { return; }
            for(var i = 0; i < this._events[event].length; i++){
                this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    };

    /**
     * mixin will delegate all MicroEvent.js function in the destination object
     *
     * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
     *
     * @param {Object} the object which will support MicroEvent
    */
    MicroEvent.mixin    = function(destObject){
        var props   = ['bind', 'unbind', 'trigger'];
        for(var i = 0; i < props.length; i ++){
            destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
        }
    };
    /// END MicroEvents

    // Work with AMD or plain-ol script tag
    if(typeof define === 'function' && define.amd){
        // If window.jQuery or window._ are not defined, then assume we're using AMD modules
        define(['jquery', 'underscore', 'mustache'], function($, _, Mustache){
            return factory($ || root.jQuery, _ || root._, Mustache || root.Mustache, MicroEvent);
        });
    }else{
        root.selleckt = factory(root.jQuery, root._, root.Mustache, MicroEvent);
    }

})(this, function($, _, Mustache, MicroEvent){

    'use strict';

    if(!$){
        throw new Error('selleckt requires jQuery to be loaded');
    }
    if(!_){
        throw new Error('selleckt requires underscore to be loaded');
    }
    if(!Mustache){
        throw new Error('selleckt requires mustache to be loaded');
    }

    function Selleckt(options){
        this.initialize(options);
    }

    Selleckt.create = function(options){
        options = options || {};

        var className = options.className,
            selleckt = new Selleckt(options);

        return selleckt;
    };

    _.extend(Selleckt.prototype, {

        _open: function() {
            this.$items.show();
            this.$sellecktEl.addClass('open');

            $(document).on('mousedown.selleckt', _.bind(this._close, this));
        },

        _close: function() {
            this.$items.hide();
            this.$sellecktEl.removeClass('open');

            $(document).off('mousedown.selleckt', this._close);
        },

        initialize: function(options){
            options = options || {};

            if(!_.isString(options.selectedClass)){
                throw new Error('selleckt must be instantiated with a "selectedClass" option');
            }

            if(!_.isString(options.selectedTextClass)){
                throw new Error('selleckt must be instantiated with a "selectedTextClass" option');
            }

            if(!_.isString(options.itemsClass)){
                throw new Error('selleckt must be instantiated with an "itemsClass" option');
            }

            if(!_.isString(options.itemClass)){
                throw new Error('selleckt must be instantiated with an "itemClass" option');
            }

            var settings = _.defaults(options, {
                className : 'dropdown',
                highlightClassName : 'highlighted'
            });

            this.selectedClass = settings.selectedClass;
            this.selectedTextClass = settings.selectedTextClass;
            this.itemsClass = settings.itemsClass;
            this.itemClass = settings.itemClass;

            this.className = settings.className;
            this.highlightClassName = settings.highlightClassName;

            this.$originalSelectEl = settings.$selectEl;
            this.template = settings.mainTemplate;
            this.itemTemplate = settings.itemTemplate;

            this.parseItems(this.$originalSelectEl);
        },

        bindEvents: function(){
            var self = this,
                $selected = this.$sellecktEl.find('> .' + this.selectedClass),
                $selectedText = $selected.find('.'+this.selectedTextClass),
                $sellecktEl = this.$sellecktEl,
                itemClass = '.'+this.itemClass,
                trigger = _.bind(this.trigger, this),
                items = this.items;

            // handle dropdown toggling
            $selected.on('mousedown', function(e) {
                e.stopPropagation();

                self.$sellecktEl.focus();

                if (self.$items.is(':visible')) {
                    self._close();
                } else {
                    self._open();
                }

                return false;
            });

            $sellecktEl.on('mousedown', itemClass, function(e){
                e.stopPropagation();

                var $target = $(e.target),
                    value = $target.data('value'),
                    selectedItem = _(items).find(function(item){
                        return item.value == value;
                    });

                $selectedText.text(selectedItem.label);

                self.selectedItem = selectedItem;
                trigger('itemSelected', selectedItem);
            });
        },

        parseItems: function($selectEl){
            var items = [],
                selectedItem;

            _($selectEl.find('option')).each(function(option){
                var $option = $(option),
                    item = {
                        value: $option.attr('value'),
                        label: $option.text(),
                        data: $option.data()
                    };

                if($option.is(':selected')){
                    selectedItem = item;
                }

                items.push(item);
            });

            this.items = items;
            this.selectedItem = selectedItem;
        },

        render: function(){
            var $sellecktEl = this.$sellecktEl = $(Mustache.render(this.template, {
                    selectedItemText: this.selectedItem.label,
                    className : this.className,
                    items: this.items
                }));

            this.$items = $sellecktEl.find('.items');

            this.bindEvents();

            this.$originalSelectEl.hide().before($sellecktEl).remove().appendTo($sellecktEl);
        },

        destroy: function(){
            if(!this.$sellecktEl){
                return;
            }

            //this.$originalSelectEl.after(this.$sellecktEl).show();
            this.$sellecktEl.off().remove();
        }
    });

    MicroEvent.mixin(Selleckt);

    $.fn.selleckt = function(options) {
        options = options || {};

        return this.each(function() {
            var $self = $(this),
                selleckt = $self.data('selleckt');

            if(!selleckt){
                selleckt = Selleckt.create(_.extend( { $selectEl: $self }, options ));
                selleckt.render();

                $self.on('click', function(e){
                    e.stopPropagation();

                    picker.show($self);
                });
            }
        });
    };

    return Selleckt;
});