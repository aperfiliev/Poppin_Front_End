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

		if (address.attention && address.addressee)
		{
			address.fullname = address.attention;
			address.company = address.addressee;
		}
		else
		{
			address.fullname = address.addressee;
			address.company = null;
		}
		
		delete address.attention;
		delete address.addressee;	
		
		return address;
	}
	
// this function prepare the address object for sending it to the frontend
,	unwrapAddressee: function (address)
	{
		'use strict';

		if (address.company)
		{
			address.attention = address.fullname;
			address.addressee = address.company;
		}
		else
		{
			address.addressee = address.fullname;
			address.attention = null;
		}
		
		delete address.fullname;
		delete address.company;	
		
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
		
		if (data.lastname)
		{
			customerUpdate.lastname = data.lastname;	
		}

		if (this.currentSettings.lastname === data.lastname)
		{
			delete this.validation.lastname;
		}	
	
		customerUpdate.companyname = data.companyname;
		
		customerUpdate.phoneinfo = {
				altphone: data.altphone
			,	phone: data.phone
			,	fax: data.fax
		};
		
		customerUpdate.emailsubscribe = (data.emailsubscribe && data.emailsubscribe !== 'F') ? 'T' : 'F';
		
		if (!(this.currentSettings.companyname === '' || this.currentSettings.isperson || session.getSiteSettings(['registration']).registration.companyfieldmandatory !== 'T'))
		{
			this.validation.companyname = {required: true, msg: 'Company Name is required'};
		}
		
		if (!this.currentSettings.isperson)
		{
			delete this.validation.firstname;
			delete this.validation.lastname;
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

//PlacedOrder.js
// PlacedOrder.js
// ----------
// Handles fetching orders

Application.defineModel('PlacedOrder', {

	list: function (page)
	{ 
		'use strict';
		
		var filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('mainline', null, 'is', 'T')
			]
		,	columns = [
				new nlobjSearchColumn('internalid').setSort(true)
			,	new nlobjSearchColumn('trackingnumbers')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('total')
			]
		
		// if the store has multiple currencies we add the currency column to the query
		,	isMultiCurrency = context.getFeature('MULTICURRENCY');
		
		if (isMultiCurrency)
		{
			columns.push( new nlobjSearchColumn('currency'));
		}

		//if the site is multisite we add the siteid to the search filter
//		if (context.getFeature('MULTISITE') && session.getSiteSettings(['siteid']).siteid)
//		{
//			filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid,'@NONE@']));
//		}

		var result = Application.getPaginatedSearchResults('salesorder', filters, columns, page, 20);
//		nlapiLogExecution("DEBUG","result",JSON.stringify(result));
//		var result2 = Application.getPaginatedSearchResults('salesorder', filters, columns, 2, 20);
//		nlapiLogExecution("DEBUG","result",JSON.stringify(result.records.length));
		
		result.records = _.map(result.records || [], function (record)
		{
			return {
				internalid: record.getValue('internalid')
			,	date: record.getValue('trandate')
			,	order_number: record.getValue('tranid')
			,	status: record.getText('status')
			,	summary: {
					total: toCurrency(record.getValue('total'))
				,	total_formatted: formatCurrency(record.getValue('total'))
				}
				// we might need to change that to the default currency
			,	currency: isMultiCurrency ? {internalid: record.getValue('currency'), name: record.getText('currency')} : null
				// Normalizes tracking number's values
			,	trackingnumbers: record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null
			,	type: record.getRecordType()
			};
		});
	
		return result;
	}

,	get: function(id)
	{
		'use strict';

		var placed_order = nlapiLoadRecord('salesorder', id)
		,	result = this.createResult(placed_order);
		
		this.setAddresses(result, placed_order);
		this.setShippingMethods(result,placed_order);
		this.setLines(result, placed_order);
		this.setFulfillments(result);
		this.setPaymentMethod(result,placed_order);
		this.setReceipts(result, placed_order);
		this.setReturnAuthorizations(result, placed_order);

		result.promocode = (placed_order.getFieldValue('promocode')) ? {
			internalid: placed_order.getFieldValue('promocode')
		,	name: placed_order.getFieldText('promocode')
		,	code: placed_order.getFieldText('couponcode')
		} : null;

		//convert the obejcts to arrays
		result.addresses = _.values(result.addresses);
		result.shipmethods = _.values(result.shipmethods);
		result.lines = _.values(result.lines);
		result.fulfillments = _.values(result.fulfillments);
		result.receipts = _.values(result.receipts);
		result.returnauthorizations = _.values(result.returnauthorizations);

		return result;
	}


,	setPaymentMethod: function (result, placed_order) 
	{
		'use strict';
		var paymentmethod = {
			type: placed_order.getFieldValue('paymethtype')
		,	primary: true
		};

		if (paymentmethod.type === 'creditcard')
		{
			paymentmethod.creditcard = {
				ccnumber: placed_order.getFieldValue('ccnumber')
			,	ccexpiredate: placed_order.getFieldValue('ccexpiredate')
			,	ccname: placed_order.getFieldValue('ccname')
			,	paymentmethod: {
					ispaypal: 'F'
				,	name: placed_order.getFieldText('paymentmethod')
				,	creditcard: 'T'
				,	internalid: placed_order.getFieldValue('paymentmethod')
				}
			};
		}	
		
		if (placed_order.getFieldValue('terms'))
		{
			paymentmethod.type = 'invoice';

			paymentmethod.purchasenumber = placed_order.getFieldValue('otherrefnum');
			
			paymentmethod.paymentterms = {
					internalid: placed_order.getFieldValue('terms')
				,	name: placed_order.getFieldText('terms')
			};
		}

		result.paymentmethods = [paymentmethod];
	}

,	createResult: function (placed_order)
	{
		'use strict';
		return {
			internalid: placed_order.getId()
		,	type: placed_order.getRecordType()
		,	trantype: placed_order.getFieldValue('type')
		,	order_number: placed_order.getFieldValue('tranid')
		,	summary: {
				subtotal: toCurrency(placed_order.getFieldValue('subtotal'))
			,	subtotal_formatted: formatCurrency(placed_order.getFieldValue('subtotal'))
			
			,	taxtotal: toCurrency(placed_order.getFieldValue('taxtotal'))
			,	taxtotal_formatted: formatCurrency(placed_order.getFieldValue('taxtotal'))

			,	tax2total: toCurrency(0)
			,	tax2total_formatted: formatCurrency(0)

			,	shippingcost: toCurrency(placed_order.getFieldValue('shippingcost'))
			,	shippingcost_formatted: formatCurrency(placed_order.getFieldValue('shippingcost'))

			,	handlingcost: toCurrency(placed_order.getFieldValue('althandlingcost'))
			,	handlingcost_formatted: formatCurrency(placed_order.getFieldValue('althandlingcost'))

			,	estimatedshipping: 0
			,	estimatedshipping_formatted: formatCurrency(0)

			,	taxonshipping: toCurrency(0)
			,	taxonshipping_formatted: formatCurrency(0)

			,	discounttotal: toCurrency(placed_order.getFieldValue('discounttotal'))
			,	discounttotal_formatted: formatCurrency(placed_order.getFieldValue('discounttotal'))

			,	taxondiscount: toCurrency(0)
			,	taxondiscount_formatted: formatCurrency(0)

			,	discountrate: toCurrency(0)
			,	discountrate_formatted: formatCurrency(0)

			,	discountedsubtotal: toCurrency(0)
			,	discountedsubtotal_formatted: formatCurrency(0)

			,	giftcertapplied: toCurrency(placed_order.getFieldValue('giftcertapplied'))
			,	giftcertapplied_formatted: formatCurrency(placed_order.getFieldValue('giftcertapplied'))

			,	total: toCurrency(placed_order.getFieldValue('total'))
			,	total_formatted: formatCurrency(placed_order.getFieldValue('total'))

			}
		
		,	currency: context.getFeature('MULTICURRENCY') ? 
			{
				internalid: placed_order.getFieldValue('currency')
			,	name: placed_order.getFieldValue('currencyname')
			} : null
		
		,   date: placed_order.getFieldValue('trandate')

		,   status: placed_order.getFieldValue('status')		
		};	
	}

,	setFulfillments: function(result)
	{
		'use strict';

		var self = this;

		result.fulfillments = {};
		var filters = [
				new nlobjSearchFilter('createdfrom', null, 'is', result.internalid)
			,	new nlobjSearchFilter('cogs', null, 'is', 'F')
			,	new nlobjSearchFilter('shipping', null, 'is', 'F')
			,	new nlobjSearchFilter('shiprecvstatusline', null, 'is', 'F')
			]
		
		,	columns = [
				new nlobjSearchColumn('quantity')
			,	new nlobjSearchColumn('item')
			,	new nlobjSearchColumn('shipaddress')
			,	new nlobjSearchColumn('shipmethod')
			,	new nlobjSearchColumn('shipto')
			,	new nlobjSearchColumn('trackingnumbers')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('status')

				// Ship Address
			,	new nlobjSearchColumn('shipaddress')
			,	new nlobjSearchColumn('shipaddress1')
			,	new nlobjSearchColumn('shipaddress2')
			,	new nlobjSearchColumn('shipaddressee')
			,	new nlobjSearchColumn('shipattention')
			,	new nlobjSearchColumn('shipcity')
			,	new nlobjSearchColumn('shipcountry')
			,	new nlobjSearchColumn('shipstate')
			,	new nlobjSearchColumn('shipzip')
			]

		,	fulfillments = Application.getAllSearchResults('itemfulfillment', filters, columns)
		,	fulfillment_id = [];


		fulfillments.forEach(function (ffline){

			if(ffline.getValue('status') === 'shipped'){
			
				var shipaddress = self.addAddress({
					internalid: ffline.getValue('shipaddress')
				,	country: ffline.getValue('shipcountry')
				,	state: ffline.getValue('shipstate')
				,	city: ffline.getValue('shipcity')
				,	zip: ffline.getValue('shipzip')
				,	addr1: ffline.getValue('shipaddress1')
				,	addr2: ffline.getValue('shipaddress2')
				,	attention: ffline.getValue('shipattention')
				,	addressee: ffline.getValue('shipaddressee')
				}, result);


				result.fulfillments[ffline.getId()] = result.fulfillments[ffline.getId()] || {
					internalid: ffline.getId()
				,	shipaddress: shipaddress
				,	shipmethod: ffline.getValue('shipmethod')
				,	date: ffline.getValue('trandate')
				,	trackingnumbers: ffline.getValue('trackingnumbers') ? ffline.getValue('trackingnumbers').split('<BR>') : null
				,	lines:[]
				};

				result.fulfillments[ffline.getId()].lines.push({
						item_id: ffline.getValue('item')
					,	quantity: ffline.getValue('quantity')
					,	rate: 0
					,	rate_formatted: formatCurrency(0)
				});
				fulfillment_id.push(ffline.getId());

			}
		
		});


		if (fulfillment_id.length)
		{
			filters = [
					new nlobjSearchFilter('internalid', null, 'anyof', result.internalid)
				,	new nlobjSearchFilter('fulfillingtransaction', null, 'anyof', fulfillment_id)
				];

			
			columns = [
					new nlobjSearchColumn('line')
				,	new nlobjSearchColumn('item')
				,	new nlobjSearchColumn('rate')
				,	new nlobjSearchColumn('fulfillingtransaction')

				];


			// TODO: open issue: we need visibility to the orderline/orderdoc attributes of the fulfillment
			// and this sux :p
			Application.getAllSearchResults('salesorder', filters, columns).forEach(function(line)
			{
				var foundline = _.find(result.fulfillments[line.getValue('fulfillingtransaction')].lines, function(ffline)
				{
					return ffline.item_id === line.getValue('item') && !ffline.line_id;
				});

				foundline.line_id = result.internalid + '_' + line.getValue('line');
				foundline.rate = parseFloat(line.getValue('rate')) * foundline.quantity;
				foundline.rate_formatted = formatCurrency(foundline.rate);
				delete foundline.item_id;
			});
		}	

	}

,	setLines: function(result, placed_order)
	{
		'use strict';

		result.lines = {};
		var items_to_preload = []
		,	amount;
		
		for (var i = 1; i <= placed_order.getLineItemCount('item'); i++) {

			if (placed_order.getLineItemValue('item', 'itemtype', i) === 'Discount' && placed_order.getLineItemValue('item', 'discline', i))
			{
				var discline = placed_order.getLineItemValue('item', 'discline', i);
				
				amount = Math.abs(parseFloat(placed_order.getLineItemValue('item', 'amount', i)));

				result.lines[discline].discount = (result.lines[discline].discount) ? result.lines[discline].discount + amount : amount;
				result.lines[discline].total = result.lines[discline].amount + result.lines[discline].tax_amount - result.lines[discline].discount;
			}
			else
			{
				var rate = toCurrency(placed_order.getLineItemValue('item', 'rate', i))
				,	item_id = placed_order.getLineItemValue('item', 'item', i)
				,	item_type = placed_order.getLineItemValue('item', 'itemtype', i);
				
				amount = toCurrency(placed_order.getLineItemValue('item', 'amount', i));
				
				var	tax_amount = toCurrency(placed_order.getLineItemValue('item', 'tax1amt', i)) || 0
				,	total = amount + tax_amount;
				
				result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
					internalid: placed_order.getLineItemValue('item', 'id', i)
				,   quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)

				,   rate: rate

				,   amount: amount

				,	tax_amount: tax_amount
				,	tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i)
				,	tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)

				,   discount: 0

				,   total: total

				,   item: item_id
				,	type: item_type
				,   options: getItemOptionsObject(placed_order.getLineItemValue('item', 'options', i))
				,   shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null
				,   shipmethod:  placed_order.getLineItemValue('item', 'shipmethod', i) || null
				};


				items_to_preload[item_id] = {
					id: item_id
				,	type: item_type
				};

			}
			
		}
		
		// Preloads info about the item		
		this.store_item = Application.getModel('StoreItem');

		items_to_preload = _.values(items_to_preload);
		
		this.store_item.preloadItems(items_to_preload);

		// The api wont bring disabled items so we need to query them directly
		var items_to_query = []
		,	self = this;
		
		_.each(result.lines, function(line)
		{
			if (line.item)
			{
				var item = self.store_item.get(line.item, line.type);
				if (!item || typeof item.itemid === 'undefined')
				{
					items_to_query.push(line.item);
				}
			}
		});

		if (items_to_query.length > 0)
		{
			var filters = [
					new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
				,	new nlobjSearchFilter('internalid', null, 'is', result.internalid)
				,	new nlobjSearchFilter('internalid', 'item', 'anyof', items_to_query)
				]
			
			,	columns = [
					new nlobjSearchColumn('internalid', 'item')
				,	new nlobjSearchColumn('type', 'item')
				,	new nlobjSearchColumn('parent', 'item')
				,	new nlobjSearchColumn('displayname', 'item')
				,	new nlobjSearchColumn('storedisplayname', 'item')
				,	new nlobjSearchColumn('itemid', 'item')
				]
			
			,	inactive_items_search = Application.getAllSearchResults('transaction', filters, columns);

			inactive_items_search.forEach(function(item)
			{
				var inactive_item = {
					internalid: item.getValue('internalid', 'item')
				,	type: item.getValue('type', 'item')
				,	displayname: item.getValue('displayname', 'item')
				,	storedisplayname: item.getValue('storedisplayname', 'item')
				,	itemid: item.getValue('itemid', 'item')
				};
			
				self.store_item.set(inactive_item);
			}); 


		}		

		result.lines = _.values(result.lines);

		result.lines.forEach(function(line)
		{
			line.rate_formatted = formatCurrency(line.rate);
			line.amount_formatted = formatCurrency(line.amount);
			line.tax_amount_formatted = formatCurrency(line.tax_amount);
			line.discount_formatted = formatCurrency(line.discount);
			line.total_formatted = formatCurrency(line.total);
			line.item = self.store_item.get(line.item, line.type);
		});
		
		// remove the temporary address list by id
		delete result.listAddresseByIdTmp;
	}

,	setShippingMethods: function(result, placed_order)
	{
		'use strict';
		result.shipmethods = {};

		if (placed_order.getLineItemCount('shipgroup') <= 0)
		{
			result.shipmethods[placed_order.getFieldValue('shipmethod')] = {
				internalid: placed_order.getFieldValue('shipmethod')
			,	name: placed_order.getFieldText('shipmethod')
			,	rate: toCurrency(placed_order.getFieldValue('shipping_rate'))
			,	rate_formatted: formatCurrency(placed_order.getFieldValue('shipping_rate'))
			,	shipcarrier: placed_order.getFieldValue('carrier')
			};
		}

		for (var i = 1; i <= placed_order.getLineItemCount('shipgroup') ; i++)
		{
			result.shipmethods[placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i)] = {
				internalid: placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i)
			,    name: placed_order.getLineItemValue('shipgroup', 'shippingmethod', i)
			,    rate: toCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i))
			,    rate_formatted: formatCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i))
			,    shipcarrier: placed_order.getLineItemValue('shipgroup', 'shippingcarrier', i)
			};

		}

		result.shipmethod = placed_order.getFieldValue('shipmethod');
	}

,	addAddress: function(address, result)
	{
		'use strict';
		result.addresses = result.addresses || {};

		address.fullname = (address.attention) ? address.attention : address.addressee;
		address.company = (address.attention) ? address.addressee : null;
		
		delete address.attention;
		delete address.addressee;

		address.internalid =	(address.country || '')  + '-' +
								(address.state || '') + '-' +
								(address.city || '') + '-' +
								(address.zip || '') + '-' +
								(address.addr1 || '') + '-' +
								(address.addr2 || '') + '-' +
								(address.fullname || '') + '-' +
								(address.company || '');

		address.internalid = address.internalid.replace(/\s/g, '-');
		
		if (!result.addresses[address.internalid])
		{
			result.addresses[address.internalid] = address;
		}

		return address.internalid;
	}

,	setAddresses: function(result, placed_order)
	{
		// TODO: normalize addresses, remove <br> and \r\n
		'use strict';
		result.addresses = {};
		result.listAddresseByIdTmp ={};
		for (var i = 1; i <= placed_order.getLineItemCount('iladdrbook') ; i++)
		{
			// Adds all the addresses in the address book
			result.listAddresseByIdTmp[placed_order.getLineItemValue('iladdrbook', 'iladdrinternalid', i)] = this.addAddress({
				internalid: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr', i)
			,	country: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcountry', i)
			,	state: placed_order.getLineItemValue('iladdrbook', 'iladdrshipstate', i)
			,	city: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcity', i)
			,	zip: placed_order.getLineItemValue('iladdrbook', 'iladdrshipzip', i)
			,	addr1: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr1', i)
			,	addr2: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr2', i)
			,	attention: placed_order.getLineItemValue('iladdrbook', 'iladdrshipattention', i)
			,	addressee: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddressee', i)
			}, result);
		}

		// Adds Bill Address
		result.billaddress = this.addAddress({
			internalid: placed_order.getFieldValue('billaddress')
		,	country: placed_order.getFieldValue('billcountry')
		,	state: placed_order.getFieldValue('billstate')
		,	city: placed_order.getFieldValue('billcity')
		,	zip: placed_order.getFieldValue('billzip')
		,	addr1: placed_order.getFieldValue('billaddr1')
		,	addr2: placed_order.getFieldValue('billaddr2')
		,	attention: placed_order.getFieldValue('billattention')
		,	addressee: placed_order.getFieldValue('billaddressee')
		}, result);

		// Adds Shipping Address
		result.shipaddress = (placed_order.getFieldValue('shipaddress')) ? this.addAddress({
			internalid: placed_order.getFieldValue('shipaddress')
		,	country: placed_order.getFieldValue('shipcountry')
		,	state: placed_order.getFieldValue('shipstate')
		,	city: placed_order.getFieldValue('shipcity')
		,	zip: placed_order.getFieldValue('shipzip')
		,	addr1: placed_order.getFieldValue('shipaddr1')
		,	addr2: placed_order.getFieldValue('shipaddr2')
		,	attention: placed_order.getFieldValue('shipattention')
		,	addressee: placed_order.getFieldValue('shipaddressee')
		}, result) : null;
	}

,	setReceipts: function (result)
	{
		'use strict';
		result.receipts = Application.getModel('Receipts').list(null, result.internalid);

	}

,	setReturnAuthorizations: function (result)
	{
		'use strict';
		// TODO: change the variable names (here and in order_details.txt) to match the new nomenclature
		var filters = [
				new nlobjSearchFilter('createdfrom', null, 'anyof', result.internalid)
			]
		
		,	columns = [
				new nlobjSearchColumn('internalid', 'item')
			,	new nlobjSearchColumn('type', 'item')
			,	new nlobjSearchColumn('parent', 'item')
			,	new nlobjSearchColumn('displayname', 'item')
			,	new nlobjSearchColumn('storedisplayname', 'item')
			,	new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('taxtotal')
			,	new nlobjSearchColumn('rate')
			,	new nlobjSearchColumn('total')
			,	new nlobjSearchColumn('mainline')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')	
			,	new nlobjSearchColumn('options')
			,	new nlobjSearchColumn('linesequencenumber').setSort()
			,	new nlobjSearchColumn('amount')
			,	new nlobjSearchColumn('quantity')
			]

		,	isMultiCurrency = context.getFeature('MULTICURRENCY');
		
		this.store_item = this.store_item || Application.getModel('StoreItem');

		if (isMultiCurrency)
		{
			columns.push( new nlobjSearchColumn('currency'));	
		}
		
		var	return_authorizations = Application.getAllSearchResults('returnauthorization', filters, columns)
		,	return_address = context.getPreference('returnaddresstext')
		,	grouped_result = {}
		,	self = this;
		
		// the query returns the transaction headers mixed with the lines so we have to group the returns authorization
		_.each(return_authorizations, function (returnauthorization)
		{
			// create the return authorization
			if (!grouped_result[returnauthorization.getId()])
			{
				grouped_result[returnauthorization.getId()] = {lines: []};
			}
			
			var current_return = grouped_result[returnauthorization.getId()];

			// asterisk means true
			if (returnauthorization.getValue('mainline') === '*')
			{
				// if it's the mainline we add some fields
				_.extend(current_return, {
					internalid: returnauthorization.getValue('internalid')
				,	status: returnauthorization.getText('status')
				,	date: returnauthorization.getValue('trandate')
				,	summary: {
						total: toCurrency(returnauthorization.getValue('total'))
					,	total_formatted: formatCurrency(returnauthorization.getValue('total'))
					}
				,	type: 'returnauthorization'
				,	currency:  context.getFeature('MULTICURRENCY') ? 
					{
							internalid: returnauthorization.getValue('currency')
						,	name: returnauthorization.getText('currency')
					} : null
				});

				// it the autorizhation is approved, add the return's information
				if (returnauthorization.getValue('status') !== 'pendingApproval')
				{
					current_return.order_number = returnauthorization.getValue('tranid');
					current_return.return_address = return_address;
				}
			}
			else
			{
				// if it's a line, we add it to the lines collection of the return authorization
				// TODO: find the proper field for the internalid instead of building it
				current_return.lines.push({
					internalid: returnauthorization.getValue('internalid') + '_' + returnauthorization.getValue('linesequencenumber')
				,	quantity: returnauthorization.getValue('quantity')
				,	rate: toCurrency(returnauthorization.getValue('rate'))
				,	amount: toCurrency(returnauthorization.getValue('amount'))
				,	tax_amount: toCurrency(returnauthorization.getValue('taxtotal'))
				,	total: toCurrency(returnauthorization.getValue('total'))

				,	options: getItemOptionsObject(returnauthorization.getValue('options'))
				// add item information to order's line, the storeitem collection was preloaded in the getOrderLines function
				,	item: self.store_item.get(
						returnauthorization.getValue('internalid', 'item')
					,	returnauthorization.getValue('type', 'item')
					)
				});
			}
		});
		
		result.returnauthorizations = grouped_result;
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
			,   new nlobjSearchFilter('type', 'item', 'noneof', 'GiftCert')
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
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid, '@NONE@']));
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
				,	type: line.getValue('type', 'item', 'group')
				};
			});
		
		if (items_info.length)
		{
			var store_item = Application.getModel('StoreItem');

			// preload order's items information
			store_item.preloadItems(items_info);
		
			result.records = _.map(result.records, function (line)
			{

				// prepare the collection for the frontend
				return {
						item: store_item.get( line.getValue('internalid', 'item', 'group'), line.getValue('type', 'item', 'group') )
					,	tranid: line.getValue('tranid', null, 'group') ||  null
					,	options_object: getItemOptionsObject( line.getValue('options', null, 'group') )
					,	trandate: line.getValue('trandate', null, 'max')
				};
			});
		}
		
		return result;
	}
});


//Receipts.js
// Receipts.js
// ----------
// Handles fetching receipts
var PlacedOrder = Application.getModel('PlacedOrder');


Application.defineModel('Receipts', _.extend({}, PlacedOrder, {

	// gets all the user's receipts
	list: function (page,orderid)
	{
		'use strict';

		var filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('mainline', null, 'is', 'T')
			,	new nlobjSearchFilter('type', null, 'anyof', ['CustInvc', 'CashSale'])
			]
		,	columns = [
				new nlobjSearchColumn('internalid').setSort(true)
			,	new nlobjSearchColumn('trackingnumbers')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('total')
			]
	
		// if the store has multiple currencies we add the currency column to the query
		,	isMultiCurrency = context.getFeature('MULTICURRENCY');


		if (isMultiCurrency)
		{
			columns.push( new nlobjSearchColumn('currency'));	
		}

		//if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && session.getSiteSettings(['siteid']))
		{
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid,'@NONE@']));
		}

		var result = {};
		if (orderid)
		{
			filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', orderid));
			result.records = Application.getAllSearchResults('transaction', filters, columns);
		}
		else
		{
			result = Application.getPaginatedSearchResults('transaction', filters, columns, page, 20);
		}


		result.records = _.map(result.records || [], function (record)
		{
			return {
				internalid: record.getValue('internalid')
			,	date: record.getValue('trandate')
			,	order_number: record.getValue('tranid')
			,	status: record.getText('status')
			,	summary: {
					total: toCurrency(record.getValue('total'))
				,	total_formatted: formatCurrency(record.getValue('total'))
				}
				// we might need to change that to the default currency
			,	currency: isMultiCurrency ? {internalid: record.getValue('currency'), name: record.getText('currency')} : null
			,	type: record.getRecordType()
			};
		});
	
		return orderid ? result.records : result;
	}
	
,	get: function (id)
	{
		'use strict';
		// get the transaction header
		var filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			,	new nlobjSearchFilter('type', null, 'anyof', ['CustInvc', 'CashSale'])
			,	new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('internalid', null, 'is', id)
			]
		//TODO: review this code. 	
		,	columns = [
				new nlobjSearchColumn('status')
			]
		//
		,	mainline = Application.getAllSearchResults('transaction', filters, columns)
		,	receipt = nlapiLoadRecord(mainline[0].getRecordType(),id)
		,	result = this.createResult(receipt);

		this.setAddresses(result, receipt);
		this.setLines(result, receipt);
		this.setPaymentMethod(result,receipt);

		result.promocode = (receipt.getFieldValue('promocode')) ? {
			internalid: receipt.getFieldValue('promocode')
		,	name: receipt.getFieldText('promocode')
		,	code: receipt.getFieldText('couponcode')
		} : null;

		result.lines = _.reject(result.lines, function (line){
			return line.quantity === 0;
		});

		//TODO: review this code. 
		result.status = mainline[0].getText(columns[0]);
		//

		//convert the obejcts to arrays
		result.addresses = _.values(result.addresses);
		result.lines = _.values(result.lines);
		return result;
	}
}));


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
		,	parents_by_id = {}
		,	self = this
		,	is_advanced = session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED';

		items = items || [];

		this.preloadedItems = this.preloadedItem || {};

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
				if (!is_advanced)
				{
					// Load related & correlated items if the site type is standard. 
					// If the site type is advanced will be loaded by getItemFieldValues function
					item.relateditems_detail = session.getRelatedItems(items_by_id[item.internalid]);
					item.correlateditems_detail = session.getCorrelatedItems(items_by_id[item.internalid]);
				}

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


