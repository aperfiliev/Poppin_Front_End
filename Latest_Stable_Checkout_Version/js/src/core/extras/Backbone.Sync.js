// Backbone.Sync.js
// -----------------
// Extends native Backbone.Sync to pass company and site id on all requests
(function ()
{
	'use strict';

	Backbone.sync = _.wrap(Backbone.sync, function (fn, method, model, options)
	{
		var url = _.result(model, 'url');

		if (url)
		{
			options = options || {};

			options.url = url + (~url.indexOf('?') ? '&' : '?') + jQuery.param({
				// Account Number
				c: SC.ENVIRONMENT.companyId
				// Site Number
			,	n: SC.ENVIRONMENT.siteSettings.siteid
			});
		}

		return fn.apply(this, [method, model, options]);
	});
})();