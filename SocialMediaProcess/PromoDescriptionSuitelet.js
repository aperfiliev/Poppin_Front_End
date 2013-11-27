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
	var code = request.getParameter('code');
	var columns = [];
	columns[0]= new nlobjSearchColumn('custrecord_promo_details_html');
	columns[1]= new nlobjSearchColumn('description');
	var filters = [];
	filters[0] = new nlobjSearchFilter('code', null, 'is', code, null);
	var searchresults = nlapiSearchRecord('promotioncode', null, filters, columns);
	var description = searchresults[0].getValue(columns[0]);
	if (description === '') {
		description = searchresults[0].getValue(columns[1]);
	}
	response.write(description);
}
