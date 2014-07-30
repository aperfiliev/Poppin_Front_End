function getColors(req, res) {
	var cols 	= [
			new nlobjSearchColumn('name'),
			new nlobjSearchColumn('custrecord_web_color'),
			new nlobjSearchColumn('custrecord_conf_color_img'),
			new nlobjSearchColumn('custrecord_conf_color_hex'),
			new nlobjSearchColumn('custrecord_conf_color_order').setSort(false),
			new nlobjSearchColumn('internalid')
		],
		results	= nlapiSearchRecord('customrecord_conf_colors_to_img', null, null, cols);
	
	if(results) 
		res.write(JSON.stringify(results));
	else
		res.write('{"error":"No Colors Found"}')
}