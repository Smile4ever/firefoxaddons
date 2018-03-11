/// Static variables
var delete_reason = "";
var lastClosedTabUrl = "";
var lastTriggeredF8 = new Date();

///Messages
// listen for messages from the content script
browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
	switch(message.action){
		// Closing tabs and windows
		case "closeTab":
			closeTab();
			break;
		case "closeTabNow":
			closeTabNow();
			break;
		case "closeTabAfter500":
			closeTabAfter500();
			break;
		case "closeWindow":
			closeWindow();
			break;

		// Fast Delete specific
		case "autoDeletePage":
			autoDeletePage(message.data.url, message.data.reason);
			break;
		case "openTalkPage":
			openTalkPage(message.data.url);
			break;

		// General
		case "openFocusedTab":
			openFocusedTab(message.data);
			break;
		case "openTab":
			openTab(message.data);
			break;
		case "notify":
			notify(message.data);
			break;
		default:
			break;
	}
}

// See also https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/Tabs/sendMessage
function sendMessage(action, data){
	function logTabs(tabs) {
		for (tab of tabs) {
			// tab.url requires the tabs permission
			//console.log(tab.url);
			browser.tabs.sendMessage(tab.id, {"action": action, "data": data}).catch(onError);
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

/// Shortcuts
//Fired when a registered command is activated using a keyboard shortcut.
browser.commands.onCommand.addListener((command) => {
	//console.log("onCommand event received for message: ", command);
	if(command == "f8-received"){
		let newTriggeredF8 = new Date();

		//console.log("Caught F8 event at " + newTriggeredF8);
		if(newTriggeredF8 - lastTriggeredF8 < 500){
			//console.log("cancelling F8 action");
			return;
		}else{
			lastTriggeredF8 = newTriggeredF8;
		}

		// TODO: close tab with title "Cannot delete page"

		browser.tabs.query({currentWindow: true, active: true}).then(onSuccess, onError);

		function onSuccess(activeTabs) {
			var activeTab = activeTabs[0];
			if(activeTab.url.indexOf("archive.org") == -1 && activeTab.url.indexOf("archive.is") == -1){
				sendMessage("F8");
			}else{
				browser.tabs.remove(activeTab.id);
			}
		}
	}
});

/// Tab events
function handleUpdated(tabId, changeInfo, tabInfo) {
	//if(delete_reason == "") return;

	if(changeInfo.title){
		if(isCompleted(changeInfo.title)){
			delete_reason = "";
			browser.tabs.onUpdated.removeListener(handleUpdated);
			closeTab(tabInfo.url);
		}
		return;
	}
}

/// Tab functions
function closeTab(url){
	if(url != null && url != undefined){
		browser.tabs.query({url: url}).then(onSuccess, onError);
	}else{
		browser.tabs.query({currentWindow: true, active: true}).then(onSuccess, onError);
	}

	function onSuccess(activeTabs) {
		var activeTab = activeTabs[0];

		//console.log(activeTab.title);
		//if(activeTab.url == lastClosedTabUrl && tab.title == "New Tab") return;
		//if(activeTab.url == "about:blank") return;
		if(activeTab.url.indexOf("wiki.lxde") == -1 && activeTab.url.indexOf("nl.wikipedia.org") == -1 && activeTab.url.indexOf("archive.org") == -1 && activeTab.url.indexOf("archive.is") == -1) return;
		if(activeTab.url.indexOf("action=rollback") > -1) return;

		browser.tabs.remove(activeTab.id);
		lastClosedTabUrl = activeTab.url;

		browser.tabs.query({url: lastClosedTabUrl}).then(onOtherResults, onError);

		function onOtherResults(otherTabs) {
			for(let otherTab of otherTabs){
				browser.tabs.remove(otherTab.id);
			}
		}

		// When not yet visited (is being checked in openArticleTab)
		//openArticleTab(lastClosedTabUrl);
	}
}

// Open article tab when not yet visited..
/*function openArticleTab(url){
	let articleUrl = url.replace("Overleg:", "");
	browser.history.getVisits({
		url: articleUrl;
    }).then(gotVisits);

    function gotVisits(visits) {
	  console.log("Visit count: " + visits.length);
	  if(visits.length == 0){
		  openTab(articleUrl);
	  }
	}
}*/

function isCompleted(title){
	if(title == null) return false;
	return title.indexOf("Action complete") > -1 ||	title.indexOf("Cannot delete") > -1 || title.indexOf("Handeling voltooid") > -1 || title.indexOf("kan niet verwijderd worden") > -1;
}

function closeTabNow(){
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		browser.tabs.remove(tabs[0].id);
	}, onError);
}

function closeTabAfter500(){
	setTimeout(function(){
		browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
			let tab = tabs[0];

			// Putting isCompleted out of comments sometimes makes the bot go stuck. Better we close too many tabs instead of keeping a tab open in stucked state.
			// An alternative is probably reloading the tab, but I'm not sure we want to do that
			if(isCompleted(tab.title)){ // test.
				//console.log("closing after 500ms");
				browser.tabs.remove(tab.id);
			}else{
				// TODO before releasing
				setTimeout(function(){
					// If the active tab is still the same after 20s, close this tab.
				}, 20000);
			}
		}, onError);
	}, 500);
}

function closeWindow(){
	browser.tabs.query({currentWindow: true}).then(onSuccess, onError);

	function onSuccess(tabs) {
		for (tab of tabs) {
			browser.tabs.remove(tab.id);
		}
	}
}

function openTab(url){
	if(url == true || url == "") return;
	//console.log("Opening tab " + url);
	browser.tabs.create({
		url: url,
		active: false
	}).then(onCreatedTab, onError);
}

function openFocusedTab(url){
	browser.tabs.create({
		url: url,
		active: true
	}).then(onCreatedTab, onError);
}

/// Functions
// Safe mode is not enabled. Delete page when appropriate. fastdelete.js will check all conditions.
function autoDeletePage(url, reason){
	// First, we go to the deletion page URL. == Navigate the current tab to it.
	// Step 1
	goToDeletionPage(url);

	// Step 2
	// delete_reason = reason;
	setTimeout(function(){
		confirmDeletion(reason);
	}, 500);

	// Step 3 is done automatically using the tabs API, but here you have the pseudo code:
	/*setTimeout(function(){
		closeTab();
	}, 4000);*/
	browser.tabs.onUpdated.addListener(handleUpdated);
}

// Step 1
function goToDeletionPage(url){
	//console.log("goToDeletionPage " + url);
	browser.tabs.update({url: url});
}

// Step 2
function confirmDeletion(reason){
	//console.log("sending confirmWithReason with reason " + reason);
	sendMessage("confirmWithReason", reason);
}

function openTalkPage(url){
	//console.log("Updating tab to " + url);
	browser.tabs.update({url: url});
	setTimeout(function(){
		sendMessage("F8");
	}, 500);
}

/// Helper functions
function onError(error) {
	console.error(`${error}`);
}

function notify(message){
	browser.notifications.create(message.substring(0, 20), {
		type: "basic",
		iconUrl: browser.extension.getURL("icons/fastdelete-128.png"),
		title: "Fast Delete",
		message: message
	});
}

function onCreatedTab(tab){
	// Do nothing
}
