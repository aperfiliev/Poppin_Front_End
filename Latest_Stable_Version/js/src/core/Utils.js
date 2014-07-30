// Utils.js
// --------
// A collection of utility methods
// This are added to both SC.Utils, and Underscore.js
// eg: you could use SC.Utils.formatPhone() or _.formatPhone()
(function ()
{
	'use strict';

	// _.formatPhone:
	// Will try to reformat a phone number for a given phone Format,
	// If no format is given, it will try to use the one in site settings.
	function formatPhone (phone, format)
	{
		// fyi: the tilde (~) its used as !== -1
		var extentionSearch = phone.search(/[A-Za-z#]/)
		,	extention = ~extentionSearch ? ' '+ phone.substring(extentionSearch) : ''
		,	phoneNumber = ~extentionSearch ? ' '+ phone.substring(0, extentionSearch) : phone;
			
		format = format || SC.ENVIRONMENT.siteSettings.phoneformat;
			
		if (/^[0-9()-.\s]+$/.test(phoneNumber) && format)
		{
			var format_tokens = {}
			,	phoneDigits = phoneNumber.replace(/[()-.\s]/g, '');
			
			switch (format)
			{
			// c: country, ab: area_before, aa: area_after, d: digits
			case '(123) 456-7890':
				format_tokens = {c: ' ', ab: '(', aa: ') ', d: '-'};
				break;
			case '123 456 7890':
				format_tokens = {c: ' ', ab: '', aa: ' ', d: ' '};
				break;
			case '123-456-7890':
				format_tokens = {c: ' ', ab: '', aa: '-', d: '-'};
				break;
			case '123.456.7890':
				format_tokens = {c: ' ', ab: '', aa: '.', d: '.'};
				break;
			default:
				return phone;
			}
			
			switch (phoneDigits.length)
			{
			case 7:
				return phoneDigits.substring(0, 3) + format_tokens.d + phoneDigits.substring(3) + extention;
			case 10:
				return format_tokens.ab + phoneDigits.substring(0, 3) + format_tokens.aa + phoneDigits.substring(3, 6) + format_tokens.d + phoneDigits.substring(6) + extention;
			case 11:
				return phoneDigits.substring(0, 1) + format_tokens.c + format_tokens.ab + phoneDigits.substring(1, 4) + format_tokens.aa + phoneDigits.substring(4, 7) + format_tokens.d + phoneDigits.substring(7) + extention;
			default:
				return phone;
			}
		}
		
		return phone;
	}

	function paymenthodIdCreditCart(cc_number)
	{
		// regex for credit card issuer validation
		var cards_reg_ex = {
			'VISA': /^4[0-9]{12}(?:[0-9]{3})?$/
		,	'Master Card': /^5[1-5][0-9]{14}$/
		,	'American Express': /^3[47][0-9]{13}$/
		,	'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/
		}
		
		// get the credit card name 
		,	paymenthod_name;

		// validate that the number and issuer
		_.each(cards_reg_ex, function(reg_ex, name)
		{
			if (reg_ex.test(cc_number))
			{
				paymenthod_name = name;
			}
		});
		
		var paymentmethod = paymenthod_name && _.findWhere(SC.ENVIRONMENT.siteSettings.paymentmethods, {name: paymenthod_name.toString()});
		
		return paymentmethod && paymentmethod.internalid;
	}


	function validateSecurityCode(value)
	{
		return Backbone.Validation.patterns.number.test(value) && (value.length === 3 || value.length === 4);
	}

	function validatePhone (phone)
	{
		console.log(phone);
		var minLength = 10;
		var maxLength = 10;
		if (_.isNumber(phone))
		{
			// phone is a number so we can't ask for .length
			// we elevate 10 to (minLength - 1)
			// if the number is lower, then its invalid
			// eg: phone = 1234567890 is greater than 1000000, so its valid
			//     phone = 123456 is lower than 1000000, so its invalid
			if (phone < Math.pow(10, minLength - 1))
			{
				return _('Phone Number is invalid').translate();
			}
		}
		else if (phone)
		{
			// if its a string, we remove all the useless characters
			var value = phone.replace(/[()-.\s]/g, '');
			// we then turn the value into an integer and back to string
			// to make sure all of the characters are numeric

			//first remove leading zeros for number comparison
//			while(value.length && value.substring(0,1) === '0') 
//			{
//				value = value.substring(1, value.length); 
//			}
			//parseInt(value, 10).toString() !== value ||
			if ( value.length < minLength || value.length > maxLength)
			{
				return _('Phone Number is invalid').translate();
			}
		}
	}

	function validateState(value, valName, form){
		var countries = SC.ENVIRONMENT.siteSettings.countries || [];
		if (countries[form.country] && countries[form.country].states){
			if (value === '')
			{
				return _('State is required').translate();
			}
		}
	}

	// translate:
	// used on all of the harcoded texts in the templates
	// gets the translated value from SC.Translations object literal
	function translate (text)
	{
		text = text.toString();
		// Turns the arguments object into an array
		var args = Array.prototype.slice.call(arguments)
		
		// Checks the translation table
		,	result = SC.Translations && SC.Translations[text] ? SC.Translations[text] : text;
		
		if (args.length && result)
		{
			// Mixes in inline variables
			result = result.format.apply(result, args.slice(1));
		}
		
		return result;
	}
	
	// getFullPathForElement:
	// returns a string containing the path
	// in the DOM tree of the element
	function getFullPathForElement (el)
	{
		var names = [], c, e;

		while (el.parentNode)
		{
			if (el.id)
			{
				// if a parent element has an id, that is enough for our path
				names.unshift('#'+ el.id);
				break;
			}
			else
			{
				if (el === el.ownerDocument.documentElement)
				{
					names.unshift(el.tagName);
				}
				else
				{
					for (c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++)
					{
						names.unshift(el.tagName +':nth-child('+ c +')');
					}
				}

				el = el.parentNode;
			}
		}

		return names.join(' > ');
	}

	function formatCurrency (value, symbol)
	{
		var sign = ''
		,	value_float = parseFloat(value);

		if (isNaN(value_float))
		{
			return value;
		}
		
		if (value_float < 0)
		{
			sign = '-';
		}
		
		value_float = Math.abs(value_float);
		value_float = parseInt((value_float + 0.005) * 100, 10);
		value_float = value_float / 100;

		var value_string = value_float.toString();

		// if the string doesn't contains a .
		if (!~value_string.indexOf('.'))
		{
			value_string += '.00';
		}
		// if it only contains one number after the .
		else if (value_string.indexOf('.') === (value_string.length - 2))
		{
			value_string += '0';
		}
		
		symbol = symbol || SC.ENVIRONMENT.siteSettings.shopperCurrency.symbol || '$';

		return sign + symbol + value_string;
	}

	function highlightKeyword (text, keyword)
	{
		text = text || '';

		keyword = jQuery.trim(keyword).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

		return text.replace(new RegExp('('+ keyword +')', 'ig'), function ($1, match)
		{
			return '<strong>' + match + '</strong>';
		});
	}

	function substitute (text, object)
	{
		text = text || '';

		return text.replace(/\{(\w+)\}/g, function (match, key)
		{
			return typeof object[key] !== 'undefined' ? object[key] : match;
		});
	}

	// iterates a collection of objects, runs a custom function getValue on each item and then joins them
	// returns a string.
	function collectionToString(options) 
	{
		var temp = [];
		_.each(options.collection, function(item) {		
			temp.push(options.getValue(item));		
		});

		return temp.join(options.joinWith);
	} 

	// params map
	function addParamsToUrl (baseUrl, params)
	{
		// We get the search options from the config file
		if (params)
		{
			var paramString = jQuery.param(params)
			,	join_string = ~baseUrl.indexOf('?') ? '&' : '?';

			return baseUrl + join_string + paramString;	
		}
		else
		{
			return baseUrl;
		}
	}
	
	// parseUrlOptions:
	// Takes a url with options (or just the options part of the url) and returns an object
	function parseUrlOptions(options_string)
	{
		options_string = options_string || '';
		
		if (~options_string.indexOf('?'))
		{
			options_string = _.last(options_string.split('?'));
		}
		
		var tokens = options_string.split(/\&/g)
		,	options = {}
		,	current_token;
		
		while (tokens.length > 0)
		{
			current_token = tokens.shift().split(/\=/g);
			options[current_token[0]] = current_token[1];
		}
		
		return options;
	}

	function objectToStyles (obj)
	{
		return _.reduce(obj, function (memo, value, index)
		{
			return memo += index +':'+ value +';'; 
		}, '');
	}

	// simple hyphenation of a string, replaces non-alphanumerical characters with hyphens
	function hyphenate (string) {
		return string.replace(/[\W]/g, '-');
	}
	
	function objectToAtrributes (obj, prefix)
	{
		prefix = prefix ? prefix +'-' : '';

		return _.reduce(obj, function (memo, value, index)
		{
			if (index !== 'text' && index !== 'categories')
			{
				memo += ' '+ prefix;

				if (index.toLowerCase() === 'css' || index.toLowerCase() === 'style')
				{
					index = 'style';
					// styles value has to be an obj
					value = objectToStyles(value);
				}

				if (_.isObject(value))
				{
					return memo += objectToAtrributes(value, index);
				}

				memo += index;

				if (value)
				{
					memo += '="'+ value +'"';
				}	
			}

			return memo;
		}, '');
	}

	function resizeImage (sizes, url, size)
	{
		var resize = _.where(sizes, {name: size})[0];

		if (!!resize)
		{
			return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
		}

		return url;
	}

	function getAbsoluteUrl (file)
	{
		return SC.ENVIRONMENT.baseUrl.replace('{{file}}', file);
	}

	//Fixes anchor elements, preventing default behavior so that
	//they do not change the views (ie: checkout steps)
	function preventAnchorNavigation (selector)
	{
		try
		{
			jQuery(selector).on('click', function (e)
			{
				e.preventDefault();
			});
		}
		catch (e)
		{
			console.log('Error while preventing navigation', e.message);
		}
	}
	
	SC.Utils = {
		translate: translate
	,	substitute: substitute
	,	paymenthodIdCreditCart: paymenthodIdCreditCart
	,	formatPhone: formatPhone
	,	validatePhone: validatePhone
	,	validateState: validateState
	,	validateSecurityCode: validateSecurityCode
	,	formatCurrency: formatCurrency
	,	highlightKeyword: highlightKeyword
	,	getFullPathForElement: getFullPathForElement
	,	collectionToString: collectionToString
	,	addParamsToUrl: addParamsToUrl
	,	parseUrlOptions: parseUrlOptions
	,	objectToAtrributes: objectToAtrributes
	,	resizeImage: resizeImage
	,	hyphenate: hyphenate
	,	getAbsoluteUrl: getAbsoluteUrl
	,	preventAnchorNavigation: preventAnchorNavigation
	};
	
	// We extend underscore with our utility methods
	// see http://underscorejs.org/#mixin
	_.mixin(SC.Utils);
	
})();
