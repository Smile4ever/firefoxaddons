// Listen for messages from the background script
browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
	switch(message.action){
		case "getSelection":
			sendMessage("setSelection", {selection: getSelection(), pageUrl: window.location.href});
			break;
		case "bingTranslate":
			bingTranslate(message.data.translate_now_source_language, message.data.translate_now_destination_language, message.data.selectedText);
			break;
		case "bingSpeak":
			bingSpeak(message.data.translate_now_source_language, message.data.translate_now_destination_language, message.data.selectedText, message.data.translate_now_to_speak);
			break;
		case "deeplTranslate":
			deeplTranslate(message.data.translate_now_source_language, message.data.translate_now_destination_language, message.data.selectedText);
			break;
		case "googleSpeak":
			googleSpeak(message.data);
			break;
		/*case "setGoogleTranslateText":
			setGoogleTranslateText(message.data);
			break;*/
		default:
			break;
	}
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function getSelection() {
	var inputSel = getInputSelection(document);
	if(inputSel != "") return inputSel;
	
	var normalSelection = window.getSelection().toString();
	if(normalSelection != "") return normalSelection;
	
	/// Code from Get Archive
	// Test URL: https://archive.is/2013.07.03-031317/http://neppi.blog.shinobi.jp/ねっぴーのこと/恩師増田宏三先生を悼む	
	var frameIdentifiers = ["iframe", "frame"];
	try{
		var i = 0;
		for(i = 0; i < frameIdentifiers.length; i++){
			var frames = document.getElementsByTagName(frameIdentifiers[i]);
			//console.log("number of frames: " + frames.length);
			
			if(frames.length == 0){
				continue;
			}
			
			var j = 0;
			for(j = 0; j < frames.length; j++){
				var frame = frames[j];
				if(frame.getAttribute("src").indexOf("google") == -1 && frame.getAttribute("src").indexOf("facebook") == -1 && frame.getAttribute("src").indexOf("twitter") == -1){
					continue;
				}
				try{
					var frame = frames[j];
					var idoc = frame.contentDocument || frame.contentWindow.document;
					var frameselection = idoc.getSelection();
					if(frameselection == null){
						var inputSel = getInputSelection(idoc);
						if(inputSel != ""){
							return inputSel;
						}else{
							continue;
						}
					}
					
					if(frameselection.toString().length > 0){
						//console.log("translatenow.js returning (i)frame selection");
						return frameselection.toString();
					}
				}catch(innerex){
					//console.log("CROSS-DOMAIN IFRAME on URL " + frame.getAttribute("src"));
				}
			}
			
		}
	}catch(ex){
		// I don't trust the code above, return an empty string at all times when there is an error with the code above
	}
	/// End of code from Get Archive
	
    return "";
}

function getInputSelection(doc){
	try{
		if(doc.activeElement != null && (doc.activeElement.tagName === "TEXTAREA" || doc.activeElement.tagName === "INPUT")) {
			var inputSelectedText = doc.activeElement.value.substring(doc.activeElement.selectionStart, doc.activeElement.selectionEnd);
			if(inputSelectedText != null && inputSelectedText != ""){
				return inputSelectedText;
			}
		}
	}catch(ex){
		// I don't trust the code above, make sure we return an empty string so returning window.getSelection() will still work in the calling function
		return "";
	}
	return "";
}

function bingTranslate(translate_now_source_language, translate_now_destination_language, selectedText){
	setBingLanguage("sourceText", translate_now_source_language);
	setBingLanguage("destinationText", translate_now_destination_language);

	document.getElementById("srcText").value = selectedText;
	document.getElementById("TranslateButton").click();
}

function setBingLanguage(className, value){
	var tds = document.getElementsByClassName(className)[0].getElementsByTagName("td");
	var i = 0;
	for(i = 0; i < tds.length; i++){
		if(tds[i].getAttribute("value") == value){
			tds[i].click();
			break;
		}
	}
}

function bingSpeak(translate_now_source_language, translate_now_destination_language, selectedText,translate_now_to_speak){
	bingTranslate(translate_now_source_language, translate_now_destination_language, selectedText);
	
	setTimeout(function(){
		switch(translate_now_to_speak){
			case "original":
				bingSpeakSource();
				break;
			case "translation":
				bingSpeakDestination();
				break;
			case "both":
				bingSpeakSource();
				var length = 75 * selectedText.length;
				//console.log("bingSpeak - length is " + length);

				setTimeout(function(){
					if(document.getElementById("srcText").value != document.getElementById("destText").innerText)
						bingSpeakDestination();
				}, length);
				
				break;
			default:
				break;
		}
	}, 1200);
}

function bingSpeakSource(){
	var speakButton = document.getElementsByClassName("sourceText")[0].getElementsByClassName("speakButton")[0];
	speakButton.click();
}

function bingSpeakDestination(){
	var speakButton = document.getElementsByClassName("destinationText")[0].getElementsByClassName("speakButton")[0];
	speakButton.click();
}

// DeepL only supports Dutch, English, German, French, Spanish, Italian and Polish
function deeplTranslate(translate_now_source_language, translate_now_destination_language, selectedText){
	// First try
	deeplTranslateInternal(translate_now_source_language, translate_now_destination_language, selectedText);

	var e = document.createEvent('HTMLEvents');
	e.initEvent("keyup", false, true);
	document.getElementById("LMT__targetEdit").dispatchEvent(e);

	var e2 = document.createEvent('HTMLEvents');
	e2.initEvent("keyup", false, true);
	document.getElementById("LMT__sourceEdit").dispatchEvent(e);

	// Check if there is text in the target box
	let targetText = document.getElementById("LMT__targetEdit").value;
	document.getElementById("LMT__targetEdit").click();

	// Retry
	if(targetText == null || targetText == ""){
		deeplTranslateInternal(translate_now_source_language, translate_now_destination_language, selectedText);
	}

	// Inform the user of failure and how to resolve the failure into success
	setTimeout(function(){
		let targetText2 = document.getElementById("LMT__targetEdit").value;

		if(targetText2 == null || targetText2 == ""){
			document.getElementById("LMT__targetEdit").value = "Loading translation. Press ENTER if your translation does not appear within 4 seconds.";
		}
	}, 2000);
}

function deeplTranslateInternal(translate_now_source_language, translate_now_destination_language, selectedText){
	document.getElementById("LMT__sourceEdit").value = selectedText;

	setDeeplLanguage("dl_select_source_language", translate_now_source_language.toUpperCase());
	setDeeplLanguage("dl_select_target_language", translate_now_destination_language.toUpperCase());
}

function setDeeplLanguage(id, value){
	var lis = document.getElementById(id).getElementsByTagName("li");
	var i = 0;
	for(i = 0; i < lis.length; i++){
		if(lis[i].getAttribute("dl-value") == value){
			lis[i].click();
			break;
		}
	}
}

function googleSpeak(translate_now_to_speak){
	switch(translate_now_to_speak){
		case "original":
			googleSpeakSource(false);
			break;
		case "translation":
			googleSpeakDestination(0);
			break;
		case "both":
			var isEqual = gt.getSourceText() == gt.getDestinationText();
			googleSpeakSource(!isEqual); // play both if the texts aren't equal
			break;
		default:
			break;
	}
}

function googleSpeakSource(playDestination){	
	var sourceText = gt.getSourceText();
	
	if(!gt.isSourceSpeakAvailable() && playDestination){
		googleSpeakDestination(0);
		return;
	}
	
	var sourceSpeakLanguage = gt.getSourceSpeakLanguage();
	if(sourceSpeakLanguage == ""){
		setTimeout(function(){
			sourceSpeakLanguage = gt.getSourceSpeakLanguage();
			if(sourceSpeakLanguage == "")
				sourceSpeakLanguage = "en";
			var audioObj = gt.playSound(sourceSpeakLanguage, sourceText);
			googleSpeakPlayAfter(audioObj, playDestination);
		}, 1000);
	}else{
		var audioObj = gt.playSound(sourceSpeakLanguage, sourceText);
		googleSpeakPlayAfter(audioObj, playDestination);
	}
}

function googleSpeakPlayAfter(audioObj,playDestination){
	if(!playDestination) return;
	
	var duration = 0;
	
	audioObj.addEventListener('loadedmetadata', function() {
		duration = audioObj.duration * 1000;
		googleSpeakDestination(audioObj.duration * 1000);
	});
	
	setTimeout(function(){
		if(duration == 0){
			//console.log("playing destination text, maybe the original text cannot be spoken aloud?");
			googleSpeakDestination(0);
		}
	}, 2000);
}

function googleSpeakDestination(sourceDuration){
	if(!gt.isDestinationSpeakAvailable()) return;
	
	setTimeout(function(){
		var destinationText = gt.getDestinationText();
		var destinationSpeakLanguage = gt.getDestinationSpeakLanguage();

		gt.playSound(destinationSpeakLanguage, destinationText);
	}, sourceDuration + 150);
}

/*
function setGoogleTranslateText(selectedText){
	document.getElementById("source").value = selectedText;
}
*/