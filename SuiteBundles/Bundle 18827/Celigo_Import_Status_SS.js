
function afterSubmit(type) {
	
	if (type.toLowerCase() != 'edit' && type.toLowerCase() != 'xedit')
		return;
	
	if (nlapiGetContext().getExecutionContext() == 'webservices')
		return;
		
	var record = nlapiGetNewRecord();
	if (type.toLowerCase() == 'xedit')
		record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
	
	if (record.getFieldValue('custrecord_celigo_import_status_cancel') == 'T' &&
		record.getFieldValue('custrecord_celigo_import_status_type') == '1') {
		var id = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_csv_import_id');
		if (id == null || id == '')
			return;
		var host = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_integration_host');
		if (host == null || host == '')
			return;
		var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/cancel';
		
		var array = new Array();
		array['csvImportId'] = nlapiGetRecordId();
		
		nlapiLogExecution('DEBUG', 'Requesting', url);	
		nlapiRequestURL(url, array);	
	}
}




