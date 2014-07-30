

function pageInit() {
	
	
	if (fieldHasValue('custrecord_celigo_object_map_parent')) {
		
		var firstSelection = getMultiSelectValues('custrecord_celigo_object_map_parent')[0];		
		
		var fields = new Array();
		fields[0] = 'custrecord_celigo_object_map_class';
		fields[1] = 'custrecord_celigo_object_map_medium';
		
		var record = nlapiLoadRecord(getCeligoObjectMappingTableID(), firstSelection);
		
		var values = new Array();
		values[fields[0]] = record.getFieldValue(fields[0]);
		values[fields[1]] = record.getFieldValue(fields[1]);
		
		if (values[fields[0]] == null)
			values[fields[0]] = '';
		if (values[fields[1]] == null)
			values[fields[1]] = '';
			
		nlapiSetFieldValue(fields[0], values[fields[0]], false);
		nlapiDisableField(fields[0], 'T');
		
		nlapiSetFieldValue(fields[1], values[fields[1]], false);
		nlapiDisableField(fields[1], 'T');
		
	} 
				
}

function saveRecord() {
	
	if (!fieldHasValue('name') ||
		!fieldHasValue('custrecord_celigo_object_map_class') ||
		!fieldHasValue('custrecord_celigo_object_map_medium')) {
		alert("Please enter values for Name, Object Being Mapped, and Data Transport Medium.");
		return false;
	}

	return true;
}




