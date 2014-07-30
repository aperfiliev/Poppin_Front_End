
function afterSubmit(type) {
	
	if (type.toLowerCase() != 'create')
		return;
		
	if (nlapiGetFieldValue('custrecord_celigo_file_wrapper_file') == '' ||
		nlapiGetFieldValue('custrecord_celigo_file_wrapper_file') == null ||
		nlapiGetFieldValue('custrecord_celigo_file_wrapper_dest') == '' ||
		nlapiGetFieldValue('custrecord_celigo_file_wrapper_dest') == null)
		return;
	
	var id = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_file_wrapper_id');
	if (id != null && id != '') {
		if (nlapiGetContext().getEnvironment().toLowerCase() == 'sandbox' || nlapiGetContext().getEnvironment().toLowerCase() == 'beta')
			id = id + nlapiGetContext().getEnvironment().toLowerCase();
		else;
	} else;
	
	if (id == null || id == '')
		return;
	var host = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_integration_host');
	if (host == null || host == '')
		return;
	var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/' + nlapiGetFieldValue('custrecord_celigo_file_wrapper_dest');

	var array = new Array();
	array['fileId'] = nlapiGetFieldValue('custrecord_celigo_file_wrapper_file');
		
	nlapiLogExecution('DEBUG', 'Requesting', url);	
	
	var response = nlapiRequestURL(url, array);	
	if (response.getCode() != '200')
		throw "Request failed.  Please try again.";
}