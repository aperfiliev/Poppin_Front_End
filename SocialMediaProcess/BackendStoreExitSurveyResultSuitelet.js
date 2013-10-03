/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Sep 2013     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var newResult = nlapiCreateRecord('customrecord202');
	newResult.setFieldValue('name', 'result');
	nlapiLogExecution('DEBUG', 'orderid', request.getParameter('orderid'));
	newResult.setFieldValue('custrecord_esresultorder', request.getParameter('orderid'));
	//newResult.setFieldValue('custrecord_esresulttransaction', request.getParameter('orderid'));
	newResult.setFieldValue('custrecord_esresultquestion', request.getParameter('question'));
	newResult.setFieldValue('custrecord_esresultanswer', request.getParameter('answer'));

	var newResultId = nlapiSubmitRecord(newResult);
	nlapiLogExecution('DEBUG','result id', newResultId);
	return newResultId;
}
