var self = require("sdk/self")
var contextMenu = require("sdk/context-menu")
var tabs = require("sdk/tabs")
var simple = require("sdk/simple-prefs")
var selection = require("sdk/selection")
var selectedText = ""
//the addons icon is a modified version of http://www.flaticon.com/free-icon/translator-tool_69101
//see their website for licensing information

//source: http://stackoverflow.com/questions/8621044/how-to-get-selected-text-using-the-firefox-add-on-sdk
function selectionChanged(event){
    selectedText = selection.text;
}

selection.on('select', selectionChanged);

// a small bit of the code below is from the addon "To Google Translate" (including the icon)
var menuItem = contextMenu.Item({
    label: "Translate Now",
    image: self.data.url("translate.png"),
    context: contextMenu.SelectionContext(),
    contentScript: 'self.on("click", function() {' +
                    '   self.postMessage();' +
                    '});',
    onMessage: function() {
		var dest_lang_value = simple.prefs.destination_language
		if(dest_lang_value == null){
			dest_lang_value = "en"
		}
		var source_lang_value = simple.prefs.source_language
		if(source_lang_value == null){
			source_lang_value = "auto"
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
			var newText = selectedText //.replace("%", "")
			newText = encodeURIComponent(newText)
			newText = newText.replace("%25", "")
			newText = newText.replace("%C2%A0", " ")
			tabs.open("http://translate.google.com/#" + source_lang_value + "/" + dest_lang_value + "/" + newText)
		}

    }
});

// a small bit of the code below is from the addon "To Google Translate" (including the icon)
var menuItem2 = contextMenu.Item({
    label: "Speak with Google Translate Voice",
    image: self.data.url("mic.png"),
    context: contextMenu.SelectionContext(),
    contentScript: 'self.on("click", function() {'+
                    '   self.postMessage();' +
                    '});',
    onMessage: function() {
		if(selectedText.length > 93){
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
		    tabs.open("http://translate.google.com/translate_tts?tl=en&q=" + encodeURIComponent(selectedText))
		}
    }
});