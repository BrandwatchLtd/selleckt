1.1.0 - 25 February 2015
===============

- Selleckt now allows addition and removal of items using `addItem` and `removeItems`
- Breaking change - deselecting items in MultiSelleckt is now achieved via `unselectItem` instead of `removeItem`
- Selleckt is now browserified and the codebase fully modular

0.3.1 - 8 January 2015
===============

- Selleckt now allows event propgation and default behaviour on mouse scrolling
- EditorConfig added

0.2.3 - 24 January 2014
===============

- Selleckt now renders the dropdown above the trigger element when there is not enough space below it.

0.2.2 - 22 January 2014
===============

- Fixed parsing issue for option elements with empty values

0.2.1 - 11 September 2013
===============

- Fixed exception in IE8 when using the searchbox

0.2 - 16 August 2013
===============

- The search input gets cleared when Selleckt is opened
- Hide options with empty values in search results
- Selleckt now stays focused after item is selected
- Fixed minor positioning bug
- Selleckt no longer fires a change event on original select on instantiation

0.1.6 - 8 August 2013
===============

- Fixed issue where data attributes on the original selleckt's options were not passed to the item template

0.1.5 - 7 August 2013
===============

- Added user-configurable class names to item-/multi-template
- Fixed issue where change events were firing twice

0.1.4 - 26 July 2013
===============

- Click event to open Selleckt now propagates, causing other selleckts to close.
- Search input focuses when Selleckt opens
- scroll state restores to the top when Selleckt closes


0.1.3 - 26 July 2013
===============

- Custom CSS class names were not being correctly set in the default templates
- When a multi-select has all selected items removed, the placeholder text is now correctly restored
- Selleckt now behaves more nicely inside containers with overflow:hidden

0.1.2 - 15 July 2013
===============

- Made selleckt trigger change event on original select when selection is modified
- Improved cleanup on destroy()

0.1.1 - 12 July 2013
===============

- Added ability to pass data to the templates via options.mainTemplateDate

0.1.0 - 11 July 2013
===============

First Release
