jQuery(document).ready(function() {
	if(!getLegacyCookie())
	{
		openLegacy();
	}
});

function openLegacy()
{
	var legacyHtml = "<h3>Obviously, we're pretty compatible already.</h3>" +
	"<div id='dotted'></div>" +
	"<h2>But, with an updated browser you'll " +
	"have complete access to the charismatic wonder that is poppin.com.<br /><br /> Besides, an update will increase " +
	"your online security, enhance your browsing experience, and it's free. We just want the best for you" +
	"&mdash;and Error Messages just make us feel so misunderstood.</h2>" +
	'<p><input type="submit" class="lgbutton" value="" onclick="location.href=' +
	"'http://windows.microsoft.com/en-US/windows/upgrade-your-browser'" + ';" ></p>' +
	'<a class="close-button" onclick="closeLegacy();return false;"></a>';
	legacy = jQuery('<div/>', { id : 'div__legacy', html : legacyHtml });
	jQuery("#coverdiv").parent().append(legacy);
	jQuery("#coverdiv").css("display", "block");
}

function closeLegacy()
{
	storeLegacyCookie();
	jQuery("#div__legacy").css("display", "none");
	jQuery("#coverdiv").css("display", "none");
}

function storeLegacyCookie() {
	var d = new Date();
	d.setDate(d.getDate() + 1);
	// setCookie declared in pp_social_media.js	
	setCookie('legacy', 'Y', d);
}
function getLegacyCookie() {
	var pattern = "(?:; )?legacy=([^;]*);?";
	var regexp = new RegExp(pattern);
	if (regexp.test(document.cookie))
		return decodeURIComponent(RegExp["$1"]);
	return false;
}