'use strict';

function multiSellecktSpecs(MultiSelleckt, templateUtils, $){
    return describe('MultiSelleckt', function(){
        var multiSelleckt,
            $el,
            selectHtml  =
                '<select multiple>' +
                    '<option value="1" selected>foo</option>' +
                    '<option value="2" data-meh="whee" data-bah="oink">bar</option>' +
                    '<option value="3" selected>baz</option>' +
                '</select>',
            mainTemplate =
                '<div class="{{className}} custom" tabindex=1>' +
                    '<ul class="mySelections">' +
                    '{{#selections}}' +
                    '{{/selections}}' +
                    '</ul>' +
                    '<div class="selected">' +
                        '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
                    '</div>' +
                    '<ul class="items">' +
                        '{{#items}}' +
                        '<li class="item" data-text="{{label}}" data-value="{{value}}">' +
                            '{{label}}' +
                        '</li>' +
                        '{{/items}}' +
                    '</ul>' +
                '</div>',
            selectionTemplate =
                '<li class="mySelectionItem custom-item" data-value="{{value}}">' +
                    '{{text}}<i class="icon-remove unselect"></i>' +
                '</li>';

        beforeEach(function(){
            $el = $(selectHtml);
        });

        afterEach(function(){
            $el = undefined;

            if(multiSelleckt){
                multiSelleckt.destroy();
                multiSelleckt = undefined;
            }
        });

        describe('initialization', function(){
            describe('custom options', function(){
                beforeEach(function(){
                    multiSelleckt = new MultiSelleckt({
                        mainTemplate: mainTemplate,
                        selectionTemplate: selectionTemplate,
                        multiple: true,
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedTextClass: 'selectedText',
                        selectionsClass: 'mySelections',
                        selectionItemClass: 'mySelectionItem',
                        placeholderText: 'click me!',
                        alternatePlaceholder: 'click me again!',
                        itemsClass: 'items',
                        itemClass: 'item',
                        unselectItemClass: 'unselectItem',
                        selectedClass: 'isSelected',
                        highlightClass: 'isHighlighted',
                        showEmptyList: true
                    });
                });

                it('stores options.selectionTemplate as this.selectionTemplate',function(){
                    expect(multiSelleckt.selectionTemplate).toEqual(selectionTemplate);
                });
                it('stores options.selectionsClass as this.selectionsClass',function(){
                    expect(multiSelleckt.selectionsClass).toEqual('mySelections');
                });
                it('stores options.selectionItemClass as this.selectionItemClass',function(){
                    expect(multiSelleckt.selectionItemClass).toEqual('mySelectionItem');
                });
                it('stores options.placeholderText as this.placeholderText',function(){
                    expect(multiSelleckt.placeholderText).toEqual('click me!');
                });
                it('stores options.alternatePlaceholder as this.alternatePlaceholder',function(){
                    expect(multiSelleckt.alternatePlaceholder).toEqual('click me again!');
                });
                it('stores options.unselectItemClass as this.unselectItemClass',function(){
                    expect(multiSelleckt.unselectItemClass).toEqual('unselectItem');
                });
                it('stores options.selectedClassName as this.selectedClass',function(){
                    expect(multiSelleckt.selectedClass).toEqual('isSelected');
                });
                it('stores options.highlightClass as this.highlightClass',function(){
                    expect(multiSelleckt.highlightClass).toEqual('isHighlighted');
                });
                it('stores options.showEmptyList as this.showEmptyList',function(){
                    expect(multiSelleckt.showEmptyList).toEqual(true);
                });

                it('caches the selection template', function(){
                    var cacheStub = sinon.stub(templateUtils, 'cacheTemplate');

                    multiSelleckt = new MultiSelleckt({
                        mainTemplate: mainTemplate,
                        selectionTemplate: selectionTemplate,
                        multiple: true,
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedTextClass: 'selectedText',
                        selectionsClass: 'mySelections',
                        selectionItemClass: 'mySelectionItem',
                        placeholderText: 'click me!',
                        alternatePlaceholder: 'click me again!',
                        itemsClass: 'items',
                        itemClass: 'item',
                        unselectItemClass: 'unselectItem',
                        selectedClass: 'isSelected',
                        highlightClass: 'isHighlighted',
                        showEmptyList: true
                    });

                    expect(cacheStub.calledWith(selectionTemplate)).toEqual(true);

                    cacheStub.restore();
                });
            });

            describe('defaults', function(){
                beforeEach(function(){
                    multiSelleckt = new MultiSelleckt({
                        multiple: true,
                        $selectEl : $el
                    });
                });

                it('defaults this.selectionsClass to "selections"',function(){
                    expect(multiSelleckt.selectionsClass).toEqual('selections');
                });
                it('defaults this.selectionItemClass to "selectionItem"',function(){
                    expect(multiSelleckt.selectionItemClass).toEqual('selectionItem');
                });
                it('defaults this.unselectItemClass to "unselect"',function(){
                    expect(multiSelleckt.unselectItemClass).toEqual('unselect');
                });
                it('defaults this.placeholderText to "Please select..."',function(){
                    expect(multiSelleckt.placeholderText).toEqual('Please select...');
                });
                it('defaults this.alternatePlaceholder to "Select another..."',function(){
                    expect(multiSelleckt.alternatePlaceholder).toEqual('Select another...');
                });
                it('defaults this.showEmptyList to false',function(){
                    expect(multiSelleckt.showEmptyList).toEqual(false);
                });
            });
        });

        describe('template formats', function(){
            it('accepts template strings', function(){
                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl : $el,
                    selectionsClass: 'mySelections',
                    selectionItemClass: 'mySelectionItem',
                    mainTemplate : mainTemplate,
                    selectionTemplate : selectionTemplate
                });

                multiSelleckt.render();

                expect(multiSelleckt.$sellecktEl.find('.mySelectionItem').length).toEqual(2);
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectionItemClass).eq(0).text()).toEqual('foo');
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectionItemClass).eq(1).text()).toEqual('baz');
            });
        });

        describe('template data', function(){
            it('includes user configurable class name in main template data', function(){
                var templateData;

                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl: $el,
                    selectionsClass: 'selected-list'
                });

                templateData = multiSelleckt.getTemplateData();

                expect(templateData.selectionsClass).toEqual('selected-list');
            });

            it('includes user configurable class names in item template data', function(){
                var itemData;

                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl: $el,
                    selectionItemClass: 'selected-item',
                    unselectItemClass: 'unselect'
                });

                itemData = multiSelleckt.getItemTemplateData(multiSelleckt.items[0]);

                expect(itemData.selectionItemClass).toEqual('selected-item');
                expect(itemData.unselectItemClass).toEqual('unselect');
            });

            it('includes option data attributes as property of item template data', function(){
                var itemData;

                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl: $el
                });

                itemData = multiSelleckt.getItemTemplateData(multiSelleckt.items[1]);

                expect(itemData.data).toBeDefined();
                expect(itemData.data.meh).toEqual('whee');
                expect(itemData.data.bah).toEqual('oink');
            });
        });

        describe('rendering', function(){
            beforeEach(function(){
                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl : $el
                });

                multiSelleckt.render();
            });

            it('renders the selected items in the multiselectItemTemplate', function(){
                expect(multiSelleckt.getSelection()).toEqual([{
                        value: '1',
                        label: 'foo',
                        data: {}
                    }, {
                        value: '3',
                        label: 'baz',
                        data: {}
                    }]);

                expect(multiSelleckt.$sellecktEl.find('.selectionItem').length).toEqual(2);
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectionItemClass).eq(0).text()).toEqual('foo');
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectionItemClass).eq(1).text()).toEqual('baz');
            });
            it('attaches the item to the selectedItem dom element', function(){
                var selectedItems = multiSelleckt.getSelection();

                expect(selectedItems).toEqual([{
                        value: '1',
                        label: 'foo',
                        data: {}
                    }, {
                        value: '3',
                        label: 'baz',
                        data: {}
                    }]);

                expect(multiSelleckt.$sellecktEl.find('.selectionItem').eq(0).data('item')).toEqual(selectedItems[0]);
                expect(multiSelleckt.$sellecktEl.find('.selectionItem').eq(1).data('item')).toEqual(selectedItems[1]);
            });
        });

        describe('item selection', function(){
            beforeEach(function(){
                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl : $el
                });
            });

            it('allows multiple items to be selected', function(){
                multiSelleckt.render();
                multiSelleckt.selectedItems = [];

                multiSelleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                expect(multiSelleckt.getSelection()).toEqual([{
                    value: '2',
                    label: 'bar',
                    data: {
                        meh: 'whee',
                        bah: 'oink'
                    }
                }]);

                multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseout');
                multiSelleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseover').trigger('click');

                expect(multiSelleckt.getSelection()).toEqual([
                    {
                        value: '2',
                        label: 'bar',
                        data: {
                            meh: 'whee',
                            bah: 'oink'
                        }
                    }, {
                        value: '1',
                        label: 'foo',
                        data: {}
                    }
                ]);
            });

            it('hides the selected item from the list', function(){
                multiSelleckt.selectedItems = [];
                multiSelleckt.render();

                multiSelleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                expect(multiSelleckt.getSelection()).toEqual([{
                    value: '2',
                    label: 'bar',
                    data: {
                        meh: 'whee',
                        bah: 'oink'
                    }
                }]);

                multiSelleckt._open();

                expect(multiSelleckt.$items.find('.item[data-value="2"]').css('display')).toEqual('none');
            });

            it('adds a class of "disabled" to the select if all options are selected', function(){
                multiSelleckt.render();

                multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                expect(multiSelleckt.getSelection().length).toEqual(3);

                expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(true);
            });

            it('does not add a class of "disabled" to the select if all options are selected but options.showEmptyList is true', function(){
                multiSelleckt.destroy();
                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl : $el,
                    showEmptyList: true
                });
                multiSelleckt.render();

                multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                expect(multiSelleckt.getSelection().length).toEqual(3);

                expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(false);
            });

            it('updates the original select element with the new value', function(){
                multiSelleckt.selectedItems = [];
                multiSelleckt.render();

                multiSelleckt.selectItem(multiSelleckt.items[1]);

                expect(multiSelleckt.$originalSelectEl.val()).toEqual([multiSelleckt.items[1].value]);

                multiSelleckt.selectItem(multiSelleckt.items[2]);
                expect(multiSelleckt.$originalSelectEl.val()).toEqual([multiSelleckt.items[1].value, multiSelleckt.items[2].value]);
            });

            describe('item deselection', function(){
                it('removes an item when the "unselect" link is clicked', function(){
                    multiSelleckt.render();

                    expect(multiSelleckt.getSelection().length).toEqual(2);

                    expect(multiSelleckt.$sellecktEl.find('.selectionItem').length).toEqual(2);

                    multiSelleckt.$sellecktEl.find('.selectionItem .unselect').first().trigger('click');

                    expect(multiSelleckt.$sellecktEl.find('.selectionItem').length).toEqual(1);
                });
                it('removes the class of "disabled" from the select if all options were selected but one becomes available', function(){
                    multiSelleckt.render();

                    multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect(multiSelleckt.getSelection().length).toEqual(3);
                    expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(true);

                    multiSelleckt.$sellecktEl.find('.selectionItem .unselect').first().trigger('click');

                    expect(multiSelleckt.getSelection().length).toEqual(2);
                    expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(false);
                });
                it('updates the original select element with the removed value', function(){
                    multiSelleckt.selectedItems = [];
                    multiSelleckt.render();

                    multiSelleckt.selectItem(multiSelleckt.items[1]);

                    expect(multiSelleckt.$originalSelectEl.val()).toEqual([multiSelleckt.items[1].value]);

                    multiSelleckt.selectItem(multiSelleckt.items[2]);
                    expect(multiSelleckt.$originalSelectEl.val()).toEqual([multiSelleckt.items[1].value, multiSelleckt.items[2].value]);

                    multiSelleckt.unselectItem(multiSelleckt.items[2]);

                    expect(multiSelleckt.$originalSelectEl.val()).toEqual([multiSelleckt.items[1].value]);
                });
                it('restores the placeholder text when the selection is cleared', function(){
                    multiSelleckt.render();
                    multiSelleckt.selectItem(multiSelleckt.items[1]);

                    expect(multiSelleckt.selectedItems.length).toEqual(3);
                    expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).text())
                        .toEqual(multiSelleckt.alternatePlaceholder);

                    multiSelleckt.unselectItem(multiSelleckt.items[0]);
                    multiSelleckt.unselectItem(multiSelleckt.items[1]);
                    multiSelleckt.unselectItem(multiSelleckt.items[2]);

                    expect(multiSelleckt.selectedItems.length).toEqual(0);
                    expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).text())
                        .toEqual(multiSelleckt.placeholderText);
                });
            });
        });

        describe('unselecting items', function(){
            var $clickTarget;

            beforeEach(function(){
                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl : $el
                });

                multiSelleckt.render();

                expect(multiSelleckt.getSelection()).toEqual([{
                    value: '1',
                    label: 'foo',
                    data: {}
                }, {
                    value: '3',
                    label: 'baz',
                    data: {}
                }]);

                $clickTarget = multiSelleckt.$sellecktEl.find('.'+multiSelleckt.unselectItemClass).eq(0);
            });
            it('removes the item from the selections when the unselectItem link is clicked', function(){
                var $selections = multiSelleckt.$selections;

                expect($selections.children().length).toEqual(2);

                $clickTarget.trigger('click');

                expect($selections.children().length).toEqual(1);
                expect($selections.children().first().data('item')).toEqual({
                    value: '3',
                    label: 'baz',
                    data: {}
                });
            });
            it('removes the item from the selectedItems array when the remove link is clicked', function(){
               var $selections = multiSelleckt.$selections;

                expect(multiSelleckt.getSelection()).toEqual([{
                    value: '1',
                    label: 'foo',
                    data: {}
                }, {
                    value: '3',
                    label: 'baz',
                    data: {}
                }]);

                $clickTarget.trigger('click');

                expect($selections.children().length).toEqual(1);

                expect(multiSelleckt.getSelection()).toEqual([{
                    value: '3',
                    label: 'baz',
                    data: {}
                }]);
            });
            it('shows the item in the items when the remove link is clicked', function(){
                var $selections = multiSelleckt.$selections;

                expect(multiSelleckt.$sellecktEl.find('.item[data-value="1"]').css('display')).toEqual('none');

                $clickTarget.trigger('click');

                expect($selections.children().length).toEqual(1);
                expect(multiSelleckt.$sellecktEl.find('.item[data-value="1"]').css('display')).not.toEqual('none');
            });
            it('triggers a change event on original select when item is removed', function(){
                var changeHandler = sinon.spy();

                multiSelleckt.$originalSelectEl.on('change', changeHandler);
                $clickTarget.trigger('click');

                expect(changeHandler.calledOnce).toEqual(true);
                expect(changeHandler.args[0].length).toEqual(2);
                expect(changeHandler.args[0][1].origin).toEqual('selleckt');

                multiSelleckt.$originalSelectEl.off('change', changeHandler);
            });
            it('triggers an "itemUnselected" event with the removed item', function(){
                var spy = sinon.spy();

                multiSelleckt.bind('itemUnselected', spy);
                $clickTarget.trigger('click');

                expect(spy.calledOnce).toEqual(true);
                expect(spy.args[0][0]).toEqual({
                    value: '1',
                    label: 'foo',
                    data: {}
                });
            });
        });

        describe('events', function(){
            beforeEach(function(){
                multiSelleckt = new MultiSelleckt({
                    multiple: true,
                    $selectEl : $el
                });
            });

            it('does not open when it has a class of "disabled"', function(){
                multiSelleckt.render();

                multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                expect(multiSelleckt.getSelection().length).toEqual(3);
                expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(true);

                multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedClass).trigger('click');

                expect(multiSelleckt.$sellecktEl.hasClass('open')).toEqual(false);
            });
            it('updates multiSelleckt when change is triggered on original select', function(){
                multiSelleckt.render();

                multiSelleckt.$originalSelectEl.val(['1', '2']).change();

                expect(multiSelleckt.getSelection().length).toEqual(2);
                expect(multiSelleckt.getSelection()[0].value).toEqual('1');
                expect(multiSelleckt.getSelection()[1].value).toEqual('2');
            });
        });
    });
}

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        var selleckt = require('../../lib/selleckt');

        factory(exports,
                selleckt.MultiSelleckt,
                selleckt.templateUtils,
                require('jquery')
            );
    } else {
        // Browser globals
        factory(
            root.MultiSellecktSpecs,
            root.selleckt.MultiSelleckt,
            root.selleckt.templateUtils,
            root.$
        );
    }
}(this, function (exports, MultiSelleckt, templateUtils, $) {
    return multiSellecktSpecs(MultiSelleckt, templateUtils, $);
}));
