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
					
		// all methods require user to be logged in. Lets make sure that.
	    var isLoggedIn = nlapiGetWebContainer().getShoppingSession().isLoggedIn();
		if (!isLoggedIn) {
			retobj.header.status.code = "ERR_USER_NOT_LOGGED_IN";
			retobj.header.status.message = "Not logged In";

			returnVal = JSON.stringify(retobj);
			response.setContentType('JSON');
			response.writeLine(returnVal);
			return;
		}

		var order = nlapiGetWebContainer().getShoppingSession().getOrder();
		if (method == 'getAll' || method == 'getEstimates') {

			if (method == 'getEstimates') {
				
				var result = order.estimateShippingCost(params);
				
				retobj.result.summary = {
					estimateshippingzip: params.zip,
					estimateshippingcountry: params.country
				}
			}
			
			var shipmethods = order.getAvailableShippingMethods();
			
			if (shipmethods) {
				retobj.result.totalfound = shipmethods.length;
				retobj.result.shipmethods = shipmethods;
			}
			
			// Find the selected shipping method.
			var shipmethod = order.getShippingMethod();
			if (shipmethod) {
				retobj.result.selectedshipmethod = { 'shipmethod' : shipmethod.shipmethod, 'shipcarrier' : shipmethod.shipcarrier};
			}
			else  
			{
				// Do I have a default shipping method? If So set it.
				var sitesettings = nlapiGetWebContainer().getShoppingSession().getSiteSettings();
				if (sitesettings.defaultshippingmethod && shipmethods) {
				
					for (var i = 0; i < shipmethods.length; i++) {
						if (shipmethods[i].shipmethod == sitesettings.defaultshippingmethod) {
							order.setShippingMethod(shipmethods[i]);
							retobj.result.selectedshipmethod = { 'shipmethod' : shipmethods[i].shipmethod, 'shipcarrier' : shipmethods[i].shipcarrier};
						}
					}
				}
			}
		}
		else if (method == 'get') {
		
			var shipmethod = order.getShippingMethod();
			if (shipmethod) {
				retobj.result.totalfound = 1;
				retobj.result.selectedshipmethod = { 'shipmethod' : shipmethod.shipmethod, 'shipcarrier' : shipmethod.shipcarrier};
			}
			else {
				retobj.header.status.code = "ERR_UNEXPECTED";
				retobj.header.status.message = "error";
			}
		}
		else if ( method == 'set') {
			var method = params;
			var result = order.setShippingMethod(method);
		}
		else {
			returnVal = JSON.stringify({"header": {"status":{"code":"ERR_NO_METHOD_FOUND","message":"No method found."}} });
			response.writeLine(returnVal);
			return;
		}
		returnVal = JSON.stringify(retobj);
	}
	catch (e) {
	
	    var code = "ERR_UNEXPECTED";
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