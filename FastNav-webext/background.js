/// Static variables
// None

///Messages
// listen for messages from the content or options script
browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
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

/// Helper functions
function onError(error) {
	//console.log(`Error: ${error}`);
}

function notify(message){
	browser.notifications.create(message.substring(0, 20).replace(" ", ""),
	{
		type: "basic",
		iconUrl: browser.extension.getURL("icons/fastnav-128.png"),
		title: "FastNav",
		message: message
	});
}
