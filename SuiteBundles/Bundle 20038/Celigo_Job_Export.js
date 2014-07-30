function beforeLoad(type, form) {

	if (nlapiGetContext().getExecutionContext().toLowerCase() == 'webservices')
		return;
	
	if (nlapiGetFieldValue('custrecord_celigo_je_status') != '5' && nlapiGetFieldValue('custrecord_celigo_je_status') != '3')
		return;
	
	if (nlapiGetFieldValue('custrecord_celigo_je_log') == null || nlapiGetFieldValue('custrecord_celigo_je_log') == '')
		return;
	
	var errors = getAllErrors(nlapiGetFieldValue('custrecord_celigo_je_log'));
	if (errors == null || errors.length < 1)
		return;
	
	var error = form.addTab('custpage_celigo_je_error', 'Errors');
	var errorList = form.addSubList('custpage_celigo_je_errors', 'staticlist', 'Errors', 'custpage_celigo_je_error');
	errorList.addField('custpage_celigo_je_errors_id', 'text', 'Error Id');
	errorList.addField('custpage_celigo_je_errors_date', 'text', 'Date Created');
	errorList.addField('custpage_celigo_je_errors_msg', 'textarea', 'Error Message');
	errorList.addField('custpage_celigo_je_errors_link', 'text', 'Link');
	errorList.addField('custpage_celigo_je_errors_res', 'text', '');
	
	for (var i=0; i<errors.length; i++) {
		var url = nlapiResolveURL('RECORD', 'customrecord_celigo_logger', errors[i].getId(), false);
		errorList.setLineItemValue('custpage_celigo_je_errors_id', i+1, "<a href='" + url + "'>" + errors[i].getId() + "</a>");
		errorList.setLineItemValue('custpage_celigo_je_errors_date', i+1, errors[i].getValue('created'));
		errorList.setLineItemValue('custpage_celigo_je_errors_msg', i+1, errors[i].getValue('custrecord_celigo_logger_message'));
		
		if (errors[i].getValue('custrecord_celigo_logger_rec_type') != null && errors[i].getValue('custrecord_celigo_logger_rec_type') != '' &&
			errors[i].getValue('custrecord_celigo_logger_rec_id') != null && errors[i].getValue('custrecord_celigo_logger_rec_id') != '') {
			
			url = nlapiResolveURL('RECORD', errors[i].getValue('custrecord_celigo_logger_rec_type'), errors[i].getValue('custrecord_celigo_logger_rec_id'), false);
			errorList.setLineItemValue('custpage_celigo_je_errors_link', i+1, "<a href='" + url + "'>" + errors[i].getValue('custrecord_celigo_logger_rec_type') + "</a>");
		}
		
		url = nlapiResolveURL('SUITELET', 'customscript_celigo_resolve_int_log_err', 'customdeploy_celigo_resolve_int_log_err');
		url = url + "&logid=" + errors[i].getId() + "&id=" + nlapiGetRecordId() + "&type=" + nlapiGetRecordType();
		errorList.setLineItemValue('custpage_celigo_je_errors_res', i+1, "<a href='" + url + "'>Mark Resolved</a>");
	}
		
}

function getAllErrors(id) {
	
	nlapiLogExecution('DEBUG', 'getAllErrors: ' + id, null);
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_celigo_logger_level', null, 'anyof', '2', null);
	filters[1] = new nlobjSearchFilter('custrecord_celigo_logger_parent', null, 'anyof', id, null);
	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('created');
	columns[1] = new nlobjSearchColumn('custrecord_celigo_logger_message');
	columns[2] = new nlobjSearchColumn('custrecord_celigo_logger_rec_id');
	columns[3] = new nlobjSearchColumn('custrecord_celigo_logger_rec_type');
	
	var searchresults = nlapiSearchRecord('customrecord_celigo_logger', null, filters, columns);
	
	if (searchresults == null)
		searchresults = new Array();
	
	var filters2 = new Array();
	filters2[0] = new nlobjSearchFilter('custrecord_celigo_logger_contains', null, 'is', 'T', null);
	filters2[1] = new nlobjSearchFilter('custrecord_celigo_logger_parent', null, 'anyof', id, null);
	var searchresults2 = nlapiSearchRecord('customrecord_celigo_logger', null, filters2, null);
	
	if (searchresults2 == null || searchresults2.length < 1)
		return searchresults;
	
	for (var i=0; i<searchresults2.length; i++)
		searchresults = searchresults.concat(getAllErrors(searchresults2[i].getId()));

	return searchresults;
}