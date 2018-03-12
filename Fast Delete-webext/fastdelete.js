let notificationsOk = false;
let delete_reason = "";
/*
 * TODO: "Weesoverleg of overleg bij verwijderde pagina"
 */

let fastdelete_safemode;
let fastdelete_onlybotnotifications;
let fastdelete_debug_dosubmit;
let fastdelete_autoconfirm_wikipedia;

function init(){
	let valueOrDefault = function(value, defaultValue){
		if(value == undefined)
			return defaultValue;
		return value;
	}

	browser.storage.local.get([
		"fastdelete_safemode",
		"fastdelete_onlybotnotifications",
		"fastdelete_debug_dosubmit",
		"fastdelete_autoconfirm_wikipedia"
	]).then((result) => {
		/*console.log("fastdelete_safemode " + result.fastdelete_safemode);
		console.log("fastdelete_onlybotnotifications " + result.fastdelete_onlybotnotifications);
		console.log("fastdelete_debug_dosubmit " + result.fastdelete_debug_dosubmit);
		console.log("fastdelete_autoconfirm_wikipedia " + result.fastdelete_autoconfirm_wikipedia);*/

		fastdelete_safemode = valueOrDefault(result.fastdelete_safemode, false);
		fastdelete_onlybotnotifications = valueOrDefault(result.fastdelete_onlybotnotifications, false);
		fastdelete_debug_dosubmit = valueOrDefault(result.fastdelete_debug_dosubmit, true);
		fastdelete_autoconfirm_wikipedia = valueOrDefault(result.fastdelete_autoconfirm_wikipedia, true);
	}).catch(console.error);
}
init();

var onError = function(result){

}

function confirm() {
	var str=window.location.href;
	var deleteForm = document.getElementById("deleteconfirm");
	var submit = true;
	//var bodyContent = document.body.textContent;
	var bodyInnerContent = document.body.innerHTML;
	var doSubmit = fastdelete_debug_dosubmit;
	var safemode = fastdelete_safemode;

	if(!this.isThereText(true) && document.readyState == "complete"){
		this.closeTabNow("notext");
		return;
	}

	if(deleteForm == null && document.readyState == "complete"){
		if(str.indexOf("wiki") > -1){
			this.deletepage();
			return;
		}
	}

	try{
		var wpReason = document.getElementById("wpReason");
		if(wpReason == null){
			return;
		}
	}catch(err){
		return;
	}

	let supported = false;

	if(str.indexOf("wiki.lxde") > -1) {
		//console.log("Delete reason is " + delete_reason);
		delete_reason = "Spam";
		wpReason.value = delete_reason;
		submitDeleteForm(deleteForm);
		return;
	}

	if(str.indexOf("nl.wikipedia.org") > -1){
		supported = true;

		if(
			(wpReason.value.toLowerCase().indexOf("afgehandeld") > -1
			|| wpReason.value.toLowerCase().indexOf("externe links aangepast") > -1
			|| wpReason.value.toLowerCase().indexOf("afbeeldingsuggestie") > -1
		) && delete_reason == ""){
			this.showMessage("Made a guess based on the nuweg reason.");
			delete_reason = "Afgehandelde botmelding";
			
			// Dare to delete - 5.0.2
			wpReason.value = delete_reason; // Added in 5.0.2
			submitDeleteForm(deleteForm); // Added in 5.0.2
			
			sendMessage("closeTabAfter500");
			//console.log("Delete reason is " + delete_reason);
		}

		// extra check
		if(delete_reason == "Afgehandelde botmelding"){
			if(str.indexOf("Overleg") == -1){
				delete_reason = ""; // this is not what we're looking for
				return;
			}
		}

		if(delete_reason.length > 0){
			if(delete_reason != "Afgehandelde botmelding" && fastdelete_onlybotnotifications){
				this.showMessage("De pagina mag niet verwijderd worden volgens de instellingen van Fast Delete.");
				this.closeTabNow("notallowed");
				return;
			}
			wpReason.value = delete_reason;
			delete_reason = "";
		}else{
			var location=wpReason.value.indexOf(": \"");

			if((wpReason.value.indexOf("#") > -1 && wpReason.value.indexOf("#") - location < 6) && (safemode || this.isWeesRedirect() && !fastdelete_onlybotnotifications)){
				//console.log("Delete reason is redirect!");
				wpReason.value = "Doorverwijzing naar niet-bestaande of verwijderde pagina, overbodige of onjuiste doorverwijzing";
			}

			if(wpReason.value.indexOf("De inhoud was:") > -1){
				if(!safemode){
					this.showMessage("De verwijderreden kon niet geraden worden.");
				}
				submit = false;
			}
		}
	}

	if(!supported){
		this.showMessage("This is not an unsupported wiki");
		return;
	}

	if(!submit){
		//console.log("submit is " + submit);
		return;
	}

	// Wikipedia.
	if(fastdelete_autoconfirm_wikipedia == false)
		return;
	var linksToHere = this.getLinksToHereURL();

	// Waarschuwing: de pagina die u wilt verwijderen heeft ongeveer
	if(bodyInnerContent.indexOf("mw-delete-warning-revisions") == -1 && bodyInnerContent.indexOf("de pagina die u wilt verwijderen heeft ongeveer ") == -1){
		submitDeleteForm(deleteForm);
		return;
	}

	if(wpReason.value.toLowerCase().indexOf("afgehandeld") > -1 || wpReason.value.toLowerCase().indexOf("afbeeldingsuggestie") > -1){
		// check history.
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
		this.closeTabNow("notsafe");
	}else{
		if(submitDeleteForm(deleteForm)){
			this.openTab(linksToHere);
		}
	}
}

function submitDeleteForm(deleteForm){
	if(fastdelete_debug_dosubmit){
		deleteForm.submit();
		return true;
	}else{
		this.showMessage("doSubmit is false");
		return false;
	}
}

function getLinksToHereURL(){
	var mwWarnings = document.getElementsByClassName("mw-warning");
	var i = 0;
	for(i = 0; i < mwWarnings.length; i++){
		if(mwWarnings[i].innerHTML.indexOf("VerwijzingenNaarHier") > -1){
			return "https://nl.wikipedia.org" + mwWarnings[i].getElementsByTagName("a")[0].getAttribute("href");
		}
	}
	return "";
}

function submitDeleteFormExternal(){
	var deleteForm = document.getElementById("deleteconfirm");
	submitDeleteForm(deleteForm);
}

function isThereText(isConfirm){
	var bodyContent = document.body.textContent;
	var bodyInnerContent = document.body.innerHTML;

	if(
		bodyContent.indexOf("There is currently no text in this page") > -1 ||
		bodyInnerContent.indexOf("noarticletext") > -1 ||
		bodyContent.indexOf("Cannot delete page") > -1 ||
		bodyContent.indexOf("kan niet verwijderd worden") > -1 ||
		bodyInnerContent.indexOf("noarticletext") > -1 ||
		bodyInnerContent.indexOf("Handeling voltooid") > -1 ||
		bodyInnerContent.indexOf("Action complete") > -1 ||
		bodyInnerContent.indexOf("User creation log") > -1 ||
		bodyContent.indexOf("has been deleted") > -1
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
}

function isRedirect(mwContentText, bodyInnerContent){
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
}

// this works
function actionOpenPages(){
	//console.log("openPages");
	var mwPages = document.getElementById("mw-pages");
	if(mwPages == null){
		return;
	}
	var i = 0;
	var ahrefs = mwPages.getElementsByTagName("a");
	for(i = 0; i < ahrefs.length; i++){
		openFocusedTab("https://nl.wikipedia.org" + ahrefs[i].getAttribute("href"));
	}
}

function deletepage(){
	var str=window.location.href;
	var safemode = fastdelete_safemode;

	if(document.readyState != "interactive" && document.readyState != "complete"){
		//console.log("document.readyState was " + document.readyState);
		return;
	}

	if(str.indexOf("action=delete") > -1){
		this.confirm();
		return;
	}

	if(str.indexOf("VerwijzingenNaarHier") > -1 || str.indexOf("WhatLinksHere") > -1){
		this.actionOpenTalkRedirects();
		return;
	}

	if(!safemode){
		if(str.indexOf("Categorie:Wikipedia:Nuweg") > -1){
			this.actionOpenPages();
			return;
		}

		if(str.indexOf("Special:NewPages") > -1){
			this.actionRemoveSpam();
			return;
		}

		// works on wiki.lxde.org (at least)
		if(document.title.indexOf("Broken redirects") > -1 || document.title.indexOf("Defecte doorverwijzingen") > -1){
			if(this.actionRemoveBrokenRedirects() != 0) return;
		}
	}

	var mwContentText = document.getElementById("mw-content-text");
	if(mwContentText == null){
		if(document.title.indexOf("404 Not Found") > -1){
			//window.location.href = this.getActionURL("delete", str);
			var titleOfPage = str.substring(str.lastIndexOf("en/")+3);
			e10sDeleteReason("Spam", "https://wiki.lxde.org/en/index.php?action=delete&title=" + titleOfPage);
			return;
		}else{
			this.closeTabNow("mwContentText == null");
			return;
		}
	}
	mwContentText = mwContentText.innerHTML;
	var contentText = document.documentElement.innerHTML;
	var bodyContent = document.body.textContent;
	var bodyContentLower = document.body.textContent.toLowerCase();
	var bodyInnerContent = document.body.innerHTML;
	var delete_reason_doorverwijzing = "Doorverwijzing naar niet-bestaande of verwijderde pagina, overbodige of onjuiste doorverwijzing";

	if(!safemode){
		if(str.indexOf("Special:") > -1){
			if(bodyInnerContent.indexOf("There are no results for this report") > -1){
				this.closeTabNow("no results");
				return;
			}
		}

		if(str.indexOf("diff") > -1){
			if(bodyInnerContent.indexOf("mw-rollback-link") > -1){
				this.actionRollback();
				return;
			}
		}
	}

	var mwContentTextLower = document.getElementById("mw-content-text").innerHTML.toLowerCase();
	var i = 0;

	//	|| bodyContent.indexOf("Geen enkele pagina, die aan de gekozen filters voldoet, verwijst naar") > -1
	if(!this.isThereText(false)){
		this.closeTabNow("thereisnotext");
		return;
	}

	if(str.indexOf("Wikimedia Foundation") > -1){
		//Our servers are currently experiencing a technical problem.
		window.location.reload();
		return;
	}

	// Afbeeldingsuggestie (manual & bot)
	if(
	     bodyContent.indexOf("Notificatie van CommonsTicker") > -1
	  || bodyContent.indexOf("Verzoek om afbeelding") > -1
	  || bodyContent.indexOf("Foto's van interwiki") > -1
	  || bodyContent.indexOf("Verwijderingsnominatie") > -1
	  || bodyContent.indexOf("Afbeeldingsuggestie") > -1
	  || bodyContent.indexOf("Suggestie voor afbeelding") > -1
	  || bodyContent.indexOf("Notificatie onbereikbare link weghaald") > -1
	  || bodyContent.indexOf("Externe links aangepast") > -1
	  || bodyContent.indexOf("externe link(s) gewijzigd") > -1
	){
		if(!safemode || (bodyInnerContent.indexOf("Categorie:Wikipedia:Nuweg") > -1 && str.indexOf("Overleg:") > -1)){
			e10sDeleteReason("Afgehandelde botmelding", this.getActionURL("delete", str));
			return;
		}else{
			if(!safemode){
				this.showMessage("Not safe enough to delete automatically. Please verify and manually click delete.");
				return;
			}else{
				this.showMessage("Not safe enough to delete " + document.title.replace(" - Wikipedia", "") + " automatically.");
				this.closeTabNow("notsafeenough-safemode");
				return;
			}
		}
	}

	// redirects
	var isPageRedirect = this.isRedirect(mwContentText, bodyInnerContent);
	if(isPageRedirect){
		if(!safemode){
			e10sDeleteReason(delete_reason_doorverwijzing, this.getActionURL("delete", str));
			return;
		}else{
			if(fastdelete_onlybotnotifications){
				this.closeTabNow("fastdelete_onlybotnotifications is true. Deleting redirects now is not something we support");
				return;
			}

			// isWeesRedirect
			try{
				var new_count = document.getElementsByClassName("redirectText")[0].getElementsByClassName("new").length;
			}catch(e){
				var new_count = 0;
			}

			if(new_count == 1 || (new_count == 0 && bodyInnerContent.indexOf("&amp;action=edit&amp;redlink=1") > -1)){
				e10sDeleteReason(delete_reason_doorverwijzing, this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("this is not something we support"); // close if we're in safe mode, this is not something we support (requires validation of a human / nuweg requirement)
				return;
			}
		}
	}

	if(bodyInnerContent.indexOf("Categorie:Wikipedia:Nuweg") > -1){
		var firstHeading = document.getElementById("firstHeading").innerHTML;
		if(firstHeading.indexOf("Gebruiker:") > -1 && mwContentTextLower.indexOf("eigen naamruimte") > -1){
			if(!safemode){
				e10sDeleteReason("Verzoek in eigen naamruimte aanvrager", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("safe mode - verzoek in eigen naamruimte aanvrager");
				return;
			}
		}

		if(bodyContentLower.indexOf("onzin") > -1 || bodyContentLower.indexOf("zinvol") > -1){
			if(!safemode){
				e10sDeleteReason("Geen zinvolle inhoud", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("safe mode - geen zinvolle inhoud");
				return;
			}
		}

		if(bodyContentLower.indexOf("experiment") > -1){
			if(!safemode){
				e10sDeleteReason("Experimenteerpagina", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("safe mode - experimenteerpagina");
				return;
			}
		}

		//	|| bodyContentLower.indexOf("vandalisme") > -1
		if(bodyContentLower.indexOf("geklieder") > -1 || bodyContentLower.indexOf("schuttingtaal") > -1){
			if(!safemode){
				e10sDeleteReason("Geklieder of ander [[Wikipedia:Vandalisme|vandalisme]]", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("safe mode - geklieder");
				return;
			}
		}

		if(bodyContent.indexOf("Machinevertaling") > -1){
			if(!fastdelete_onlybotnotifications){
				e10sDeleteReason("Machinevertaling", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("Machinevertaling detected, but only bot notifications");
				return;
			}
		}

		if(bodyContentLower.indexOf("tekstdump") > -1){
			if(!fastdelete_onlybotnotifications){
				e10sDeleteReason("Tekstdump", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("tekstdump detected, but only bot notifications");
				return;
			}
		}

		if(mwContentTextLower.indexOf("privacyschending") > -1){
			if(!safemode){
				e10sDeleteReason("Privacyschending", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("Privacyschending detected, but safe mode");
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
				e10sDeleteReason("Privacyschending", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("privacyschending - safe mode");
				return;
			}
		}

		if(mwContentTextLower.indexOf("niet-nederlandstalig") > -1 || mwContentTextLower.indexOf("computervertaling") > -1 || mwContentTextLower.indexOf("niet nederlandstalig") > -1){
			if(!fastdelete_onlybotnotifications){
				e10sDeleteReason("Niet-Nederlandstalig of resultaat van een computervertaling", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("niet-nederlandstalig / computervertaling detected, but only bot notifications");
				return;
			}
		}

		if(mwContentText.toLowerCase().indexOf("onjuist gebruik") > -1){
			if(!safemode){
				if(str.indexOf("Overleg") > -1){
					e10sDeleteReason("Onjuist gebruik [[Wikipedia:Overlegpagina|overlegpagina]]", this.getActionURL("delete", str));
				}
				if(str.indexOf("Kladblok") > -1){
					e10sDeleteReason("Onjuist gebruik van kladblok", this.getActionURL("delete", str));
				}
				if(str.indexOf("Gebruiker") > -1){
					e10sDeleteReason("Onjuist gebruik [[Wikipedia:Gebruikerspagina|gebruikerspagina]]", this.getActionURL("delete", str));
				}
				return;
			}else{
				this.closeTabNow("safe mode - onjuist gebruik");
				return;
			}
		}

		if(
			(mwContentText.toLowerCase().indexOf("copyvio") > -1 || mwContentText.toLowerCase().indexOf("copyright") > -1 || mwContentText.toLowerCase().indexOf("auteursrecht") > -1)
		){
			if(!safemode){
				delete_reason_copyvio = "Schending van [[Wikipedia:Auteursrechten|auteursrechten]] of geplaatst zonder [[Help:Toestemming|toestemming]], link ";

				if(linkStart == -1){
					// could not find the link
					this.showMessage("Please add the copyvio link manually");
					e10sDeleteReason(delete_reason_copyvio, this.getActionURL("delete", str));
				}else{
					var link = mwContentTextLower.substring(linkStart, linkEnd);
					e10sDeleteReason(delete_reason_copyvio + link, this.getActionURL("delete", str));
				}

				return;
			}else{
				this.closeTabNow("safe mode - auteursrechtenschending");
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
				e10sDeleteReason("Expliciete reclame", this.getActionURL("delete", str));
				return;
			}else{
				this.closeTabNow("safe mode - reclame");
				return;
			}
		}

		if(!fastdelete_onlybotnotifications){
			var hasFourRepeats = (/([a-zA-Z]).*?\1\1\1/).test(mwContentTextLower);
			if(hasFourRepeats){
				e10sDeleteReason("Geen zinvolle inhoud", this.getActionURL("delete", str));
				return;
			}
			if(mwContentTextLower.indexOf("ik ben") > -1 || mwContentTextLower.indexOf("ik heb") > -1){
				e10sDeleteReason("Geen zinvolle inhoud", this.getActionURL("delete", str));
				return;
			}
		}
	}

	if(str.indexOf("wiki.lxde.org") > -1) {
		if(mwContentText == null){
			this.closeTabNow("mwContentText is null");
			return;
		}
		var russian = /[а-яА-ЯЁё]/.test(mwContentTextLower);

		var loc = location.href;
		if(loc.indexOf("Special:Contributions") > -1 || loc.indexOf("Special:Block") > -1 || loc.indexOf("redlink=1") > -1){
			this.closeTabNow("wiki.lxde.org special");
			return;
		}

		var mwContentTextLower = mwContentText.toLowerCase();
		if(bodyInnerContent.indexOf("/en/Category:") == -1 || bodyInnerContent.indexOf("/en/Category:Spam") > -1){
			var title = document.getElementById("firstHeading").innerHTML;
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

			if(
				numberOfUpperCaseLetters + numberOfNumbers > 3 ||
				numberOfUpperCaseLetters == 3 && mwContentTextLower.indexOf("action=markpatrolled") > -1 ||
				mwContentTextLower.indexOf("a href") > -1 ||
				russian ||
				bodyInnerContent.indexOf("Category:Spam") > -1 ||
				mwContentTextLower.indexOf("@@") > -1
			){
				e10sDeleteReason("Spam", this.getActionURL("delete", str));
			}else{
				this.closeTabNow("could not find a thing to delete this page");
			}
			return;
		}else{
			this.closeTabNow("category present");
			return;
		}
	}

	// check if the talk page exists
	var talkPage = document.getElementById("ca-talk");
	if(talkPage){
		this.openTalkPageIfNeeded(talkPage, str);
		return;
	}

	this.closeTabNow("unrecognised page, why do you press F8? closing tab.");
}

function actionRemoveBrokenRedirects(){
	var mwContentTextContainer = document.getElementById("mw-content-text")
	var lis = mwContentTextContainer.getElementsByTagName("li");
	for(i = 0; i < lis.length; i++){
		if(lis[i].innerHTML.indexOf("<del>") > -1){
			// do not open a tab
		}else{
			var ahref = lis[i].getElementsByTagName("a")[0].href;
			openFocusedTab(ahref);
		}
	}
	/*this.closeTabNow("brokenredirects finished");*/
	return lis.length;
}

function openTalkPageIfNeeded(talkPage, str){
	if(fastdelete_safemode){
		this.closeTabNow("openTalkPageIfNeeded safemode");
		return;
	}

	if(str.indexOf("nl.wikipedia") > -1 && str.indexOf("Overleg") == -1){
		var talkPageLinkIsRed = talkPage.innerHTML.indexOf("redlink") > -1;

		if(talkPageLinkIsRed){
			this.closeTabNow("new > -1");
			return;
		}

		var index = str.indexOf("wiki/");
		var firstpart = str.substring(0, index + 5);
		var lastpart = str.substring(index+5);
		if(lastpart.indexOf(":") > -1){
			str = firstpart + "Overleg " + lastpart;
		}else{
			str = firstpart + "Overleg:" + lastpart;
		}

		sendMessage("openTalkPage", {url: str});
		//sendMessage("autoDeletePage", { url: str, reason: reason });
	}
}

function isWeesRedirect(){
	var redirect = document.getElementById("mw-content-text").innerHTML;
	if(redirect.indexOf("redirectMsg") > -1 && redirect.indexOf("redirectMsg") < 20){
		if(redirect.indexOf("redlink=1") > -1){
			return true;
		}
	}
	/*if(redirect.indexOf("#DOORVERWIJZING") > -1 || redirect.indexOf("#REDIRECT") > -1){
		return true;
	}*/
	return false;
}

function closeTabNow(reason){
	//console.log("Close reason: " + reason);
	sendMessage("closeTabNow");
}

function isMediaWiki(){
	//generator
	var i;
	var metaTags = document.getElementsByTagName("meta");

	for(i = 0; i < metaTags.length; i++){
		if(metaTags[i].getAttribute("name") == "generator"){
			return metaTags[i].getAttribute("content").indexOf("MediaWiki") > -1;
		}
	}
	if(window.location.href.indexOf("wiki") > 0){
		return true; // 404 Not Found
	}
	return false;
}

function getActionURL(action, partialurl){
	t_permalink = document.getElementById("t-permalink");
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
}

function showMessage(message){
	browser.runtime.sendMessage({"action": "notify", "data": message});
}

function actionOpenTalkRedirects(){
	var mwWhatlinkshereList = document.getElementById("mw-whatlinkshere-list");

	if(mwWhatlinkshereList == null){
		this.closeTabNow("mwWhatlinkshereList == null");
	}

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
		window.location.href = "https://nl.wikipedia.org/wiki/" + redirects[0];
	}else{
		for(i = 0; i < redirects.length; i++){
			openTab("https://nl.wikipedia.org/wiki/" + redirects[i]);
		}
		this.closeTabNow("opened page to redirects");
	}
}

function checkRedirect(linksToHere){
	var str = window.location.href;
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
				if(fastdelete_safemode){
					that.closeTabNow("could not check page, safe mode");
				}
			}else{
				if(ok){
					that.showMessage("Redirect checked: everything ok (<200 bytes)");
					that.submitDeleteFormExternal();
					that.openTab(linksToHere);
				}else{
					that.showMessage("Warning: not secure to delete. Page contains a history entry > 200 bytes.");
					if(fastdelete_safemode){
						that.closeTabNow("not secure to delete, safe mode");
					}
				}
			}
		}
	};
	xmlhttp.send();
}

function checkHistory(linksToHere){
	var str = window.location.href;
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
			let globalReplaceCount = 0;
			let renamedCount = 0;

			for(i = 0; i < users.length; i++){
				// For GlobalReplace, two formats are detected.
				// Bodhisattwa is https://commons.wikimedia.org/wiki/Commons:File_renaming/Global_replace
				// "Bodhisattwa", "Materialscientist", "DragonflySixtyseven"
				if(users[i].indexOf("GlobalReplace") > -1 || users[i].indexOf("commons.wikimedia.org/wiki/GR") > -1 || users[i].indexOf("https://commons.wikimedia.org/wiki/COM:FR") > -1){
					globalReplaceCount++;
				}

				if(users[i].indexOf("heeft de pagina") > -1 && users[i].indexOf("hernoemd") > -1){
					renamedCount++;
				}
				let locationQuote = users[i].indexOf("\"");
				users[i] = users[i].substring(1, locationQuote);
			}
			users = that.uniq(users); // don't count InternetArchiveBot twice

			let j = 0;
			let otherUsernames = [];
			let userNames = ["Lsjbot", "RomaineBot", "CommonsDelinker", "CommonsTicker", "E85Bot", "Erwin85TBot", "Pompidombot", "MeerderBot", "Jeroenbot", "RobotJcb", "GrashoofdBot", "RobotMichiel1972", "InternetArchiveBot"];

			for(i = 0; i < users.length; i++){
				let match = false;
				let historyEntry = users[i];
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

			let trustedCount = 0;
			let trustedUsers = ["Linkin", "Machaerus", "MartinD", "Hobbema"]; // , "Smile4ever", "Cycn"
			// TODO: it should check the last history entry

			for(i = 0; i < otherUsernames.length; i++){
				for(j = 0; j < trustedUsers.length; j++){
					if(otherUsernames[i].indexOf(trustedUsers[j]) > -1){
						trustedCount++;
					}
				}
			}

			let nuweg = false;
			let bodyText = document.getElementsByTagName("body")[0].innerHTML;
			if(otherUsernames.length == 1){
				nuweg = bodyText.indexOf("{{Nuweg") > -1 || bodyText.indexOf("{{nuweg") > -1;
			}

			if(xmlhttp.responseText.indexOf("Titel van") > -1){
				trustedCount++;
			}

			if((otherUsernames.length <= 1 || (otherUsernames.length - trustedCount - globalReplaceCount - renamedCount == 0) || (otherUsernames.length - globalReplaceCount - renamedCount == 1)) && (nuweg == true || !fastdelete_safemode)){
				that.showMessage("History checked: everything ok (" + (users.length - otherUsernames.length) + " bot(s), " + otherUsernames.length + " normal user(s), " + trustedCount + " trusted, " + globalReplaceCount + " GlobalReplace, " + renamedCount + " renamed)");
				that.submitDeleteFormExternal();

				//console.log("linksToHere is " + linksToHere);
				openTab(linksToHere);
			}else{
				that.showMessage("Warning: " + that.users((otherUsernames.length - trustedCount - globalReplaceCount - renamedCount), "non-trusted") + " Summary: " + that.users(otherUsernames.length, "non-bot") + ", " + that.users(trustedCount, "trusted") + ", " + that.users(globalReplaceCount, "GlobalReplace") + " and " + that.users(renamedCount, "rename"));
				if(fastdelete_safemode){
					that.closeTabNow("non-trusted users have edited the page, safe mode");
				}else{
					// go to edit page.
					window.location.href = window.location.href.replace("delete", "edit");
				}
			}
		}
	};
	xmlhttp.send();
}

function users(count, label){
	let suffix = "users";
	if(count == 1)
		suffix = "user";

	if(label == "non-trusted"){
		if(count == 1){
			suffix += " has edited this page.";
		}else{
			suffix += " have edited this page.";
		}
	}

	return count + " " + label + " " + suffix;
}

function uniq(a){
	return a.sort().filter(function(item, pos, ary) {
		return !pos || item != ary[pos - 1];
	});
}

function actionRollback(){
	let rollbackLinks = document.getElementsByClassName("mw-rollback-link");
	if(rollbackLinks == null) return;
	if(rollbackLinks.length == 0) return;

	var rollbackLink = rollbackLinks[0];

	if(rollbackLink.innerHTML.indexOf("InternetArchiveBot") > -1){
		rollbackLink.getElementsByTagName("a")[0].click();
		return;
	}
}

function actionRemoveSpam(){
	var newPagesURL = "https://wiki.lxde.org/en/index.php?title=Special:NewPages&namespace=all&limit=250&hidepatrolled=1";

	var spamPages = window.document.documentElement.getElementsByClassName("mw-newpages-pagename");
	var spamPagesLength = spamPages.length;
	if(spamPages.length){
		return;
	}
	// already start reloading
	if(window.location.href.indexOf("NewPages") > -1){
		window.location.href = newPagesURL;
	}

	var i = 0;
	for(i = 0; i < spamPages.length; i++){
		openFocusedTab("https://wiki.lxde.org" + spamPages[i].getAttribute("href") + "&action=delete");
	}

	var that = this;

	for(i = 0; i < spamPages.length * 3; i++){
		setTimeout(function(){
			that.confirm();
		}, (i + 1) * 400);
	}
}

function openTab(url){
	sendMessage("openTab", url);
}

function openFocusedTab(url){
	sendMessage("openFocusedTab", url);
}

window.addEventListener("keydown", function(event){
	if (event.defaultPrevented || document.activeElement.tagName.toLowerCase() != "body"){
		return;
	}

	if (event.keyCode == 88 && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
		if(document.activeElement.tagName.toLowerCase() != "textarea" && document.activeElement.tagName.toLowerCase() != "input"){
			sendMessage("closeTabNow");
			event.preventDefault();
			return;
		}
		// window.document.hasFocus() && 
	}

	if (event.keyCode == 88 && event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
		if(document.activeElement.tagName.toLowerCase() != "textarea" && document.activeElement.tagName.toLowerCase() != "input"){
			//console.log("shift+x");
			sendMessage("closeWindow");
			event.preventDefault();
			return;
		}
		// window.document.hasFocus() && 
	}
});

// Listen for messages from the background script
browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
	switch(message.action){
		case "confirmWithReason":
			delete_reason = message.data;
			this.confirm();
			break;
		case "F8":
			if(isMediaWiki() == true){
				this.deletepage();
			}
			break;
		default:
			break;
	}
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function e10sDeleteReason(reason, url){
	sendMessage("autoDeletePage", { url: url, reason: reason });
}
