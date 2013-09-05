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
						 "allitems": [],	// TODO: REMOVE allitems ON PRODUCTION
						 "promocode": {}, 
						 "giftcertificate": {},
						 "summary": {} };

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
					retobj.totalfound += items[i].quantity;
					var item = {'id' : items[i].internalid, 
								'storedisplaythumbnail' : items[i].storedisplaythumbnail, 
								'storeurl' : items[i].canonicalurl, 
								'name' : items[i].storedisplayname2, 
								'quantity' : items[i].quantity, 
								'quantityavailable': items[i].quantityavailable,
								'orderitemid' : items[i].orderitemid, 
								'storedescription' : items[i].storedescription,
								'price' : items[i].rate_formatted, 
								'amount' : items[i].amount_formatted, 
								'promotionamount' : items[i].promotionamount,  // ?
								'options' : items[i].options,  // ?
								'isavailable' : items[i].isavailable };  // ?
					retobj.items[i] = item;
					retobj.allitems[i] = items[i];	// TODO: REMOVE allitems ON PRODUCTION
				}
			}

			if (promocodes && promocodes.length > 0)
			{
				retobj.promocode = promocodes[0];
			}

			if (giftcertificates && giftcertificates.length > 0) {
				retobj.giftcertificates = giftcertificates;
			}

			// cart summary
			retobj.summary.subtotal = cartsummary.subtotal_formatted;
			retobj.summary.tax = cartsummary.taxtotal_formatted;
			retobj.summary.total = cartsummary.total_formatted;
			
			retobj.summary.discount = cartsummary.discounttotal_formatted;
			retobj.summary.estimatedshipping  = cartsummary.estimatedshipping_formatted;
			retobj.summary.shippingcost = cartsummary.shippingcost_formatted;
			retobj.summary.handlingcost = cartsummary.handlingcost_formatted;

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
};