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
function sendMessage(action, data){
	function logTabs(tabs) {
		for (tab of tabs) {
			browser.tabs.sendMessage(tab.id, {"action": action, "data": data});
		}
	}

	browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
}

/// Helper functions
function onError(error) {
	//console.log(`Error: ${error}`);
}

function notify(message){
	browser.notifications.create(message.substring(0, 20),
	{
		type: "basic",
		iconUrl: browser.extension.getURL("icons/scrollkey.svg"),
		title: "Scrollkey",
		message: message
	});
}
