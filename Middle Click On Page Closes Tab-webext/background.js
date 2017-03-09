browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "closeTab":
			closeTab();
			break;
		default:
			break;
	}
});

function closeTab(){
	browser.tabs.query({currentWindow: true, active: true}).then(onSuccess, onError);
	
	function onSuccess(activeTabs) {
		var activeTab = activeTabs[0];
		browser.tabs.remove(activeTab.id);
		//console.log("Middle Click On Page Closes Tab " + activeTab.url);
	}
}

/// Helper functions
function onError(error) {
	console.log(`${error}`);
}
