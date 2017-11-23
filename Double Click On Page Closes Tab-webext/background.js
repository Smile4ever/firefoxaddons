/// Messages
// Listen for messages from the content script
browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "closeTab":
			closeTab();
			break;
		case "onError":
			onError(message.data);
			break;
		default:
			break;
	}
});

/// Tab functions
function closeTab(){
	browser.tabs.query({currentWindow: true, active: true}).then(onSuccess, onError);
	
	function onSuccess(activeTabs) {
		var activeTab = activeTabs[0];
		browser.tabs.remove(activeTab.id);
	}
}

/// Helper functions
function onError(error) {
	console.error(`${error}`);
}
