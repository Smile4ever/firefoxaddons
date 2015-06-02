var fastnav = {
	next: function() {
		var location=window.content.location.href;
		var lastIndex = location.lastIndexOf("=")
		var pageNumber = location.substring(lastIndex+1)
		
		window.content.location.href = location.substring(0,lastIndex + 1) + (parseInt(pageNumber) + 1)
 	},
 	prev: function(){
		var location=window.content.location.href;
		var lastIndex = location.lastIndexOf("=")
		var pageNumber = location.substring(lastIndex+1)
		
		window.content.location.href = location.substring(0,lastIndex + 1) + (parseInt(pageNumber) - 1)
	},
}
