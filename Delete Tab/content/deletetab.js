window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  switch (event.key) {
    case "Delete":
		// order is important here
		if(content.document.hasFocus() && window.content.document.activeElement.tagName == "BODY"){
			deletetab.closetab();
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


var deletetab = {

	closetab: function(){
		if(window.content.location.href.indexOf("zoho.com") == -1){
			gBrowser.removeCurrentTab();
		}
	}
}
