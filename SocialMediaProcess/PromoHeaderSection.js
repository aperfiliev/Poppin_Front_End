/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 May 2014     vziniak
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if(request.getMethod()=='GET')
	{
		var record = nlapiLoadRecord('customrecord_cd_behaviour', 1);
		
		var form = nlapiCreateForm('Promo Header Section Settings');
		
		form.addField("inactive", "checkbox", "Inactive")
		.setDefaultValue(record.getFieldValue("custrecord_isinactive"));
		
//		form.addField("toggle", "checkbox", "Display 'Collapse banner' button at web site")
//		.setHelpText("Allow to display/hide a 'collapse' option so that the section can be minimized or always displayed on the page")
//		.setDefaultValue(record.getFieldValue("custrecord_toggle"));
		
		form.addField("display", "checkbox", "Capture promo header to be always on top of the page")
		.setHelpText("Allow to define if the section is always displayed (scrolled with page) or if the section disappears when the customer scrolls down the page")
		.setDefaultValue(record.getFieldValue("custrecord_display"));
		
		form.addField("height", "integer", "Total Height(px)")
		.setHelpText("Set height of Promo Section Section(without px)")
		.setDefaultValue(record.getFieldValue("custrecord_promo_header_height"));
		
		//form.addField("content", "textarea", "Content");
		
		form.addSubmitButton('Save');
		
		response.writePage(form);
	}
else
	{
		//POST data to netsuite
		//save text data
	
		var record = nlapiLoadRecord('customrecord_cd_behaviour', 1);
//		var content = nlapiLoadRecord('customrecord_ns_cd_pagecontent', 1);
//		nlapiLogExecution("DEBUG", "customrecord_ns_cd_content", JSON.stringify(content.getFieldValue("isinactive")));
		
//		record.setFieldValue("custrecord_toggle", request.getParameter('toggle'));
		record.setFieldValue("custrecord_display", request.getParameter('display'));
		record.setFieldValue("custrecord_promo_header_height", request.getParameter('height'));
//		record.setFieldValue("custrecord_isinactive", content.getFieldValue("isinactive"));
		record.setFieldValue("custrecord_isinactive", request.getParameter('inactive'));
		nlapiSubmitRecord(record);
	
	    var form = nlapiCreateForm("Promo Header Section Settings");
	    
		form.addField("inactive", "checkbox", "Inactive")
		.setDefaultValue(request.getParameter('inactive'));
	    
//	    form.addField("toggle", "checkbox", "Display 'Collapse banner' button at web site")
//	    .setHelpText("Allow to display/hide a 'collapse' option so that the section can be minimized or always displayed on the page")
//	    .setDefaultValue(request.getParameter('toggle'));
	    
	    form.addField("display", "checkbox", "Capture promo header to be always on top of the page")
	    .setHelpText("Allow to define if the section is always displayed (scrolled with page) or if the section disappears when the customer scrolls down the page")
	    .setDefaultValue(request.getParameter('display'));
	    
		form.addField("height", "integer", "Total Height(px)")
		.setHelpText("Set height of Promo Section Section(without px)")
		.setDefaultValue(request.getParameter("height"));
	    
	    form.addSubmitButton('Save');
	    
	    response.writePage(form);
	}
}
