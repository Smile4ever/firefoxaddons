var deletemw = {
	confirm: function() {
		var str=window.content.location.href;
		var deleteForm = content.document.getElementById("deleteconfirm");

		if(content.document.body.textContent.indexOf("This page has been deleted") > -1){
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
		getBrowser().removeCurrentTab();
	},
	gotourl: function(str, mwContentText, talk, contentText){
		var count = contentText.match(/mw-headline/g);
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
						// this will probably fail, use another url (I need a good example for this code path. This is for a next release.)
											
						//str = content.document.getElementById("ca-talk").innerHTML;
						//str = str.substring(str.indexOf("/"), str.indexOf("&amp;"));
						
						////if(content.document.getElementById("ca-talk").innerHTML ) > -1){
						////	str = str.replace("_talk", "");
						////	str = str.replace("Talk:", "");

						////}
						//str = baseURL + str + "&action=";
						//alert(str + "fail");
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
				if((count.length == countDodeLink) && firstP != "<p>" || (firstP != "<p>" && count.length == 2 && mwContentText.indexOf("Afbeeldingsuggestie") > -1)){
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
