2.0.0
=====
* Make shortcut to enable autoscrolling in "on demand" mode customizable (changed default from Escape to Shift+Escape)
* Make options refresh on all pages after saving
* Rewrite options to make the UI clearer
* Change default tipping point value to 300ms
* Fix 1.0.0 regression: when "Never enable autoscrolling" is enabled, some tabs don't close on middle click
* Make the default for "Enable autoscrolling" the value "Never".
* Fix: when the page you're on has jQuery loaded, attempt to get the element listeners on the object you middle clicked on. If there are "click" event listeners on that object, execute the default action (which is probably opening a new tab). jQuery "click" event handlers on an element that is higher than 1000 units do not cancel Middle Click On Page Closes Tab.
* Add whitelist for autoscrolling (can also be used as a blacklist for the middle click function)
* Cancel event if any of the parent elements is an A tag.
* Add utils/keyutils.js
* Friendly name for "Autoscrolling enabled/disabled" on demand

1.0.0
=====
* Optionally allow autoscrolling, disabled by default, fixes bug 15
* Check if the current pages was already closed to prevent two tabs (or more) from closing, fixes bug 16
* Add an options page (requires new permission storage)
* Add Escape shortcut to enable allowscrolling once on a page (might be changed in a future release - this feature is documented in the README) - requires new permission notifications

0.2.0
=====
* Disable autoscrolling

0.1.0
=====
* First public release