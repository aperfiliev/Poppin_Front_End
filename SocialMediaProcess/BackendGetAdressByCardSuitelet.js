/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jan 2014     bserednytskyy
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var cardid = request.getParameter('cardid');
	var filters = [];
	filters[0] = new nlobjSearchFilter('custrecord_creditcard_id', null, 'is', cardid, null);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_address_id');
	var results = nlapiSearchRecord('customrecord_billing_address_mapping', null, filters, columns);
	var addressid = results[0].getValue("custrecord_address_id"); 
	response.writeLine(addressid);
}
