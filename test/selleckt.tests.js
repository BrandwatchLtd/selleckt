define(['lib/selleckt', 'lib/mustache.js'],
    function(Selleckt, Mustache){
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
            $el = $('<select>\
                        <option selected value="1">foo</option>\
                        <option value="2" data-meh="whee" data-bah="oink">bar</option>\
                        <option value="3">baz</option>\
                    </select>').appendTo('body');
        });

        afterEach(function(){
            $el.remove();
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
                            highlightClass: 'isHighlighted'
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
                            highlightClass: 'isHighlighted'
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
                            highlightClass: 'isHighlighted'
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
                            highlightClass: 'isHighlighted'
                        });
                    } catch(e){
                        err = e;
                    }

                    expect(err).toBeDefined();
                    expect(err.message).toEqual('selleckt must be instantiated with an "itemClass" option');
                });

                it('pukes if instantiated with an invalid template format', function(){
                    var err;

                    try{
                        selleckt = Selleckt.create({
                            mainTemplate : {template: mainTemplate},
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
                        highlightClass: 'isHighlighted'
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
                    expect(selleckt.template({})).toEqual(Mustache.compile(mainTemplate)({}));
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
                });
            });

            describe('template formats', function(){
                it('accepts template strings', function(){
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
                    expect(selleckt.$sellecktEl.find('.items').length).toEqual(1);
                    expect(selleckt.$sellecktEl.find('.items > .item').length).toEqual(3);
                });

                it('accepts compiled templates', function(){
                    selleckt = Selleckt.create({
                        mainTemplate : Mustache.compile(mainTemplate),
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
                    expect(selleckt.$sellecktEl.find('.items').length).toEqual(1);
                    expect(selleckt.$sellecktEl.find('.items > .item').length).toEqual(3);
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
                    highlightClass: 'isHighlighted'
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
            it('renders the items correctly', function(){
                expect(selleckt.$sellecktEl.find('.items').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('.items > .item').length).toEqual(3);
            });
            it('hides the original Select element', function(){
                expect(selleckt.$originalSelectEl.css('display')).toEqual('none');
            });
            it('adds a class of "closed" to the element', function(){
                expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(true);
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
                    highlightClass: 'isHighlighted'
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
                    var openStub = sinon.stub(selleckt, '_open'),
                        isStub = sinon.stub($.fn, 'is').returns(false);

                    selleckt.$sellecktEl.find('.'+selleckt.selectedClass).trigger('click');

                    expect(openStub.calledOnce).toEqual(true);

                    isStub.restore();
                });
                it('does not call _open when the options are already showing', function(){
                    var openSpy = sinon.spy(selleckt, '_open'),
                        isStub = sinon.stub($.fn, 'is').returns(true);

                    $selectedItem.trigger('click');
                    expect(openSpy.calledOnce).toEqual(false);

                    isStub.restore();
                });
                it('calls "_close" when the body is clicked', function(){
                    var openSpy = sinon.spy(selleckt, '_open'),
                        closeSpy = sinon.spy(selleckt, '_close');

                    selleckt._open();

                    $(document).trigger('click');

                    expect(openSpy.calledOnce).toEqual(true);
                    expect(closeSpy.calledOnce).toEqual(true);
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
            });

            describe('item selection', function(){
                var $selectedItem;

                beforeEach(function(){
                    $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);
                    $selectedItem.trigger('click');
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

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

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

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('bar');
                });
                it('triggers an "itemSelected" event with this.selectedItem', function(){
                    var spy = sinon.spy();
                    selleckt.bind('itemSelected', spy);

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

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
                it('hides the selected item from the list', function(){
                    expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');
                });
                it('shows the previously-selected item in the list', function(){
                    expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect(selleckt.$items.find('.item[data-value="1"]').css('display')).not.toEqual('none');
                    expect(selleckt.$items.find('.item[data-value="2"]').css('display')).toEqual('none');
                });
                it('highlights the current item and de-highlights all other items on mouseover', function(){
                    var liOne = selleckt.$sellecktEl.find('li.item').eq(0), liTwo = selleckt.$sellecktEl.find('li.item').eq(1);
                    expect(liTwo.hasClass('isHighlighted')).toEqual(false);

                    liOne.trigger('mouseover');
                    expect(liOne.hasClass('isHighlighted')).toEqual(true);
                    liOne.trigger('mouseout');
                    expect(liOne.hasClass('isHighlighted')).toEqual(true);
                    liTwo.trigger('mouseover')
                    expect(liOne.hasClass('isHighlighted')).toEqual(false);
                    expect(liTwo.hasClass('isHighlighted')).toEqual(true);

                });
                it('removes the highlight class from all items when it closes', function(){
                    expect(selleckt.$sellecktEl.find('li.item').eq(1).hasClass('isHighlighted')).toEqual(false);

                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover');

                    expect(selleckt.$sellecktEl.find('li.isHighlighted').length).toEqual(1);

                    selleckt._close();

                    expect(selleckt.$sellecktEl.find('li.isHighlighted').length).toEqual(0);
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
                    var isStub = sinon.stub($.fn, 'is').returns(false);

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.ENTER }));

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);

                    expect(isStub.calledOnce).toEqual(true);
                    expect(isStub.calledOn(selleckt.$items)).toEqual(true);
                    expect(isStub.calledWith(':visible')).toEqual(true);

                    isStub.restore();
                });

                it('selects the current item when enter is pressed on an open selleckt', function(){
                    var spy = sinon.spy(),
                        isStub;

                    selleckt.bind('itemSelected', spy);

                    selleckt._open();

                    isStub = sinon.stub($.fn, 'is').returns(true);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.DOWN }));
                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.ENTER }));

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

                it('Highlights the next item when DOWN is pressed, the previous when UP is pressed', function(){
                    var liOne = selleckt.$items.find('.item').eq(0),
                        liTwo = selleckt.$items.find('.item').eq(1),
                        liThree = selleckt.$items.find('.item').eq(2);

                    selleckt._open();

                    expect(liOne.is(':visible')).toEqual(false);

                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(false);
                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.DOWN }));
                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(true);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.DOWN }));
                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(false);
                    expect(liThree.hasClass(selleckt.highlightClass)).toEqual(true);

                    $selectedItem.trigger(jQuery.Event('keydown', { which : KEY_CODES.UP }));
                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(true);
                    expect(liThree.hasClass(selleckt.highlightClass)).toEqual(false);
                });
            });
        });

        describe('search', function(){
            var selectHtml = '<select>' +
                    '<option value="foo">foo</option>' +
                    '<option value="bar">bar</option>' +
                    '<option value="baz">baz</option>' +
                    '<option value="foofoo">foofoo</option>' +
                    '<option value="foobaz">foobaz</option>' +
                    '</select>',
                template =
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
                        '<li class="item" data-text="{{label}}" data-value="{{value}}">' +
                            '<span class="itemText">{{label}}</span>' +
                        '</li>' +
                        '{{/items}}' +
                    '</ul>' +
                '</div>',
                $searchInput;

            describe('initialization', function(){
                it('displays a searchbox if settings.showSearch is true and there are more items than options.searchThreshold', function(){
                    selleckt = Selleckt.create({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClass: 'isHighlighted',
                        enableSearch: true
                    });

                    selleckt.render();

                    expect(selleckt.$sellecktEl.find('.searchContainer').length).toEqual(1);
                });
                it('does not display a searchbox if settings.showSearch is true and there are fewer items than options.searchThreshold', function(){
                    selleckt = Selleckt.create({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClass: 'isHighlighted',
                        enableSearch: true,
                        searchThreshold: 100
                    });

                    selleckt.render();

                    expect(selleckt.$sellecktEl.find('.searchContainer').length).toEqual(0);
                });
                it('does not display a searchbox if settings.showSearch is false', function(){
                    selleckt = Selleckt.create({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClass: 'isHighlighted',
                        enableSearch: false
                    });

                    selleckt.render();

                    expect(selleckt.$sellecktEl.find('.searchContainer').length).toEqual(0);
                });
            });

            describe('functionality', function(){

                beforeEach(function(){
                    selleckt = Selleckt.create({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClass: 'isHighlighted',
                        enableSearch: true
                    });

                    selleckt.render();

                    $searchInput = selleckt.$sellecktEl.find('.search');
                });

                afterEach(function(){
                    $searchInput = undefined;
                });

                describe('filtering', function(){
                    it('can annotate the items with matchIndexes', function(){
                        var output = selleckt._findMatchingOptions(selleckt.items, 'ba');

                        expect(output).toEqual([
                            { label: 'foo', value: 'foo', data:{} },
                            { label: 'bar', value: 'bar', data:{}, matchStart: 0, matchEnd: 1 },
                            { label: 'baz', value: 'baz', data:{}, matchStart: 0, matchEnd: 1 },
                            { label: 'foofoo', value: 'foofoo', data:{} },
                            { label: 'foobaz', value: 'foobaz', data:{}, matchStart: 3, matchEnd: 4 }
                        ]);
                    });

                    it('filters the available options as the user types in the searchbox', function(){
                        var _findMatchingOptionsSpy = sinon.spy(selleckt, '_findMatchingOptions'),
                            clock = sinon.useFakeTimers();

                        selleckt._open();
                        $searchInput.val('baz').trigger('keyup');

                        //handler is _.debounced
                        clock.tick(1000);

                        expect(selleckt.$items.find('.item').eq(0).css('display')).toEqual('none');
                        expect(selleckt.$items.find('.item').eq(1).css('display')).toEqual('none');
                        expect(selleckt.$items.find('.item').eq(2).css('display')).not.toEqual('none');
                        expect(selleckt.$items.find('.item').eq(3).css('display')).toEqual('none');
                        expect(selleckt.$items.find('.item').eq(4).css('display')).not.toEqual('none');

                        clock.restore();
                    });
                    it('wraps matched text in the matching options with a "mark" tag', function(){
                        var _findMatchingOptionsSpy = sinon.spy(selleckt, '_findMatchingOptions'),
                            clock = sinon.useFakeTimers();

                        selleckt._open();
                        $searchInput.val('baz').trigger('keyup');

                        //handler is _.debounced
                        clock.tick(1000);

                        expect(selleckt.$items.find('.item mark').length).toEqual(2);
                        expect(selleckt.$items.find('.item mark').parent('.itemText').eq(0).text()).toEqual('baz');
                        expect(selleckt.$items.find('.item mark').parent('.itemText').eq(1).text()).toEqual('foobaz');

                        clock.restore();
                    });
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
                '<li class="selection selectionItem" data-value="{{value}}">' +
                    '<span class="selectedText">{{text}}</span>' +
                    '<i class="icon-remove remove"></i>' +
                '</li>',
            selectHtml  =
                '<select multiple>' +
                    '<option value="1" selected>foo</option>' +
                    '<option value="2" data-meh="whee" data-bah="oink">bar</option>' +
                    '<option value="3" selected>baz</option>' +
                '</select>',
            $el;

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
                    multiSelleckt = Selleckt.create({
                        multiple: true,
                        mainTemplate : mainTemplate,
                        selectionTemplate: multiselectItemTemplate,
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        selectionsClass: 'mySelections',
                        selectionItemClass: 'mySelectionItem',
                        placeholderText: 'click me!',
                        alternatePlaceholder: 'click me again!',
                        itemsClass: 'items',
                        itemClass: 'item',
                        removeItemClass: 'removeItem',
                        selectedClassName: 'isSelected',
                        highlightClass: 'isHighlighted'
                    });
                });

                it('stores options.selectionTemplate as this.selectionTemplate',function(){
                    expect(multiSelleckt.selectionTemplate({})).toEqual(Mustache.compile(multiselectItemTemplate)({}));
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
                it('stores options.removeItemClass as this.removeItemClass',function(){
                    expect(multiSelleckt.removeItemClass).toEqual('removeItem');
                });
                it('stores options.removeItemClass as this.removeItemClass',function(){
                    expect(multiSelleckt.removeItemClass).toEqual('removeItem');
                });
            });

            describe('defaults', function(){
                beforeEach(function(){
                    multiSelleckt = Selleckt.create({
                        multiple: true,
                        mainTemplate : mainTemplate,
                        selectionTemplate: multiselectItemTemplate,
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

                it('defaults this selectionsClass to "selections"',function(){
                    expect(multiSelleckt.selectionsClass).toEqual('selections');
                });
                it('defaults this.selectionItemClass to "selectionItem"',function(){
                    expect(multiSelleckt.selectionItemClass).toEqual('selectionItem');
                });
                it('defaults this.removeItemClass to "remove"',function(){
                    expect(multiSelleckt.removeItemClass).toEqual('remove');
                });
                it('defaults this.placeholderText to "Please select..."',function(){
                    expect(multiSelleckt.placeholderText).toEqual('Please select...');
                });
                it('defaults this.alternatePlaceholder to "Select another..."',function(){
                    expect(multiSelleckt.alternatePlaceholder).toEqual('Select another...');
                });
            });
        });

        describe('template formats', function(){
            it('accepts template strings', function(){
                multiSelleckt = Selleckt.create({
                    multiple: true,
                    mainTemplate : mainTemplate,
                    selectionTemplate: multiselectItemTemplate,
                    $selectEl : $el,
                    className: 'selleckt',
                    selectedClass: 'selected',
                    selectedTextClass: 'selectedText',
                    itemsClass: 'items',
                    itemClass: 'item',
                    selectedClassName: 'isSelected',
                    highlightClassName: 'isHighlighted'
                });
                multiSelleckt.render();
                expect(multiSelleckt.$sellecktEl.find('.selectionItem').length).toEqual(2);
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).eq(0).text()).toEqual('foo');
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).eq(1).text()).toEqual('baz');
            });

            it('accepts compiled templates', function(){
                multiSelleckt = Selleckt.create({
                    multiple: true,
                    mainTemplate : Mustache.compile(mainTemplate),
                    selectionTemplate: Mustache.compile(multiselectItemTemplate),
                    $selectEl : $el,
                    className: 'selleckt',
                    selectedClass: 'selected',
                    selectedTextClass: 'selectedText',
                    itemsClass: 'items',
                    itemClass: 'item',
                    selectedClassName: 'isSelected',
                    highlightClassName: 'isHighlighted'
                });
                multiSelleckt.render();
                expect(multiSelleckt.$sellecktEl.find('.selectionItem').length).toEqual(2);
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).eq(0).text()).toEqual('foo');
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).eq(1).text()).toEqual('baz');
            });
        });

        describe('rendering', function(){
            beforeEach(function(){
                multiSelleckt = Selleckt.create({
                    multiple: true,
                    mainTemplate : mainTemplate,
                    selectionTemplate: multiselectItemTemplate,
                    $selectEl : $el,
                    className: 'selleckt',
                    selectedClass: 'selected',
                    selectedTextClass: 'selectedText',
                    itemsClass: 'items',
                    itemClass: 'item',
                    selectedClassName: 'isSelected',
                    highlightClass: 'isHighlighted'
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
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).eq(0).text()).toEqual('foo');
                expect(multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedTextClass).eq(1).text()).toEqual('baz');
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
                multiSelleckt = Selleckt.create({
                    multiple: true,
                    mainTemplate : mainTemplate,
                    selectionTemplate: multiselectItemTemplate,
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

            describe('item deselection', function(){
                it('removes an item when the "remove" link is clicked', function(){
                    multiSelleckt.render();

                    expect(multiSelleckt.getSelection().length).toEqual(2);

                    expect(multiSelleckt.$sellecktEl.find('.selectionItem').length).toEqual(2);

                    multiSelleckt.$sellecktEl.find('.selectionItem .remove').first().trigger('click');

                    expect(multiSelleckt.$sellecktEl.find('.selectionItem').length).toEqual(1);
                });
                it('removes the class of "disabled" from the select if all options were selected but one becomes available', function(){
                    multiSelleckt.render();

                    multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect(multiSelleckt.getSelection().length).toEqual(3);
                    expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(true);

                    multiSelleckt.$sellecktEl.find('.selectionItem .remove').first().trigger('click');

                    expect(multiSelleckt.getSelection().length).toEqual(2);
                    expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(false);
                });
            });
        });

        describe('removing items', function(){
            var $clickTarget,
                itemToRemove,
                $correspondingOption;

            beforeEach(function(){
                multiSelleckt = Selleckt.create({
                    multiple: true,
                    mainTemplate : mainTemplate,
                    selectionTemplate: multiselectItemTemplate,
                    $selectEl : $el,
                    className: 'selleckt',
                    selectedClass: 'selected',
                    selectedTextClass: 'selectedText',
                    itemsClass: 'items',
                    itemClass: 'item',
                    selectedClassName: 'isSelected',
                    highlightClass: 'isHighlighted'
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

                $clickTarget = multiSelleckt.$sellecktEl.find('.'+multiSelleckt.removeItemClass).eq(0);
            });
            it('removes the item from the selections when the remove link is clicked', function(){
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
        });

        describe('events', function(){
            beforeEach(function(){
                multiSelleckt = Selleckt.create({
                    multiple: true,
                    mainTemplate : mainTemplate,
                    selectionTemplate: multiselectItemTemplate,
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

            it('does not open when it has a class of "disabled"', function(){
                multiSelleckt.render();

                multiSelleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                expect(multiSelleckt.getSelection().length).toEqual(3);
                expect(multiSelleckt.$sellecktEl.hasClass('disabled')).toEqual(true);

                multiSelleckt.$sellecktEl.find('.'+multiSelleckt.selectedClass).trigger('click');

                expect(multiSelleckt.$sellecktEl.hasClass('open')).toEqual(false);
            });
        });
    });
});
