/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 May 2014     sforostiuk
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	if ( request.getMethod() == 'GET' )
	{
		var restCallCode =
			"<div><span id='update_result'>Please press button to update the SKUs</span>\n" +
			"<img id='update_loader' style='display:none;width:25px;height:18px' src='	http://shopping.sandbox.netsuite.com/core/media/media.nl?id=328946&c=3363929&h=1c18b9a1695b365cf59c' /></div>\n" +
			"<script>\n" +
				"jQuery(document).ready(function(){\n" +
				"jQuery('#custpage_updatematrix').click(function(){" +
					"jQuery('#update_result').text('Updating. Please wait.');\n" +	
					"jQuery('#update_loader').css('display','block');\n" +
					"jQuery.ajax({\n" +
					"type : 'GET',\n" +
					"url  : '/app/site/hosting/restlet.nl?script=364&deploy=1',\n" +
					"headers : {\n" +
					"'Content-Type' : 'application/json',\n" +
					"},\n" +
					"success : function(data) {\n" +
						"jQuery('#update_loader').css('display','none');\n" +
						"if(data.status == 'OK')\n" +
							"jQuery('#update_result').text('Thank you. The SKUs has been updated.');\n" +
						"else if(data.status == 'FAULT')\n" +
							"jQuery('#update_result').text('Unfortunatelly the update has been failed. ' + data.reason);\n" +
						"else if(data.status == 'LIMIT')\n" +
							"jQuery('#update_result').text('Warning : the SKU has been updated but governance limit has been exceeded. Ple+ase perform an update once again.');\n" +	
					"}\n" +
					 "});\n" +
				 "});\n" +
				 "});\n" +
			"</script>\n";
			
		var form = nlapiCreateForm('Update matrix child items SKUs/UPC codes.');
		var myInlineHtml = form.addField( 'custpage_inlinehtml', 'inlinehtml');
		myInlineHtml.setDefaultValue(restCallCode);
		
		form.addButton('custpage_updatematrix', 'Update');
		
		response.writePage( form );
	}
	else
		dumpResponse(request,response);
}