/// Static variables
let selectedText = "";
let globalAction = "";
let lastTabs = [];

//the addons icon is a modified version of http://www.flaticon.com/free-icon/translator-tool_69101
//see their website for licensing information

let translate_now_destination_language;
let translate_now_source_language;
let translate_now_reuse_tab;
let translate_now_reuse_tab_all;
let translate_now_related_tabs;
let translate_now_translate_engine;
let translate_now_google_speak_audio_only;
let translate_now_to_speak;
let translate_now_context_selection;
let translate_now_context_page;
let translate_now_context_link;

let translate_now_show_deepl_translator;
let translate_now_show_bing_translator;
let translate_now_show_google_translate;

let translate_now_show_google_translate_voice;
let translate_now_show_bing_translator_voice;

function init(){
	let valueOrDefault = function(value, defaultValue){
		return value == undefined ? defaultValue : value;
	}

	browser.storage.local.get([
		"translate_now_destination_language",
		"translate_now_source_language",
		"translate_now_reuse_tab",
		"translate_now_reuse_tab_all",
		"translate_now_related_tabs",
		"translate_now_translate_engine",
		"translate_now_google_speak_audio_only",
		"translate_now_to_speak",
		"translate_now_context_selection",
		"translate_now_context_page",
		"translate_now_context_link",
		"translate_now_show_deepl_translator",
		"translate_now_show_bing_translator",
		"translate_now_show_google_translate",
		"translate_now_show_google_translate_voice",
		"translate_now_show_bing_translator_voice"
	]).then((result) => {
		translate_now_destination_language = valueOrDefault(result.translate_now_destination_language, "en");
		translate_now_source_language = valueOrDefault(result.translate_now_source_language, "auto");
		translate_now_reuse_tab = valueOrDefault(result.translate_now_reuse_tab, true);
		translate_now_reuse_tab_all = valueOrDefault(result.translate_now_reuse_tab_all, false);
		translate_now_related_tabs = valueOrDefault(result.translate_now_related_tabs, true);
		translate_now_enable_speak = valueOrDefault(result.translate_now_enable_speak, false);
		translate_now_translate_engine = valueOrDefault(result.translate_now_translate_engine, "google");
		translate_now_google_speak_audio_only = valueOrDefault(result.translate_now_google_speak_audio_only, false);
		translate_now_to_speak = valueOrDefault(result.translate_now_to_speak, "both");
		translate_now_context_selection = valueOrDefault(result.translate_now_context_selection, true);
		translate_now_context_page = valueOrDefault(result.translate_now_context_page, true);
		translate_now_context_link = valueOrDefault(result.translate_now_context_link, true);

		translate_now_show_deepl_translator = valueOrDefault(result.translate_now_show_deepl_translator, false);
		translate_now_show_bing_translator = valueOrDefault(result.translate_now_show_bing_translator, false);
		translate_now_show_google_translate = valueOrDefault(result.translate_now_show_google_translate, true);

		translate_now_show_google_translate_voice = valueOrDefault(result.translate_now_show_google_translate_voice, false);
		translate_now_show_bing_translator_voice = valueOrDefault(result.translate_now_show_bing_translator_voice, false);

		initContextMenus();

		function format(translate_engine){
			if(translate_engine == "google") return "Google Translate";
			if(translate_engine == "bing") return "Bing Translator";
			if(translate_engine == "deepl") return "DeepL Translator";
		}

		browser.browserAction.setTitle({title: "Translate Now - " + format(translate_now_translate_engine)});
	}).catch(console.error);
}
init();

///Messages
// listen for messages from the content or options script
browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "refresh-options":
			init();
			break;
		case "setSelection":
			setSelection(message.data.selection, message.data.pageUrl);
			break;
		case "notify":
			notify(message.data);
			break;
		default:
			break;
	}
});

// See also https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/Tabs/sendMessage
function sendMessage(action, data, errorCallback){
	function logTabs(tabs) {
		for (tab of tabs) {
			browser.tabs.sendMessage(tab.id, {"action": action, "data": data}).catch(function(){
				console.error("failed to execute " + action + "with data " + data);
				if(errorCallback) errorCallback(data, tab.url);
			});
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, console.error);
}

/// Context menus
function initContextMenus(){
	browser.contextMenus.onClicked.removeListener(listener);
	browser.contextMenus.removeAll();

	let selectionPageContext = [];
	let selectionContext = [];

	if(translate_now_context_selection)	selectionPageContext.push("selection");
	if(translate_now_context_selection)	selectionContext.push("selection");
	if(translate_now_context_page) selectionPageContext.push("page");
	if(translate_now_context_link) selectionPageContext.push("link");

	browser.runtime.getBrowserInfo().then((info) => {
		let v = info.version;
		let browserVersion = parseInt(v.slice(0, v.search(".") - 1));

		if(translate_now_show_bing_translator)
			createContextMenu("translatenow-bing-translate", "Translate with Bing", selectionContext, browserVersion, "icons/engines/bing.png");
		if(translate_now_show_deepl_translator)
			createContextMenu("translatenow-deepl-translate", "Translate with DeepL", selectionContext, browserVersion, "icons/engines/deepl.png");
		if(translate_now_show_google_translate)
			createContextMenu("translatenow-google-translate", "Translate with Google", selectionPageContext, browserVersion, "icons/engines/google.png");

		if(translate_now_show_bing_translator_voice)
			createContextMenu("translatenow-bing-speak", "Speak with Bing Translator Voice", selectionContext, browserVersion, "icons/engines/bing.png");
		if(translate_now_show_google_translate_voice)
			createContextMenu("translatenow-google-speak", "Speak with Google Translate Voice", selectionContext, browserVersion, "icons/engines/google.png");

		browser.contextMenus.onClicked.addListener(listener);
	});
}

function createContextMenu(id, title, contexts, browserVersion, icon64){
	if(browserVersion > 55 && icon64 != null){
		browser.contextMenus.create({
			id: id,
			title: title,
			contexts: contexts,
			icons: {
				"64": browser.extension.getURL(icon64)
			}
		});
	}else{
		browser.contextMenus.create({
			id: id,
			title: title,
			contexts: contexts
		});
	}
}

function listener(info,tab){
	if(info.menuItemId == "translatenow-tb-preferences"){
		browser.runtime.openOptionsPage();
		return;
	}

	let selectionText = "";
	let pageUrl = "";

	// Don't fill pageUrl when we won't be using it.
	if(info.selectionText != "" && info.selectionText != null){
		selectionText = info.selectionText;
	}else{
		if(info.pageUrl != "" && info.pageUrl != null)
			pageUrl = info.pageUrl;

		if(info.linkUrl != "" && info.linkUrl != null)
			pageUrl = info.linkUrl;
	}
	
	doClick(selectionText, pageUrl, info.menuItemId.replace("translatenow-", ""));
}

function clickToolbarButton(){
	if(translate_now_translate_engine != null){
		globalAction = translate_now_translate_engine + "-translate";

		// selectionText is unknown at this point, so pass an empty string
		sendMessage("getSelection", "", priviledgedSiteNoContentScript);
	}
}

browser.browserAction.onClicked.addListener(clickToolbarButton);

function openTab(url){
	if(lastTabs.length > 0 && translate_now_reuse_tab){
		let toBeOpenedHostname = new URL(url).hostname;

		// Look for tabs in lastTabs where hostname is equal to the to-be-opened one
		// when translate_now_reuse_tab_all is set to true, it will overwrite this again
		let lastTabPromises = lastTabs.map(lastTab => browser.tabs.get(lastTab.id));

		Promise.all(lastTabPromises).then((tabs) => {
			let equalTabs = tabs.filter(function currentHostnameMatchesToBeOpened(tab) {
				return new URL(tab.url).hostname == toBeOpenedHostname;
			});

			if(translate_now_reuse_tab_all){
				equalTabs = tabs;
			}

			if(equalTabs.length > 0){
				let lastEqualTab = equalTabs.pop();
				browser.tabs.get(lastEqualTab.id).then((tabInfo) => {
					browser.tabs.update(lastEqualTab.id, {
						active: true,
						url: url
					});
					browser.windows.update(lastEqualTab.windowId, {
						focused: true
					});
				}, function(error){
					openFocusedTab(url);
				});
			}else{
				openFocusedTab(url);
			}
		}, function(error){
			openFocusedTab(url);
		});
	}else{
		openFocusedTab(url);
	}
}

function openFocusedTab(url){
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		let createProperties = {
			url: url,
			active: true
		};

		if(translate_now_related_tabs){
			createProperties.openerTabId = tabs[0].id;
		}

		browser.tabs.create(createProperties).then((tab) => {
			// tab.url is about:blank at the creation time, use "url" variable instead
			lastTabs.push({id: tab.id, url: url});
		}, console.error);
	}, console.error);
}

function handleRemoved(tabId, removeInfo) {
	// Remove closed tabs from the lastTabs array
	lastTabs = lastTabs.filter(lastTab => lastTab.id != tabId);
}

browser.tabs.onRemoved.addListener(handleRemoved);

function doClick(selectionText, pageUrl, action){
	globalAction = action;

	// Ideally, we want to use selectionText this which also works for cross-domain iframes (nice!!)
	// But we now use a content script if the selection is too long to circumvent https://bugzilla.mozilla.org/show_bug.cgi?id=1338898

	if(selectionText.length < 150 || pageUrl != "" || (selectionText.length > 150 && selectionText.length != 16384))
		doAction(selectionText, pageUrl, action);
	else
		sendMessage("getSelection", selectionText, priviledgedSiteNoContentScript);
}

function priviledgedSiteNoContentScript(selectionText, pageUrl){
	// We are probably on addons.mozilla.org or another priviledged website
	//notify("This website is not supported due to security restrictions.");
	
	// Support for addons.mozilla.org among other websites (best effort)
	doAction(selectionText, pageUrl, globalAction);
}

function doAction(selectionText, pageUrl, action){
	if(selectionText != "" && selectionText != null){
		selectedText = selectionText;
	}else{
		if(pageUrl != "" && pageUrl != null){
			if(pageUrl.includes("://translate.google.") || pageUrl.includes("://deepl.com") || pageUrl.includes("://www.bing.com/translator")){
				notify("This page cannot be translated, please try another page.");
				return;
			}

			if(action == "bing-translate"){
				notify("Bing cannot translate whole pages, using Google Translate instead.");
			}
			if(action == "deepl-translate"){
				notify("DeepL cannot translate whole pages, using Google Translate instead.");
			}
			
			if(action == "bing-translate" || action == "deepl-translate"){
				globalAction = "google-translate";
				action = "google-translate";
			}
			selectedText = pageUrl;
		}else{
			notify("Please try another selection.");
			return;
		}
	}
	
	if(selectedText.length > 5000 && action.indexOf("translate") > -1){
		notify("Selected text is too long. Only the first 5000 selected characters will be translated.");
	}
	
	let newText = googletranslate.getNewText(selectedText);

	if(action.indexOf("google") > -1){
		if(selectedText.length > 195 && action == "google-speak"){
			notify("Selected text is too long. Only the first 195 characters will be spoken.");
		}		

		if(action == "google-speak"){
			if(translate_now_google_speak_audio_only){
				openTab(googletranslate.getSpeakUrlSource(translate_now_destination_language, newText));
			}else{
				// Using HTTP instead of HTTPS, to trigger Firefox HTTP -> HTTPS redirect. Otherwise, the old text is retained. See bug 18. https://github.com/Smile4ever/firefoxaddons/issues/18
				//openTab("http://translate.google.com/#" + translate_now_source_language + "/" + translate_now_destination_language + "/" + newText);
				// Use new URL structure, see bug 156. https://github.com/Smile4ever/firefoxaddons/issues/156
				openTab("http://translate.google.com/#view=home&op=translate&sl=" + translate_now_source_language + "&tl=" + translate_now_destination_language + "&text=" + newText);
				
				browser.tabs.onUpdated.addListener(pageLoaded);
				setTimeout(function(){
					// Remove the listener when the page fails to load within 5 seconds
					browser.tabs.onUpdated.removeListener(pageLoaded);
				}, 5000);
			}
		}else{
			if(newText.includes("%3A%2F%2F")){ // ://
				//openTab("https://translate.google.com/translate?sl=" + translate_now_source_language + "&tl=" + translate_now_destination_language + "&js=y&prev=_t&ie=UTF-8&u=" + newText);
				openTab("https://translate.google.com/translate?hl=" + translate_now_source_language + "&sl=" + translate_now_source_language + "&tl=" + translate_now_destination_language + "&u=" + newText);
			}else{
				// Using HTTP instead of HTTPS, to trigger Firefox HTTP -> HTTPS redirect. Otherwise, the old text is retained. See bug 18. https://github.com/Smile4ever/firefoxaddons/issues/18
				//openTab("http://translate.google.com/#" + translate_now_source_language + "/" + translate_now_destination_language + "/" + newText);
				// Use new URL structure, see bug 156. https://github.com/Smile4ever/firefoxaddons/issues/156
				openTab("http://translate.google.com/#view=home&op=translate&sl=" + translate_now_source_language + "&tl=" + translate_now_destination_language + "&text=" + newText);

			}
		}
	}
	
	if(action.indexOf("bing") > -1){
		openTab("https://www.bing.com/translator");
		browser.tabs.onUpdated.addListener(pageLoaded);
		setTimeout(function(){
			// Remove the listener when the page fails to load within 5 seconds
			browser.tabs.onUpdated.removeListener(pageLoaded);
		}, 5000);
	}

	if(action.indexOf("deepl") > -1){
		let sourceLanguage = translate_now_source_language == "auto" ? "en" : translate_now_source_language;
		openTab("https://www.deepl.com/translator#" + sourceLanguage + "/" + translate_now_destination_language + "/" + newText);
	}
}

function pageLoaded(tabId, changeInfo, tabInfo){
	if(tabInfo.status != "complete" || tabInfo.status == "interactive") return;
	
	if(tabInfo.url.indexOf("https://www.bing.com/translator") > -1){
		if(globalAction == "bing-translate")
			sendMessage("bingTranslate", {translate_now_source_language: translate_now_source_language, translate_now_destination_language: translate_now_destination_language, selectedText: selectedText});
		if(globalAction == "bing-speak")
			sendMessage("bingSpeak", {translate_now_source_language: translate_now_source_language, translate_now_destination_language: translate_now_destination_language, selectedText: selectedText, translate_now_to_speak: translate_now_to_speak});
		browser.tabs.onUpdated.removeListener(pageLoaded);
	}

	// HTTP -> HTTPS redirect
	if(tabInfo.url.indexOf("https://translate.google.com") > -1){
		if(globalAction == "google-speak")
			sendMessage("googleSpeak", translate_now_to_speak);
		browser.tabs.onUpdated.removeListener(pageLoaded);
	}
}

function setSelection(selectionText, pageUrl){
	//console.log("selectionText from page is " + selectionText);
	doAction(selectionText, pageUrl, globalAction);
}

/// Helper functions
function notify(message){
	let messageId = message.substring(0, 20).replace(" ", "");
	browser.notifications.create(messageId,
	{
		type: "basic",
		iconUrl: browser.extension.getURL("icons/translatenow-64.png"),
		title: "Translate Now",
		message: message
	});
	setTimeout(function(){
		browser.notifications.clear(messageId);
	}, 5000);
}
