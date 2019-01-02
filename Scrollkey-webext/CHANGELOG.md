3.0.1
=====
- Fix: if scrolling doesn't work because we are at the end of a page or something, don't cancel the default event
- Fix: don't show notification more than once per tab, unless the scrolling direction changes or the page is reloaded

3.0.0
=====
- Implement optional smooth scrolling (off by default)
- Implement blacklist feature, fixes #29
- Rework options screen - use flexbox instead of table
- Use more generic localisation method
- Phase out setTimeout usage
- Implement scroll to top with gg, scroll to bottom with GG

2.0.1
=====
- Fix "cannot scroll" notification appearing on some sites when scrolling is available by calculating scroll limit differently
- Drop migration path from Scrollkey 1.1.0 (no users of that version anymore)

2.0.0
=====

- Add notification tips for horizontal/vertical scrolling
- Add notification "Saved preferences" and translation in Dutch
- Replace PNG files by SVG file
- Use sync storage instead of local storage (preferences from local storage are migrated to sync storage)
- Checkboxes now render correctly (workaround for bug https://bugzilla.mozilla.org/show_bug.cgi?id=1354336)
- Rework preferences internally
- Partial support for scrolling inside iframes (same-origin policy limits what Scrollkey can do for other iframes)
- Cleanup

1.1.0
=====

- Update Spanish translation
- Make option window layout better

1.0.2
=====

- Fix optional PageUp and PageDown kidnapping :)
- Improve scrolling for PageUp/PageDown

1.0.1
=====

- Insert at page load start, not when page loading is finished

1.0.0
=====

- Port to WebExtensions