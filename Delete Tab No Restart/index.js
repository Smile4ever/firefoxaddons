var self = require('sdk/self');
var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var worker;

tabs.on("ready", function(tab) {
  worker = tab.attach({
    contentScriptFile: "./deletetabnorestart.js"
  });
});
