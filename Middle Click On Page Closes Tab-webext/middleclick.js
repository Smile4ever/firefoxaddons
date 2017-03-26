var closed = false; // prevent subsequent mousedown / click events to close two tabs
var start, end;
var autoscrolling = false;
var eventListenersAttached = false;
var whitelisted = false;

/// Preferences
var middleclick_autoscrolling_tipping_point = 300;
var middleclick_autoscrolling = "ondemand";
var middleclick_autoscrolling_current_page = "Shift+Escape";
var middleclick_autoscrolling_whitelist = "";

function init(){
	var valueOrDefault = function(value, defaultValue){
		if(value == undefined) return defaultValue;
		return value;
	}
	
	browser.storage.local.get([
		"middleclick_autoscrolling_tipping_point",
		"middleclick_autoscrolling",
		"middleclick_autoscrolling_current_page",
		"middleclick_autoscrolling_whitelist"
	]).then((result) => {
		onVerbose("middleclick.js middleclick_autoscrolling_tipping_point " + result.middleclick_autoscrolling_tipping_point);
		middleclick_autoscrolling_tipping_point = valueOrDefault(result.middleclick_autoscrolling_tipping_point, "300");
		
		onVerbose("middleclick.js middleclick_autoscrolling " + result.middleclick_autoscrolling);
		middleclick_autoscrolling = valueOrDefault(result.middleclick_autoscrolling, "ondemand");
		
		// specific to Middle Click On Page Closes Tab
		if(middleclick_autoscrolling == "always")
			autoscrolling = true;
		else
			autoscrolling = false;
					
		// If preferences loading is too slow, we will have already added the event listeners
		// That's not a problem though because it now MAY be different, so execute it again without checking for eventListenersAttached
		assignCorrectEventListeners(window);
		
		onVerbose("middleclick.js middleclick_autoscrolling_current_page " + result.middleclick_autoscrolling_current_page);
		middleclick_autoscrolling_current_page = valueOrDefault(result.middleclick_autoscrolling_current_page, "Shift+Escape");

		middleclick_autoscrolling_whitelist = valueOrDefault(result.middleclick_autoscrolling_whitelist, "");
		updateWhitelist(middleclick_autoscrolling_whitelist);

		eventListenersAttached = true;
	}).catch(console.error);
	
	setTimeout(function(){
		// If the preferences fail to load, we still want the defaults to be applied
		if(eventListenersAttached == false){
			assignCorrectEventListeners(window);
		}
	}, 100);
	
	// TODO: We might want to load jQuery if it's not loaded / an unsupported version to check for event handlers
	// In manifest.json was "jquery-3.2.0.min.js"
}
init();

function onError(data){
	//sendMessage("onError", data);
}

function onDebug(data){
	//sendMessage("onDebug", data);
}

function onVerbose(data){
	//sendMessage("onVerbose", data);
}

// Listen for messages from the background script
browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
	switch(message.action){
		case "refreshOptions": 
			init();
			break;
		default:
			break;
	}
}


// Send messages to the background script
function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

/// Whitelist
function updateWhitelist(activeInfo) {
	if(middleclick_autoscrolling_whitelist == "")
		return;
	
	if (document.title.indexOf("about:") == -1) {
		if(middleclick_autoscrolling_whitelist.indexOf("\n") == -1){
			middleclick_autoscrolling_whitelist += "\n";
		}
		var sites = middleclick_autoscrolling_whitelist.split("\n");
		var i = 0;
		for(i = 0; i < sites.length; i++){
			if(sites[i] == "") continue;
			onVerbose("site " + sites[i]);
			if(extractDomain(window.location.href) == extractDomain(sites[i])){
				onDebug("match for " + extractDomain(window.location.href) + " on " + window.location.href);
				whitelisted = true;
				autoscrolling = true;
				//middleclick_autoscrolling_tipping_point = 0;
			}
		}
	}
}

// http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];
	domain = domain.replace("www.", "");
		
    return domain;
}

/// Middle Click On Page Closes Tab specific code
var cancelEvent = function (e) {
	if (!isMiddleMouseButton(e)){
		onVerbose("mouseUpFunc not middle mouse button");
		return;
	}else{
		onVerbose("Cancelling event");
	}
	
	e.preventDefault();
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
}

// http://stackoverflow.com/questions/1360818/how-to-measure-the-milliseconds-between-mousedown-and-mouseup
var mouseDownFunc = function (e) {
	if(!isMiddleMouseButton(e)){
		onVerbose("mouseDownFunc not middle mouse button");
		return;
	}
	
	start = +new Date(); // get unix-timestamp in milliseconds
}

var mouseUpFunc = function (e) {
	if(!isMiddleMouseButton(e)){
		onVerbose("mouseUpFunc not middle mouse button");
		return;
	}
	
	onDebug("mouseUpFunc whitelisted is " + whitelisted + " for " + window.location.href);

	if(whitelisted){
		return;
	}

	end = +new Date();

	var diff = end - start; // time difference in milliseconds

	onDebug("middleclick.js mouseUpFunc diff is " + diff + " start was " + start + " and end was " + end);

	if(diff < middleclick_autoscrolling_tipping_point || start == undefined){
		onDebug("eventHandler, middleclick_autoscrolling_tipping_point is " + middleclick_autoscrolling_tipping_point);
		eventHandler(e);
	}
}

function isMiddleMouseButton(e){
	return e && (e.which == 2 || e.button == 4);
}

function keyDownEventHandler(event){
	keyutils.parseKeyboardShortcut(middleclick_autoscrolling_current_page, event, function(){
		autoscrolling = !autoscrolling;
		assignCorrectEventListeners(window);
		assignCorrectEventListenersIframe();
		
		var autoscrolling_friendly = "enabled";
		if(!autoscrolling)
			autoscrolling_friendly = "disabled";
		sendMessage("notify", "Autoscrolling is now " + autoscrolling_friendly + " for " + window.location.href);
	}, true);
}

function registerOnDemandListener(){
	document.removeEventListener("keydown", keyDownEventHandler);
	document.addEventListener("keydown", keyDownEventHandler);
}

function assignCorrectEventListeners(w){
	w.removeEventListener("mousedown", mouseDownFunc);
	w.removeEventListener("mouseup", mouseUpFunc);
	
	w.removeEventListener('click', eventHandler);
	w.removeEventListener('mousedown', cancelEvent);
	w.removeEventListener('mousedown', eventHandler);
	w.removeEventListener("mouseup", cancelEvent);
	
	if(middleclick_autoscrolling == "never" && !whitelisted){
		w.addEventListener("click", eventHandler);
		w.addEventListener('mousedown', eventHandler);
		w.addEventListener("mouseup", cancelEvent);
		return;
	}

	if(middleclick_autoscrolling == "ondemand"){
		registerOnDemandListener();
	}

	if(!autoscrolling){
		onVerbose("remove autoscrolling feature by adding event listeners");
		// Disable autoscrolling
		w.addEventListener("click", eventHandler);
		w.addEventListener('mousedown', eventHandler); /* was cancelEvent */
		w.addEventListener("mouseup", cancelEvent);
		
	}
	if(autoscrolling){
		onVerbose("add autoscrolling feature by removing event listeners");
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
			//onDebug("frame " + i + " - " + iframes[i].getAttribute("src"));
			try{
				assignCorrectEventListeners(iframes[i].contentWindow);
			}catch(ex){
				// Cross-origin domain security violation (controlled by CORS)
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
				//onError(ex);
			}
		}
	}
}

var eventHandler = function(e) {
	if(closed){
		onDebug("Taking exit 0 (already closed)");
		return;
	}
	
	onDebug("whitelisted is " + whitelisted + " for " + window.location.href);

	if(whitelisted){
		onDebug("Taking whitelisted exit");
		return;
	}
		
	if(e.target.tagName == "A"){
		onDebug("Taking exit 1");
		return;
	}
	
	if(e.target.parentElement && e.target.parentElement.tagName == "A"){
		onDebug("Taking exit 2");
		return;
	}
	
	// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Content_scripts#Accessing_page_script_objects_from_content_scripts
	// This functionality is only available in Firefox, and only starting with Firefox 49
	if(window.wrappedJSObject != null){
		var jQueryPage = window.wrappedJSObject.jQuery; // get the real jQuery, not the fake one :P
		if(jQueryPage != null){
			// http://stackoverflow.com/questions/14072042/how-to-check-if-element-has-click-handler
			if(jQueryPage._data != null){
				var ev = jQueryPage._data(e.target, 'events');
				if(ev && ev.click){
					var offsetHeight = e.target.offsetHeight;
					if(offsetHeight < 1000){
					//if(window.location.href.indexOf("sourceforge.net") == -1){
						onDebug('Taking exit 3 (click bound)');
						return;
					//}
					}
				}else{
					//onDebug('not click bound');
				}
			}
		}
	}
	
	if(e.target.hasOwnProperty('onclick')){
		onDebug("Taking exit 4 (onclick)");
		return;
	}
	
	var parentE = e.target;
	var ok = true;
	while(parentE != null){
		if(parentE.style.cursor == "pointer"){
			ok = false;
			onDebug("Taking exit 5 (cursor pointer)");
		}
		if(parentE.tagName == "A"){
			onDebug("Taking exit 6 (a tag)");
			return;
		}
		parentE = parentE.parentElement;
	}
	
	if(!ok){
		return;
	}
	
	if (isMiddleMouseButton(e)) {
		closed = true;
		e.preventDefault();
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
    
		sendMessage("closeTab");	
	}
}

// Needed for WebCite and others
document.addEventListener("DOMContentLoaded", assignCorrectEventListenersIframe);
