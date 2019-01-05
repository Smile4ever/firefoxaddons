const PREFS = {
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
	"translate_now_reuse_tab_all": {
		"type": "checked",
		"default": false
	},
	"translate_now_related_tabs": {
		"type": "checked",
		"default": true
	},
	"translate_now_translate_engine": {
		"type": "value",
		"default": "google"
	},
	"translate_now_show_deepl_translator": {
		"type": "checked",
		"default": false
	},
	"translate_now_show_bing_translator": {
		"type": "checked",
		"default": false,
	},
	"translate_now_show_google_translate": {
		"type": "checked",
		"default": true
	},
	"translate_now_show_google_translate_voice": {
		"type": "checked",
		"default": false
	},
	"translate_now_show_bing_translator_voice": {
		"type": "checked",
		"default": false
	},
	"translate_now_google_speak_audio_only": {
		"type": "checked",
		"default": false
	},
	"translate_now_to_speak": {
		"type": "value",
		"default": "both"
	},
	"translate_now_context_selection": {
		"type": "checked",
		"default": true
	},
	"translate_now_context_page": {
		"type": "checked",
		"default": true
	},
	"translate_now_context_link": {
		"type": "checked",
		"default": true
	}
};

function saveOptions() { 
	browser.runtime.sendMessage({action: "notify", data: "Saved preferences"});
	
	const values = {};
	for(let p in PREFS) {
		let element = document.getElementById(p);
		values[p] = element[PREFS[p].type];
	}

	browser.storage.local.set(values).then(() => browser.runtime.sendMessage({action: "refresh-options"}));
}

function restoreOptions() {
	return browser.storage.local.get(Object.keys(PREFS)).then((result) => {
		let val;
		for(let p in PREFS) {
			if(p in result) {
				val = result[p];
			}
			else {
				val = PREFS[p].default;
			}
			document.getElementById(p)[PREFS[p].type] = val;
		}
	}).catch(console.error);
}

function translateEngineChangedEvent(event){
	if(!event.target.value) return;
	translateEngineChangedValue(event.target.value);
}

function translateEngineChangedValue(value){
	if(!value) return;

	updateSupportedLanguages(value, "translate_now_destination_language");
	updateSupportedLanguages(value, "translate_now_source_language");
}

function translateEngineInit(value){
	translateEngineChangedValue(translate_now_translate_engine.options[translate_now_translate_engine.selectedIndex].value);
	document.getElementById("translate_now_translate_engine").addEventListener("change", translateEngineChangedEvent);
}

function updateSupportedLanguages(value, id){
	let languages = document.getElementById(id).getElementsByTagName("option");

	for(let lang of languages){
		let c = lang.getAttribute("class");
		if(c == null) c = "";

		if(value == "deepl" && c.indexOf("deepl") == -1){
			lang.style.display = "none";
			continue;
		}

		lang.style.display = "block";
	}
}

function init(){
	restoreOptions().then(translateEngineInit, null);

	document.querySelector("form").style.display = "block";
	document.querySelector(".refreshOptions").style.display = "none";
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
