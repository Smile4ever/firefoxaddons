2.0.1
=====
- Fix "cannot scroll" notification appearing on some sites when scrolling is available by calculating scroll limit differently

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