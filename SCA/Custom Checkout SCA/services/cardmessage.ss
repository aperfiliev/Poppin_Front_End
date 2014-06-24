/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jan 2014     ashykalov
 *
 */
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		//Only can get or update a profile if you are logged in
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			,	data = JSON.parse(request.getBody() || '{}')
			//  Profile model is defined on ssp library Models.js
			,	CardMessage = Application.getModel('CardMessage');
			
			switch (method)
			{
				case 'GET':
					// sends the response of CardMessage.get()
					nlapiLogExecution('DEBUG','cardmessage service');
					Application.sendContent(CardMessage.get());
				break;

				case 'PUT':
					// Pass the data to the Profile's update method and send it response
					CardMessage.update(data);
					Application.sendContent(CardMessage.get());
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
