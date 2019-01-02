/// Global variables
let origin = "code";

/// Preferences
let getarchive_enable_ctrl_c = true;
let getarchive_require_focus = true;
let getarchive_prefer_long_link = true;
let getarchive_default_archive_service = "archive.org";
let getarchive_archiveorg_keyboard_shortcut = "";
let getarchive_archiveis_keyboard_shortcut = "";
let getarchive_webcitation_keyboard_shortcut = "";
let getarchive_googlecache_keyboard_shortcut = "";
let getarchive_disable_all_shortcuts = true;

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
		case "saveIntoWebcitation":
			saveIntoWebcitation(message.data);
			break;
		default:
			break;
	}
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function init(){
	let valueOrDefault = function(value, defaultValue){
		if(value == undefined) return defaultValue;
		return value;
	}
	
	browser.storage.local.get([
		"getarchive_enable_ctrl_c",
		"getarchive_require_focus",
		"getarchive_prefer_long_link",
		"getarchive_default_archive_service",
		"getarchive_archiveorg_keyboard_shortcut",
		"getarchive_archiveis_keyboard_shortcut",
		"getarchive_webcitation_keyboard_shortcut",
		"getarchive_googlecache_keyboard_shortcut",
		"getarchive_disable_all_shortcuts"
	]).then((result) => {
		getarchive_enable_ctrl_c = valueOrDefault(result.getarchive_enable_ctrl_c, true);
		getarchive_require_focus = valueOrDefault(result.getarchive_require_focus, true);
		getarchive_prefer_long_link = valueOrDefault(result.getarchive_prefer_long_link, true);
		getarchive_default_archive_service = valueOrDefault(result.getarchive_default_archive_service, "archive.org");
		
		// Keyboard shortcuts
		getarchive_archiveorg_keyboard_shortcut = valueOrDefault(result.getarchive_archiveorg_keyboard_shortcut, "CTRL+3");
		getarchive_archiveis_keyboard_shortcut = valueOrDefault(result.getarchive_archiveis_keyboard_shortcut, "CTRL+4");
		getarchive_webcitation_keyboard_shortcut = valueOrDefault(result.getarchive_webcitation_keyboard_shortcut, "CTRL+5");
		getarchive_googlecache_keyboard_shortcut = valueOrDefault(result.getarchive_googlecache_keyboard_shortcut, "CTRL+6");
		getarchive_disable_all_shortcuts = valueOrDefault(result.getarchive_disable_all_shortcuts, false);
		
		if(!getarchive_disable_all_shortcuts){
			addKeydown();
		}
	}).catch(console.error);
}
init();

function onDebug(info){
	sendMessage("onDebug", "getarchive.js " + info);
}

function onVerbose(info){
	sendMessage("onVerbose", info);
}

function saveIntoWebcitation(data){
	document.getElementsByName("url")[0].value = data.url;
}

let getarchive = {
	getPageLocationFromTalk: function(){
		let contentText = document.querySelector("#mw-content-text") == null ? "" : mwContentText.innerHTML;

		if(contentText == ""){
			return "";
		}

		let pageLocation = "";

		let countDodeLink = 0;
		let countLinks = 0;

		let count = contentText.match(/mw-headline/g).length;
		try {
			countDodeLink = contentText.match(/id=\"Dode_/g).length;
		}
		catch(err){
			countDodeLink = 0;
		}
		try {
			countLinks = contentText.match(/external/g).length;
		}catch(err){
			countLinks = 0;
		}

		if (countDodeLink == 1 && (count == 1 || count == undefined || countLinks == 1)){
			let startExternalLink = contentText.indexOf("external free");
			let endExternalLink = contentText.indexOf(">",startExternalLink);
			pageLocation = contentText.substring(startExternalLink + 21, endExternalLink - 1);
		}else{
			if(countDodeLink == 1 && countLinks > 1){
				let startHeadline = contentText.indexOf("\"Dode_");
				let startExternalLink = contentText.indexOf("external free", startHeadline)
				let endExternalLink = contentText.indexOf(">",startExternalLink);
				pageLocation = contentText.substring(startExternalLink + 21, endExternalLink - 1);
			}
		}

		return pageLocation.split('amp;').join('');
	},
	getContentText: function(){
		return document.body == null ? "" : document.body.textContent;
	},
	isUrlValid: function(){
		// Checks if page is valid. Used to stop the counter on invalid pages.
		
		try{
			let documentTitleLower = document.title.toLowerCase();
			let contentText = getarchive.getContentText();
			let contentTextLower = contentText.toLowerCase();	
			
			let invalidTitles = ["404 Not Found", "page not found", "cannot be found", "object not found", "error", "403 Forbidden", "seite nicht gefunden", "500 Internal Server Error", "IIS 8.5 Detailed Error", "404 - File or directory not found.", "Fehler 404", "Impossibile trovare la pagina", "Erreur 404", "Internet Archive Wayback Machine", "Wayback Machine", "Pagina non trovata", "Connection timed out", "Domain Default page", "Object niet gevonden!", "Pagina não econtrada", "File not found", "Pagina niet gevonden", "Seite wurde nicht gefunden", "Nothing found", "can't be found", "502 Bad Gateway", "Side ikke fundet", "Seite nicht Verfügbar", "Fant ikke siden", "403 - Forbidden: Access is denied.", "410 Gone", "Bad Request"];
			
			for(let i in invalidTitles){
				if(documentTitleLower.includes(invalidTitles[i].toLowerCase())){
					//console.log("isUrlValid Invalid title " + invalidTitles[i]);
					return false;
				}
			}

			if(documentTitleLower.includes("404")){
				//console.log("isUrlValid 404 page");
				return false;
			}
			
			// errorBorder = unknown archive.org error
			let invalidContent = ["Wayback Machine doesn't have that page archived.", "The machine that serves this file is down. We're working on it.", "errorBorder", "404 - File or directory not found.", "404 Not Found", "An error occurred", "cannot be found", "page not found", "buy this domain", "Artikel niet gevonden", "503 Service Unavailable", "504 Gateway Time-out", "Error 522", "DB Connection failed", "koop dit domein", "page can’t be found", "Page Unavailable"];
			
			for(let i in invalidContent){
				if(contentTextLower.indexOf(invalidContent[i].toLowerCase()) > -1){
					//console.log("Invalid content " + invalidContent[i]);
					return false;
				}
			}
			
			// fix https://www.w3.org/TR/uievents/ opens in the current tab, not in a new tab
			let invalidContentCase = ["Not Found", "NOT FOUND", "Not found"]
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
		let urlToCopy = window.location.href;
		if(getarchive_prefer_long_link == true){
			let element = document.querySelector("#SHARE_LONGLINK");
			if(element != null){
				let tempUrlToCopy = element.value;
				//https://archive.is/2012.05.30-154426/http://www.nieuwsblad.be/Article/Detail.aspx?ref=dg&articleID=gh53q184
				
				let urlArchiveIsSplit = tempUrlToCopy.lastIndexOf("/", tempUrlToCopy.indexOf("://", 15));
				let basePart = "https://archive.is/";
				let datePart = tempUrlToCopy
					.substring(0, urlArchiveIsSplit)
					.replace("https://archive.is/", "")
					.replace("http://archive.is/", "")
					.replace("http://archive.today/", "")
					.replace("https://archive.today/", "")
					.replace("http://archive.li/", "")
					.replace("https://archive.li/", "");
				let urlPart = tempUrlToCopy.substring(urlArchiveIsSplit);

				datePart = datePart.replace(".", "").replace(".", "").replace("-", "");
				urlToCopy = basePart + datePart + urlPart;
				
				sendMessage("addUrlToHistory", urlToCopy);
			}
		}

		return urlToCopy;
	},
	copyToClipboard: function(text){
		sendMessage("backgroundCopyToClipboard", text);
	},
	getLocationFromPage: function(){
		// get URL from HTML
		let pageLocation = "";
		let windowLocation = window.location.href;
		
		if(isArchiveIsUrl(windowLocation)){
			let inputElements = document.body.getElementsByTagName("input");
			for (i = 0; i < inputElements.length; i++) {
				let contentText = getarchive.getInnerBody();

				let redirectedFromPos = contentText.indexOf("Redirected from");
				if(redirectedFromPos > -1){ // prefer "Redirected from"
					let httpPos = contentText.indexOf("http", redirectedFromPos);
					let httpPosEnd = contentText.indexOf("\"", httpPos);
					pageLocation = contentText.substring(httpPos, httpPosEnd);
				}
				
				let originalPos = contentText.indexOf("Original");
				if(originalPos > -1){
					let httpPos = contentText.indexOf("http", originalPos);
					let httpPosEnd = contentText.indexOf("\"", httpPos);
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
		let windowLocation = window.location.href;
		let pageLocation = "";
		let baseUrl = "";
		
		switch(website){
			case "archive.org":
				baseUrl = "https://web.archive.org/web/2005/";
				break;
			case "archive.is":
				baseUrl = "https://archive.is/";
				break;
			case "webcitation.org":
				baseUrl = "https://webcitation.org/query?url=";
				break;
			case "webcache.googleusercontent.com":
				baseUrl = "https://webcache.googleusercontent.com/search?q=cache%3A";
				break;
		}
		//console.log("getGenericLink baseUrl is " + baseUrl);
		sendMessage("updateGlobalArchiveService", website);
		
		if(contextLinkUrl != null){
			pageLocation = contextLinkUrl;
			//console.log("getGenericLink pageLocation is " + pageLocation);
		}

		if(!isContextMenu){
			if(website == "archive.is" && isArchiveIsUrl(windowLocation)){
				// Intended to stop automatic forwarding etc
				if(document.title.indexOf(":") == -1 && document.title != "" && !isContextMenu){
					//console.log("getGenericLink taking early exit 1");
					return; // no need for this
				}
				
				if(document.title.indexOf(":") == -1 && document.title != "" && isContextMenu){
					//console.log("getGenericLink taking early exit 2");
					return; // no need for this
				}
				
				/*if(getarchive.isUrlValid() == false){
					//console.log("getGenericLink taking early exit 3");
					return; // no need for this
				}*/

				// https://archive.is/http://link-to.url/page -> https://archive.is/ixIyjm
				let thumbsBlocks = document.getElementsByClassName("THUMBS-BLOCK");
				if(thumbsBlocks.length != 0){
					linkToPage = thumbsBlocks[0].getElementsByTagName("a")[0].getAttribute("href");
					//console.log("getGenericLink changeUrl to linkToPage which is " + linkToPage);
					sendMessage("changeUrl", linkToPage);
					return;
				}	
			}
		}

		if(isArchiveUrl(contextLinkUrl)){			
			let currentAction = "openFocusedTab";
			let cleanUrl = baseUrl + getarchive.cleanUrl(shared.getPartialUrl(contextLinkUrl));

			// changed by shortcut
			if(!isContextMenu && isArchiveUrl(windowLocation)){
				currentAction = "changeUrl";
			}
			sendMessage(currentAction, cleanUrl);
			return;
		}
			
		// get URL from HTML
		if(contextLinkUrl.indexOf("/o/") > -1){
			let locationO = contextLinkUrl.indexOf("/o/");
			let locationBegin = contextLinkUrl.indexOf("/", locationO + 4);
			pageLocationTemp = contextLinkUrl.substring(locationBegin + 1);
			if(pageLocationTemp.indexOf("://") == -1){
				pageLocationTemp = "https://" + pageLocationTemp;
			}
			pageLocation = pageLocationTemp;
		}
		
		if(!isContextMenu){
			let linkToPage = getarchive.getLocationFromPage(); // returns non-empty string on archive.is
			if(linkToPage != ""){
				pageLocation = linkToPage;
			}
		}
		
		// for talk pages, ca-talk with class selected indicates this is a talk page
		let talkPageObject=document.getElementById("ca-talk");
		if(talkPageObject != null){
			let temp = getarchive.getPageLocationFromTalk();
			pageLocation = temp == "" ? pageLocation : temp;
		}

		if(urlStartsWith(pageLocation, "web.archive.org")){
			pageLocation = pageLocation.replace("http://web.archive.org/", "https://web.archive.org/"); // make HTTPS

			//sendMessage("changeUrl", baseUrl + getarchive.cleanUrl(shared.getPartialUrl(pageLocation)));
			sendMessage("changeUrl", getarchive.cleanUrl(pageLocation));
			return;
		}
		
		// Always include protocol, the simplest way is to get this from the JavaScript input element
		if(urlStartsWith(windowLocation, "web.archive.org")){
			let wmtbURL = document.getElementById("wmtbURL");
			if(wmtbURL != null){
				pageLocation = wmtbURL.value;
			}
		}

		if(pageLocation != "" && !isArchiveUrl(windowLocation)){
			// right click / action-submit / action-edit
			let currentAction = "openFocusedTab";
			
			if(getarchive.isUrlValid() == false){
				currentAction = "changeUrl";
			}
						
			try{
				sendMessage(currentAction, baseUrl+decodeURIComponent(getarchive.cleanUrl(pageLocation)));
			}catch(err){
				sendMessage(currentAction, baseUrl+getarchive.cleanUrl(pageLocation));
			}
		}else{
			if(windowLocation.indexOf("Overleg:") == -1){
				if(pageLocation == "") // seems to work
					pageLocation = window.location.href;
				pageLocation = shared.getPartialUrl(pageLocation);
				sendMessage("changeUrl", baseUrl+getarchive.cleanUrl(pageLocation));
			}
		}
	},
	insertAtCursor: function(myField, myValue) {
		// https://stackoverflow.com/questions/11076975/insert-text-into-textarea-at-cursor-position-javascript
		if(myField == undefined)
			return; // please try again
		
		if (myField.selectionStart || myField.selectionStart === 0) {
			let startPos = myField.selectionStart;
			let endPos = myField.selectionEnd;
			myField.value = myField.value.substring(0, startPos)
				+ myValue
				+ myField.value.substring(endPos, myField.value.length);
			myField.selectionStart = startPos + myValue.length;
			myField.selectionEnd = startPos + myValue.length;
		} else {
			myField.value += myValue;
		}
	},
	getPasteComment: function(clipboardText){
		// paste with <!-- Archieflink: --> on nl.wikipedia.org and normal on other websites
		// document.execCommand("paste") is not used because we're not in an event listener
		// execCommand("paste") is also unreliable:
		// - paste only works for textareas (state 2017-02-15) and not for other input elements
		// Use of the clipboard Web API is preferred
		let returnValue = clipboardText;
		
		if(window.location.href.indexOf("nl.wikipedia.org") > -1){
			if(isArchiveUrl(clipboardText)){
				let date = getDateFromUrl(clipboardText);
				returnValue = " |archiefurl=" + clipboardText + " |archiefdatum=" + getDateFormat(date, 'nl-BE') + " |dodeurl=ja";
			}else{
				returnValue = "<!-- Actuele link: " + clipboardText + " -->";
			}
		}

		return returnValue;
	},
	getInnerBody: function(){
		return document.body == null ? "" : document.body.innerHTML;
	},
	cleanUrl: function(url){
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
	copyUrlToClipboard: function(onlyValidPages, url){
		let urlToCopy = getarchive.getUrlToCopy();
		let documentTitle = document.title;
				
		if(url == null){
			return;
		}
		
		if(url.length < 25 && isArchiveIsUrl(url) && url == window.location.href){
			// Ignore the URL parameter. It contains something like https://archive.is/eiE5j
			// Prefer the long format, or the short if set in the options
		}else{
			// Prefer the passed URL
			urlToCopy = url;
		}
	
		if(window.location.href == url){
			if(onlyValidPages == true && getarchive.isUrlValid() == false){
				return;
			}
		}

		getarchive.copyToClipboard(urlToCopy);
		/*if(document.title.indexOf("+") != 0){
			sendMessage("updateTabTitle", {tabId: tabId, title: "+" + documentTitle});
		}*/
	},
	getContextLinkUrl: function(archive_service){
		let contextLinkUrl = "";
		let isContextMenu = true;
		
		let selection = window.getSelection().toString();
		if(selection != null && selection != "")
			contextLinkUrl = selection;
			
		let pageLocation = window.location.href;
		if(pageLocation != null && pageLocation != ""){
			contextLinkUrl = pageLocation;
			isContextMenu = false;
		}
		
		// https://web.archive.org/web/2005/http://wii.nintendo.nl/13470.html -> click toolbar button.
		if(contextLinkUrl.lastIndexOf("://") > 20){
			contextLinkUrl = shared.getPartialUrl(contextLinkUrl);
		}
		
		let archiveServiceLocal = archive_service;
		if(archiveServiceLocal == "")
			archiveServiceLocal = getarchive_default_archive_service;
		
		sendMessage("setContextLinkUrl", {contextLinkUrl: contextLinkUrl, archiveService: archiveServiceLocal, isContextMenu: isContextMenu});
	},
	getSelectionHtml: function() {
		// https://stackoverflow.com/questions/5643635/how-to-get-selected-html-text-with-javascript
		let html = "";
		let urls = new Array();
		
		if (typeof window.getSelection != "undefined") {
			let sel = window.getSelection();
			if (sel.rangeCount) {
				let container = document.createElement("div");
				for (let i = 0, len = sel.rangeCount; i < len; ++i) {
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
					let href = tags[item].getAttribute("href");
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
	isCopySafe: function(){
		let frameIdentifiers = ["iframe", "frame"];
		let innerBody = getarchive.getInnerBody();

		// Test URL: https://web.archive.org/web/20060504004551/http://www.beastiemuseum.com/
		if(innerBody.indexOf("<frame") > -1 || innerBody.indexOf("<iframe") > -1){
			for(let i = 0; i < frameIdentifiers.length; i++){
				let frames = document.getElementsByTagName(frameIdentifiers[i]);
				//console.log("number of frames: " + frames.length);
				if(frames.length > 0){
					for(let j = 0; j < frames.length; j++){
						try{
							let frame = frames[j];
							let idoc = frame.contentDocument || frame.contentWindow.document;
							let frameselection = idoc.getSelection();
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

function addKeydown(){
	window.addEventListener("keydown", function (event) {
		if (event.defaultPrevented)
			return;

		if(event.keyCode == 45 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
			// insert
			navigator.clipboard.readText().then((clipText) => {
				getarchive.insertAtCursor(document.activeElement, clipText);
			});
			event.preventDefault();
		}

		if(event.keyCode == 19 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
			// pause/break
			event.preventDefault();
			navigator.clipboard.readText().then((clipText) => {
				let pasteComment = getarchive.getPasteComment(clipText); 
				getarchive.insertAtCursor(document.activeElement, pasteComment);
			});
		}

		let activeElementToLower = document.activeElement.tagName.toLowerCase();
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
		if(window.location.href.indexOf("feedly.com") == -1){
			keyutils.parseKeyboardShortcut("g", event, function(result){
			//if(event.keyCode == 71 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey){
				event.preventDefault();
				//console.log("KEY G SEARCH EVENT!");
				sendMessage("goSearch");
			}, true);
		}

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
					getarchive.copyUrlToClipboard(false, window.location.href);
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

			origin = "user";
			getarchive.copyUrlToClipboard(false, window.location.href);
			origin = "code";

			// don't allow for double actions for a single event
			event.preventDefault();
			return;
		}
	}, true);
}
