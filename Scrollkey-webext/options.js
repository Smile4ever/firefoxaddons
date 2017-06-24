const PREFS = {
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
	}
};

function saveOptions() { 
	const values = {};
	for(let p in PREFS) {
		values[p] = document.getElementById(p)[PREFS[p].type];
	}

	browser.storage.sync.set(values).then(() => browser.runtime.sendMessage({action: "notify", data: browser.i18n.getMessage("notify_preferences_saved")}));
}

function restoreOptions() {
	browser.storage.sync.get(Object.keys(PREFS)).then((result) => {
		console.log("restoreOptions from sync storage:");
		console.log(result);
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

function i18n() {
	document.querySelector("#scrollvalue").textContent = browser.i18n.getMessage("scrollvalue"); // "Scrollwaarde"
	document.querySelector("#pagedownpageup").textContent = browser.i18n.getMessage("pagedownpageup"); // "PageDown en PageUp scrollen de waarde zoals hierboven aangegeven"
	document.querySelector("#horizontalscroll").textContent = browser.i18n.getMessage("horizontalscroll"); // "Gebruik de sneltoets hierboven voor horizontaal scrollen"
	document.querySelector("#pixels").textContent = browser.i18n.getMessage("pixels"); // "pixels"

	document.querySelector("#scrollvalueshift").textContent = browser.i18n.getMessage("scrollvalueshift"); // "Scrollwaarde (Shift)"
	document.querySelector("#pixelsshift").textContent = browser.i18n.getMessage("pixels"); // "pixels"
	document.querySelector("#horizontalscrollshift").textContent = browser.i18n.getMessage("horizontalscrollshift"); // "Gebruik de sneltoets Shift+J/Shift+K voor horizontaal scrollen"
  
	document.querySelector("#scrollvaluealt").textContent = browser.i18n.getMessage("scrollvaluealt"); // "Scrollwaarde (Alt)"
	document.querySelector("#horizontalscrollalt").textContent = browser.i18n.getMessage("horizontalscrollalt"); // "Gebruik de sneltoets Alt+J/Alt+K voor horizontaal scrollen"
	document.querySelector("#pixelsalt").textContent = browser.i18n.getMessage("pixels"); // "pixels"

	document.querySelector("#savepreferences").textContent = browser.i18n.getMessage("savepreferences"); // "Voorkeuren opslaan"
}

function init(){
	restoreOptions();
	document.querySelector("form").style.display = "block";
	document.querySelector(".refreshOptions").style.display = "none";
	i18n();
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
