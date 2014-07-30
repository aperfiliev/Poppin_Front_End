/******************************************************************************************************
	Script Name - 	AVA_CertFunctions.js
	Company - 		Avalara Technologies Pvt Ltd.
******************************************************************************************************/

function AVA_CreateCustomerAvaCert()
{
	var config = nlapiGetFieldValue('custpage_ava_readconfig') == null ? AVA_ReadConfig('1') : AVA_LoadValuesFromField();  
	if (AVA_CustomerCode != null && AVA_CustomerCode > 7)
	{
		alert("Customer cannot be created. " + AVA_ErrorCodeDesc(24));
		return;
	}
	
	var CustomerCode = AVA_GetCustomerInfo();
	var response ;
	var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
	var headers = AVA_Header(security);
	var body = AVA_CreateCustomerAvaCertBody(CustomerCode);
	var soapPayload = AVA_BuildEnvelope(headers + body);
	
	var soapHead = new Array();
	soapHead['Content-Type'] = 'text/xml';
	soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/CustomerSave"';
	
	try
	{		
		response = nlapiRequestURL(AVA_ServiceUrl + '/avacert2/avacert2svc.asmx', soapPayload, soapHead);
		
		if(response.getCode() == 200)
		{
			var soapText = response.getBody();
		    var soapXML = nlapiStringToXML(soapText);
			
			var CustomerSaveResult = nlapiSelectNode(soapXML, "//*[name()='CustomerSaveResult']");
			var ResultCode = nlapiSelectValue(CustomerSaveResult, "//*[name()='ResultCode']");
			
			if(ResultCode == 'Success')
			{		
				alert('The Customer record has been successfully created in AvaCert.');				
			}
			else
			{
				alert(nlapiSelectValue( CustomerSaveResult, "//*[name()='Summary']") + '.. ' + nlapiSelectValue( CustomerSaveResult, "//*[name()='Details']"));
			}
		}
		else
		{ 
			alert("AvaCert call failed. Please contact the Administrator." + response.getCode());			
		}	
	}
	catch(err)
	{
		alert('Adding Customer on AvaCert was not successful.');
	}
	
}

function AVA_CreateCustomerAvaCertBody(CustomerCode)
{
	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<CustomerSave xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<CustomerSaveRequest>\n';
 				soap += '\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
	 				soap += '\t\t\t\t\t<Customer>\n';
	 					
						var phoneNumber = ((nlapiGetCurrentLineItemValue('addressbook','phone') != null && nlapiGetCurrentLineItemValue('addressbook','phone').length > 0) ? nlapiGetCurrentLineItemValue('addressbook','phone') : nlapiGetFieldValue('phone'));
						phoneNumber = phoneNumber.replace(/\(|\)/gi, "");	
						
						var faxNumber = nlapiGetFieldValue('fax');
						faxNumber = faxNumber.replace(/\(|\)/gi, "");
						
						var email = ((nlapiGetCurrentLineItemValue('addressbook','custpage_ava_email') != null && nlapiGetCurrentLineItemValue('addressbook','custpage_ava_email').length > 0) ? nlapiGetCurrentLineItemValue('addressbook','custpage_ava_email') : nlapiGetFieldValue('email'));
						
	 					soap += '\t\t\t\t\t\t<CustomerCode><![CDATA[' + CustomerCode[0].substring(0,49) + ']]></CustomerCode>\n';
	 					soap += '\t\t\t\t\t\t<BusinessName><![CDATA[' + CustomerCode[1].substring(0,49) + ']]></BusinessName>\n';
	 					soap += '\t\t\t\t\t\t<Attn><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','attention') + ']]></Attn>\n';
	 					soap += '\t\t\t\t\t\t<Address1><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','addr1') + ']]></Address1>\n';
	 					soap += '\t\t\t\t\t\t<Address2><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','addr2') + ']]></Address2>\n';
	 					soap += '\t\t\t\t\t\t<City><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','city') + ']]></City>\n';
	 					soap += '\t\t\t\t\t\t<State><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','state') + ']]></State>\n';
						var ReturnCountryName = AVA_CheckCountryName(nlapiGetCurrentLineItemValue('addressbook','country'));
	 					soap += '\t\t\t\t\t\t<Country><![CDATA[' + ReturnCountryName[1] + ']]></Country>\n';
	 					soap += '\t\t\t\t\t\t<Zip><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','zip') + ']]></Zip>\n';
	 					soap += '\t\t\t\t\t\t<Phone><![CDATA[' + phoneNumber + ']]></Phone>\n';
	 					soap += '\t\t\t\t\t\t<Fax><![CDATA[' + faxNumber + ']]></Fax>\n';
	 					soap += '\t\t\t\t\t\t<Email><![CDATA[' + email + ']]></Email>\n';
	 				soap += '\t\t\t\t\t</Customer>\n';
 			soap += '\t\t\t</CustomerSaveRequest>\n';
 		soap += '\t\t</CustomerSave>\n';
 	soap += '\t</soap:Body>\n';
 	
 	return soap;
}
			
function AVA_InitiateExemptCert()
{
	if(nlapiGetCurrentLineItemValue('addressbook','custpage_ava_communicationmode') == null || nlapiGetCurrentLineItemValue('addressbook','custpage_ava_communicationmode') == 0)
	{
		alert('The Exemption Certificate Workflow Request cannot be initiated because Communication mode is missing');
		return;
	}
	/*if(nlapiGetCurrentLineItemValue('addressbook','custpage_ava_communicationmode') == 'FAX' && (nlapiGetFieldValue('fax') == null || nlapiGetFieldValue('fax').length <= 0))
	{
		alert('The Exemption Certificate Workflow Request cannot be initiated because Fax information is missing.');
		return;
	}
	
	if(nlapiGetCurrentLineItemValue('addressbook','custpage_ava_communicationmode') == 'EMAIL' && (nlapiGetCurrentLineItemValue('addressbook','custpage_ava_email') == null || nlapiGetCurrentLineItemValue('addressbook','custpage_ava_email').length <= 0))
	{
		if(nlapiGetFieldValue('email') == null || nlapiGetFieldValue('email').length <= 0)
		{
			alert('The Exemption Certificate Workflow Request cannot be initiated because Email information is missing.');
			return;
		}
	}
	
	if(nlapiGetCurrentLineItemValue('addressbook','custpage_ava_custommessage') == null || (nlapiGetCurrentLineItemValue('addressbook','custpage_ava_custommessage') != null && nlapiGetCurrentLineItemValue('addressbook','custpage_ava_custommessage').length <= 0))
	{
		alert('The Exemption Certificate Workflow Request cannot be initiated because Custom Message is missing.');
		return;
	}*/
	
	var config = nlapiGetFieldValue('custpage_ava_readconfig') == null ? AVA_ReadConfig('1') : AVA_LoadValuesFromField();  
	if (AVA_CustomerCode != null && AVA_CustomerCode > 7)
	{
		alert("The Exemption Certificate Workflow Request cannot be initiated. " + AVA_ErrorCodeDesc(24));
		return;
	}

	var CustomerCode = AVA_GetCustomerInfo();
	var response ;
	var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
	var headers = AVA_Header(security);
	var body = AVA_InitiateExemptCertBody(CustomerCode);
	var soapPayload = AVA_BuildEnvelope(headers + body);
	
	var soapHead = new Array();
	soapHead['Content-Type'] = 'text/xml';
	soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/CertificateRequestInitiate"';
	
	try
	{		
		response = nlapiRequestURL(AVA_ServiceUrl + '/avacert2/avacert2svc.asmx', soapPayload, soapHead);
		
		if(response.getCode() == 200)
		{
			var soapText = response.getBody();
		    var soapXML = nlapiStringToXML(soapText);

			var CertificateRequestInitiateResult = nlapiSelectNode(soapXML, "//*[name()='CertificateRequestInitiateResult']");
			var ResultCode = nlapiSelectValue(CertificateRequestInitiateResult, "//*[name()='ResultCode']");
						
			if(ResultCode == 'Success')
			{		
				var TrackingCode = nlapiSelectValue(CertificateRequestInitiateResult, "//*[name()='TrackingCode']");
				alert('The Exemption Certificate Workflow Request has been successfully generated. Tracking Code is � ' + TrackingCode);				
			}
			else
			{
				alert(nlapiSelectValue( CertificateRequestInitiateResult, "//*[name()='Summary']") + '.. ' + nlapiSelectValue( CertificateRequestInitiateResult, "//*[name()='Details']"));
			}
		}	
		else
		{ 
			alert("AvaCert call failed. Please contact the Administrator.");			
		}
	}
	catch(err)
	{
		alert('Initiating Exemption Certificate on AvaCert was not successful.');
	}
}

function AVA_InitiateExemptCertBody(CustomerCode)
{
	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<CertificateRequestInitiate xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<CertificateRequestInitiateRequest>\n';
 				soap += '\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
				soap += '\t\t\t\t<CustomerCode><![CDATA[' + CustomerCode[0] + ']]></CustomerCode>\n';
 				soap += '\t\t\t\t<CommunicationMode><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','custpage_ava_communicationmode') + ']]></CommunicationMode>\n';
 				soap += '\t\t\t\t<CustomMessage><![CDATA[' + nlapiGetCurrentLineItemValue('addressbook','custpage_ava_custommessage') + ']]></CustomMessage>\n'; 				
 			soap += '\t\t\t</CertificateRequestInitiateRequest>\n';
 		soap += '\t\t</CertificateRequestInitiate>\n';
 	soap += '\t</soap:Body>\n';
 	
 	return soap;
}
	
function AVA_GetCustomerInfo()
{
	var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;
	var CustomerCode = new Array(); // 0-Customer/Partner ID, 1-Customer/Partner Name
	switch(AVA_CustomerCode)
	{
		case '0':
		case '6':
			CustomerCode[0] = nlapiGetFieldValue('entityid');
			CustomerCode[1] = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
			break;
			
		case '1':
			var CustomerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
			CustomerCode[0] = CustomerName;
			CustomerCode[1] = CustomerName;
			break;

		case '2':
			var CustomerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
			CustomerCode[0] = nlapiGetRecordId();
			CustomerCode[1] = CustomerName;
			break;

		case '3':
		case '7':
			if(nlapiGetRecordType() == 'partner')
			{
				var PartnerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
				CustomerCode[0] = nlapiGetFieldValue('entityid');
				CustomerCode[1] = PartnerName;
			}
			else
			{
				if (nlapiGetContext().getFeature('multipartner') != true && nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
				{
					var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=partner&id=' + nlapiGetFieldValue('partner'), null, null );
					var fieldValues = response.getBody().split('+');
					CustomerCode[0] = fieldValues[5];
					CustomerCode[1] = (fieldValues[0] == true) ? (fieldValues[1] + ((fieldValues[2] != null && fieldValues[2].length > 0)? ( ' ' + fieldValues[2] + ' ' ) : ' ') + fieldValues[3]) : (fieldValues[4]);
					
				}
				else
				{
					var CustomerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
					CustomerCode[0] = nlapiGetFieldValue('entityid');
					CustomerCode[1] = CustomerName;
				}
			}
			break;

		case '4':
			if(nlapiGetRecordType() == 'partner')
			{
				var PartnerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
				CustomerCode[0] = PartnerName;
				CustomerCode[1] = PartnerName;
			}
			else
			{
				if (nlapiGetContext().getFeature('multipartner') != true && nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
				{
					var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=partner&id=' + nlapiGetFieldValue('partner'), null, null );
					var fieldValues = response.getBody().split('+');
					CustomerCode[0] = (fieldValues[0] == true) ? (fieldValues[1] + ((fieldValues[2] != null && fieldValues[2].length > 0)? ( ' ' + fieldValues[2] + ' ' ) : ' ') + fieldValues[3]) : (fieldValues[4]);
					CustomerCode[1] = (fieldValues[0] == true) ? (fieldValues[1] + ((fieldValues[2] != null && fieldValues[2].length > 0)? ( ' ' + fieldValues[2] + ' ' ) : ' ') + fieldValues[3]) : (fieldValues[4]);
				}
				else
				{
					var CustomerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
					CustomerCode[0] = CustomerName;
					CustomerCode[1] = CustomerName;
				}
			}
			break;

		case '5':
			if(nlapiGetRecordType() == 'partner')
			{
				var PartnerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
				CustomerCode[0] = nlapiGetRecordId();
				CustomerCode[1] = PartnerName;
			}
			else
			{
				if (nlapiGetContext().getFeature('multipartner') != true && nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
				{
					var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=partner&id=' + nlapiGetFieldValue('partner'), null, null );				
					var fieldValues = response.getBody().split('+');
					CustomerCode[0] = nlapiGetFieldValue('partner');
					CustomerCode[1] = (fieldValues[0] == true) ? (fieldValues[1] + ((fieldValues[2] != null && fieldValues[2].length > 0)? ( ' ' + fieldValues[2] + ' ' ) : ' ') + fieldValues[3]) : (fieldValues[4]);
				}
				else
				{
					var CustomerName = (nlapiGetFieldValue('isperson') == 'T') ? (nlapiGetFieldValue('firstname') + ((nlapiGetFieldValue('middlename') != null && nlapiGetFieldValue('middlename').length > 0)? ( ' ' + nlapiGetFieldValue('middlename') + ' ' ) : ' ') + nlapiGetFieldValue('lastname')) : (nlapiGetFieldValue('companyname'));
					CustomerCode[0] = nlapiGetRecordId();
					CustomerCode[1] = CustomerName;
				}
			}
			break;
			
		default:
			CustomerCode = 0;
			break;
	}
	return CustomerCode;
}

function AVA_CertificatesForm(request, response)
{
	if(AVA_CheckService('AvaCert2Svc') == 0 && AVA_CheckSecurity( 26 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_CertificatesForm = nlapiCreateForm('Get Certificate(s)/Status');
			AVA_CertificatesForm.setTitle('Get Certificate(s)/Status');
			AVA_CertificatesForm.setScript('customscript_avacertificates_client');
			
			AVA_ReadConfig('0');
			
			AVA_CertificatesForm.addField('ava_customercode', 'text', 'Customer Code').setDisplayType('hidden');
			AVA_CertificatesForm.getField('ava_customercode').setDefaultValue(AVA_CustomerCode);
			
			AVA_CertificatesForm.addField('ava_customerid', 'text', 'Customer Id').setDisplayType('hidden');
			AVA_CertificatesForm.addField('ava_partnerid', 'text', 'Customer Id').setDisplayType('hidden');
			
			AVA_CertificatesForm.addField('ava_record',	'label', 'Record type').setLayoutType('startrow');
			AVA_CertificatesForm.addField('ava_recordtype', 'radio', 'Customer', 'customer').setLayoutType('midrow');
			if(nlapiGetContext().getFeature('prm') == true)
			{
				AVA_CertificatesForm.addField('ava_recordtype', 'radio', 'Partner', 'partner').setLayoutType('midrow');
				AVA_CertificatesForm.getField('ava_recordtype').setDefaultValue('customer');
			}
			else
			{
				AVA_CertificatesForm.getField('ava_recordtype').setDefaultValue('customer');
				AVA_CertificatesForm.getField('ava_record').setDisplayType('hidden');
				AVA_CertificatesForm.getField('ava_recordtype').setDisplayType('hidden');
			}
			
			AVA_CertificatesForm.addField('ava_customer', 'select',	'Customer', 'customer').setLayoutType('startrow');
			if(nlapiGetContext().getFeature('prm') == true)
			{
				AVA_CertificatesForm.addField('ava_partner', 'select', 'Partner', 'partner').setLayoutType('midrow');
				AVA_CertificatesForm.getField('ava_partner').setDisplayType('disabled');
				if(AVA_CustomerCode != null && (AVA_CustomerCode == 0 || AVA_CustomerCode == 1 || AVA_CustomerCode == 2 || AVA_CustomerCode == 6))
				{
					AVA_CertificatesForm.getField('ava_recordtype').setDisplayType('disabled');
					AVA_CertificatesForm.getField('ava_partner').setDisplayType('disabled');
				}
			}
			
			AVA_CertificatesForm.addButton('ava_getcertificate','Retrieve Certificate(s)', "AVA_GetCertificates_UI()");
			AVA_CertificatesForm.addButton('ava_getcertificatestatus','Retrieve Certificate(s) Status', "AVA_GetCertificatesStatus_UI()");
			response.writePage(AVA_CertificatesForm);
		}
	}
}

function AVA_CertficatesChanges(type, name)
{
	if(name == 'ava_recordtype')
	{
		if(nlapiGetFieldValue('ava_recordtype') == 'partner')
		{
			nlapiDisableField('ava_customer', true);
			nlapiDisableField('ava_partner', false);
		}
		else
		{

			nlapiDisableField('ava_partner', true);
			nlapiDisableField('ava_customer', false);
		}
	}
	if(name == 'ava_customer')
	{
		if(nlapiGetFieldValue('ava_customer') != null && nlapiGetFieldValue('ava_customer').length > 0)
		{
			var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', false) + '&type=customer&id=' + nlapiGetFieldValue('ava_customer'), null, null );
			nlapiSetFieldValue('ava_customerid', JSON.stringify(response.getBody().split('+')));
		}
		else
		{
			nlapiSetFieldValue('ava_customerid', '');
		}
	}
	if(name == 'ava_partner')
	{
		if(nlapiGetFieldValue('ava_partner') != null && nlapiGetFieldValue('ava_partner').length > 0)
		{
			var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', false) + '&type=partner&id=' + nlapiGetFieldValue('ava_partner'), null, null );
			nlapiSetFieldValue('ava_partnerid', JSON.stringify(response.getBody().split('+')));
		}
		else
		{
			nlapiSetFieldValue('ava_partnerid', '');
		}
	}
}

function AVA_GetCertificates_UI()
{
	if (nlapiGetFieldValue('ava_customercode') != null && nlapiGetFieldValue('ava_customercode') > 7)
	{
		alert("Certificate(s) cannot be retrieved. " + AVA_ErrorCodeDesc(24));
		return;
	}
	
	AVA_RedirectToSuitelet('0');
}

function AVA_GetCertificatesStatus_UI()
{
	if (nlapiGetFieldValue('ava_customercode') != null && nlapiGetFieldValue('ava_customercode') > 7)
	{
		alert("Certificate(s) status cannot be retrieved. " + AVA_ErrorCodeDesc(24));
		return;
	}
	
	AVA_RedirectToSuitelet('1');
}

function AVA_RedirectToSuitelet(type) //type..... 0 - Certificates Suitelet, 1 - Certificates Status Suitelet
{
	var CustomerCode;
	
	if(nlapiGetFieldValue('ava_recordtype') == 'customer')
	{
		if(nlapiGetFieldValue('ava_customer') == null || nlapiGetFieldValue('ava_customer').length == 0)
		{
			alert('Please select Customer');
			return;
		}
		var customerid = JSON.parse(nlapiGetFieldValue('ava_customerid'));
	}
	else
	{
		if(nlapiGetFieldValue('ava_partner') == null || nlapiGetFieldValue('ava_partner').length == 0)
		{
			alert('Please select Partner');
			return;
		}
		var customerid = JSON.parse(nlapiGetFieldValue('ava_partnerid'));
	}
	
	switch(nlapiGetFieldValue('ava_customercode'))
	{
		case '0':
		case '6':
			CustomerCode = customerid[5];
			break;
			
		case '1':
			var CustomerName = (customerid[0] == 'T') ? (customerid[1] + ((customerid[2] != 'null' && customerid[2].length > 0)? ( ' ' + customerid[2] + ' ' ) : ' ') + customerid[3]) : (customerid[4]);
			CustomerCode = CustomerName;
			break;
	
		case '2':
			CustomerCode = nlapiGetFieldValue('ava_customer');
			break;
	
		case '3':
		case '7':
			if(nlapiGetFieldValue('ava_recordtype') == 'partner')
			{
				CustomerCode = customerid[5];
			}
			else
			{
				if (nlapiGetContext().getFeature('multipartner') != true && customerid[6] != 'null' && customerid[6].length > 0)
				{
					var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', false) + '&type=partner&id=' + customerid[6], null, null );
					var fieldValues = response.getBody().split('+');
					CustomerCode = fieldValues[5];
				}
				else
				{
					CustomerCode = customerid[5];
				}
			}
			break;
	
		case '4':
			if(nlapiGetFieldValue('ava_recordtype') == 'partner')
			{
				var PartnerName = (customerid[0] == 'T') ? (customerid[1] + ((customerid[2] != 'null' && customerid[2].length > 0)? ( ' ' + customerid[2] + ' ' ) : ' ') + customerid[3]) : (customerid[4]);
				CustomerCode = PartnerName;
			}
			else
			{
				if (nlapiGetContext().getFeature('multipartner') != true && customerid[6] != 'null' && customerid[6].length > 0)
				{
					var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', false) + '&type=partner&id=' + customerid[6], null, null );
					var fieldValues = response.getBody().split('+');
					CustomerCode = (fieldValues[0] == 'T') ? (fieldValues[1] + ((fieldValues[2] != 'null' && fieldValues[2].length > 0)? ( ' ' + fieldValues[2] + ' ' ) : ' ') + fieldValues[3]) : (fieldValues[4]);
				}
				else
				{
					var CustomerName = (customerid[0] == 'T') ? (customerid[1] + ((customerid[2] != 'null' && customerid[2].length > 0)? ( ' ' + customerid[2] + ' ' ) : ' ') + customerid[3]) : (customerid[4]);
					CustomerCode = CustomerName;
				}
			}
			break;
	
		case '5':
			if(nlapiGetFieldValue('ava_recordtype') == 'partner')
			{
				CustomerCode = nlapiGetFieldValue('ava_partner');
			}
			else
			{
				if (nlapiGetContext().getFeature('multipartner') != true && customerid[6] != 'null' && customerid[6].length > 0)
				{
					CustomerCode = customerid[6];
				}
				else
				{
					CustomerCode = nlapiGetFieldValue('ava_customer');
				}
			}
			break;
			
		default:
			CustomerCode = 0;
			break;
	}
	
	if(type == '0')
	{
		var URL = nlapiResolveURL('SUITELET', 'customscript_avagetcertificates_suitelet', 'customdeploy_avagetcertificates', false);
	}
	else
	{
		var URL = nlapiResolveURL('SUITELET', 'customscript_avacertstatus_suitelet', 'customdeploy_avacertstatus', false);
	}
	URL = URL + '&customercode=' + CustomerCode;
	window.open(URL, '_blank');
}

function AVA_GetCertificates()
{
	var config = nlapiGetFieldValue('custpage_ava_readconfig') == null ? AVA_ReadConfig('1') : AVA_LoadValuesFromField();
	if (AVA_CustomerCode != null && AVA_CustomerCode > 7)
	{
		alert("Certificate(s) cannot be retrieved. " + AVA_ErrorCodeDesc(24));
		return;
	}
	
	var CustomerCode = AVA_GetCustomerInfo();
	var URL = nlapiResolveURL('SUITELET', 'customscript_avagetcertificates_suitelet', 'customdeploy_avagetcertificates', false);
	URL = URL + '&customercode=' + CustomerCode[0];
	window.open(URL, '_blank');
}

function AVA_CertificatesStatus()
{
	var config = nlapiGetFieldValue('custpage_ava_readconfig') == null ? AVA_ReadConfig('1') : AVA_LoadValuesFromField();
	if (AVA_CustomerCode != null && AVA_CustomerCode > 7)
	{
		alert("Certificate(s) status cannot be retrieved. " + AVA_ErrorCodeDesc(24));
		return;
	}
	
	var CustomerCode = AVA_GetCustomerInfo();
	var URL = nlapiResolveURL('SUITELET', 'customscript_avacertstatus_suitelet', 'customdeploy_avacertstatus', false);
	URL = URL + '&customercode=' + CustomerCode[0];
	window.open(URL, '_blank');
}

function AVA_GetCertificatesDetails(request, response)
{
	if(AVA_CheckService('AvaCert2Svc') == 0 && AVA_CheckSecurity( 24 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_GetCertificatesDetailsForm = nlapiCreateForm('Certificate(s) Details');
			AVA_GetCertificatesDetailsForm.setTitle('Certificate(s) Details');
			AVA_GetCertificatesDetailsForm.setScript('customscript_avaentity_client');
			
			AVA_ReadConfig('0');
			
			var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
			var headers = AVA_Header(security);
			var body = AVA_CertificateGetBody(request.getParameter('customercode'));
			var soapPayload = AVA_BuildEnvelope(headers + body);
	
			var soapHead = new Array();
			soapHead['Content-Type'] = 'text/xml';
			soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/CertificateGet"';
	
			try
			{
				var AVA_CertificateListResponse = nlapiRequestURL(AVA_ServiceUrl + '/avacert2/avacert2svc.asmx', soapPayload, soapHead);
				if(AVA_CertificateListResponse.getCode() == 200)
				{
					var soapText = AVA_CertificateListResponse.getBody();
				    var soapXML = nlapiStringToXML(soapText);
				    var AVA_ResponseCertificateArray = new Array();
				    
				    var CertificateGetResult = nlapiSelectNode(soapXML, "//*[name()='CertificateGetResult']");
				    var ResultCode = nlapiSelectValue(CertificateGetResult, "//*[name()='ResultCode']");
	
				    if(ResultCode == 'Success')
					{
				    	AVA_GetCertificatesDetailsForm.addField('ava_customercode', 'text', 'Customer Code');
					    AVA_GetCertificatesDetailsForm.getField('ava_customercode').setDefaultValue(request.getParameter('customercode'));
					    AVA_GetCertificatesDetailsForm.getField('ava_customercode').setDisplayType('inline');
					    
					    AVA_GetCertificatesDetailsForm.addField('ava_folderid', 'text', 'Folder Id');
					    AVA_GetCertificatesDetailsForm.getField('ava_folderid').setDisplayType('hidden');
					    
					    var AVA_FileFormat = AVA_GetCertificatesDetailsForm.addField('ava_fileformat', 'select', 'Select File Format');
					    AVA_FileFormat.addSelectOption('PNG','PNG');
					    AVA_FileFormat.addSelectOption('PDF','PDF');
					    AVA_FileFormat.setDefaultValue('PNG');
					    
					    var AVA_CertificateList = AVA_GetCertificatesDetailsForm.addSubList('custpage_avacertlist', 'list','AvaTax Certificate(s) Details');
	
					    AVA_CertificateList.addField('ava_getimage', 'radio', 'Get Image');
					    AVA_CertificateList.addField('ava_certid','text', 'ACertID');
					    AVA_CertificateList.addField('ava_jurisdiction','text', 'Jurisdiction');
					    AVA_CertificateList.addField('ava_certstatus','text', 'Cert Status');
					    AVA_CertificateList.addField('ava_reviewstatus','text', 'Review Status');
					    AVA_CertificateList.addField('ava_address','text', 'Address');
					    AVA_CertificateList.addField('ava_certusage','text', 'Certificate Usage');
					    AVA_CertificateList.addField('ava_exemptformname','text', 'Exemption Form Name');
					    AVA_CertificateList.addField('ava_exemptreasoncode','text', 'Exemption Reason Code');
					    AVA_CertificateList.addField('ava_pagecount','text', 'Pages');
					    AVA_CertificateList.addField('ava_page','text', 'Page Number');
					    AVA_CertificateList.getField('ava_page').setDisplayType('entry');
					    
					    AVA_GetCertificatesDetailsForm.addButton('custpage_ava_getimage','Get Certificate', "AVA_GetCertImage()");
					    
						var Certificates = nlapiSelectNode(CertificateGetResult, "//*[name()='Certificates']");
						AVA_ResponseCertificateArray = nlapiSelectNodes(Certificates, "./*[name()='Certificate']");
						
						var filter = new Array();
						filter[0] = new nlobjSearchFilter('name', null, 'is', 'AVA_ExemptionCertificate');
						
						var column = new Array();
					 	column[0] = new nlobjSearchColumn('internalid'); 
				
						var searchresult = nlapiSearchRecord('folder', null, filter, column);
	
						if(searchresult == null)
						{
							var filters = new Array();
							filters[0] = new nlobjSearchFilter('name', null, 'is', 'Bundle 1894');
							
							var columns = new Array();
						 	columns[0] = new nlobjSearchColumn('internalid'); 
					
							var searchresult1 = nlapiSearchRecord('folder', null, filters, columns);
							var folder = nlapiCreateRecord('folder');
							folder.setFieldValue('parent',searchresult1[0].getValue('internalid'));
							folder.setFieldValue('name','AVA_ExemptionCertificate');
							var FolderId = nlapiSubmitRecord(folder);
						}
						else
						{
							var FolderId = searchresult[0].getValue('internalid');
						}
					    AVA_GetCertificatesDetailsForm.getField('ava_folderid').setDefaultValue(FolderId);
	
				    	for(var i=0; AVA_ResponseCertificateArray != null && i<AVA_ResponseCertificateArray.length ; i++)
				    	{
							var Jurisdications = '';
							
							AVA_CertificateList.setLineItemValue('ava_certid', i+1, nlapiSelectValue(AVA_ResponseCertificateArray[i] , "./*[name()='AvaCertId']"));
							
							var AVA_Jurisdiction = nlapiSelectNodes(nlapiSelectNode(AVA_ResponseCertificateArray[i], "./*[name()='CertificateJurisdictions']"), "./*[name()='CertificateJurisdiction']");
							for(var j = 0; AVA_Jurisdiction != null && j < AVA_Jurisdiction.length; j++)
							{
								Jurisdications += nlapiSelectValue(AVA_Jurisdiction[j], "./*[name()='Jurisdiction']");
								if(j != AVA_Jurisdiction.length - 1)
								{
									Jurisdications += ', ';
								}
							}
							AVA_CertificateList.setLineItemValue('ava_jurisdiction', i+1, Jurisdications);
							
							var Address1 = nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='Address1']");
							var City = nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='City']");
							var State = nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='State']");
							var Zip = nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='Zip']");
							var Country = nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='Country']");
							
							var Address = Address1 +", "+ City +", "+ State +", "+ Zip +", " + Country;
							AVA_CertificateList.setLineItemValue('ava_address', i+1,Address);
							AVA_CertificateList.setLineItemValue('ava_certstatus', i+1, nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='CertificateStatus']"));
				    		AVA_CertificateList.setLineItemValue('ava_reviewstatus', i+1, nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='ReviewStatus']"));
				    		AVA_CertificateList.setLineItemValue('ava_certusage', i+1, nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='CertificateUsage']"));
				    		AVA_CertificateList.setLineItemValue('ava_exemptformname', i+1, nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='ExemptFormName']"));
				    		AVA_CertificateList.setLineItemValue('ava_exemptreasoncode', i+1, nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='ExemptReasonCode']"));
				    		AVA_CertificateList.setLineItemValue('ava_pagecount', i+1, nlapiSelectValue(AVA_ResponseCertificateArray[i], "./*[name()='PageCount']"));
				    	}
					}
				    else
				    {
				    	var AVA_Messages = nlapiSelectNode( CertificateGetResult, "//*[name()='Messages']");
						var AVA_Message = nlapiSelectValue( AVA_Messages, "//*[name()='Summary']");
						nlapiLogExecution('DEBUG', 'Error Message', AVA_Message);
						nlapiLogExecution('DEBUG', 'Error', AVA_CertificateListResponse.getCode());
				    }
				}
				else
				{
					nlapiLogExecution('DEBUG', 'Please contact the administrator');
					nlapiLogExecution('DEBUG', 'Response Code', AVA_CertificateListResponse.getCode());
				}
				response.writePage(AVA_GetCertificatesDetailsForm);
			}
			catch(err)
			{
				nlapiLogExecution('Debug', 'error', err.message);
			}
		}
	}
}

function AVA_GetCertImage()
{
	var config = nlapiGetFieldValue('custpage_ava_readconfig') == null ? AVA_ReadConfig('1') : AVA_LoadValuesFromField();
	
	for(var i = 1; i <= nlapiGetLineItemCount('custpage_avacertlist'); i++)
	{
		if(nlapiGetLineItemValue('custpage_avacertlist', 'ava_getimage', i) == 'T')
		{
			if(nlapiGetFieldValue('ava_fileformat') == 'PNG' && nlapiGetLineItemValue('custpage_avacertlist','ava_page', i) != null && nlapiGetLineItemValue('custpage_avacertlist','ava_page', i).length > 0)
			{
				if(nlapiGetLineItemValue('custpage_avacertlist','ava_page', i) > nlapiGetLineItemValue('custpage_avacertlist','ava_pagecount', i))
				{
					alert('Invalid page number');
					return;
				}
			}
			
			var URL = nlapiResolveURL('SUITELET', 'customscript_avagetcertimage_suitelet', 'customdeploy_avagetcertificateimage', false);
			URL = URL + '&custparam_customercode=' + nlapiGetFieldValue('ava_customercode') + '&custparam_ava_certid=' + nlapiGetLineItemValue('custpage_avacertlist','ava_certid', i) + '&custparam_ava_folderid=' + nlapiGetFieldValue('ava_folderid') + '&custparam_ava_fileformat=' + nlapiGetFieldValue('ava_fileformat') + '&custparam_ava_page=' + nlapiGetLineItemValue('custpage_avacertlist','ava_page', i);
			window.open(URL, '_blank');
		}
	}
}

function AVA_GetCertificateImage(request, response)
{
	if(AVA_CheckService('AvaCert2Svc') == 0 && AVA_CheckSecurity( 25 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_GetCertificatesImageForm = nlapiCreateForm('Exemption Certificate');
			AVA_GetCertificatesImageForm.setTitle('Exemption Certificate');
			
			AVA_ReadConfig('0');
			
			var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
			var headers = AVA_Header(security);
			var body = AVA_GetCertificateImageBody(request.getParameter('custparam_ava_certid'), request.getParameter('custparam_ava_fileformat'), request.getParameter('custparam_ava_page'));
			var soapPayload = AVA_BuildEnvelope(headers + body);
			
			var soapHead = new Array();
			soapHead['Content-Type'] = 'text/xml';
			soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/CertificateImageGet"';
			
			try
			{
				var AVA_CertificateImageResponse = nlapiRequestURL(AVA_ServiceUrl + '/avacert2/avacert2svc.asmx', soapPayload, soapHead);
				if (AVA_CertificateImageResponse.getCode() == 200)
				{
					var soapText = AVA_CertificateImageResponse.getBody();
					var soapXML = nlapiStringToXML(soapText);
		
					var AVA_CertificateImageGetResult = nlapiSelectNode(soapXML, "//*[name()='CertificateImageGetResult']");
					AVA_ResultCode = nlapiSelectValue( AVA_CertificateImageGetResult, "//*[name()='ResultCode']");
					if (AVA_ResultCode == 'Success') 
					{
						AVA_GetCertificatesImageForm.addField('ava_customercode','text', 'Customer Code');
						AVA_GetCertificatesImageForm.getField('ava_customercode').setDefaultValue(request.getParameter('custparam_customercode'));
						AVA_GetCertificatesImageForm.getField('ava_customercode').setDisplayType('inline');
						
						AVA_GetCertificatesImageForm.addField('ava_certid','text', 'Cert ID');
						AVA_GetCertificatesImageForm.getField('ava_certid').setDefaultValue(request.getParameter('custparam_ava_certid'));
						AVA_GetCertificatesImageForm.getField('ava_certid').setDisplayType('inline');
						
						AVA_GetCertificatesImageForm.addTab('custpage_avaimagetab', 'Cert Image');
						
						var fileType = (request.getParameter('custparam_ava_fileformat') == 'PNG') ? 'PNGIMAGE' : 'PDF';
						var AVA_CertImage = nlapiSelectValue( AVA_CertificateImageGetResult, "//*[name()='Image']");
						
						if(request.getParameter('custparam_ava_fileformat') == 'PNG')
						{
							var html = '<img src="data:image/png;base64,' + AVA_CertImage + '" width="1000" height="1000"/>';
						}
						else
						{
							var file = nlapiCreateFile(request.getParameter('custparam_ava_certid') + '.' + request.getParameter('custparam_ava_fileformat'), fileType, AVA_CertImage);
							file.setFolder(request.getParameter('custparam_ava_folderid'));
							var id = nlapiSubmitFile(file);
							var html = '<embed src="https://system.na1.netsuite.com/c.' + nlapiGetContext().getCompany() + '/suitebundle1894/AVA_ExemptionCertificate/' + request.getParameter('custparam_ava_certid') + '.' + request.getParameter('custparam_ava_fileformat') + '" width="550" height="750" type="pdf">';
						}
						AVA_GetCertificatesImageForm.addField('ava_image','help', html, null, 'custpage_avaimagetab');
					}
					else
					{
						var AVA_Messages = nlapiSelectNode( AVA_CertificateImageGetResult, "//*[name()='Messages']");
						var AVA_Message = nlapiSelectValue( AVA_Messages, "//*[name()='Summary']");
						nlapiLogExecution('DEBUG', 'Error Message', AVA_Message);
						nlapiLogExecution('DEBUG', 'Error', AVA_CertificateImageResponse.getCode());
					}
				}
				else
				{
					nlapiLogExecution('DEBUG', 'Please contact the administrator');
					nlapiLogExecution('DEBUG', 'Response Code', AVA_CertificateImageResponse.getCode());
				}
				response.writePage(AVA_GetCertificatesImageForm);
			}
			catch(err)
			{
				nlapiLogExecution('Debug', 'error', err.message);
			}
		}
	}
}

function AVA_GetCertificatesStatus(request, response)
{
	if(AVA_CheckService('AvaCert2Svc') == 0 && AVA_CheckSecurity( 27 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_GetCertificatesStatusForm = nlapiCreateForm('Exemption Certificate(s) Status');
			AVA_GetCertificatesStatusForm.setTitle('Exemption Certificate(s) Status');
			
			AVA_ReadConfig('0');
			
			var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
			var headers = AVA_Header(security);
			var body = AVA_GetCertificatesStatusBody(request.getParameter('customercode'));
			var soapPayload = AVA_BuildEnvelope(headers + body);
			
			var soapHead = new Array();
			soapHead['Content-Type'] = 'text/xml';
			soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/CertificateRequestGet"';
			
			try
			{
				var AVA_CertificateStatusResponse = nlapiRequestURL(AVA_ServiceUrl + '/avacert2/avacert2svc.asmx', soapPayload, soapHead);
				if (AVA_CertificateStatusResponse.getCode() == 200)
				{
					var soapText = AVA_CertificateStatusResponse.getBody();
					var soapXML = nlapiStringToXML(soapText);
					var AVA_ResponseCertificateStatusArray = new Array();
		
					var AVA_CertificateRequestGetResult = nlapiSelectNode(soapXML, "//*[name()='CertificateRequestGetResult']");
					AVA_ResultCode = nlapiSelectValue( AVA_CertificateRequestGetResult, "//*[name()='ResultCode']");
					if (AVA_ResultCode == 'Success') 
					{
						AVA_GetCertificatesStatusForm.addField('ava_customercode','text', 'Customer Code');
						AVA_GetCertificatesStatusForm.getField('ava_customercode').setDefaultValue(request.getParameter('customercode'));
						AVA_GetCertificatesStatusForm.getField('ava_customercode').setDisplayType('inline');
						
						var AVA_CertificateStatusList = AVA_GetCertificatesStatusForm.addSubList('custpage_avacertstatuslist', 'list','Certificate(s) Status Details');
	
						AVA_CertificateStatusList.addField('ava_trackingcode', 'text', 'Tracking Code');
						AVA_CertificateStatusList.addField('ava_requestdate','text', 'Request Date');
						AVA_CertificateStatusList.addField('ava_requeststage','text', 'Request Stage');
						AVA_CertificateStatusList.addField('ava_requeststatus','text', 'Request Status');
						AVA_CertificateStatusList.addField('ava_communicationmode','text', 'Communication Mode');
						
						var CertificatesRequests = nlapiSelectNode(AVA_CertificateRequestGetResult, "//*[name()='CertificateRequests']");
						AVA_ResponseCertificateStatusArray = nlapiSelectNodes(CertificatesRequests, "./*[name()='CertificateRequest']");
	
						for(var i=0; AVA_ResponseCertificateStatusArray != null && i<AVA_ResponseCertificateStatusArray.length ; i++)
				    	{
							AVA_CertificateStatusList.setLineItemValue('ava_trackingcode', i+1, nlapiSelectValue(AVA_ResponseCertificateStatusArray[i], "./*[name()='TrackingCode']"));
							AVA_CertificateStatusList.setLineItemValue('ava_requestdate', i+1, AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'),nlapiSelectValue( AVA_ResponseCertificateStatusArray[i], "./*[name()='RequestDate']")));
							var RequestStage = (nlapiSelectValue(AVA_ResponseCertificateStatusArray[i], "./*[name()='RequestStage']") == 'REQUESTINITIATED') ? 'Request Initiated' : ((nlapiSelectValue(AVA_ResponseCertificateStatusArray[i], "./*[name()='RequestStage']") == 'CUSTOMERRESPONDED') ? 'Customer Responded ' : 'Certificate Received');
							AVA_CertificateStatusList.setLineItemValue('ava_requeststage', i+1, RequestStage);
							AVA_CertificateStatusList.setLineItemValue('ava_requeststatus', i+1, nlapiSelectValue(AVA_ResponseCertificateStatusArray[i], "./*[name()='RequestStatus']"));
							AVA_CertificateStatusList.setLineItemValue('ava_communicationmode', i+1, nlapiSelectValue(AVA_ResponseCertificateStatusArray[i], "./*[name()='CommunicationMode']"));
				    	}
					}
					response.writePage(AVA_GetCertificatesStatusForm);
				}
			}
			catch(err)
			{
				nlapiLogExecution('Debug', 'error', err.message);
			}
		}
	}
}

function AVA_GetCertificateImageBody(AVA_CertId, FileFormat, Page)
{
	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<CertificateImageGet xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<CertificateImageGetRequest>\n';
				soap += '\t\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
				soap += '\t\t\t\t\t<AvaCertId><![CDATA[' + AVA_CertId  + ']]></AvaCertId>\n';
				soap += '\t\t\t\t\t<Format>' + FileFormat + '</Format>\n';
				if(FileFormat == 'PNG' && Page != null && Page.length > 0)
				{
					soap += '\t\t\t\t\t<PageNumber><![CDATA[' + Page + ']]></PageNumber>\n';
				}
			soap += '\t\t\t</CertificateImageGetRequest>\n';
	 	soap += '\t\t</CertificateImageGet>\n';
	soap += '\t</soap:Body>\n';
	 
	return soap;
}

function AVA_CertificateGetBody(CustomerCode)
{
	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<CertificateGet xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<CertificateGetRequest>\n';
				soap += '\t\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
				soap += '\t\t\t\t\t<CustomerCode><![CDATA[' + CustomerCode.substring(0,49) + ']]></CustomerCode>\n';
			soap += '\t\t\t</CertificateGetRequest>\n';
	 	soap += '\t\t</CertificateGet>\n';
	soap += '\t</soap:Body>\n';
	 
	return soap;
}

function AVA_GetCertificatesStatusBody(CustomerCode)
{
	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<CertificateRequestGet xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<CertificateRequestGetRequest>\n';
				soap += '\t\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
				soap += '\t\t\t\t\t<CustomerCode><![CDATA[' + CustomerCode.substring(0,49) + ']]></CustomerCode>\n';
				soap += '\t\t\t\t\t<RequestStatus>ALL</RequestStatus>\n';
			soap += '\t\t\t</CertificateRequestGetRequest>\n';
	 	soap += '\t\t</CertificateRequestGet>\n';
	soap += '\t</soap:Body>\n';
	 
	return soap;
}