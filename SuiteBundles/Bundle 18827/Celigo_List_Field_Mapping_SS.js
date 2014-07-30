function beforeLoad(type, form) {

	if (nlapiGetContext().getExecutionContext().toLowerCase() == 'webservices')
		return;
	
	form.getField('isinactive').setDisplayType('hidden');
	if (form.getField('customform') != null)
		form.getField('customform').setDisplayType('hidden');
	form.getField('custrecord_celigo_lfield_map_hop').setDisplayType('hidden');
	form.getField('custrecord_celigo_lfield_map_hdt').setDisplayType('hidden');
	form.getField('custrecord_celigo_lfield_map_init').setDisplayType('hidden');
	form.getField('custrecord_celigo_lfield_map_init_help').setDisplayType('hidden');
	form.getField('custrecord_celigo_lfield_map_in_type').setDisplayType('hidden');
	form.getField('custrecord_celigo_lfield_map_ns_fld_cpy').setDisplayType('hidden');
		
}