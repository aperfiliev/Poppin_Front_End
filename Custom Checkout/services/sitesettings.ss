/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
function service(request,response)
{
    var returnVal = null;
    try 
	{
		var data = JSON.parse(request.getBody() || request.getParameter("data"));
		var method = data.method;
		var params = data.params;

		var retobj = {"header": {"status":{"code":"SUCCESS","message":"success"}}, 
					  "result": {}
					};
					
		if (method == 'get') {
			var session = nlapiGetWebContainer().getShoppingSession();
			var sitesettings = session.getSiteSettings();
			retobj.result.sitesettings = sitesettings;
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
	NSCheckout.sendResponse(request, response, returnVal);
}