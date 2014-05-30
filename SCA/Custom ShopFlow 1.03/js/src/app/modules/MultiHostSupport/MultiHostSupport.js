// MultiHostSupport.js
// -------------------
// Handles the change event of the currency selector combo
define('MultiHostSupport', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Adds the event listener
			_.extend(application.getLayout().events, {'change select[data-toggle="host-selector"]' : 'setHost'});
			
			// Adds the handler function
			_.extend(application.getLayout(),
			{
				setHost: function (e)
				{
					var host = jQuery(e.target).val()
					,	url;
					
					if (Backbone.history._hasPushState)
					{
						// Seo Engine is on, send him to the root
						url = host;
					}
					else 
					{
						// send it to the current path, it's probably a test site
						url = host+location.pathname;
					}
				
					window.location.href = location.protocol + '//' + url;
				}
			});
		}
	};
});
