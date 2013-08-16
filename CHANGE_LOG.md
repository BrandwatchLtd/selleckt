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
