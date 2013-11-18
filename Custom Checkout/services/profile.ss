/*exported service*/
// profile.ss
// ----------------
// Service to manage profile requests
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
			,	Profile = Application.getModel('Profile');
			
			switch (method)
			{
				case 'GET':
					// sends the response of Profile.get()
					Application.sendContent(Profile.get());
				break;

				case 'PUT':
					// Pass the data to the Profile's update method and send it response
					Profile.update(data);
					Application.sendContent(Profile.get());
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