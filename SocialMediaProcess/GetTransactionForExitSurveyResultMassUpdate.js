/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Oct 2013     azzz
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) {
	 var esResultRecord = nlapiLoadRecord(recType, recId);
	 salesorderid = '';
	 salesorderid = esResultRecord.getFieldValue('custrecord_esresultorder');
	 nlapiLogExecution('DEBUG', 'orderid', salesorderid);
	 if(salesorderid!=''&&salesorderid!=null&&salesorderid!=undefined){
		 var transactiondata = nlapiSearchRecord('transaction', null, 
	    		 //[
	    		  [new nlobjSearchFilter('tranid', null, 'is', salesorderid),new nlobjSearchFilter('type', null, 'is', 'SalesOrd')],
	    		  //,new nlobjSearchFilter('type', null, 'is', 'salesorder')
	    		  //]
		 [new nlobjSearchColumn('internalid'), new nlobjSearchColumn('type')]
		 );
		 var tranid = '';
		 if(transactiondata!=null){
			 tranid = transactiondata[0].getId();
			 nlapiLogExecution('DEBUG', 'info', 'tranid = ' + tranid + 'internalid = '+ transactiondata[0].getValue('internalid')+'type='+transactiondata[0].getValue('type'));
			 esResultRecord.setFieldValue('custrecord_esresulttransaction', tranid);
			 nlapiSubmitRecord(esResultRecord);
		 }
		 else{
			 nlapiLogExecution('DEBUG', 'notranid', tranid);
		 }
	 }
}
