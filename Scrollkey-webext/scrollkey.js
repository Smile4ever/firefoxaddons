var scrollValue;
var horizontalScroll;
var scrollPageDownPageUp;

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

var scrollUp = function(id, win){
	//console.log("scrollling up");
	scrollDownOrUp(id, -1, win);
}

var scrollDown = function(id, win){
	//console.log("scrollling down");
	scrollDownOrUp(id, 1, win);
}

var scrollDownOrUp = function(id, factor, win){
	getScrollValue(id);
	getHorizontalScroll(id+100);
	setTimeout(function(){
		if(horizontalScroll == true){
			if(win.document.body.scrollWidth == win.document.documentElement.clientWidth){
				sendMessage("notify", browser.i18n.getMessage("notify_tip_horizontal")); // "This page cannot be scrolled horizontally. Change the preferences to scroll vertically or try another shortcut."
			}
			win.scrollBy(scrollValue * factor, 0);
		}else{
			/*console.log("body.scrollHeight is " + win.document.body.scrollHeight);
			console.log("body.clientHeight is " + win.document.documentElement.clientHeight);*/

			if(win.document.body.scrollHeight == win.document.documentElement.clientHeight){
				sendMessage("notify", browser.i18n.getMessage("notify_tip_vertical")); // "This page cannot be scrolled vertically. Change the preferences to scroll horizontally or try another shortcut."
			}
			win.scrollBy(0, scrollValue * factor);
		}
	}, 20);
}

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

var getScrollValue = function(id){
	var pref = "scrollkey_scrollvalue"; //0
	
	if (id == 1){
		pref = "scrollkey_scrollvalue_shift"; //1
	}
	if (id == 2){
		pref = "scrollkey_scrollvalue_alt"; //2
	}
	
	browser.storage.sync.get(pref).then(setScrollValue, onError);
}

var setScrollValue = function(result){
	scrollValue = value(result);
	if(scrollValue == null){
		scrollValue = 400;
	}
}

var getHorizontalScroll = function(id){
	var pref = "scrollkey_horizontal_scroll";
	
	if (id == 101){
		pref = "scrollkey_horizontal_scroll_shift";
	}
	if (id == 102){
		pref = "scrollkey_horizontal_scroll_alt";
	}
	
	browser.storage.sync.get(pref).then(setHorizontalScroll, onError);
}

var setHorizontalScroll = function(result){
	horizontalScroll = value(result);
	if(horizontalScroll == null){
		horizontalScroll = false;
	}
}

var getScrollPageDownPageUp = function(){
	browser.storage.sync.get("scrollkey_scroll_pagedown_pageup").then(setScrollPageDownPageUp, onError);
}

var setScrollPageDownPageUp = function(result){
	scrollPageDownPageUp = value(result);
	if(scrollPageDownPageUp == null){
		// PageUp / PageDown have their default browser function
		scrollPageDownPageUp = false;
	}
}

// begin init
getScrollPageDownPageUp();
// end init

var onError = function(result){
	
}

/// Iframe handling
function addKeydownToIframes(){
	/// Code from Get Archive, adapted for Scrollkey
	// Test URL: https://www.w3schools.com/html/html_iframe.asp
	var frameIdentifiers = ["iframe", "frame"];
	try{
		var i = 0;
		for(i = 0; i < frameIdentifiers.length; i++){
			var frames = document.getElementsByTagName(frameIdentifiers[i]);
			//var iframes = document.getElementsByTagName("iframe");
			//console.log("number of frames: " + frames.length);

			if(frames.length == 0){
				continue;
			}
			
			//console.log("number of iframes: " + iframes.length);
			
			var j = 0;
			for(j = 0; j < frames.length; j++){
				var frame = frames[j];
				if(frame.getAttribute("src") == null){
					continue;
				}
				if(frame.getAttribute("src").indexOf("google") > -1 || frame.getAttribute("src").indexOf("facebook") > -1 || frame.getAttribute("src").indexOf("twitter") > -1){
					continue;
				}
				try{
					var frame = frames[j];
					var idoc = frame.contentWindow;
					addKeydown(idoc);
				}catch(innerex){
					//console.log(innerex);
					//console.log("CROSS-DOMAIN IFRAME on URL " + frame.getAttribute("src"));
				}
			}
		}
	}catch(ex){
		//console.log("exception!");
		//console.log(ex);
		// I don't trust the code above
	}
	/// End of code from Get Archive
}

setTimeout(function(){
	addKeydownToIframes();
}, 500);

setTimeout(function(){
	addKeydownToIframes();
}, 2000);
/// End of iframe handling

addKeydown(window);
	
function addKeydown(w){
	//try{
		w.addEventListener("keydown", function(event){
			if (event.defaultPrevented || event.target.ownerDocument.activeElement.tagName.toLowerCase() != "body"){
				return;
			}
			
			var win = event.target.ownerDocument.defaultView;
			
			// j = 74
			// k = 75
			// PageDown = 34
			// PageUp = 33
			// Home = 36
			// End = 35
			
			// normal = 0
			// shift = 1
			// alt = 2
			var ok = false;
			
			if (!event.ctrlKey && !event.metaKey) {
				if(!event.shiftKey && !event.altKey && event.keyCode == 74){
					// j
					ok = true;
					scrollDown(0, win);
				}
				
				if(!event.shiftKey && !event.altKey && event.keyCode == 75){
					// k
					ok = true;
					scrollUp(0, win);
				}
				
				if(event.shiftKey && !event.altKey && event.keyCode == 74){
					// shift+j
					ok = true;
					scrollDown(1, win);
				}
				
				if(event.shiftKey && !event.altKey && event.keyCode == 75){
					// shift+k
					ok = true;
					scrollUp(1, win);
				}
				
				if(event.altKey && !event.shiftKey && event.keyCode == 74){
					// alt+j
					ok = true;
					scrollDown(2, win);
				}
				
				if(event.altKey && !event.shiftKey && event.keyCode == 75){
					// alt+k
					ok = true;
					scrollUp(2, win);
				}
				
				if(!event.altKey && !event.shiftKey && event.keyCode == 34){
					//PageDown
					getScrollPageDownPageUp(); // won't take effect this time, but it will take effect next time which is good enough
					if(scrollPageDownPageUp){
						ok = true;
						scrollDown(0, win);
					}
				}
				
				if(!event.altKey && !event.shiftKey && event.keyCode == 33){
					//PageUp
					getScrollPageDownPageUp(); // won't take effect this time, but it will take effect next time which is good enough
					if(scrollPageDownPageUp){
						ok = true;
						scrollUp(0, win);
					}
				}
			}
			
			// don't allow for double actions for a single event
			if(ok){
				event.preventDefault();
			}
		});
	/*}catch(ex){
		console.log(w.location.href);
		if(w == null){
			console.log("window is null");
		}else{
			console.log(ex);
		}
	}*/
}
