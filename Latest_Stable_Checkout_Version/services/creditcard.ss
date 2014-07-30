/*exported service*/
// creditcard.ss
// ----------------
// Service to manage credit cards requests
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			,	id = request.getParameter('internalid')
			,	data = JSON.parse(request.getBody() || '{}')
			//  CreditCard model is defined on ssp library Models.js
			,	CreditCard = Application.getModel('CreditCard');

			switch (method)
			{
				case 'GET':
					//If the id exist, sends the response of CreditCard.get(id), else send the response of (CreditCard.list() || [])
					Application.sendContent(id ? CreditCard.get(id) : (CreditCard.list() || []));
				break;

				case 'PUT':
					// Pass the data to the CreditCard's update method and send it response
					CreditCard.update(id, data);
					Application.sendContent(CreditCard.get(id));
				break;

				case 'POST':
					// Handles the creation of credit cards and send the response
					id = CreditCard.create(data);
					Application.sendContent(CreditCard.get(id), {'status': 201});
				break;

				case 'DELETE':
					// The credit card is removed and we send a JSON Obj containing {'status': 'ok'}
					CreditCard.remove(id);
					Application.sendContent({'status': 'ok'});
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