var wait = 200;
var getarchive = {
   
	getarchiveorglink: function(buttoncode) {
		var currentLocation=gBrowser.contentDocument.location.href;
		var archiveOrgBaseURL = "http://web.archive.org/web/2005/"; //0000000000
		var pageLocation = "";
		
		try{
			pageLocation = gContextMenu.linkURL;
		}catch(err){
			pageLocation = "";
		}
		//currentLocation = currentLocation.replace("http://archive.today/", "");
				
		if(currentLocation.indexOf("web.archive.org/web/*/") > -1){
			window.content.location.href = currentLocation.replace("web.archive.org/web/*/", "web.archive.org/web/2005/");
			this.copytoclipboard();
			//pageLocation = "";
			//currentLocation = "";
			return;
		}

		// get URL from HTML
		if(currentLocation.indexOf("archive.today") > -1 || currentLocation.indexOf("archive.is") > -1){
			var inputElements = window.content.document.body.getElementsByTagName("input");
			for (i = 0; i < inputElements.length; i++) {
				if(inputElements[i].getAttribute("name") == "q"){
					pageLocation = inputElements[i].getAttribute("value");
				}
			}
		}

		if((currentLocation.indexOf("action=submit") > -1 || currentLocation.indexOf("action=edit") > -1) && pageLocation == "") {
			var content = readFromClipboard();
			
			if(content.indexOf("://") > -1){  // sometimes copying to clipboard fails (for no reason)
				pageLocation = content;
			}
		}

		if(currentLocation.indexOf("Overleg:") > -1 && gContextMenu == null){
			temp = this.getPageLocation();
			//alert(temp);
			if (temp != "" && temp != "NONE"){ //TODO: check this
				pageLocation = temp;
			}
		}

		if(pageLocation != ""){
			// right click / action-submit / action-edit

			if(buttoncode > 0 || currentLocation.indexOf("wiki") > -1){
				try{
					gBrowser.selectedTab = gBrowser.addTab(archiveOrgBaseURL+decodeURI(pageLocation)); //can fail (invalid URI)
				}catch(err){
					gBrowser.selectedTab = gBrowser.addTab(archiveOrgBaseURL+pageLocation);
				}
			}else{
				window.content.location.href = archiveOrgBaseURL+pageLocation;
			}
			this.copytoclipboard();
		}else{
			//alert("no pageLocation");
			if(currentLocation.indexOf("Overleg:") == -1){
			    pageLocation = gBrowser.contentDocument.location.href;
				pageLocation = pageLocation.replace("http://archive.today/", "");
				pageLocation = pageLocation.replace("https://archive.today/", "");
				pageLocation = pageLocation.replace("http://archive.is/", "");
				pageLocation = pageLocation.replace("https://archive.is/", "");
				
				window.content.location.href = archiveOrgBaseURL+pageLocation;
				this.copytoclipboard();
			}
		}
		//pageLocation = "";
		//currentLocation = "";
	},
	getPageLocation: function(){
		// this should only work on talk pages -> ca-talk with class selected indicates this is a talk page
		talkPageObject=content.document.getElementById("ca-talk");
		isTalkPage = false;

		if(talkPageObject != null && talkPageObject != undefined){
			if(talkPageObject.getAttribute("class") == "selected"){
				isTalkPage = true;
			}
		}
		pageLocation = "NONE";

		if(isTalkPage){
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
			}
			//else: not a talk page after all (archive.is is fooling us)
		}
		return pageLocation.split('amp;').join('');
	},
	isurlloaded: function(){
		if(gBrowser.contentDocument.location.href.indexOf("archive.org") > -1 || gBrowser.contentDocument.location.href.indexOf("archive.today") > -1 || gBrowser.contentDocument.location.href.indexOf("archive.is") > -1){
			if(gBrowser.contentDocument.location.href.indexOf("archive.org") > -1 && gBrowser.contentDocument.location.href.indexOf("archive.org/web/2005/") == -1){
				contentText = this.getcontenttext();
				
				if(contentText != ""){
					if(contentText.indexOf("Redirecting to...") > -1){
						return false;
					}
				}
				return this.isurlvalid();
			}
			if(gBrowser.contentDocument.location.href.length < 28){
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
		var documentTitle = content.document.title.toLowerCase();
		
		var http = new XMLHttpRequest();
		http.open("HEAD", gBrowser.contentDocument.location.href, true);
		http.onload = function (e) {
			if (http.readyState === 4){
				if(http.status === 404){
					return false;
				}else{
					return true;
				}
			}
		};
		http.onerror = function (e) {
		};
		http.send(null);
				
		/*if(content.document.title.indexOf("404") > -1){
			return false;
		}
		
		if(documentTitle.indexOf("not found") > -1){
			return false;
		}
		if(documentTitle.indexOf("niet gevonden") > -1){
			return false;
		}
		if(documentTitle.indexOf("cannot be found") > -1){
			return false;
		}
		if(this.getcontenttext().indexOf("Wayback Machine doesn't have that page archived.") > -1){
			return false;
		}
		if(this.getcontenttext().toLowerCase().indexOf("cannot be found") > -1){
			return false;
		}
		if(this.getcontenttext().toLowerCase().indexOf("page not found") > -1){
			return false;
		}*/
		
		return true;
	},
	copytoclipboard: function(){
		//var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
		that=this;
		copied=false;
		//console.log('[' + new Date().toUTCString() + '] ')

		var func = function(){
			if(copied && content.document.title.indexOf("+") == 0){
				return; // already copied
			}
			
			if(that.isurlloaded()){
				//clipboard.copyString(gBrowser.contentDocument.location.href);
				if(content.document.title == ""){
					window.setTimeout(func, wait);
				}else{
					that.copytoclipboardv2(gBrowser.contentDocument.location.href);
					copied = true;
					content.document.title = "+" + content.document.title;
				}
			}else{
				if(that.isurlvalid()){
					// this is the same as (!document.readyState === "complete") (but better)
					// that.getcontenttext()==""{ // valid page, not loaded yet
					window.setTimeout(func, wait);
				}else{
					// Invalid page (focus wrong?)
					// Stop here (we cannot pass the URL between page loads)
				}
			}
			if(content.document.readyState === "complete" && that.isurlvalid() && content.document.title.indexOf("+") == -1){
				copied = false;
				window.setTimeout(func,wait);
			}
		};
		window.setTimeout(func,wait); // one to start with
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
		locationHttp = fullurl.indexOf("://", 20); // second occurence
		return fullurl.substring(locationHttp);
	},	
	gettodayarchive: function(buttoncode){
		var pageLocation = "";
		var linkToPage = null;
		
		try{
			pageLocation = gContextMenu.linkURL;
		}catch(err){
		    pageLocation = "";
		}
		var currentLocation=gBrowser.contentDocument.location.href;
		
		currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");
		
		if(gBrowser.contentDocument.location.href.indexOf("archive.today") > -1 || gBrowser.contentDocument.location.href.indexOf("archive.is") > -1){
			try{
				linkToPage = window.content.document.getElementsByClassName("TEXT-BLOCK")[0].getElementsByTagName("a")[0].getAttribute("href");
			}catch(e){
				linkToPage = null;
			}
			if(linkToPage != null && linkToPage != undefined){
				window.content.location.href = linkToPage;
				this.copytoclipboard();
				return;
			}
		}
		
		if((currentLocation.indexOf("action=submit") > -1 || currentLocation.indexOf("action=edit") > -1) && pageLocation == "") {
			var content = readFromClipboard();
			
			if(content.indexOf("://") > -1){
				pageLocation = content;
			}
		}

		if(currentLocation.indexOf("web.archive.org/web/2") > -1 || currentLocation.indexOf("web.archive.org/web/1") > -1){
			// we have some kind of filled in link
			var indexHttp = currentLocation.indexOf("http", 20);
			if(indexHttp > -1){
				window.content.location.href = "https://archive.is/" + currentLocation.substring(indexHttp);
				this.copytoclipboard(); //added
				return;
			}else{
				currentLocation = window.content.location.href; // works good so far
			}
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
			gBrowser.selectedTab = gBrowser.addTab("http://archive.is/"+pageLocation);
		}else{
			window.content.location.href = "https://archive.is/" + gBrowser.contentDocument.location.href;
		}
		this.copytoclipboard(); //added
	},
	getgoogle: function(buttoncode){
		var currentLocation=gBrowser.contentDocument.location.href;
		
		currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");

		if(currentLocation.indexOf("web.archive.org/web/2") > -1 || currentLocation.indexOf("web.archive.org/web/1") > -1){
			var indexHttp = currentLocation.indexOf("http", 20);
			if(indexHttp > -1){
				currentLocation = currentLocation.substring(indexHttp);
			}
		}

		if(window.content.location.href.indexOf("wiki") > -1 || buttoncode > 0){
			gBrowser.selectedTab = gBrowser.addTab("http://google.com/search?q="+currentLocation);
		}else{
			window.content.location.href = "http://google.com/search?q=" + currentLocation;
		}     
	},
}
