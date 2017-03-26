/// Messages
// Listen for messages from the content script
browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "closeTab":
			closeTab();
			break;
		case "notify":
			notify(message.data);
			break;
		case "refresh-options":
			sendMessages("refreshOptions");
			break;
		case "onError":
			onError(message.data);
			break;
		case "onDebug":
			onDebug(message.data);
			break;
		case "onVerbose":
			onVerbose(message.data);
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
				onError("failed to execute " + action + "with data " + data);
			});
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

// Send messages to all content scripts
function sendMessages(action, data){
	function logTabs(tabs) {
		for (tab of tabs) {
			browser.tabs.sendMessage(tab.id, {"action": action, "data": data}).catch(function(){
				// no content script for this tab
			});
		}
	}

	browser.tabs.query({windowType:"normal"}).then(logTabs, onError);
}

/// Tab functions
function closeTab(){
	browser.tabs.query({currentWindow: true, active: true}).then(onSuccess, onError);
	
	function onSuccess(activeTabs) {
		var activeTab = activeTabs[0];
		browser.tabs.remove(activeTab.id);
		//onDebug("Middle Click On Page Closes Tab " + activeTab.url);
	}
}

/// Helper functions
function onError(error) {
	//console.log(`${error}`);
}

// onDebug function should be used instead of console.log to prevent the console from showing messages in release mode
function onDebug(info) {
	//console.log(info);
}

// Enable this to see information about preferences loading and other information that clutters up the browser console
function onVerbose(info) {
	//console.log("Verbose: " + info);
}

function notify(message){
	var title = "Middle Click On Page Closes Tab";
	if(typeof message === "object"){
		title = message.title;
		message = message.message;
	}
	
	message = message.replace(new RegExp("&", 'g'), "&amp;");
	
	browser.notifications.create({
		type: "basic",
		iconUrl: browser.extension.getURL("icons/closetabicon.png"),
		title: title,
		message: message
	});
}
