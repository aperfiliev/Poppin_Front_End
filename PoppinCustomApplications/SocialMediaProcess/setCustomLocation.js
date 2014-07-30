/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 May 2014     vziniak
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
//	nlapiLogExecution("DEBUG","user event script_load");
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
//	nlapiLogExecution("DEBUG","user event script_before");
}

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
function userEventAfterSubmit_setPOLocation(type){
	nlapiLogExecution("DEBUG","user event script_after");
	
	var order = nlapiGetNewRecord();
	var purchase_order = nlapiLoadRecord("purchaseorder",order.id);
	
	var source = purchase_order.getFieldValue("source"),
	location = purchase_order.getFieldValue("location");
//	nlapiLogExecution("DEBUG","source", JSON.stringify(source));
//	nlapiLogExecution("DEBUG","location", JSON.stringify(location));
	if((source == "CSV") && (location == 4)){
		purchase_order.setFieldValue('location',4);
		nlapiSubmitRecord(purchase_order);
	}
	
}
