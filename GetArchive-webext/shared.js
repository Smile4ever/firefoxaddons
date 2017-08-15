// Part of Get Archive

var shared = {
	getPartialUrl: function(fullUrl){
		//console.log("getPartialUrl for " + fullUrl);
		
		var locationHttp = fullUrl.indexOf("://", 20); // second occurence
		var locationWww = fullUrl.indexOf("www.", 20); // second occurence
		var locationFtp = fullUrl.indexOf("ftp://", 20); // second occurence
		var locationHttpStart = -1;
		var locationWwwStart = -1;
		var locationFtpStart = -1;
		var result = fullUrl;
		
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
		
		// Test URL: http://webcache.googleusercontent.com/search?site=&source=hp&q=cache%3Ahttp%3A%2F%2Fwww.meshkatian.ir%2F&oq=cache%3Ahttp%3A%2F%2Fwww.meshkatian.ir%2F&gs_l=hp.3...0.0.1.310379.0.0.0.0.0.0.0.0..0.0....0...1c..64.hp..0.0.0.-_m745FLYUc -> Wayback Machine
		if(result.indexOf("&oq=cache") > -1){
			result = result.substring(0, result.indexOf("&oq=cache"));
		}
		
		//console.log("getPartialUrl result is " + result);
		
		return result;
	}
}
