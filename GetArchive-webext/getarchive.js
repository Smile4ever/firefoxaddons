/// Global variables
var getarchive_lastcopy = "";
var origin = "code";
var insertOrPauseLocked = false;

/// Preferences
var getarchive_search_engine = "google";
var getarchive_enable_ctrl_c = true;
var getarchive_require_focus = true;
var getarchive_prefer_long_link = true;
var getarchive_default_archive_service = "archive.org";
var getarchive_archiveorg_keyboard_shortcut = "";
var getarchive_archiveis_keyboard_shortcut = "";
var getarchive_webcitation_keyboard_shortcut = "";
var getarchive_googlecache_keyboard_shortcut = "";

// Listen for messages from the background script
browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
	switch(message.action){
		case "copyToClipboard": 
			getarchive.copyToClipboard(message.data);
			break;
		case "copyToClipboardClose": 
			getarchive.copyToClipboard(message.data);
			sendMessage("closeTab");
			break;
		case "copyUrlToClipboard":
			getarchive.copyUrlToClipboard(true, message.data.url, message.data.title, message.data.tabId);
			break;
		case "getSelection": 
			sendMessage("setSelection", window.getSelection().toString());
			break;
		case "getSelectionHtml": 
			sendMessage("setSelectionHtml", getarchive.getSelectionHtml());
			break;
		case "getContextLinkUrl": 
			getarchive.getContextLinkUrl("");
			break;
		case "getGenericLink":
			getarchive.getGenericLink(message.data.archiveService, message.data.contextLinkUrl, message.data.isContextMenu);
			break;
		default:
			break;
	}
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function init(){
	var valueOrDefault = function(value, defaultValue){
		if(value == undefined) return defaultValue;
		return value;
	}
	
	browser.storage.local.get([
		"getarchive_search_engine",
		"getarchive_enable_ctrl_c",
		"getarchive_require_focus",
		"getarchive_prefer_long_link",
		"getarchive_default_archive_service",
		"getarchive_archiveorg_keyboard_shortcut",
		"getarchive_archiveis_keyboard_shortcut",
		"getarchive_webcitation_keyboard_shortcut",
		"getarchive_googlecache_keyboard_shortcut"
	]).then((result) => {
		onVerbose("getarchive.js getarchive_search_engine " + result.getarchive_search_engine);
		getarchive_search_engine = valueOrDefault(result.getarchive_search_engine, "google");
		
		onVerbose("getarchive.js getarchive_enable_ctrl_c " + result.getarchive_enable_ctrl_c);
		getarchive_enable_ctrl_c = valueOrDefault(result.getarchive_enable_ctrl_c, true);
		
		onVerbose("getarchive.js getarchive_require_focus " + result.getarchive_require_focus);
		getarchive_require_focus = valueOrDefault(result.getarchive_require_focus, true);
		
		onVerbose("getarchive.js getarchive_prefer_long_link " + result.getarchive_prefer_long_link);
		getarchive_prefer_long_link = valueOrDefault(result.getarchive_prefer_long_link, true);
				
		onVerbose("getarchive.js getarchive_default_archive_service " + result.getarchive_default_archive_service);
		getarchive_default_archive_service = valueOrDefault(result.getarchive_default_archive_service, "archive.org");
		
		// Keyboard shortcuts
		onVerbose("getarchive.js getarchive_archiveorg_keyboard_shortcut " + result.getarchive_archiveorg_keyboard_shortcut);
		getarchive_archiveorg_keyboard_shortcut = valueOrDefault(result.getarchive_archiveorg_keyboard_shortcut, "CTRL+3");
		
		onVerbose("getarchive.js getarchive_archiveis_keyboard_shortcut " + result.getarchive_archiveis_keyboard_shortcut);
		getarchive_archiveis_keyboard_shortcut = valueOrDefault(result.getarchive_archiveis_keyboard_shortcut, "CTRL+4");
		
		onVerbose("getarchive.js getarchive_webcitation_keyboard_shortcut " + result.getarchive_webcitation_keyboard_shortcut);
		getarchive_webcitation_keyboard_shortcut = valueOrDefault(result.getarchive_webcitation_keyboard_shortcut, "CTRL+5");
		
		onVerbose("getarchive.js getarchive_googlecache_keyboard_shortcut " + result.getarchive_googlecache_keyboard_shortcut);
		getarchive_googlecache_keyboard_shortcut = valueOrDefault(result.getarchive_googlecache_keyboard_shortcut, "CTRL+6");
		
	}).catch(console.error);
	
}
init();

function onDebug(info){
	sendMessage("onDebug", "getarchive.js " + info);
}

function onVerbose(info){
	sendMessage("onVerbose", info);
}

var getarchive = {
	getPageLocation: function(){
		// this should only work on talk pages -> ca-talk with class selected indicates this is a talk page
		var talkPageObject=document.getElementById("ca-talk");
		var pageLocation = "NONE";
		
		if(talkPageObject != null && talkPageObject != undefined){
			if(talkPageObject.getAttribute("class") == "selected"){
				return pageLocation; // archive.is is fooling us, this is not a talk page
			}
		}

		contentText = document.getElementById("mw-content-text").innerHTML;
		if(contentText != undefined){
			var count = contentText.match(/mw-headline/g).length;
			try {
				var countDodeLink = contentText.match(/id=\"Dode_/g).length;
			}
			catch(err){
				var countDodeLink = 0;
			}
			try {
				var countLinks = contentText.match(/external/g).length;
			}catch(err){
				var countLinks = 0;
			}

			if (countDodeLink == 1 && (count == 1 || count == undefined || countLinks == 1)){
				var startExternalLink = contentText.indexOf("external free");
				var endExternalLink = contentText.indexOf(">",startExternalLink);
				pageLocation = contentText.substring(startExternalLink + 21, endExternalLink - 1);
			}else{
				if(countDodeLink == 1 && countLinks > 1){
					var startHeadline = contentText.indexOf("\"Dode_");
					var startExternalLink = contentText.indexOf("external free", startHeadline)
					var endExternalLink = contentText.indexOf(">",startExternalLink);
					pageLocation = contentText.substring(startExternalLink + 21, endExternalLink - 1);
				}
			}
		}else{
			return pageLoccopyation;
		}
		
		return pageLocation.split('amp;').join('');
	},
	getContentText: function(){
		contentText = "";
		try{
			contentText = document.body.textContent;
		}catch(err){}
		return contentText;
	},
	isUrlValid: function(){
		// Checks if page is valid. Used to stop the counter on invalid pages.
		
		try{
			var documentTitleLower = document.title.toLowerCase();
			var contentText = this.getContentText();
			var contentTextLower = contentText.toLowerCase();
			
			//console.log("isUrlValid documentTitle is " + documentTitleLower);
			
			var invalidTitles = ["404 Not Found", "page not found", "cannot be found", "object not found", "error", "403 Forbidden", "seite nicht gefunden", "500 Internal Server Error", "IIS 8.5 Detailed Error", "404 - File or directory not found.", "Fehler 404", "Impossibile trovare la pagina", "Erreur 404", "Internet Archive Wayback Machine", "Wayback Machine", "Pagina non trovata", "Connection timed out", "Domain Default page", "Object niet gevonden!", "Pagina não econtrada", "File not found", "Pagina niet gevonden", "Seite wurde nicht gefunden", "Nothing found", "can't be found", "502 Bad Gateway", "Side ikke fundet", "Seite nicht Verfügbar", "Fant ikke siden", "403 - Forbidden: Access is denied.", "410 Gone", "Bad Request"];
			
			for(let i in invalidTitles){
				if(documentTitleLower.indexOf(invalidTitles[i].toLowerCase()) > -1){
					//console.log("isUrlValid Invalid title " + invalidTitles[i]);
					return false;
				}
			}
			
			if(documentTitleLower.indexOf("404") == 0){
				//console.log("isUrlValid 404 page");
				return false;
			}
			
			if(documentTitleLower == ""){
				//console.log("isUrlValid No title");
				return false;
			}
			
			// errorBorder = unknown archive.org error
			var invalidContent = ["Wayback Machine doesn't have that page archived.", "The machine that serves this file is down. We're working on it.", "errorBorder", "404 - File or directory not found.", "404 Not Found", "An error occurred", "cannot be found", "page not found", "buy this domain", "Artikel niet gevonden", "503 Service Unavailable", "504 Gateway Time-out", "Error 522", "DB Connection failed", "koop dit domein", "page can’t be found", "Page Unavailable"];
			
			for(let i in invalidContent){
				if(contentTextLower.indexOf(invalidContent[i].toLowerCase()) > -1){
					//console.log("Invalid content " + invalidContent[i]);
					return false;
				}
			}
			
			// fix https://www.w3.org/TR/uievents/ opens in the current tab, not in a new tab
			var invalidContentCase = ["Not Found", "NOT FOUND", "Not found"]
			for(let i in invalidContentCase){
				if(contentText.indexOf(invalidContentCase[i]) > -1){
					//console.log("Invalid content case " + invalidContentCase[i]);
					return false;
				}
			}
		}catch(ex){
			//console.log("isUrlValid Error while checking");
			//console.log(ex);
		}
		return true;
	},
	getUrlToCopy: function(){
		var urlToCopy = window.location.href;
		if((window.location.href.indexOf("archive.is") > -1 || window.location.href.indexOf("archive.li") > -1) && getarchive_prefer_long_link == true && window.location.href.indexOf("/image") == -1 && window.location.href.length < 35){
			try{
				urlToCopy = window.document.getElementById("SHARE_LONGLINK").getAttribute("value");
				https://archive.is/2012.05.30-154426/http://www.nieuwsblad.be/Article/Detail.aspx?ref=dg&articleID=gh53q184
				
				var urlArchiveIsSplit = urlToCopy.lastIndexOf("/", urlToCopy.indexOf("://", 15));
				var basePart = "https://archive.is/";
				var datePart = urlToCopy.substring(0, urlArchiveIsSplit).replace("https://archive.is/", "").replace("http://archive.is/", "");
				var urlPart = urlToCopy.substring(urlArchiveIsSplit);

				datePart = datePart.replace(".", "").replace(".", "").replace("-", "");
				urlToCopy = basePart + datePart + urlPart;
				
				sendMessage("addUrlToHistory", urlToCopy);
			}catch(ex){
				//console.log("getUrlToCopy: elementbyid is null");
			}
		}
		//console.log("getUrlToCopy: urlToCopy is " + urlToCopy);
		return urlToCopy;
	},
	copyToClipboard: function(text){
		try{
			//console.log("copyToClipboard for text " + text);
			if(text.indexOf(":80") > -1){
				text = text.replace(":80", ""); // archive.org
				sendMessage("addUrlToHistory", text);
			}
			
			var el = document.querySelector("head");
			if(document.activeElement != null){
				el = document.activeElement;
			}
			var input = document.createElement("input");
			input.setAttribute("type", "text");
			
			// Most Firefox versions do not support copying from display:none input fields
			input.setAttribute("style", "width: 0px");
			
			el.appendChild(input);
			input.setAttribute("value", text);

			input.select();
			document.execCommand("Copy");
			//console.log("copyToClipboard Copied..");
						
			// Cleanup later to support Firefox 54 and lower
			setTimeout(function(){
				// TODO: go to the previous element here
				el.removeChild(input);
			}, 1000);

			sendMessage("notify", { message: getarchive.urldecode(text), title: "Copied URL to clipboard"});
			return true;
		}catch(e){
			//console.log("copyToClipboard failed. Exception:");
			//console.log(e);
			return false;
		}
	},
	getLocationFromPage: function(){
		// get URL from HTML
		var pageLocation = "";
		
		if(window.location.href.indexOf("archive.today") > -1 || window.location.href.indexOf("archive.is") > -1 || window.location.href.indexOf("archive.li") > -1){
			var inputElements = document.body.getElementsByTagName("input");
			for (i = 0; i < inputElements.length; i++) {
				var contentText = this.getInnerBody();
				var redirectedFromPos = contentText.indexOf("Redirected from");
				
				if(redirectedFromPos > -1){ // prefer "Redirected from"
					var httpPos = contentText.indexOf("http", redirectedFromPos);
					var httpPosEnd = contentText.indexOf("\"", httpPos);
					pageLocation = contentText.substring(httpPos, httpPosEnd);
				}
				
				if(inputElements[i].getAttribute("name") == "q" && pageLocation == ""){ // q can occur multiple times
					pageLocation = shared.getPartialUrl(inputElements[i].getAttribute("value"));
				}
			}
		}
		return pageLocation;
	},
	getGenericLink: function(website, contextLinkUrl, isContextMenu){
		var currentLocation=window.location.href;
		var pageLocation = "";
		var baseUrl = "";
		
		switch(website){
			case "archive.org":
				baseUrl = "https://web.archive.org/web/2005/";
				break;
			case "archive.is":
				baseUrl = "https://archive.is/";
				break;
			case "webcitation.org":
				baseUrl = "http://webcitation.org/query?url=";
				break;
			case "webcache.googleusercontent.com":
				baseUrl = "http://webcache.googleusercontent.com/search?q=cache%3A";
				break;
		}
		//console.log("getGenericLink baseUrl is " + baseUrl);
		sendMessage("updateGlobalArchiveService", website);
		
		if(contextLinkUrl != null){
			pageLocation = contextLinkUrl;
			//console.log("getGenericLink pageLocation is " + pageLocation);
		}

		if(!isContextMenu){
			if(website == "archive.is" && (currentLocation.indexOf("archive.is") > -1 || currentLocation.indexOf("archive.li") > -1)){
				// Intended to stop automatic forwarding etc
				if(document.title.indexOf(":") == -1 && document.title != "" && !isContextMenu){
					//console.log("getGenericLink taking early exit 1");
					return; // no need for this
				}
				
				if(document.title.indexOf(":") == -1 && document.title != "" && isContextMenu){
					//console.log("getGenericLink taking early exit 2");
					return; // no need for this
				}
				
				/*if(this.isUrlValid() == false){
					//console.log("getGenericLink taking early exit 3");
					return; // no need for this
				}*/

				// http://archive.is/http://link-to.url/page -> http://archive.is/ixIyjm
				var thumbsBlocks = document.getElementsByClassName("THUMBS-BLOCK");
				if(thumbsBlocks.length != 0){
					linkToPage = thumbsBlocks[0].getElementsByTagName("a")[0].getAttribute("href");
					//console.log("getGenericLink changeUrl to linkToPage which is " + linkToPage);
					sendMessage("changeUrl", linkToPage);
					return;
				}	
			}
		}

		function isMatch(locationString){
			var match = locationString.indexOf("web.archive.org/web/") > -1 || locationString.indexOf("web.archive.org/save/_embed/") > -1 || locationString.indexOf("webcitation.org/query?url=") > -1 || locationString.indexOf("webcache.googleusercontent.com") > -1 || (locationString.indexOf("archive.is") && isContextMenu);
			//console.log("isMatch: match is " + match);
			return match;
		}

		if(isMatch(contextLinkUrl)){
			if(contextLinkUrl.indexOf("http", 20) > -1 || contextLinkUrl.indexOf("www", 20) > -1 || contextLinkUrl.indexOf("ftp", 20) > -1){
				//console.log("getGenericLink we have some kind of filled in link");
				//console.log("getGenericLink after cleaning: " + this.cleanurl(shared.getPartialUrl(contextLinkUrl)));
				
				var currentAction = "openFocusedTab";
				if(!isContextMenu && isMatch(currentLocation)){
					currentAction = "changeUrl";
				}
				sendMessage(currentAction, baseUrl + this.cleanurl(shared.getPartialUrl(contextLinkUrl)));
				return;
			}else{
				//console.log("oei das ni het geval");
			}
		}
			
		// get URL from HTML
		if(contextLinkUrl.indexOf("/o/") > -1){
			var locationO = contextLinkUrl.indexOf("/o/");
			var locationBegin = contextLinkUrl.indexOf("/", locationO + 4);
			pageLocationTemp = contextLinkUrl.substring(locationBegin + 1);
			if(pageLocationTemp.indexOf("://") == -1){
				pageLocationTemp = "http://" + pageLocationTemp;
			}
			pageLocation = pageLocationTemp;
		}
		
		if(!isContextMenu){
			var linkToPage = this.getLocationFromPage(); // returns non-empty string on archive.is
			if(linkToPage != ""){
				//console.log("getGenericLink non-empty string " + linkToPage + " assigned to pageLocation");
				pageLocation = linkToPage;
			}
		}
		
		if(currentLocation.indexOf("Overleg:") > -1){
			temp = this.getPageLocation();
			if (temp != "" && temp != "NONE"){ //TODO: check this
				pageLocation = temp;
			}
		}
		if(pageLocation.indexOf("http://web.archive.org/") == 0 || pageLocation.indexOf("https://web.archive.org/") == 0){
			pageLocation = pageLocation.replace("http://web.archive.org/", "https://web.archive.org/"); // make HTTPS
			//console.log("getGenericLink archive.org hit");
			//sendMessage("changeUrl", baseUrl + this.cleanurl(shared.getPartialUrl(pageLocation)));
			sendMessage("changeUrl", this.cleanurl(pageLocation));
			return;
		}
		
		// Always include protocol, the simplest way is to get this from the JavaScript input element
		var wmtbURL = document.getElementById("wmtbURL");
		if(currentLocation.indexOf("web.archive.org") > -1 && wmtbURL != null){
			pageLocation = wmtbURL.value;
		}
		// 
		if(pageLocation != "" && currentLocation.indexOf("webcitation.org") == -1 && currentLocation.indexOf("archive.is") == -1 && currentLocation.indexOf("archive.li") == -1 && currentLocation.indexOf("web.archive.org") == -1){
			// right click / action-submit / action-edit
			var currentAction = "openFocusedTab";
			
			if(this.isUrlValid() == false){
				currentAction = "changeUrl";
			}
						
			try{
				sendMessage(currentAction, baseUrl+decodeURIComponent(this.cleanurl(pageLocation)));
			}catch(err){
				sendMessage(currentAction, baseUrl+this.cleanurl(pageLocation));
			}
		}else{
			if(currentLocation.indexOf("Overleg:") == -1){
			    if(pageLocation == "") // seems to work
					pageLocation = window.location.href;
				pageLocation = shared.getPartialUrl(pageLocation);
				sendMessage("changeUrl", baseUrl+this.cleanurl(pageLocation));
			}
		}
	},
	urldecode: function(encoded){
		// http://stackoverflow.com/questions/4292914/javascript-url-decode-function
		encoded=encoded.replace(/\+/g, '%20');
		var str=encoded.split("%");
		var cval=str[0];
		for (var i=1;i<str.length;i++)
		{
			cval+=String.fromCharCode(parseInt(str[i].substring(0,2),16))+str[i].substring(2);
		}

		return cval;
	},
	goSearch: function(){
		var currentLocation=window.location.href;
		
		currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");
		currentLocation = currentLocation.replace("http://archive.li/", "");
		currentLocation = currentLocation.replace("https://archive.li/", "");
		currentLocation = currentLocation.replace("http://webcitation.org/query?url=", "");
		if(currentLocation.indexOf("&oq=cache:") > -1){
			currentLocation = currentLocation.substring(0, currentLocation.indexOf("&oq=cache:"));
		}
		
		var helplink = document.getElementById("mw-indicator-mw-helplink");
		if(helplink != null && helplink.innerHTML.indexOf("Help:Linksearch") > -1){
			var indexOfTarget = currentLocation.indexOf("&target=");
			currentLocation = currentLocation.substring(indexOfTarget + 8);
			currentLocation = decodeURIComponent(currentLocation);
			getarchive.doSearch(currentLocation, false);
			return;
		}
				
		var indexHttp = currentLocation.indexOf("http", 20);
		if(indexHttp > -1){
			currentLocation = currentLocation.substring(indexHttp);
		}

		var linkToPage = this.getLocationFromPage(); //archive.is
		if(linkToPage != ""){
			currentLocation = linkToPage;
		}
		
		if(currentLocation.indexOf(".pdf") == -1){
			currentLocation = currentLocation.replace(/\_/g, ' ');
			currentLocation = currentLocation.replace(/\-/g, ' ');
		}else{
			// PDF
			var lastSlash = currentLocation.lastIndexOf("/");
			currentLocation = "site:" + getarchive.getHostName(currentLocation) + " " + currentLocation.substring(lastSlash + 1);
		}
		
		if(currentLocation.indexOf("nu.nl") > -1){
			var lastSlash = currentLocation.lastIndexOf("/");
			var html = currentLocation.indexOf(".html");
			currentLocation = currentLocation.substring(lastSlash + 1, html);
			currentLocation = this.urldecode(currentLocation);
		}
		
		/* from one search engine to another */
		var hostname = getarchive.getHostName(currentLocation);
		hostname = hostname.substring(0, hostname.indexOf("."));

		onVerbose("hostname is " + hostname);
		switch(hostname){
			case "google":
				currentLocation = document.getElementById("lst-ib").value;
				break;
			case "duckduckgo":
				currentLocation = document.getElementById("search_form_input").value;
				 break;
			case "ecosia":
				currentLocation = document.getElementById("searchInput").value;
				break;
			default:
				var startOfSearchEngineName = document.title.lastIndexOf(" -");
				var matchObject = document.body.innerHTML.match(/search/g);
				if(matchObject != null && matchObject.length > 20){ //isSearchPage
				var currentTitleLower = document.title.toLowerCase();
					if(startOfSearchEngineName > -1){
						if(currentTitleLower.indexOf(hostname) > -1){
							currentLocation = document.title.substring(0, currentTitleLower.indexOf(hostname) - 2);
						}
					}
				}
				break;
		}
		getarchive.doSearch(currentLocation, true);
	},
	doSearch: function(currentLocation,safe){
		onDebug("doing search for " + currentLocation);
		switch(getarchive_search_engine){
			case "duckduckgo":
				currentLocation = "https://duckduckgo.com/?q=" + currentLocation; break;
			case "google":
				currentLocation = "https://google.com/search?q=" + currentLocation; break;
			case "bing":
				currentLocation = "https://bing.com/search?q=" + currentLocation; break;
			default:
				break;
		}
		
		if(window.location.href.indexOf("wiki") == -1){
			// We do not use changeUrl here because we don't need to copy the search results URL
			window.location.href = currentLocation;
		}else if(!safe){
			sendMessage("openFocusedTab", currentLocation); // for LinkSearch only
		}
	},
	getHostName: function(currentLocation){
		var getLocation = function(href) {
			var l = document.createElement("a");
			l.href = href;
			return l;
		};
		var l = getLocation(currentLocation);
		var hostname = l.hostname;
		
		if(hostname.indexOf(".") < hostname.lastIndexOf(".")){
			// two or more dots
			if(hostname.indexOf(".") < 6){ /* (hostname.length / 2) */
				hostname = hostname.substring(hostname.indexOf(".") + 1);
			}
		}

		return hostname;
	},
	insertAtCursor: function(myField, myValue) {
		if(myField == undefined)
			return; // please try again
		
		if (myField.selectionStart || myField.selectionStart == '0') {
			var startPos = myField.selectionStart;
			var endPos = myField.selectionEnd;
			myField.value = myField.value.substring(0, startPos)
				+ myValue
				+ myField.value.substring(endPos, myField.value.length);
		} else {
			myField.value += myValue;
		}
	},
	pastecomment: function(previouslyActiveElement, clipboardText){
		// paste with <!-- Archieflink: --> on nl.wikipedia.org and normal on other websites
		// document.execCommand("paste") is not used because we're not in an event listener
		// even if we were in an event listener, paste only works for textareas (state 2017-02-15) and not for other input elements
		// since we've removed the dummy element to read from the clipboard (see event handler at the bottom of this file) we must pass the element which was previously selected (document.activeElement is null)
		var returnValue = clipboardText;
		
		if(clipboardText != ""){
			//var cursorPosition = getCursorPos(previouslyActiveElement);
			
			//console.log("clipboardText is " + clipboardText);
			if(window.location.href.indexOf("nl.wikipedia.org") > -1){
				if(clipboardText.indexOf("http", 20) > -1){
					//console.log("pastecomment - <!-- Archieflink -->");
					returnValue = "<!-- Archieflink: " + clipboardText + " -->";
					this.insertAtCursor(previouslyActiveElement, returnValue);
				}else{
					//console.log("pastecomment - <!-- Actuele link -->");
					returnValue = "<!-- Actuele link: " + clipboardText + " -->";
					this.insertAtCursor(previouslyActiveElement, returnValue);
				}
			}else{
				//console.log("pastecomment branch2 - <!-- Archieflink -->");
				this.insertAtCursor(previouslyActiveElement, clipboardText);
			}
			
			//setCursorPos(previouslyActiveElement, cursorPosition, cursorPosition);
		}
		
		return returnValue;
	},
	getInnerBody: function(){
		if(document.body == null) return "";
		return document.body.innerHTML;
	},
	cleanurl: function(url){
		if(url == undefined){
			sendMessage("notify", "Try reloading the page");
			return "";
		}
		if(url.indexOf("[") == 0){
			url = url.substring(1);
		}
		if(url.indexOf("=") == 0){
			url = url.substring(1);
		}
		if(url.indexOf("ttp") == 0 && url.indexOf("://") > -1){
			url = "h" + url;
		}
		if(url.indexOf("tp") == 0 && url.indexOf("://") > -1){
			url = "ht" + url;
		}
		
		return url.trim();
	},
	copyUrlToClipboard: function(onlyValidPages, url, title, tabId){
		var urlToCopy = getarchive.getUrlToCopy();
		var documentTitle = document.title;
				
		if(url != null){
			//console.log("copyUrlToClipboard - url is not null: " + url);
			if(url.length < 25 && url.indexOf("archive.is") > -1 && url == window.location.href){
				// Ignore the URL parameter. It contains something like https://archive.is/eiE5j
				// Prefer the long format, or the short if set in the options
				// This long or short format was generated by getUrlToCopy
			}else{
				// Prefer the passed URL
				urlToCopy = url;
			}
		}
			
		if(title != null)
			documentTitle = title;
		
		if(getarchive_lastcopy == urlToCopy){
			return;
		}
		
		this.getarchive_lastcopy = urlToCopy;
		
		if(url == null || window.location.href == url){
			if(onlyValidPages == true && this.isUrlValid() == false){
				return;
			}
		}
		
		if(this.copyToClipboard(urlToCopy) == true && documentTitle.indexOf("+") != 0){
			if(url == null){
				var titleX = document.title;
				if(titleX == "")
					titleX = window.location.href;
				document.title = "+" + titleX;
				
				setTimeout(function(){
					if(document.title.indexOf("+") != 0){
						var titleX = document.title;
						if(titleX == "")
							titleX = window.location.href;
						document.title = "+" + titleX;
					}
				}, 2500);
			}else{
				sendMessage("updateTabTitle", {tabId: tabId, title: "+" + documentTitle});
			}
		}
	},
	getContextLinkUrl: function(archive_service){
		var contextLinkUrl = "";
		var isContextMenu = true;
		
		var selection = window.getSelection().toString();
		if(selection != null && selection != "")
			contextLinkUrl = selection;
			
		var pageLocation = window.location.href;
		if(pageLocation != null && pageLocation != ""){
			contextLinkUrl = pageLocation;
			isContextMenu = false;
		}
		
		// https://web.archive.org/web/2005/http://wii.nintendo.nl/13470.html -> click toolbar button.
		//console.log("lastIndexOf is " + contextLinkUrl.lastIndexOf("://"));
		if(contextLinkUrl.lastIndexOf("://") > 20){
			//console.log("contextLinkUrl is now " + contextLinkUrl);
			contextLinkUrl = shared.getPartialUrl(contextLinkUrl);
		}
		
		var archiveServiceLocal = archive_service;
		if(archiveServiceLocal == "")
			archiveServiceLocal = getarchive_default_archive_service;
		
		sendMessage("setContextLinkUrl", {contextLinkUrl: contextLinkUrl, archiveService: archiveServiceLocal, isContextMenu: isContextMenu});
	},
	getSelectionHtml: function() {
		// http://stackoverflow.com/questions/5643635/how-to-get-selected-html-text-with-javascript
		var html = "";
		var urls = new Array();
		
		if (typeof window.getSelection != "undefined") {
			var sel = window.getSelection();
			if (sel.rangeCount) {
				var container = document.createElement("div");
				for (var i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				html = container.innerHTML;
			}
		} else if (typeof document.selection != "undefined") {
			if (document.selection.type == "Text") {
				html = document.selection.createRange().htmlText;
			}
		}
		
		let parser = new DOMParser();
		let doc = parser.parseFromString("<div>" + html + "</div>", "text/html");
		let tags = doc.getElementsByTagName("a");
		for(let item in tags){
			if(tags[item].hasAttribute != null){
				if(tags[item].hasAttribute("href")){
					var href = tags[item].getAttribute("href");
					if(href.indexOf("#") == 0){
						continue;
					}
					if(href.indexOf("/") == 0){
						// Append hostname from current website to make relative URL absolute
						href = window.location.protocol + "//" + window.location.host + href;
					}
					if(href.indexOf("://") > -1){
						// No JavaScript links
						urls.push(href);
					}
				}
			}
		}	
		urls = getarchive.uniq(urls);
		
		return urls;
	},
	uniq: function(a){
		return a.sort().filter(function(item, pos, ary) {
			return !pos || item != ary[pos - 1];
		})
	},
	insertText: function(previouslyActiveElement, clipboardText){
		this.insertAtCursor(previouslyActiveElement, clipboardText);
	},
	isCopySafe: function(){
		var frameIdentifiers = ["iframe", "frame"];
		var i = 0;
		
		// Test URL: http://web.archive.org/web/20060504004551/http://www.beastiemuseum.com/
		if(getarchive.getInnerBody().indexOf("<frame") > -1){
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
								return false;
							}
						}catch(ex){
							if(frame.getAttribute("src").indexOf("google") == -1){
								//console.log("CROSS-DOMAIN IFRAME on URL " + frame.getAttribute("src"));
							}
						}
					}
				}
			}
		}else{
			//console.log("skipped");
		}
		return true;
	}
}

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented)
		return;
	
	var clipboardText = "";
		
	if((event.keyCode == 45 || event.keyCode == 19) && !insertOrPauseLocked){
		var previouslyActiveElement = document.activeElement;
		var scrollbarTop = previouslyActiveElement.scrollTop;
		
		var caretPos = 0;
		if (previouslyActiveElement.selectionStart || previouslyActiveElement.selectionStart == '0')
			caretPos = previouslyActiveElement.selectionStart;
		
		//console.log("caretPos is " + caretPos);
		var length = previouslyActiveElement.innerHTML.length || previouslyActiveElement.value.length;
		//console.log("length is " + length);
		
		insertOrPauseLocked = true;
		
		var input = document.createElement("textarea");
		input.setAttribute("contenteditable", "true");
		previouslyActiveElement.parentElement.appendChild(input);

		input.focus();
		document.execCommand("Paste");
		clipboardText = input.textContent;
		//console.log("clipboard read resulted in " + clipboardText);
		
		// Cleanup
		previouslyActiveElement.parentElement.removeChild(input);	
	}
	
	if(event.keyCode == 45 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		// insert
		event.preventDefault();
		//console.log("INSERT EVENT!");
		getarchive.insertText(previouslyActiveElement, clipboardText);
	}
	
	if(event.keyCode == 19 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		// pause/break
		event.preventDefault();
		//console.log("PAUSE EVENT!");
		clipboardText = getarchive.pastecomment(previouslyActiveElement, clipboardText);
	}
	
	if(event.keyCode == 45 || event.keyCode == 19){
		if(caretPos != 0)
			caretPos += clipboardText.length;
						
		previouslyActiveElement.focus();
		
		setTimeout(function(){
			previouslyActiveElement.setSelectionRange(caretPos, caretPos);
			if(scrollbarTop != null && scrollbarTop != undefined){
				previouslyActiveElement.scrollTop = scrollbarTop;
			}
			insertOrPauseLocked = false;
		}, 25);
		
		setTimeout(function(){
			insertOrPauseLocked = false;
		}, 100);
	}
	
	var activeElementToLower = document.activeElement.tagName.toLowerCase();
	if(getarchive_require_focus && (activeElementToLower == "textarea" || activeElementToLower == "input")){
		return;
	}

	if(window.getSelection().toString().length != 0){
		return;
	}
	
	keyutils.parseKeyboardShortcut(getarchive_archiveorg_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_archiveorg_keyboard_shortcut");
		getarchive.getContextLinkUrl("archive.org");
	}, true);
	
	keyutils.parseKeyboardShortcut(getarchive_archiveis_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_archiveis_keyboard_shortcut");
		getarchive.getContextLinkUrl("archive.is");
	}, true);
	
	keyutils.parseKeyboardShortcut(getarchive_webcitation_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_webcitation_keyboard_shortcut");
		getarchive.getContextLinkUrl("webcitation.org");
	}, true);
	
	keyutils.parseKeyboardShortcut(getarchive_googlecache_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_googlecache_keyboard_shortcut");
		getarchive.getContextLinkUrl("webcache.googleusercontent.com");
	}, true);
	
	// key 3 => keycode 99
	keyutils.parseKeyboardShortcut("3", event, function(result){
		//if(event.keyCode == 99 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
			event.preventDefault();
			//console.log("KEY 3 EVENT!");
			getarchive.getContextLinkUrl("archive.org");
		//}
	}, true);
	
	// key 4 => keycode 100
	keyutils.parseKeyboardShortcut("4", event, function(result){
	//if(event.keyCode == 100 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY 4 EVENT!");
		getarchive.getContextLinkUrl("archive.is");
	}, true);
	
	// key 5 => keycode 101
	keyutils.parseKeyboardShortcut("5", event, function(result){
	//if(event.keyCode == 101 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY 5 EVENT!");
		getarchive.getContextLinkUrl("webcitation.org");
	}, true);
	
	// key 6 => keycode 102
	keyutils.parseKeyboardShortcut("6", event, function(result){
	//if(event.keyCode == 102 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY 6 EVENT!");
		getarchive.getContextLinkUrl("webcache.googleusercontent.com");
	}, true);
	
	// key 3 azerty => keycode 51
	keyutils.parseKeyboardShortcut("\"", event, function(result){
	//if(event.keyCode == 51 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		//console.log("KEY 3 AZERTY EVENT!");
		getarchive.getContextLinkUrl("archive.org");
	}, true);
	
	// key 4 azerty => keycode 52
	keyutils.parseKeyboardShortcut("'", event, function(result){
	//if(event.keyCode == 52 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY 4 AZERTY EVENT!");
		getarchive.getContextLinkUrl("archive.org");
	}, true);
	
	// key 5 azerty => keycode 53
	keyutils.parseKeyboardShortcut("(", event, function(result){
	//if(event.keyCode == 53 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY 5 AZERTY EVENT!");
		getarchive.getContextLinkUrl("webcitation.org");
	}, true);
	
	// key 6 azerty => keycode 54
	keyutils.parseKeyboardShortcut("§", event, function(result){
	//if(event.keyCode == 54 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY 6 AZERTY EVENT!");
		getarchive.getContextLinkUrl("webcache.googleusercontent.com");
	}, true);
	
	// key g => keycode 71
	keyutils.parseKeyboardShortcut("g", event, function(result){
	//if(event.keyCode == 71 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY G SEARCH EVENT!");
		getarchive.goSearch();
	}, true);
	
	// key x => keycode 88
	keyutils.parseKeyboardShortcut("x", event, function(result){
	//if(event.keyCode == 88 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY X CLOSE TAB EVENT!");
		sendMessage("closeTab");
	}, true);
	
	// key c => keycode 67
	if(window.location.href.indexOf("archive.org") > -1 || window.location.href.indexOf("archive.is") > -1 || window.location.href.indexOf("archive.li") > -1){
		keyutils.parseKeyboardShortcut("c", event, function(result){
		//if(event.keyCode == 67 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
			event.preventDefault();
			//console.log("KEY C COPY URL EVENT!");
			if(getarchive.isCopySafe()){
				origin = "user";
				getarchive.copyUrlToClipboard(false);
				origin = "code";
				sendMessage("closeTab");
			}
		}, true);
	}
	
	// key Alt+L => keycode 76
	keyutils.parseKeyboardShortcut("Alt+L", event, function(result){
	//if(event.keyCode == 76 && !event.shiftKey && !event.ctrlKey && event.altKey && !event.metaKey){
		event.preventDefault();
		//console.log("KEY L OPEN VERWIJZINGENZOEKEN");
		window.location.href = "https://nl.wikipedia.org/w/index.php?title=Special%3ALinkSearch&target=" + window.location.href;
	}, true);
	
	if (event.keyCode == 67 && !event.shiftKey && event.ctrlKey && !event.altKey && !event.metaKey) {
		if(!getarchive_enable_ctrl_c){
			return;
		}
		
		if(!getarchive.isCopySafe()){
			return;
		}
		
		//console.log("activeElement is " + document.activeElement.tagName.toLowerCase());

		origin = "user";
		getarchive.copyUrlToClipboard(false); // false = do not check for invalid pages, just copy the current URL
		origin = "code";
	
		// don't allow for double actions for a single event
		event.preventDefault();
		return;
	}
}, true);
