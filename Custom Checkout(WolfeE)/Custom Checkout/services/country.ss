/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
function service(request,response)
{
    var returnVal = null;
    try 
	{
		var data = JSON.parse(request.getBody());
		
		var method = data.method;
		var params = data.params;

		var retobj = {"header": {"status":{"code":"SUCCESS","message":"success"}}, 
					  "result": {}
					};
					
		var session = nlapiGetWebContainer().getShoppingSession();
		if (method == 'getAll') {
		
			var sitesettings = session.getSiteSettings();
			var shipToCountries;
			var countries;

			// Check the site settings, if false, load the list of available country codes.
			if (sitesettings.shipallcountries ==  'F') {
				if (sitesettings.shiptocountries) {
					shipToCountries = new Object();
				
					for (var i = 0; i < sitesettings.shiptocountries.length; i++) {
						shipToCountries[sitesettings.shiptocountries[i]] = true;
					}
				}
			}

			// Get all available countries which contains country code and country name.
			var allCountries = session.getCountries();
			if (shipToCountries) {
				// Remove countries that are not in the shipToCountries list.
				countries = new Array();
				for (var i = 0; i < allCountries.length; i++) {
					if (shipToCountries[allCountries[i].code]) {
						countries[countries.length] = allCountries[i];
					}					
				}
			}
			else {
				countries = allCountries;
			}
			
			// Get all the states for countries.
			var allStates = session.getStates();
			var stateCountryMap = {};
			if (allStates)  {
				for (var i = 0; i < allStates.length; i++) {
					stateCountryMap[allStates[i].countrycode] = allStates[i].states;
				}
			}

			// add states to their corresponding countries.
			for (var i = 0; i < countries.length; i++)  {
				if (stateCountryMap[countries[i].code]) {
					countries[i].states =  stateCountryMap[countries[i].code];
				}
			}
			
			retobj.result.totalfound = countries.length;
			retobj.result.countries = countries;
			
			// Setting the default method.
			if (sitesettings.defaultshipcountry) {
				retobj.result.defaultshipcountry = sitesettings.defaultshipcountry;
			}
		}
		else if (method == 'getAllStates') {
			var allStates = session.getStates();
			retobj.result = allStates;
		}
		else if (method == 'getStates') {

			var states = session.getStates(new Array(params.country));
			if (states) {
				retobj.result.totalfound = states.length;
				retobj.result.states = states;
			}
			else {
				retobj.result.totalfound  = 0;
			}
		}
		else {
			returnVal = JSON.stringify({"header": {"status":{"code":"ERR_NO_METHOD_FOUND","message":"No method found."}} });
			response.writeLine(returnVal);
			return;
		}
		returnVal = JSON.stringify(retobj);
	}
	catch (e) {
	
	    var code = 1;
		var msg = "error";
		if ( e instanceof nlobjError ) {
		
		    code = e.getCode();
			msg = e.getDetails();
			nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
		}
		else {
			var error = nlapiCreateError(e);
		    code = error.getCode();
			msg = error.getDetails();
			nlapiLogExecution( 'DEBUG', 'unexpected error', msg );
		}
		
		returnVal = JSON.stringify({"header": {"status":{"code":code,"message":msg}} });
	}

	response.setContentType('JSON');
	response.writeLine(returnVal);
}