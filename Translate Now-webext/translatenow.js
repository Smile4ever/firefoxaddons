// Listen for messages from the background script
browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
	switch(message.action){
		case "getSelection":
			sendMessage("setSelection", {selection: getSelection(message.data), pageUrl: window.location.href});
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

function getSelection(safeSelection) {
	let inputSel = getInputSelection(document);
	if(inputSel != "") return inputSel;
	
	let normalSelection = window.getSelection().toString();
	if(normalSelection != "") return normalSelection;
	
	/// Code from Get Archive
	// Test URL: https://archive.is/2013.07.03-031317/http://neppi.blog.shinobi.jp/ねっぴーのこと/恩師増田宏三先生を悼む	
	let frameIdentifiers = ["iframe", "frame"];
	try{
		let i = 0;
		for(i = 0; i < frameIdentifiers.length; i++){
			let frames = document.getElementsByTagName(frameIdentifiers[i]);
			//console.log("number of frames: " + frames.length);
			
			let j = 0;
			for(j = 0; j < frames.length; j++){
				let frame = frames[j];

				let result = getIframeText(frame, window.location.href);
				if(result == "continue") continue;
				if(result != "exit") return result;
				
				for(k = 0; k < frameIdentifiers.length; k++){
					let innerFrames = frame.getElementsByTagName(frameIdentifiers[k]);
					
					for(l = 0; l < innerFrames.length; l++){
						let innerFrame = innerFrames[l];
						
						let result = getIframeText(innerFrame, frame.baseURI);
						if(result == "continue") continue;
						if(result != "exit") return result;
					}
				}
			}	
		}
	}catch(ex){
		// I don't trust the code above, return the default value at all times when there is an error with the code above
		console.log("exception: " + ex);
	}
	/// End of code from Get Archive
	
    return safeSelection;
}

function getIframeText(frame, parent){
	//console.log("baseURI: " + frame.document.baseURI + " parent is " + parent);
	try{		
		let doc = frame.document || frame.contentWindow || frame.contentDocument;

		let frameselection = doc.getSelection();
		
		if(frameselection == null){
			inputSel = getInputSelection(doc);
			if(inputSel != ""){
				return inputSel;
			}else{
				return "continue";
			}
		}else if(frameselection.toString().length > 0){
			//console.log("translatenow.js returning (i)frame selection");
			return frameselection.toString();
		}
		
		return "exit";
	}catch(innerex){
		//console.log("innerex " + innerex);
		//console.log("CROSS-DOMAIN IFRAME on URL " + frame.getAttribute("src"));
		return "exit";
	}
}

function getInputSelection(doc){
	try{
		if(doc.activeElement != null && (doc.activeElement.tagName === "TEXTAREA" || doc.activeElement.tagName === "INPUT")) {
			let inputSelectedText = doc.activeElement.value.substring(doc.activeElement.selectionStart, doc.activeElement.selectionEnd);
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
	setBingLanguage("t_sl", translate_now_source_language.replace("auto", "auto-detect"));
	setBingLanguage("t_tl", translate_now_destination_language);

	document.getElementById("t_sv").value = selectedText;
}

function setBingLanguage(className, value){
	let select = document.getElementById(className);
	let options = select.getElementsByTagName("option");
	let i = 0;

    for(let item of options){
		if(item.value == value){
			select.selectedIndex = i;
			break;
		}
		i++;
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
				let length = 85 * selectedText.length;
				//console.log("bingSpeak - length is " + length);

				setTimeout(function(){
					if(document.getElementById("t_sv").value != document.getElementById("t_tv").value)
						bingSpeakDestination();
				}, length);
				
				break;
			default:
				break;
		}
	}, 1200);
}

function bingSpeakSource(){
	let speakButton = document.getElementById("t_srcplaycIcon");
	speakButton.click();
}

function bingSpeakDestination(){
	let speakButton = document.getElementById("t_tarplaycIcon");
	speakButton.click();
}

// DeepL only supports Dutch, English, German, French, Spanish, Italian and Polish
function deeplTranslate(translate_now_source_language, translate_now_destination_language, selectedText){
	// First try
	deeplTranslateInternal(translate_now_source_language, translate_now_destination_language, selectedText);

	let e = document.createEvent('HTMLEvents');
	e.initEvent("keyup", false, true);
	document.getElementsByClassName("lmt__target_textarea")[0].dispatchEvent(e);

	let e2 = document.createEvent('HTMLEvents');
	e2.initEvent("keyup", false, true);
	document.getElementsByClassName("lmt__source_textarea")[0].dispatchEvent(e);

	// Check if there is text in the target box
	let targetText = document.getElementsByClassName("lmt__target_textarea")[0].value;
	document.getElementsByClassName("lmt__target_textarea")[0].click();

	// Retry
	if(targetText == null || targetText == ""){
		deeplTranslateInternal(translate_now_source_language, translate_now_destination_language, selectedText);
	}

	// Inform the user of failure and how to resolve the failure into success
	setTimeout(function(){
		let targetText2 = document.getElementsByClassName("lmt__target_textarea")[0].value;

		if(targetText2 == null || targetText2 == ""){
			document.getElementsByClassName("lmt__target_textarea")[0].value = "Loading translation. Press ENTER if your translation does not appear within 4 seconds.";
		}
	}, 2000);
}

function deeplTranslateInternal(translate_now_source_language, translate_now_destination_language, selectedText){
	document.getElementsByClassName("lmt__source_textarea")[0].value = selectedText;

	setDeeplLanguage("dl_select_source_language", translate_now_source_language.toUpperCase());
	setDeeplLanguage("dl_select_target_language", translate_now_destination_language.toUpperCase());
}

function setDeeplLanguage(id, value){
	let lis = document.getElementById(id).getElementsByTagName("li");
	let i = 0;
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
			let isEqual = gt.getSourceText() == gt.getDestinationText();
			googleSpeakSource(!isEqual); // play both if the texts aren't equal
			break;
		default:
			break;
	}
}

function googleSpeakSource(playDestination){	
	let sourceText = gt.getSourceText();
	
	if(!gt.isSourceSpeakAvailable() && playDestination){
		googleSpeakDestination(0);
		return;
	}
	
	let sourceSpeakLanguage = gt.getSourceSpeakLanguage();
	if(sourceSpeakLanguage == ""){
		setTimeout(function(){
			sourceSpeakLanguage = gt.getSourceSpeakLanguage();
			if(sourceSpeakLanguage == "")
				sourceSpeakLanguage = "en";
			let audioObj = gt.playSound(sourceSpeakLanguage, sourceText);
			googleSpeakPlayAfter(audioObj, playDestination);
		}, 1000);
	}else{
		let audioObj = gt.playSound(sourceSpeakLanguage, sourceText);
		googleSpeakPlayAfter(audioObj, playDestination);
	}
}

function googleSpeakPlayAfter(audioObj,playDestination){
	if(!playDestination) return;
	
	let duration = 0;
	
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
		let destinationText = gt.getDestinationText();
		let destinationSpeakLanguage = gt.getDestinationSpeakLanguage();

		gt.playSound(destinationSpeakLanguage, destinationText);
	}, sourceDuration + 150);
}
