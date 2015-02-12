var TEMPLATES = {
    SINGLE:
        '<div class="{{className}}" tabindex=1>' +
            '<div class="{{selectedClass}}">' +
                '<span class="{{selectedTextClass}}">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
            '</div>' +
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
            '</div>' +
        '</div>',
    SINGLE_ITEM:
        '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
            '<span class="{{itemTextClass}}">{{label}}</span>' +
        '</li>',
    MULTI:
        '<div class="{{className}}" tabindex=1>' +
            '<ul class="{{selectionsClass}}">' +
            '{{#selections}}' +
            '{{/selections}}' +
            '</ul>' +
            '<div class="{{selectedClass}}">' +
                '<span class="{{selectedTextClass}}">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
            '</div>' +
            '<div class="{{itemsClass}}">' +
                '<ul class="{{itemslistClass}}">' +
                '{{#items}}' +
                    '{{> item}}' +
                '{{/items}}' +
                '</ul>' +
            '</div>' +
        '</div>',
    MULTI_ITEM:
        '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
            '{{label}}' +
        '</li>',
    MULTI_SELECTION:
        '<li class="{{selectionItemClass}}" data-value="{{value}}">' +
            '{{text}}<i class="icon-remove {{unselectItemClass}}"></i>' +
        '</li>'
};

module.exports = TEMPLATES;