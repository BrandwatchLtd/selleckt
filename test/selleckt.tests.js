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
                        selleckt = new Selleckt({
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
                        selleckt = new Selleckt({
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
                        selleckt = new Selleckt({
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
                        selleckt = new Selleckt({
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
                    selleckt = new Selleckt({
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
                selleckt = new Selleckt({
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
                selleckt = new Selleckt({
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

                it('stores the selected item as this.selectedItem', function(){
                    expect(selleckt.selectedItem).toEqual({
                        value: '1',
                        label: 'foo',
                        data: {}
                    });

                    selleckt.$sellecktEl.find('li').eq(1).trigger('mousedown');

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

                    selleckt.$sellecktEl.find('li').eq(1).trigger('mousedown');

                    expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('bar');
                });
                it('triggers an "itemSelected" event with this.selectedItem', function(){
                    var spy = sinon.spy();
                    selleckt.bind('itemSelected', spy);

                    selleckt.$sellecktEl.find('li').eq(1).trigger('mousedown');

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
        });

        describe('Keyboard input', function(){
            it('calls hightlightItem with the previous item when up is pressed');
            it('does not call hightlightItem when up is pressed on the first item');

            it('calls hightlightItem with the next item when down is pressed');
            it('does not call hightlightItem when down is pressed on the last item');

            it('changes this.selectedItem when enter is pressed on a new item');
            it('triggers an "itemSelected" event with this.selectedItem when enter is pressed on a new item');
        });
    });
});
