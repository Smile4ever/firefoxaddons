/// Global variables
var lastUrl = "";
var lastTabId = -1;
var lastTabIdServerNotFound = -1;
var lastParentTabIndex = -1;
var globalArchiveService = "";
var wait = false; // used in handleUpdated()
var oldUrl = ""; // used in changeUrl()
var currentTabUrl = "";

var ui_contextMenus = false;

/// Preferences
var getarchive_show_contextmenu_item_archiveorg;
var getarchive_show_contextmenu_item_archiveis;
var getarchive_show_contextmenu_item_webcitation;
var getarchive_show_contextmenu_item_googlecache;

var getarchive_automatic_forward;
var getarchive_related_tabs;
var getarchive_default_archive_service;

function init(){
	var valueOrDefault = function(value, defaultValue){
		if(value == undefined) return defaultValue;
		return value;
	}
	
	browser.storage.local.get([
		"getarchive_show_contextmenu_item_archiveorg",
		"getarchive_show_contextmenu_item_archiveis",
		"getarchive_show_contextmenu_item_webcitation",
		"getarchive_show_contextmenu_item_googlecache",
		"getarchive_automatic_forward",
		"getarchive_related_tabs"
	]).then((result) => {
		onVerbose("background.js getarchive_show_contextmenu_item_archiveorg " + result.getarchive_show_contextmenu_item_archiveorg);
		getarchive_show_contextmenu_item_archiveorg = valueOrDefault(result.getarchive_show_contextmenu_item_archiveorg, true);
		
		onVerbose("background.js getarchive_show_contextmenu_item_archiveis " + result.getarchive_show_contextmenu_item_archiveis);
		getarchive_show_contextmenu_item_archiveis = valueOrDefault(result.getarchive_show_contextmenu_item_archiveis, true);
		
		onVerbose("background.js getarchive_show_contextmenu_item_webcitation " + result.getarchive_show_contextmenu_item_webcitation);
		getarchive_show_contextmenu_item_webcitation = valueOrDefault(result.getarchive_show_contextmenu_item_webcitation, false);
		
		onVerbose("background.js getarchive_show_contextmenu_item_googlecache " + result.getarchive_show_contextmenu_item_googlecache);
		getarchive_show_contextmenu_item_googlecache = valueOrDefault(result.getarchive_show_contextmenu_item_googlecache, false);
		
		onVerbose("background.js getarchive_automatic_forward " + result.getarchive_automatic_forward);
		getarchive_automatic_forward = valueOrDefault(result.getarchive_automatic_forward, true);
		
		onVerbose("background.js getarchive_related_tabs " + result.getarchive_related_tabs);
		getarchive_related_tabs = valueOrDefault(result.getarchive_related_tabs, true);
				
		onVerbose("background.js getarchive_default_archive_service " + result.getarchive_default_archive_service);
		getarchive_default_archive_service = valueOrDefault(result.getarchive_default_archive_service, "archive.org");
				
		browser.browserAction.onClicked.removeListener(clickToolbarButton);
		browser.browserAction.onClicked.addListener(clickToolbarButton);

		browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
			updateUI(tabs[0].id, "init");
		});
		
		initContextMenus();
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
			setSelection(message.data);
			break;
		case "notify":
			notify(message.data);
			break;
		case "closeTab":
			closeTab();
			break;
		case "openTab":
			openTab(message.data);
			break;
		case "openFocusedTab":
			openFocusedTab(message.data);
			break;
		case "changeUrl":
			changeUrl(message.data);
			break;
		case "onDebug":
			onDebug(message.data);
			break;
		case "onVerbose":
			onVerbose(message.data);
			break;
		case "setSelectionHtml":
			setSelectionHtml(message.data);
			break;
		case "setContextLinkUrl":
			setContextLinkUrl(message.data);
			break;
		case "updateGlobalArchiveService":
			globalArchiveService = message.data;
			break;
		case "addUrlToHistory":
			addUrlToHistory(message.data);
			break;
		default:
			break;
	}
});

// See also https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/Tabs/sendMessage
function sendMessage(action, data){
	function logTabs(tabs) {
		for (tab of tabs) {
			browser.tabs.sendMessage(tab.id, {"action": action, "data": data}).catch(function(){
				noContentScript({action: action, data: data});
			});
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

function removeContextMenus(){
	try{
		browser.contextMenus.onClicked.removeListener(listener);
		//browser.contextMenus.removeAll();
		browser.contextMenus.remove("getarchive-archiveorg");
		browser.contextMenus.remove("getarchive-archiveis");
		browser.contextMenus.remove("getarchive-webcitationorg");
		browser.contextMenus.remove("getarchive-googlecache");
	}catch(ex){
		onError("contextMenu remove failed: " + ex);
	}
}

function addContextMenus(){
	ui_contextMenus = true;
	if(getarchive_show_contextmenu_item_archiveorg){
		browser.contextMenus.create({
			id: "getarchive-archiveorg",
			title: "Get Archive.org",
			contexts: ["all"]
		}, onCreated);
	}

	if(getarchive_show_contextmenu_item_archiveis){
		browser.contextMenus.create({
			id: "getarchive-archiveis",
			title: "Get Archive.is",
			contexts: ["all"]
		}, onCreated);
	}
	
	if(getarchive_show_contextmenu_item_webcitation){
		browser.contextMenus.create({
			id: "getarchive-webcitationorg",
			title: "Get WebCitation.org",
			contexts: ["all"]
		}, onCreated);
	}

	if(getarchive_show_contextmenu_item_googlecache){
		browser.contextMenus.create({
			id: "getarchive-googlecache",
			title: "Get Google Cache",
			contexts: ["all"]
		}, onCreated);
	}

	function onCreated(n) {
		/*if (browser.runtime.lastError) {
			onError(browser.runtime.lastError);
		}*/
	}
	
	browser.contextMenus.onClicked.addListener(listener);
	
}

/// Context menus
function initContextMenus(){
	
	removeContextMenus();
	setTimeout(function(){
		addContextMenus();
	}, 50);
	
}

function listener(info,tab){
	switch (info.menuItemId) {
		case "getarchive-archiveorg":
			doClick(info, "archive.org");
			break;
		case "getarchive-archiveis":
			doClick(info, "archive.is");
			break;
		case "getarchive-webcitationorg":
			doClick(info, "webcitation.org");
			break;
		case "getarchive-googlecache":
			doClick(info, "webcache.googleusercontent.com");
			break;
	}
}

/// UI
browser.tabs.onActivated.addListener(handleActivatedUI);

function handleActivatedUI(activeInfo) {
	onDebug("handleActivatedUI active tabId: " + activeInfo.tabId);
	updateUI(activeInfo.tabId, "handleActivatedUI");
}

browser.tabs.onUpdated.addListener(handleUpdatedUI);

function handleUpdatedUI(tabId, changeInfo, tabInfo) {
	if(tabInfo.title == "Problem loading page"){
		if(lastTabIdServerNotFound == tabId && lastTabIdServerNotFound != -1){
			onDebug("Doing nothing for problem loading page");
			return;
		}else{
			lastTabIdServerNotFound = tabId;
			onDebug("handleUpdatedUI: PROBLEM LOADING PAGE (OK)" + tabInfo.title);
			var goToUrl = shimGetGenericLinkHelper(getarchive_default_archive_service, tabInfo.url);
			notify("Detected \"problem loading page\", automatically getting the archived version..");
			changeUrlWithTabId(goToUrl, lastTabIdServerNotFound);
		}
	}
	
	if(tabInfo.status == "complete")
		updateUI(tabId, "handleUpdatedUI");
}

function updateUI(tabId, reason){
	function logTabs(tab) {
		onDebug("updateUI " + reason + " : " + tab.url);

		if (tab.url.indexOf("about:") > -1 && (tab.url.indexOf("about:newtab") == -1 || tab.status == "complete") && (tab.url.indexOf("about:blank") == -1 || tab.status == "complete")) {
			onDebug("updateUI disabled tab with url " + tab.url);
			browser.browserAction.disable(tab.id);
			browser.browserAction.setIcon({
				path: "icons/getarchive-disabled-64.png",
				tabId: tab.id
			});
			//browser.browserAction.setBadgeText({text: "D"});
			//browser.browserAction.setBadgeBackgroundColor({color: "red"});
			
			removeContextMenus();
			ui_contextMenus = false;
		}else{
			
			//browser.browserAction.setBadgeText({text: "A"});
			//browser.browserAction.setBadgeBackgroundColor({color: "green"});
			
			if(!ui_contextMenus){
				addContextMenus();
				browser.browserAction.enable(tab.id);
				browser.browserAction.setIcon({
					path: "icons/getarchive-64.png",
					tabId: tab.id
				});
				ui_contextMenus = true;
			}
			
		}
	}
	//console.log("tabId is " + tabId);
	browser.tabs.get(tabId).then(logTabs, onError);
}

function clickToolbarButton(){
	sendMessage("getContextLinkUrl");
}

/// Shim functions

// shim function which has the same result in the end, but does not require a content script
function shimGetContextLinkUrl(){
	function logTabs(tabs) {
		for (tab of tabs) {
			shimGetGenericLink(getarchive_default_archive_service, tab.url);
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);		
}

// shim function which has the same result in the end, but does not require a content script
function shimGetGenericLink(archiveService,contextLinkUrl){
	openFocusedTab(shimGetGenericLinkHelper(archiveService,contextLinkUrl));
}

function shimGetGenericLinkHelper(archiveService, contextLinkUrl){
	onDebug("archiveService is " + archiveService);
	onDebug("contextLinkUrl is " + contextLinkUrl);
		
	globalArchiveService = archiveService;
		
	var baseUrl = "";
		
	switch(archiveService){
		case "archive.org":
			baseUrl = "https://web.archive.org/web/2005/";
			break;
		case "archive.is":
			baseUrl = "https://archive.is/";
			break;
		case "webcitation.org":
			baseUrl = "http://webcitation.org/query?url=";
			break;
		case "webcache.googleusercontent.com":
			baseUrl = "http://webcache.googleusercontent.com/search?safe=off&site=&source=hp&q=cache%3A";
			break;
	}
	return baseUrl + contextLinkUrl;
}

function noContentScript(message){
	// Test URL: http://www.cph.rcm.ac.uk/Tour/Pages/Lazarus.htm
	switch(message.action){
		case "getContextLinkUrl":
			shimGetContextLinkUrl();
			break;
		case "getGenericLink":
			shimGetGenericLink(message.data.archiveService, message.data.contextLinkUrl);
			break;
		default:
			break;
	}
	//onDebug("You clicked the toolbar button, action " + message.action);
	onDebug("noContentScript: action " + message.action);
}

function setContextLinkUrl(data){
	globalArchiveService = data.archiveService;
	doAction(data.contextLinkUrl, data.archiveService);
}

/// Tab functions
function closeTab(){
	function logTabs(tabs) {
		for (tab of tabs) {
			function onRemoved() {
				onDebug(`Removed`);
			}

			browser.tabs.remove(tab.id).then(onRemoved, onError);
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

function openTab(url){
	openInnerTab(url, false);
}

function openFocusedTab(url){
	openInnerTab(url, true);
}

function openInnerTab(url,active){
	function logTabs(tabs) {
		for (tab of tabs) {
			lastParentTabIndex = tab.index;
			
			var creating = browser.tabs.create({
				url: url,
				active: active
			}).then(onCreatedTab, onError);	
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

function moveTabToCurrent(tabId) {
	browser.tabs.move(tabId, {index: lastParentTabIndex + 1}).then(onMoved, onError);
	
	function onMoved(tab) {
		onDebug("Moved:" + JSON.stringify(tab));
	}
}

function changeUrl(url){
	changeUrlWithTabId(url, -1);
}

function changeUrlWithTabId(url,tabId){
	onDebug("changeUrl: " + url);
	onDebug("attached handleUpdated for archive.is and archive.org");
	browser.tabs.onUpdated.addListener(handleUpdated);
	
	function onGotCurrentTabs(tabs) {
		for (tab of tabs) {
			onGotCurrentTab(tab);
		}
	}

	function onGotCurrentTab(tab){
		oldUrl = tab.url;
		var updating = browser.tabs.update(tab.id, {
			active: true,
			url: url
		}).then(
			function(data){
				onDebug(JSON.stringify(data));
			},
			function(error){
				notify("Failed to update tab");
				lastTabId = -1;
			}
		);
	}

	if(tabId == -1){
		browser.tabs.query({currentWindow: true, active: true}).then(onGotCurrentTabs, onError);
	}else{
		browser.tabs.get(tabId).then(onGotCurrentTab, onError);
	}
}

function addUrlToHistory(url){
	function onAdded() {
		onDebug("Added " + url + " to the history");
	}

	browser.history.addUrl({url: url}).then(onAdded);
}

/// GetArchive specific
function onCreatedTab(tab) {
	lastTabId = tab.id;
	onDebug(`Created new tab: ${tab.id}`);
	
	// move tab to the current one if lastParentTabIndex is set
	// workaround for Bug 1238314 - Implement browser.tabs opener functionality (https://bugzilla.mozilla.org/show_bug.cgi?id=1238314)
	if(lastParentTabIndex != -1 && getarchive_related_tabs == true){
		moveTabToCurrent(tab.id);
	}
	
	browser.tabs.onUpdated.addListener(handleUpdated);
}

// Copy URL when the time is right
function handleUpdated(tabId, changeInfo, tabInfo) {
	if(lastTabId != -1){
		if(tabId != lastTabId){
			onDebug("tabId " + tabId + " is not lastTabId " + lastTabId);
			return;
		}
	}
	
	if(changeInfo.status == undefined){
		onDebug("handleUpdated changeInfo.status was not changed, state is now " + changeInfo.status);
		return;
	}
	
	onVerbose("Updated tab: " + tabId);
	onVerbose("Changed attributes: ");
	onVerbose(changeInfo);
	onVerbose("New tab Info: ");
	onVerbose(tabInfo);
	
	if(tabInfo.title == "" || tabInfo.title == "Internet Archive Wayback Machine" || tabInfo.title.indexOf("pdf.js") > -1){
		onDebug("Waiting to copy URL.");
		return;
	}
	
	if(tabInfo.url == oldUrl){
		onDebug("The same as the old URL.");
		return;
	}
	
	if(tabInfo.url.indexOf("archive.is") > -1){
		if(getarchive_automatic_forward == true){
			if(tabInfo.url.length > 35){
				if(wait){
					if(tabInfo.status == "complete"){
						if(tabInfo.title.indexOf(":") == -1){
							removeListenerHandleUpdated("Removed listener: doesn't look like there is an archived page. Title was " + tabInfo.title);
							notify("Get Archive was unable to find an archived page. Try searching by pressing g on your keyboard.");
							return;
						}else{
							onDebug("handleUpdated: Starting timer to prevent listener from staying attached for too long");
							setTimeout(function(){
								removeListenerHandleUpdated("Removed listener: timeout while waiting for an archived page. Title was " + tabInfo.title);
							}, 10000);
						}
					}
					onDebug("Waiting..");
					return;
				}
				wait = true;
				
				onDebug("handleUpdated getGenericLink with archiveService archive.is and contextLinkUrl" + tabInfo.url);
				sendMessage("getGenericLink", {archiveService: "archive.is", contextLinkUrl: tabInfo.url});
				return;
			}
			wait = false;
		}else{
			if(tabInfo.url.length > 35){
				onDebug("The length is greater than 35");
				return;
			}
		}	
	}
	
	onDebug("handleUpdated globalArchiveService is " + globalArchiveService);
	
	if(tabInfo.url.indexOf("archive.is") > -1 || tabInfo.url.indexOf("webcitation.org") > -1 || tabInfo.url.indexOf("archive.org") > -1 || globalArchiveService == ""){
		if(tabInfo.title.indexOf("Error") == -1 || tabInfo.title.indexOf("Internet Archive Wayback Machine") == -1){
			if(tabInfo.url.indexOf(".pdf") > -1 || tabInfo.url.indexOf(".txt") > -1){
				// TEST URL: http://infomotions.com/etexts/gutenberg/dirs/etext04/lwam110.txt to archive.org -> no copy to clipboard if this code is disabled
				removeListenerHandleUpdated("Removed listener: copied URL. Title was " + tabInfo.title);
				onDebug("handleUpdated tab status is " + tabInfo.status);

				setTimeout(function(){
					sendMessage("copyCurrentUrlToClipboard");
				}, 1400);
			}else{
				sendMessage("copyCurrentUrlToClipboard");
				removeListenerHandleUpdated("Removed listener: copied URL. Title was " + tabInfo.title);
			}
		}else{
			removeListenerHandleUpdated("Removed listener: invalid title");
		}
	}else{
		removeListenerHandleUpdated("Removed listener without copying URL to clipboard");
	}
}

function removeListenerHandleUpdated(reason){
	onDebug(reason);
	browser.tabs.onUpdated.removeListener(handleUpdated);
	globalArchiveService = "";
	oldUrl = "";
	lastTabId = -1;
}

/// Get Archive code
function doClick(info, archiveService){
	if(info.pageUrl)
		lastUrl = info.pageUrl;
	
	if(info.frameUrl)
		lastUrl = info.frameUrl;
	
	if(info.selectionText && info.selectionText != ""){
		if(info.selectionText.indexOf("://") > -1){
			if(info.selectionText.length == 150){
				sendMessage("getSelection");
				return;
			}else{
				lastUrl = info.selectionText;
			}
		}else{
			sendMessage("getSelectionHtml");
			return;
		}
	}
	
	if(info.srcUrl)
		lastUrl = info.srcUrl;
	
	if(info.linkUrl)
		lastUrl = info.linkUrl;
	
	doAction(lastUrl, archiveService);
}

function doAction(url, archiveService){
	if(url == "" || url == null){
		notify("Try another selection");
		return;
	}
	lastUrl = url;
	sendMessage("getGenericLink", {archiveService: archiveService, contextLinkUrl:lastUrl});
}

// Got selection back from the content script, now go do the action
function setSelection(selectionText){
	doAction(selectionText, globalArchiveService);
}

// Open archive page for every link in selection
// The magic happens in getarchive.js
function setSelectionHtml(urls){
	for(let url in urls)
	{
		doAction(urls[url], globalArchiveService);
	}
}

/// Helper functions
function onError(error) {
	console.log(`Error: ${error}`);
}

// onDebug function should be used instead of console.log to prevent the console from showing messages in release mode
function onDebug(info) {
	console.log(info);
}

// Enable this to see information about preferences loading and other information that clutters up the browser console
function onVerbose(info) {
	//console.log("Verbose: " + info);
}

function notify(message){
	var title = "Get Archive";
	if(typeof message === "object"){
		title = message.title;
		message = message.message;
	}
	
	message = message.replace("&", "&amp;");
	browser.notifications.create({
		type: "basic",
		iconUrl: browser.extension.getURL("icons/getarchive-64.png"),
		title: title,
		message: message
	});
}
