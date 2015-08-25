var self = require('sdk/self');
var pageMod = require("sdk/page-mod");
var { Hotkey } = require("sdk/hotkeys");
var tabs = require("sdk/tabs");
var worker

pageMod.PageMod({
	 include: "*",
	 contentScriptFile: "./fastnav.js"
});

tabs.on("ready", function(tab) {
  worker = tab.attach({
    contentScriptFile: "./fastnav.js"
  });
});

var fastnavNext = Hotkey({
  combo: "alt-n",
  onPress: function() {
    worker.port.emit("next");
  }
});
var fastnavPrevious = Hotkey({
  combo: "alt-p",
  onPress: function() {
	worker.port.emit("prev");
  }
});
var fastnavBefore = Hotkey({
  combo: "alt-b",
  onPress: function() {
	//worker.port.emit("alert", "YES!");
	worker.port.emit("prev");
  }
});




