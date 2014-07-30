/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Apr 2014     ashykalov
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
function afterSubmit_calculateOrderCount(type){
	nlapiLogExecution('DEBUG','type',type);
  //load order record
  if (type == 'create' )
  {
	nlapiLogExecution('DEBUG','calculate script');
    //Obtain a handle to the newly created customer record
    var orderRec = nlapiGetNewRecord();
		
    if (orderRec.getFieldValue('entity') != null )
    {
    	
    	 //get user record
    	nlapiLogExecution('DEBUG','user record', orderRec.getFieldValue('entity'));
    	var userRec = nlapiLoadRecord('customer', orderRec.getFieldValue('entity'));
    	
    	//save custom field
    	if(isNaN(parseInt(userRec.getFieldValue('custentity_ordercount')))){
    		userRec.setFieldValue('custentity_ordercount', 1);
    	}
    	else{
    		userRec.setFieldValue('custentity_ordercount', parseInt(userRec.getFieldValue('custentity_ordercount'))+1);
    	}
    	nlapiSubmitRecord(userRec);
    }
  }
}
