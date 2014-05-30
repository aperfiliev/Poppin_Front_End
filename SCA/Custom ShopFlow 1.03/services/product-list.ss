/*exported service*/
// product-list.ss
// ----------------
// Service to manage product list requests
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod()
		,	data = JSON.parse(request.getBody() || '{}')
		,	id = request.getParameter('internalid') || data.internalid
		,	ProductList = Application.getModel('ProductList')
		,	ProductListItem = Application.getModel('ProductListItem')
		,	customerId = nlapiGetUser() + ''; 

		switch (method)
		{
			case 'GET':	
				if (id)
				{
					Application.sendContent(ProductList.get(id));
				}
				else
				{
					Application.sendContent(ProductList.search(customerId, 'name'));
				}									
			break;

			case 'POST':
				var internalid = ProductList.create(customerId, data); 
				var data = ProductList.get(internalid); 
				Application.sendContent(data, {'status': 201});
			break;

			case 'PUT':
				ProductList.update(id, data);
				Application.sendContent(ProductList.get(id));
			break;

			case 'DELETE':
				ProductList.delete(id);
				Application.sendContent({'status': 'ok'});
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