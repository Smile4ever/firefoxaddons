var closed = false; // prevent subsequent mousedown / click events to close two tabs
var start, end;
var autoscrolling = false;

/// Preferences
var middleclick_autoscrolling_tipping_point;
var middleclick_autoscrolling_every_page;
var middleclick_autoscrolling_current_page;
var eventListenersAttached = false;

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
		
		// specific to Middle Click On Page Closes Tab
		autoscrolling = middleclick_autoscrolling_every_page;
		
		// If preferences loading is too slow, we will have already added the event listeners
		// That's not a problem though because it now MAY be different, so execute it again without checking for eventListenersAttached
		assignCorrectEventListeners(window);
		
		onVerbose("background.js middleclick_autoscrolling_current_page " + result.middleclick_autoscrolling_current_page);
		middleclick_autoscrolling_current_page = valueOrDefault(result.middleclick_autoscrolling_current_page, "Escape");
		eventListenersAttached = true;
	}).catch(console.error);
	
	setTimeout(function(){
		// If the preferences fail to load, we still want the defaults to be applied
		if(eventListenersAttached == false){
			assignCorrectEventListeners(window);
		}
	}, 100)
}
init();

function onDebug(data){
	sendMessage("onDebug", data);
}

function onVerbose(data){
	sendMessage("onVerbose", data);
}

var cancelEvent = function (e) {
	if (!isMiddleMouseButton(e))
		return;
	e.preventDefault();
	e.stopPropagation();
}

// http://stackoverflow.com/questions/1360818/how-to-measure-the-milliseconds-between-mousedown-and-mouseup
var mouseDownFunc = function (e) {
	if(!isMiddleMouseButton(e))
		return;
	
	start = +new Date(); // get unix-timestamp in milliseconds
}

var mouseUpFunc = function (e) {
	if(!isMiddleMouseButton(e))
		return;
		
	end = +new Date();

	var diff = end - start; // time difference in milliseconds
	
	onDebug("middleclick.js mouseUpFunc diff is " + diff + " start was " + start + " and end was " + end);
	if(diff < 200){
		eventHandler(e);
	}
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function isMiddleMouseButton(e){
	return e && (e.which == 2 || e.button == 4);
}

document.addEventListener("keydown", function(event){
	if(event.code != middleclick_autoscrolling_current_page)
		return;
	
	autoscrolling = !autoscrolling;
	assignCorrectEventListeners(window);
	assignCorrectEventListenersIframe();
	
	sendMessage("notify", "autoscrolling is now " + autoscrolling);
});

function assignCorrectEventListeners(w){
	w.removeEventListener("mousedown", mouseDownFunc);
	w.removeEventListener("mouseup", mouseUpFunc);
	
	w.removeEventListener('click', eventHandler);
	w.removeEventListener('mousedown', cancelEvent);
	w.removeEventListener("mouseup", cancelEvent);
		
	if(!autoscrolling){
		//console.log("remove autoscrolling feature by adding event listeners");
		// Disable autoscrolling
		w.addEventListener("click", eventHandler);
		w.addEventListener('mousedown', cancelEvent);
		w.addEventListener("mouseup", cancelEvent);
		
	}
	if(autoscrolling){
		//console.log("add autoscrolling feature by removing event listeners");
		w.addEventListener("mousedown", mouseDownFunc);
		w.addEventListener("mouseup", mouseUpFunc);
	}
}

function assignCorrectEventListenersIframe(){
	var id = 0;
	var i = 0;
	var identifiers = ["iframe", "frame"];
	for(id = 0; id < identifiers.length; id++){
		var iframes = document.getElementsByTagName(identifiers[id]);
		for(i = 0; i < iframes.length; i++){
			//console.log("frame " + i + " - " + iframes[i].getAttribute("src"));
			try{
				assignCorrectEventListeners(iframes[i].contentWindow);
			}catch(ex){
				// Cross-origin domain security violation (controlled by CORS)
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
				//console.log(ex);
			}
		}
	}
}

var eventHandler = function(e) {
	if(closed){
		//console.log("Taking exit 0");
		return;
	}
	
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
	
	if (isMiddleMouseButton(e)) {
		closed = true;
		sendMessage("closeTab");
		e.preventDefault();
		e.stopPropagation();
	}
}

//window.addEventListener("click", eventHandler);

// Needed for WebCite and others
document.addEventListener("DOMContentLoaded", assignCorrectEventListenersIframe);

//window.addEventListener('mousedown', mouseDownFunc);
//window.addEventListener("mouseup", mouseUpFunc);

// Disable autoscrolling by default, unless middleclick_autoscrolling_every_page is true
//window.addEventListener('mousedown', cancelEvent);
//window.addEventListener("mouseup", cancelEvent);
