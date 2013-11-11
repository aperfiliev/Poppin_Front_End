/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
function service(request,response)
{
    var returnVal = null;
	try
	{
		var retobj = {"header": {"status":{"code":"SUCCESS","message":"success"}}, 
					  "result": {"totalfound":0, 
								 "items":[],
								 "promocode":{}, 
								 "giftcertificate":{},
								 "summary" : {}} };

		var data = JSON.parse(request.getBody());	
		var method = data.method;
		var params = data.params;
		var orderObj = nlapiGetWebContainer().getShoppingSession().getOrder();
		if (method == 'add')
		{
		    try
			{
			   var itemid = params.netsuiteid;
			   var item = {'internalid':itemid, 'quantity':'1'};

			   var obj = orderObj.addItem(item);
			}
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'remove')
		{	
		    try
			{
			   var itemid = params.orderitemid;
			   var updateResult = orderObj.removeItem(itemid);
			}
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'update')
		{
		    try
			{
			   var itemid = params.orderitemid;
			   var quantity = params.quantity;
			   
			   var updateResult = orderObj.updateItemQuantity({'orderitemid' : itemid, 'quantity' : quantity});
			}
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'applyPromo')
		{
		    var promocode = params.promocode;
		    try
		    {
		    	if(JSON.stringify(promocode) == "{}"){
 					code = "ERR_WS_EMPTY_COUPON";
 					msg = "Coupon code is empty"; 	
 					retobj.header.status.code = code;
 					retobj.header.status.message = msg; 					
 	        	}else{
 	        		var updateResult = orderObj.applyPromotionCode(promocode);
 	        	}
 	        }
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'removePromo')
		{
		    try
			{
  		         var promocode = params.promocode;
		         var updateResult = orderObj.removePromotionCode(promocode);
			}
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'applyGiftCertificate') {
		    try {
		    	if(JSON.stringify(params.certificate) == "{}"){
 					code = "ERR_WS_EMPTY_GIFT_CARD";
 					msg = "Gift Certificate is empty"; 	
 					retobj.header.status.code = code;
 					retobj.header.status.message = msg; 					
 	        	}else{
 	        		retobj.result.giftcertificate.name = params.certificate;
 					var updateResult = orderObj.applyGiftCertificate(params.certificate);
 	        	}
			}
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'removeAllGiftCertificates') {

			try {
				var order = nlapiGetWebContainer().getShoppingSession().getOrder();
				order.removeAllGiftCertificates();
			}
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'estimateShipping')
		{
		    try
			{
				var result = orderObj.estimateShippingCost(params);
				
				retobj.result.summary.estimateshippingzip  = params.zip;
				retobj.result.summary.estimateshippingcountry = params.country;
			}
 	        catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'emailCartToCustomer')
		{
			NSEmail.emailCustomerCart();
		}
		else if (method == 'get' || method == 'getAll')
		{
		    // Pass through. The cart object is always returned below.
		}
		else {
			returnVal = JSON.stringify({"header": {"status":{"code":"ERR_NO_METHOD_FOUND","message":"No method found."}} });

			sendResponse(request, response, returnVal);
			return;
		}
		
		// we always return the whole cart. Let's reget everything.
		var order = nlapiGetWebContainer().getShoppingSession().getOrder().getFieldValues();
		if (order != null)	
		{
			var items = order.items;
			var cartsummary = order.summary;
			var promocodes = order.promocodes;
			var giftcertificates = order.giftcertificates;
			
			if (items)
			{
				for(var i=0; i<items.length; i++) {
				
					retobj.result.totalfound += items[i].quantity;
					var item = { 'id' :  items[i].internalid, 'orderitemid' : items[i].orderitemid, 'quantity' : items[i].quantity, 'storeurl' : items[i].canonicalurl,
								'name' : items[i].storedisplayname2,  'price' : items[i].rate_formatted, 'storedisplaythumbnail' : items[i].storedisplaythumbnail,
								'image' : items[i].storedisplaythumbnail, 'quantityelement' : items[i].itemtype + items[i].internalid + 'quantity', 
								'promotionamount' : items[i].promotionamount, 'subtotal' : items[i].amount_formatted, 'options' : items[i].options, 'isavailable' : items[i].isavailable };
							
					if (!NSCheckout.bIsNetsuiteImpl) {
					    // Ignite image.
						item.image = 'http://up.c-dn.us/p/images/carousel/'+items[i].name.toLowerCase().replace('/', '-')+'.jpg';
					}
					
					retobj.result.items[i] = item;
				}
			}
			
			if (promocodes && promocodes.length > 0) {
			   retobj.result.promocode = promocodes[0];
				if ( retobj.result.promocode.isvalid !== 'T' ) {
					try {
						orderObj.applyPromotionCode( retobj.result.promocode.promocode );
					}
					catch (e) {
						orderObj.removePromotionCode( retobj.result.promocode.promocode );
						var error = nlapiCreateError(e);
						retobj.result.promocode.error = error.getDetails();
					}
				}
			}

			if (giftcertificates && giftcertificates.length > 0) {
			   retobj.result.giftcertificates = giftcertificates;
			}

			// cart summary
			retobj.result.summary.subtotal = cartsummary.subtotal_formatted;
			retobj.result.summary.tax  = cartsummary.taxtotal_formatted;
			retobj.result.summary.discount = cartsummary.discounttotal_formatted;
			retobj.result.summary.estimatedshipping  = cartsummary.estimatedshipping_formatted;
			retobj.result.summary.shippingcost = cartsummary.shippingcost_formatted;
			retobj.result.summary.total = cartsummary.total_formatted;
			retobj.result.summary.handlingcost = cartsummary.handlingcost_formatted;
			
			//url links 
			var sitesettings = nlapiGetWebContainer().getShoppingSession().getSiteSettings();
			retobj.result.continueshoppingurl = sitesettings.touchpoints.continueshopping;
			retobj.result.checkouturl = sitesettings.touchpoints.checkout;
			retobj.result.carturl = sitesettings.touchpoints.viewcart;
			
			retobj.result.touchpoints = sitesettings.touchpoints;
			// check to see if the customer is recognized. email cart
			var emailfields = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues(["name", "email"]);
			var name = emailfields.name;
			retobj.result.email = emailfields;
			retobj.result.email.disableemailcart = (!name || 0 === name.length);
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
		
		returnVal = JSON.stringify({"header": {"status":{"code":code,"message":msg}}, "result": {"totalfound":0, "items":[], "promocode":null, "summary" : {}}});
	}
	response.setContentType('JSON');
	NSCheckout.sendResponse(request, response, returnVal);
}
