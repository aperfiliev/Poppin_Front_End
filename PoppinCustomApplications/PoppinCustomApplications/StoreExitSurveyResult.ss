/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Oct 2013     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function service(request, response){
	var exitsurveyresult = {
			orderid:request.getParameter('orderid'),
			result:request.getParameter('result')
	}
	nlapiLogExecution('DEBUG','enter store result', JSON.stringify(exitsurveyresult));
	var storeresult = nlapiRequestURL(poppinservres.url.storeexitsurveyresult ,exitsurveyresult);
	nlapiLogExecution('DEBUG','after store result', new Date().toTimeString());
	//var parsedresult = JSON.parse(storeresult.getBody());
	nlapiLogExecution('DEBUG','exit store resut', new Date().toTimeString());
}
