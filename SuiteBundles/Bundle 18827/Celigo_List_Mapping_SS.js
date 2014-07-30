function beforeLoad(type, form) {

	if (nlapiGetContext().getExecutionContext().toLowerCase() == 'webservices')
		return;
	
	form.getField('isinactive').setDisplayType('hidden');
	if (form.getField('customform') != null)
		form.getField('customform').setDisplayType('hidden');
	form.getField('custrecord_celigo_list_map_parent_hidden').setDisplayType('hidden');
	form.getField('custrecord_celigo_list_map_hdtm').setDisplayType('hidden');
		
}