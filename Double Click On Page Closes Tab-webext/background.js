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
		case "onError":
			onError(message.data);
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

/// Tab functions
function closeTab(){
	browser.tabs.query({currentWindow: true, active: true}).then(onSuccess, onError);
	
	function onSuccess(activeTabs) {
		var activeTab = activeTabs[0];
		browser.tabs.remove(activeTab.id);
		//onDebug("Double Click On Page Closes Tab " + activeTab.url);
	}
}

/// Helper functions
function onError(error) {
	console.error(`${error}`);
}

function notify(message){
	var title = "Double Click On Page Closes Tab";
	if(typeof message === "object"){
		title = message.title;
		message = message.message;
	}
	
	browser.notifications.create({
		type: "basic",
		iconUrl: browser.extension.getURL("icons/closetabicon.png"),
		title: title,
		message: message
	});
}
