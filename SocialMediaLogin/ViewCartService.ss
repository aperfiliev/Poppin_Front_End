/**
 * Module Description
 * 
 * Version	Date			Author			Remarks
 * 1.00		16 Aug 2013	 sforostiuk
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function service(request,response)
{
	var returnVal = null;
	try
	{
		var retobj = {	"header": {"status":{"code":"SUCCESS", "message":"success" }}, 
						"result": {"totalfound": 0, 
								 "items": [],
								 "promocode": {}, 
								 "giftcertificate": {}, 
								 "summary": {}} };

		var params = request.getAllParameters();
		var method = params.method;
		var orderObj = nlapiGetWebContainer().getShoppingSession().getOrder();

		try
		{
			if (method == 'add')
			{
				orderObj.addItem({'internalid' : params.netsuiteid, 'quantity' : params.quantity});
			}
			else if (method == 'remove')
			{
				orderObj.removeItem(params.orderitemid);
			}
			else if (method == 'update')
			{
				orderObj.updateItemQuantity({'orderitemid' : params.orderitemid, 'quantity' : params.quantity});
			}
			else if (method == 'applyPromo')
			{
				if(JSON.stringify(params.promocode) != "{}")
				{
					orderObj.applyPromotionCode(params.promocode);
				}
				else
				{
					retobj.header.status.code = "ERR_WS_EMPTY_COUPON";
					retobj.header.status.message = "Coupon code is empty";
				}
			}
			else if (method == 'removePromo')
			{
				orderObj.removePromotionCode(params.promocode);
			}
			else if (method == 'applyGiftCertificate')
			{
				if(JSON.stringify(params.certificate) != "{}")
				{
					retobj.result.giftcertificate.name = params.certificate;
					orderObj.applyGiftCertificate(params.certificate);
				}
				else
				{
					retobj.header.status.code = "ERR_WS_EMPTY_GIFT_CARD";
					retobj.header.status.message = "Gift Certificate is empty";
				}
			}
			else if (method == 'removeAllGiftCertificates')
			{
				orderObj.removeAllGiftCertificates();
			}
			else if (method == 'estimateShipping')
			{
				var result = orderObj.estimateShippingCost(params);

				retobj.result.summary.estimateshippingzip  = params.zip;
				retobj.result.summary.estimateshippingcountry = params.country;
			}
			else if (method == 'get' || method == 'getAll')
			{
				// Pass through. The cart object is always returned below.
			}
			else
			{
				returnVal = JSON.stringify({"header": {"status":{"code":"ERR_NO_METHOD_FOUND","message":"No method found."}} });
				response.writeLine(returnVal);
				return;
			}
		}
		catch (e)
		{
			var error = nlapiCreateError(e);
			retobj.header.status.code = error.getCode();
			retobj.header.status.message = error.getDetails();
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
				for(var i=0; i<items.length; i++)
				{
					retobj.result.totalfound += items[i].quantity;
					var item = { 'id' : items[i].internalid, 
							'storedisplaythumbnail' : items[i].storedisplaythumbnail, 
							'storeurl' : items[i].canonicalurl, 
							'name' : items[i].storedisplayname2, 
							'quantity' : items[i].quantity, 
							'quantityavailable': items[i].quantityavailable,
							'orderitemid' : items[i].orderitemid, 
							'storedescription' : items[i].storedescription, 
							'price' : items[i].rate_formatted, 
							'amount' : items[i].amount_formatted, 
							'promotionamount' : items[i].promotionamount,	//?
							'options' : items[i].options, 					//?
							'isavailable' : items[i].isavailable }; 		//?
					retobj.result.items[i] = item;
				}
			}
			
			if (promocodes && promocodes.length > 0)
			{
				retobj.result.promocode = promocodes[0];
				/*if ( retobj.result.promocode.isvalid !== 'T' )
				{
					try {
						orderObj.applyPromotionCode( retobj.result.promocode.promocode );
					}
					catch (e)
					{
						orderObj.removePromotionCode( retobj.result.promocode.promocode );
						var error = nlapiCreateError(e);
						retobj.result.promocode.error = error.getDetails();
					}
				}*/
			}

			if (giftcertificates && giftcertificates.length > 0) {
				retobj.result.giftcertificates = giftcertificates;
			}

			// cart summary
			retobj.result.summary.subtotal = cartsummary.subtotal_formatted;
			retobj.result.summary.tax = cartsummary.taxtotal_formatted;
			retobj.result.summary.discount = cartsummary.discounttotal_formatted;
			retobj.result.summary.estimatedshipping  = cartsummary.estimatedshipping_formatted;
			retobj.result.summary.shippingcost = cartsummary.shippingcost_formatted;
			retobj.result.summary.total = cartsummary.total_formatted;
			retobj.result.summary.handlingcost = cartsummary.handlingcost_formatted;
			
			// check to see if the customer is recognized. email cart
			var emailfields = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues(["name", "email"]);
			var name = emailfields.name;
			retobj.result.email = emailfields;
			retobj.result.email.disableemailcart = (!name || 0 === name.length);
			
			//url links 
			var sitesettings = nlapiGetWebContainer().getShoppingSession().getSiteSettings();
			retobj.result.continueshoppingurl = sitesettings.touchpoints.continueshopping;
			if(!emailfields.email || 0 === emailfields.email.length) {
				retobj.checkouturl = sitesettings.touchpoints.login + "&checkout=T";
			} else {
				retobj.checkouturl = sitesettings.touchpoints.checkout;
			}
			retobj.result.carturl = sitesettings.touchpoints.viewcart;
			retobj.result.touchpoints = sitesettings.touchpoints;
		}
		returnVal = JSON.stringify(retobj);
	}
	catch (e)
	{
		var code = "ERR_UNEXPECTED";
		var msg = "error";
		if ( e instanceof nlobjError )
		{
			code = e.getCode();
			msg = e.getDetails();
			nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
		}
		else
		{
			var error = nlapiCreateError(e);
			code = error.getCode();
			msg = error.getDetails();
			nlapiLogExecution( 'DEBUG', 'unexpected error', msg );
		}
		returnVal = JSON.stringify({ "header": {"status":{"code":code,"message":msg}}, 
			"result": {"totalfound": 0, 
					 "items": [],
					 "promocode": null,
					 "giftcertificate": null,
					 "summary" : {}}});
	}
	response.setContentType('JSON');
	response.writeLine(returnVal);
}
