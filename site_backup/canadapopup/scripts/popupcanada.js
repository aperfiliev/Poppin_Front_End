function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i=0;i<ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {c = c.substring(1,c.length);}
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
}
function removeCookie(name)
{
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function showPopUp(el) {
var cvr = document.getElementById("coverdiv");
var dlg = document.getElementById(el);
cvr.style.display = "block";
dlg.style.display = "block";
if (document.body.style.overflow = "hidden") {
	cvr.style.width = "100%";
	cvr.style.height = "100%";
	};
}
function closePopUp(el) {
var cvr = document.getElementById("coverdiv");
var dlg = document.getElementById(el);
cvr.style.display = "none";
dlg.style.display = "none";
document.body.style.overflowY = "scroll";
}
function indigoredirect()
{
	document.location = "http://www.anrdoezrs.net/click-7182786-11427589";
}