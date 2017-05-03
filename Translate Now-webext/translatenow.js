// Listen for messages from the background script
browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
	switch(message.action){
		case "getSelection": 
			sendMessage("setSelection", getSelection());
			break;
		default:
			break;
	}
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function getSelection() {
	try{
		if(document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")) {
			var inputSelectedText = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
			if(inputSelectedText != null && inputSelectedText != ""){
				return inputSelectedText;
			}
		}
	}catch(ex){
		// I don't trust the code above, make sure we return window.getSelection() at all times when there is an error with the code above
	}
	
	
	/// Code from Get Archive
	var frameIdentifiers = ["iframe", "frame"];
	var i = 0;
	
	try{
		for(i = 0; i < frameIdentifiers.length; i++){
			var frames = document.getElementsByTagName(frameIdentifiers[i]);
			var i = 0;
			//console.log("number of frames: " + frames.length);
			if(frames.length > 0){
				for(i = 0; i < frames.length; i++){
					try{
						var frame = frames[i];
						var idoc = frame.contentDocument || frame.contentWindow.document;
						var frameselection = idoc.getSelection();
						if(frameselection == null){
							continue;
						}
						
						if(frameselection.toString().length > 0){
							//console.log("translatenow.js returning (i)frame selection");
							return frameselection.toString();
						}
					}catch(innerex){
						if(frame.getAttribute("src").indexOf("google") == -1 && frame.getAttribute("src").indexOf("facebook") == -1 && frame.getAttribute("src").indexOf("twitter") == -1){
							//console.log("CROSS-DOMAIN IFRAME on URL " + frame.getAttribute("src"));
						}
					}
				}
			}
		}
	}catch(ex){
		// I don't trust the code above, make sure we return window.getSelection() at all times when there is an error with the code above
	}
	/// End of code from Get Archive
	
    return window.getSelection().toString();
}
