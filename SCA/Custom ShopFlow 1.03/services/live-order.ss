/*exported service*/
// cart.ss
// ----------------
// Service to manage cart items requests
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		// If we are not in the checkout OR we are logged in
		// When on store, login in is not required
		// when on checkout, login is required
		if (!~request.getURL().indexOf('https') || session.isLoggedIn())
		{
			var method = request.getMethod()
				// Cart model is defined on ssp library Models.js
			,	LiveOrder = Application.getModel('LiveOrder')
			,	data = JSON.parse(request.getBody() || '{}');
			
			switch (method)
			{
				case 'GET':
					// Sends the response of LiveOrder.get()
					Application.sendContent(LiveOrder.get());
				break;
				
				case 'PUT':
					// Pass the data to the LiveOrder's update method and send it response
					LiveOrder.update(data);
					Application.sendContent(LiveOrder.get());
				break;

				case 'POST':
					// Updates the order with the passed in data
					LiveOrder.update(data);
					
					// Gets the status 
					var order_info = LiveOrder.get();
					
					// Finally Submits the order 
					order_info.confirmation = LiveOrder.submit();

					// Update touchpoints after submit order
					order_info.touchpoints = session.getSiteSettings(['touchpoints']).touchpoints;
					
					Application.sendContent(order_info);
				break;
				
				default:
					// methodNotAllowedError is defined in ssp library commons.js
					Application.sendError(methodNotAllowedError);
			}
		}
		else
		{
			// unauthorizedError is defined in ssp library commons.js			
			Application.sendError(unauthorizedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}