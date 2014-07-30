/******************************************************************************************************
	Script Name - 	AVA_ShippingFunctions.js
	Company - 		Avalara Technologies Pvt Ltd.
******************************************************************************************************/

function AVA_ShippingCodeList(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 11 ) == 0)
	{
		var AVA_ShippingList = nlapiCreateList('Shipping Code List');
		AVA_ShippingList.setStyle(request.getParameter('style'));
		
		var AVA_InternalId = nlapiGetContext().getSetting('PREFERENCE', 'EXPOSEIDS');
		if(AVA_InternalId == 'T')
		{
			AVA_ShippingList.addColumn('id',	'text', 	'Internal Id', 		'LEFT');
		}
		
		var AVA_ShippingId = AVA_ShippingList.addColumn('custrecord_ava_shippingcode',	'text', 	'Shipping Code ID', 	'LEFT');
		AVA_ShippingId.setURL(nlapiResolveURL('SUITELET', 'customscript_avashippingcodeform_suitlet', 'customdeploy_shippingcode'));
		AVA_ShippingId.addParamToURL('avaid',	'id',	true);
		AVA_ShippingId.addParamToURL('avaedit',	'T',	false);
		
		AVA_ShippingList.addColumn('custrecord_ava_shippingdesc',	'text', 	'Description', 			'LEFT');
		
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_ava_shippingcode');
		columns[1] = new nlobjSearchColumn('custrecord_ava_shippingdesc');
		
		var results = nlapiSearchRecord('customrecord_avashippingcodes', null, null, columns);
	
		AVA_ShippingList.addRows(results);
		
		AVA_ShippingList.addPageLink('breadcrumb', 'Shipping Codes List', nlapiResolveURL('SUITELET', 'customscript_avashippinglist_suitlet', 'customdeploy_shippingcodelist'));
		AVA_ShippingList.addButton('custombutton1','New', "window.location = '" + nlapiResolveURL('SUITELET', 'customscript_avashippingcodeform_suitlet', 'customdeploy_shippingcode') + "&compid=" + nlapiGetContext().getCompany() + "&whence='");
		response.writePage(AVA_ShippingList);
	}
}

function AVA_ShippingCodeForm(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 10 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var shippingform = nlapiCreateForm('Shipping Codes');
			shippingform.setScript('customscript_avashipping_client');
			shippingform.setTitle('Shipping Codes');
			
			/* HEADER LEVEL FIELDS */
			var AVA_ShippingId = shippingform.addField('ava_shippingcode',		'text',		'Shipping Code');
			AVA_ShippingId.setMandatory(true);
			AVA_ShippingId.setMaxLength(25);	
			
			var AVA_ShippingDesc = shippingform.addField('ava_shippingdesc',	'text',		'Description');
			AVA_ShippingDesc.setMaxLength(200);	
	
			var AVA_ShipListURL = shippingform.addField('ava_shiplisturl',			'text',		'URL');
			AVA_ShipListURL.setDisplayType('hidden');
			AVA_ShipListURL.setDefaultValue(nlapiResolveURL('SUITELET', 'customscript_avashippinglist_suitlet', 'customdeploy_shippingcodelist'));
	
			var AVA_InternalID 		= shippingform.addField('ava_shippinginternalid',	'text',		'Internal ID');
			AVA_InternalID.setDisplayType('hidden');
	
			shippingform.addSubmitButton('Save');
			
			if (request.getParameter('avaid') != null)
			{
				var record = nlapiLoadRecord('customrecord_avashippingcodes', request.getParameter('avaid'));
				AVA_ShippingId.setDefaultValue(record.getFieldValue('custrecord_ava_shippingcode'));
				AVA_ShippingId.setDisplayType('disabled');
		
				AVA_ShippingDesc.setDefaultValue(record.getFieldValue('custrecord_ava_shippingdesc'));
				AVA_InternalID.setDefaultValue(request.getParameter('avaid'));
			}
	
			if(request.getParameter('avaedit') == 'T')
			{	
				shippingform.addButton('ava_shippingdelete', 'Delete', "AVA_ShippingCodeDelete()");
			}
	
			var AVA_ShippingCodeListURL = nlapiResolveURL('SUITELET', 'customscript_avashippinglist_suitlet', 'customdeploy_shippingcodelist');
			AVA_ShippingCodeListURL = AVA_ShippingCodeListURL + '&compid=' + nlapiGetContext().getCompany() + '&whence=';
	
			shippingform.addResetButton('Reset');
			shippingform.addPageLink('breadcrumb','Shipping Codes', nlapiResolveURL('SUITELET', 'customscript_avashippingcodeform_suitlet', 'customdeploy_shippingcode'));
			shippingform.addPageLink('crosslink', 'List Records', nlapiResolveURL('SUITELET', 'customscript_avashippinglist_suitlet', 'customdeploy_shippingcodelist'));
	
			response.writePage(shippingform);
		}
		else
		{
			var AVA_Message = 'A Shipping Code record with this ID already exists. You must enter a unique Shipping Code ID for each record you create.';
			var AVA_ShippingFlag = 'F';
			var AVA_ShippingSearchId;
			var AVA_ShippingCode = Trim(request.getParameter('ava_shippingcode'));
					
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('custrecord_ava_shippingcode', null, 'is', AVA_ShippingCode);
			
			var columns = new Array();
		 	columns[0] = new nlobjSearchColumn('custrecord_ava_shippingcode'); 
	
			var searchresult = nlapiSearchRecord('customrecord_avashippingcodes', null, filters, columns);
			if ((searchresult != null) && (request.getParameter('ava_shippinginternalid').length == 0))
			{
				var AVA_Notice = AVA_NoticePage(AVA_Message);
				response.write(AVA_Notice);
			}
			else
			{
				if (request.getParameter('ava_shippinginternalid').length > 0)
				{	
					var fields = new Array();
					fields[0] = 'name';
					fields[1] = 'custrecord_ava_shippingcode';
					fields[2] = 'custrecord_ava_shippingdesc';
					
					var values = new Array();
					values[0] = request.getParameter('ava_shippingcode');
					values[1] = request.getParameter('ava_shippingcode');
					values[2] = request.getParameter('ava_shippingdesc');
					
					nlapiSubmitField('customrecord_avashippingcodes', request.getParameter('ava_shippinginternalid'), fields, values);
				}
				else
				{
					var record = nlapiCreateRecord('customrecord_avashippingcodes');
					record.setFieldValue('custrecord_ava_shippingcode', 	request.getParameter('ava_shippingcode'));
					record.setFieldValue('custrecord_ava_shippingdesc', 	request.getParameter('ava_shippingdesc'));
					record.setFieldValue('name',							request.getParameter('ava_shippingcode'));
					var AVA_ShippingRecordId = nlapiSubmitRecord(record, false);
				}
				nlapiSetRedirectURL('SUITELET', 'customscript_avashippinglist_suitlet', 'customdeploy_shippingcodelist');
			}		
		}	
	}
}

function AVA_ShippingCodeDelete()
{
	if(confirm("Are you sure you want to delete the record?") == true)
	{
		/* Check if the Shipping Code is assigned in the Config Window */
		var cols = new Array();
		cols[0] = new nlobjSearchColumn('custrecord_ava_defshipcode');
		cols[1] = new nlobjSearchColumn('custrecord_ava_defmisccode');

		var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, cols);
		for(var i=0; i < Math.min(1,searchresult.length); i++)
		{
			var Shipcode = searchresult[i].getValue('custrecord_ava_defshipcode');
			var MiscCode = searchresult[i].getValue('custrecord_ava_defmisccode');
		}
		
		if ((nlapiGetFieldValue('ava_shippingcode') == Shipcode) || (nlapiGetFieldValue('ava_shippingcode') == MiscCode))
		{
			alert('The Shipping code cannot be deleted as child records exist');
		}
		else
		{
			try
			{
				nlapiDeleteRecord('customrecord_avashippingcodes', nlapiGetFieldValue('ava_shippinginternalid'));
			}
			catch(err)
			{
				var code = err instanceof nlobjError ? err.getCode() : err.name;
				alert(code);
			}
			window.location = nlapiGetFieldValue('ava_shiplisturl'); 	
		}
	}
}
