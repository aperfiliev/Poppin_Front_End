// UrlHelper.js
// ------------
// Keeps track of the URL, triggering custom events to specific parameters
// Provides moethods to add, get and remove parameters from the url
// Extends SC.Utils and add this methods to underscore
define('UrlHelper', function ()
{
	'use strict';
	
	var UrlHelper = {

		url : ''
	,	listeners : {}
	,	parameters : {}

	,	setUrl: function (url)
		{
			var self = this;

			this.url = url;
			this.parameters = {};

			// for each of the listeners
			_.each(this.listeners, function (fn, token)
			{
				var parameter_value = self.getParameterValue(token);

				// if the key (token) is in the url
				if (parameter_value)
				{
					// we trigger the function
					var value = _.isFunction(fn) ? fn(parameter_value) : fn;

					// if there is a value, we store it in our parameters object
					if (value)
					{
						if (_.isBoolean(value))
						{
							self.parameters[token] = parameter_value;
						}
						else
						{
							self.parameters[token] = value;
						}
					}
				}
			});
		}

	,	addTokenListener: function (token, fn)
		{
			this.listeners[token] = fn;
		}

	,	getParameters: function ()
		{
			return this.parameters;
		}

	,	getParameterValue: function (parameter)
		{
			var value = this.url.match(parameter +'{1}\\={1}(.*?[^&#]*)');
			
			if (value && value[1])
			{
				return value[1];
			}
			else
			{
				return '';
			}
		}

	,	clearValues: function ()
		{
			this.url = '';
			this.listeners = {};
			this.parameters = {};
		}
	};

	function fixUrl (url)
	{
		if (!new RegExp('^http').test(url))
		{
			var parameters = UrlHelper.getParameters()
			,	charValue = ''
			,	value = '';

			// for each of the parameters in the helper
			_.each(parameters, function (i, parameter)
			{
				value = url.match(new RegExp(parameter +'{1}\\={1}(.*?[^&]*)'));

				// if the parameter is not in the url
				if (!value)
				{
					charValue = ~url.indexOf('?') ? '&' : '?';
					// we append it
					url += charValue + parameter +'='+ parameters[parameter];
				}
			});
		}

		return url;
	}

	// changes the value of a parameter in the url
	function setUrlParameter(url, parameter, new_value)
	{
		var value = url.match(new RegExp(parameter + '{1}\\={1}(.*?[^(&|#)]*)'))
		,	charValue = '';

		if (value)
		{
			return url.replace(value[0], parameter +'='+ new_value);
		}
		else
		{
			charValue = ~url.indexOf('?') ? '&' : '?';

			return url + charValue + parameter +'='+  new_value;
		}
	}

	function removeUrlParameter(url, parameter)
	{
		var value = url.match(new RegExp('(\\?|&)' + parameter + '{1}\\={1}(.*?[^(&|#)]*)'));

		if (value)
		{
			if (~value[0].indexOf('?') && ~url.indexOf('&'))
			{
				return url.replace(value[0] +'&', '?');
			}
			else
			{
				return url.replace(value[0], '');
			}
		}
		else
		{
			return url;
		}
	}

	_.extend(SC.Utils, {
		fixUrl: fixUrl
	,	setUrlParameter: setUrlParameter
	,	removeUrlParameter: removeUrlParameter
	});

	// http://underscorejs.org/#mixin
	_.mixin(SC.Utils);
	
	return _.extend(UrlHelper, {

		mountToApp: function (Application)
		{
			var self = this;

			Application.getLayout().on('afterAppendView', function ()
			{
				// Every time afterAppendView is called, we set the url to the helper
				self.setUrl(window.location.href);
			});
		}
	});
});