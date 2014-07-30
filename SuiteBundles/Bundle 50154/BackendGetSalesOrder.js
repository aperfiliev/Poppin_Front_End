/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Feb 2014     vziniak
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var id = request.getParameter('id');
	
	
	var sales_order = nlapiLoadRecord("salesorder",id);
	sales_order.setFieldValue('department',1);
	nlapiSubmitRecord(sales_order);
}
