const PREFS = {
	"middleclick_autoscrolling_tipping_point": {
		"type": "value",
		"default": "300"
	},
	"middleclick_autoscrolling": {
		"type": "value",
		"default": "ondemand"
	},
	"middleclick_autoscrolling_current_page": {
		"type": "value",
		"default": "Shift+Escape"
	},
	"middleclick_autoscrolling_whitelist": {
		"type": "value",
		"default": ""
	}
};

function sendMessage(action, data){
	browser.runtime.sendMessage({action: action, data: data});
}

function saveOptions() { 
	sendMessage("notify", "Saved preferences");
	
	const values = {};
	for(let p in PREFS) {
		try{
			values[p] = document.getElementById(p)[PREFS[p].type];
		}catch(ex){
			sendMessage("onDebug", "Failed to save preference " + p);
		}
	}

	browser.storage.local.set(values).then(() => sendMessage("refresh-options"));
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

function init(){
	restoreOptions();
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
