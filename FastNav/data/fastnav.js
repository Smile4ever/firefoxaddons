// TODO:
// if back history is available, use that (as an option in the settings)
// if forward history is available, use that (as an option in the settings)


self.port.on("init", function(value){
	typeahead_value = value;
});

self.port.on("prev", function(){
	generic("prev");
});
self.port.on("next", function(){
	generic("next");
});

var pagenum;
var typeahead_value;

window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }
  
  // check if modifier is pressed (ctrl, shift)
  // if pressed, return
  if(event.getModifierState("Shift") || event.getModifierState("Control") || event.getModifierState("Meta") || event.getModifierState("OS") || event.getModifierState("AltGraph")){
	return;
  }
  if(event.getModifierState("Alt") && (typeahead_value == false || isMediaWiki() == true )){
	return;
  }

  switch (event.keyCode) {
    case 78:
		// order is important here
		if(document.hasFocus() && document.activeElement.tagName == "BODY"){
			generic("next");
		}else{
			return;
		}
      break;
    case 66:
    case 80:
		// order is important here
		if(document.hasFocus() && document.activeElement.tagName == "BODY"){
			generic("prev");
		}else{
			return;
		}
      break;
    case 79:
      if(document.hasFocus() && document.activeElement.tagName == "BODY"){
		genericOpen();
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

function isMediaWiki(){
	//generator
	var counter;
	var metaTags = window.document.getElementsByTagName("meta");
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
}

function cleanurl(url){
	return decodeURIComponent(url.replace("&amp;", "&"))
}

function replacelocation(value, website){
	//alert(value + " - " + website);
	window.location.href = value;
}

function generic(mode){
	var location= window.location.href;
	var lastIndex = location.lastIndexOf("=");
	var pageNumber = location.substring(lastIndex+1);
	var stringlength = 1;
	var i = 0;

	// phoronix.com, http://punbb.informer.com, FluxBB
	// http://www.phoronix.com/forums/forum/phoronix/latest-phoronix-articles/823939-the-best-most-efficient-graphics-cards-for-1080p-linux-gamers/page2
	var linkTags = window.document.getElementsByTagName("link");
	for(i = 0; i < linkTags.length; i++){
		if(linkTags[i].getAttribute("rel") == mode){
			this.replacelocation(linkTags[i].getAttribute("href"), "<link rel");
			return;
		}
	}
	
	// reddit.com, phpBB
	var atags = document.getElementsByTagName("a");
	for(i = 0; i < atags.length; i++){
		if(atags[i].hasAttribute("rel")){
    	    if(atags[i].getAttribute("rel").indexOf(mode) > -1){
				this.replacelocation(atags[i].href, "<a rel");
				return;
			}
	   }
	}
	
	// MyBB
	if(mode == "next"){
		var value = document.getElementsByClassName("pagination_next")[0];
		if(value != undefined){
			this.replacelocation(document.getElementsByClassName("pagination_next")[0], "mybb (pagination_next)");
			return;
		}
	}
	
	if(location.indexOf("techradar.com") > -1){
		if (mode == "next" && location.lastIndexOf("/") < location.length - 3){ // there is no page filled in, add it
			this.replacelocation(window.location.href + "/2", "techradar.com");
			return;
		}

		if(location.lastIndexOf("/") > -1 && location.lastIndexOf("/") > location.length - 3){
			// increment or decrement
			lastIndex = location.lastIndexOf("/");
			pageNumber = location.substring(lastIndex+1);
				
			if(mode == "next"){
				window.location.href = window.location.href.substring(0, lastIndex) + "/" + (parseInt(pageNumber) + 1)
			}else{
				if(parseInt(pageNumber) == 2){
					window.location.href = window.location.href.substring(0, lastIndex) // there is a page filled in, remove it
				}else{
					window.location.href = window.location.href.substring(0, lastIndex) + "/" + (parseInt(pageNumber) - 1)
				}
			}
			return;
		}
	}
	
	// webwereld.nl, computerworld.nl etc.
	var paginatorNext = window.document.getElementsByClassName("paginator-next")[0];
	var paginatorPrevious = window.document.getElementsByClassName("paginator-previous")[0];
	
	if(mode == "next"){
		if(paginatorNext != undefined){
			this.replacelocation(paginatorNext.href, "webwereld next");
		}
	}else{
		if(paginatorPrevious != undefined){
			this.replacelocation(paginatorPrevious.href, "webwereld previous");
		}
	}
	
	// jenkov.com
	var nextPageJenkovCom = window.document.getElementsByClassName("nextArticleInCategory")[0];
	if(nextPageJenkovCom != null){
		if(mode == "next"){
			this.replacelocation(nextPageJenkovCom.parentElement.href, "jenkov.com");
			return;
		}else{
			window.history.back();
			return;
		}
	}
	
	// waarmaarraar.nl (prev/next article)
	if(location.indexOf("waarmaarraar.nl") > -1){
		var container = document.getElementsByClassName("span7")[0];
		var ahrefs = container.getElementsByTagName("a");
		var newahrefs = [];
		
		for(counter = 0; counter < ahrefs.length; counter++){
			var hrefattribute = ahrefs[counter].getAttribute("href");
			if(hrefattribute == null){
				continue;
			}
			if(hrefattribute.indexOf("/pages/re") > -1){
				newahrefs.push(ahrefs[counter]);
			}
		}

		if(newahrefs.length == 2){
			if(mode == "next" ){
				this.replacelocation(newahrefs[1].getAttribute("href"), "waarmaarraar.nl next");
			}else{
				this.replacelocation(newahrefs[0].getAttribute("href"), "waarmaarraar.nl prev");
			}
			return;
		}
		if(newahrefs.length == 1){
			// there is no previous/next page?
			this.replacelocation(newahrefs[0].getAttribute("href"), "waarmaarraar.nl next/prev");
			return;
		}
	}

	// chm
	var ahrefs = window.document.getElementsByClassName("a");
	var i = 0;
	for(i = 0; i < ahrefs.length; i++){
		if(ahrefs[i].getAttribute("alt") == "Next Page" && mode == "next"){
		}
		
		if(ahrefs[i].getAttribute("alt") == "Previous Page" && mode == "prev"){
			window.location.href = ahrefs[i];
		}
		return;
	}
	
	// clixsense adgrid
	if(location.indexOf("clixsense.com/en/ClixGrid") > -1){
		// /10/7?69738**
		var lastIndexSlash = location.lastIndexOf("/");
		var lastQuestionMark = location.lastIndexOf("?");
		var indexSlash = location.indexOf("/", lastIndexSlash - 6);
		
		var column = parseInt(location.substring(indexSlash+1,lastIndexSlash));// 1-30
		var row =  parseInt(location.substring(lastIndexSlash+1, lastQuestionMark)); // 1-20
		var userid = location.substring(lastQuestionMark + 1)
		if(mode == "next"){
			if(column < 30){
				column = column + 1;
			}else{
				if(row < 20){
					row = row + 1;
				}
			}
		}else{
			if(column > 1){
				column = column - 1;
			}else{
				if(row > 1){
					row = row - 1;
				}
			}
		}
		window.location.href = "http://www.clixsense.com/en/ClixGrid/" + column + "/" + row + "?" + userid;
		return;
	}
	
	// generic
	if(lastIndex == -1){
		//page-1
		stringlength = 5
		lastIndex = location.lastIndexOf("page-");
		pageNumber = location.substring(lastIndex+stringlength);
	}
	
	if (isNaN(parseInt(pageNumber) + 1) == false){
		if(mode == "next"){
			pagenum = parseInt(pageNumber) + 1;
		}else{
			// prev
			pagenum = parseInt(pageNumber) - 1;
		}
		var addendum = location.substring(lastIndex + stringlength+1);
		if(!isNaN(addendum)){
			addendum = "";
		}
		this.replacelocation(location.substring(0,lastIndex + stringlength) + pagenum + addendum, "generic");
	}
}
function genericOpen(){
	var i = 0;
	var location= window.location.href;
	
	if(location.indexOf("twoo.com") > -1){
		
		var photoCover = document.getElementsByClassName("photoCover")[0];
		var linkToProfile = "https://www.twoo.com/" + photoCover.getAttribute("data-user-info");
		//window.location.href = linkToProfile;
		
		/*var photoCoverTitle = document.getElementsByClassName("photoCover__info__title")[0];
		var profileAhref = photoCoverTitle.getElementsByTagName("a");
		profileAhref.setAttribute("href", linkToProfile);*/
		window.open(linkToProfile);
		return;
	}
	
	// waarmaarraar.nl
	if(location.indexOf("waarmaarraar.nl") > -1){
		// Read more
		var nextPageWMR = window.document.getElementsByClassName("readmore")[0];
		if(nextPageWMR != null){
			var alink = nextPageWMR.getElementsByTagName("a")[0];
			if(mode == "next"){
				window.location.href = alink.href;
				return;
			}
		}
		// Bronsite
		var alinks = document.getElementsByTagName("a");
		for(i = 0; i < alinks.length; i++){
			// ©
			var onclick = "";
			try{
				onclick = alinks[i].getAttribute("onclick");
			}catch(e){
				continue;
			}
			if(onclick == null){
				continue;
			}
			
			if(onclick.indexOf("/bronsite/") > -1){
				window.location.href = alinks[i].getAttribute("href");
				return;
			}
			
		}
	}
	
	// reddit interstitial page
	var interstitial = document.getElementsByClassName("interstitial")[0];
	if(interstitial != undefined){
		var buttons = document.getElementsByTagName("button");
		for(i = 0; i < buttons.length; i++){
			if(buttons[i].getAttribute("value") == "yes"){
				buttons[i].click();
				return;
			}
		}
	}
	
	if(location.indexOf("reddit.com") > -1){
		var titles = document.getElementsByClassName("title");
		for(i = 0; i < titles.length; i++){
			if(titles[i].hasAttribute("href")){
				window.location.href = titles[i].getAttribute("href");
				return;
			}
		}
	}
}
