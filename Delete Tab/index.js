var self = require('sdk/self');
var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var worker
var allow_setting = "dom.allow_scripts_to_close_windows";

pageMod.PageMod({
	 include: "*",
	 contentScriptFile: "./deletetab.js"
});

tabs.on("ready", function(tab) {
  worker = tab.attach({
    contentScriptFile: "./deletetab.js"
  });
});

//set dom.allow_scripts_to_close_windows to true
require("sdk/preferences/service").set(allow_setting, true);

require("sdk/system/unload").when(function(reason) {
  if (reason == "uninstall" || reason == "disable") {
	require("sdk/preferences/service").set(allow_setting, false);
  }
});