/// Global variables
var getarchive_lastcopy = "";
//var clipboardText = "";

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
		case "copyCurrentUrlToClipboard": 
			getarchive.copyCurrentUrlToClipboard(true);
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
			getarchive.getGenericLink(message.data.archiveService, message.data.contextLinkUrl);
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
		getarchive_require_focus = valueOrDefault(result.getarchive_default_archive_service, "archive.org");
		
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
	getcontenttext: function(){
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
			var contentTextLower = this.getcontenttext().toLowerCase();
			
			onDebug("documentTitle is " + documentTitleLower);
			
			var invalidTitles = ["404 Not Found", "page not found", "cannot be found", "object not found", "error", "403 Forbidden", "seite nicht gefunden", "500 Internal Server Error", "IIS 8.5 Detailed Error", "404 - File or directory not found.", "Fehler 404", "Impossibile trovare la pagina", "Erreur 404", "internet archive wayback machine", "Pagina non trovata", "Connection timed out"];
			for(let i in invalidTitles){
				if(documentTitleLower.indexOf(invalidTitles[i].toLowerCase()) > -1) return false;
			}
						
			// errorBorder = unknown archive.org error
			var invalidContent = ["Wayback Machine doesn't have that page archived.", "The machine that serves this file is down. We're working on it.", "errorBorder", "404 - File or directory not found.", "404 Not Found", "An error occurred", "cannot be found", "page not found", "buy this domain", "Not Found", "Artikel niet gevonden", "503 Service Unavailable", "504 Gateway Time-out", "Error 522", "DB Connection failed"];
			for(let i in invalidContent){
				if(contentTextLower.indexOf(invalidContent[i].toLowerCase()) > -1) return false;
			}
		}catch(ex){
			onDebug("Error while checking isUrlValid");
			onDebug(ex);
		}
		return true;
	},
	getUrlToCopy: function(){
		var urlToCopy = window.location.href;
		if((window.location.href.indexOf("archive.is") > -1 || window.location.href.indexOf("archive.li") > -1) && getarchive_prefer_long_link == true && window.location.href.indexOf("/image") == -1 && window.location.href.length < 35){
			try{
				urlToCopy = window.document.getElementById("SHARE_LONGLINK").getAttribute("value");
				urlToCopy = urlToCopy.replace("http://", "https://");
				sendMessage("addUrlToHistory", urlToCopy);
			}catch(ex){
				onDebug("getUrlToCopy: elementbyid is null");
			}
		}
		onDebug("getUrlToCopy: urlToCopy is " + urlToCopy);
		return urlToCopy;
	},
	copyToClipboard: function(text){
		try{
			onDebug("copyToClipboard for text " + text);
			
			var el = document.querySelector("html");
			if(document.activeElement != null){
				el = document.activeElement;
			}
			var input = document.createElement("input");
			input.setAttribute("type", "text");
			el.appendChild(input);

			input.setAttribute("value", text);
			input.select();
			document.execCommand("Copy");
			onDebug("copyToClipboard Copied..");
			
			// Cleanup
			el.removeChild(input);
			sendMessage("notify", { message: getarchive.urldecode(text), title: "Copied URL to clipboard"});
			return true;
		}catch(e){
			onDebug("copyToClipboard failed. Exception:");
			onDebug(e);
			return false;
		}
	},
	getPartialUrl: function(fullUrl){
		onDebug("getPartialUrl for " + fullUrl);
		
		var locationHttp = fullUrl.indexOf("://", 20); // second occurence
		var locationWww = fullUrl.indexOf("www.", 20); // second occurence
		var locationFtp = fullUrl.indexOf("ftp://", 20); // second occurence
		var locationHttpStart = -1;
		var locationWwwStart = -1;
		var locationFtpStart = -1;
		var result = fullUrl;
		
		if(locationHttp > 1){
			locationHttpStart = fullUrl.indexOf("http", locationHttp - 6);
			result = fullUrl.substring(locationHttpStart);
		}
		
		if(locationWww > 1){
			// Test URL: https://web.archive.org/web/20071211165438/www.cph.rcm.ac.uk/Tour/Pages/Lazarus.htm
			locationWwwStart = locationWww;
			result = "http://" + fullUrl.substring(locationWwwStart); // Most pages in the archive will be HTTP, not HTTPS
		}
			
		if(locationFtp > 1){
			locationFtpStart = locationFtp;
			result = fullUrl.substring(locationFtpStart);
		}
		
		onDebug("getPartialUrl result is " + result);
		
		return result;
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
					pageLocation = this.getPartialUrl(inputElements[i].getAttribute("value"));
				}
			}
		}
		return pageLocation;
	},
	getGenericLink: function(website, contextLinkUrl){
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
				baseUrl = "http://webcache.googleusercontent.com/search?safe=off&site=&source=hp&q=cache%3A";
				break;
		}
		onDebug("getGenericLink baseUrl is " + baseUrl);
		sendMessage("updateGlobalArchiveService", website);
		
		if(contextLinkUrl != null){
			pageLocation = contextLinkUrl;
			onDebug("getGenericLink pageLocation is " + pageLocation);
		}

		if(website == "archive.is"){
			if(currentLocation.indexOf("archive.is") > -1 || currentLocation.indexOf("archive.li") > -1){
				/*if(this.getcontenttext().indexOf("No results") > -1){ //  || this.getcontenttext().indexOf("code 404") > -1 || this.getcontenttext().indexOf("code 403") > -1
					onDebug("getGenericLink taking early exit");
					console.log(this.getcontenttext());
					return; // no need for this
				}*/
				if(document.title.indexOf(":") == -1 && document.title != ""){
					onDebug("getGenericLink taking early exit");
					return; // no need for this
				}
				
				if(this.isUrlValid() == false){
					onDebug("getGenericLink taking early exit 2");
					return; // no need for this
				}
				
				/*if(this.getcontenttext().indexOf("List of URLs, ordered from newer to older") == -1){
					onDebug("getGenericLink taking early exit");
					return; // no need for this
				}*/
			}
			
			// http://archive.is/http://link-to.url/page -> http://archive.is/ixIyjm
			if(currentLocation.indexOf("archive.today") > -1 || currentLocation.indexOf("archive.is") > -1 || currentLocation.indexOf("archive.li") > -1){
				try{
					linkToPage = document.getElementsByClassName("THUMBS-BLOCK")[0].getElementsByTagName("a")[0].getAttribute("href");
					onDebug("getGenericLink changeUrl to linkToPage which is " + linkToPage);
					sendMessage("changeUrl", linkToPage);					
					return;
				}catch(e){
					onDebug(e);
				}
			}
		}

		function isMatch(locationString){
			return locationString.indexOf("web.archive.org/web/") > -1 || locationString.indexOf("web.archive.org/save/_embed/") > -1 || locationString.indexOf("webcitation.org/query?url=") > -1 || locationString.indexOf("webcache.googleusercontent.com") > -1;
		}

		if(isMatch(contextLinkUrl)){
			if(contextLinkUrl.indexOf("http", 20) > -1 || contextLinkUrl.indexOf("www", 20) > -1 || contextLinkUrl.indexOf("ftp", 20) > -1){
				onDebug("getGenericLink we have some kind of filled in link");
				onDebug("getGenericLink after cleaning: " + this.cleanurl(this.getPartialUrl(contextLinkUrl)));
				
				var currentAction = "openFocusedTab";
				if(isMatch(currentLocation)){
					currentAction = "changeUrl";
				}
				sendMessage(currentAction, baseUrl + this.cleanurl(this.getPartialUrl(contextLinkUrl)));
				return;
			}
		}
			
		// get URL from HTML
		var linkToPage = this.getLocationFromPage(); // returns non-empty string on archive.is
		if(linkToPage != ""){
			onDebug("getGenericLink non-empty string " + linkToPage + " assigned to pageLocation");
			pageLocation = linkToPage;
		}
		
		if(currentLocation.indexOf("Overleg:") > -1 && (contextLinkUrl == null || contextLinkUrl == "")){
			temp = this.getPageLocation();
			if (temp != "" && temp != "NONE"){ //TODO: check this
				pageLocation = temp;
			}
		}
		if(pageLocation.indexOf("http://web.archive.org/") == 0 || pageLocation.indexOf("https://web.archive.org/") == 0){
			pageLocation = pageLocation.replace("http://web.archive.org/", "https://web.archive.org/"); // make HTTPS
			onDebug("getGenericLink archive.org hit");
			//sendMessage("changeUrl", baseUrl + this.cleanurl(this.getPartialUrl(pageLocation)));
			sendMessage("changeUrl", this.cleanurl(pageLocation));
			return;
		}
		
		// Always include protocol, the simplest way is to get this from the JavaScript input element
		var wmtbURL = document.getElementById("wmtbURL");
		if(currentLocation.indexOf("web.archive.org") > -1 && wmtbURL != null){
			pageLocation = wmtbURL.value;
		}
		
		if(pageLocation != "" && currentLocation.indexOf("webcitation.org") == -1 && currentLocation.indexOf("archive.is") == -1 && currentLocation.indexOf("archive.li") == -1 && currentLocation.indexOf("web.archive.org") == -1){
			// right click / action-submit / action-edit
			var openNewTab = this.isUrlValid();
			var currentAction = "openFocusedTab";
			if(this.isUrlValid() == false){
				currentAction = "changeUrl";
			}
			
			try{
				sendMessage(currentAction, baseUrl+decodeURI(this.cleanurl(pageLocation)));
			}catch(err){
				sendMessage(currentAction, baseUrl+this.cleanurl(pageLocation));
			}
		}else{
			if(currentLocation.indexOf("Overleg:") == -1){
			    if(pageLocation == "") // seems to work
					pageLocation = window.location.href;
				pageLocation = this.getPartialUrl(pageLocation);
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
		
		var indexHttp = currentLocation.indexOf("http", 20);
		if(indexHttp > -1){
			currentLocation = currentLocation.substring(indexHttp);
		}

		var linkToPage = this.getLocationFromPage(); //archive.is
		if(linkToPage != ""){
			currentLocation = linkToPage;
		}
		currentLocation = currentLocation.replace(/\_/g, ' ');
		currentLocation = currentLocation.replace(/\-/g, ' ');
		
		if(currentLocation.indexOf("nu.nl") > -1){
			var lashSlash = currentLocation.lastIndexOf("/");
			var html = currentLocation.indexOf(".html");
			currentLocation = currentLocation.substring(lashSlash + 1, html);
			currentLocation = this.urldecode(currentLocation);
		}
		
		/* from one search engine to another */
		var getLocation = function(href) {
			var l = document.createElement("a");
			l.href = href;
			return l;
		};
		var l = getLocation(currentLocation);
		var hostname = l.hostname;
		if(hostname.indexOf(".") < hostname.lastIndexOf(".")){
			// two or more dots
			if(hostname.indexOf(".") < (hostname.length / 2)){
				hostname = hostname.substring(hostname.indexOf(".") + 1);
			}
		}
		hostname = hostname.substring(0, hostname.indexOf("."));

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
		}     
	},
	insertAtCursor: function(myField, myValue) {
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
		if(clipboardText != ""){
			onDebug("clipboardText is " + clipboardText);
			if(window.location.href.indexOf("nl.wikipedia.org") > -1){
				if(clipboardText.indexOf("http", 20) > -1){
					onDebug("pastecomment - <!-- Archieflink -->");
					this.insertAtCursor(previouslyActiveElement, "<!-- Archieflink: " + clipboardText + " -->");
				}else{
					onDebug("pastecomment - <!-- Actuele link -->");
					this.insertAtCursor(previouslyActiveElement, "<!-- Actuele link: " + clipboardText + " -->");
				}
			}else{
				onDebug("pastecomment branch2 - <!-- Archieflink -->");
				this.insertAtCursor(previouslyActiveElement, clipboardText);
			}
		}
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
	copyCurrentUrlToClipboard: function(onlyValidPages){
		var urlToCopy = getarchive.getUrlToCopy();

		if(getarchive_lastcopy == urlToCopy){
			return;
		}
		
		if(onlyValidPages == true && this.isUrlValid() == false){
			return;
		}
		
		this.getarchive_lastcopy = urlToCopy;
		
		if(this.copyToClipboard(urlToCopy) == true && document.title.indexOf("+") != 0){
			var title = document.title;
			if(title == "")
				title = window.location.href;
			document.title = "+" + title;
		}
	},
	getContextLinkUrl: function(archive_service){
		var contextLinkUrl = "";
		
		var selection = window.getSelection().toString();
		if(selection != null && selection != "")
			contextLinkUrl = selection;
		var pageLocation = window.location.href;
		if(pageLocation != null && pageLocation != "")
			contextLinkUrl = pageLocation;
		
		var archiveServiceLocal = archive_service;
		if(archiveServiceLocal == "")
			archiveServiceLocal = getarchive_default_archive_service;
		
		sendMessage("setContextLinkUrl", {contextLinkUrl: contextLinkUrl, archiveService: archiveServiceLocal});
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
		onDebug("insertText");
		this.insertAtCursor(previouslyActiveElement, clipboardText);
	},
	parseKeyboardShortcut: function(keyboardShortcut, event, func){
		var kb = keyboardShortcut.toLowerCase();
		
		var kb_ctrlOrCmd = kb.indexOf("ctrl") > -1 || kb.indexOf("control") > -1 || kb.indexOf("command") > -1 || kb.indexOf("cmd") > -1;
		var kb_alt = kb.indexOf("alt") > -1;
		var kb_shift = kb.indexOf("shift") > -1;
		var kb_meta = kb.indexOf("meta") > -1;
		var kb_key_index_dash = kb.lastIndexOf("-");
		var kb_key_index_plus = kb.lastIndexOf("+");
		var kb_key = "";
		
		var kb_key_set = false;
		
		if(kb_key_index_dash == kb.length - 1){
			kb_key = "-";
			kb_key_set = true;
		}
		
		if(kb_key_index_plus == kb.length - 1){
			kb_key = "+";
			kb_key_set = true;
		}
		
		if(kb_key_set == false){
			var kb_key_index = Math.max(kb_key_index_dash, kb_key_index_plus);
			kb_key = kb.substring(kb_key_index + 1);
						
			if(kb_key_index == -1)
				return;
		}
				
		var result = "";
		if(kb_ctrlOrCmd)
			result += "+Control";
			
		if(kb_alt)
			result += "+Alt";
			
		if(kb_shift)
			result += "+Shift";
			
		if(kb_meta)
			result += "+Meta";
		
		result += "+" + kb_key.toUpperCase();
		
		if(result.indexOf("+") == 0){
			result = result.substring(1);
		}
		
		var matchKey = false;
		if(!isNaN(parseInt(kb_key))){
			if(event.code == "Digit" + kb_key){
				matchKey = true;
			}
			if(event.code == "Numpad" + kb_key){
				matchKey = true;
			}
		}
		
		if(matchKey == true && event.shiftKey == kb_shift && event.ctrlKey == kb_ctrlOrCmd && event.altKey == kb_alt && event.metaKey == kb_meta){
			event.preventDefault();
			func(result);
		}/*else{
			console.log("You didn't hit me with " + result + ", key was " + kb_key + " and needed to be " + event.key);
			console.log("event.key == kb_key " + (event.key == kb_key));
			console.log("event.shiftKey == kb_shift " + (event.shiftKey == kb_shift));
			console.log("event.ctrlKey == kb_ctrlOrCmd " + (event.ctrlKey == kb_ctrlOrCmd));
			console.log("event.altKey == kb_alt " + (event.altKey == kb_alt));
			console.log("event.metaKey == kb_meta " + (event.metaKey == kb_meta));
		}*/
	}
}

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented) {
		return;
	}
	
	var clipboardText = "";
	var previouslyActiveElement = document.activeElement;

	if(event.keyCode == 45 || event.keyCode == 19){
		var input = document.createElement("textarea");
		input.setAttribute("contenteditable", "true");
		previouslyActiveElement.parentElement.appendChild(input);

		input.focus();
		document.execCommand("Paste");
		clipboardText = input.textContent;
		onDebug("clipboard read resulted in " + clipboardText);
		
		// Cleanup
		previouslyActiveElement.parentElement.removeChild(input);
	}
	
	if(event.keyCode == 45 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		// insert
		event.preventDefault();
		onDebug("INSERT EVENT!");
		getarchive.insertText(previouslyActiveElement, clipboardText);
	}
	
	if(event.keyCode == 19 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		// pause/break
		event.preventDefault();
		onDebug("PAUSE EVENT!");
		getarchive.pastecomment(previouslyActiveElement, clipboardText);
	}
		
	var activeElementToLower = document.activeElement.tagName.toLowerCase();
	if(getarchive_require_focus && (activeElementToLower == "textarea" || activeElementToLower == "input")){
		return;
	}

	if(window.getSelection().toString().length != 0){
		return;
	}
	
	getarchive.parseKeyboardShortcut(getarchive_archiveorg_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_archiveorg_keyboard_shortcut");
		getarchive.getContextLinkUrl("archive.org");
	});
	
	getarchive.parseKeyboardShortcut(getarchive_archiveis_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_archiveis_keyboard_shortcut");
		getarchive.getContextLinkUrl("archive.is");
	});
	
	getarchive.parseKeyboardShortcut(getarchive_webcitation_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_webcitation_keyboard_shortcut");
		getarchive.getContextLinkUrl("webcitation.org");
	});
	
	getarchive.parseKeyboardShortcut(getarchive_googlecache_keyboard_shortcut, event, function(result){
		//sendMessage("notify", "You hit getarchive_googlecache_keyboard_shortcut");
		getarchive.getContextLinkUrl("webcache.googleusercontent.com");
	});
	
	// key 3 => keycode 99
	if(event.keyCode == 99 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY 3 EVENT!");
		getarchive.getContextLinkUrl("archive.org");
	}
	
	// key 4 => keycode 100
	if(event.keyCode == 100 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY 4 EVENT!");
		getarchive.getContextLinkUrl("archive.is");
	}
	
	// key 5 => keycode 101
	if(event.keyCode == 101 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY 5 EVENT!");
		getarchive.getContextLinkUrl("webcitation.org");
	}
	
	// key 6 => keycode 102
	if(event.keyCode == 102 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY 6 EVENT!");
		getarchive.getContextLinkUrl("webcache.googleusercontent.com");
	}
	
	// key 3 azerty => keycode 51
	if(event.keyCode == 51 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		onDebug("KEY 3 AZERTY EVENT!");
		getarchive.getContextLinkUrl("archive.org");
	}
	
	// key 4 azerty => keycode 52
	if(event.keyCode == 52 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY 4 AZERTY EVENT!");
		getarchive.getContextLinkUrl("archive.org");
	}
	
	// key 5 azerty => keycode 53
	if(event.keyCode == 53 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY 5 AZERTY EVENT!");
		getarchive.getContextLinkUrl("webcitation.org");
	}
	
	// key 6 azerty => keycode 54
	if(event.keyCode == 54 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY 6 AZERTY EVENT!");
		getarchive.getContextLinkUrl("webcache.googleusercontent.com");
	}
	
	// key g => keycode 71
	if(event.keyCode == 71 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY G SEARCH EVENT!");
		getarchive.goSearch();
	}
	
	// key x => keycode 88
	if(event.keyCode == 88 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY X CLOSE TAB EVENT!");
		sendMessage("closeTab");
	}
		
	// key l => keycode 76
	if(event.keyCode == 76 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
		event.preventDefault();
		onDebug("KEY L OPEN VERWIJZINGENZOEKEN");
		window.location.href = "https://nl.wikipedia.org/w/index.php?title=Speciaal%3AVerwijzingenZoeken&target=" + window.location.href;
	}
	
	
	
	/*
	<!-- Archive.org control -->
		<key id='archive-org-shortcut'
		modifiers='control'
		key='3'
		oncommand='getarchive.getarchiveorglink(-1);'
		/>
		
		<!-- Archive.today control -->
		<key id='archive-today-shortcut'
		modifiers='control'
		key='4'
		oncommand='getarchive.gettodayarchive(-1);'
		/>
	*/
	

	
	if (event.keyCode == 67 && !event.shiftKey && event.ctrlKey && !event.altKey && !event.metaKey) {
		if(!getarchive_enable_ctrl_c){
			return;
		}
		
		var frameIdentifiers = ["iframe", "frame"];
		var i = 0;
		
		// Test URL: http://web.archive.org/web/20060504004551/http://www.beastiemuseum.com/
		if(getarchive.getInnerBody().indexOf("<frame") > -1){
			for(i = 0; i < frameIdentifiers.length; i++){
				var frames = document.getElementsByTagName(frameIdentifiers[i]);
				var i = 0;
				onDebug("number of frames: " + frames.length);
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
								return;
							}
						}catch(ex){
							if(frame.getAttribute("src").indexOf("google") == -1){
								onDebug("CROSS-DOMAIN IFRAME on URL " + frame.getAttribute("src"));
							}
						}
					}
				}
			}
		}else{
			onDebug("skipped");
		}
		
		onDebug("activeElement is " + document.activeElement.tagName.toLowerCase());

		getarchive.copyCurrentUrlToClipboard(false); // false = do not check for invalid pages, just copy the current URL
		
	
		// don't allow for double actions for a single event
		event.preventDefault();
		return;
	}
}, true);
