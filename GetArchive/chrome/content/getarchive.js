var wait = 200;
var getarchive_website = "";
var getarchive_lastcopy = "";

var getarchive = {
	getarchiveorglink: function(buttoncode) {
		var currentLocation=gBrowser.contentDocument.location.href;
		var archiveOrgBaseURL = "http://web.archive.org/web/2005/"; //0000000000
		var pageLocation = "";

		getarchive_website="archive.org"
		
		try{
			pageLocation = gContextMenu.linkURL;
		}catch(err){
			pageLocation = "";
		}

		if(currentLocation.indexOf("web.archive.org/web/*/") > -1){
			window.content.location.href = this.cleanurl(currentLocation.replace("web.archive.org/web/*/", "web.archive.org/web/2005/"));
			this.copytoclipboard();
			return;
		}

		// get URL from HTML
		var linkToPage = this.getlocationfrompage();
		if(linkToPage != ""){
			pageLocation = linkToPage;
		}
		
		pageLocation = this.getLinkFromMediaWikiSelection(currentLocation, pageLocation);

		if(currentLocation.indexOf("Overleg:") > -1 && gContextMenu == null){
			temp = this.getPageLocation();
			if (temp != "" && temp != "NONE"){ //TODO: check this
				pageLocation = temp;
			}
		}

		if(pageLocation != ""){
			// right click / action-submit / action-edit

			//if(buttoncode > 0 || currentLocation.indexOf("wiki") > -1){
				try{
					gBrowser.selectedTab = this.insertTab(archiveOrgBaseURL+decodeURI(this.cleanurl(pageLocation)));
				}catch(err){
					gBrowser.selectedTab = this.insertTab(archiveOrgBaseURL+this.cleanurl(pageLocation));
				}
			/*}else{
				window.content.location.href = archiveOrgBaseURL+this.cleanurl(pageLocation);
			}*/
			this.copytoclipboard();
		}else{
			if(currentLocation.indexOf("Overleg:") == -1){
			    pageLocation = gBrowser.contentDocument.location.href;
				pageLocation = pageLocation.replace("http://archive.today/", "");
				pageLocation = pageLocation.replace("https://archive.today/", "");
				pageLocation = pageLocation.replace("http://archive.is/", "");
				pageLocation = pageLocation.replace("https://archive.is/", "");
				
				window.content.location.href = archiveOrgBaseURL+this.cleanurl(pageLocation);
				this.copytoclipboard();
			}
		}
	},
	getPageLocation: function(){
		// this should only work on talk pages -> ca-talk with class selected indicates this is a talk page
		var talkPageObject=content.document.getElementById("ca-talk");
		var pageLocation = "NONE";
		
		if(talkPageObject != null && talkPageObject != undefined){
			if(talkPageObject.getAttribute("class") == "selected"){
				return pageLocation; // archive.is is fooling us, this is not a talk page
			}
		}

		contentText = content.document.getElementById("mw-content-text").innerHTML;
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
			return pageLocation;
		}
		
		return pageLocation.split('amp;').join('');
	},
	isurlloaded: function(){
		if(gBrowser.contentDocument.location.href.indexOf("archive.today") > -1 || gBrowser.contentDocument.location.href.indexOf("archive.is") > -1){
			if(getarchive_website=="archive.org"){
				return false; // probably still loading
			}
			if(gBrowser.contentDocument.location.href.length < 28){ //is this needed?
				return this.isurlvalid();
			}
		}
		
		if(gBrowser.contentDocument.location.href.indexOf("archive.org") > -1){
			if(getarchive_website=="archive.is"){
				return false; // probably still loading
			}
			
			if(gBrowser.contentDocument.location.href.indexOf("archive.org") > -1 && gBrowser.contentDocument.location.href.indexOf("archive.org/web/2005/") == -1){
				if(content.document.body == null){
					return false;
				}
				//var contentText = this.getcontenttext();
				//if(contentText != ""){
					//if(contentText.indexOf("Redirecting to...") > -1){
					//	return false;
					//}
					// disabled until further testing is done
					//if(contentText.indexOf("The machine that serves this file is down. We're working on it.") > -1){
					//	var locationNextDateText = contentText.indexOf("Would you like to try the "); // would you like to try the next date?
					//	var locationNextDateDate = contentText.indexOf("date", locationNextDateText);
					//	var nextDateText = contentText.substring(locationNextDateText, locationNextDateDate - locationNextDateText);
					//	alert(nextDateText);
						//gBrowser.contentDocument.location.href = ;//get next date
					//	return false;
					//}
				//}
				return this.isurlvalid();
			}
		}
		return false;
	},
	getcontenttext: function(){
		contentText = "";
		try{
			contentText = content.document.body.textContent;
		}catch(err){}
		return contentText;
	},
	isurlvalid: function(){
		// Checks if page is valid. Used to stop the counter on invalid pages.
		
		try{
			var documentTitle = content.document.title.toLowerCase();
			var contentText = this.getcontenttext();
			var contentTextLower = contentText.toLowerCase();
			
			if(documentTitle.indexOf("404 not found") > -1){
				return false;
			}
			if(documentTitle.indexOf("page not found") > -1){
				return false;
			}
			if(documentTitle.indexOf("cannot be found") > -1){
				return false;
			}
			if(documentTitle.indexOf("object not found") > -1){
				return false;
			}
			if(documentTitle.indexOf("403 forbidden") > -1){
				return false;
			}
			if(contentText.indexOf("Wayback Machine doesn't have that page archived.") > -1){
				return false;
			}
			if(contentText.indexOf("The machine that serves this file is down. We're working on it.") > -1){
				return false;
			}
			if(contentText.indexOf("errorBorder") > -1){ //unknown archive.org error
				return false;
			}
			if(contentTextLower.indexOf("cannot be found") > -1){
				return false;
			}
			if(contentTextLower.indexOf("page not found") > -1){
				return false;
			}
			if(contentText.indexOf("404 - File or directory not found.") > -1){
				return false;
			}
			if(contentTextLower.indexOf("buy this domain") > -1){
				return false;
			}
			if(contentText.indexOf("404 Not Found") > -1){
				return false;
			}
		}catch(ex){
			//alert("documentTitle is null or undefined")
		}
		return true;
	},
	getUrlToCopy: function(){
		var urlToCopy = gBrowser.contentDocument.location.href;
		var PREFER_LONG = this.prefs().getBoolPref("extensions.getarchive.prefer-long-link");
		if(content.location.href.indexOf("archive.is") > -1 && PREFER_LONG == true){
			urlToCopy = content.document.getElementById("SHARE_LONGLINK").getAttribute("value");
		}
		return urlToCopy;
	},
	copytoclipboard: function(){
		//var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
		that=this;
		copied=false;
		var maxtries = 20 * (1000 / wait); // wait 200ms means 5 per second, so do this 15 seconds
		var tries = 0;
		
		var func = function(){
			if(copied && content.document.title.indexOf("+") == 0 || tries + 1 == maxtries){
				return; // already copied
			}
			if(that.isurlloaded()){
				//clipboard.copyString(gBrowser.contentDocument.location.href);
				// was &&
				if(content.document.title == "" || content.document.title == "Internet Archive Wayback Machine"){
					tries++;
					window.setTimeout(func, wait);
				}else{
					if(that.isurlvalid()){
						// (content.document.contentType == "application/pdf" && content.document.getElementById("splitToolbarButtonSeparator") == null)
						if(content.document.title == "Internet Archive Wayback Machine" || content.document.title.indexOf("PDF.js") > -1){
							// let's hope this is "Redirecting to..." (no reliable way to check)
							tries++;
							window.setTimeout(func, wait);
						}else{
							that.copytoclipboardv2(that.getUrlToCopy());
							copied = true;
							content.document.title = "+" + content.document.title;
						}
					}
				}
			}else{
				if(that.isurlvalid()){

					// this is the same as (!document.readyState === "complete") (but better)
					// that.getcontenttext()==""{ // valid page, not loaded yet
					tries++;
					window.setTimeout(func, wait);
					
					//if(that.getcontenttext()==""){ //not loaded yet
						// valid page (keeps loading?)
					//	window.setTimeout(func, wait);
					//}else{
					//	if(gBrowser.contentDocument.location.href.indexOf("archive.is") > -1 && gBrowser.contentDocument.location.href.length < 30){
					//		that.copytoclipboardv2(gBrowser.contentDocument.location.href);
					//		copied = true;
					//		content.document.title = "+" + content.document.title;
					//	}
					//}
					
				}else{
					// Invalid page (focus wrong?)
					// Stop here (we cannot pass the URL between page loads)
				}
			}
		};
		window.setTimeout(func,800); // one to start with
	},
	copytoclipboardv2: function(text){
		var str = Components.classes["@mozilla.org/supports-string;1"].
		createInstance(Components.interfaces.nsISupportsString);
		if (!str) return false;
		str.data = text;

		var trans = Components.classes["@mozilla.org/widget/transferable;1"].
		createInstance(Components.interfaces.nsITransferable);
		if (!trans) return false;

		trans.addDataFlavor("text/unicode");
		trans.setTransferData("text/unicode", str, text.length * 2);

		var clipid = Components.interfaces.nsIClipboard;
		var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
		if (!clip) return false;

		clip.setData(trans, null, clipid.kGlobalClipboard);
	},
	getpartialurl: function(fullurl){
		var locationHttp = fullurl.indexOf("://", 20); // second occurence
		var locationHttpStart = -1;
		if(locationHttp > 1){
			locationHttpStart = fullurl.indexOf("http", locationHttp - 6);
		}
		return fullurl.substring(locationHttpStart);
	},
	getlocationfrompage: function(){
		// get URL from HTML
		var pageLocation = "";
		
		if(gBrowser.contentDocument.location.href.indexOf("archive.today") > -1 || gBrowser.contentDocument.location.href.indexOf("archive.is") > -1){
			var inputElements = window.content.document.body.getElementsByTagName("input");
			for (i = 0; i < inputElements.length; i++) {
				var contentText = this.getInnerBody();
				var redirectedFromPos = contentText.indexOf("Redirected from");
				
				if(redirectedFromPos > -1){ // prefer "Redirected from"
					var httpPos = contentText.indexOf("http", redirectedFromPos);
					var httpPosEnd = contentText.indexOf("\"", httpPos);
					pageLocation = contentText.substring(httpPos, httpPosEnd);
				}
				
				if(inputElements[i].getAttribute("name") == "q" && pageLocation == ""){ // q can occur multiple times
					pageLocation = this.getpartialurl(inputElements[i].getAttribute("value"));
				}
			}
		}
		return pageLocation;
	},
	getLinkFromMediaWikiSelection: function(currentLocation, pageLocation){
		if((currentLocation.indexOf("action=submit") > -1 || currentLocation.indexOf("action=edit") > -1) && pageLocation == "") {
			var content = readFromClipboard();
			if(content != undefined){
				var protocolPos = content.indexOf("://");
				var ampersand = content.indexOf("&");
				if(ampersand == -1){
					ampersand = content.length;
				}
				var otherPos = this.getInnerBody().indexOf(content.substring(0,ampersand));
				
				if(protocolPos > -1 && otherPos > -1){  // sometimes copying to clipboard fails (for no reason)
					pageLocation = content;
				}
			}else{
				this.showMessage("Try again after reloading the page");
			}
		}
		return pageLocation;
	},
	gettodayarchive: function(buttoncode){
		var pageLocation = "";
		var linkToPage = null;
		var currentLocation=gBrowser.contentDocument.location.href;

		getarchive_website="archive.is"
		try{
			pageLocation = gContextMenu.linkURL;
		}catch(err){
		    pageLocation = "";
		}
		
		/*currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");*/
		//currentLocation = currentLocation.replace("http://web.archive.org/web/");
				
		if(this.getcontenttext().indexOf("No results") > -1 && currentLocation.indexOf("archive.is") > -1){
			return; // no need for this
		}
		
		// http://archive.is/http://link-to.url/page -> http://archive.is/ixIyjm		
		if(currentLocation.indexOf("archive.today") > -1 || currentLocation.indexOf("archive.is") > -1){
			try{
				//linkToPage = content.document.getElementsByClassName("TEXT-BLOCK")[0].getElementsByTagName("a")[0].getAttribute("href");
				linkToPage = content.document.getElementsByClassName("THUMBS-BLOCK")[0].getElementsByTagName("a")[0].getAttribute("href");
				window.content.location.href = linkToPage;
				this.copytoclipboard();
				return;
			}catch(e){
				
			}
		}
		
		pageLocation = this.getLinkFromMediaWikiSelection(currentLocation, pageLocation);

		var indexLocation = pageLocation; // make a new variable that won't conflict with the code below
		if (pageLocation == ""){
			indexLocation = currentLocation;
		}
		if(indexLocation.indexOf("web.archive.org/web/") > -1 || indexLocation.indexOf("http://web.archive.org/save/_embed/") > -1){
			// we have some kind of filled in link
			var indexHttp = indexLocation.indexOf("http", 20);
			if(indexHttp > -1){
				window.content.location.href = "https://archive.is/" + this.cleanurl(indexLocation.substring(indexHttp));
				this.copytoclipboard(); //added
				return;
			}/*else{
				currentLocation = window.content.location.href; // works good so far
			}*/
		}
	
		if (pageLocation.length < 4){
			//alert("currentLocation is " + currentLocation);
			pageLocation = currentLocation;
			if(currentLocation.indexOf("Overleg:") > -1){
				temp = this.getPageLocation();
				if (temp != "NONE"){
					//alert("Lets use the page location");
					//alert("Page location is now " + temp);
					pageLocation = temp;
				}
			}
		}

		if(window.content.location.href.indexOf("wiki") > -1 || buttoncode > 0){
			gBrowser.selectedTab = this.insertTab("http://archive.is/"+this.cleanurl(pageLocation));
		}else{
			window.content.location.href = "https://archive.is/" + gBrowser.contentDocument.location.href;
		}
		this.copytoclipboard(); //added
	},
	prefs: function(){
		return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
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
	gosearch: function(buttoncode){
		var currentLocation=gBrowser.contentDocument.location.href;
		
		currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");

		if(currentLocation.indexOf("web.archive.org/web/2") > -1 || currentLocation.indexOf("web.archive.org/web/1") > -1 || currentLocation.indexOf("http://web.archive.org/save/_embed/") > -1){
			var indexHttp = currentLocation.indexOf("http", 20);
			if(indexHttp > -1){
				currentLocation = currentLocation.substring(indexHttp);
			}
		}

		var linkToPage = this.getlocationfrompage(); //archive.today
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
			var l = content.document.createElement("a");
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
				currentLocation = content.document.getElementById("lst-ib").value;
				break;
			case "duckduckgo":
				currentLocation = content.document.getElementById("search_form_input").value;
				 break;
			case "ecosia":
				currentLocation = content.document.getElementById("searchInput").value;
				break;
			default:
				var startOfSearchEngineName = content.document.title.lastIndexOf(" -");
				var matchObject = content.document.body.innerHTML.match(/search/g);
				if(matchObject != null && matchObject.length > 20){ //isSearchPage
				var currentTitleLower = content.document.title.toLowerCase();
					if(startOfSearchEngineName > -1){
						if(currentTitleLower.indexOf(hostname) > -1){
							currentLocation = content.document.title.substring(0, currentTitleLower.indexOf(hostname) - 2);
						}
					}
				}
				break;
		}
		
		
		var engine = "auto";
		try{
			engine = this.prefs().getCharPref("extensions.getarchive.engine");
		}catch(ex){
			this.showMessage("Please set your favorite search engine in the GetArchive preferences.");
		}
		var browserengine = "google";
		try{
			browserengine = this.prefs().getCharPref("browser.search.defaultenginename");
		}catch(e){
			this.showMessage("You don't seem to have search engines installed. Defaulting to Google.");
		}
		
		// chrome://browser-region/locale/region-properties
		if(browserengine.indexOf("chrome://") > -1){
			try{
				/*var branch = this.prefs().getBranch("browser.search");
				var value = branch.getComplexValue("defaultenginename",Components.interfaces.nsIPrefLocalizedString).data;
				browserengine = value;*/
				
				var value = this.prefs().getComplexValue("browser.search.defaultenginename",Components.interfaces.nsIPrefLocalizedString).data;
				browserengine = value;
			}catch(e){
				this.showMessage("Failed to retrieve the default search engine." + value);
			}
		}
		browserengine = browserengine.toLowerCase();

		var bss = Components.classes["@mozilla.org/browser/search-service;1"].getService(Components.interfaces.nsIBrowserSearchService);
		var engines = bss.getVisibleEngines({});
		var i = 0;

		switch(engine){
			case "auto":
				// get current search engine URL
				//browser.search.defaultenginename
				
				for(i = 0; i < engines.length; i++){
					//alert(engines[i].searchForm);
					if(engines[i].name.toLowerCase() == browserengine){
						// we don't have the URL of browser.search.defaultenginename, but we can get it now!
						// http://superuser.com/questions/960177/how-to-get-the-url-to-the-current-search-engine-in-firefox
						currentLocation = engines[i].getSubmission(currentLocation, null).uri.spec;
					}
					//alert(engines[i].name + " " + engines[i].getSubmission(currentLocation, null).uri.spec);
				}
												
				break;
			case "duckduckgo":
				currentLocation = "https://duckduckgo.com/?q=" + currentLocation; break;
			case "google":
				currentLocation = "https://google.com/search?q=" + currentLocation; break;
			case "bing":
				currentLocation = "https://bing.com/search?q=" + currentLocation; break;
			default:
				if(engine.indexOf("http") > -1){
					currentLocation = engine + currentLocation;
				}
				break;
		}
		
		if(window.content.location.href.indexOf("wiki") > -1 || buttoncode > 0){
			gBrowser.selectedTab = this.insertTab(currentLocation);
		}else{
			window.content.location.href = currentLocation;
		}     
	},
	paste: function(){
		if(content.getSelection().toString().indexOf("[") == 0){
			var clipboardContent = this.readclipboardv2();
			var newClipboardContent = "[" + clipboardContent;
			this.copytoclipboardv2(newClipboardContent);
		}
		// document.execCommand('paste') might work as well
		goDoCommand('cmd_paste');
		if(newClipboardContent != null || newClipboardContent != undefined){
			this.copytoclipboardv2(clipboardContent);
		}
	},
	readclipboardv2: function(){
		var trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
		trans.init(null)
		trans.addDataFlavor("text/unicode");

		Services.clipboard.getData(trans, Services.clipboard.kGlobalClipboard);

		var str       = {};
		var strLength = {};

		trans.getTransferData("text/unicode", str, strLength);

		if (str) {
		  return str.value.QueryInterface(Ci.nsISupportsString).data;
		}
		return ""
	},
	pastecomment: function(){
		// paste with <!-- Archieflink: -->
		var	clipboardText = this.readclipboardv2();

		if(clipboardText != ""){
			if(window.content.location.href.indexOf("nl.wikipedia.org") > -1){
				newClipboardText = "<!-- Archieflink: " + clipboardText + " -->"
				this.copytoclipboardv2(newClipboardText); // we can't paste random text, only from clipboard
				goDoCommand('cmd_paste');
				this.copytoclipboardv2(clipboardText); //restore url to clipboard
			}else{
				goDoCommand('cmd_paste');
			}
		}
	},
	getInnerBody: function(){
		return window.content.document.body.innerHTML;
	},
	cleanurl: function(url){
		if(url == undefined){
			this.showMessage("Try reloading the page");
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
	showMessage: function(message,title){
		var alertsService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
		if(title == null){
			title = "Get Archive";
		}
		alertsService.showAlertNotification("", title, message, true, "", this, "");
	},
	insertTab: function(url){
		var related = true;
		try{
			related = this.prefs().getCharPref("browser.tabs.insertRelatedAfterCurrent");
		}catch(ex){
			// this browser hasn't properly set this preference, use the default
		}
		return gBrowser.addTab(url, {relatedToCurrent: related});
	},
	switchAction: function(event){
		//alert("hi" + event.button);
		switch(event.button){
			case 0:
				if (event.target.id == 'getarchive-statusicon' || event.target.id == 'getarchive-button') {
					var archiveService = this.prefs().getCharPref("extensions.getarchive.archive-service");
					switch(archiveService){
						case "archiveorg":
							getarchive.getarchiveorglink(-1);
							break;
						case "archiveis":
							getarchive.gettodayarchive(-1);
							break;
						default:
							getarchive.getarchiveorglink(-1);
							break;
					}
					
					//getarchive.getarchiveorglink(-1);
				}
			break;
		}
	},
	showDialog: function(url, params) {
		var paramObject = params ? params : this;
		return window.openDialog(
		  url,
		  '',
		  'chrome=yes,resizable=yes,toolbar=yes,centerscreen=yes,modal=no,dependent=no,dialog=no',
		  paramObject
		);
	},
}
//var urlbarElement = document.getElementById("urlbar");

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented) {
		return;
	}

	if (event.keyCode == 67 && !event.shiftKey && event.ctrlKey && !event.altKey && !event.metaKey) {

		if(document.hasFocus() && content.document.hasFocus() == false){
			// leave, we're working on the chrome (browser window), not its contents
			return;
		}

		var frameIdentifiers = ["iframe", "frame"];
		var i = 0;
		
		// Test URL: http://web.archive.org/web/20060504004551/http://www.beastiemuseum.com/
		for(i = 0; i < frameIdentifiers.length; i++){
			var frames = content.document.getElementsByTagName(frameIdentifiers[i]);
			if(frames.length > 0){
				var i = 0;
				for(i = 0; i < frames.length; i++){
					var frame = frames[i];
					var idoc = frame.contentDocument || frame.contentWindow.document;
					var frameselection = idoc.getSelection();
					if(frameselection == null){
						continue;
					}
					
					if(frameselection.toString().length > 0){
						return;
					}
				}
			}
		}		

		var enablectrlc = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch).getBoolPref("extensions.getarchive.enablectrlc");
		if(!enablectrlc){
			return;
		}

		var requirefocus = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch).getBoolPref("extensions.getarchive.enablectrlc");
		var activeElementToLower = content.document.activeElement.tagName.toLowerCase();
		if(requirefocus && (activeElementToLower == "textarea" || activeElementToLower == "input")){
			return;
		}
		
		if(gBrowser.contentDocument.location.href.indexOf("about:") > -1){
			return;
		}

		var urlToCopy = getarchive.getUrlToCopy();
		if(content.getSelection().toString().length == 0){
						
			if(getarchive_lastcopy == urlToCopy){
				return;
			}
			getarchive_lastcopy = urlToCopy;
			getarchive.showMessage(getarchive.urldecode(urlToCopy), "Copied URL to clipboard");
			getarchive.copytoclipboardv2(urlToCopy);
	
			if(content.document.title.indexOf("+") != 0){
				content.document.title = "+" + content.document.title;
			}
						
			// don't allow for double actions for a single event
			event.preventDefault();
			return;
		}
	}
}, true);	
