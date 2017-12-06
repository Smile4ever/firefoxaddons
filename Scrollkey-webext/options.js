const PREFS = {
	"scrollkey_scrollvaluedown": {
		"type": "value",
		"default": 74
	},
	"scrollkey_scrollvalueup": {
		"type": "value",
		"default": 75
	},
	"scrollkey_scrollvalue": {
		"type": "value",
		"default": 400
	},
	"scrollkey_scrollvalue_shift": {
		"type": "value",
		"default": 400
	},
	"scrollkey_scrollvalue_alt": {
		"type": "value",
		"default": 400
	},
	"scrollkey_horizontal_scroll": {
		"type": "checked",
		"default": false
	},
	"scrollkey_horizontal_scroll_shift": {
		"type": "checked",
		"default": false
	},
	"scrollkey_horizontal_scroll_alt": {
		"type": "checked",
		"default": false
	},
	"scrollkey_scroll_pagedown_pageup": {
		"type": "checked",
		"default": false
	},
	"scrollkey_blacklist": {
		"type": "value",
		"default": ""
	},
	"scrollkey_smooth_scrolling": {
		"type": "checked",
		"default": false
	}
};

function saveOptions(){
	const values = {};
	for(let p in PREFS) {
		values[p] = document.getElementById(p)[PREFS[p].type];
	}

	browser.storage.sync.set(values).then(() => browser.runtime.sendMessage({action: "notify", data: browser.i18n.getMessage("notify_preferences_saved")}));
}

function restoreOptions() {
	browser.storage.sync.get(Object.keys(PREFS)).then((result) => {
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

function i18n(){
	var i18nElements = document.querySelectorAll('[data-i18n]');

	for(let i in i18nElements){
		try{
			if(i18nElements[i].getAttribute == null)
				continue;
			i18n_attrib = i18nElements[i].getAttribute("data-i18n");
			i18nElements[i].textContent = browser.i18n.getMessage(i18n_attrib);
		}catch(ex){
			console.error("i18n id " + IDS[id] + " not found");
		}
	}
}

function init(){
	restoreOptions();
	i18n();
	document.querySelector("form").style.display = "block";
	document.querySelector(".refreshOptions").style.display = "none";
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
