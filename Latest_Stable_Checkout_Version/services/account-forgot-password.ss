/*exported service*/
// address.ss
// ----------------
// Service to manage addresses requests
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod()
		//  Account model is defined on ssp library Models.js
		,	Account = Application.getModel('Account')
		,	data = JSON.parse(request.getBody() || '{}');

		switch (method)
		{
			case 'POST':
				//Handles the login and send the response
				Application.sendContent(Account.forgotPassword(data.email));
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