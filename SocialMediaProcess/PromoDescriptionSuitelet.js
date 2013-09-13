/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Sep 2013     sforostiuk
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var internalid = request.getParameter('internalid');
	var promotioncode = nlapiLoadRecord('promotioncode', internalid);
	response.write(JSON.stringify(promotioncode));
}
