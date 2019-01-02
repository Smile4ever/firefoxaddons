// Part of Get Archive

let shared = {
	getPartialUrl: function(fullUrl){	
		let locationHttp = fullUrl.indexOf("://", 20); // second occurence
		let locationWww = fullUrl.indexOf("www.", 20); // second occurence
		let locationFtp = fullUrl.indexOf("ftp://", 20); // second occurence
		let locationHttpStart = -1;
		let locationWwwStart = -1;
		let locationFtpStart = -1;
		let result = fullUrl;

		if(locationHttp > 1){
			locationHttpStart = fullUrl.indexOf("http", locationHttp - 6);
			result = fullUrl.substring(locationHttpStart);
		}

		if(locationWww > 1){
			// Test URL: https://web.archive.org/web/20071211165438/www.cph.rcm.ac.uk/Tour/Pages/Lazarus.htm
			locationWwwStart = locationWww;
			result = "http://" + fullUrl.substring(locationWwwStart); // Most pages in the archive will be HTTP, not HTTPS
		}

		if(locationFtp > 1){
			locationFtpStart = locationFtp;
			result = fullUrl.substring(locationFtpStart);
		}

		// Test URL: https://webcache.googleusercontent.com/search?site=&source=hp&q=cache%3Ahttp%3A%2F%2Fwww.meshkatian.ir%2F&oq=cache%3Ahttp%3A%2F%2Fwww.meshkatian.ir%2F&gs_l=hp.3...0.0.1.310379.0.0.0.0.0.0.0.0..0.0....0...1c..64.hp..0.0.0.-_m745FLYUc -> Wayback Machine
		if(result.includes("&oq=cache")){
			result = result.substring(0, result.indexOf("&oq=cache"));
		}
	
		return result;
	}
}

function isArchiveUrl(url){
	return isArchiveIsUrl(url) || urlStartsWith(url, "webcitation.org") || urlStartsWith(url, "web.archive.org") || urlStartsWith(url, "webcache.googleusercontent.com");
}

function isArchiveIsUrl(url){
	return urlStartsWith(url, "archive.today") || urlStartsWith(url, "archive.is") || urlStartsWith(url, "archive.li");
}

function urlStartsWith(url, startsWith){
	return url.replace(/^https?:\/\//,"").indexOf(startsWith) == 0;
}

function urlDecode(encoded){
	// https://stackoverflow.com/questions/4292914/javascript-url-decode-function
	encoded=encoded.replace(/\+/g, '%20');
	let str=encoded.split("%");
	let cval=str[0];
	for (var i=1;i<str.length;i++)
	{
		cval+=String.fromCharCode(parseInt(str[i].substring(0,2),16))+str[i].substring(2);
	}

	return cval;
}

function getDateFromUrl(url){
	let numericdate = url
		.replace("https://web.archive.org/web/", "")
		.replace("https://archive.is/", "")
		.replace("https://archive.today/", "")
		.replace("https://archive.li/", "")
		.substring(0, 8);

	let year        = numericdate.substring(0,4);
	let month       = numericdate.substring(4,6);
	let day         = numericdate.substring(6,8);

	return new Date(year, month-1, day);
}

function getDateFormat(date, format){
	if(format == null){
		format = navigator.languages[0];
	}
	let dateFormatted = date.toLocaleDateString(format, { year: 'numeric', month: 'long', day: 'numeric' });
	if (isNaN(date.getTime())) {
		return "";
	}
	
	return dateFormatted;
}
