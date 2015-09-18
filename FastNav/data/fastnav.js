var pagenum;

self.port.on("prev", function(){
	generic("prev");
});
self.port.on("next", function(){
	generic("next");
});

window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  switch (event.key) {
    case "n":
		// check if modifier is pressed (ctrl, shift)
		// if pressed, return
		if(event.getModifierState("Alt") || event.getModifierState("Shift") || event.getModifierState("Control") || event.getModifierState("Meta") || event.getModifierState("OS") || event.getModifierState("AltGraph")){
			return;
		}
		
		// order is important here
		if(window.content.document.hasFocus() && window.content.document.activeElement.tagName == "BODY"){
			generic("next");
		}else{
			return;
		}
				
      break;
    case "b":
    case "p":
		// check if modifier is pressed (ctrl, shift)
		// if pressed, return
		if(event.getModifierState("Alt") || event.getModifierState("Shift") || event.getModifierState("Control") || event.getModifierState("Meta") || event.getModifierState("OS") || event.getModifierState("AltGraph")){
			return;
		}
		
		// order is important here
		if(window.content.document.hasFocus() && window.content.document.activeElement.tagName == "BODY"){
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
		var locationAfter = -1
		var bodyhtml = content.document.body.innerHTML;
		if(mode == "next"){
			locationAfter = bodyhtml.indexOf("after=")
		}else{
			locationAfter = bodyhtml.indexOf("before=")
		}
		var locationCount = bodyhtml.indexOf("www.reddit.com/?count=", locationAfter - 30)
		var locationCountEnd = bodyhtml.indexOf("\"", locationCount)
		window.location.href = "http://" + this.cleanurl(bodyhtml.substring(locationCount, locationCountEnd))
		return
	}
	
	if(location.indexOf("techradar.com") > -1){
		if (mode == "next" && location.lastIndexOf("/") < location.length - 3){ // there is no page filled in, add it
			window.location.href = window.location.href + "/2"
			return
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
	
	var paginatorNext = window.document.getElementsByClassName("paginator-next")[0];
	var paginatorPrevious = window.document.getElementsByClassName("paginator-previous")[0];
	
	// webwereld.nl, computerworld.nl etc.
	if(mode == "next"){
		if(paginatorNext != undefined){
			window.location.href = paginatorNext.href;
		}
	}else{
		if(paginatorPrevious != undefined){
			window.location.href = paginatorPrevious.href;
		}
	}
	
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
