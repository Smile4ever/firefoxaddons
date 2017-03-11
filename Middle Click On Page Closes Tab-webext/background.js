/// Preferences
var middleclick_autoscrolling_tipping_point;
var middleclick_autoscrolling_every_page;
var middleclick_autoscrolling_current_page;

function init(){
	var valueOrDefault = function(value, defaultValue){
		if(value == undefined) return defaultValue;
		return value;
	}
	
	browser.storage.local.get([
		"middleclick_autoscrolling_tipping_point",
		"middleclick_autoscrolling_every_page",
		"middleclick_autoscrolling_current_page"
	]).then((result) => {
		onVerbose("background.js middleclick_autoscrolling_tipping_point " + result.middleclick_autoscrolling_tipping_point);
		middleclick_autoscrolling_tipping_point = valueOrDefault(result.middleclick_autoscrolling_tipping_point, "200");
		
		onVerbose("background.js middleclick_autoscrolling_every_page " + result.middleclick_autoscrolling_every_page);
		middleclick_autoscrolling_every_page = valueOrDefault(result.middleclick_autoscrolling_every_page, false);
		
		onVerbose("background.js middleclick_autoscrolling_current_page " + result.middleclick_autoscrolling_current_page);
		middleclick_autoscrolling_current_page = valueOrDefault(result.middleclick_autoscrolling_current_page, "Escape");
	}).catch(console.error);
}
init();

browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "closeTab":
			closeTab();
			break;
		case "notify":
			notify(message.data);
			break;
		case "refresh-options":
			init();
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

/// Tab functions
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
