var keyutils = {
	/*detectKeyboardShortcut: function(keyboardShortcut, event, func){
		utils.parseKeyboardShortcut(keyboardShortcut, event, func, false);
	},
	attachKeyboardShortcut: function(keyboardShortcut, event, func){
		utils.parseKeyboardShortcut(keyboardShortcut, event, func, true);
	},*/
	parseKeyboardShortcut: function(keyboardShortcut, event, func, consume){
		// https://www.w3.org/TR/uievents-key/
		// https://w3c.github.io/uievents/#widl-KeyboardEvent-keyCode
		// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
		// http://www.openjs.com/scripts/events/keyboard_shortcuts/shortcut.js (TODO: implement some of the features here also)
		
		if (event.defaultPrevented)
			return;

		// fix for Outlook.com webmail
		try{
			var current = document.activeElement;
			while(current != null){
				if(current.hasAttribute("contenteditable") || current.tagName == "INPUT" || current.tagName == "TEXTAREA"){
					//console.log("contenteditable fix");
					return;
				}
				current = current.parentElement;
			}
		}catch(ex){
			
		}

		var kb = keyboardShortcut.toLowerCase();
		
		var kb_ctrlOrCmd = kb.indexOf("ctrl") > -1 || kb.indexOf("control") > -1 || kb.indexOf("command") > -1 || kb.indexOf("cmd") > -1;
		var kb_alt = kb.indexOf("alt") > -1 || kb.indexOf("option") > -1;
		var kb_shift = kb.indexOf("shift") > -1;
		var kb_meta = kb.indexOf("meta") > -1 || kb.indexOf("os") > -1 || kb.indexOf("win") > -1 || kb.indexOf("super") > -1 || kb.indexOf("hyper") > -1;
		var kb_key_index_dash = kb.lastIndexOf("-");
		var kb_key_index_plus = kb.lastIndexOf("+");
		var kb_key = "";
		
		var kb_key_set = false;
		var kb_key_single = false;
		
		if(kb_key_index_dash == kb.length - 1){
			kb_key = "-";
			kb_key_set = true;
		}
		
		if(kb_key_index_plus == kb.length - 1){
			kb_key = "+";
			kb_key_set = true;
		}
		
		if(kb_key_set == false){
			var kb_key_index = Math.max(kb_key_index_dash, kb_key_index_plus);
			kb_key = kb.substring(kb_key_index + 1);
			//if kb_key_index is -1, then it's a single key shortcut
			if(kb_key_index == -1){
				//console.log("Single key shortcut");
				kb_key_single = true;
			}
		}
		
		if(window && kb_key_single && (event.code.length == 1 || event.key.length == 1)){
			// normal key like "a"
			if(window.getSelection().toString().length != 0){
				return;
			}

			// do not allow space
			if(event.key == " " || event.code == " ")
				return;
		}

		var result = "";
		if(kb_ctrlOrCmd)
			result += "+Control";
			
		if(kb_alt)
			result += "+Alt";
			
		if(kb_shift)
			result += "+Shift";
			
		if(kb_meta)
			result += "+Meta";
		
		if(kb_key_single == false)
			result += "+" + kb_key.toUpperCase();
		
		if(result.indexOf("+") == 0){
			result = result.substring(1);
		}
		
		var matchKey = false;
		if(kb_key.toUpperCase() == event.code.toUpperCase()){
			matchKey = true;
		}
		if(kb_key.toUpperCase() == event.key.toUpperCase()){
			matchKey = true;
		}
		
		if(!isNaN(parseInt(kb_key))){
			if(event.code == "Digit" + kb_key){
				matchKey = true;
			}
			if(event.code == "Numpad" + kb_key){
				matchKey = true;
			}
		}
		
		if(matchKey == true && event.shiftKey == kb_shift && event.ctrlKey == kb_ctrlOrCmd && event.altKey == kb_alt && event.metaKey == kb_meta){
			if(consume)
				event.preventDefault();
			func(result);
		}else{
			//console.log("You didn't hit me with " + result + ", key was " + kb_key + " and needed to be " + event.key);
			//console.log("event.key == kb_key " + (event.key == kb_key));
			//console.log("event.shiftKey == kb_shift " + (event.shiftKey == kb_shift));
			//console.log("event.ctrlKey == kb_ctrlOrCmd " + (event.ctrlKey == kb_ctrlOrCmd));
			//console.log("event.altKey == kb_alt " + (event.altKey == kb_alt));
			//console.log("event.metaKey == kb_meta " + (event.metaKey == kb_meta));
		}
	}
}