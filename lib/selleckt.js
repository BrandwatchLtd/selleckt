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
        ENTER: 13,
        ESC: 27
    },
    TEMPLATES = {
        SINGLE:
            '<div class="{{className}}" tabindex=1>' +
                '<div class="selected">' +
                    '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
                '</div>' +
                '<ul class="items">' +
                    '{{#showSearch}}' +
                    '<li class="searchContainer">' +
                        '<input class="search"></input>' +
                    '</li>' +
                    '{{/showSearch}}' +
                    '{{{items}}}' +
                '</ul>' +
            '</div>',
        MULTI:
            '<div class="{{className}}" tabindex=1>' +
                '<ul class="selections">' +
                '{{#selections}}' +
                '{{/selections}}' +
                '</ul>' +
                '<div class="selected">' +
                    '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
                '</div>' +
                '<div class="items">' +
                    '<ul>' +
                    '{{{items}}}' +
                    '</ul>' +
                '</div>' +
            '</div>',
        ITEMS: '{{#items}}' +
                '<li class="item" data-text="{{label}}" data-value="{{value}}">' +
                    '<span class="itemText">{{label}}</span>' +
                '</li>' +
                '{{/items}}',
        MULTI_SELECTION:
            '<li class="selectionItem" data-value="{{value}}">' +
                '{{text}}<i class="icon-remove remove"></i>' +
            '</li>'
    };

    function SingleSelleckt(options){
        var settings = _.defaults(options, {
            mainTemplate: TEMPLATES.SINGLE,
            itemsTemplate: TEMPLATES.ITEMS,
            mainTemplateData: {},
            selectedClass : 'selected',
            selectedTextClass : 'selectedText',
            itemsClass : 'items',
            itemClass : 'item',
            className : 'dropdown',
            highlightClass : 'highlighted',
            itemTextClass: 'itemText',
            placeholderText : 'Please select...',
            enableSearch : false,
            searchInputClass : 'search',
            searchThreshold : 0
        });

        this.$originalSelectEl = options.$selectEl;

        this.mainTemplate = this.mainTemplate || parseTemplate(settings.mainTemplate);
        this.itemsTemplate = this.itemsTemplate || parseTemplate(settings.itemsTemplate);
        this.mainTemplateData = settings.mainTemplateData;
        this.selectedClass = settings.selectedClass;
        this.selectedTextClass = settings.selectedTextClass;
        this.itemsClass = settings.itemsClass;
        this.itemClass = settings.itemClass;
        this.itemTextClass = settings.itemTextClass;
        this.searchInputClass = settings.searchInputClass;
        this.className = settings.className;
        this.highlightClass = settings.highlightClass;

        this.placeholderText = settings.placeholderText;

        this.parseItems(this.$originalSelectEl);

        this.showSearch = (settings.enableSearch &&
                            this.items.length > settings.searchThreshold);
    }

    function parseTemplate(template) {
        if (typeof(template) === 'function') {
            return template;
        } else if (typeof(template) === 'string') {
            return Mustache.compile(template);
        } else {
            throw new Error('Please provide a valid mustache template.');
        }
    }

    _.extend(SingleSelleckt.prototype, {

        _open: function() {
            var $sellecktEl = this.$sellecktEl,
                closeFunc;

            if($sellecktEl.hasClass('disabled')){
                return;
            }

            this.$items.show();
            this.$sellecktEl.addClass('open').removeClass('closed');

            closeFunc = _.bind(this._close, this);

            $(document).on('click.selleckt', closeFunc);
        },

        _close: function() {
            this.$items.find('.'+this.highlightClass).removeClass(this.highlightClass);

            this.$items.hide();
            this.$sellecktEl.removeClass('open').addClass('closed');

            if(this.showSearch){
                this.clearSearch();
            }

            $(document).off('click.selleckt', this._close);
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

        bindEvents: function(){
            var self = this,
                itemClass = '.'+this.itemClass,
                searchInputClass = '.'+this.searchInputClass,
                highlightClass = this.highlightClass,
                items = this.items,
                $sellecktEl = this.$sellecktEl,
                $originalSelectEl = this.$originalSelectEl,
                $items = this.$items,
                $selected = $sellecktEl.find('> .' + this.selectedClass),
                $searchInput = $sellecktEl.find(searchInputClass),
                trigger = _.bind(this.trigger, this),
                filterOptions = _.bind(this.filterOptions, this),
                lockMousover = false;

            function getHighlightItem(){
                return $items.find('.' + highlightClass);
            }

            function highlightItem(item){
                $items
                    .find(itemClass)
                    .removeClass(highlightClass);

                item.addClass(highlightClass);
            }

            function selectCurrentItem(){
                var highlightItem = getHighlightItem(),
                    selectedItem = self.findItem(highlightItem.data('value'));

                if(selectedItem){
                    self.selectItem(selectedItem);
                }

                return self._close();
            }

            function scrollItems(offset, absolute){
                lockMousover = true;
                if (absolute) {
                    $items[0].scrollTop = offset;
                } else {
                    $items[0].scrollTop += offset;
                }
                setTimeout(function(){
                    lockMousover = false;
                }, 200);
            }

            $selected.on('click', function(e) {
                e.stopPropagation();

                self.$sellecktEl.focus();

                if (self.$items.is(':visible')) {
                    return self._close();
                }

                self._open();
            });

            $items.on('click', itemClass, function(e){
                e.stopPropagation();

                $sellecktEl.focus();

                selectCurrentItem($(e.target));
            }).on('mouseover', itemClass, function(e){
                if (lockMousover) {
                    return;
                }
                highlightItem($(e.currentTarget));
            });

            $sellecktEl.on('keyup', function(e){
                var keyCode = e.keyCode;

                if(e.keyCode === KEY_CODES.ESC){
                    if($sellecktEl.hasClass('open')){
                        self._close();
                    }
                }
            });

            $sellecktEl.on('keydown', function(e){
                var whichKey = e.which,
                    $target = $(e.target),
                    $currentHighlightItem,
                    $theItems = self.$items.find('.'+self.itemClass),
                    itemsVisibleCount = $theItems.filter(':visible').length,
                    itemToHighlight;

                if(whichKey === KEY_CODES.DOWN){
                    e.preventDefault();

                    $currentHighlightItem = getHighlightItem();
                    itemToHighlight = $currentHighlightItem.nextAll('.'+self.itemClass+':visible').first();

                    if (!$currentHighlightItem.length || !itemToHighlight.length) {
                        itemToHighlight = $theItems.filter(':visible').first();
                        scrollItems(0, true);
                    } else if (itemToHighlight.offset().top + itemToHighlight.outerHeight() > $items.offset().top + $items.outerHeight()) {
                        scrollItems(itemToHighlight.outerHeight());
                    }
                    return highlightItem(itemToHighlight);
                }

                if(whichKey === KEY_CODES.UP){
                    e.preventDefault();

                    $currentHighlightItem = getHighlightItem();
                    itemToHighlight = $currentHighlightItem.prevAll('.'+self.itemClass+':visible').first();

                    if(!$currentHighlightItem.length || !itemToHighlight.length){
                        itemToHighlight = $theItems.filter(':visible').last();
                        scrollItems($items.outerHeight(), true);
                    } else if (itemToHighlight.offset().top < $items.offset().top) {
                        scrollItems(-itemToHighlight.outerHeight());
                    }

                    return highlightItem(itemToHighlight);
                }

                if(whichKey === KEY_CODES.ENTER){
                    e.preventDefault();

                    if (self.$items.is(':visible')) {
                        return selectCurrentItem();
                    }

                    self._open();

                    highlightItem($theItems.filter(':visible').first());
                }
            });

            $originalSelectEl.on('change.selleckt', function(e, data) {
                if(data && data.origin==='selleckt') {
                    return;
                }

                var newSelection = $(e.target).val();
                self.updateSelection(newSelection);
            });

            if(this.showSearch){
                $searchInput.on('click', function(e){
                    e.stopPropagation();
                });

                $searchInput.on('keyup', _.debounce(function(e){
                    e.stopPropagation();

                    var term = $searchInput.val();

                    filterOptions(term);
                }));
            }
        },

        parseItems: function($selectEl){
            var itemsObj = this._parseItemsFromOptions($selectEl);

            this.items = itemsObj.items;

            if(itemsObj.selectedItems[0]){
                this.selectItem(itemsObj.selectedItems[0]);
            }
        },

        convertToOptionElements: function(items){
            return _(items).map(function(item){
                var dataAttributes = _(item.data).map(function(val, key){
                    return 'data-' + key + '="' + val + '"';
                });

                return '<option ' + dataAttributes.join(' ') +
                        ' value="'+ item.value +'">' +
                        item.label +
                        '</option>';
            });
        },

        findItemInList: function(item){
            return this.$sellecktEl.find('.'+this.itemClass+'[data-value="' + item.value + '"]');
        },

        findItem: function(value){
            return _(this.items).find(function(item){
                return item.value == value;
            });
        },

        getItems: function(){
            return this.items;
        },

        setItems: function(items){
            var selectedItem = this.getSelection(),
                replacementSelectedItem;

            this.items = items;

            replacementSelectedItem = this.findItem(selectedItem.value);

            this.refresh();
            this.refreshOriginalSelect();

            if(!selectedItem){
                return;
            }

            if(replacementSelectedItem){
                this.selectItem(replacementSelectedItem);
            } else {
                this.selectedItem = undefined;
                this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
                this.$originalSelectEl.val('');
            }
        },

        hideSelectionFromChoices: function(){
            if(!this.$sellecktEl){
                return;
            }

            if(this.selectedItem){
                this.findItemInList(this.selectedItem).hide();
            }
        },

        selectItem: function(item){
            var selectedItem = this.selectedItem,
                $sellecktEl = this.$sellecktEl;

            if(selectedItem){
                this.findItemInList(selectedItem).show();
            }

            if($sellecktEl){
                this.findItemInList(item).hide();
                $sellecktEl.find('.'+this.selectedTextClass).text(item.label);
            }

            this.selectedItem = item;
            this.$originalSelectEl.val(item.value).trigger('change', {origin: 'selleckt'});

            this.hideSelectionFromChoices();

            this.trigger('itemSelected', item);
        },

        updateSelection: function(newSelection){
            this.selectItem(this.findItem(newSelection));
        },

        getSelection: function(){
            return this.selectedItem;
        },

        getTemplateData: function() {
            var selectedItem = this.getSelection();

            return _.extend(this.mainTemplateData, {
                showSearch : this.showSearch,
                selectedItemText: selectedItem && selectedItem.label || this.placeholderText,
                className : this.className,
                items: this.itemsTemplate({ items: this.items })
            });
        },

        render: function(){
            var templateData = this.getTemplateData(),
                $sellecktEl = this.$sellecktEl = $(this.mainTemplate(templateData)).addClass('closed');

            this.$items = $sellecktEl.find('.'+this.itemsClass);

            this.bindEvents();

            this.$originalSelectEl.hide().before($sellecktEl);

            this.hideSelectionFromChoices();
        },

        refresh: function(){
            var $newItems = this.itemsTemplate({ items: this.items }),
                $oldItems = this.$items.find('.' + this.itemClass);

            $oldItems.not(':first').remove().end().replaceWith($newItems);
        },

        refreshOriginalSelect: function(){
            var newOptionElements = this.convertToOptionElements(this.items);

            this.$originalSelectEl.empty().append(newOptionElements.join(''));
        },

        destroy: function(){
            if(!this.$sellecktEl){
                return;
            }

            //this.$originalSelectEl.after(this.$sellecktEl).show();
            this.$sellecktEl.off().remove();
            this.$originalSelectEl.off('change.selleckt');
            this.$originalSelectEl.removeData('selleckt').show();
        },

        _findMatchingOptions: function(items, term){
            return _(items).map(function(item, index){
                var matchIndex = item.label.toLowerCase().indexOf(term);

                if(matchIndex === -1){
                    return item;
                }

                return (_.extend({}, item, {
                    matchStart: matchIndex,
                    matchEnd: matchIndex + (term.length - 1)
                }));
            });
        },

        clearSearch: function(){
            var $searchInput = this.$sellecktEl.find('.' + this.searchInputClass);

            if(!$searchInput.length){
                return;
            }

            $searchInput.val('');
            this.filterOptions('');
        },

        filterOptions: function(term){
            var items = this.items,
                matches = this._findMatchingOptions(items, term.toLowerCase()),
                selectedItems = [].concat(this.getSelection()),
                selectedIndices = _(selectedItems).reduce(function(memo, item){
                    var idx = _(items).indexOf(item);
                    if(idx !== -1){
                        memo.push(idx);
                    }
                    return memo;
                }, []),
                $theItems = this.$items.find('.' + this.itemClass),
                textClass = '.' + this.itemTextClass,
                markStart = '<mark>',
                markEnd = '</mark>';

            _(matches).each(function(item, index){
                var $item = $theItems.eq(index),
                    $textContainer = $item.find(textClass),
                    isSelectedItem = _(selectedIndices).contains(index),
                    html;

                if(!_.isNumber(item.matchStart)){
                    $textContainer.html(item.label);
                    $item.hide();

                    return;
                }

                html = item.label.substring(0, item.matchStart) +
                        markStart +
                        item.label.slice(item.matchStart, item.matchEnd + 1) +
                        markEnd +
                        item.label.substring(item.matchEnd + 1);

                $textContainer.html(html);

                if(!isSelectedItem){
                    $item.show();
                }
            });
        }
    });

    function MultiSelleckt(options){
        this.mainTemplate = parseTemplate(options.mainTemplate || TEMPLATES.MULTI);
        this.selectionTemplate = parseTemplate(options.selectionTemplate || TEMPLATES.MULTI_SELECTION);

        this.alternatePlaceholder = options.alternatePlaceholder || 'Select another...';
        this.selectionsClass = options.selectionsClass || 'selections';
        this.selectionItemClass = options.selectionItemClass || 'selectionItem';
        this.removeItemClass = options.removeItemClass || 'remove';

        SingleSelleckt.call(this, options);
    }

    MultiSelleckt.prototype = Object.create(SingleSelleckt.prototype);

    MultiSelleckt.prototype.selectItem = function(item){
        var $sellecktEl = this.$sellecktEl;

        if(!this.selectedItems){
            this.selectedItems = [];
        }

        if(_(this.selectedItems).indexOf(item) !== -1){
            return;
        }

        this.selectedItems.push(item);
        this.$selections.append(this.buildItem(item));

        this.$sellecktEl.find('.'+this.selectedTextClass).text(this.alternatePlaceholder);

        this.findItemInList(item).hide();

        this.toggleDisabled();

        this.updateOriginalSelect();

        this.trigger('itemSelected', item);
    };

    MultiSelleckt.prototype.updateOriginalSelect = function(){
        this.$originalSelectEl.val(_(this.getSelection()).map(function(item){
            return item.value;
        })).trigger('change', {origin: 'selleckt'});
    };

    MultiSelleckt.prototype.updateSelection = function(newSelection){
        var self = this,
            currentSelection = _(this.getSelection()).pluck('value'),
            itemsToAdd = _.difference(newSelection, currentSelection),
            itemsToRemove = _.difference(currentSelection, newSelection);

        _(itemsToAdd).each(function(value) {
            self.selectItem(self.findItem(value));
        });

        _(itemsToRemove).each(function(value) {
            self.removeItem(self.findItem(value));
        });
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

        var $selections = this.$selections = this.$sellecktEl.find('.' + this.selectionsClass),
            $selectionItems = $('<div>');

        _(this.getSelection()).each(function(item){
            $selectionItems.append(this.buildItem(item));
        }, this);

        $selections.html($selectionItems.children());
    };

    MultiSelleckt.prototype.bindEvents = function(){
        var removeItem = _.bind(this.removeItem, this),
            selectionItemClass = this.selectionItemClass;

        this.$sellecktEl.on('click', '.'+this.removeItemClass, function(e){
            e.preventDefault();
            e.stopPropagation();

            var $item = $(e.target).closest('.'+selectionItemClass);

            removeItem($item.data('item'));
        });

        SingleSelleckt.prototype.bindEvents.call(this);
    };

    MultiSelleckt.prototype.hideSelectionFromChoices = function(){
        _(this.selectedItems).each(function(item){
            this.findItemInList(item).hide();
        }, this);
    },

    MultiSelleckt.prototype.buildItem = function(item){
        var $html = $(this.selectionTemplate({
            text: item.label,
            value: item.value
        }));

        return $html.data('item', item);
    };

    MultiSelleckt.prototype.removeItem = function(item){
        this.$selections.find('[data-value="' + item.value +'"]').remove();

        this.findItemInList(item).show();

        this.selectedItems = _(this.selectedItems).reject(function(candidate){
            return candidate === item;
        });

        this.updateOriginalSelect();

        this.toggleDisabled();
    };

    MultiSelleckt.prototype.toggleDisabled = function(){
        this.$sellecktEl.toggleClass('disabled', this.selectedItems.length === this.items.length);
    };

    MultiSelleckt.prototype.setItems = function(items){
        var selectedItems = this.getSelection(),
            replacementSelectedItems;

        this.items = items;

        replacementSelectedItems = _(selectedItems).map(function(item){
            return this.findItem(item.value);
        }, this);

        this.refresh();
        this.refreshOriginalSelect();

        // if(replacementSelectedItem){
        //     this.selectItem(replacementSelectedItem);
        // } else {
        //     this.selectedItem = undefined;
        //     this.$originalSelectEl.val('');
        // }
    };

    MicroEvent.mixin(SingleSelleckt);
    MicroEvent.mixin(MultiSelleckt);

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