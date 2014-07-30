var TranslateInitFunctions;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
var $; // this really belongs to jQuery.

var TranslateInit = function() {
	if (!TranslateInitFunctions) return;
	if (!$) return;
	if (!($.ajax)) return;
	for (var i = 0; i < TranslateInitFunctions.length; i++) {
		TranslateInitFunctions[i]();
	}
	TranslateInitFunctions = [];
};


var TranslateMember = function (pRkey, pVarname, pFallback) {
	this.rkey    =  pRkey;
	this.varname  = pVarname;
	this.fallback = pFallback;
};


var TranslateHelper = function (members) {
	var th = this;

	var resturl = null;

	var SuccessHandler =  function() {
		var th = this;
		this.retdata = {};
		this.success = function(data, textStatus, jqXHR) {
			th.retdata = data;
		};
	};
	var translateKeys = function(rkeys, rresturl) {
		var tkeys = JSON.stringify({"transkeys" : rkeys});
		var successFunc = new SuccessHandler();
		$.ajax({
			"async" : false,
			"type" : "POST",
			"url" : rresturl, 
			"data" : tkeys, 
			"dataType" : 'json',
			"contentType" : "application/json; charset=utf-8"
		}).done(successFunc.success);
		return successFunc.retdata; 
	};
	
	if ((members == null) || (typeof members === "undefined")) return;
	if (members instanceof TranslateMember) members = [members];
	if (!(members instanceof Array)) return;

	var xkeys = [];
	for (var i = 0; i < members.length; i++) {
		xkeys.push(members[i].rkey); 
		th[members[i].varname] = members[i].fallback;
	}
	try {
		resturl = nlapiResolveURL('RESTLET', 'customscript_advpromo_client_translator', 'customdeploy_advpromo_client_translator');
	} catch(e) {}
	if (!resturl) return;
	
	var translatedStrings = translateKeys(xkeys, resturl);
	var tmpStr = null;
	for (var i = 0; i < members.length; i++) {
		tmpStr = null;
		tmpStr = translatedStrings[members[i].rkey];
		// if (tmpStr)	th[members[i].varname] = tmpStr;
		
		// Workaround: use encodeURIComponent to encode UTF strings with code > 0x7x
		// Apparently, RESTlets doesn't allow Unicode strings as of now
		if (tmpStr)	th[members[i].varname] = decodeURIComponent(tmpStr);
	}
};

