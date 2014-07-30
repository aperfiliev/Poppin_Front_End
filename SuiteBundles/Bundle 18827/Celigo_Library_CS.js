

function getCeligoListMappingTableID() {
	return 'customrecord_celigo_list_map';
}

function getCeligoObjectMappingTableID() {
	return 'customrecord_celigo_object_map';
}

function getCeligoSupportedFieldTypeTableID() {
	return 'customrecord_celigo_supported_field';
}

function fieldHasValue(field) {
	if (nlapiGetFieldValue(field) != '' && nlapiGetFieldValue(field) != null)
		return true;
	return false;
}

function getMultiSelectValues(field) {
	
	var values = new Array();
	var count = 0;
	
	var multiSelectValue = nlapiGetFieldValue(field);
	var stringMultiSelectValue = '';
	for (var i=0; i<multiSelectValue.length; i++) {
		if (multiSelectValue.substring(i, i+1).indexOf('0') != -1 || 
			multiSelectValue.substring(i, i+1).indexOf('1') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('2') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('3') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('4') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('5') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('6') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('7') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('8') != -1 ||
			multiSelectValue.substring(i, i+1).indexOf('9') != -1) {
			stringMultiSelectValue = stringMultiSelectValue + multiSelectValue.substring(i, i+1);
			continue;
		}
		values[count] = stringMultiSelectValue;
		count = count + 1;
		stringMultiSelectValue = '';			
	}
	values[count] = stringMultiSelectValue;
	return values;
}