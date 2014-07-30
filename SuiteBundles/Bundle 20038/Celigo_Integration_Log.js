function beforeLoad(type, form) {

	if (nlapiGetContext().getExecutionContext().toLowerCase() == 'webservices')
		return;
	
	form.getField('custrecord_celigo_logger_rec_id').setDisplayType('hidden');
	form.getField('custrecord_celigo_logger_rec_type').setDisplayType('hidden');
	form.getField('isinactive').setDisplayType('hidden');
	
	if (nlapiGetFieldValue('custrecord_celigo_logger_integration') == null || 
		nlapiGetFieldValue('custrecord_celigo_logger_integration') == '')
		form.getField('custrecord_celigo_logger_integration').setDisplayType('hidden');
	
	if (nlapiGetFieldValue('custrecord_celigo_logger_parent') == null || 
		nlapiGetFieldValue('custrecord_celigo_logger_parent') == '')
		form.getField('custrecord_celigo_logger_parent').setDisplayType('hidden');
	
	if (nlapiGetFieldValue('custrecord_celigo_logger_rec_link') == null || 
		nlapiGetFieldValue('custrecord_celigo_logger_rec_link') == '')
		form.getField('custrecord_celigo_logger_rec_link').setDisplayType('hidden');
	
	if (nlapiGetFieldValue('custrecord_celigo_logger_transaction') == null || 
		nlapiGetFieldValue('custrecord_celigo_logger_transaction') == '')
		form.getField('custrecord_celigo_logger_transaction').setDisplayType('hidden');
	
	if (nlapiGetFieldValue('custrecord_celigo_logger_item') == null || 
		nlapiGetFieldValue('custrecord_celigo_logger_item') == '')
		form.getField('custrecord_celigo_logger_item').setDisplayType('hidden');
		
	if (nlapiGetFieldValue('custrecord_celigo_logger_customer') == null || 
		nlapiGetFieldValue('custrecord_celigo_logger_customer') == '')
		form.getField('custrecord_celigo_logger_customer').setDisplayType('hidden');
		
	if (nlapiGetFieldValue('custrecord_celigo_logger_level') == '2') {
		form.addButton("custpage_resolve_error", 
					   "Resolve Error", 
					   "window.location.href='" + nlapiResolveURL('SUITELET', 
							   		   							  'customscript_celigo_resolve_int_log_err', 
							   		   							  'customdeploy_celigo_resolve_int_log_err') 
							   		   		    + "&logid=" + nlapiGetRecordId()
							   		   			+ "&type=" + nlapiGetRecordType()
							   		   		    + "&id=" + nlapiGetRecordId() + "'");
	}
	
}

function resolveCeligoIntegrationLogError(request, response) {
	
    if (request.getMethod() == 'GET') {
    	
    	var id = request.getParameter('id');
    	var type = request.getParameter('type');
    	var logid = request.getParameter('logid');
    	
    	nlapiLogExecution('DEBUG', 'id: ' + id, null);
    	nlapiLogExecution('DEBUG', 'type: ' + type, null);
    	nlapiLogExecution('DEBUG', 'logid: ' + logid, null);
    	
    	if (logid == null || logid == '')
    		return;
    	
    	if (id != null && id != '' && type != null && type != '')
    		nlapiSetRedirectURL('RECORD', type, id);
   		
   		var log = nlapiLoadRecord('customrecord_celigo_logger', logid);
   		log.setFieldValue('custrecord_celigo_logger_level', '3');
   		nlapiSubmitRecord(log);
   		
    } else {
    	
    }
   
}

function beforeSubmit(type) {

	var id = nlapiGetFieldValue('custrecord_celigo_logger_rec_id');
	var rtype = nlapiGetFieldValue('custrecord_celigo_logger_rec_type');
	
	if (id != null && id != '' &&
		rtype != null && rtype != '') {
		
		var url = nlapiResolveURL('RECORD', rtype, id, false);
		nlapiLogExecution('DEBUG', 'url: ' + url, null);
		nlapiLogExecution('DEBUG', 'rtype: ' + rtype, null);
		nlapiSetFieldValue('custrecord_celigo_logger_rec_link', 'https://system.netsuite.com' + url);
		
		if (rtype.toLowerCase() == 'salesorder' || 
			rtype.toLowerCase() == 'transaction' ||
			rtype.toLowerCase() == 'invoice' ||
			rtype.toLowerCase() == 'cashsale' ||
			rtype.toLowerCase() == 'cashrefund' ||
			rtype.toLowerCase() == 'creditmemo' ||
			rtype.toLowerCase() == 'customerpayment' ||
			rtype.toLowerCase() == 'customerrefund' ||
			rtype.toLowerCase() == 'returnauthorization' ||
			rtype.toLowerCase() == 'journalentry' ||
			rtype.toLowerCase() == 'itemreceipt' ||
			rtype.toLowerCase() == 'purchaseorder' ||
			rtype.toLowerCase() == 'vendorbill' ||
			rtype.toLowerCase() == 'estimate' ||
			rtype.toLowerCase() == 'itemfulfillment' ||
			rtype.toLowerCase() == 'opportunity')
			nlapiSetFieldValue('custrecord_celigo_logger_transaction', id);
		
		else if (rtype.toLowerCase() == 'item' || 
			rtype.toLowerCase() == 'shipitem' ||
			rtype.toLowerCase() == 'inventoryitem' ||
			rtype.toLowerCase() == 'kititem' ||
			rtype.toLowerCase() == 'markupitem' ||
			rtype.toLowerCase() == 'noninventorypurchaseitem' ||
			rtype.toLowerCase() == 'noninventoryresaleitem' ||
			rtype.toLowerCase() == 'noninventorysaleitem' ||
			rtype.toLowerCase() == 'servicepurchaseitem' ||
			rtype.toLowerCase() == 'serviceresaleitem' ||
			rtype.toLowerCase() == 'servicesaleitem') {
			
			if (nlapiLookupField(rtype.toLowerCase(), id, 'isinactive') == 'F')
				nlapiSetFieldValue('custrecord_celigo_logger_item', id);
		}
		
		else if (rtype.toLowerCase() == 'customer') {			
			if (nlapiLookupField(rtype.toLowerCase(), id, 'isinactive') == 'F')
				nlapiSetFieldValue('custrecord_celigo_logger_customer', id);
		}
		
		else if (rtype.toLowerCase() == 'contact') {			
			if (nlapiLookupField(rtype.toLowerCase(), id, 'isinactive') == 'F')
				nlapiSetFieldValue('custrecord_celigo_logger_contact', id);
		}
	}
}
