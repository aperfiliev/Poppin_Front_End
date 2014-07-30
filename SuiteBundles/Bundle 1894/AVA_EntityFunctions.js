/******************************************************************************************************
	Script Name - 	AVA_EntityFunctions.js
	Company - 		Avalara Technologies Pvt Ltd.
******************************************************************************************************/

function AVA_EntityUseCodeList(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 5 ) == 0)
	{
		var AVA_EntityList = nlapiCreateList('Entity/Use Code List');
		AVA_EntityList.setStyle(request.getParameter('style'));
	
		var AVA_InternalId = nlapiGetContext().getSetting('PREFERENCE', 'EXPOSEIDS');
		if(AVA_InternalId == 'T')
		{
			AVA_EntityList.addColumn('id',	'text', 	'Internal Id', 		'LEFT');
		}
	
		var AVA_EntityId = AVA_EntityList.addColumn('custrecord_ava_entityid',		'text', 	'Entity/Use Code ID', 	'LEFT');
	    AVA_EntityId.setURL(nlapiResolveURL('SUITELET', 'customscript_avaentityuseform_suitlet', 'customdeploy_entityusecode'));
	    AVA_EntityId.addParamToURL('avaid',	'id', 	true);
	    AVA_EntityId.addParamToURL('avaedit',		'T', 	false);
		
		AVA_EntityList.addColumn('custrecord_ava_entityusedesc',	'text',		'Description', 		'LEFT');
	
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_ava_entityid');
		columns[1] = new nlobjSearchColumn('custrecord_ava_entityusedesc');
		
		AVA_EntityList.addPageLink('breadcrumb', 'Entity/Use Code List', nlapiResolveURL('SUITELET', 'customscript_avaentityuselist_suitlet', 'customdeploy_entityuselist'));
	
		var results = nlapiSearchRecord('customrecord_avaentityusecodes', null, null, columns);
		AVA_EntityList.addRows(results);
		
		AVA_EntityList.addButton('custombutton1','New', "window.location = '" + nlapiResolveURL('SUITELET', 'customscript_avaentityuseform_suitlet', 'customdeploy_entityusecode') + "&compid=" + nlapiGetContext().getCompany() + "&whence='");
		response.writePage(AVA_EntityList);
	}
}

function AVA_EntityUseForm(request, response)
{
	if(AVA_CheckSecurity(4) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var entityform = nlapiCreateForm('Entity/Use Code');
			entityform.setScript('customscript_avaentity_client');
			entityform.setTitle('Entity/Use Code');
			
			/* HEADER LEVEL FIELDS */
			var AVA_EntityId 		= entityform.addField('ava_entityid',		'text',			'Entity/Use Code Id');
			AVA_EntityId.setMaxLength(100);	
			AVA_EntityId.setMandatory(true);
			
			var AVA_EntityDesc 		= entityform.addField('ava_entitydesc',		'text',			'Description');
			AVA_EntityDesc.setMaxLength(200);	
	
			var AVA_EntityListURL 	= entityform.addField('ava_entitylisturl',	'text',			'URL');
			AVA_EntityListURL.setDisplayType('hidden');
			AVA_EntityListURL.setDefaultValue(nlapiResolveURL('SUITELET', 'customscript_avaentityuselist_suitlet', 'customdeploy_entityuselist'));
			
			var AVA_InternalID 		= entityform.addField('ava_entityinternalid',	'text',		'Internal ID');
			AVA_InternalID.setDisplayType('hidden');
			
			entityform.addSubmitButton('Save');
	
			if (request.getParameter('avaid') != null)
			{
				var record = nlapiLoadRecord('customrecord_avaentityusecodes', request.getParameter('avaid'));
				AVA_EntityId.setDefaultValue(record.getFieldValue('custrecord_ava_entityid'));
				AVA_EntityId.setDisplayType('disabled');
		
				AVA_EntityDesc.setDefaultValue(record.getFieldValue('custrecord_ava_entityusedesc'));
				AVA_InternalID.setDefaultValue(request.getParameter('avaid'));

			}
	
			if(request.getParameter('avaedit') == 'T')
			{	
				entityform.addButton('ava_entitydelete', 'Delete', "AVA_EntityCodeDelete()");
			}
			entityform.addResetButton('Reset');
	
			entityform.addPageLink('breadcrumb','Entity/Use Code', nlapiResolveURL('SUITELET', 'customscript_avaentityuseform_suitlet', 'customdeploy_entityusecode'));
			entityform.addPageLink('crosslink', 'List Records', nlapiResolveURL('SUITELET', 'customscript_avaentityuselist_suitlet', 'customdeploy_entityuselist'));
			response.writePage(entityform);
		}
		else
		{
			var AVA_Message = 'A Entity/Use Code record with this ID already exists. You must enter a unique Entity/Use Code ID for each record you create.';
			var AVA_EntityFlag = 'F';
			var AVA_EntitySearchId;
			var AVA_EntityId = Trim(request.getParameter('ava_entityid'));
					
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('custrecord_ava_entityid', null, 'is', AVA_EntityId);
			
			var columns = new Array();
		 	columns[0] = new nlobjSearchColumn('custrecord_ava_entityid'); 
	
			var searchresult = nlapiSearchRecord('customrecord_avaentityusecodes', null, filters, columns);
			
			if ((searchresult != null) && (request.getParameter('ava_entityinternalid').length == 0))
			{
				var AVA_Notice = AVA_NoticePage(AVA_Message);
				response.write(AVA_Notice);
			}
			else
			{
				if (request.getParameter('ava_entityinternalid').length > 0)
				{
					var fields = new Array();
					fields[0] = 'name';
					fields[1] = 'custrecord_ava_entityid';
					fields[2] = 'custrecord_ava_entityusedesc';
					
					var values = new Array();
					values[0] = request.getParameter('ava_entityid');
					values[1] = request.getParameter('ava_entityid');
					values[2] = request.getParameter('ava_entitydesc');	
					
					nlapiSubmitField('customrecord_avaentityusecodes', request.getParameter('ava_entityinternalid'), fields, values);
				}
				else
				{
					var record = nlapiCreateRecord('customrecord_avaentityusecodes');
					record.setFieldValue('name', 							request.getParameter('ava_entityid'));
					record.setFieldValue('custrecord_ava_entityid', 		request.getParameter('ava_entityid'));
					record.setFieldValue('custrecord_ava_entityusedesc', 	request.getParameter('ava_entitydesc'));
					var AVA_EntityRecordId = nlapiSubmitRecord(record, false);
				}
				nlapiSetRedirectURL('SUITELET', 'customscript_avaentityuselist_suitlet', 'customdeploy_entityuselist');
			}
		}
	}
}

function AVA_EntityCodeDelete()
{
	var AVA_Exists = 'F';
	if(confirm("Are you sure you want to delete the record?") == true)
	{
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_entityusemap', null, 'is', nlapiGetFieldValue('ava_entityinternalid'));
		
		var cols = new Array();
		cols[0] = new nlobjSearchColumn('custrecord_ava_entityusemap');
		
		var searchresult = nlapiSearchRecord('customrecord_avaentityusemapping', null, filters, cols);
		if(searchresult != null)
		{
			alert('The Entity/Use Code cannot be deleted as there are child records asscoiated with this code');
		}
		else
		{ 
			try
			{
				nlapiDeleteRecord('customrecord_avaentityusecodes', nlapiGetFieldValue('ava_entityinternalid'));
			}
			catch(err)
			{
				var code = err instanceof nlobjError ? err.getCode() : err.name;
				alert(code);
			}
			window.location = nlapiGetFieldValue('ava_entitylisturl');
		}
	}	
}


function AVA_CustomerEntityList(request, response)
{
	if(AVA_CheckSecurity( 3 ) == 0)
	{
		var AVA_CustomerList = nlapiCreateList('Customers');
		AVA_CustomerList.setStyle(request.getParameter('style'));
		
		var AVA_Customername = AVA_CustomerList.addColumn('entityid',	'text', 	'Customer Name', 	'LEFT');
		AVA_Customername.setURL(nlapiResolveURL('SUITELET', 'customscript_avaentitymap_suitlet', 'customdeploy_entityusemap'));
		AVA_Customername.addParamToURL('cid', 'id', true);
		
		var AVA_InternalId = nlapiGetContext().getSetting('PREFERENCE', 'EXPOSEIDS');
		if(AVA_InternalId == 'T')
		{
			AVA_CustomerList.addColumn('id',	'text', 	'Internal Id', 		'LEFT');
		}
		
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('isperson');
		columns[1] = new nlobjSearchColumn('firstname');
		columns[2] = new nlobjSearchColumn('middlename');
		columns[3] = new nlobjSearchColumn('lastname');
		columns[4] = new nlobjSearchColumn('companyname');
		columns[5] = new nlobjSearchColumn('entityid');
		
		var searchResult = nlapiSearchRecord('customer', null, null, columns);
		var results = new Array();
		
		for(var k=0; k != null && k < searchResult.length; k++)
		{
			results[k] = new Array();
			results[k]['entityid'] = (searchResult[k].getValue('isperson') == 'T') ? (searchResult[k].getValue('firstname') + ((searchResult[k].getValue('middlename') != null && searchResult[k].getValue('middlename').length>0)? ( ' ' + searchResult[k].getValue('middlename') + ' ' ) : ' ') + searchResult[k].getValue('lastname')) : ((searchResult[k].getValue('companyname') != null && searchResult[k].getValue('companyname').length > 0) ? searchResult[k].getValue('companyname') : searchResult[k].getValue('entityid'));	
			results[k]['id'] = searchResult[k].getId();
		}
	
		AVA_CustomerList.addRows(results);
		AVA_CustomerList.addPageLink('breadcrumb', 'Entity/Use Code Mapping', nlapiResolveURL('SUITELET', 'customscript_avacustomerlist_suitlet', 'customdeploy_customerlist'));
		response.writePage(AVA_CustomerList);
	}
} 

function AVA_EntityMappingSave(Record, Lineaddressid, Entitymapid)
{
	Record.setFieldValue('custrecord_ava_customerid', 	request.getParameter('custid'));
	Record.setFieldValue('custrecord_ava_addressid', 	Lineaddressid);
	Record.setFieldValue('custrecord_ava_entityusemap', Entitymapid);
	var emid = nlapiSubmitRecord(Record);
}

function AVA_EntityMapSave()
{
	var AVA_Return;
	// If Mapping is already existing then the delete checkbox is visible 
	// Perform necessary checking else return true flag 
	if (nlapiGetFieldValue('mapexists') == 'T')
	{
		var AVA_MapExists = 'F';
		
		// Check if delete checkbox is marked, then break from loop by setting the mapexists flag to 'true'
		for(var i=0; i < nlapiGetLineItemCount('custpage_avaentitymap'); i++)
		{
			if(nlapiGetLineItemValue('custpage_avaentitymap', 'avadeletemap', i+1) == 'T')
			{
				AVA_MapExists = 'T';
				break;	
			}
		}
		
		if(AVA_MapExists == 'T')
		{
			// mapping done throw confirmation message and set the return flag 
			if(confirm('Are you sure you want to delete the mapping for selected Address ID?') == true)
			{
				AVA_Return = 'T';
			}
			else
			{
				AVA_Return = 'F';
			}
		}
		else
		{
			AVA_Return = 'T';
		}
	}
	else
	{
		// Mapping is not done so return true flag
		AVA_Return = 'T';
	}
	
	if(AVA_Return == 'T')
	{
		return true;
	}
	else
	{
		return false;
	}
}

function AVA_CustomerBeforeLoad(type, form) //TaxSvc
{
	var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
	
	nlapiLogExecution('DEBUG','AVA_ExecutionContext',AVA_ExecutionContext);
	if(AVA_ExecutionContext == 'userinterface' || AVA_ExecutionContext == 'userevent' || AVA_ExecutionContext == 'webservices' || AVA_ExecutionContext == 'csvimport' || AVA_ExecutionContext == 'scheduled' || AVA_ExecutionContext == 'suitelet' || AVA_ExecutionContext == 'webstore')
	{
		if(nlapiGetField('custpage_ava_readconfig') == null)
		{
			form.addField('custpage_ava_readconfig','longtext','ConfigRecord');
			form.getField('custpage_ava_readconfig').setDisplayType('hidden');
			AVA_ReadConfig('1');	
		}
		else
		{
			if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
			{
				var LoadValues = AVA_LoadValuesFromField();
			}
		}
		
		form.setScript('customscript_avaentity_client');		
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1 && (AVA_DisableTax == 'F' || AVA_DisableTax == false))
		{
			var AddressTab = form.getSubList('addressbook');
			if(AddressTab != null)
			{
				AddressTab.addField('custpage_ava_entityusecode','select','Entity/Use Code','customrecord_avaentityusecodes');
			}
			else
			{
				AddressTab = form.getTab('address');
				if(AddressTab != null)
				{
					form.addField('custpage_ava_entityusecode', 'select', 'Entity/Use Code', 'customrecord_avaentityusecodes');			
				}
			}
			
			form.addTab('custpage_avatab', 'AvaTax');
			
			form.addField('custpage_ava_exemption', 	'text', 	'Exemption Certificate No.',  null, 'custpage_avatab');
			form.getField('custpage_ava_exemption').setMaxLength(25);
		
			form.addField('custpage_ava_exemptionid', 	'text', 	'Exemption ID',  			   null, 'custpage_avatab');
			form.getField('custpage_ava_exemptionid').setDisplayType('hidden');
		
			if(type == 'edit' || type == 'view')
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_exemptcustomerid', null, 'anyof', nlapiGetRecordId());
				
				var cols = new Array();
				cols[0] = new nlobjSearchColumn('custrecord_ava_exemptno');
				
				var searchresult = nlapiSearchRecord('customrecord_avacustomerexemptmapping', null, filters, cols);		
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					form.getField('custpage_ava_exemption').setDefaultValue(searchresult[i].getValue('custrecord_ava_exemptno'));
					form.getField('custpage_ava_exemptionid').setDefaultValue(searchresult[i].getId());
				}
				
				if(AddressTab != null)
				{
					var filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_ava_customerid_new', null, 'anyof', nlapiGetRecordId());
					
					var cols = new Array();
					cols[0] = new nlobjSearchColumn('custrecord_ava_entityusemap_new');
					cols[1] = new nlobjSearchColumn('custrecord_ava_addressid_new');
					
					var searchresult = nlapiSearchRecord('customrecord_avaentityusemapping_new', null, filters, cols);		
					for(var k=0; k < nlapiGetLineItemCount('addressbook') && searchresult != null && searchresult.length > 0 ; k++)
					{
						var AddId = nlapiGetLineItemValue('addressbook', 'id', k+1);
						
						for(var m=0; m<searchresult.length; m++)
						{
							if(searchresult[m].getValue('custrecord_ava_addressid_new') == AddId)
							{
								nlapiSetLineItemValue('addressbook', 'custpage_ava_entityusecode', k+1, searchresult[m].getValue('custrecord_ava_entityusemap_new'));
							}
						}
					}
				}
			}
		}
	}
}

function AVA_CustomerBeforeLoad_Address(type, form) //AddressSvc
{
	var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
	if(AVA_ExecutionContext == 'userinterface' || AVA_ExecutionContext == 'userevent' || AVA_ExecutionContext == 'webservices' || AVA_ExecutionContext == 'csvimport' || AVA_ExecutionContext == 'scheduled' || AVA_ExecutionContext == 'suitelet')		
	{
		if(nlapiGetField('custpage_ava_readconfig') == null)
		{
			form.addField('custpage_ava_readconfig','longtext','ConfigRecord');
			form.getField('custpage_ava_readconfig').setDisplayType('hidden');
			AVA_ReadConfig('1');	
		}
		else
		{
			if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
			{
				var LoadValues = AVA_LoadValuesFromField();
			}
		}
		
		form.setScript('customscript_avaentity_client');		
		var BaseRecordType = nlapiGetFieldValue('baserecordtype');
		
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('AddressSvc') != -1 && (AVA_DisableAddValidation == false || AVA_DisableAddValidation == 'F'))
		{
			var AddressTab = form.getSubList('addressbook');
			if(AddressTab != null)
			{
				AddressTab.addButton('custpage_ava_validateaddress','Validate Address', "AVA_ValidateAddress(0)");
				if(BaseRecordType != 'vendor')
				{
					AddressTab.addField('custpage_ava_latitude',	 'text',  'Latitude');
					AddressTab.addField('custpage_ava_longitude',	 'text',  'Longitude');
				}
			}
			else
			{
				AddressTab = form.getTab('address');
				if(AddressTab != null)
				{
					form.addButton('custpage_ava_validateaddress','Validate Address',"AVA_ValidateAddress(1)");
					if(BaseRecordType != 'vendor')
					{
						form.addField('custpage_ava_latitude',	 'text',  'Latitude');
						form.addField('custpage_ava_longitude',	 'text',  'Longitude');
					}
				}
			}

			if(type == 'edit' || type == 'view')
			{
				if(AddressTab != null && BaseRecordType != 'vendor')
				{
					var filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_ava_custid', null, 'anyof', nlapiGetRecordId());
					
					var cols = new Array();
					cols[0] = new nlobjSearchColumn('custrecord_ava_addid');
					cols[1] = new nlobjSearchColumn('custrecord_ava_latitude');
					cols[2] = new nlobjSearchColumn('custrecord_ava_longitude');
					
					var searchresult = nlapiSearchRecord('customrecord_avacoordinates', null, filters, cols);		
					for(var k=0; k < nlapiGetLineItemCount('addressbook') && searchresult != null && searchresult.length > 0 ; k++)
					{
						var AddId = nlapiGetLineItemValue('addressbook', 'id', k+1);
						
						for(var m=0; m<searchresult.length; m++)
						{
							if(searchresult[m].getValue('custrecord_ava_addid') == AddId)
							{
								nlapiSetLineItemValue('addressbook', 'custpage_ava_latitude', k+1, searchresult[m].getValue('custrecord_ava_latitude'));
								nlapiSetLineItemValue('addressbook', 'custpage_ava_longitude', k+1, searchresult[m].getValue('custrecord_ava_longitude'));
							}
						}
					}
				}
			}
		}
	}
}

function AVA_CustomerBeforeLoad_Certs(type, form) //AvaCert2Svc
{
	var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
	if(AVA_ExecutionContext == 'userinterface')		
	{
		if(nlapiGetField('custpage_ava_readconfig') == null)
		{
			form.addField('custpage_ava_readconfig','longtext','ConfigRecord');
			form.getField('custpage_ava_readconfig').setDisplayType('hidden');
			AVA_ReadConfig('1');	
		}
		else
		{
			if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
			{
				var LoadValues = AVA_LoadValuesFromField();
			}
		}
		
		form.setScript('customscript_avaentity_client');
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('AvaCert2Svc') != -1)
		{
			var AddressTab = form.getSubList('addressbook');
			if(AddressTab != null)
			{
				AddressTab.addField('custpage_ava_email', 'email', 'Email');
				
				if(type == 'edit' || type == 'view')
				{
					if(type == 'edit')
					{
						var flag = 0; //Flag is declared to hide and show the button on Partner Record.
						if(nlapiGetRecordType() == 'partner' && AVA_CustomerCode != null && (AVA_CustomerCode == 0 || AVA_CustomerCode == 1 || AVA_CustomerCode == 2 || AVA_CustomerCode == 6))
						{
							flag = 1;
						}
						if(flag == 0)
						{
							AddressTab.addButton('custpage_ava_createcustomer','Add customer to CertCapture', "AVA_CreateCustomerAvaCert()");
							AddressTab.addButton('custpage_ava_initiateexempt','Request exemption certificate', "AVA_InitiateExemptCert()");
							AddressTab.addButton('custpage_ava_getcertificates','Retrieve Certificate(s)', "AVA_GetCertificates()");
							AddressTab.addButton('custpage_ava_getcertificatestatus','Retrieve Certificate(s) Status', "AVA_CertificatesStatus()");
							
							var SelectCriteria = AddressTab.addField('custpage_ava_communicationmode','select','Communication Mode');
							SelectCriteria.addSelectOption('0','');
							SelectCriteria.addSelectOption('EMAIL','Email');
							SelectCriteria.addSelectOption('FAX','Fax');
							SelectCriteria.addSelectOption('MAIL','Mail');
							SelectCriteria.setDefaultValue('0');
			
							AddressTab.addField('custpage_ava_custommessage','textarea','Custom Message');
						}
					}
					
					var filters = new Array();
					if(nlapiGetRecordType() == 'partner')
					{
						filters[0] = new nlobjSearchFilter('custrecord_avapartnerid', null, 'anyof', nlapiGetRecordId());
					}
					else
					{
						filters[0] = new nlobjSearchFilter('custrecord_avacustomerid', null, 'anyof', nlapiGetRecordId());
					}
					
					var cols = new Array();
					cols[0] = new nlobjSearchColumn('custrecord_ava_email');
					cols[1] = new nlobjSearchColumn('custrecord_avaaddressid');
					
					var searchresult = nlapiSearchRecord('customrecord_avacertemail', null, filters, cols);		
					for(var k=0; k < nlapiGetLineItemCount('addressbook') && searchresult != null && searchresult.length > 0 ; k++)
					{
						var AddId = nlapiGetLineItemValue('addressbook', 'id', k+1);
						
						for(var m=0; m<searchresult.length; m++)
						{
							if(searchresult[m].getValue('custrecord_avaaddressid') == AddId)
							{
								nlapiSetLineItemValue('addressbook', 'custpage_ava_email', k+1, searchresult[m].getValue('custrecord_ava_email'));
							}
						}
					}
				}
			}
		}
	}
}

function AVA_CustomerBeforeSubmit(type) //TaxSvc
{
	if(nlapiGetFieldValue('custpage_ava_readconfig') == null)
	{
		AVA_ReadConfig('1');
	}
	else
	{
		if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
		{
			AVA_LoadValuesFromField();
		}
	}
	
	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
	{
		var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
		if ((type == 'create' || type == 'edit' || type == 'copy') && (AVA_ExecutionContext == 'userinterface' || AVA_ExecutionContext == 'userevent' || AVA_ExecutionContext == 'webservices' || AVA_ExecutionContext == 'csvimport' || AVA_ExecutionContext == 'scheduled' || AVA_ExecutionContext == 'suitelet'  || AVA_ExecutionContext == 'webstore'))
		{	
			//Set Taxability of the Customer
			if(AVA_MarkCustTaxable != null && AVA_MarkCustTaxable != 0)
			{
				if(AVA_MarkCustTaxable == 1 || ((type == 'create' || type == 'copy') && AVA_MarkCustTaxable == 2) || (type == 'edit' && AVA_MarkCustTaxable == 3))
				{							
					nlapiSetFieldValue('taxable', 'T');
				}
			}	
		
			if(nlapiGetFieldValue('taxitem') == null || (nlapiGetFieldValue('taxitem') != null && nlapiGetFieldValue('taxitem').length <= 0))
			{				
				//Set Customer TaxItem field						
				if(AVA_DefaultCustomerTaxcode != null && AVA_DefaultCustomerTaxcode != 0)
				{
					var TaxCodeID = AVA_DefaultTaxCode;			
					TaxCodeID = (TaxCodeID.lastIndexOf('+') != -1) ? TaxCodeID.substring(parseFloat(TaxCodeID.lastIndexOf('+')) + parseFloat(1)) : null;

					if(TaxCodeID != null)
					{
						if(AVA_DefaultCustomerTaxcode == 1 || ((type == 'create' || type == 'copy') && AVA_DefaultCustomerTaxcode == 2) || (type == 'edit' && AVA_DefaultCustomerTaxcode == 3))
						{
							nlapiSetFieldValue('taxitem', TaxCodeID);
						}
					}				
				}		
			}	
		}		
	}
}

function AVA_CustomerAfterSubmit(type) //TaxSvc
{
	if(nlapiGetFieldValue('custpage_ava_readconfig') == null)
	{
		AVA_ReadConfig('1');
	}
	else
	{
		if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
		{
			AVA_LoadValuesFromField();
		}
	}
	
	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
	{
		var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
	
		if(AVA_ExecutionContext == 'userinterface' || AVA_ExecutionContext == 'userevent' || AVA_ExecutionContext == 'webservices' || AVA_ExecutionContext == 'csvimport' || AVA_ExecutionContext == 'scheduled' || AVA_ExecutionContext == 'suitelet' || AVA_ExecutionContext == 'webstore')
		{	
			if (type == 'create')
			{
				AVA_CreateExemptRecord();
				
				var CustRec = nlapiLoadRecord('customer',nlapiGetRecordId());
				
				if(nlapiGetFieldValue('target') == 'main:entity')
				{
					var UseCode = nlapiGetFieldValue('custpage_ava_entityusecode');
					if(UseCode != null && UseCode.length > 0 && CustRec.getLineItemValue('addressbook','id',1) != null && CustRec.getLineItemValue('addressbook','id',1).length > 0)
					{
						var record = nlapiCreateRecord('customrecord_avaentityusemapping_new');
						record.setFieldValue('custrecord_ava_customerid_new', nlapiGetRecordId());
						record.setFieldValue('custrecord_ava_addressid_new', CustRec.getLineItemValue('addressbook','id',1));
						record.setFieldValue('custrecord_ava_entityusemap_new', UseCode);
						record.setFieldValue('custrecord_ava_custinternalid', nlapiGetRecordId());
						var recid = nlapiSubmitRecord(record);
					}
				}
				else
				{
					for(var i=0; i<nlapiGetLineItemCount('addressbook'); i++)
					{
						var UseCode = nlapiGetLineItemValue('addressbook','custpage_ava_entityusecode',i+1);					
						var AddId = nlapiGetLineItemValue('addressbook','id',i+1);
						
						if(AddId == null || AddId.length == 0)
						{
							AddId = CustRec.getLineItemValue('addressbook','id',i+1);
						}
						
						if(UseCode != null && UseCode.length > 0)
						{
							var record = nlapiCreateRecord('customrecord_avaentityusemapping_new');
							record.setFieldValue('custrecord_ava_customerid_new', nlapiGetRecordId());
							record.setFieldValue('custrecord_ava_addressid_new', AddId);
							record.setFieldValue('custrecord_ava_entityusemap_new', UseCode);
							record.setFieldValue('custrecord_ava_custinternalid', nlapiGetRecordId());
							var recid = nlapiSubmitRecord(record);
						}
					}
				}
			}
			else if(type == 'edit')
			{
				
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_customerid_new', null, 'anyof', nlapiGetRecordId());
				
				var cols = new Array();
				cols[0] = new nlobjSearchColumn('custrecord_ava_customerid_new');
				cols[1] = new nlobjSearchColumn('custrecord_ava_addressid_new');
				
				var searchresult = nlapiSearchRecord('customrecord_avaentityusemapping_new', null, filters, cols);		
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					var AVA_AddressDelete = 'F';
					for(var j=0; j < nlapiGetLineItemCount('addressbook'); j++)
					{
						if (searchresult[i].getValue('custrecord_ava_addressid_new') == nlapiGetLineItemValue('addressbook','id', j+1)) 
						{
							AVA_AddressIdDelete = 'T';	
							break;
						}
						else
						{
							AVA_AddressIdDelete = 'F';
						}
					}
					
					if(AVA_AddressIdDelete == 'F')
					{
						nlapiDeleteRecord('customrecord_avaentityusemapping_new', searchresult[i].getId());
					}
				}
		
				var ExemptFlag = 'F';
				var filters1 = new Array();
				filters1[0] = new nlobjSearchFilter('custrecord_ava_exemptcustomerid', null, 'anyof', nlapiGetRecordId());
				
				var cols1 = new Array();
				cols1[0] = new nlobjSearchColumn('custrecord_ava_exemptcustomerid');
				cols1[1] = new nlobjSearchColumn('custrecord_ava_exemptno');
				
				var searchresult = nlapiSearchRecord('customrecord_avacustomerexemptmapping', null, filters1, cols1);		
				for(var i=0 ; searchresult != null && i < searchresult.length; i++)
				{
					var ExemptNo = nlapiGetFieldValue('custpage_ava_exemption');
					if(ExemptNo != null && ExemptNo.length > 0)
					{
						nlapiSubmitField('customrecord_avacustomerexemptmapping', searchresult[i].getId(), 'custrecord_ava_exemptno', nlapiGetFieldValue('custpage_ava_exemption'));
						ExemptFlag = 'T';
					}
					else
					{
						nlapiDeleteRecord('customrecord_avacustomerexemptmapping', searchresult[i].getId());
						ExemptFlag = 'T';
					}
				}
				
				if(ExemptFlag == 'F')
				{
					AVA_CreateExemptRecord();			
				}
				
				var CustRec = nlapiLoadRecord('customer',nlapiGetRecordId());
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_customerid_new', null, 'anyof', nlapiGetRecordId());
				
				var cols = new Array();
				cols[0] = new nlobjSearchColumn('custrecord_ava_customerid_new');
				cols[1] = new nlobjSearchColumn('custrecord_ava_addressid_new');
				cols[2] = new nlobjSearchColumn('custrecord_ava_entityusemap_new');
				
				var searchresult = nlapiSearchRecord('customrecord_avaentityusemapping_new', null, filters, cols);				
				
				for(var i=0; i<nlapiGetLineItemCount('addressbook'); i++)
				{
					var record, AVA_ExistFlag = 'F', AVA_ChangeFlag = 0, AVA_DelRecId;
					var AddId = nlapiGetLineItemValue('addressbook','id',i+1);
					var UseCode = nlapiGetLineItemValue('addressbook','custpage_ava_entityusecode',i+1);
					
					if(AddId == null || AddId.length == 0)
					{
						AddId = CustRec.getLineItemValue('addressbook','id',i+1);
					}
					
					for(var customRec=0; searchresult != null && customRec < searchresult.length ; customRec++)
					{
						if(searchresult[customRec].getValue('custrecord_ava_addressid_new') == AddId)
						{
							if(UseCode != null && UseCode.length > 0)
							{
								if(searchresult[customRec].getValue('custrecord_ava_entityusemap_new') != UseCode)
								{															
									nlapiSubmitField('customrecord_avaentityusemapping_new', searchresult[customRec].getId(), 'custrecord_ava_entityusemap_new', UseCode);
									AVA_ChangeFlag = 1;//Record exisits but value changed
								}
								else
								{
									AVA_ChangeFlag = 2;//Record exisits but value is not changed
								}
							}
							else
							{
								AVA_DelRecId = searchresult[customRec].getId();
								AVA_ChangeFlag = 3;//Record exists with blank value
							}
							
							AVA_ExistFlag = 'T';
							break;
						}						
					}
					
					if(UseCode != null && UseCode.length > 0)
					{
						if(AVA_ExistFlag == 'F' && AVA_ChangeFlag == 0)
						{
							record = nlapiCreateRecord('customrecord_avaentityusemapping_new');	
							record.setFieldValue('custrecord_ava_customerid_new', nlapiGetRecordId());
							record.setFieldValue('custrecord_ava_addressid_new', AddId);
							record.setFieldValue('custrecord_ava_entityusemap_new', UseCode);
							record.setFieldValue('custrecord_ava_custinternalid', nlapiGetRecordId());
							var recid = nlapiSubmitRecord(record);						
						}
					}
					else
					{						
						if(AVA_ExistFlag == 'T' && AVA_ChangeFlag == 3)
						{
							//Fix for Ticket 20060: In case of Scheculed scripts and Suitelet UseCode value is returning as null, as a result, mappings get deleted
							//which were done from UI, adding the if check to allow deletion to be done only when changes are being done from UI.
							if(AVA_ExecutionContext == 'userinterface')
							{							
								nlapiDeleteRecord('customrecord_avaentityusemapping_new', AVA_DelRecId);
							}
						}						
					}	
				}
			}	
			else if(type == 'delete')
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_custinternalid', null, 'is', nlapiGetRecordId());
		
				var searchresult = nlapiSearchRecord('customrecord_avaentityusemapping_new', null, filters, null);		
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					nlapiDeleteRecord('customrecord_avaentityusemapping_new', searchresult[i].getId());
				}
		
				var Exemptid = nlapiGetFieldValue('custpage_ava_exemptionid');
				if(Exemptid != null && Exemptid.length > 0)
				{
					nlapiDeleteRecord('customrecord_avacustomerexemptmapping', Exemptid);
				}
			}
		}
	}
}

function AVA_CustomerAfterSubmit_Address(type) //AddressSvc
{
	if(nlapiGetFieldValue('custpage_ava_readconfig') == null)
	{
		AVA_ReadConfig('1');
	}
	else
	{
		if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
		{
			AVA_LoadValuesFromField();
		}
	}
	
	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('AddressSvc') != -1)
	{
		var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
		var BaseRecordType = nlapiGetFieldValue('baserecordtype');
		if(BaseRecordType != 'vendor' && (AVA_ExecutionContext == 'userinterface' || AVA_ExecutionContext == 'userevent' || AVA_ExecutionContext == 'webservices' || AVA_ExecutionContext == 'csvimport' || AVA_ExecutionContext == 'scheduled' || AVA_ExecutionContext == 'suitelet'))
		{
			if (type == 'create')
			{
				var CustRec = nlapiLoadRecord('customer', nlapiGetRecordId());
				if(nlapiGetFieldValue('target') == 'main:entity')
				{
					var Latitude = nlapiGetFieldValue('custpage_ava_latitude');
					var Longitude = nlapiGetFieldValue('custpage_ava_longitude');
					if(Latitude != null && Latitude.length > 0 && Longitude != null && Longitude.length > 0 && CustRec.getLineItemValue('addressbook','id',1) != null && CustRec.getLineItemValue('addressbook','id',1).length > 0)
					{
						var record = nlapiCreateRecord('customrecord_avacoordinates');
						record.setFieldValue('custrecord_ava_custid', nlapiGetRecordId());
						record.setFieldValue('custrecord_ava_addid', CustRec.getLineItemValue('addressbook','id',1));
						record.setFieldValue('custrecord_ava_latitude', Latitude);
						record.setFieldValue('custrecord_ava_longitude', Longitude);
						record.setFieldValue('custrecord_ava_customerinternalid', nlapiGetRecordId());
						var recid = nlapiSubmitRecord(record);
					}
				}
				else
				{
					for(var i=0; i<nlapiGetLineItemCount('addressbook'); i++)
					{
						var Latitude = nlapiGetLineItemValue('addressbook', 'custpage_ava_latitude', i+1);
						var Longitude = nlapiGetLineItemValue('addressbook','custpage_ava_longitude', i+1);
						var AddId = nlapiGetLineItemValue('addressbook','id',i+1);
						
						if(AddId == null || AddId.length == 0)
						{
							AddId = CustRec.getLineItemValue('addressbook','id',i+1);
						}

						if(Latitude != null && Latitude.length > 0 && Longitude != null && Longitude.length > 0)
						{
							var record = nlapiCreateRecord('customrecord_avacoordinates');
							record.setFieldValue('custrecord_ava_custid', nlapiGetRecordId());
							record.setFieldValue('custrecord_ava_addid', AddId);
							record.setFieldValue('custrecord_ava_latitude', Latitude);
							record.setFieldValue('custrecord_ava_longitude', Longitude);
							record.setFieldValue('custrecord_ava_customerinternalid', nlapiGetRecordId());
							var recid = nlapiSubmitRecord(record);
						}
					}
				}
			}
			else if(type == 'edit')
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_custid', null, 'anyof', nlapiGetRecordId());
				
				var cols = new Array();
				cols[0] = new nlobjSearchColumn('custrecord_ava_custid');
				cols[1] = new nlobjSearchColumn('custrecord_ava_addid');
				
				var searchresult = nlapiSearchRecord('customrecord_avacoordinates', null, filters, cols);		
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					var AVA_AddressDelete = 'F';
					for(var j=0; j < nlapiGetLineItemCount('addressbook'); j++)
					{
						if (searchresult[i].getValue('custrecord_ava_addid') == nlapiGetLineItemValue('addressbook','id', j+1)) 
						{
							AVA_AddressIdDelete = 'T';	
							break;
						}
						else
						{
							AVA_AddressIdDelete = 'F';
						}
					}
					
					if(AVA_AddressIdDelete == 'F')
					{
						nlapiDeleteRecord('customrecord_avacoordinates', searchresult[i].getId());
					}
				}
				
				var CustRec = nlapiLoadRecord('customer',nlapiGetRecordId());
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_custid', null, 'anyof', nlapiGetRecordId());
				
				var cols = new Array();
				cols[0] = new nlobjSearchColumn('custrecord_ava_custid');
				cols[1] = new nlobjSearchColumn('custrecord_ava_addid');
				
				var searchresult = nlapiSearchRecord('customrecord_avacoordinates', null, filters, cols);				
				for(var i=0; i<nlapiGetLineItemCount('addressbook'); i++)
				{
					var record, AVA_ExistFlag = 'F', AVA_ChangeFlag = 0, AVA_DelRecId;
					var AddId = nlapiGetLineItemValue('addressbook','id',i+1);
					var Latitude = nlapiGetLineItemValue('addressbook','custpage_ava_latitude',i+1);
					var Longitude = nlapiGetLineItemValue('addressbook','custpage_ava_longitude',i+1);
					
					if(AddId == null || AddId.length == 0)
					{
						AddId = CustRec.getLineItemValue('addressbook','id',i+1);
					}

					for(var customRec=0; searchresult != null && customRec < searchresult.length ; customRec++)
					{
						if(searchresult[customRec].getValue('custrecord_ava_addid') == AddId)
						{
							if(Latitude != null && Latitude.length > 0 && Longitude != null && Longitude.length > 0)
							{
								if(searchresult[customRec].getValue('custrecord_ava_latitude') != Latitude)
								{															
									nlapiSubmitField('customrecord_avacoordinates', searchresult[customRec].getId(), 'custrecord_ava_latitude', Latitude);
									AVA_ChangeFlag = 1;//Record exists but value changed
								}
								else
								{
									AVA_ChangeFlag = 2;//Record exisits but value is not changed
								}

								if(searchresult[customRec].getValue('custrecord_ava_longitude') != Longitude)
								{															
									nlapiSubmitField('customrecord_avacoordinates', searchresult[customRec].getId(), 'custrecord_ava_longitude', Longitude);
									AVA_ChangeFlag = 1;//Record exists but value changed
								}
								else
								{
									AVA_ChangeFlag = 2;//Record exisits but value is not changed
								}
							}
							else
							{
								AVA_DelRecId = searchresult[customRec].getId();
								AVA_ChangeFlag = 3;//Record exists with blank value
							}
							
							AVA_ExistFlag = 'T';
							break;
						}						
					}
					
					if(Latitude != null && Latitude.length > 0 && Longitude != null && Longitude.length > 0)
					{
						if(AVA_ExistFlag == 'F' && AVA_ChangeFlag == 0)
						{
							record = nlapiCreateRecord('customrecord_avacoordinates');	
							record.setFieldValue('custrecord_ava_custid', nlapiGetRecordId());
							record.setFieldValue('custrecord_ava_addid', AddId);
							record.setFieldValue('custrecord_ava_latitude', Latitude);
							record.setFieldValue('custrecord_ava_longitude', Longitude);
							record.setFieldValue('custrecord_ava_customerinternalid', nlapiGetRecordId());
							var recid = nlapiSubmitRecord(record);						
						}
					}
					else
					{						
						if(AVA_ExistFlag == 'T' && AVA_ChangeFlag == 3)
						{
							//Fix for Ticket 20060: In case of Scheculed scripts and Suitelet UseCode value is returning as null, as a result, mappings get deleted
							//which were done from UI, adding the if check to allow deletion to be done only when changes are being done from UI.
							if(AVA_ExecutionContext == 'userinterface')
							{							
								nlapiDeleteRecord('customrecord_avacoordinates', AVA_DelRecId);
							}
						}						
					}	
				}
			}	
			else if(type == 'delete')
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_customerinternalid', null, 'is', nlapiGetRecordId());
		
				var searchresult = nlapiSearchRecord('customrecord_avacoordinates', null, filters, null);		
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					nlapiDeleteRecord('customrecord_avacoordinates', searchresult[i].getId());
				}
			}
		}
	}
}

function AVA_CustomerAfterSubmit_Certs(type) //AvaCert2Svc
{
	var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
	if(AVA_ExecutionContext == 'userinterface')		
	{
		if(nlapiGetFieldValue('custpage_ava_readconfig') == null)
		{
			AVA_ReadConfig('1');
		}
		else
		{
			if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
			{
				AVA_LoadValuesFromField();
			}
		}
		
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('AvaCert2Svc') != -1)
		{
			if(type == 'create')
			{
				var CustRec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
				
				if(nlapiGetFieldValue('target') == 'main:entity')
				{
					var Email = nlapiGetFieldValue('custpage_ava_email');
					if(Email != null && Email.length > 0 && CustRec.getLineItemValue('addressbook','id',1) != null && CustRec.getLineItemValue('addressbook','id',1).length > 0)
					{
						var record = nlapiCreateRecord('customrecord_avacertemail');
						if(nlapiGetRecordType() == 'partner')
						{
							record.setFieldValue('custrecord_avapartnerid', nlapiGetRecordId());
						}
						else
						{
							record.setFieldValue('custrecord_avacustomerid', nlapiGetRecordId());
						}
						record.setFieldValue('custrecord_avaaddressid', CustRec.getLineItemValue('addressbook','id',1));
						record.setFieldValue('custrecord_ava_email', Email);
						record.setFieldValue('custrecord_avacustinternalid', nlapiGetRecordId());
						var recid = nlapiSubmitRecord(record);
					}
				}
				
				for(var i = 0; i < nlapiGetLineItemCount('addressbook'); i++)
				{
					var Email = nlapiGetLineItemValue('addressbook', 'custpage_ava_email', i+1);
					var AddId = nlapiGetLineItemValue('addressbook', 'id', i+1);
					
					if(AddId == null || AddId.length == 0)
					{
						AddId = CustRec.getLineItemValue('addressbook','id',i+1);
					}
					
					if(Email != null && Email.length > 0)
					{
						var record = nlapiCreateRecord('customrecord_avacertemail');
						if(nlapiGetRecordType() == 'partner')
						{
							record.setFieldValue('custrecord_avapartnerid', nlapiGetRecordId());
						}
						else
						{
							record.setFieldValue('custrecord_avacustomerid', nlapiGetRecordId());
						}
						record.setFieldValue('custrecord_avaaddressid', AddId);
						record.setFieldValue('custrecord_ava_email', Email);
						record.setFieldValue('custrecord_avacustinternalid', nlapiGetRecordId());
						var recid = nlapiSubmitRecord(record);
					}
				}
			}
			else if (type == 'edit')
			{
				var filters = new Array();
				if(nlapiGetRecordType() == 'partner')
				{
					filters[0] = new nlobjSearchFilter('custrecord_avapartnerid', null, 'anyof', nlapiGetRecordId());
				}
				else
				{
					filters[0] = new nlobjSearchFilter('custrecord_avacustomerid', null, 'anyof', nlapiGetRecordId());
				}
				
				var cols = new Array();
				if(nlapiGetRecordType() == 'partner')
				{
					cols[0] = new nlobjSearchColumn('custrecord_avapartnerid');
				}
				else
				{
					cols[0] = new nlobjSearchColumn('custrecord_avacustomerid');
				}
				cols[1] = new nlobjSearchColumn('custrecord_avaaddressid');
				
				var searchresult = nlapiSearchRecord('customrecord_avacertemail', null, filters, cols);		
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					var AVA_AddressDelete = 'F';
					for(var j=0; j < nlapiGetLineItemCount('addressbook'); j++)
					{
						if (searchresult[i].getValue('custrecord_ava_addressid') == nlapiGetLineItemValue('addressbook','id', j+1)) 
						{
							AVA_AddressIdDelete = 'T';	
							break;
						}
						else
						{
							AVA_AddressIdDelete = 'F';
						}
					}
					
					if(AVA_AddressIdDelete == 'F')
					{
						nlapiDeleteRecord('customrecord_avacertemail', searchresult[i].getId());
					}
				}

				var CustRec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
				var filters = new Array();
				if(nlapiGetRecordType() == 'partner')
				{
					filters[0] = new nlobjSearchFilter('custrecord_avapartnerid', null, 'anyof', nlapiGetRecordId());
				}
				else
				{
					filters[0] = new nlobjSearchFilter('custrecord_avacustomerid', null, 'anyof', nlapiGetRecordId());
				}
				
				var cols = new Array();
				if(nlapiGetRecordType() == 'partner')
				{
					cols[0] = new nlobjSearchColumn('custrecord_avapartnerid');
				}
				else
				{
					cols[0] = new nlobjSearchColumn('custrecord_avacustomerid');
				}
				cols[1] = new nlobjSearchColumn('custrecord_avaaddressid');
				cols[2] = new nlobjSearchColumn('custrecord_ava_email');
				
				var searchresult = nlapiSearchRecord('customrecord_avacertemail', null, filters, cols);	
				
				for(var i=0; i<nlapiGetLineItemCount('addressbook'); i++)
				{
					var record, AVA_ExistFlag = 'F', AVA_ChangeFlag = 0, AVA_DelRecId;
					var AddId = nlapiGetLineItemValue('addressbook','id',i+1);
					var Email = nlapiGetLineItemValue('addressbook','custpage_ava_email', i+1);					
					
					if(AddId == null || AddId.length == 0)
					{
						AddId = CustRec.getLineItemValue('addressbook','id',i+1);
					}
					
					for(var customRec=0; searchresult != null && customRec < searchresult.length ; customRec++)
					{
						if(searchresult[customRec].getValue('custrecord_avaaddressid') == AddId)
						{
							if(Email != null && Email.length > 0)
							{
								if(searchresult[customRec].getValue('custrecord_ava_email') != Email)
								{															
									nlapiSubmitField('customrecord_avacertemail', searchresult[customRec].getId(), 'custrecord_ava_email', Email);
									AVA_ChangeFlag = 1;//Record exisits but value changed
								}
								else
								{
									AVA_ChangeFlag = 2;//Record exisits but value is not changed
								}
							}
							else
							{
								AVA_DelRecId = searchresult[customRec].getId();
								AVA_ChangeFlag = 3;//Record exists with blank value
							}
							
							AVA_ExistFlag = 'T';
							break;
						}						
					}					
					
					if(Email != null && Email.length > 0)
					{
						if(AVA_ExistFlag == 'F' && AVA_ChangeFlag == 0)
						{
							record = nlapiCreateRecord('customrecord_avacertemail');	
							if(nlapiGetRecordType() == 'partner')
							{
								record.setFieldValue('custrecord_avapartnerid', nlapiGetRecordId());
							}
							else
							{
								record.setFieldValue('custrecord_avacustomerid', nlapiGetRecordId());
							}
							record.setFieldValue('custrecord_avaaddressid', AddId);
							record.setFieldValue('custrecord_ava_email', Email);
							record.setFieldValue('custrecord_avacustinternalid', nlapiGetRecordId());
							var recid = nlapiSubmitRecord(record);						
						}
					}
					else
					{						
						if(AVA_ExistFlag == 'T' && AVA_ChangeFlag == 3)
						{					
							nlapiDeleteRecord('customrecord_avacertemail', AVA_DelRecId);
						}						
					}															
				}
			}
			else if(type == 'delete')
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_avacustinternalid', null, 'is', nlapiGetRecordId());
		
				var searchresult = nlapiSearchRecord('customrecord_avacertemail', null, filters, null);		
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					nlapiDeleteRecord('customrecord_avacertemail', searchresult[i].getId());
				}
			}
		}
	}
}

function AVA_CreateExemptRecord()
{
	var ExemptNo = nlapiGetFieldValue('custpage_ava_exemption');
	if(ExemptNo != null && ExemptNo.length > 0)
	{
		var record = nlapiCreateRecord('customrecord_avacustomerexemptmapping');
		record.setFieldValue('custrecord_ava_exemptcustomerid', nlapiGetRecordId());
		record.setFieldValue('custrecord_ava_exemptno', nlapiGetFieldValue('custpage_ava_exemption'));
		var exemptid = nlapiSubmitRecord(record);
	}
}

function AVA_ValidateAddress(mode)
{
	if (AVA_EvaluateAddress(mode) == 1)
	{
		alert('Address Validation cannot be done. [Line1/Line2 and ZipCode] or [Line1/Line2, City, and State] is required.') ;
		return;
	}
	var config = nlapiGetFieldValue('custpage_ava_readconfig') == null ? AVA_ReadConfig('1') : AVA_LoadValuesFromField();  
	var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;
	
	var response ;
	var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
	var headers = AVA_Header(security);
	var body = AVA_ValidateShipFromAddressBody(mode);
	var soapPayload = AVA_BuildEnvelope(headers + body);
	
	var soapHead = new Array();
	soapHead['Content-Type'] = 'text/xml';
	soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/Validate"';
	
	try
	{		
		response = nlapiRequestURL(AVA_ServiceUrl + '/address/addresssvc.asmx', soapPayload, soapHead);
		
		if(response.getCode() == 200)
		{
			var soapText = response.getBody();
		    var soapXML = nlapiStringToXML(soapText);
	
			var ValidateResult = nlapiSelectNode(soapXML, "//*[name()='ValidateResult']");
			var ResultCode = nlapiSelectValue(ValidateResult, "//*[name()='ResultCode']");
			
			if(ResultCode == 'Success')
			{
				var Line1 		= nlapiSelectValues( soapXML, "//*[name()='Line1']");
				var Line2 		= nlapiSelectValues( soapXML, "//*[name()='Line2']");
				var City  		= nlapiSelectValues( soapXML, "//*[name()='City']");
				var Region  	= nlapiSelectValue( soapXML, "//*[name()='Region']");
				var PostalCode  = nlapiSelectValues( soapXML, "//*[name()='PostalCode']");
				var Country  	= nlapiSelectValues( soapXML, "//*[name()='Country']");

				var StateCheck = AVA_CheckCountryName(Region);
				Country = (StateCheck[0] == 0 ? Region : Country);
				
				var confirmMsg = 'The Validated Address is: \n';
				confirmMsg += '\n' + Line1;
				confirmMsg += ((Line2[0] != null && Line2[0].length > 0) ? ('\n' + Line2) : Line2);
				confirmMsg += '\n' + City;
				confirmMsg += '\n' + Region;
				confirmMsg += '\n' + PostalCode;
				confirmMsg += '\n' + Country + '\n';
				confirmMsg += '\n Accept Validated Address?';
				
				if(confirm(confirmMsg))
				{		
					if(mode == 0)
					{	
						nlapiSetCurrentLineItemValue('addressbook', 'addr1', Line1);
						nlapiSetCurrentLineItemValue('addressbook', 'addr2', Line2);
						nlapiSetCurrentLineItemValue('addressbook', 'city', City);
						nlapiSetCurrentLineItemValue('addressbook', 'country', Country);
						nlapiSetCurrentLineItemValue('addressbook', 'zip', PostalCode);
						nlapiSetCurrentLineItemValue('addressbook', 'state', Region);
					}	
					else if(mode == 1)
					{
						nlapiSetFieldValue('addr1', Line1);
						nlapiSetFieldValue('addr2', Line2);
						nlapiSetFieldValue('city', City);
						nlapiSetFieldValue('country', Country);
						nlapiSetFieldValue('zip', PostalCode);
						nlapiSetFieldValue('state', Region);
					}
					else if(mode == 2)
					{
						if(nlapiGetFieldValue('billaddresslist').length > 0)
						{
							var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=customeraddr&id=' + nlapiGetFieldValue('entity') + '&addid=' + nlapiGetFieldValue('billaddresslist') + '&line1=' + Line1 + '&line2=' + Line2 + '&city=' + City + '&zipcode=' + PostalCode + '&state=' + Region + '&country=' + Country, null, null);
							AVA_ValidFlag = 'T';
							nlapiSetFieldValue('billaddresslist', nlapiGetFieldValue('billaddresslist'), true);
							
							if(nlapiGetFieldValue('shipaddresslist') == nlapiGetFieldValue('billaddresslist'))
							{
								nlapiSetFieldValue('shipaddresslist',nlapiGetFieldValue('shipaddresslist'), true);
							}
					        AVA_ValidFlag = 'F';							
						}
						else
						{
							//For Custom Address
							nlapiSetFieldValue('billaddr1', Line1);
							nlapiSetFieldValue('billaddr2', Line2);
							nlapiSetFieldValue('billcity', City);
							nlapiSetFieldValue('billcountry', Country);
							nlapiSetFieldValue('billzip', PostalCode);
							nlapiSetFieldValue('billstate', Region);	

							var sbilladdress = (nlapiGetFieldValue('billattention').length > 0) ? nlapiGetFieldValue('billattention') : '';
							sbilladdress += (nlapiGetFieldValue('billaddressee').length > 0) ? (sbilladdress.length > 0) ? ('\n' + nlapiGetFieldValue('billaddressee')) : nlapiGetFieldValue('billaddressee') : '';
							sbilladdress += (sbilladdress.length > 0) ? ('\n' + Line1) : Line1;
							sbilladdress += ((Line2[0] != null && Line2[0].length > 0) ? ('\n' + Line2) : Line2);
							sbilladdress += '\n' + City + ' ' + Region + ' ' + PostalCode;
							sbilladdress += '\n' + Country;
							nlapiSetFieldValue('billaddress', sbilladdress);
						}
					}
					else if(mode == 3)
					{
						if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
						{
							var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=customeraddr&id=' + nlapiGetFieldValue('entity') + '&addid=' + nlapiGetFieldValue('shipaddresslist') + '&line1=' + Line1 + '&line2=' + Line2 + '&city=' + City + '&zipcode=' + PostalCode + '&state=' + Region + '&country=' + Country, null, null);
							AVA_ValidFlag = 'T';
							nlapiSetFieldValue('shipaddresslist', nlapiGetFieldValue('shipaddresslist'), true);

							if(nlapiGetFieldValue('billaddresslist') == nlapiGetFieldValue('shipaddresslist'))
							{
								nlapiSetFieldValue('billaddresslist',nlapiGetFieldValue('billaddresslist'), true);
							}
					        AVA_ValidFlag = 'F';							
						}
						else
						{
							nlapiSetFieldValue('shipaddr1', Line1);
							nlapiSetFieldValue('shipaddr2', Line2);
							nlapiSetFieldValue('shipcity', City);
							nlapiSetFieldValue('shipcountry', Country);
							nlapiSetFieldValue('shipzip', PostalCode);
							nlapiSetFieldValue('shipstate', Region);							
							
							//For Custom Address
							var sshipaddress = (nlapiGetFieldValue('shipattention').length > 0) ? nlapiGetFieldValue('shipattention') : '';
							sshipaddress += (nlapiGetFieldValue('shipaddressee').length > 0) ? (sshipaddress.length > 0) ? ('\n' + nlapiGetFieldValue('shipaddressee')) :  nlapiGetFieldValue('shipaddressee') : '';
							sshipaddress += (sshipaddress.length > 0) ? ('\n' + Line1) : Line1;
							sshipaddress += ((Line2[0] != null && Line2[0].length > 0) ? ('\n' + Line2) : Line2);
							sshipaddress += '\n' + City + ' ' + Region + ' ' + PostalCode;
							sshipaddress += '\n' + Country;
							nlapiSetFieldValue('shipaddress', sshipaddress);
						}
					}
				}
			}
			else
			{
				alert(nlapiSelectValue( ValidateResult, "//*[name()='Summary']"));
			}
		}	
	}
	catch(err)
	{
		alert('Address Validation was not Successful');
	}
}

function AVA_EvaluateAddress(mode)
{
	var AVALine1, AVALine2, AVACity, AVAState, AVAZip, AVACountry;
	if (mode == 0 || mode == 1)
	{
		AVALine1 = (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','addr1') : nlapiGetFieldValue('addr1'));
		AVALine2 = (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','addr2') : nlapiGetFieldValue('addr2'));
		AVACity  = (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','city') : nlapiGetFieldValue('city'));
		AVAState = (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','state') : nlapiGetFieldValue('state')); 
		AVAZip   = (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','zip') : nlapiGetFieldValue('zip'));
		AVACountry = (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','country') : nlapiGetFieldValue('country'));
	}
	else
	{
		//Mode - 2 - Transaction Bill-To Address
		//Mode - 3 - Transaction Ship-To Address
		AVALine1 = (mode == 2 ? nlapiGetFieldValue('billaddr1') : nlapiGetFieldValue('shipaddr1'));
		AVALine2 = (mode == 2 ? nlapiGetFieldValue('billaddr2') : nlapiGetFieldValue('shipaddr2'));
		AVACity  = (mode == 2 ? nlapiGetFieldValue('billcity') : nlapiGetFieldValue('shipcity'));
		AVAState = (mode == 2 ? nlapiGetFieldValue('billstate') : nlapiGetFieldValue('shipstate'));
		AVAZip   = (mode == 2 ? nlapiGetFieldValue('billzip') : nlapiGetFieldValue('shipzip'));
		AVACountry = (mode == 2 ? nlapiGetFieldValue('billcountry') : nlapiGetFieldValue('shipcountry'));
	}

	if (AVACountry.length > 0 && (AVACountry == 'US' || AVACountry == 'CA'))
	{
		var bOption1 = ((AVALine1.length > 0 || AVALine2.length > 0) && AVAZip.length > 0) ? true : false;
		var bOption2 = ((AVALine1.length > 0 || AVALine2.length > 0) && AVACity.length > 0 && AVAState.length > 0) ? true : false;

		if(bOption1 || bOption2)
		{
			return 0;
		}
		else
		{
			return 1;
		}
	}
	else
	{
		return 0;
	}
}

function AVA_ValidateShipFromAddressBody(mode)
{
 	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<Validate xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<ValidateRequest>\n';
 				soap += '\t\t\t\t<Address>\n';
				if (mode == 0 || mode == 1)
				{
 					soap += '\t\t\t\t\t<AddressCode>1</AddressCode>\n';
 					soap += '\t\t\t\t\t<Line1><![CDATA[' + (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','addr1') : nlapiGetFieldValue('addr1')) + ']]></Line1>\n';
 					soap += '\t\t\t\t\t<Line2><![CDATA[' + (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','addr2') : nlapiGetFieldValue('addr2')) + ']]></Line2>\n';
 					soap += '\t\t\t\t\t<Line3/>\n';
 					soap += '\t\t\t\t\t<City><![CDATA[' + (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','city') : nlapiGetFieldValue('city')) + ']]></City>\n';
 					soap += '\t\t\t\t\t<Region><![CDATA[' + (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','state') : nlapiGetFieldValue('state')) + ']]></Region>\n';
 					soap += '\t\t\t\t\t<PostalCode><![CDATA[' + (mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','zip') : nlapiGetFieldValue('zip')) + ']]></PostalCode>\n';
					var ReturnCountryName = AVA_CheckCountryName((mode == 0 ? nlapiGetCurrentLineItemValue('addressbook','country') : nlapiGetFieldValue('country')));
 					soap += '\t\t\t\t\t<Country><![CDATA[' + ReturnCountryName[1] + ']]></Country>\n';
				}
				else
				{
					//Mode - 2 - Transaction Bill-To Address
					//Mode - 3 - Transaction Ship-To Address
					soap += '\t\t\t\t\t<Line1><![CDATA[' + (mode == 2 ? nlapiGetFieldValue('billaddr1') : nlapiGetFieldValue('shipaddr1')) + ']]></Line1>\n';
					soap += '\t\t\t\t\t<Line2><![CDATA[' + (mode == 2 ? nlapiGetFieldValue('billaddr2') : nlapiGetFieldValue('shipaddr2')) + ']]></Line2>\n';
					soap += '\t\t\t\t\t<Line3/>\n';
					soap += '\t\t\t\t\t<City><![CDATA[' + (mode == 2 ? nlapiGetFieldValue('billcity') : nlapiGetFieldValue('shipcity')) + ']]></City>\n';
					soap += '\t\t\t\t\t<Region><![CDATA[' + (mode == 2 ? nlapiGetFieldValue('billstate') : nlapiGetFieldValue('shipstate')) + ']]></Region>\n';
					soap += '\t\t\t\t\t<PostalCode><![CDATA[' + (mode == 2 ? nlapiGetFieldValue('billzip') : nlapiGetFieldValue('shipzip')) + ']]></PostalCode>\n';
					var ReturnCountryName = AVA_CheckCountryName((mode == 2 ? nlapiGetFieldValue('billcountry') : nlapiGetFieldValue('shipcountry')));
					soap += '\t\t\t\t\t<Country><![CDATA[' + ReturnCountryName[1] + ']]></Country>\n';
				}
 				soap += '\t\t\t\t</Address>\n';
				soap += '\t\t\t\t<TextCase>' + ((AVA_AddUpperCase == true || AVA_AddUpperCase == 'T') ? 'Upper' : 'Default') + '</TextCase>\n';
 				soap += '\t\t\t\t<Coordinates>false</Coordinates>\n';
 			soap += '\t\t\t</ValidateRequest>\n';
 		soap += '\t\t</Validate>\n';
 	soap += '\t</soap:Body>\n';
 	
 	return soap;
}


//script to copy all the entity use codes to name field after enabling Include Name field
function AVA_CopyEntityUseCodes()
{
	while(true)
	{
		if(nlapiGetContext().getRemainingUsage() > 1000)
		{
			var columns = new Array();
			columns[0] = new nlobjSearchColumn('name');
	 		columns[1] = new nlobjSearchColumn('custrecord_ava_entityid');
			
			var searchResult = nlapiSearchRecord('customrecord_avaentityusecodes', null, null, columns);
			
			if(searchResult != null)
			{
				for(var i=0; nlapiGetContext().getRemainingUsage() > 1000 && i<searchResult.length; i++)
				{
					if(searchResult[i].getValue('name') != searchResult[i].getValue('custrecord_ava_entityid'))
					{
						nlapiSubmitField('customrecord_avaentityusecodes', searchResult[i].getId(), 'name', searchResult[i].getValue('custrecord_ava_entityid'), false);
					}
				}
				
				//this break was added assuming that there would be less entitycode records as searchresult will always be more than 0.
				if(nlapiGetContext().getRemainingUsage() > 1000 && i == searchResult.length)
				{
					break;
				}
			}
		}
		else
		{
			nlapiScheduleScript('customscript_ava_copyentityusecode_sched', null, null);
			break;
		}		
	}	
}


//To update mappings after running the above script, make following changes to AVAENTITYUSEMAPPING custom record structure: 
//-Change id of "Entity/Use Code" field from custrecord_ava_entityusemap to custrecord_ava_entityusemap_old and name to "Entity/Use Code_Old"
//-Add "Entity/Use Code" of type List/Record, sourcing AVAENTITYUSECODES
//-Then run the below script
function AVA_UpdateEntityMappings()
{
	nlapiLogExecution('Debug','AVA_UpdateEntityMappings:','Start');		
	
	while(true)
	{
		if(nlapiGetContext().getRemainingUsage() > 1000)
		{
			nlapiLogExecution('Debug','AVA_UpdateEntityMappings:','In If');	
			var column = new Array();
			column[0] = new nlobjSearchColumn('custrecord_ava_customerid');
			column[1] = new nlobjSearchColumn('custrecord_ava_addressid');
			column[2] = new nlobjSearchColumn('custrecord_ava_entityusemap');
			nlapiLogExecution('Debug','AVA_UpdateEntityMappings:','Columns set');	
			var searchResult = nlapiSearchRecord('customrecord_avaentityusemapping', null, null, column);
			nlapiLogExecution('Debug','AVA_UpdateEntityMappings:','Search Done');	
			if(searchResult != null)
			{
				for(var i=0; nlapiGetContext().getRemainingUsage() > 1000 && i<searchResult.length; i++)
				{
					nlapiLogExecution('Debug','Search Length:',searchResult.length);		
					
					var record = nlapiCreateRecord('customrecord_avaentityusemapping_new');		
					record.setFieldValue('custrecord_ava_customerid_new', searchResult[i].getValue('custrecord_ava_customerid'));
					record.setFieldValue('custrecord_ava_addressid_new', searchResult[i].getValue('custrecord_ava_addressid'));
					record.setFieldText('custrecord_ava_entityusemap_new', searchResult[i].getValue('custrecord_ava_entityusemap'));
					record.setFieldValue('custrecord_ava_custinternalid', searchResult[i].getValue('custrecord_ava_customerid'));
					var recid = nlapiSubmitRecord(record);
					
					nlapiDeleteRecord('customrecord_avaentityusemapping', searchResult[i].getId());
				}
			}
			else
			{
				break;
			}
		}
		else
		{
			nlapiScheduleScript('customscript_ava_updatemappings_sched', null, null);
			break;
		}		
	}	
}

function AVA_EntitySave()
{
	//Check for required fields
	if (nlapiGetFieldValue('custrecord_ava_entityid') != null && nlapiGetFieldValue('custrecord_ava_entityid').length == 0)
	{
		alert('Required fields are not entered');
		return false;
	}
	
	//Check for name field, if blank populate Entity/Use Code ID before save
	if (nlapiGetFieldValue('name') != null && nlapiGetFieldValue('name').length > 0)
	{
		//Check if Name field equals Entity/Use Code ID
		if (nlapiGetFieldValue('name') != nlapiGetFieldValue('custrecord_ava_entityid'))
		{
			var retVal = confirm('Name field must be same as Entity/Use Code ID. Press Ok to change and save the record.');
			if (retVal == true)
			{
				nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_ava_entityid'));
			}
			else
			{
				return false;
			}
		}
	}
	else
	{
		nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_ava_entityid'));
	}

	//Check if the record already exists
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_entityid', null, 'is', nlapiGetFieldValue('custrecord_ava_entityid'));
	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_ava_entityid'); 

	var searchresult = nlapiSearchRecord('customrecord_avaentityusecodes', null, filters, columns);
	if (searchresult != null && searchresult.length > 0)
	{
		alert('The Entity/Use Code ID already exists. You must enter a unique Entity/Use Code ID for each record you create.');
		return false;
	}
	return true;
}