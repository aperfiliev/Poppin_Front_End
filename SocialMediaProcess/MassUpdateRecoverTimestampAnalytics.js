/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Oct 2013     ashykalov
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) {
	 var analyticsRecord = nlapiLoadRecord(recType, recId);
	 var timestamp = analyticsRecord.getFieldValue('custrecord_timestamp');
	 if(timestamp==''){
		 nlapiLogExecution('DEBUG', 'DateCreated', analyticsRecord.getFieldValue(''))
	 }
	 
}
