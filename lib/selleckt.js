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

    var KEY_CODES = {
        DOWN: 40,
        UP: 38,
        ENTER: 13
    };

    function SingleSelleckt(options){
        this.initialize(options);
    }

    _.extend(SingleSelleckt.prototype, {

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

        _parseItemsFromOptions: function($selectEl){
            return _($selectEl.find('option')).reduce(function(memo, option){
                var $option = $(option),
                    item = {
                        value: $option.attr('value'),
                        label: $option.text(),
                        data: $option.data()
                    };

                if($option.is(':selected')){
                    memo.selectedItems.push(item);
                }

                memo.items.push(item);

                return memo;
            }, {
                items: [],
                selectedItems: []
            });
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
                highlightClassName : 'highlighted',
                placeholderText : 'Please select...'
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

            this.placeholderText = settings.placeholderText;

            this.parseItems(this.$originalSelectEl);
        },

        bindEvents: function(){
            var self = this,
                $selected = this.$sellecktEl.find('> .' + this.selectedClass),
                $selectedText = $selected.find('.'+this.selectedTextClass),
                $sellecktEl = this.$sellecktEl,
                itemClass = '.'+this.itemClass,
                trigger = _.bind(this.trigger, this),
                items = this.items,
                highlightClassName = this.highlightClassName;

            function getHighlightIndex(){
                return $sellecktEl.find('.' + self.highlightClassName).index();
            }

            function highlightItem(index){
                self.$sellecktEl
                    .find('.'+self.itemClass)
                    .removeClass(self.highlightClassName)
                    .eq(index)
                    .addClass(self.highlightClassName);
            }

            function selectCurrentItem(){
                var index = getHighlightIndex(),
                    selectedItem = items[index];

                $selectedText.text(selectedItem.label);

                self.selectItem(selectedItem);

                return self._close();
            }

            $selected.on('mousedown', function(e) {
                e.stopPropagation();

                self.$sellecktEl.focus();

                if (self.$items.is(':visible')) {
                    return self._close();
                }

                self._open();

                highlightItem(0);
            });

            $sellecktEl.on('mouseover mouseout', itemClass, function(e){
                var $target = $(e.target);

                if(e.type === 'mouseover'){
                    $target.addClass(highlightClassName);
                    return;
                }

                $target.removeClass(highlightClassName);
            });

            $sellecktEl.on('mousedown', itemClass, function(e){
                e.stopPropagation();

                $sellecktEl.focus();

                selectCurrentItem($(e.target));
            });

            $sellecktEl.on('keydown', function(e){
                e.preventDefault();

                var whichKey = e.which,
                    $target = $(e.target),
                    highlightIndex = getHighlightIndex();

                if(highlightIndex === -1){
                    highlightIndex = 0;
                }

                if(whichKey === KEY_CODES.DOWN){
                    return highlightItem(Math.min(items.length-1, highlightIndex+1));
                }

                if(whichKey === KEY_CODES.UP){
                    return highlightItem(Math.max(0, highlightIndex-1));
                }

                if(whichKey === KEY_CODES.ENTER){
                    if (self.$items.is(':visible')) {
                        return selectCurrentItem();
                    }

                    self._open();

                    highlightItem(0);
                }
            });
        },

        parseItems: function($selectEl){
            var itemsObj = this._parseItemsFromOptions($selectEl);

            this.items = itemsObj.items;

            if(itemsObj.selectedItems[0]){
                this.selectItem(itemsObj.selectedItems[0]);
            }
        },

        selectItem: function(item){
            this.selectedItem = item;
            this.trigger('itemSelected', item);
        },

        getSelection: function(){
            return this.selectedItem;
        },

        render: function(){
            var selectedItem = this.getSelection(),
                $sellecktEl = this.$sellecktEl = $(Mustache.render(this.template, {
                    selectedItemText: selectedItem && selectedItem.label || this.placeholderText,
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

    function MultiSelleckt(options){
        SingleSelleckt.call(this, options);
    }

    MultiSelleckt.prototype = Object.create(SingleSelleckt.prototype);

    MultiSelleckt.prototype.initialize = function(options){
        SingleSelleckt.prototype.initialize.call(this, options);

        this.selectionTemplate = options.selectionTemplate;
        this.selectionsClass = options.selectionsClass || 'selections';
    };

    MultiSelleckt.prototype.selectItem = function(item){
        if(!this.selectedItems){
            this.selectedItems = [];
        }

        this.selectedItems.push(item);
        this.addItem(item);
        this.trigger('itemSelected', item);
    };

    MultiSelleckt.prototype.getSelection = function(){
        return this.selectedItems;
    };

    MultiSelleckt.prototype.parseItems = function($selectEl){
        var itemsObj = this._parseItemsFromOptions($selectEl);

        this.items = itemsObj.items;
        this.selectedItems = itemsObj.selectedItems;
    };

    MultiSelleckt.prototype.render = function(){
        SingleSelleckt.prototype.render.call(this);

        this.$selections = this.$sellecktEl.find('.' + this.selectionsClass);
    };

    MultiSelleckt.prototype.addItem = function(item){
        var $html = $(Mustache.render(this.selectionTemplate, {
                text: item.label,
                value: item.value
            }));

        this.$selections.append($html);
    };

    MicroEvent.mixin(SingleSelleckt);
    MicroEvent.mixin(MultiSelleckt);

    //this is what we return in the AMD module.
    var selleckt = {
        create : function(options){
            var className = options.className,
                Super = !!options.multiple ? MultiSelleckt : SingleSelleckt,
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
                }, options );

            if(sellecktPlugin){
                return;
            }

            sellecktPlugin = selleckt.create(settings);
            $self.data('selleckt', sellecktPlugin);

            sellecktPlugin.render();
        });
    };

    return selleckt;
});