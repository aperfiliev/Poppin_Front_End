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
					  "result": {} };
					  
		if (method == 'login') {
		
			var status = nlapiGetWebContainer().getShoppingSession().logIn(params);
			if (status) {
				retobj.result = status;
			
				var customer = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues();
				retobj.header.status.code = "SUCCESS";
				retobj.header.status.message = 'success'
				retobj.result.name = customer.name;
			}
			else
			{
			   // Error.
			   retobj.header.status.code = "ERR_LOGIN_FAILED";
			   retobj.header.status.message = "User failed to login";
			}
		}
		else if (method == 'logout') {
			var status = nlapiGetWebContainer().getShoppingSession().logOut();
			retobj.result = status;
		}
		else if (method == 'isLoggedIn') {
		
		    var isLoggedIn = nlapiGetWebContainer().getShoppingSession().isLoggedIn();
			if (!isLoggedIn) {
				retobj.header.status.code = "ERR_USER_NOT_LOGGED_IN";
				retobj.header.status.message = "Not logged In";
			}
		}
		else if (method == 'registerCustomer') {
			var status = nlapiGetWebContainer().getShoppingSession().registerCustomer(params);
			var customer = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues();
			retobj.result = status;
			retobj.result.name = customer.name;
		}
		else if (method == 'registerGuest') {
			var session = nlapiGetWebContainer().getShoppingSession();
			var sitesettings = session.getSiteSettings();
			var user = {};
			if(sitesettings.registration.companyfieldmandatory == "T")
				user.company = "Guest Shopper";			
			var status = nlapiGetWebContainer().getShoppingSession().registerGuest(user);			
			retobj.result = status;
			var customer = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues(["name"]);
			retobj.result.name = customer.name;
		}
		else if (method == 'updateProfile') {
			nlapiGetWebContainer().getShoppingSession().getCustomer().updateProfile(params);
			
			var customer = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues(["internalId","name","email","emailsubscribe"]);
			retobj.result = customer;
		}
		else if (method == 'setLoginCredentials') {
		
			var customer = nlapiGetWebContainer().getShoppingSession().getCustomer();
			var name = params.name;
			if (name) {
				customer.updateProfile({"name":name});
			}
		
			customer.setLoginCredentials(params);

			var customer = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues(["internalId","name","email","emailsubscribe"]);
			retobj.result = customer;
		}
		else if (method == 'getPasswordHint') {
			var hint = nlapiGetWebContainer().getShoppingSession().getPasswordHint(params.email);
			retobj.result.hint = hint;
		}
		else if (method == 'sendPasswordRetrievalEmail') {
			var status = nlapiGetWebContainer().getShoppingSession().sendPasswordRetrievalEmail(params.email);
		}
		else if (method == 'get') {
			var customer = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues(["internalId","name","email","emailsubscribe"]);
			retobj.result.name = customer.name;
			
			if (!nlapiGetWebContainer().getShoppingSession().isLoggedIn()) {
				retobj.result.status =  "NOT_LOGGED_IN";
			}
			else if (nlapiGetWebContainer().getShoppingSession().getCustomer().isGuest()) {
				retobj.result.status =  "LOGGED_IN_GUEST";
			}
			else {
				retobj.result.status =  "LOGGED_IN_CUSTOMER";
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