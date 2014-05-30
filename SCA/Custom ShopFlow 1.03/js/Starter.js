var application = SC.Application('Shopping');

application.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

// The page generator needs to run in sync in order to work properly
if (SC.ENVIRONMENT.jsEnvironment !== 'browser')
{
   jQuery.ajaxSetup({ async: false });
}

jQuery(document).ready(function ()
{
	'use strict';
	
	SC.compileMacros(SC.templates.macros);

	// This minimizes flickery of the 1st page load!
	jQuery('#main').empty();
	
	// Requires all dependencies so they are bootstrapped
	require(['Content.DataModels', 'Merchandising.Rule','Categories'], function (ContentDataModels, MerchandisingRule, Categories)
	{
		// Loads the urls of the different pages in the conten service, 
		// this needs to happend before the app starts, so some routes are registered
		if (SC.ENVIRONMENT.CONTENT)
		{
			ContentDataModels.Urls.Collection.getInstance().reset(SC.ENVIRONMENT.CONTENT);
			delete SC.ENVIRONMENT.CONTENT;

			if (SC.ENVIRONMENT.DEFAULT_PAGE)
			{
				ContentDataModels.Pages.Collection.getInstance().reset(SC.ENVIRONMENT.DEFAULT_PAGE);
				delete SC.ENVIRONMENT.DEFAULT_PAGE;	
			}
		}

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
		if (SC.ENVIRONMENT.CATEGORIES)
		{
			Categories.reset(SC.ENVIRONMENT.CATEGORIES);
		}
		
		// When the document is ready we call the application.start, and once that's done we bootstrap and start backbone
		application.start(function ()
		{
			////////////////////////////
			// Bootstrap some objects //
			////////////////////////////

			// The Cart			
			if (SC.ENVIRONMENT.CART)
			{
				application.getCart().set(SC.ENVIRONMENT.CART);
				// Never use it from this object
				delete SC.ENVIRONMENT.CART;
			}
			
			// The user's Profile
			if (SC.ENVIRONMENT.PROFILE)
			{
				// The user
				application.getUser().set(SC.ENVIRONMENT.PROFILE);
				// Never use it from this object
				delete SC.ENVIRONMENT.PROFILE;
			}

			// The user's product lists
			if (SC.ENVIRONMENT.PRODUCTLISTS)
			{
				application.getProductLists().set(SC.ENVIRONMENT.PRODUCTLISTS);
				// Never use it from this object
				delete SC.ENVIRONMENT.PRODUCTLISTS;							
			}
			// and the product lists backend configuration.
			if (SC.ENVIRONMENT.PRODUCTLISTS_CONFIG)
			{
				application.Configuration.product_lists = SC.ENVIRONMENT.PRODUCTLISTS_CONFIG;
			}	

			// Checks for errors in the context
			if (SC.ENVIRONMENT.contextError)
			{
				// Hide the header and footer.
				application.getLayout().$('#site-header').hide();
				application.getLayout().$('#site-footer').hide();
				
				// Shows the error.
				application.getLayout().internalError(SC.ENVIRONMENT.contextError.errorMessage,'Error ' + SC.ENVIRONMENT.contextError.errorStatusCode + ': ' + SC.ENVIRONMENT.contextError.errorCode);
			}
			else
			{

				var fragment = _.parseUrlOptions(location.search).fragment;
			
				if (fragment && !location.hash)
				{
					location.hash = decodeURIComponent(fragment);
				}

				// OSnly do push state client side.
				Backbone.history.start({
					pushState: SC.ENVIRONMENT.seoSupport && SC.ENVIRONMENT.jsEnvironment === 'browser'
				});
			}
			// Grabs the layout and appends it to the dom.
			application.getLayout().appendToDom();
		});
	});
	// remove the script added for load script function
	// only if the javascript environment is the seo server
	if (SC.ENVIRONMENT.jsEnvironment === 'server')
	{
		jQuery('.seo-remove').remove();
	}
});
