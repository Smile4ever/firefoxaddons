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

  switch (event.keyCode) {
    case 78:
		// check if modifier is pressed (ctrl, shift)
		// if pressed, return
		if(event.getModifierState("Shift") || event.getModifierState("Control") || event.getModifierState("Meta") || event.getModifierState("OS") || event.getModifierState("AltGraph")){
			return;
		}
		if(event.getModifierState("Alt") && (typeahead_value == false || isMediaWiki() == true )){
			return;
		}
		// order is important here
		if(document.hasFocus() && document.activeElement.tagName == "BODY"){
			generic("next");
		}else{
			return;
		}
				
      break;
    case 66:
    case 80:
		// check if modifier is pressed (ctrl, shift)
		// if pressed, return
		if(event.getModifierState("Shift") || event.getModifierState("Control") || event.getModifierState("Meta") || event.getModifierState("OS") || event.getModifierState("AltGraph")){
			return;
		}
		if(event.getModifierState("Alt") && (typeahead_value == false || isMediaWiki() == true )){
			return;
		}
		
		// order is important here
		if(document.hasFocus() && document.activeElement.tagName == "BODY"){
			generic("prev");
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
function generic(mode){
	var location= window.location.href;
	var lastIndex = location.lastIndexOf("=");
	var pageNumber = location.substring(lastIndex+1);
	var stringlength = 1;
	
	var counter;
	var linkTags = window.document.getElementsByTagName("link");
	for(counter = 0; counter < linkTags.length; counter++){
		if(linkTags[counter].getAttribute("rel") == mode){
			// http://www.phoronix.com/forums/forum/phoronix/latest-phoronix-articles/823939-the-best-most-efficient-graphics-cards-for-1080p-linux-gamers/page2
			window.location.href = linkTags[counter].getAttribute("href");
			return;
		}
	}
	
	if(location.indexOf("reddit.com") > -1){
		/*var locationAfter = -1;
		var bodyhtml = document.body.innerHTML;
		if(mode == "next"){
			locationAfter = bodyhtml.indexOf("after=");
		}else{
			locationAfter = bodyhtml.indexOf("before=");
		}
		var locationCount = bodyhtml.indexOf("www.reddit.com/?count=", locationAfter - 30);
		var locationCountEnd = bodyhtml.indexOf("\"", locationCount);
		
		alert("http://" + cleanurl(bodyhtml.substring(locationCount, locationCountEnd)));
		
		window.location.href = "http://" + cleanurl(bodyhtml.substring(locationCount, locationCountEnd));
		return;*/
		var i = 0;
		var match = false;
		var atags = document.getElementsByTagName("a");
		for(i = 0; i < atags.length; i++){
		    try{
    		    if(atags[i].getAttribute("rel").indexOf(mode) > -1){
    		         match = true;
    		         window.location.href = atags[i].href;
    		    }
    	   }catch(ex){
    	       // this is normal
    	   }
		}
		if(match){
		    return;
		}
		
	}
	
	if(location.indexOf("techradar.com") > -1){
		if (mode == "next" && location.lastIndexOf("/") < location.length - 3){ // there is no page filled in, add it
			window.location.href = window.location.href + "/2";
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
			window.location.href = paginatorNext.href;
		}
	}else{
		if(paginatorPrevious != undefined){
			window.location.href = paginatorPrevious.href;
		}
	}
	
	// jenkov.com
	var nextPageJenkovCom = window.document.getElementsByClassName("nextArticleInCategory")[0];
	if(nextPageJenkovCom != null){
		if(mode == "next"){
			window.location.href = nextPageJenkovCom.parentElement.href;
		}else{
			window.history.back();
		}
	}
	
	// waarmaarraar.nl
	var nextPageWMR = window.document.getElementsByClassName("readmore")[0];
	if(nextPageWMR != null){
		var alink = nextPageWMR.getElementsByTagName("a")[0];
		if(mode == "next"){
			window.location.href = alink.href;
		}
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
		window.location.href = location.substring(0,lastIndex + stringlength) + pagenum;
	}
}