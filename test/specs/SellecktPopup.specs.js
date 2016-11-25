'use strict';

function sellecktPopupSpecs(SellecktPopup, templateUtils, $, _, Mustache){

    var template =
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

    var defaultItemTemplate =
        '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
            '<span class="{{itemTextClass}}">{{label}}</span>' +
        '</li>';

    var customItemTemplate =
        '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
            '<span class="{{itemTextClass}}">{{label}}</span>' +
            '<span class="custom-attribute">{{customAttr}}</span>' +
        '</li>';

    var KEY_CODES = {
        DOWN: 40,
        UP: 38,
        ENTER: 13,
        ESC: 27
    };

    return describe('SellecktPopup', function(){
        var popup;
        var sandbox = sinon.sandbox.create();

        afterEach(function(){
            if (popup){
                popup.close();
                popup = undefined;
            }

            sandbox.restore();
        });

        describe('valid instantation with custom options', function(){
            var popupOptions;

            beforeEach(function(){
                popupOptions = {
                    template: template,
                    itemTemplate: customItemTemplate,
                    itemsClass: 'myItemsClass',
                    itemslistClass: 'myItemsListClass',
                    itemClass: 'myItemClass',
                    itemTextClass: 'myItemTextClass',
                    highlightClass: 'myHighlightClass',
                    searchInputClass: 'mySearchInputClass',
                    showSearch: true,
                    defaultSearchTerm: 'myDefaultSearchTerm',
                    templateData: {foo: 'bar'},
                    maxHeightPopupPositioning: true
                };

                popup = new SellecktPopup(popupOptions);
            });

            it('stores the template as this.template', function(){
                expect(popup.template).toEqual(template);
            });

            it('stores the itemTemplate as this.itemTemplate', function(){
                expect(popup.itemTemplate).toEqual(customItemTemplate);
            });

            it('stores the itemsClass passed in as this.itemsClass', function(){
                expect(popup.itemsClass).toEqual(popupOptions.itemsClass);
            });

            it('stores the itemslistClass passed in as this.itemslistClass', function(){
                expect(popup.itemslistClass).toEqual(popupOptions.itemslistClass);
            });

            it('stores the itemClass passed in as this.itemClass', function(){
                expect(popup.itemClass).toEqual(popupOptions.itemClass);
            });

            it('stores the itemTextClass passed in as this.itemTextClass', function(){
                expect(popup.itemTextClass).toEqual(popupOptions.itemTextClass);
            });

            it('stores the highlightClass passed in as this.highlightClass', function(){
                expect(popup.highlightClass).toEqual(popupOptions.highlightClass);
            });

            it('stores the searchInputClass passed in as this.searchInputClass', function(){
                expect(popup.searchInputClass).toEqual(popupOptions.searchInputClass);
            });

            it('stores the showSearch passed in as this.showSearch', function(){
                expect(popup.showSearch).toEqual(popupOptions.showSearch);
            });

            it('stores the defaultSearchTerm passed in as this.defaultSearchTerm', function(){
                expect(popup.defaultSearchTerm).toEqual(popupOptions.defaultSearchTerm);
            });

            it('stores the templateData passed in as this.templateData', function(){
                expect(popup.templateData).toEqual(popupOptions.templateData);
            });

            it('stores the maxHeightPopupPositioning passed in as this.maxHeightPopupPositioning', function(){
                expect(popup.maxHeightPopupPositioning).toEqual(popupOptions.maxHeightPopupPositioning);
            });
        });

        describe('valid instantiation with default options', function(){
            beforeEach(function(){
                popup = new SellecktPopup();
            });

            it('stores the template as this.template', function(){
                expect(popup.template).toEqual(template);
            });

            it('stores the itemTemplate as this.itemTemplate', function(){
                expect(popup.itemTemplate).toEqual(defaultItemTemplate);
            });

            it('uses "items" as this.itemsClass', function(){
                expect(popup.itemsClass).toEqual('items');
            });

            it('uses "itemslist" as this.itemslistClass', function(){
                expect(popup.itemslistClass).toEqual('itemslist');
            });

            it('uses "item" as this.itemClass', function(){
                expect(popup.itemClass).toEqual('item');
            });

            it('uses "itemText" as this.itemTextClass', function(){
                expect(popup.itemTextClass).toEqual('itemText');
            });

            it('uses "highlighted" as this.highlightClass', function(){
                expect(popup.highlightClass).toEqual('highlighted');
            });

            it('uses "search" as this.searchInputClass', function(){
                expect(popup.searchInputClass).toEqual('search');
            });

            it('this.showSearch should be false', function(){
                expect(popup.showSearch).toEqual(false);
            });

            it('stores an empty object as this.templateData', function(){
                expect(popup.templateData).toEqual({});
            });

            it('stores an empty object as this.maxHeightPopupPositioning', function(){
                expect(popup.maxHeightPopupPositioning).toEqual(false);
            });
        });

        describe('template caching', function(){
            var cacheStub;

            beforeEach(function(){
                cacheStub = sinon.stub(templateUtils, 'cacheTemplate');
                popup = new SellecktPopup();
            });

            afterEach(function(){
                cacheStub.restore();
            });

            it('caches the main template', function(){
                expect(cacheStub.calledWith(template)).toEqual(true);
            });

            it('caches the item template', function(){
                expect(cacheStub.calledWith(defaultItemTemplate)).toEqual(true);
            });
        });

        describe('rendering items', function(){
            var items;
            var mustacheRenderSpy;

            beforeEach(function(){
                items = [
                    {label: 'item 1', value: 1, customAttr: 'attr 1'},
                    {label: 'item 2', value: 2, customAttr: 'attr 2'},
                    {label: 'item 3', value: 3, customAttr: 'attr 3'},
                    {label: 'item 4', value: 4, customAttr: 'attr 4'},
                    {label: 'item 5', value: 5, customAttr: 'attr 5'}
                ];

                popup = new SellecktPopup({
                    itemTemplate: customItemTemplate
                });
                popup.$popup = $('<div>');

                mustacheRenderSpy = sandbox.spy(Mustache, 'render');

                popup.renderItems(items);
            });

            it('replaces the popup contents with the rendered template', function(){
                var itemSelector = '.' + popup.itemClass;
                var itemTextSelector = '.' + popup.itemTextClass;
                var itemContainerSelector = '.' + popup.itemsClass;

                expect(popup.$popup.children().length).toEqual(1);
                expect(popup.$popup.children().eq(0).is(itemContainerSelector)).toEqual(true);

                var $items = popup.$popup.find(itemSelector);

                expect($items.length).toEqual(5);

                expect($items.eq(0).attr('data-text')).toEqual('item 1');
                expect($items.eq(0).attr('data-value')).toEqual('1');
                expect($items.eq(0).find(itemTextSelector).text()).toEqual('item 1');
                expect($items.eq(0).find('.custom-attribute').text()).toEqual('attr 1');

                expect($items.eq(1).attr('data-text')).toEqual('item 2');
                expect($items.eq(1).attr('data-value')).toEqual('2');
                expect($items.eq(1).find(itemTextSelector).text()).toEqual('item 2');
                expect($items.eq(1).find('.custom-attribute').text()).toEqual('attr 2');

                expect($items.eq(2).attr('data-text')).toEqual('item 3');
                expect($items.eq(2).attr('data-value')).toEqual('3');
                expect($items.eq(2).find(itemTextSelector).text()).toEqual('item 3');
                expect($items.eq(2).find('.custom-attribute').text()).toEqual('attr 3');

                expect($items.eq(3).attr('data-text')).toEqual('item 4');
                expect($items.eq(3).attr('data-value')).toEqual('4');
                expect($items.eq(3).find(itemTextSelector).text()).toEqual('item 4');
                expect($items.eq(3).find('.custom-attribute').text()).toEqual('attr 4');

                expect($items.eq(4).attr('data-text')).toEqual('item 5');
                expect($items.eq(4).attr('data-value')).toEqual('5');
                expect($items.eq(4).find(itemTextSelector).text()).toEqual('item 5');
            });

            it('renders using this.template', function(){
                expect(mustacheRenderSpy.args[0][0]).toEqual(popup.template);
            });

            it('passes the value of this.showSearch to the template', function(){
                expect(mustacheRenderSpy.args[0][1].showSearch).toEqual(popup.showSearch);
            });
            it('passes the value of this.itemsClass to the template', function(){
                expect(mustacheRenderSpy.args[0][1].itemsClass).toEqual(popup.itemsClass);
            });
            it('passes the value of this.itemslistClass to the template', function(){
                expect(mustacheRenderSpy.args[0][1].itemslistClass).toEqual(popup.itemslistClass);
            });
            it('passes the value of this.itemClass to the template', function(){
                expect(mustacheRenderSpy.args[0][1].itemClass).toEqual(popup.itemClass);
            });
            it('passes the value of this.itemTextClass to the template', function(){
                expect(mustacheRenderSpy.args[0][1].itemTextClass).toEqual(popup.itemTextClass);
            });
            it('passes the value of this.searchInputClass to the template', function(){
                expect(mustacheRenderSpy.args[0][1].searchInputClass).toEqual(popup.searchInputClass);
            });

            it('renders using this.itemTemplate as a partial', function(){
                expect(mustacheRenderSpy.args[0][2]).toEqual({
                    item: popup.itemTemplate
                });
            });
        });

        describe('refreshing items', function(){
            var newItems;
            var mustacheRenderSpy;

            beforeEach(function(){
                newItems = [
                    {label: 'new item 1', value: 10, customAttr: 'attr 6'},
                    {label: 'new item 2', value: 20, customAttr: 'attr 7'},
                ];

                popup = new SellecktPopup();
                popup.$popup = $('<div>');

                popup.renderItems([
                    {label: 'item 1', value: 1, customAttr: 'attr 1'},
                    {label: 'item 2', value: 2, customAttr: 'attr 2'},
                    {label: 'item 3', value: 3, customAttr: 'attr 3'},
                    {label: 'item 4', value: 4, customAttr: 'attr 4'},
                    {label: 'item 5', value: 5, customAttr: 'attr 5'}
                ]);

                mustacheRenderSpy = sandbox.spy(Mustache, 'render');
            });

            it('replaces only the contents of the itemslist', function(){
                var itemSelector = '.' + popup.itemClass;

                $('<p>', {
                    'class': 'leave-me-alone'
                })
                .text('bar')
                .appendTo(popup.$popup);

                expect(popup.$popup.find(itemSelector).length).toEqual(5);

                popup.refreshItems(newItems);

                expect(popup.$popup.find('.leave-me-alone').text()).toEqual('bar');
                expect(popup.$popup.find(itemSelector).length).toEqual(2);
            });

            it('renders each item using this.itemTemplate', function(){
                popup.refreshItems(newItems);

                expect(mustacheRenderSpy.callCount).toEqual(2);
            });

            it('passes the value of this.itemTextClass to the item template', function(){
                popup.refreshItems(newItems);

                expect(mustacheRenderSpy.args[0][1].itemTextClass).toEqual(popup.itemTextClass);
                expect(mustacheRenderSpy.args[1][1].itemTextClass).toEqual(popup.itemTextClass);
            });
            it('passes the value of this.itemClass to the item template', function(){
                popup.refreshItems(newItems);

                expect(mustacheRenderSpy.args[0][1].itemClass).toEqual(popup.itemClass);
                expect(mustacheRenderSpy.args[1][1].itemClass).toEqual(popup.itemClass);
            });
            it('passes item.label to the item template', function(){
                popup.refreshItems(newItems);

                expect(mustacheRenderSpy.args[0][1].label).toEqual(newItems[0].label);
                expect(mustacheRenderSpy.args[1][1].label).toEqual(newItems[1].label);
            });
            it('passes item.value to the item template', function(){
                popup.refreshItems(newItems);

                expect(mustacheRenderSpy.args[0][1].value).toEqual(newItems[0].value);
                expect(mustacheRenderSpy.args[1][1].value).toEqual(newItems[1].value);
            });
            it('passes item.customAttr to the item template', function(){
                popup.refreshItems(newItems);

                expect(mustacheRenderSpy.args[0][1].customAttr).toEqual(newItems[0].customAttr);
                expect(mustacheRenderSpy.args[1][1].customAttr).toEqual(newItems[1].customAttr);
            });

            it('adds a "noitems" class to the popup if there are no items', function(){
                popup.refreshItems([]);

                expect(popup.$popup.hasClass('noitems')).toEqual(true);
            });

            describe('marking items', function(){
                var addMarkSpy;

                beforeEach(function(){
                    addMarkSpy = sandbox.spy(popup, '_addMarkToItem');
                });

                it('does not add a mark to the item if the item has a negative integer value for "matchEnd"', function(){
                    var refreshItems = [{
                        label: 'new item 1',
                        value: 10,
                        matchStart: 0,
                        matchEnd: -1
                    }];

                    popup.refreshItems(refreshItems);

                    expect(addMarkSpy.called).toEqual(false);
                });

                it('does not add a mark to the item if the item has a falsey "matchEnd"', function(){
                    var refreshItems = [{
                        label: 'new item 1',
                        value: 10,
                        matchStart: 0,
                        matchEnd: -1
                    }];

                    popup.refreshItems(refreshItems);

                    expect(addMarkSpy.called).toEqual(false);
                });

                it('adds a mark to the item if the item has a positive integer value for "matchEnd"', function(){
                    var refreshItems = [{
                        label: 'new item 1',
                        value: 10,
                        matchStart: 0,
                        matchEnd: 2
                    }];

                    popup.refreshItems(refreshItems);

                    expect(addMarkSpy.calledOnce).toEqual(true);
                });

                it('escapes the substrings, based on the item.matchStart and item.matchEnd', function(){
                    var refreshItems = [{
                        label: 'new item 1',
                        value: 10,
                        matchStart: 4,
                        matchEnd: 7
                    }];

                    var escapeSpy = sandbox.spy(_, 'escape');

                    popup.refreshItems(refreshItems);

                    expect(addMarkSpy.calledOnce).toEqual(true);

                    var itemSelector = '.' + popup.itemClass;

                    var $items = popup.$popup.find(itemSelector);

                    expect($items.length).toEqual(1);
                    expect($items.eq(0).text()).toEqual('new item 1');

                    expect($items.find('mark').length).toEqual(1);
                    expect($items.find('mark').text()).toEqual('item');

                    expect(escapeSpy.callCount).toEqual(3);
                    expect(escapeSpy.args[0][0]).toEqual('new ');
                    expect(escapeSpy.args[1][0]).toEqual('item');
                    expect(escapeSpy.args[2][0]).toEqual(' 1');
                });

                it('wraps the matched text in a <mark>', function(){
                    var refreshItems = [{
                        label: 'new item 1',
                        value: 10,
                        matchStart: 0,
                        matchEnd: 2
                    }];

                    popup.refreshItems(refreshItems);

                    expect(addMarkSpy.calledOnce).toEqual(true);

                    var itemSelector = '.' + popup.itemClass;

                    var $items = popup.$popup.find(itemSelector);

                    expect($items.length).toEqual(1);
                    expect($items.eq(0).text()).toEqual('new item 1');
                    expect($items.find('mark').length).toEqual(1);
                    expect($items.find('mark').text()).toEqual('new');
                });
            });
        });

        describe('opening the popup', function(){
            var bindEventsStub;
            var positionStub;
            var items;
            var $opener;
            var renderItemsSpy;

            beforeEach(function(){
                bindEventsStub = sandbox.stub(SellecktPopup.prototype, 'bindEvents');
                positionStub = sandbox.stub(SellecktPopup.prototype, '_positionPopup');
                renderItemsSpy = sandbox.spy(SellecktPopup.prototype, 'renderItems');

                items = [
                    {label: 'item 1', value: 1},
                    {label: 'item 2', value: 2},
                    {label: 'item 3', value: 3},
                    {label: 'item 4', value: 4},
                    {label: 'item 5', value: 5},
                ];

                $opener = $('<div>foo</div>', {
                    'class': 'opener'
                });

                sandbox.stub($opener, 'offset').returns({
                    top: 50,
                    left: 100
                });
            });

            afterEach(function(){
                $opener.remove();
            });

            it('creates a handler for window.resize and adds it as this.resizeHandler', function(){
                sandbox.stub(_, 'throttle', function(func) {
                    return func;
                });

                popup = new SellecktPopup();
                popup.open($opener, items);

                expect(typeof popup.resizeHandler).toEqual('function');

                positionStub.reset();

                $(window).trigger('resize');

                expect(positionStub.callCount).toEqual(1);
            });

            it('creates a div with "selleckt" and "sellecktPopup" classes', function(){
                popup = new SellecktPopup();
                popup.open($opener, items);

                var $popup = popup.$popup;

                expect($popup).toBeDefined();
                expect($popup.hasClass('selleckt')).toEqual(true);
                expect($popup.hasClass('sellecktPopup')).toEqual(true);
            });

            it('attaches the popup to the document body', function(){
                popup = new SellecktPopup();
                popup.open($opener, items);

                var $popup = popup.$popup;

                expect($popup.parent().is('body')).toEqual(true);
            });

            it('positions the popup based on the offset of the opener element', function(){
                popup = new SellecktPopup();
                popup.open($opener, items);

                expect(positionStub.calledOnce).toEqual(true);
                expect(positionStub.args[0][0]).toEqual($opener);
            });

            it('focuses the searchInput if showSearch is true', function(){
                popup = new SellecktPopup({showSearch: true});
                popup.open($opener, items);

                expect($(document.activeElement).hasClass(popup.searchInputClass)).toEqual(true);
            });

            describe('when showSearch is true, $input exists and defaultSearchTerm is set', function() {
                beforeEach(function(){
                    popup = new SellecktPopup({
                        showSearch: true,
                        defaultSearchTerm: 'myDefaultSearchTerm'
                    });
                    popup.open($opener, items);
                });
                it('renders the defaultSearchTerm in the searchInput', function(){
                    expect(popup.$popup.find('.' + popup.searchInputClass).val()).toEqual('myDefaultSearchTerm');
                });

                it('selects the defaultSearchTerm in the searchInput', function(){
                    var activeElement = document.activeElement;
                    expect(activeElement.value).toEqual('myDefaultSearchTerm');
                });
            });

            it('focuses the first item if showSearch is false', function(){
                var focusStub = sandbox.stub($.fn, 'focus');

                popup = new SellecktPopup({showSearch: false});
                popup.open($opener, items);

                expect(focusStub.calledOnce).toEqual(true);
                expect(focusStub.thisValues[0].is(popup.$popup.find('.' + popup.itemClass).eq(0))).toEqual(true);
            });

            it('focuses the first item if $input is undefined', function(){
                var focusStub = sandbox.stub($.fn, 'focus');
                var ITEMS_CONTAINER = '<div class="{{itemsClass}}">' +
                    '<ul class="{{itemslistClass}}">' +
                        '{{#items}}' +
                            '{{> item}}' +
                        '{{/items}}' +
                    '</ul>' +
                '</div>';

                popup = new SellecktPopup({
                    template: ITEMS_CONTAINER,
                    showSearch: true
                });
                popup.open($opener, items);

                expect(focusStub.calledOnce).toEqual(true);
                expect(focusStub.thisValues[0].is(popup.$popup.find('.' + popup.itemClass).eq(0))).toEqual(true);
            });

            it('renders the items into the popup', function(){
                popup = new SellecktPopup();
                popup.open($opener, items);

                expect(renderItemsSpy.calledOnce).toEqual(true);
                expect(renderItemsSpy.calledWith(items)).toEqual(true);
            });

            it('calls this.bindEvents', function(){
                popup = new SellecktPopup();
                popup.open($opener, items);

                expect(bindEventsStub.calledOnce).toEqual(true);
            });
        });

        describe('clicking on the popup', function(){
            var $opener;
            var $body;
            var clickHandlerSpy;

            beforeEach(function() {
                clickHandlerSpy = sandbox.spy();

                $body = $('body');
                $opener = $('<div>foo</div>', {
                    'class': 'opener'
                }).appendTo($body);

                $body.on('click', clickHandlerSpy);
            });

            afterEach(function() {
                $body.off('click', clickHandlerSpy);
            });

            it('does not propagate "click" events to the parent container', function() {
                popup = new SellecktPopup({showSearch: true});
                popup.open($opener, []);

                popup.$popup.find('input.search').click();

                expect(clickHandlerSpy.called).toBeFalsy();
            });
        });

        describe('closing the popup', function(){
            var $body;

            beforeEach(function(){
                $body = $('body');

                popup = new SellecktPopup();
                popup.$popup = $('<div class="popup">').appendTo($body);
            });

            it('removes popup.resizeHandler', function(){
                popup._attachResizeHandler($('<div>'));
                expect(typeof popup.resizeHandler).toEqual('function');

                popup.close();
                expect(typeof popup.resizeHandler).toEqual('undefined');
            });

            it('removes the popup from the DOM', function(){
                expect($body.find('.popup').length).toEqual(1);

                popup.close();

                expect($body.find('.popup').length).toEqual(0);
            });

            it('sets this.$popup to undefined', function(){
                popup.close();
                expect(popup.$popup).toBeUndefined();
            });

            it('triggers a close event', function(){
                var spy = sandbox.spy();

                popup.on('close', spy);
                popup.close();

                expect(spy.calledOnce).toEqual(true);
            });
        });

        //these tests manipulate the DOM so they can test the layout of the popup.
        describe('positioning the popup [DOM tests]', function(){
            var $opener;
            var items;
            var _OPENER_LEFT;

            beforeEach(function(){
                _OPENER_LEFT = 100;

                $opener = $('<div>', {
                    'class': 'opener',
                    'css': {
                        position: 'absolute',
                        left: _OPENER_LEFT
                    }
                }).appendTo($('body'));

                items = [
                    {label: 'item 1', value: 1},
                    {label: 'item 2', value: 2},
                    {label: 'item 3', value: 3},
                    {label: 'item 4', value: 4},
                    {label: 'item 5', value: 5},
                ];

                popup = new SellecktPopup();
            });

            afterEach(function(){
                $opener.remove();
            });

            it('sets the css "position" property to "absolute"', function(){
                popup.open($opener, items);

                expect(popup.$popup.css('position')).toEqual('absolute');

            });
            it('sets the css "left" position to that of the popup opener', function(){
                popup.open($opener, items);

                expect(popup.$popup.css('left')).toEqual(_OPENER_LEFT + 'px');
            });

            it('does not set a css class of "flipped" if there is enough room below the opener', function(){
                $opener.css({top: 0});

                popup.open($opener, items);

                expect(popup.$popup.hasClass('flipped')).toEqual(false);
            });

            it('sets a css class of "flipped" if there is not enough room below the opener', function(){
                $opener.css({top: $(window).height()});

                popup.open($opener, items);

                expect(popup.$popup.hasClass('flipped')).toEqual(true);
            });

            it('if there is no place on either side, prefers bottom placement', function(){
                $opener.css({top: 0, height: $(window).height()});

                popup.open($opener, items);

                expect(popup.$popup.hasClass('flipped')).toEqual(false);
            });

            describe('when option maxHeightPopupPositioning is set to true', function() {
                var itemsListMaxHeight = 225;
                var $itemsList;
                var popupMaxHeight;

                beforeEach(function() {
                    var _positionPopupStub = sandbox.stub(popup, '_positionPopup');

                    popup.maxHeightPopupPositioning = true;
                    popup.template = '<div class="{{itemsClass}}">' +
                        '{{#showSearch}}' +
                        '<div class="searchContainer">' +
                        '<input class="{{searchInputClass}}"></input>' +
                        '</div>' +
                        '<span class="noitemsText">No items</span>' +
                        '{{/showSearch}}' +
                        '<ul class="{{itemslistClass}}" style="max-height: ' + itemsListMaxHeight + 'px;">' +
                        '{{#items}}' +
                        '{{> item}}' +
                        '{{/items}}' +
                        '</ul>' +
                        '</div>';

                    popup.open($opener, items);
                    $itemsList = popup.$popup.find('.' + popup.itemslistClass);
                    popupMaxHeight = popup.$popup.outerHeight() + itemsListMaxHeight - $itemsList.height();
                    popup.close();

                    _positionPopupStub.restore();
                });

                it('if there is enough room below the opener, prefers bottom placement', function() {
                    $opener.css({top: $(window).scrollTop() + $(window).height() - popupMaxHeight - 1});

                    popup.open($opener, items);

                    expect(popup.$popup.hasClass('flipped')).toEqual(false);
                });

                it('if there is not enough room below the opener, prefers top placement', function(){
                    $opener.css({top: $(window).scrollTop() + $(window).height() - popupMaxHeight});

                    popup.open($opener, items);

                    expect(popup.$popup.hasClass('flipped')).toEqual(true);
                });
            });
        });

        describe('Keyboard input - items', function(){
            var $opener;
            var $popup;
            var items;

            beforeEach(function(){
                items = [
                    {label: 'item 1', value: 1},
                    {label: 'item 2', value: 2},
                    {label: 'item 3', value: 3}
                ];

                popup = new SellecktPopup({
                    showSearch: false
                });

                $opener = $('<div>', {
                    'class': 'opener'
                }).appendTo($('body'));

                popup.open($opener, items);

                $popup = popup.$popup;
            });

            afterEach(function(){
                $opener.remove();
            });

            it('closes the popup when esc is pressed', function(){
                var closeSpy = sandbox.spy(popup, 'close');
                var $firstItem = $popup.find('.' + popup.itemClass).first();

                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.ESC
                }));

                expect(closeSpy.calledOnce).toEqual(true);
            });

            it('selects the current item when enter is pressed', function(){
                var spy = sandbox.spy();
                var $firstItem = $popup.find('.' + popup.itemClass).first();

                popup.on('valueSelected', spy);

                $firstItem.addClass(popup.highlightClass);
                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.ENTER
                }));

                expect(spy.calledOnce).toEqual(true);
                expect(spy.args[0][0]).toEqual($firstItem.attr('data-value'));
            });

            it('closes the popup when enter is pressed', function(){
                var closeSpy = sandbox.spy(popup, 'close');
                var $firstItem = $popup.find('.' + popup.itemClass).first();

                $firstItem.addClass(popup.highlightClass);
                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.ENTER
                }));

                expect(closeSpy.calledOnce).toEqual(true);
            });

            it('highlights the next item if there is one when down is pressed', function(){
                var $firstItem = $popup.find('.' + popup.itemClass).first();
                var $secondItem = $firstItem.next();

                $firstItem.addClass(popup.highlightClass);
                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.DOWN
                }));

                expect($secondItem.hasClass(popup.highlightClass)).toEqual(true);
            });

            it('highlights the first item if there is no next item when down is pressed', function(){
                var $firstItem = $popup.find('.' + popup.itemClass).first();
                $firstItem.addClass(popup.highlightClass);

                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.DOWN
                }));
                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.DOWN
                }));
                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.DOWN
                }));

                expect($firstItem.hasClass(popup.highlightClass)).toEqual(true);
            });

            it('highlights the previous item when up is pressed', function(){
                var $firstItem = $popup.find('.' + popup.itemClass).first();
                $firstItem.addClass(popup.highlightClass);

                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.DOWN
                }));
                $firstItem.trigger($.Event('keydown', {
                    which: KEY_CODES.UP
                }));

                expect($firstItem.hasClass(popup.highlightClass)).toEqual(true);
            });
        });

        describe('Keyboard input - search', function(){
            var $opener;
            var $popup;
            var $searchInput;
            var items;

            beforeEach(function(){
                sandbox.stub(_, 'debounce', function(func){
                    return func;
                });

                items = [
                    {label: 'item 1', value: 1},
                    {label: 'item 2', value: 2},
                    {label: 'item 3', value: 3}
                ];

                popup = new SellecktPopup({
                    showSearch: true
                });

                $opener = $('<div>', {
                    'class': 'opener'
                }).appendTo($('body'));

                popup.open($opener, items);

                $popup = popup.$popup;

                $searchInput = $popup.find('.' + popup.searchInputClass);
                $searchInput.focus();
            });

            afterEach(function(){
                $opener.remove();
            });

            it('closes the popup when esc is pressed', function(){
                var closeSpy = sandbox.spy(popup, 'close');

                $searchInput.trigger($.Event('keydown', {
                    which: KEY_CODES.ESC
                }));

                expect(closeSpy.calledOnce).toEqual(true);
            });

            it('selects the first item when down is pressed', function(){
                var $firstItem = $popup.find('.' + popup.itemClass).first();

                expect($firstItem.hasClass(popup.highlightClass)).toEqual(false);

                $searchInput.trigger($.Event('keydown', {
                    which: KEY_CODES.DOWN
                }));

                expect($firstItem.hasClass(popup.highlightClass)).toEqual(true);
            });

            it('triggers a "search" event with the current term when enter is pressed', function(){
                var searchSpy = sandbox.spy();
                var letterCodes = {
                    O: 79
                };

                popup.on('search', searchSpy);

                $searchInput.val('foo');
                $searchInput.trigger($.Event('keyup', {
                    which: letterCodes.O
                }));

                expect(searchSpy.calledOnce).toEqual(true);
                expect(searchSpy.args[0][0]).toEqual($searchInput.val());
            });
        });

        describe('Mouse events', function(){
            it('highlights the current item and de-highlights all other items on mouseover', function(){
                var $opener = $('<div>foo</div>', {
                    'class': 'opener'
                });

                popup = new SellecktPopup();

                popup.open($opener, [
                    {label: 'item 1', value: 1},
                    {label: 'item 2', value: 2},
                    {label: 'item 3', value: 3},
                    {label: 'item 4', value: 4},
                    {label: 'item 5', value: 5},
                ]);

                var highlightClass = popup.highlightClass,
                    liOne = popup.$popup.find('li.item').eq(0),
                    liTwo = popup.$popup.find('li.item').eq(1);

                expect(liTwo.hasClass(highlightClass)).toEqual(false);

                liOne.trigger('mouseover');
                expect(liOne.hasClass(highlightClass)).toEqual(true);

                liOne.trigger('mouseout');
                expect(liOne.hasClass(highlightClass)).toEqual(true);

                liTwo.trigger('mouseover');
                expect(liOne.hasClass(highlightClass)).toEqual(false);
                expect(liTwo.hasClass(highlightClass)).toEqual(true);
            });
        });
    });
}

(function(root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        var selleckt = require('../../lib/selleckt');

        factory(exports = sellecktPopupSpecs,
                selleckt.SellecktPopup,
                selleckt.templateUtils,
                require('jquery'),
                require('underscore'),
                require('Mustache')
            );
    } else {
        // Browser globals
        factory(
            root.singleSellecktSpecs,
            root.selleckt.SellecktPopup,
            root.selleckt.templateUtils,
            root.$,
            root._,
            root.Mustache
        );
    }
}(this, function(exports, SellecktPopup, templateUtils, $, _, Mustache) {
    /*eslint max-params: ["error", 6]*/
    /*eslint max-statements: ["error", 30]*/
    return sellecktPopupSpecs(SellecktPopup, templateUtils, $, _, Mustache);
}));
