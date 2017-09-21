const PREFS = {
	"fastdelete_safemode": {
		"type": "checked",
		"default": false
	},
	"fastdelete_onlybotnotifications": {
		"type": "checked",
		"default": false
	},
	"fastdelete_debug_dosubmit": {
		"type": "checked",
		"default": true
	},
	"fastdelete_autoconfirm_wikipedia": {
		"type": "checked",
		"default": true
	}
};

function saveOptions() {
	const values = {};
	for(let p in PREFS) {
		values[p] = document.getElementById(p)[PREFS[p].type];
	}

	//browser.storage.local.set(values).then(() => browser.runtime.sendMessage({action: "refresh-options"}));
	browser.storage.local.set(values).then(() => browser.runtime.sendMessage({action: "notify", data: "Saved preferences"}));
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
	document.querySelector("form").style.display = "block";
	document.querySelector(".refreshOptions").style.display = "none";
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
