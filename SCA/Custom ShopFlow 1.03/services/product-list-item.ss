/*exported service*/
// product-list-item.ss
// ----------------
// Service to manage product list items requests
function service (request)
{
	'use strict';
	
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod()
		,	data = JSON.parse(request.getBody() || '{}')
		,	id = request.getParameter('internalid') ? request.getParameter('internalid') : data.internalid
		,	order = request.getParameter('order') ? request.getParameter('order') : data.order
		,	productListId = request.getParameter('productlistid') ? request.getParameter('productlistid') : data.productlistid
		,	ProductListItem = Application.getModel('ProductListItem');

		switch (method)
		{
			case 'GET':
				Application.sendContent(id ? ProductListItem.get(id) : ProductListItem.search(productListId, order));
			break;

			case 'POST':					
				Application.sendContent(ProductListItem.create(data), {'status': 201});
			break;

			case 'PUT':
				ProductListItem.update(id, data);
				Application.sendContent(ProductListItem.get(id));
			break;

			case 'DELETE':
				ProductListItem.delete(id);
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