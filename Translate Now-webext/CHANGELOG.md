2.0.0
=====

- Speak 195 characters when limit of 195 is reached (instead of doing nothing)
- Add notification when translating upon reaching the upper limit of 5000 selected characters
- Do not display the same notification twice, but instead close the first one and open the second
- Hide the options if they are not yet loaded, instead displaying a message to refresh the options page. Useful when the extension is loaded using about:debugging.
- Fix bug: selection in document.activeElement for input elements should be treated as a selection
- Fix bug: wrong condition when assigning selectionText to selectedText
- Use HTTPS for both actions (translate and speak)
- Best-effort support for addons.mozilla.org among other priviledged websites

1.3.0
=====

- Insert as related tabs by default, can be changed in the preferences
- Improve build script
- Load options.js using defer

1.2.0
=====

- Allow text selection > 150 characters (workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1338898)
- Allow speak actions up to 195 characters
- Use new options save/restore mechanism
- Fix build script

1.1.1
=====

- Disable some lines with console.log 

1.1.0
=====

- Remove setTimeout
- Fix reuse_tab option
- Increase allowed text length for speak action

1.0.0
=====
- Port to WebExtensions
- Add icon to notifications
- Add "Saved preferences" notification
- Improve CSS for options.html
- Use flexbox for options.html instead of table
- Improve packaging process and fix default setting
- Rebuild for AMO
- Workaround for code that should have worked (might be a Firefox bug)
- Remove context menus before adding new ones
- Write a README with some screenshots
