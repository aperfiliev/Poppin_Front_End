

function afterSubmit(type) {
	if (nlapiGetFieldValue('custrecord_celigo_csv_import_import_now') != 'T')
		return;
	
	var importStatusManagerUrl = nlapiResolveURL('SUITELET', 'customscript_celigo_csvimport_liststatus', 'customdeploy_celigo_csvimport_liststatus');
	if(importStatusManagerUrl === null)
		nlapiSetRedirectURL('TASKLINK', 'LIST_SAVEDSEARCH');
	else
		nlapiSetRedirectURL('SUITELET', 'customscript_celigo_csvimport_liststatus', 'customdeploy_celigo_csvimport_liststatus');
	
	var id = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_csv_import_id');
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
	var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id;
	
	var array = new Array();
	array['custrecord_celigo_csv_import_file'] = nlapiGetFieldValue('custrecord_celigo_csv_import_file');
	array['custrecord_celigo_csv_import_record_map'] = nlapiGetFieldValue('custrecord_celigo_csv_import_record_map');
	array['custrecord_celigo_csv_import_add'] = nlapiGetFieldValue('custrecord_celigo_csv_import_add');
	array['custrecord_celigo_csv_import_update'] = nlapiGetFieldValue('custrecord_celigo_csv_import_update');
	array['custrecord_celigo_csv_import_delete'] = nlapiGetFieldValue('custrecord_celigo_csv_import_delete');
	array['custrecord_celigo_csv_import_key'] = nlapiGetFieldValue('custrecord_celigo_csv_import_key');
	array['custrecord_celigo_csv_import_job_name'] = nlapiGetFieldValue('custrecord_celigo_csv_import_job_name');
	array['custrecord_celigo_csv_import_before_sub'] = nlapiGetFieldValue('custrecord_celigo_csv_import_before_sub');
	
	nlapiLogExecution('DEBUG', 'Requesting', url);	
	nlapiRequestURL(url, array);	
}