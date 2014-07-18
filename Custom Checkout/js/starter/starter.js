SC.compileMacros(SC.templates.macros);

(function ()
{
	'use strict';
	
	var application = SC.Application('Checkout');

	application.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

	require(['Merchandising.Rule'], function (MerchandisingRule)
	{
		if (SC.ENVIRONMENT.MERCHANDISING)
		{
			// we need to turn it into an array
			var definitions = _.map(SC.ENVIRONMENT.MERCHANDISING, function (value, key)
			{
				value.internalid = key;
				return value;
			});

			MerchandisingRule.Collection.getInstance().reset(definitions);
			delete SC.ENVIRONMENT.MERCHANDISING;
		}

		jQuery(application.start (function ()
		{
			if (SC.ENVIRONMENT.CART) {
				application.getCart().set(SC.ENVIRONMENT.CART);
				delete SC.ENVIRONMENT.CART;
			}

			if (SC.ENVIRONMENT.PROFILE) {
				application.getUser().set(SC.ENVIRONMENT.PROFILE);
				delete SC.ENVIRONMENT.PROFILE;
			}

			if (SC.ENVIRONMENT.ADDRESS)
			{
				application.getUser().get('addresses').reset(SC.ENVIRONMENT.ADDRESS);
				delete SC.ENVIRONMENT.ADDRESS;
			}
			else
			{
				application.getUser().get('addresses').reset([]);
			}

			if (SC.ENVIRONMENT.CREDITCARD)
			{
				application.getUser().get('creditcards').reset(SC.ENVIRONMENT.CREDITCARD);
				delete SC.ENVIRONMENT.CREDITCARD;
			}
			else
			{
				application.getUser().get('creditcards').reset([]);
			}

			// Checks for errors in the context
			if(SC.ENVIRONMENT.contextError)
			{
				// Hide the header and footer.
				application.getLayout().$('#site-header').hide();
				application.getLayout().$('#site-footer').hide();
				
				// Shows the error.
				application.getLayout().internalError(SC.ENVIRONMENT.contextError.errorMessage, 'Error ' + SC.ENVIRONMENT.contextError.errorStatusCode + ': ' + SC.ENVIRONMENT.contextError.errorCode);
			}
			else
			{
				var fragment = _.parseUrlOptions(location.search).fragment;

				if (fragment && !location.hash)
				{
					location.hash = fragment;
				}

				Backbone.history.start();
			}
			if (SC.ENVIRONMENT.siteSettings.sitetype === 'STANDARD' && SC.ENVIRONMENT.siteSettings.showcookieconsentbanner === 'T')
			{
				//if cookie consent banner is going to be displayed, fix the navigation issue
				SC.Utils.preventAnchorNavigation('div#cookieconsent a');
			}
			application.getLayout().appendToDom();
		}));
	});
}());