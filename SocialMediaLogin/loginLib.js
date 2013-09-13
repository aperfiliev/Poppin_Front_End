/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Aug 2013     sforostiuk
 *
 */
var LoginLib = {
	getOrder : function() {
		var retobj = {"totalfound": 0, 
						 "items": [],
						 "promocode": {}, 
						 "giftcertificate": {},
						 "summary": {} };

		var order = nlapiGetWebContainer().getShoppingSession().getOrder().getFieldValues();
		//(["name", "email"]);
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
					retobj.totalfound += items[i].quantity;
					var price_discounted = items[i].rate - (items[i].promotiondiscount / items[i].quantity);
					price_discounted = '$' + price_discounted.toFixed(2);
					var item = {'id' : items[i].internalid, 
								'storedisplaythumbnail' : items[i].storedisplaythumbnail, 
								'storeurl' : items[i].canonicalurl, 
								'name' : items[i].storedisplayname2, 
								'quantity' : items[i].quantity, 
								'quantityavailable': items[i].quantityavailable,
								'orderitemid' : items[i].orderitemid, 
								'storedescription' : items[i].storedescription,
								'price' : items[i].rate_formatted,
								'price_discounted' : price_discounted,
								'amount' : items[i].amount_formatted, 
								'promotionamount' : items[i].promotionamount_formatted,
								'options' : items[i].options,
								'isavailable' : items[i].isavailable };
					retobj.items[i] = item;
				}
			}

			if (promocodes && promocodes.length > 0)
			{
				retobj.promocode = promocodes[0];
				// TODO: replace hardcoded 119 with promocodes[0].internalid
				//retobj.promocode.description = LoginLib.getPromoDescription(119);
			}

			if (giftcertificates && giftcertificates.length > 0) {
				retobj.giftcertificates = giftcertificates;
			}

			// cart summary
			retobj.summary.subtotal = (cartsummary.subtotal!=0) ? cartsummary.subtotal_formatted : '-';
			retobj.summary.tax = (cartsummary.taxtotal!=0) ? cartsummary.taxtotal_formatted : '-';
			retobj.summary.total = (cartsummary.total!=0) ? cartsummary.total_formatted : '-';
			
			retobj.summary.discount = (cartsummary.discounttotal!=0) ? cartsummary.discounttotal_formatted : '';
			retobj.summary.estimatedshipping = (cartsummary.estimatedshipping!=0) ? cartsummary.estimatedshipping_formatted : '-';
			retobj.summary.shippingcost = (cartsummary.shippingcost!=0) ? cartsummary.shippingcost_formatted : '-';
			retobj.summary.handlingcost = (cartsummary.handlingcost!=0) ? cartsummary.handlingcost_formatted : '-';

			// check to see if the customer is recognized. email cart
			var emailfields = nlapiGetWebContainer().getShoppingSession().getCustomer().getFieldValues(["name", "email"]);
			var name = emailfields.name;
			var email = emailfields.email;
			retobj.email = emailfields;
			retobj.email.disableemailcart = (!name || 0 === name.length);

			//url links 
			var sitesettings = nlapiGetWebContainer().getShoppingSession().getSiteSettings();
			retobj.continueshoppingurl = sitesettings.touchpoints.continueshopping;
			if(!email || 0 === email.length) {
				retobj.checkouturl = sitesettings.touchpoints.login + "&checkout=T";
			} else {
				retobj.checkouturl = sitesettings.touchpoints.checkout;
			}
			retobj.carturl = sitesettings.touchpoints.viewcart;
			retobj.touchpoints = sitesettings.touchpoints;
		}
		return retobj;
	},
	getHelp : function() {
		var helpresponse = nlapiRequestURL('https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=278&deploy=1&compid=3363929&h=e99bd31ff84dd428f826');
		return helpresponse.getBody();
	},
	getPromoDescription : function(internalid) {
		var description = "";
		try
		{
			var response = nlapiRequestURL('https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=280&deploy=1&compid=3363929&h=17e42ce4a6e832b8a0f8&internalid='+internalid);
			var respObj = JSON.parse(response.getBody());
			description = respObj.description;
		}
		catch (e)
		{
			//
		}
		return description;
	},
};