var scrollkey = {

	prefs: function(){
		return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
	},
	getscrollvalue: function(code){
		var pref = "extensions.scrollkey.scrollvalue"; //0
		
		if (code == 1){
			pref = "extensions.scrollkey.scrollvalue-shift"; //1
		}
		if (code == 2){
			pref = "extensions.scrollkey.scrollvalue-alt"; //2
		}
		if (code == 100){
			pref = "extensions.scrollkey.horizontal-scroll-normal";
		}
		if (code == 101){
			pref = "extensions.scrollkey.horizontal-scroll-shift";
		}
		if (code == 102){
			pref = "extensions.scrollkey.horizontal-scroll-alt";
		}

		try{
			if(code > 99){
				value = this.prefs().getBoolPref(pref);
				//alert("de value is " + value)
			}else{
				value = this.prefs().getIntPref(pref);
			}
		}
		catch(err){
			if(code > 99){
				value = false;
			}else{
				value = 400;
			}
		}
		if(value===0){
			value = 400;
		}

		return value;
	},
	getpagevalue: function(){
		try{
			value = this.prefs().getBoolPref("extensions.scrollkey.scrollpagedownpageup");
		}
		catch(err){
			value = false;
		}
		return value;
	},
	scrollupif: function(){
		if(this.getpagevalue()){
			this.scrollup(0);
		}else{
			window.content.scrollByPages(-1); //PageUp
			//window.content.scrollBy(0, (window.innerHeight-(window.outerHeight / 2.8)) * -1);
		}
	},
	scrolldownif: function(){
		//var keyelement = document.getElementById("scrollkey-scrollup-pageup");

		if(this.getpagevalue()){
			//keyelement.setAttribute('command', 'scrollkey.scrollupif();');
			this.scrolldown(0);
		}else{
			//keyelement.setAttribute('command', '://');
			window.content.scrollByPages(1); //PageDown
		}
	},
	scrollup: function(id){
		var horizontalScroll = this.getscrollvalue(id+100);
		//alert("up voor id " + id + "-" +horizontalScroll)

		if(horizontalScroll == true){
			window.content.scrollBy(this.getscrollvalue(id) * -1,0);
		}else{
			window.content.scrollBy(0,this.getscrollvalue(id) * -1);
		}
	},
	scrolldown: function(id){
		var horizontalScroll = this.getscrollvalue(id+100);
		//alert("down voor id " + id + "-" + horizontalScroll)

		if(horizontalScroll == true){
			window.content.scrollBy(this.getscrollvalue(id),0);
		}else{
			window.content.scrollBy(0,this.getscrollvalue(id));
		}
	}
}
