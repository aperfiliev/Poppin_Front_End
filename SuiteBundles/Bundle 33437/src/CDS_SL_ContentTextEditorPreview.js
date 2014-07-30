/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Apr 2013     adimaunahan	   initial implementation
 *
 */

function formSuitelet(request, response){
	
	var ret = 'Preview not available.';
	var contentRecId = request.getParameter('contentid');
	
	if(contentRecId){
		ret = nlapiLookupField('customrecord_ns_cd_content', contentRecId, 'custrecord_ns_cdc_content');
	}
	
	response.write(ret);
}