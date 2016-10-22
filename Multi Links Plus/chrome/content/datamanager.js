MultiLinks_DataManager = function() {
    this.prefs = null;

    this.getPrefs = function() {
        if (!this.prefs) {
            var prefManager = Components.classes['@mozilla.org/preferences-service;1']
							        .getService(Components.interfaces.nsIPrefService);
            this.prefs = prefManager.getBranch('extensions.multilinks@plugin.');
        }
        return this.prefs;
    }

    //Activated
    this.GetActivated = function() {
        var param = "Activated";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setBoolPref(param, true);
        return this.getPrefs().getBoolPref(param);
    }

    this.SetActivated = function(a) {
        this.getPrefs().setBoolPref("Activated", a);
    }
	
	//Operation
	this.GetOperation = function(key) {
        var param = "Operation" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
		{
			if(key == "R")
				this.getPrefs().setIntPref(param, 1);
            else
				this.getPrefs().setIntPref(param, 0);
		}
        return this.getPrefs().getIntPref(param);
    }

    this.SetOperation = function(key, a) {
        this.getPrefs().setIntPref("Operation" + key, a);
    }
	
	//SelectionColor
	this.GetSColor = function(key) {
        var param = "SColor" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "#33ff33");
        return this.getPrefs().getCharPref(param);
    }

    this.SetSColor = function(key, c) {
        this.getPrefs().setCharPref("SColor" + key, c);
    }
	
	//LinkColor
	this.GetLColor = function(key) {
        var param = "LColor" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "#FF0000");
        return this.getPrefs().getCharPref(param);
    }

    this.SetLColor = function(key, c) {
        this.getPrefs().setCharPref("LColor" + key, c);
    }
	
	//SelectionWidth
	this.GetSWidth = function(key) {
        var param = "SWidth" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 2);
        return this.getPrefs().getIntPref(param);
    }

    this.SetSWidth = function(key, w) {
        this.getPrefs().setIntPref("SWidth" + key, w);
    }
	
	//LinksWidth
	this.GetLWidth = function(key) {
        var param = "LWidth" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 2);
        return this.getPrefs().getIntPref(param);
    }

    this.SetLWidth = function(key, w) {
        this.getPrefs().setIntPref("LWidth" + key, w);
    }
	
	//Selection style
	this.GetSStyle = function(key) {
        var param = "SStyle" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "dotted");
        return this.getPrefs().getCharPref(param);
    }

    this.SetSStyle = function(key, c) {
        this.getPrefs().setCharPref("SStyle" + key, c);
    }
	
	//Links style
	this.GetLStyle = function(key) {
        var param = "LStyle" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "solid");
        return this.getPrefs().getCharPref(param);
    }

    this.SetLStyle = function(key, c) {
        this.getPrefs().setCharPref("LStyle" + key, c);
    }
	
	//SmartSelection
    this.GetSmart = function() {
        var param = "SmartSelection";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setBoolPref(param, true);
        return this.getPrefs().getBoolPref(param);
    }

    this.SetSmart = function(a) {
        this.getPrefs().setBoolPref("SmartSelection", a);
    }
	
	//ShowSBIcon
	this.GetShowSBIcon = function() {
        var param = "ShowSBIcon";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setBoolPref(param, true);
        return this.getPrefs().getBoolPref(param);
    }

    this.SetShowSBIcon = function(a) {
        this.getPrefs().setBoolPref("ShowSBIcon", a);
    }
    
    //ShowToolbarIcon
	this.GetShowToolbarIcon = function() {
        var param = "ShowToolbarIcon";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setBoolPref(param, true);
        return this.getPrefs().getBoolPref(param);
    }

    this.SetShowToolbarIcon = function(a) {
        this.getPrefs().setBoolPref("ShowToolbarIcon", a);
    }
	
	//ActivateNewTab
    this.GetActNewTab = function(key) {
        var param = "ActivateNewTab" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setBoolPref(param, false);
        return this.getPrefs().getBoolPref(param);
    }

    this.SetActNewTab = function(key, a) {
        this.getPrefs().setBoolPref("ActivateNewTab" + key, a);
    }
	
	//ActivateNewWindow
    this.GetActNewWindow = function(key) {
        var param = "ActivateNewWindow" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setBoolPref(param, false);
        return this.getPrefs().getBoolPref(param);
    }

    this.SetActNewWindow = function(key, a) {
        this.getPrefs().setBoolPref("ActivateNewWindow" + key, a);
    }
	
	//Delay
	this.GetDelay = function() {
        var param = "Delay";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 0);
        return this.getPrefs().getIntPref(param);
    }

    this.SetDelay = function(w) {
        this.getPrefs().setIntPref("Delay", w);
    }
	
	//CopyUrlsWithTitles
    this.GetCopyUrlsWithTitles = function(key) {
        var param = "CopyUrlsWithTitles" + key;
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 0);
        return this.getPrefs().getIntPref(param);
    }

    this.SetCopyUrlsWithTitles = function(key, a) {
        this.getPrefs().setIntPref("CopyUrlsWithTitles" + key, a);
    }
	
	//Navigated
	this.GetNavigated = function() {
		var param = "Navigated";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetNavigated = function(a) {
		this.getPrefs().setBoolPref("Navigated", a);
	}
   
    //Version
    this.GetVersion = function() {
        var param = "Version";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "unknown");
        return this.getPrefs().getCharPref(param);
    }

    this.SetVersion = function(v) {
        this.getPrefs().setCharPref("Version", v);
   }
   
	//MultiKey
    this.GetMultiKey = function() {
        var param = "MultiKey";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "shift");
        return this.getPrefs().getCharPref(param);
    }

	this.SetMultiKey = function(v) {
		this.getPrefs().setCharPref("MultiKey", v);
	}
	
	//SelectKey
    this.GetSelectKey = function() {
        var param = "SelectKey";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "right");
        return this.getPrefs().getCharPref(param);
    }

	this.SetSelectKey = function(v) {
		this.getPrefs().setCharPref("SelectKey", v);
	}
	
	//Tolerance
	this.GetTolerance = function() {
        var param = "Tolerance";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 0);
        return this.getPrefs().getIntPref(param);
    }

    this.SetTolerance = function(w) {
        this.getPrefs().setIntPref("Tolerance", w);
    }
	
	//MaxLNumber
	this.GetMaxLNumber = function() {
        var param = "MaxLNumber";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 40);
        return this.getPrefs().getIntPref(param);
    }

    this.SetMaxLNumber = function(w) {
        this.getPrefs().setIntPref("MaxLNumber", w);
    }
	
	//MaxConfirm
	this.GetMaxConfirm = function() {
		var param = "MaxConfirm";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, true);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetMaxConfirm = function(a) {
		this.getPrefs().setBoolPref("MaxConfirm", a);
	}
	
	//SelectWD
	this.GetSelectWD = function() {
		var param = "SelectWD";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetSelectWD = function(a) {
		this.getPrefs().setBoolPref("SelectWD", a);
	}
	
	//MaxAction
	this.GetMaxAction = function() {
		var param = "MaxAction";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetMaxAction = function(a) {
		this.getPrefs().setBoolPref("MaxAction", a);
	}
	
	//BlockSameLinks
	this.GetBlockSameLinks = function() {
		var param = "BlockSameLinks";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetBlockSameLinks = function(a) {
		this.getPrefs().setBoolPref("BlockSameLinks", a);
	}
	
	//ReverseOrder
	this.GetReverseOrder = function() {
		var param = "ReverseOrder";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetReverseOrder = function(a) {
		this.getPrefs().setBoolPref("ReverseOrder", a);
	}
	
	//ScrollSpeed
	this.GetScrollSpeed = function() {
        var param = "ScrollSpeed";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 10);
        return this.getPrefs().getIntPref(param);
    }

    this.SetScrollSpeed = function(w) {
        this.getPrefs().setIntPref("ScrollSpeed", w);
    }
	
	//AllwaysCopy
	this.GetAllwaysCopy = function() {
		var param = "AllwaysCopy";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetAllwaysCopy = function(a) {
		this.getPrefs().setBoolPref("AllwaysCopy", a);
	}
 
	//TabsInNewWindowUrls
	this.GetTabsInNewWindowUrls = function() {
        var param = "TabsInNewWindowUrls";
        if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setCharPref(param, "");
        return this.getPrefs().getCharPref(param);
    }

    this.SetTabsInNewWindowUrls = function(v) {
        this.getPrefs().setCharPref("TabsInNewWindowUrls", v);
    }
   
	// ForceContextMenuCancellation
	this.GetForceContextMenuCancellation = function() {
        var param = "ForceContextMenuCancellation";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetForceContextMenuCancellation = function(v) {
		this.getPrefs().setBoolPref("ForceContextMenuCancellation", v);
	}
   
	// ContextMenuCancellationHTML
	this.GetContextMenuCancellationHTML = function(){
		var param = "ContextMenuCancellationHTML";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, true);
		return this.getPrefs().getBoolPref(param);
	}
	
	// ContextMenuCancellationTextArea
	this.GetContextMenuCancellationTextArea = function(){
		var param = "ContextMenuCancellationTextArea";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, true);
		return this.getPrefs().getBoolPref(param);
	}
	
	// ContextMenuCancellationInput
	this.GetContextMenuCancellationInput = function(){
		var param = "ContextMenuCancellationInput";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, true);
		return this.getPrefs().getBoolPref(param);
	}
   
	// OpenAsRelatedTabs
	this.GetOpenAsRelatedTabs = function() {
        var param = "OpenAsRelatedTabs";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, true);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetOpenAsRelatedTabs = function(v) {
		this.getPrefs().setBoolPref("OpenAsRelatedTabs", v);
	}
   
	// EnableAlphanumericSorting
	this.GetEnableAlphanumericSorting = function(){
		var param = "EnableAlphanumericSorting";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}
   
	this.SetEnableAlphanumericSorting = function(v){
		this.getPrefs().setBoolPref("EnableAlphanumericSorting", v);
	}
   
	// Minimum text length
	this.GetMinimumTextLength = function() {
        var param = "MinimumTextLength";
		if (this.getPrefs().prefHasUserValue(param) == false)
			this.getPrefs().setBoolPref(param, false);
		return this.getPrefs().getBoolPref(param);
	}

	this.SetMinimumTextLength = function(v) {
		this.getPrefs().setBoolPref("MinimumTextLength", v);
	}
   
	// Minimum text length value
	this.GetMinimumTextLengthValue = function() {
        var param = "MinimumTextLengthValue";
		if (this.getPrefs().prefHasUserValue(param) == false)
            this.getPrefs().setIntPref(param, 5);
        return this.getPrefs().getIntPref(param);
	}

	this.SetMinimumTextLengthValue = function(w) {
		this.getPrefs().setIntPref("MinimumTextLengthValue", w);
	}
   
}
