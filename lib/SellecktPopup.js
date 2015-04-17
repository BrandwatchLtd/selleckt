'use strict';

var KEY_CODES = require('./KEY_CODES');
var TEMPLATES = require('./TEMPLATES');
var templateUtils = require('./templateUtils');

var $ = require('jquery');
var _ = require('underscore');
var Mustache = require('Mustache');
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
            $rendered = Mustache.render(this.template, templateData, {
                item: this.itemTemplate
            });

        this.$popup.html($rendered);
    },

    refreshItems: function(items){
        var $rendered = _.map(items, function(item){
            var itemEl = Mustache.render(this.itemTemplate, {
                itemTextClass: this.itemTextClass,
                itemClass: this.itemClass,
                label: item.label,
                value: item.value
            });

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
