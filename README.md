Selleckt
===============

A select replacement, using mustache.js for templating.

[![Build Status](https://travis-ci.org/BrandwatchLtd/selleckt.png?branch=master)](https://travis-ci.org/BrandwatchLtd/selleckt)

[![Sauce Test Status](https://saucelabs.com/buildstatus/brandwatch-selleckt)](https://saucelabs.com/u/brandwatch-selleckt)


[![Sauce Browser Matrix](https://saucelabs.com/browser-matrix/brandwatch-selleckt.svg)](https://saucelabs.com/u/brandwatch-selleckt)

Running the demos
=================

Pull down the repo then execute:

```javascript
npm start
```
and open `http://localhost:8282/demo`


Running the tests
=================

The tests are run using [Karma](http://karma-runner.github.io/) as the test runner. For convenience and consistency between local dev environments and CI (Travis), it's recommended to use grunt to run the tests.

`npm test` will start the test suite, and attempt to run the tests in Safari, Firefox and Chrome.

The test suites themselves are written using [Mocha](http://mochajs.org/). To view the mocha tests, press the debug button at the top right of the browser window (that you wish to debug in) when it spawns after `npm test` is executed.

To target a single browser run:

```javascript
karma start karma.conf.js --browsers=Chrome --single-run=false
```

Valid browser names would include any of `Chrome`, `Safari` or `Firefox`. The addition of `--single-run=false` will stop the spawned window from closing when the test run completes.

NB: to run karma from the terminal you'll need to install Karma's CLI tool with

```javascript
npm install -g karma-cli
```

various integration test suites are available, and can be accessed using `npm run-script`. They use the built distribution of Selleckt. view `package.json` to see what suites there are.

Configuration
=================

Selleckt enhances a standard html select element. It respects the 'multiple' attribute and instantiates a multiselleckt if that attribute is set.

The plugin uses mustache templates, so its style is highly customisable.

For example, for a select with id 'foo' to instantiate select simply:

```javascript
$('#foo').selleckt(options);
```

The element is enhanced, and selleckt is available via:

```javascript
var sellecktInstance = $('#foo').data('selleckt');
```

Options
=============

The following options can be passed to selleckt:


<table>
    <thead>
        <tr>
            <th>property</th>
            <th>type</th>
            <th>default value</th>
            <th>description</th>
        </tr>
    </thead>
        <tr>
            <td>mainTemplate</td>
            <td>string or compiled mustacheJs template function</td>
            <td>
                <a href="#templates">See below for default templates</a>
            </div>
            </td>
            <td>
            </td>
        </tr>
        <tr>
            <td>mainTemplateData</td>
            <td>object</td>
            <td>-</td>
            <td>
                Custom data to be passed to the main template. The property names must be added as tags to the template for this to take effect.
            </td>
        </tr>
        <tr>
            <td>selectedClass</td>
            <td>string</td>
            <td>selected</td>
            <td>The css class name for the item that triggers the dropdown to show. It should also contain an area to show text (the placeholder, or the text of the current selection.
            </td>
        </tr>
        <tr>
            <td>selectedTextClass</td>
            <td>string</td>
            <td>selectedText</td>
            <td>
                An element to show text (the placeholder, or the text of the current selection. This should be a child of the element defined in `selectedClass`.
            </td>
        </tr>
        <tr>
            <td>itemsClass</td>
            <td>string</td>
            <td>items</td>
            <td>
                The css class name for the container in which the available selections are shown.
            </td>
        </tr>
        <tr>
            <td>itemslistClass</td>
            <td>string</td>
            <td>itemslist</td>
            <td>
                The css class name for the list of individual items.
            </td>
        </tr>
        <tr>
            <td>itemClass</td>
            <td>string</td>
            <td>item</td>
            <td>
                The css class name for the container for an individual item. This should be a descendent of the `itemslistClass` element.
            </td>
        </tr>
        <tr>
            <td>className</td>
            <td>string</td>
            <td>dropdown</td>
            <td>
                Css class name for the whole selleckt.
            </td>
        </tr>
        <tr>
            <td>highlightClass</td>
            <td>string</td>
            <td>highlighted</td>
            <td>
                The css class name for the item currently highlighted via keyboard navigation/mouseover selleckt.
            </td>
        </tr>
        <tr>
            <td>itemTextClass</td>
            <td>string</td>
            <td>itemText</td>
            <td>
                The css class name for the text container inside the `itemClass` element.
            </td>
        </tr>
        <tr>
            <td>placeholderText</td>
            <td>string</td>
            <td>Please select...</td>
            <td>
                The text shown inside the selectedClass element when there is no item currently selected.
            </td>
        </tr>
        <tr>
            <td>enableSearch</td>
            <td>bool</td>
            <td>false</td>
            <td>
                If true, then this is used in conjunction with searchThreshold to determine whether to render a search input used to filter the items.
            </td>
        </tr>
        <tr>
            <td>searchInputClass</td>
            <td>string</td>
            <td>search</td>
            <td>
                The css class of the search input.
            </td>
        </tr>
        <tr>
            <td>searchThreshold</td>
            <td>number</td>
            <td>0</td>
            <td>
                 If the amount of items is above this number, and enableSearch is true then the search input will render.
            </td>
        </tr>
    <tbody>
    </tbody>
</table>

For multiselleckts, in addition to the above:

<table>
    <thead>
        <tr>
            <th>property</th>
            <th>type</th>
            <th>default value</th>
            <th>description</th>
        </tr>
    </thead>
        <tr>
            <td>selectionTemplate</td>
            <td>string or compiled mustacheJs template function</td>
            <td>
                <a href="#templates">See below for default templates</a>
            </td>
            <td>
                The template for rendering the individual selected items
            </td>
        </tr>
        <tr>
            <td>selectionsClass</td>
            <td>string</td>
            <td>
                selections
            </td>
            <td>
                The css class name for the container in which the selected items are shown.
            </td>
        </tr>
        <tr>
            <td>selectionItemClass</td>
            <td>string</td>
            <td>
                selectionItem
            </td>
            <td>
                The css class name for an individual selected item. Should be a descendent of the selectionsClass element
            </td>
        </tr>
        <tr>
            <td>alternatePlaceholder</td>
            <td>string</td>
            <td>
                Select another...
            </td>
            <td>
                Once a single selection is made, the 'placeholder' text will be replaced with this text.
            </td>
        </tr>
        <tr>
            <td>unselectItemClass</td>
            <td>string</td>
            <td>
                unselect
            </td>
            <td>
                Css class of the element used to trigger removal of a selectionItemClass element from the selectionsClass container.
            </td>
        </tr>
        <tr>
            <td>showEmptyList</td>
            <td>bool</td>
            <td>
                false
            </td>
            <td>
                If true, the multiselect won't be disabled once all options were selected. This is useful when you have a footer in your dropdown and you want it to be accessible at all times.
            </td>
        </tr>
    <tbody>
    </tbody>
</table>

<a name="templates"></a>
Templates
=================

An example basic template:
````html
<div class="{{className}}" tabindex=1>
    <div class="selected">
        <span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>
    </div>
    <ul class="items">
        {{#showSearch}}
        <li class="searchContainer">
            <input class="search"></input>
        </li>
        {{/showSearch}}
        {{#items}}
        <li class="item" data-text="{{label}}" data-value="{{value}}">
            <span class="itemText">{{label}}</span>
        </li>
        {{/items}}
    </ul>
</div>
````
An example template for multiselleckt:
````html
<div class="{{className}}" tabindex=1>
    <ul class="{{selectionsClass}}">
    {{#selections}}
    {{/selections}}
    </ul>
    <div class="selected">
        <span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>
    </div>
    <ul class="items">
        {{#items}}
        <li class="item" data-text="{{label}}" data-value="{{value}}">
            {{label}}
        </li>
        {{/items}}
    </ul>
</div>
````
An example template for a multiselleckt item:
````html
<li class="{{selectionItemClass}}" data-value="{{value}}">
    {{text}}<i class="icon-remove {{unselectItemClass}}"></i>
</li>
````

<a name="events"></a>
Events
=================

The following events are raised by an instance of selleckt:

<table>
    <thead>
        <tr>
            <th>event name</th>
            <th>arguments</th>
            <th>description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>close</td>
            <td>-</td>
            <td>Triggered when selleckt's dropdown closes</td>
        </tr>
        <tr>
            <td>itemSelected</td>
            <td>The item that the user has selected</td>
            <td>Triggered each time an option is selected by the user. An item is an object representing an option in the selleckt, consisting of value, label and data properties.</td>
        </tr>
        <tr>
            <td>optionsFiltered</td>
            <td>The user's search term</td>
            <td>Triggered after the list of options has been filtered by the user's search term. The provided search term is an unmodified version of the user's search term. Please note that the option filtering will have been case insensitive.</td>
        </tr>
    </tbody>
</table>

An example of using an event, where there is a select with id 'foo' to which selleckt has been applied:

```javascript
var sellecktInstance = $('#foo').data('selleckt');

sellecktInstance.bind('itemSelected', function onItemSelected(item){
    console.log('Item selected: ', item);
});
```
