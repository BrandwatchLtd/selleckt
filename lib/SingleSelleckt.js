'use strict';

var KEY_CODES = require('./KEY_CODES');
var TEMPLATES = require('./TEMPLATES');
var templateUtils = require('./templateUtils');

var $ = require('jquery');
var _ = require('underscore');
var Mustache = require('Mustache');
var MicroEvent = require('./MicroEvent');

function SingleSelleckt(options){
    var settings = _.defaults(options, {
        mainTemplate: TEMPLATES.SINGLE,
        itemTemplate: TEMPLATES.SINGLE_ITEM,
        mainTemplateData: {},
        selectedClass : 'selected',
        selectedTextClass : 'selectedText',
        itemsClass : 'items',
        itemslistClass : 'itemslist',
        itemClass : 'item',
        className : 'dropdown selleckt',
        highlightClass : 'highlighted',
        itemTextClass: 'itemText',
        placeholderText : 'Please select...',
        enableSearch : false,
        searchInputClass : 'search',
        searchThreshold : 0
    });

    this.$originalSelectEl = options.$selectEl;

    this.mainTemplate = settings.mainTemplate;
    this.itemTemplate = settings.itemTemplate;
    this.mainTemplateData = settings.mainTemplateData;
    this.selectedClass = settings.selectedClass;
    this.selectedTextClass = settings.selectedTextClass;
    this.itemsClass = settings.itemsClass;
    this.itemslistClass = settings.itemslistClass;
    this.itemClass = settings.itemClass;
    this.itemTextClass = settings.itemTextClass;
    this.searchInputClass = settings.searchInputClass;
    this.className = settings.className;
    this.highlightClass = settings.highlightClass;

    this.placeholderText = settings.placeholderText;

    this.parseItems(this.$originalSelectEl);

    this.showSearch = (settings.enableSearch &&
                        this.items.length > settings.searchThreshold);

    this.id = _.uniqueId('selleckt');

    templateUtils.cacheTemplate(this.mainTemplate);
    templateUtils.cacheTemplate(this.itemTemplate);
}

SingleSelleckt.prototype.DELAY_TIMEOUT = 0;

function getScrollingParent($el){
    var $scrollingParent;

    $el.parents().each(function(idx, elem){
        var $elem = $(elem);
        if(_(['auto', 'scroll']).indexOf($elem.css('overflow-y')) > -1){
            $scrollingParent = $elem;
            return false;
        }
    });

    return $scrollingParent || $(window);
}

function getOverflowHiddenParent($el){
    var $overflowHiddenParent;

    $el.parents().each(function(idx, elem){
        var $elem = $(elem),
            elemOverflowY = $elem.css('overflow-y'),
            elemMaxHeight = $elem.css('max-height');

        if((elemOverflowY==='hidden' && elemMaxHeight!=='auto') || _(['auto', 'scroll']).indexOf(elemOverflowY) > -1){
            $overflowHiddenParent = $elem;
            return false;
        }
    });

    return $overflowHiddenParent;
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

        if(this.showSearch){
            this.clearSearch();
        }

        closeFunc = _.bind(this._close, this);

        $(document).off('click.selleckt-' + this.id);
        $(document).on('click.selleckt-' + this.id, closeFunc);

        if(this._isOverflowing()) {
            this._setItemsFixed();
            this.$scrollingParent.off('scroll.selleckt-' + this.id);
            this.$scrollingParent.on('scroll.selleckt-' + this.id, closeFunc);
        } else {
            this._setItemsAbsolute();
        }

        this.$items.find('.'+this.searchInputClass).focus();
    },

    _close: function(event) {
        var dropdownTrigger = this.$sellecktEl.find('.'+this.selectedClass)[0],
            eventTrigger = event ? $(event.target).closest('.'+this.selectedClass)[0] : undefined;

        // prevent the dropdown from closing immediately when the 'click' event propagates to the document
        if(eventTrigger===dropdownTrigger && event.currentTarget===document) {
            return;
        }

        this.$items.find('.'+this.highlightClass).removeClass(this.highlightClass);
        this.$items.find('.'+this.itemslistClass).scrollTop(0);

        this.$items.hide().removeClass('flipped');
        this.$sellecktEl.removeClass('open').addClass('closed');

        if(this.showSearch){
            this.clearSearch();
        }

        $(document).off('click.selleckt-' + this.id);
        this.$scrollingParent.off('scroll.selleckt-' + this.id);

        this.trigger('close');
    },

    _isOverflowing: function(){
        if(!this.$overflowHiddenParent) {
            return false;
        }

        var $dropdownTrigger = this.$items.prev(),
            itemsBottom = $dropdownTrigger.offset().top + $dropdownTrigger.outerHeight() + this.$items.height(),
            overflowHiddenParentBottom = this.$overflowHiddenParent.offset().top + this.$overflowHiddenParent.height();

        return itemsBottom > overflowHiddenParentBottom;
    },

    _flipIfNeeded: function() {
        var $items = this.$items,
            itemsHeight = $items.outerHeight(),
            $window = $(window),
            windowHeight = $window.height(),
            scrollDistance = $window.scrollTop(),
            dropdownBottom = $items.offset().top - scrollDistance + itemsHeight,
            bottomSpace = windowHeight - dropdownBottom,
            topSpace, $dropdownTrigger, triggerTop, newDropdownBottom;

        if(bottomSpace > -1) { // there's enough space below the trigger
            return;
        }

        $dropdownTrigger = this.$sellecktEl.find('.'+this.selectedClass);
        triggerTop = $dropdownTrigger.offset().top - scrollDistance;
        newDropdownBottom = windowHeight - triggerTop;
        topSpace = windowHeight - (newDropdownBottom + itemsHeight);

        if(topSpace < 0) { // don't go off screen on top
            newDropdownBottom = newDropdownBottom + topSpace;
        }

        // when the dropdown is flipped it is positioned via 'bottom' rather than 'top' so that
        // it won't "detach" from the trigger when the search is used and its height changes
        $items.css({
            top: 'auto',
            bottom: newDropdownBottom
        }).addClass('flipped');
    },

    _setItemsFixed: function(){
        var $dropdownTrigger = this.$sellecktEl.find('.'+this.selectedClass),
            $triggerOffset = $dropdownTrigger.offset(),
            $window = $(window);

        this.$items.css({
            width: 'inherit',
            position: 'fixed',
            top: ($triggerOffset.top - $window.scrollTop() + $dropdownTrigger.outerHeight()) + 'px',
            left: ($triggerOffset.left - $window.scrollLeft()) + 'px',
            bottom: 'auto'
        });

        this._flipIfNeeded();
    },

    _setItemsAbsolute: function(){
        this.$items.css({
            position: 'absolute',
            top: 'auto',
            left: 'auto',
            bottom: 'auto'
        });
    },

    _parseItemsFromOptions: function($selectEl){
        return _($selectEl.find('option')).reduce(function(memo, option){
            var $option = $(option),
                item = {
                    value: $option.val(),
                    label: $option.text(),
                    data: $option.data()
                };

            if($option.attr('selected')){
                memo.selectedItems.push(item);
            }

            memo.items.push(item);

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

    _createSellecktItem: function(item){
        return Mustache.render(this.itemTemplate, _.extend({
            itemClass: this.itemClass,
            itemTextClass: this.itemTextClass,
        }, item));
    },

    _getItemsFromNodes: function(nodeList){
        return _.map(nodeList, function(node){
            return {
                value: node.value,
                label: node.text,
                isSelected: node.selected
            };
        });
    },

    _mutationHandler: function (mutations){
        var createSellecktItem = _.bind(this._createSellecktItem, this),
            $items = this.$sellecktEl.find('.' + this.itemslistClass),
            findItemInList = _.bind(this.findItemInList, this),
            itemsFromNodes = _.bind(this._getItemsFromNodes, this),
            newItems = [],
            removedItems = [];

        _.each(mutations, function(mutation) {
            newItems = newItems.concat(itemsFromNodes(mutation.addedNodes));
            removedItems = removedItems.concat(itemsFromNodes(mutation.removedNodes));
        });

        $items.append(_.map(newItems, createSellecktItem));

        _.each(removedItems, function(item){
            findItemInList(item).remove();
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
            itemClass = '.'+this.itemClass,
            searchInputClass = '.'+this.searchInputClass,
            highlightClass = this.highlightClass,
            $sellecktEl = this.$sellecktEl,
            $originalSelectEl = this.$originalSelectEl,
            $items = this.$items,
            itemslist = $items.find('.'+this.itemslistClass)[0],
            $selected = $sellecktEl.find('> .' + this.selectedClass),
            $searchInput = $sellecktEl.find(searchInputClass),
            filterOptions = _.bind(this.filterOptions, this),
            lockMousover = false,
            scrollNotch2PixelRatio = -40,
            scrollStepPx = 80,
            throttleMs = 50,
            // based on: http://stackoverflow.com/questions/16323770/stop-page-from-scrolling-if-hovering-div/16324663#16324663
            scrollFunc = function(ev) {
                var $this = $(this),
                    scrollTop = this.scrollTop,
                    scrollHeight = this.scrollHeight,
                    height = $this.height(),
                    delta = (ev.type === 'DOMMouseScroll' ?
                            ev.originalEvent.detail * scrollNotch2PixelRatio :
                            ev.originalEvent.wheelDelta),
                    up = delta > 0,
                    prevent = function() {
                        function isOpen(el){
                            return $(el).parents('.selleckt').hasClass('open');
                        }

                        if(!isOpen(ev.target)) {
                            return;
                        }
                        ev.stopPropagation();
                        ev.preventDefault();
                        ev.returnValue = false;
                        return false;
                    };

                delta = up ? scrollStepPx : -scrollStepPx; // hardcode same "scroll step" for all browsers

                if (!up && -delta > scrollHeight - height - scrollTop) {
                    $this.scrollTop(scrollHeight);
                    return prevent();
                }
                if (up && delta > scrollTop) {
                    $this.scrollTop(0);
                    return prevent();
                }

                $this.scrollTop(scrollTop-delta);
                return prevent();
            },
            throttledScrollFunc = _.throttle(scrollFunc, throttleMs);

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
                if(self.selectedItem && self.selectedItem.value === selectedItem.value){
                    return;
                }
                self.selectItem(selectedItem);
            }

            self._close();

            return $sellecktEl.focus();
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

        $selected.on('click', function() {
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

            if(keyCode === KEY_CODES.ESC){
                if($sellecktEl.hasClass('open')){
                    self._close();
                }
            }
        });

        $sellecktEl.on('keydown', function(e){
            var whichKey = e.which,
                $currentHighlightItem,
                $theItems = self.$items.find('.'+self.itemClass),
                $itemToHighlight;

            if(whichKey === KEY_CODES.DOWN){
                e.preventDefault();

                $currentHighlightItem = getHighlightItem();
                $itemToHighlight = $currentHighlightItem.nextAll('.'+self.itemClass+':visible').first();

                if (!$currentHighlightItem.length || !$itemToHighlight.length) {
                    $itemToHighlight = $theItems.filter(':visible').first();
                    scrollItems(0, true);
                } else if ($itemToHighlight.offset().top + $itemToHighlight.outerHeight() > $items.offset().top + $items.outerHeight()) {
                    scrollItems($itemToHighlight.outerHeight());
                }
                return highlightItem($itemToHighlight);
            }

            if(whichKey === KEY_CODES.UP){
                e.preventDefault();

                $currentHighlightItem = getHighlightItem();
                $itemToHighlight = $currentHighlightItem.prevAll('.'+self.itemClass+':visible').first();

                if(!$currentHighlightItem.length || !$itemToHighlight.length){
                    $itemToHighlight = $theItems.filter(':visible').last();
                    scrollItems($itemToHighlight.offset().top, true);
                } else if ($itemToHighlight.offset().top < $items.offset().top + $itemToHighlight.outerHeight()) {
                    scrollItems(-$itemToHighlight.outerHeight());
                }

                return highlightItem($itemToHighlight);
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
            e.stopImmediatePropagation();
        });

        if(this._isOverflowing()) {
            $sellecktEl.find('.'+this.selectedClass+', .'+this.itemsClass+', .'+this.itemslistClass)
                .on('DOMMouseScroll mousewheel', throttledScrollFunc);
        }

        if(this.showSearch){
            $searchInput.on('click', function(e){
                e.stopPropagation();
            });

            $searchInput.on('keyup', _.debounce(function(){
                var term = $searchInput.val();

                filterOptions(term);
            }));
        }
    },

    parseItems: function($selectEl){
        var itemsObj = this._parseItemsFromOptions($selectEl);

        this.items = itemsObj.items;

        if(itemsObj.selectedItems[0]){
            this.selectItem(itemsObj.selectedItems[0], { silent: true });
        }
    },

    findItemInList: function(item){
        return this.$sellecktEl.find('.'+this.itemClass+'[data-value="' + item.value + '"]');
    },

    findItem: function(value){
        return _(this.items).find(function(item){
            /*jshint eqeqeq:false*/
            return item.value == value;
        });
    },

    hideSelectionFromChoices: function(){
        if(!this.$sellecktEl){
            return;
        }

        if(this.selectedItem){
            this.findItemInList(this.selectedItem).hide();
        }
    },

    selectItem: function(item, options){
        var selectedItem = this.selectedItem,
            $sellecktEl = this.$sellecktEl,
            displayedLabel = (item && item.label) || this.placeholderText;

        item = item || {};
        options = options || {};

        if(selectedItem){
            this.findItemInList(selectedItem).show();
        }

        if($sellecktEl){
            this.findItemInList(item).hide();
            $sellecktEl.find('.'+this.selectedTextClass).text(displayedLabel);
        }

        this.selectedItem = item;

        if (!options.silent) {
            this.$originalSelectEl.val(item.value).trigger('change', {origin: 'selleckt'});
        }

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
            selectedClass: this.selectedClass,
            selectedTextClass: this.selectedTextClass,
            itemsClass: this.itemsClass,
            itemslistClass : this.itemslistClass,
            itemClass: this.itemClass,
            itemTextClass: this.itemTextClass,
            searchInputClass: this.searchInputClass,
            items: this.items
        });
    },

    addItems: function(items){
        var selectItem = _.bind(this.selectItem, this);
        var $options = _.map(items, function(item){
            return this._createOptionFromItem(item);
        }, this);

        this.$originalSelectEl.append($options);

        this.items = this.items.concat(items);

        var selectedItem = _.find(items, function(item){
            return item.isSelected;
        });

        if(!selectedItem){
            return;
        }

        _.delay(function(){
            selectItem(selectedItem);
        }, this.DELAY_TIMEOUT);
    },

    addItem: function(item){
        var $option = this._createOptionFromItem(item);
        var selectItem = _.bind(this.selectItem, this);

        $option.appendTo(this.$originalSelectEl);

        this.items.push(item);

        if(!item.isSelected){
            return;
        }

        //defer this because we hook into the mutation
        //event in order to populate Selleckt, and that
        //event fires asynchronously
        _.delay(function(){
            selectItem(item);
        }, this.DELAY_TIMEOUT);
    },

    removeItem: function(value){
        this.items = _.filter(this.items, function(item){
            /*jshint eqeqeq:false*/
            return item.value != value;
        });

        if(this.selectedItem && this.selectedItem.value === value){
            this.selectedItem = undefined;
            this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
        }

        this.$originalSelectEl.find('option[value="' + value +'"]').remove();
    },

    render: function(){
        var templateData = this.getTemplateData(),
            $originalSelectEl = this.$originalSelectEl,
            rendered = Mustache.render(this.mainTemplate, templateData, {
                item: this.itemTemplate
            }),
            $sellecktEl = this.$sellecktEl = $(rendered).addClass('closed');

        this.$items = $sellecktEl.find('.'+this.itemsClass);

        $originalSelectEl.hide().before($sellecktEl);

        this.$scrollingParent = getScrollingParent($sellecktEl);

        this.$overflowHiddenParent = getOverflowHiddenParent($sellecktEl);

        this.bindEvents();

        this._observeMutations($originalSelectEl[0]);

        this.hideSelectionFromChoices();
    },

    destroy: function(){
        if(!this.$sellecktEl){
            return;
        }

        this._stopObservingMutations();

        $(document).off('click.selleckt-' + this.id);
        this.$scrollingParent.off('scroll.selleckt-' + this.id);

        this.$sellecktEl.off().remove();
        this.$originalSelectEl.off('change.selleckt');
        this.$originalSelectEl.removeData('selleckt').show();
    },

    _findMatchingOptions: function(items, term){
        return _(items).map(function(item){

            if (!item.value) {
                return item;
            }

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

            html = _.escape(item.label.substring(0, item.matchStart)) +
                    markStart +
                    _.escape(item.label.slice(item.matchStart, item.matchEnd + 1)) +
                    markEnd +
                    _.escape(item.label.substring(item.matchEnd + 1));

            $textContainer.html(html);

            if(!isSelectedItem){
                $item.show();
            }
        });

        this.$sellecktEl.toggleClass('noitems', !this.$items.find('mark').length);

        this.trigger('optionsFiltered', term);
    }
});

MicroEvent.mixin(SingleSelleckt);
module.exports = SingleSelleckt;
