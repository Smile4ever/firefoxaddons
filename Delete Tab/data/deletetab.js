window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  switch (event.key) {
    case "Delete":
		// check if modifier is pressed (ctrl, shift)
		//if pressed, return
		if(event.getModifierState("Alt") || event.getModifierState("Shift") || event.getModifierState("Control") || event.getModifierState("Meta") || event.getModifierState("OS") || event.getModifierState("AltGraph")){
			return;
		}

		// order is important here
		if(content.document.hasFocus() && window.content.document.activeElement.tagName == "BODY"){
			window.close();
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
