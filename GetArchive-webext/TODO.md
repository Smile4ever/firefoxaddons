#TODO for Get Archive

This list may not be up to date.

## TODO (bugs)
* URL not copied when tab is switched away -> check what's going on.
* Cannot make out the difference between "Document expired" and "Server not found". -> we have to use webRequest / webNavigation
* http://www.wattxtrawatt.com/biocarla.htm
* https://web.archive.org/web/20050306063111/http://www.rprf.org/Rollography.html CTRL+C
* https://web.archive.org/web/20051227075418/http://www.sonyclassical.com/artists/ligeti_top.htm CTRL+C
* https://www.google.be/search?q=KennethLeighton-OpusNumbers.pdf&oq=KennethLeighton-OpusNumbers.pdf&gs_l=serp.3..30i10k1.2968.2968.0.3234.1.1.0.0.0.0.90.90.1.1.0....0...1c.1.64.serp..0.1.89.GfS6kSCMUnA -> www...com selection -> does nothing!!

## TODO (IDEAS FOR IMPROVEMENT)
* Use webRequest for reading HTTP status code from the headers (see bug above about "Document expired")
* Save URL into Wayback Machine and archive.is
* Copy last downloaded file URL to clipboard - https://github.com/mdn/webextensions-examples/tree/master/latest-download
* Is selection in input taken into account when preventing CTRL+C?

## TODO (notes)
* When sendMessage is not working, there might be a content script 5 seconds later.... detect this better
* keyboard parsing:
** https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Keyboard_Shortcuts
** http://www.openjs.com/scripts/events/keyboard_shortcuts/
** http://www.openjs.com/scripts/events/keyboard_shortcuts/shortcut.js
** Media Keys (not complete yet)
* Bad Request - Error parsing headers: 'limit request headers fields size' -> try disabling and enabling Get Archive.

## TESTS
* Workaround for "CTRL+C on http://ironman.com/assets/files/results/australia/2007.txt freezes the browser" (TODO: file bug about this incident)
* http://ironman.com/assets/files/results/australia/2007.txt - no automatic copying available (for now)
* https://web.archive.org/web/20071010055812/http://www.fimic.fi/fimic/fimic.nsf/mainframe?readform&heinio+mikko (TODO: URL copies, but no notification)

## Fixed
* http://archive.is/2013.07.03-131347/http://www.musicfrom.nl/artiesten/6553/touchin-tongues.html%23.UdQjhH3LfK4 (lees volledig bericht -> get archive.org doesn't work)

## DOCUMENTATION
* Update README file with new screenshots (last one)
* Write changelog for Get Archive 3.0
* Update description pages
