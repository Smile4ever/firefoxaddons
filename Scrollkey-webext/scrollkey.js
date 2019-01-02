/// Static variables
let scrollValue;
let horizontalScroll;
let scrollPageDownPageUp;
let alreadyNotifiedStatus = "";

/// Constants
const UP = -1;
const DOWN = 1;

/// Preferences
// Horizontal scroll
let scrollkey_horizontal_scroll;
let scrollkey_horizontal_scroll_shift;
let scrollkey_horizontal_scroll_alt;

// Scrollvalue
let scrollkey_scrollvalue;
let scrollkey_scrollvalue_shift;
let scrollkey_scrollvalue_alt;

// Scrollvaluekey
let scrollkey_scrollvaluedown;
let scrollkey_scrollvalueup;

// Blacklist (array)
let scrollkey_blacklist;

// PageUp/PageDown
let scrollkey_scroll_pagedown_pageup;

// Smooth scrolling?
let scrollkey_smooth_scrolling;

function init(){
	let valueOrDefault = function(value, defaultValue){
		if(value == undefined)
			return defaultValue;
		return value;
	}

	let valueOrDefaultArray = function(value, defaultValue){
		let calcValue = valueOrDefault(value, defaultValue);
		return calcValue.split(" ").join("").split(",");
	}

	browser.storage.sync.get([
		"scrollkey_horizontal_scroll",
		"scrollkey_horizontal_scroll_shift",
		"scrollkey_horizontal_scroll_alt",
		"scrollkey_scrollvaluedown",
		"scrollkey_scrollvalueup",
		"scrollkey_scrollvalue",
		"scrollkey_scrollvalue_shift",
		"scrollkey_scrollvalue_alt",
		"scrollkey_scroll_pagedown_pageup",
		"scrollkey_blacklist",
		"scrollkey_smooth_scrolling"
	]).then((result) => {
		scrollkey_horizontal_scroll = valueOrDefault(result.scrollkey_horizontal_scroll, false);
		scrollkey_horizontal_scroll_shift = valueOrDefault(result.scrollkey_horizontal_scroll_shift, false);
		scrollkey_horizontal_scroll_alt = valueOrDefault(result.scrollkey_horizontal_scroll_alt, false);

		scrollkey_scrollvaluedown = valueOrDefault(result.scrollkey_scrollvaluedown, 74);
		scrollkey_scrollvalueup = valueOrDefault(result.scrollkey_scrollvalueup, 75);

		scrollkey_scrollvalue = valueOrDefault(result.scrollkey_scrollvalue, 400);
		scrollkey_scrollvalue_shift = valueOrDefault(result.scrollkey_scrollvalue_shift, 400);
		scrollkey_scrollvalue_alt = valueOrDefault(result.scrollkey_scrollvalue_alt, 400);

		scrollkey_scroll_pagedown_pageup = valueOrDefault(result.scrollkey_scroll_pagedown_pageup, false);

		scrollkey_blacklist = valueOrDefaultArray(result.scrollkey_blacklist, "");

		scrollkey_smooth_scrolling = valueOrDefault(result.scrollkey_smooth_scrolling, false);

		let preventRegistering = false;
		let rootDomain = getRootDomain(window.location.href);

		for(let site of scrollkey_blacklist){
			if(site == rootDomain){
				preventRegistering = true;
			}
		}

		if(!preventRegistering){
			//console.log("Registering for " + window.location.href);
			registerScrollkey();
		}else{
			//console.log("Not registering Scrollkey for " + window.location.href);
		}
	}).catch(console.error);
}
init();

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function registerScrollkey(){
	getScrollPageDownPageUp();

	setTimeout(function(){
		addKeydown(window);
	}, 20);

	setTimeout(function(){
		addKeydownToIframes();
	}, 2000);
}

/// Neat URL code
// Copied from https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function getDomain(url) {
	if(url == undefined || url == null) return null;

    let hostname = url.replace("www.", ""); // leave www out of this discussion. I don't consider this a subdomain
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = hostname.split('/')[2];
    }
    else {
        hostname = hostname.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

/// Neat URL code
// Copied from https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function getRootDomain(url) {
	if(url == undefined || url == null) return null;

    let domain = getDomain(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    if (arrLen > 2) {
        if(splitArr[arrLen - 2].length <= 3){
            // oops.. this is becoming an invalid URL
            // Example URLs that trigger this code path are https://images.google.co.uk and https://google.co.uk
            domain = splitArr[arrLen - 3] + '.' + splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        }else{
            domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        }
    }

    return domain;
}

let scrollDownOrUp = function(id, factor, win){
	let scrollValue = getScrollValue(id);
	let horizontalScroll = getHorizontalScroll(id+100);

	let scrollBehaviour = "auto";
	if(scrollkey_smooth_scrolling) scrollBehaviour = "smooth";

	if(horizontalScroll == true){
		win.scrollBy({
			left: scrollValue * factor,
			behavior: scrollBehaviour,
		});

		let limit = Math.max(win.document.body.scrollWidth, win.document.body.offsetWidth, win.document.documentElement.clientWidth, win.document.documentElement.scrollWidth, win.document.documentElement.offsetWidth) - win.innerWidth;
		
		if(limit <= 0){
			if(alreadyNotifiedStatus === "" || alreadyNotifiedStatus === "notify_tip_vertical"){
				sendMessage("notify", browser.i18n.getMessage("notify_tip_horizontal")); // "This page cannot be scrolled horizontally. Change the preferences to scroll vertically or try another shortcut."
			}

			alreadyNotifiedStatus = "notify_tip_horizontal";
			return false;
		}
	}else{
		win.scrollBy({
			top: scrollValue * factor,
			behavior: scrollBehaviour,
		});

		// https://stackoverflow.com/questions/17688595/finding-the-maximum-scroll-position-of-a-page
		let limit = Math.max(win.document.body.scrollHeight, win.document.body.offsetHeight, win.document.documentElement.clientHeight, win.document.documentElement.scrollHeight, win.document.documentElement.offsetHeight) - win.innerHeight;

		if(limit <= 0){
			if(alreadyNotifiedStatus === "" || alreadyNotifiedStatus === "notify_tip_horizontal"){
				sendMessage("notify", browser.i18n.getMessage("notify_tip_vertical")); // "This page cannot be scrolled vertically. Change the preferences to scroll horizontally or try another shortcut."
			}

			alreadyNotifiedStatus = "notify_tip_vertical";
			return false;
		}
	}
	
	return true;
}

function getScrollValue(id){
	if (id == 0) return scrollkey_scrollvalue;
	if (id == 1) return scrollkey_scrollvalue_shift;
	if (id == 2) return scrollkey_scrollvalue_alt;
}

function getHorizontalScroll(id){
	if (id == 100) return scrollkey_horizontal_scroll;
	if (id == 101) return scrollkey_horizontal_scroll_shift;
	if (id == 102) return scrollkey_horizontal_scroll_alt;
}

function getScrollPageDownPageUp(){
	return scrollkey_scroll_pagedown_pageup;
}

/// Iframe handling
function addKeydownToIframes(){
	/// Code from Get Archive, adapted for Scrollkey
	// Test URL: https://www.w3schools.com/html/html_iframe.asp
	let frameIdentifiers = ["iframe", "frame"];
	try{
		let i = 0;
		for(i = 0; i < frameIdentifiers.length; i++){
			let frames = document.getElementsByTagName(frameIdentifiers[i]);

			if(frames.length == 0){
				continue;
			}

			let j = 0;
			for(j = 0; j < frames.length; j++){
				let frame = frames[j];
				if(frame.getAttribute("src") == null){
					continue;
				}
				if(frame.getAttribute("src").indexOf("google") > -1 || frame.getAttribute("src").indexOf("facebook") > -1 || frame.getAttribute("src").indexOf("twitter") > -1){
					continue;
				}
				try{
					let idoc = frame.contentWindow;
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

last_g = new Date();
const DOUBLE_KEYDOWN_THRESHOLD = 250;

addKeydown(window);
	
function addKeydown(w){
	w.addEventListener("keydown", function(event){
		if (event.defaultPrevented || event.target.ownerDocument.activeElement.tagName.toLowerCase() != "body"){
			return;
		}

		let win = event.target.ownerDocument.defaultView;

		// j = 74
		// k = 75
		// PageDown = 34
		// PageUp = 33
		// Home = 36
		// End = 35
		
		// normal = 0
		// shift = 1
		// alt = 2
		let ok = false;

		if (!event.ctrlKey && !event.metaKey) {
			if(!event.shiftKey && !event.altKey && event.keyCode == scrollkey_scrollvaluedown){
				// j
				ok = scrollDownOrUp(0, DOWN, win);
			}

			if(!event.shiftKey && !event.altKey && event.keyCode == scrollkey_scrollvalueup){
				// k
				ok = scrollDownOrUp(0, UP, win);
			}

			if(event.shiftKey && !event.altKey && event.keyCode == scrollkey_scrollvaluedown){
				// shift+j
				ok = scrollDownOrUp(1, DOWN, win);
			}

			if(event.shiftKey && !event.altKey && event.keyCode == scrollkey_scrollvalueup){
				// shift+k
				ok = scrollDownOrUp(1, UP, win);
			}

			if(event.altKey && !event.shiftKey && event.keyCode == scrollkey_scrollvaluedown){
				// alt+j
				ok = scrollDownOrUp(2, DOWN, win);
			}

			if(event.altKey && !event.shiftKey && event.keyCode == scrollkey_scrollvalueup){
				// alt+k
				ok = scrollDownOrUp(2, UP, win);
			}

			if (!event.shiftKey && !event.altKey && event.keyCode == 71) {
				// g
				if (new Date().getTime() - last_g.getTime() < DOUBLE_KEYDOWN_THRESHOLD)
				window.scrollTo(0, 0);
				last_g = new Date();
			}

			if (event.shiftKey && !event.altKey && event.keyCode == 71) {
				// G = shift + g
				window.scrollTo(0, document.body.scrollHeight);
			}

			if(!event.altKey && !event.shiftKey && event.keyCode == 34){
				//PageDown
				if(scrollkey_scroll_pagedown_pageup){
					ok = scrollDownOrUp(0, DOWN, win);
				}
			}

			if(!event.altKey && !event.shiftKey && event.keyCode == 33){
				//PageUp
				if(scrollkey_scroll_pagedown_pageup){
					ok = scrollDownOrUp(0, UP, win);
				}
			}
		}

		// don't allow for double actions for a single event
		if(ok){
			event.preventDefault();
		}
	});
}
