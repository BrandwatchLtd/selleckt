!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.selleckt=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var KEY_CODES = {
    DOWN: 40,
    UP: 38,
    ENTER: 13,
    ESC: 27
};

module.exports = KEY_CODES;

},{}],2:[function(require,module,exports){
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
'use strict';

var MicroEvent  = function(){};
MicroEvent.prototype = {
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
MicroEvent.mixin = function(destObject){
    var props  = ['bind', 'unbind', 'trigger'];
    for(var i = 0; i < props.length; i ++){
        destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
    }
};

module.exports = MicroEvent;

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var TEMPLATES = require('./TEMPLATES');
var templateUtils = require('./templateUtils');
var SingleSelleckt = require('./SingleSelleckt.js');

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Mustache = (typeof window !== "undefined" ? window.Mustache : typeof global !== "undefined" ? global.Mustache : null);

function MultiSelleckt(options){
    var settings = _.defaults(options, {
        mainTemplate: TEMPLATES.MULTI,
        itemTemplate: TEMPLATES.MULTI_ITEM,
        selectionTemplate: TEMPLATES.MULTI_SELECTION,
        alternatePlaceholder: 'Select another...',
        selectionsClass: 'selections',
        selectionItemClass: 'selectionItem',
        unselectItemClass: 'unselect',
        showEmptyList: false,
        hideSelectedItem: true
    });

    this.mainTemplate = settings.mainTemplate;
    this.itemTemplate = settings.itemTemplate;
    this.selectionTemplate = settings.selectionTemplate;

    this.alternatePlaceholder = settings.alternatePlaceholder;
    this.selectionsClass = settings.selectionsClass;
    this.selectionItemClass = settings.selectionItemClass;
    this.unselectItemClass = settings.unselectItemClass;
    this.showEmptyList = settings.showEmptyList;
    this.hideSelectedItem = settings.hideSelectedItem;

    templateUtils.cacheTemplate(this.selectionTemplate);

    SingleSelleckt.call(this, settings);
}

MultiSelleckt.prototype = Object.create(SingleSelleckt.prototype);

MultiSelleckt.prototype._mutationHandler = function (mutations){
    var newItems = [],
        removedItems = [],
        selectedItems = [];

    _.forEach(mutations, function(mutation) {
        newItems = newItems.concat(this._getItemsFromNodes(mutation.addedNodes));
        removedItems = removedItems.concat(this._getItemsFromNodes(mutation.removedNodes));
    }, this);

    this.items = this.items.concat(newItems);

    if(removedItems.length){
        _.forEach(removedItems, function(item){
            this.unselectItem(item, {silent: true});
        }, this);

        this.items = _.reject(this.items, function(item){
            return _.any(removedItems, function(removedItem){
                return removedItem.value === item.value;
            });
        });
    }

    _.forEach(this.items, function(item){
        if(item.isSelected){
            this.selectItem(item, {silent: true});
            selectedItems.push(item);
        }
    }, this);

    this.trigger('itemsUpdated', {
        items: this.items,
        newItems: newItems,
        removedItems: removedItems,
        selectedItems: selectedItems
    });
};

MultiSelleckt.prototype._filterSelection = function (items, selection) {
    var selectionValues = _.pluck(selection, 'value');

    return _.filter(items, function(item) {
        return selectionValues.indexOf(item.value) === -1;
    });
};

MultiSelleckt.prototype.selectItem = function(item, options){
    options = options || {};

    if(!this.selectedItems){
        this.selectedItems = [];
    }

    if(_(this.selectedItems).indexOf(item) !== -1){
        return;
    }

    this.selectedItems.push(item);
    this.$selections.append(this.buildItem(item));

    this.$sellecktEl.find('.'+this.selectedTextClass).text(this.alternatePlaceholder);

    this.toggleDisabled();

    if (!options.silent) {
        this.updateOriginalSelect();
        this.trigger('itemSelected', item);
    }
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
        self.unselectItem(self.findItem(value));
    });
};

MultiSelleckt.prototype.getSelection = function(){
    return this.selectedItems;
};

MultiSelleckt.prototype.getTemplateData = function(){
    var data = SingleSelleckt.prototype.getTemplateData.call(this);

    return _.extend(data, {
        selectionsClass: this.selectionsClass
    });
};

MultiSelleckt.prototype.parseItems = function($selectEl){
    var itemsObj = this._parseItemsFromOptions($selectEl);

    this.items = itemsObj.items;
    this.selectedItems = itemsObj.selectedItems;
};

MultiSelleckt.prototype.getItemsForPopup = function() {
    var showSelectedItem = !this.hideSelectedItem;
    var selectedValues = _.map(this.selectedItems, function(item){
        return item.value;
    });

    return showSelectedItem ? this.items : _.filter(this.items, function(item){
        return _.indexOf(selectedValues, item.value) === -1;
    }, this);
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
    var unselectItem = _.bind(this.unselectItem, this),
        selectionItemClass = this.selectionItemClass;

    this.$sellecktEl.on('click', '.'+this.unselectItemClass, function(e){
        e.preventDefault();
        e.stopPropagation();

        var $item = $(e.target).closest('.'+selectionItemClass);

        unselectItem($item.data('item'));
    });

    SingleSelleckt.prototype.bindEvents.call(this);
};

MultiSelleckt.prototype.getItemTemplateData = function(item){
    return {
        text: item.label,
        value: item.value,
        selectionItemClass: this.selectionItemClass,
        unselectItemClass: this.unselectItemClass,
        data: item.data
    };
};

MultiSelleckt.prototype.buildItem = function(item){
    var rendered = Mustache.render(this.selectionTemplate, this.getItemTemplateData(item), {
            item: this.itemTemplate
        }),
        $html = $(rendered);

    return $html.data('item', item);
};

MultiSelleckt.prototype.unselectItem = function(item, options){
    options = options || {};

    this.$selections.find('[data-value="' + item.value +'"]').remove();

    this.selectedItems = _(this.selectedItems).reject(function(candidate){
        return candidate === item;
    });

    if(!this.selectedItems.length) {
        this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
    }

    if(!options.silent){
        this.updateOriginalSelect();
    }

    this.toggleDisabled();

    this.trigger('itemUnselected', item);
};

MultiSelleckt.prototype.toggleDisabled = function(){
    var $sellecktEl = this.$sellecktEl,
        noItemsLeft = this.selectedItems.length === this.items.length;

    $sellecktEl.toggleClass('noitems', noItemsLeft);
    $sellecktEl.toggleClass('disabled', noItemsLeft && !this.showEmptyList);
};

module.exports = MultiSelleckt;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./SingleSelleckt.js":5,"./TEMPLATES":6,"./templateUtils":10}],4:[function(require,module,exports){
(function (global){
'use strict';

var KEY_CODES = require('./KEY_CODES');
var TEMPLATES = require('./TEMPLATES');
var templateUtils = require('./templateUtils');

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Mustache = (typeof window !== "undefined" ? window.Mustache : typeof global !== "undefined" ? global.Mustache : null);
var MicroEvent = require('./MicroEvent');

function createPopup(){
    return $('<div>', {
        'class': 'sellecktPopup selleckt',
    });
}

function attachPopup($popup, $attachTarget){
    $attachTarget.find('.sellecktPopup').remove();
    $popup.appendTo($attachTarget);
}

function SellecktPopup(options){
    var settings = _.defaults(options || {}, {
        template: TEMPLATES.ITEMS_CONTAINER,
        itemTemplate: TEMPLATES.SINGLE_ITEM,
        templateData: {},
        itemsClass : 'items',
        itemslistClass : 'itemslist',
        itemClass : 'item',
        itemTextClass: 'itemText',
        highlightClass : 'highlighted',
        searchInputClass: 'search',
        showSearch: false
    });

    this.template = settings.template;
    this.templateData = settings.templateData;
    this.itemTemplate = settings.itemTemplate;
    this.itemsClass = settings.itemsClass;
    this.itemslistClass = settings.itemslistClass;
    this.itemClass = settings.itemClass;
    this.itemTextClass = settings.itemTextClass;
    this.highlightClass = settings.highlightClass;

    this.searchInputClass = settings.searchInputClass;
    this.showSearch = settings.showSearch;

    templateUtils.cacheTemplate(this.template);
    templateUtils.cacheTemplate(this.itemTemplate);
}

_.extend(SellecktPopup.prototype, {

    open: function($opener, items, options) {
        options = options || {};

        var $popup = this.$popup = createPopup();

        if(options.css){
            $popup.css(options.css);
        }

        this.$opener = $opener;

        this.renderItems(items);

        attachPopup($popup, $('body'));
        this._positionPopup($opener);

        this.bindEvents();
        this._attachResizeHandler($opener);

        if (this.showSearch) {
            $popup.find('.'+this.searchInputClass).focus();
        } else {
            //NB: set the tabindex so we can apply focus, which makes the key handling work
            $popup.find('.'+this.itemClass).first().attr('tabindex',-1).focus();
        }
    },

    close: function() {
        this._removeResizeHandler();

        this.$opener = undefined;

        if(this.$popup){
            this.$popup.remove();
            this.$popup = undefined;

            this.trigger('close');
        }
    },

    getTemplateData: function() {
        return _.extend(this.templateData, {
            showSearch : this.showSearch,
            itemsClass: this.itemsClass,
            itemslistClass : this.itemslistClass,
            itemClass: this.itemClass,
            itemTextClass: this.itemTextClass,
            searchInputClass: this.searchInputClass
        });
    },

    renderItems: function(items) {
        var templateData = _.extend({
                items: items
            }, this.getTemplateData()),
            rendered = Mustache.render(this.template, templateData, {
                item: this.itemTemplate
            });

        this.$popup.html(rendered);
    },

    refreshItems: function(items){
        var $rendered = _.map(items, function(item){
            var itemEl = Mustache.render(this.itemTemplate, _.extend({
                itemTextClass: this.itemTextClass,
                itemClass: this.itemClass
            }, item));

            if(item.matchEnd > 0){
                return this._addMarkToItem(itemEl, item);
            }

            return itemEl;
        }, this);

        this.$popup.find('.'+this.itemslistClass).html($rendered);

        this.$popup.toggleClass('noitems', !items.length);

        if(this.$popup.hasClass('flipped')){
            //we may need to reposition the popup as it's positioned using top
            this._positionPopup(this.$opener, {keepCurrentOrientation: true});
        }
    },

    _addMarkToItem: function(itemEl, item){
        var $itemEl = $(itemEl),
            $textContainer = $itemEl.find('.' + this.itemTextClass),
            markStart = '<mark>',
            markEnd = '</mark>',
            html;

        html = _.escape(item.label.substring(0, item.matchStart)) +
                markStart +
                _.escape(item.label.slice(item.matchStart, item.matchEnd + 1)) +
                markEnd +
                _.escape(item.label.substring(item.matchEnd + 1));

        $textContainer.html(html);

        return $itemEl;
    },

    bindEvents: function() {
        var self = this,
            lockMousover = false,
            highlightClass = this.highlightClass,
            itemClass = '.'+this.itemClass,
            itemslistClass = '.'+this.itemslistClass,
            $popup = this.$popup,
            itemslist = $popup.find(itemslistClass)[0],
            trigger = _.bind(this.trigger, this),
            searchInputClass = '.'+this.searchInputClass,
            $searchInput;

        function getHighlightItem(){
            return $popup.find('.' + highlightClass);
        }

        function highlightItem($item){
            $popup.find(itemClass).removeClass(highlightClass);

            $item.addClass(highlightClass).attr('tabindex', -1).focus();
        }

        function selectItem($target){
            trigger('valueSelected', $target.attr('data-value'));

            self.close();
        }

        function scrollItems(offset, absolute){
            lockMousover = true;
            if (absolute) {
                itemslist.scrollTop = offset;
            } else {
                itemslist.scrollTop += offset;
            }

            _.delay(function(){
                lockMousover = false;
            }, 200);
        }

        $popup.on('mouseover', itemClass, function(e){
            if (lockMousover) {
                return;
            }
            highlightItem($(e.currentTarget));
        });

        $popup.on('click', itemClass, function(e){
            e.preventDefault();

            return selectItem($(e.currentTarget));
        });

        $popup.on('keydown', itemClass, function(e){
            var whichKey = e.which,
                $currentHighlightItem,
                $theItems,
                $itemToHighlight;

            if(whichKey !== KEY_CODES.DOWN && whichKey !== KEY_CODES.UP &&
                whichKey !== KEY_CODES.ENTER && whichKey !== KEY_CODES.ESC){
                return;
            }

            e.preventDefault();

            if(e.which === KEY_CODES.ESC){
                return self.close();
            }

            $currentHighlightItem = getHighlightItem();

            if(e.which === KEY_CODES.ENTER){
                return selectItem($currentHighlightItem);
            }

            $theItems = $popup.find(itemClass);

            if(whichKey === KEY_CODES.DOWN){
                $itemToHighlight = $currentHighlightItem.nextAll(itemClass).first();

                if (!$currentHighlightItem.length || !$itemToHighlight.length) {
                    $itemToHighlight = $theItems.first();
                    scrollItems(0, true);
                } else if ($itemToHighlight.offset().top +
                            $itemToHighlight.outerHeight() >
                            $popup.offset().top +
                            $popup.outerHeight()) {
                    scrollItems($itemToHighlight.outerHeight());
                }

                return highlightItem($itemToHighlight);
            }

            if(whichKey === KEY_CODES.UP){
                $itemToHighlight = $currentHighlightItem.prevAll(itemClass).first();

                if(!$currentHighlightItem.length || !$itemToHighlight.length){
                    $itemToHighlight = $theItems.last();
                    scrollItems($itemToHighlight.offset().top, true);
                } else if ($itemToHighlight.offset().top < $popup.offset().top + $itemToHighlight.outerHeight()) {
                    scrollItems(-$itemToHighlight.outerHeight());
                }

                return highlightItem($itemToHighlight);
            }
        });

        if(this.showSearch){
            $searchInput = $popup.find(searchInputClass);

            $searchInput.on('keydown', function(e){
                var whichKey = e.which;

                if(whichKey === KEY_CODES.ESC){
                    return self.close();
                }

                if(whichKey === KEY_CODES.DOWN){
                    e.stopPropagation();
                    e.preventDefault();

                    return highlightItem($popup.find(itemClass).first());
                }
            });

            $searchInput.on('keyup', _.debounce(function(e){
                var whichKey = e.which;

                if(whichKey === KEY_CODES.ESC || whichKey === KEY_CODES.ENTER){
                    return;
                }

                var term = $searchInput.val();

                trigger('search', term);
            }));
        }

        $popup.on('click', function(e){
            var $target = $(e.target);

            if($target.is(itemClass) || $target.is(searchInputClass)){
                return;
            }
            self.close();
        });
    },

    _positionPopup: function($opener, options){
        options = options || {};

        var $window = $(window),
            windowHeight = $window.height(),
            windowScrollTop = $window.scrollTop(),
            popupHeight = this.$popup.outerHeight(),
            openerHeight = $opener.outerHeight(),
            openerOffset = $opener.offset(),
            viewportBottom = windowScrollTop + windowHeight,
            enoughRoomBelow = viewportBottom > (openerOffset.top + openerHeight + popupHeight),
            showBelow = enoughRoomBelow && !(options.keepCurrentOrientation && this.$popup.hasClass('flipped')),
            css = {
                position: 'absolute',
                left: openerOffset.left,
                top: showBelow ? openerOffset.top + openerHeight : openerOffset.top - popupHeight
            };

        this.$popup.css(css);

        if(options.keepCurrentOrientation !== true){
            this.$popup.toggleClass('flipped', !showBelow);
        }
    },

    _attachResizeHandler: function($opener){
        var $popup = this.$popup,
            positionPopup = _.bind(this._positionPopup, this);

        this.resizeHandler = _.throttle(function(){
            positionPopup($opener, $popup);
        }, 20);

        $(window).on('resize', this.resizeHandler);
    },

    _removeResizeHandler: function(){
        if (this.resizeHandler){
            $(window).off('resize', this.resizeHandler);
            this.resizeHandler = undefined;
        }
    }
});

MicroEvent.mixin(SellecktPopup);
module.exports = SellecktPopup;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./KEY_CODES":1,"./MicroEvent":2,"./TEMPLATES":6,"./templateUtils":10}],5:[function(require,module,exports){
(function (global){
'use strict';

var KEY_CODES = require('./KEY_CODES');
var TEMPLATES = require('./TEMPLATES');
var templateUtils = require('./templateUtils');
var SellecktPopup = require('./SellecktPopup');

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Mustache = (typeof window !== "undefined" ? window.Mustache : typeof global !== "undefined" ? global.Mustache : null);
var MicroEvent = require('./MicroEvent');

function SingleSelleckt(options){
    var settings = _.defaults(options, {
        mainTemplate: TEMPLATES.SINGLE,
        itemTemplate: TEMPLATES.SINGLE_ITEM,
        popupTemplate: TEMPLATES.ITEMS_CONTAINER,
        mainTemplateData: {},
        popupTemplateData: {},
        selectedClass : 'selected',
        selectedTextClass : 'selectedText',
        className : 'dropdown selleckt',
        placeholderText : 'Please select...',
        highlightClass : 'highlighted',
        enableSearch : false,
        searchInputClass : 'search',
        searchThreshold : 0,
        hideSelectedItem: false
    });

    this.$originalSelectEl = options.$selectEl;

    this.mainTemplate = settings.mainTemplate;
    this.itemTemplate = settings.itemTemplate;
    this.popupTemplate = settings.popupTemplate;
    this.mainTemplateData = settings.mainTemplateData;
    this.popupTemplateData = settings.popupTemplateData;
    this.selectedClass = settings.selectedClass;
    this.selectedTextClass = settings.selectedTextClass;
    this.className = settings.className;
    this.placeholderText = settings.placeholderText;
    this.highlightClass = settings.highlightClass;

    this.itemsClass = settings.itemsClass;
    this.itemslistClass = settings.itemslistClass;
    this.itemClass = settings.itemClass;
    this.itemTextClass = settings.itemTextClass;
    this.searchInputClass = settings.searchInputClass;

    this.parseItems(this.$originalSelectEl);

    this.showSearch = (settings.enableSearch &&
                        this.items.length > settings.searchThreshold);

    this.hideSelectedItem = settings.hideSelectedItem;

    this.id = _.uniqueId('selleckt');

    templateUtils.cacheTemplate(this.mainTemplate);
}

function closeEventHandler(context, event){
    var eventTrigger = $(event.target).closest('.'+context.selectedClass)[0];
    var dropdownTrigger = context.$sellecktEl.find('.'+context.selectedClass)[0];
    var $popup = context.popup && context.popup.$popup;

    //prevent the dropdown from closing immediately when the 'click' event propagates to the document
    if(eventTrigger === dropdownTrigger && event.currentTarget === document){
        return;
    }

    var anyParentIsPopup = $popup && _.any($(event.target).parents(), function(parent) {
        return $(parent).is($popup);
    });

    if(anyParentIsPopup){
        return;
    }

    context._close();
}

SingleSelleckt.prototype.DELAY_TIMEOUT = 0;

_.extend(SingleSelleckt.prototype, {

    _open: function() {
        var $sellecktEl = this.$sellecktEl;

        if($sellecktEl.hasClass('disabled')){
            return;
        }

        if(this.popup){
            return;
        }

        this.popup = this._makePopup();

        $sellecktEl.addClass('open').removeClass('closed');

        $(document)
            .off('click.selleckt-' + this.id)
            .on('click.selleckt-' + this.id, _.bind(closeEventHandler, this, this));

        $('body').addClass('no-scroll');
    },

    _close: function() {
        $(document).off('click.selleckt-' + this.id);

        this.$sellecktEl.removeClass('open').addClass('closed');

        this._removePopup();

        this.trigger('close');

        $('body').removeClass('no-scroll');
    },

    _removePopup: function() {
        if(this.popup){
            this.popup.unbind('valueSelected', this.onPopupValueSelected);
            this.popup.close();
            this.popup = undefined;
        }
    },

    getItemsForPopup: function() {
        var showSelectedItem = !this.hideSelectedItem;
        var itemsToShow =  showSelectedItem ? this.items : _.filter(this.items, function(item){
            return this.selectedItem !== item;
        }, this);

        return itemsToShow;
    },

    _makePopup: function() {
        var popup = new SellecktPopup({
            template: this.popupTemplate,
            templateData: this.popupTemplateData,
            itemTemplate: this.itemTemplate,
            itemsClass: this.itemsClass,
            itemslistClass : this.itemslistClass,
            itemClass: this.itemClass,
            itemTextClass: this.itemTextClass,
            searchInputClass: this.searchInputClass,
            showSearch: this.showSearch
        });

        var popupOptions = {
            css: {
                minWidth: this.$sellecktEl.outerWidth() + 'px'
            }
        };

        popup.open(this.$sellecktEl.find('.'+this.selectedClass), this.getItemsForPopup(), popupOptions);

        popup.bind('close', _.bind(this._onPopupClose, this));
        popup.bind('valueSelected', _.bind(this._onPopupValueSelected, this));
        popup.bind('search', _.bind(this._refreshPopupWithSearchHits, this));

        this.trigger('onPopupCreated', popup);

        return popup;
    },

    _onPopupClose: function(){
        if (this.$sellecktEl.hasClass('open')){
            this._close();
        }

        this.$sellecktEl.attr('tabindex', -1).focus();
    },

    _onPopupValueSelected: function(value){
        var item = this.findItem(value);

        this.selectItem(item);
    },

    _filterItems: function(items, term){
        var matchTerm;

        if(!term){
            return items;
        }

        matchTerm = term.toLowerCase();

        return _.reduce(items, function(memo, item){
            var matchIndex;

            if (!item.value) {
                return memo;
            }

            matchIndex = item.label.toLowerCase().indexOf(matchTerm);

            if(matchIndex === -1){
                return memo;
            }

            memo.push(_.extend({}, item, {
                matchStart: matchIndex,
                matchEnd: matchIndex + (term.length - 1)
            }));

            return memo;
        }, []);
    },

    _filterSelection: function(items, selection) {
        return _.filter(items, function(item) {
            return item.value !== selection.value;
        });
    },

    _refreshPopupWithSearchHits: function(term){
        var matchingItems = this._filterItems(this.items, term);
        var hideSelectedItem = this.hideSelectedItem;
        var selectedItem = this.getSelection();
        var itemsToShow;

        if(selectedItem && hideSelectedItem){
            itemsToShow = this._filterSelection(matchingItems, selectedItem);
        } else {
            itemsToShow = matchingItems;
        }

        this.popup.refreshItems(itemsToShow);

        this.trigger('optionsFiltered', term);
    },

    _parseItemsFromOptions: function($selectEl){
        return _.reduce($selectEl.find('option'), function(memo, option){
            var $option = $(option),
                item = {
                    value: $option.val(),
                    label: $option.text(),
                    data: $option.data()
                };

            if($option.attr('selected')){
                memo.selectedItems.push(item);
            }

            if(item.value && item.label){
                memo.items.push(item);
            }

            return memo;
        }, {
            items: [],
            selectedItems: []
        });
    },

    _createOptionFromItem: function(item){
        var $option = $('<option>', {
            selected: item.isSelected,
            value: item.value,
            text: item.label
        });

        if(item.data){
            Object.keys(item.data).forEach(function(key){
                $option.attr('data-' + key, item.data[key]);
            });
        }

        return $option;
    },

    _getItemsFromNodes: function(nodeList){
        return _.map(nodeList, function(node){
            return {
                value: node.value,
                label: node.text,
                isSelected: node.selected || undefined
            };
        });
    },

    _mutationHandler: function (mutations){
        var newItems = [],
            removedItems = [],
            selectedItems = [];

        _.forEach(mutations, function(mutation) {
            newItems = newItems.concat(this._getItemsFromNodes(mutation.addedNodes));
            removedItems = removedItems.concat(this._getItemsFromNodes(mutation.removedNodes));
        }, this);

        this.items = this.items.concat(newItems);

        if(removedItems.length){
            this.items = _.reject(this.items, function(item){
                return _.any(removedItems, function(removedItem){
                    return removedItem.value === item.value;
                });
            });
        }

        _.forEach(this.items, function(item){
            if(item.isSelected){
                this.selectItem(item, {silent: true});
                selectedItems.push(item);
            }
        }, this);

        if(!selectedItems.length){
            this.selectedItem = undefined;

            if(this.$sellecktEl){
                this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
            }
        }

        this.trigger('itemsUpdated', {
            items: this.items,
            newItems: newItems,
            removedItems: removedItems,
            selectedItems: selectedItems
        });
    },

    _observeMutations: function(element){
        // create an observer instance
        var mutationHandler = _.bind(this._mutationHandler, this);
        var observer = this.mutationObserver = new MutationObserver(mutationHandler);

        observer.observe(element, {
            childList: true,
            attributes: false,
            characterData: false,
            subtree: false,
            attributeOldValue: false,
            characterDataOldvalue: false
        });
    },

    _stopObservingMutations: function(){
        this.mutationObserver.disconnect();
    },

    bindEvents: function(){
        var self = this,
            $sellecktEl = this.$sellecktEl,
            $originalSelectEl = this.$originalSelectEl,
            $selected = $sellecktEl.find('> .' + this.selectedClass);

        $sellecktEl.on('keydown', function(e){
            var whichKey = e.which;

            if(whichKey === KEY_CODES.ENTER){
                self._open();
            }
        });

        $selected.on('click', function() {
            self.$sellecktEl.focus();

            if ($sellecktEl.hasClass('open')) {
                return self._close();
            }

            self._open();
        });

        $originalSelectEl.on('change.selleckt', function(e, data) {
            if(data && data.origin === 'selleckt') {
                return;
            }

            var newSelection = $(e.target).val();
            self.updateSelection(newSelection);
            e.stopImmediatePropagation();
        });
    },

    parseItems: function($selectEl){
        var itemsObj = this._parseItemsFromOptions($selectEl);

        this.items = itemsObj.items;

        if(itemsObj.selectedItems[0]){
            this.selectItem(itemsObj.selectedItems[0], { silent: true });
        }
    },

    findItem: function(value){
        return _(this.items).find(function(item){
            /*jshint eqeqeq:false*/
            return item.value == value;
        });
    },

    selectItem: function(item, options){
        var $sellecktEl = this.$sellecktEl,
            displayedLabel = (item && item.label) || this.placeholderText;

        item = item || {};
        options = options || {};

        if(item === this.selectedItem){
            return;
        }

        if($sellecktEl){
            $sellecktEl.find('.'+this.selectedTextClass).text(displayedLabel);
        }

        this.selectedItem = item;

        if (!options.silent) {
            this.$originalSelectEl.val(item.value).trigger('change', {origin: 'selleckt'});
            this.trigger('itemSelected', item);
        }
    },

    selectItemByValue: function(value, options) {
        var item = this.findItem(value);

        if(!item){
            return;
        }

        this.selectItem(item, options);
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
            selectedClass: this.selectedClass,
            selectedTextClass: this.selectedTextClass
        });
    },

    addItems: function(items){
        //stop observing mutations, else we'll get into a loop
        this._stopObservingMutations();

        var $options = _.map(items, function(item){
            return this._createOptionFromItem(item);
        }, this);

        this.$originalSelectEl.append($options);

        this.items = this.items.concat(items);

        _.forEach(items, function(item) {
            if (item.isSelected){
                this.selectItem(item);
            }
        }, this);

        //start observing mutations again
        this._observeMutations(this.$originalSelectEl[0]);
    },

    addItem: function(item){
        //stop observing mutations, else we'll get into a loop
        this._stopObservingMutations();

        this._createOptionFromItem(item).appendTo(this.$originalSelectEl);

        this.items.push(item);

        if(item.isSelected){
            this.selectItem(item);
        }

        //start observing mutations again
        this._observeMutations(this.$originalSelectEl[0]);
    },

    removeItem: function(value){
        //stop observing mutations, else we'll get into a loop
        this._stopObservingMutations();

        this.$originalSelectEl.find('option[value="' + value +'"]').remove();

        this.items = _.filter(this.items, function(item){
            return value !== item.value;
        });

        if(this.selectedItem.value === value){
            if(this.$sellecktEl){
                this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
            }

            this.selectedItem = undefined;
        }

        //start observing mutations again
        this._observeMutations(this.$originalSelectEl[0]);
    },

    render: function(){
        var templateData = this.getTemplateData(),
            $originalSelectEl = this.$originalSelectEl,
            rendered = Mustache.render(this.mainTemplate, templateData),
            $sellecktEl = this.$sellecktEl = $(rendered).addClass('closed');

        $originalSelectEl.hide().before($sellecktEl);

        this.bindEvents();

        this._observeMutations($originalSelectEl[0]);
    },

    destroy: function(){
        if(!this.$sellecktEl){
            return;
        }

        this._removePopup();

        this._stopObservingMutations();

        $(document).off('click.selleckt-' + this.id);

        this.$sellecktEl.off().remove();
        this.$originalSelectEl.off('change.selleckt');
        this.$originalSelectEl.removeData('selleckt').show();
    }
});

MicroEvent.mixin(SingleSelleckt);
module.exports = SingleSelleckt;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./KEY_CODES":1,"./MicroEvent":2,"./SellecktPopup":4,"./TEMPLATES":6,"./templateUtils":10}],6:[function(require,module,exports){
'use strict';

var TEMPLATES = {
    SINGLE:
        '<div class="{{className}}" tabindex=1>' +
            '<div class="{{selectedClass}}">' +
                '<span class="{{selectedTextClass}}">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
            '</div>' +
        '</div>',
    SINGLE_ITEM:
        '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
            '<span class="{{itemTextClass}}">{{label}}</span>' +
        '</li>',
    MULTI:
        '<div class="{{className}}" tabindex=1>' +
            '<ul class="{{selectionsClass}}">' +
            '{{#selections}}' +
            '{{/selections}}' +
            '</ul>' +
            '<div class="{{selectedClass}}">' +
                '<span class="{{selectedTextClass}}">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
            '</div>' +
        '</div>',
    MULTI_ITEM:
        '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
            '{{label}}' +
        '</li>',
    MULTI_SELECTION:
        '<li class="{{selectionItemClass}}" data-value="{{value}}">' +
            '{{text}}<i class="icon-remove {{unselectItemClass}}"></i>' +
        '</li>',
    ITEMS_CONTAINER:
        '<div class="{{itemsClass}}">' +
            '{{#showSearch}}' +
            '<div class="searchContainer">' +
                '<input class="{{searchInputClass}}"></input>' +
            '</div>' +
            '<span class="noitemsText">No items</span>' +
            '{{/showSearch}}' +
            '<ul class="{{itemslistClass}}">' +
                '{{#items}}' +
                    '{{> item}}' +
                '{{/items}}' +
            '</ul>' +
        '</div>'
};

module.exports = TEMPLATES;

},{}],7:[function(require,module,exports){
'use strict';

var SingleSelleckt = require('./SingleSelleckt');
var MultiSelleckt = require('./MultiSelleckt');
var SellecktPopup = require('./SellecktPopup');
var templateUtils = require('./templateUtils');
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
    MultiSelleckt: MultiSelleckt,
    SellecktPopup: SellecktPopup,
    templateUtils: templateUtils
};

jqueryPlugin.mixin(selleckt);

module.exports = selleckt;

},{"./MultiSelleckt":3,"./SellecktPopup":4,"./SingleSelleckt":5,"./sellecktJqueryPlugin":8,"./templateUtils":10}],8:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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

                if(sellecktPlugin){
                    return;
                }

                sellecktPlugin = selleckt.create(settings);
                $self.data('selleckt', sellecktPlugin);

                sellecktPlugin.render();
            });
        };
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
'use strict';
/*
 * This module monkey patches Selleckt for browsers that do not
 * support the MutationObserver.
 * A shim should also be included: https://github.com/megawac/MutationObserver.js
*/

var selleckt = require('../selleckt');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function objectIntersect(arr1, arr2){
    return _.filter(arr1, function(item){
        return !(_.any(arr2, function(otherItem){
            return _.isEqual(item, otherItem);
        }));
    });
}

function getItemsDiff(mutations){
/*jshint validthis:true*/
    var newItems = [],
        removedItems = [],
        itemsFromNodes = _.bind(this._getItemsFromNodes, this);

    _.each(mutations, function(mutation) {
        newItems = newItems.concat(itemsFromNodes(mutation.addedNodes));
        removedItems = removedItems.concat(itemsFromNodes(mutation.removedNodes));
    });

    //the Mutation Observer shim sometimes gets confused when removing nodes
    //let's double check that the nodes are indeed removed (otherwise they
    //appear in the newItems array too)
    var trulyRemoved = objectIntersect(removedItems, newItems);
    var trulyNew = objectIntersect(newItems, removedItems);

    return {
        removedItems: trulyRemoved,
        newItems: trulyNew
    };
}

(function(){
    if(!window.MutationObserver || !window.MutationObserver._period){
        //don't apply the shim
        return;
    }

    selleckt.SingleSelleckt.prototype.DELAY_TIMEOUT = window.MutationObserver._period;

    selleckt.SingleSelleckt.prototype._mutationHandler = function(mutations){
        var itemsDiff = getItemsDiff.call(this, mutations),
            newItems = itemsDiff.newItems,
            removedItems = itemsDiff.removedItems,
            selectedItems = [];

        this.items = this.items.concat(newItems);

        if(removedItems.length){
            this.items = _.reject(this.items, function(item){
                return _.any(removedItems, function(removedItem){
                    return removedItem.value === item.value;
                });
            });
        }

        _.forEach(this.items, function(item){
            if(item.isSelected){
                this.selectItem(item, {silent: true});
                selectedItems.push(item);
            }
        }, this);

        if(!selectedItems.length){
            this.selectedItem = undefined;

            if(this.$sellecktEl){
                this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
            }
        }

        this.trigger('itemsUpdated', {
            items: this.items,
            newItems: newItems,
            removedItems: removedItems,
            selectedItems: selectedItems
        });
    };

    selleckt.MultiSelleckt.prototype._mutationHandler = function(mutations){
        var itemsDiff = getItemsDiff.call(this, mutations),
            newItems = itemsDiff.mutations,
            removedItems = itemsDiff.removedItems,
            selectedItems = [];

        this.items = this.items.concat(newItems);

        if(removedItems.length){
            _.forEach(removedItems, function(item){
                this.unselectItem(item, {silent: true});
            }, this);

            this.items = _.reject(this.items, function(item){
                return _.any(removedItems, function(removedItem){
                    return removedItem.value === item.value;
                });
            });
        }

        _.forEach(this.items, function(item){
            if(item.isSelected){
                this.selectItem(item, {silent: true});
                selectedItems.push(item);
            }
        }, this);

        this.trigger('itemsUpdated', {
            items: this.items,
            newItems: newItems,
            removedItems: removedItems,
            selectedItems: selectedItems
        });
    };
})();

module.exports = selleckt;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../selleckt":7}],10:[function(require,module,exports){
(function (global){
'use strict';

var Mustache = (typeof window !== "undefined" ? window.Mustache : typeof global !== "undefined" ? global.Mustache : null);

module.exports = {
    cacheTemplate: function(template) {
        if(typeof(template) !== 'string'){
            throw new Error('Please provide a valid mustache template.');
        }

        Mustache.parse(template);
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[9])(9)
});