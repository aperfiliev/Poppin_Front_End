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
		var retobj = {	"header": {
							"status": {
								 "code": "SUCCESS",
								 "message": "success",
								 "promocode": ""
							}}, 
						"result": {
								 "totalfound": 0, 
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
				var items = LoginLib.getOrder().items;
				var item;
				for(var i = 0; i<items.length;i++){
					if(items[i].orderitemid == params.orderitemid){
						item = items[i];
					}
				}
//				nlapiLogExecution( 'DEBUG','item',item);
				if(params.quantity <= item.quantityavailable){
					orderObj.updateItemQuantity({'orderitemid' : params.orderitemid, 'quantity' : params.quantity});
				}else{retobj.header.status.message = "Alotofproducts "+params.orderitemid}
			}
			else if (method == 'applyPromo')
			{
				if(JSON.stringify(params.promocode) != "{}")
				{
					retobj.header.status.promocode = params.promocode;
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
			retobj.header.status.message = "<p>"+error.getDetails()+"</p>";
			
			if(error.getCode() == "ERR_WS_INVALID_COUPON")
			{
				// change notifications about invalid promocode
				switch (error.getDetails()) {
				case "This coupon code has expired or is invalid":
					retobj.header.status.message = "<p>Hmm, that didn't seem to work, please </p><p>check the date on your promo code.</p>";
					retobj.header.status.event = "Expired promo code";
					retobj.header.status.description = LoginLib.getPromoDescription(params.promocode);
					break;
				case "Coupon code is invalid or unrecognized":
					retobj.header.status.message = "<p>Unfortunately we don't recognize that </p><p>promo code. Please try again.</p>";
					retobj.header.status.event = "Promo not recognized";
					retobj.header.status.description = "";
					break;
				case "This coupon does not apply to items in cart.":
					retobj.header.status.message = "<p>Coupon code is invalid or unrecognized</p>";
					retobj.header.status.event = "Promo not applied";
					retobj.header.status.description = "";
					break;
				default:
					if(error.getDetails().indexOf("minimum order amount") !== -1)
					{
						retobj.header.status.message = "<p>In order for your code to work, you need </p><p>to add more Poppin products to your cart.</p>";
						retobj.header.status.event = "Promo rules not met";
						retobj.header.status.description = LoginLib.getPromoDescription(params.promocode);
					}
					break;
				}
				// and remove invalid promocode
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