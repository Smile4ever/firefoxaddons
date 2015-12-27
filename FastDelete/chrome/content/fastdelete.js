var delete_reason = "";
var deletemw = {
	confirm: function() {
		var str=window.content.location.href;
		var deleteForm = content.document.getElementById("deleteconfirm");

		// content.document.body.innerHTML.indexOf("mw-logline-delete")
		if(content.document.body.textContent.indexOf("This page has been deleted") > -1 || content.document.body.textContent.indexOf("There is currently no text in this page") > -1 || content.document.body.innerHTML.indexOf("noarticletext") > -1){
			this.closetab();
			return;
		}
		
		if(deleteForm == null){
			if(str.indexOf("wiki") > -1){
				this.deletepage();
				return;
			}else{
				// unless the page has not yet finished loading
				if(content.document.readyState == 'complete'){
					this.closetab();
					return;
				}
			}
		}
		
		try{
			var wpReason = content.document.getElementById("wpReason");
			
			if(str.indexOf("wiki.lxde") > -1 || str.indexOf("oblivionmodwiki.com") > -1) {
				wpReason.value = "Spam";
			}else{
				var location=wpReason.value.indexOf(": \"");
				if(wpReason.value.indexOf("#") > -1 && wpReason.value.indexOf("#") - location < 6){
					wpReason.value = "Weesoverleg of overleg bij verwijderde pagina";
				}else{
					wpReason.value = "Afgehandelde botmelding";
				}
			}
			
			// override
			if(delete_reason.length > 0){
				wpReason.value = delete_reason;
				delete_reason = "";
			}
			
			deleteForm.submit();
			setTimeout(function(){getBrowser().removeCurrentTab();}, 1200);
		}catch(err){
			// nothing to be done
		}
 	},
 	deletepage: function(){
		var str=window.content.location.href;
		var contentText = "";
		var talk = false;
		var mwContentText = "";
		
		var bodyContent = content.document.body.textContent;
		var bodyContentLower = content.document.body.textContent.toLowerCase();
		var bodyInnerContent = content.document.body.innerHTML;
		
		if(bodyContent.indexOf("This page has been deleted") > -1 || bodyContent.indexOf("There is currently no text in this page") > -1 || bodyInnerContent.indexOf("noarticletext") > -1){
			this.closetab();
			return;
		}
		if(bodyInnerContent.indexOf("Categorie:Wikipedia:Nuweg") > -1){
			if(bodyContent.indexOf("DOORVERWIJZING") > -1 || bodyContent.indexOf("REDIRECT") > -1){
				delete_reason = "Doorverwijzing naar niet-bestaande of verwijderde pagina, overbodige of onjuiste doorverwijzing";
				window.content.location.href = this.getActionURL("delete", str);
				return;
			}
			if(bodyContentLower.indexOf("onzin") > -1 || bodyContentLower.indexOf("zinvol") > -1 || bodyContentLower.indexOf("zinnig") > -1){
				delete_reason = "Geen zinvolle inhoud";
				window.content.location.href = this.getActionURL("delete", str);
				return;
			}
		}
		
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
			contentText = content.document.documentElement.innerHTML;
			mwContentText = content.document.getElementById("mw-content-text").innerHTML;
			this.gotourl(str, mwContentText, false, contentText);
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
	gotourl: function(str, mwContentText, talk, contentText){
		var count = mwContentText.match(/mw-headline/g);
				
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
					mwContentText.indexOf("<p>== Afbeeldingsuggestie ==</p>") > -1){
					if(mwContentText.indexOf("<blockquote>") == -1){
						window.content.location.href = str+"delete";
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
}
window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
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