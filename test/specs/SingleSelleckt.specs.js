'use strict';

function singleSellecktSpecs(SingleSelleckt, templateUtils, $, _){
    return describe('SingleSelleckt', function(){
        var selleckt,
            elHtml =
                '<select>' +
                    '<option selected value="1">foo</option>' +
                    '<option value="2" data-meh="whee" data-bah="oink">bar</option>' +
                    '<option value="3">baz</option>' +
                '</select>',
            $testArea,
            $el,
            sandbox;

        before(function(){
            sandbox = sinon.sandbox.create();

            $testArea = $('<div>', {
                'class': 'testArea',
                css: {
                    position: 'absolute',
                    left: '-999px'
                }
            }).appendTo($('body'));
        });

        beforeEach(function(){
            $el = $(elHtml).appendTo($testArea);
        });

        afterEach(function(){
            $el.remove();
            $el = undefined;

            if(selleckt){
                selleckt.destroy();
                selleckt = undefined;
            }

            $testArea.empty();
            sandbox.restore();
        });

        describe('Instantiation', function(){
            describe('invalid instantiation', function(){
                it('pukes if instantiated with an invalid template format', function(){
                    var err;

                    try{
                        selleckt = new SingleSelleckt({
                            mainTemplate : {template: '<div/>'},
                            $selectEl : $el,
                            className: 'selleckt',
                            selectedClass: 'selected',
                            selectedTextClass: 'selectedText',
                            itemsClass: 'items',
                            itemClass: 'item',
                            selectedClassName: 'isSelected',
                            highlightClassName: 'isHighlighted'
                        });
                    } catch(e){
                        err = e;
                    }

                    expect(err).toBeDefined();
                    expect(err.message).toEqual('Please provide a valid mustache template.');
                });

            });

            describe('valid instantation', function(){
                var template =
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
                        '{{#items}}' +
                            '{{> item}}' +
                        '{{/items}}' +
                    '</ul>' +
                '</div>',
                itemTemplate = '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
                    '<span class="{{itemTextClass}}">{{label}}</span>' +
                '</li>',
                popupTemplate =
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
                '</div>';

                beforeEach(function(){
                    selleckt = new SingleSelleckt({
                        mainTemplate: template,
                        itemTemplate: itemTemplate,
                        popupTemplate: popupTemplate,
                        mainTemplateData: {foo: 'bar'},
                        popupTemplateData: {meh: 'boo'},
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClass: 'isHighlighted',
                        hideSelectedItem: true
                    });
                });

                it('stores the selectedClass as this.selectedClass', function(){
                    expect(selleckt.selectedClass).toEqual('selected');
                });

                it('stores the selectedTextClass as this.selectedClass', function(){
                    expect(selleckt.selectedTextClass).toEqual('selectedText');
                });

                it('stores the itemsClass as this.itemsClass', function(){
                    expect(selleckt.itemsClass).toEqual('items');
                });

                it('stores the itemClass as this.itemClass', function(){
                    expect(selleckt.itemClass).toEqual('item');
                });

                it('stores options.mainTemplate as this.template', function(){
                    expect(selleckt.mainTemplate).toEqual(template);
                });

                it('stores options.itemTemplate as this.itemTemplate', function(){
                    expect(selleckt.itemTemplate).toEqual(itemTemplate);
                });

                it('stores options.popupTemplate as this.popupTemplate', function(){
                    expect(selleckt.popupTemplate).toEqual(popupTemplate);
                });

                it('stores options.mainTemplateData as this.mainTemplateData', function(){
                    expect(selleckt.mainTemplateData).toEqual({foo: 'bar'});
                });

                it('stores options.popupTemplateData as this.popupTemplateData', function(){
                    expect(selleckt.popupTemplateData).toEqual({meh: 'boo'});
                });

                it('stores options.selectEl as this.originalSelectEl', function(){
                    expect(selleckt.$originalSelectEl).toEqual($el);
                });

                it('stores options.className as this.className', function(){
                    expect(selleckt.className).toEqual('selleckt');
                });

                it('stores options.highlightClass as this.highlightClass', function(){
                    expect(selleckt.highlightClass).toEqual('isHighlighted');
                });

                it('stores options.hideSelectedItem as this.hideSelectedItem', function(){
                    expect(selleckt.hideSelectedItem).toEqual(true);
                });

                describe('items', function(){
                    it('instantiates this.items as an based on the options in the original select', function(){
                        expect(selleckt.items.length).toEqual(3);
                    });
                    it('stores the option text as "label"', function(){
                        expect(selleckt.items[0].label).toEqual('foo');
                        expect(selleckt.items[1].label).toEqual('bar');
                    });
                    it('stores the option value as "value"', function(){
                        expect(selleckt.items[0].value).toEqual('1');
                        expect(selleckt.items[1].value).toEqual('2');
                    });
                    it('stores all the option data attributes in "data"', function(){
                        expect(selleckt.items[0].data).toBeDefined();
                        expect(_.size(selleckt.items[0].data)).toEqual(0);

                        expect(selleckt.items[1].data).toBeDefined();
                        expect(_.size(selleckt.items[1].data)).toEqual(2);
                        expect(selleckt.items[1].data).toEqual({
                            meh: 'whee',
                            bah: 'oink'
                        });
                    });
                    it('stores the selected option as this.selectedItem', function(){
                        expect(selleckt.selectedItem).toBeDefined();
                        expect(selleckt.selectedItem).toEqual({
                            value: '1',
                            label: 'foo',
                            data: {}
                        });
                    });
                    it('ignores empty options', function(){
                        var selectHtml = '<select>' +
                            '<option></option>' +
                            '<option value="2">bar</option>' +
                            '<option value="3">baz</option>' +
                            '</select>';

                        selleckt.destroy();

                        var $newEl = $(selectHtml).appendTo($testArea);

                        selleckt = new SingleSelleckt({
                            $selectEl : $newEl
                        });

                        expect(selleckt.items.length).toEqual(2);

                        expect(selleckt.items[0].value).toEqual('2');
                        expect(selleckt.items[0].label).toEqual('bar');

                        expect(selleckt.items[1].value).toEqual('3');
                        expect(selleckt.items[1].label).toEqual('baz');
                    });

                    describe('when there is no selected item already', function(){
                        var $newEl;

                        beforeEach(function(){
                            var selectHtml = '<select>' +
                            '<option value="1">foo</option>' +
                            '<option value="2">bar</option>' +
                            '<option value="3">baz</option>' +
                            '</select>';

                            selleckt.destroy();

                            $newEl = $(selectHtml).appendTo($testArea);

                            selleckt = new SingleSelleckt({
                                mainTemplate: template,
                                $selectEl : $newEl,
                                className: 'selleckt',
                                selectedClass: 'selected',
                                selectedTextClass: 'selectedText',
                                itemsClass: 'items',
                                itemClass: 'item',
                                selectedClassName: 'isSelected',
                                highlightClass: 'isHighlighted'
                            });
                        });

                        afterEach(function(){
                            $newEl.remove();
                            $newEl = undefined;
                        });

                        it('does not select an item', function(){
                            expect(selleckt.selectedItem).toBeUndefined();
                        });
                    });
                });

                describe('template caching', function(){
                    var cacheStub;

                    beforeEach(function(){
                        cacheStub = sinon.stub(templateUtils, 'cacheTemplate');

                        selleckt = new SingleSelleckt({
                            mainTemplate: template,
                            itemTemplate: itemTemplate,
                            $selectEl : $el,
                            className: 'selleckt',
                            selectedClass: 'selected',
                            selectedTextClass: 'selectedText',
                            itemsClass: 'items',
                            itemClass: 'item',
                            selectedClassName: 'isSelected',
                            highlightClass: 'isHighlighted'
                        });
                    });

                    afterEach(function(){
                        cacheStub.restore();
                    });

                    it('caches the main template', function(){
                        expect(cacheStub.calledWith(template)).toEqual(true);
                    });
                });

                describe('events', function(){
                    it('does not trigger change event when instantiated on select with selected option', function(){
                        var onChangeStub = sinon.stub();
                        $el.on('change', onChangeStub);

                        selleckt = new SingleSelleckt({
                            mainTemplate: template,
                            $selectEl : $el,
                            className: 'selleckt',
                            selectedClass: 'selected',
                            selectedTextClass: 'selectedText',
                            itemsClass: 'items',
                            itemClass: 'item',
                            selectedClassName: 'isSelected',
                            highlightClass: 'isHighlighted'
                        });

                        expect(onChangeStub.called).toEqual(false);
                        $el.off('change', onChangeStub);
                    });
                });
            });
        });

        describe('rendering', function(){
            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
            });

            it('renders the selected element based on this.template', function(){
                expect(selleckt.$sellecktEl.find('.selected').length).toEqual(1);
            });

            it('renders the selected text element based on this.template', function(){
                expect(selleckt.$sellecktEl.find('.selectedText').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('.selectedText').text()).toEqual(selleckt.selectedItem.label);
            });

            it('hides the original Select element', function(){
                expect(selleckt.$originalSelectEl.css('display')).toEqual('none');
            });

            it('adds a class of "closed" to the element', function(){
                expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(true);
            });

            it('replaces custom template tags with template data', function(){
                var customTemplate =
                    '<div class="{{className}}">' +
                        '{{#selectLabel}}<label>{{selectLabel}}</label>{{/selectLabel}}' +
                        '{{#required}}<span class="required">*</span>{{/required}}' +
                        '<div class="selected">' +
                            '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
                        '</div>' +
                        '<ul class="items">' +
                            '{{#items}}' +
                            '<li class="item{{#selected}} selected{{/selected}}" data-value="{{value}}">' +
                                '{{label}}' +
                            '</li>' +
                            '{{/items}}' +
                        '</ul>' +
                    '</div>';

                selleckt.destroy();
                selleckt = new SingleSelleckt({
                    $selectEl : $el,
                    mainTemplate: customTemplate,
                    mainTemplateData: {
                        selectLabel: 'Please selleckt',
                        required: false
                    }
                });
                selleckt.render();

                expect(selleckt.$sellecktEl.find('label').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('label').text()).toEqual('Please selleckt');
                expect(selleckt.$sellecktEl.find('.required').length).toEqual(0);
            });
        });

        describe('Adding items', function(){
            var item;

            beforeEach(function(){
                item = {
                    label: 'new',
                    value: 'new value'
                };

                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
            });

            afterEach(function(){
                selleckt.destroy();
                selleckt = undefined;
            });

            describe('using addItem to add a single item', function(){
                it('adds an item to this.items', function(){
                    expect(selleckt.items.length).toEqual(3);

                    selleckt.addItem(item);

                    expect(selleckt.items.length).toEqual(4);
                    expect(selleckt.items[3]).toEqual(item);
                });

                it('appends a new option to the original select', function(){
                    var $originalSelectEl = selleckt.$originalSelectEl;

                    expect($originalSelectEl.children().length).toEqual(3);

                    selleckt.addItem(item);

                    expect($originalSelectEl.children().length).toEqual(4);

                    var newOption = $originalSelectEl.find('option').eq(3);

                    expect(newOption.text()).toEqual('new');
                    expect(newOption.val()).toEqual('new value');
                });

                describe('and the new item has selected:true', function(){
                    var originalSelection;

                    beforeEach(function(){
                        originalSelection = selleckt.$originalSelectEl.find('option:selected');
                        item.isSelected = true;
                    });

                    it('selects the new item in the original select', function(){
                        expect(originalSelection.val()).toEqual('1');

                        selleckt.addItem(item);

                        var newSelection = selleckt.$originalSelectEl.find('option:selected');

                        expect(newSelection.length).toEqual(1);
                        expect(newSelection.val()).toEqual('new value');
                    });

                    it('displays the item text in the selleckt element', function(){
                        selleckt.addItem(item);

                        expect(selleckt.$sellecktEl.find('.'+selleckt.selectedTextClass).text()).toEqual(item.label);
                    });
                });
            });

            describe('using addItems to add an array of items', function(){
                var items;

                beforeEach(function(){
                    items = [
                        { label: 'new 1', value: 'new value 1' },
                        { label: 'new 2', value: 'new value 2' },
                        { label: 'new 3', value: 'new value 3' }
                    ];
                });

                afterEach(function(){
                    items = undefined;
                });

                it('adds the items to this.items', function(){
                    expect(selleckt.items.length).toEqual(3);

                    selleckt.addItems(items);

                    expect(selleckt.items.length).toEqual(6);
                    expect(selleckt.items[3]).toEqual(items[0]);
                    expect(selleckt.items[4]).toEqual(items[1]);
                    expect(selleckt.items[5]).toEqual(items[2]);
                });

                it('appends new options to the original select', function(){
                    var $originalSelectEl = selleckt.$originalSelectEl;

                    expect($originalSelectEl.children().length).toEqual(3);

                    selleckt.addItems(items);

                    expect($originalSelectEl.children().length).toEqual(6);

                    var newOption1 = $originalSelectEl.find('option').eq(3);
                    expect(newOption1.text()).toEqual('new 1');
                    expect(newOption1.val()).toEqual('new value 1');

                    var newOption2 = $originalSelectEl.find('option').eq(4);
                    expect(newOption2.text()).toEqual('new 2');
                    expect(newOption2.val()).toEqual('new value 2');

                    var newOption3 = $originalSelectEl.find('option').eq(5);
                    expect(newOption3.text()).toEqual('new 3');
                    expect(newOption3.val()).toEqual('new value 3');
                });

                describe('and a new item has selected:true', function(){
                    var originalSelection;

                    beforeEach(function(){
                        originalSelection = selleckt.$originalSelectEl.find('option:selected');
                        items[0].isSelected = true;
                    });

                    it('selects the new item in the original select', function(){
                        expect(originalSelection.val()).toEqual('1');

                        selleckt.addItems(items);

                        var newSelection = selleckt.$originalSelectEl.find('option:selected');

                        expect(newSelection.length).toEqual(1);
                        expect(newSelection.val()).toEqual('new value 1');
                    });

                    it('displays the item text in the selleckt element', function(){
                        selleckt.addItems(items);

                        expect(selleckt.$sellecktEl.find('.'+selleckt.selectedTextClass).text()).toEqual(items[0].label);
                    });
                });
            });
        });

        describe('Removing items', function(){
            var removeItemValue;

            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
            });

            afterEach(function(){
                selleckt.destroy();
                selleckt = undefined;
            });

            describe('and the removed item is not selected', function(){
                beforeEach(function(){
                    removeItemValue = selleckt.items[2].value;
                });

                it('removes the item from this.items', function(){
                    expect(selleckt.items.length).toEqual(3);
                    expect(selleckt.findItem(removeItemValue)).toBeDefined();

                    selleckt.removeItem(removeItemValue);

                    expect(selleckt.items.length).toEqual(2);
                    expect(selleckt.findItem(removeItemValue)).toBeUndefined();
                });

                it('removes the option with the corresponding value from the original select', function(){
                    var $originalSelectEl = selleckt.$originalSelectEl;

                    expect($originalSelectEl.children().length).toEqual(3);
                    expect($originalSelectEl.find('option[value="' + removeItemValue + '"]').length).toEqual(1);

                    selleckt.removeItem(removeItemValue);

                    expect($originalSelectEl.children().length).toEqual(2);
                    expect($originalSelectEl.find('option[value="' + removeItemValue + '"]').length).toEqual(0);
                });
            });

            describe('and the removed item is selected', function(){
                beforeEach(function(){
                    removeItemValue = selleckt.selectedItem.value;
                });

                it('sets this.selectedItem to undefined if it has the value of the item being removed', function(){
                    expect(selleckt.selectedItem).toBeDefined();

                    selleckt.removeItem(removeItemValue);

                    expect(selleckt.selectedItem).toBeUndefined();
                });

                it('sets the placeholder text back', function(){
                    expect(selleckt.$sellecktEl.find('.'+selleckt.selectedTextClass).text()).toEqual(selleckt.selectedItem.label);

                    selleckt.removeItem(removeItemValue);

                    expect(selleckt.$sellecktEl.find('.'+selleckt.selectedTextClass).text()).toEqual(selleckt.placeholderText);
                });
            });

        });

        describe('showing the popup', function(){
            var $selectedItem,
                makePopupStub;

            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                makePopupStub = sandbox.stub(selleckt, '_makePopup');

                selleckt.render();

                $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);
            });

            afterEach(function(){
                selleckt._close();

                $selectedItem = undefined;
            });

            it('shows the popup on click on the selected item', function(){
                $selectedItem.trigger('click');

                expect(makePopupStub.calledOnce).toEqual(true);
            });

            it('does not call _makePopup when the popup is already showing', function(){
                $selectedItem.trigger('click');

                expect(makePopupStub.calledOnce).toEqual(true);

                makePopupStub.reset();

                $selectedItem.trigger('click');

                expect(makePopupStub.called).toEqual(false);
            });

            it('calls "_close" when the body is clicked', function(){
                var closeSpy = sandbox.spy(selleckt, '_close');

                selleckt._open();

                $(document).trigger('click');

                expect(closeSpy.calledOnce).toEqual(true);
            });

            it('triggers a "close" event when _close is called', function(){
                var listener = sinon.stub();

                selleckt.bind('close', listener);
                selleckt._close();

                expect(listener.calledOnce).toEqual(true);

                selleckt.unbind('close', listener);
            });

            it('adds a class of "open" to this.$sellecktEl when the selleckt is opened', function(){
                selleckt._open();

                expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);
            });

            it('removes the class of "closed" from this.$sellecktEl when the selleckt is closed', function(){
                expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(true);

                selleckt._open();

                expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(false);
            });

            it('removes the  "open" class from this.$sellecktEl when the selleckt is closed', function(){
                selleckt._open();

                expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);

                selleckt._close();

                expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);
            });

            it('adds a class of "closed" to this.$sellecktEl when the selleckt is closed', function(){
                selleckt._open();

                expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(false);

                selleckt._close();

                expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(true);
            });

            it('binds to click event on document when options are shown', function(){
                var eventsData;

                selleckt._open();

                eventsData = $._data(document, 'events');

                expect(eventsData.click).toBeDefined();
                expect(eventsData.click.length).toEqual(1);
                expect(eventsData.click[0].namespace).toEqual('selleckt-' + selleckt.id);
            });
        });

        describe('popup options', function(){
            var popup;

            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el,
                    itemsClass: 'items',
                    itemslistClass: 'itemslist',
                    itemClass: 'item',
                    itemTextClass: 'itemText',
                    searchInputClass: 'search',
                    showSearch: true
                });

                selleckt.render();
                selleckt._open();

                popup = selleckt.popup;
            });

            afterEach(function(){
                selleckt._close();
            });

            it('passes this.popupTemplate to the popup', function(){
                expect(popup.template).toEqual(selleckt.popupTemplate);
            });

            it('passes this.popupTemplateData to the popup', function(){
                expect(popup.templateData).toEqual(selleckt.popupTemplateData);
            });

            it('passes this.itemTemplate to the popup', function(){
                expect(popup.itemTemplate).toEqual(selleckt.itemTemplate);
            });

            it('passes this.itemsClass to the popup', function(){
                expect(popup.itemsClass).toEqual(selleckt.itemsClass);
            });

            it('passes this.itemslistClass to the popup', function(){
                expect(popup.itemslistClass).toEqual(selleckt.itemslistClass);
            });

            it('passes this.itemClass to the popup', function(){
                expect(popup.itemClass).toEqual(selleckt.itemClass);
            });

            it('passes this.itemTextClass to the popup', function(){
                expect(popup.itemTextClass).toEqual(selleckt.itemTextClass);
            });

            it('passes this.searchInputClass to the popup', function(){
                expect(popup.searchInputClass).toEqual(selleckt.searchInputClass);
            });

            it('passes this.showSearch to the popup', function(){
                expect(popup.showSearch).toEqual(selleckt.showSearch);
            });
        });

        describe('item selection', function(){
            var popup;

            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
                selleckt._open();

                popup = selleckt.popup;
            });

            afterEach(function(){
                selleckt._close();
            });

            it('does not allow multiple items to be selected', function(){
                popup.trigger('valueSelected', '2');

                expect(selleckt.selectedItem).toEqual({
                    value: '2',
                    label: 'bar',
                    data: {
                        bah: 'oink',
                        meh: 'whee'
                    }
                });

                popup.trigger('valueSelected', '1');

                expect(selleckt.selectedItem).toEqual({
                    value: '1',
                    label: 'foo',
                    data: {}
                });
            });

            it('updates the text of the selected item container with the selectedItem\'s label', function(){
                popup.trigger('valueSelected', '2');

                expect(selleckt.$sellecktEl.find('.'+selleckt.selectedTextClass).text()).toEqual('bar');
            });

            it('triggers an "itemSelected" event with this.selectedItem', function(){
                var spy = sandbox.spy();

                selleckt.bind('itemSelected', spy);

                popup.trigger('valueSelected', '2');

                expect(spy.calledOnce).toEqual(true);
                expect(spy.args[0][0]).toEqual(selleckt.selectedItem);
            });

            it('does not trigger an event when the selected item is clicked, were it to be unhidden', function(){
                var spy = sinon.spy();

                popup.trigger('valueSelected', '1');

                selleckt.bind('itemSelected', spy);

                popup.trigger('valueSelected', '1');
                expect(spy.called).toEqual(false);
            });

            it('updates the original select element with the new value', function(){
                popup.trigger('valueSelected', '2');

                expect(selleckt.$originalSelectEl.val()).toEqual('2');
            });

            it('updates selleckt when change is triggered on original select', function(){
                selleckt.$originalSelectEl.val('2').change();

                expect(selleckt.getSelection().value).toEqual('2');
            });

            it('updates selleckt when change is triggered on original select with no value', function(){
                selleckt.$originalSelectEl.val('').change();

                expect(selleckt.getSelection().value).toBeUndefined();
            });

            it('does not update selleckt when change on original select is triggered by selleckt itself', function(){
                selleckt.$originalSelectEl.val('2').trigger('change', {origin: 'selleckt'});

                expect(selleckt.getSelection().value).toEqual('1');
            });

            it('triggers a change event on original select when item is selected', function(){
                var changeHandler = sinon.spy();

                selleckt.$originalSelectEl.on('change', changeHandler);

                popup.trigger('valueSelected', '2');

                expect(changeHandler.calledOnce).toEqual(true);
                expect(changeHandler.args[0].length).toEqual(2);
                expect(changeHandler.args[0][1].origin).toEqual('selleckt');

                selleckt.$originalSelectEl.off('change', changeHandler);
            });

            describe('with an empty option', function(){
                it('displays the placeholder when the change event is triggered on ' +
                        'the original select and its value is the empty string', function(){

                    selleckt.$originalSelectEl.append('<option></option>');

                    selleckt.$originalSelectEl.val('').trigger('change');

                    var emptyOptionDisplayedText = selleckt.$sellecktEl.find('.selectedText').text();

                    expect(emptyOptionDisplayedText).toEqual(selleckt.placeholderText);
                });
            });

            describe('hiding the selected item', function(){
                it('hides the selected item from the list if this.hideSelectedItem == true', function(){
                    expect(selleckt.getItemsForPopup().length).toEqual(3);

                    selleckt.hideSelectedItem = true;

                    expect(selleckt.getItemsForPopup().length).toEqual(2);
                });
                it('does not hide the selected item from the list if this.hideSelectedItem == false', function(){
                    expect(selleckt.getItemsForPopup().length).toEqual(3);

                    selleckt.hideSelectedItem = false;

                    expect(selleckt.getItemsForPopup().length).toEqual(3);
                });
            });
        });

        describe('Keyboard input', function(){
            var $selectedItem,
                KEY_CODES = {
                    DOWN: 40,
                    UP: 38,
                    ENTER: 13,
                    ESC: 27
                };

            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();

                $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);

                selleckt.$sellecktEl.focus();
            });

            afterEach(function(){
                selleckt._close();
                $selectedItem = undefined;
            });

            it('opens the items list when enter is pressed on a closed selleckt', function(){
                expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);

                var makePopupStub = sandbox.stub(selleckt,  '_makePopup');

                $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.ENTER }));

                expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);

                expect(makePopupStub.calledOnce).toEqual(true);
            });

            it('resets focus to selleckt after item is selected', function(){
                selleckt._open();
                selleckt.popup.trigger('itemSelected', '2');

                var focusStub = sandbox.stub($.fn, 'focus');
                selleckt.popup.close();

                expect(focusStub.callCount).toEqual(1);
                expect(focusStub.thisValues[0].is(selleckt.$sellecktEl)).toEqual(true);
            });
        });

        describe('search', function(){
            var selectHtml = '<select>' +
                    '<option value>Empty</option>' +
                    '<option value="foo">foo</option>' +
                    '<option value="bar">bar</option>' +
                    '<option value="baz">baz</option>' +
                    '<option value="foofoo">foofoo</option>' +
                    '<option value="foobaz">foobaz</option>' +
                    '</select>';

            var $searchInput;

            afterEach(function(){
                selleckt._close();
                $searchInput = undefined;
            });

            describe('rendering', function(){
                it('shows the search input if settings.enableSearch is true and ' +
                    'there are more items than options.searchThreshold', function(){
                    selleckt = new SingleSelleckt({
                        $selectEl : $(selectHtml),
                        enableSearch: true,
                        searchThreshold: 0
                    });

                    selleckt.render();
                    selleckt._open();

                    expect(selleckt.popup.$popup.find('.' + selleckt.searchInputClass).length).toEqual(1);
                });

                it('does not display a searchbox if settings.enableSearch is true and ' +
                        'there are fewer items than options.searchThreshold', function(){
                    selleckt = new SingleSelleckt({
                        $selectEl : $(selectHtml),
                        enableSearch: true,
                        searchThreshold: 100
                    });

                    selleckt.render();
                    selleckt._open();

                    expect(selleckt.popup.$popup.find('.' + selleckt.searchInputClass).length).toEqual(0);
                });

                it('does not display a searchbox if settings.enableSearch is false', function(){
                    selleckt = new SingleSelleckt({
                        $selectEl : $(selectHtml),
                        enableSearch: false
                    });

                    selleckt.render();
                    selleckt._open();

                    expect(selleckt.popup.$popup.find('.' + selleckt.searchInputClass).length).toEqual(0);
                });
            });
        });

        describe('filtering', function(){
            it('filters out options with empty values', function(){
                var selleckt = new SingleSelleckt({
                    $selectEl: $('<select>')
                });

                selleckt.items = [
                    {label: 'Empty'},
                    {label: 'Foo', value: '1'},
                ];

                var filteredItems = selleckt._filterItems(selleckt.items, 'foo');

                expect(filteredItems.length).toEqual(1);
                expect(filteredItems[0]).toEqual({ label: 'Foo', value: '1', matchStart: 0, matchEnd: 2 });
            });

            it('can annotate the items with matchIndexes', function(){
                var selleckt = new SingleSelleckt({
                    $selectEl: $('<select>')
                });

                selleckt.items = [
                    {label: 'foo', value: 'foo'},
                    {label: 'bar', value: 'bar'},
                    {label: 'baz', value: 'baz'},
                    {label: 'foofoo', value: 'foofoo'},
                    {label: 'foobaz', value: 'foobaz'}
                ];

                var filteredItems = selleckt._filterItems(selleckt.items, 'ba');

                expect(filteredItems).toEqual([
                    { label: 'bar', value: 'bar', matchStart: 0, matchEnd: 1 },
                    { label: 'baz', value: 'baz', matchStart: 0, matchEnd: 1 },
                    { label: 'foobaz', value: 'foobaz', matchStart: 3, matchEnd: 4 }
                ]);
            });

            it('triggers an "optionsFiltered" event after filtering, passing the filter term', function(){
                var spy = sandbox.spy();

                selleckt = new SingleSelleckt({
                    $selectEl : $('<select><option value="foo">foo</option><option value="bar">bar</option></select>'),
                    enableSearch: true,
                    searchThreshold: 0
                });

                selleckt.render();
                selleckt._open();

                selleckt.bind('optionsFiltered', spy);

                selleckt._refreshPopupWithSearchHits('ba');

                expect(spy.callCount).toEqual(1);
                expect(spy.args[0][0]).toEqual('ba');

                selleckt._close();
                selleckt.destroy();
            });
        });

        describe('removal', function(){
            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });
                selleckt.render();
            });
            afterEach(function(){
                selleckt = undefined;
            });

            it('removes change event from original select element', function(){
                var eventsData = $._data(selleckt.$originalSelectEl[0], 'events');

                expect(eventsData.change).toBeDefined();
                expect(eventsData.change.length).toEqual(1);
                expect(eventsData.change[0].namespace).toEqual('selleckt');

                selleckt.destroy();

                expect(eventsData.change).toEqual(undefined);
            });

            it('removes selleckt data from original select element', function(){
                $el.data('selleckt', selleckt);

                selleckt.destroy();

                expect($el.data('selleckt')).toEqual(undefined);
            });

            it('shows original select element', function(){
                expect($el.css('display')).toEqual('none');

                selleckt.destroy();

                expect($el.css('display')).toEqual('inline-block');
            });

            it('stops observing mutation events', function(){
                var stopObservingMutationsSpy = sinon.spy(selleckt, '_stopObservingMutations');

                selleckt.destroy();

                expect(stopObservingMutationsSpy.calledOnce).toEqual(true);
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

        factory(exports = singleSellecktSpecs,
                selleckt.SingleSelleckt,
                selleckt.templateUtils,
                require('jquery'),
                require('underscore')
            );
    } else {
        // Browser globals
        factory(
            root.singleSellecktSpecs,
            root.selleckt.SingleSelleckt,
            root.selleckt.templateUtils,
            root.$,
            root._
        );
    }
}(this, function (exports, SingleSelleckt, templateUtils, $, _) {
    return singleSellecktSpecs(SingleSelleckt, templateUtils, $, _);
}));
