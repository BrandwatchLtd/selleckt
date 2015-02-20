'use strict';

var TEMPLATES = require('./TEMPLATES');
var templateUtils = require('./templateUtils');
var SingleSelleckt = require('./SingleSelleckt.js');

var $ = require('jquery');
var _ = require('underscore');
var Mustache = require('Mustache');

function MultiSelleckt(options){
    var settings = _.defaults(options, {
        mainTemplate: TEMPLATES.MULTI,
        itemTemplate: TEMPLATES.MULTI_ITEM,
        selectionTemplate: TEMPLATES.MULTI_SELECTION,
        alternatePlaceholder: 'Select another...',
        selectionsClass: 'selections',
        selectionItemClass: 'selectionItem',
        unselectItemClass: 'unselect',
        showEmptyList: false
    });

    this.mainTemplate = settings.mainTemplate;
    this.itemTemplate = settings.itemTemplate;
    this.selectionTemplate = settings.selectionTemplate;

    this.alternatePlaceholder = settings.alternatePlaceholder;
    this.selectionsClass = settings.selectionsClass;
    this.selectionItemClass = settings.selectionItemClass;
    this.unselectItemClass = settings.unselectItemClass;
    this.showEmptyList = settings.showEmptyList;

    templateUtils.cacheTemplate(this.selectionTemplate);

    SingleSelleckt.call(this, settings);
}

MultiSelleckt.prototype = Object.create(SingleSelleckt.prototype);

MultiSelleckt.prototype.selectItem = function(item){
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

MultiSelleckt.prototype.hideSelectionFromChoices = function(){
    _(this.selectedItems).each(function(item){
        this.findItemInList(item).hide();
    }, this);
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

MultiSelleckt.prototype.unselectItem = function(item){
    this.$selections.find('[data-value="' + item.value +'"]').remove();

    this.findItemInList(item).show();

    this.selectedItems = _(this.selectedItems).reject(function(candidate){
        return candidate === item;
    });

    if(!this.selectedItems.length) {
        this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
    }

    this.updateOriginalSelect();

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
