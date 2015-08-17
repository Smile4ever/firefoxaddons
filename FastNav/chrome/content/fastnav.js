var pagenum
var fastnav = {
	next: function() {
		this.generic("next");
 	},
 	prev: function(){
		this.generic("prev");
	},
	cleanurl: function(url){
		return decodeURIComponent(url.replace("&amp;", "&"))
	},
	generic: function(mode){
		var location=window.content.location.href;
		var lastIndex = location.lastIndexOf("=");
		var pageNumber = location.substring(lastIndex+1);
		var stringlength = 1;
		
		if(location.indexOf("reddit.com") > -1){
			var locationAfter = -1
			if(mode == "next"){
				locationAfter = content.document.body.innerHTML.indexOf("after=")
			}else{
				locationAfter = content.document.body.innerHTML.indexOf("before=")
			}
			var locationCount = content.document.body.innerHTML.indexOf("www.reddit.com/?count=", locationAfter - 30)
			var locationCountEnd = content.document.body.innerHTML.indexOf("\"", locationCount)
			window.content.location.href = "http://" + this.cleanurl(content.document.body.innerHTML.substring(locationCount, locationCountEnd))
			return
		}
		
		if(location.indexOf("techradar.com") > -1){
			if (mode == "next" && location.lastIndexOf("/") < location.length - 3){ // there is no page filled in, add it
				window.content.location.href = window.content.location.href + "/2"
				return
			}

			if(location.lastIndexOf("/") > -1 && location.lastIndexOf("/") > location.length - 3){
				// increment or decrement
				lastIndex = location.lastIndexOf("/");
				pageNumber = location.substring(lastIndex+1);
				
				if(mode == "next"){
					window.content.location.href = window.content.location.href.substring(0, lastIndex) + "/" + (parseInt(pageNumber) + 1)
				}else{
					if(parseInt(pageNumber) == 2){
						window.content.location.href = window.content.location.href.substring(0, lastIndex) // there is a page filled in, remove it
					}else{
						window.content.location.href = window.content.location.href.substring(0, lastIndex) + "/" + (parseInt(pageNumber) - 1)
					}
				}
				return
			}
		}
		var paginatorNext = window.content.document.getElementsByClassName("paginator-next")[0];
		var paginatorPrevious = window.content.document.getElementsByClassName("paginator-previous")[0];

		// webwereld.nl, computerworld.nl etc.
		if(mode == "next"){
			if(paginatorNext != undefined){
				window.content.location.href = paginatorNext.href;
			}
		}else{
			if(paginatorPrevious != undefined){
				window.content.location.href = paginatorPrevious.href;
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
				pagenum = parseInt(pageNumber) + 1
			}else{
				// prev
				pagenum = parseInt(pageNumber) - 1
			}
			window.content.location.href = location.substring(0,lastIndex + stringlength) + pagenum;
		}
	},
}
