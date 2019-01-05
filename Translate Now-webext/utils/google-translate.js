/* Methods in the googletranslate object can be used anywhere */
let googletranslate = {
	getNewText: function(text){
		let newText = text;
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
let gt = {
	playSound: function (speakLanguage, text){
		let speakUrl = googletranslate.getSpeakUrlSource(speakLanguage, text);
		//console.log("speakUrl is " + speakUrl);
		let audioObj = new Audio(speakUrl);
		//console.log("playing audio");
		audioObj.play();
		return audioObj;
	},
	getSpeakLanguage: function(id){
		let speakLanguageElement = document.getElementById(id).getElementsByClassName("jfk-button-checked")[0];
		let speakLanguageLabel = speakLanguageElement.innerHTML;
		let speakLanguage = speakLanguageElement.getAttribute("value");
		
		//console.log("speakLanguage is " + speakLanguage);
		if(speakLanguage == "auto"){
			speakLanguage = "en"; // fallback
			speakLanguageLabelDetectedIndex = speakLanguageLabel.indexOf(" - ");
			//console.log("speakLanguageLabelDetectedIndex is " + speakLanguageLabelDetectedIndex);
			if(speakLanguageLabelDetectedIndex != -1){
				//console.log("speakLanguageLabel is " + speakLanguageLabel);
				speakLanguageLabel = speakLanguageLabel.substring(0, speakLanguageLabelDetectedIndex);
				//console.log("speakLanguageLabel is now " + speakLanguageLabel);
				
				let languages = document.getElementsByClassName("jfk-button");
				let i = 0;
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
		let source = document.querySelector("#source");
		return source != null ? source.value : "";
	},
	getDestinationSpeakLanguage: function(){
		return this.getSpeakLanguage("gt-tl-sugg");
	},
	getDestinationText: function(){
		let resultBox = document.querySelector("#result_box");
		return resultBox != null ? resultBox.innerText : "";
	},
	isSourceSpeakAvailable: function(){
		return this.isSpeakAvailable("gt-src-listen");
	},
	isDestinationSpeakAvailable: function(){
		return this.isSpeakAvailable("gt-res-listen");
	},
	isSpeakAvailable: function(id){
		let btnListenStyle = document.getElementById(id).getAttribute("style");
		if(btnListenStyle.indexOf("display: none") > -1 || btnListenStyle.indexOf("display:none") > -1) return false;
		return true;
	}
}
