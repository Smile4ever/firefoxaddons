var self = require('sdk/self');
var tabs = require("sdk/tabs");
var worker;
var typeahead;
var typeahead_value;

tabs.on("ready", function(tab) {
  typeahead = "accessibility.typeaheadfind";
  typeahead_value = require("sdk/preferences/service").get(typeahead);
  worker = tab.attach({
    contentScriptFile: "./fastnav.js"
  });
  worker.port.emit("init", typeahead_value);
});
