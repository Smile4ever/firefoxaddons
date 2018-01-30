/// Neat URL code
function resolveIconByTheme(file, theme){
	return "icons/" + theme + "/" + file;
}

function resolveIconURL(file){
	let theme = getarchive_icon_theme.replace("_notiflight", "").replace("_notifdark", "");
	return resolveIconByTheme(file, theme);
}

function resolveIconUrlNotif(file){
	if(getarchive_icon_theme.indexOf("_notiflight") > -1){
		return resolveIconByTheme(file, "light");
	}
	if(getarchive_icon_theme.indexOf("_notifdark") > -1){
		return resolveIconByTheme(file, "dark");
	}
	return resolveIconByTheme(file, getarchive_icon_theme);
}

