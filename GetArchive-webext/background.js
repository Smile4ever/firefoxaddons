/// Global variables
let lastUrl = "";
let lastTabId = -1;
let lastTabIdServerNotFound = -1;
let globalArchiveService = "";
let wait = false; // used in handleUpdated()
let oldUrl = ""; // used in changeUrl()
let browserVersion;
let ui_contextMenus = false;
let failedUrls = [];

/// Preferences
let getarchive_search_engine;

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
		"getarchive_search_engine",
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
		getarchive_search_engine = valueOrDefault(result.getarchive_search_engine, "google");
		
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
			browserVersion = valueOrDefault(browserVersion, "58");
			initContextMenus();
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
		case "goSearch":
			goSearch(null, false);
			break;
		case "backgroundCopyToClipboard":
			backgroundCopyToClipboard(message.data);
			break;
		default:
			break;
	}
});

// See also https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/Tabs/sendMessage
function sendMessage(action, data){
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		let tab = tabs[0];
		browser.tabs.sendMessage(tab.id, {"action": action, "data": data}).catch(function(){
			noContentScript({action: action, data: data, tab: tab});
		});
	}, console.error);
}

function initBrowserAction(){
	browser.browserAction.setIcon({path: resolveIconURL("getarchive-64.png")});

	browser.browserAction.onClicked.removeListener(clickToolbarButton);
	browser.browserAction.onClicked.addListener(clickToolbarButton);

	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		for (tab of tabs) {
			updateUI(tab.id, "force-refresh");
		}
	}, console.error);
}

function removeContextMenus(){
	browser.contextMenus.onClicked.removeListener(listener);
	browser.contextMenus.remove("getarchive-archiveorg").catch(null);
	browser.contextMenus.remove("getarchive-archiveis").catch(null)
	browser.contextMenus.remove("getarchive-webcitationorg").catch(null);
	browser.contextMenus.remove("getarchive-googlecache").catch(null);
	browser.contextMenus.remove("getarchive-separator").catch(null);
	browser.contextMenus.remove("getarchive-search").catch(null);
	browser.contextMenus.remove("getarchive-saveinto-archiveorg").catch(null);
	browser.contextMenus.remove("getarchive-saveinto-archiveis").catch(null);
	browser.contextMenus.remove("getarchive-saveinto-webcitation").catch(null);

}

function buildObject(obj){
	if(browserVersion <= 55){
		delete obj.icons;
	}
	return obj;
}

function addContextMenus(){
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
		}), console.error);
	}

	if(getarchive_show_contextmenu_item_archiveis){
		browser.contextMenus.create(buildObject({
			id: "getarchive-archiveis",
			title: "Get Archive.is",
			icons: {
			  "32": "icons/archiveis32.png"
			},
			contexts: contexts
		}), console.error);
	}
	
	if(getarchive_show_contextmenu_item_webcitation){
		browser.contextMenus.create(buildObject({
			id: "getarchive-webcitationorg",
			title: "Get WebCitation.org",
			icons: {
			  "16": "icons/webcite16.png"
			},
			contexts: contexts
		}), console.error);
	}

	if(getarchive_show_contextmenu_item_googlecache){
		browser.contextMenus.create(buildObject({
			id: "getarchive-googlecache",
			title: "Get Google Cache",
			icons: {
			  "32": "icons/googlecache32.png"
			},
			contexts: contexts
		}), console.error);
	}

	let searchEngineName = "";
	let suffixFileName = "32.png";

	switch(getarchive_search_engine){
		case "auto":
			searchEngineName = "default search engine";
			suffixFileName = ".svg";
			break;
		case "duckduckgo":
			searchEngineName = "DuckDuckGo";
			break;
		default:
			searchEngineName = getarchive_search_engine.substring(0, 1).toUpperCase() + getarchive_search_engine.substring(1);
			break;
	}

	browser.contextMenus.create(buildObject({
		id: "getarchive-separator",
		type: "separator",
		contexts: contexts
	}), console.error);

	browser.contextMenus.create(buildObject({
		id: "getarchive-search",
		title: "Search with " + searchEngineName,
		icons: {
		  "32": "icons/search/" + getarchive_search_engine + suffixFileName
		},
		contexts: contexts
	}), console.error);

	browser.contextMenus.create(buildObject({
		id: "getarchive-saveinto-archiveorg",
		title: "Save into Archive.org",
		icons: {
		  "32": "icons/icon32.png"
		},
		contexts: contexts
	}), console.error);

	browser.contextMenus.create(buildObject({
		id: "getarchive-saveinto-archiveis",
		title: "Save into Archive.is",
		icons: {
		  "32": "icons/archiveis32.png"
		},
		contexts: contexts
	}), console.error);

	browser.contextMenus.create(buildObject({
		id: "getarchive-saveinto-webcitation",
		title: "Save into Webcitation.org",
		icons: {
		  "16": "icons/webcite16.png"
		},
		contexts: contexts
	}), console.error);
	
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
	}), console.error);

	browser.contextMenus.create(buildObject({
		id: "getarchive-tb-archiveis",
		title: "Get Archive.is",
		icons: {
			"32": "icons/archiveis32.png"
		},
		contexts: ["browser_action"]
	}), console.error);
	
	browser.contextMenus.create(buildObject({
		id: "getarchive-tb-webcitationorg",
		title: "Get WebCitation.org",
		icons: {
			"16": "icons/webcite16.png"
		},
		contexts: ["browser_action"]
	}), console.error);

	browser.contextMenus.create(buildObject({
		id: "getarchive-tb-googlecache",
		title: "Get Google Cache",
		icons: {
			"32": "icons/googlecache32.png"
		},
		contexts: ["browser_action"]
	}), console.error);
}

/// Context menus
function initContextMenus(){
	removeContextMenus();

	setTimeout(function(){
		addContextMenus();
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
		case "getarchive-search":
			goSearch(info, true);
			break;
		case "getarchive-tb-preferences":
			openPreferences();
			break;
		case "getarchive-saveinto-archiveorg":
			saveIntoGetArchive(info);
			break;
		case "getarchive-saveinto-archiveis":
			saveIntoGetArchiveIs(info);
			break;
		case "getarchive-saveinto-webcitation":
			saveIntoWebcitation(info);
			break;
		default:
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
	if(tabInfo.status == "complete")
		updateUI(tabId, "handleUpdatedUI");
}

function updateUI(tabId, reason){
	browser.tabs.get(tabId).then((tab) => {
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
	}, console.error);
}

function clickToolbarButton(){
	sendMessage("getContextLinkUrl");
}

/// Shim functions

// shim function which has the same result in the end, but does not require a content script
function shimGetContextLinkUrl(){
	//console.log("you clicked the browser action!");
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		for (tab of tabs) {
			//console.log("tab.title is " + tab.title);
			shimGetGenericLink(getarchive_default_archive_service, tab.url, tab);
		}
	}, console.error);
}

// shim function which has the same result in the end, but does not require a content script
function shimGetGenericLink(archiveService,contextLinkUrl,tab){
	// Fix bug https://web.archive.org/web/2005/http://wii.nintendo.nl/13470.html -> click on toolbar button
	let isToolbar = false;
	if(isArchiveUrl(contextLinkUrl)){
		contextLinkUrl = shared.getPartialUrl(contextLinkUrl);
		isToolbar = true;
	}
	
	if(isToolbar){
		changeUrl(shimGetGenericLinkHelper(archiveService, contextLinkUrl));
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
		browser.tabs.remove(tab[0].id);
	}, console.error);
}

function openFocusedTab(url){
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		for (tab of tabs) {
			let createProperties = {
				url: url,
				active: true
			};

			if(getarchive_related_tabs){
				createProperties.openerTabId = tab.id;
			}

			browser.tabs.create(createProperties).then(function(){
				lastTabId = tab.id;
				browser.tabs.onUpdated.addListener(handleUpdated);
			}, console.error);
		}
	}, console.error);
}

function changeUrl(url){
	changeUrlWithTabId(url, -1);
}

function changeUrlWithTabId(url, tabId){
	browser.tabs.onUpdated.addListener(handleUpdated);
	
	function onGotCurrentTabs(tabs) {
		for (tab of tabs) {
			onGotCurrentTab(tab);
		}
	}

	function onGotCurrentTab(tab){
		oldUrl = tab.url;
		browser.tabs.update(tab.id, {
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
		browser.tabs.query({currentWindow: true, active: true}).then(onGotCurrentTabs, console.error);
	}else{
		browser.tabs.get(tabId).then(onGotCurrentTab, console.error);
	}
}

function addUrlToHistory(url){
	function onAdded() {
		//console.log("Added " + url + " to the history");
	}

	browser.history.addUrl({url: url}).then(onAdded);
}

/// GetArchive specific
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
					// Check if url is valid before copying
					if(!isFailedUrl(tabInfo.url)){
						backgroundCopyToClipboard(tabInfo.url);
					}
				}, timeout);
			}else{
				// Check if url is valid before copying
				if(!isFailedUrl(tabInfo.url)){
					backgroundCopyToClipboard(tabInfo.url);
				}
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

	browser.runtime.openOptionsPage().then(onOpened, console.error);
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

/// Search-related functions
function goSearch(info, safe){
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		let tab = tabs[0];
		let tabUrl = tab.url;
		let currentLocation = tab.url;
			
		currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");
		currentLocation = currentLocation.replace("http://archive.li/", "");
		currentLocation = currentLocation.replace("https://archive.li/", "");
		currentLocation = currentLocation.replace("http://webcitation.org/query?url=", "");
		
		let indexHttp = currentLocation.indexOf("http", 20);
		if(indexHttp > -1){
			currentLocation = currentLocation.substring(indexHttp);
		}
		
		/* from one search engine to another */
		let q = new URL(tabUrl).searchParams.get("q");
		
		if(q != null){
			currentLocation = q;
		}else{
			if(tab.title.indexOf(" -") > -1){
				currentLocation = tab.title.split(" -")[0];
			}
		}
		
		if(tabUrl.indexOf(".pdf") == -1){
			currentLocation = tabUrl.replace(/\_/g, ' ');
			currentLocation = currentLocation.replace(/\-/g, ' ');
		}else if(q == null){
			// PDF
			let lastSlash = tabUrl.lastIndexOf("/");
			let hn = getHostName(tabUrl);
			let siteSpecific = "site:" + hn + " ";
			if(hn == "archive.wikiwix.com" || hn == "archive.org" || hn == "archive.is" || hn == "archive.today" || hn == "archive.li"){
				siteSpecific = "";
			}
			currentLocation = siteSpecific + tabUrl.substring(lastSlash + 1);
		}
		
		if(tabUrl.indexOf("nu.nl") > -1){
			let lastSlash = tabUrl.lastIndexOf("/");
			let html = tabUrl.indexOf(".html");
			currentLocation = tabUrl.substring(lastSlash + 1, html);
			currentLocation = urldecode(currentLocation);
		}
		
		if(tabUrl.indexOf("wiki") > -1 && tabUrl.indexOf("target=") > -1){
			let indexOfTarget = tabUrl.indexOf("target=");
			currentLocation = tabUrl.substring(indexOfTarget + 7);
			currentLocation = decodeURIComponent(currentLocation);
			safe = false;
		}
		
		if(tabUrl.indexOf("&oq=cache:") > -1){
			currentLocation = tabUrl.substring(0, tabUrl.indexOf("&oq=cache:"));
		}
				
		if(info && info.selectionText){
			currentLocation = info.selectionText;
		}
		
		switch(getarchive_search_engine){
			case "auto":
				browser.search.search({
					query: currentLocation,
					tabId: tab.id
				});
				return;
			case "duckduckgo":
				currentLocation = "https://duckduckgo.com/?q=" + currentLocation;
				break;
			case "google":
				currentLocation = "https://google.com/search?q=" + currentLocation;
				break;
			case "bing":
				currentLocation = "https://bing.com/search?q=" + currentLocation;
				break;
			default:
				break;
		}	
		
		if(tabUrl.includes("wiki") && !safe){
			browser.tabs.create({url: currentLocation}); // for LinkSearch only
		}else{
			// We do not use changeUrl here because we don't need to copy the search results URL
			browser.tabs.update({url: currentLocation});
		}
	});
}

function urldecode(encoded){
	// http://stackoverflow.com/questions/4292914/javascript-url-decode-function
	encoded=encoded.replace(/\+/g, '%20');
	let str=encoded.split("%");
	let cval=str[0];
	for (let i=1;i<str.length;i++)
	{
		cval+=String.fromCharCode(parseInt(str[i].substring(0,2),16))+str[i].substring(2);
	}

	return cval;
}

function getHostName(currentLocation){
	var getLocation = function(href) {
		var l = document.createElement("a");
		l.href = href;
		return l;
	};
	var l = getLocation(currentLocation);
	var hostname = l.hostname;
	
	if(hostname.indexOf(".") < hostname.lastIndexOf(".")){
		// two or more dots
		if(hostname.indexOf(".") < 6){ /* (hostname.length / 2) */
			hostname = hostname.substring(hostname.indexOf(".") + 1);
		}
	}

	return hostname;
}

/// ============================================================================
// This code has been integrated from https://addons.mozilla.org/en-US/firefox/addon/error-404-wayback-machine/ which is under the AGPL-3
browser.webRequest.onCompleted.addListener(function(details) {
    let httpFailCodes = [404, 408, 410, 451, 500, 502, 503, 504, 509, 520, 521, 523, 524, 525, 526];
    if (httpFailCodes.includes(details.statusCode)) {
		// Add to failed urls to check later
		failedUrls.push({statusCode: details.statusCode, url: details.url});

		// Forward to default archive service if suitable and desired
		if(isGoodToArchive(details.url)){
			forwardToDefaultArchiveService(details.tabId, details.url, details.statusCode);
		}
    }
}, {urls: ["<all_urls>"], types: ["main_frame"]});

function isGoodToArchive(url) {
	let excluded_urls = ["localhost", "0.", "10.", "127."];
	let excluded_urls_contain = ["wiki"];

	// Unwanted (contains)
	for(let i = 0; i < excluded_urls_contain.length; i++){
		if (url.includes(excluded_urls_contain[i]) && url.includes(".org")) {
			return false;
		}
	}

	// Already archived, or unwanted
	for(let i = 0; i < excluded_urls.length; i++){
		if(urlStartsWith(url, excluded_urls[i]) || isArchiveUrl(excluded_urls[i])){
			return false;
		}
	}

	return true;
}

/// ============================================================================

function forwardToDefaultArchiveService(tabId, url, code){
	if(getarchive_automatic_retrieval){ // TODO: maybe change this setting into a new one
		notify("This page could not be loaded (code " + code + "), automatically getting the archived version..\n\n" + url, 8000);
		//changeUrlWithTabId(shimGetGenericLinkHelper(getarchive_default_archive_service, url), tabId);
		clickToolbarButton();
	}else{
		notify("This page could not be loaded (code " + code + "), click the toolbar button to retrieve an archived version.\n\n" + url, 8000);
	}
}

/// Helper functions
// onDebug function should be used instead of //console.log to prevent the console from showing messages in release mode
function onDebug(info) {
	//console.log(info);
}

// Enable this to see information about preferences loading and other information that clutters up the browser console
function onVerbose(info) {
	//console.log("Verbose: " + info);
}

function notify(message, timeout){
	let title = "Get Archive";
	if(typeof message === "object"){
		title = message.title;
		message = message.message;
	}
	if(timeout == null){
		timeout = 5000;
	}

	//message = message.replace(new RegExp("&", 'g'), "&amp;");

	let messageId = message.substring(0, 20);
	browser.notifications.create(messageId,
	{
		type: "basic",
		iconUrl: browser.extension.getURL(resolveIconUrlNotif("getarchive-64.png")),
		title: title,
		message: message
	});

	// Automatically close after 5 seconds
	setTimeout(function(){
		browser.notifications.clear(messageId);
	}, timeout);
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

/// Saving into archive.org
function getUrlFromInfo(info){
	let url = "";

	// From non-specific to specific
	if(info.pageUrl != null){
		url = info.pageUrl;
	}

	if(info.selectionText != null){
		url = info.selectionText;
	}

	if(info.srcUrl != null){
		url = info.srcUrl;
	}

	if(info.linkUrl != null){
		url = info.linkUrl;
	}

	return url;
}

function saveIntoGetArchive(info){
	let url = getUrlFromInfo(info);
	browser.tabs.create({url: "https://web.archive.org/save/" + url});
}

function saveIntoGetArchiveIs(info){
	let url = getUrlFromInfo(info);
	browser.tabs.create({url: "https://archive.is/?run=1&url=" + url});
}

function saveIntoWebcitation(info){
	let url = getUrlFromInfo(info);
	browser.tabs.create({url: "https://www.webcitation.org/archive"});

	setTimeout(function(){
		sendMessage("saveIntoWebcitation", {url: url});
	}, 2000);

	notify("Please fill in the required fields and submit the form.");
}

function backgroundCopyToClipboard(text){
	navigator.clipboard.writeText(text);
	let date = getDateFromUrl(text);

	notify({ message: urlDecode(text) + "\n\n" + getDateFormat(date), title: "Copied URL to clipboard"});
}

function isFailedUrl(url){
	for(let failedUrl of failedUrls){
		if(failedUrl == url){
			return true;
		}
	}

	return false;
}
