var self = require("sdk/self")
var contextMenu = require("sdk/context-menu")
var tabs = require("sdk/tabs")
var simple = require("sdk/simple-prefs")
var selectedText = ""
var lastTab;

//the addons icon is a modified version of http://www.flaticon.com/free-icon/translator-tool_69101
//see their website for licensing information

var cScript = 'self.on("click", function() {' +
			  '  var sText = window.getSelection().toString();' +
              '  self.postMessage(sText);' +
              '});';

var dest_lang_value;
var source_lang_value;
var reuse_tab;
		
// a small bit of the code below is from the addon "To Google Translate" (including the icon)
var menuItem = contextMenu.Item({
    label: "Translate Now",
    image: self.data.url("translate.png"),
    context: contextMenu.SelectionContext(),
    contentScript: cScript,
    onMessage: function(sText) {
		dest_lang_value = simple.prefs.destination_language;
		source_lang_value = simple.prefs.source_language;
		reuse_tab = simple.prefs.reuse_tab;

		doClick(sText, "translate");
    }
});

// a small bit of the code below is from the addon "To Google Translate" (including the icon)
var menuItem2 = contextMenu.Item({
    label: "Speak with Google Translate Voice",
    image: self.data.url("mic.png"),
    context: contextMenu.SelectionContext(),
    contentScript: cScript,
    onMessage: function(sText) {
		reuse_tab = simple.prefs.reuse_tab;
		
		doClick(sText, "speak");
    }
});

var openTab = function(url){
	try{
		if(lastTab.url != undefined && reuse_tab){
			lastTab.url = url;
			lastTab.activate();
			return;
		}
	}catch(ex){
		// go to below
	}
	
	tabs.open({
		url: url,
		onReady: function(tab) {
			lastTab = tab;
		}
	});
}

var doClick = function(sText, action){
	if(sText != "" || sText == null){
		selectedText = sText;
	}
	if(selectedText == null){
		var notifications = require("sdk/notifications");
		notifications.notify({
		  title: "Translate Now",
		  text: "Try another selection",
		  data: "OK",
		  onClick: function (data) {
		  }
		});
	}else{
		if(selectedText.length > 93 && action == "speak"){
			//Selected text is too long
			var notifications = require("sdk/notifications");
			notifications.notify({
			  title: "Translate Now",
			  text: "Selected text is too long",
			  data: "OK",
			  onClick: function (data) {
			  }
			});
		}else{
			var newText = selectedText;
			newText = encodeURIComponent(newText);
			newText = newText.replace("%25", "");
			newText = newText.replace("%C2%A0", " ");
			if(action == "speak"){
				openTab("http://translate.google.com/translate_tts?tl=en&q=" + newText);
			}else{
				openTab("http://translate.google.com/#" + source_lang_value + "/" + dest_lang_value + "/" + newText);
			}
		}
	}
}
