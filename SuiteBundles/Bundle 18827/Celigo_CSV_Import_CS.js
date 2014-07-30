
function pageInit() {
	nlapiSetFieldValue('custrecord_celigo_csv_import_job_name', '');
}

function saveRecord() {
	
	if (nlapiGetFieldValue('custrecord_celigo_csv_import_import_now') != 'T')
		return true;
	
	if (!fieldHasValue('custrecord_celigo_csv_import_file') || 
		!fieldHasValue('custrecord_celigo_csv_import_record_map')) {
		alert("Please enter a value for: File and Record Mapping.");
		return false;
	}
	
	if (nlapiGetFieldText('custrecord_celigo_csv_import_file').indexOf('.csv') != nlapiGetFieldText('custrecord_celigo_csv_import_file').length - 4) {
		alert("File must be of type: .csv");
		return false;
	}
	
	var fields = new Array();
	fields[0] = 'custrecord_celigo_object_map_medium';
	
	var record = nlapiLoadRecord(getCeligoObjectMappingTableID(), nlapiGetFieldValue('custrecord_celigo_csv_import_record_map'));
	
	var values = new Array();
	values[fields[0]] = record.getFieldValue(fields[0]);
	
	if (values[fields[0]] != '1') {
		alert("Record Mapping must be of type: CSV");
		return false;
	}
	
	if (nlapiGetFieldValue('custrecord_celigo_csv_import_add') == 'T') {
		if (nlapiGetFieldValue('custrecord_celigo_csv_import_update') == 'T' ||
			nlapiGetFieldValue('custrecord_celigo_csv_import_delete') == 'T') {
				alert("Only one of the following can be chosen: Add, Update, or Delete.");
				return false;
		} else;
		
	} else if (nlapiGetFieldValue('custrecord_celigo_csv_import_update') == 'T') {
		if (nlapiGetFieldValue('custrecord_celigo_csv_import_add') == 'T' ||
			nlapiGetFieldValue('custrecord_celigo_csv_import_delete') == 'T') {
				alert("Only one of the following can be chosen: Add, Update, or Delete.");
				return false;
		} else;
		
	} else if (nlapiGetFieldValue('custrecord_celigo_csv_import_delete') == 'T') {
		if (nlapiGetFieldValue('custrecord_celigo_csv_import_update') == 'T' ||
			nlapiGetFieldValue('custrecord_celigo_csv_import_add') == 'T') {
				alert("Only one of the following can be chosen: Add, Update, or Delete.");
				return false;
		} else;
		
	} else {
		alert("Please enter a value for one of the following: Add, Update, or Delete.");
		return false;	
	}
	
	return true;

}



