/// Static variables
var scrollTop = 0;
var domain = "";
var maxValue = 1; // we can't divide with zero, so take 1 instead of 0

/// Preferences
var fastnav_scroll_page;

function init(){
	var valueOrDefault = function(value, defaultValue){
		if(value == undefined)
			return defaultValue;
		return value;
	}

	browser.storage.local.get([
		"fastnav_scroll_page"
	]).then((result) => {
		//console.log("background.js fastnav_scroll_page " + result.fastnav_scroll_page);
		fastnav_scroll_page = valueOrDefault(result.fastnav_scroll_page, true);
	}).catch(console.error);
}
init();

/// Messages
// listen for messages from the content or options script
browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "notify":
			notify(message.data);
			break;
		case "refresh-options":
			init();
			break;
		case "changeUrl":
			changeUrl(message.data.url, message.data.scrollTop, message.data.domain, message.data.maxValue);
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

function changeUrl(url, scrollTopLocal, domainLocal, maxValueLocal){
	// window.location.href = value;
	scrollTop = scrollTopLocal;
	domain = domainLocal;
	maxValue = maxValueLocal;

	browser.tabs.update({url: url});
	browser.tabs.onUpdated.addListener(handleUpdated);
}

function handleUpdated(tabId, changeInfo, tabInfo) {
	if(!tabInfo.active) return;
	if(changeInfo.status == "complete" && fastnav_scroll_page == true){
		sendMessage("setScrollTop", {scrollTop: scrollTop, domain: domain, maxValue: maxValue});
		browser.tabs.onUpdated.removeListener(handleUpdated);
	}
}

/// Helper functions
function onError(error) {
	//console.log(`Error: ${error}`);
}

function notify(message){
	browser.notifications.create(message.substring(0, 20),
	{
		type: "basic",
		iconUrl: browser.extension.getURL("icons/fastnav-128.png"),
		title: "FastNav",
		message: message
	});
}
