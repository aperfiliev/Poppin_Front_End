//Init.js
// Init.js
// -------
// Global variables to be used accross models
// This is the head of combined file Model.js

/* exported container, session, settings, customer, context, order */
var container = nlapiGetWebContainer()
,	session = container.getShoppingSession()
//,	settings = session.getSiteSettings()
,	customer = session.getCustomer()
,	context = nlapiGetContext()
,	order = session.getOrder();

//SiteSettings.js
// SiteSettings.js
// ---------------
// Pre-processes the SiteSettings to be used on the site
Application.defineModel('SiteSettings', {
	
	get: function ()
	{
		'use strict';

		var i
		,	countries
		,	shipToCountries
		,	settings = session.getSiteSettings();

		// 'settings' is a global variable and contains session.getSiteSettings()
		if (settings.shipallcountries === 'F')
		{
			if (settings.shiptocountries)
			{
				shipToCountries = {};

				for (i = 0; i < settings.shiptocountries.length; i++)
				{
					shipToCountries[settings.shiptocountries[i]] = true;
				}
			}
		}

		// Get all available countries.
		var allCountries = session.getCountries();

		if (shipToCountries)
		{
			// Remove countries that are not in the shipping contuntires
			countries = {};

			for (i = 0; i < allCountries.length; i++)
			{
				if (shipToCountries[allCountries[i].code])
				{
					countries[allCountries[i].code] = allCountries[i];
				}
			}
		}
		else
		{
			countries = {};

			for (i = 0; i < allCountries.length; i++)
			{
				countries[allCountries[i].code] = allCountries[i];
			}
		}
		
		// Get all the states for countries.
		var allStates = session.getStates();

		if (allStates)
		{
			for (i = 0; i < allStates.length; i++)
			{
				if (countries[allStates[i].countrycode])
				{
					countries[allStates[i].countrycode].states = allStates[i].states;
				}
			}
		}
		
		// Adds extra information to the site settings
		settings.countries = countries;
		settings.is_loged_in = session.isLoggedIn();
		settings.phoneformat = context.getPreference('phoneformat');
		settings.minpasswordlength = context.getPreference('minpasswordlength');
		settings.campaignsubscriptions = context.getFeature('CAMPAIGNSUBSCRIPTIONS');
		settings.analytics.confpagetrackinghtml = _.escape(settings.analytics.confpagetrackinghtml);
		settings.shopperCurrency = session.getShopperCurrency();
		
		return settings;
	}
});

//Profile_tmp_Shopping.js
// Profile.js
// ----------
// Contains customer information
Application.defineModel('Profile', {
	
	get: function ()
	{
		'use strict';

		var profile = {};

		profile = customer.getFieldValues();
		profile.subsidiary = session.getShopperSubsidiary();
		profile.language = session.getShopperLanguageLocale();
		profile.currency = session.getShopperCurrency();
		// We check if the profile email is not empty and if the customer is not a guest
		profile.isLoggedIn = (profile.email && profile.email !== '' && !session.getCustomer().isGuest()) ? 'T' : 'F';
		profile.isGuest = session.getCustomer().isGuest() ? 'T' : 'F';
		profile.priceLevel = session.getShopperPriceLevel().internalid ? session.getShopperPriceLevel().internalid : session.getSiteSettings('defaultpricelevel');
		
		return profile;
	}
});


//LiveOrder.js
// LiveOrder.js
// -------
// Defines the model used by the live-order.ss service
// Available methods allow fetching and updating Shopping Cart's data
Application.defineModel('LiveOrder', {
	
	get: function ()
	{
		'use strict';

		var self = this
		,	is_secure = request.getURL().indexOf('https') === 0
		,	order_field_keys = is_secure ? SC.Configuration.order_checkout_field_keys : SC.Configuration.order_shopping_field_keys;

		if (context.getSetting('FEATURE', 'MULTISHIPTO') === 'T')
		{
			order_field_keys.items.push('shipaddress', 'shipmethod');
		}

		var order_fields = order.getFieldValues(order_field_keys)
		,	result = {};

		// Temporal Address Collection so lines can point to its own address
		var tmp_addresses = {};
		try
		{
			tmp_addresses = customer.getAddressBook();
			tmp_addresses = _.object(_.pluck(tmp_addresses, 'internalid'), tmp_addresses);
		}
		catch (e) {}

		if (is_secure && order_fields.payment && session.getSiteSettings(['checkout']).checkout.hidepaymentpagewhennobalance === 'T' && order_fields.summary.total === 0)
		{
			order.removePayment();
			// TODO: Performance improvments, get only the field we need form the ortder
			order_fields = order.getFieldValues(order_field_keys);
		}

		// TODO: Performance improvments, we are doing 3 getFieldValues in the worst scenario, try to reduce the use of getFieldValues()

		// Summary
		// Sest the summary, (no modifications should be needed). This line need to be below every call to order_fields = order.getFieldValues();
		result.summary = order_fields.summary;

		// Lines
		// Standarizes the result of the lines
		result.lines = [];
		if (order_fields.items && order_fields.items.length)
		{
			var items_to_preload = [];
			_.each(order_fields.items, function (original_line)
			{
				var amaunt = toCurrency(original_line.amount)
					// Total may be 0
				,	total = (original_line.promotionamount !== '') ? toCurrency(original_line.promotionamount) : toCurrency(original_line.amount)
				,	discount = toCurrency(original_line.promotiondiscount) || 0;

				result.lines.push({
					internalid: original_line.orderitemid
				,	quantity: original_line.quantity
				,	rate: (original_line.onlinecustomerprice_detail && original_line.onlinecustomerprice_detail.onlinecustomerprice) ? original_line.onlinecustomerprice_detail.onlinecustomerprice : ''
				,	amount: amaunt
				,	tax_amount: 0
				,	tax_rate: null
				,	tax_code: null
				,	discount: discount
				,	total: total
				,	item: original_line.internalid
				,	options: original_line.options
				,	shipaddress: (original_line.shipaddress) ? self.addAddress(tmp_addresses[original_line.shipaddress], result) : null
				,	shipmethod: original_line.shipmethod
				});

				items_to_preload.push({
					id: original_line.internalid
				,	type: original_line.itemtype
				,	parent: original_line.parentid
				});
			});

			var store_item = Application.getModel('StoreItem')
			,	restart = false;
		
			store_item.preloadItems(items_to_preload);

			result.lines.forEach(function (line)
			{
				line.item = store_item.get(line.item);

				if (!line.item)
				{
					restart = true;
					self.removeLine(line.internalid);
				}
				else
				{
					line.rate_formatted = formatCurrency(line.rate);
					line.amount_formatted = formatCurrency(line.amount);
					line.tax_amount_formatted = formatCurrency(line.tax_amount);
					line.discount_formatted = formatCurrency(line.discount);
					line.total_formatted = formatCurrency(line.total);
				}
			});

			if (restart)
			{
				return self.get();
			}

			// Sort the items in the order they were added, this is because the update operation alters the order
			var lines_sort = this.getLinesSort();

			if (lines_sort.length)
			{
				result.lines = _.sortBy(result.lines, function (line)
				{
					return _.indexOf(lines_sort, line.internalid);
				});
			}
			else 
			{
				this.setLinesSort(_.pluck(result.lines, 'internalid'));
			}

			result.lines_sort = this.getLinesSort();
			result.latest_addition = context.getSessionObject('latest_addition');
		}

		// Promocode
		result.promocode = (order_fields.promocodes && order_fields.promocodes.length) ? {
			internalid: order_fields.promocodes[0].internalid
		,	code: order_fields.promocodes[0].promocode
		,	isvalid: true
		} : null;

		// Ship Methods
		result.shipmethods = _.map(order_fields.shipmethods, function (shipmethod)
		{
			var rate = toCurrency(shipmethod.rate.replace( /^\D+/g, '')) || 0;

			return {
				internalid: shipmethod.shipmethod
			,	name: shipmethod.name
			,	shipcarrier: shipmethod.shipcarrier
			,	rate: rate
			,	rate_formatted: shipmethod.rate
			};
		});

		// Shipping Method
		result.shipmethod = order_fields.shipmethod ? order_fields.shipmethod.shipmethod : null;

		// Payment
		result.paymentmethods = [];
		var paypal = _.findWhere(session.getPaymentMethods(), {ispaypal: 'T'});
		if (order_fields.payment && order_fields.payment.creditcard && order_fields.payment.creditcard.paymentmethod && order_fields.payment.creditcard.paymentmethod.creditcard === 'T' && order_fields.payment.creditcard.paymentmethod.ispaypal !== 'T')
		{
			// Main 
			var cc = order_fields.payment.creditcard;
			result.paymentmethods.push({
				type: 'creditcard'
			,	primary: true
			,	creditcard: {
					internalid: cc.internalid
				,	ccnumber: cc.ccnumber
				,	ccname: cc.ccname
				,	ccexpiredate: cc.expmonth + '/' + cc.expyear
				,	ccsecuritycode: cc.ccsecuritycode
				,	expmonth: cc.expmonth 
				,	expyear: cc.expyear
				,	paymentmethod: {
						internalid: cc.paymentmethod.internalid
					,	name: cc.paymentmethod.name
					,	creditcard: cc.paymentmethod.creditcard === 'T'
					,	ispaypal: cc.paymentmethod.ispaypal === 'T'
					}
				}
			});
		}
		else if (order_fields.payment && paypal && paypal.internalid === order_fields.payment.paymentmethod)
		{
			result.paymentmethods.push({
				type: 'paypal'
			,	primary: true
			,	complete: context.getSessionObject('paypal_complete') === 'T'
			});
		}
		else if (order_fields.payment && order_fields.payment.paymentterms === 'Invoice')
		{
			var customer_invoice = customer.getFieldValues([
				'paymentterms'
			,	'creditlimit'
			,	'balance'
			,	'creditholdoverride'
			]);

			result.paymentmethods.push({
				type: 'invoice'
			,	primary: true
			,	paymentterms: customer_invoice.paymentterms
			,	creditlimit: parseFloat(customer_invoice.creditlimit || 0)
			,	creditlimit_formatted: formatCurrency(customer_invoice.creditlimit)
			,	balance: parseFloat(customer_invoice.balance || 0)
			,	balance_formatted: formatCurrency(customer_invoice.balance)
			,	creditholdoverride: customer_invoice.creditholdoverride
			,	purchasenumber: order_fields.purchasenumber
			});
		}

		result.isPaypalComplete = context.getSessionObject('paypal_complete') === 'T';

		// GiftCertificates
		var giftcertificates = order.getAppliedGiftCertificates();
		if (giftcertificates && giftcertificates.length)
		{
			_.forEach(giftcertificates, function (giftcertificate)
			{
				result.paymentmethods.push({
					type: 'giftcertificate'
				,	giftcertificate: {
						code: giftcertificate.giftcertcode

					,	amountapplied: toCurrency(giftcertificate.amountapplied || 0)
					,	amountapplied_formatted: formatCurrency(giftcertificate.amountapplied || 0)
					
					,	amountremaining: toCurrency(giftcertificate.amountremaining || 0)
					,	amountremaining_formatted: formatCurrency(giftcertificate.amountremaining || 0)

					,	originalamount: toCurrency(giftcertificate.originalamount || 0)
					,	originalamount_formatted: formatCurrency(giftcertificate.originalamount || 0)
					}
				});
			});
		}

		// Terms And Conditions
		result.agreetermcondition = order_fields.agreetermcondition === 'T';

		// General Addresses
		result.shipaddress = order_fields.shipaddress ? this.addAddress(order_fields.shipaddress, result) : null;

		result.billaddress = order_fields.billaddress ? this.addAddress(order_fields.billaddress, result) : null;

		result.addresses = _.values(result.addresses);

		result.addresses = _.values(result.addresses);
 
		// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints 
		result.touchpoints = session.getSiteSettings(['touchpoints']).touchpoints;

		// Transaction Body Field
		if (is_secure)
		{
			var options = {};
			
			_.each(order.getCustomFieldValues(), function (option)
			{
				options[option.name] = option.value;
			});

			result.options = options;
		}

		return result;
	}

,	addAddress: function (address, result)
	{
		'use strict';

		result.addresses = result.addresses || {};

		address.fullname = address.attention ? address.attention : address.addressee;
		address.company = address.attention ? address.addressee : null;
		
		delete address.attention;
		delete address.addressee;

		if (!address.internalid)
		{
			address.internalid =	(address.country || '') + '-' +
									(address.state || '') + '-' +
									(address.city || '') + '-' +
									(address.zip || '') + '-' +
									(address.addr1 || '') + '-' +
									(address.addr2 || '') + '-' +
									(address.fullname || '') + '-' +
									address.company;

			address.internalid = address.internalid.replace(/\s/g, '-');
		}
		
		if (!result.addresses[address.internalid])
		{
			result.addresses[address.internalid] = address;
		}

		return address.internalid;
	}
	
,	update: function (data)
	{
		'use strict';

		var current_order = this.get()
		,	is_secure = request.getURL().indexOf('https') === 0;

		// Promo code
		if (data.promocode && (!current_order.promocode || data.promocode.code !== current_order.promocode.code))
		{
			try
			{
				order.applyPromotionCode(data.promocode.code);
			}
			catch (e)
			{
				order.removePromotionCode(data.promocode.code);
				current_order.promocode && order.removePromotionCode(current_order.promocode.code);
				throw e;
			}
		}
		else if (!data.promocode && current_order.promocode)
		{
			order.removePromotionCode(current_order.promocode.code);
		}

		// Billing Address
		if (data.billaddress !== current_order.billaddress)
		{
			if (data.billaddress)
			{
				if (data.billaddress && !~data.billaddress.indexOf('null'))
				{
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setBillingAddress(new String(data.billaddress).toString());
				}
			}
			else if (is_secure)
			{
				// remove the address
				try
				{
					order.setBillingAddress('0');
				} catch(e) { }
			}

			
		}

		// Ship Address
		if (data.shipaddress !== current_order.shipaddress)
		{
			if (data.shipaddress)
			{
				if (is_secure && !~data.shipaddress.indexOf('null'))
				{
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setShippingAddress(new String(data.shipaddress).toString());
				}
				else
				{
					var address = _.find(data.addresses, function (address)
					{
						return address.internalid === data.shipaddress;
					});

					address && order.estimateShippingCost(address);
				}
			}
			else if (is_secure)
			{
				// remove the address
				try
				{
					order.setShippingAddress('0');
				} catch(e) { }
			}
			else
			{
				order.estimateShippingCost({
					zip: null
				,	country: null
				});
			}
		}

		//Because of an api issue regarding Gift Certificates, we are going to handle them separately
			var gift_certificate_methods = _.where(data.paymentmethods, {type: 'giftcertificate'})
			,	non_certificate_methods = _.difference(data.paymentmethods, gift_certificate_methods);

		// Payment Methods non gift certificate
		if (is_secure && non_certificate_methods && non_certificate_methods.length)
		{
		
			_.sortBy(non_certificate_methods, 'primary').forEach(function (paymentmethod)
			{
				if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard)
				{
					
					var credit_card = paymentmethod.creditcard
					,	require_cc_security_code = session.getSiteSettings(['checkout']).checkout.requireccsecuritycode === 'T'
					,	cc_obj = credit_card && {
									internalid: credit_card.internalid
								,	ccnumber: credit_card.ccnumber
								,	ccname: credit_card.ccname
								,	ccexpiredate: credit_card.ccexpiredate
								,	expmonth: credit_card.expmonth
								,	expyear:  credit_card.expyear
								,	paymentmethod: {
										internalid: credit_card.paymentmethod.internalid
									,	name: credit_card.paymentmethod.name
									,	creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F'
									,	ispaypal:  credit_card.paymentmethod.ispaypal ? 'T' : 'F'
									}
								};

					if (credit_card.ccsecuritycode)
					{
						cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
					}				

					if (!require_cc_security_code || require_cc_security_code && credit_card.ccsecuritycode)
					{						
						// the user's default credit card may be expired so we detect this using try&catch and if it is we remove the payment methods. 
						try 
						{
							order.setPayment({
								paymentterms: 'CreditCard'
							,	creditcard: cc_obj
							});
						}
						catch(e)
						{
							if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
							{
								order.removePayment();
							}
							throw e;
						}
					}
				}
				else if (paymentmethod.type === 'invoice')
				{
					order.setPayment({ paymentterms: 'Invoice' });
					paymentmethod.purchasenumber && order.setPurchaseNumber(paymentmethod.purchasenumber); 
				}
				else if (paymentmethod.type === 'paypal')
				{
					var paypal = _.findWhere(session.getPaymentMethods(), {ispaypal: 'T'});
					order.setPayment({paymentterms: '', paymentmethod: paypal.internalid});
				}
			});
			
		}else if (is_secure)
		{
			order.removePayment();
		}
		
		// Payment Methods gift certificate
		if (is_secure && gift_certificate_methods && gift_certificate_methods.length)
		{
			//Remove all gift certificates so we can re-enter them in the appropriate order
			order.removeAllGiftCertificates();
			_.forEach(gift_certificate_methods, function (certificate)
			{
				order.applyGiftCertificate(certificate.giftcertificate.code);
			});
		}

		// Shipping Method
		if (is_secure && data.shipmethod !== current_order.shipmethod)
		{
			var shipmethod = _.where(current_order.shipmethods, {internalid: data.shipmethod})[0];
			shipmethod && order.setShippingMethod({
				shipmethod: shipmethod.internalid
			,	shipcarrier: shipmethod.shipcarrier
			});
		}

		// Terms and conditions
		var require_terms_and_conditions = session.getSiteSettings(['checkout']).checkout.requiretermsandconditions;
		if (require_terms_and_conditions.toString() === 'T' && is_secure && !_.isUndefined(data.agreetermcondition))
		{
			order.setTermsAndConditions(data.agreetermcondition);
		}

		// Transaction Body Field
		if (is_secure && !_.isEmpty(data.options))
		{
			order.setCustomFieldValues(data.options);
		}
		
	}

,	redirectToPayPal: function ()
	{
		'use strict';

		var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints
		,	continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
		,	joint = ~continue_url.indexOf('?') ? '&' : '?';
		
		continue_url = continue_url + joint + 'paypal=DONE&fragment=' + request.getParameter('next_step');
		
		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
		,	continueurl: continue_url
		,	createorder: 'F'
		,	type: 'paypalexpress'
		,	shippingaddrfirst: 'T'
		,	showpurchaseorder: 'T'
		});
	}

,	redirectToPayPalExpress: function ()
	{
		'use strict';

		var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints
		,	continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
		,	joint = ~continue_url.indexOf('?') ? '&' : '?';
		
		continue_url = continue_url + joint + 'paypal=DONE';
		
		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
		,	continueurl: continue_url
		,	createorder: 'F'
		,	type: 'paypalexpress'
		});
	}

,	backFromPayPal: function ()
	{
		'use strict';

		var Profile = Application.getModel('Profile')
		,	customer_values = Profile.get()
		,	bill_address = order.getBillingAddress()
		,	ship_address = order.getShippingAddress();

		if (customer_values.isGuest === 'T' && session.getSiteSettings(['registration']).registration.companyfieldmandatory === 'T')
		{
			customer_values.companyname = 'Guest Shopper';
			customer.updateProfile(customer_values);
		}
		
		if (ship_address.internalid && ship_address.isvalid === 'T' && !bill_address.internalid)
		{	
			order.setBillingAddress(ship_address.internalid);
		}

		context.setSessionObject('paypal_complete', 'T');
	}
	
	// remove the shipping address or billing address if phone number is null (address not valid created by Paypal.)
,	removePaypalAddress: function(shipping_address_id, billing_address_id)
	{
		'use strict';

		try
		{
			var Address = Application.getModel('Address')
			,	shipping_address = shipping_address_id && Address.get(shipping_address_id)
			,	billing_address = billing_address_id && Address.get(billing_address_id);

			if (shipping_address && !shipping_address.phone)
			{
				Address.remove(shipping_address.internalid);
			}

			if (billing_address && shipping_address_id !== billing_address_id && !billing_address.phone)
			{
				Address.remove(billing_address.internalid);
			}
		} 
		catch (e)
		{
			// ignore this exception, it is only for the cases that we can't remove shipping or billing address.
			// This exception will not send to the front-end
			var error = Application.processError(e);
			console.log('Error ' + error.errorStatusCode + ': ' + error.errorCode + ' - ' + error.errorMessage);
		}
		

	}

,	submit: function ()
	{
		'use strict';
		
		var shipping_address = order.getShippingAddress()
		,	billing_address = order.getBillingAddress()
		,	shipping_address_id = shipping_address && shipping_address.internalid
		,	billing_address_id = billing_address && billing_address.internalid
		,	confirmation = order.submit();
		
		// checks if necessary delete addresses after submit the order.
		this.removePaypalAddress(shipping_address_id, billing_address_id);
		
		context.setSessionObject('paypal_complete', 'F');
		return confirmation;
	}


,	getLinesSort: function ()
	{
		'use strict';
		return context.getSessionObject('lines_sort') ? context.getSessionObject('lines_sort').split(',') : [];
	}

,	setLinesSort: function (lines_sort)
	{
		'use strict';
		return context.setSessionObject('lines_sort', lines_sort || []);
	}

,	addLine: function (line_data)
	{
		'use strict';
		
		// Adds the line to the order
		var line_id = order.addItem({
			internalid: line_data.item.internalid.toString()
		,	quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
		,	options: line_data.options || {}
		});

		// Sets it ship address (if present)
		line_data.shipaddress && order.setItemShippingAddress(line_id, line_data.shipaddress);
		
		// Sets it ship method (if present)
		line_data.shipmethod && order.setItemShippingMethod(line_id, line_data.shipmethod);

		// Stores the latest addition
		context.setSessionObject('latest_addition', line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort.unshift(line_id);
		this.setLinesSort(lines_sort);

		return line_id;
	}
	
,	removeLine: function (line_id)
	{
		'use strict';
		
		// Removes the line
		order.removeItem(line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort = _.without(lines_sort, line_id);
		this.setLinesSort(lines_sort);
	}

,	updateLine: function (line_id, line_data)
	{
		'use strict';
		
		var lines_sort = this.getLinesSort()
		,	current_position = _.indexOf(lines_sort, line_id)
		,	original_line_object = order.getItem(line_id);

		this.removeLine(line_id);

		if (!_.isNumber(line_data.quantity) || line_data.quantity > 0)
		{
			var new_line_id;
			try
			{
				new_line_id = this.addLine(line_data);
			}
			catch (e)
			{
				// we try to roll back the item to the original state
				var roll_back_item = {
					item: { internalid: parseInt(original_line_object.internalid, 10) }
				,	quantity: parseInt(original_line_object.quantity, 10)
				};

				if (original_line_object.options && original_line_object.options.length)
				{
					roll_back_item.options = {};
					_.each(original_line_object.options, function (option)
					{
						roll_back_item.options[option.id.toLowerCase()] = option.value;
					});
				}
				
				new_line_id = this.addLine(roll_back_item);

				e.errorDetails = {
					status: 'LINE_ROLLBACK'
				,	oldLineId: line_id
				,	newLineId: new_line_id
				};

				throw e;
			}

			lines_sort = _.without(lines_sort, line_id, new_line_id);
			lines_sort.splice(current_position, 0, new_line_id);

			this.setLinesSort(lines_sort);
		}
	}

,	updateGiftCertificates: function (giftcertificates)
	{
		'use strict';

		order.removeAllGiftCertificates();

		giftcertificates.forEach(function (code)
		{
			order.applyGiftCertificate(code);
		});
	}
});


//ProductReviews.js
// ProductReview.js
// ----------------
// Handles creating, fetching and updating ProductReviews

Application.defineModel('ProductReview', {
	// ## General settings
	// maxFlagsCount is the number at which a review is marked as flagged by users
	maxFlagsCount: SC.Configuration.product_reviews.maxFlagsCount
,	loginRequired: SC.Configuration.product_reviews.loginRequired
	// the id of the flaggedStatus. If maxFlagsCount is reached, this will be its new status.
,	flaggedStatus: SC.Configuration.product_reviews.flaggedStatus
	// id of the approvedStatus
,	approvedStatus: SC.Configuration.product_reviews.approvedStatus
	// id of pendingApprovalStatus
,	pendingApprovalStatus: SC.Configuration.product_reviews.pendingApprovalStatus 
,	resultsPerPage: SC.Configuration.product_reviews.resultsPerPage

	// Returns a review based on the id
,	get: function (id)
	{
		'use strict';

		var review = nlapiLoadRecord('customrecord_ns_pr_review', id);
		
		if (review)
		{
			/// Loads Review main information 
			var result = {
					internalid: review.getId()
				,	status: review.getFieldValue('custrecord_ns_prr_status')
				,	isinactive: review.getFieldValue('isinactive') === 'T'
				,	title: review.getFieldValue('name') || ''
					// we parse the line breaks and get it ready for html
				,	text: review.getFieldValue('custrecord_ns_prr_text') ? review.getFieldValue('custrecord_ns_prr_text').replace(/\n/g, '<br>') : ''
				,	itemid: review.getFieldValue('custrecord_ns_prr_item_id')
				,	rating: review.getFieldValue('custrecord_ns_prr_rating')
				,	useful_count: review.getFieldValue('custrecord_ns_prr_useful_count')
				,	not_useful_count: review.getFieldValue('custrecord_ns_prr_not_useful_count')
				,	falgs_count: review.getFieldValue('custrecord_ns_prr_falgs_count')
				,	isVerified: review.getFieldValue('custrecord_ns_prr_verified') === 'T'
				,	created_on: review.getFieldValue('created')
				,	writer: {
						id: review.getFieldValue('custrecord_ns_prr_writer')
					,	name: review.getFieldValue('custrecord_ns_prr_writer_name') || review.getFieldText('custrecord_ns_prr_writer')
					}
				,	rating_per_attribute: {}
				}
				// Loads Attribute Rating
			,	filters = [
					new nlobjSearchFilter('custrecord_ns_prar_review', null, 'is', id)
				]
			
			,	columns = [
					new nlobjSearchColumn('custrecord_ns_prar_attribute')
				,	new nlobjSearchColumn('custrecord_ns_prar_rating')
				]
				// we search for the individual attribute rating records
			,	ratings_per_attribute = Application.getAllSearchResults('customrecord_ns_pr_attribute_rating', filters, columns);

			_.each(ratings_per_attribute, function (rating_per_attribute)
			{
				result.rating_per_attribute[rating_per_attribute.getText('custrecord_ns_prar_attribute')] = rating_per_attribute.getValue('custrecord_ns_prar_rating');
			});
			
			return result;
		}
		else
		{
			throw notFoundError;
		}
	}
	
,	search: function (filters, order, page, records_per_page)
	{
		'use strict';
		
		var review_filters = [
				// only approved reviews
				new nlobjSearchFilter('custrecord_ns_prr_status', null, 'is', this.approvedStatus)
				// and not inactive
			,	new nlobjSearchFilter('isinactive', null, 'is', 'F')
			]
		,	review_columns = {}
		,	result = {};
		
		// Creates the filters for the given arguments
		if (filters.itemid)
		{
			review_filters.push(
				new nlobjSearchFilter('custrecord_ns_prr_item_id', null, 'equalto', filters.itemid)
			);
		}
		
		// Only by verified buyer
		if (filters.writer)
		{
			review_filters.push(
				new nlobjSearchFilter('custrecord_ns_prr_writer', null, 'equalto', filters.writer)
			);
		}
		
		// only by a rating
		if (filters.rating)
		{
			review_filters.push(
				new nlobjSearchFilter('custrecord_ns_prr_rating', null, 'equalto', filters.rating)
			);
		}
		
		if (filters.q)
		{
			review_filters.push(
				new nlobjSearchFilter('custrecord_ns_prr_text', null, 'contains', filters.q)
			);
		}
		
		// Selects the columns
		review_columns = {
			internalid: new nlobjSearchColumn('internalid')
		,	title: new nlobjSearchColumn('name')
		,	text: new nlobjSearchColumn('custrecord_ns_prr_text')
		,	itemid: new nlobjSearchColumn('custrecord_ns_prr_item_id')
		,	rating: new nlobjSearchColumn('custrecord_ns_prr_rating')
		,	isVerified: new nlobjSearchColumn('custrecord_ns_prr_verified')
		,	useful_count: new nlobjSearchColumn('custrecord_ns_prr_useful_count')
		,	not_useful_count: new nlobjSearchColumn('custrecord_ns_prr_not_useful_count')
		,	writer: new nlobjSearchColumn('custrecord_ns_prr_writer')
		,	writer_name: new nlobjSearchColumn('custrecord_ns_prr_writer_name')
		,	created_on: new nlobjSearchColumn('created')
		};
		
		// Sets the sort order
		var order_tokens = order && order.split(':') || []
		,	sort_column = order_tokens[0] || 'created'
		,	sort_direction = order_tokens[1] || 'ASC';
		
		review_columns[sort_column] && review_columns[sort_column].setSort(sort_direction === 'DESC');
		
		// Makes the request and format the response
		result = Application.getPaginatedSearchResults('customrecord_ns_pr_review', review_filters, _.values(review_columns), parseInt(page, 10) || 1, parseInt(records_per_page, 10) || this.resultsPerPage);
		
		var reviews_by_id = {}
		,	review_ids = [];
		
		_.each(result.records, function (review)
		{
			review_ids.push(review.getId());

			reviews_by_id[review.getId()] = {
				internalid: review.getId()
			,	title: review.getValue('name')
			,	text: review.getValue('custrecord_ns_prr_text') ? review.getValue('custrecord_ns_prr_text').replace(/\n/g, '<br>') : ''
			,	itemid: review.getValue('custrecord_ns_prr_item_id')
			,	rating: review.getValue('custrecord_ns_prr_rating')
			,	useful_count: review.getValue('custrecord_ns_prr_useful_count')
			,	not_useful_count: review.getValue('custrecord_ns_prr_not_useful_count')
			,	isVerified: review.getValue('custrecord_ns_prr_verified') === 'T'
			,	created_on: review.getValue('created')
			,	writer: {
					id: review.getValue('custrecord_ns_prr_writer')
				,	name: review.getValue('custrecord_ns_prr_writer_name') || review.getText('custrecord_ns_prr_writer')
				}
			,	rating_per_attribute: {}
			};
		});
		
		if (review_ids.length)
		{
			/// Loads Attribute Rating
			var attribute_filters = [
					new nlobjSearchFilter('custrecord_ns_prar_review', null, 'anyof', review_ids)
				]
			
			,	attribute_columns = [
					new nlobjSearchColumn('custrecord_ns_prar_attribute')
				,	new nlobjSearchColumn('custrecord_ns_prar_rating')
				,	new nlobjSearchColumn('custrecord_ns_prar_review')
				]
			
			,	ratings_per_attribute = Application.getAllSearchResults('customrecord_ns_pr_attribute_rating', attribute_filters, attribute_columns);

			_.each(ratings_per_attribute, function (rating_per_attribute)
			{
				var review_id = rating_per_attribute.getValue('custrecord_ns_prar_review')
				,	attribute_name = rating_per_attribute.getText('custrecord_ns_prar_attribute')
				,	rating = rating_per_attribute.getValue('custrecord_ns_prar_rating');
				
				if (reviews_by_id[review_id])
				{
					reviews_by_id[review_id].rating_per_attribute[attribute_name] = rating;
				}
			});
		}
		
		result.records = _.values(reviews_by_id);
		
		return result;
	}

	// Sanitize html input
,	sanitize: function (text)
	{
		'use strict';
		return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
	}

,	create: function (data)
	{
		'use strict';

		if (this.loginRequired && !session.isLoggedIn())
		{
			throw unauthorizedError;
		}

		var review = nlapiCreateRecord('customrecord_ns_pr_review');
		
		data.writer && data.writer.id && review.setFieldValue('custrecord_ns_prr_writer', data.writer.id);
		data.writer && data.writer.name && review.setFieldValue('custrecord_ns_prr_writer_name', this.sanitize(data.writer.name));
		
		data.rating && review.setFieldValue('custrecord_ns_prr_rating', data.rating);
		data.title && review.setFieldValue('name', this.sanitize(data.title));
		data.text && review.setFieldValue('custrecord_ns_prr_text', this.sanitize(data.text));
		data.itemid && review.setFieldValue('custrecord_ns_prr_item_id', data.itemid);
		
		var review_id = nlapiSubmitRecord(review);
		
		_.each(data.rating_per_attribute, function (rating, name)
		{
			var review_attribute = nlapiCreateRecord('customrecord_ns_pr_attribute_rating');
			
			review_attribute.setFieldValue('custrecord_ns_prar_item', data.itemid);
			review_attribute.setFieldValue('custrecord_ns_prar_review', review_id);
			review_attribute.setFieldValue('custrecord_ns_prar_rating', rating);
			review_attribute.setFieldText('custrecord_ns_prar_attribute', name);
			
			nlapiSubmitRecord(review_attribute);
		});
		
		return data;
	}
	// This function updates the quantity of the counters
,	update: function (id, data)
	{
		'use strict';

		var action = data.action

		,	field_name_by_action = {
				'flag': 'custrecord_ns_prr_falgs_count'
			,	'mark-as-useful': 'custrecord_ns_prr_useful_count'
			,	'mark-as-not-useful': 'custrecord_ns_prr_not_useful_count'
			}

		,	field_name = field_name_by_action[action];
		
		if (field_name)
		{
			var review = nlapiLoadRecord('customrecord_ns_pr_review', id)
			,	current_count = review.getFieldValue(field_name);

			review.setFieldValue(field_name, parseInt(current_count, 10) + 1 || 1);
			// if the review is beeing flagged, check the maxFlagsCount
			if (action === 'flag' && current_count >= this.maxFlagsCount)
			{
				// flag the review
				review.setFieldValue('custrecord_ns_prr_status', this.flaggedStatus);
			}

			nlapiSubmitRecord(review);
		}
	}
});


//StoreItem.js
// StoreItem.js
// ----------
// Handles the fetching of items information for a collection of order items
Application.defineModel('StoreItem', {
	
	//Returns a collection of items with the items iformation
	preloadItems: function (items)
	{
		'use strict';
		var items_by_id = {}
		,	self = this;

		items = items || [];

		this.preloadedItems = this.preloadedItem || {};

		items.forEach(function (item)
		{
			if(!self.preloadedItems[item.internalid])
			{
				items_by_id[item.id] = {
						internalid: item.id.toString()
					,	itemtype: item.type
					,	itemfields: SC.Configuration.items_fields_standard_keys
				};
			}

			if (item.parent && !self.preloadedItems[item.parent])
			{
				items_by_id[item.parent] = {
						internalid: item.parent
					,	itemtype: item.type
					,	itemfields: SC.Configuration.items_fields_standard_keys
				};
			}
		});
		
		if (!_.size(items_by_id))
		{
			return this.preloadedItems;
		}

		var items_details
		,	item_ids = _.values(items_by_id);

		//Check if we have access to fieldset 
		if (session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED')
		{
			try
			{
				 //SuiteCommerce Advanced website have fieldsets			
				items_details = session.getItemFieldValues(SC.Configuration.items_fields_advanced_name, _.pluck(item_ids, 'internalid')).items;
			}
			catch (e) 
			{	
				throw invalidItemsFieldsAdvancedName;
			}
		}
		else
		{
			//Sitebuilder website version doesn't have fieldsets
			items_details = session.getItemFieldValues(item_ids);
		}
		
		// Generates a map by id for easy access. Notice that for disabled items the array element can be null
		_.each(items_details, function (item)
		{
			if (item && typeof item.itemid !== 'undefined')
			{
				self.preloadedItems[item.internalid] = item;
			}
		});

		// Fills the item with the information you passed in if not return by the api.
		_.each(items, function (item)
		{
			if (!self.preloadedItems[item.internalid])
			{
				var it = _.clone(item); 
				it.itemtype = it.type; 
				delete it.type; 
				self.preloadedItems[item.internalid] = it;
			}
		});


		// Adds the parent inforamtion to the child
		_.each(this.preloadedItems, function (item)
		{
			
			if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
			{
				item.matrix_parent = self.preloadedItems[item.itemoptions_detail.parentid];
			}	

		});

		return this.preloadedItems;
	},
	
	//Return the information for the given item	
	get: function (id, type, parent)
	{
		'use strict';

		this.preloadedItems = this.preloadedItems || {};
		
		if (!this.preloadedItems[id])
		{
			this.preloadItems([{
				id: id,
				type: type,
				parent: parent
			}]);
		}
		return this.preloadedItems[id];
	}
	
});


