window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  switch (event.key) {
    case "Delete":
		// todo: implement an options window on what do to when the user presses delete
		// possible options: delete a page, delete a page immediately, close the tab..
		
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
		gBrowser.removeCurrentTab();
	}
}
