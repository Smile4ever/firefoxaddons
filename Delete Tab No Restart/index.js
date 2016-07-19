var self = require('sdk/self');
var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");

/*tabs.on("ready", function(tab) {
  worker = tab.attach({
    contentScriptFile: "./deletetabnorestart.js"
  });
  worker.port.on("closeTab", function(data) {
    if(tabs.activeTab.url.indexOf("zoho.com") == -1){
		tabs.activeTab.close(null);
	}
  });
});*/

pageMod.PageMod({
  include: "*",
  contentScriptFile: self.data.url("deletetabnorestart.js"),
  contentScriptWhen: "start",
  onAttach: setupListener
});

function setupListener(worker) {
	worker.port.on("closeTab", function(closeTabData) {
		//console.log("closeTab!");
		if(tabs.activeTab.url.indexOf("zoho.com") == -1){
			tabs.activeTab.close(null);
		}
	});
	
	worker.port.emit("init");
}
