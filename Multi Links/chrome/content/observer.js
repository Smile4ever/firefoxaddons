function Multilinks_ObserverObj()
{
	this.uninstall = false;
	this.register();
}

Multilinks_ObserverObj.prototype = {
	uninstall: false,
	
	observe: function(subject, topic, data) 
	{
		if(topic == "em-action-requested")
		{
			subject.QueryInterface(Components.interfaces.nsIUpdateItem);
			if (subject.id == "multilinks@plugin") 
			{
				if (data == "item-uninstalled") 
				{   
					this.uninstall = true;
				} else if (data == "item-cancel-action") 
				{ 
					this.uninstall = false;
				}
			}
		}
	},
  
	register: function() 
	{
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
							.getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "em-action-requested", false);
	},
	
	unregister: function() 
	{
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
								.getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this, "em-action-requested");
	}
}

Multilinks_Observer_Load = function()
{
	Multilinks_Observer = new Multilinks_ObserverObj();
}

Multilinks_Observer_UnLoad = function()
{
	if(Multilinks_Observer.uninstall == true)
	{
		var prefManager = Components.classes['@mozilla.org/preferences-service;1']
							        .getService(Components.interfaces.nsIPrefService);
        var prefs = prefManager.getBranch('extensions.multilinks@plugin.');
		
		prefs.deleteBranch("");
	}
	
	Multilinks_Observer.unregister();
}

window.addEventListener("load", Multilinks_Observer_Load, false);
window.addEventListener("unload", Multilinks_Observer_UnLoad, false);