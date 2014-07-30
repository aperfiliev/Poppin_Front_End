/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Apr 2014     ashykalov
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate_calculateOrderCount(recType, recId) {
	nlapiLogExecution('DEBUG','user record start', recId);
	var transactiondata = nlapiSearchRecord('transaction', null, [
	          new nlobjSearchFilter('internalid','customer','is', recId)
	          , new nlobjSearchFilter('mainline',null,'is', 'T')
	          , new nlobjSearchFilter('type',null,'anyOf', 'SalesOrd')
	          ], null);
	if(transactiondata){
		nlapiLogExecution('DEBUG','total orders',transactiondata.length);
		 //get user record
    	nlapiLogExecution('DEBUG','user record', recId);
    	var userRec = nlapiLoadRecord('customer', recId);
    	//save custom field
    	userRec.setFieldValue('custentity_ordercount', transactiondata.length);
    	nlapiSubmitRecord(userRec, false, true);
    	nlapiLogExecution('DEBUG','user record success', recId);
	}
}
