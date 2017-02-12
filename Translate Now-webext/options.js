/*const PREFS = {
	"translate_now_destination_language": {
		"type": "value",
		"default": "en"
	},
	"translate_now_source_language": {
		"type": "value",
		"default": "auto"
	},
	"translate_now_reuse_tab": {
		"type": "checked",
		"default": true
	},
	"translate_now_enable_speak": {
		"type": "checked",
		"default": false
	}
};*/

function saveOptions() {
	browser.runtime.sendMessage({action: "notify", data: "Saved preferences"});

	browser.storage.local.set({
		translate_now_destination_language: document.querySelector("#translate_now_destination_language").value,
		translate_now_source_language: document.querySelector("#translate_now_source_language").value,
		translate_now_reuse_tab: document.querySelector("#translate_now_reuse_tab").checked,
		translate_now_enable_speak: document.querySelector("#translate_now_enable_speak").checked
	}).then(() => browser.runtime.sendMessage({action: "refresh-options"}));
}

/*function saveOptions() { 
	browser.runtime.sendMessage({action: "notify", data: "Saved preferences"});
	
	const values = {};
	for(const p in PREFS) {
		values[p] = document.getElementById(p)[PREFS[p].type];
	}

	browser.storage.local.set(values).then(() => browser.runtime.sendMessage({action: "refresh-options"}));
}*/

function restoreOptions() {

	function setDestinationLanguage(result) {
		document.querySelector("#translate_now_destination_language").value = value(result, "en");
	}
	
	function setSourceLanguage(result) {
		document.querySelector("#translate_now_source_language").value = value(result, "auto");
	}
	
	function setReuseTab(result){
		document.querySelector("#translate_now_reuse_tab").checked = value(result, true);
	}
	
	function setEnableSpeak(result){
		document.querySelector("#translate_now_enable_speak").checked = value(result, false);
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	function value(result,defaultValue){
		for(var key in result) {
			if(result.hasOwnProperty(key)) {
				return result[key];
			}
		}
		return defaultValue;
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


/*function restoreOptions() {
	browser.storage.local.get(Object.keys(PREFS)).then((result) => {
		let val;
		for(const p in PREFS) {
			if(p in result) {
				val = result[p];
			}
			else {
				val = PREFS[p].default;
			}
			document.getElementById(p)[PREFS[p].type] = val;
		}
	}).catch(console.error);
}*/

function init(){
	restoreOptions();
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
