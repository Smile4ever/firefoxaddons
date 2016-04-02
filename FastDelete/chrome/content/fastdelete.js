/* 
 * TODO: "Weesoverleg of overleg bij verwijderde pagina"
 */
var delete_reason = "";

var deletemw = {
	confirm: function() {
		var str=window.content.location.href;
		var deleteForm = content.document.getElementById("deleteconfirm");
		var submit = true;
		var autoconfirmwikipedia = true;
		//var bodyContent = content.document.body.textContent;
		var bodyInnerContent = content.document.body.innerHTML;
		var doSubmit = this.isDoSubmit();
		var safemode = this.isSafeMode();
		
		if(!this.isThereText(true)){
			this.closetab();
			return;
		}
		
		if(deleteForm == null){
			if(str.indexOf("wiki") > -1){
				this.deletepage();
				return;
			}
		}
		
		try{
			var wpReason = content.document.getElementById("wpReason");
			if(wpReason == null){
				return;
			}
		}catch(err){
			return;
		}
			
		if(str.indexOf("wiki.lxde") > -1 || str.indexOf("oblivionmodwiki.com") > -1) {
			wpReason.value = "Spam";
		}else{
			// Waarschuwing: andere pagina's verwijzen naar
			if(bodyInnerContent.indexOf("Hoofdpagina") == -1 && bodyInnerContent.indexOf("Geschiedenis") == -1){
				this.showMessage("This is not an unsupported wiki");
				return;
			}else{
				// probably nl.wikipedia.org
				if(wpReason.value.toLowerCase().indexOf("afgehandeld") > -1 && delete_reason == ""){
					this.showMessage("Made a guess based on the nuweg reason.");
					delete_reason = "Afgehandelde botmelding";
				}
				
				// extra check
				if(delete_reason == "Afgehandelde botmelding"){
					if(str.indexOf("Overleg") == -1){
						delete_reason = ""; // this is not what we're looking for
					}
				}
				
				if(delete_reason.length > 0){
					wpReason.value = delete_reason;
					delete_reason = "";
				}else{
					var location=wpReason.value.indexOf(": \"");
					if((wpReason.value.indexOf("#") > -1 && wpReason.value.indexOf("#") - location < 6) && (safemode || this.isWeesRedirect() && !this.isOnlyBotNotifications())){
						wpReason.value = "Doorverwijzing naar niet-bestaande of verwijderde pagina, overbodige of onjuiste doorverwijzing";
					}
					if(wpReason.value.indexOf("De inhoud was:") > -1){
						if(!safemode){
							this.showMessage("De verwijderreden kon niet geraden worden.");
						}
						submit = false;	
					}
					/*if(bodyInnerContent.indexOf("<p>Toelichting: <b>") == -1){
						if(!safemode){
							this.showMessage("De verwijderreden kon niet geraden worden.");
						}
						submit = false;	
					}*/
				}
			}
		}

		if(submit){
			if(str.indexOf("wikipedia.org") == -1){
				if(doSubmit){
					deleteForm.submit();
				}else{
					this.showMessage("doSubmit is false");
				}
			}else{
				if(autoconfirmwikipedia == true){
					var linksToHere = this.getLinksToHereURL();

					// Waarschuwing: de pagina die u wilt verwijderen heeft ongeveer
					if(bodyInnerContent.indexOf("mw-delete-warning-revisions") == -1){
						if(doSubmit){
							deleteForm.submit();
							this.closeWhenReady(submit, linksToHere);
						}else{
							this.showMessage("doSubmit is false");
						}
					}else{
						if(bodyInnerContent.indexOf("de pagina die u wilt verwijderen heeft ongeveer ") > -1){
							if(wpReason.value.toLowerCase().indexOf("afgehandeld") > -1){
								// check history.
								this.showMessage("geschiedenis controleren");
								this.checkHistory(linksToHere);
								return;
							}
							if(wpReason.value.toLowerCase().indexOf("doorverwijzing") > -1 || wpReason.value.toLowerCase().indexOf("redirect") > -1){
								this.showMessage("doorverwijzing checken");
								this.checkRedirect(linksToHere);
								return;
							}
							if(safemode){
								this.showMessage("This page is not safe to delete.");
								this.closetab();
							}else{
								if(doSubmit){
									deleteForm.submit();
									this.closeWhenReady(submit, linksToHere);
								}else{
									this.showMessage("doSubmit is false");
								}
							}
						}
					}
					
				}
			}
		}
 	},
 	getLinksToHereURL: function(){
		var mwWarnings = content.document.getElementsByClassName("mw-warning");
		var i = 0;
		for(i = 0; i < mwWarnings.length; i++){
			if(mwWarnings[i].innerHTML.indexOf("VerwijzingenNaarHier") > -1){
				return "https://nl.wikipedia.org" + mwWarnings[i].getElementsByTagName("a")[0].getAttribute("href");
			}
		}
		return "";
	},
 	submitDeleteForm: function(){
		var deleteForm = content.document.getElementById("deleteconfirm");
		if(this.isDoSubmit()){
			deleteForm.submit();
		}
	},
 	closeWhenReady: function(submit, linksToHere){
		// https://nl.wikipedia.org/w/index.php?title=Speciaal:Terugplaatsen&target=Overleg%3AFredrik_Reinfeldt
		
		if(submit){
			var numberOfTries = 0;
			var func = function(){
				// todo: make this more generic!
				if(content.document.title.indexOf("Action complete") > -1 || content.document.title.indexOf("Handeling voltooid") > -1){
					if(linksToHere == "" || linksToHere == undefined){
						gBrowser.removeCurrentTab();
					}else{
						window.content.location.href = linksToHere;
					}
				}else{
					numberOfTries++;
					if(numberOfTries < 11){
						window.setTimeout(func, 200);
					}
				}
			};
			window.setTimeout(func, 100);
		}
	},
 	autoconfirm: function(){
		var that=this;
		var func = function(){
			var wpReason = content.document.getElementById("wpReason");
			if(wpReason == null){
				window.setTimeout(func, 200);
			}else{
				content.document.title = "Autoconfirming..";
				that.confirm();
			}
		};
		window.setTimeout(func, 600);
	},
	isThereText: function(isConfirm){
		var bodyContent = content.document.body.textContent;
		var bodyInnerContent = content.document.body.innerHTML;
		
		if(
			bodyContent.indexOf("There is currently no text in this page") > -1 ||
			bodyInnerContent.indexOf("noarticletext") > -1 ||
			bodyContent.indexOf("Cannot delete page") > -1 ||
			bodyContent.indexOf("kan niet verwijderd worden") > -1 ||
			bodyInnerContent.indexOf("noarticletext") > -1 ||
			bodyInnerContent.indexOf("Handeling voltooid") > -1
			){
			return false;
		}
		if(!isConfirm){
			// bodyContent.indexOf("This page has been deleted") > -1 ||
			// bodyContent.indexOf("Deze pagina is verwijderd.") > -1 ||
			// bodyInnerContent.indexOf("mw-logevent-actionlink") > -1
			if(bodyInnerContent.indexOf("mw-logline-delete") > -1){
				return false;
			}
		}
		return true;
	},
	isRedirect: function(mwContentText, bodyInnerContent){
		if(bodyInnerContent.indexOf("redirectMsg") > -1){
			return true;
		}
		if(bodyInnerContent.indexOf("<p>#REDIRECT") > -1 || bodyInnerContent.indexOf("<p>#DOORVERWIJZING") > -1 || bodyInnerContent.indexOf("<p>#redirect") > -1 || bodyInnerContent.indexOf("<p>#doorverwijzing") > -1){
			return true;
		}
		if(bodyInnerContent.indexOf("<li>doorverwijzing") > -1 || bodyInnerContent.indexOf("<li>REDIRECT") > -1 || bodyInnerContent.indexOf("<li>DOORVERWIJZING") > -1 || bodyInnerContent.indexOf("<li>redirect") > -1){
			return true;
		}
		if(bodyInnerContent.indexOf("onzinnige redirect") > -1){
			return true;
		}
		return false;
	},
	openPages: function(){
		var mwPages = content.document.getElementById("mw-pages");
		if(mwPages == null){
			return;
		}
		var i = 0;
		var ahrefs = mwPages.getElementsByTagName("a");
		for(i = 0; i < ahrefs.length; i++){
			gBrowser.selectedTab = gBrowser.addTab("https://nl.wikipedia.org" + ahrefs[i].getAttribute("href"));
		}
	},
 	deletepage: function(){
		var str=window.content.location.href;
		var talk = false;
		var contentText = content.document.documentElement.innerHTML;
		var mwContentText = content.document.getElementById("mw-content-text").innerHTML;
		var mwContentTextLower = content.document.getElementById("mw-content-text").innerHTML.toLowerCase();
		var i = 0;
		
		var bodyContent = content.document.body.textContent;
		var bodyContentLower = content.document.body.textContent.toLowerCase();
		var bodyInnerContent = content.document.body.innerHTML;
		
		if(str.indexOf("VerwijzingenNaarHier") > -1){
			this.openTalkRedirects();
			return;
		}
		if(str.indexOf("Categorie:Wikipedia:Nuweg") > -1){
			this.openPages();
			return;
		}
		if(!this.isThereText(false)){
			this.closetab();
			return;
		}
		if(str.indexOf("Wikimedia Foundation") > -1){
			//Our servers are currently experiencing a technical problem.
			window.content.location.reload();
			return;
		}
		
		var safemode = this.isSafeMode();		
		var delete_reason_doorverwijzing = "Doorverwijzing naar niet-bestaande of verwijderde pagina, overbodige of onjuiste doorverwijzing";
		
		if(bodyContent.indexOf("Bij dit artikel is nog geen afbeelding of foto geplaatst.") > -1){
			this.closetab();
			return;
		}
		
		// Afbeeldingsuggestie (manual & bot)
		if(bodyContent.indexOf("Notificatie van CommonsTicker") > -1 || bodyContent.indexOf("Verzoek om afbeelding") > -1 || bodyContent.indexOf("Foto's van interwiki") > -1 || bodyContent.indexOf("Verwijderingsnominatie") > -1 || bodyContent.indexOf("Afbeeldingsuggestie") > -1 || bodyContent.indexOf("Suggestie voor afbeelding") > -1){
			if(!safemode || (bodyInnerContent.indexOf("Categorie:Wikipedia:Nuweg") > -1 && str.indexOf("Overleg:") > -1)){
				delete_reason = "Afgehandelde botmelding";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}else{
				if(!safemode){
					this.showMessage("Not safe enough to delete automatically. Please verify and manually click delete.");
					return;
				}else{
					this.showMessage("Not safe enough to delete automatically.");
					this.closetab();
					return;
				}
			}
		}

		// works on nl.wikipedia.org, en.wikipedia.org and wiki.lxde.org (at least)
		if(contentText.indexOf("BrokenRedirects") > -1){
			var links = content.document.getElementsByTagName("link");
			for(i = 0; i < links.length; i++){
				var linkhref = links[i].getAttribute("href");
				var positionIndexPHP = linkhref.indexOf("index.php");
				var positionApiPHP = linkhref.indexOf("api.php");
				if(links[i].getAttribute("rel").indexOf("canonical") > -1 && positionIndexPHP > -1){
					rootURL = linkhref.substring(0, positionIndexPHP); //https://nl.wikipedia.org/w/
				}
				if(links[i].getAttribute("rel").indexOf("EditURI") > -1 && positionApiPHP > -1){
					if(linkhref.indexOf("http://") == -1){
						rootURL = "https://";
					}
					rootURL += linkhref.substring(0, positionApiPHP); //https://nl.wikipedia.org/w/
					//<link rel="EditURI" type="application/rsd+xml" href="//en.wikipedia.org/w/api.php?action=rsd" />
					//<link rel="EditURI" type="application/rsd+xml" href="http://wiki.lxde.org/en/api.php?action=rsd" />
				}
			}
			
			var mwContentTextContainer = content.document.getElementById("mw-content-text")
			var lis = mwContentTextContainer.getElementsByTagName("li");
			for(i = 0; i < lis.length; i++){
				if(lis[i].innerHTML.indexOf("<del>") > -1){
					// do not open a tab
				}else{
					var ahref = lis[i].getElementsByTagName("a")[0].getAttribute("href");
					var indexPHP = ahref.indexOf("index.php");
					ahref = rootURL + ahref.substring(indexPHP);
					gBrowser.selectedTab = gBrowser.addTab(ahref);
				}
			}
			this.closetab();
			return;
		}
		
		// redirects
		var isPageRedirect = this.isRedirect(mwContentText, bodyInnerContent);
		if(isPageRedirect){
			if(!safemode){
				delete_reason = delete_reason_doorverwijzing;
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}else{
				// isWeesRedirect
				try{
					var new_count = content.document.getElementsByClassName("redirectText")[0].getElementsByClassName("new").length;
				}catch(e){
					var new_count = 0;
				}
												
				if(new_count == 1 || (new_count == 0 && bodyInnerContent.indexOf("&amp;action=edit&amp;redlink=1") > -1)){
					delete_reason = delete_reason_doorverwijzing;
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab(); // close if we're in safe mode, this is not something we support (requires validation of a human / nuweg requirement)
					return;
				}
			}
		}
		
		if(bodyInnerContent.indexOf("Categorie:Wikipedia:Nuweg") > -1){
			var firstHeading = content.document.getElementById("firstHeading").innerHTML;
			if(firstHeading.indexOf("Gebruiker:") > -1 && mwContentTextLower.indexOf("eigen naamruimte") > -1){
				if(!safemode){
					delete_reason = "Verzoek in eigen naamruimte aanvrager";
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}
			
			if(bodyContentLower.indexOf("onzin") > -1 || bodyContentLower.indexOf("zinvol") > -1){
				if(!safemode){
					delete_reason = "Geen zinvolle inhoud";
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}
			
			if(bodyContentLower.indexOf("experiment") > -1){
				if(!safemode){
					delete_reason = "Experimenteerpagina";
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}
			
			//  || bodyContentLower.indexOf("vandalisme") > -1
			if(bodyContentLower.indexOf("geklieder") > -1){
				if(!safemode){
					delete_reason = "Geklieder of ander [[Wikipedia:Vandalisme|vandalisme]]";
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}

			if(bodyContent.indexOf("Machinevertaling") > -1 && !this.isOnlyBotNotifications()){
				delete_reason = "Machinevertaling";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
						
			if(bodyContentLower.indexOf("tekstdump") > -1 && !this.isOnlyBotNotifications()){
				delete_reason = "Tekstdump";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
			
			if(mwContentTextLower.indexOf("privacyschending") > -1){
				if(!safemode){
					delete_reason = "Privacyschending";
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}
			}

			// get link from template nuweg
			var startSearch = mwContentTextLower.indexOf("<p>Toelichting:");
			var endSearch = mwContentTextLower.indexOf(startSearch, "<br />");
				
			var linkStart = mwContentTextLower.indexOf("http", startSearch, endSearch);
			var linkEnd = mwContentTextLower.indexOf("\"", linkStart, endSearch);
						
			// check if the nuweg reason contains a link. If this is the case, privacy is probably not the delete reason we're looking for
			if(mwContentTextLower.indexOf("privacy") > -1 && linkStart == -1){
				if(!safemode){
					delete_reason = "Privacyschending";
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}

			if((mwContentTextLower.indexOf("niet-nederlandstalig") > -1 || mwContentTextLower.indexOf("computervertaling") > -1 || mwContentTextLower.indexOf("niet nederlandstalig") > -1) && !this.isOnlyBotNotifications()){
				delete_reason = "Niet-Nederlandstalig of resultaat van een computervertaling";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
			
			if(mwContentText.toLowerCase().indexOf("onjuist gebruik") > -1){
				if(!safemode){
					if(str.indexOf("Overleg") > -1){
						delete_reason = "Onjuist gebruik [[Wikipedia:Overlegpagina|overlegpagina]]";
					}
					if(str.indexOf("Kladblok") > -1){
						delete_reason = "Onjuist gebruik van kladblok";
					}
					if(str.indexOf("Gebruiker") > -1){
						delete_reason = "Onjuist gebruik [[Wikipedia:Gebruikerspagina|gebruikerspagina]]";
					}
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}
			
			if(
				(mwContentText.toLowerCase().indexOf("copyvio") > -1 || mwContentText.toLowerCase().indexOf("copyright") > -1 || mwContentText.toLowerCase().indexOf("auteursrecht") > -1)
			){
				if(!safemode){
					delete_reason = "Schending van [[Wikipedia:Auteursrechten|auteursrechten]] of geplaatst zonder [[Help:Toestemming|toestemming]], link ";
					
					if(linkStart == -1){
						// could not find the link
						this.showMessage("Please add the copyvio link manually");
						window.content.location.href = this.getActionURL("delete", str);
					}else{
						var link = mwContentTextLower.substring(linkStart, linkEnd);
						delete_reason += link;
						window.content.location.href = this.getActionURL("delete", str);
						this.autoconfirm();
					}
									
					return;
				}else{
					this.closetab();
					return;
				}
			}
			// Genomineerd wegens reclame

			var startSearch = mwContentTextLower.indexOf("<p>Toelichting:");
			var endSearch = mwContentTextLower.indexOf(startSearch, "<br />");
				
			var reclamePos = mwContentTextLower.indexOf("reclame", startSearch, endSearch);
			if(reclamePos == -1){
				reclamePos = mwContentTextLower.indexOf("promo", startSearch, endSearch);
			}
			if(reclamePos > -1){
				if(!safemode){
					delete_reason = "Expliciete reclame";
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}
			
			/*var reclamePos = mwContentTextLower.indexOf("reclame");
			if(reclamePos == -1){
				reclamePos = mwContentTextLower.indexOf("promo ");
			}
			if(reclamePos > -1){
				if(!safemode){
					if(reclamePos > bodyContentLower.indexOf("chkqt7") + 400){ // fix false positive (origin: zeus mode)
						delete_reason = "Expliciete reclame";
						window.content.location.href = this.getActionURL("delete", str);
						this.autoconfirm();
						return;
					}
				}else{
					this.closetab();
					return;
				}
			}*/

		}
		if(str.indexOf("wiki.lxde") > -1) {
			if(mwContentText == null){
				this.showMessage("mwContentText is null");
				window.setTimeout(this.closetab(), 2000);
				return;
			}
			var mwContentTextLower = mwContentText.toLowerCase();
			if((mwContentText.indexOf("/en/") == -1 || mwContentText.indexOf("/en/index.php") > -1) && mwContentTextLower.indexOf("lxde") == -1 && bodyInnerContent.indexOf("Category:") == -1 && bodyInnerContent.toLowerCase().indexOf("gtk") == -1 && mwContentTextLower.indexOf("linux") == -1 && mwContentTextLower.indexOf("ubuntu") == -1){
				
				var title = content.document.getElementById("firstHeading").childNodes[0].innerHTML;
				var numberOfUpperCaseLetters = 0;
				var numberOfNumbers = 0;
				
				for(i = 0; i < title.length; i++){
					if(title[i] == title[i].toUpperCase()){
						if(title[i] != ":" && title[i] != "." && title[i] != "/"){
							if(isNaN(title[i])){
								numberOfUpperCaseLetters++;
							}else{
								numberOfNumbers++;
							}
						}
					}
				}

				/* 	numberOfUpperCaseLetters > 2 || */
				if(
					(numberOfUpperCaseLetters + numberOfNumbers) > 3 ||
					(numberOfUpperCaseLetters == 3 && bodyInnerContent.indexOf("action=markpatrolled") > -1)
				){
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
				}else{
					this.closetab();
				}
				return;
			}else{
				this.closetab();
				return;
			}
		}
		if(str.indexOf("oblivionmodwiki.com") > -1){
			window.content.location.href = this.getActionURL("delete", str);
			this.autoconfirm();
			return;
		}
		// check if the talk page exists
		var talkPage = content.document.getElementById("ca-talk");
		var talkExists = false;
		if(talkPage){
			var attributenew = talkPage.getAttribute("class");
			if(attributenew == null){
				this.closetab();
				return;
			}
			if(attributenew.indexOf("new") > -1){
				this.closetab();
				return;
			}else{
				talkExists = true;
			}
		}else{
			// does not exist
			this.closetab();
			return;
		}

		if(!safemode){
			if(str.indexOf("nl.wikipedia") > -1 && str.indexOf("Overleg") == -1){
				var index = str.indexOf("wiki/");
				var firstpart = str.substring(0, index + 5);
				var lastpart = str.substring(index+5);
				if(lastpart.indexOf(":")){
					str = firstpart + "Overleg " + lastpart;
				}else{
					str = firstpart + "Overleg:" + lastpart;
				}
				talk = true;
				
				xmlhttp=new XMLHttpRequest();

				try{
					xmlhttp.open("GET", str, true);
				}catch(e){
					this.showMessage("Access to restricted URL denied at " + str);
				}
				var that=this;
				xmlhttp.onload = function (e) {
				  if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
					  contentText=xmlhttp.responseText;
					  
					  var position = contentText.indexOf("mw-content-text");
					  var position2 = contentText.indexOf(">", position);
					  var position3 = contentText.indexOf("</div>", position2)
					  mwContentText = contentText.substring(position2+1, position3);
					  that.gotourl(str, mwContentText, true, contentText);
				  }
				};
				//xmlhttp.onerror = function (e) {
				//  console.error(xmlhttp.statusText);
				//};
				xmlhttp.send();
			}else{
				this.gotourl(str, mwContentText, false, contentText); // afgehandelde botmelding
			}
		}else{
			this.closetab();
		}		
	},
	isWeesRedirect: function(){
		var redirect = content.document.getElementById("mw-content-text").innerHTML;
		if(redirect.indexOf("redirectMsg") > -1 && redirect.indexOf("redirectMsg") < 20){
			if(redirect.indexOf("redlink=1") > -1){
				return true;
			}
		}
		/*if(redirect.indexOf("#DOORVERWIJZING") > -1 || redirect.indexOf("#REDIRECT") > -1){
			return true;
		}*/
		return false;
	},
	closetab: function(){
		// only allow wiki pages to be closed
		//if(this.isMediaWiki()){
		if(window.content.location.href.indexOf("zoho.com") == -1){
			getBrowser().removeCurrentTab();
			return true;
		}
		//}
		//return false;
	},
	closewindow: function(){
		window.close();
	},
	isMediaWiki: function(){
		//generator
		var counter;
		var metaTags = window.content.document.getElementsByTagName("meta");
		
		for(counter = 0; counter < metaTags.length; counter++){
			if(metaTags[counter].getAttribute("name") == "generator"){
				if(metaTags[counter].getAttribute("content").indexOf("MediaWiki") > -1){
					return true;
				}else{
					return false;
				}
			}
		}
		return false;
	},
	getActionURL: function(action, partialurl){
		t_permalink = content.document.getElementById("t-permalink");
		if(t_permalink){
			ahref = t_permalink.getElementsByTagName('a')[0];
			if(ahref){
				var locationoldid = ahref.href.indexOf("&oldid");
				partialurl = ahref.href.substring(0, locationoldid);
				partialurl = partialurl + "&action=" + action;
			}
		}
		if(partialurl.indexOf("action=") > -1){
			var actionlocation = partialurl.indexOf("&action");
			partialurl = partialurl.substring(0, actionlocation);
			partialurl = partialurl + "&action=" + action;
		}
		return partialurl;
	},
	showMessage: function(message){
		var alertsService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
		var title = "Fast Delete";

		alertsService.showAlertNotification("", title, message, true, "", this, "");
	},
	gotourl: function(str, mwContentText, talk, contentText){
		var count = 0;
		
		try{
			count = mwContentText.match(/mw-headline/g);
		}catch(err){
			count = 0;
		}
		if(count == null){
			count = 0;
		}	
		try {
			var countDodeLink = contentText.match(/id=\"Dode_/g).length;
		}
		catch(err){
			var countDodeLink = 0;
		}
	
		if(str.indexOf("&") > -1 || str.indexOf("?title") > -1){
			str=str+"&action=";
		}else{
			// <link rel="alternate" type="application/x-wiki" title="Edit" href="/en/index.php?title=User:Smile4ever/test&amp;action=edit" />
			
			var indexSlash = str.indexOf("/", 10);
			var baseURL = str.substring(0, indexSlash);
		    var links = content.document.getElementsByTagName('link');
			
			for ( var i=0; i<links.length; i++ ) {
				if ( links[i].getAttribute('rel') == 'edit') {
					str = links[i].getAttribute('href');
					if(talk){
						var index = str.indexOf("title=");
						var firstpart = str.substring(0, index + 6);
						var lastpart = str.substring(index+6);
						if(lastpart.indexOf(":")){
							str = firstpart + "Overleg " + lastpart;
						}else{
							str = firstpart + "Overleg:" + lastpart;
						}
					}
					str = str.replace("&amp;","&");
					str = baseURL + str.replace("&action=edit", "&action=");
				}
				if (links[i].getAttribute('rel') == 'EditURI'){ // older MediaWiki (like wiki.lxde.org)
					if(str.indexOf("&action=") > -1){
						// everything alright
					}else{
						// there is no action yet, add it (prevents failure on some older MediaWiki sites)
						//http://wiki.lxde.org/pt/Utilizador:Random (with text on page)		
						t_permalink = content.document.getElementById("t-permalink");
						if(t_permalink){
							ahref = t_permalink.getElementsByTagName('a')[0];
							if(ahref){
								var locationoldid = ahref.href.indexOf("&oldid");
								str = ahref.href.substring(0, locationoldid);
								str = str + "&action="
							}
						}
					}

				}
			}
		}
		mwContentText = mwContentText.replace("<p><br></p>",""); // fix for empty lines at the start
		mwContentText = mwContentText.replace("<p><br /></p>",""); // fix for empty lines at the start
		mwContentText = mwContentText.replace("<p></p>", ""); // fix for talk pages with TOC
		var firstP = mwContentText.substring(0,3); // mw-content-text
				
		if(str.indexOf("nl.wikipedia") == -1 && firstP != "<p>"){
			window.content.location.href = str+"delete";
		}else{
			if (str.indexOf("nl.wikipedia") > -1){
				if(
					(count.length == countDodeLink) && firstP != "<p>" ||
					(firstP != "<p>" && count.length == 2 && mwContentText.indexOf("Afbeeldingsuggestie") > -1) ||
					mwContentText.indexOf("<p>== Afbeeldingsuggestie ==</p>") > -1 ||
					mwContentText.indexOf("<p>n== Afbeeldingsuggestie ==</p>") > -1 ||
					mwContentText.indexOf("<p>= Afbeeldingsuggestie ==</p>") > -1
					){
					if(mwContentText.indexOf("<blockquote>") == -1){
						delete_reason="Afgehandelde botmelding";
						window.content.location.href = str+"delete";
						this.autoconfirm();
					}else{
						this.closetab();
						//content.document.title = "Loading... Not allowed to delete this page";
						//window.content.location.href = str+"edit";
					}
				}else{
					this.closetab();
					//content.document.title = "Loading... Not allowed to delete this page";
					//window.content.location.href = str+"edit";
				}
			}else{
				window.content.location.href = str+"delete";
			}
		}
		
		// immediately close tab when the page cannot be deleted. This has no effect on the Dutch Wikipedia (nl.wikipedia.org)
		setTimeout(function(){
			if(gBrowser.contentDocument.title.indexOf("Cannot delete") > -1){
				getBrowser().removeCurrentTab();
			}	
		},1400);
		
	},
	prefs: function(){
		return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
	},
	isOnlyBotNotifications: function(){
		try{
			return this.prefs().getBoolPref("extensions.fastdelete.onlybotnotifications");
		}catch(err){
			return false;
		}
	},
	isSafeMode: function(){
		try{
			return this.prefs().getBoolPref("extensions.fastdelete.safemode");
		}
		catch(err){
			return false;
		}
	},
	isDoSubmit: function(){
		try{
			return this.prefs().getBoolPref("extensions.fastdelete.debug.dosubmit");
		}
		catch(err){
			return true;
		}
	},
	openTalkRedirects: function(){
		mwWhatlinkshereList = content.document.getElementById("mw-whatlinkshere-list");
		lis = mwWhatlinkshereList.getElementsByTagName("li");
		if(lis == null){
			return;
		}
		i = 0;
		redirects = [];
		for(i = 0; i < lis.length; i++){
			ahref = lis[i].getElementsByTagName("a")[0];
			try{
				if(ahref.getAttribute("class").indexOf("mw-redirect") > -1){
					var pagetitle = ahref.getAttribute("title");
					if(pagetitle.indexOf("Overleg:") > -1){
						redirects.push(pagetitle);
					}
				}
			}catch(ex){}
		}
		
		if(redirects.length == 1){
			window.content.location.href = "https://nl.wikipedia.org/wiki/" + redirects[0];
		}else{
			for(i = 0; i < redirects.length; i++){
				gBrowser.addTab("https://nl.wikipedia.org/wiki/" + redirects[i]);
			}
			this.closetab();
		}		
	},
	checkRedirect: function(linksToHere){
		var str = window.content.location.href;
		var historyURL = this.getActionURL("history", str);
		xmlhttp=new XMLHttpRequest();

		xmlhttp.open("GET", historyURL, true);
		var that=this;
		xmlhttp.onload = function (e) {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				var beginPage = xmlhttp.responseText.indexOf("mw-content-text");
				var endPage = xmlhttp.responseText.lastIndexOf("Speciaal:Bijdragen");
				var page = xmlhttp.responseText.substring(beginPage, endPage);
				
				try{
					var history_sizes = page.match(/history-size\".*\"/g);
				}catch(e){
					var history_sizes = [];
				}

				if(history_sizes != null){
					if(history_sizes.length == 0){
						var nomatch = true;
					}
				}else{
					var nomatch = true;
				}
				
				var i = 0;
				var ok = true;
				
				/*if(history_sizes.length == 0){
					ok = false;
				}*/
				if(!nomatch){
					for(i = 0; i < history_sizes.length; i++){
						var locationBegin = history_sizes[i].indexOf("(");
						var locationEnd = history_sizes[i].indexOf(" bytes");
						history_sizes[i] = history_sizes[i].substring(locationBegin+1, locationEnd);
						
						if(parseInt(history_sizes[i]) > 200 && ok){
							ok = false;
						}
					}
				}
				
				if(nomatch){
					that.showMessage("Could not check the page.");
					if(that.isSafeMode()){
						that.closetab();
					}
				}else{
					if(ok){
						that.showMessage("Redirect checked: everything ok (<200 bytes)");
						that.submitDeleteForm();
						that.closeWhenReady(true,linksToHere);
					}else{
						that.showMessage("Warning: not secure to delete. Page contains a history entry > 200 bytes.");
						if(that.isSafeMode()){
							that.closetab();
						}
					}
				}
				
			}
		};
		xmlhttp.send();
	},
	checkHistory: function(linksToHere){
		var str = window.content.location.href;
		// https://nl.wikipedia.org/w/index.php?title=Speciaal:Terugplaatsen&target=Overleg%3APaksi_SE
		// https://nl.wikipedia.org/w/index.php?title=Overleg:Anten_%28volk%29&action=history
		
		var historyURL = this.getActionURL("history", str);
		xmlhttp=new XMLHttpRequest();

		xmlhttp.open("GET", historyURL, true);
		var that=this;
		xmlhttp.onload = function (e) {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				//xmlContentText = (new DOMParser()).parseFromString(xmlhttp.responseText, "text/xml");
				// pagehistory to </ul>
				var beginHistoryPage = xmlhttp.responseText.indexOf("mw-content-text");
				var endHistoryPage = xmlhttp.responseText.lastIndexOf("Speciaal:Bijdragen");
				var historyPage = xmlhttp.responseText.substring(beginHistoryPage, endHistoryPage);
		
				try{
					var users = historyPage.match(/\/Speciaal:Bijdragen\/.*\"/g);
				}catch(e){
					var users = [];
				}
				
				if(users == null){
					that.showMessage("users = null");
				}
				
				var i = 0;
				var globalReplaceCount = 0;

				for(i = 0; i < users.length; i++){
					// For GlobalReplace, two formats are detected.
					// Bodhisattwa is https://commons.wikimedia.org/wiki/Commons:File_renaming/Global_replace
					// "Bodhisattwa", "Materialscientist", "DragonflySixtyseven"
					if(users[i].indexOf("GlobalReplace") > -1){
						globalReplaceCount++;
					}else{
						if(users[i].indexOf("commons.wikimedia.org/wiki/GR") > -1){
							globalReplaceCount++;
						}
					}
					
					var locationQuote = users[i].indexOf("\"");
					users[i] = users[i].substring(1, locationQuote);
				}
				
				var j = 0;
				var otherUsernames = [];
				var userNames = ["Lsjbot", "RomaineBot", "CommonsDelinker", "CommonsTicker", "E85Bot", "Erwin85TBot", "Pompidombot", "MeerderBot", "Jeroenbot", "RobotJcb", "GrashoofdBot"];
				
				for(i = 0; i < users.length; i++){
					var match = false;
					var historyEntry = users[i];
					for(j = 0; j < userNames.length; j++){
						if(historyEntry.indexOf(userNames[j]) > -1){
							match = true;
						}
					}
					if(!match){
					   otherUsernames.push(historyEntry);
					}
				}

				otherUsernames = that.uniq(otherUsernames);

				var trustedCount = 0;
				var trustedUsers = ["Linkin", "Machaerus", "MartinD", "Hobbema"]; // , "Cycn"
				
				for(i = 0; i < otherUsernames.length; i++){
					for(j = 0; j < trustedUsers.length; j++){
						if(otherUsernames[i].indexOf(trustedUsers[j]) > -1){
							trustedCount++;
						}
					}
				}

				//var nuweg = false;
				/*var bodyText = content.document.getElementsByTagName("body")[0].innerHTML;
				if(otherUsernames.length == 1){
					if(bodyText.indexOf("Categorie:Wikipedia:Nuweg") > -1){
						nuweg = true;
					}
				}*/
				if(xmlhttp.responseText.indexOf("Titel van") > -1){
					trustedCount++;
				}
				//  && nuweg == true
				if(otherUsernames.length == 1 || (otherUsernames.length - trustedCount - globalReplaceCount == 0) || (otherUsernames.length - globalReplaceCount == 1) ){
					that.showMessage("History checked: everything ok (" + (users.length - otherUsernames.length) + " bot(s), " + otherUsernames.length + " normal user(s), " + trustedCount + " trusted, " + globalReplaceCount + " GlobalReplace" + ")");
					that.submitDeleteForm();
					that.closeWhenReady(true,linksToHere);
				}else{
					that.showMessage("Warning: " + (otherUsernames.length - trustedCount - globalReplaceCount) + " non-trusted users have edited this page. Summary: " + otherUsernames.length + " non-bot users, " + trustedCount + " trusted user(s) and " + globalReplaceCount + " GlobalReplace user(s)");
					if(that.isSafeMode()){
						that.closetab();
					}
				}
				
			}
		};
		xmlhttp.send();

	},
	uniq: function(a){
		return a.sort().filter(function(item, pos, ary) {
			return !pos || item != ary[pos - 1];
		})
	}
}
window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  if (event.keyCode == 88 && event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
    if(window.content.document.hasFocus() && !content.document.activeElement.tagName.toLowerCase() == "textarea" && !content.document.activeElement.tagName.toLowerCase() == "input"){
		deletemw.closewindow();
		event.preventDefault();
		return;
	}
  }

  switch (event.key) {
    case "Delete":
		// todo: implement an options window on what do to when the user presses delete
		// possible options: delete a page, delete a page immediately, close the tab..
		
		// check if modifier is pressed (ctrl, shift)
		// if pressed, return
		if(event.getModifierState("Alt") || event.getModifierState("Shift") || event.getModifierState("Control") || event.getModifierState("Meta") || event.getModifierState("OS") || event.getModifierState("AltGraph")){
			return;
		}
		
		// order is important here
		//console.log("has focus " + content.document.hasFocus);
		//console.log(window.content.document.activeElement.tagName == "BODY");
		if(window.content.document.hasFocus() && window.content.document.activeElement.tagName == "BODY"){
			if(deletemw.isMediaWiki() == true){
				deletemw.deletepage();
			}else{
				deletemw.closetab();
			}
		}else{
			return;
		}
				
      break;
    default:
      return;
  }
  
  // don't allow for double actions for a single event
  event.preventDefault();
  
}, true);