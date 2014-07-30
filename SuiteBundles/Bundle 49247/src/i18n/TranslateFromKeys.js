function getTranslations(requestParams) {
	var retObject = {};
	var t = null;

	var keys = requestParams.transkeys;
	if ((keys == null) || (typeof keys === "undefined"))
		keys = [];
	else if (!(keys instanceof Array))
		keys = [keys];
	
	try {
	    
	    t = advPromoTranslateInit();
	     
	} catch(ex) {
		nlapiLogExecution('ERROR', 'TranslateFromKeys', ex.toString());
	}

	
	for (var i = 0; i < keys.length; i++) {
		if (t == null) {
			retObject[keys[i]] = null;
		} else {
			try {
				// retObject[keys[i]] = t.translate(keys[i]);

				// Workaround: use encodeURIComponent to encode UTF strings with code > 0x7x
				// Apparently, RESTlets doesn't allow Unicode strings as of now
				retObject[keys[i]] = encodeURIComponent(t.translate(keys[i]));
				var z = retObject[keys[i]];
			} catch(ex) {
				nlapiLogExecution('ERROR', 'TranslateFromKeys', ("" + keys[i] + " not found"));
				nlapiLogExecution('ERROR', 'TranslateFromKeys', ex.toString());
				retObject[keys[i]] = null;
			}
		}
	}
	
	return retObject;
}




function notAvailable(requestParams) {
	var errorObject = new Object();
	errorObject.error = new Object();
	errorObject.error.code = "NOT_AVAILABLE";
	errorObject.error.message = "That method is not available";
	
	return errorObject;
}
