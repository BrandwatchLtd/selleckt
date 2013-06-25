define(['lib/selleckt'],
    function(Selleckt){
    'use strict';

    describe('selleckt', function(){
        var selleckt,
            mainTemplate =
                '<div class="{{className}}">' +
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
                '</div>',
            $el;

        beforeEach(function(){
            $el = $('<select><option selected value="1">foo</option><option value="2" data-meh="whee" data-bah="oink">bar</option></select>');
        });

        afterEach(function(){
            $el = undefined;

            if(selleckt){
                selleckt.destroy();
                selleckt = undefined;
            }
        });

        describe('Instantiation', function(){
            describe('invalid instantiation', function(){
                it('pukes if instantiated without a "selectedClass" selector', function(){
                    var err;

                    try{
                        selleckt = Selleckt.create({
                            mainTemplate : mainTemplate,
                            $selectEl : $el,
                            className: 'selleckt',
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
                    expect(err.message).toEqual('selleckt must be instantiated with a "selectedClass" option');
                });

                it('pukes if instantiated without a "selectedTextClass" selector', function(){
                    var err;

                    try{
                        selleckt = Selleckt.create({
                            mainTemplate : mainTemplate,
                            $selectEl : $el,
                            className: 'selleckt',
                            selectedClass: 'selected',
                            itemsClass: 'items',
                            itemClass: 'item',
                            selectedClassName: 'isSelected',
                            highlightClassName: 'isHighlighted'
                        });
                    } catch(e){
                        err = e;
                    }

                    expect(err).toBeDefined();
                    expect(err.message).toEqual('selleckt must be instantiated with a "selectedTextClass" option');
                });

                it('pukes if instantiated without a "itemsClass" selector', function(){
                    var err;

                    try{
                        selleckt = Selleckt.create({
                            mainTemplate : mainTemplate,
                            $selectEl : $el,
                            className: 'selleckt',
                            selectedClass: 'selected',
                            selectedTextClass: 'selectedText',
                            itemClass: 'item',
                            selectedClassName: 'isSelected',
                            highlightClassName: 'isHighlighted'
                        });
                    } catch(e){
                        err = e;
                    }

                    expect(err).toBeDefined();
                    expect(err.message).toEqual('selleckt must be instantiated with an "itemsClass" option');
                });

                it('pukes if instantiated without a "itemClass" selector', function(){
                    var err;

                    try{
                        selleckt = Selleckt.create({
                            mainTemplate : mainTemplate,
                            $selectEl : $el,
                            className: 'selleckt',
                            selectedClass: 'selected',
                            selectedTextClass: 'selectedText',
                            itemsClass: 'items',
                            selectedClassName: 'isSelected',
                            highlightClassName: 'isHighlighted'
                        });
                    } catch(e){
                        err = e;
                    }

                    expect(err).toBeDefined();
                    expect(err.message).toEqual('selleckt must be instantiated with an "itemClass" option');
                });
            });

            describe('valid instantation', function(){

                beforeEach(function(){
                    selleckt = Selleckt.create({
                        mainTemplate : mainTemplate,
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClassName: 'isHighlighted'
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
                    expect(selleckt.template).toEqual(mainTemplate);
                });

                it('stores options.selectEl as this.originalSelectEl', function(){
                    expect(selleckt.$originalSelectEl).toEqual($el);
                });

                it('stores options.className as this.className', function(){
                    expect(selleckt.className).toEqual('selleckt');
                });

                it('stores options.highlightClassName as this.highlightClassName', function(){
                    expect(selleckt.highlightClassName).toEqual('isHighlighted');
                });

                describe('items', function(){
                    it('instantiates this.items as an based on the options in the original select', function(){
                        expect(selleckt.items.length).toEqual(2);
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
                });
            });
        });

        describe('rendering', function(){
            beforeEach(function(){
                selleckt = Selleckt.create({
                    mainTemplate : mainTemplate,
                    $selectEl : $el,
                    className: 'selleckt',
                    selectedClass: 'selected',
                    selectedTextClass: 'selectedText',
                    itemsClass: 'items',
                    itemClass: 'item',
                    selectedClassName: 'isSelected',
                    highlightClassName: 'isHighlighted'
                });

                selleckt.render();
            });
            it('renders the selected element based on this.template', function(){
                expect(selleckt.$sellecktEl.find('.selected').length).toEqual(1);
            });
            it('renders the selected text element based on this.template', function(){
                expect(selleckt.$sellecktEl.find('.selectedText').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('.selectedText').text()).toEqual(selleckt.selectedItem.label);            });
            it('renders the items correctly', function(){
                expect(selleckt.$sellecktEl.find('.items').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('.items > .item').length).toEqual(2);
            });
            it('hides the original Select element', function(){
                expect(selleckt.$originalSelectEl.css('display')).toEqual('none');
            });
        });

        describe('Events', function(){
            beforeEach(function(){
                selleckt = Selleckt.create({
                    mainTemplate : mainTemplate,
                    $selectEl : $el,
                    className: 'selleckt',
                    selectedClass: 'selected',
                    selectedTextClass: 'selectedText',
                    itemsClass: 'items',
                    itemClass: 'item',
                    selectedClassName: 'isSelected',
                    highlightClassName: 'isHighlighted'
                });

                selleckt.render();
            });

            describe('showing the options', function(){
                var $selectedItem;

                beforeEach(function(){
                    $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);
                });

                afterEach(function(){
                    $selectedItem = undefined;
                });

                it('shows the options on click on the selected item', function(){
                    var openStub = sinon.stub(selleckt, '_open');

                    selleckt.$sellecktEl.find('.'+selleckt.selectedClass).trigger('mousedown');

                    expect(openStub.calledOnce).toEqual(true);
                });
                it('does not call _open when the options are already showing', function(){
                    var openSpy = sinon.spy(selleckt, '_open'),
                        isStub;

                    $selectedItem.trigger('mousedown');
                    expect(openSpy.calledOnce).toEqual(true);

                    isStub = sinon.stub($.fn, 'is', function(){
                        //stubs out the ':visible' check on
                        return true;
                    });

                    $selectedItem.trigger('mousedown');

                    expect(openSpy.calledOnce).toEqual(true);

                    //sanity check
                    expect(isStub.calledOnce).toEqual(true);
                    expect(isStub.args[0][0]).toEqual(':visible');

                    isStub.restore();
                });
                it('calls "_close" when the body is clicked', function(){
                    var openSpy = sinon.spy(selleckt, '_open'),
                        closeSpy = sinon.spy(selleckt, '_close');

                    $selectedItem.trigger('mousedown');

                    expect(openSpy.calledOnce).toEqual(true);
                    expect(closeSpy.calledOnce).toEqual(false);

                    $(document).trigger('mousedown');

                    expect(openSpy.calledOnce).toEqual(true);
                    expect(closeSpy.calledOnce).toEqual(true);
                });
                it('adds a class of "open" to this.$sellecktEl when the options are shown', function(){
                    $selectedItem.trigger('mousedown');

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);
                });
                it('removes the  "open" class from this.$sellecktEl when the options are hidden', function(){
                    $selectedItem.trigger('mousedown');

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);

                    $(document).trigger('mousedown');

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);
                });
            });

            describe('item selection', function(){
                var $selectedItem;

                beforeEach(function(){
                    $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);
                    $selectedItem.trigger('mousedown');
                });

                it('does not allow multiple items to be selected', function(){
                    var item1 = 'foo',
                        item2 = 'bar';

                    selleckt.selectItem(item1);
                    expect(selleckt.getSelection()).toEqual(item1);

                    selleckt.selectItem(item2);
                    expect(selleckt.getSelection()).toEqual(item2);
                });

                it('stores the selected item as this.selectedItem', function(){
                    expect(selleckt.selectedItem).toEqual({
                        value: '1',
                        label: 'foo',
                        data: {}
                    });

                    selleckt.$sellecktEl.find('li').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li').eq(1).trigger('mouseover').trigger('mousedown');

                    expect(selleckt.selectedItem).toEqual({
                        value: '2',
                        label: 'bar',
                        data: {
                            meh: 'whee',
                            bah: 'oink'
                        }
                    });
                });
                it('updates the text of the selected item container with the selectedItem\'s label', function(){
                    expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('foo');

                    selleckt.$sellecktEl.find('li').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li').eq(1).trigger('mouseover').trigger('mousedown');

                    expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('bar');
                });
                it('triggers an "itemSelected" event with this.selectedItem', function(){
                    var spy = sinon.spy();
                    selleckt.bind('itemSelected', spy);

                    selleckt.$sellecktEl.find('li').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li').eq(1).trigger('mouseover').trigger('mousedown');

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0]).toEqual({
                        value: '2',
                        label: 'bar',
                        data: {
                            meh: 'whee',
                            bah: 'oink'
                        }
                    });
                });
            });


            describe('Keyboard input', function(){
                var $selectedItem,
                    KEY_CODES = {
                        DOWN: 40,
                        UP: 38,
                        ENTER: 13
                    };

                beforeEach(function(){
                    $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);
                    selleckt.$sellecktEl.focus();
                });

                afterEach(function(){
                    $selectedItem = undefined;
                });

                it('opens the items list when enter is pressed on a closed selleckt', function(){
                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.ENTER }));

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);
                });

                it('selects the current item when enter is pressed on an open selleckt', function(){
                    var spy = sinon.spy(),
                        isStub;

                    selleckt.bind('itemSelected', spy);

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.ENTER }));

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);

                    isStub = sinon.stub($.fn, 'is', function(){
                        //stubs out the ':visible' check on
                        return true;
                    });

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.DOWN }));
                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.ENTER }));

                    //sanity check
                    expect(isStub.calledOnce).toEqual(true);
                    expect(isStub.args[0][0]).toEqual(':visible');

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0]).toEqual({
                        value: '2',
                        label: 'bar',
                        data: {
                            meh: 'whee',
                            bah: 'oink'
                        }
                    });

                    isStub.restore();
                });

                it('Highlights the next item when down is pressed', function(){
                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.ENTER }));
                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.DOWN }));

                    expect(selleckt.$items.find('.item').eq(0).hasClass(selleckt.highlightClassName)).toEqual(false);
                    expect(selleckt.$items.find('.item').eq(1).hasClass(selleckt.highlightClassName)).toEqual(true);
                });

                it('Highlights the previous item when up is pressed', function(){
                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.ENTER }));
                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.DOWN }));
                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.UP }));

                    expect(selleckt.$items.find('.item').eq(0).hasClass(selleckt.highlightClassName)).toEqual(true);
                    expect(selleckt.$items.find('.item').eq(1).hasClass(selleckt.highlightClassName)).toEqual(false);
                });
            });
        });
    });

    describe('multiselleckt', function(){
        var multiSelleckt,
            mainTemplate =
                '<div class="{{className}}">' +
                    '<ul class="selections">' +
                    '{{#selections}}' +
                    '{{/selections}}' +
                    '</ul>' +
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
                '</div>',
            multiselectItemTemplate =
                '<li class="selection" data-value="{{value}}">' +
                    '{{text}}' +
                    '<i class="icon-remove"></i>' +
                '</li>',
            $el;

        beforeEach(function(){
            $el = $('<select multiple><option value="1">foo</option><option value="2" data-meh="whee" data-bah="oink">bar</option></select>');

            multiSelleckt = Selleckt.create({
                multiple: true,
                mainTemplate : mainTemplate,
                $selectEl : $el,
                className: 'selleckt',
                selectedClass: 'selected',
                selectedTextClass: 'selectedText',
                itemsClass: 'items',
                itemClass: 'item',
                selectedClassName: 'isSelected',
                highlightClassName: 'isHighlighted'
            });
        });

        afterEach(function(){
            $el = undefined;

            if(multiSelleckt){
                multiSelleckt.destroy();
                multiSelleckt = undefined;
            }
        });

        describe('initialization', function(){
            it('stores options.selectionsClass as this.selectionsClass');
            it('defaults this selectionsClass to "selections"');

            it('stores options.placeholder as this.placeholder');
            it('defaults this.placeholder to "Please select..."');
            it('stores options.alternatePlaceholder as this.alternatePlaceholder');
            it('defaults this.alternatePlaceholder to "Select another..."');
        });

        describe('rendering', function(){
            beforeEach(function(){
                multiSelleckt.render();
            });

            it('renders the selected items in the multiselectItemTemplate');
            it('renders the placeholder text in the selectedText area');
        });

        describe('item selection', function(){
            it('allows multiple items to be selected', function(){
                var item1 = 'foo',
                    item2 = 'bar';

                multiSelleckt.render();

                multiSelleckt.selectItem(item1);
                expect(multiSelleckt.getSelection()).toEqual([item1]);

                multiSelleckt.selectItem(item2);
                expect(multiSelleckt.getSelection()).toEqual([item1, item2]);
            });
        });
    });
});
