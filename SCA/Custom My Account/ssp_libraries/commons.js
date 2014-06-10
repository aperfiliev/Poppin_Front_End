/*global Application:true, console:true, request:false, nlapiLogExecution:false, nlapiCreateError:false, nlapiCreateSearch:false, response:false, nlobjError:false, HOSTS:false */

// Create server side console
// use to log on SSP application
if (typeof console === 'undefined') {
    console = {};
}

(function ()
{
	'use strict';

	// Pass these methods through to the console if they exist, otherwise just
	// fail gracefully. These methods are provided for convenience.
	var console_methods = 'assert clear count debug dir dirxml exception group groupCollapsed groupEnd info log profile profileEnd table time timeEnd trace warn'.split(' ')
	,	idx = console_methods.length
	,	noop = function(){};

	while (--idx >= 0)
	{
		var method = console_methods[idx];

		if (typeof console[method] === 'undefined')
		{
			console[method] = noop;
		}
	}

	if (typeof console.memory === 'undefined')
	{
		console.memory = {};
	}

	_.each({'log': 'DEBUG', 'info': 'AUDIT', 'error': 'EMERGENCY', 'warn': 'ERROR'}, function (value, key)
	{
		console[key] = function ()
		{
			nlapiLogExecution(value, arguments.length > 1 ? arguments[0] : '', arguments.length > 1 ? arguments[1] : arguments[0] || 'null' );
		};
	});

	_.extend(console, {

		timeEntries: []

	,	time: function (text)
		{
			if (typeof text === 'string')
			{
				console.timeEntries[text] = Date.now();
			}
		}

	,	timeEnd: function (text)
		{
			if (typeof text === 'string')
			{
				if (!arguments.length)
				{
					console.warn('TypeError:', 'Not enough arguments');
				}
				else
				{
					if (typeof console.timeEntries[text] !== 'undefined')
					{
						console.log(text + ':', Date.now() - console.timeEntries[text] + 'ms');
						delete console.timeEntries[text];
					}
				}
			}
		}
	});
}());

// Backbone.Events
// -----------------
// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback functions
// to an event; trigger`-ing an event fires all callbacks in succession.
//
//     var object = {};
//     _.extend(object, Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');

var slice = Array.prototype.slice
	// Regular expression used to split event strings
,	eventSplitter = /\s+/;

var Events = {

	// Bind one or more space separated events, `events`, to a `callback`
	// function. Passing `"all"` will bind the callback to all events fired.
	on: function(events, callback, context) {
		'use strict';

		var calls, event, node, tail, list;

		if (!callback)
		{
			return this;
		}

		events = events.split(eventSplitter);
		calls = this._callbacks || (this._callbacks = {});

		// Create an immutable callback list, allowing traversal during
		// modification.  The tail is an empty object that will always be used
		// as the next node.
		while (!!(event = events.shift())) {
			list = calls[event];
			node = list ? list.tail : {};
			node.next = tail = {};
			node.context = context;
			node.callback = callback;
			calls[event] = {tail: tail, next: list ? list.next : node};
		}

		return this;
	},

	// Remove one or many callbacks. If `context` is null, removes all callbacks
	// with that function. If `callback` is null, removes all callbacks for the
	// event. If `events` is null, removes all bound callbacks for all events.
	off: function(events, callback, context) {
		'use strict';
		var event, calls, node, tail, cb, ctx;

		// No events, or removing *all* events.
		if (!(calls = this._callbacks))
		{
			return;
		}

		if (!(events || callback || context)) {
			delete this._callbacks;
			return this;
		}

		// Loop through the listed events and contexts, splicing them out of the
		// linked list of callbacks if appropriate.
		events = events ? events.split(eventSplitter) : _.keys(calls);
		while (!!(event = events.shift())) {
			node = calls[event];
			delete calls[event];

			if (!node || !(callback || context))
			{
				continue;
			}

			// Create a new list, omitting the indicated callbacks.
			tail = node.tail;
			while ((node = node.next) !== tail) {
				cb = node.callback;
				ctx = node.context;
				if ((callback && cb !== callback) || (context && ctx !== context)) {
					this.on(event, cb, ctx);
				}
			}
		}

		return this;
	},

	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	trigger: function(events) {
		'use strict';

		var event, node, calls, tail, args, all, rest;
		if (!(calls = this._callbacks))
		{
			return this;
		}
		all = calls.all;
		events = events.split(eventSplitter);
		rest = slice.call(arguments, 1);

		// For each event, walk through the linked list of callbacks twice,
		// first to trigger the event, then to trigger any `"all"` callbacks.
		while (!!(event = events.shift())) {
			if (!!(node = calls[event])) {
				tail = node.tail;
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, rest);
				}
			}
			if (!!(node = all)) {
				tail = node.tail;
				args = [event].concat(rest);
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, args);
				}
			}
		}

		return this;
	}
};

// Aliases for backwards compatibility.
Events.bind = Events.on;
Events.unbind = Events.off;

// This sands for SuiteCommerce
var SC = {};

var Application = _.extend({

	originalModels: {}

,	extendedModels: {}

,	init: function () {}

,	getEnvironment: function (session, request)
	{
		'use strict';
		// Sets Default environment variables
		var context = nlapiGetContext();
		var siteSettings = session.getSiteSettings(['currencies', 'languages'])
		,	result = {
				baseUrl: session.getAbsoluteUrl(request.getURL().indexOf('https:') === 0 ? 'checkout' : 'shopping', '/{{file}}')
			,	currentHostString: request.getURL().match('http(s?)://(.*)/')[2]
			,	availableHosts: typeof HOSTS !== 'undefined' ? HOSTS : []
			,	availableLanguages: siteSettings.languages || []
			,	availableCurrencies: siteSettings.currencies || []
			,	companyId: context.getCompany()
			};

		// If there are hosts asociated in the site we iterate them to check which we are in
		// and which languga and currency we are in
		if (result.availableHosts.length)
		{
			for (var i = 0; i < result.availableHosts.length; i++)
			{
				var host = result.availableHosts[i];
				if (host.languages && host.languages.length)
				{
					// looks for the language match
					for (var n = 0; n < host.languages.length; n++)
					{
						var language = host.languages[n];

						if (language.host === result.currentHostString)
						{
							// if we found the language we mark the host and the language and we brake
							result = _.extend(result, {
								currentHost: host
							,	currentLanguage: language
							});

							// Enhaces the list of languages with the info provided by the site settings
							var available_languages_object = _.object(_.pluck(result.availableLanguages, 'locale'), result.availableLanguages);

							result.availableLanguages = [];
							_.each(host.languages, function(language)
							{
								result.availableLanguages.push(_.extend({}, language, available_languages_object[language.locale]));
							});

							break;
						}
					}
				}

				if (result.currentHost)
				{
					//////////////////////////////////////////////////////////////
					// Set the availavle currency based on the hosts currencies //
					//////////////////////////////////////////////////////////////
					var available_currencies_object = _.object(_.pluck(result.availableCurrencies, 'code'), result.availableCurrencies);

					result.availableCurrencies = [];
					_.each(host.currencies, function(currency)
					{
						result.availableCurrencies.push(_.extend({}, currency, available_currencies_object[currency.code]));
					});

					break;
				}
			}
		}

		//////////////////////////////////////
		// Sets the Currency of the shopper //
		//////////////////////////////////////
		var currency_codes = _.pluck(result.availableCurrencies, 'code');

		// there is a code passed in and it's on the list lets use it
		if (request.getParameter('cur') && ~currency_codes.indexOf(request.getParameter('cur')))
		{
			result.currentCurrency = _.find(result.availableCurrencies, function (currency)
			{
				return currency.code === request.getParameter('cur');
			});
		}
		// The currency of the current user is valid fot this host let's just use that
		else if (session.getShopperCurrency().code && ~currency_codes.indexOf(session.getShopperCurrency().code))
		{
			result.currentCurrency = _.find(result.availableCurrencies, function (currency)
			{
				return currency.code === session.getShopperCurrency().code;
			});
		}
		else if (result.availableCurrencies && result.availableCurrencies.length)
		{
			result.currentCurrency = _.find(result.availableCurrencies, function (currency)
			{
				return currency.isdefault === 'T';
			});
		}
		// We should have result.currentCurrency setted by now
		result.currentCurrency && session.setShopperCurrency(result.currentCurrency.internalid);

		result.currentCurrency = _.find(result.availableCurrencies, function (currency)
		{
			return currency.code === session.getShopperCurrency().code;
		});

		///////////////////////////////////////
		// Sets the Lengugage in the Shopper //
		///////////////////////////////////////
		if (!result.currentLanguage)
		{
			var shopper_preferences = session.getShopperPreferences()
			,	shopper_locale = shopper_preferences.language.locale
			,	locales = _.pluck(result.availableLanguages, 'locale');

			if (request.getParameter('lang') && ~locales.indexOf(request.getParameter('lang')))
			{
				result.currentLanguage = _.find(result.availableLanguages, function (language)
				{
					return language.locale === request.getParameter('lang');
				});
			}
			else if (shopper_locale && ~locales.indexOf(shopper_locale))
			{
				result.currentLanguage = _.find(result.availableLanguages, function (language)
				{
					return language.locale === shopper_locale;
				});
			}
			else if (result.availableLanguages && result.availableLanguages.length)
			{
				result.currentLanguage = _.find(result.availableLanguages, function (language)
				{
					return language.isdefault === 'T';
				});
			}
		}

		// We should have result.currentLanguage setted by now
		result.currentLanguage && session.setShopperLanguageLocale(result.currentLanguage.locale);

		// Shopper Price Level
		result.currentPriceLevel = session.getShopperPriceLevel().internalid ? session.getShopperPriceLevel().internalid : session.getSiteSettings(['defaultpricelevel']).defaultpricelevel;

		return result;
	}

,	getPermissions: function ()
	{
		'use strict';
		var context = nlapiGetContext();
		return	{
			transactions:
			{
					tranCashSale : context.getPermission('TRAN_CASHSALE')
				,	tranCustCred : context.getPermission('TRAN_CUSTCRED')
				,	tranCustDep : context.getPermission('TRAN_CUSTDEP')
				,	tranCustPymt : context.getPermission('TRAN_CUSTPYMT')
				,	tranStatement : context.getPermission('TRAN_STATEMENT')
				,	tranCustInvc : context.getPermission('TRAN_CUSTINVC')
				,	tranItemShip : context.getPermission('TRAN_ITEMSHIP')
				,	tranSalesOrd : context.getPermission('TRAN_SALESORD')
				,	tranEstimate : context.getPermission('TRAN_ESTIMATE')
				,	tranRtnAuth : context.getPermission('TRAN_RTNAUTH')
				,	tranDepAppl : context.getPermission('TRAN_DEPAPPL')
				,	tranSalesOrdFulfill : context.getPermission('TRAN_SALESORDFULFILL')
				,	tranFind: context.getPermission('TRAN_FIND')
			}
		,	lists:
			{
					regtAcctRec: context.getPermission('REGT_ACCTREC')
				,	regtNonPosting: context.getPermission('REGT_NONPOSTING')
				,	listCase: context.getPermission('LIST_CASE')
                ,	listContact: context.getPermission('LIST_CONTACT')
                ,	listCustJob: context.getPermission('LIST_CUSTJOB')
                ,	listCompany: context.getPermission('LIST_COMPANY')
                ,	listIssue: context.getPermission('LIST_ISSUE')
                ,	listCustProfile: context.getPermission('LIST_CUSTPROFILE')
                ,	listExport: context.getPermission('LIST_EXPORT')
                ,	listFind: context.getPermission('LIST_FIND')
                ,	listCrmMessage: context.getPermission('LIST_CRMMESSAGE')
			}
		};
	}

,	wrapFunctionWithEvents: function (methodName, thisObj, fn)
	{
		'use strict';

		return _.wrap(fn, function (func)
		{
			// Gets the arguments passed to the function from the execution code (removes func from arguments)
			var args = _.toArray(arguments).slice(1);

			// Fires the 'before:ObjectName.MethodName' event most common 'before:Model.method'
			Application.trigger.apply(Application, ['before:' + methodName, thisObj].concat(args));

			// Executes the real code of the method
			var result = func.apply(thisObj, args);

			// Fires the 'before:ObjectName.MethodName' event adding result as 1st parameter
			Application.trigger.apply(Application, ['after:' + methodName, thisObj, result].concat(args));

			// Returns the result from the execution of the real code, modifications may happend in the after event
			return result;
		});
	}

,	defineModel: function (name, definition)
	{
		'use strict';

		Application.originalModels[name] = definition;
	}

,	pushToExtendedModels: function (name)
	{
		'use strict';

		var model = {};

		_.each(Application.originalModels[name], function (value, key)
		{
			if (typeof value === 'function')
			{
				model[key] = Application.wrapFunctionWithEvents(name + '.' + key, model, value);
			}
			else
			{
				model[key] = value;
			}
		});

		if (!model.validate)
		{
			model.validate = Application.wrapFunctionWithEvents(name + '.validate', model, function (data)
			{
				if (this.validation)
				{
					var validator = _.extend({
							validation: this.validation
						,	attributes: data
						}, Backbone.Validation.mixin)

					,	invalidAttributes = validator.validate();

					if (!validator.isValid())
					{
						throw {
							status: 400
						,	code: 'ERR_BAD_REQUEST'
						,	message: invalidAttributes
						};
					}
				}
			});
		}

		Application.extendedModels[name] = model;
	}

,	extendModel: function (name, extensions)
	{
		'use strict';

		if (Application.originalModels[name])
		{
			if (!Application.extendedModels[name])
			{
				Application.pushToExtendedModels(name);
			}

			var model = Application.extendedModels[name];

			_.each(extensions, function (value, key)
			{
			    if (typeof value === 'function')
			    {
			        model[key] = Application.wrapFunctionWithEvents(name + '.' + key, model, value);
			    }
			    else
			    {
			        model[key] = value;
			    }
			});
		}
		else
		{
			throw nlapiCreateError('APP_ERR_UNKNOWN_MODEL', 'The model ' + name + ' is not defined');
		}
	}

,	getModel: function (name)
	{
		'use strict';

		if (Application.originalModels[name])
		{
			if (!Application.extendedModels[name])
			{
				Application.pushToExtendedModels(name);
			}

			return Application.extendedModels[name];
		}
		else
		{
			throw nlapiCreateError('APP_ERR_UNKNOWN_MODEL', 'The model ' + name + ' is not defined');
		}

	}

,	sendContent: function (content, options)
	{
		'use strict';

		// Default options
		options = _.extend({status: 200, cache: false}, options || {});

		// Triggers an event for you to know that there is content being sent
		Application.trigger('before:Application.sendContent', content, options);

		// We set a custom status
		response.setHeader('Custom-Header-Status', parseInt(options.status, 10).toString());

		// The content type will be here
		var content_type = false;

		// If its a complex object we transform it into an string
		if (_.isArray(content) || _.isObject(content))
		{
			content_type = 'JSON';
			content = JSON.stringify( content );
		}

		// If you set a jsonp callback this will honor it
		if (request.getParameter('jsonp_callback'))
		{
			content_type = 'JAVASCRIPT';
			content = request.getParameter('jsonp_callback') + '(' + content + ');';
		}

		//Set the response chache option
		if (options.cache)
		{
			response.setCDNCacheable(options.cache);
		}

		// Content type was set so we send it
		content_type && response.setContentType(content_type);

		response.write(content);

		Application.trigger('after:Application.sendContent', content, options);
	}

,	processError: function (e)
	{
		'use strict';

		var status = 500
		,	code = 'ERR_UNEXPECTED'
		,	message = 'error';

		if (e instanceof nlobjError)
		{
			code = e.getCode();
			message = e.getDetails();
		}
		else if (_.isObject(e) && !_.isUndefined(e.status))
		{
			status = e.status;
			code = e.code;
			message = e.message;
		}
		else
		{
			var error = nlapiCreateError(e);
			code = error.getCode();
			message = (error.getDetails() !== '') ? error.getDetails() : error.getCode();
		}

		if(status === 500 && code == 'INSUFFICIENT_PERMISSION'){
			status = forbiddenError.status;
			code = forbiddenError.code;
			message = forbiddenError.message;
		}

		var content = {
			errorStatusCode: parseInt(status,10).toString()
		,	errorCode: code
		,	errorMessage: message
		};

		if (e.errorDetails)
		{
			content.errorDetails = e.errorDetails;
		}

		return content;
	}

,	sendError: function (e)
	{
		'use strict';

		Application.trigger('before:Application.sendError', e);

		var content = Application.processError(e)
		,	content_type = 'JSON';

		response.setHeader('Custom-Header-Status', content.errorStatusCode);

		if (request.getParameter('jsonp_callback'))
		{
			content_type = 'JAVASCRIPT';
			content = request.getParameter('jsonp_callback') + '(' + JSON.stringify(content) + ');';
		}
		else
		{
			content = JSON.stringify(content);
		}

		response.setContentType(content_type);

		response.write(content);

		Application.trigger('after:Application.sendError', e);
	}

,	getPaginatedSearchResults: function (record_type, filters, columns, page, results_per_page)
	{
		'use strict';

		var range_start = (page * results_per_page) - results_per_page
		,	range_end = page * results_per_page
		,	doRealCount = _.any(columns, function (column)
			{
				return column.getSummary();
			})
		,	result = {
				page: page,
				recordsPerPage: results_per_page
			};

		/// Performs a count search by the internal id
		if (!doRealCount)
		{
			var cuontSearch = nlapiCreateSearch(record_type, filters, [new nlobjSearchColumn('internalid', null, 'count')])
			,	cuontSearchRan = cuontSearch.runSearch();

			result.totalRecordsFound = parseInt(cuontSearchRan.getResults(0, 1)[0].getValue('internalid', null, 'count'), 10);
		}

		result.records = [];

		if (doRealCount || (result.totalRecordsFound > 0 && result.totalRecordsFound > range_start))
		{
			var search = nlapiCreateSearch(record_type, filters, columns)
			,	searchRan = search.runSearch();

			if (doRealCount)
			{
				result.totalRecordsFound = searchRan.getResults(0, 1000).length;
			}

			result.records = searchRan.getResults(0, result.totalRecordsFound);
		}

		return result;
	}

,	getAllSearchResults: function (record_type, filters, columns)
	{
		'use strict';

		var search = nlapiCreateSearch(record_type, filters, columns);
		search.setIsPublic(true);

		var searchRan = search.runSearch()
		,	bolStop = false
		,	intMaxReg = 1000
		,	intMinReg = 0
		,	result = [];

		while (!bolStop && nlapiGetContext().getRemainingUsage() > 10)
		{
			// First loop get 1000 rows (from 0 to 1000), the second loop starts at 1001 to 2000 gets another 1000 rows and the same for the next loops
			var extras = searchRan.getResults(intMinReg, intMaxReg);

			result = Application.searchUnion(result, extras);
			intMinReg = intMaxReg;
			intMaxReg += 1000;
			// If the execution reach the the last result set stop the execution
			if (extras.length < 1000)
			{
				bolStop = true;
			}
		}

		return result;
	}

,	searchUnion: function (target,array)
	{
		'use strict';

		return target.concat(array);
	}

}, Events);

// Utilities
function getItemOptionsObject (options_string)
{
	'use strict';

	var options_object = [];

	if (options_string && options_string !== '- None -')
	{
		var split_char_3 = String.fromCharCode(3)
		,	split_char_4 = String.fromCharCode(4);

		_.each(options_string.split(split_char_4), function (option_line)
		{
			option_line = option_line.split(split_char_3);
			options_object.push({
				id: option_line[0]
			,	name: option_line[2]
			,	value: option_line[3]
			,	displayvalue: option_line[4]
			,	mandatory: option_line[1]
			});
		});
	}

	return options_object;
}

function formatCurrency (value, symbol)
{
	'use strict';
	var value_float = parseFloat(value);

	if (isNaN(value_float))
	{
		value_float = parseFloat(0); //return value;
	}

	var negative = value_float < 0;
	value_float = Math.abs(value_float);
	value_float = parseInt((value_float + 0.005) * 100, 10) / 100;

	var value_string = value_float.toString()

	,	groupseparator = ','
	,	decimalseparator = '.'
	,	negativeprefix = '('
	,	negativesuffix = ')'
	,	settings = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings ? SC.ENVIRONMENT.siteSettings : {};

	if (window.hasOwnProperty('groupseparator'))
	{
		groupseparator = window.groupseparator;
	}
	else if (settings.hasOwnProperty('groupseparator'))
	{
		groupseparator = settings.groupseparator;
	}

	if (window.hasOwnProperty('decimalseparator'))
	{
		decimalseparator = window.decimalseparator;
	}
	else if (settings.hasOwnProperty('decimalseparator'))
	{
		decimalseparator = settings.decimalseparator;
	}

	if (window.hasOwnProperty('negativeprefix'))
	{
		negativeprefix = window.negativeprefix;
	}
	else if (settings.hasOwnProperty('negativeprefix'))
	{
		negativeprefix = settings.negativeprefix;
	}

	if (window.hasOwnProperty('negativesuffix'))
	{
		negativesuffix = window.negativesuffix;
	}
	else if (settings.hasOwnProperty('negativesuffix'))
	{
		negativesuffix = settings.negativesuffix;
	}

	value_string = value_string.replace('.',decimalseparator);
	var decimal_position = value_string.indexOf(decimalseparator);

	// if the string doesn't contains a .
	if (!~decimal_position)
	{
		value_string += decimalseparator + '00';
		decimal_position = value_string.indexOf(decimalseparator);
	}
	// if it only contains one number after the .
	else if (value_string.indexOf(decimalseparator) === (value_string.length - 2))
	{
		value_string += '0';
	}

	var thousand_string = '';
	for (var i = value_string.length - 1; i >= 0; i--)
	{
							//If the distance to the left of the decimal separator is a multiple of 3 you need to add the group separator
		thousand_string =	(i > 0 && i < decimal_position && (((decimal_position-i) % 3) === 0) ? groupseparator : '') +
							value_string[i] + thousand_string;
	}

	if (!symbol)
	{
		if (typeof session !== 'undefined' && session.getShopperCurrency){
			symbol = session.getShopperCurrency().symbol;
		}
		else if (settings.shopperCurrency)
		{
			symbol = settings.shopperCurrency.symbol;
		}
		else if (SC && SC.ENVIRONMENT && SC.ENVIRONMENT.currentCurrency)
		{
			symbol = SC.ENVIRONMENT.currentCurrency.symbol;
		}

		if(!symbol)
		{
			symbol = '$';
		}
	}

	value_string  = symbol + thousand_string;

	return negative ? (negativeprefix + value_string + negativesuffix) : value_string;
}


function toCurrency (amount)
{
	'use strict';

	var r = parseFloat(amount);

	return isNaN(r) ? 0 : r;
}

function addAddressToResult (address, result)
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

function setPaymentMethodToResult (record, result)
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
		,	internalid: record.getFieldValue('creditcard')
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

function isLoggedIn ()
{
     // MyAccount (We need to make the following difference because isLoggedIn is always false in Shopping)
     if (request.getURL().indexOf('https') === 0)
     {
         return session.isLoggedIn();
     }
     else // Shopping
     {
         return parseInt(nlapiGetUser() + '', 10) > 0 && !session.getCustomer().isGuest();
     }
}

/// Default error objetcs
var unauthorizedError = {
	status: 401
,	code: 'ERR_USER_NOT_LOGGED_IN'
,	message: 'Not logged In'
};

var forbiddenError = {
	status:403
,	code:'ERR_INSUFFICIENT_PERMISSIONS'
,	message: 'Insufficient permissions'
}

var notFoundError = {
	status: 404
,	code: 'ERR_RECORD_NOT_FOUND'
,	message: 'Not found'
};

var methodNotAllowedError = {
	status: 405
,	code: 'ERR_METHOD_NOT_ALLOWED'
,	message: 'Sorry, You are not allowed to preform this action.'
};

var invalidItemsFieldsAdvancedName = {
	status: 500
,	code:'ERR_INVALID_ITEMS_FIELDS_ADVANCED_NAME'
,	message: 'Please check if the fieldset is created.'
};
