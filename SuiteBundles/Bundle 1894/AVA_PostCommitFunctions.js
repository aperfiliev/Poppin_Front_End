/******************************************************************************************************
	Script Name  - AVA_PostCommitFunctions.js
	Company      - Avalara Technologies Pvt Ltd.
******************************************************************************************************/

{
	var AVA_PrevFlag, AVA_NextFlag, AVA_EndPage, AVA_LineCount, recordIdArray, recordObjArray;
}

function AVA_ConfigValidate(request, response)
{
	if(request.getMethod() == 'GET')
	{
		var WebService = nlapiGetContext().getSetting('FEATURE', 'webservicesexternal');
		var AcctPeriod = nlapiGetContext().getSetting('FEATURE', 'accountingperiods');
		
		if(WebService == 'F' || AcctPeriod == 'F')
		{
			var AVA_Message = 'To use this functionality, NetSuite Web Services and Accounting Periods feature needs to be enabled. Please contact the administrator';
			var AVA_Notice = AVA_NoticePage(AVA_Message);
			response.write(AVA_Notice);
		}
		else
		{
			var AVA_Admin;
			var form = nlapiCreateForm('Post & Commit Tax');
			form.setTitle('AvaTax Transactions Commit List');
			form.setScript('customscript_avageneralscript_client');
			
			var AVA_AdminPassword = form.addField('ava_adminpassword', 'password', 'Enter the Administrator Password');
			AVA_AdminPassword.setMandatory(true);
	
			form.addPageLink('breadcrumb', 'Commit Transactions', nlapiResolveURL('SUITELET', 'customscript_avaconfigpassword_suitlet', 'customdeploy_postcommit1'));
			form.addSubmitButton('Submit');
			form.addResetButton('Reset');
			response.writePage(form);
		}
	}
	else
	{
		nlapiGetContext().setSetting('SESSION', 'StartDate', '');
		nlapiGetContext().setSetting('SESSION', 'EndDate', '');
		nlapiGetContext().setSetting('SESSION', 'DocType', '');
		
		var AVA_Message = 'Login Failed. Re-enter the correct administrator password and try again';
		var ValidatePassword = AVA_ValidatePassword(request.getParameter('ava_adminpassword'));
		if (ValidatePassword == 0)
		{
			if (AVA_GetAccountingPeriods() == 0)
			{
				//Logout from NetSuite Web Services
				var NetSuiteLogout = AVA_NetSuiteLogout();
				
				var soapHead2 = new Array();
				soapHead2['Content-Type'] = 'text/xml; charset=utf-8'; 
				soapHead2['Cookie'] = 'NS_VER=2008.1.0; ' + nlapiGetContext().getSetting('SESSION', 'JSessionID');
				soapHead2['SOAPAction'] = '"logout"';
				
				var response3 = nlapiRequestURL('https://webservices.netsuite.com/services/NetSuitePort_2_6' , NetSuiteLogout, soapHead2);
				if(response3.getCode() == 200)
				{
					var soapText3 = response3.getBody();
					var soapXML3 = nlapiStringToXML(soapText3);
		
					var LogoutStatus = nlapiSelectValue(soapXML3, "//@isSuccess");
					if(LogoutStatus == 'false')
					{
						// Redirect to error page
						nlapiLogExecution('DEBUG', 'Please contact the system administrator');
						var AVA_Notice = AVA_NoticePage(AVA_Message);
						response.write(AVA_Notice);
					}						
				}
				// Redirect to Post & Commit Tax Page
				nlapiSetRedirectURL('SUITELET', 'customscript_avapostcommit_suitlet', 'customdeploy_postcommit');
			}
			else
			{
				var AVA_Notice = AVA_NoticePage(AVA_Message);
				response.write(AVA_Notice);
			}				
		}
		else
		{
			var AVA_Notice = AVA_NoticePage(AVA_Message);
			response.write(AVA_Notice);
		}
	}
}

function AVA_ValidatePassword(AVA_LogPasswd)
{
	var AVA_Test = null;
	var TaxCodeName, TaxCodeGroup, cnt, Xpath ;
	var NetSuiteLogin = AVA_NetSuiteLogin(AVA_LogPasswd);
	
	var soapHead = new Array();
	soapHead['Content-Type'] = 'text/xml; charset=utf-8'; 
	soapHead['SOAPAction'] = '"login"';

	try
	{
		var response = nlapiRequestURL('https://webservices.netsuite.com/services/NetSuitePort_2_6' , NetSuiteLogin, soapHead);
		if(response.getCode() == 200)
		{
			JSessionID = response.getHeader('Set-Cookie');
			JSessionID = JSessionID.substr(0, JSessionID.indexOf(';', 0)) + ';';
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);
			
			var LoginStatus = nlapiSelectValue(soapXML, "//@isSuccess");
			if(LoginStatus == 'true')
			{
				nlapiGetContext().setSetting('SESSION', 'JSessionID' , JSessionID);
				nlapiGetContext().setSetting('SESSION', 'AVA_LogPasswd' , AVA_LogPasswd);
				return 0; // Success
			}
			else
			{
				nlapiLogExecution('DEBUG', 'Please contact the administrator');
				return 1; //Failure
			}
		}
		else
		{
			nlapiLogExecution('DEBUG', 'Re-enter the correct password and submit again');
			return 1; // Failure
		}
	}
	
	catch(err)
	{
		nlapiLogExecution('DEBUG', 'Error - ', err.getStackTrace());
		return 1; // Failure
	}
}

function AVA_GetAccountingPeriods()
{
	var NetSuitePeriods = AVA_GetNetSuiteAccountingPeriods();
	
	var soapHead1 = new Array();
	soapHead1['Content-Type'] = 'text/xml; charset=utf-8'; 
	soapHead1['Cookie'] = 'NS_VER=2008.1.0; ' + nlapiGetContext().getSetting('SESSION', 'JSessionID');
	soapHead1['SOAPAction'] = '"getSelectValue"';

	try
	{
		var response1 = nlapiRequestURL('https://webservices.netsuite.com/services/NetSuitePort_2_6' , NetSuitePeriods, soapHead1);
		if(response1.getCode() == 200)
		{
			var soapText1 = response1.getBody();
			var soapXML1 = nlapiStringToXML(soapText1);

			var PeriodStatus = nlapiSelectValue(soapXML1, "//@isSuccess");
			if(PeriodStatus == 'true')
			{
				var cntrecords = nlapiSelectValue(soapXML1, "//*[name()='ns2:totalRecords']");
				if(cntrecords > 0)
				{
					// Delete all the data in custom records
					var searchresult = nlapiSearchRecord('customrecord_avaacctperiods', null, null, null);
					for(var i=0; searchresult != null && i < searchresult.length; i++)
					{
						nlapiDeleteRecord('customrecord_avaacctperiods', searchresult[i].getId());
					}
				}

				var periodinternalid = nlapiSelectValues(soapXML1, "//@internalId");
				var periodid = nlapiSelectValues(soapXML1, "//*[name()='ns2:name']");
				
				for(var i=0; i < cntrecords; i++)
				{
					// Populate the data into custom records by reading the xml file.
					var recid = nlapiCreateRecord('customrecord_avaacctperiods');
					recid.setFieldValue('custrecord_ava_periodid', 		periodinternalid[i]);
					recid.setFieldValue('custrecord_ava_periodname', 	periodid[i]);
					var subid = nlapiSubmitRecord(recid, false);
				}
			}
			else
			{
				return 1;
			}
		}
		else
		{
			nlapiLogExecution('DEBUG', 'Re-enter the correct password and submit again');
			return 1; // Failure
		}
	}
	
	catch(err)
	{
		nlapiLogExecution('DEBUG', 'Error Catch BLock - ', err.getStackTrace());
		return 1; // Failure
	}
	return 0;
}

function AVA_NetSuiteLogin(AVA_LogPasswd)
{
	var soap = null;
	soap = '<?xml version="1.0" encoding="UTF-8"?>\n';
	soap += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
		soap += '\t<soapenv:Body>\n';
			soap += '\t\t<login xmlns="urn:messages_2_6.platform.webservices.netsuite.com">\n';
				soap += '\t\t\t<passport>\n';
					soap += '\t\t\t\t<ns1:email xmlns:ns1="urn:core_2_6.platform.webservices.netsuite.com">' + nlapiGetContext().getEmail() + '</ns1:email>\n';
					soap += '\t\t\t\t<ns2:password xmlns:ns2="urn:core_2_6.platform.webservices.netsuite.com">' + AVA_LogPasswd + '</ns2:password>\n';
					soap += '\t\t\t\t<ns3:account xmlns:ns3="urn:core_2_6.platform.webservices.netsuite.com">' + nlapiGetContext().getCompany() + '</ns3:account>\n';
					soap += '\t\t\t\t<ns4:role internalId="' + nlapiGetContext().getRole() + '" xmlns:ns4="urn:core_2_6.platform.webservices.netsuite.com"/>\n';
				soap += '\t\t\t</passport>\n';
			soap += '\t\t</login>\n';
		soap += '\t</soapenv:Body>\n';
	soap += '</soapenv:Envelope>';
	return soap;
}

function AVA_GetNetSuiteAccountingPeriods()
{
	var soap = null;
	soap = '<?xml version="1.0" encoding="utf-8"?>\n';
	soap += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
		soap += '\t<soapenv:Header>\n';
			soap += '\t\t<ns1:preferences soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns1="urn:messages.platform.webservices.netsuite.com">\n';
				soap += '\t\t\t<ns2:disableSystemNotesForCustomFields xmlns:ns2="urn:messages_2_6.platform.webservices.netsuite.com">true</ns2:disableSystemNotesForCustomFields>\n';
				soap += '\t\t\t<ns3:ignoreReadOnlyFields xmlns:ns3="urn:messages_2_6.platform.webservices.netsuite.com">true</ns3:ignoreReadOnlyFields>\n';
			soap += '\t\t</ns1:preferences>\n';
			soap += '\t\t<ns4:searchPreferences soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns4="urn:messages.platform.webservices.netsuite.com">\n';
				soap += '\t\t\t<ns5:bodyFieldsOnly xmlns:ns5="urn:messages_2_6.platform.webservices.netsuite.com">false</ns5:bodyFieldsOnly>\n';
				soap += '\t\t\t<ns6:pageSize xmlns:ns6="urn:messages_2_6.platform.webservices.netsuite.com">100</ns6:pageSize>\n';
			soap += '\t\t</ns4:searchPreferences>\n';
		soap += '\t</soapenv:Header>\n';
		soap += '\t<soapenv:Body>\n';
			soap += '\t\t<getSelectValue xmlns="urn:messages_2_6.platform.webservices.netsuite.com">\n';
				soap += '\t\t\t<fieldName fieldType="inventoryAdjustment_postingPeriod"/>\n';
			soap += '\t\t</getSelectValue>\n';
		soap += '\t</soapenv:Body>\n';
	soap += '</soapenv:Envelope>';
	return soap;
}

function AVA_NetSuiteLogout()
{
	var soap = null;
	soap = '<?xml version="1.0" encoding="utf-8"?>\n';
	soap += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
		soap += '\t<soapenv:Header>\n';
			soap += '\t\t<ns1:preferences soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns1="urn:messages.platform.webservices.netsuite.com">\n';
				soap += '\t\t\t<ns2:disableSystemNotesForCustomFields xmlns:ns2="urn:messages_2_6.platform.webservices.netsuite.com">true</ns2:disableSystemNotesForCustomFields>\n';
				soap += '\t\t\t<ns3:ignoreReadOnlyFields xmlns:ns3="urn:messages_2_6.platform.webservices.netsuite.com">true</ns3:ignoreReadOnlyFields>\n';
			soap += '\t\t</ns1:preferences>\n';
			soap += '\t\t<ns4:searchPreferences soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns4="urn:messages.platform.webservices.netsuite.com">\n';
				soap += '\t\t<ns5:bodyFieldsOnly xmlns:ns5="urn:messages_2_6.platform.webservices.netsuite.com">false</ns5:bodyFieldsOnly>\n';
				soap += '\t\t<ns6:pageSize xmlns:ns6="urn:messages_2_6.platform.webservices.netsuite.com">50</ns6:pageSize>\n';
			soap += '\t</ns4:searchPreferences>\n';
		soap += '\t</soapenv:Header>\n';
		soap += '\t<soapenv:Body>\n';
			soap += '\t\t<logout xmlns="urn:messages_2_6.platform.webservices.netsuite.com"/>\n';
		soap += '\t</soapenv:Body>\n';
	soap += '</soapenv:Envelope>';

	return soap;
}

function AVA_PostCommit(request, response)
{
	if(request.getMethod() == 'GET')
	{
		var AVA_PostCommitForm = nlapiCreateForm('AvaTax Transactions Commit List');
		AVA_PostCommitForm.setTitle('AvaTax Transactions Commit List');
		AVA_PostCommitForm.setScript('customscript_avapostcommit_client');
		
		var DateFrom 	= AVA_PostCommitForm.addField('ava_startingdate',	'date',		'Starting Date');
		DateFrom.setDefaultValue(nlapiGetContext().getSetting('SESSION', 'StartDate'));
		DateFrom.setMandatory(true);
		
		var DateTo 		= AVA_PostCommitForm.addField('ava_endingdate',		'date',		'Ending Date');
		DateTo.setDefaultValue(nlapiGetContext().getSetting('SESSION', 'EndDate'));
		DateTo.setMandatory(true);
		
		var DateFormat 	= AVA_PostCommitForm.addField('ava_dateformat',		'text',			'Date Format');
		DateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
		DateFormat.setMandatory(true);
		DateFormat.setDisplayType('hidden');
				
		var DocType 	= AVA_PostCommitForm.addField('ava_doctype',		'select',	'Document Types');
		DocType.addSelectOption('', '');
		DocType.addSelectOption('1', 'Invoice');
		DocType.addSelectOption('2', 'Cash Sale');
		DocType.addSelectOption('3', 'Credit Memo');
		DocType.addSelectOption('4', 'Cash Refund');
		DocType.setDefaultValue(nlapiGetContext().getSetting('SESSION', 'DocType'));
		DocType.setMandatory(true);
		
		if((nlapiGetContext().getSetting('SESSION', 'StartDate') != null) && (nlapiGetContext().getSetting('SESSION', 'StartDate').length > 0))
		{
			DateFrom.setDisplayType('disabled');
			DateTo.setDisplayType('disabled');
			DocType.setDisplayType('disabled');
			
			var AVA_TransactionList = AVA_PostCommitForm.addSubList('custpage_avatranslist', 'list', 'AvaTax Transactions', null);		
			AVA_TransactionList.addField('avainternalid', 		'text', 		'Internal Id', 					null);
			AVA_TransactionList.addField('avacommitmap', 		'checkbox', 	'Apply', 						null);
			AVA_TransactionList.addField('avatransid', 			'text', 		'AvaTax Transaction Id', 		null);
			AVA_TransactionList.addField('avadocno', 			'text', 		'AvaTax Document Number', 		null);
			AVA_TransactionList.addField('avadocdate', 			'date', 		'Document Date', 				null);
			AVA_TransactionList.addField('avanetdocno', 		'text', 		'NetSuite Document Number', 	null);
			AVA_TransactionList.addField('avataxdate', 			'date', 		'Tax Calculation Date', 		null);
			AVA_TransactionList.addField('avatotamt', 			'currency', 	'Total Amount', 				null);
			AVA_TransactionList.addField('avatotdisc', 			'currency', 	'Total Discount', 				null);
			AVA_TransactionList.addField('avatotnontax', 		'currency', 	'Total Non-Taxable', 			null);
			AVA_TransactionList.addField('avatottaxable', 		'currency', 	'Total Taxable', 				null);
			AVA_TransactionList.addField('avatottax', 			'currency', 	'Total Tax', 					null);
			
			AVA_TransactionList.getField('avainternalid').setDisplayType('hidden');
			AVA_TransactionList.addMarkAllButtons();
			AVA_PostCommitForm.addSubmitButton('Submit');
			
			var GetData = AVA_GetRecordsData(nlapiGetContext().getSetting('SESSION', 'StartDate'), nlapiGetContext().getSetting('SESSION', 'EndDate'), nlapiGetContext().getSetting('SESSION', 'DocType'), AVA_TransactionList);
		}
		else
		{
			AVA_PostCommitForm.addSubmitButton('Get Records');
		}
		AVA_PostCommitForm.addPageLink('breadcrumb', 'Commit Transactions', nlapiResolveURL('SUITELET', 'customscript_avaconfigpassword_suitlet', 'customdeploy_postcommit1'));
		AVA_PostCommitForm.addResetButton('Reset');
		nlapiGetContext().setSetting('SESSION', 'StartDate', '');
		nlapiGetContext().setSetting('SESSION', 'EndDate', '');
		nlapiGetContext().setSetting('SESSION', 'DocType', '');
		response.writePage(AVA_PostCommitForm);
		
	}
	else
	{
		var scheduler = 'F';
		if(request.getLineItemCount('custpage_avatranslist') == -1)
		{ 
			nlapiGetContext().setSetting('SESSION', 'StartDate', 	request.getParameter('ava_startingdate'));
			nlapiGetContext().setSetting('SESSION', 'EndDate', 		request.getParameter('ava_endingdate'));
			nlapiGetContext().setSetting('SESSION', 'DateFormat', 	request.getParameter('ava_dateformat'));
			nlapiGetContext().setSetting('SESSION', 'DocType', 		request.getParameter('ava_doctype'));
	
			nlapiSetRedirectURL('SUITELET', 'customscript_avapostcommit_suitlet', 'customdeploy_postcommit');
		}
		else
		{
			for(var i=0; i < request.getLineItemCount('custpage_avatranslist'); i++)
			{
				if(request.getLineItemValue('custpage_avatranslist', 'avacommitmap', i+1) == 'T')
				{
					var RecordId = request.getLineItemValue('custpage_avatranslist', 'avainternalid', i+1);
					nlapiSubmitField('customrecord_avataxheaderdetails', RecordId, 'custrecord_ava_scheduled', 'T');
					scheduler = 'T';
				}	
			}
			
			if(scheduler == 'T')
			{
				var ttt = nlapiScheduleScript('customscript_avapostcommit_scheduled', 'customdeploy_postcommit');
			}			
			nlapiSetRedirectURL('TASKLINK', 'CARD_-29');
		}
	}
}

function AVA_GetRecordsData(StartDate, EndDate, DocType, TransactionList)
{
	try
	{
		var recordtype;
		switch(DocType)
		{
			case '1':
				recordtype = 'invoice';
				break;
	
			case '2':
				recordtype = 'cashsale';
				break;
	
			case '3':
				recordtype = 'creditmemo';
				break;
	
			case '4':
				recordtype = 'cashrefund';
				break;
	
			default:
				break;
		}			
		
		var Periods = new Array();
		var newsearch = nlapiSearchRecord('customrecord_avaacctperiods', null, null, new nlobjSearchColumn('custrecord_ava_periodid'));
		for(var k=0; newsearch != null && k < newsearch.length; k++)
		{
			Periods[k] = newsearch[k].getValue('custrecord_ava_periodid');
		}
		
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('mainline', 			null, 'is', 	'T');
		filters[1] = new nlobjSearchFilter('trandate', 			null, 'within', StartDate, EndDate);
		filters[2] = new nlobjSearchFilter('voided', 			null, 'is', 	'F');
		filters[3] = new nlobjSearchFilter('posting', 			null, 'is', 	'T');
	
		var cols = new Array();
		cols[0] = new nlobjSearchColumn('postingperiod');
	
		var searchresult = nlapiSearchRecord(recordtype, null, filters, cols);
		var AVA_DocRecID = new Array();
		
		for(var j =0, k=0; searchresult != null && j < Math.min(1000, searchresult.length); j++)
		{
			var PostPeriod = searchresult[j].getValue('postingperiod');
			var PeriodExists = 'F';
			
			for(var kk = 0; kk < Periods.length; kk++)
			{
				if(PostPeriod == Periods[kk])
				{
					PeriodExists = 'T';
					break;
				}
			}
			
			if(PeriodExists == 'F')
			{
				AVA_DocRecID[k] = String(searchresult[j].getId());
				k++;
			}
		}
		
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('internalid', 'custrecord_ava_documentinternalid', 'anyof', AVA_DocRecID);
		filters[1] = new nlobjSearchFilter('custrecord_ava_documentstatus',		null, 'equalto', 1);
		filters[2] = new nlobjSearchFilter('custrecord_ava_netsuitedoctype',	null, 'is', nlapiGetContext().getSetting('SESSION', 'DocType'));
		filters[3] = new nlobjSearchFilter('custrecord_ava_scheduled', 			null, 'is', 'F');
		filters[4] = new nlobjSearchFilter('mainline', 'custrecord_ava_documentinternalid', 'is', 'T');	
		
		var cols = new Array();
		cols[0]  = new nlobjSearchColumn('custrecord_ava_documentid');
		cols[1]  = new nlobjSearchColumn('custrecord_ava_documentinternalid');
		cols[2]  = new nlobjSearchColumn('custrecord_ava_documentno');
		cols[3]  = new nlobjSearchColumn('custrecord_ava_taxcalculationdate');
		cols[4]  = new nlobjSearchColumn('custrecord_ava_totalamount');
		cols[5]  = new nlobjSearchColumn('custrecord_ava_totaldiscount');
		cols[6]  = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
		cols[7]  = new nlobjSearchColumn('custrecord_ava_totaltaxable');
		cols[8]  = new nlobjSearchColumn('custrecord_ava_totaltax');
		cols[9] = new nlobjSearchColumn('custrecord_ava_documentstatus');
		cols[10] = new nlobjSearchColumn('custrecord_ava_documentdate');

		var Multiplier = nlapiGetContext().getSetting('SESSION', 'DocType');
		Multiplier = (Multiplier <= 2)? 1 : 1;

		var searchresult1 = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
			
		for(var i = 0; searchresult1 != null && i < searchresult1.length; i++)
		{
			TransactionList.setLineItemValue('avainternalid', 	i+1, 	searchresult1[i].getId());
			TransactionList.setLineItemValue('avacommitmap',	i+1,	'F');
			
			TransactionList.setLineItemValue('avadocno', 		i+1, 	searchresult1[i].getValue('custrecord_ava_documentinternalid'));
			
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avagettaxhistory_suitelet', 'customdeploy_gettaxhistory', false);
			URL1 = URL1 + '&doctype=' + DocType +'&doccode=' + searchresult1[i].getValue('custrecord_ava_documentinternalid');
			var FinalURL = '<a href="' + URL1 + '" target="_blank">' + searchresult1[i].getValue('custrecord_ava_documentno') + '</a>';

			TransactionList.setLineItemValue('avanetdocno', 	i+1, 	FinalURL);
			TransactionList.setLineItemValue('avadocdate', 		i+1, 	searchresult1[i].getValue('custrecord_ava_documentdate'));
			
			TransactionList.setLineItemValue('avataxdate', 		i+1, 	searchresult1[i].getValue('custrecord_ava_taxcalculationdate'));

			var Totalamount = parseFloat(searchresult1[i].getValue('custrecord_ava_totalamount'));
			Totalamount = (Totalamount != 0)? Totalamount * Multiplier: Totalamount;
			TransactionList.setLineItemValue('avatotamt', 		i+1, 	Totalamount);

			var Totaldiscount = parseFloat(searchresult1[i].getValue('custrecord_ava_totaldiscount'));
			Totaldiscount = (Totaldiscount != 0)? Totaldiscount * Multiplier: Totaldiscount;
			TransactionList.setLineItemValue('avatotdisc', 		i+1, 	Totaldiscount);

			var Totalnontaxable = parseFloat(searchresult1[i].getValue('custrecord_ava_totalnontaxable'));
			Totalnontaxable = (Totalnontaxable != 0)? Totalnontaxable * Multiplier: Totalnontaxable;
			TransactionList.setLineItemValue('avatotnontax', 	i+1, 	Totalnontaxable);

			var Totaltaxable = parseFloat(searchresult1[i].getValue('custrecord_ava_totaltaxable'));
			Totaltaxable = (Totaltaxable != 0)? Totaltaxable * Multiplier: Totaltaxable;
			TransactionList.setLineItemValue('avatottaxable', 	i+1, 	Totaltaxable);

			var Totaltax = parseFloat(searchresult1[i].getValue('custrecord_ava_totaltax'));
			Totaltax = (Totaltax != 0)? Totaltax * Multiplier: Totaltax;
			TransactionList.setLineItemValue('avatottax', 		i+1, 	Totaltax);
		}
	}
	catch(err)
	{
		nlapiLogExecution('DEBUG', 'Post & Commit', 'Please contact administrator for further information');
		nlapiGetContext().setSetting('SESSION', 'StartDate', '');
		nlapiGetContext().setSetting('SESSION', 'EndDate', '');
		nlapiGetContext().setSetting('SESSION', 'DocType', '');
	}		
	return 0;
}

function AVA_PostCommit_Save()
{
	var Linecount = nlapiGetLineItemCount('custpage_avatranslist'); 
	if(Linecount >= 0)
	{
		var AVA_MapExists = 'F';
		for(var i=0 ; i < nlapiGetLineItemCount('custpage_avatranslist'); i++)
		{
			if(nlapiGetLineItemValue('custpage_avatranslist', 'avacommitmap', i+1) == 'T')
			{
				AVA_MapExists = 'T';
				break;
			}
		}
		
		if(AVA_MapExists == 'F' && Linecount != 0)
		{
			alert('Select records to Commit and then try submitting');
			return false;
		}
		else
		{
			return true;
		}
	}
	else
	{
		return AVA_ValidateData();
	}
	
}

function AVA_ValidateData()
{
	var StartDate = nlapiGetFieldValue('ava_startingdate');
	var EndDate = nlapiGetFieldValue('ava_endingdate');
	var DateFormat = nlapiGetFieldValue('ava_dateformat');

	if(StartDate.length == 0)
	{
		alert('Select Starting Date');
		return false;
	}
	
	if(EndDate.length == 0)
	{
		alert('Select Ending Date');
		return false;
	}
	
	StartDate = new Date(AVA_FormatDate(DateFormat,StartDate));
	EndDate = new Date(AVA_FormatDate(DateFormat,EndDate));
	
	if(EndDate < StartDate)
	{
		alert('Ending Date should be greater than or equal to Start Date');
		return false;
	}
	
	if(nlapiGetFieldValue('ava_doctype').length == 0)
	{
		alert('Select a document type');
		return false;
	}

	return true;
}

function AVA_PostandCommitTax()
{
	var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
	for(var i=0; searchresult != null && i < searchresult.length; i++)
	{
		var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[i].getId());
		var loadvalues = AVA_LoadValuesToGlobals(record);
	}

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_scheduled', null, 'is', 'T');
	
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('custrecord_ava_documentid');
	cols[1] = new nlobjSearchColumn('custrecord_ava_documenttype');
	cols[2] = new nlobjSearchColumn('custrecord_ava_documentinternalid');
	cols[3] = new nlobjSearchColumn('custrecord_ava_documentdate');
	cols[4] = new nlobjSearchColumn('custrecord_ava_totalamount');
	cols[5] = new nlobjSearchColumn('custrecord_ava_totaltax');
	
	var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	for(var i=0; searchresult != null && i < searchresult.length; i++)
	{
		var AVA_DocType = searchresult[i].getValue('custrecord_ava_documenttype');
		
		switch(AVA_DocType)
		{
			case '2':
				AVA_DocType = 'SalesInvoice';
				break;
				
			case '4':
				AVA_DocType = 'PurchaseInvoice';
				break;
				
			case '6':
				AVA_DocType = 'ReturnInvoice';
				break;
				
			default:
				break;
		}

		var AVA_TransID = searchresult[i].getValue('custrecord_ava_documentinternalid');
		var AVA_DocDate = AVA_GetDate(searchresult[i].getValue('custrecord_ava_documentdate'), nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT')); 
		var AVA_TotAmt = searchresult[i].getValue('custrecord_ava_totalamount');
		var AVA_TotTax = searchresult[i].getValue('custrecord_ava_totaltax');
			
		var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
		var headers = AVA_TaxHeader(security);
		var body = AVA_PostTaxBody(AVA_DocType, AVA_TransID, AVA_DocDate, AVA_TotAmt, AVA_TotTax);
		var soapPayload = AVA_GetTaxEnvelope(headers + body);

		var soapHead = new Array();
		soapHead['Content-Type'] = 'text/xml';
		soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/PostTax';
		
		var response = nlapiRequestURL(AVA_ServiceUrl + '/tax/taxsvc.asmx', soapPayload, soapHead);
		if (response.getCode() == 200)
		{
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);

			var PostTaxResult = nlapiSelectNode(soapXML, "//*[name()='PostTaxResult']");
			var ResultCode = nlapiSelectValue( PostTaxResult, "//*[name()='ResultCode']");
			
			var fields = new Array();
			fields[0] = 'custrecord_ava_documentstatus';
			fields[1] = 'custrecord_ava_scheduled';

			if (ResultCode == 'Success')
			{
				var values = new Array();			
				values[0] = 3;
				values[1] = 'F';	
				nlapiSubmitField('customrecord_avataxheaderdetails', searchresult[i].getId(), fields, values);
			}
			else if(ResultCode == 'Warning')
			{
				var values = new Array();			
				values[0] = 3;
				values[1] = 'F';	

				nlapiLogExecution('DEBUG', 'AvaTax Document Id', AVA_DocId);
				var AVA_Message = nlapiSelectValues( soapXML, "//*[name()='Summary']");
				for(var k=0; k < AVA_Message.length; k++)
				{
					nlapiLogExecution('DEBUG', ResultCode , AVA_Message[k]);
				}
				nlapiSubmitField('customrecord_avataxheaderdetails', searchresult[i].getId(), fields, values);
			}
			else if(ResultCode == 'Error' || ResultCode == 'Exception')
			{
				var values = new Array();			
				values[0] = 1;
				values[1] = 'F';	

				var AVA_Message = nlapiSelectValues( soapXML, "//*[name()='Summary']");
				nlapiLogExecution('DEBUG', 'AvaTax Document Id', AVA_DocId);
				for(var k=0; k < AVA_Message.length; k++)
				{
					nlapiLogExecution('DEBUG', ResultCode , AVA_Message[k]);
				}
				nlapiSubmitField('customrecord_avataxheaderdetails', searchresult[i].getId(), fields, values);
			}
		}
		else
		{
			nlapiLogExecution('DEBUG', 'Contact the administrator for further details');
		}
	}
}

function AVA_PostTaxBody(AVA_DocType, AVA_TransID, AVA_DocDate, AVA_TotAmt, AVA_TotTax)
{
	var soap = null;
	var Multiplier = (AVA_DocType == 'SalesInvoice')? 1 : -1;
	
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<PostTax xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<PostTaxRequest>\n';
				soap += '\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
				soap += '\t\t\t\t<DocType><![CDATA[' + AVA_DocType + ']]></DocType>\n';
				soap += '\t\t\t\t<DocCode><![CDATA[' + AVA_TransID + ']]></DocCode>\n';
				soap += '\t\t\t\t<DocDate>' + AVA_DocDate + '</DocDate>\n';
				soap += '\t\t\t\t<TotalAmount>' + AVA_TotAmt + '</TotalAmount>\n';
				soap += '\t\t\t\t<TotalTax>' + AVA_TotTax + '</TotalTax>\n';
				soap += '\t\t\t\t<Commit>1</Commit>\n';
			soap += '\t\t\t</PostTaxRequest>\n';	
		soap += '\t\t</PostTax>\n'; 	
	soap += '\t</soap:Body>\n';
	return soap;
}

function AVA_UncommittedList(request, response)
{
	recordIdArray = new Array();
	recordObjArray= new Array();
	
	var AVA_TransactionForm = nlapiCreateForm('AvaTax Uncommitted Transaction List');
	AVA_TransactionForm.setTitle('AvaTax Uncommitted Transactions List');
	
	var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
	
	var AVA_TransactionList = AVA_BodyFields(AVA_TransactionForm, AVA_Tab);

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_documentstatus',		null, 'equalto', 1);
	
	var cols = AVA_SearchColumns();
	
	var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	for( ; searchresult != null; )
	{
		for(var k=0; searchresult != null && k<searchresult.length; k++)
		{
			try
			{
				recordIdArray[recordIdArray.length] = searchresult[k].getId();
				recordObjArray[recordObjArray.length] = searchresult[k];
			}
			catch(err)
			{
			}
		}
				
		filters[1] = new nlobjSearchFilter('internalid',null, 'noneof', recordIdArray);
		
		searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	}
	
	if(recordObjArray != null)
	{
		var ListStart = AVA_ResultsList(AVA_TransactionList);
		
		var FirstLink = '&lt;&lt;First Page';
		var PrevLink = 'Previous';
		var NextLink = 'Next';
		var LastLink = 'Last Page&gt;&gt;';
			
		//First Page
		if(AVA_PrevFlag == 'T')
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avauncommittedlist_suitlet', 'customdeploy_uncommittedlist', false);
			URL1 = URL1 + '&ava_liststart=0';
						
			FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
		}	
			
		//Previous
		if(AVA_PrevFlag == 'T')
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avauncommittedlist_suitlet', 'customdeploy_uncommittedlist', false);
			URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
										
			PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
		}
							
		//Next
		if(AVA_NextFlag == 'T')
		{
			URL1 = nlapiResolveURL('SUITELET', 'customscript_avauncommittedlist_suitlet', 'customdeploy_uncommittedlist', false);
			URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
		
			NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
		}
		
		//Last Page
		if(AVA_NextFlag == 'T')
		{
			URL1 = nlapiResolveURL('SUITELET', 'customscript_avauncommittedlist_suitlet', 'customdeploy_uncommittedlist', false);
			URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
		
			LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
		}	
			
		AVA_TransactionForm.addField('ava_star','help','(*) indicates Transactions deleted from NetSuite').setLayoutType('outsidebelow','startrow');
		var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
		var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
		html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
		var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
		PagingHtml.setLayoutType('outsidebelow','startrow');
	}
		
	AVA_TransactionForm.addPageLink('breadcrumb', 'Uncommitted Transactions', nlapiResolveURL('SUITELET', 'customscript_avauncommittedlist_suitlet', 'customdeploy_uncommittedlist'));
	response.writePage(AVA_TransactionForm);
}

function AVA_CommittedList(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 1 ) == 0)
	{
		recordIdArray = new Array();
		recordObjArray= new Array();
		
		var AVA_TransactionForm = nlapiCreateForm('AvaTax Committed Transaction List');
		AVA_TransactionForm.setTitle('AvaTax Committed Transactions List');
		
		var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
		
		var AVA_TransactionList = AVA_BodyFields(AVA_TransactionForm, AVA_Tab);
	
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentstatus',		null, 'equalto', 3);
		
		var cols = AVA_SearchColumns();
	
		var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		
		for( ; searchresult != null; )
		{
			for(var k=0; searchresult != null && k<searchresult.length; k++)
			{
				try
				{
					recordIdArray[recordIdArray.length] = searchresult[k].getId();
					recordObjArray[recordObjArray.length] = searchresult[k];
				}
				catch(err)
				{
				}
			}
					
			filters[1] = new nlobjSearchFilter('internalid',null, 'noneof', recordIdArray);
			
			searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		}
		
		if(recordObjArray != null)
		{
			var ListStart = AVA_ResultsList(AVA_TransactionList);
			
			var FirstLink = '&lt;&lt;First Page';
			var PrevLink = 'Previous';
			var NextLink = 'Next';
			var LastLink = 'Last Page&gt;&gt;';
			
			//First Page
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart=0';
							
				FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
			}	
				
			//Previous
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
											
				PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
			}
								
			//Next
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
						
				NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
			}
			
			//Last Page
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist', false);
				URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
			
				LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
			}	
				
			AVA_TransactionForm.addField('ava_star','help','(*) indicates Transactions deleted from NetSuite').setLayoutType('outsidebelow','startrow');
			
			var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
			var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
			html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
			var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
			PagingHtml.setLayoutType('outsidebelow','startrow');
		}
			
		AVA_TransactionForm.addPageLink('breadcrumb', 'Committed Transactions', nlapiResolveURL('SUITELET', 'customscript_avacommittedlist_suitlet', 'customdeploy_avacommittedlist'));
		response.writePage(AVA_TransactionForm);
	}
}

function AVA_VoidedList(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 13 ) == 0)
	{
		recordIdArray = new Array();
		recordObjArray= new Array();
		
		var AVA_TransactionForm = nlapiCreateForm('AvaTax Voided Transaction List');
		AVA_TransactionForm.setTitle('AvaTax Voided Transactions List');
		
		var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
		
		var AVA_TransactionList = AVA_BodyFields(AVA_TransactionForm, AVA_Tab);
	
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentstatus',		null, 'equalto', 4);
		
		var cols = AVA_SearchColumns();
	
		var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		
		for( ; searchresult != null; )
		{
			for(var k=0; searchresult != null && k<searchresult.length; k++)
			{
				try
				{
					recordIdArray[recordIdArray.length] = searchresult[k].getId();
					recordObjArray[recordObjArray.length] = searchresult[k];
				}
				catch(err)
				{
				}
			}
					
			filters[1] = new nlobjSearchFilter('internalid',null, 'noneof', recordIdArray);
			
			searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
		}
		
		if(recordObjArray != null)
		{
			var ListStart = AVA_ResultsList(AVA_TransactionList);
			
			var FirstLink = '&lt;&lt;First Page';
			var PrevLink = 'Previous';
			var NextLink = 'Next';
			var LastLink = 'Last Page&gt;&gt;';
			
			//First Page
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart=0';
							
			    FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
			}	
				
			//Previous
			if(AVA_PrevFlag == 'T')
			{
				var URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
												
				PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
			}
								
			//Next
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
							
				NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
			}
			
			//Last Page
			if(AVA_NextFlag == 'T')
			{
				URL1 = nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist', false);
				URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
			
				LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
			}	
				
			AVA_TransactionForm.addField('ava_star','help','(*) indicates Transactions deleted from NetSuite').setLayoutType('outsidebelow','startrow');
			
			var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
			var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
			html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
			var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
			PagingHtml.setLayoutType('outsidebelow','startrow');
		}
	
		AVA_TransactionForm.addPageLink('breadcrumb', 'Voided Transactions', nlapiResolveURL('SUITELET', 'customscriptavavoidedlist_suitlet', 'customdeploy_avavoidedlist'));
		response.writePage(AVA_TransactionForm);
	}
}

function AVA_ScheduledList(request, response)
{
	recordIdArray = new Array();
	recordObjArray= new Array();
	
	var AVA_TransactionForm = nlapiCreateForm('AvaTax Scheduled Transaction List');
	AVA_TransactionForm.setTitle('AvaTax Scheduled Transactions List');
	
	var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
	
	var AVA_TransactionList = AVA_BodyFields(AVA_TransactionForm, AVA_Tab);

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_scheduled',	null, 'is', 'T');
	
	var cols = AVA_SearchColumns();

	var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	
	for( ; searchresult != null; )
	{
		for(var k=0; searchresult != null && k<searchresult.length; k++)
		{
			try
			{
				recordIdArray[recordIdArray.length] = searchresult[k].getId();
				recordObjArray[recordObjArray.length] = searchresult[k];
			}
			catch(err)
			{
			}
		}
				
		filters[1] = new nlobjSearchFilter('internalid',null, 'noneof', recordIdArray);
		
		searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	}
	
	if(recordObjArray != null)
	{
		var ListStart = AVA_ResultsList(AVA_TransactionList);
		
		var FirstLink = '&lt;&lt;First Page';
		var PrevLink = 'Previous';
		var NextLink = 'Next';
		var LastLink = 'Last Page&gt;&gt;';
	
		//First Page
		if(AVA_PrevFlag == 'T')
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avascheduledlist_suitlet', 'customdeploy_avascheduledlist', false);
			URL1 = URL1 + '&ava_liststart=0';
						
		    FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
		}	
			
		//Previous
		if(AVA_PrevFlag == 'T')
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avascheduledlist_suitlet', 'customdeploy_avascheduledlist', false);
			URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
									
			PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
		}
							
		//Next
		if(AVA_NextFlag == 'T')
		{
			URL1 = nlapiResolveURL('SUITELET', 'customscript_avascheduledlist_suitlet', 'customdeploy_avascheduledlist', false);
			URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
					
			NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
		}
		
		//Last Page
		if(AVA_NextFlag == 'T')
		{
			URL1 = nlapiResolveURL('SUITELET', 'customscript_avascheduledlist_suitlet', 'customdeploy_avascheduledlist', false);
			URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
		
			LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
			AVA_TransactionForm.addField('ava_lastpage','help',FinalURL, null, AVA_Tab).setLayoutType('outsidebelow',null);	
		}	
			
		AVA_TransactionForm.addField('ava_star','help','(*) indicates Transactions deleted from NetSuite').setLayoutType('outsidebelow','startrow');
		
		var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
		var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
		html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
		var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
		PagingHtml.setLayoutType('outsidebelow','startrow');
	}

	AVA_TransactionForm.addPageLink('breadcrumb', 'Scheduled Transactions', nlapiResolveURL('SUITELET', 'customscript_avascheduledlist_suitlet', 'customdeploy_avascheduledlist'));
	response.writePage(AVA_TransactionForm);
}

function AVA_BodyFields(InForm, AVA_Tab)
{
	var AVA_TransactionList = InForm.addSubList('custpage_avatranslist', 'list', 'AvaTax Transactions', AVA_Tab);			

	AVA_TransactionList.addField('custrecord_ava_documentdate',			'date', 	'Document Date', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_documentinternalid',	'text', 	'AvaTax Document Number', 	'LEFT');
	AVA_TransactionList.addField('custrecord_ava_documentno',			'text', 	'NetSuite Document Number', 'LEFT');
	AVA_TransactionList.addField('custrecord_ava_documenttype',			'text', 	'AvaTax Document Type', 	'LEFT');
	AVA_TransactionList.addField('custrecord_ava_netsuitedoctype',		'text', 	'NetSuite Document Type', 	'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totalamount',			'currency', 'Total Amount', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totaldiscount',		'currency', 'Total Discount', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totalnontaxable',		'currency', 'Total Non-Taxable', 		'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totaltaxable',			'currency', 'Total Taxable', 			'LEFT');
	AVA_TransactionList.addField('custrecord_ava_totaltax',				'currency', 'Total Tax', 				'LEFT');

	return AVA_TransactionList;
}

function AVA_SearchColumns()
{
	var cols = new Array();
	cols[0]  = new nlobjSearchColumn('custrecord_ava_documentdate');
	cols[1]  = new nlobjSearchColumn('custrecord_ava_documentid');
	cols[2]  = new nlobjSearchColumn('custrecord_ava_documentinternalid');
	cols[3]  = new nlobjSearchColumn('custrecord_ava_documentno');
	cols[4]  = new nlobjSearchColumn('custrecord_ava_documenttype');
	cols[5]  = new nlobjSearchColumn('custrecord_ava_netsuitedoctype');
	cols[6]  = new nlobjSearchColumn('custrecord_ava_totalamount');
	cols[7]  = new nlobjSearchColumn('custrecord_ava_totaldiscount');
	cols[8]  = new nlobjSearchColumn('custrecord_ava_totaltaxable');
	cols[9]  = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
	cols[10] = new nlobjSearchColumn('custrecord_ava_totaltax');
	cols[11] = new nlobjSearchColumn('custrecord_ava_basecurrency');
	cols[12] = new nlobjSearchColumn('custrecord_ava_foreigncurr');
	cols[13] = new nlobjSearchColumn('custrecord_ava_exchangerate');
		
	return cols;	
}


function AVA_ResultsList(AVA_TransactionList)
{
	var RecordCountStart, RecordCountText;
	var j = (request.getParameter('ava_liststart')==null)? 0 : parseFloat(request.getParameter('ava_liststart'));
	AVA_LineCount = (request.getParameter('ava_linecount')==null)? 0: parseFloat(request.getParameter('ava_linecount'));
	
	var ListLimit = parseFloat(nlapiGetContext().getSetting('PREFERENCE', 'LISTSEGMENTSIZE'));
	var AVA_Flag = (request.getParameter('ava_flag')==null)? 'T' : request.getParameter('ava_flag');
	
	if(AVA_Flag == 'F')
	{
		if(AVA_LineCount>0)
		{
			if(AVA_LineCount<ListLimit)
			{
				MaxLength = parseFloat(ListLimit) + parseFloat(AVA_LineCount);
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
			else
			{
				MaxLength = (parseFloat(ListLimit) * parseFloat(2));
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
		}

	}
	
	for(var i=0; recordObjArray != null && i < ListLimit && j<recordObjArray.length && j>=0 ; i++, j++)
	{
		AVA_TransactionList.setLineItemValue('custrecord_ava_documentdate',			i+1, recordObjArray[j].getValue('custrecord_ava_documentdate'));
		AVA_TransactionList.setLineItemValue('custrecord_ava_documentinternalid',	i+1, (recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null && recordObjArray[j].getValue('custrecord_ava_documentinternalid').length > 0) ? recordObjArray[j].getValue('custrecord_ava_documentinternalid') : '*');
		
		var DocType = (recordObjArray[j].getValue('custrecord_ava_documenttype') == 2)? 'SalesInvoice' : 'ReturnInvoice';
		AVA_TransactionList.setLineItemValue('custrecord_ava_documenttype',			i+1, DocType);

		var NetDocType;
		switch(recordObjArray[j].getValue('custrecord_ava_netsuitedoctype'))
		{
			case '1':
				NetDocType = 'Invoice';
				break;
				
			case '2':
				NetDocType = 'Cash Sale';
				break;
				
			case '3':
				NetDocType = 'Credit Memo';
				break;
				
			case '4':
				NetDocType = 'Cash Refund';
				break;
				
			default:
				break;
		}
		
		if(recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null && recordObjArray[j].getValue('custrecord_ava_documentinternalid').length > 0)
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avagettaxhistory_suitelet', 'customdeploy_gettaxhistory', false);
			URL1 = URL1 + '&doctype=' + DocType +'&doccode=' + recordObjArray[j].getValue('custrecord_ava_documentinternalid') + '&rectype=' + NetDocType + '&subid=' + recordObjArray[j].getValue('custrecord_ava_subsidiaryid');
			
			var FinalURL = '<a href="' + URL1 + '" target="_blank">' + recordObjArray[j].getValue('custrecord_ava_documentno') + '</a>';
	
			AVA_TransactionList.setLineItemValue('custrecord_ava_documentno',			i+1, FinalURL);
		}
		else
		{
			AVA_TransactionList.setLineItemValue('custrecord_ava_documentno',			i+1, recordObjArray[j].getValue('custrecord_ava_documentno'));
		}
		
		AVA_TransactionList.setLineItemValue('custrecord_ava_netsuitedoctype',		i+1, NetDocType);
		AVA_TransactionList.setLineItemValue('custrecord_ava_totalamount',			i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totalamount')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totaldiscount',		i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totaldiscount')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totalnontaxable',		i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totalnontaxable')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totaltaxable',			i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltaxable')));
		AVA_TransactionList.setLineItemValue('custrecord_ava_totaltax',				i+1, parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltax')));
		
	}
	
	AVA_LineCount = i;
		
	if(AVA_Flag == 'F')
	{
		RecordCountStart = ListStart;
		var RecordEnd = parseFloat(i) + parseFloat(ListStart);
		RecordCountText = 'Records: ' + ((i==0) ? 1 : (parseFloat((RecordCountStart>=0)? RecordCountStart:0) + parseFloat(1))) + ' - ' + RecordEnd;
	}
	else
	{
		if(request.getMethod() == 'POST')
		{
			RecordCountStart = 0;
		}
		else
		{
			RecordCountStart = (request.getParameter('ava_liststart') == null)? 0:parseFloat(request.getParameter('ava_liststart'));
		}
		RecordCountText = 'Records: ' + ((i==0) ? 0 : (parseFloat(RecordCountStart) + parseFloat(1))) + ' - ' + j;
	}
	
	if(RecordCountStart>0)
  {
  	AVA_PrevFlag = 'T'; 
  }
  
  if(i==ListLimit)
  {
  	AVA_NextFlag = 'T';
  }
  
  try
  {
	  AVA_EndPage = String(parseFloat(recordObjArray.length)/parseFloat(ListLimit));
	  var AmountSplit = new Array();
	  AmountSplit = AVA_EndPage.split('.');
	  AVA_EndPage = parseFloat(AmountSplit[0]) * parseFloat(ListLimit);
	}
	catch(err)
	{
	}
	RecordCountText = RecordCountText + ' of ' + recordObjArray.length;
	AVA_TransactionList.setHelpText(RecordCountText);
	
	return j;
}


function AVA_ViewTransactions(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 12 ) == 0)
	{
		if(request.getMethod() == 'GET' || request.getMethod() == 'POST')
		{
			var AVA_TransactionForm = nlapiCreateForm('AvaTax Transactions');
			AVA_TransactionForm.setScript('customscript_avatransactionlist_client');
			AVA_TransactionForm.setTitle('AvaTax Transactions');
			
			var DateFrom 	= AVA_TransactionForm.addField('ava_datefrom',		'date',			'Starting Date');
			DateFrom.setDefaultValue(request.getParameter('ava_datefrom'));
			DateFrom.setMandatory(true);
			
			var DateTo 		= AVA_TransactionForm.addField('ava_dateto',		'date',			'Ending Date');
			DateTo.setDefaultValue(request.getParameter('ava_dateto'));
			DateTo.setMandatory(true);
			
			var DateFormat 	= AVA_TransactionForm.addField('ava_dateformat',		'text',			'Date Format');
			DateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
			DateFormat.setMandatory(true);
			DateFormat.setDisplayType('hidden');
			
			var DocumentType = AVA_TransactionForm.addField('ava_doctype',		'select',		'Document Type');
			DocumentType.addSelectOption('1', 'All');
			DocumentType.addSelectOption('2', 'SalesInvoice');
			DocumentType.addSelectOption('6', 'ReturnInvoice');
			DocumentType.setDefaultValue(request.getParameter('ava_doctype'));
			DocumentType.setMandatory(true);
		
			var DocumentStatus = AVA_TransactionForm.addField('ava_docstatus',		'select',		'Document Status');
			DocumentStatus.addSelectOption('1', 'All');
//			DocumentStatus.addSelectOption('2', 'Saved');
			DocumentStatus.addSelectOption('3', 'Committed');
			DocumentStatus.addSelectOption('4', 'Voided');
			DocumentStatus.setDefaultValue(request.getParameter('ava_docstatus'));
			DocumentStatus.setMandatory(true);
			
			var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
			
			var AVA_TransactionList = AVA_TransactionForm.addSubList('custpage_avatranslist', 'list', 'AvaTax Transactions', AVA_Tab);		
			AVA_TransactionList.addField('avainternalid', 		'text', 		'Internal Id', 					null);
			AVA_TransactionList.addField('avadocdate', 			'date', 		'Document Date', 				null);
//			AVA_TransactionList.addField('avatransid', 			'text', 		'AvaTax Transaction Id', 		null);
			AVA_TransactionList.addField('avadocno', 			'text', 		'AvaTax Document Number', 		null);
			AVA_TransactionList.addField('avanetdocno', 		'text', 		'NetSuite Document Number', 	null);
			AVA_TransactionList.addField('avadoctype', 			'text', 		'AvaTax Document Type', 		null);
			AVA_TransactionList.addField('avadocstatus', 		'text', 		'AvaTax Document Status', 		null);
			AVA_TransactionList.addField('avataxdate', 			'date', 		'Tax Calculation Date', 		null);
			AVA_TransactionList.addField('avatotamt', 			'currency', 	'Total Amount', 				null);
			AVA_TransactionList.addField('avatotdisc', 			'currency', 	'Total Discount', 				null);
			AVA_TransactionList.addField('avatotnontax', 		'currency', 	'Total Non-Taxable', 			null);
			AVA_TransactionList.addField('avatottaxable', 		'currency', 	'Total Taxable', 				null);
			AVA_TransactionList.addField('avatottax', 			'currency', 	'Total Tax', 					null);
			AVA_TransactionList.getField('avainternalid').setDisplayType('hidden');
	
			if((request.getParameter('ava_datefrom') != null) && (request.getParameter('ava_datefrom').length > 0))
			{
						
				//AVA_NextFlag = 'T';
				var ListStart = AVA_GetTransactionData(request.getParameter('ava_datefrom'), request.getParameter('ava_dateto'), request.getParameter('ava_doctype'), request.getParameter('ava_docstatus'), AVA_TransactionList);
				
				AVA_TransactionForm.addField('ava_linecount','integer','Line Count').setDisplayType('hidden');
				AVA_TransactionForm.getField('ava_linecount').setDefaultValue(AVA_LineCount);
				
				var FirstLink = '&lt;&lt;First Page';
				var PrevLink = 'Previous';
				var NextLink = 'Next';
				var LastLink = 'Last Page&gt;&gt;';
				
				//First Page
				if(AVA_PrevFlag == 'T')
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
					URL1 = URL1 + '&ava_liststart=0';
					
			        FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
				}	
					
				//Previous
				if(AVA_PrevFlag == 'T')
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_liststart='+ ListStart + '&ava_flag=F' + '&ava_linecount=' + AVA_LineCount;
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
									
					PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
				}
									
				//Next
				if(AVA_NextFlag == 'T')
				{
					URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_liststart=' + ListStart + '&ava_flag=T' + '&ava_linecount=' + AVA_LineCount;
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
				
					NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
				}
				
				//Last Page
				if(AVA_NextFlag == 'T')
				{
					URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist', false);
					URL1 = URL1 + '&ava_datefrom=' + request.getParameter('ava_datefrom') + '&ava_dateto=' + request.getParameter('ava_dateto') + '&ava_doctype='+request.getParameter('ava_doctype')+'&ava_docstatus='+request.getParameter('ava_docstatus');
					URL1 = URL1 + '&ava_liststart=' + AVA_EndPage + '&ava_linecount=' + AVA_LineCount;
				
					LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
				}	
				
				AVA_TransactionForm.addField('ava_star','help','<br>(*) indicates Transactions deleted from NetSuite<br><br>').setLayoutType('outsidebelow','startrow');
				
				var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
				var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
				html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
				var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
				PagingHtml.setLayoutType('outsidebelow','startrow');
			}
	
			AVA_TransactionForm.addSubmitButton('Get Records');
			AVA_TransactionForm.addPageLink('breadcrumb', 'AvaTax Transactions', nlapiResolveURL('SUITELET', 'customscript_avatransactionlist_suitelet', 'customdeploy_avatransactionlist'));
	
			response.writePage(AVA_TransactionForm);
		}
	}
}

function AVA_GetTransactionData(StartDate, EndDate, DocType, DocStatus, AVA_TransactionList)
{
	recordIdArray = new Array();
	recordObjArray= new Array();
	var RecordCountStart, RecordCountText;
	var filters = new Array();
	
	if(DocType == 1 && DocStatus == 1)
	{
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentdate', 	null, 'within', StartDate, EndDate);
	}
	else if(DocType == 1 && DocStatus != 1)
	{
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentdate',	null, 'within', StartDate, EndDate);
		if(DocStatus > 1)
		{
			DocStatus = (DocStatus == 2)? 1 : DocStatus;
			filters[1] = new nlobjSearchFilter('custrecord_ava_documentstatus',	null, 'equalto', DocStatus);
		}
	}	
	else	
	{
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentdate',	null, 'within', StartDate, EndDate);
		filters[1] = new nlobjSearchFilter('custrecord_ava_documenttype',	null, 'equalto', 	DocType);
		if(DocStatus > 1)
		{
			DocStatus = (DocStatus == 2)? 1 : DocStatus;
			filters[2] = new nlobjSearchFilter('custrecord_ava_documentstatus',	null, 'equalto', DocStatus);
		}
	}
	
	var cols = new Array();
	cols[0]  = new nlobjSearchColumn('custrecord_ava_documentid');
	cols[1]  = new nlobjSearchColumn('custrecord_ava_documentdate');
	cols[2]  = new nlobjSearchColumn('custrecord_ava_documentinternalid');
	cols[3]  = new nlobjSearchColumn('custrecord_ava_documentno');
	cols[4]  = new nlobjSearchColumn('custrecord_ava_documenttype');
	cols[5]  = new nlobjSearchColumn('custrecord_ava_documentstatus');
	cols[6]  = new nlobjSearchColumn('custrecord_ava_taxcalculationdate');
	cols[7]  = new nlobjSearchColumn('custrecord_ava_totalamount');
	cols[8]  = new nlobjSearchColumn('custrecord_ava_totaldiscount');
	cols[9]  = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
	cols[10] = new nlobjSearchColumn('custrecord_ava_totaltaxable');
	cols[11] = new nlobjSearchColumn('custrecord_ava_totaltax');
	cols[12] = new nlobjSearchColumn('custrecord_ava_basecurrency');
	cols[13] = new nlobjSearchColumn('custrecord_ava_foreigncurr');
	cols[14] = new nlobjSearchColumn('custrecord_ava_exchangerate');

	var NetSuiteURL = 'http://system.netsuite.com';
	var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	
	for( ; searchresult != null; )
	{
		for(var k=0; searchresult != null && k<searchresult.length; k++)
		{
			try
			{
				recordIdArray[recordIdArray.length] = searchresult[k].getId();
				recordObjArray[recordObjArray.length] = searchresult[k];
			}
			catch(err)
			{
			}
		}
		
		filters[filters.length] = new nlobjSearchFilter('internalid',		null, 'noneof', recordIdArray);
		
		searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
	}
	
	if(request.getMethod() == 'POST')
	{
		var j = 0;
		AVA_LineCount = 0;
	}
	else
	{
		var j = parseFloat(request.getParameter('ava_liststart'));
		AVA_LineCount = parseFloat(request.getParameter('ava_linecount'));
	}
	
	var ListLimit = parseFloat(nlapiGetContext().getSetting('PREFERENCE', 'LISTSEGMENTSIZE'));
	var AVA_Flag = request.getParameter('ava_flag');
	
	if(AVA_Flag == 'F')
	{
		if(request.getParameter('ava_linecount')>0)
		{
			if(request.getParameter('ava_linecount')<ListLimit)
			{
				MaxLength = parseFloat(ListLimit) + parseFloat(AVA_LineCount);
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
			else
			{
				MaxLength = (parseFloat(ListLimit) * parseFloat(2));
				ListStart = j = parseFloat(j) - parseFloat(MaxLength);
			}
		}

	}
		
	for(var i=0; recordObjArray != null && i < ListLimit && j<recordObjArray.length && j>=0 ; j++)
	{
	
		AVA_TransactionList.setLineItemValue('avainternalid', 	i+1, 	recordObjArray[j].getId());
		AVA_TransactionList.setLineItemValue('avadocdate', 		i+1, 	recordObjArray[j].getValue('custrecord_ava_documentdate'));
		
		var DocType = recordObjArray[j].getValue('custrecord_ava_documenttype');
		DocType = (DocType == 2)? 'SalesInvoice' : 'ReturnInvoice';
		AVA_TransactionList.setLineItemValue('avadoctype', 		i+1, 	DocType);
		
		if(recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null && recordObjArray[j].getValue('custrecord_ava_documentinternalid').length > 0)
		{
			var URL1 = nlapiResolveURL('SUITELET', 'customscript_avagettaxhistory_suitelet', 'customdeploy_gettaxhistory', false);
			URL1 = URL1 + '&doctype=' + DocType +'&doccode=' + recordObjArray[j].getValue('custrecord_ava_documentinternalid') + '&subid='+ recordObjArray[j].getValue('custrecord_ava_subsidiaryid');
			var FinalURL = '<a href="' + URL1 + '" target="_blank">' + recordObjArray[j].getValue('custrecord_ava_documentno') + '</a>';
			
			AVA_TransactionList.setLineItemValue('avanetdocno', 	i+1, 	FinalURL);
		}
		else
		{
			AVA_TransactionList.setLineItemValue('avanetdocno', 	i+1, 	recordObjArray[j].getValue('custrecord_ava_documentno'));
		}
			
		var DocStatus = recordObjArray[j].getValue('custrecord_ava_documentstatus');
		switch(DocStatus)
		{
			case '1':
				DocStatus = 'Saved';
				break;
				
			case '3':
				DocStatus = 'Committed';
				break;
				
			case '4':
				DocStatus = 'Voided';
				break;
				
			default:
				DocStatus = '0';
				break;
		}		
		AVA_TransactionList.setLineItemValue('avadocstatus', 		i+1, 	DocStatus);

		if(recordObjArray[j].getValue('custrecord_ava_documentinternalid') != null)
		{
			AVA_TransactionList.setLineItemValue('avadocno', 		i+1, 	recordObjArray[j].getValue('custrecord_ava_documentinternalid'));
		}
		else
		{
			AVA_TransactionList.setLineItemValue('avadocno', 		i+1, 	'*');
		}
		
		AVA_TransactionList.setLineItemValue('avataxdate', 		i+1, 	recordObjArray[j].getValue('custrecord_ava_taxcalculationdate'));
		AVA_TransactionList.setLineItemValue('avatotamt', 		i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totalamount')));
		AVA_TransactionList.setLineItemValue('avatotdisc', 		i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totaldiscount')));
		AVA_TransactionList.setLineItemValue('avatotnontax', 	i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totalnontaxable')));
		AVA_TransactionList.setLineItemValue('avatottaxable', i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltaxable')));
		AVA_TransactionList.setLineItemValue('avatottax', 		i+1, 	parseFloat(recordObjArray[j].getValue('custrecord_ava_totaltax')));
		i++;
	
	}
	
	AVA_LineCount = i;
	
	
	if(AVA_Flag == 'F')
	{
		RecordCountStart = ListStart;
		var RecordEnd = parseFloat(i) + parseFloat(ListStart);
		RecordCountText = 'Records: ' + ((i==0) ? 1 : (parseFloat((RecordCountStart>=0)? RecordCountStart:0) + parseFloat(1))) + ' - ' + RecordEnd;
	}
	else
	{
		if(request.getMethod() == 'POST')
		{
			RecordCountStart = 0;
		}
		else
		{
			RecordCountStart = parseFloat(request.getParameter('ava_liststart'));
		}
		RecordCountText = 'Records: ' + ((i==0) ? 0 : (parseFloat(RecordCountStart) + parseFloat(1))) + ' - ' + j;
	}
	
	if(RecordCountStart>0)
  {
  	AVA_PrevFlag = 'T'; 
  }
  
  if(i==ListLimit)
  {
  	AVA_NextFlag = 'T';
  }
  
  try
  {
	  AVA_EndPage = String(parseFloat(recordObjArray.length)/parseFloat(ListLimit));
	  var AmountSplit = new Array();
	  AmountSplit = AVA_EndPage.split('.');
	  AVA_EndPage = parseFloat(AmountSplit[0]) * parseFloat(ListLimit);
	}
	catch(err)
	{
	}
	RecordCountText = RecordCountText + ' of ' + recordObjArray.length;
	AVA_TransactionList.setHelpText(RecordCountText);
	
	return j;
}

function AVA_ValidateDates()
{
	var StartDate = nlapiGetFieldValue('ava_datefrom');
	var EndDate = nlapiGetFieldValue('ava_dateto');
	var DateFormat = nlapiGetFieldValue('ava_dateformat');

	if(StartDate.length == 0)
	{
		alert('Select Starting Date');
		return false;
	}
	
	if(EndDate.length == 0)
	{
		alert('Select Ending Date');
		return false;
	}
	
	StartDate = new Date(AVA_FormatDate(DateFormat,StartDate));
	EndDate = new Date(AVA_FormatDate(DateFormat,EndDate));
	
	if(EndDate < StartDate)
	{
		alert('Ending Date should be greater than or equal to Start Date');
		return false;
	}
	
	return true;
}

