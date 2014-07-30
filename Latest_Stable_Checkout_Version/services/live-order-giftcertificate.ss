/* exported service */
// live-order-giftcertificate.ss
// ----------------
// Service to manage gift certificates in the live order
function service (request)
{
	'use strict';

	try
	{
		var data = JSON.parse(request.getBody() || '{}')
			// Cart model is defined on ssp library Models.js
		,	LiveOrder = Application.getModel('LiveOrder');
		
		switch (request.getMethod())
		{
			case 'POST':
				LiveOrder.updateGiftCertificates(data.giftcertificates);
			break;
			
			default:
				// methodNotAllowedError is defined in ssp library commons.js
				return Application.sendError(methodNotAllowedError);
		}

		Application.sendContent(LiveOrder.get() || {});
	}
	catch (e)
	{
		Application.sendError(e);
	}
}