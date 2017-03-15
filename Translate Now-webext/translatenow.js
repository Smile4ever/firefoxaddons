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
	
    return window.getSelection().toString();
}
