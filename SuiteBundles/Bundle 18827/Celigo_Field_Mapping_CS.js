

function pageInit() {
	
	if (fieldHasValue('custrecord_celigo_field_map_parent')) {
		
		var firstSelection = getMultiSelectValues('custrecord_celigo_field_map_parent')[0];		
		
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
		
		if (nlapiGetFieldValue('custrecord_celigo_field_map_hop') != values[fields[0]])
			nlapiSetFieldValue('custrecord_celigo_field_map_hop', values[fields[0]], false);
		
		if (nlapiGetFieldValue('custrecord_celigo_field_map_hdt') != values[fields[1]])
			nlapiSetFieldValue('custrecord_celigo_field_map_hdt', values[fields[1]], false);
		
		nlapiSetFieldValue('custrecord_celigo_field_map_init_help', 'T');
	}
	
}

function fieldChanged() {
			
	// must continue here with initialization due to NetSuite limitations
	if (nlapiGetFieldValue('custrecord_celigo_field_map_init') != 'T') {
		nlapiSetFieldValue('custrecord_celigo_field_map_init', 'T', false);
		
		var value = nlapiGetFieldValue('custrecord_celigo_field_map_hop');
		nlapiSetFieldValue('custrecord_celigo_field_map_hop', '', false);
		nlapiSetFieldValue('custrecord_celigo_field_map_hop', value, false);
		
		if (nlapiGetFieldValue('custrecord_celigo_field_map_hdt') == '1')
			nlapiSetFieldValue('custrecord_celigo_field_map_ex_type', '6', false);
	
	} else {
	
		if (nlapiGetFieldValue('custrecord_celigo_field_map_ns_field') != nlapiGetFieldValue('custrecord_celigo_field_map_ns_field_cpy')) {		
			nlapiSetFieldValue('custrecord_celigo_field_map_ns_field_cpy', nlapiGetFieldValue('custrecord_celigo_field_map_ns_field'), false);
			
			if (fieldHasValue('custrecord_celigo_field_map_ns_field')) {
				var fields = new Array();
				fields[0] = 'custrecord_celigo_supported_field_stype';
				
				var values = nlapiLookupField(getCeligoSupportedFieldTypeTableID(), nlapiGetFieldValue('custrecord_celigo_field_map_ns_field'), fields);
				if (values['custrecord_celigo_supported_field_stype'] == null)
					values['custrecord_celigo_supported_field_stype'] = '';
					
				nlapiSetFieldValue('custrecord_celigo_field_map_in_type', values['custrecord_celigo_supported_field_stype']);
			
			} else {
				nlapiSetFieldValue('custrecord_celigo_field_map_in_type', '');
			
			}
		}
	}				
}

function validate() {
	if(saveRecord())
		alert('Validation Complete.');
}

function saveRecord() {
	
	if (!fieldHasValue('name')) {
		alert("Please enter a value for Name.");
		return false;
	}
	
	if (nlapiGetFieldValue('custrecord_celigo_field_map_is_hc') != 'T') {
	
		if (!fieldHasValue('custrecord_celigo_field_map_ns_field') ||
		 	!fieldHasValue('custrecord_celigo_field_map_ex_field') ||
		 	!fieldHasValue('custrecord_celigo_field_map_ex_type')) {
			alert("Please enter values for NetSuite Field, External Field, and External Data Type.");
			return false;
		}
	
	} else {
		
		if (fieldHasValue('custrecord_celigo_field_map_ns_field') &&
		 	fieldHasValue('custrecord_celigo_field_map_ex_field')) {
			alert("Hard-Coded field mappings cannot have both a NetSuite Field and an External Field defined.");
			return false;
		
		} else if (fieldHasValue('custrecord_celigo_field_map_ex_field') &&
			!fieldHasValue('custrecord_celigo_field_map_ex_type')) {
			alert("Please enter a value for External Data Type.");
			return false;
		
		} else if (!fieldHasValue('custrecord_celigo_field_map_ns_field') &&
		 	!fieldHasValue('custrecord_celigo_field_map_ex_field')) {
			alert("Please enter a value for either NetSuite Field or External Field.");
			return false;
		}
	}
	
	if (nlapiGetFieldText('custrecord_celigo_field_map_ns_field').indexOf('(Lookup)') != -1) {
		
		if (!fieldHasValue('custrecord_celigo_field_map_look_type')) {
			alert("Please define a Lookup Type.");
			return false;
		}
		
	}
	
	if (nlapiGetFieldValue('custrecord_celigo_field_map_in_type') == '2' ||
		nlapiGetFieldValue('custrecord_celigo_field_map_ex_type') == '2') {
		
		if (!fieldHasValue('custrecord_celigo_field_map_date_format') ||
			!fieldHasValue('custrecord_celigo_field_map_date_tz')) {
			alert("Please enter values for Date Format and Date Time Zone.");
			return false;
		}
		
	}
	
	if (nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '3' ||
		nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '4' ||
		nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '23') {
		
		if (!fieldHasValue('custrecord_celigo_field_map_look_source') ||
			!fieldHasValue('custrecord_celigo_field_map_look_key') ||
			!fieldHasValue('custrecord_celigo_field_map_look_value')) {
			alert("Please enter values for Lookup Source, Lookup Key, and Lookup Value.");
			return false;
		}
		
	} else if (nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '2' ||
		nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '9' ||
		nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '5') {
			
		if (!fieldHasValue('custrecord_celigo_field_map_look_source')) {
			alert("Please enter values for Lookup Source.");
			return false;
		}
		
	} else if (nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '6' ||
		nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '8') {
		
		if (!fieldHasValue('custrecord_celigo_field_map_look_source') ||
			!fieldHasValue('custrecord_celigo_field_map_look_key')) {
			alert("Please enter values for Lookup Source and Lookup Key.");
			return false;
		}
		
	} else if (nlapiGetFieldValue('custrecord_celigo_field_map_look_type') == '13') {
		
		if (!fieldHasValue('custrecord_celigo_field_map_look_key')) {
			alert("Please enter a value for Lookup Key.");
			return false;
		}
		
	}
	
	// Do hardcoded validation logic !!!
	return true;

}