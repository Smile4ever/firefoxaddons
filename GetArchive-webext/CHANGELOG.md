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
