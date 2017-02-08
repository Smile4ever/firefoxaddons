function saveOptions(e) {
	e.preventDefault();
	
	/*console.log("options.js #translate_now_destination_language " + document.querySelector("#translate_now_destination_language").value);
	console.log("options.js #translate_now_source_language " + document.querySelector("#translate_now_source_language").value);
	console.log("options.js #translate_now_reuse_tab " + document.querySelector("#translate_now_reuse_tab").value);*/

	browser.storage.local.set({
		translate_now_destination_language: document.querySelector("#translate_now_destination_language").value
	});
	browser.storage.local.set({
		translate_now_source_language: document.querySelector("#translate_now_source_language").value
	});
	browser.storage.local.set({
		translate_now_reuse_tab: document.querySelector("#translate_now_reuse_tab").checked
	});
	browser.storage.local.set({
		translate_now_enable_speak: document.querySelector("#translate_now_enable_speak").checked
	});
	
	setTimeout(function(){
		browser.runtime.sendMessage({action: "refresh-options"});
	}, 20);
}

function restoreOptions() {

	function setDestinationLanguage(result) {
		document.querySelector("#translate_now_destination_language").value = value(result) || "en";
	}
	
	function setSourceLanguage(result) {
		document.querySelector("#translate_now_source_language").value = value(result) || "auto";
	}
	
	function setReuseTab(result){
		document.querySelector("#translate_now_reuse_tab").checked = value(result) || false;
	}
	
	function setEnableSpeak(result){
		document.querySelector("#translate_now_enable_speak").checked = value(result) || false;
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	function value(result){
		for(var key in result) {
			if(result.hasOwnProperty(key)) {
				return result[key];
			}
		}
		return undefined;
	}
	
	var getting1 = browser.storage.local.get("translate_now_destination_language");
	getting1.then(setDestinationLanguage, onError);
	
	var getting2 = browser.storage.local.get("translate_now_source_language");
	getting2.then(setSourceLanguage, onError);
	
	var getting3 = browser.storage.local.get("translate_now_reuse_tab");
	getting3.then(setReuseTab, onError);
	
	var getting4 = browser.storage.local.get("translate_now_enable_speak");
	getting4.then(setEnableSpeak, onError);
}

function init(){
	restoreOptions();
}

document.addEventListener("DOMContentLoaded", init);
document.querySelector("form").addEventListener("submit", saveOptions);
