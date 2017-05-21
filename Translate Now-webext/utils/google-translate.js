/* Methods in the googletranslate object can be used anywhere */
var googletranslate = {
	getNewText: function(text){
		var newText = text;
		newText = encodeURIComponent(newText);
		newText = newText.replace("%25", "");
		newText = newText.replace("%C2%A0", " ");
		
		return newText;
	},
	getSpeakUrlSource: function(language, newText){
		newText = newText.substring(0, 195);
		return "https://translate.google.com/translate_tts?tl=" + language + "&client=tw-ob&q=" + newText;
	}
}

/* Methods in the gt object are for content scripts */
var gt = {
	playSound: function (speakLanguage, text){
		var speakUrl = googletranslate.getSpeakUrlSource(speakLanguage, text);
		//console.log("speakUrl is " + speakUrl);
		var audioObj = new Audio(speakUrl);
		//console.log("playing audio");
		audioObj.play();
		return audioObj;
	},
	getSpeakLanguage: function(id){
		var speakLanguageElement = document.getElementById(id).getElementsByClassName("jfk-button-checked")[0];
		var speakLanguageLabel = speakLanguageElement.innerHTML;
		var speakLanguage = speakLanguageElement.getAttribute("value");
		
		//console.log("speakLanguage is " + speakLanguage);
		if(speakLanguage == "auto"){
			speakLanguage = "en"; // fallback
			speakLanguageLabelDetectedIndex = speakLanguageLabel.indexOf(" - ");
			//console.log("speakLanguageLabelDetectedIndex is " + speakLanguageLabelDetectedIndex);
			if(speakLanguageLabelDetectedIndex != -1){
				//console.log("speakLanguageLabel is " + speakLanguageLabel);
				speakLanguageLabel = speakLanguageLabel.substring(0, speakLanguageLabelDetectedIndex);
				//console.log("speakLanguageLabel is now " + speakLanguageLabel);
				
				var languages = document.getElementsByClassName("jfk-button");
				var i = 0;
				for(i = 0; i < languages.length; i++){
					if(languages[i].innerHTML == speakLanguageLabel){
						speakLanguage = languages[i].getAttribute("value");
						//console.log("found a match for " + speakLanguageLabel + ": " + speakLanguage);
						break;
					}
				}
			}else{
				return "";
			}
		}
		
		return speakLanguage;
	},
	getSourceSpeakLanguage: function(){
		return this.getSpeakLanguage("gt-sl-sugg");
	},
	getSourceText: function (){
		var sourceText = "";
		try{
			sourceText = document.getElementById("source").value; // If this fails, we should try to get it from the URL
		}catch(e){
			//console.log("Error while getting source text: " + e);
		}
		//console.log("sourceText is " + sourceText);
		return sourceText;
	},
	getDestinationSpeakLanguage: function(){
		return this.getSpeakLanguage("gt-tl-sugg");
	},
	getDestinationText: function(){
		var destinationText = "";
		try{
			destinationText = document.getElementById("result_box").innerText;
		}catch(e){
			//console.log("Error while getting destination text: " + e);
		}
		//console.log("destinationText is " + destinationText);
		return destinationText;
	},
	isSourceSpeakAvailable: function(){
		return this.isSpeakAvailable("gt-src-listen");
	},
	isDestinationSpeakAvailable: function(){
		return this.isSpeakAvailable("gt-res-listen");
	},
	isSpeakAvailable: function(id){
		var btnListenStyle = document.getElementById(id).getAttribute("style");
		if(btnListenStyle.indexOf("display: none") > -1 || btnListenStyle.indexOf("display:none") > -1) return false;
		return true;
	}
}
