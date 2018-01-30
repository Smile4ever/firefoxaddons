/// Global variables
let lastUrl = "";
let lastTabId = -1;
let lastTabIdServerNotFound = -1;
let lastParentTabIndex = -1;
let globalArchiveService = "";
let wait = false; // used in handleUpdated()
let oldUrl = ""; // used in changeUrl()

let ui_contextMenus = false;

/// Preferences
let getarchive_show_contextmenu_item_archiveorg;
let getarchive_show_contextmenu_item_archiveis;
let getarchive_show_contextmenu_item_webcitation;
let getarchive_show_contextmenu_item_googlecache;

let getarchive_automatic_forward;
let getarchive_related_tabs;
let getarchive_default_archive_service;
let getarchive_automatic_retrieval;
let getarchive_icon_theme;

function init(){
	let valueOrDefault = function(value, defaultValue){
		if(value == undefined) return defaultValue;
		return value;
	}

	browser.storage.local.get([
		"getarchive_show_contextmenu_item_archiveorg",
		"getarchive_show_contextmenu_item_archiveis",
		"getarchive_show_contextmenu_item_webcitation",
		"getarchive_show_contextmenu_item_googlecache",
		"getarchive_automatic_forward",
		"getarchive_related_tabs",
		"getarchive_defauflt_archive_service",
		"getarchive_automatic_retrieval",
		"getarchive_icon_theme"
	]).then((result) => {
		// Context menus
		getarchive_show_contextmenu_item_archiveorg = valueOrDefault(result.getarchive_show_contextmenu_item_archiveorg, true);
		getarchive_show_contextmenu_item_archiveis = valueOrDefault(result.getarchive_show_contextmenu_item_archiveis, true);
		getarchive_show_contextmenu_item_webcitation = valueOrDefault(result.getarchive_show_contextmenu_item_webcitation, false);
		getarchive_show_contextmenu_item_googlecache = valueOrDefault(result.getarchive_show_contextmenu_item_googlecache, true);
		
		// General settings
		getarchive_automatic_forward = valueOrDefault(result.getarchive_automatic_forward, true);
		getarchive_related_tabs = valueOrDefault(result.getarchive_related_tabs, true);
		getarchive_default_archive_service = valueOrDefault(result.getarchive_default_archive_service, "archive.org");
		getarchive_automatic_retrieval = valueOrDefault(result.getarchive_automatic_retrieval, true);

		browser.runtime.getBrowserInfo().then((info) => {
			let v = info.version;
			browserVersion = parseInt(v.slice(0, v.search(".") - 1));
			initContextMenus(valueOrDefault(browserVersion, "58"));
		});

		// Icon theme
		getarchive_icon_theme = valueOrDefault(result.getarchive_icon_theme, "dark");

		// Toolbar button
		initBrowserAction();
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
		//console.log("tabs length is " + tabs.length);
		for (tab of tabs) {
			//console.log("tab with title " + tab.title);
			browser.tabs.sendMessage(tab.id, {"action": action, "data": data}).then(
				function(){
					if(isProblemLoadingPage(tab)) noContentScript({action: action, data: data, tab: tab}); // Make the browser action work on "Problem loading page" pages on second try
				}
			).catch(function(){
				//console.log("noContentScript");
				noContentScript({action: action, data: data, tab: tab});
			});
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

function sendMessageToTab(action, data, tabId){
	//console.log("tabId is " + tabId);
	browser.tabs.sendMessage(tabId, {"action": action, "data": data}).catch(function(){
		noContentScript({action: action, data: data});
	});
}

function initBrowserAction(){
	browser.browserAction.setIcon({path: resolveIconURL("getarchive-64.png")});

	browser.browserAction.onClicked.removeListener(clickToolbarButton);
	browser.browserAction.onClicked.addListener(clickToolbarButton);

	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		for (tab of tabs) {
			updateUI(tab.id, "force-refresh");
		}
	}, onError);
}

function removeContextMenus(){
	browser.contextMenus.onClicked.removeListener(listener);
	browser.contextMenus.remove("getarchive-archiveorg").catch(null);
	browser.contextMenus.remove("getarchive-archiveis").catch(null)
	browser.contextMenus.remove("getarchive-webcitationorg").catch(null);
	browser.contextMenus.remove("getarchive-googlecache").catch(null);
}

function buildObject(obj){
	if(browserVersion <= 55){
		delete obj.icons;
	}
	return obj;
}

function addContextMenus(browserVersion){
	ui_contextMenus = true;

	// See also https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/contextMenus/ContextType
	let contexts = ["audio", "editable", "frame", "image", "link", "page", "selection", "tab", "video"];

	if(getarchive_show_contextmenu_item_archiveorg){
		browser.contextMenus.create(buildObject({
			id: "getarchive-archiveorg",
			title: "Get Archive.org",
			icons: {
			  "32": "icons/icon32.png"
			},
			contexts: contexts
		}), onCreated);
	}

	if(getarchive_show_contextmenu_item_archiveis){
		browser.contextMenus.create(buildObject({
			id: "getarchive-archiveis",
			title: "Get Archive.is",
			icons: {
			  "32": "icons/archiveis32.png"
			},
			contexts: contexts
		}), onCreated);
	}
	
	if(getarchive_show_contextmenu_item_webcitation){
		browser.contextMenus.create(buildObject({
			id: "getarchive-webcitationorg",
			title: "Get WebCitation.org",
			icons: {
			  "16": "icons/webcite16.png"
			},
			contexts: contexts
		}), onCreated);
	}

	if(getarchive_show_contextmenu_item_googlecache){
		browser.contextMenus.create(buildObject({
			id: "getarchive-googlecache",
			title: "Get Google Cache",
			icons: {
			  "32": "icons/googlecache32.png"
			},
			contexts: contexts
		}), onCreated);
	}

	function onCreated(n) {
		/*if (browser.runtime.lastError) {
			onError(browser.runtime.lastError);
		}*/
	}
	
	browser.contextMenus.onClicked.addListener(listener);
}

function addContextMenusToolbarButton(){
	browser.contextMenus.create(buildObject({
		id: "getarchive-tb-archiveorg",
		title: "Get Archive.org",
		icons: {
			 "32": "icons/icon32.png"
		},
		contexts: ["browser_action"]
	}), onCreated);

	browser.contextMenus.create(buildObject({
		id: "getarchive-tb-archiveis",
		title: "Get Archive.is",
		icons: {
			"32": "icons/archiveis32.png"
		},
		contexts: ["browser_action"]
	}), onCreated);
	
	browser.contextMenus.create(buildObject({
		id: "getarchive-tb-webcitationorg",
		title: "Get WebCitation.org",
		icons: {
			"16": "icons/webcite16.png"
		},
		contexts: ["browser_action"]
	}), onCreated);

	browser.contextMenus.create(buildObject({
		id: "getarchive-tb-googlecache",
		title: "Get Google Cache",
		icons: {
			"32": "icons/googlecache32.png"
		},
		contexts: ["browser_action"]
	}), onCreated);
	
	browser.contextMenus.create({
		id: "getarchive-tb-preferences",
		title: "Preferences",
		icons: {
			"32": "icons/settings32.png"
		},
		contexts: ["browser_action"]
	}, onCreated);
	
	function onCreated(n) {
		/*if (browser.runtime.lastError) {
			onError(browser.runtime.lastError);
		}*/
	}
}

/// Context menus
function initContextMenus(browserVersion){
	removeContextMenus();

	setTimeout(function(){
		addContextMenus(browserVersion);
	}, 50);
	addContextMenusToolbarButton();
}

function listener(info,tab){
	switch (info.menuItemId) {
		case "getarchive-archiveorg":
		case "getarchive-tb-archiveorg":
			doClick(info, "archive.org");
			break;
		case "getarchive-archiveis":
		case "getarchive-tb-archiveis":
			doClick(info, "archive.is");
			break;
		case "getarchive-webcitationorg":
		case "getarchive-tb-webcitationorg":
			doClick(info, "webcitation.org");
			break;
		case "getarchive-googlecache":
		case "getarchive-tb-googlecache":
			doClick(info, "webcache.googleusercontent.com");
			break;
		case "getarchive-tb-preferences":
			openPreferences();
			break;
	}
}

/// UI
browser.tabs.onActivated.addListener(handleActivatedUI);

function handleActivatedUI(activeInfo) {
	//onVerbose("handleActivatedUI active tabId: " + activeInfo.tabId);
	updateUI(activeInfo.tabId, "handleActivatedUI");
}

browser.tabs.onUpdated.addListener(handleUpdatedUI);

function handleUpdatedUI(tabId, changeInfo, tabInfo) {
	if(isProblemLoadingPage(tabInfo) && getarchive_automatic_retrieval == true){
		if((lastTabIdServerNotFound == tabId && lastTabIdServerNotFound != -1) || tabInfo.url.indexOf("gfk") > -1 || (tabInfo.url.indexOf("http://") == -1 && tabInfo.url.indexOf("https://") == -1)){
			//console.log("Doing nothing for problem loading page");
			return;
		}else{
			lastTabIdServerNotFound = tabId;
			//console.log("handleUpdatedUI: PROBLEM LOADING PAGE (OK)" + tabInfo.title);
			if(tabInfo.url.indexOf("https://web.archive.org/web/2005/") > -1) return; // archive.org might be down
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
		onVerbose("updateUI " + reason + ": " + tab.url);

		if (tab.url.indexOf("about:") > -1 && (tab.url.indexOf("about:newtab") == -1 || tab.status == "complete") && (tab.url.indexOf("about:blank") == -1 || tab.status == "complete")) {
			onVerbose("updateUI disabled tab with url " + tab.url);
			browser.browserAction.disable(tab.id);
			browser.browserAction.setIcon({
				path: resolveIconURL("getarchive-disabled-64.png"),
				tabId: tab.id
			});

			removeContextMenus();
			ui_contextMenus = false;
		}else{
			if(!ui_contextMenus){
				addContextMenus();
				browser.browserAction.enable(tab.id);
				browser.browserAction.setIcon({
					path: resolveIconURL("getarchive-64.png"),
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
	//console.log("sending message getContextLinkUrl");
	sendMessage("getContextLinkUrl");
}

function isProblemLoadingPage(tab){
	if(tab == null) return false;
	
	 // Content Encoding Error
	if(tab.url.indexOf("facebook.com") == -1 && tab.url.indexOf("google.com") == -1 && tab.url.indexOf("youtube.com") == -1){
		if(tab.title == "Problem loading page") return true;
		if(tab.favIconUrl == "chrome://global/skin/icons/warning-16.png") return true;
	}
	return false;
}

/// Shim functions

// shim function which has the same result in the end, but does not require a content script
function shimGetContextLinkUrl(){
	function logTabs(tabs) {
		for (tab of tabs) {
			//console.log("tab.title is " + tab.title);
			shimGetGenericLink(getarchive_default_archive_service, tab.url, tab);
		}
	}

	//console.log("you clicked the browser action!");
	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);		
}

// shim function which has the same result in the end, but does not require a content script
function shimGetGenericLink(archiveService,contextLinkUrl,tab){
	// Fix bug https://web.archive.org/web/2005/http://wii.nintendo.nl/13470.html -> click on toolbar button
	let isToolbar = false;
	if(contextLinkUrl.lastIndexOf("://") > 20){
		contextLinkUrl = shared.getPartialUrl(contextLinkUrl);
		//console.log("contextLinkUrl is now " + contextLinkUrl);
		isToolbar = true;
	}
	
	if(isProblemLoadingPage(tab) || isToolbar){
		changeUrl(shimGetGenericLinkHelper(archiveService,contextLinkUrl));
	}else{
		openFocusedTab(shimGetGenericLinkHelper(archiveService,contextLinkUrl));
	}
}

function shimGetGenericLinkHelper(archiveService, contextLinkUrl){
	//console.log("archiveService is " + archiveService);
	//console.log("contextLinkUrl is " + contextLinkUrl);

	globalArchiveService = archiveService;

	let baseUrl = "";

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
			baseUrl = "http://webcache.googleusercontent.com/search?q=cache%3A";
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
			shimGetGenericLink(message.data.archiveService, message.data.contextLinkUrl, message.tab);
			break;
		default:
			break;
	}
	//console.log("You clicked the toolbar button, action " + message.action);
	//console.log("noContentScript: action " + message.action);
}

function setContextLinkUrl(data){
	globalArchiveService = data.archiveService;
	doAction(data.contextLinkUrl, data.archiveService, data.isContextMenu);
}

/// Tab functions
function closeTab(){
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		for (tab of tabs) {
			function onRemoved() {
				//console.log(`Get Archive: Removed ` + tab.url);
			}

			browser.tabs.remove(tab.id).then(onRemoved, onError);
		}
	}, onError);
}

function openTab(url){
	openInnerTab(url, false);
}

function openFocusedTab(url){
	openInnerTab(url, true);
}

function openInnerTab(url,active){
	if(url.indexOf("https://archive.is/https://archive.is/") > -1){
		//console.log("Prevent bug from showing");
		return;
	}
	
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
		//console.log("Moved:" + JSON.stringify(tab));
	}
}

function changeUrl(url){
	changeUrlWithTabId(url, -1);
}

function changeUrlWithTabId(url,tabId){
	//console.log("changeUrl: " + url);
	//console.log("attached handleUpdated for archive.is and archive.org");
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
				//console.log(JSON.stringify(data));
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
		//console.log("Added " + url + " to the history");
	}

	browser.history.addUrl({url: url}).then(onAdded);
}

/// GetArchive specific
function onCreatedTab(tab) {
	lastTabId = tab.id;
	//console.log(`Created new tab: ${tab.id}`);
	
	// move tab to the current one if lastParentTabIndex is set
	// workaround for Bug 1238314 - Implement browser.tabs opener functionality (https://bugzilla.mozilla.org/show_bug.cgi?id=1238314)
	if(lastParentTabIndex != -1 && getarchive_related_tabs == true){
		moveTabToCurrent(tab.id);
	}
	
	//if(tab.url.indexOf("google.") == -1) TODO: fix this, it doesn't work
	browser.tabs.onUpdated.addListener(handleUpdated);
}

// Copy URL when the time is right
function handleUpdated(tabId, changeInfo, tabInfo) {
	if(lastTabId != -1){
		if(tabId != lastTabId){
			//console.log("tabId " + tabId + " is not lastTabId " + lastTabId);
			return;
		}
	}
	
	if(changeInfo.status == undefined){
		//console.log("handleUpdated changeInfo.status was not changed, state is now " + changeInfo.status);
		return;
	}
	
	onVerbose("Updated tab: " + tabId);
	onVerbose("Changed attributes: ");
	onVerbose(changeInfo);
	onVerbose("New tab Info: ");
	onVerbose(tabInfo);
	
	if(tabInfo.title == "" || tabInfo.title == "Internet Archive Wayback Machine" || tabInfo.title.indexOf("pdf.js") > -1 || tabInfo.id == undefined){
		//console.log("Waiting to copy URL.");
		return;
	}
	
	if(tabInfo.url == oldUrl){
		//console.log("The same as the old URL. Url was " + tabInfo.url + " and title was " + tabInfo.title);
		//removeListenerHandleUpdated("The same as the old URL. Title was " + tabInfo.title);
		return;
	}else{
		//console.log("New URL was " + tabInfo.url + " and title was " + tabInfo.title);
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
							//console.log("handleUpdated: Starting timer to prevent listener from staying attached for too long. Title was " + tabInfo.title);
							setTimeout(function(){
								removeListenerHandleUpdated("Removed listener: timeout while waiting for an archived page. Title was " + tabInfo.title);
							}, 10000);
						}
					}
					//console.log("Waiting..");
					return;
				}
				wait = true;
				//console.log("handleUpdated getGenericLink with archiveService archive.is and contextLinkUrl " + tabInfo.url);
				removeListenerHandleUpdated("Removed listener: everything was OK. Title was " + tabInfo.title); // TODO: recently added, verify this. If not sure, remove it.
				doAction(tabInfo.url, "archive.is", false);
				browser.tabs.onUpdated.addListener(handleUpdated); // TODO: recently added, verify this. If not sure, remove it.
				//sendMessage("getGenericLink", {archiveService: "archive.is", contextLinkUrl: tabInfo.url});
				
				return;
			}
			wait = false;
		}else{
			if(tabInfo.url.length > 35){
				//console.log("The length is greater than 35");
				return;
			}
		}	
	}
	
	//console.log("handleUpdated globalArchiveService is " + globalArchiveService);

	if(tabInfo.url.indexOf("archive.is") > -1 || tabInfo.url.indexOf("webcitation.org") > -1 || tabInfo.url.indexOf("archive.org") > -1 || globalArchiveService == ""){
		if(tabInfo.title.indexOf("Error") == -1 || tabInfo.title.indexOf("Internet Archive Wayback Machine") == -1){
			if(tabInfo.url.indexOf(".pdf") > -1 || tabInfo.url.indexOf(".txt") > -1 || tabInfo.title == ""){
				// TEST URL: http://infomotions.com/etexts/gutenberg/dirs/etext04/lwam110.txt to archive.org -> no copy to clipboard if this code is disabled
				removeListenerHandleUpdated("Removed listener: copied URL. Title was " + tabInfo.title);
				//console.log("handleUpdated tab status is " + tabInfo.status);

				var timeout = 1400;
				if(tabInfo.url.indexOf("archive.org") > -1 && tabInfo.title == ""){
					//console.log("Increasing timeout");
					timeout = 4000;
				}

				setTimeout(function(){
					//sendMessageToTab("copyUrlToClipboard", {url: tabInfo.url, title: tabInfo.title}, tabInfo.id);
					sendMessage("copyUrlToClipboard", {url: tabInfo.url, title: tabInfo.title});
				}, timeout);
			}else{
				//sendMessageToTab("copyUrlToClipboard", "", tabInfo.id);
				sendMessage("copyUrlToClipboard", {url: tabInfo.url, title: tabInfo.title});
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
	//console.log(reason);
	browser.tabs.onUpdated.removeListener(handleUpdated);
	globalArchiveService = "";
	oldUrl = "";
	lastTabId = -1;
}

/// Get Archive code
function openPreferences(){
	function onOpened() {
		//console.log(`Options page opened`);
	}

	browser.runtime.openOptionsPage().then(onOpened, onError);	
}

function doClick(info, archiveService){
	var isContextMenu = true;
	
	if(info.pageUrl){
		lastUrl = info.pageUrl;
		isContextMenu = false;
	}
	
	if(info.frameUrl){
		lastUrl = info.frameUrl;
		isContextMenu = false;
	}
		
	// Prefer direct links instead of a selection
	if(!info.srcUrl && !info.linkUrl){
		if(info.selectionText && info.selectionText != ""){
			if(info.selectionText.indexOf("://") > -1){
				if(info.selectionText.length == 150){
					sendMessage("getSelection");
					return;
				}else{
					lastUrl = info.selectionText;
					isContextMenu = true;
				}
			}else{
				sendMessage("getSelectionHtml");
				return;
			}
		}
	}
	
	if(info.srcUrl){
		lastUrl = info.srcUrl;
		isContextMenu = true;
	}
	
	if(info.linkUrl){
		lastUrl = info.linkUrl;
		isContextMenu = true;
	}
	
	//console.log("doClick isContextMenu " + isContextMenu);
	//console.log("lastUrl is " + lastUrl);
	//console.log("archiveService is " + archiveService);

	doAction(lastUrl, archiveService, isContextMenu);
}

function doAction(url, archiveService, isContextMenu){
	/*if(url == "" || url == null){
		notify("Try another selection");
		return;
	}*/
	lastUrl = url;
	sendMessage("getGenericLink", {archiveService: archiveService, contextLinkUrl:lastUrl, isContextMenu: isContextMenu});
}

// Got selection back from the content script, now go do the action
function setSelection(selectionText){
	doAction(selectionText, globalArchiveService, true);
}

// Open archive page for every link in selection
// The magic happens in getarchive.js
function setSelectionHtml(urls){
	for(let url of urls)
	{
		doAction(url, globalArchiveService, true);
	}
}

/// Helper functions
function onError(error) {
	console.error(`${error}`);
}

// onDebug function should be used instead of //console.log to prevent the console from showing messages in release mode
function onDebug(info) {
	//console.log(info);
}

// Enable this to see information about preferences loading and other information that clutters up the browser console
function onVerbose(info) {
	//console.log("Verbose: " + info);
}

function notify(message){
	let title = "Get Archive";
	if(typeof message === "object"){
		title = message.title;
		message = message.message;
	}
	
	message = message.replace(new RegExp("&", 'g'), "&amp;");
	
	browser.notifications.create(message.substring(0, 20).replace(" ", ""),
	{
		type: "basic",
		iconUrl: browser.extension.getURL(resolveIconUrlNotif("getarchive-64.png")),
		title: title,
		message: message
	});
}

// Webrequest: remove :80 from URLs on archive.org
function cleanURL(details) {
    return { redirectUrl: details.url.replace(":80", "") };
}

// Prevent archive.org from adding :80 to URLs
browser.webRequest.onBeforeRequest.addListener(
    cleanURL,
    {urls: ["https://web.archive.org/*:80*"]},
    ["blocking"]
);
