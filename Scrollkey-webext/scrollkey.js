var scrollValue;
var horizontalScroll;
var scrollPageDownPageUp;

var scrollUp = function(id){
	getScrollValue(id);
	getHorizontalScroll(id+100);
	setTimeout(function(){
		if(horizontalScroll == true){
			window.scrollBy(scrollValue * -1, 0);
		}else{
			window.scrollBy(0, scrollValue  * -1);
		}
	}, 20);
}
var scrollDown = function(id){
	getScrollValue(id);
	getHorizontalScroll(id+100);
	setTimeout(function(){
		if(horizontalScroll == true){
			window.scrollBy(scrollValue, 0);
		}else{
			window.scrollBy(0, scrollValue);
		}
	}, 20);
}

var getScrollValue = function(id){
	var pref = "scrollkey_scrollvalue"; //0
	
	if (id == 1){
		pref = "scrollkey_scrollvalue_shift"; //1
	}
	if (id == 2){
		pref = "scrollkey_scrollvalue_alt"; //2
	}
	
	var getting1 = browser.storage.local.get(pref);
    getting1.then(setScrollValue, onError);
}

var setScrollValue = function(result){
	for(var key in result) {
		if(result.hasOwnProperty(key)) {
			scrollValue = result[key];
			return;
		}
	}
	scrollValue = 400;
}

var getHorizontalScroll = function(id){
	var pref = "scrollkey_horizontal_scroll";
	
	if (id == 101){
		pref = "scrollkey_horizontal_scroll_shift";
	}
	if (id == 102){
		pref = "scrollkey_horizontal_scroll_alt";
	}
	
	var getting1 = browser.storage.local.get(pref);
    getting1.then(setHorizontalScroll, onError);
}

var setHorizontalScroll = function(result){
	for(var key in result) {
		if(result.hasOwnProperty(key)) {
			horizontalScroll = result[key];
			return;
		}
	}
	horizontalScroll = false;
}

var getScrollPageDownPageUp = function(){
	var getting1 = browser.storage.local.get("scrollkey_scrollpagedownpageup");
    getting1.then(setScrollPageDownPageUp, onError);
}

var setScrollPageDownPageUp = function(result){
	for(var key in result) {
		if(result.hasOwnProperty(key)) {
			scrollPageDownPageUp = result[key];
			return;
		}
	}
	scrollPageDownPageUp = false; // PageUp / PageDown have their default browser function
}

var onError = function(result){
	
}

window.addEventListener("keydown", function(event){
	if (event.defaultPrevented || document.activeElement.tagName.toLowerCase() != "body"){
		return;
	}
	
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
			scrollDown(0);
		}
		
		if(!event.shiftKey && !event.altKey && event.keyCode == 75){
			// k
			ok = true;
			scrollUp(0);
		}
		
		if(event.shiftKey && !event.altKey && event.keyCode == 74){
			// shift+j
			ok = true;
			scrollDown(1);
		}
		
		if(event.shiftKey && !event.altKey && event.keyCode == 75){
			// shift+k
			ok = true;
			scrollUp(1);
		}
		
		if(event.altKey && !event.shiftKey && event.keyCode == 74){
			// alt+j
			ok = true;
			scrollDown(2);
		}
		
		if(event.altKey && !event.shiftKey && event.keyCode == 75){
			// alt+k
			ok = true;
			scrollUp(2);
		}
		
		if(!event.altKey && !event.shiftKey && event.keyCode == 34){
			getScrollPageDownPageUp();
			//PageDown
			setTimeout(function(){
				if(scrollPageDownPageUp){
					ok = true;
					scrolldown(0);
				}
			}, 20);
		}
		
		if(!event.altKey && !event.shiftKey && event.keyCode == 33){
			getScrollPageDownPageUp()
			//PageUp
			setTimeout(function(){
				if(scrollPageDownPageUp){
					ok = true;
					scrolldown(0);
				}
			}, 20);
		}
	}
	
	// don't allow for double actions for a single event
	if(ok){
		event.preventDefault();
	}
});