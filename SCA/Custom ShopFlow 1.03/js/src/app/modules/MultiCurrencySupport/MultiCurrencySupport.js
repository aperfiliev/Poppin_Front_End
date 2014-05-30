// MultiCurrencySupport.js
// -----------------------
// Handles the change event of the currency selector combo
define('MultiCurrencySupport', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			var layout = application.getLayout();
			// Adds the event listener
			_.extend(layout.events, {
				'change select[data-toggle="currency-selector"]' : 'setCurrency'
			});
			
			// Adds the handler function
			_.extend(layout,
			{
				setCurrency: function (e)
				{
					var currency_code = jQuery(e.target).val()
					,	selected_currency = _.find(SC.ENVIRONMENT.availableCurrencies, function (currency)
						{
							return currency.code === currency_code;
						});

					// We use the param **"cur"** to pass this to the ssp environment
					var current_search = SC.Utils.parseUrlOptions(window.location.search);
					
					// if we are in a facet result we will remove all facets and navigate to the default search 
					if (window.location.hash !== '' && layout.currentView.translator)
					{
						window.location.hash = application.getConfig('defaultSearchUrl', '');
					}
					
					current_search.cur = selected_currency.code;

					window.location.search = _.reduce(current_search, function (memo, val, name)
					{
						return val ? memo + name + '=' + val + '&' : memo;
					}, '?');
				}
			});
		}
	};
});
