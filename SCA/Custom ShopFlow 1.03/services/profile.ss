/*exported service*/
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod()
			// Profile is defined in ssp library Model.js
		,	Profile = Application.getModel('Profile')
		,	data = JSON.parse(request.getBody() || '{}');
		
		switch (method)
		{
			case 'GET': 
				// sends the response of Profile.get()
				Application.sendContent(Profile.get());
			break;

			case 'PUT':
				// pass the data to Profile's update method
				Profile.update(data);
				// and send the response of Profile.get()
				Application.sendContent(Profile.get());
			break;

			default: 
				// methodNotAllowedError is defined in ssp library commons.js
				Application.sendError(methodNotAllowedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}