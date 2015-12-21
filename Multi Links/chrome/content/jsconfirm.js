MLDialogLoad = function()
{
	image = document.getElementById("Image");
	descr = document.getElementById("Description");
	
	image.src = "chrome://multilinks/skin/confirm.png";
	descr.textContent = window.arguments[0];
}

MLClose = function(ret)
{
	var DM = new MultiLinks_DataManager();
	var sn = document.getElementById("show-again");
	if(sn.checked)
		DM.SetMaxConfirm(false);
		
	window.arguments[1].value = ret;
	close();
}