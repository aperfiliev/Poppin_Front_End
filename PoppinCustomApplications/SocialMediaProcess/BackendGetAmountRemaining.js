/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Jan 2014     vziniak
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	try{
//	nlapiLogExecution('DEBUG', 'start app');
//	var d = new Date();
//	
//	var m = d.getMonth()+1,
//	date = d.getDate(),
//	y = d.getFullYear();
//	var formatDate = m+"/"+date+"/"+y;
	
	var filters = new Array();
	var columns = new Array();
	
	var code = request.getParameter('code');

	filters[0] = new nlobjSearchFilter('giftcertcode', null, 'is', code ,null);
	columns[0] = new nlobjSearchColumn('amountremaining');
	
	var SearchResult = nlapiSearchRecord('giftcertificate', null,filters,columns);
	
//	nlapiLogExecution('DEBUG', 'searchResult',SearchResult[0].getValue('amountremaining'));
	
	response.write(SearchResult[0].getValue('amountremaining'));
	}catch(e){
		nlapiLogExecution('DEBUG', 'try', JSON.stringify(e));
	}
//	if(SearchResult.amountremaining == 0){
//		response.write("The gift card entered has no remaining value");
//	}
//	if(SearchResult.remainingvalue > 0 && formatDate > SearchResult.expirationdate){
//		response.write("You have waited to long, this gift card has expired");
//	}
}
