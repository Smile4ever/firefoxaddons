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
	}, 50);
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
	}, 50);
}

// http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

var isLowFirefoxVersion = function(){
	var app = navigator.sayswho;
	var appVersion = app.toLowerCase().replace("firefox ", "");
	var appVersionSingle = appVersion.substr(0,appVersion.indexOf('.'));
	if(appVersionSingle != "")
		appVersion = appVersionSingle;
	
	if(app.toLowerCase().indexOf("firefox") > -1 && appVersion <= 51)
		return true;
	
	return false;
}

var value = function(result){
	if(isLowFirefoxVersion()){
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
	
	var getting1 = browser.storage.local.get(pref);
    getting1.then(setScrollValue, onError);
}

var setScrollValue = function(result){
	scrollValue = value(result);
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
	horizontalScroll = value(result);
}

var getScrollPageDownPageUp = function(){
	var getting1 = browser.storage.local.get("scrollkey_scrollpagedownpageup");
    getting1.then(setScrollPageDownPageUp, onError);
}

var setScrollPageDownPageUp = function(result){
	if(result.scrollkey_scroll_pagedown_pageup == null){
		 // PageUp / PageDown have their default browser function
		scrollPageDownPageUp = false;
	}else{
		scrollPageDownPageUp = result.scrollkey_scroll_pagedown_pageup;
	}
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
					scrollDown(0);
				}
			}, 20);
		}
		
		if(!event.altKey && !event.shiftKey && event.keyCode == 33){
			getScrollPageDownPageUp()
			//PageUp
			setTimeout(function(){
				if(scrollPageDownPageUp){
					ok = true;
					scrollUp(0);
				}
			}, 20);
		}
	}
	
	// don't allow for double actions for a single event
	if(ok){
		event.preventDefault();
	}
});