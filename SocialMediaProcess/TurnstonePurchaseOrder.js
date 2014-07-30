/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 May 2014     bserednytskyy
 *
 */

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

function userEventAfterSubmit(type){
	var order = nlapiGetNewRecord();
	var purchase_order = nlapiLoadRecord("purchaseorder",order.id);
    var vendorId = purchase_order.getFieldValue("entity");
    var custform = purchase_order.getFieldValue("customform");
    if (vendor = "73784" && custform !="163") {
    	var vendor = nlapiLoadRecord("vendor",vendorId);
    	var salesOrder = nlapiLoadRecord("salesorder",purchase_order.getFieldValue("createdfrom"));
    	purchase_order.setFieldValue('customform',163);
    	purchase_order.setFieldValue('custbodyvendor_terms', vendor.getFieldText('terms'));
    	var primaryContactName =  purchase_order.getFieldValue('custbody_vendor_primary_contact');
    	if (primaryContactName != '' && primaryContactName != null) {
    		var filters = new Array();
    		filters[0] = new nlobjSearchFilter('entityid', null, 'is', purchase_order.getFieldValue('custbody_vendor_primary_contact'));
    		var columns = new Array();
    		columns[0] = new nlobjSearchColumn('email');
    		columns[1] = new nlobjSearchColumn('phone');
    		var contacts = nlapiSearchRecord('contact', null, filters, columns);
    		if (contacts.length > 0) {
    			purchase_order.setFieldValue('custbody_vendors_contact_email', contacts[0].getValue('email'));
    			purchase_order.setFieldValue('custbody_vendors_contact_phone', contacts[0].getValue('phone'));
    		}
    	}
    	var department = salesOrder.getFieldValue("department");
    	if (department != null) {
    		purchase_order.setFieldValue('department', department);
    	} else  {
    		purchase_order.setFieldValue('department', 1);        
    	}
    	purchase_order.setFieldValue('custbody20',1);
    	purchase_order.setFieldValue('shipmethod',2729);
    	var totalQuantity = 0;
    	for ( i = 1 ; i<= purchase_order.getLineItemCount('item'); i++ )
    	{
    		totalQuantity  = totalQuantity  + parseInt(purchase_order.getLineItemValue('item', 'quantity', i));
    	}
    	purchase_order.setFieldValue('custbody10',totalQuantity);
    	nlapiSubmitRecord(purchase_order);
    }
}
