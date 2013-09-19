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
			
			// invalid coupon code handling
			if(error.getCode() == "ERR_WS_INVALID_COUPON")
			{
				retobj.header.status.message = params.promocode;
				orderObj.removePromotionCode(params.promocode);
			}
		}

		retobj.result = LoginLib.getOrder();
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
