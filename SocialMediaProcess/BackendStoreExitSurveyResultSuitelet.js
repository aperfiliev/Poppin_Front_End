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
	var newResultId='';
	var orderid = request.getParameter('orderid');
	var result = request.getParameter('result');
	nlapiLogExecution('DEBUG', 'storeresult', orderid+' '+result);
	result = JSON.parse(result);//parse json result
	
	for(var i=0;i<result.length;i++){
		var newResult = nlapiCreateRecord('customrecord202');
		newResult.setFieldValue('name', 'result'+orderid);
		//nlapiLogExecution('DEBUG', 'orderid', request.getParameter('orderid'));
		newResult.setFieldValue('custrecord_esresultorder', orderid );
		//newResult.setFieldValue('custrecord_esresulttransaction', request.getParameter('orderid'));
		newResult.setFieldValue('custrecord_esresultquestion', result[i].question);
		newResult.setFieldValue('custrecord_esresultanswer', result[i].answer);
		newResult.setFieldValue('custrecord4', result[i].othertext);
		newResultId = nlapiSubmitRecord(newResult);
		nlapiLogExecution('DEBUG','result id', newResultId);
	}
	return newResultId;
}
