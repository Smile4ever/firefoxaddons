var scrollkey = {

	prefs: function(){
		return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
	},
	getscrollvalue: function(code){
		var pref = "extensions.scrollkey.scrollvalue";
		if (code == 1){
			pref = "extensions.scrollkey.scrollvalue-shift";
		}
		if (code == 2){
			pref = "extensions.scrollkey.scrollvalue-alt";
		}
		try{
			value = this.prefs().getIntPref(pref);
		}
		catch(err){
			value = 400;
		}
		if(value==0){
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
	scrollup: function(){
		window.content.scrollBy(0,this.getscrollvalue(0) * -1);
	},
	scrolldown: function(){
		window.content.scrollBy(0,this.getscrollvalue(0));
	},
	scrollupif: function(){
		if(this.getpagevalue()){
			this.scrollup();
		}else{
			window.content.scrollBy(0, (window.innerHeight-300) * -1);
		}
	},
	scrolldownshift: function(){
		window.content.scrollBy(0,this.getscrollvalue(1));
	},
	scrollupshift: function(){
		window.content.scrollBy(0,this.getscrollvalue(1) * -1);
	},
	scrolldownalt: function(){
		window.content.scrollBy(0,this.getscrollvalue(2));
	},
	scrollupalt: function(){
		window.content.scrollBy(0,this.getscrollvalue(2) * -1);
	},
	scrolldownif: function(){
		// window.innerHeight
		//alert(content.document.body.clientHeight); // complete height
		// content.document.body.clientHeight;
		//alert(content.document.getElementsByTagName('body')[0].clientHeight);
		//alert(window.content.document.body.scrollHeight);
		
		//alert(window.outerHeight);
		//alert(window.innerHeight);
		//alert(window.outerHeight - window.innerHeight);
		//alert(self.outerHeight);
		//alert(window.content.document.body.innerHeight);
		
		
		//var keyelement = document.getElementById("scrollkey-scrollup-pageup");

		if(this.getpagevalue()){
			//keyelement.setAttribute('command', 'scrollkey.scrollupif();');
			this.scrolldown();
		}else{
			//keyelement.setAttribute('command', '://');
			window.content.scrollBy(0, window.innerHeight-300);
		}
	}
}
