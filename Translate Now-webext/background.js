/// Static variables
var selectedText = "";
var lastTabId = -1;
var globalAction = "";

//the addons icon is a modified version of http://www.flaticon.com/free-icon/translator-tool_69101
//see their website for licensing information

var translate_now_destination_language;
var translate_now_source_language;
var translate_now_reuse_tab;
var translate_now_related_tabs;
var translate_now_enable_speak;
var translate_now_translate_engine;
var translate_now_speak_engine;
var translate_now_google_speak_audio_only;
var translate_now_to_speak;
var translate_now_context_selection;
var translate_now_context_page;
var translate_now_context_link;

function init(){
	var valueOrDefault = function(value, defaultValue){
		if(value == undefined)
			return defaultValue;
		return value;
	}
	
	browser.storage.local.get([
		"translate_now_destination_language",
		"translate_now_source_language",
		"translate_now_reuse_tab",
		"translate_now_related_tabs",
		"translate_now_enable_speak",
		"translate_now_translate_engine",
		"translate_now_speak_engine",
		"translate_now_google_speak_audio_only",
		"translate_now_to_speak",
		"translate_now_context_selection",
		"translate_now_context_page",
		"translate_now_context_link"
	]).then((result) => {
		//console.log("background.js translate_now_destination_language " + result.translate_now_destination_language);
		translate_now_destination_language = valueOrDefault(result.translate_now_destination_language, "en");
	
		//console.log("background.js translate_now_source_language " + result.translate_now_source_language);
		translate_now_source_language = valueOrDefault(result.translate_now_source_language, "auto");
	
		//console.log("background.js translate_now_reuse_tab " + result.translate_now_reuse_tab);
		translate_now_reuse_tab = valueOrDefault(result.translate_now_reuse_tab, true);
				
		//console.log("background.js translate_now_related_tabs " + result.translate_now_related_tabs);
		translate_now_related_tabs = valueOrDefault(result.translate_now_related_tabs, true);
	
		//console.log("background.js translate_now_enable_speak " + result.translate_now_enable_speak);
		translate_now_enable_speak = valueOrDefault(result.translate_now_enable_speak, false);
		
		//console.log("background.js translate_now_translate_engine " + result.translate_now_translate_engine);
		translate_now_translate_engine = valueOrDefault(result.translate_now_translate_engine, "google");
		
		//console.log("background.js translate_now_speak_engine " + result.translate_now_speak_engine);
		translate_now_speak_engine = valueOrDefault(result.translate_now_speak_engine, "google");
		
		//console.log("background.js translate_now_google_speak_audio_only " + result.translate_now_google_speak_audio_only);
		translate_now_google_speak_audio_only = valueOrDefault(result.translate_now_google_speak_audio_only, false);
		
		//console.log("background.js translate_now_to_speak " + result.translate_now_to_speak);
		translate_now_to_speak = valueOrDefault(result.translate_now_to_speak, "both");
		
		//console.log("background.js translate_now_context_selection " + result.translate_now_context_selection);
		translate_now_context_selection = valueOrDefault(result.translate_now_context_selection, true);
		
		//console.log("background.js translate_now_context_page " + result.translate_now_context_page);
		translate_now_context_page = valueOrDefault(result.translate_now_context_page, true);
		
		//console.log("background.js translate_now_context_link " + result.translate_now_context_link);
		translate_now_context_link = valueOrDefault(result.translate_now_context_link, true);
		
		initContextMenus();
		
		function format(speak_engine){
			if(speak_engine == "google") return "Google Translate";
			if(speak_engine == "bing") return "Bing Translator";
		}
		
		browser.browserAction.setTitle({title: "Translate Now - " + format(translate_now_speak_engine)});
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
				onError("failed to execute " + action + "with data " + data);
				if(errorCallback) errorCallback(data);
			});
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

// From Get Archive
/*function sendMessageToTab(action, data, tabId, errorCallback){
	browser.tabs.sendMessage(tabId, {"action": action, "data": data}).catch(function(){
		onError("failed to execute " + action + "with data " + data + " for " + tabId);
		if(errorCallback) errorCallback(data);
	});
}*/

/// Context menus
function initContextMenus(){
	
	try{
		browser.contextMenus.onClicked.removeListener(listener);
		browser.contextMenus.removeAll();
	}catch(ex){
		//console.log("contextMenu remove failed: " + ex);
	}
	
	var selectionPageContext = [];
	var selectionContext = [];
	
	if(translate_now_context_selection)	selectionPageContext.push("selection");
	if(translate_now_context_selection)	selectionContext.push("selection");
	if(translate_now_context_page) selectionPageContext.push("page");
	if(translate_now_context_link) selectionPageContext.push("link");
	
	if(translate_now_translate_engine == "google")
		createContextMenu("translatenow-google-translate", "Translate with Google", selectionPageContext);
	if(translate_now_translate_engine == "bing")
		createContextMenu("translatenow-bing-translate", "Translate with Bing", selectionContext);
	
	if(translate_now_enable_speak){
		if(translate_now_speak_engine == "google")
			createContextMenu("translatenow-google-speak", "Speak with Google Translate Voice", selectionContext);
		if(translate_now_speak_engine == "bing")
			createContextMenu("translatenow-bing-speak", "Speak with Bing Translator Voice", selectionContext);
	}
	
	createContextMenu("translatenow-tb-preferences", "Preferences", ["browser_action"]);
	browser.contextMenus.onClicked.addListener(listener);
}

function createContextMenu(id, title, contexts){
	browser.contextMenus.create({
		id: id,
		title: title,
		contexts: contexts
	}, onCreated);

	function onCreated(n) {
		if (browser.runtime.lastError) {
			//console.log(`Error: ${browser.runtime.lastError}`);
		}
	}
}

/// Get Archive code
function openPreferences(){
	function onOpened() {
		//console.log(`Options page opened`);
	}

	browser.runtime.openOptionsPage().then(onOpened, onError);	
}

function listener(info,tab){
	if(info.menuItemId == "translatenow-tb-preferences"){
		// Open Preferences
		openPreferences();
		return;
	}
	
	var selectionText = "";
	var pageUrl = "";

	//console.log("info.selectionText " + info.selectionText);
	//console.log("info.pageUrl " + info.pageUrl);
	//console.log("info.linkUrl " + info.linkUrl);

	// Don't fill pageUrl when we won't be using it.
	if(info.selectionText != "" && info.selectionText != null){
		selectionText = info.selectionText;
	}else{
		if(info.pageUrl != "" && info.pageUrl != null)
			pageUrl = info.pageUrl;

		if(info.linkUrl != "" && info.linkUrl != null)
			pageUrl = info.linkUrl;
	}
	
	//console.log("selectionText " + selectionText);
	//console.log("pageUrl " + pageUrl);
	
	doClick(selectionText, pageUrl, info.menuItemId.replace("translatenow-", ""));
}

function clickToolbarButton(){
	if(translate_now_translate_engine == "google")
		globalAction = "google-translate";
				
	if(translate_now_translate_engine == "bing")
		globalAction = "bing-translate";
	
	// selectionText is unknown at this point, so pass an empty string
	sendMessage("getSelection", "", priviledgedSiteNoContentScript);
}

browser.browserAction.onClicked.addListener(clickToolbarButton);

/// Translate Now Code
function openTab(url){
	//console.log("openTab for url " + url);
	//console.log("lastTabId is " + lastTabId);
	//console.log("translate_now_reuse_tab is " + translate_now_reuse_tab);

	if(lastTabId != -1 && translate_now_reuse_tab){
		browser.tabs.get(lastTabId).then(onGot, onError);
		
		function onGot(tabInfo) {
			//console.log("tab exists");
						
			browser.tabs.update(lastTabId, {
				active: true,
				url: url
			}).then(
				function(data){
					//console.log(1, 'success', JSON.stringify(data));
					/*if(globalAction == "google-translate"){
						console.log("Google Translate - reuse tab fix");
						sendMessageToTab("setGoogleTranslateText", selectedText, lastTabId);
					}*/
				},
				function(error){
					notify("Failed to update tab");
					lastTabId = -1;
				}
			);
		}

		function onError(error) {
			openTabInner(url);
		}
	}else{
		openTabInner(url);
	}
}

function openTabInner(url){
	var parentTabIndex = -1;
	
	function ready(tabs) {
		parentTabIndex = tabs[0].index;
		
		browser.tabs.create({
			url: url,
			active: true
		}).then(onCreated, onError);
		
		function onCreated(tab){
			lastTabId = tab.id;
			
			if(translate_now_related_tabs){
				moveTabToCurrent(tab.id, parentTabIndex);
			}
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(ready, onError);
}

/// Code from Get Archive
function moveTabToCurrent(tabId, parentTabIndex) {
	browser.tabs.move(tabId, {index: parentTabIndex + 1}).then(onMoved, onError);
	
	function onMoved(tab) {
		//onDebug("Moved:" + JSON.stringify(tab));
	}
}
/// End of code from Get Archive

function doClick(selectionText, pageUrl, action){
	globalAction = action;

	// Ideally, we want to use selectionText this which also works for cross-domain iframes (nice!!)
	// But we now use a content script if the selection is too long to circumvent https://bugzilla.mozilla.org/show_bug.cgi?id=1338898
	
	if(selectionText.length < 150 || pageUrl != "")
		doAction(selectionText, pageUrl, action);
	else
		sendMessage("getSelection", selectionText, priviledgedSiteNoContentScript);
}

function priviledgedSiteNoContentScript(selectionText){
	// We are probably on addons.mozilla.org or another priviledged website
	//notify("This website is not supported due to security restrictions.");
	
	// Support for addons.mozilla.org among other websites (best effort)
	doAction(selectionText, globalAction);
}

function doAction(selectionText, pageUrl, action){
	if(selectionText != "" && selectionText != null){
		selectedText = selectionText;
		//console.log("selectionText length is " + selectionText.length);
	}else{
		if(pageUrl != "" && pageUrl != null){
			if((pageUrl.indexOf("http://") == -1 && pageUrl.indexOf("https://") == -1) || pageUrl.indexOf("://translate.google.") > -1){
				notify("This page cannot be translated, please try another page.");
				return;
			}
			if(action == "bing-translate"){
				notify("Bing cannot translate whole pages, using Google Translate instead.");
				globalAction = "google-translate";
				action = "google-translate";
			}
			selectedText = pageUrl;
		}else{
			notify("Please try another selection.");
			return;
		}
	}
	
	//console.log("doAction - pageUrl is " + pageUrl);
	//console.log("doAction - selectedText is " + selectedText);
	
	if(selectedText.length > 5000 && action.indexOf("translate") > -1){
		notify("Selected text is too long. Only the first 5000 selected characters will be translated.");
	}
	
	if(action.indexOf("google") > -1){
		if(selectedText.length > 195 && action == "google-speak"){
			notify("Selected text is too long. Only the first 195 characters will be spoken.");
		}		
		
		var newText = googletranslate.getNewText(selectedText);
			
		if(action == "google-speak"){
			if(translate_now_google_speak_audio_only){
				openTab(googletranslate.getSpeakUrlSource(translate_now_destination_language, newText));
			}else{
				// Using HTTP instead of HTTPS, to trigger Firefox HTTP -> HTTPS redirect. Otherwise, the old text is retained. See bug 18. https://github.com/Smile4ever/firefoxaddons/issues/18
				openTab("http://translate.google.com/#" + translate_now_source_language + "/" + translate_now_destination_language + "/" + newText);
				browser.tabs.onUpdated.addListener(pageLoaded);
				setTimeout(function(){
					// Remove the listener when the page fails to load within 5 seconds
					browser.tabs.onUpdated.removeListener(pageLoaded);
				}, 5000);
			}
		}else{
			if(newText.indexOf("%3A%2F%2F") > -1){ // ://
				openTab("https://translate.google.com/translate?sl=" + translate_now_source_language + "&tl=" + translate_now_destination_language + "&js=y&prev=_t&ie=UTF-8&u=" + newText);
			}else{
				// Using HTTP instead of HTTPS, to trigger Firefox HTTP -> HTTPS redirect. Otherwise, the old text is retained. See bug 18. https://github.com/Smile4ever/firefoxaddons/issues/18
				openTab("http://translate.google.com/#" + translate_now_source_language + "/" + translate_now_destination_language + "/" + newText);
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
function onError(error) {
	//console.log(`Error: ${error}`);
}

function notify(message){
	browser.notifications.create(message.substring(0, 20).replace(" ", ""),
	{
		type: "basic",
		iconUrl: browser.extension.getURL("icons/translatenow-64.png"),
		title: "Translate Now",
		message: message
	});
}
