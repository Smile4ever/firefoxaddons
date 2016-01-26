var delete_reason = "";

var deletemw = {
	confirm: function() {
		var str=window.content.location.href;
		var deleteForm = content.document.getElementById("deleteconfirm");
		var submit = true;
		var autoconfirmwikipedia = true;
		var bodyContent = content.document.body.textContent;
		var bodyInnerContent = content.document.body.innerHTML;
		
		if(!this.isThereText(true)){
			this.closetab();
			return;
		}
		
		if(deleteForm == null){
			if(str.indexOf("wiki") > -1){
				this.deletepage();
				return;
			}else{
				// do not close pages other than wiki pages
				// unless the page has not yet finished loading
				/*if(content.document.readyState == 'complete'){
					this.closetab();
					return;
				}*/
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
			
			if(bodyInnerContent.indexOf("Hoofdpagina") == -1 && bodyInnerContent.indexOf("Geschiedenis") == -1){
				this.showMessage("This is not an unsupported wiki");
				return;
			}else{
				// probably nl.wikipedia.org
				if(wpReason.value.indexOf("afgehandeld") > -1 && delete_reason == ""){
					delete_reason = "Afgehandelde botmelding";
				}
				
				var location=wpReason.value.indexOf(": \"");
				if((wpReason.value.indexOf("#") > -1 && wpReason.value.indexOf("#") - location < 6) && !this.isSafeMode()){
					//wpReason.value = "Weesoverleg of overleg bij verwijderde pagina";
					wpReason.value = "Doorverwijzing naar niet-bestaande of verwijderde pagina, overbodige of onjuiste doorverwijzing";
				}else{
					if(delete_reason.length > 0){
						wpReason.value = delete_reason;
						delete_reason = "";
					}else{
						if(bodyInnerContent.indexOf("<p>Toelichting: <b>") == -1){
							this.showMessage("De verwijderreden kon niet geraden worden.");
							submit = false;	
						} // else: submit with reason given
					}
					//wpReason.value = "Afgehandelde botmelding";
				}
			}
		}

		if(submit){
			if(str.indexOf("wikipedia.org") == -1){
				deleteForm.submit();
			}else{
				if(autoconfirmwikipedia == true){
					// Waarschuwing: de pagina die u wilt verwijderen heeft ongeveer
					if(bodyContent.indexOf("mw-delete-warning-revisions") == -1 || bodyContent.indexOf("Waarschuwing: de pagina die u wilt verwijderen heeft ongeveer 2") > -1){
						deleteForm.submit();
					}else{
						this.showMessage("Pagina heeft > 2 versies geschiedenis, druk manueel op verwijderen");
						submit = false;
					}
				}else{
					submit = false; // do not close tab
				}
			}
			
			/*str = window.content.location.href;
			var titlestring = "title=";
			var titleloc = str.indexOf(titlestring);
			var actionloc = str.indexOf("&action=");
			var title = str.substring(titleloc + titlestring.length, actionloc);*/

			if(submit){
				var numberOfTries = 0;
				var func = function(){
					/*if(content.document.getElementById("firstHeading").innerHTML.indexOf(title) == -1){
						alert("ja");
					}*/
					
					// todo: make this more generic!
					if(content.document.title.indexOf("Action complete") > -1 || content.document.title.indexOf("Handeling voltooid") > -1){
						//this.showMessage("Closing..");
						//this.closetab();
						gBrowser.removeCurrentTab();
					}else{
						numberOfTries++;
						if(numberOfTries < 11){
							window.setTimeout(func, 200);
						}
					}
				};
				window.setTimeout(func, 100);
			}
			/*var that=this;
			var check = function()
			{
				if(!that.isThereText(true)){
					this.closetab();
					return;
				}
			}
			window.setTimeout(check, 1000);*/
			
		}
		
 	},
 	autoconfirm: function(){
		var that=this;
		var func = function(){
			var wpReason = content.document.getElementById("wpReason");
			if(wpReason == null){
				window.setTimeout(func, 200);
			}else{
				//that.showMessage("Autoconfirming..");
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
		/*if(mwContentText.indexOf("DOORVERWIJZING") > -1 || mwContentText.indexOf("REDIRECT") > -1){
			return true;
		}*/
		if(bodyInnerContent.indexOf("<p>#REDIRECT") > -1 || bodyInnerContent.indexOf("<p>#DOORVERWIJZING") > -1){
			return true;
		}
		if(bodyInnerContent.indexOf("<li>doorverwijzing") > -1 || bodyInnerContent.indexOf("<li>REDIRECT") > -1 || bodyInnerContent.indexOf("<li>DOORVERWIJZING") > -1){
			return true;
		}
		if(bodyInnerContent.indexOf("onzinnige redirect") > -1){
			return true;
		}
		return false;
	},
 	deletepage: function(){
		var str=window.content.location.href;
		var talk = false;
		var contentText = content.document.documentElement.innerHTML;
		var mwContentText = content.document.getElementById("mw-content-text").innerHTML;
		var i = 0;
		
		var bodyContent = content.document.body.textContent;
		var bodyContentLower = content.document.body.textContent.toLowerCase();
		var bodyInnerContent = content.document.body.innerHTML;
			
		if(!this.isThereText(false)){
			this.closetab();
			return;
		}
		
		var safemode = this.isSafeMode();		
		var delete_reason_doorverwijzing = "Doorverwijzing naar niet-bestaande of verwijderde pagina, overbodige of onjuiste doorverwijzing";
		
		if(bodyInnerContent.indexOf("Categorie:Wikipedia:Nuweg") > -1){
			var reclamePos = mwContentText.toLowerCase().indexOf("reclame");
			if(reclamePos > -1){
				if(!safemode){
					// /wiki/Categorie:Wikipedia:Weg
					// 8048 7819
					
					//var me = document.getElementsByTagName("html")[0].innerHTML;
					/*var me = contentText;
					var rec = me.indexOf("reclame");
					var ahrefbegin = me.indexOf("<a href=\"/wiki/Categorie:Wikipedia:Weg\"", rec - 80);
					var ahrefend = me.indexOf("</a>",rec);
					var reclamelinkzeus = me.substring(ahrefbegin,ahrefend+4);
					if(ahrefbegin > -1){
						// ZEUS mode is enabled, are we trusting this?
					}*/
					
					
					if(reclamePos > bodyContentLower.indexOf("chkqt7") + 400){ // fix false positive (origin: zeus mode)
						delete_reason = "Expliciete reclame";
						window.content.location.href = this.getActionURL("delete", str);
						//alert(reclamePos + " " + bodyContentLower.indexOf("chkqt7"));
						this.autoconfirm();
						return;
					}
				}else{
					this.closetab();
					return;
				}
			}
			//  || bodyContentLower.indexOf("zinnig") > -1	<-- source: {{Nuweg}}
			
			if(this.isRedirect(mwContentText, bodyInnerContent)){
				if(!safemode){
					delete_reason = delete_reason_doorverwijzing;
					window.content.location.href = this.getActionURL("delete", str);
					this.autoconfirm();
					return;
				}else{
					this.closetab();
					return;
				}
			}
		
			var firstHeading = content.document.getElementById("firstHeading").innerHTML;
			if(firstHeading.indexOf("Gebruiker:") > -1 && (mwContentText.toLowerCase().indexOf("eigen naamruimte") > -1)){
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
			
			//return;
			
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

			if(bodyContent.indexOf("Notificatie van CommonsTicker") > -1 || bodyContent.indexOf("Verzoek om afbeelding") > -1 || bodyContent.indexOf("Foto's van interwiki") > -1){
				delete_reason = "Afgehandelde botmelding";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
			if(bodyContent.indexOf("Machinevertaling") > -1){
				delete_reason = "Machinevertaling";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
			if(bodyContentLower.indexOf("niet-nederlandstalig") > -1){
				delete_reason = "Niet-Nederlandstalig of resultaat van een computervertaling";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
			if(bodyContent.indexOf("Verwijderingsnominatie") > -1 || bodyContent.indexOf("Afbeeldingsuggestie") > -1){
				delete_reason = "Afgehandelde botmelding";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
			
			if(bodyContentLower.indexOf("tekstdump") > -1){
				delete_reason = "Tekstdump";
				window.content.location.href = this.getActionURL("delete", str);
				this.autoconfirm();
				return;
			}
			
			// get link from template nuweg
			var startSearch = bodyInnerContent.indexOf("<p>Toelichting:");
			var endSearch = bodyInnerContent.indexOf(startSearch, "<br />");
				
			var linkStart = bodyInnerContent.indexOf("http", startSearch, endSearch);
			var linkEnd = bodyInnerContent.indexOf("\"", linkStart, endSearch);
			
			// check if the nuweg reason contains a link. If this is the case, privacy is probably not the delete reason we're looking for
			if(mwContentText.toLowerCase().indexOf("privacy") > -1 && linkStart == -1){
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
						var link = bodyInnerContent.substring(linkStart, linkEnd);
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
		// disabled code to prevent bot from getting stuck
		/*var talkPage = content.document.getElementById("ca-talk");
		if(talkPage){
			var attributenew = talkPage.getAttribute("class");
			if(attributenew == "new"){
				window.content.location.href = this.getActionURL("delete", str);
				return;
			}
		}*/
		
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

				xmlhttp.open("GET", str, true);
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
	weesoverleg: function(){
		var redirect = content.document.getElementById("mw-content-text").innerHTML;
		if(redirect.indexOf("redirectMsg") > -1 && redirect.indexOf("redirectMsg") < 20){
			if(redirect.indexOf("redlink=1") > -1){
				return true;
			}
		}
		if(redirect.indexOf("#DOORVERWIJZING") > -1 || redirect.indexOf("#REDIRECT") > -1){
			return true;
		}
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
		return partialurl;
	},
	showMessage: function(message){
		var alertsService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
		var title = "Fast Delete";

		alertsService.showAlertNotification("", title, message, true, "", this, "");
	},
	gotourl: function(str, mwContentText, talk, contentText){
		try{
			var count = mwContentText.match(/mw-headline/g);
		}catch(err){
			var count = 0;
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
				
		if(str.indexOf("nl.wikipedia") == -1 && firstP != "<p>" || str.indexOf("nl.wikipedia") > -1 && this.weesoverleg() == true){
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
						content.document.title = "Loading... Not allowed to delete this page";
						window.content.location.href = str+"edit";
					}
				}else{
					content.document.title = "Loading... Not allowed to delete this page";
					window.content.location.href = str+"edit";
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
	isSafeMode: function(){
		try{
			value = this.prefs().getBoolPref("extensions.fastdelete.safemode");
		}
		catch(err){
			value = false;
		}
		return value;
	},
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