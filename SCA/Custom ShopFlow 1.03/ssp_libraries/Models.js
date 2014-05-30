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

		//Other settings that come in window object
		settings.groupseparator = window.groupseparator;
		settings.decimalseparator = window.decimalseparator;
		settings.negativeprefix = window.negativeprefix;
		settings.negativesuffix = window.negativesuffix;
		settings.dateformat = window.dateformat;
		settings.longdateformat = window.longdateformat;
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
		profile.isLoggedIn = isLoggedIn() ? 'T' : 'F';
		profile.isGuest = session.getCustomer().isGuest() ? 'T' : 'F';
		profile.priceLevel = session.getShopperPriceLevel().internalid ? session.getShopperPriceLevel().internalid : session.getSiteSettings('defaultpricelevel');
		
		profile.internalid = nlapiGetUser() + '';
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
		,	is_logged_in = session.isLoggedIn()
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

		if (is_secure && is_logged_in && order_fields.payment && session.getSiteSettings(['checkout']).checkout.hidepaymentpagewhennobalance === 'T' && order_fields.summary.total === 0)
		{
			order.removePayment();
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
				,	itemtype: original_line.itemtype
				,	options: original_line.options
				,	shipaddress: (original_line.shipaddress) ? self.addAddress(tmp_addresses[original_line.shipaddress], result) : null
				,	shipmethod: original_line.shipmethod
				});

				items_to_preload.push({
					id: original_line.internalid
				,	type: original_line.itemtype
				});
			});

			var store_item = Application.getModel('StoreItem')
			,	restart = false;
		
			store_item.preloadItems(items_to_preload);

			result.lines.forEach(function (line)
			{
				line.item = store_item.get(line.item, line.itemtype);

				if (!line.item)
				{
					self.removeLine(line.internalid);
					restart = true;
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
		,	is_secure = request.getURL().indexOf('https') === 0
		,	is_logged_in = session.isLoggedIn();

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

							context.setSessionObject('paypal_complete', 'F');

						}
						catch(e)
						{
							if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT' && is_logged_in)
							{
								order.removePayment();
							}
							throw e;
						}
					}
					// if the the given credit card don't have a security code and it is required we just remove it from the order
					else if(require_cc_security_code && !credit_card.ccsecuritycode)
					{
						order.removePayment();
					}
				}
				else if (paymentmethod.type === 'invoice')
				{
					order.setPayment({ paymentterms: 'Invoice' });
					paymentmethod.purchasenumber && order.setPurchaseNumber(paymentmethod.purchasenumber);

					context.setSessionObject('paypal_complete', 'F');
				}
				else if (paymentmethod.type === 'paypal')
				{
					var paypal = _.findWhere(session.getPaymentMethods(), {ispaypal: 'T'});
					order.setPayment({paymentterms: '', paymentmethod: paypal.internalid});
				}
			});
			
		}
		else if (is_secure && is_logged_in)
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
	
,	addLines: function(lines_data)
	{

		'use strict';

		var items = [];

		_.each(lines_data, function(line_data)
		{
			var item = {
					internalid: line_data.item.internalid.toString()
				,	quantity:  _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
				,	options: line_data.options || {}
			};

			items.push(item);
		});

		var lines_ids = order.addItems(items)
		,	latest_addition = _.last(lines_ids).orderitemid
		// Stores the current order
		,	lines_sort = this.getLinesSort();
		
		lines_sort.unshift(latest_addition);
		this.setLinesSort(lines_sort);
		
		context.setSessionObject('latest_addition', latest_addition);

		return lines_ids;
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
			,	new nlobjSearchFilter('custrecord_ns_prr_item', null, 'noneof', '@NONE@')
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
		,	parents_by_id = {}
		,	self = this
		,	is_advanced = session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED';

		items = items || [];

		this.preloadedItems = this.preloadedItems || {};

		items.forEach(function (item)
		{
			if (!item.id || !item.type || item.type === 'Discount')
			{
				return;
			}
			if (!self.preloadedItems[item.id])
			{
				items_by_id[item.id] = {
						internalid: new String(item.id).toString()
					,	itemtype: item.type
					,	itemfields: SC.Configuration.items_fields_standard_keys
				};
			}

		});

		if (!_.size(items_by_id))
		{
			return this.preloadedItems;
		}

		var items_details = this.getItemFieldValues(items_by_id);

		// Generates a map by id for easy access. Notice that for disabled items the array element can be null
		_.each(items_details, function (item)
		{
			if (item && typeof item.itemid !== 'undefined')
			{
				//TODO: Remove support for Releted and Correlated items by default because of performance issues
				/*if (!is_advanced)
				{
					// Load related & correlated items if the site type is standard. 
					// If the site type is advanced will be loaded by getItemFieldValues function
					item.relateditems_detail = session.getRelatedItems(items_by_id[item.internalid]);
					item.correlateditems_detail = session.getCorrelatedItems(items_by_id[item.internalid]);
				}*/

				if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
				{
					parents_by_id[item.itemoptions_detail.parentid] = {
							internalid: new String(item.itemoptions_detail.parentid).toString()
						,	itemtype: item.itemtype
						,	itemfields: SC.Configuration.items_fields_standard_keys
					};
				}
				
				self.preloadedItems[item.internalid] = item;
			}
		});

		if (_.size(parents_by_id))
		{
			var parents_details = this.getItemFieldValues(parents_by_id);

			_.each(parents_details, function (item)
			{
				if (item && typeof item.itemid !== 'undefined')
				{
					self.preloadedItems[item.internalid] = item;
				}
			});
		}

		// Adds the parent inforamtion to the child
		_.each(this.preloadedItems, function (item)
		{
			if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
			{
				item.matrix_parent = self.preloadedItems[item.itemoptions_detail.parentid];
			}

		});
		
		return this.preloadedItems;
	}
	
,	getItemFieldValues: function(items_by_id)
	{
		'use strict';

		var	item_ids = _.values(items_by_id)
		,	is_advanced = session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED';

		//Check if we have access to fieldset
		if (is_advanced)
		{
			try
			{
				//SuiteCommerce Advanced website have fieldsets
				return session.getItemFieldValues(SC.Configuration.items_fields_advanced_name, _.pluck(item_ids, 'internalid')).items;
			}
			catch (e)
			{
				throw invalidItemsFieldsAdvancedName;
			}
		}
		else
		{
			//Sitebuilder website version doesn't have fieldsets
			return session.getItemFieldValues(item_ids);
		}
	}
	//Return the information for the given item	
,	get: function (id, type)
	{
		'use strict';

		this.preloadedItems = this.preloadedItems || {};
		
		if (!this.preloadedItems[id])
		{
			this.preloadItems([{
					id: id
				,	type: type
			}]);
		}
		return this.preloadedItems[id];
	}

,	set: function(item)
	{
		'use strict';

		this.preloadedItems = this.preloadedItems || {};

		if (item.internalid)
		{
			this.preloadedItems[item.internalid] = item;
		}
		
	}

});


//ProductList.js
// ProductList.js
// ----------------
// Handles creating, fetching and updating Product Lists

Application.defineModel('ProductList', {
	// ## General settings
	loginRequired: SC.Configuration.product_lists.loginRequired

,	configuration: SC.Configuration.product_lists

,	verifySession: function()
	{
		'use strict';

		var is_secure = request.getURL().indexOf('https') === 0;
		
		// MyAccount (We need to make the following difference because isLoggedIn is always false in Shopping)
		if (is_secure)
		{
			if (this.loginRequired && !session.isLoggedIn())
			{
				throw unauthorizedError;	
			}			
		}
		else // Shopping
		{
			if (this.loginRequired && session.getCustomer().isGuest())
			{
				throw unauthorizedError;
			}
		}
	}

	// Returns a product list based on a given id
,	get: function (id)
	{
		'use strict';

		this.verifySession();

		var productList = nlapiLoadRecord('customrecord_ns_pl_productlist', id);

		if (productList && productList.getFieldValue('isinactive') === 'F')
		{
			var ProductListItem = Application.getModel('ProductListItem');

			/// Loads Product List main data
			var result = {
				internalid: productList.getId()
			,	templateid: productList.getFieldValue('custrecord_ns_pl_pl_templateid')
			,	name: productList.getFieldValue('name')
			,	description: productList.getFieldValue('custrecord_ns_pl_pl_description')
			,	created: productList.getFieldValue('created')
			,	lastmodified: productList.getFieldValue('lastmodified')
			,	owner:  {
					id: productList.getFieldValue('custrecord_ns_pl_pl_owner')
				,	name: productList.getFieldText('custrecord_ns_pl_pl_owner')
				}
			,   scope: {
					id: productList.getFieldValue('custrecord_ns_pl_pl_scope')
				,	name: productList.getFieldText('custrecord_ns_pl_pl_scope')
				}
			,   type: {
					id: productList.getFieldValue('custrecord_ns_pl_pl_type')
				,	name: productList.getFieldText('custrecord_ns_pl_pl_type')
				}
			,	items: ProductListItem.search(id, 'created:ASC', true)
			};
				
			return result;
		}
		else
		{
			throw notFoundError;
		}
	}

	// Sanitize html input
,	sanitize: function (text)
	{
		'use strict';

		return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
	}

	// Retrieves all Product Lists for a given user
,	search: function(userId, order)
	{
		'use strict';

		this.verifySession();

		if (!userId || isNaN(parseInt(userId, 10)))
		{
			throw unauthorizedError;
		}
		
		var filters = [new nlobjSearchFilter('custrecord_ns_pl_pl_owner', null, 'is', userId)
		,	new nlobjSearchFilter('isinactive', null, 'is', 'F')];

		// Selects the columns
		var productListColumns = {
			internalid: new nlobjSearchColumn('internalid')
		,	templateid: new nlobjSearchColumn('custrecord_ns_pl_pl_templateid')
		,	name: new nlobjSearchColumn('name')
		,	description: new nlobjSearchColumn('custrecord_ns_pl_pl_description')
		,	owner: new nlobjSearchColumn('custrecord_ns_pl_pl_owner')
		,	scope: new nlobjSearchColumn('custrecord_ns_pl_pl_scope')
		,	type: new nlobjSearchColumn('custrecord_ns_pl_pl_type')
		,	created: new nlobjSearchColumn('created')
		,	lastmodified: new nlobjSearchColumn('lastmodified')
		};
		
		// Sets the sort order
		var order_tokens = order && order.split(':') || []
		,	sort_column = order_tokens[0] || 'name'
		,	sort_direction = order_tokens[1] || 'ASC';
		
		productListColumns[sort_column] && productListColumns[sort_column].setSort(sort_direction === 'DESC');

		var productLists = [];

		// Makes the request and format the response
		var records = Application.getAllSearchResults('customrecord_ns_pl_productlist', filters, _.values(productListColumns));

		var ProductListItem = Application.getModel('ProductListItem')
		,	template_ids = [];

		_.each(records, function (productListSearchRecord)
		{
			var productList = {
				internalid: productListSearchRecord.getId()
			,	templateid: productListSearchRecord.getValue('custrecord_ns_pl_pl_templateid')
			,	name: productListSearchRecord.getValue('name')
			,	description: productListSearchRecord.getValue('custrecord_ns_pl_pl_description') ? productListSearchRecord.getValue('custrecord_ns_pl_pl_description').replace(/\n/g, '<br>') : ''
			,	owner: {
					id: productListSearchRecord.getValue('custrecord_ns_pl_pl_owner')
				,	name: productListSearchRecord.getText('custrecord_ns_pl_pl_owner')
				}
			,	scope: {
					id: productListSearchRecord.getValue('custrecord_ns_pl_pl_scope')
				,	name: productListSearchRecord.getText('custrecord_ns_pl_pl_scope')
				}
			,	type: {
					id: productListSearchRecord.getValue('custrecord_ns_pl_pl_type')
				,	name: productListSearchRecord.getText('custrecord_ns_pl_pl_type')
				}
			,	created: productListSearchRecord.getValue('created')
			,	lastmodified: productListSearchRecord.getValue('lastmodified')
			,	items: ProductListItem.search(productListSearchRecord.getId(), 'created:ASC', false)
			};

			if (productList.templateid)
			{
				template_ids.push(productList.templateid);
			}

			productLists.push(productList);
		});
		
		// Add possible missing predefined list templates
		_(SC.Configuration.product_lists.list_templates).each(function(template) {
			if (!_(template_ids).contains(template.templateid))
			{
				if (!template.templateid || !template.name)
				{
					console.log('Error: Wrong predefined Product List. Please check backend configuration.');
				}
				else
				{
					if (!template.scope)
					{
						template.scope = { id: '2', name: 'private' };
					}

					if (!template.description)
					{
						template.description = '';
					}
				
					template.type = { id: '3', name: 'predefined' };

					productLists.push(template);
				}
			}
		});
		
		if (this.isSingleList())
		{
			return _.filter(productLists, function(pl)
			{
				return pl.type.id === '3';
			});
		}

		return productLists;
	}

,	isSingleList: function ()
	{
		'use strict';

		return !this.configuration.additionEnabled && this.configuration.list_templates && this.configuration.list_templates.length === 1;
	}

	// Creates a new Product List record
,	create: function (customerId, data)
	{
		'use strict';

		customerId = customerId || nlapiGetUser() + '';
		
		this.verifySession();

		var productList = nlapiCreateRecord('customrecord_ns_pl_productlist');
		
		data.templateid && productList.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateid);
		customerId && productList.setFieldValue('custrecord_ns_pl_pl_owner', customerId);
		data.scope && data.scope.id && productList.setFieldValue('custrecord_ns_pl_pl_scope', data.scope.id);
		data.type && data.type.id && productList.setFieldValue('custrecord_ns_pl_pl_type', data.type.id);
		data.name && productList.setFieldValue('name', this.sanitize(data.name));
		data.description && productList.setFieldValue('custrecord_ns_pl_pl_description', this.sanitize(data.description));
		
		var internalid = nlapiSubmitRecord(productList);

		return internalid;
	}

	// Updates a given Product List given its id
,	update: function (id, data)
	{
		'use strict';

		this.verifySession();

		var productList = nlapiLoadRecord('customrecord_ns_pl_productlist', id);

		data.templateid && productList.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateid);
		data.owner && data.owner.id && productList.setFieldValue('custrecord_ns_pl_pl_owner', data.owner.id);
		data.scope && data.scope.id && productList.setFieldValue('custrecord_ns_pl_pl_scope', data.scope.id);
		data.type && data.type.id && productList.setFieldValue('custrecord_ns_pl_pl_type', data.type.id);
		data.name && productList.setFieldValue('name', this.sanitize(data.name));
		productList.setFieldValue('custrecord_ns_pl_pl_description', data.description ? this.sanitize(data.description) : '');

		nlapiSubmitRecord(productList);
	}

	// Deletes a Product List given its id
,	delete: function(id)
	{
		'use strict';

		this.verifySession();

		var productListToDelete = nlapiLoadRecord('customrecord_ns_pl_productlist',id);
		
		productListToDelete.setFieldValue('isinactive','T');

		var internalid = nlapiSubmitRecord(productListToDelete);

		return internalid;
	}
});


//ProductListItem.js
// ProductListItem.js
// ----------------
// Handles creating, fetching and updating Product List Items

Application.defineModel('ProductListItem', {

	// General settings
	loginRequired: SC.Configuration.product_lists.loginRequired

,	verifySession: function()
	{
		'use strict';

		var is_secure = request.getURL().indexOf('https') === 0;
		
		// MyAccount (We need to make the following difference because isLoggedIn is always false in Shopping)
		if (is_secure)
		{
			if (this.loginRequired && !session.isLoggedIn())
			{
				throw unauthorizedError;	
			}			
		}
		else // Shopping
		{
			if (this.loginRequired && session.getCustomer().isGuest())
			{
				throw unauthorizedError;
			}
		}
	}

	// Returns a product list item based on a given id
,	get: function (id)
	{
		'use strict';
		
		this.verifySession();

		var filters = [new nlobjSearchFilter('internalid', null, 'is', id),	new nlobjSearchFilter('isinactive', null, 'is', 'F')];
		
		// Sets the sort order
		var sort_column = 'custrecord_ns_pl_pli_item'
		,	sort_direction = 'ASC';

		var productlist_items = this.searchHelper(filters, sort_column, sort_direction, true);

		if (productlist_items.length >= 1)
		{
			return productlist_items[0];
		}
		else
		{
			throw notFoundError;
		}
	}

,	delete: function (id)
	{
		'use strict';
		
		this.verifySession();

		var productListItemToDelete = nlapiLoadRecord('customrecord_ns_pl_productlistitem', id);
		
		productListItemToDelete.setFieldValue('isinactive','T');

		return nlapiSubmitRecord(productListItemToDelete);
	}

,	getProductName: function (item)
	{
		'use strict';

		if (!item)
		{
			return '';
		}

		// If its a matrix child it will use the name of the parent
		if (item && item.matrix_parent && item.matrix_parent.internalid)
		{
			return item.matrix_parent.storedisplayname2 || item.matrix_parent.displayname;
		}

		// Otherways return its own name
		return item.storedisplayname2 || item.displayname;
	}

	// Sanitize html input
,	sanitize: function (text)
	{
		'use strict';

		return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
	}

	// Creates a new Product List Item record
,	create: function (data)
	{
		'use strict';

		this.verifySession();

		var productListItem = nlapiCreateRecord('customrecord_ns_pl_productlistitem');
		
		data.description && productListItem.setFieldValue('custrecord_ns_pl_pli_description', this.sanitize(data.description));

		if (data.options)
		{
			data.options && productListItem.setFieldValue('custrecord_ns_pl_pli_options', JSON.stringify(data.options || {}));
		}

		data.quantity && productListItem.setFieldValue('custrecord_ns_pl_pli_quantity', data.quantity);
		
		data.item && data.item.internalid && productListItem.setFieldValue('custrecord_ns_pl_pli_item', data.item.internalid);
		data.priority && data.priority.id && productListItem.setFieldValue('custrecord_ns_pl_pli_priority', data.priority.id);
		data.productList && data.productList.id && productListItem.setFieldValue('custrecord_ns_pl_pli_productlist', data.productList.id);

		data.internalid = nlapiSubmitRecord(productListItem);
		
		return data;
	}

	// Updates a given Product List Item given its id
,	update: function (id, data)
	{
		'use strict';

		this.verifySession();

		var productListItem = nlapiLoadRecord('customrecord_ns_pl_productlistitem', id);

		productListItem.setFieldValue('custrecord_ns_pl_pli_description', this.sanitize(data.description));
		data.options && productListItem.setFieldValue('custrecord_ns_pl_pli_options', JSON.stringify(data.options || {}));
		data.quantity && productListItem.setFieldValue('custrecord_ns_pl_pli_quantity', data.quantity);
		data.isinactive && productListItem.setFieldValue('isinactive', data.isinactive);

		data.item && data.item.id && productListItem.setFieldValue('custrecord_ns_pl_pli_item', data.item.id);
		data.priority && data.priority.id && productListItem.setFieldValue('custrecord_ns_pl_pli_priority', data.priority.id);
		data.productList && data.productList.id && productListItem.setFieldValue('custrecord_ns_pl_pli_productlist', data.productList.id);
		
		nlapiSubmitRecord(productListItem);
	}

	// Retrieves all Product List Items related to the given Product List Id
,	search: function (product_list_id, order, include_store_item)
	{
		'use strict';
		
		this.verifySession();

		var filters = [new nlobjSearchFilter('custrecord_ns_pl_pli_productlist', null, 'is', product_list_id)
		,	new nlobjSearchFilter('isinactive', null, 'is', 'F')];
		
		// Sets the sort order
		var order_tokens = order && order.split(':') || []
		,	sort_column = order_tokens[0] || 'custrecord_ns_pl_pli_item'
		,	sort_direction = order_tokens[1] || 'ASC';

		return this.searchHelper(filters, sort_column, sort_direction, include_store_item);
	}

,	searchHelper: function (filters, sort_column, sort_direction, include_store_item)
	{
		'use strict';

		// Selects the columns
		var productListItemColumns = {
			internalid: new nlobjSearchColumn('internalid')
		,	description: new nlobjSearchColumn('custrecord_ns_pl_pli_description')
		,	options: new nlobjSearchColumn('custrecord_ns_pl_pli_options')
		,	quantity: new nlobjSearchColumn('custrecord_ns_pl_pli_quantity')
		,	created: new nlobjSearchColumn('created')
		,	item_id: new nlobjSearchColumn('custrecord_ns_pl_pli_item')
		,	item_type: new nlobjSearchColumn('type', 'custrecord_ns_pl_pli_item')
		,	priority: new nlobjSearchColumn('custrecord_ns_pl_pli_priority')
		,	lastmodified: new nlobjSearchColumn('lastmodified')
		};
		
		productListItemColumns[sort_column] && productListItemColumns[sort_column].setSort(sort_direction === 'DESC');
		
		// Makes the request and format the response
		var records = Application.getAllSearchResults('customrecord_ns_pl_productlistitem', filters, _.values(productListItemColumns))
		,	productlist_items = []
		,	StoreItem = Application.getModel('StoreItem')
		,	self = this;

		_(records).each(function (productListItemSearchRecord)
		{
			var itemInternalId = productListItemSearchRecord.getValue('custrecord_ns_pl_pli_item')
			,	itemType = productListItemSearchRecord.getValue('type', 'custrecord_ns_pl_pli_item')
			,	productListItem = {
					internalid: productListItemSearchRecord.getId()
				,	description: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_description')
				,	options: JSON.parse(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_options') || '{}')
				,	quantity: parseInt(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_quantity'), 10)
				,	created: productListItemSearchRecord.getValue('created')
				,	lastmodified: productListItemSearchRecord.getValue('lastmodified')
					// we temporary store the item reference, after this loop we use StoreItem.preloadItems instead doing multiple StoreItem.get()
				,	store_item_reference: {id: itemInternalId, type: itemType}
				,	priority: {
						id: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_priority')
					,	name: productListItemSearchRecord.getText('custrecord_ns_pl_pli_priority')
					}
				};
			productlist_items.push(productListItem);
		});

		var store_item_references = _(productlist_items).pluck('store_item_reference')
			// preload all the store items at once for performance
		,	store_items = StoreItem.preloadItems(store_item_references)
		,	results = [];

		_(productlist_items).each(function (productlist_item)
		{
			var store_item_reference = productlist_item.store_item_reference
			// get the item - fast because it was preloaded before. Can be null!
			,	store_item = StoreItem.get(store_item_reference.id, store_item_reference.type);

			delete productlist_item.store_item_reference; 

			if (!store_item)
			{
				return;
			}
			
			if (include_store_item)
			{
				productlist_item.item = store_item; 
			}
			else
			{
				// only include basic store item data - fix the name to support matrix item names.
				productlist_item.item = { 
					internalid: store_item_reference.id
				,	displayname: self.getProductName(store_item)
				,	ispurchasable: store_item.ispurchasable
				}; 
			}

			if (!include_store_item && store_item && store_item.matrix_parent)
			{
				productlist_item.item.matrix_parent = store_item.matrix_parent;
			}

			results.push(productlist_item);

		});

		return results;
	}


});



