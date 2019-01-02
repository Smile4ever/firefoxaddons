4.0.0
=============
Technical
* Cleanup code to make it more maintainable
* Use Clipboard Web API instead of execCommand workarounds
** This increases the Firefox requirement to (minimum) version 63
** This should be more reliable then in the past
* Remove workaround to open as related tab, this is now supported natively

Features
* For the message "Page could not be loaded", include the URL
* Add date from archive URL to notification when known
* nl.wikipedia.org: BREAK/PAUSE now pastes the partial template for an archived URL
* Re-introduce the "auto" option for search, using the search API (requires the search permission)

Changes
* Set getarchive_disable_all_shortcuts to true by default
* Drop the Preferences contextmenu item on the toolbar icon, this does the same as "Manage extension" added by Firefox

Bugs
* Fix some bugs
** Paste by BREAK/PAUSE or INSERT would put the cursor in the wrong place. This is no longer the case.

3.2.0
=============
* Cannot make out the difference between "Document expired" and "Server not found".
* Use webRequest for reading HTTP status code from the headers (see bug above about "Document expired"), requires new <all_urls> permission
* Make the search function available in tabs where there is no content script, and cleanup the code responsible for this
* Create a context menu item for search
* If there is a selection when doing a search, use that
* Remove the use of "this" which might be a source of errors
* Rename variable i to j (i already declared)
* Fix typo in variable name
* Save URL into archive.org (Wayback Machine), archive.is and webcitation.org
* Fix possible incompatibility with Firefox <= 55

3.1.1
=============
* Fix archive.is LONG link not correct

3.1.0
=============
* Add a way to disable all shortcuts at once, fixes #100
* Add Dutch localisation
* Make the option column flexbox layout more fluid
* Add icons to the context menu items for compatible versions of Firefox
* Code and file cleanup
* Add light/dark icons
* Add settings icon from Tab Center Redux
* Add new localisation messages
* Updated README slightly, including updated screenshots

3.0.0
=============

* Disable the browser button on about: pages
* Support for WebCitation and Google Cache
* Fix right click menu on archive websites not opening a new tab
* Close the previous notification before showing a new notification when the notification text is the same
* Automatic forwarding for archive.is

Changes
* Port to WebExtension, including most features
* Search engines do not integrate with Firefox due to a missing searchengines API for WebExtensions
* Shortcuts can no longer be modified with Customizable Shortcuts, but can instead be configured in the preferences screen.

Features in 3.0.0
* Support for archive.org, archive.is (archive.is/archive.li/archive.today), webcitation.org and Google Cache
* Shortcuts 3 (archive.org), 4 (archive.is), 5 (webcitation.org), 6 (Google Cache)
* Automatic forwarding to an archived page for archive.is, skipping the overview page (optional)
* Detect invalid pages before copying
* Support "Server not found" Firefox error pages, including forwarding to the default archive service (optional)
* Add long URL to history using the WebExtension history api if prefer long URL is enabled
* Navigate between archive.org, archive.is, webcitation.org and Google Cache with ease (includes http and www. url detection)
* Copy current URL to clipboard using CTRL+C (requires at least Firefox version 51 where clipboardWrite support was introduced)
* Read from clipboard on INSERT and PAUSE/BREAK (requires at least version 54 since clipboardRead is supported since FF54)
* Open as related tabs (workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1238314)
* Disable the browser button on about: pages
* Copy PDF and TXT links late enough
* Protocol support: FTP, HTTP and HTTPS
* CTRL+3, CTRL+4, CTRL+5, CTRL+6 shortcuts
* Shortcuts can be customized
* Toolbar button with all context menu items
* Context menu items for supported archive services (optional)
* Search with Google/DuckDuckGo/Bing function
* LinkSearch
