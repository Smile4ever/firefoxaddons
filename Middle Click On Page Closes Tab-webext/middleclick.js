function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

var eventHandler = function(e) {
	if(e.target.tagName == "A"){
		//console.log("Taking exit 1");
		return;
	}
	
	if(e.target.parentElement && e.target.parentElement.tagName == "A"){
		//console.log("Taking exit 2");
		return;
	}
	
	if(e.target.hasEventListener && e.target.hasEventListener("click")){
		//console.log("Taking exit 3");
		return;
	}
	
	if (e && (e.which == 2 || e.button == 4 )) {
		//console.log(e.target.tagName);
		sendMessage("closeTab");
	}
}

function onClickHandler(e){
	//console.log("onclick from content script");
	eventHandler(e);
}

window.addEventListener("click", onClickHandler);

// Needed for WebCite and others
document.addEventListener("DOMContentLoaded", function(){
	var id = 0;
	var i = 0;
	var identifiers = ["iframe", "frame"];
	for(id = 0; id < identifiers.length; id++){
		var iframes = document.getElementsByTagName(identifiers[id]);
		for(i = 0; i < iframes.length; i++){
			//console.log("frame " + i + " - " + iframes[i].getAttribute("src"));
			try{
				iframes[i].contentWindow.addEventListener("click", onClickHandler);
			}catch(ex){
				//console.log(ex);
			}
		}
	}
});
