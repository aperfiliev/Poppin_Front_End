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
	var newResult = nlapiCreateRecord('customrecord_poppinanalyticsrecord');
	newResult.setFieldValue('name', 'sessionid:'+sessionid);
	newResult.setFieldValue('custrecord_popanalyticspage', page );
	newResult.setFieldValue('custrecord_popanalyticssessionid', sessionid);
	newResult.setFieldValue('custrecord_popanalyticssourcefrom', sourcefrom);
	newResult.setFieldValue('custrecord_popanalyticstimestamp', convertedtimestamp);
        nlapiLogExecution('DEBUG','date', convertedtimestamp);
	newResultId = nlapiSubmitRecord(newResult);
	nlapiLogExecution('DEBUG','result id', newResultId);
	return newResultId;
}