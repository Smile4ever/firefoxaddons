var MultiLinks_Wrapper =
{
	DataManager: null,
	LinksManager: null,
	m_down: false,
	m_popup: false,
	hide_popup: false,
	control: false,
	iScroll: null,
	dHScroll: 0,
	dVScroll: 0,
	lastPX: null,
	lastPY: null,
	IgnoreKeys: new Array(35, 36, 34, 33, 32, 39, 37, 40, 38),
	AltKey: false,
	OPNKey: null,
	OPKey: null,
	status: null,
	opmone: false,
	boxes: 0,
	moveS: null,
	
	Options: function()
	{
		window.openDialog("chrome://multilinks/content/options.xul", "", "centerscreen,chrome,modal");
		MultiLinks_Wrapper.InitIcon();
	},
	
	debug: function(s) 
	{
		return;
		var ch = document.getElementById("debug-ch");
		if(!ch)
			return;
		if(!ch.checked)
			return;
			
		var t = document.getElementById("debug-str");
		if(!t)
			return;
		
		var start = new Date(Date.now());
		var ts = start.toTimeString();
		var c = ts.indexOf(" ");
		ts = ts.substr(0, c);

		t.value += ts + ": " + s + "\n";
		
		var ti = document.getAnonymousNodes(t)[0].childNodes[0];
		ti.scrollTop=ti.scrollHeight;
    },

	OnError: function(err)
	{
		return;
		if(!this.err)
			alert("MultiLinks_Wrapper: " + err);
		this.err = true;
	},
	
	TButton: function(aEvent)
	{
		/*if(aEvent.which != 1)
			return;*/

		var tb = document.getElementById("multilinks-toolbarbutton");
		var tb2 = document.getElementById("multilinks-toolbarbutton2");
		var checked = MultiLinks_Wrapper.DataManager.GetActivated();
		checked = !checked;

		if(checked){
			tb.style.setProperty("list-style-image", "url(chrome://multilinks/skin/mlc.png)", "");
			tb2.style.setProperty("list-style-image", "url(chrome://multilinks/skin/mlc.png)", "");
		}
		else{
			tb.style.setProperty("list-style-image", "url(chrome://multilinks/skin/ml.png)", "");
			tb2.style.setProperty("list-style-image", "url(chrome://multilinks/skin/ml.png)", "");
		}
		
		MultiLinks_Wrapper.DataManager.SetActivated(checked);
	},
		
    Init: function() 
	{
        window.addEventListener("load", this.InitEvents, false);
    },

	OpenInNewTabsTO: function(links)
	{
		if(links.length == 0)
			return;
		
		var link = links[0];
		links = links.slice(1);
		
		getBrowser().selectedTab = getBrowser().addTab(link);
		
		var delay = MultiLinks_Wrapper.DataManager.GetDelay();
		setTimeout(MultiLinks_Wrapper.OpenInNewTabsTO, delay * 1000, links);
	},
	
	//init events listeners
    InitEvents: function() 
	{
		try
		{
			window.addEventListener("mousedown", MultiLinks_Wrapper.OnMouseDown, true);
			//window.addEventListener("mousemove", MultiLinks_Wrapper.OnMouseMove, true);
			window.addEventListener("mouseup", MultiLinks_Wrapper.OnMouseUp, true);
			window.addEventListener("keydown", MultiLinks_Wrapper.OnKeyDown, true);
			window.addEventListener("keyup", MultiLinks_Wrapper.OnKeyUp, true);
		
			var appcontent = document.getElementById("appcontent");
			if (appcontent)
				appcontent.addEventListener("DOMContentLoaded", MultiLinks_Wrapper.OnPageLoaded, true);
				
			var snaplContextPopup = document.getElementById("contentAreaContextMenu");
			snaplContextPopup.addEventListener("popupshowing", MultiLinks_Wrapper.OnShowPopup, true);
			//window.addEventListener("contextmenu", MultiLinks_Wrapper.HugsmileOnContextMenu, true);
			
			MultiLinks_Wrapper.DataManager = new MultiLinks_DataManager();
			MultiLinks_Wrapper.LinksManager = new MultiLinks_LinksManager();
			
			var tb = document.getElementById("multilinks-toolbarbutton");
			var tb2 = document.getElementById("multilinks-toolbarbutton2");
			var checked = MultiLinks_Wrapper.DataManager.GetActivated();
			if(checked){
				tb.style.setProperty("list-style-image", "url(chrome://multilinks/skin/mlc.png)", "");
				tb2.style.setProperty("list-style-image", "url(chrome://multilinks/skin/mlc.png)", "");
			}
			else{
				tb.style.setProperty("list-style-image", "url(chrome://multilinks/skin/ml.png)", "");
				tb2.style.setProperty("list-style-image", "url(chrome://multilinks/skin/ml.png)", "");
			}
						
			MultiLinks_Wrapper.InitIcon();
			
			var wurls = MultiLinks_Wrapper.DataManager.GetTabsInNewWindowUrls();
			MultiLinks_Wrapper.DataManager.SetTabsInNewWindowUrls("");
			if(wurls != "")
			{
				var delay = MultiLinks_Wrapper.DataManager.GetDelay();
				var awurls = wurls.split("\n");
				setTimeout(MultiLinks_Wrapper.OpenInNewTabsTO, delay * 1000, awurls);
			}
		} catch (err) {
			MultiLinks_Wrapper.OnError(err);
			return;
		}
    },

	InitIcon: function()
	{
		var tb = document.getElementById("MultiLinks-StatusBar");
		if(MultiLinks_Wrapper.DataManager.GetShowSBIcon())
			tb.style.setProperty("display", "", "");
		else
			tb.style.setProperty("display", "none", "");
				
		var tb2 = document.getElementById("multilinks-toolbarbutton2");
		// The button wasn't dragged onto the toolbar
		if(tb2 == null)
			return;
		if(MultiLinks_Wrapper.DataManager.GetShowToolbarIcon())
			tb2.style.setProperty("display", "", "");
		else
			tb2.style.setProperty("display", "none", "");
	},
	Help: function()
	{
		getBrowser().selectedTab = getBrowser().addTab("https://github.com/Smile4ever/firefoxaddons/tree/master/Multi%20Links%20Plus/README.md");
	},
	
	OnShowPopup: function(aEvent)
	{
		//MultiLinks_Wrapper.debug("Show popup" + aEvent.originalTarget);
		//aEvent.originalTarget.hidePopup();

		/*var element = aEvent.target.triggerNode;
		var isImage = (element instanceof Components.interfaces.nsIImageLoadingContent &&
                 element.currentURI != "");
       
		MultiLinks_Wrapper.debug("isImage" + isImage);
		MultiLinks_Wrapper.debug(element.toString());
		var activeElement = content.document.activeElement;
		MultiLinks_Wrapper.debug(activeElement);
		
		var isBody = (activeElement instanceof HTMLBodyElement);
        MultiLinks_Wrapper.debug("isBody" + isBody);*/

		if(MultiLinks_Wrapper.hide_popup == true)
		{
			MultiLinks_Wrapper.debug("popup hiding");
			aEvent.preventDefault();
			MultiLinks_Wrapper.hide_popup = false;
			return false;
		}else{
			MultiLinks_Wrapper.debug("popup showing");
		}
	},
	HugsmileOnContextMenu: function(aEvent){
		//ContextMenuEvent = aEvent;
		MultiLinks_Wrapper.debug("context menu!");
		
		//aEvent.preventDefault();
	},

	OnMenuContextMenu: function(aEvent)
	{
		aEvent.preventDefault();
	},
	
	OnContextHiding: function(aEvent)
	{
		if(MultiLinks_Wrapper.AltKey)
			aEvent.preventDefault();
	},
	
	IsIgnoredKey: function(key)
	{
		var bI = false;
		for(var i = 0; i < MultiLinks_Wrapper.IgnoreKeys.length; i++)
		{
			if(key == MultiLinks_Wrapper.IgnoreKeys[i])
			{
				bI = true;
				break;
			}
		}
		return bI;
	},
	
	OnKeyDown: function(aEvent)
	{
		if(MultiLinks_Wrapper.IsIgnoredKey(aEvent.keyCode))
		{
			  /*var evt = document.createEvent("MouseEvents");
			  evt.initMouseEvent("mousemove", true, true, window,
				0, 1000, 1000, null, null, false, false, false, false, 0, null);
			  gBrowser.contentDocument.dispatchEvent(evt);*/
			  

//			MultiLinks_Wrapper.LinksManager.Select(gBrowser.contentDocument, MultiLinks_Wrapper.lastPX, MultiLinks_Wrapper.lastPY);
			return;
		}
		
		if (aEvent.keyCode == aEvent.DOM_VK_ESCAPE)
		{
			MultiLinks_Wrapper.m_down = false;
			MultiLinks_Wrapper.LinksManager.StopSelect(getBrowser().selectedBrowser.contentDocument, false);
			return;
		}
		
		var mkey = MultiLinks_Wrapper.DataManager.GetMultiKey();
		
		if(aEvent.keyCode == aEvent.DOM_VK_ALT && mkey == "alt")
			MultiLinks_Wrapper.AltKey = true;
				
		if ((aEvent.keyCode == aEvent.DOM_VK_CONTROL && mkey == "ctrl") || (aEvent.keyCode == aEvent.DOM_VK_SHIFT && mkey == "shift") || (aEvent.keyCode == aEvent.DOM_VK_ALT && mkey == "alt"))
		{
			var on = MultiLinks_Wrapper.control;
			MultiLinks_Wrapper.control = true;
			if(on == false)
				MultiLinks_Wrapper.LinksManager.MarkAllLinks(getBrowser().selectedBrowser.contentDocument);
		}
		else
		{
			MultiLinks_Wrapper.m_down = false;
			MultiLinks_Wrapper.LinksManager.StopSelect(gBrowser.contentDocument, false);
		}
	},
	
	OnKeyUp: function(aEvent)
	{
		if(MultiLinks_Wrapper.IsIgnoredKey(aEvent.keyCode))
			return;
		
		if(aEvent.keyCode == aEvent.DOM_VK_ALT)
			MultiLinks_Wrapper.AltKey = false;
			
		if (aEvent.keyCode == aEvent.DOM_VK_ESCAPE)
		{
			MultiLinks_Wrapper.m_down = false;
			MultiLinks_Wrapper.LinksManager.StopSelect(getBrowser().selectedBrowser.contentDocument, false);
		}
		var mkey = MultiLinks_Wrapper.DataManager.GetMultiKey();
		if ((aEvent.keyCode == aEvent.DOM_VK_CONTROL && mkey == "ctrl") || (aEvent.keyCode == aEvent.DOM_VK_SHIFT && mkey == "shift") || (aEvent.keyCode == aEvent.DOM_VK_ALT && mkey == "alt"))
		{
			MultiLinks_Wrapper.control = false;
			
			
			if(MultiLinks_Wrapper.m_down == false && MultiLinks_Wrapper.m_popup == false)
				MultiLinks_Wrapper.LinksManager.StopSelect(getBrowser().selectedBrowser.contentDocument, true);
			else
				MultiLinks_Wrapper.LinksManager.MarkAllLinks(getBrowser().selectedBrowser.contentDocument);
		}
	},
	
	docScrollTop: function(doc)
	{
		if(doc.documentElement.scrollTop > doc.body.scrollTop)
			return doc.documentElement.scrollTop;
		else
			return doc.body.scrollTop;
	},
	
	docScrollLeft: function(doc)
	{
		if(doc.documentElement.scrollLeft > doc.body.scrollLeft)
			return doc.documentElement.scrollLeft;
		else
			return doc.body.scrollLeft;
	},
	
	docVisibleHeight: function(doc)
	{
		return doc.defaultView.innerHeight;
	},
	
	docVisibleWidth: function(doc)
	{
		return doc.defaultView.innerWidth;
	},
	
	docClientHeight: function(doc)
	{
		if(doc.documentElement.scrollHeight > doc.body.scrollHeight)
			return doc.documentElement.scrollHeight;
		
		return doc.body.scrollHeight;
	},
	
	docClientWidth: function(doc)
	{
		if(doc.documentElement.scrollWidth > doc.body.scrollWidth)
			return doc.documentElement.scrollWidth;
		
		return doc.documentElement.scrollWidth;
	},
	
	docDim: function(doc)
	{
		var dim = doc.location + "\n";
		dim += "ScrollLeft:" + this.docScrollLeft(doc) + ", \t";
		dim += "ScrollTop:" + this.docScrollTop(doc) + ", \t";
		dim += "VisibleWidth:" + this.docVisibleWidth(doc) + ", \t";
		dim += "VisibleHeight:" + this.docVisibleHeight(doc) + ", \t";
		dim += "ClientWidth:" + this.docClientWidth(doc) + ", \t";
		dim += "ClientHeight:" + this.docClientHeight(doc);

		//this.debug(dim);
	},
	
	ScrollBy: function(doc, left, top)
	{
		var bT = MultiLinks_Wrapper.docScrollTop(doc);
		var bL = MultiLinks_Wrapper.docScrollLeft(doc);
		
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		var l = MultiLinks_Wrapper.docScrollLeft(doc) + left;
		var t = MultiLinks_Wrapper.docScrollTop(doc) + top;
		doc.body.scrollTop = t;
		doc.documentElement.scrollTop = t;
		doc.body.scrollLeft = l;
		doc.documentElement.scrollLeft = l;
		
		var aT = MultiLinks_Wrapper.docScrollTop(doc);
		var aL = MultiLinks_Wrapper.docScrollLeft(doc);
		
		var r = new Object();
		r.t = aT - bT;
		r.l = aL - bL;
		return r;
	},
	
	OnMouseDown: function(aEvent)
	{
		try
		{
			//if(MultiLinks_Wrapper.control && aEvent.ctrlKey == false && aEvent.shiftKey == false && aEvent.altKey == false)
				//MultiLinks_Wrapper.control = false;
				
			var key = "L";
			if(aEvent.which == 2)
				key = "M";
			if(aEvent.which == 3)
				key = "R";
				
			if(MultiLinks_Wrapper.DataManager.GetActivated() != true)
				return;
			
			var parent = aEvent.originalTarget;
			while(parent.parentNode)
				parent = parent.parentNode;
			
			if(parent.toString().indexOf("HTML") == -1){
				return;
			}
			
			if(MultiLinks_Wrapper.DataManager.GetForceContextMenuCancellation() == true){
				if(aEvent.target && (aEvent.target.tagName == "a" ||
				aEvent.target.tagName == "A" ||
				aEvent.target.tagName == "h1" ||
				aEvent.target.tagName == "H1" ||
				aEvent.target.tagName.toUpperCase() == "TEXTAREA"
				))
					return;
				
				/*if(!parent.body)
					return;*/
			}
					
			if(MultiLinks_Wrapper.moveS && aEvent.which == 1)
			{
				if(aEvent.originalTarget == gBrowser.contentDocument.getElementById("multilinks-selection"))
				{
					aEvent.preventDefault();
					MultiLinks_Wrapper.LinksManager.StartMoveS(gBrowser.contentDocument, aEvent.pageX, aEvent.pageY);
				}
				else
				{
					MultiLinks_Wrapper.m_down = false;
					MultiLinks_Wrapper.LinksManager.StopSelect(gBrowser.contentDocument, false);
				}
				return;
			}

			var EX = aEvent.pageX;
			var EY = aEvent.pageY;
			
			var doc = gBrowser.contentDocument;
			
			/*
			 * DISABLED to disable warnings
			 * doc.MLLeft = 0; // is this needed?
			doc.MLTop = 0; // is this needed?
			*/
			var b = MultiLinks_Wrapper.LinksManager.getSubDocPos(doc, parent);
			if(b)
			{
				EX += b.x;
				EY += b.y;
			}
			
			if(doc.completed != true)
				return;

			var aElementTag = doc.activeElement.tagName.toLowerCase();
			if (aElementTag != "body"){
				return;
			}

			/*var skey = MultiLinks_Wrapper.DataManager.GetSelectKey();
			var nkey = 1;
			if(skey == "middle")
				nkey = 2;
			if(skey == "right")
				nkey = 3;*/
			
			if((aEvent.which != MultiLinks_Wrapper.OPNKey) && MultiLinks_Wrapper.OPNKey != null)
			{
				if(EX > MultiLinks_Wrapper.docClientWidth(doc) || EX < 0)
					return;
				if(EY > MultiLinks_Wrapper.docClientHeight(doc) || EY < 0)
					return;

				if(MultiLinks_Wrapper.LinksManager.on)
				{
					MultiLinks_Wrapper.m_down = false;
					var m = document.getElementById("MultiLinks-OperationContextMenu");
					var ms = document.getElementById("MultiLinks-MoveSelection");
					ms.disabled = false;
					if(MultiLinks_Wrapper.control)
						ms.disabled = true;
						
					MultiLinks_Wrapper.m_popup = true;
					m.showPopup(null, aEvent.screenX, aEvent.screenY, "popup", null, null);
					m.addEventListener("popuphiding", MultiLinks_Wrapper.OnContextHiding, true);
					m.addEventListener("contextmenu", MultiLinks_Wrapper.OnMenuContextMenu, true);
				}
				else
				{
					MultiLinks_Wrapper.m_down = false;
					MultiLinks_Wrapper.LinksManager.StopSelect(doc, false);
				}
				return;
			}
			
			if(MultiLinks_Wrapper.DataManager.GetSelectWD() && !MultiLinks_Wrapper.control)
				return;
			
			if(EX > MultiLinks_Wrapper.docClientWidth(doc) || EX < 0)
				return;
			
			if(EY > MultiLinks_Wrapper.docClientHeight(doc) || EY < 0)
				return;
			
			if(MultiLinks_Wrapper.DataManager.GetOperation(key) == 0)
				return;

			if(doc.body)
				doc.body.style.setProperty("-moz-user-select", "none", "");
			MultiLinks_Wrapper.m_down = true;
			
			// was window
			doc.addEventListener("mousemove", MultiLinks_Wrapper.OnMouseMove, true);
			//window._content.document.addEventListener("mousemove", MultiLinks_Wrapper.OnMouseMove, true);
			MultiLinks_Wrapper.m_menu = false;
			MultiLinks_Wrapper.OPNKey = Number(aEvent.which);
			MultiLinks_Wrapper.OPKey = String(key);
			MultiLinks_Wrapper.boxes++;
			MultiLinks_Wrapper.LinksManager.StartSelect(doc, EX, EY);
		} catch (err) {
			MultiLinks_Wrapper.OnError(err);
			return;
		}
	},
	
	OnMouseMove: function(aEvent)
	{
		try
		{
			if(MultiLinks_Wrapper.m_down == false)
				return;
			
			//MultiLinks_Wrapper.debug("MouseMove: aEvent.originalTarget=" + aEvent.originalTarget + "; x=" + aEvent.pageX + "; y=" + aEvent.pageY);
			//MultiLinks_Wrapper.debug("x=" + aEvent.pageX + "; y=" + aEvent.pageY + "originalTarget=" + aEvent.originalTarget);
			
			//var parent = gBrowser.contentDocument;
			var parent = aEvent.originalTarget;
			while(parent.parentNode)
				parent = parent.parentNode;

			if(!parent.body)
			{
				if(parent != MultiLinks_Wrapper.origT)
				{
					MultiLinks_Wrapper.correct4X = Number(aEvent.pageX) - Number(MultiLinks_Wrapper.lastPX);
					MultiLinks_Wrapper.correct4Y = Number(aEvent.pageY) - Number(MultiLinks_Wrapper.lastPY);
					//MultiLinks_Wrapper.debug("Correct: X=" + MultiLinks_Wrapper.correct4X + ", Y= " + MultiLinks_Wrapper.correct4Y);
					//MultiLinks_Wrapper.correct4X = 0;
				//MultiLinks_Wrapper.correct4Y = 0;
				}
			}
			else
			{
				MultiLinks_Wrapper.correct4X = 0;
				MultiLinks_Wrapper.correct4Y = 0;
			}
			
			MultiLinks_Wrapper.origT = parent;
			
			MultiLinks_Wrapper.lastPX = aEvent.pageX;
			MultiLinks_Wrapper.lastPY = aEvent.pageY;
			var X = aEvent.pageX - MultiLinks_Wrapper.correct4X;
			var Y = aEvent.pageY - MultiLinks_Wrapper.correct4Y;
			//MultiLinks_Wrapper.debug("x=" + X + "; y=" + Y);
			MultiLinks_Wrapper.LinksManager.Select(gBrowser.contentDocument, X, Y);
			MultiLinks_Wrapper.hide_popup = true;
			
			if(MultiLinks_Wrapper.status == null)
				MultiLinks_Wrapper.status = String(gBrowser.contentWindow.defaultStatus);
			if(MultiLinks_Wrapper.LinksManager.calcStatusB() == true)
				gBrowser.contentWindow.status = MultiLinks_Wrapper.LinksManager.calcStatus(gBrowser.contentDocument) + "";
			
			var doc = gBrowser.contentDocument;
			
			//MultiLinks_Wrapper.debug(MultiLinks_Wrapper.docVisibleHeight(doc) + "      " + MultiLinks_Wrapper.docScrollTop(doc) + "         " + aEvent.pageY);
			var dH = 0;
			var dV = 0;
			if(MultiLinks_Wrapper.docVisibleHeight(doc) + MultiLinks_Wrapper.docScrollTop(doc) - Y < 5)
				dV = 1;
			if(Y - MultiLinks_Wrapper.docScrollTop(doc) < 5)
				dV = -1;
			if(MultiLinks_Wrapper.docVisibleWidth(doc) + MultiLinks_Wrapper.docScrollLeft(doc) - X < 5)
				dH = 1;
			if(X - MultiLinks_Wrapper.docScrollLeft(doc) < 5)
				dH = -1;
		
			if(dH == 0 && dV == 0)
				MultiLinks_Wrapper.StopScroll();
			else
				MultiLinks_Wrapper.StartScroll(dH, dV);
				
		} catch (err) {
			MultiLinks_Wrapper.OnError(err);
			return;
		}
	},
	
	OnMouseUp: function(aEvent)
	{
		try
		{
			if(MultiLinks_Wrapper.m_down == false)
				return;

			/*var skey = MultiLinks_Wrapper.DataManager.GetSelectKey();
			var nkey = 1;
			if(skey == "middle")
				nkey = 2;
			if(skey == "right")
				nkey = 3;*/
				
			if(aEvent.which != MultiLinks_Wrapper.OPNKey && !MultiLinks_Wrapper.moveS)
				return;
				
			var parent = aEvent.originalTarget;
			while(parent.parentNode)
				parent = parent.parentNode;
			
			if(!parent.body)
				return;
				
			MultiLinks_Wrapper.LinksManager.UnmarkDeSelected(parent);
			MultiLinks_Wrapper.m_down = false;
			
			if(MultiLinks_Wrapper.control)
				MultiLinks_Wrapper.LinksManager.MarkMultiSelect(parent);
			else
				MultiLinks_Wrapper.LinksManager.StopSelect(parent, true);
				
		} catch (err) {
			MultiLinks_Wrapper.OnError(err);
			return;
		}
	},
	
	//document complete browser event
	OnPageLoaded: function(aEvent) 
	{
        aEvent.originalTarget.completed = true;
    },
	
	ConfirmMax: function()
	{
		var bundleSvc = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
		var brandBundle = bundleSvc.createBundle("chrome://branding/locale/brand.properties");
		var brandShortName = brandBundle.GetStringFromName("brandShortName");
		var ret = new Object();
		window.openDialog("chrome://multilinks/content/confirm.xul", 
							"Multi Links", "chrome, modal, centerscreen", 
							"Opening more than " + MultiLinks_Wrapper.DataManager.GetMaxLNumber() + " links may cause " + brandShortName + " to run extremely slow or crash. Are you sure?", ret);
		if(ret.value == 'true')
			return true;
		return false;
	},
	
	OpContext: function(op, cp)
	{
		if(op == -1)
		{
			MultiLinks_Wrapper.opmone = true;
			return;
		}
			
		if(MultiLinks_Wrapper.opmone)
		{
			MultiLinks_Wrapper.opmone = false;
			return;
		}
		
		if(!MultiLinks_Wrapper.moveS)
			MultiLinks_Wrapper.m_down = false;
		if(op == 0)
		{
			if(!MultiLinks_Wrapper.moveS)
				MultiLinks_Wrapper.LinksManager.StopSelect(gBrowser.contentDocument, false);
		}
		else
			MultiLinks_Wrapper.LinksManager.StopSelect(gBrowser.contentDocument, true, op, cp);
		MultiLinks_Wrapper.m_popup = false;
	},

	StartScroll: function(dH, dV)
	{
		MultiLinks_Wrapper.dHScroll = dH;
		MultiLinks_Wrapper.dVScroll = dV;
		if(MultiLinks_Wrapper.iScroll == null)
			MultiLinks_Wrapper.iScroll = window.setInterval(function() { MultiLinks_Wrapper.ScrollHold(); }, 10);
	},
	
	StopScroll: function()
	{
		window.clearInterval(MultiLinks_Wrapper.iScroll);
		MultiLinks_Wrapper.iScroll = null;
	},
	
	ScrollHold: function()
	{
		var scsp = 5 * MultiLinks_Wrapper.DataManager.GetScrollSpeed();
		var r = MultiLinks_Wrapper.ScrollBy(gBrowser.contentDocument, MultiLinks_Wrapper.dHScroll * scsp, MultiLinks_Wrapper.dVScroll * scsp);
		MultiLinks_Wrapper.lastPX += r.l;//MultiLinks_Wrapper.dHScroll * scsp;
		MultiLinks_Wrapper.lastPY += r.t;//MultiLinks_Wrapper.dVScroll * scsp;
		MultiLinks_Wrapper.correct4X -= r.l;//MultiLinks_Wrapper.dHScroll * scsp;
		MultiLinks_Wrapper.correct4Y -= r.t;//MultiLinks_Wrapper.dVScroll * scsp;
		MultiLinks_Wrapper.LinksManager.Select(gBrowser.contentDocument, MultiLinks_Wrapper.lastPX - MultiLinks_Wrapper.correct4X, MultiLinks_Wrapper.lastPY - MultiLinks_Wrapper.correct4Y);
	},
	
	getHost: function(url)
	{
		try
		{
			var host = Components.classes["@mozilla.org/network/io-service;1"]  
								.getService(Components.interfaces.nsIIOService).
								newURI(url, null, null).host;
			 if(host.match('www.*'))
				   host = host.substr(4);
			return host;
		}
		catch(err)
		{
			return "no host";
		}
	},
	
	StartMoveSelection: function()
	{
		MultiLinks_Wrapper.moveS = true;
		var selection = gBrowser.contentDocument.getElementById("multilinks-selection");
		if(!selection)
			return;
		
		selection.style.setProperty("cursor", "move", "");
		//MultiLinks_Wrapper.debug("StartMoveSelection");
	}
}

MultiLinks_Wrapper.Init();