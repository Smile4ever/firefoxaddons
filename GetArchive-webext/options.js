const PREFS = {
	"getarchive_search_engine": {
		"type": "value",
		"default": "google"
	},
	"getarchive_enable_ctrl_c": {
		"type": "checked",
		"default": true
	},
	"getarchive_require_focus": {
		"type": "checked",
		"default": true
	},
	"getarchive_prefer_long_link": {
		"type": "checked",
		"default": true
	},
	"getarchive_default_archive_service": {
		"type": "value",
		"default": "archive.org"
	},
	"getarchive_show_contextmenu_item_archiveorg": {
		"type": "checked",
		"default": true
	},
	"getarchive_show_contextmenu_item_archiveis": {
		"type": "checked",
		"default": true
	},
	"getarchive_show_contextmenu_item_webcitation": {
		"type": "checked",
		"default": false
	},
	"getarchive_show_contextmenu_item_googlecache": {
		"type": "checked",
		"default": true
	},
	"getarchive_automatic_forward": {
		"type": "checked",
		"default": true
	},
	"getarchive_related_tabs": {
		"type": "checked",
		"default": true
	},
	"getarchive_archiveorg_keyboard_shortcut": {
		"type": "value",
		"default": "CTRL+3"
	},
	"getarchive_archiveis_keyboard_shortcut": {
		"type": "value",
		"default": "CTRL+4"
	},
	"getarchive_webcitation_keyboard_shortcut": {
		"type": "value",
		"default": "CTRL+5"
	},
	"getarchive_googlecache_keyboard_shortcut": {
		"type": "value",
		"default": "CTRL+6"
	},
	"getarchive_automatic_retrieval": {
		"type": "checked",
		"default": true
	},
	"getarchive_disable_all_shortcuts": {
		"type": "checked",
		"default": true
	},
	"getarchive_icon_theme": {
		"type": "value",
		"default": "dark"
	}
};

const searchEngines = {
	"auto": {
		"value": "auto",
		"label": "default search engine"
	},
	"bing": {
		"value": "bing",
		"label": "Bing"
	},
	"duckduckgo": {
		"value": "duckduckgo",
		"label": "DuckDuckGo"
	},
	"google": {
		"value": "google",
		"label": "Google"
	}
};

const archiveServices = {
	"archive.org": {
		"value": "archive.org",
		"label": "Archive.org Wayback Machine"
	},
	"archive.is": {
		"value": "archive.is",
		"label": "archive.is"
	},
	"webcitation.org": {
		"value": "webcitation.org",
		"label": "WebCitation.org"
	},
	"webcache.googleusercontent.com": {
		"value": "webcache.googleusercontent.com",
		"label": "Google Cache"
	}
};

function sendMessage(action, data){
	browser.runtime.sendMessage({action: action, data: data});
}

function saveOptions() { 
	const values = {};
	for(let p in PREFS) {
		values[p] = document.getElementById(p)[PREFS[p].type];
	}

	browser.storage.local.set(values).then(() => {
		sendMessage("refresh-options");
		
		setTimeout(function(){
			browser.runtime.sendMessage({action: "notify", data: browser.i18n.getMessage("notify_preferences_saved")});
		}, 10);
	});
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

			try{
				document.getElementById(p)[PREFS[p].type] = val;
			}catch(ex){
				sendMessage("onDebug", "Failed to restore preference " + p);
			}
		}
	}).catch(console.error);
}

function i18n() {
	//console.log("options.js i18n");
	var i18nElements = document.querySelectorAll('[data-i18n]');
	
	for(let i in i18nElements){

		try{
			if(i18nElements[i].getAttribute == null)
				continue;
			i18n_attrib = i18nElements[i].getAttribute("data-i18n");
			//console.log(i18nElements[i]);
			//console.log(i18n_attrib);

			i18nElements[i].textContent = browser.i18n.getMessage(i18n_attrib);
		}catch(ex){
			//console.log(i18nElements[i] + " failed");
			//console.log(ex);
			//console.log("i18n id " + IDS[id] + " not found");
		}
	}
}

function fillLists(){
	let search_engine_list = document.getElementById("getarchive_search_engine");
	for(let e in searchEngines)
		search_engine_list.add(new Option(searchEngines[e].label, searchEngines[e].value));
	
	let archive_service_list = document.getElementById("getarchive_default_archive_service");
	for(let s in archiveServices)
		archive_service_list.add(new Option(archiveServices[s].label, archiveServices[s].value));
	
}

function init(){
	fillLists();
	restoreOptions();
	i18n();
	document.querySelector("form").style.display = "block";
	document.querySelector(".refreshOptions").style.display = "none";
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
