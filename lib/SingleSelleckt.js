'use strict';

var KEY_CODES = require('./KEY_CODES');
var TEMPLATES = require('./TEMPLATES');
var templateUtils = require('./templateUtils');
var SellecktPopup = require('./SellecktPopup');

var $ = require('jquery');
var _ = require('underscore');
var Mustache = require('Mustache');
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

    _refreshPopupWithSearchHits: function(term){
        var matchingItems = this._filterItems(this.items, term);

        this.popup.refreshItems(matchingItems);

        if(matchingItems.length < this.items.length){
            this.trigger('optionsFiltered', term);
        }
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
        }

        this.trigger('itemSelected', item);
    },

    selectItemByValue: function(value, options) {
        var item = this.findItem(value);

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
