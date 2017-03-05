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
	"translate_now_related_tabs": {
		"type": "checked",
		"default": true
	},
	"translate_now_enable_speak": {
		"type": "checked",
		"default": false
	}
};

function saveOptions() { 
	browser.runtime.sendMessage({action: "notify", data: "Saved preferences"});
	
	const values = {};
	for(let p in PREFS) {
		values[p] = document.getElementById(p)[PREFS[p].type];
	}

	browser.storage.local.set(values).then(() => browser.runtime.sendMessage({action: "refresh-options"}));
}

function restoreOptions() {
	browser.storage.local.get(Object.keys(PREFS)).then((result) => {
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

function init(){
	restoreOptions();
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
