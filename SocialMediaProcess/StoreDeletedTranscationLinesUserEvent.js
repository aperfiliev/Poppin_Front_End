/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Feb 2014     ashykalov
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	nlapiLogExecution('DEBUG', 'type' , type); 
	try{
		if(type=='edit'){
			var record= nlapiGetNewRecord();
			var tranId = record.getId();
			var oldRecord = nlapiGetOldRecord();
			var oldlineItemCount = oldRecord.getLineItemCount('item');
			var lineItemCount = record.getLineItemCount('item');
			nlapiLogExecution('DEBUG', 'record line item length', record.getLineItemCount('item'));
			nlapiLogExecution('DEBUG', 'old record line item length', oldRecord.getLineItemCount('item'));
			//if(oldlineItemCount>lineItemCount){
			var oldMap= {};
			for(var i = 1; i <= oldlineItemCount; i++){
				oldMap[oldRecord.getLineItemValue('item', 'line', i)]='';// no value
			}
			var newMap= {};
			for(var i = 1; i <= lineItemCount; i++){
				newMap[record.getLineItemValue('item', 'line', i)]='';// no value
			}
			for(var _line in oldMap){
				if(newMap[_line]==null){
					nlapiLogExecution('DEBUG','_line deleted',tranId + '_' +_line);
					var newResult = nlapiCreateRecord('customrecord_deltranlineitem');
					newResult.setFieldValue('name', 'deleted transaction line '+tranId + '_' +_line);
					newResult.setFieldValue('custrecord_deltranitems_tranid', tranId);
					newResult.setFieldValue('custrecord_deltranitems_tranlineid', _line);
					newResultId = nlapiSubmitRecord(newResult);
				}
			}
		}
	}
	catch(e){
		nlapiLogExecution('ERROR','exception',e.toString());
	}
}
