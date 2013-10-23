/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Oct 2013     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var newResultId='';
	var page = request.getParameter('pageName');
	var sessionid = request.getParameter('sessionId');
	var sourcefrom = request.getParameter('sourceFrom');
	var timestamp = new Date();
	
	var convertedtimestamp = nlapiDateToString(timestamp, 'datetimetz');
	
	
	//var data = request.getParameter('data');
	//nlapiLogExecution('DEBUG', 'data:',request.getAllParameters());
	//var result = JSON.parse(result);//parse json result
	
//	var page = data.pageName;
//	var sessionid = data.sessionId;
//	var sourcefrom = data.sourceFrom;
//	var timestamp = data.timeStamp;
//	
	var newResult = nlapiCreateRecord('customrecord_poppinanalyticsrecord');
	nlapiLogExecution('DEBUG', 'name', newResult.getId());
	newResult.setFieldValue('name', newResult.getId());
	newResult.setFieldValue('custrecord_popanalyticspage', page );
	newResult.setFieldValue('custrecord_popanalyticssessionid', sessionid);
	newResult.setFieldValue('custrecord_popanalyticssourcefrom', sourcefrom);
	//nlapiSetDateTimeValue('custrecord_popanalyticstimestamp', timestamp);
	newResult.setFieldValue('custrecord_popanalyticstimestamp', convertedtimestamp);
	newResultId = nlapiSubmitRecord(newResult);
	nlapiLogExecution('DEBUG','result id', newResultId);
	return newResultId;
}
