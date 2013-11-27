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

//Account.js
// Account.js
// ----------
// Handles account creation, login, logout and password reset
Application.defineModel('Account', {

	login: function (email, password)
	{
		'use strict';

		session.login({
			email: email
		,	password: password
		});

		return {
			touchpoints: session.getSiteSettings(['touchpoints']).touchpoints
		};
	}

,	forgotPassword: function (email)
	{
		'use strict';

		// this API method throws an exception if the email doesnt exist
		// 'The supplied email has not been registered as a customer at our Web store.'
		session.sendPasswordRetrievalEmail(email);
		
		return  {
			success: true
		};
	}

,	resetPassword: function (params, password)
	{
		'use strict';

		if (!session.doChangePassword(params, password))
		{
			throw new Error('An error has occurred');
		}
		else
		{
			return {
				success: true
			};
		}
	}

,	register: function (user_data)
	{
		'use strict';
		
		// var check_object = {
		// email: user_data.email
		// };

		// var duplicateRecords = nlapiSearchDuplicate('customer', check_object);
		// if (duplicateRecords && duplicateRecords.length)
		// {
		// throw new Error('You alerady have an account');
		// }

		var customer = session.getCustomer()
		,	result = {};

		if (customer.isGuest())
		{
			var guest_data = customer.getFieldValues();
			
			customer.setLoginCredentials({
				internalid: guest_data.internalid
			,	email: user_data.email
			,	password: user_data.password
			});

			session.login({
				email: user_data.email
			,	password: user_data.password
			});
			
			customer = session.getCustomer();

			customer.updateProfile({
				internalid: guest_data.internalid
			,	firstname: user_data.firstname
			,	lastname: user_data.lastname
			,	company: user_data.company
			,	emailsubscribe: (user_data.emailsubscribe && user_data.emailsubscribe !== 'F') ? 'T' : 'F'
			});
			
			result.user = Application.getModel('Profile').get();
		}
		else
		{
			user_data.emailsubscribe = (user_data.emailsubscribe && user_data.emailsubscribe !== 'F') ? 'T' : 'F';
			
			result = session.registerCustomer(user_data);
		}

		result.touchpoints = session.getSiteSettings(['touchpoints']).touchpoints;
		
		return result;
	}
});

//Address.js
// Address.js
// ----------
// Handles fetching, creating and updating addresses
Application.defineModel('Address', {
	
	// model validation
	validation: {
		addressee: {required: true, msg: 'Full Name is required'}
	,	addr1: {required: true, msg: 'Address is required'}
	,	country: {required: true, msg: 'Country is required'}
	,	state: function (value, attr, computedState)
		{
			'use strict';

			var country = computedState.country;

			if (country && session.getStates([country]) && value === '')
			{
				return 'State is required';
			}
		}
	,	city: {required: true, msg: 'City is required'}
	,	zip: {required: true, msg: 'Zip Code is required'}
	,	phone: {required: true, msg: 'Phone Number is required'}
	}

// our model has "fullname" and "company" insted of  the fields "addresse" and "attention" used on netsuite.
// this function prepare the address object for sending it to the frontend
,	wrapAddressee: function (address)
	{
		'use strict';
		
		var s = address.addressee;
		var res = s.split(",");
		var res1 =  res[0].split(".");
		if(res1.length == 2){
			address.namePrefix = res1[0]+'.';
			address.firstfullname = res1[1];
		}else{
			address.firstfullname = res[0];
		}
		
		
		address.company = address.attention;
		address.lastfullname = res[1];
		
		delete address.attention;
		delete address.addressee;
		
		return address;
	}
	
// this function prepare the address object for sending it to the frontend
,	unwrapAddressee: function (address)
	{
		'use strict';
		var res;
		var prefix = address.namePrefix;
		var firstName = address.firstfullname+",";
		var lastName = address.lastfullname;
		
		var firstAndLast = firstName.concat(lastName);
		if(prefix != ""){
			res = prefix.concat(firstAndLast);
		}else{res = firstAndLast;}
		
		address.attention = address.company;
		address.addressee = res;
		
		
		delete address.company;
		delete address.firstfullname;
		delete address.lastfullname;
		delete address.namePrefix;
		
		return address;
	}
	
// return an address by id
,	get: function (id)
	{
		'use strict';

		return this.wrapAddressee(customer.getAddress(id));
	}
	
// return default billing address
,	getDefaultBilling: function ()
	{
		'use strict';

		return _.find(customer.getAddressBook(), function (address)
		{
			return (address.defaultbilling === 'T');
		});
	}
	
// return default shipping address
,	getDefaultShipping: function ()
	{
		'use strict';

		return _.find(customer.getAddressBook(), function (address)
		{
			return address.defaultshipping === 'T';
		});
	}
	
// returns all user's addresses
,	list: function ()
	{
		'use strict';

		var self = this;

		return  _.map(customer.getAddressBook(), function (address)
		{
			return self.wrapAddressee(address);
		});
	}
	
// update an address
,	update: function (id, data)
	{
		'use strict';

		data = this.unwrapAddressee(data);

		// validate the model
		this.validate(data);
		data.internalid = id;

		return customer.updateAddress(data);
	}
	
// add a new address to a customer
,	create: function (data)
	{
		'use strict';

		data = this.unwrapAddressee(data);
		// validate the model
		this.validate(data);

		return customer.addAddress(data);
	}
	
// remove an address
,	remove: function (id)
	{
		'use strict';

		return customer.removeAddress(id);
	}
});

//Profile.js
// Profile.js
// ----------------
// This file define the functions to be used on profile service
Application.defineModel('Profile', {
	
	validation: {
		firstname: {required: true, msg: 'First Name is required'}
	
	// This code is commented temporally, because of the inconsistences between Checkout and My Account regarding the require data from profile information (Checkout can miss last name)
	,	lastname: {required: true, msg: 'Last Name is required'}

	,	email: {required: true, pattern: 'email', msg: 'Email is required'}
	,	confirm_email: {equalTo: 'email', msg: 'Emails must match'}
	}
	
,	get: function ()
	{
		'use strict';

		var profile = {};
		
		//Only can you get the profile information if you are logged in.
		if (session.isLoggedIn()) {

			//Define the fields to be returned
			this.fields = this.fields || ['isperson', 'email', 'internalid', 'name', 'phoneinfo', 'companyname', 'firstname', 'lastname', 'middlename', 'emailsubscribe', 'campaignsubscriptions', 'paymentterms','creditlimit','balance','creditholdoverride'];

			profile = customer.getFieldValues(this.fields);

			//Make some attributes more friendly to the response
			profile.phone = profile.phoneinfo.phone;
			profile.altphone = profile.phoneinfo.altphone;
			profile.fax = profile.phoneinfo.fax;
			profile.priceLevel = (session.getShopperPriceLevel().internalid) ? session.getShopperPriceLevel().internalid : session.getSiteSettings(['defaultpricelevel']).defaultpricelevel;
			profile.type = profile.isperson ? 'INDIVIDUAL' : 'COMPANY';
			profile.isGuest = session.getCustomer().isGuest() ? 'T' : 'F';
			profile.creditlimit = parseFloat(profile.creditlimit || 0);
			profile.creditlimit_formatted = formatCurrency(profile.creditlimit);
			profile.balance = parseFloat(profile.balance || 0);
			profile.balance_formatted = formatCurrency(profile.balance);
			profile.creditholdoverride = profile.creditholdoverride;
			profile.paymentterms = profile.paymentterms;
		}

		return profile;
	}
	
,	update: function (data)
	{
		'use strict';
		
		var login = nlapiGetLogin();

		if (data.current_password && data.password && data.password === data.confirm_password)
		{
			//Updating password
			return login.changePassword(data.current_password, data.password);
		}

		this.currentSettings = customer.getFieldValues();
		
		//Define the customer to be updated

		var customerUpdate = {
			internalid: parseInt(nlapiGetUser(), 10)
		};

		//Assign the values to the customer to be updated

		customerUpdate.firstname = data.firstname;
		
		if(data.lastname !== '')
		{
			customerUpdate.lastname = data.lastname;	
		}

		if(this.currentSettings.lastname === data.lastname)
		{
			delete this.validation.lastname;
		}	
	
		customerUpdate.companyname = data.companyname;
		

		customerUpdate.phoneinfo = {
				altphone: data.altphone
			,	phone: data.phone
			,	fax: data.fax
		};
		
		if(data.phone !== '')
		{
			customerUpdate.phone = data.phone;	
		}

		if(this.currentSettings.phone === data.phone)
		{
			delete this.validation.phone;
		}
		
		customerUpdate.emailsubscribe = (data.emailsubscribe && data.emailsubscribe !== 'F') ? 'T' : 'F';
		
		if (!this.currentSettings.isperson || session.getSiteSettings(['registration']).registration.companyfieldmandatory === 'T')
		{
			this.validation.companyname = {required: true, msg: 'Company Name is required'};
		}
		
		if (!this.currentSettings.isperson)
		{
			delete this.validation.firstname;
			delete this.validation.lastname;
		}
		
		//Updating customer data
		if (data.email && data.email !== this.currentSettings.email && data.email === data.confirm_email)
		{
			if(data.isGuest)
			{
				customerUpdate.email = data.email;
			}
			else
			{
				login.changeEmail(data.current_password, data.email, true);
			}
		}

		// Patch to make the updateProfile call work when the user is not updating the email
		data.confirm_email = data.email;
		
		this.validate(data);
		// check if this throws error
		customer.updateProfile(customerUpdate);
		
		if (data.campaignsubscriptions)
		{
			customer.updateCampaignSubscriptions(data.campaignsubscriptions);
		}	
		
		return this.get();
		
	}
});

//LiveOrder.js
// Cart.js
// -------
// Defines the model used by the cart.ss service
// Available methods allow fetching and updating Shopping Cart's data
Application.defineModel('LiveOrder', {
	
	get: function ()
	{
		'use strict';

		var self = this
		,	is_secure = request.getURL().indexOf('https') === 0
		,	order_field_keys = {
				'items': [
					'amount'
				,	'promotionamount'
				,	'promotiondiscount'
				,	'orderitemid'
				,	'quantity'
				,	'onlinecustomerprice_detail'
				,	'internalid'
				,	'options'
				,	'itemtype'
				]
			,	'giftcertificates': []
			,	'shipaddress': []
			,	'billaddress': []
			,	'payment': []
			,	'summary': []
			,	'promocodes': []
			,	'shipmethod': []
			,	'shipmethods': []
			,	'agreetermcondition': []
			,	'purchasenumber': []
			};

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


//OrderItem.js
// Address.js
// ----------
// Handles fetching of ordered items
Application.defineModel('OrderItem', {
	
	search: function (item_id, order_id, query, sort, page)
	{
		'use strict';

		item_id; // TODO: this is to validate jshint, but we shouldnt have to

		var filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('quantity', null, 'greaterthan', 0)
			,	new nlobjSearchFilter('mainline', null, 'is', 'F')
			,	new nlobjSearchFilter('cogs', null, 'is', 'F')
			,	new nlobjSearchFilter('taxline', null, 'is', 'F')
			,	new nlobjSearchFilter('shipping', null, 'is', 'F')
			,	new nlobjSearchFilter('transactiondiscount', null, 'is', 'F')
			,	new nlobjSearchFilter('isonline', 'item', 'is', 'T')
			,	new nlobjSearchFilter('isinactive', 'item', 'is', 'F')
			,   new nlobjSearchFilter('type', 'item', 'noneof','GiftCert')
			]
		
		,	columns = [
				new nlobjSearchColumn('internalid', 'item', 'group')
			,	new nlobjSearchColumn('type', 'item', 'group')
			,	new nlobjSearchColumn('parent', 'item', 'group')
			,	new nlobjSearchColumn('options', null, 'group')
			// to sort by price we fetch the max onlinecustomerprice
			,	new nlobjSearchColumn('onlinecustomerprice', 'item', 'max')
			// to sort by recently purchased we grab the last date the item was purchased
			,	new nlobjSearchColumn('trandate', null, 'max')
			// to sort by frequently purchased we count the number of orders which contains an item
			,	new nlobjSearchColumn('internalid', null, 'count')
			]
	
		,	item_name =  new nlobjSearchColumn('formulatext','item', 'group');

		// when sorting by name, if the item has displayname we sort by that field, if not we sort by itemid  
		item_name.setFormula('case when LENGTH({item.displayname}) > 0 then {item.displayname} else {item.itemid} end');

		columns.push(item_name);

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && session.getSiteSettings(['siteid']))
		{
			filters.push(new nlobjSearchFilter('website', 'item', 'is', session.getSiteSettings(['siteid']).siteid));
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid,'@NONE@']));
		}

		// show only items from one order
		if (order_id)
		{
			filters.push(new nlobjSearchFilter('internalid', null, 'is', order_id));
			columns.push(new nlobjSearchColumn('tranid', null, 'group'));
		}

		if (query)
		{
			filters.push( 
				new nlobjSearchFilter('itemid', 'item', 'contains', query).setLeftParens(true).setOr(true)
			,	new nlobjSearchFilter('displayname', 'item', 'contains', query).setRightParens(true)
			);
		}

		// select field to sort by
		switch(sort)
		{
			// sort by name
			case 'name-desc':
				columns[7].setSort(true);
			break;

			case 'name-asc':
				columns[7].setSort(false);
			break;

			// sort by price
			case 'price-desc':
				columns[4].setSort(true);
			break;

			case 'price-asc':
				columns[4].setSort(false);
			break;

			// sort by recently purchased
			case 'date-desc':
				columns[5].setSort(true);
			break;

			case 'date-asc':
				columns[5].setSort(false);
			break;

			// sort by frequenlty purchased
			case 'quantity-asc':
				columns[6].setSort(false);
			break;

			default: 
				columns[6].setSort(true);
			break;
		}
		
		// fetch items
		var result = Application.getPaginatedSearchResults('salesorder', filters, columns, page, 20)
		// prepare an item collection, this will be used to preload item's details
		,	items_info = _.map(result.records, function (line)
			{
				return {
					id: line.getValue('internalid', 'item', 'group')
				,	parent: line.getValue('parent', 'item', 'group')
				,	type: line.getValue('type', 'item', 'group')
				};
			});
		
		if (items_info.length)
		{
			var storeItem = Application.getModel('StoreItem');

			// preload order's items information
			storeItem.preloadItems(items_info);
		
			result.records = _.map(result.records, function (line)
			{

				// prepare the collection for the frontend
				return {
						item: storeItem.get( line.getValue('internalid', 'item', 'group') )
					,	tranid: line.getValue('tranid', null, 'group') ||  null
					,	options_object: getItemOptionsObject( line.getValue('options', null, 'group') )
					,	trandate: line.getValue('trandate', null, 'max')
				};
			});
		}
		
		return result;
	}
});

//CreditCard.js
// CreditCard.js
// ----------------
// This file define the functions to be used on Credit Card service
Application.defineModel('CreditCard', {
	
	validation: {
		ccname: {required: true, msg: 'Name is required'}
	,	paymentmethod: {required: true, msg: 'Card Type is required'}
	,	ccnumber: {required: true, msg: 'Card Number is required'}
	,	expmonth: {required: true, msg: 'Expiration is required'}
	,	expyear: {required: true, msg: 'Expiration is required'}
	}
	
,	get: function (id)
	{
		'use strict';

		//Return a specific credit card
		return customer.getCreditCard(id);
	}
	
,	getDefault: function ()
	{
		'use strict';

		//Return the credit card that the customer setted to default
		return _.find(customer.getCreditCards(), function (credit_card)
		{
			return credit_card.ccdefault === 'T';
		});
	}
	
,	list: function ()
	{
		'use strict';

		//Return all the credit cards with paymentmethod
		return _.filter(customer.getCreditCards(), function (credit_card)
		{
			return credit_card.paymentmethod;
		});
	}
	
,	update: function (id, data)
	{
		'use strict';

		//Update the credit card if the data is valid
		this.validate(data);
		data.internalid = id;

		return customer.updateCreditCard(data);
	}
	
,	create: function (data)
	{
		'use strict';

		//Create a new credit card if the data is valid
		this.validate(data);

		return customer.addCreditCard(data);
	}
	
,	remove: function (id)
	{
		'use strict';

		//Remove a specific credit card
		return customer.removeCreditCard(id);
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
		,	items_with_parent = {}
		,	self = this;

		items = items || [];

		if ( ! items.length)
		{
			return;
		}

		if (self.preloadedItems)
		{
			items.forEach(function(item)
			{
				delete self.preloadedItems[item.internalid];	
			});
		}

		items.forEach(function (item)
		{
			items_by_id[item.id] = {
				internalid: item.id.toString(),
				itemtype: item.type || 'InvtPart'
			};
			
			if (item.parent) {
				items_with_parent[item.id] = item.parent;
				items_by_id[item.parent] = {
					internalid: item.parent,
					itemtype: item.type || 'InvtPart'
				};
			}
		});
		
		var items_details
		,	item_ids = _.values( items_by_id );

		//Check if we have access to fieldset 
		try //SuiteCommerce Advanced website have fieldsets
		{
			items_details = session.getItemFieldValues('details', _.pluck(item_ids, 'internalid')).items;
		}
		catch (e) //Sitebuilder website version doesn't have fieldsets
		{
			items_details = session.getItemFieldValues(item_ids);
		}

		self.preloadedItems = self.preloadedItems || {};

		// Generates a map by id for easy access. Notice that for disabled items the array element can be null
		_.each(items_details, function (item)
		{
			if (item && typeof item.itemid !== 'undefined')
			{
				self.preloadedItems[item.internalid] = item;
			}
		});

		// Fills the item with the information you passed in if not return by the ip
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

		// Loads parents that may be needed
		var parents_to_load = {};
		_.each(self.preloadedItems, function (item)
		{
			if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child' && self.preloadedItems && !self.preloadedItems[item.itemoptions_detail.parentid])
			{
				parents_to_load[item.itemoptions_detail.parentid] = {
					id: item.itemoptions_detail.parentid
				,	type: item.itemtype
				};
			}
		});
		parents_to_load = _.values(parents_to_load);
		if (parents_to_load.length)
		{
			self.preloadItems(parents_to_load);
		}


		// Adds the parent inforamtion to the child
		_.each(self.preloadedItems, function (item)
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

