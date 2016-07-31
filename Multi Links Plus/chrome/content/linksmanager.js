MultiLinks_LinksManager = function() 
{
	this.s_left = 0;
	this.s_top = 0;
	this.p_left = 0;
	this.p_top = 0;
	this.s_width = 0;
	this.s_height = 0;
	this.m_left = 0;
	this.m_top = 0;
	this.smarted = false;
	this.elapse = 50;
	this.lastupdate = 0;
	this.swidth = 0;
	this.smart = false;
	this.aLinks = null;
	this.off_top = 0;
	this.on = false;
	this.status = null;
	this.calcS = true;
	this.moveS = false;

	this.ExtractNumber = function(n)
	{
		var s = String(n);
		while(s.length && isNaN(s))
			s = s.substr(0, s.length - 1);
		if(s.length)
			return Number(s);
		return 0;
	}
	
	this.StartSelect = function(doc, left, top)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		MultiLinks_Wrapper.debug("StartSelect");
		this.p_left = left;
		this.p_top = top;
		var body = doc.body;
		
		var div = doc.getElementById("multilinks-links-container");
		if(!div)
		{
			var newDiv = doc.createElement("div");
			newDiv.setAttribute("id", "multilinks-links-container");
			newDiv.style.setProperty("position", "absolute", "")
			newDiv.style.setProperty("padding", "0px", "")
			newDiv.style.setProperty("margin", "0px", "")
			newDiv.style.setProperty("left", "0px", "");
			newDiv.style.setProperty("top", "0px", "");
			newDiv.style.setProperty("width", String(MultiLinks_Wrapper.docClientWidth(doc)) + "px", "");
			newDiv.style.setProperty("height", String(MultiLinks_Wrapper.docClientHeight(doc)) + "px", "");
			newDiv.style.setProperty("z-index", "30000", "");
			body.appendChild(newDiv);
		}		
		
		var div = doc.getElementById("multilinks-selection-container");
		if(!div)
		{
			var newDiv = doc.createElement("div");
			newDiv.setAttribute("id", "multilinks-selection-container");
			newDiv.style.setProperty("position", "absolute", "")
			newDiv.style.setProperty("padding", "0px", "")
			newDiv.style.setProperty("margin", "0px", "")
			newDiv.style.setProperty("left", "0px", "");
			newDiv.style.setProperty("top", "0px", "");
			newDiv.style.setProperty("width", String(MultiLinks_Wrapper.docClientWidth(doc)) + "px", "");
			newDiv.style.setProperty("height", String(MultiLinks_Wrapper.docClientHeight(doc)) + "px", "");
			newDiv.style.setProperty("z-index", "30001", "");
			body.appendChild(newDiv);
		}		
		
		this.swidth = MultiLinks_Wrapper.DataManager.GetSWidth();
		this.smart = MultiLinks_Wrapper.DataManager.GetSmart();
		
		//var body = doc.body; // variable not used
		this.aLinks = new Array();
		doc.MLLeft = 0;
		doc.MLTop = 0;
		this.getLinks(doc);
		//this.aLinks = body.getElementsByTagName("a");
		/*for(var i = 0; i < this.aLinks.length; i++)
			this.aLinks[i] = this.aLinks[i].wrappedJSObject;*/
			
		this.on = true;
	}
	
	this.getLinksContainer = function(link)
	{
		var doc = link.ownerDocument;
		var body = doc.body;
		
		var div = doc.getElementById("multilinks-links-container");
		if(!div)
		{
			var newDiv = doc.createElement("div");
			newDiv.setAttribute("id", "multilinks-links-container");
			newDiv.style.setProperty("position", "absolute", "")
			newDiv.style.setProperty("padding", "0px", "")
			newDiv.style.setProperty("margin", "0px", "")
			newDiv.style.setProperty("left", "0px", "");
			newDiv.style.setProperty("top", "0px", "");
			newDiv.style.setProperty("width", String(MultiLinks_Wrapper.docClientWidth(doc)) + "px", "");
			newDiv.style.setProperty("height", String(MultiLinks_Wrapper.docClientHeight(doc)) + "px", "");
			newDiv.style.setProperty("z-index", "30000", "");
			body.appendChild(newDiv);
		}	
		
		return doc.getElementById("multilinks-links-container");
	}
	
	this.getLinks = function(doc)
	{
		/*if(doc.body == null)
			return;*/
			
		var aLinks = doc.getElementsByTagName("a");
		for(var i = 0; i < aLinks.length; i++)
			MultiLinks_Wrapper.LinksManager.aLinks.push(aLinks[i]);
		
		var iframes = doc.getElementsByTagName("iframe");
		for(var f = 0; f < iframes.length; f++)
		{
			var b = this.getElementBox(doc, iframes[f]);
			iframes[f].contentDocument.MLLeft = b.x;
			iframes[f].contentDocument.MLTop = b.y;
			MultiLinks_Wrapper.LinksManager.getLinks(iframes[f].contentDocument);
		}
	}
	
	this.getSubDocPos = function(doc, sDoc)
	{
		var iframes = doc.getElementsByTagName("iframe");
		for(var f = 0; f < iframes.length; f++)
		{
			var b = this.getElementBox(doc, iframes[f]);
			if(iframes[f].contentDocument == sDoc)
				return b;
			iframes[f].contentDocument.MLLeft = b.x;
			iframes[f].contentDocument.MLTop = b.y;
			
			var bx = MultiLinks_Wrapper.LinksManager.getSubDocPos(iframes[f].contentDocument, sDoc);
			if(bx != null)
				return bx;
		}
		
		return null;
	}
	
	this.Select = function(doc, X, Y)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		var body = doc.body;
		var selection = doc.getElementById("multilinks-selection");
		if(!selection)
		{
			selection = doc.createElement("div");
			selection.setAttribute("id", "multilinks-selection");
			selection.style.setProperty("position", "absolute", "");
			
			selection.style.setProperty("padding", "0px", "");
			selection.style.setProperty("margin", "0px", "");
			
			selection.style.setProperty("outline", MultiLinks_Wrapper.DataManager.GetSStyle(MultiLinks_Wrapper.OPKey) + " " + MultiLinks_Wrapper.DataManager.GetSWidth(MultiLinks_Wrapper.OPKey) + "px " + MultiLinks_Wrapper.DataManager.GetSColor(MultiLinks_Wrapper.OPKey), "");
			
			var seldiv = doc.getElementById("multilinks-selection-container");
			if(!seldiv)
				return;
			seldiv.appendChild(selection);
		}
		
		if(MultiLinks_Wrapper.LinksManager.moveS)
		{
			
			var left = MultiLinks_Wrapper.LinksManager.ms_left;
			var top = MultiLinks_Wrapper.LinksManager.ms_top;
			left += X - MultiLinks_Wrapper.LinksManager.m_left;
			top += Y - MultiLinks_Wrapper.LinksManager.m_top;
			
			if(left + MultiLinks_Wrapper.LinksManager.s_width > MultiLinks_Wrapper.docClientWidth(doc))
				left = MultiLinks_Wrapper.docClientWidth(doc) - this.swidth - 1 - MultiLinks_Wrapper.LinksManager.s_width;
			
			if(top + MultiLinks_Wrapper.LinksManager.s_height > MultiLinks_Wrapper.docClientHeight(doc))
				top = MultiLinks_Wrapper.docClientHeight(doc) - this.swidth - 1 - MultiLinks_Wrapper.LinksManager.s_height;
				
			if(left < this.swidth + 1)
				left = this.swidth + 1;
				
			if(top < this.swidth + 1)
				top = this.swidth + 1;
			
			selection.style.setProperty("left", String(left) + "px", "");
			selection.style.setProperty("top", String(top) + "px", "");
			
			MultiLinks_Wrapper.LinksManager.s_left = left;
			MultiLinks_Wrapper.LinksManager.s_top = top;
			
			var d = new Date();
			if(d.getTime() - MultiLinks_Wrapper.LinksManager.lastupdate > MultiLinks_Wrapper.LinksManager.elapse)
			{
				MultiLinks_Wrapper.LinksManager.lastupdate = d.getTime();
				MultiLinks_Wrapper.LinksManager.MarkAllLinks(doc);
			}
		
			return;
		}
		
		var left = this.p_left;
		var top = this.p_top;
		var right = X;
		var bottom = Y;
		
		if(bottom < top)
		{
			var s = bottom;
			bottom = top;
			top = s;
		}
		
		if(right < left)
		{
			var s = right;
			right = left;
			left = s;
		}
		
		if(right > MultiLinks_Wrapper.docClientWidth(doc))
			right = MultiLinks_Wrapper.docClientWidth(doc) - this.swidth - 1;
			
		if(bottom > MultiLinks_Wrapper.docClientHeight(doc))
		{
			bottom = MultiLinks_Wrapper.docClientHeight(doc) - this.swidth - 1;
			MultiLinks_Wrapper.debug(MultiLinks_Wrapper.docClientHeight(doc));
		}
			
		if(left < this.swidth + 1)
			left = this.swidth + 1;
			
		if(top < this.swidth + 1)
			top = this.swidth + 1;
			
		/*if(left < MultiLinks_Wrapper.docScrollLeft(doc))
			left = MultiLinks_Wrapper.docScrollLeft(doc) + this.swidth;
			
		if(top < MultiLinks_Wrapper.docScrollTop(doc))
			top = MultiLinks_Wrapper.docScrollTop(doc) + this.swidth;
			
		if(right > MultiLinks_Wrapper.docScrollLeft(doc) + MultiLinks_Wrapper.docVisibleWidth(doc) - this.swidth)
			right = MultiLinks_Wrapper.docScrollLeft(doc) + MultiLinks_Wrapper.docVisibleWidth(doc) - this.swidth;
		
		if(bottom > MultiLinks_Wrapper.docScrollTop(doc) + MultiLinks_Wrapper.docVisibleHeight(doc) - this.swidth)
			bottom = MultiLinks_Wrapper.docScrollTop(doc) + MultiLinks_Wrapper.docVisibleHeight(doc) - this.swidth;*/
			
		selection.style.setProperty("left", String(left) + "px", "");
		selection.style.setProperty("top", String(top) + "px", "");
		selection.style.setProperty("width", String(right - left) + "px", "");
		selection.style.setProperty("height", String(bottom - top) + "px", "");
		
		this.s_left = left;
		this.s_top = top;
		this.s_width = right - left;
		this.s_height = bottom - top;
		//MultiLinks_Wrapper.debug(String(this.s_top) + "     " + String(this.s_height) + "        " + String(Y));
		//return;
		var d = new Date();
		if(d.getTime() - this.lastupdate > this.elapse)
		{
			this.lastupdate = d.getTime();
			this.MarkAllLinks(doc);
		}
	}

	this.StopSelect = function(doc, manage, op, cp)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		var body = doc.body;
		// Normal text selections should still work
		if(body){
			body.style.setProperty("-moz-user-select", "text", "");
		}
		
		//MultiLinks_Wrapper.debug("StopSelect");
		
		var div = doc.getElementById("multilinks-links-container");
		var urls = new Array();
		if(div)
		{
			var links = div.childNodes;
			for(var i = 0; i < links.length; i++)
			{
				if(links[i].style.getPropertyValue("visibility") != "hidden")
				{
					var l = new Object();
					l.href = links[i].getAttribute("lhref");
					l.text = links[i].getAttribute("ltext");
					urls.push(l);
				}
			}
			
			if(body){
				body.removeChild(div);
			}
		}
		var div = doc.getElementById("multilinks-selection-container");
		if(div && body)
			body.removeChild(div);
				
		this.smarted = false;
		
		if(manage &&  urls.length)
			this.ManageLinks(urls, op, cp);

		this.RollBackDOM(doc);
		MultiLinks_Wrapper.StopScroll();
		this.on = false;
		this.status = null;
		this.calcS = true;
		
		MultiLinks_Wrapper.OPNKey = null;
		MultiLinks_Wrapper.OPKey = null;
		MultiLinks_Wrapper.moveS = null;
		this.moveS = null;
		
		MultiLinks_Wrapper.status = null;
		MultiLinks_Wrapper.boxes = 0;
	}

	this.MarkAllLinks = function(doc) 
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		try
		{
			if(!this.aLinks)
				return;
			for(var i = 0; i < this.aLinks.length; i++)
				this.MarkLink(doc, this.aLinks[i], i);
			
			var div = doc.getElementById("multilinks-links-container");
			if(!div)
				return;
			var links = div.childNodes;
			var found = false;
			var maxFS = 0;
			for(var i = 0; i < links.length; i++)
			{
				if(links[i].style.getPropertyValue("visibility") != "hidden")
				{
					if(links[i].getAttribute("multi-smart") == "true")
					{
						found = true;
						break;
					}

					//if(Number(links[i].getAttribute("multi-fontsize")) > maxFS)
						//maxFS = Number(links[i].getAttribute("multi-fontsize"));
				}
			}

			/*for(var i = 0; i < links.length; i++)
			{
				if(links[i].style.getPropertyValue("visibility") != "hidden")
				{
					if(Number(links[i].getAttribute("multi-fontsize")) < maxFS)
					{
						links[i].style.setProperty("visibility", "hidden", "");
					}
				}
			}*/			
			
			this.smarted = found;
			
			// ContextMenuEvent

			var div = doc.getElementById("multilinks-links-container");
			var urls = new Array();
			
			if(div)
			{
				var links2 = div.childNodes;
				for(var i = 0; i < links2.length; i++)
				{
					if(links[i].style.getPropertyValue("visibility") != "hidden")
					{
						var l = new Object();
						l.href = links2[i].getAttribute("lhref");
						l.text = links2[i].getAttribute("ltext");
						urls.push(l);
					}
				}
			}
			var hugsmile_count = urls.length;
			
			var selectionCount = doc.getElementById("multilinks-selectioncount");
			if(!selectionCount){
				selectionCount = doc.createElement("div");
				selectionCount.setAttribute("id", "multilinks-selectioncount");
				if(selectionCount.style != null){
					selectionCount.style.setProperty("position", "absolute", "");
					selectionCount.style.setProperty("bottom", "0", "");
					selectionCount.style.setProperty("right", "0", "");
					
					selectionCount.style.setProperty("padding", "4px", "");
					selectionCount.style.setProperty("margin", "0px", "");
					
					selectionCount.style.setProperty("outline", MultiLinks_Wrapper.DataManager.GetSStyle(MultiLinks_Wrapper.OPKey) + " " + MultiLinks_Wrapper.DataManager.GetSWidth(MultiLinks_Wrapper.OPKey) + "px " + MultiLinks_Wrapper.DataManager.GetSColor(MultiLinks_Wrapper.OPKey), "");
					
					selectionCount.style.color = "green";
					selectionCount.style.background = "white";
					selectionCount.style.fontSize = "0.7em";
				}
				var selection = doc.getElementById("multilinks-selection");

				if(selection)
					selection.appendChild(selectionCount);
			}
			
			// remove old value
			try{
				while (selectionCount.firstChild) {
					selectionCount.removeChild(selectionCount.firstChild);
				}
				
				// add new value
				var selectionCountText = document.createTextNode(hugsmile_count);
				selectionCount.appendChild(selectionCountText);
			}catch(err_inside){
				// none
			}
			//MultiLinks_Wrapper.debug("length is " + links.length + " and calculated length is " + hugsmile_count);
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.MarkLink = function(doc, link, n)
	{
		try{
			if(link.hasAttribute("multilinks-visible")){
				// do nothing
			}
		}catch(e){
			return;
		}
			
		if(link.hasAttribute("multilinks-visible"))
		{
			if(link.getAttribute("multilinks-visible") == "false")
				return;
		}
		else
		{
			var visible = true;
			
			//var style = doc.defaultView.getComputedStyle(link, null);
			// add if
			if(link.ownerDocument.defaultView){
				var style = link.ownerDocument.defaultView.getComputedStyle(link, null);
				// added if
				if(style){
					if(style.getPropertyValue("visibility") == "hidden")
						visible = false;
					if(style.getPropertyValue("display") == "hidden")
						visible = false;
					if(style.getPropertyValue("display") == "none")
						visible = false;
				}
			}
			link.setAttribute("multilinks-visible", visible);
			//link.setAttribute("multilinks-fontsize", this.ExtractNumber("style.fontSize"));
			
			if(visible == false)
				return;
		}
		
		var mark = true;
		
		var left = link.offsetLeft;
		var top = link.offsetTop;
		var width = link.offsetWidth;
		var height = link.offsetHeight;
		
		if(link.hasAttribute("multilinks-offsettop"))
		{
			top = Number(link.getAttribute("multilinks-offsettop"));
			left = Number(link.getAttribute("multilinks-offsetleft"));
			width = Number(link.getAttribute("multilinks-offsetwidth"));
			height = Number(link.getAttribute("multilinks-offsetheight"));
		}
		else
		{
			var b = this.getElementBox(doc, link);

			left = b.x;
			top = b.y;
			width = b.width;
			height = b.height;
			
			link.setAttribute("multilinks-offsettop", top);
			link.setAttribute("multilinks-offsetleft", left);
			link.setAttribute("multilinks-offsetwidth", width);
			link.setAttribute("multilinks-offsetheight", height);
		}

		if(link.hasAttribute("multilinks-inscroll"))
		{
			//if(link.getAttribute("multilinks-visible") == "false")
			//	return;
		}
		else
		{
			var scr = this.getInScrollBox(doc, link);
			link.setAttribute("multilinks-inscroll", scr ? true : false);
			if(scr)
			{
				var box = this.getElementBox(doc, scr);
				var visible = true;
				
				if(top + height < box.y)
					visible = false;
					
				if(top > box.y + box.height)
					visible = false;
					
				if(left + width < box.x)
					visible = false;
					
				if(left > box.x + box.width)
					visible = false;
				
				if(!visible)
					link.setAttribute("multilinks-visible", visible);
				//MultiLinks_Wrapper.debug("(" + box.x + "," + box.y + ") " + box.width + ":" + box.height);
				//MultiLinks_Wrapper.debug(scr.scrollTop + "    " + scr.scrollLeft);
			}
		}

		if(width <= 0)
			return;
		if(height <= 0)
			return;
		
		var tol = 0;//MultiLinks_Wrapper.DataManager.GetTolerance();
		
		if(left - tol > this.s_left + this.s_width)
			mark = false;
		
		if(left + width + tol < this.s_left)
			mark = false;
			
		if(top - tol > this.s_top + this.s_height)
			mark = false;
			
		if(top + height + tol < this.s_top)
			mark = false;
			
		var body = doc.body;
		var linksdiv = doc.getElementById("multilinks-links-container");
		if(!linksdiv)
			return;
		
		var lmark = doc.getElementById("gl_link_" + String(n));

		var lmarked = false;
		if(lmark)
			lmarked = lmark.style.getPropertyValue("visibility") != "hidden";
		
		var smartlink = this.IsSEUrl(doc, link, false);
		if(this.smarted && this.smart && !smartlink)//&& this.IsSEUrl(doc, link, true))
		{
			if(lmarked)
			{
				//linksdiv.removeChild(lmark);
				lmark.style.setProperty("visibility", "hidden", "");
				MultiLinks_Wrapper.LinksManager.calcS = true;
			}
		}
			
		if(mark)
		{
			if(lmarked)
			{
				if(lmark.getAttribute("multi-selected") == "true" && lmark.getAttribute("multi-deselected") != "true")
				{
					//linksdiv.removeChild(lmark);
					lmark.style.setProperty("visibility", "hidden", "");
					lmark.setAttribute("multi-deselected", "true");
					MultiLinks_Wrapper.LinksManager.calcS = true;
				}
				return;
			}
			else
			{
				if(lmark && lmark.getAttribute("multi-deselected") == "true")
					return;
			}
		}
		else
		{
			if(lmarked)
			{
				if(lmark.getAttribute("multi-selected") == "true")
					return;

				lmark.style.setProperty("visibility", "hidden", "");
				MultiLinks_Wrapper.LinksManager.calcS = true;
				return;
			}
			else
			{
				if(!lmark)
					return;
					
				if(lmark.getAttribute("multi-deselected") != "true")
					return;
			}
		}
		
		if(smartlink)
			this.smarted = true;
			
		if(this.smarted && this.smart && !smartlink)//&& this.IsSEUrl(doc, link, true))
			return;
		
		if(lmark)
		{
			lmark.style.setProperty("visibility", "visible", "");
			MultiLinks_Wrapper.LinksManager.calcS = true;
			if(lmark.getAttribute("multi-deselected") == "true")
			{
				lmark.setAttribute("multi-deselected", "false");
			}
		}
		else
		{
			MultiLinks_Wrapper.LinksManager.calcS = true;
			var newDiv = doc.createElement("div");
			newDiv.setAttribute("id", "gl_link_" + String(n));
			newDiv.setAttribute("lhref", link.href);
			newDiv.setAttribute("ltext", link.textContent);
			newDiv.setAttribute("multi-smart", smartlink);
			
			newDiv.style.setProperty("outline", MultiLinks_Wrapper.DataManager.GetLStyle(MultiLinks_Wrapper.OPKey) + " " + MultiLinks_Wrapper.DataManager.GetLWidth(MultiLinks_Wrapper.OPKey) + "px " + MultiLinks_Wrapper.DataManager.GetLColor(MultiLinks_Wrapper.OPKey), "");

			newDiv.style.setProperty("position", "absolute", "");
			newDiv.style.setProperty("padding", "0px", "")
			
			newDiv.style.setProperty("left", String(left) + "px", "");
			newDiv.style.setProperty("top", String(top) + "px", "");
			newDiv.style.setProperty("width", String(width) + "px", "");
			newDiv.style.setProperty("height", String(height) + "px", "");
			
			//newDiv.setAttribute("multi-fontsize", link.getAttribute("multilinks-fontsize"));
			
			linksdiv.appendChild(newDiv);
		}
	}
	
	this.RollBackDOM = function(doc)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		try
		{
			if(!this.aLinks)
				return;
				
			if(this.aLinks.length == 0)
				return;
			
			//try{
				if(!this.aLinks[0].hasAttribute("multilinks-visible"))
					return;
			//}catch(err_inside){
			//	MultiLinks_Wrapper.debug("multilinks-visible is dead" + this.aLinks + this.aLinks[0]);
			//}

			for(var i = 0; i < this.aLinks.length; i++)
			{
				this.aLinks[i].wrappedJSObject.removeAttribute("multilinks-offsettop");
				this.aLinks[i].wrappedJSObject.removeAttribute("multilinks-offsetleft");
				this.aLinks[i].wrappedJSObject.removeAttribute("multilinks-offsetwidth");
				this.aLinks[i].wrappedJSObject.removeAttribute("multilinks-offsetheight");
				this.aLinks[i].wrappedJSObject.removeAttribute("multilinks-visible");
				this.aLinks[i].wrappedJSObject.removeAttribute("multilinks-smart");
				this.aLinks[i].wrappedJSObject.removeAttribute("multilinks-inscroll");
			}
		}catch(err)
		{
			//MultiLinks_Wrapper.OnError(err);
		}	
		
		var iframes = doc.getElementsByTagName("iframe");
		for(var f = 0; f < iframes.length; f++)
		{
			MultiLinks_Wrapper.LinksManager.RollBackDOM(iframes[f].contentDocument);
		}
	}
	
	this.calcStatusB = function()
	{
		if(MultiLinks_Wrapper.LinksManager.calcS == false && MultiLinks_Wrapper.LinksManager.status != null)
			return false;
		return true;
	}
	
	this.calcStatus = function(doc)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		try
		{
			if(MultiLinks_Wrapper.LinksManager.calcS == false && MultiLinks_Wrapper.LinksManager.status != null)
				return MultiLinks_Wrapper.LinksManager.status;
			
			//MultiLinks_Wrapper.debug("calcStatus");
			
			var div = doc.getElementById("multilinks-links-container");
			var urls = new Array();
			var linksCount = 0;
			if(div)
			{
				var links = div.childNodes;
				for(var i = 0; i < links.length; i++)
				{
					if(links[i].style.getPropertyValue("visibility") != "hidden")
					{
						linksCount++;
						urls.push(MultiLinks_Wrapper.getHost(links[i].getAttribute("lhref")));
					}
				}
			}
			
			//MultiLinks_Wrapper.debug(urls);
			
			var i = 0;
			while(i < urls.length)
			{
				var f = false;
				for(j = i + 1; j < urls.length; j++)
				{
					if(urls[i] == urls[j])
					{
						f = true;
						break;
					}
				}
				if(f)
					urls.splice(i, 1);
				else
					i++;
			}
			//MultiLinks_Wrapper.debug(urls);
			
			MultiLinks_Wrapper.LinksManager.status = String(linksCount);
			if(linksCount > 1)
				MultiLinks_Wrapper.LinksManager.status += " links, ";	
			else
				MultiLinks_Wrapper.LinksManager.status += " link, ";	
				
			MultiLinks_Wrapper.LinksManager.status += String(urls.length);
			if(urls.length > 1)
				MultiLinks_Wrapper.LinksManager.status += " sites, ";
			else
				MultiLinks_Wrapper.LinksManager.status += " site, ";
			
			
			MultiLinks_Wrapper.LinksManager.status += String(MultiLinks_Wrapper.boxes);
			if(MultiLinks_Wrapper.boxes > 1)
				MultiLinks_Wrapper.LinksManager.status += "  boxes";
			else
				MultiLinks_Wrapper.LinksManager.status += "  box";
				
			MultiLinks_Wrapper.LinksManager.status += "  selected";
			
			MultiLinks_Wrapper.LinksManager.calcS = false;
			return MultiLinks_Wrapper.LinksManager.status;
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}	
	}
	
	this.UnmarkDeSelected = function(doc)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		try
		{
			var body = doc.body;
			var div = doc.getElementById("multilinks-links-container");
			if(!div)
				return;
			var links = div.childNodes;
			for(var i = 0; i < links.length; i++)
			{
				links[i].setAttribute("multi-selected", "false");
				links[i].setAttribute("multi-deselected", "false");
			}
				
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}	
	}

	this.MarkMultiSelect = function(doc)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		try
		{
			var body = doc.body;
			var div = doc.getElementById("multilinks-links-container");
			if(!div)
				return;
			var links = div.childNodes;
			for(var i = 0; i < links.length; i++)
			{
				if(links[i].style.getPropertyValue("visibility") != "hidden")
					links[i].setAttribute("multi-selected", "true");
			}
			
			var seldiv = doc.getElementById("multilinks-selection-container");
			var selection = doc.getElementById("multilinks-selection");
			try{
				seldiv.removeChild(selection);
			}catch(err_inside){
				// not important
			}
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}	
	}
	
	this.CloseTabURL = function(url){
		//alert("we should close" + url);
		var tabs = gBrowser.tabs;
		for (var i = tabs.length - 1; i >= 0; i--)
		{
			var tab = tabs[i];
			var browser = gBrowser.getBrowserForTab(tab);
			if (browser.currentURI && browser.currentURI.spec == url){
				//alert("closing url" + url);
				gBrowser.removeTab(tab);
			}
			
		}
	}
		
	this.ManageLinks = function(links, op, cp){
		try
		{
			if(links.length == 0)
				return;
				
			if(MultiLinks_Wrapper.DataManager.GetBlockSameLinks())
			{
				var i = 0; 
				while(i < links.length - 1)
				{
					var j = i + 1;
					var bF = false;
					while(j < links.length)
					{
						if(links[i].href == links[j].href || links[i].href + "/" == links[j].href || links[i].href == links[j].href + "/")
							links.splice(j, 1);
						else
							j++;
					}
					i++;
				}
			}
			
			if(!op)
				op = MultiLinks_Wrapper.DataManager.GetOperation(MultiLinks_Wrapper.OPKey);
			
			if(links.length > MultiLinks_Wrapper.DataManager.GetMaxLNumber() && op != 4 && op != 5)
			{
				if(MultiLinks_Wrapper.DataManager.GetMaxConfirm())
				{
					var cm = MultiLinks_Wrapper.ConfirmMax();
					MultiLinks_Wrapper.DataManager.SetMaxAction(cm);
				}
				
				if(!MultiLinks_Wrapper.DataManager.GetMaxAction())
					return;
			}
			
			if(MultiLinks_Wrapper.DataManager.GetAllwaysCopy())
			{
				this.CopyToClipboard(links, MultiLinks_Wrapper.DataManager.GetCopyUrlsWithTitles("") + 1);
			}
			
			switch(op)
			{
				case 1:
					this.OpenInNewTabs(links);
					break;
				case 2:
					this.OpenInNewWindows(links);
					break;
				case 3:
					this.OpenTabsInNewWindow(links);
					break;
				case 4:
					this.CopyToClipboard(links, cp);
					break;
				case 5:
					this.AddToBookmarks(links);
					break;
				case 6:
					this.DownloadUrls(links);
					break;
			}
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}	
	}
	
	
	
	this.OpenInNewTabs = function(links)
	{
		var aLinks = new Array();
		for(var i = 0; i < links.length; i++)
			aLinks.push(links[i].href);
		
		if(MultiLinks_Wrapper.DataManager.GetReverseOrder())
			aLinks.reverse();
			
		var delay = MultiLinks_Wrapper.DataManager.GetDelay();
		if(delay > 0)
		{
			var act = MultiLinks_Wrapper.DataManager.GetActNewTab(MultiLinks_Wrapper.OPKey);
			setTimeout(MultiLinks_Wrapper.LinksManager.OpenInNewTabsTO, 50, aLinks, act);
		}
		else
		{
			var act = MultiLinks_Wrapper.DataManager.GetActNewTab(MultiLinks_Wrapper.OPKey);
			for(var i = 0; i < links.length; i++)
			{
				if(act)
					getBrowser().selectedTab = getBrowser().addTab(links[i].href);
				else
					getBrowser().addTab(links[i].href);
			}
		}
	}
	
	this.OpenInNewTabsTO = function(links, act)
	{
		if(links.length == 0)
			return;
		
		var link = links[0];
		links = links.slice(1);
		
		if(act)
			getBrowser().selectedTab = getBrowser().addTab(link);
		else
			getBrowser().addTab(link);
		
		var delay = MultiLinks_Wrapper.DataManager.GetDelay();
		setTimeout(MultiLinks_Wrapper.LinksManager.OpenInNewTabsTO, delay * 1000, links, act);
	}
	
	this.OpenInNewWindows = function(links)
	{
		try{
			var aLinks = new Array();
			for(var i = 0; i < links.length; i++)
				aLinks.push(links[i].href);
			
			if(MultiLinks_Wrapper.DataManager.GetReverseOrder())
				aLinks.reverse();
				
			var delay = MultiLinks_Wrapper.DataManager.GetDelay();
			if(delay > 0)
			{
				var act = MultiLinks_Wrapper.DataManager.GetActNewWindow(MultiLinks_Wrapper.OPKey);
				setTimeout(MultiLinks_Wrapper.LinksManager.OpenInNewWindowsTO, 50, aLinks, act);
			}
			else
			{
				var act = MultiLinks_Wrapper.DataManager.GetActNewWindow(MultiLinks_Wrapper.OPKey);
				for(var i = 0; i < links.length; i++)
				{
					window.open(links[i].href);
					if(!act)
						window.focus();
				}				
			}
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.OpenInNewWindowsTO = function(links, act)
	{
		if(links.length == 0)
			return;
		
		var link = links[0];
		links = links.slice(1);
		
		try{
		window.open(link);
		if(!act)
			window.focus();
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
		var delay = MultiLinks_Wrapper.DataManager.GetDelay();
		setTimeout(MultiLinks_Wrapper.LinksManager.OpenInNewWindowsTO, delay * 1000, links, act);
	}
	
	this.OpenTabsInNewWindow = function(links)
	{
		try{
		var turls = "";
		if(MultiLinks_Wrapper.DataManager.GetReverseOrder())
			links.reverse();
		
		var delay = MultiLinks_Wrapper.DataManager.GetDelay();
		if(delay > 0)
		{
			turls += links[0].href;
			var wurls = "";
			for(var i = 1; i < links.length; i++)
			{
				wurls += links[i].href;
				if(i + 1 < links.length)
					wurls += "\n";
			}
			var hand = Components.classes["@mozilla.org/browser/clh;1"].getService(Components.interfaces.nsIBrowserHandler);
			var urls = turls || hand.defaultArgs;
			MultiLinks_Wrapper.DataManager.SetTabsInNewWindowUrls(wurls);
			window.openDialog("chrome://browser/content/", "_blank", "all,chrome,dialog=no", urls); 
		}
		else
		{
			for(var i = 0; i < links.length; i++)
			{
				turls += links[i].href;
				if(i + 1 < links.length)
					turls += "|";
			}
			var hand = Components.classes["@mozilla.org/browser/clh;1"].getService(Components.interfaces.nsIBrowserHandler);
			var urls = turls || hand.defaultArgs;
			window.openDialog("chrome://browser/content/", "_blank", "all,chrome,dialog=no", urls); 
		}
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.RemoveNL = function(str)
	{
		while(str.indexOf("\n") >= 0 && str.length)
		{
			str = str.substr(0, str.indexOf("\n")) + str.substr(str.indexOf("\n") + 1);
		}
		return str;
	}
	
	this.CopyToClipboard = function(links, op)
	{
		if(!op)
			op = MultiLinks_Wrapper.DataManager.GetCopyUrlsWithTitles(MultiLinks_Wrapper.OPKey);
		else
			op--;
			
		if(MultiLinks_Wrapper.DataManager.GetReverseOrder())
			links.reverse();
			
		var str = "";
		
		for(var i = 0; i < links.length; i++)
		{
			if(op == 3)
			{
				str += "<a href=\"" + this.RemoveNL(links[i].href) + "\">" + this.RemoveNL(String(links[i].text)) + "</a>";
			}
			else
			{
				if(op == 0 || op == 2)
					str += this.RemoveNL(String(links[i].text)) + "\t";
				if(op == 0 || op == 1)
					str += this.RemoveNL(links[i].href);
			}
			if(i < links.length - 1)
					str += "\r\n";
		}

		const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
		getService(Components.interfaces.nsIClipboardHelper);  
		gClipboardHelper.copyString(str); 
	}
	
	this.DownloadUrls = function(links)
	{
		try
		{
			if(MultiLinks_Wrapper.DataManager.GetReverseOrder())
				links.reverse();
			
			for(var i = 0; i < links.length; i++)
			{
				var fileName = links[0].text.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' ').replace(/ /g,'_');
				saveURL(links[i].href, fileName, false, true, false, null); 
			}
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.AddToBookmarks = function(links)
	{
		this.AddToBookmarksFF3(links);
	}
	
	this.AddToBookmarksFF3 = function(links)
	{
		try
		{
			var linksInfo = [];
			var linksB = [];
			
			var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                      .getService(Components.interfaces.nsINavBookmarksService);
			
			var ios = Components.classes["@mozilla.org/network/io-service;1"]
						.getService(Components.interfaces.nsIIOService);
						
			for(var i = 0; i < links.length; i++)
			{
				linksInfo[i] = ios.newURI(links[i].href, null, null);
				var bookmarksArray = bmsvc.getBookmarkIdsForURI(linksInfo[i], {});
				linksB[i] = new Object();;
				linksB[i].ab = bookmarksArray;
				linksB[i].uri = linksInfo[i];
			}
			
			var info = {
				action: "add",
				type: "folder",
				hiddenRows: ["description"],
				URIList: linksInfo
			}; 
	
			openDialog("chrome://browser/content/places/bookmarkProperties2.xul", "", "centerscreen,chrome,modal,resizable=no", info); 
			
			for(var i = 0; i < links.length; i++)
			{
				var bookmarksArray = bmsvc.getBookmarkIdsForURI(linksB[i].uri, {});
				for(var j = 0; j < bookmarksArray.length; j++)
				{
					var bT = true;
					for(var t = 0; t < linksB[i].ab.length; t++)
					{
						if(linksB[i].ab[t] == bookmarksArray[j])
						{
							bT = false;
							break;
						}
					}
					if(bT)
					{
						bmsvc.setItemTitle(bookmarksArray[j], this.RemoveNL(links[i].text));
					}
				}
			}
			
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}			  
	}
		
	this.IsSEUrl = function(doc, link, isnot)
	{
		try
		{
			if(link.hasAttribute("multilinks-smart"))
			{
				if(link.getAttribute("multilinks-smart") == "true")
					return true;
				return false;
			}
			else
			{
				var url = doc.documentURI;
				if(url.indexOf("google.") >= 0/* && url.indexOf("/search?") >= 0*/)
				{
					var s = this.IsSEUrlGoogle(doc, link, isnot);
					link.setAttribute("multilinks-smart", s);
					return s;
				}
				if(url.indexOf("search.yahoo.com/search") >= 0)
				{
					var s = this.IsSEUrlYahoo(doc, link, isnot); 
					link.setAttribute("multilinks-smart", s);
					return s;
				}
				if(url.indexOf("http://www.bing.com/search") >= 0)
				{
					var s = this.IsSEUrlMSN(doc, link, isnot);
					link.setAttribute("multilinks-smart", s);
					return s;
				}
			}
			link.setAttribute("multilinks-smart", "false");
			return false;
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.IsSEUrlGoogle = function(doc, link, isnot)
	{
		try
		{
			if(isnot)
			{
				var p = link.parentNode;
				if((p.tagName == "span" || p.tagName == "SPAN") && p.className == "gl")
					return true;
					
				if((p.tagName == "span" || p.tagName == "SPAN") && p.className == "std nobr")
					return true;
					
				if((p.tagName == "div" || p.tagName == "DIV") && p.className == "s")
					return true;
			}
			else
			{
				var cN = link.parentNode.className.split(" ");
				for(var i = 0; i < cN.length; i++)
				{
					if(cN[i] == "r")
						return true;
				}
				
				if(link.parentNode.className == "r")
					return true;
					
				if(link.id.indexOf("an") == 0)
					return true;
					
				if(link.id.indexOf("aw") == 0)
					return true;
					
				if(link.className.indexOf("ps") == 0)
					return true;
					
				if(link.id.indexOf("link_") == 0 && (link.parentNode.tagName == "div" || link.parentNode.tagName == "DIV"))
					return true;
					
				if(link.parentNode.className == "title" && (link.parentNode.tagName == "h2" || link.parentNode.tagName == "H2"))
					return true;
					
				if(link.parentNode.className == "resbdy" && (link.parentNode.tagName == "h2" || link.parentNode.tagName == "H2"))
					return true;
					
				if(link.parentNode.className == "rl-title")
					return true;
					
				if(MultiLinks_Wrapper.control && link.parentNode.className == "s")
					return true;
					
				if(link.parentNode.id.indexOf("tDataImage") == 0 && (link.parentNode.tagName == "td" || link.parentNode.tagName == "TD"))
					return true;
			}
			
			return false;
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.IsSEUrlYahoo = function(doc, link, isnot)
	{
		try
		{
			if(isnot)
			{
				if(link.className == "spt")
					return true;
					
				var p = link.parentNode;
				if((p.tagName == "div" || p.tagName == "DIV") && p.className == "res")
					return true;
					
				if((p.tagName == "div" || p.tagName == "DIV") && p.className == "sm-url")
					return true;
					
				if((p.tagName == "div" || p.tagName == "DIV") && p.className == "sm-media")
					return true;
					
				if((p.tagName == "span" || p.tagName == "SPAN") && p.className == "qlmr")
					return true;
			}
			else
			{
				var p = link.parentNode.parentNode.parentNode.parentNode;
				if((p.tagName == "div" || p.tagName == "DIV") && p.className == "spns")
					return true;
					
				var p = link.parentNode.parentNode.parentNode;
				if((p.tagName == "div" || p.tagName == "DIV") && p.id == "east")
					return true;
				
				if(link.className == "yschttl spt")
					return true;
					
				if(MultiLinks_Wrapper.control && link.className == "spt")
					return true;
			}
			
			return false;
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.IsSEUrlMSN = function(doc, link, isnot)
	{
		try
		{
			if(isnot)
			{
				if(link.className == "sa_cpl")
					return true;
					
				var p = link.parentNode;
				if((p.tagName == "li" || p.tagName == "LI"))
					return true;
					
				if((p.tagName == "p" || p.tagName == "P") &&  p.className == "rc_p")
					return true;
			}
			else
			{
				var p = link.parentNode.parentNode;
				if((p.tagName == "div" || p.tagName == "DIV") && p.className == "sb_tlst")
					return true;
					
				var p = link.parentNode.parentNode.parentNode;
				if((p.tagName == "div" || p.tagName == "DIV") && p.id == "sb_adsN")
					return true;
					
				if(MultiLinks_Wrapper.control && link.parentNode.className == "rc_p")
					return true;
			}
			
			return false;
		}catch(err)
		{
			MultiLinks_Wrapper.OnError(err);
		}
	}
	
	this.getElementBox = function(doc, elem)
	{
		var a = false;
		if(elem.href && elem.href == "http://www.danettekokefineart.com/")
			a = true;
			
		if(elem.tagName.toLowerCase() == "iframe" && elem.id == "google_ads_frame1")
			a = true;

		a = false;
		
		var boxB = {};
			
		if(elem.getBoundingClientRect)
		{
			var rect = elem.getBoundingClientRect();
			
			boxB.x = Math.round(rect.left) + MultiLinks_Wrapper.docScrollLeft(elem.ownerDocument);
			boxB.y = Math.round(rect.top) + MultiLinks_Wrapper.docScrollTop(elem.ownerDocument);
			boxB.width = Math.round(rect.width);
			boxB.height = Math.round(rect.height);
			if(a)
				MultiLinks_Wrapper.debug("(" + boxB.x + "," + boxB.y + ") " + boxB.width + ":" + boxB.height);
			if(a)
				MultiLinks_Wrapper.debug(elem.innerHTML);
			//return boxB;
		}
			
		var arrEl = new Array();
		arrEl.push(elem);
		if(elem.childNodes)
		{
			for(var i = 0; i < elem.childNodes.length; i++)
			{
				arrEl.push(elem.childNodes[i]);
				if(elem.childNodes[i].childNodes)
				{
					for(var j = 0; j < elem.childNodes[i].childNodes.length; j++)
						arrEl.push(elem.childNodes[i].childNodes[j]);
				}
			}
		}
			
		var arrBx = new Array();
		
		for(var i = 0; i < arrEl.length; i++)
		{
			try
			{
				//var box = doc.getBoxObjectFor(arrEl[i]);
				var box = arrEl[i].ownerDocument.getBoxObjectFor(arrEl[i]);
				arrBx.push(box);
			}catch(err)
			{
				var el = arrEl[i];
				var box = {};
				var parent = el;
				if(el.offsetLeft == undefined)
					continue;
					
				if(a)
					MultiLinks_Wrapper.debug("Element=" + parent);
					
				box.x = parent.offsetLeft;
				box.y = parent.offsetTop;
				box.width = parent.offsetWidth;
				box.height = parent.offsetHeight;
				parent = parent.offsetParent;
				
				if(a)
					MultiLinks_Wrapper.debug("box.x=" + box.x + ",            parent.offsetTop=" + parent.offsetTop);
				
				while(parent)
				{
					var style = doc.defaultView.getComputedStyle(parent, null);  
					if(a)
						MultiLinks_Wrapper.debug("style.marginTop=" + style.marginTop);
						
					box.x += parent.offsetLeft;
					box.y += parent.offsetTop;
					
					if(a)
						MultiLinks_Wrapper.debug("box.x=" + box.x + ",            style.offsetTop=" + style.offsetTop);
					
					if(parent.offsetWidth < box.width && parent.offsetWidth > 0)
						box.width = parent.offsetWidth;
					if(parent.offsetHeight < box.height && parent.offsetHeight > 0)
						box.height = parent.offsetHeight;
						
					parent = parent.offsetParent;
				}
				
				arrBx.push(box);
			}
		}
		
		var box = {};
		box.x = elem.offsetLeft;
		box.y = elem.offsetTop;
		box.width = elem.offsetWidth;
		box.height = elem.offsetHeight;
		
		if(arrBx.length == 0)
		{
			box.x += elem.ownerDocument.MLLeft;
			box.y += elem.ownerDocument.MLTop;
			return box;
		}
		
		box.x = arrBx[0].x;
		box.y = arrBx[0].y;
		box.height = arrBx[0].height;
		box.width = arrBx[0].width;
		
		for(var i = 0; i < arrBx.length; i++)
		{
			if(arrBx[i].x < box.x)
				box.x = arrBx[i].x;
			if(arrBx[i].y < box.y)
				box.y = arrBx[i].y;
			if(arrBx[i].height > box.height)
				box.height = arrBx[i].height;
			if(arrBx[i].width > box.width)
				box.width = arrBx[i].width;
		}
		
		if(a)
			MultiLinks_Wrapper.debug("(" + box.x + "," + box.y + ") " + box.width + ":" + box.height);
				
		if(!boxB.height)
		{
			box.x += elem.ownerDocument.MLLeft;
			box.y += elem.ownerDocument.MLTop;
			return box;
		}
			
		if(box.height > boxB.height || box.width > boxB.width)
		{
			box.x += elem.ownerDocument.MLLeft;
			box.y += elem.ownerDocument.MLTop;
			return box;
		}
			
		boxB.x += elem.ownerDocument.MLLeft;
		boxB.y += elem.ownerDocument.MLTop;
		return boxB;
	}

	this.getInScrollBox = function(doc, elem)
	{
		var e = elem;
		while(e)
		{
			if(e == elem.ownerDocument.body)
				break;

			if(e.hasAttribute("multilinks-noscroll"))
			{
				//MultiLinks_Wrapper.debug("multilinks-noscroll");
				break;
			}	
				
			var style = e.ownerDocument.defaultView.getComputedStyle(e, null);

			if(style.getPropertyValue("overflow") == "scroll")
				return e;
			if(style.getPropertyValue("overflow-x") == "scroll")
				return e;
			if(style.getPropertyValue("overflow-y") == "scroll")
				return e;
				
			e = e.parentNode;
		}

		var e = elem;
		while(e)
		{
			if(e == elem.ownerDocument.body)
				break;
				
			e.setAttribute("multilinks-noscroll", true);
			
			e = e.parentNode;
		}
		
		
		if(elem.ownerDocument != doc)
			return this.getFrameForElement(doc, elem);
			
		return false;
	}
	
	this.getFrameForElement = function(doc, elem)
	{
		var iframes = doc.getElementsByTagName("iframe");
		for(var f = 0; f < iframes.length; f++)
		{
			if(iframes[f].contentDocument == elem.ownerDocument)
				return iframes[f];
				
			var fd = MultiLinks_Wrapper.LinksManager.getFrameForElement(iframes[f].contentDocument, elem);
			if(fd)
				return fd;
		}
		return false;
	}
	
	this.StartMoveS = function(doc, X, Y)
	{
		if(String(doc.location).indexOf("mail.google.com") != -1 && doc.getElementById("canvas_frame"))
			doc = doc.getElementById("canvas_frame").contentDocument;
			
		var selection = doc.getElementById("multilinks-selection");
		if(!selection)
			return;
			
		MultiLinks_Wrapper.LinksManager.moveS = true;
		MultiLinks_Wrapper.LinksManager.m_left = X;
		MultiLinks_Wrapper.LinksManager.m_top = Y;
		MultiLinks_Wrapper.LinksManager.ms_left = MultiLinks_Wrapper.LinksManager.s_left;
		MultiLinks_Wrapper.LinksManager.ms_top = MultiLinks_Wrapper.LinksManager.s_top;

		MultiLinks_Wrapper.m_down = true;
		MultiLinks_Wrapper.debug("StartMoveS");
	}
	
}