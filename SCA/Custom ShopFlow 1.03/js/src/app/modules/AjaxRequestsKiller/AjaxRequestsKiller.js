// AjaxRequestsKiller.js
// ---------------------
// Keeps trak of ongoing ajax requests and of url (or hash) changes, 
// so when the url changes it kills all pending ajax requests that other routers may have initiated.
// It's important to note that not all ajax request are opened by the change of the url, 
// for that reason it's important that you tag thouse who do by adding a killerId: this.application.killerId to the request (collection.fetch and model.fetch may trigger a request)
define('AjaxRequestsKiller', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Sets the first Killer ID
			// Every time the url changes this will be reseted, 
			// but as we are the last listening to the url change event
			// this only hapend after all reuqest are made
			application.killerId = _.uniqueId('ajax_killer_');

			// Every time a reuqest is made, a ref to it will be store in this collection.
			application.lambsToBeKilled = [];
			
			// Wraps the beforeSend function of the jQuery.ajaxSettings
			jQuery.ajaxSettings.beforeSend = _.wrap(jQuery.ajaxSettings.beforeSend, function (fn, jqXhr, options)
			{
				/// Check previous ongoing requests
				_.each(application.lambsToBeKilled, function (prev_jqXhr)
				{
					// if the new id is different than the old one, it means that there is a new killer id, 
					// so we kill the old one if its still ongoing
					if (options.killerId && options.killerId !== prev_jqXhr.killerId)
					{
						if (prev_jqXhr.readyState !== 4)
						{
							// If we are killing this request we dont want the ErrorHandling.js to handle it
							prev_jqXhr.preventDefault = true;
							prev_jqXhr.abort();
						}
						
						// we take it off the lambsToBeKilled collection to free some space and processing.
						application.lambsToBeKilled = _.without(application.lambsToBeKilled, prev_jqXhr);
					}
				});

				// If the killerId is set we add it to the collection  
				if (options.killerId)
				{
					jqXhr.killerId = options.killerId;
					application.lambsToBeKilled.push(jqXhr);
				}
				
				// Finnaly we call the original jQuery.ajaxSettings.beforeSend
				fn.apply(this, _.toArray(arguments).slice(1));
			});
			
			// We listen to the afterStart because Backbone.history is *potentialy* not ready untill after that
			application.on('afterStart', function ()
			{
				// There is a timinig issue involved, 
				// the on all event happends after the 2nd requests is done
				Backbone.history.on('all', function ()
				{
					// Generates a new id for the **next** request
					application.killerId = _.uniqueId('ajax_killer_');
				});
			});
		}
	};
});
