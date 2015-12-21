var DataManager = new MultiLinks_DataManager();

MultyLinksOptionsLoadGeneral = function()
{
	var showi = document.getElementById("show-statusbaricon");
	showi.checked = DataManager.GetShowSBIcon();
	
	var smart = document.getElementById("smart-selection");
	smart.checked = DataManager.GetSmart();
	
	var mkey = document.getElementById("multi-key");
	mkey.value = DataManager.GetMultiKey();
	
	var selmd = document.getElementById("select-multy-down");
	selmd.checked = DataManager.GetSelectWD();
	
	var maxln = document.getElementById("maxlnumber");
	maxln.value = DataManager.GetMaxLNumber();
	
	var scspeed = document.getElementById("scroll-speed");
	scspeed.value = DataManager.GetScrollSpeed();
}

MultyLinksOptionsLoadAdvanced = function()
{
	var ac = document.getElementById("allways-copy-to-clipboard");
	ac.checked = DataManager.GetAllwaysCopy();
	
	var aco = document.getElementById("MultiLinks-CopyTC-Operation");
	aco.disabled = !ac.checked;
	aco.selectedIndex = DataManager.GetCopyUrlsWithTitles("");
	
	var bsame = document.getElementById("block-same");
	bsame.checked = DataManager.GetBlockSameLinks();
	
	var rev = document.getElementById("reverse-order");
	rev.checked = DataManager.GetReverseOrder();
	
	var del = document.getElementById("delay");
	del.value = DataManager.GetDelay();
}

MultyLinksOptionsLoadActions = function()
{
	var sKeys = "RML";
	for(var i = 0; i < sKeys.length; i++)
	{
		var op = document.getElementById("MultiLinks-Operation-" + sKeys[i]);
		op.selectedIndex = DataManager.GetOperation(sKeys[i]);

		var act_tab = document.getElementById("activate-new-tab-" + sKeys[i]);
		act_tab.checked = DataManager.GetActNewTab(sKeys[i]);
		act_tab.disabled = op.selectedIndex != 1;
		
		var act_wnd = document.getElementById("activate-new-window-" + sKeys[i]);
		act_wnd.checked = DataManager.GetActNewWindow(sKeys[i]);
		act_wnd.disabled = op.selectedIndex != 2;
		
		var urls_titles = document.getElementById("MultiLinks-CopyTC-Operation-" + sKeys[i]);
		urls_titles.selectedIndex = DataManager.GetCopyUrlsWithTitles(sKeys[i]);
		urls_titles.disabled = op.selectedIndex != 4;
	}
}

MultyLinksOptionsLoadAppearance = function()
{
	var sKeys = "RML";
	for(var i = 0; i < sKeys.length; i++)
	{
		var scolor = document.getElementById("selection-color-" + sKeys[i]);
		scolor.color = DataManager.GetSColor(sKeys[i]);
		
		var stcolor = document.getElementById("selection-tcolor-" + sKeys[i]);
		stcolor.value = scolor.color.substring(1, 7);
		
		var lcolor = document.getElementById("links-color-" + sKeys[i]);
		lcolor.color = DataManager.GetLColor(sKeys[i]);
		
		var ltcolor = document.getElementById("links-tcolor-" + sKeys[i]);
		ltcolor.value = lcolor.color.substring(1, 7);
		
		var swidth = document.getElementById("selection-width-" + sKeys[i]);
		swidth.value = DataManager.GetSWidth(sKeys[i]);
		
		var lwidth = document.getElementById("links-width-" + sKeys[i]);
		lwidth.value = DataManager.GetLWidth(sKeys[i]);
		
		var sstyle = document.getElementById("selection-style-" + sKeys[i]);
		sstyle.value = DataManager.GetSStyle(sKeys[i]);
		
		var lstyle = document.getElementById("links-style-" + sKeys[i]);
		lstyle.value = DataManager.GetLStyle(sKeys[i]);
	}
}

MultyLinksOptionsLoad = function()
{
	window.sizeToContent();
	
	MultyLinksOptionsLoadGeneral();
	MultyLinksOptionsLoadAdvanced();
	MultyLinksOptionsLoadActions();
	MultyLinksOptionsLoadAppearance();
}

MultyLinksOptionsUnload = function()
{

}

MultyLinksOptionsaccept = function()
{
	var ac = document.getElementById("allways-copy-to-clipboard");
	DataManager.SetAllwaysCopy(ac.checked);
	
	var aco = document.getElementById("MultiLinks-CopyTC-Operation");
	DataManager.SetCopyUrlsWithTitles("", aco.selectedIndex);
	
	var showi = document.getElementById("show-statusbaricon");
	DataManager.SetShowSBIcon(showi.checked);
	
	var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].
			getService(Components.interfaces.nsIWindowMediator).
			getMostRecentWindow("navigator:browser");

	if(mainWindow.MultiLinks_Wrapper)
		mainWindow.MultiLinks_Wrapper.InitSBIcon();
		
	var smart = document.getElementById("smart-selection");
	DataManager.SetSmart(smart.checked);
	
	var bsame = document.getElementById("block-same");
	DataManager.SetBlockSameLinks(bsame.checked);
	
	var mkey = document.getElementById("multi-key");
	DataManager.SetMultiKey(mkey.value);
	
	var selmd = document.getElementById("select-multy-down");
	DataManager.SetSelectWD(selmd.checked);
	
	var rev = document.getElementById("reverse-order");
	DataManager.SetReverseOrder(rev.checked);
	
	var maxln = document.getElementById("maxlnumber");
	DataManager.SetMaxLNumber(maxln.value);
	
	var del = document.getElementById("delay");
	DataManager.SetDelay(del.value);
	
	var scspeed = document.getElementById("scroll-speed");
	DataManager.SetScrollSpeed(scspeed.value);

	//
	var sKeys = "RML";
	for(var i = 0; i < sKeys.length; i++)
	{
		var op = document.getElementById("MultiLinks-Operation-" + sKeys[i]);
		DataManager.SetOperation(sKeys[i], op.selectedIndex);

		var act_tab = document.getElementById("activate-new-tab-" + sKeys[i]);
		DataManager.SetActNewTab(sKeys[i], act_tab.checked);

		var act_wnd = document.getElementById("activate-new-window-" + sKeys[i]);
		DataManager.SetActNewWindow(sKeys[i], act_wnd.checked);

		var urls_titles = document.getElementById("MultiLinks-CopyTC-Operation-" + sKeys[i]);
		DataManager.SetCopyUrlsWithTitles(sKeys[i], urls_titles.selectedIndex);
	}
	
	//
	var sKeys = "RML";
	for(var i = 0; i < sKeys.length; i++)
	{
		var scolor = document.getElementById("selection-color-" + sKeys[i]);
		DataManager.SetSColor(sKeys[i], scolor.color); 
		
		var lcolor = document.getElementById("links-color-" + sKeys[i]);
		DataManager.SetLColor(sKeys[i], lcolor.color);
		
		var swidth = document.getElementById("selection-width-" + sKeys[i]);
		DataManager.SetSWidth(sKeys[i], swidth.value);
		
		var lwidth = document.getElementById("links-width-" + sKeys[i]);
		DataManager.SetLWidth(sKeys[i], lwidth.value);
		
		var sstyle = document.getElementById("selection-style-" + sKeys[i]);
		DataManager.SetSStyle(sKeys[i], sstyle.value);
		
		var lstyle = document.getElementById("links-style-" + sKeys[i]);
		DataManager.SetLStyle(sKeys[i], lstyle.value);
	}
}

MultyLinksOptionsInputSColor = function()
{
	try
	{
		var stcolor = document.getElementById("selection-tcolor");
		var tc = stcolor.value;
		while(tc.length < 6)
			tc += "0";
		var scolor = document.getElementById("selection-color");
		var ncolor = "#" + tc;
		if(scolor.color != ncolor)
			scolor.color = ncolor;
	}catch(err)
	{
		//alert(err);
	}
}

MultyLinksOptionsInputLColor = function()
{
	try
	{
		var stcolor = document.getElementById("links-tcolor");
		var tc = stcolor.value;
		while(tc.length < 6)
			tc += "0";
		var scolor = document.getElementById("links-color");
		var ncolor = "#" + tc;
		if(scolor.color != ncolor)
			scolor.color = ncolor;
	}catch(err)
	{
		//alert(err);
	}
}

MultyLinksOptionsChangeSColor = function()
{
	try
	{
		var scolor = document.getElementById("selection-color");
		var color = scolor.color.substring(1, 7);
		
		var stcolor = document.getElementById("selection-tcolor");
		if(color != stcolor.value)
			stcolor.value = color;
	}catch(err)
	{
		//alert(err);
	}
}

MultyLinksOptionsChangeLColor = function()
{
	try
	{
		var scolor = document.getElementById("links-color");
		var color = scolor.color.substring(1, 7);
		
		var stcolor = document.getElementById("links-tcolor");
		if(color != stcolor.value)
			stcolor.value = color;
	}catch(err)
	{
		//alert(err);
	}
}

MultyLinksOptionsChangeOp = function(key, op)
{
	var act_tab = document.getElementById("activate-new-tab-" + key);
	act_tab.disabled = op != 1;
	
	var act_wnd = document.getElementById("activate-new-window-" + key);
	act_wnd.disabled = op != 2;
	
	var urls_titles = document.getElementById("MultiLinks-CopyTC-Operation-" + key);
	urls_titles.disabled = op != 4;
}

MultyLinksAllwaysCopyClick = function()
{
	var actc = document.getElementById("allways_copy");
	var urls_titles = document.getElementById("MultiLinks-CopyTC-Operation");
	urls_titles.disabled = !actc.checked;
}

MultyLinksOptionsHelp = function()
{
	var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].
			getService(Components.interfaces.nsIWindowMediator).
			getMostRecentWindow("navigator:browser");
			
	if(mainWindow.MultiLinks_Wrapper)
		mainWindow.MultiLinks_Wrapper.Help();
		
	window.close();
}

AllwaysCopyCLick = function()
{
	var ac = document.getElementById("allways-copy-to-clipboard");
	
	var aco = document.getElementById("MultiLinks-CopyTC-Operation");
	aco.disabled = ac.checked;
}

ResetToDefaults = function()
{
	var tabs = document.getElementById("MLOptions");
	switch(tabs.selectedIndex)
	{
		case 0:
			var showi = document.getElementById("show-statusbaricon");
			showi.checked = true;
			
			var smart = document.getElementById("smart-selection");
			smart.checked = true;
			
			var mkey = document.getElementById("multi-key");
			mkey.value = "ctrl";
			
			var selmd = document.getElementById("select-multy-down");
			selmd.checked = false;
			
			var maxln = document.getElementById("maxlnumber");
			maxln.value = 40;
			
			var scspeed = document.getElementById("scroll-speed");
			scspeed.value = 10;
			break;
		case 1:
			var ac = document.getElementById("allways-copy-to-clipboard");
			ac.checked = false;
			
			var aco = document.getElementById("MultiLinks-CopyTC-Operation");
			aco.disabled = !ac.checked;
			aco.selectedIndex = 0;
			
			var bsame = document.getElementById("block-same");
			bsame.checked = false;
			
			var rev = document.getElementById("reverse-order");
			rev.checked = false;
			
			var del = document.getElementById("delay");
			del.value = 0;
			break;
		case 2:
			var sKeys = "RML";
			for(var i = 0; i < 3; i++)
			{
				var op = document.getElementById("MultiLinks-Operation-" + sKeys[i]);
				op.selectedIndex = 0;
				if(i == 0)
					op.selectedIndex = 1;

				var act_tab = document.getElementById("activate-new-tab-" + sKeys[i]);
				act_tab.checked = false;
				act_tab.disabled = op.selectedIndex != 1;
				
				var act_wnd = document.getElementById("activate-new-window-" + sKeys[i]);
				act_wnd.checked = false;
				act_wnd.disabled = op.selectedIndex != 2;
				
				var urls_titles = document.getElementById("MultiLinks-CopyTC-Operation-" + sKeys[i]);
				urls_titles.selectedIndex = 0;
				urls_titles.disabled = op.selectedIndex != 4;
			}			
			break;
		case 3:
			var sKeys = "RML";
			for(var i = 0; i < 3; i++)
			{
				var scolor = document.getElementById("selection-color-" + sKeys[i]);
				scolor.color = "#33ff33";
				
				var stcolor = document.getElementById("selection-tcolor-" + sKeys[i]);
				stcolor.value = scolor.color.substring(1, 7);
				
				var lcolor = document.getElementById("links-color-" + sKeys[i]);
				lcolor.color = "#FF0000";
				
				var ltcolor = document.getElementById("links-tcolor-" + sKeys[i]);
				ltcolor.value = lcolor.color.substring(1, 7);
				
				var swidth = document.getElementById("selection-width-" + sKeys[i]);
				swidth.value = 2;
				
				var lwidth = document.getElementById("links-width-" + sKeys[i]);
				lwidth.value = 2;
				
				var sstyle = document.getElementById("selection-style-" + sKeys[i]);
				sstyle.value = "dotted";
				
				var lstyle = document.getElementById("links-style-" + sKeys[i]);
				lstyle.value = "solid";
			}
			break;
	}
}

Donate = function()
{
	var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].
			getService(Components.interfaces.nsIWindowMediator).
			getMostRecentWindow("navigator:browser");
	mainWindow.getBrowser().selectedTab = mainWindow.getBrowser().addTab('http://www.grizzlyape.com/donate/');
	window.close();
}
