/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
var NSCheckout = {
	bIsNetsuiteImpl : true,

	// Setting credit card as the payment for this order.
	setCreditCartPayment : function(ccId, ccsecuritycode) 	{
	
		var order = nlapiGetWebContainer().getShoppingSession().getOrder();
		var result = nlapiGetWebContainer().getShoppingSession().getCustomer().getCreditCard(ccId);
		
		if (!result)
		{
			returnVal = JSON.stringify({"header": {"status":{"code":"ERR_INVALID_CREDIT_CARD", "message" : "Error: No credit card found for id : " + ccId}} });
			response.setContentType('JSON');
			response.writeLine(returnVal);
			return false;
		}
		
		result.internalid = ccId;
		result.paymentmethod = result.paymentmethod.internalid;
		
		var payment = {"paymentterms": "CreditCard" };
		payment.creditcard = result;
		
		if (ccsecuritycode) {
			payment.creditcard.ccsecuritycode= ccsecuritycode;
		}
		
		result = order.setPayment(payment);
		nlapiLogExecution("DEBUG", "payment", JSON.stringify(result));
		
		return true;
	},
	
	// function that checks whether it needs to send back a JSON script or not 
	sendResponse : function (request, response, returnVal) {

		var jsonEvt = request.getParameter("jsonEvt");	
		var jsonCallback = request.getParameter("jsonCallback");	

		if(jsonEvt !== null) {
			response.writeLine('BDK.fire("' + jsonEvt + '",' + returnVal + ')');
		}
		else if(jsonCallback !== null) {
			response.writeLine(jsonCallback + '(' + returnVal + ')');
		}
		else {
			response.writeLine(returnVal);
		}
	}
};