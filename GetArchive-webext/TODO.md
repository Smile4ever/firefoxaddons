#TODO for Get Archive

## IDEAS FOR IMPROVEMENT
* When sendMessage is not working, there might be a content script 5 seconds later.... detect this better
* Use webRequest for reading HTTP status code from the headers 
* Save URL into Wayback Machine and archive.is

## NOTES
* Shortcuts do not work on Firefox error pages
* No statusbar icon

## DONE
* Support for archive.org, archive.is (archive.is/archive.li/archive.today), webcitation.org and Google Cache
* Shortcuts 3 (archive.org), 4 (archive.is), 5 (webcitation.org), 6 (Google Cache)
* Automatic forwarding to an archived page for archive.is, skipping the overview page (optional)
* Detect invalid pages before copying
* Support "Server not found" Firefox error pages, including forwarding to the default archive service
* Add long URL to history using the WebExtension history api if prefer long URL is enabled
* Navigate between archive.org, archive.is, webcitation.org and Google Cache with ease (includes http and www. url detection)
* Copy current URL to clipboard using CTRL+C (requires at least Firefox version 51 where clipboardWrite support was introduced)
* Read from clipboard on INSERT and PAUSE/BREAK (requires at least version 54 since clipboardRead is supported since FF54)
* Open as related tabs (workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1238314)
* Disable the browser button on about: pages
* Copy PDF and TXT links late enough
* Protocol support: FTP, HTTP and HTTPS
* CTRL+3, CTRL+4, CTRL+5, CTRL+6 shortcuts
* Make shortcuts customizable
* Toolbar button
* Context menu items

## TESTS
* Workaround for "CTRL+C on http://ironman.com/assets/files/results/australia/2007.txt freezes the browser" (TODO: file bug about this incident)
* http://ironman.com/assets/files/results/australia/2007.txt - no automatic copying available (for now)

## DOCUMENTATION
* Update README file with new screenshots and documentation about the options
* Write changelog for Get Archive 3.0
* Update description page