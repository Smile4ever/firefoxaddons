4.0.2
=====
- Fix support for Firefox 52.8.1, see #165

4.0.1
=====
- Focus window if it contains the tab which was last opened for Google Translate
- Use another URL structure for Google Translate, fixes #156
- Automatically hide notification after 5 seconds
- Change homepage to itsafeature.org

4.0.0
=====

Features
- Multiple speech engines can now be used next to each other
- Introduce the "reuse tab for all engines" option
- Show icons in the context menu (visible when more than one engine is selected)

Fixes
- DeepL now uses a different mechanism to set the text, which means it works more reliable
- For very long selections (more than 16384 characters), use the content script to retrieve the selection

Changes
- Options page: update the layout for newer Firefox releases
- Options page: include subheadings to easily find options back
- Remove Preferences item from the browser action, since a "Manage extension" entry is already available
- "var" usage replaced with "let"
- Make more use of querySelector
- Use native way of opening related tabs
- Cleanup code

3.1.6
=====
- Fix Bing Translator Voice not working
- Fix Bring Translator not working
- Use magic number 85 instead of 75 for Bing Translator Voice audio length

3.1.5
=====
- Fix iframe selection not working when using toolbar button
- Solve a warning about browser_style
- Pass selection value that we have
- Allow for nested iframes, 1 level beneath the iframe (iframe in iframe)
- Change var usage to let usage
- Cleanups

3.1.4
=====
- Fix: DeepL no longer working, fixes #87

3.1.3
=====
- DeepL support should now work in more cases, and help the user if it doesn't work within 4 seconds
- Selections longer than 150 characters should be considered OK to use. Will allow for selections > 150 characters on priviledged sites.

3.1.2
=====
- Fix badge text
- Fix for priviledged sites
- Fix for DeepL languages not correctly set
- Insert DeepL source text differently

3.1.1
=====
- Fix for DeepL source text not being inserted

3.1.0
=====
- Add support for DeepL

3.0.0
=====
- Expanded support for languages:
	- Added support for Amharic, Bulgarian, Corsican, Frisian, Hawaiian, Indonesian, Kyrgyz, Kurdish, Luxembourgish, Pashto, Samoan, Scottisch Gaelic, Shona, Sindhi, Sinhalese and Xhosa
	- Dropped support for Chinese (Traditional) in favor of the general flavor "Chinese"
	- Renamed Chinese (Simplified) to Chinese, renamed Sundanese (sic) to Sudanese Arabic
	- Renamed Tagalog (Filipino) to Filipino (Tagalog), added Tagalog (Filipino) as primary choice
- Add support for Bing Translator and Bing Translator Voice
	- Added preference Translate engine to switch between Google Translate and Bing Translator
	- Added preference Voice engine to switch between Google Translate Voice and Bing Translator Voice
- Added support for selecting text in input elements inside iframes
- Speak action reworked.
	- Speak action now uses the translation page. If you want to use the old speak action for Google Translate Voice, check the preference "Use audio only for Google Translate Voice".
	- Added preference Text to speak to decide which text needs to be spoken. Can be set to the original text, the translated text or both.
	- Do not attempt to speak a language with Google Translate Voice that is not supported when using the new speak experience.
	- Do not attempt to play audio twice if the source text equals the destination text.
- Added support for full page translation using Google Translate.
- Fixed bug #18
- Add toolbar button to translate the current page or selection.
	- Right click the toolbar button and select "Remove from Toolbar" to remove it from the toolbar.
	- Automatically falls back to Google Translate for full page translation.
	- Right click the toolbar button and select Preferences to change the preferences of Translate Now

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
