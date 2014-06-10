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
	}
	
,	get: function ()
	{
		'use strict';

		var profile = {};
		
		//Only can you get the profile information if you are logged in.
		if (session.isLoggedIn())
		{

			//Define the fields to be returned
			this.fields = this.fields || ['isperson', 'email', 'internalid', 'name', 'overduebalance', 'phoneinfo', 'companyname', 'firstname', 'lastname', 'middlename', 'emailsubscribe', 'campaignsubscriptions', 'paymentterms', 'creditlimit', 'balance', 'creditholdoverride'];

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

			profile.balance_available = profile.creditlimit - profile.balance;
			profile.balance_available_formatted = formatCurrency(profile.balance_available);
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

		this.setAddresses(placed_order, result);
		this.setShippingMethods(placed_order, result);
		this.setLines(placed_order, result);
		this.setFulfillments(result);
		this.setPaymentMethod(placed_order, result);
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


,	setPaymentMethod: function (placed_order, result)
	{
		'use strict';
		
		return setPaymentMethodToResult(placed_order, result);
	}

,	createResult: function (placed_order)
	{
		'use strict';

		return {
			internalid: placed_order.getId()
		,	type: placed_order.getRecordType()
		,	trantype: placed_order.getFieldValue('type')
		,	order_number: placed_order.getFieldValue('tranid')
		,	purchasenumber: placed_order.getFieldValue('otherrefnum')
		,	dueDate: placed_order.getFieldValue('duedate')
		,	amountDue: toCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
		,	amountDue_formatted: formatCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
		,	memo: placed_order.getFieldValue('memo')
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

,	setLines: function(placed_order, result)
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

				,	discount: 0

				,	total: total

				,	item: item_id
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

,	setShippingMethods: function(placed_order, result)
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

,	setAddresses: function(placed_order, result)
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
		result.receipts = Application.getModel('Receipts').list({
			orderid: result.internalid
		});
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
// OrderItem.js
// ----------
// Handles fetching of ordered items
Application.defineModel('OrderItem', {
	
	search: function (item_id, order_id, query, sort, page)
	{
		'use strict';

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
		switch (sort)
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

	_getReceiptType: function (type)
	{
		'use strict';

		var receipt_type = ['CustInvc', 'CashSale'];

		if (type === 'invoice')
		{
			receipt_type = ['CustInvc'];
		}
		else if (type === 'cashsale')
		{
			receipt_type = ['CashSale'];
		}

		return receipt_type;
	}

,	_getReceiptStatus: function (type, status)
	{
		'use strict';

		if (type === 'CustInvc')
		{
			status = this._getInvoiceStatus(status);
		}
		else if (type === 'CashSale')
		{
			status = this._getCashSaleStatus(status);
		}

		return type + ':' + status;
	}

,	_getCashSaleStatus: function (status)
	{
		'use strict';

		var response = null;

		switch (status)
		{
			case 'unapproved':
				response = 'A';
			break;

			case 'notdeposited':
				response = 'B';
			break;

			case 'deposited':
				response = 'C';
			break;
		}

		return response;
	}

,	_getInvoiceStatus: function (status)
	{
		'use strict';

		var response = null;

		switch (status)
		{
			case 'open':
				response = 'A';
			break;

			case 'paid':
				response = 'B';
			break;
		}

		return response;
	}

	// gets all the user's receipts
,	list: function (options)
	{
		'use strict';

		options = options || {};

		var reciept_type = this._getReceiptType(options.type)
		,	isMultiCurrency = context.getFeature('MULTICURRENCY')
		,	settings_site_id = session.getSiteSettings(['siteid'])
		,	site_id = settings_site_id && settings_site_id.siteid
		,	amount_field = isMultiCurrency ? 'fxamount' : 'amount'
		,	filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('mainline', null, 'is', 'T')
			,	new nlobjSearchFilter('type', null, 'anyof', reciept_type)
			]

		,	columns = [
				new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('type')
			,	new nlobjSearchColumn('closedate')
			,	new nlobjSearchColumn('mainline')
			,	new nlobjSearchColumn('duedate').setSort()
			,	new nlobjSearchColumn(amount_field)
			]
		,	amount_remaining;

		if (isMultiCurrency)
		{
			amount_remaining = new nlobjSearchColumn('formulanumeric').setFormula('{amountremaining} / {exchangerate}');
		}
		else
		{
			amount_remaining = new nlobjSearchColumn('amountremaining');
		}

		columns.push(amount_remaining);

		// if the store has multiple currencies we add the currency column to the query
		if (isMultiCurrency)
		{
			columns.push(new nlobjSearchColumn('currency'));
		}

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && site_id)
		{
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [site_id, '@NONE@']));
		}

		if (options.status)
		{
			var self = this;

			filters.push(
				new nlobjSearchFilter('status', null, 'anyof', _.map(reciept_type, function (type)
				{
					return self._getReceiptStatus(type, options.status);
				}))
			);
		}

		if (options.orderid)
		{
			filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', options.orderid));
		}

		if (options.internalid)
		{
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', options.internalid));
		}

		var results = Application.getAllSearchResults(options.type === 'invoice' ? 'invoice' : 'transaction', filters, columns)
		,	now = new Date().getTime();


		return _.map(results || [], function (record)
		{

			var due_date = record.getValue('duedate')
			,	close_date = record.getValue('closedate')
			,	tran_date = record.getValue('trandate')
			,	due_in_milliseconds = new Date(due_date).getTime() - now
			,	total = toCurrency(record.getValue(amount_field))
			,	total_formatted = formatCurrency(record.getValue(amount_field));

			return {
				internalid: record.getId()
			,	tranid: record.getValue('tranid')
			,	order_number: record.getValue('tranid') // Legacy attribute
			,	date: tran_date // Legacy attribute
			,	summary: { // Legacy attribute
					total: total
				,	total_formatted: total_formatted
				}
			,	total: total
			,	total_formatted: total_formatted
			,	recordtype: record.getValue('type')
			,	mainline: record.getValue('mainline')
			,	amountremaining: toCurrency(record.getValue(amount_remaining))
			,	amountremaining_formatted: formatCurrency(record.getValue(amount_remaining))
			,	closedate: close_date
			,	closedateInMilliseconds: new Date(close_date).getTime()
			,	trandate: tran_date
			,	tranDateInMilliseconds: new Date(tran_date).getTime()
			,	duedate: due_date
			,	dueinmilliseconds: due_in_milliseconds
			,	isOverdue: due_in_milliseconds <= 0 && ((-1 * due_in_milliseconds) / 1000 / 60 / 60 / 24) >= 1
			,	status: {
					internalid: record.getValue('status')
				,	name: record.getText('status')
				}
			,	currency: {
					internalid: record.getValue('currency')
				,	name: record.getText('currency')
				}
			};
		});

	}

,	setAdjustments: function (receipt, result)
	{
		'use strict';

		result.payments = [];
		result.credit_memos = [];
		result.deposit_applications = [];

		var filters = [
			new nlobjSearchFilter('appliedtotransaction', null, 'is', receipt.getId())
		,	new nlobjSearchFilter('type', null, 'anyof', ['CustCred', 'DepAppl', 'CustPymt'])
		]
		,	columns = [
				new nlobjSearchColumn('total')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('appliedtotransaction')
			,	new nlobjSearchColumn('amountremaining')
			,	new nlobjSearchColumn('amountpaid')
			,	new nlobjSearchColumn('amount')
			,	new nlobjSearchColumn('type')
			,	new nlobjSearchColumn('appliedtoforeignamount')
		]
		,	searchresults = nlapiSearchRecord('transaction', null, filters, columns);

		if (searchresults)
		{
			_.each(searchresults, function (payout)
			{
				var array = (payout.getValue('type') === 'CustPymt') ? result.payments :
							(payout.getValue('type') === 'CustCred') ? result.credit_memos :
							(payout.getValue('type') === 'DepAppl') ? result.deposit_applications : null;

				if (array)
				{
					var internal_id = payout.getId()
					,	duplicated_item = _.findWhere(array, {internalid: internal_id});

					if (!duplicated_item)
					{
						array.push({
							internalid: internal_id
						,	tranid: payout.getValue('tranid')
						,	appliedtoforeignamount : toCurrency(payout.getValue('appliedtoforeignamount'))
						,	appliedtoforeignamount_formatted : formatCurrency(payout.getValue('appliedtoforeignamount'))
						});
					}
					else
					{
						duplicated_item.appliedtoforeignamount += toCurrency(payout.getValue('appliedtoforeignamount'));
						duplicated_item.appliedtoforeignamount_formatted = formatCurrency(duplicated_item.appliedtoforeignamount);
					}
				}
			});
		}
	}

,	setSalesRep: function (receipt, result)
	{
		'use strict';

		var salesrep_id = receipt.getFieldValue('salesrep')
		,	salesrep_name = receipt.getFieldText('salesrep');

		if (salesrep_id)
		{
			result.salesrep = {
				name: salesrep_name
			,	internalid: salesrep_id
			};

			var filters = [
				new nlobjSearchFilter('internalid', null, 'is', receipt.getId())
			,	new nlobjSearchFilter('internalid', 'salesrep', 'is', 'salesrep')
			]

			,	columns = [
					new nlobjSearchColumn('duedate')
				,	new nlobjSearchColumn('salesrep')
				,	new nlobjSearchColumn('email','salesrep')
				,	new nlobjSearchColumn('entityid','salesrep')
				,	new nlobjSearchColumn('mobilephone','salesrep')
				,	new nlobjSearchColumn('fax','salesrep')
			];

			var search_results = nlapiSearchRecord('invoice', null, filters, columns);

			if (search_results)
			{
				var invoice = search_results[0];
				result.salesrep.phone = invoice.getValue('phone','salesrep');
				result.salesrep.email = invoice.getValue('email','salesrep');
				result.salesrep.fullname = invoice.getValue('entityid','salesrep');
				result.salesrep.mobilephone = invoice.getText('mobilephone','salesrep');
				result.salesrep.fax = invoice.getValue('fax','salesrep');
			}
		}
	}

,	get: function (id, type)
	{
		'use strict';
		// get the transaction header
		var filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			,	new nlobjSearchFilter('type', null, 'anyof', this._getReceiptType(type))
			,	new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('internalid', null, 'is', id)
			]
			// TODO: review this code.
		,	columns = [
				new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('createdfrom')
			,	new nlobjSearchColumn('total')
			,	new nlobjSearchColumn('taxtotal')
			]

		,	mainline = Application.getAllSearchResults('transaction', filters, columns);

		if (!mainline[0])
		{
			throw forbiddenError;
		}

		var	receipt = nlapiLoadRecord(mainline[0].getRecordType(), id)
		,	result = this.createResult(receipt);

		this.setAddresses(receipt, result);
		this.setLines(receipt, result);
		this.setPaymentMethod(receipt, result);

		if (type === 'invoice')
		{
			this.setAdjustments(receipt, result);
			this.setSalesRep(receipt, result);
		}

		result.promocode = receipt.getFieldValue('promocode') ? {
			internalid: receipt.getFieldValue('promocode')
		,	name: receipt.getFieldText('promocode')
		,	code: receipt.getFieldText('couponcode')
		} : null;

		result.lines = _.reject(result.lines, function (line)
		{
			return line.quantity === 0;
		});

		// TODO: review this code.
		result.status = mainline[0].getText(columns[0]);
		result.internal_status = mainline[0].getValue(columns[0]);

		result.createdfrom = {
			id: mainline[0].getValue(columns[1])
		,	name: mainline[0].getText(columns[1])
		};

		result.summary.total = toCurrency(mainline[0].getValue('total'));
		result.summary.total_formatted = formatCurrency(mainline[0].getValue('total'));
		result.summary.taxtotal = toCurrency(mainline[0].getValue('taxtotal'));
		result.summary.taxtotal_formatted = formatCurrency(mainline[0].getValue('taxtotal'));

		// convert the obejcts to arrays
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

//CreditMemo.js
Application.defineModel('CreditMemo', {

	get: function (id)
	{
		'use strict';

		var creditmemo = nlapiLoadRecord('creditmemo', id)
		,	result = {};

		this.createRecord(creditmemo, result);
		this.setInvoices(creditmemo, result);
		this.setItems(creditmemo, result);
		this.loadItems(creditmemo, result);

		return result;
	}

,	createRecord: function(record, result)
	{
		'use strict';

		result.internalid = record.getId();
		result.tranid = record.getFieldValue('tranid');

		result.subtotal = toCurrency(record.getFieldValue('subtotal'));
		result.subtotal_formatted = formatCurrency(record.getFieldValue('subtotal'));
		result.discount = toCurrency(record.getFieldValue('discounttotal'));
		result.discount_formatted = formatCurrency(record.getFieldValue('discounttotal'));
		result.taxtotal = toCurrency(record.getFieldValue('taxtotal'));
		result.taxtotal_formatted = formatCurrency(record.getFieldValue('taxtotal'));
		result.shippingcost = toCurrency(record.getFieldValue('shippingcost'));
		result.shippingcost_formatted = formatCurrency(record.getFieldValue('shippingcost'));
		result.total = toCurrency(record.getFieldValue('total'));
		result.total_formatted = formatCurrency(record.getFieldValue('total'));
		result.amountpaid = toCurrency(record.getFieldValue('amountpaid'));
		result.amountpaid_formatted = formatCurrency(record.getFieldValue('amountpaid'));
		result.amountremaining = toCurrency(record.getFieldValue('amountremaining'));
		result.amountremaining_formatted = formatCurrency(record.getFieldValue('amountremaining'));

		result.trandate = record.getFieldValue('trandate');
		result.status = record.getFieldValue('status');
		result.memo = record.getFieldValue('memo');
	}

,	setInvoices: function(record, result)
	{
		'use strict';
		
		result.invoices = [];
		
		for (var i = 1; i <= record.getLineItemCount('apply'); i++)
		{
			var invoice = {
					line: i
				,	internalid: record.getLineItemValue('apply', 'internalid', i)
				,	type: record.getLineItemValue('apply', 'type', i)
				,	total: toCurrency(record.getLineItemValue('apply', 'total', i))
				,	total_formatted: formatCurrency(record.getLineItemValue('apply', 'total', i))
				,	apply: record.getLineItemValue('apply', 'apply', i) === 'T'
				,	applydate: record.getLineItemValue('apply', 'applydate', i)
				,	currency: record.getLineItemValue('apply', 'currency', i)

				,	amount: toCurrency(record.getLineItemValue('apply', 'amount', i))
				,	amount_formatted: formatCurrency(record.getLineItemValue('apply', 'amount', i))
				,	due: toCurrency(record.getLineItemValue('apply', 'due', i))
				,	due_formatted: formatCurrency(record.getLineItemValue('apply', 'due', i))
				,	refnum: record.getLineItemValue('apply', 'refnum', i)
			};
			
			result.invoices.push(invoice);
		}
	}

,	setItems: function(record, result)
	{
		'use strict';
		
		result.items = [];

		for (var i = 1; i <= record.getLineItemCount('item'); i++)
		{
			var item = {
					internalid: record.getLineItemValue('item', 'item', i)
				,	id: record.getLineItemValue('item', 'item', i)
				,	type: record.getLineItemValue('item', 'itemtype', i)
				,	quantity: record.getLineItemValue('item', 'quantity', i)
				,	unitprice: toCurrency(record.getLineItemValue('item', 'rate', i))
				,	unitprice_formatted: formatCurrency(record.getLineItemValue('item', 'rate', i))
				,	total:  toCurrency(record.getLineItemValue('item', 'amount', i))
				,	total_formatted: formatCurrency(record.getLineItemValue('item', 'amount', i))

			};
			
			result.items.push(item);
		}
	}

,	loadItems: function(record, result)
	{
		'use strict';

		if (result.items.length)
		{
			// Preloads info about the item		
			var storeItem = Application.getModel('StoreItem');

			storeItem.preloadItems(result.items);

			// The api wont bring disabled items so we need to query them directly
			var itemsToQuery = [];
			
			_.each(result.items, function(item)
			{
				var itemStored = storeItem.get(item.internalid, item.type);
				if (!itemStored || typeof itemStored.itemid === 'undefined')
				{
					itemsToQuery.push(item);
				}
				else
				{
					var preItem = _.findWhere(result.items, { internalid: itemStored.internalid + '' });
					if (preItem)
					{
						_.extend(preItem, itemStored);
					}
				}
			});

			if (itemsToQuery.length > 0)
			{
				var filters = [
						new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
					,	new nlobjSearchFilter('internalid', null, 'is', result.internalid)
					,	new nlobjSearchFilter('internalid', 'item', 'anyof', _.pluck(itemsToQuery, 'internalid'))
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
				
					storeItem.set(inactive_item);

					var preItem = _.findWhere(result.items, { internalid: inactive_item.internalid + '' });
					if (preItem)
					{
						_.extend(preItem, inactive_item);
					}
				});
			}
		}
	}

,	list: function ()
	{
		'use strict';

		var filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			,	new nlobjSearchFilter('amountremaining', null, 'greaterthan', 0)
			]

		,	columns = [
					new nlobjSearchColumn('tranid')
				,	new nlobjSearchColumn('trandate')
				,	new nlobjSearchColumn('amountremaining')
				,	new nlobjSearchColumn('amountpaid')
				,	new nlobjSearchColumn('amount')
			]

			// if the store has multiple currencies we add the currency column to the query
		,	isMultiCurrency = context.getFeature('MULTICURRENCY');

		if (isMultiCurrency)
		{
			columns.push(new nlobjSearchColumn('currency'));
		}

		var settings_site_id = session.getSiteSettings(['siteid'])
		,	site_id = settings_site_id && settings_site_id.siteid;

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && site_id)
		{
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [site_id, '@NONE@']));
		}

		var result = Application.getAllSearchResults('creditmemo', filters, columns)

		,	records = _.map(JSON.parse(JSON.stringify(result)), function (record)
			{
				_.extend(record, record.columns);
				delete record.columns;

				record.amountremaining_formatted = formatCurrency(record.amountremaining);
				record.internalid = record.id;
				
				delete record.id;
			
				// Legacy attributes
				record.date = record.trandate;
				record.order_number = record.tranid;
				record.summary = {
					total: toCurrency(record.total)
				,	total_formatted: formatCurrency(record.total)
				};
				
				delete record.total;
				
				return record;
			});

		result = records;

		return result;
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


//Payment.js
// Payment.js
// -------
// Defines the model used by the payment.ss service
Application.defineModel('Payment', {

	get: function (id)
	{
		'use strict';

		var customer_payment = nlapiLoadRecord('customerpayment', id);
		
		return this.createResult(customer_payment);
	}

,	setPaymentMethod: function (customer_payment, result)
	{
		'use strict';
		
		result.paymentmethods = [];
		return setPaymentMethodToResult(customer_payment, result);
	}

,	createResult: function (customer_payment)
	{
		'use strict';

		var result = {};

		result.internalid = customer_payment.getId();
		result.type =  customer_payment.getRecordType();
		result.tranid = customer_payment.getFieldValue('tranid');
		result.autoapply = customer_payment.getFieldValue('autoapply');
		result.trandate = customer_payment.getFieldValue('trandate');
		result.status = customer_payment.getFieldValue('status');
		result.payment = toCurrency(customer_payment.getFieldValue('payment'));
		result.payment_formatted = formatCurrency(customer_payment.getFieldValue('payment'));
		result.lastmodifieddate = customer_payment.getFieldValue('lastmodifieddate');
		result.balance = toCurrency(customer_payment.getFieldValue('balance'));
		result.balance_formatted = formatCurrency(customer_payment.getFieldValue('balance'));
		
		this.setPaymentMethod(customer_payment, result);
		this.setInvoices(customer_payment, result);

		return result;
	}
,	setInvoices: function(customer_payment, result)
	{
		'use strict';
		
		result.invoices = [];

		for (var i = 1; i <= customer_payment.getLineItemCount('apply') ; i++)
		{
			var apply = customer_payment.getLineItemValue('apply', 'apply', i) === 'T';
			
			if (apply)
			{
				var invoice = {
		
					internalid: customer_payment.getLineItemValue('apply', 'internalid', i)
				,	type: customer_payment.getLineItemValue('apply', 'type', i)
				,	total: toCurrency(customer_payment.getLineItemValue('apply', 'total', i))
				,	total_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'total', i))
				,	apply: apply
				,	applydate: customer_payment.getLineItemValue('apply', 'applydate', i)
				,	currency: customer_payment.getLineItemValue('apply', 'currency', i)
				,	disc: toCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
				,	disc_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
				,	amount: toCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
				,	amount_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
				,	due: toCurrency(customer_payment.getLineItemValue('apply', 'due', i))
				,	due_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'due', i))
				,	refnum: customer_payment.getLineItemValue('apply', 'refnum', i)
				};

				result.invoices.push(invoice);

			}
		}

		return result;
	}
,	list: function (page)
	{
		'use strict';

		var filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			]

		,	columns = [
				new nlobjSearchColumn('amount')
			,	new nlobjSearchColumn('statusref')
			,	new nlobjSearchColumn('trandate')
			]

		,	result = Application.getPaginatedSearchResults('customerpayment', filters, columns, page, 20);

		return result;
	}
});


//LivePayment.js
// LivePayment.js
// -------
// Defines the model used by the live-payment.ss service
Application.defineModel('LivePayment', {
	
	create: function()
	{
		'use strict';
		var payment_record = nlapiCreateRecord('customerpayment');

		payment_record.setFieldValue('customer', nlapiGetUser());
		payment_record.setFieldValue('autoapply', 'F');

		return payment_record;
	}

,	get: function()
	{
		'use strict';

		try
		{
			var customer_payment = this.create();
			return this.createResult(customer_payment);
		}
		catch (e)
		{
			return {};
		}
	}
,	setPaymentMethod: function (customer_payment, result)
	{
		'use strict';

		result.paymentmethods = [];
		return setPaymentMethodToResult(customer_payment, result);
	}

,	createResult: function (customer_payment)
	{
		'use strict';

		var result = {};

		result.internalid = customer_payment.getId();
		result.type =  customer_payment.getRecordType();
		result.tranid = customer_payment.getFieldValue('tranid');
		result.autoapply = customer_payment.getFieldValue('autoapply');
		result.trandate = customer_payment.getFieldValue('trandate');
		result.status = customer_payment.getFieldValue('status');
		result.payment = toCurrency(customer_payment.getFieldValue('payment'));
		result.payment_formatted = formatCurrency(customer_payment.getFieldValue('payment'));
		result.lastmodifieddate = customer_payment.getFieldValue('lastmodifieddate');
		result.balance = toCurrency(customer_payment.getFieldValue('balance'));
		result.balance_formatted = formatCurrency(customer_payment.getFieldValue('balance'));
		
		this.setPaymentMethod(customer_payment, result);
		this.setInvoices(customer_payment, result);
		this.setCreditMemos(customer_payment, result);
		this.setDeposits(customer_payment, result);

		return result;
	}

,	setInvoices: function(customer_payment, result)
	{
		'use strict';

		result.invoices = [];

		for (var i = 1; i <= customer_payment.getLineItemCount('apply') ; i++)
		{
			var invoice = {
		
					internalid: customer_payment.getLineItemValue('apply', 'internalid', i)
				,	total: toCurrency(customer_payment.getLineItemValue('apply', 'total', i))
				,	total_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'total', i))
				,	apply: customer_payment.getLineItemValue('apply', 'apply', i) === 'T'
				,	applydate: customer_payment.getLineItemValue('apply', 'applydate', i)
				,	currency: customer_payment.getLineItemValue('apply', 'currency', i)
				,	discamt: toCurrency(customer_payment.getLineItemValue('apply', 'discamt', i))
				,	discamt_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'discamt', i))
				,	disc: toCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
				,	disc_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
				,	discdate: customer_payment.getLineItemValue('apply', 'discdate', i)
				,	amount: toCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
				,	amount_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
				,	due: toCurrency(customer_payment.getLineItemValue('apply', 'due', i))
				,	due_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'due', i))
				,	refnum: customer_payment.getLineItemValue('apply', 'refnum', i)
			};

			result.invoices.push(invoice);
		}

		if (result.invoices.length)
		{
			var invoices_info = Application.getModel('Receipts').list({
					type: 'invoice'
				,	internalid: _.pluck(result.invoices, 'internalid')
			});

			_.each(result.invoices, function(invoice)
			{
				invoice = _.extend(invoice, _.findWhere(invoices_info, {internalid: invoice.internalid}));
				
				invoice.discountapplies = (invoice.due === invoice.total) && (invoice.discdate && stringtodate(invoice.discdate) >= new Date());
				invoice.discount = invoice.discamt ? Math.round(invoice.discamt / invoice.total * 100) : 0;
				invoice.discount_formatted = invoice.discount + '%';

				var amount = invoice.due - (invoice.discountapplies ? invoice.discamt : 0);
				invoice.amount = amount;
				invoice.amount_formatted = formatCurrency(amount);
				invoice.duewithdiscount = invoice.amount;
				invoice.duewithdiscount_formatted = invoice.amount_formatted;

			});
		}


		return result;
	}

,	setCreditMemos: function(customer_payment, result)
	{
		'use strict';
		
		result.creditmemos = [];
		result.creditmemosremaining = 0;

		for (var i = 1; i <= customer_payment.getLineItemCount('credit') ; i++)
		{
			var creditmemo = {
					internalid: customer_payment.getLineItemValue('credit', 'internalid', i)
				,	type: customer_payment.getLineItemValue('credit', 'type', i)
				,	total: toCurrency(customer_payment.getLineItemValue('credit', 'total', i))
				,	total_formatted: formatCurrency(customer_payment.getLineItemValue('credit', 'total', i))
				,	apply: customer_payment.getLineItemValue('credit', 'apply', i) === 'T'
				,	currency: customer_payment.getLineItemValue('apply', 'currency', i)
				,	amount: customer_payment.getLineItemValue('apply', 'amount', i)
				,	due: toCurrency(customer_payment.getLineItemValue('credit', 'due', i))
				,	due_formatted: formatCurrency(customer_payment.getLineItemValue('credit', 'due', i))
				,	refnum: customer_payment.getLineItemValue('credit', 'refnum', i)
			};
			result.creditmemosremaining += creditmemo.due;
		//	result.creditmemos.push(creditmemo);
		}

		result.creditmemosremaining_formatted = formatCurrency(result.creditmemosremaining);

		return result;
	}


,	setDeposits: function(customer_payment, result)
	{
		'use strict';
		
		result.deposits = [];
		result.depositsremaining = 0;

		for (var i = 1; i <= customer_payment.getLineItemCount('deposit') ; i++)
		{
			var deposit = {
					internalid: customer_payment.getLineItemValue('deposit', 'internalid', i)
				,	total: toCurrency(customer_payment.getLineItemValue('deposit', 'total', i))
				,	total_formatted: formatCurrency(customer_payment.getLineItemValue('deposit', 'total', i))
				,	apply: customer_payment.getLineItemValue('deposit', 'apply', i) === 'T'
				,	currency: customer_payment.getLineItemValue('deposit', 'currency', i)
				,	depositdate: customer_payment.getLineItemValue('deposit', 'depositdate', i)
				,	remaining: toCurrency(customer_payment.getLineItemValue('deposit', 'remaining', i))
				,	remaining_formatted: formatCurrency(customer_payment.getLineItemValue('deposit', 'remaining', i))
				,	refnum: customer_payment.getLineItemValue('deposit', 'refnum', i)
			};

			result.depositsremaining += deposit.remaining;
		//	result.deposits.push(deposit);
		}

		result.depositsremaining_formatted = formatCurrency(result.depositsremaining);

		return result;
	}

,	update: function(payment_record, data)
	{
		'use strict';

		var self = this
		,	invoices = data.invoices
		,	Address = Application.getModel('Address')
		,	selected_address = Address.get(data.billaddress)
		,	credit_card = data.paymentmethods[0].creditcard;

		customer.updateCreditCard({
			internalid: credit_card.internalid
		,	ccdefault: 'T'
		});

		payment_record.setFieldValue('payment', data.payment);
		payment_record.setFieldValue('ccstreet', selected_address.addr1);
		payment_record.setFieldValue('cczipcode', selected_address.zip);

		for (var i = 1; i <= payment_record.getLineItemCount('apply'); i++)
		{
			var invoice = _.findWhere(invoices, {
				internalid: payment_record.getLineItemValue('apply', 'internalid', i)
			});

			if (invoice && invoice.apply)
			{
				payment_record.setLineItemValue('apply', 'apply', i, 'T');
				payment_record.setLineItemValue('apply', 'amount', i, invoice.amount);

				invoice.due = payment_record.getLineItemValue('apply', 'due', i);
				invoice.total = payment_record.getLineItemValue('apply', 'total', i);
				invoice.discdate = payment_record.getLineItemValue('apply', 'discdate', i);
				invoice.discamt = payment_record.getLineItemValue('apply', 'discamt', i);
				invoice.discountapplies = (invoice.due === invoice.total) && (invoice.discdate && stringtodate(invoice.discdate) >= new Date());
				invoice.duewithdiscount = invoice.due - (invoice.discountapplies ? invoice.discamt : 0);
				
				if (self._isPayFull(invoice) && invoice.discountapplies && invoice.discamt)
				{
					payment_record.setLineItemValue('apply', 'disc', i, invoice.discamt);
				}
			}
		}

		payment_record.setFieldValue('paymentmethod', credit_card.paymentmethod.internalid);

		if (credit_card.ccsecuritycode)
		{
			payment_record.setFieldValue('ccsecuritycode', credit_card.ccsecuritycode);
		}

		return payment_record;

	}

,	_isPayFull: function(invoice)
	{
		'use strict';
		
		if (invoice.discountapplies)
		{
			return invoice.amount === invoice.duewithdiscount;
		}
		else
		{
			return invoice.amount === invoice.due;
		}
	}
,	submit: function (data)
	{
		'use strict';
		
		// update record
		var payment_record = this.update(this.create(), data)
		// save record.
		,	payment_record_id = nlapiSubmitRecord(payment_record)
		// create new record to next payment.
		,	new_payment_record = this.get();

		// send confirmation 
		new_payment_record.confirmation = Application.getModel('Payment').get(payment_record_id);

		return new_payment_record;
	}

});


//Deposit.js

Application.defineModel('Deposit', {

	get: function (id)
	{
		'use strict';

		var deposit = nlapiLoadRecord('customerdeposit', id)
		,	result = {};

		this.createRecord(deposit, result);
		this.setInvoices(deposit, result);
		this.setPaymentMethod(deposit, result);

		return result;
	}

,	createRecord: function(record, result)
	{
		'use strict';

		result.internalid = record.getId();
		result.tranid = record.getFieldValue('tranid');
		result.payment = toCurrency(record.getFieldValue('payment'));
		result.payment_formatted = formatCurrency(record.getFieldValue('payment'));
		result.trandate = record.getFieldValue('trandate');
		result.status = record.getFieldValue('status');
		result.memo = record.getFieldValue('memo');
	}

,	setInvoices: function(record, result)
	{
		'use strict';
		
		result.invoices = [];
		var invoicesTotal = 0;
		
		for (var i = 1; i <= record.getLineItemCount('apply'); i++)
		{
			var invoice = {
					line: i
				,	invoice_id: record.getLineItemValue('apply', 'id2', i)
				,	deposit_id: record.getLineItemValue('apply', 'id', i)

				,	type: record.getLineItemValue('apply', 'type', i)
				,	total: toCurrency(record.getLineItemValue('apply', 'total', i))
				,	total_formatted: formatCurrency(record.getLineItemValue('apply', 'total', i))

				,	invoicedate: record.getLineItemValue('apply', 'applydate', i)
				,	depositdate: record.getLineItemValue('apply', 'depositdate', i)

				,	currency: record.getLineItemValue('apply', 'currency', i)
				,	amount: toCurrency(record.getLineItemValue('apply', 'amount', i))
				,	amount_formatted: formatCurrency(record.getLineItemValue('apply', 'amount', i))
				,	due: toCurrency(record.getLineItemValue('apply', 'due', i))
				,	due_formatted: formatCurrency(record.getLineItemValue('apply', 'due', i))
				,	refnum: record.getLineItemValue('apply', 'refnum', i)
			};
			
			invoicesTotal += invoice.amount;
			result.invoices.push(invoice);
		}

		result.paid = toCurrency(invoicesTotal);
		result.paid_formatted = formatCurrency(invoicesTotal);
		result.remaining = toCurrency(result.payment - result.paid);
		result.remaining_formatted = formatCurrency(result.remaining);
	}

,	setPaymentMethod: function (record, result)
	{
		'use strict';

		var paymentmethod = {
			type: record.getFieldValue('paymethtype')
		,	primary: true
		};

		if (paymentmethod.type === 'creditcard')
		{
			paymentmethod.creditcard = {
				ccnumber: record.getFieldValue('ccnumber')
			,	ccexpiredate: record.getFieldValue('ccexpiredate')
			,	ccname: record.getFieldValue('ccname')
			,	paymentmethod: {
					ispaypal: 'F'
				,	name: record.getFieldText('paymentmethod')
				,	creditcard: 'T'
				,	internalid: record.getFieldValue('paymentmethod')
				}
			};
		}

		if (record.getFieldValue('ccstreet'))
		{
			paymentmethod.ccstreet = record.getFieldValue('ccstreet');
		}

		if (record.getFieldValue('cczipcode'))
		{
			paymentmethod.cczipcode = record.getFieldValue('cczipcode');
		}

		if (record.getFieldValue('terms'))
		{
			paymentmethod.type = 'invoice';

			paymentmethod.purchasenumber = record.getFieldValue('otherrefnum');

			paymentmethod.paymentterms = {
					internalid: record.getFieldValue('terms')
				,	name: record.getFieldText('terms')
			};
		}

		result.paymentmethods = [paymentmethod];
	}

,	list: function ()
	{
		'use strict';

		var filters = [
				//new nlobjSearchFilter('mainline', null, 'is', 'F')
				new nlobjSearchFilter('status', null, 'is', ['CustDep:A', 'CustDep:B'])
			,	new nlobjSearchFilter('salesorder', null, 'is', '@NONE@')
			// ,	new nlobjSearchFilter('customer', null, 'is', nlapiGetUser())
			]

		,	columns = [
				new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('amount')
			,	new nlobjSearchColumn('amountpaid')
			,	new nlobjSearchColumn('statusref')
			,	new nlobjSearchColumn('datecreated')
			,	new nlobjSearchColumn('salesorder')

			,	new nlobjSearchColumn('salesorder')
			,	new nlobjSearchColumn('mainline')
			]

		,	isMultiCurrency = context.getFeature('MULTICURRENCY');

		if (isMultiCurrency)
		{
			columns.push(new nlobjSearchColumn('currency'));
		}

		var settings_site_id = session.getSiteSettings(['siteid'])
		,	site_id = settings_site_id && settings_site_id.siteid;

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && site_id)
		{
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [site_id, '@NONE@']));
		}

		var result = Application.getAllSearchResults('customerdeposit', filters, columns)

		// TODO: I don't like this 
		// TODO: Me neither
		,	records = _.map(JSON.parse(JSON.stringify(result)), function (record)
			{
				_.extend(record, record.columns);
				delete record.columns;

				record.internalid = record.id;
				delete record.id;

				// Legacy attributes
				record.date = record.datecreated;
				record.order_number = record.tranid;
				record.summary = {
					total: toCurrency(record.amount)
				,	total_formatted: formatCurrency(record.amount)
				};
				
				return record;
			})

		,	split = _.groupBy(records, function(deposit)
			{
				return deposit.mainline === '*' || deposit.mainline === 'T';
			})

		,	mainlines = split.true || []

		,	amountpaid = split.false || [];

		amountpaid.forEach(function (deposit)
		{
			var mainline = _.findWhere(mainlines, { internalid: deposit.internalid });
			if (mainline)
			{
				mainline.amountpaid = deposit.amountpaid;
				mainline.amountremaining = deposit.amount - deposit.amountpaid;
				mainline.amounttopaid = mainline.amountremaining;
				mainline.amountremaining_formatted = formatCurrency(mainline.amountremaining);
			}
		});

		result = mainlines;

		return result;
	}
});

//DepositApplication.js
Application.defineModel('DepositApplication', {

	get: function (id)
	{
		'use strict';

		var record = nlapiLoadRecord('depositapplication', id)
		,	result = {};

		this.createResult(record, result);
		this.setInvoices(record, result);

		return result;
	}

,	createResult: function(record, result)
	{
		'use strict';

		result.internalid = record.getId();
		result.tranid = record.getFieldValue('tranid');
		result.total = toCurrency(record.getFieldValue('total'));
		result.total_formatted = formatCurrency(record.getFieldValue('total'));

		result.deposit =
		{
			internalid: record.getFieldValue('deposit')
		,	name: record.getFieldText('deposit')
		};

		result.depositdate = record.getFieldValue('depositdate');
		result.trandate = record.getFieldValue('trandate');
		result.memo = record.getFieldValue('memo');
	}

,	setInvoices: function(record, result)
	{
		'use strict';
		
		result.invoices = [];
		
		for (var i = 1; i <= record.getLineItemCount('apply'); i++)
		{
			var invoice = {
					line: i
				,	internalid: record.getLineItemValue('apply', 'internalid', i)
				,	type: record.getLineItemValue('apply', 'type', i)
				,	total: toCurrency(record.getLineItemValue('apply', 'total', i))
				,	total_formatted: formatCurrency(record.getLineItemValue('apply', 'total', i))
				,	apply: record.getLineItemValue('apply', 'apply', i) === 'T'
				,	applydate: record.getLineItemValue('apply', 'applydate', i)
				,	currency: record.getLineItemValue('apply', 'currency', i)
				,	amount: toCurrency(record.getLineItemValue('apply', 'amount', i))
				,	amount_formatted: formatCurrency(record.getLineItemValue('apply', 'amount', i))
				,	due: toCurrency(record.getLineItemValue('apply', 'due', i))
				,	due_formatted: formatCurrency(record.getLineItemValue('apply', 'due', i))
				,	refnum: record.getLineItemValue('apply', 'refnum', i)
			};
			
			result.invoices.push(invoice);
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



//TransactionHistory.js
Application.defineModel('TransactionHistory', {

	search: function (data)
	{
		'use strict';

		var types = ['CustCred', 'CustDep', 'DepAppl', 'CustPymt', 'CustInvc']

		,	amount_field = context.getFeature('MULTICURRENCY') ? 'fxamount' : 'amount'

		,	filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			]

		,	columns = [
				new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('total')
			,	new nlobjSearchColumn(amount_field)
			];

		switch (data.filter)
		{
			case 'creditmemo':
				types = ['CustCred'];
			break;

			case 'customerpayment':
				types = ['CustPymt'];
			break;

			case 'customerdeposit':
				types = ['CustDep'];
			break;

			case 'depositapplication':
				types = ['DepAppl'];
			break;

			case 'invoice':
				types = ['CustInvc'];
			break;
		}

		filters.push(new nlobjSearchFilter('type', null, 'anyof', types));

		if (data.from && data.to)
		{
			var offset = new Date().getTimezoneOffset() * 60 * 1000;

			filters.push(new nlobjSearchFilter('trandate', null, 'within', new Date(parseInt(data.from, 10) + offset), new Date(parseInt(data.to, 10) + offset)));
		}

		switch (data.sort)
		{
			case 'number':
				columns[2].setSort(data.order >= 0);
			break;

			case 'amount':
				columns[5].setSort(data.order >= 0);
			break;

			default:
				columns[0].setSort(data.order > 0);
				columns[1].setSort(data.order > 0);
		}

		var result = Application.getPaginatedSearchResults('transaction', filters, columns, data.page || 1, 200);

		result.records = _.map(result.records, function (record)
		{
			return {
				recordtype: record.getRecordType()
			,	internalid: record.getValue('internalid')
			,	tranid: record.getValue('tranid')
			,	trandate: record.getValue('trandate')
			,	status: record.getText('status')
			,	amount: toCurrency(record.getValue(amount_field))
			,	amount_formatted: formatCurrency(record.getValue(amount_field))
			};
		});

		return result;
	}
});


//PrintStatement.js
Application.defineModel('PrintStatement', {

	getUrl: function(data)
	{
		'use strict';
		var customerId = customer.getFieldValues(['internalid']).internalid
		,	offset = new Date().getTimezoneOffset() * 60 * 1000
		,	statementDate = null
		,	startDate = null
		,	openOnly = data.openOnly ? 'T' : 'F'
		,	inCustomerLocale = data.inCustomerLocale ? 'T' : 'F'
		,	consolidatedStatement = data.consolidatedStatement ? 'T' : 'F'
		,	statementTimestamp = parseInt(data.statementDate,10)
		,	startDateParam = data.startDate
		,	startTimestamp = parseInt(startDateParam,10)
		,	email = data.email
		,	baseUrl = email ? '/app/accounting/transactions/email.nl' : '/app/accounting/print/NLSPrintForm.nl'
		,	url = baseUrl + '?submitted=T&printtype=statement&currencyprecision=2&formdisplayview=NONE&type=statement';

		if(isNaN(statementTimestamp) || (startDateParam && isNaN(startTimestamp))){
			throw {
				status: 500
			,	code: 'ERR_INVALID_DATE_FORMAT'
			,	message: 'Invalid date format'
			};
		}

		statementDate = nlapiDateToString(new Date(statementTimestamp + offset));
		startDate = startDateParam ? nlapiDateToString(new Date(startTimestamp + offset)) : null;

		url += '&customer=' + customerId;
		url += startDate ? ('&start_date=' + startDate) : '';
		url += '&statement_date=' +  statementDate;
		url += '&consolstatement=' + consolidatedStatement;
		url += '&openonly=' + openOnly;
		url += '&incustlocale=' + inCustomerLocale;

		return url;
	}
});

