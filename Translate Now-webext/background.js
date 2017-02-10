/// Static variables
var selectedText = "";
var lastTabId = -1;

//the addons icon is a modified version of http://www.flaticon.com/free-icon/translator-tool_69101
//see their website for licensing information

var translate_now_destination_language;
var translate_now_source_language;
var translate_now_reuse_tab;
var translate_now_enable_speak;

function init(){
	function setDestinationLanguage(result) {
		//console.log("background.js setDestinationLanguage " + value(result));
		translate_now_destination_language = value(result) || "en";
	}
	
	function setSourceLanguage(result) {
		//console.log("background.js setSourceLanguage " + value(result));
		translate_now_source_language = value(result) || "auto";
	}
	
	function setReuseTab(result) {
		//console.log("background.js setReuseTab " + value(result));
		translate_now_reuse_tab = value(result) || false;
	}
	
	function setEnableSpeak(result) {
		//console.log("background.js setEnableSpeak " + value(result));
		translate_now_enable_speak = value(result) || false;
	}

	/* This function was taken from Scrollkey */
	var value = function(result){
		// Firefox <= 51 returns an array, which isn't correct behaviour. This code works around that bug. See also https://bugzilla.mozilla.org/show_bug.cgi?id=1328616
		if(Array.isArray(result)){
			result = result[0];
		}
		for(var key in result) {
			if(result.hasOwnProperty(key)) {
				return result[key];
			}
		}
		return undefined;
	}
	
	var getting1 = browser.storage.local.get("translate_now_destination_language");
	getting1.then(setDestinationLanguage, onError);
	
	var getting2 = browser.storage.local.get("translate_now_source_language");
	getting2.then(setSourceLanguage, onError);
	
	var getting3 = browser.storage.local.get("translate_now_reuse_tab");
	getting3.then(setReuseTab, onError);
	
	var getting4 = browser.storage.local.get("translate_now_enable_speak");
	getting4.then(setEnableSpeak, onError);
	
	setTimeout(function(){
		initContextMenus();
	}, 20);
}
init();

browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "refresh-options":
			//console.log("received refresh-options");
			init();
			break;
		default:
			break;
	}
});

/// Context menus
function initContextMenus(){
	browser.contextMenus.removeAll();
	
	browser.contextMenus.create({
		id: "translatenow-translate",
		title: "Translate Now",
		contexts: ["selection"]
	}, onCreated);

	if(translate_now_enable_speak){
		browser.contextMenus.create({
			id: "translatenow-speak",
			title: "Speak with Google Translate Voice",
			contexts: ["selection"]
		}, onCreated);
	}

	function onCreated(n) {
		if (browser.runtime.lastError) {
			console.log(`Error: ${browser.runtime.lastError}`);
		}
	}
	
	browser.contextMenus.onClicked.addListener(function(info,tab){
		switch (info.menuItemId) {
			case "translatenow-translate":
				doClick(info.selectionText, "translate");
				break;
			case "translatenow-speak":
				doClick(info.selectionText, "speak");
				break;
		}
	});
}

/// Translate Now Code
function openTab(url){
	//console.log("openTab for url " + url);
	//console.log("lastTabId is " + lastTabId);
	//console.log("translate_now_reuse_tab is " + translate_now_reuse_tab);

	if(lastTabId != -1 && translate_now_reuse_tab){
		var gettingInfo = browser.tabs.get(lastTabId);
		gettingInfo.then(onGot, onError);
					
		function onGot(tabInfo) {
			//console.log("tab exists");
			
			var updating = browser.tabs.update(lastTabId, {
				active: true,
				url: url
			}).then(
				function(data){
					//console.log(1, 'success', JSON.stringify(data));
				},
				function(error){
					notify("Failed to update tab");
					lastTabId = -1;
				}
			);
		}

		function onError(error) {
			openTabInner(url);
		}
	}else{
		openTabInner(url);
	}
}

function openTabInner(url){
	var creating = browser.tabs.create({
		url: url,
		active: true
	}).then(onCreated, onError);
	
	function onCreated(tab){
		lastTabId = tab.id;
	}
}

function doClick(selectionText, action){
	if(selectionText != "" || selectionText == null){
		selectedText = selectionText;
	}
	if(selectedText == null){
		notify("Try another selection");
	}else{
		if(selectedText.length > 93 && action == "speak"){
			notify("Selected text is too long");
		}else{
			var newText = selectedText;
			newText = encodeURIComponent(newText);
			newText = newText.replace("%25", "");
			newText = newText.replace("%C2%A0", " ");
			if(action == "speak"){
				openTab("http://translate.google.com/translate_tts?tl=en&client=tw-ob&q=" + newText);
			}else{
				openTab("http://translate.google.com/#" + translate_now_source_language + "/" + translate_now_destination_language + "/" + newText);
			}
		}
	}
}

/// Helper functions
function onError(error) {
	console.log(`Error: ${error}`);
}

function notify(message){
	browser.notifications.create({
		type: "basic",
		title: "Translate Now",
		message: message
	});
}
