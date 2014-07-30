/******************************************************************************************************
	Script Name  - AVA_Functions.js
	Company      - Avalara Technologies Pvt Ltd.
******************************************************************************************************/

/******************************************************************************************************/
/* Global Values Decalartion */
/******************************************************************************************************/
{
	var AVA_AccountValue, AVA_LicenseKey, AVA_ServiceUrl, AVA_ExpiryDate, AVA_ServiceTypes = '', AVA_EnableBatchService = 'F', AVA_Username, AVA_Password, AVA_ConnectorStartTime, AVA_ConnectorEndTime, AVA_LatencyTime = 0;
	var AVA_UDF1, AVA_UDF2, AVA_EntityUseCode, AVA_ItemAccount, AVA_DefaultShippingCode, AVA_DefaultMiscCode, AVA_CustomerCode, AVA_ShowMessages;
	var AVA_DisableTax, AVA_DisableLine, AVA_CalculateonDemand, AVA_DefaultTaxCode, AVA_DecimalPlaces, AVA_TaxRate, AVA_EnableLogging, AVA_TaxCodeMapping, AVA_MarkCustTaxable, AVA_DefaultCustomerTaxcode, AVA_BillableTimeName, AVA_UsePostingPeriod, AVA_TaxInclude, AVA_DisableLocationCode, AVA_EnableDiscount, AVA_DiscountMapping, AVA_DiscountTaxCode, AVA_LocationPOS, AVA_EnableUpcCode;
	var AVA_AbortBulkBilling, AVA_AbortUserInterfaces, AVA_AbortWebServices, AVA_AbortCSVImports, AVA_AbortScheduledScripts, AVA_AbortSuitelets;
	var AVA_DisableAddValidation, AVA_AddUpperCase, AVA_AddBatchProcessing, AVA_EnableAddValonTran;
				
	var AVA_Def_Addressee, AVA_Def_Addr1, AVA_Def_Addr2, AVA_Def_City, AVA_Def_State, AVA_Def_Zip, AVA_Def_Country;
	var AVA_TestVerify, AVA_Record, AVA_ConfigRecordID;
	var AVA_Features, AVA_Preferences;
	
	var AVA_LineNames, AVA_LineType, AVA_LineAmount, AVA_TaxLines, AVA_TaxGroups, AVA_TaxCodes, AVA_Taxable, AVA_PickUpFlag;
	var AVA_XMLTaxLines, AVA_XMLTaxDetails;
	var AVA_UserDateFormat, ShippingCode;
	var JSessionID, CntRecords=1, AVA_Loaded='F';
	var TaxCodeStatus, VerifyCredentials, AVA_LineChanged;
	
	var AVA_DocID, AVA_DocCode, AVA_DocDate, AVA_DocStatus, AVA_TaxDate, AVA_TotalAmount, AVA_TotalDiscount, AVA_GSTTotal = 0, AVA_PSTTotal = 0, AVA_ResultCode;
	var AVA_TotalExemption, AVA_TotalTaxable, AVA_TotalTax, AVA_DocumentType, AVA_LocationArray, AVA_TaxcodeArray, AVA_HeaderLocation, AVA_HeaderTaxcode, AVA_MultiShipAddArray, AVA_ShipGroupTaxcodes;

	var AVA_DocTaxable = 'T', AVA_CreateNotes = 'F', AVA_ErrorCode = 0, AVA_ShipCode, AVA_HandlingCode, responseLineTax, BillCostToCust;
	
	var exchangeRate = 1, multiCurr = 'F', baseCur, foreignCur, AVA_InitTaxCall, AVA_HeaderTaxChanged = 'F', AVA_FieldChangeTaxCall;
	
	var AVA_ClientAtt = 'NetSuite Basic 4.1', AVA_DelMax = 200;
	
	// Array to store lines which are actually sent to service. This array doesn't include Shipping and Handling lines.
	var AVA_TaxRequestLines;//AVA_TaxRequestLines[i][0]=Tab, AVA_TaxRequestLines[i][1]=Item Name, AVA_TaxRequestLines[i][2]=Index, AVA_TaxRequestLines[i][3]=TaxcodeArrayIndex
	
	var AVA_NS_Lines; // Array to store the tab names and the line numbers.
	var BillItemFlag = BillExpFlag = BillTimeFlag = 'F'; // Flags to identify if there is atleast an item existing in the tab.
	var BillItemTAmt = BillExpTAmt = BillTimeTAmt = 0; // Fields for the totals in each billable section.
	
	var AVA_ItemInfoArr; // to save item name, UDF1, UDF2,Income account and Taxcode mapping values
	var AVA_ShipToLatitude, AVA_ShipToLongitude, AVA_BillToLatitude, AVA_BillToLongitude;
	var BatchId, Rec_All, Rec_Estimate, Rec_SalesOrder, Rec_Invoice, Rec_CashSale, Rec_RetuAuth, Rec_CreditMemo, Rec_CashRefund, FromDate, ToDate, BatchStatus, RecalcType, LastTranId ,BatchCustomer;
	var RecalcMinUsage = 300, AVA_ValidFlag = 'F';

}
/***********************************************************************************************************/

function AVA_Ping()
{
	var Version = '';
	
	try
	{
		var response ;
		var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
		var headers = AVA_Header(security);
		var body = AVA_PingBody();
		var soapPayload = AVA_BuildEnvelope(headers + body);
		
		var soapHead = new Array();
		soapHead['Content-Type'] = 'text/xml';
		soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/Ping';
		
		response = nlapiRequestURL(AVA_ServiceUrl + '/tax/taxsvc.asmx', soapPayload, soapHead);
		if (response.getCode() == 200)
		{
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);
		    
			var PingResult = nlapiSelectNode(soapXML, "//*[name()='PingResult']");
		
			var ResultCode = nlapiSelectValue( PingResult, "//*[name()='ResultCode']");
			Version = nlapiSelectValue( PingResult, "//*[name()='Version']");
			return Version;
		}
		else
		{
			return Version;
		}
	}
	catch(err)
	{
		return Version;
	}
}

function AVA_Header(security)
{
	var soap = null;
	soap = '\t<soap:Header>\n';
	
		if(security != null)
		{
			soap += security;
		}
		
		soap += '\t\t<Profile xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<Name><![CDATA[' + nlapiGetContext().getName() + ']]></Name>\n';
			soap += '\t\t\t<Client><![CDATA[' + AVA_ClientAtt + ']]></Client>\n';
			soap += '\t\t\t<Adapter/>\n';
			soap += '\t\t\t<Machine/>\n';
		soap += '\t\t</Profile>\n';
	soap += '\t</soap:Header>\n';
 	return soap;
}

function AVA_PingBody()
{
 	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<Ping xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<Message>ping</Message>\n';
 		soap += '\t\t</Ping>\n';
 	soap += '\t</soap:Body>\n';
 	return soap;
}

function AVA_BuildEnvelope(actualcontents)
{
	var soap = null;
	soap = '<?xml version="1.0" encoding="utf-8"?>\n';
	soap += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n';
		soap += actualcontents;
	soap += '</soap:Envelope>';
	return soap;
}

function AVA_IsAuthorizedBody()
{
	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<IsAuthorized xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<Operations/>\n';
 		soap += '\t\t</IsAuthorized>\n';
 	soap += '\t</soap:Body>\n';
  	return soap;	
}

function AVA_BuildSecurity(AVA_AccountValue, AVA_LicenseKey)
{
	var soap = null;
	soap = '\t\t<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" soap:mustUnderstand="1">\n';	
		soap += '\t\t\t<wsse:UsernameToken>\n';
			soap += '\t\t\t\t<wsse:Username>' + AVA_AccountValue + '</wsse:Username>\n';
			soap += '\t\t\t\t<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + AVA_Decrypt(AVA_LicenseKey) + '</wsse:Password>\n';
		soap += '\t\t\t</wsse:UsernameToken>\n';
	soap += '\t\t</wsse:Security>\n';
	return soap;
}

function AVA_CalculateTax()
{
	var AVA_DocType = AVA_RecordType();	
	var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
	var headers = AVA_TaxHeader(security);
	var body = AVA_GetTaxBody(AVA_DocType);
	var soapPayload = AVA_GetTaxEnvelope(headers + body);
	
	var soapHead = new Array();
	soapHead['Content-Type'] = 'text/xml';
	soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/GetTax';

	try
	{
		AVA_ConnectorEndTime = new Date();
		
		var StartTime = new Date();
		var response = nlapiRequestURL(AVA_ServiceUrl + '/tax/taxsvc.asmx' , soapPayload, soapHead);
		var EndTime = new Date();
		
		AVA_ConnectorStartTime = new Date();
		AVA_LatencyTime = EndTime.getTime() - StartTime.getTime();
		
		if (response.getCode() == 200)
		{
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);

			var GetTaxResult = nlapiSelectNode(soapXML, "//*[name()='GetTaxResult']");
			AVA_ResultCode = nlapiSelectValue( GetTaxResult, "//*[name()='ResultCode']");
			
			if (AVA_ResultCode == 'Success') 
			{
				AVA_DocID 		= nlapiSelectValue( GetTaxResult, "//*[name()='DocId']");
				AVA_DocCode 		= nlapiSelectValue( GetTaxResult, "//*[name()='DocCode']");
				AVA_DocDate 		= nlapiSelectValue( GetTaxResult, "//*[name()='DocDate']");
				AVA_DocumentType    = nlapiSelectValue( GetTaxResult, "//*[name()='DocType']");
				AVA_DocStatus 		= nlapiSelectValue( GetTaxResult, "//*[name()='DocStatus']");
				AVA_TaxDate     	= nlapiSelectValue( GetTaxResult, "//*[name()='TaxDate']");
				AVA_TotalAmount 	= nlapiSelectValue( GetTaxResult, "//*[name()='TotalAmount']");
				AVA_TotalDiscount 	= nlapiSelectValue( GetTaxResult, "//*[name()='TotalDiscount']");
				AVA_TotalExemption 	= nlapiSelectValue( GetTaxResult, "//*[name()='TotalExemption']");
				AVA_TotalTaxable 	= nlapiSelectValue( GetTaxResult, "//*[name()='TotalTaxable']");
				AVA_TotalTax 		= nlapiSelectValue( GetTaxResult, "//*[name()='TotalTax']");
				
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 3)
				{
					var success = AVA_SetTaxFlagsOnServer(GetTaxResult);

					if(success == false)
					{
						return false;
					}
				}
				else
				{
					if(nlapiGetFieldValue('tax2total') != null)
					{
						AVA_GSTTotal = AVA_PSTTotal = 0;
						var DetailNodes = nlapiSelectNodes( GetTaxResult, "//*[name()='TaxDetail']");

						for(var i=0; i<DetailNodes.length ; i++)
						{
							var GSTCol = nlapiSelectValue( DetailNodes[i], "./*[name()='TaxName']");
							if(GSTCol.search('GST') != -1)
							{
								AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[i], "./*[name()='Tax']"));
							}
							else
							{
								if(GSTCol.search('HST') != -1)
								{
									AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[i], "./*[name()='Tax']"));
								}
								else
								{
									AVA_PSTTotal += parseFloat(nlapiSelectValue( DetailNodes[i], "./*[name()='Tax']"));
								}
							}
						}
					}
				}
								
				AVA_SetDocTotal(AVA_DocType);
				
				if ((AVA_DocType == 'SalesInvoice') || (AVA_DocType == 'ReturnInvoice'))
				{
					/* Read the XML file completely and update it into custom records */
					if(AVA_DocStatus != 'Temporary')
					{
						// Call Transaction Update over here
						nlapiSetFieldValue('custpage_ava_docno', 			AVA_DocCode);
						nlapiSetFieldValue('custpage_ava_docdate', 			AVA_DocDate);
						nlapiSetFieldValue('custpage_ava_docstatus', 		AVA_DocStatus );
						nlapiSetFieldValue('custpage_ava_taxdate', 			AVA_TaxDate);
						nlapiSetFieldValue('custpage_ava_totalamount', 		AVA_TotalAmount);
						nlapiSetFieldValue('custpage_ava_totaldiscount', 		AVA_TotalDiscount);
						nlapiSetFieldValue('custpage_ava_totalnontaxable', 	AVA_TotalExemption);
						nlapiSetFieldValue('custpage_ava_totaltaxable', 		AVA_TotalTaxable );
						nlapiSetFieldValue('custpage_ava_totaltax', 			AVA_TotalTax);
						
						if(nlapiGetFieldValue('tax2total') != null)
						{
							nlapiSetFieldValue('custpage_ava_gsttax',     AVA_GSTTotal);
							nlapiSetFieldValue('custpage_ava_psttax',     AVA_PSTTotal);
						}
					}
				}
				
				AVA_LogTaxResponse('T', response, StartTime);

				return true;
			}
			else if(AVA_ResultCode == 'Warning')
			{
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && (AVA_ShowMessages == 1 || AVA_ShowMessages == 3))
				{
					AVA_ErrorCode = 'Warning';
					alert('Warning');
				}
				else
				{
					AVA_ErrorCode = 'Warning';
					nlapiLogExecution('DEBUG', 'Warning');
				}
				
				AVA_LogTaxResponse('T', response, StartTime);
				return true;
			}
			else if (AVA_ResultCode == 'Error')
			{
				var AVA_Messages = nlapiSelectNode( GetTaxResult, "//*[name()='Messages']");
				var AVA_Message = nlapiSelectValue( AVA_Messages, "//*[name()='Summary']");
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && (AVA_ShowMessages == 2 || AVA_ShowMessages == 3))
				{
					AVA_ErrorCode = AVA_Message;
					alert("This Document has used AvaTax Services. " + AVA_Message);
				}
				else
				{
					AVA_ErrorCode = AVA_Message;
					nlapiLogExecution('DEBUG', 'Error Message', AVA_Message);
					nlapiLogExecution('DEBUG', 'Error', response.getCode());
				}
				
				if(AVA_Message != null && AVA_Message.search('locked') != -1)
				{
					var Multiplier = (AVA_DocType == 'SalesInvoice')? 1 : -1;
					
					AVA_TotalTax = nlapiGetFieldValue('custpage_ava_totaltax') * Multiplier;
					
					if(nlapiGetFieldValue('tax2total') != null)
					{
						AVA_GSTTotal = nlapiGetFieldValue('custpage_ava_gsttax') * Multiplier;
						AVA_PSTTotal = nlapiGetFieldValue('custpage_ava_psttax') * Multiplier;
					}
				}
				
				AVA_SetDocTotal(AVA_DocType);

				return false;
			}
			else if(AVA_ResultCode == 'Exception')
			{
				var AVA_Messages = nlapiSelectNode( GetTaxResult, "//*[name()='Messages']");
				var AVA_Message = nlapiSelectValue( AVA_Messages, "//*[name()='Summary']");
	
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && (AVA_ShowMessages == 2 || AVA_ShowMessages == 3))
				{
					AVA_ErrorCode = AVA_Message;
					alert("This Document has used AvaTax Services. " + AVA_Message);
				}
				else
				{
					AVA_ErrorCode = AVA_Message;
					nlapiLogExecution('DEBUG', 'Exception', AVA_Message); 
					nlapiLogExecution('DEBUG', 'Exception', response.getCode());  
				}
				AVA_SetDocTotal(AVA_DocType);
				return false;
			}
		}
		else
		{ 
			AVA_ErrorCode = "Tax Calculation call to AvaTax Service failed. Please contact the Administrator.";
			if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && (AVA_ShowMessages == 2 || AVA_ShowMessages == 3))
			{
				alert("Tax Calculation call to AvaTax Service failed. Please contact the Administrator.");
			}
			else
			{
				nlapiLogExecution('DEBUG', 'Please contact the administrator');
				nlapiLogExecution('DEBUG', 'Response Code', response.getCode());
			}
			return false;
		}
	}
	catch(err)
	{
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && (AVA_ShowMessages == 2 || AVA_ShowMessages == 3))
		{
			alert("Please contact the administrator");
			
			try
			{
				AVA_ErrorCode = 'Please contact the Administrator. ' + err.getDetails();
			}
			catch(e)
			{
				AVA_ErrorCode = 'Please contact the Administrator';
			}
			
			AVA_LogTaxResponse('T');
		}
		else
		{
			nlapiLogExecution('DEBUG', 'Please contact the administrator');
						
			try
			{
				nlapiLogExecution('DEBUG', 'Try/Catch Error', err.getDetails());
				AVA_ErrorCode = 'Please contact the Administrator. ' + err.getDetails();
			}
			catch(e)
			{
				AVA_ErrorCode = 'Please contact the Administrator';
			}
			
			AVA_LogTaxResponse('T');
		}
		return false;
	}
	
	AVA_LogTaxResponse('T', response, StartTime);
	return true;
	
}

function AVA_SetTaxFlagsOnServer(GetTaxResult)
{   
	var responseLineArray = new Array();
	var responseLineTax = new Array();
	var DefTaxCodeId, DefTaxCode = (AVA_DefaultTaxCode != null) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : ''; 
	
	var ShowTaxRate, ShowDecimalPlaces;
	
	ShowTaxRate = AVA_TaxRate;
	ShowDecimalPlaces = AVA_DecimalPlaces;
	
	if (ShowTaxRate == 0)
	{
		//show base rate
		var AVA_TotalTaxRate = (AVA_TotalTaxable != 0) ? parseFloat((AVA_TotalTax/AVA_TotalTaxable) * 100) : 0; 
	}
	else
	{
		//show net rate	
		var AVA_TotalTaxRate = (AVA_TotalAmount != 0) ? parseFloat(AVA_TotalTax * 100) / parseFloat(AVA_TotalAmount) : 0; 
	}

	var AVA_DocType = AVA_RecordType();
	var Multiplier = (AVA_DocType == 'SalesInvoice' || AVA_DocType == 'SalesOrder')? 1 : -1;
	DefTaxCodeId = (AVA_DefaultTaxCode != null) ? AVA_DefaultTaxCode.substring(AVA_DefaultTaxCode.lastIndexOf('+') + 1, AVA_DefaultTaxCode.length) : '';
	
	/*if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 3)
	{
		var filter = new Array();
		filter[0] = new nlobjSearchFilter('itemid',null,'is',DefTaxCode);
													
		var searchresult = nlapiSearchRecord('salestaxitem',null,filter,null); 
		
		if(searchresult == null)
		{
			searchresult = nlapiSearchRecord('taxgroup',null,filter,null); 
			DefTaxCodeId = (searchresult != null) ? searchresult[0].getId() : '';
		}
		else
		{
			DefTaxCodeId = searchresult[0].getId();
		}	
	}
	else if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && nlapiGetFieldValue('custpage_ava_context') == 'webstore')
	{
		var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', true);						
		
		var response = nlapiRequestURL( suiteletUrl + '&type=salestaxitem&code=' + DefTaxCode, null, null );

		DefTaxCodeId = response.getBody();
	}*/
	responseLineArray = nlapiSelectNodes( GetTaxResult, "//*[name()='TaxLine']");

	for(var i=0; i<responseLineArray.length ; i++)
	{
		responseLineTax[i] = (nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") != 0 )? 'T' : 'F';
	}

	if(nlapiGetFieldValue('taxitem') != null)
	{
		var TaxCode = nlapiGetFieldValue('custpage_ava_formtaxcode');

		if(AVA_TotalTax != 0)
		{
			nlapiSetFieldValue('istaxable', 'T');
			
			if(TaxCode != DefTaxCode && TaxCode != DefTaxCode + '-POD' && TaxCode != DefTaxCode + '-POS')
			{
				// AVATAX - CONFIG   AVATAX-CAN - TRANSACTION
				if (DefTaxCode != TaxCode.substring(0, DefTaxCode.length))
				{				
					nlapiSetFieldValue('taxitem', DefTaxCodeId);
	
					if(nlapiGetFieldValue('taxitem') != DefTaxCodeId)
					{
						AVA_ErrorCode = 'Unable to flip the Transaction tax code to Configuration tax code. ';
						return false;
					}
				}
			}
		}
		
		nlapiSetFieldValue('taxrate', AVA_TotalTaxRate.toFixed(ShowDecimalPlaces));
			
		for(var i=0; AVA_TaxRequestLines != null && i<AVA_TaxRequestLines.length ; i++)
		{
			var TaxableField = (AVA_TaxRequestLines[i][0] == 'item') ? 'istaxable' : 'taxable';
			
			var currentLine = nlapiGetLineItemValue(AVA_TaxRequestLines[i][0], TaxableField, parseInt(AVA_TaxRequestLines[i][2]));
			
			if(currentLine != responseLineTax[i] && currentLine != 'T')
			{
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], TaxableField, parseInt(AVA_TaxRequestLines[i][2]), 'T');
			}
			if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T')
			{
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'amount', AVA_TaxRequestLines[i][2],(parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Exemption']"))).toFixed(ShowDecimalPlaces) * Multiplier);
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'custcol_ava_gross_amount1', AVA_TaxRequestLines[i][2],(parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Exemption']"))).toFixed(ShowDecimalPlaces) * Multiplier);
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'custcol_ava_gross_amount', AVA_TaxRequestLines[i][2], AVA_LineAmount[AVA_TaxRequestLines[i][3] - 1]);
			}
		}
	}
	else
	{
		for(var i=0; AVA_TaxRequestLines != null && i < AVA_TaxRequestLines.length ; i++)
		{
			var TaxCode = AVA_TaxcodeArray[AVA_TaxRequestLines[i][3]-1];
			
			/*if(nlapiGetFieldValue('nexus_country') != 'US' && nlapiGetFieldValue('nexus_country') != 'CA')
			{
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'tax1amt', AVA_TaxRequestLines[i][2], nlapiFormatCurrency(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier));
			}*/
	
			if(responseLineTax[i] == 'T' && (TaxCode != DefTaxCode && TaxCode != DefTaxCode + '-POD' && TaxCode != DefTaxCode + '-POS'))
			{
				// AVATAX - CONFIG   AVATAX-CAN - TRANSACTION
				if (DefTaxCode != TaxCode.substring(0, DefTaxCode.length))
				{				
					nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxcode', AVA_TaxRequestLines[i][2], DefTaxCodeId);
					
					if(nlapiGetLineItemValue(AVA_TaxRequestLines[i][0], 'taxcode', AVA_TaxRequestLines[i][2]) != DefTaxCodeId)
					{
						AVA_ErrorCode = 'Unable to flip the tax code of Item at Line: ' + AVA_TaxRequestLines[i][2] + 'in Tab: ' + AVA_TaxRequestLines[i][0] + ' to Configuration tax code. ';
						return false;
					}
				}
			}
			
			if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T')
			{
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'amount', AVA_TaxRequestLines[i][2],(parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Exemption']"))).toFixed(ShowDecimalPlaces) * Multiplier);
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'custcol_ava_gross_amount1', AVA_TaxRequestLines[i][2],(parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Exemption']"))).toFixed(ShowDecimalPlaces) * Multiplier);
				nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'custcol_ava_gross_amount', AVA_TaxRequestLines[i][2], AVA_LineAmount[AVA_TaxRequestLines[i][3] - 1]);
			}
			
			if(nlapiGetFieldValue('tax2total') != null)
			{
				if (nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier == 0)
				{				
					if (ShowTaxRate == 0)
					{
						//show base rate
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2], 0);
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate2', AVA_TaxRequestLines[i][2], 0);
					}
					else
					{
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2], 0);
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate2', AVA_TaxRequestLines[i][2], 0);
					}
				}
				else
				{
					var PSTFlag = 'F';
					var DetailNodes = nlapiSelectNodes( nlapiSelectNode(responseLineArray[i], "./*[name()='TaxDetails']"), "./*[name()='TaxDetail']");

					if(DetailNodes != null)
					{
						var GSTCol = nlapiSelectValue( DetailNodes[0], "./*[name()='TaxName']");
						if(GSTCol.search('GST') != -1)
						{
							var AVA_LineTaxRate;//old code
							if (ShowTaxRate == 0)
							{
								AVA_LineTaxRate = (nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNodes[0], "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']")) * 100) : 0; 
							}
							else
							{
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Exemption']"));
								AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 									
							}
							nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2], AVA_LineTaxRate.toFixed(ShowDecimalPlaces));
							AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Tax']"));
							PSTFlag = 'T';
						}
						else
						{
							var AVA_LineTaxRate;
							var DetailNode = (DetailNodes.length == 2) ? DetailNodes[1] : DetailNodes[0];
							if (ShowTaxRate == 0)
							{
								AVA_LineTaxRate = (nlapiSelectValue( DetailNode, "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNode, "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNode, "./*[name()='Taxable']")) * 100) : 0; 
							}
							else
							{
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Exemption']"));
								AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 																
							}
							nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate2', AVA_TaxRequestLines[i][2], AVA_LineTaxRate.toFixed(ShowDecimalPlaces));
							AVA_PSTTotal += parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Tax']"));
							PSTFlag = 'F';
						}
						
						if(PSTFlag == 'T' && DetailNodes[1] != null)
						{
							var AVA_LineTaxRate1;
							if (ShowTaxRate == 0)
							{
								AVA_LineTaxRate1 = (nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNodes[1], "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']")) * 100) : 0; 
							}
							else
							{
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Exemption']"));
								AVA_LineTaxRate1 = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 									
							}
							var HSTCol = nlapiSelectValue( DetailNodes[1], "./*[name()='TaxName']");
							if(HSTCol.search('HST') != -1)
							{
								nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2], (AVA_LineTaxRate + AVA_LineTaxRate1).toFixed(ShowDecimalPlaces));
								AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']"));
							}
							else
							{
								nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate2', AVA_TaxRequestLines[i][2], AVA_LineTaxRate1.toFixed(ShowDecimalPlaces));
								AVA_PSTTotal += parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']"));
							}
							
							PSTFlag = 'F';
						}	
					}
				}
			}
			else
			{
				if (nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier == 0)
				{
					if (ShowTaxRate == 0)
					{
						//show base rate:TODO
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2], 0);
					}
					else
					{
						//show net rate
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2], 0);
					}
				}
				else if(responseLineTax[i] == 'T')
				{					
					if (ShowTaxRate == 0)
					{
						//show base rate
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2],parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Rate']")*100).toFixed(ShowDecimalPlaces));
					}
					else
					{
						var LineTotalAmt = parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Exemption']"));
						var AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 					
						nlapiSetLineItemValue(AVA_TaxRequestLines[i][0], 'taxrate1', AVA_TaxRequestLines[i][2],parseFloat(AVA_LineTaxRate).toFixed(ShowDecimalPlaces));
					}
				}
			}
		}
		
		if((nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F' || nlapiGetFieldValue('ismultishipto') == 'No'))) && (AVA_ShipCode == 'T' || AVA_HandlingCode == 'T'))
		{
			if(nlapiGetFieldValue('shippingtaxcode') != null && parseFloat(nlapiGetFieldValue('shippingcost')) > 0)
			{
				var TaxCode = nlapiGetFieldValue('custpage_ava_shiptaxcode');
				
				if(responseLineTax[i] == 'T' && AVA_ShipCode == 'T' && i<responseLineTax.length && (TaxCode != DefTaxCode && TaxCode != DefTaxCode + '-POD' && TaxCode != DefTaxCode + '-POS'))
				{
					// AVATAX - CONFIG   AVATAX-CAN - TRANSACTION
					if (DefTaxCode != TaxCode.substring(0, DefTaxCode.length))
					{					
						nlapiSetFieldValue('shippingtaxcode', DefTaxCodeId);
						
						if(nlapiGetFieldValue('shippingtaxcode') != DefTaxCodeId)
						{
							AVA_ErrorCode = 'Unable to flip the Shipping tax code to Configuration tax code. ';
							return false;
						}
					}
				}
				
				if(nlapiGetFieldValue('tax2total') == null)
				{
					if(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") == 0)
					{
						if (ShowTaxRate == 0)
						{
							//show base rate:TODO
							nlapiSetFieldValue('shippingtax1rate', 0);
						}
						else
						{
							//show net rate
							nlapiSetFieldValue('shippingtax1rate', 0);
						}
					}
					else
					{
						if (ShowTaxRate == 0)
						{
							//show base rate
							nlapiSetFieldValue('shippingtax1rate', parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Rate']") * 100).toFixed(ShowDecimalPlaces));
						}
						else
						{
							//show net rate							
							var LineTotalAmt = parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Exemption']"));
							var AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 					
							nlapiSetFieldValue('shippingtax1rate', parseFloat(AVA_LineTaxRate).toFixed(ShowDecimalPlaces));															
						}						
					}
				}
				else
				{
					if (nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier == 0)
					{
						if (ShowTaxRate == 0)
						{
							//show base rate: TODO
							nlapiSetFieldValue('shippingtax1rate', 0);
							nlapiSetFieldValue('shippingtax2rate', 0);	
						}
						else
						{
							//show net rate							
							nlapiSetFieldValue('shippingtax1rate', 0);
							nlapiSetFieldValue('shippingtax2rate', 0);
						}	
					}
					else
					{
						var PSTFlag = 'F';
						var DetailNodes = nlapiSelectNodes( nlapiSelectNode(responseLineArray[i], "./*[name()='TaxDetails']"), "./*[name()='TaxDetail']");
						
						var GSTCol = nlapiSelectValue( DetailNodes[0], "./*[name()='TaxName']");
						if(GSTCol.search('GST') != -1)
						{
							var AVA_LineTaxRate;						
							if (ShowTaxRate == 0)
							{
								//show base rate
								AVA_LineTaxRate = (nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNodes[0], "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']")) * 100) : 0; 								
							}
							else
							{
								//show net rate						
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Exemption']"));
								AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 														
							}
							
							nlapiSetFieldValue('shippingtax1rate', AVA_LineTaxRate.toFixed(ShowDecimalPlaces));
							AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Tax']"));
							PSTFlag = 'T';
						}
						else
						{
							var AVA_LineTaxRate;
							var DetailNode = (DetailNodes.length == 2) ? DetailNodes[1] : DetailNodes[0];
							
							if (ShowTaxRate == 0)
							{
								//show base rate
								AVA_LineTaxRate = (nlapiSelectValue( DetailNode, "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNode, "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNode, "./*[name()='Taxable']")) * 100) : 0; 
							}
							else
							{
								//show net rate						
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Exemption']"));
								AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 														
							}
							
							nlapiSetFieldValue('shippingtax2rate', AVA_LineTaxRate.toFixed(ShowDecimalPlaces));
							AVA_PSTTotal += parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Tax']"));
							PSTFlag = 'F';
						}
						
						if(PSTFlag == 'T')
						{
							var AVA_LineTaxRate1;
							if (ShowTaxRate == 0)
							{
								//show base rate
								AVA_LineTaxRate1 = (nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNodes[1], "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']")) * 100) : 0; 
							}
							else
							{
								//show net rate						
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Exemption']"));
								AVA_LineTaxRate1 = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 														
							}						
							
							var HSTCol = nlapiSelectValue( DetailNodes[1], "./*[name()='TaxName']");
							if(HSTCol.search('HST') != -1)
							{
								nlapiSetFieldValue('shippingtax1rate', (AVA_LineTaxRate + AVA_LineTaxRate1).toFixed(ShowDecimalPlaces));
								AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']"));
							}
							else
							{
								nlapiSetFieldValue('shippingtax2rate', AVA_LineTaxRate1.toFixed(ShowDecimalPlaces));
								AVA_PSTTotal += parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']"));
							}
							PSTFlag = 'F';
						}
					}
				}
				
				if(nlapiGetFieldValue('nexus_country') != 'US' && nlapiGetFieldValue('nexus_country') != 'CA')
				{
					nlapiSetFieldValue('shippingtax1amt',nlapiFormatCurrency(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier));
				}
			}
			
			if(AVA_ShipCode == 'T' && AVA_HandlingCode == 'T')
			{
				i++;          
			}
			
			if(nlapiGetFieldValue('handlingtaxcode') != null && parseFloat(nlapiGetFieldValue('handlingcost')) > 0)
			{
				var TaxCode = nlapiGetFieldValue('custpage_ava_handlingtaxcode');
				
				if(responseLineTax[i] == 'T' && AVA_HandlingCode == 'T' && i<responseLineTax.length && (TaxCode != DefTaxCode && TaxCode != DefTaxCode + '-POD' && TaxCode != DefTaxCode + '-POS'))
				{
					// AVATAX - CONFIG   AVATAX-CAN - TRANSACTION
					if (DefTaxCode != TaxCode.substring(0, DefTaxCode.length))
					{
						nlapiSetFieldValue('handlingtaxcode', DefTaxCodeId);
						if(nlapiGetFieldValue('handlingtaxcode') != DefTaxCodeId)
						{
							AVA_ErrorCode = 'Unable to flip the Handling tax code to Configuration tax code. ';
							return false;
						}
					}
				}
				
				if(nlapiGetFieldValue('tax2total') == null)
				{
					if (nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier == 0)
					{
						if (ShowTaxRate == 0)
						{
							//show base rate:TODO
							nlapiSetFieldValue('handlingtax1rate', 0);
						}
						else
						{
							//show net rate
							nlapiSetFieldValue('handlingtax1rate', 0);
						}
					}
					else
					{
						if (ShowTaxRate == 0)
						{
							//show base rate
							nlapiSetFieldValue('handlingtax1rate', parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Rate']") * 100).toFixed(ShowDecimalPlaces));
						}
						else
						{
							//show net rate							
							var LineTotalAmt = parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Exemption']"));
							var AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 					
							nlapiSetFieldValue('handlingtax1rate', parseFloat(AVA_LineTaxRate).toFixed(ShowDecimalPlaces));															
						}
					}
				}
				else
				{
					if (nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier == 0)
					{
						if (ShowTaxRate == 0)
						{
							//show base rate: TODO
							nlapiSetFieldValue('handlingtax1rate', 0);
							nlapiSetFieldValue('handlingtax2rate', 0);
						}
						else
						{
							//show net rate							
							nlapiSetFieldValue('handlingtax1rate', 0);
							nlapiSetFieldValue('handlingtax2rate', 0);
						}	
					}
					else
					{
						var PSTFlag = 'F';
						var DetailNodes = nlapiSelectNodes( nlapiSelectNode(responseLineArray[i], "./*[name()='TaxDetails']"), "./*[name()='TaxDetail']");
						
						var GSTCol = nlapiSelectValue( DetailNodes[0], "./*[name()='TaxName']");
						if(GSTCol.search('GST') != -1)
						{
							var AVA_LineTaxRate;						
							if (ShowTaxRate == 0)
							{
								//show base rate
								AVA_LineTaxRate = (nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNodes[0], "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']")) * 100) : 0; 								
							}
							else
							{
								//show net rate						
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Exemption']"));
								AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 														
							}
							
							nlapiSetFieldValue('handlingtax1rate', AVA_LineTaxRate.toFixed(ShowDecimalPlaces));
							AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[0], "./*[name()='Tax']"));
							PSTFlag = 'T';
						}
						else
						{
							var AVA_LineTaxRate;
							var DetailNode = (DetailNodes.length == 2) ? DetailNodes[1] : DetailNodes[0];
							
							if (ShowTaxRate == 0)
							{
								//show base rate
								AVA_LineTaxRate = (nlapiSelectValue( DetailNode, "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNode, "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNode, "./*[name()='Taxable']")) * 100) : 0; 
							}
							else
							{
								//show net rate						
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Exemption']"));
								AVA_LineTaxRate = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 														
							}
							
							nlapiSetFieldValue('handlingtax2rate', AVA_LineTaxRate.toFixed(ShowDecimalPlaces));
							AVA_PSTTotal += parseFloat(nlapiSelectValue( DetailNode, "./*[name()='Tax']"));
							PSTFlag = 'F';
						}
						
						if(PSTFlag == 'T')
						{
							var AVA_LineTaxRate1;
							if (ShowTaxRate == 0)
							{
								//show base rate
								AVA_LineTaxRate1 = (nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']") != 0) ? parseFloat((nlapiSelectValue( DetailNodes[1], "./*[name()='TaxCalculated']")/nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']")) * 100) : 0; 
							}
							else
							{
								//show net rate						
								var LineTotalAmt = parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Taxable']")) + parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Exemption']"));
								AVA_LineTaxRate1 = (LineTotalAmt != 0) ? parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']") * 100) / parseFloat(LineTotalAmt) : 0; 														
							}						
							
							var HSTCol = nlapiSelectValue( DetailNodes[1], "./*[name()='TaxName']");
							if(HSTCol.search('HST') != -1)
							{
								nlapiSetFieldValue('handlingtax1rate', (AVA_LineTaxRate + AVA_LineTaxRate1).toFixed(ShowDecimalPlaces));
								AVA_GSTTotal += parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']"));
							}
							else
							{
								nlapiSetFieldValue('handlingtax2rate', AVA_LineTaxRate1.toFixed(ShowDecimalPlaces));
								AVA_PSTTotal += parseFloat(nlapiSelectValue( DetailNodes[1], "./*[name()='Tax']"));
							}
							
							PSTFlag = 'F';
						}
					}
				}
										
				if(nlapiGetFieldValue('nexus_country') != 'US' && nlapiGetFieldValue('nexus_country') != 'CA')
				{
					nlapiSetFieldValue('handlingtax1amt',nlapiFormatCurrency(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier));
				}
			}
		}
		else if((nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto') == 'T' || nlapiGetFieldValue('ismultishipto') == 'Yes')) && (AVA_ShipCode == 'T' || AVA_HandlingCode == 'T'))
		{
			for(var k=0 ; AVA_ShipGroupTaxcodes != null && k < AVA_ShipGroupTaxcodes.length ; k++)
			{
				var fieldName = (AVA_ShipGroupTaxcodes[k][3] == 'FREIGHT') ? 'shippingrate' : 'handlingrate';
				if(nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0]) != null && nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0]) > 0)
				{
					var TaxCode = AVA_ShipGroupTaxcodes[k][2];
				
					if(responseLineTax[i] == 'T' && AVA_ShipCode == 'T' && i<responseLineTax.length && (TaxCode != DefTaxCode && TaxCode != DefTaxCode + '-POD' && TaxCode != DefTaxCode + '-POS'))
					{
//						var fieldName = (AVA_ShipGroupTaxcodes[k][3] == 'FREIGHT') ? 'shippingtaxcode' : 'handlingtaxcode';
//						
//						if(nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0]) != null)
//						{
							// AVATAX - CONFIG   AVATAX-CAN - TRANSACTION
							if (DefTaxCode != TaxCode.substring(0, DefTaxCode.length))
							{
	//							nlapiLogExecution('Debug','Before Set: DefTaxCodeId' + DefTaxCodeId, nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0]));
	//							nlapiSetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0], DefTaxCodeId);
	//							nlapiLogExecution('Debug','After Set: ', nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0]));
	//						
	//							if(nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0]) != DefTaxCodeId)
	//							{
	//								AVA_ErrorCode = 'Unable to flip the Shipping tax code to Configuration tax code. ';
	//								return false;
	//							}
							}
//						}
					}
					
//					var fieldName = (AVA_ShipGroupTaxcodes[k][3] == 'FREIGHT') ? 'shippingtaxrate' : 'handlingtaxrate';
//					
//					if(nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0]) != null)
//					{
//						nlapiSetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0], parseFloat(nlapiSelectValue( responseLineArray[i], "./*[name()='Rate']") * 100).toFixed(2));
//					}
					
//					if(nlapiGetFieldValue('edition') != 'US' && nlapiGetFieldValue('edition') != 'CA')
//					{
//						var fieldName = (AVA_ShipGroupTaxcodes[k][3] == 'FREIGHT') ? 'shippingtaxamt' : 'handlingtaxamt';
//						nlapiSetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[k][0], nlapiFormatCurrency(nlapiSelectValue( responseLineArray[i], "./*[name()='Tax']") * Multiplier));
//					}
					
					i++;
				}
			}
		}		
	}
}

function AVA_SetDocTotal(AVA_DocType)
{
	var PSTTotal = 0;
	
	exchangeRate = nlapiGetFieldValue('exchangerate');
	if(nlapiGetFieldValue('custpage_ava_context') == 'webstore')
	{
		AVA_DocType = 'SalesOrder';
	}

	var Multiplier = (AVA_DocType == 'SalesInvoice' || AVA_DocType == 'SalesOrder')? 1 : -1;
	nlapiSetFieldValue('taxamountoverride', nlapiFormatCurrency(AVA_TotalTax * Multiplier), true);
	
	if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
	{
		document.forms['main_form'].elements['taxamountoverride'].value = format_currency(AVA_TotalTax * Multiplier);  
		setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(AVA_TotalTax * Multiplier));
	}
	
	var TaxTotal = (nlapiGetFieldValue('taxamountoverride') != null && nlapiGetFieldValue('taxamountoverride').length > 0 )? parseFloat(nlapiGetFieldValue('taxamountoverride')) : 0;
	
	if(nlapiGetFieldValue('tax2total') != null)
	{
		nlapiSetFieldValue('taxamountoverride', nlapiFormatCurrency(AVA_GSTTotal * Multiplier), true);
		nlapiSetFieldValue('taxamount2override', nlapiFormatCurrency(AVA_PSTTotal * Multiplier), true);
		
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
		{
			document.forms['main_form'].elements['taxamountoverride'].value = format_currency(AVA_GSTTotal * Multiplier);  
			setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(AVA_GSTTotal * Multiplier));
			
			document.forms['main_form'].elements['taxamount2override'].value = format_currency(AVA_PSTTotal * Multiplier);  
			setInlineTextValue(document.getElementById('taxamount2override_val'),format_currency(AVA_PSTTotal * Multiplier));
		}
		
		TaxTotal = (nlapiGetFieldValue('taxamountoverride')!=null && nlapiGetFieldValue('taxamountoverride').length > 0 )? parseFloat(nlapiGetFieldValue('taxamountoverride')) : 0; 
		PSTTotal = (nlapiGetFieldValue('taxamount2override') != null && nlapiGetFieldValue('taxamount2override').length > 0 )? parseFloat(nlapiGetFieldValue('taxamount2override')) : 0; 
	}
	else
	{
		TaxTotal = (nlapiGetFieldValue('taxamountoverride') != null && nlapiGetFieldValue('taxamountoverride').length > 0 )? parseFloat(nlapiGetFieldValue('taxamountoverride')) : 0; 
	}
	
	if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && AVA_ResultCode == 'Success')
	{
		nlapiSetFieldValue('subtotal', (nlapiFormatCurrency(AVA_TotalAmount) * Multiplier), true);
	    var Subtotal = parseFloat(nlapiGetFieldValue('subtotal'));
	    var discount = parseFloat(nlapiGetFieldValue('discounttotal'));
	
	    var Shippingcost =0;
	    if((nlapiGetFieldValue('shippingcost') != null) && (nlapiGetFieldValue('shippingcost').length > 0))
	    {
	    	Shippingcost = parseFloat(nlapiGetFieldValue('shippingcost'));
	    }
	    
	    var Handlingcost=0;
	    if((nlapiGetFieldValue('handlingcost') != null) && (nlapiGetFieldValue('handlingcost').length > 0))
	    {
	    	Handlingcost = parseFloat(nlapiGetFieldValue('handlingcost'));
	    }
	
	    var GiftCertCost =0;
	    if((nlapiGetFieldValue('giftcertapplied') != null) && (nlapiGetFieldValue('giftcertapplied').length > 0))
	    {
	    	GiftCertCost = parseFloat(nlapiGetFieldValue('giftcertapplied'));
	    }
	    
	    if(nlapiGetFieldValue('tax2total') != null)
	    {
	    	var NetTotal = Subtotal + discount + TaxTotal + PSTTotal + Shippingcost + Handlingcost + GiftCertCost;
	    }
	    else
	    {
	    	var NetTotal = Subtotal + discount + TaxTotal + Shippingcost + Handlingcost + GiftCertCost;
	    }
	 
	    nlapiSetFieldValue('total',nlapiFormatCurrency(NetTotal), true);
	   
	    if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
	    {
	    	document.forms['main_form'].elements['total'].value = format_currency(NetTotal);  
			setInlineTextValue(document.getElementById('total_val'),format_currency(NetTotal)); 
	    }
	}
	
	if(nlapiGetRecordType() == 'creditmemo' && nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
	{
		if(nlapiGetFieldValue('autoapply') == 'T')
		{
			AVA_UnApply();
			AVA_CreditAutoApply(TaxTotal, PSTTotal);
		}
		else
		{
			AVA_CreditManualApply(TaxTotal, PSTTotal);
		}
	}
}

function AVA_UnApply()
{
	for(var i=0; i < nlapiGetLineItemCount('apply'); i++)
	{
		if (nlapiGetLineItemValue('apply', 'apply', i+1) == 'T')
		{
			nlapiSetLineItemValue('apply', 'apply', i+1, 'F');
			nlapiSetLineItemValue('apply', 'amount', i+1, 0);
		}
	}
}

function AVA_CreditAutoApply(TaxTotal, PSTTotal)
{
	AVA_DocType = AVA_RecordType();
	var Multiplier = (AVA_DocType == 'SalesInvoice' || AVA_DocType == 'SalesOrder')? 1 : -1;
	
	var Total = nlapiGetFieldValue('total');
	var AppliedAmt = 0;
	
	if(parseFloat(Total) != 0)
	{
		for(var i=0; i < nlapiGetLineItemCount('apply'); i++)
		{

			var OrigAmt = nlapiGetLineItemValue('apply', 'due', i+1);
			var ApplyAmt = nlapiGetLineItemValue('apply', 'amount', i+1);

			if(parseFloat(Total) > parseFloat(OrigAmt))
			{
				nlapiSetLineItemValue('apply', 'amount', i+1, parseFloat(OrigAmt));
				nlapiSetLineItemValue('apply', 'apply',	 i+1, 'T');		

				AppliedAmt = parseFloat(AppliedAmt) + parseFloat(OrigAmt);
				Total = parseFloat(Total) - parseFloat(OrigAmt);
			}
			else if(parseFloat(Total) == 0)
			{
				nlapiSetFieldValue('taxamountoverride',(TaxTotal * Multiplier), true);
				document.forms['main_form'].elements['taxamountoverride'].value = format_currency(TaxTotal * Multiplier);  
				setInlineTextValue(document.getElementById('taxamountoverride_val'), format_currency(TaxTotal * Multiplier));
				
				if(nlapiGetFieldValue('tax2total') != null)
				{
					nlapiSetFieldValue('taxamount2override',(PSTTotal * Multiplier), true);
					document.forms['main_form'].elements['taxamount2override'].value = format_currency(PSTTotal * Multiplier);  
					setInlineTextValue(document.getElementById('taxamount2override_val'), format_currency(PSTTotal * Multiplier));
				}

				break;
			}
			else
			{

				nlapiSetLineItemValue('apply', 'amount', i+1, parseFloat(Total));	
				nlapiSetLineItemValue('apply', 'apply',	 i+1, 'T');

				AppliedAmt = parseFloat(AppliedAmt) + parseFloat(Total);
				Total = parseFloat(Total) - parseFloat(Total);
			}
		}	
		
		nlapiSetFieldValue('taxamountoverride', TaxTotal, true);
		document.forms['main_form'].elements['taxamountoverride'].value = format_currency(TaxTotal);  
		setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(TaxTotal)); 
		
		if(nlapiGetFieldValue('tax2total') != null)
		{
			nlapiSetFieldValue('taxamount2override', PSTTotal, true);
			document.forms['main_form'].elements['taxamount2override'].value = format_currency(PSTTotal);  
			setInlineTextValue(document.getElementById('taxamount2override_val'),format_currency(PSTTotal)); 
		}
		
		var unapplied = parseFloat(Total);
		nlapiSetFieldValue('unapplied', unapplied, true);
		document.forms['items_form'].elements['unapplied'].value = format_currency(unapplied);  
		setInlineTextValue(document.getElementById('unapplied_val'),format_currency(unapplied)); 

		nlapiSetFieldValue('applied', parseFloat(AppliedAmt), true);
		document.forms['items_form'].elements['applied'].value = format_currency(AppliedAmt);  
		setInlineTextValue(document.getElementById('applied_val'), format_currency(AppliedAmt)); 
	}
}

function AVA_CreditManualApply(TaxTotal, PSTTotal)
{
	var appliedamt = 0;
	for(var i=0; i < nlapiGetLineItemCount('apply'); i++)
	{
		if(nlapiGetLineItemValue('apply', 'apply', i+1) == 'T')
		{
			appliedamt = appliedamt + parseFloat(nlapiGetLineItemValue('apply', 'amount', i+1));
		}
	}
	
	nlapiSetFieldValue('taxamountoverride', TaxTotal, true);
	if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
	{
		document.forms['main_form'].elements['taxamountoverride'].value = format_currency(TaxTotal);  
		setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(TaxTotal)); 
	}
	
	if(nlapiGetFieldValue('tax2total') != null)
	{
		nlapiSetFieldValue('taxamount2override', PSTTotal, true);
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
		{
			document.forms['main_form'].elements['taxamount2override'].value = format_currency(PSTTotal);  
			setInlineTextValue(document.getElementById('taxamount2override_val'), format_currency(PSTTotal)); 
		}
	}

	var NetTotal = nlapiGetFieldValue('total') ;
	
	var unapplied = (parseFloat(appliedamt) == 0) ? NetTotal : parseFloat(NetTotal - appliedamt);
	nlapiSetFieldValue('unapplied', unapplied, true);
	
	if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
	{
		document.forms['items_form'].elements['unapplied'].value = format_currency(unapplied);  
		setInlineTextValue(document.getElementById('unapplied_val'),format_currency(unapplied)); 
	}
	
	nlapiSetFieldValue('applied', parseFloat(appliedamt)); 
	if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
	{
		document.forms['items_form'].elements['applied'].value = format_currency(appliedamt);  
		setInlineTextValue(document.getElementById('applied_val'), format_currency(appliedamt)); 
	}
}

function AVA_RecordType()
{
	var doctype = nlapiGetRecordType();
	doctype = doctype.toLowerCase();
	if (doctype == 'estimate' || doctype == 'salesorder')
	{
		return 'SalesOrder';
	}
	else if (doctype == 'invoice' || doctype == 'cashsale')
	{
		return 'SalesInvoice';
	}
	else if (doctype == 'returnauthorization')
	{
		return 'ReturnOrder';
	}
	else if (doctype == 'creditmemo' || doctype == 'cashrefund')
	{
		return 'ReturnInvoice';
	}
	else
	{
		nlapiLogExecution('DEBUG', 'DocType Returned', doctype);
		nlapiLogExecution('DEBUG', 'Record Id', (nlapiGetRecordId() > 0 ? nlapiGetRecordId() : '0'));
		return 0;
	}
}

function AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey)
{
	var soap = null;
	soap = '\t\t<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" soap:mustUnderstand="1">\n';  
		soap += '\t\t\t<wsse:UsernameToken>\n';
			soap += '\t\t\t\t<wsse:Username><![CDATA[' + AVA_AccountValue + ']]></wsse:Username>\n';
			soap += '\t\t\t\t<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText"><![CDATA[' + AVA_Decrypt(AVA_LicenseKey) + ']]></wsse:Password>\n';
		soap += '\t\t\t</wsse:UsernameToken>\n';
	soap += '\t\t</wsse:Security>\n';
	return soap;
}

function AVA_TaxHeader(security)
{
	var soap = null;
	soap = '\t<soap:Header>\n';
	soap += security;
		soap += '\t\t<Profile xmlns="http://avatax.avalara.com/services">\n';
	    		soap += '\t\t\t<Name><![CDATA[' + nlapiGetContext().getName() + ']]></Name>\n';
			soap += '\t\t\t<Client><![CDATA[' + AVA_ClientAtt + ']]></Client>\n';
	    		soap += '\t\t\t<Adapter/>\n';
	    		soap += '\t\t\t<Machine/>\n';
	    	soap += '\t\t</Profile>\n';
	soap += '\t</soap:Header>\n';
 	return soap;
}

function AVA_GetTaxBody(AVA_DocType)
{
	var soap = null;
	var FormTaxCode, TaxCode1=null, AVA_CheckEntity = 'F', AVA_ShipAddress = 'F';
	var LocationCode, LocationPOS = 0;

	if (nlapiGetContext().getFeature('accountingperiods') == true && (AVA_UsePostingPeriod == 'T' || AVA_UsePostingPeriod == true) && nlapiGetFieldValue('postingperiod') != null && nlapiGetFieldValue('postingperiod').length > 0)
	{
		var PostDate = nlapiGetFieldText('postingperiod');
		AVA_Date = PostDate.substring(4, PostDate.length) + '-' + AVA_GetMonthName(PostDate.substring(0, 3)) + '-01';
	}
	else
	{
		var TranDate = nlapiGetFieldValue('trandate');
		var AVA_Date = AVA_ConvertDate(TranDate);
	}	

	var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;	

	if(webstoreFlag == true)
	{
		var DocType = 'SalesOrder';
		var Multiplier = 1;
	}
	else
	{
		var DocType =  (AVA_DocType == 'SalesInvoice' || AVA_DocType == 'SalesOrder')? 'SalesOrder' : 'ReturnOrder';
		var Multiplier = (AVA_DocType == 'SalesInvoice' || AVA_DocType == 'SalesOrder')? 1 : -1;
	}
	
 	soap = '\t<soap:Body>\n';
		soap += '\t\t<GetTax xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<GetTaxRequest>\n';
 				soap += '\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
 				
 				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
 				{
 					soap += '\t\t\t\t<DocType><![CDATA[' + DocType + ']]></DocType>\n';
					soap += '\t\t\t\t<DocCode><![CDATA[' + ((Date()!=null) ? Date().substring(0, 24) : '') + ']]></DocCode>\n';
				}
				else
				{
					soap += '\t\t\t\t<DocType><![CDATA[' + ((nlapiGetRecordId() != null && nlapiGetRecordId().length > 0) ? AVA_DocType : DocType) + ']]></DocType>\n';
					soap += '\t\t\t\t<DocCode><![CDATA[' + ((nlapiGetRecordId() != null && nlapiGetRecordId().length > 0) ? nlapiGetRecordId() : ((Date() != null) ? Date().substring(0, 24) : '')) + ']]></DocCode>\n';
				}

 				soap += '\t\t\t\t<DocDate>' + AVA_Date + '</DocDate>\n';
 				
				switch(AVA_CustomerCode)
				{
					case '0':
						var CustCode = nlapiGetFieldValue('custbody_ava_customerentityid');
						soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode != null && CustCode.length > 0) ? CustCode.substring(0,49) : '') + ']]></CustomerCode>\n';
						break;

					case '1':
						var CustCode = (nlapiGetFieldValue('custbody_ava_customerisperson') == 'T') ? (nlapiGetFieldValue('custbody_ava_customerfirstname') + ((nlapiGetFieldValue('custbody_ava_customermiddlename') != null && nlapiGetFieldValue('custbody_ava_customermiddlename').length > 0) ? ( ' ' + nlapiGetFieldValue('custbody_ava_customermiddlename')) : ' ') + ((nlapiGetFieldValue('custbody_ava_customerlastname') != null && nlapiGetFieldValue('custbody_ava_customerlastname').length > 0) ? ( ' ' + nlapiGetFieldValue('custbody_ava_customerlastname')) : '')) : (nlapiGetFieldValue('custbody_ava_customercompanyname'));
						soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode != null && CustCode.length > 0) ? CustCode.substring(0,49) : '') + ']]></CustomerCode>\n';
						break;
						
					case '2':
						soap += '\t\t\t\t<CustomerCode><![CDATA[' + nlapiGetFieldValue('entity') + ']]></CustomerCode>\n';
						break;
						
					case '3':
						if (nlapiGetContext().getFeature('multipartner') != true && nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
						{
							if(nlapiGetFieldValue('custpage_ava_context') == 'webstore')
							{
								var CustRec = JSON.parse(nlapiGetFieldValue('custpage_ava_partnerid'));
								var CustCode = CustRec[0].columns['entityid'];
							}
							else
							{
								var CustCode = nlapiGetFieldValue('custbody_ava_partnerentityid');
							}
						}
						else
						{
							var CustCode = nlapiGetFieldValue('custbody_ava_customerentityid');
						}
						soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode != null && CustCode.length > 0) ? CustCode.substring(0,49) : '') + ']]></CustomerCode>\n';
						break;
						
					case '4':
						if (nlapiGetContext().getFeature('multipartner') != true && nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
						{
							if(nlapiGetFieldValue('custpage_ava_context') == 'webstore')
							{
								var CustRec = JSON.parse(nlapiGetFieldValue('custpage_ava_partnerid'));
								var CustCode = (CustRec[0].columns['isperson'] == false) ? (CustRec[0].columns['companyname']) : (CustRec[0].columns['firstname'] + ((CustRec[0].columns['middlename'] != null && CustRec[0].columns['middlename'].length > 0) ? ( ' ' + CustRec[0].columns['middlename']) : ' ') + ((CustRec[0].columns['lastname'] != null && CustRec[0].columns['lastname'].length > 0) ? ( ' ' + CustRec[0].columns['lastname']) : ''));
							}
							else
							{
								var CustCode = (nlapiGetFieldValue('custbody_ava_partnerisperson') == 'T') ? (nlapiGetFieldValue('custbody_ava_partnerfirstname') + ((nlapiGetFieldValue('custbody_ava_partnermiddlename') != null && nlapiGetFieldValue('custbody_ava_partnermiddlename').length > 0) ? ( ' ' + nlapiGetFieldValue('custbody_ava_partnermiddlename')) : ' ') + ((nlapiGetFieldValue('custbody_ava_partnerlastname') != null && nlapiGetFieldValue('custbody_ava_partnerlastname').length > 0) ? ( ' ' + nlapiGetFieldValue('custbody_ava_partnerlastname')) : '')) : (nlapiGetFieldValue('custbody_ava_partnercompanyname'));
							}
						}
						else
						{
							var CustCode = (nlapiGetFieldValue('custbody_ava_customerisperson') == 'T') ? (nlapiGetFieldValue('custbody_ava_customerfirstname') + ((nlapiGetFieldValue('custbody_ava_customermiddlename') != null && nlapiGetFieldValue('custbody_ava_customermiddlename').length > 0) ? ( ' ' + nlapiGetFieldValue('custbody_ava_customermiddlename')) : ' ') + ((nlapiGetFieldValue('custbody_ava_customerlastname') != null && nlapiGetFieldValue('custbody_ava_customerlastname').length > 0) ? ( ' ' + nlapiGetFieldValue('custbody_ava_customerlastname')) : '')) : (nlapiGetFieldValue('custbody_ava_customercompanyname'));
						}
						soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode != null && CustCode.length > 0) ? CustCode.substring(0,49) : '') + ']]></CustomerCode>\n';
						break;
						
					case '5':
						if (nlapiGetContext().getFeature('multipartner') != true && nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
						{
							var CustCode = nlapiGetFieldValue('partner');
						}
						else
						{
							var CustCode = nlapiGetFieldValue('entity');
						}
						soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode != null && CustCode.length > 0) ? CustCode.substring(0,49) : '') + ']]></CustomerCode>\n';
						break;
						
					case '6':
						var CustCode = AVA_LoadCustomerId('customer', nlapiGetFieldValue('entity'));
						if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
						{
							soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode[5] != null && CustCode[5].length > 0) ? CustCode[5].substring(0,49) : '') + ']]></CustomerCode>\n';
						}
						else
						{
							soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode != null && CustCode.length > 0) ? CustCode.substring(0,49) : '') + ']]></CustomerCode>\n';
						}
						break;
						
					case '7':
						if (nlapiGetContext().getFeature('multipartner') != true && nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
						{
							var RecordType = 'partner';
							var Id = nlapiGetFieldValue('partner');	
						}
						else
						{
							var RecordType = 'customer';
							var Id = nlapiGetFieldValue('entity');
						}
						
						var CustCode = AVA_LoadCustomerId(RecordType, Id);
						if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
						{
							soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode[5] != null && CustCode[5].length > 0) ? CustCode[5].substring(0,49) : '') + ']]></CustomerCode>\n';
						}
						else
						{
							soap += '\t\t\t\t<CustomerCode><![CDATA[' + ((CustCode != null && CustCode.length > 0) ? CustCode.substring(0,49) : '') + ']]></CustomerCode>\n';
						}
						break;	
						
					default :
						break;
				}

				if (webstoreFlag == false && nlapiGetFieldValue('salesrep') != null && nlapiGetFieldValue('salesrep').length > 0)
				{
					soap += '\t\t\t\t<SalespersonCode><![CDATA[' + nlapiGetFieldText('salesrep').substring(0,24) + ']]></SalespersonCode>\n';
				}
				else
				{
					soap += '\t\t\t\t<SalespersonCode/>\n';
				}
				soap += '\t\t\t\t<CustomerUsageType/>\n';
				
				var amount = nlapiGetFieldValue('discounttotal');
				
				if(AVA_DocType == 'SalesInvoice' || AVA_DocType == 'SalesOrder')
				{
					amount = amount * -1;
				}
				
				if((AVA_EnableDiscount == 'T' || AVA_EnableDiscount == true) && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0)
				{
					soap += '\t\t\t\t<Discount>0</Discount>\n';
				}
				else
				{
					soap += '\t\t\t\t<Discount>' + amount + '</Discount>\n';
				}
				
				soap += '\t\t\t\t<PurchaseOrderNo><![CDATA[' + ((nlapiGetFieldValue('otherrefnum') != null && nlapiGetFieldValue('otherrefnum').length > 0) ? nlapiGetFieldValue('otherrefnum').substring(0,50) : '') + ']]></PurchaseOrderNo>\n';
				
				if(nlapiGetFieldValue('istaxable') != null && nlapiGetField('taxitem') != null && (nlapiGetFieldValue('istaxable').length == 0 || nlapiGetFieldValue('istaxable') == 'F' || nlapiGetFieldValue('istaxable') == 'No'))
				{
					var ExemptId = AVA_GetExemptionNumber();
					
					if(ExemptId != null && ExemptId.length > 0)
					{ 
						soap += '\t\t\t\t<ExemptionNo><![CDATA[' + ExemptId.substring(0,25) + ']]></ExemptionNo>\n';
					}
					else
					{
						soap += '\t\t\t\t<ExemptionNo>Exempt</ExemptionNo>\n';
					} 
				}
				else
				{ 
					soap += '\t\t\t\t<ExemptionNo/>\n';
				}

				if(nlapiGetFieldValue('taxitem') != null)
				{
					TaxCode1 = nlapiGetFieldValue('custpage_ava_formtaxcode');
				}
				else
				{
					for(var i=0; AVA_TaxcodeArray != null && i < AVA_TaxcodeArray.length; i++)
					{
						TaxCode1 = AVA_TaxcodeArray[i];
						if(TaxCode1 != null && TaxCode1.length > 0)
						{
							break;
						}
					}
				}     

				if((AVA_DisableLocationCode == 'F' || AVA_DisableLocationCode == false))
				{
					if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F')
					{
						if(AVA_HeaderLocation.length == 0)
						{
							soap += '\t\t\t\t<OriginCode><![CDATA[' + ((AVA_Def_Addressee!=null)?AVA_Def_Addressee.substring(0,50) : '') + ']]></OriginCode>\n';
							if(TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) == 'POS')
							{
								soap += '\t\t\t\t<DestinationCode><![CDATA[' + ((AVA_Def_Addressee!=null) ? AVA_Def_Addressee.substring(0,50) : '') + ']]></DestinationCode>\n';
							}
							soap += '\t\t\t\t<LocationCode><![CDATA[' + ((AVA_Def_Addressee!=null)?AVA_Def_Addressee.substring(0,50) : '') + ']]></LocationCode>\n';
						}
						else
						{
							soap += '\t\t\t\t<OriginCode><![CDATA[' + ((AVA_HeaderLocation[0]!=null) ? AVA_HeaderLocation[0].substring(0,50) : '') + ']]></OriginCode>\n';
							if(TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) == 'POS' || AVA_LocationPOS == 1)
							{
								soap += '\t\t\t\t<DestinationCode><![CDATA[' + ((AVA_HeaderLocation[0]!=null) ? AVA_HeaderLocation[0].substring(0,50) : '') + ']]></DestinationCode>\n';
							}
							soap += '\t\t\t\t<LocationCode><![CDATA[' + ((AVA_HeaderLocation[0]!=null) ? AVA_HeaderLocation[0].substring(0,50) : '') + ']]></LocationCode>\n';
						}
					}
					else
					{
						var AVA_LineLocation = 'F';
						var Locat;
						
						for(var i=0; AVA_LocationArray != null && i < AVA_LocationArray.length ; i++)
						{
							if(AVA_LocationArray[i][1] != null && AVA_LocationArray[i][1].length > 0 && AVA_LocationArray[i][1][0] != null)
							{
								if(AVA_LocationArray[i][1][0].length > 0)
								{
									soap += '\t\t\t\t<OriginCode><![CDATA[' + AVA_LocationArray[i][1][0].substring(0,50) + ']]></OriginCode>\n';
						
									var TabType = (AVA_NS_Lines[i][0] == 'item') ? 'item' : ((AVA_NS_Lines[i][0] == 'itemcost') ? 'itemcost' : 'expcost');
									if(TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) == 'POS' || (TabType == 'item' && nlapiGetLineItemValue(TabType, 'custcol_ava_pickup', i+1) == 'T') || (TabType != 'item' && AVA_LocationArray[i][1][8] == true))
									{
										LocationPOS = 1;
										soap += '\t\t\t\t<DestinationCode><![CDATA[' + AVA_LocationArray[i][1][0].substring(0,50) + ']]></DestinationCode>\n';
									}
									
									if (LocationCode == null)
									{
										soap += '\t\t\t\t<LocationCode><![CDATA[' + AVA_LocationArray[i][1][0].substring(0,50) + ']]></LocationCode>\n';
									}
									else
									{
										soap += '\t\t\t\t<LocationCode><![CDATA[' + ((AVA_Def_Addressee!=null)? AVA_Def_Addressee.substring(0,50) : '') + ']]></LocationCode>\n';				
									}
									AVA_LineLocation = 'T';
									break;
								}
							}
							else
							{
								if (LocationCode == null || (LocationCode != null && LocationCode.length <= 0))
								{
									LocationCode = AVA_Def_Addressee;
								}
							}
						}
						
						if(AVA_LineLocation == 'F')
						{
							soap += '\t\t\t\t<OriginCode><![CDATA[' + ((AVA_Def_Addressee != null) ? AVA_Def_Addressee.substring(0,50) : '') + ']]></OriginCode>\n';
					
							if(TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) == 'POS')
							{
								soap += '\t\t\t\t<DestinationCode><![CDATA[' + ((AVA_Def_Addressee != null) ? AVA_Def_Addressee.substring(0,50) : '') + ']]></DestinationCode>\n';
							}
							soap += '\t\t\t\t<LocationCode><![CDATA[' + ((AVA_Def_Addressee != null) ? AVA_Def_Addressee.substring(0,50) : '') + ']]></LocationCode>\n';
						}
					}
				}
				else
				{
					soap += '\t\t\t\t<OriginCode><![CDATA[' + ((AVA_Def_Addressee!=null)?AVA_Def_Addressee.substring(0,50) : '') + ']]></OriginCode>\n';
					if(TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) == 'POS')
					{
						soap += '\t\t\t\t<DestinationCode><![CDATA[' + ((AVA_Def_Addressee!=null) ? AVA_Def_Addressee.substring(0,50) : '') + ']]></DestinationCode>\n';
					}
					soap += '\t\t\t\t<LocationCode><![CDATA[' + ((AVA_Def_Addressee!=null)?AVA_Def_Addressee.substring(0,50) : '') + ']]></LocationCode>\n';
				}			

				if(TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) != 'POS' && AVA_LocationPOS == 0 && LocationPOS == 0)
				{
					var DestCode = AVA_GetDestinationCode();
					var DefaultTaxCode =((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode); 
					if(TaxCode1 == '-Not Taxable-' && DefaultTaxCode.substr((DefaultTaxCode.length - 3), 3) == 'POS')
					{
						DestCode = (AVA_LocationArray[0][1] != null && AVA_LocationArray[0][1].length > 0 && AVA_LocationArray[0][1][0] != null) ? AVA_LocationArray[i][1][0] : AVA_Def_Addressee;
					}
					else
					{
						DestCode = (DestCode != null) ? DestCode : AVA_Def_Addressee;
					}
					soap += '\t\t\t\t<DestinationCode><![CDATA[' + ((DestCode != null && DestCode.length > 0) ? DestCode.substring(0,50) : '') + ']]></DestinationCode>\n';
				}

				var AddressLines = AVA_AddressLines();
				soap += AddressLines;

				var TaxLines = AVA_GetTaxLines(AVA_DocType, Multiplier); 
				soap += TaxLines;

				if(nlapiGetFieldValue('tax2total') != null)
				{
					soap += '\t\t\t\t<DetailLevel><![CDATA[Tax]]></DetailLevel>\n';
				}
				else if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 3)
				{
					soap += '\t\t\t\t<DetailLevel><![CDATA[Line]]></DetailLevel>\n';
				}
				else
				{
					soap += '\t\t\t\t<DetailLevel><![CDATA[Document]]></DetailLevel>\n';
				} 

				if(AVA_DocType == 'ReturnInvoice' || AVA_DocType == 'ReturnOrder')
				{
					if (nlapiGetFieldValue('createdfrom') != null && nlapiGetFieldValue('createdfrom').length > 0)
					{
						soap += '\t\t\t\t<ReferenceCode><![CDATA[' + nlapiGetFieldValue('createdfrom').substring(0,50) + ']]></ReferenceCode>\n';
					}
					else
					{
						soap += '\t\t\t\t<ReferenceCode/>\n';
					}
				}
				
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 || nlapiGetFieldValue('custpage_ava_taxcodestatus') == 3)
				{
					soap += '\t\t\t\t<Commit>0</Commit>\n';
				}
				else
				{
					soap += '\t\t\t\t<Commit>1</Commit>\n';					
				}
				
				if(nlapiGetFieldValue('currencysymbol') != null && nlapiGetFieldValue('currencysymbol').length > 0)
				{
					soap += '\t\t\t\t<CurrencyCode>' + nlapiGetFieldValue('currencysymbol') + '</CurrencyCode>\n';
					soap += '\t\t\t\t<ExchangeRate>' + nlapiGetFieldValue('exchangerate') + '</ExchangeRate>\n';
					soap += '\t\t\t\t<ExchangeRateEffDate>' + AVA_ConvertDate(nlapiGetFieldValue('trandate')) + '</ExchangeRateEffDate>\n';
				}
				else
				{
					soap += '\t\t\t\t<CurrencyCode/>\n'
				}
				
				if((AVA_DocType == 'ReturnInvoice' || AVA_DocType == 'ReturnOrder') && nlapiGetFieldValue('createdfrom') != null && nlapiGetFieldValue('createdfrom').length > 0)
				{
					soap += '\t\t\t\t<TaxOverride>\n';
						soap += '\t\t\t\t\t<TaxOverrideType>TaxDate</TaxOverrideType>\n';						
						soap += '\t\t\t\t\t<TaxDate>' + AVA_ConvertDate(nlapiGetFieldValue('custpage_ava_createfromdate')) + '</TaxDate>\n';
						soap += '\t\t\t\t\t<Reason>Tax Override</Reason>\n';
					soap += '\t\t\t\t</TaxOverride>\n';
				}
				
				if(nlapiGetFieldValue('custbody_ava_vatbusinessid') != null && nlapiGetFieldValue('custbody_ava_vatbusinessid').length > 0)
				{
					soap += '\t\t\t\t<BusinessIdentificationNo>' + nlapiGetFieldValue('custbody_ava_vatbusinessid').substring(0, 24) + '</BusinessIdentificationNo>\n';
				}
			soap += '\t\t\t</GetTaxRequest>\n'; 
		soap += '\t\t</GetTax>\n';
	soap += '\t</soap:Body>\n';

	return soap;  
}

function AVA_GetExemptionNumber()
{
	try
	{
		var ExemptId = null;		
		var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;	
		
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
		{
			var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=customrecord_avacustomerexemptmapping&id=' + nlapiGetFieldValue('entity'), null, null );
			ExemptId = response.getBody();
		}
		else
		{
			var filters1 = new Array();
			filters1[0] = new nlobjSearchFilter('custrecord_ava_exemptcustomerid', null, 'anyof', nlapiGetFieldValue('entity'));
			
			var cols1 = new Array();
			cols1[0] = new nlobjSearchColumn('custrecord_ava_exemptno');
			
			var searchresult = nlapiSearchRecord('customrecord_avacustomerexemptmapping', null, filters1, cols1); 
			for(var i=0 ; searchresult != null && i < searchresult.length; i++)
			{
				ExemptId = searchresult[i].getValue('custrecord_ava_exemptno');
			}
		}
	}
	catch(err)
	{
	}
	
	return ExemptId;
}


function AVA_GetDestinationCode()
{
	var DestCode, Addresslist, AVA_Flag='F', ShipAddress = 'F';
	if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
	{
		DestCode = 'Ship-To Address';
		AVA_Flag = 'T';
		ShipAddress = 'T';
	}
	else 
	{
		if(nlapiGetFieldValue('shipaddress') != null && nlapiGetFieldValue('shipaddress').length != 0)
		{
			DestCode = 'Custom Ship-To Address';
			ShipAddress = 'T';
		}
		else
		{
			if(nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_latitude').length > 0 && nlapiGetFieldValue('custbody_ava_shipto_longitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude').length > 0)
			{
				DestCode = 'Header Ship-To Lat/Long';
				ShipAddress = 'T';
			}
		}
	} 

	if(ShipAddress == 'F')
	{ 
		if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
		{
			DestCode = 'Bill-To Address';
			AVA_Flag = 'T';
		}
		else
		{
			if(nlapiGetFieldValue('billaddress') != null && nlapiGetFieldValue('billaddress').length != 0)
			{
				DestCode = 'Custom Bill-To Address';
			}
			else
			{
				if(nlapiGetFieldValue('custbody_ava_billto_latitude') != null && nlapiGetFieldValue('custbody_ava_billto_latitude').length > 0 && nlapiGetFieldValue('custbody_ava_billto_longitude') != null && nlapiGetFieldValue('custbody_ava_billto_longitude').length > 0)
				{
					DestCode = 'Header Bill-To Lat/Long';
					ShipAddress = 'T';
				}
			}
		}
	}
	return DestCode;
}

function AVA_AddressLines()
{
	/* First Check for Origin Address */
	var soap;
	var ShipAddFlag = 'F', AVA_Shipping = 'F', AVA_Handling = 'F', ShipCode, HandlingCode;
	var Locations = new Array();
	var TaxCode1 = nlapiGetFieldValue('custpage_ava_formtaxcode');
	TaxCode1 = (TaxCode1 == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : TaxCode1;
	
	soap = '\t\t\t\t<Addresses>\n';
	
	if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F')
	{
		if((TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) != 'POD') || (TaxCode1 == null))
		{
			// Location at Header Level
			if(AVA_DisableLocationCode == 'F' || AVA_DisableLocationCode == false)
			{
				if(nlapiGetFieldValue('location') != null && nlapiGetFieldValue('location').length == 0)
				{
					Locations[0] = AVA_Def_Addressee;
				}
				else
				{
					Locations[0] = (AVA_HeaderLocation != null && AVA_HeaderLocation.length > 0) ? AVA_HeaderLocation : AVA_Def_Addressee;
				}
			}
			else
			{
				Locations[0] = AVA_Def_Addressee;
			}
		}
		
	}
	else
	{
		if((TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) != 'POD') || (TaxCode1 == null))
		{
			var LocationName , AVA_Flag, i=0, MainTaxcode = null;
			
			if (nlapiGetFieldValue('taxitem') != null) 
			{
				MainTaxcode = nlapiGetFieldValue('custpage_ava_formtaxcode');
				MainTaxcode = (MainTaxcode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : MainTaxcode;			
			}	

			for( ; AVA_TaxLines != null && i < AVA_TaxLines.length ; i++)
			{
				if(AVA_TaxLines[i] == 'T')
				{					
					if (nlapiGetFieldValue('taxitem') == null) 
					{	
						MainTaxcode = (AVA_TaxcodeArray[i] == null || AVA_TaxcodeArray[i] == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : AVA_TaxcodeArray[i];				
					}
					
					if(MainTaxcode != null && MainTaxcode.substr((MainTaxcode.length - 3), 3) != 'POD') 
					{
						if(AVA_DisableLocationCode == 'F' || AVA_DisableLocationCode == false)
						{
							LocationName = (AVA_LocationArray[i] != null && AVA_LocationArray[i][0] != null && AVA_LocationArray[i][0].length > 0 && AVA_LocationArray[i][1] != null && AVA_LocationArray[i][1][0] != null && AVA_LocationArray[i][1][0].length > 0) ? AVA_LocationArray[i][1][0] : null;
							
							if(Locations.length == 0)
							{
								Locations[0] = (LocationName != null && LocationName.length > 0)? AVA_LocationArray[i][1] : AVA_Def_Addressee;	
							}
							else
							{
								for(var k=0; k < Locations.length ; k++)
								{
									if(LocationName != null)
									{
										if(Locations[k][0] == LocationName)
										{
											AVA_Flag = 'T'
											break;
										}
										else
										{
											AVA_Flag = 'F';
										}
									}       
									else
									{
										if(Locations[k] == AVA_Def_Addressee)
										{
											AVA_Flag = 'T';
											break;
										}
										else
										{
											AVA_Flag = 'F';
										}           
									} 
								}
							
								if(AVA_Flag == 'F')
								{
									Locations[Locations.length] = (LocationName != null && LocationName.length > 0)? AVA_LocationArray[i][1] : AVA_Def_Addressee;
								}
							}
						}
						else
						{	
							Locations[0] = AVA_Def_Addressee;
						}
					}
				}
			}
			
			
			// For ShipGroup in case of MSR
			if(AVA_DisableLocationCode == 'F' || AVA_DisableLocationCode == false)
			{
				if(nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto') == 'T')
				{			
					var shipLineTaxcode = null;

					for(var ship = 0 ; AVA_ShipGroupTaxcodes != null && ship < AVA_ShipGroupTaxcodes.length ; ship++)
					{				
						shipLineTaxcode = (AVA_ShipGroupTaxcodes[ship][2] == null || AVA_ShipGroupTaxcodes[ship][2] == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : AVA_ShipGroupTaxcodes[ship][2];				
							
						if(nlapiGetFieldValue('taxitem') == null && shipLineTaxcode != null && shipLineTaxcode.substr((shipLineTaxcode.length - 3), 3) != 'POD')
						{		
							LocationName = (AVA_LocationArray[i][0] != null && AVA_LocationArray[i][0].length > 0 && AVA_LocationArray[i][1] != null && AVA_LocationArray[i][1][0] != null && AVA_LocationArray[i][1][0].length > 0) ? AVA_LocationArray[i][1][0] : null;
							
							if(Locations.length == 0)
							{
								Locations[0] = (LocationName != null && LocationName.length > 0)? AVA_LocationArray[i][1] : AVA_Def_Addressee;
							}
							else
							{
								for(var k=0; k < Locations.length ; k++)
								{
									if(LocationName != null)
									{
										if(Locations[k][0] == LocationName)
										{
											AVA_Flag = 'T'
											break;
										}
										else
										{
											AVA_Flag = 'F';
										}
									}       
									else
									{
										if(Locations[k] == AVA_Def_Addressee)
										{
											AVA_Flag = 'T';
											break;
										}
										else
										{
											AVA_Flag = 'F';
										}           
									} 
								}
							
								if(AVA_Flag == 'F')
								{
									Locations[Locations.length] = (LocationName != null && LocationName.length > 0)? AVA_LocationArray[i][1] : AVA_Def_Addressee;
								}
							}					
						}	
						i++;		
					}				
				}
			}
			else
			{
				var shipLineTaxcode = null;
				for(var ship = 0 ; AVA_ShipGroupTaxcodes != null && ship < AVA_ShipGroupTaxcodes.length ; ship++)
				{				
					shipLineTaxcode = (AVA_ShipGroupTaxcodes[ship][2] == null || AVA_ShipGroupTaxcodes[ship][2] == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : AVA_ShipGroupTaxcodes[ship][2];				
						
					if(nlapiGetFieldValue('taxitem') == null && shipLineTaxcode != null && shipLineTaxcode.substr((shipLineTaxcode.length - 3), 3) != 'POD')
					{
						Locations[0] = AVA_Def_Addressee;
					}
				}
			}
		}
	}
	
	var ConfigAddFlag = 'F';
	if(nlapiGetFieldValue('taxitem') != null)
	{
		if((nlapiGetFieldValue('custpage_ava_lineloc') != 'T' && (AVA_HeaderLocation == null || AVA_HeaderLocation.length == 0)) && (TaxCode1.substr((TaxCode1.length - 3), 3) != 'POD'))
		{
			ConfigAddFlag = 'T';
		}
		if((nlapiGetFieldValue('custpage_ava_lineloc') == 'T') && (TaxCode1.substr((TaxCode1.length - 3), 3) != 'POD') && ((nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0) || (nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0)))
		{
			ConfigAddFlag = 'T';
		}
	}
	else
	{
		var DefTaxCode = nlapiGetFieldValue('custpage_ava_deftax');

		for(var i=0; AVA_TaxLines != null && i < AVA_TaxLines.length ; i++)
		{
			if(AVA_TaxLines[i] == 'T')
			{
				var TaxCode = (AVA_TaxcodeArray[i] == null || AVA_TaxcodeArray[i] == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : AVA_TaxcodeArray[i];				
				if(TaxCode != null && TaxCode.substr((TaxCode.length - 3), 3) != 'POS' && AVA_LocationPOS == 0)
				{	
					ShipAddFlag = 'T';
				}
			}
		}
		
		if(nlapiGetFieldValue('custpage_ava_shiptaxcode') != null)
		{
			ShipCode = nlapiGetFieldValue('custpage_ava_shiptaxcode');
			ShipCode = (ShipCode == null || ShipCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : ShipCode;				
			if(ShipCode != null && ShipCode.length > 0 && ShipCode.substr((ShipCode.length - 3), 3) != 'POS' && (nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0) && AVA_LocationPOS == 0)
			{
				AVA_Shipping = 'T';   
			}
		}

		if(nlapiGetFieldValue('custpage_ava_handlingtaxcode') != null)
		{
			HandlingCode = nlapiGetFieldValue('custpage_ava_handlingtaxcode');
			HandlingCode = (HandlingCode == null || HandlingCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : HandlingCode;				
			if(HandlingCode != null && HandlingCode.length > 0 && HandlingCode.substr((HandlingCode.length - 3), 3) != 'POS' && (nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0) && AVA_LocationPOS == 0)
			{
				AVA_Handling = 'T';   
			}
		}
	
		if((nlapiGetFieldValue('custpage_ava_lineloc') != 'T' && (AVA_HeaderLocation == null || AVA_HeaderLocation.length == 0)) && ((ShipCode != null && ShipCode.length > 0 && ShipCode.substr((ShipCode.length - 3), 3) != 'POD' && (nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0)) || (HandlingCode != null && HandlingCode.length > 0 && HandlingCode.substr((HandlingCode.length - 3), 3) != 'POD' && (nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0))))
		{
			ConfigAddFlag = 'T';
		}
		else if(nlapiGetFieldValue('custpage_ava_lineloc') != 'F') 
		{	
			if(nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F')))
			{				
				if((ShipCode != null && ShipCode.length > 0 && ShipCode.substr((ShipCode.length - 3), 3) != 'POD' && (nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0)) || (HandlingCode != null && HandlingCode.length > 0 && HandlingCode.substr((HandlingCode.length - 3), 3) != 'POD' && (nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0)))
				{				
					ConfigAddFlag = 'T';
				}
			}
//			else if(nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto') == 'T')
//			{
				// Check Shipgroup taxcodes, this don't need to be taken care here as we are already checking for tht above. 
				// that when Location is null or not existing for line then pick config address		
				
//			}		
		}
	}   
	
	if(ConfigAddFlag == 'T')
	{
		var AddrsIncludeFlag = 'T';
		
		for(var i=0; Locations != null && i < Locations.length; i++)
		{
			if(Locations[i] == AVA_Def_Addressee)
			{
				AddrsIncludeFlag = 'F';
				break;
			}
		}
		
		if(AddrsIncludeFlag == 'T')
		{
			Locations[Locations.length] = AVA_Def_Addressee;
		}
	}

	for(var i=0; Locations != null && i < Locations.length; i++)
	{
		soap += '\t\t\t\t\t<BaseAddress>\n';
		if(Locations[i] == AVA_Def_Addressee)
		{
			soap += '\t\t\t\t\t\t<AddressCode><![CDATA[' + AVA_Def_Addressee.substring(0,50) + ']]></AddressCode>\n';
			soap += '\t\t\t\t\t\t<Line1><![CDATA[' + ((AVA_Def_Addr1 != null) ? AVA_Def_Addr1 : '') + ']]></Line1>\n';
			soap += '\t\t\t\t\t\t<Line2><![CDATA[' + ((AVA_Def_Addr2 != null) ? AVA_Def_Addr2 : '') + ']]></Line2>\n';
			soap += '\t\t\t\t\t\t<Line3/>\n'; 
			soap += '\t\t\t\t\t\t<City><![CDATA[' + ((AVA_Def_City != null) ? AVA_Def_City : '') + ']]></City>\n';
			soap += '\t\t\t\t\t\t<Region><![CDATA[' + ((AVA_Def_State != null) ? AVA_Def_State : '') + ']]></Region>\n';
			soap += '\t\t\t\t\t\t<PostalCode><![CDATA[' + ((AVA_Def_Zip != null) ? AVA_Def_Zip : '') + ']]></PostalCode>\n';
			soap += '\t\t\t\t\t\t<Country><![CDATA[' + ((AVA_Def_Country != null) ? AVA_Def_Country : '') + ']]></Country>\n';
		}
		else
		{
			var AVA_ShipFromAddress = Locations[i];
			soap += '\t\t\t\t\t\t<AddressCode><![CDATA[' + AVA_ShipFromAddress[0] + ']]></AddressCode>\n';
			soap += '\t\t\t\t\t\t<Line1><![CDATA[' + ((AVA_ShipFromAddress[1] != null) ? AVA_ShipFromAddress[1] : '') + ']]></Line1>\n';
			soap += '\t\t\t\t\t\t<Line2><![CDATA[' + ((AVA_ShipFromAddress[2] != null) ? AVA_ShipFromAddress[2] : '') + ']]></Line2>\n';
			soap += '\t\t\t\t\t\t<Line3/>\n'; 
			soap += '\t\t\t\t\t\t<City><![CDATA[' + ((AVA_ShipFromAddress[4] != null) ? AVA_ShipFromAddress[4] : '') + ']]></City>\n';
			soap += '\t\t\t\t\t\t<Region><![CDATA[' + ((AVA_ShipFromAddress[5] != null) ? AVA_ShipFromAddress[5] : '')+ ']]></Region>\n';
			soap += '\t\t\t\t\t\t<PostalCode><![CDATA[' + ((AVA_ShipFromAddress[6] != null) ? AVA_ShipFromAddress[6] : '') + ']]></PostalCode>\n';
			soap += '\t\t\t\t\t\t<Country><![CDATA[' + ((AVA_ShipFromAddress[7] != null) ? AVA_ShipFromAddress[7] : '') + ']]></Country>\n';
		}
		soap += '\t\t\t\t\t</BaseAddress>\n';
	}

	if(nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto').length > 0 && nlapiGetFieldValue('ismultishipto') != 'F' && nlapiGetFieldValue('ismultishipto') != 'No')
	{
		for(var k=0; AVA_MultiShipAddArray != null && k < AVA_MultiShipAddArray.length; k++)
		{
			var PickUpCheck = 'F';
			if(nlapiGetFieldValue('custpage_ava_lineloc') == 'T' && nlapiGetLineItemValue(AVA_NS_Lines[k][0], 'location', AVA_NS_Lines[k][1]) != null && nlapiGetLineItemValue(AVA_NS_Lines[k][0], 'location', AVA_NS_Lines[k][1]).length > 0)
			{
				var PickUpCheck = nlapiGetLineItemValue(AVA_NS_Lines[k][0], 'custcol_ava_pickup', AVA_NS_Lines[k][1]);
			}
			
			if(PickUpCheck != 'T')
			{
				var AVA_ShipToAddress = AVA_MultiShipAddArray[k][1];
				if (AVA_ShipToAddress != null && AVA_ShipToAddress.length > 0 && AVA_ShipToAddress.length == 3) //IN case of Lat/Long
				{
					soap += '\t\t\t\t\t<BaseAddress>\n';
					soap += '\t\t\t\t\t\t<AddressCode><![CDATA[' + AVA_ShipToAddress[0] + ']]></AddressCode>\n';
					soap += '\t\t\t\t\t\t<TaxRegionId><![CDATA[0]]></TaxRegionId>\n';
					soap += '\t\t\t\t\t\t<Latitude><![CDATA[' + AVA_ShipToAddress[1] + ']]></Latitude>\n';
					soap += '\t\t\t\t\t\t<Longitude><![CDATA[' + AVA_ShipToAddress[2] + ']]></Longitude>\n';
					soap += '\t\t\t\t\t</BaseAddress>\n'; 
				}
				else
				{
					soap += '\t\t\t\t\t<BaseAddress>\n';
				    soap += '\t\t\t\t\t\t<AddressCode><![CDATA[' + AVA_ShipToAddress[0] + ']]></AddressCode>\n';
					soap += '\t\t\t\t\t\t<Line1><![CDATA[' + ((AVA_ShipToAddress[1] != null) ? AVA_ShipToAddress[1] : '') + ']]></Line1>\n';
					soap += '\t\t\t\t\t\t<Line2><![CDATA[' + ((AVA_ShipToAddress[2] != null) ? AVA_ShipToAddress[2] : '') + ']]></Line2>\n';
					soap += '\t\t\t\t\t\t<Line3/>\n'; 
					soap += '\t\t\t\t\t\t<City><![CDATA[' + ((AVA_ShipToAddress[4] != null) ? AVA_ShipToAddress[4] : '') + ']]></City>\n';
					soap += '\t\t\t\t\t\t<Region><![CDATA[' + ((AVA_ShipToAddress[5] != null) ? AVA_ShipToAddress[5] : '') + ']]></Region>\n';
					soap += '\t\t\t\t\t\t<PostalCode><![CDATA[' + ((AVA_ShipToAddress[6] != null) ? AVA_ShipToAddress[6] : '') + ']]></PostalCode>\n';
					soap += '\t\t\t\t\t\t<Country><![CDATA[' + ((AVA_ShipToAddress[7] != null) ? AVA_ShipToAddress[7] : '') + ']]></Country>\n';
					if(AVA_EvaluateAddressInfo(AVA_ShipToAddress) != 0)
					{
						soap += '\t\t\t\t\t\t<TaxRegionId><![CDATA[0]]></TaxRegionId>\n';
						soap += '\t\t\t\t\t\t<Latitude><![CDATA[' + AVA_ShipToAddress[8] + ']]></Latitude>\n';
						soap += '\t\t\t\t\t\t<Longitude><![CDATA[' + AVA_ShipToAddress[9] + ']]></Longitude>\n';
					}
					soap += '\t\t\t\t\t</BaseAddress>\n';
				}
			}
		}		
	}

	if((TaxCode1 != null && TaxCode1.substr((TaxCode1.length - 3), 3) != 'POS' && AVA_LocationPOS != 1) || ShipAddFlag != 'F' || AVA_Shipping != 'F' || AVA_Handling != 'F')
	{
		var AVA_IncludeShip = 'T';
		
		if(nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto').length > 0 && nlapiGetFieldValue('ismultishipto') != 'F' && BillItemFlag != 'T' && BillExpFlag != 'T' && BillTimeFlag != 'T')
		{
			AVA_IncludeShip = 'F';
		}

		if(AVA_IncludeShip == 'T')
		{		
			//Destination Address
			var AVA_ShipToAddress = AVA_GetDestinationAddress();
			if(AVA_ShipToAddress == 0)
			{
				soap += '\t\t\t\t\t<BaseAddress>\n';
				soap += '\t\t\t\t\t\t<AddressCode><![CDATA[' + ((nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_latitude').length > 0) ? 'Header Ship-To Lat/Long' : 'Header Bill-To Lat/Long') + ']]></AddressCode>\n';
				soap += '\t\t\t\t\t\t<TaxRegionId><![CDATA[0]]></TaxRegionId>\n';
				soap += '\t\t\t\t\t\t<Latitude><![CDATA[' + ((nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_latitude').length > 0) ? nlapiGetFieldValue('custbody_ava_shipto_latitude') : nlapiGetFieldValue('custbody_ava_billto_latitude')) + ']]></Latitude>\n';
				soap += '\t\t\t\t\t\t<Longitude><![CDATA[' + ((nlapiGetFieldValue('custbody_ava_shipto_longitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude').length > 0) ? nlapiGetFieldValue('custbody_ava_shipto_longitude') : nlapiGetFieldValue('custbody_ava_billto_longitude')) + ']]></Longitude>\n';
				soap += '\t\t\t\t\t</BaseAddress>\n'; 
			}
			else if(AVA_ShipToAddress != null && AVA_ShipToAddress.length > 0)
			{
				soap += '\t\t\t\t\t<BaseAddress>\n';
				soap += '\t\t\t\t\t\t<AddressCode><![CDATA[' + AVA_ShipToAddress[0] + ']]></AddressCode>\n';
				soap += '\t\t\t\t\t\t<Line1><![CDATA[' + ((AVA_ShipToAddress[1] != null) ? AVA_ShipToAddress[1] : '') + ']]></Line1>\n';
				soap += '\t\t\t\t\t\t<Line2><![CDATA[' + ((AVA_ShipToAddress[2] != null) ? AVA_ShipToAddress[2] : '') + ']]></Line2>\n';
				soap += '\t\t\t\t\t\t<Line3/>\n'; 
				soap += '\t\t\t\t\t\t<City><![CDATA[' + ((AVA_ShipToAddress[4] != null) ? AVA_ShipToAddress[4] : '') + ']]></City>\n';
				soap += '\t\t\t\t\t\t<Region><![CDATA[' + ((AVA_ShipToAddress[5] != null) ? AVA_ShipToAddress[5] : '') + ']]></Region>\n';
				soap += '\t\t\t\t\t\t<PostalCode><![CDATA[' + ((AVA_ShipToAddress[6] != null) ? AVA_ShipToAddress[6] : '') + ']]></PostalCode>\n';
				soap += '\t\t\t\t\t\t<Country><![CDATA[' + ((AVA_ShipToAddress[7] != null) ? AVA_ShipToAddress[7] : '') + ']]></Country>\n';
				if(AVA_EvaluateAddressInfo(AVA_ShipToAddress) != 0)
				{
					soap += '\t\t\t\t\t\t<TaxRegionId><![CDATA[0]]></TaxRegionId>\n';
					soap += '\t\t\t\t\t\t<Latitude><![CDATA[' + AVA_ShipToAddress[8] + ']]></Latitude>\n';
					soap += '\t\t\t\t\t\t<Longitude><![CDATA[' + AVA_ShipToAddress[9] + ']]></Longitude>\n';
				}
				soap += '\t\t\t\t\t</BaseAddress>\n'; 
			}
		}
	}
	soap += '\t\t\t\t</Addresses>\n';
	return soap;
}

function AVA_GetDestinationAddress()
{
	var ShipAddress = 'F';
	if((nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0) || (nlapiGetFieldValue('shipaddress') != null && nlapiGetFieldValue('shipaddress').length > 0))
	{
		AddressList = AVA_GetAddresses(1, 1);
		ShipAddress = 'T';
	}
	else
	{
		AVA_ShipToLatitude = (nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_latitude').length > 0) ? nlapiGetFieldValue('custbody_ava_shipto_latitude') : '';
		AVA_ShipToLongitude = (nlapiGetFieldValue('custbody_ava_shipto_longitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude').length > 0) ? nlapiGetFieldValue('custbody_ava_shipto_longitude') : '';
		if (AVA_ShipToLatitude.length > 0 && AVA_ShipToLongitude.length > 0)
		{
			ShipAddress = 'T';
			return 0;	//Proper
		}
	}
	
	if(ShipAddress == 'F')
	{
		if((nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0) || (nlapiGetFieldValue('billaddress') != null && nlapiGetFieldValue('billaddress').length > 0))
		{
			AddressList = AVA_GetAddresses(2, 1);
		}
		else
		{
			if(nlapiGetFieldValue('billaddress') == null || (nlapiGetFieldValue('billaddress') != null && nlapiGetFieldValue('billaddress').length == 0))
			{
				AVA_BillToLatitude = (nlapiGetFieldValue('custbody_ava_billto_latitude') != null && nlapiGetFieldValue('custbody_ava_billto_latitude').length> 0) ? nlapiGetFieldValue('custbody_ava_billto_latitude') : '';
				AVA_BillToLongitude = (nlapiGetFieldValue('custbody_ava_billto_longitude') != null && nlapiGetFieldValue('custbody_ava_billto_longitude').length > 0) ? nlapiGetFieldValue('custbody_ava_billto_longitude') : '';
				if (AVA_BillToLatitude.length == 0 && AVA_BillToLongitude.length == 0)
				{
					AVA_ErrorCode = 12;
					return 1; //Invalid
				}
				else
				{
					return 0; //Proper
				}
			}
			else
			{
				AddressList = AVA_GetAddresses(2, 1); 
			}
		}
	}
	return AddressList;
}

function AVA_GetAddresses(TypeId, RecordType) // 1 - Customer Record   2- Location Record
{
	var AddressList = new Array();
	if(RecordType == 1)
	{
		if(TypeId == 1)
		{
			// Ship From address
			AddressList[0] = ((nlapiGetFieldValue('shipaddresslist')!=null && nlapiGetFieldValue('shipaddresslist').length > 0) ? 'Ship-To Address': 'Custom Ship-To Address').substring(0,50);
			AddressList[1] = (nlapiGetFieldValue('shipaddr1')!=null)?(nlapiGetFieldValue('shipaddr1')).substring(0,50) : '';
			AddressList[2] = (nlapiGetFieldValue('shipaddr2')!=null)?(nlapiGetFieldValue('shipaddr2')).substring(0,50) : '';
			AddressList[3] = '';
			AddressList[4] = (nlapiGetFieldValue('shipcity')!=null)?(nlapiGetFieldValue('shipcity')).substring(0,50) : '';
			AddressList[5] = (nlapiGetFieldValue('shipstate')!=null)?(nlapiGetFieldValue('shipstate')).substring(0,3) : '';
			AddressList[6] = (nlapiGetFieldValue('shipzip')!=null)?(nlapiGetFieldValue('shipzip')).substring(0,11) : '';
			var ReturnCountryName = AVA_CheckCountryName((nlapiGetFieldValue('shipcountry')!=null)?(nlapiGetFieldValue('shipcountry')).substring(0,50) : '');
			AddressList[7] = ReturnCountryName[1];
			AddressList[8] = (nlapiGetFieldValue('custbody_ava_shipto_latitude')!=null)? nlapiGetFieldValue('custbody_ava_shipto_latitude') : '';
			AddressList[9] = (nlapiGetFieldValue('custbody_ava_shipto_longitude')!=null)? nlapiGetFieldValue('custbody_ava_shipto_longitude') : '';
		}
		else
		{
			// Bill to address
			AddressList[0] = ((nlapiGetFieldValue('billaddresslist')!=null && nlapiGetFieldValue('billaddresslist').length > 0) ? 'Bill-To Address' : 'Custom Bill-To Address').substring(0,50);
			AddressList[1] = (nlapiGetFieldValue('billaddr1')!=null)?(nlapiGetFieldValue('billaddr1')).substring(0,50) : '';
			AddressList[2] = (nlapiGetFieldValue('billaddr2')!=null)?(nlapiGetFieldValue('billaddr2')).substring(0,50) : '';
			AddressList[3] = '';
			AddressList[4] = (nlapiGetFieldValue('billcity')!=null)?(nlapiGetFieldValue('billcity')).substring(0,50) : '';
			AddressList[5] = (nlapiGetFieldValue('billstate')!=null)?(nlapiGetFieldValue('billstate')).substring(0,3) : '';
			AddressList[6] = (nlapiGetFieldValue('billzip')!=null)?(nlapiGetFieldValue('billzip')).substring(0,11) : '';
			var ReturnCountryName = AVA_CheckCountryName((nlapiGetFieldValue('billcountry')!=null)?(nlapiGetFieldValue('billcountry')).substring(0,50) : '');
			AddressList[7] = ReturnCountryName[1];
			AddressList[8] = (nlapiGetFieldValue('custbody_ava_billto_latitude')!=null)? nlapiGetFieldValue('custbody_ava_billto_latitude') : '';
			AddressList[9] = (nlapiGetFieldValue('custbody_ava_billto_longitude')!=null)? nlapiGetFieldValue('custbody_ava_billto_longitude') : '';
		}
	}
	else if(RecordType == 2)
	{
		// Location record to be fetched
		try
		{
			if (nlapiGetFieldValue('custpage_ava_alllocations') != null && nlapiGetFieldValue('custpage_ava_alllocations').length > 0)
			{
				var AVA_Locations = JSON.parse(nlapiGetFieldValue('custpage_ava_alllocations'));
				for(var i in AVA_Locations)
				{
					if (AVA_Locations[i].id == TypeId)
					{
						AddressList[0] = (AVA_Locations[i].columns['name'] != null)?(AVA_Locations[i].columns['name']).substring(0,50) : '';
						AddressList[1] = (AVA_Locations[i].columns['address1'] != null)?(AVA_Locations[i].columns['address1']).substring(0,50) : '';
						AddressList[2] = (AVA_Locations[i].columns['address2'] != null)?(AVA_Locations[i].columns['address2']).substring(0,50) : '';
						AddressList[3] = '';
						AddressList[4] = (AVA_Locations[i].columns['city'] != null)?(AVA_Locations[i].columns['city']).substring(0,50) : '';
						AddressList[5] = (AVA_Locations[i].columns['state'] != null)?(AVA_Locations[i].columns['state']).substring(0,3) : '';
						AddressList[6] = (AVA_Locations[i].columns['zip'] != null)?(AVA_Locations[i].columns['zip']).substring(0,11) : '';
						var ReturnCountryName = AVA_CheckCountryName((AVA_Locations[i].columns['country'] != null)?(AVA_Locations[i].columns['country']).substring(0,50) : '');
						AddressList[7] = ReturnCountryName[1];
						AddressList[8] = AVA_Locations[i].columns['custrecord_ava_ispos'];
						break;
					}
				}
			}
		}
		catch(err)
		{
			nlapiLogExecution('DEBUG', 'TRY/CATCH', err.getDetails());
		}
	}
	return AddressList;
}

function AVA_CheckCountryName(CountryName)
{
	var ReturnCountryName = new Array();
	switch(CountryName)
	{
		case 'AS':
		case 'FM':
		case 'GU':
		case 'MH':
		case 'MP':
		case 'PW':
		case 'PR':
		case 'UM':
		case 'VI':
			ReturnCountryName[0] = 0;
			ReturnCountryName[1] = 'US';
			break;
		
		default:    
			ReturnCountryName[0] = 1;
			ReturnCountryName[1] = CountryName;
			break;
	} 
	return ReturnCountryName;
}

function AVA_EvaluateAddressInfo(AddressInfo) 
{
	if (AddressInfo[0].length > 0 || AddressInfo[1].length > 0)
	var bOption1 = ((AddressInfo[0].length > 0 || AddressInfo[0].length > 0) && AddressInfo[6].length > 0) ? true : false;
	var bOption2 = ((AddressInfo[0].length > 0 || AddressInfo[0].length > 0) && AddressInfo[4].length > 0 && AddressInfo[5].length > 0) ? true : false;

	if ((bOption1 == true) || (bOption2 == true))
	{
		return 0;
	}
	else
	{
		return 1;
	}
} 

function AVA_GetTaxLines(AVA_DocType, Multiplier)
{
	var soap, soapLine = 1, Locat;
	AVA_TaxRequestLines = new Array();
	
	soap = '\t\t\t\t<Lines>\n';
	
	var TabType, TabCount;	
	
	// When there is only one shipping/billing address, fetching the entitymap for that address only once
	var AVA_EntityMapHeader;
	if (AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
	{
		if(nlapiGetFieldValue('ismultishipto') == null || nlapiGetFieldValue('ismultishipto') == 'F')
		{
			if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
			{
				if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
				{
					AVA_EntityMapHeader = (nlapiGetFieldValue('custbody_ava_shiptousecode') != null && nlapiGetFieldValue('custbody_ava_shiptousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_shiptousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
				}
				else if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
				{
					AVA_EntityMapHeader = (nlapiGetFieldValue('custbody_ava_billtousecode') != null && nlapiGetFieldValue('custbody_ava_billtousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_billtousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
				}
			}
			else
			{
				if (nlapiGetFieldValue('custpage_ava_usecodeusuage') != null && nlapiGetFieldValue('custpage_ava_usecodeusuage') == 'T' && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
				{
					//extract values from client side since its set
					if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0 )
					{
						AVA_EntityMapHeader = (nlapiGetFieldValue('custbody_ava_shiptousecode') != null && nlapiGetFieldValue('custbody_ava_shiptousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_shiptousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
					}
					else if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
					{
						AVA_EntityMapHeader = (nlapiGetFieldValue('custbody_ava_billtousecode') != null && nlapiGetFieldValue('custbody_ava_billtousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_billtousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
					}
				}
				else
				{
					//Existing logic for server side processing only.
					if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
					{
						AVA_EntityMapHeader = AVA_GetEntityUseCodes(nlapiGetFieldValue('shipaddresslist'));
					}
					else if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
					{
						AVA_EntityMapHeader = AVA_GetEntityUseCodes(nlapiGetFieldValue('billaddresslist'));
					}
				}
			}
		}	
	}

	for(var line = 0 ; AVA_TaxLines != null && line < AVA_TaxLines.length ; line++)
	{	
		LocField   = 'location';
		DescField  = (AVA_NS_Lines[line][0] == 'item') ? 'description' : 'memo';
		
		if(AVA_TaxLines[line] == 'T')
		{
			soap += '\t\t\t\t\t<Line>\n';
			soap += '\t\t\t\t\t\t<No><![CDATA[' + parseInt(soapLine) + ']]></No>\n';
			
			var Locat;
			if(AVA_DisableLocationCode == 'T' || AVA_DisableLocationCode == true)
			{
				Locat = AVA_Def_Addressee;
			}
			else
			{
				if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F')
				{
					if(AVA_HeaderLocation != null && AVA_HeaderLocation.length > 0)
					{
						Locat = AVA_HeaderLocation[0];
					}
					else
					{
						Locat = AVA_Def_Addressee;
					}
				}
				else
				{
					var AVA_LineLocation = 'F', LocPOS;
					if(nlapiGetLineItemValue(AVA_NS_Lines[line][0], LocField, AVA_NS_Lines[line][1]) != null)
					{
						Locat = (AVA_LocationArray[line] != null && AVA_LocationArray[line][0] != null && AVA_LocationArray[line][1] != null && AVA_LocationArray[line][1][0] != null && AVA_LocationArray[line][1][0].length > 0) ? AVA_LocationArray[line][1][0] : null;
						var PosCheck = (AVA_LocationArray[line] != null && AVA_LocationArray[line][0] != null && AVA_LocationArray[line][1] != null && AVA_LocationArray[line][1][0] != null && AVA_LocationArray[line][1][0].length > 0) ? AVA_LocationArray[line][1][8] : null;
						var TabType = (AVA_NS_Lines[line][0] == 'item') ? 'item' : ((AVA_NS_Lines[line][0] == 'itemcost') ? 'itemcost' : 'expcost');
						if(Locat != null && Locat.length > 0 && ((TabType == 'item' && AVA_PickUpFlag[line] == 'T') || (TabType != 'item' && PosCheck == true)))
						{
							LocPOS = 1;
						}
						else
						{
							LocPOS = 0;
						}
						Locat = (Locat != null && Locat.length > 0) ? Locat : AVA_Def_Addressee;
						AVA_LineLocation = 'T';
					}

					if(AVA_LineLocation == 'F')
					{
						Locat = AVA_Def_Addressee;
					}
				}
			}
			
			if(AVA_LocationPOS == 1 || LocPOS == 1)
			{
				soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat + ']]></OriginCode>\n';
				soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + Locat + ']]></DestinationCode>\n';
			}
			else
			{
				if(AVA_TaxCodes[line] == 0)
				{
					var DestCode;				
					soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat + ']]></OriginCode>\n';
					if(AVA_NS_Lines[line][0] == 'item' && nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto') == 'T' || nlapiGetFieldValue('ismultishipto') == 'Yes'))
					{
						//When Multi Line Shipping Route is enabled
						if (nlapiGetLineItemValue('item','shipaddress', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item','shipaddress', AVA_NS_Lines[line][1]).length > 0)
						{
							DestCode = 'Ship-To Address - ' + nlapiGetLineItemValue('item','shipaddress', AVA_NS_Lines[line][1]);
						}
						else if ((nlapiGetLineItemValue('item','custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item','custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]).length > 0) && (nlapiGetLineItemValue('item','custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item','custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]).length > 0))
						{
							DestCode = 'Ship-To Lat/Long-' + AVA_NS_Lines[line][1];
						}
						else
						{
							DestCode = AVA_GetDestinationCode();
						}					
					}
					else
					{
						DestCode = AVA_GetDestinationCode();
					}
					soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + DestCode + ']]></DestinationCode>\n';
				}
				else if(AVA_TaxCodes[line] == 1)
				{				
					var AVAPOD;
					if(AVA_NS_Lines[line][0] == 'item' && nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto') == 'T' || nlapiGetFieldValue('ismultishipto') == 'Yes'))
					{
						//When Multi Line Shipping Route is enabled
						if (nlapiGetLineItemValue('item','shipaddress', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item','shipaddress', AVA_NS_Lines[line][1]).length > 0)
						{
							AVAPOD = 'Ship-To Address - ' + nlapiGetLineItemValue('item','shipaddress', AVA_NS_Lines[line][1]);
						}
						else if (nlapiGetLineItemValue('item','custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item','custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]).length > 0 && nlapiGetLineItemValue('item','custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item','custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]).length > 0)
						{
							AVAPOD = 'Ship-To Lat/Long-' + AVA_NS_Lines[line][1];
						}
						else
						{
							AVAPOD = AVA_GetDestinationCode();
						}
					}
					else
					{
						AVAPOD = AVA_GetDestinationCode();
					}
					soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + AVAPOD + ']]></OriginCode>\n';
					soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + AVAPOD + ']]></DestinationCode>\n';
				}         
				else if(AVA_TaxCodes[line] == 2)
				{
				
					soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat + ']]></OriginCode>\n';
					soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + Locat + ']]></DestinationCode>\n';
				}
			}
			
			soap += '\t\t\t\t\t\t<ItemCode><![CDATA[' + ((AVA_LineNames[line] != null) ? AVA_LineNames[line].substring(0,50) : '') + ']]></ItemCode>\n';

			AVA_TaxRequestLines[soapLine-1] = new Array();
			AVA_TaxRequestLines[soapLine-1][0] = AVA_NS_Lines[line][0]; // Tab name
			AVA_TaxRequestLines[soapLine-1][1] = ((AVA_LineNames[line] != null) ? AVA_LineNames[line].substring(0,50) : '');
			AVA_TaxRequestLines[soapLine-1][2] = AVA_NS_Lines[line][1];//Line Number
			AVA_TaxRequestLines[soapLine-1][3] = line+1;//Taxcode Array's Index(Used in AVA_SetTaxFlagsOnServer())

			if(AVA_TaxCodeMapping == 'T' || AVA_TaxCodeMapping == true)
			{
				var TaxCode = null;
				
				if(AVA_NS_Lines[line][0] != 'item' && AVA_NS_Lines[line][0] != 'expcost')
				{
					for(var item = 0; item < AVA_ItemInfoArr.length ; item++)
					{
						if(AVA_ItemInfoArr[item][0] == line)
						{
							TaxCode = AVA_ItemInfoArr[item][3];
							break;
						}
					}
				}
				else if(AVA_NS_Lines[line][0] == 'item')
				{
					TaxCode = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'custcol_ava_taxcodemapping', AVA_NS_Lines[line][1]);
				}
	
				if(TaxCode != null && TaxCode != '')
				{
					soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + TaxCode.substring(0,25) + ']]></TaxCode>\n';
				}
				else
				{
					if(AVA_Taxable[line] == 'F')
					{
						if((AVA_EnableDiscount == 'T'||AVA_EnableDiscount == true) && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0 && (AVA_DiscountTaxCode != null && AVA_DiscountTaxCode.length > 0))
						{
							soap += '\t\t\t\t\t\t<TaxCode><![CDATA['+ AVA_DiscountTaxCode +']]></TaxCode>\n';
						}
						else
						{
							soap += '\t\t\t\t\t\t<TaxCode><![CDATA[NT]]></TaxCode>\n';
						}
					}
					else
					{
						soap += '\t\t\t\t\t\t<TaxCode/>\n';
					}
				}
			}
			else
			{
				if(AVA_Taxable[line] == 'F')
				{
					if((AVA_EnableDiscount == 'T'||AVA_EnableDiscount == true) && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0 && (AVA_DiscountTaxCode != null && AVA_DiscountTaxCode.length > 0))
					{
						soap += '\t\t\t\t\t\t<TaxCode><![CDATA['+ AVA_DiscountTaxCode +']]></TaxCode>\n';
					}
					else
					{
						soap += '\t\t\t\t\t\t<TaxCode><![CDATA[NT]]></TaxCode>\n';
					}
				}
				else
				{
					soap += '\t\t\t\t\t\t<TaxCode/>\n';
				}
			}

			var qty = (AVA_LineQty[line] > 0) ? AVA_LineQty[line] : (AVA_LineQty[line] * -1);
		
			soap += '\t\t\t\t\t\t<Qty>' + qty + '</Qty>\n';
			
			var amount = (AVA_LineAmount[line] * Multiplier);
			
			soap += '\t\t\t\t\t\t<Amount>' + amount + '</Amount>\n';
			
			//Discount Mechanism
			if((AVA_EnableDiscount == true || AVA_EnableDiscount == 'T') && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0)
			{
				soap += '\t\t\t\t\t\t<Discounted>0</Discounted>\n';
			}
			else
			{
				if (parseFloat(nlapiGetFieldValue('discounttotal')) != 0.0)
				{
					soap += '\t\t\t\t\t\t<Discounted>1</Discounted>\n';
				}
				else
				{
					soap += '\t\t\t\t\t\t<Discounted>0</Discounted>\n';
				}
			}

			if(AVA_ItemAccount == 'T' || AVA_ItemAccount == true)
			{
				var ItemAccount = null;
				
				if(AVA_NS_Lines[line][0] != 'item' && AVA_NS_Lines[line][0] != 'expcost')
				{					
					for(var item = 0; item < AVA_ItemInfoArr.length ; item++)
					{
						if(AVA_ItemInfoArr[item][0] == line)
						{
							ItemAccount = AVA_ItemInfoArr[item][4];
							break;
						}
					}
				}
				else if(AVA_NS_Lines[line][0] == 'item')
				{
					ItemAccount = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'custcol_ava_incomeaccount', AVA_NS_Lines[line][1]);
				}				
				
				if(ItemAccount != null && ItemAccount.length != 0)
				{
					soap += '\t\t\t\t\t\t<RevAcct><![CDATA[' + ItemAccount.substring(0,50) + ']]></RevAcct>\n';
				}
				else
				{
					soap += '\t\t\t\t\t\t<RevAcct/>\n';
				}
			}
			else
			{
				soap += '\t\t\t\t\t\t<RevAcct/>\n';
			}

			if(AVA_UDF1 == 'T' || AVA_UDF1 == true)
			{
				var Udf = null;
				
				if(AVA_NS_Lines[line][0] != 'item' && AVA_NS_Lines[line][0] != 'expcost')
				{					
					for(var item = 0; item < AVA_ItemInfoArr.length ; item++)
					{
						if(AVA_ItemInfoArr[item][0] == line)
						{
							Udf = AVA_ItemInfoArr[item][1];
							break;
						}
					}
				}
				else if(AVA_NS_Lines[line][0] == 'item')
				{
					Udf = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'custcol_ava_udf1', AVA_NS_Lines[line][1]);
				}	
				
				if(Udf != null && Udf != '')
				{
					soap += '\t\t\t\t\t\t<Ref1><![CDATA[' + Udf.substring(0,250) + ']]></Ref1>\n';
				}
				else
				{
					soap += '\t\t\t\t\t\t<Ref1/>\n';
				}
			}
			else
			{
				soap += '\t\t\t\t\t\t<Ref1/>\n';
			}

			if(AVA_UDF2 == 'T' || AVA_UDF2 == true)
			{
				var Udf = null;
				
				if(AVA_NS_Lines[line][0] != 'item' && AVA_NS_Lines[line][0] != 'expcost')
				{					
					for(var item = 0; item < AVA_ItemInfoArr.length ; item++)
					{
						if(AVA_ItemInfoArr[item][0] == line)
						{
							Udf = AVA_ItemInfoArr[item][2];
							break;
						}
					}
				}
				else if(AVA_NS_Lines[line][0] == 'item')
				{
					Udf = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'custcol_ava_udf2', AVA_NS_Lines[line][1]);
				}	
				
				if(Udf != null && Udf != '')
				{
					soap += '\t\t\t\t\t\t<Ref2><![CDATA[' + Udf.substring(0,250) + ']]></Ref2>\n';
				}
				else
				{
					soap += '\t\t\t\t\t\t<Ref2/>\n';
				}
			}
			else
			{
				soap += '\t\t\t\t\t\t<Ref2/>\n';
			}

			soap += '\t\t\t\t\t\t<ExemptionNo/>\n';
			
			if((AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true )&& AVA_TaxCodes[line] != 2)
			{
				var entitymap, entityusecode;
				if(AVA_NS_Lines[line][0] == 'item' && nlapiGetFieldValue('ismultishipto') != null &&  nlapiGetFieldValue('ismultishipto') == 'T')
				{
					if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
					{
						if(nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]).length > 0)
						{
							entityusecode = nlapiGetLineItemText('item', 'custcol_ava_shiptousecode', AVA_NS_Lines[line][1]);
							entitymap = (entityusecode.length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + entityusecode.substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
							soap += entitymap;
						}
						else
						{
							soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';
						}
					}
					else
					{
						if (nlapiGetFieldValue('custpage_ava_usecodeusuage') != null && nlapiGetFieldValue('custpage_ava_usecodeusuage') == 'T')
						{
							if(nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]).length > 0)
							{
								entityusecode = nlapiGetLineItemText('item', 'custcol_ava_shiptousecode', AVA_NS_Lines[line][1]);
								entitymap = (entityusecode.length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + entityusecode.substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
								soap += entitymap;
							}
							else
							{
								soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';
							}
						}
						else
						{
							if(nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]).length > 0)
							{
								entitymap = AVA_GetEntityUseCodes(nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]));
								soap += entitymap;
							}
						}
					}
				}
				else if(AVA_EntityMapHeader != null && AVA_EntityMapHeader.length > 0)
				{
					if (nlapiGetFieldValue('custpage_ava_context') != 'webstore')
					{
						soap += AVA_EntityMapHeader;	
					}
					else
					{
						soap += '\t\t\t\t<CustomerUsageType><![CDATA[' + AVA_EntityMapHeader.substring(0,25) + ']]></CustomerUsageType>\n';
					}
				}
				else
				{
					soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';	
				}
			}
			else
			{
				soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';	
			} 
		
			var AVA_Description = ''; 
			var Itemdesc = nlapiGetLineItemValue(AVA_NS_Lines[line][0], DescField, AVA_NS_Lines[line][1]);

			for (var ii = 0 ; Itemdesc != null && ii < Itemdesc.length  ; ii++)
			{
				if (Itemdesc.charCodeAt(ii) != 5)
				{
					AVA_Description = AVA_Description + Itemdesc.charAt(ii);
				}
			}

			if(AVA_Description != null && AVA_Description.length != 0)
			{
				soap += '\t\t\t\t\t\t<Description><![CDATA[' + AVA_Description.substring(0,255) + ']]></Description>\n';
			}
			else
			{
				soap += '\t\t\t\t\t\t<Description><![CDATA[' + ((AVA_LineNames[line] != null) ? AVA_LineNames[line].substring(0,255) : '') + ']]></Description>\n';
			}
			
			if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T')
			{
				soap += '\t\t\t\t\t\t<TaxIncluded>1</TaxIncluded>\n';
			}
			soap += '\t\t\t\t\t</Line>\n';
			soapLine++;
		}
	}

	// For Billable Items, Billable Expenses, Billable Time discount.
	if((AVA_EnableDiscount == true || AVA_EnableDiscount == 'T') && nlapiGetFieldValue('custpage_ava_billcost') == 'T' && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0)
	{
		for(var tab = 0 ; tab < 3 ; tab++)
		{
			var AmountField = (tab == 0) ? 'itemcostdiscamount' : ((tab == 1) ? 'expcostdiscamount' : 'timediscamount');
			var DiscountField = (tab == 0) ? 'itemcostdiscount' : ((tab == 1) ? 'expcostdiscount' : 'timediscount');
			if(nlapiGetFieldValue(AmountField) != null && nlapiGetFieldValue(AmountField).length > 0)
			{
				var DiscountSoap = AVA_GetDiscountSoap(soapLine, DiscountField, AmountField, Multiplier);
				soap += DiscountSoap;
				soapLine++;
			}
		}
	}
	
	// For Header leve discount.
	if((AVA_EnableDiscount == true || AVA_EnableDiscount == 'T') && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0 && (nlapiGetFieldValue('discounttotal')!= null && parseFloat(nlapiGetFieldValue('discounttotal')) != 0))
	{
		var DiscountSoap = AVA_GetDiscountSoap(soapLine, 'discountitem', 'discounttotal', Multiplier);
		soap += DiscountSoap;
		soapLine++;
	}
	
	if(nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F' || nlapiGetFieldValue('ismultishipto') == 'No')))
	{
		if(nlapiGetFieldValue('shipmethod') != null && (nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0))
		{
			AVA_LineNames[AVA_LineNames.length] = 'FREIGHT';
			soapLine++;
			soap += AVA_GetShipAndHandling(line, parseFloat(soapLine-1), 'FREIGHT', Multiplier);

		}
	
		if(nlapiGetFieldValue('shipmethod') != null && (nlapiGetFieldValue('handlingcost') != null) &&(nlapiGetFieldValue('handlingcost') > 0))
		{
			AVA_LineNames[AVA_LineNames.length] = 'MISCELLANEOUS';
			soapLine++;
			soap += AVA_GetShipAndHandling(line, parseFloat(soapLine-1), 'MISCELLANEOUS', Multiplier);
		}
	}
	else
	{
		for(var i=0 ; AVA_ShipGroupTaxcodes != null && i < AVA_ShipGroupTaxcodes.length ; i++)
		{
			var fieldName = (AVA_ShipGroupTaxcodes[i][3] == 'FREIGHT') ? 'shippingrate' : 'handlingrate';
			if(nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[i][0]) != null && nlapiGetLineItemValue('shipgroup', fieldName, AVA_ShipGroupTaxcodes[i][0]) > 0)
			{
				soapLine++;
				soap += AVA_MultiShipHandlingLines(parseFloat(soapLine-1), AVA_ShipGroupTaxcodes[i], Multiplier);
			}
		}
	}

	soap += '\t\t\t\t</Lines>\n';   
	return soap;
}

function AVA_MultiShipHandlingLines(LineNo, AVA_ShipGroupTaxcode, Multiplier)
{
	var Locat, DestCode, soap = '', LocPOS = 0;
	soap += '\t\t\t\t\t<Line>\n';
	soap += '\t\t\t\t\t\t<No><![CDATA[' + parseInt(LineNo) + ']]></No>\n';
	
	TaxCodestatus = AVA_IdentifyTaxCode(AVA_ShipGroupTaxcode[2]);

	if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F')
	{
		if(AVA_HeaderLocation != null && AVA_HeaderLocation.length > 0)
		{
			Locat = AVA_HeaderLocation[0];
		}
		else
		{
			Locat = AVA_Def_Addressee;
		}
	}
	else
	{
		if(TaxCodestatus == 0 || TaxCodestatus == 2)
		{
			var sourceAddr = nlapiGetLineItemValue('shipgroup', 'sourceaddressref', AVA_ShipGroupTaxcode[0]);//Gets current shipgroup's line source address id

			for(var i=0; AVA_LocationArray != null && i<AVA_LocationArray.length ; i++)
			{
				if(AVA_LocationArray[i][0] == sourceAddr)
				{
					Locat = AVA_LocationArray[i][1][0];
					if(Locat != null && Locat.length > 0 && AVA_PickUpFlag[i] == 'T')
					{
						LocPOS = 1;
					}
					break;
				}
			}

			if(Locat == null || Locat.length <= 0)
			{
				Locat = AVA_Def_Addressee;
			}
		}	
	}
	
	if(TaxCodestatus == 0 || TaxCodestatus == 1)
	{
		var destAddr = nlapiGetLineItemValue('shipgroup', 'destinationaddressref', AVA_ShipGroupTaxcode[0]);//Gets current shipgroup's line dest address id

		for(var i=0; AVA_MultiShipAddArray != null && i<AVA_MultiShipAddArray.length ; i++)
		{
			if(AVA_MultiShipAddArray[i][0] == destAddr)
			{
				DestCode = AVA_MultiShipAddArray[i][1][0];
				break;
			}
		}

		if(DestCode == null || DestCode.length <= 0)
		{
			DestCode = AVA_GetDestinationCode();
		}
	}
	
	if(AVA_LocationPOS == 1 || LocPOS == 1)
	{
		soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat.substring(0,50) + ']]></OriginCode>\n';
		soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + Locat.substring(0,50) + ']]></DestinationCode>\n';
	}
	else
	{
		if(TaxCodestatus == 0)
		{
			soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat.substring(0,50) + ']]></OriginCode>\n';
			soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + DestCode.substring(0,50) + ']]></DestinationCode>\n';
		}
		else if(TaxCodestatus == 1)
		{
			soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + DestCode.substring(0,50) + ']]></OriginCode>\n';
			soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + DestCode.substring(0,50) + ']]></DestinationCode>\n';
		}					
		else if(TaxCodestatus == 2)
		{
			soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat.substring(0,50) + ']]></OriginCode>\n';
			soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + Locat.substring(0,50) + ']]></DestinationCode>\n';
		}
	}
	
	if(AVA_ShipGroupTaxcode[3] == 'FREIGHT')
	{
		if(AVA_ShipGroupTaxcode[0] != null && AVA_ShipGroupTaxcode[0].length > 0)
		{
			soap += '\t\t\t\t\t\t<ItemCode>' + nlapiGetLineItemValue('shipgroup', 'shippingmethod', AVA_ShipGroupTaxcode[0]).substring(0,50) + '</ItemCode>\n';
		}
		else
		{
			soap += '\t\t\t\t\t\t<ItemCode>FREIGHT</ItemCode>\n';
		}
		
		AVA_ShipCode = 'T';
		
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
		{
			if(nlapiGetFieldValue('custbody_avashippingcode') == null || (nlapiGetFieldValue('custbody_avashippingcode') != null && nlapiGetFieldValue('custbody_avashippingcode').length == 0))			
			{
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((AVA_DefaultShippingCode != null && AVA_DefaultShippingCode.length > 0) ? AVA_DefaultShippingCode.substring(0,25) : '') + ']]></TaxCode>\n';
			}
			else
			{
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + nlapiGetFieldText('custbody_avashippingcode').substring(0,25) + ']]></TaxCode>\n';
			}
		}
		else
		{
			if(nlapiGetFieldValue('custbody_avashippingcode') == null || (nlapiGetFieldValue('custbody_avashippingcode') != null && nlapiGetFieldValue('custbody_avashippingcode').length == 0))
			{
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((AVA_DefaultShippingCode != null && AVA_DefaultShippingCode.length > 0) ? AVA_DefaultShippingCode.substring(0,25) : '') + ']]></TaxCode>\n';
				ShippingCode = AVA_DefaultShippingCode;
			}
			else
			{
				var Shipcode = nlapiLookupField('customrecord_avashippingcodes', nlapiGetFieldValue('custbody_avashippingcode'), 'custrecord_ava_shippingcode');
				ShippingCode = Shipcode;
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((Shipcode != null && Shipcode.length > 0) ? Shipcode.substring(0,25) : '') + ']]></TaxCode>\n';
			}
		}	
	}
	else
	{
		if(AVA_ShipGroupTaxcode[0] != null && AVA_ShipGroupTaxcode[0].length > 0)
		{
			soap += '\t\t\t\t\t\t<ItemCode>' + nlapiGetLineItemValue('shipgroup', 'shippingmethod', AVA_ShipGroupTaxcode[0]).substring(0,50) + '</ItemCode>\n';
		}
		else
		{
			soap += '\t\t\t\t\t\t<ItemCode>MISCELLANEOUS</ItemCode>\n';
		}
		
		AVA_HandlingCode = 'T';
		soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((AVA_DefaultMiscCode != null && AVA_DefaultMiscCode.length > 0) ? AVA_DefaultMiscCode.substring(0,25) : '') + ']]></TaxCode>\n';
	}
	
	soap += '\t\t\t\t\t\t<Qty>1</Qty>\n';
	
	var AmtField = (AVA_ShipGroupTaxcode[3] == 'FREIGHT') ? 'shippingrate' : 'handlingrate';
	var amount = (nlapiGetLineItemValue('shipgroup',AmtField,AVA_ShipGroupTaxcode[0]) * Multiplier);
	
	soap += '\t\t\t\t\t\t<Amount>' + amount + '</Amount>\n';
	
	soap += '\t\t\t\t\t\t<Discounted>0</Discounted>\n';
	soap += '\t\t\t\t\t\t<RevAcct/>\n';
	soap += '\t\t\t\t\t\t<Ref1/>\n';
	soap += '\t\t\t\t\t\t<Ref2/>\n';
	soap += '\t\t\t\t\t\t<ExemptionNo/>\n';
	soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';

	soap += '\t\t\t\t\t\t<Description><![CDATA[' + AVA_ShipGroupTaxcode[3].substring(0,255) + ']]></Description>\n';
	soap += '\t\t\t\t\t</Line>\n';
	
	return soap;
	
}

function AVA_GetShipAndHandling(LoopCtr, LineNo, ItemCode, Multiplier)
{
	var TaxCodestatus;
	var fieldName = (ItemCode == 'FREIGHT') ? 'custpage_ava_shiptaxcode' : 'custpage_ava_handlingtaxcode';
	var Locat, soap = '';
	
	soap += '\t\t\t\t\t<Line>\n';
	soap += '\t\t\t\t\t\t<No><![CDATA[' + parseInt(LineNo) + ']]></No>\n';
	
	if (nlapiGetFieldValue('taxitem') != null) 
	{
		TaxCode = nlapiGetFieldValue('custpage_ava_formtaxcode');
		TaxCodestatus = AVA_IdentifyTaxCode(TaxCode);
	}
	else
	{
		TaxCodestatus = AVA_IdentifyTaxCode(nlapiGetFieldValue(fieldName));
	}

	if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F')
	{
		if(AVA_HeaderLocation != null && AVA_HeaderLocation.length > 0)
		{
			Locat = AVA_HeaderLocation[0];
		}
		else
		{
			Locat = AVA_Def_Addressee;
		}
	}
	else
	{
		Locat = AVA_Def_Addressee;
	}

	if(AVA_LocationPOS == 1)
	{
		soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat.substring(0,50) + ']]></OriginCode>\n';
		soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + Locat.substring(0,50) + ']]></DestinationCode>\n';
	}
	else
	{
		if(TaxCodestatus == 0)
		{
			soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat.substring(0,50) + ']]></OriginCode>\n';
			var DestCode = AVA_GetDestinationCode();
			soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + DestCode.substring(0,50) + ']]></DestinationCode>\n';
		}
		else if(TaxCodestatus == 1)
		{
			var AVAPOD = AVA_GetDestinationCode();
			soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + AVAPOD.substring(0,50) + ']]></OriginCode>\n';
			soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + AVAPOD.substring(0,50) + ']]></DestinationCode>\n';
		}         
		else if(TaxCodestatus == 2)
		{
			soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + Locat.substring(0,50) + ']]></OriginCode>\n';
			soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + Locat.substring(0,50) + ']]></DestinationCode>\n';
		}
	}

	if(ItemCode == 'FREIGHT')
	{
		AVA_ShipCode = 'T';
		soap += '\t\t\t\t\t\t<ItemCode>FREIGHT</ItemCode>\n';
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
		{
			if(nlapiGetFieldValue('custbody_avashippingcode') == null || (nlapiGetFieldValue('custbody_avashippingcode') != null && nlapiGetFieldValue('custbody_avashippingcode').length == 0))
			{
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((AVA_DefaultShippingCode != null && AVA_DefaultShippingCode.length > 0) ? AVA_DefaultShippingCode.substring(0,25) : '') + ']]></TaxCode>\n';
			}
			else
			{
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + nlapiGetFieldText('custbody_avashippingcode').substring(0,25) + ']]></TaxCode>\n';
			}
		}
		else
		{
			if(nlapiGetFieldValue('custbody_avashippingcode') == null || (nlapiGetFieldValue('custbody_avashippingcode') != null && nlapiGetFieldValue('custbody_avashippingcode').length == 0))
			{
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((AVA_DefaultShippingCode != null && AVA_DefaultShippingCode.length > 0) ? AVA_DefaultShippingCode.substring(0,25) : '') + ']]></TaxCode>\n';
				ShippingCode = AVA_DefaultShippingCode;
			}
			else
			{
				var Shipcode = nlapiLookupField('customrecord_avashippingcodes', nlapiGetFieldValue('custbody_avashippingcode'), 'custrecord_ava_shippingcode');
				ShippingCode = Shipcode;
				soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((Shipcode != null && Shipcode.length > 0) ? Shipcode.substring(0,25) : '') + ']]></TaxCode>\n';
			}
		} 
	}
	else
	{
		AVA_HandlingCode = 'T';
	
		soap += '\t\t\t\t\t\t<ItemCode><![CDATA[' + ((ItemCode!=null) ? ItemCode.substring(0,50) : '') + ']]></ItemCode>\n';
		soap += '\t\t\t\t\t\t<TaxCode><![CDATA[' + ((AVA_DefaultMiscCode != null && AVA_DefaultMiscCode.length > 0) ? AVA_DefaultMiscCode.substring(0,25) : '') + ']]></TaxCode>\n';
	}

	soap += '\t\t\t\t\t\t<Qty>1</Qty>\n';
	
	var AmtField = (ItemCode == 'FREIGHT') ? 'shippingcost' : 'handlingcost';
	var amount = (nlapiGetFieldValue(AmtField) * Multiplier);
	
	soap += '\t\t\t\t\t\t<Amount>' + amount + '</Amount>\n';
	
	soap += '\t\t\t\t\t\t<Discounted>0</Discounted>\n';
	soap += '\t\t\t\t\t\t<RevAcct/>\n';
	soap += '\t\t\t\t\t\t<Ref1/>\n';
	soap += '\t\t\t\t\t\t<Ref2/>\n';

	if (nlapiGetFieldValue('taxitem') != null) 
	{
		soap += '\t\t\t\t\t\t<ExemptionNo/>\n';
	}
	else
	{
		// Line Level Tax Code
		if(nlapiGetFieldValue(fieldName) != null)
		{
			soap += '\t\t\t\t\t\t<ExemptionNo/>\n';
		}
		else
		{
			soap += '\t\t\t\t\t\t<ExemptionNo/>\n';
		}
	}

	if(AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true )
	{
		// When there is only one shipping/billing address, fetching the entitymap for that address only once
		var AVA_EntityMapHeader;
		
		if(nlapiGetFieldValue('ismultishipto') == null || nlapiGetFieldValue('ismultishipto') == 'F')
		{
			if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
			{
				if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
				{
					AVA_EntityMapHeader = (nlapiGetFieldText('custbody_ava_shiptousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_shiptousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
				}
				else if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
				{
					AVA_EntityMapHeader = (nlapiGetFieldText('custbody_ava_billtousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_billtousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
				}
			}
			else
			{
				if (nlapiGetFieldValue('custpage_ava_usecodeusuage') != null && nlapiGetFieldValue('custpage_ava_usecodeusuage') == 'T')
				{
					//extract values from client side since its set
					if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
					{
						AVA_EntityMapHeader = (nlapiGetFieldText('custbody_ava_shiptousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_shiptousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
					}
					else if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
					{
						AVA_EntityMapHeader = (nlapiGetFieldText('custbody_ava_billtousecode').length > 0) ? '\t\t\t\t\t\t<CustomerUsageType><![CDATA[' + nlapiGetFieldText('custbody_ava_billtousecode').substring(0,25) + ']]></CustomerUsageType>\n' : '\t\t\t\t\t\t<CustomerUsageType/>\n';
					}
				}
				else
				{
					//Existing logic for server side processing only.
					if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
					{
						AVA_EntityMapHeader = AVA_GetEntityUseCodes(nlapiGetFieldValue('shipaddresslist'));
					}
					else if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
					{
						AVA_EntityMapHeader = AVA_GetEntityUseCodes(nlapiGetFieldValue('billaddresslist'));							
					}
				}
			}
		}
		
		if(AVA_EntityMapHeader != null && AVA_EntityMapHeader.length > 0)
		{
			soap += AVA_EntityMapHeader;
		}
		else
		{
			soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';	
		}
	}
	else
	{
		soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';
	}
	soap += '\t\t\t\t\t\t<Description><![CDATA[' + ((ItemCode != null) ? ItemCode.substring(0,255) : '') + ']]></Description>\n';
	soap += '\t\t\t\t\t</Line>\n';

	return soap;
}

function AVA_IdentifyTaxCode(TaxCode)
{
	var DefTaxCode = nlapiGetFieldValue('custpage_ava_deftax');
	
	if(TaxCode != null)
	{
		if(TaxCode.substr((TaxCode.length - 3), 3) != 'POD' && TaxCode.substr((TaxCode.length - 3), 3) != 'POS' && TaxCode != '-Not Taxable-')
		{
			if (DefTaxCode === TaxCode && DefTaxCode.length == TaxCode.length)
			{
				return 0;
			}
		}
		else
		{
			if(TaxCode.substr((TaxCode.length - 3), 3) == 'POD')
			{
				return 1;
			}
			else if(TaxCode.substr((TaxCode.length - 3), 3) == 'POS')
			{
				return 2;
			}
			else if(TaxCode == '-Not Taxable-')
			{
				if(DefTaxCode.substr((DefTaxCode.length - 3), 3) == 'POS')
				{
					return 2;
				}
				else if(DefTaxCode.substr((DefTaxCode.length - 3), 3) == 'POD')
				{
					return 1;
				}
				else
				{
					return 0;
				}
			}
			else
			{
				return 0;
			}
		}
	}
	else
	{
		if(DefTaxCode.substr((DefTaxCode.length - 3), 3) == 'POS')
		{
			return 2;
		}
		else if(DefTaxCode.substr((DefTaxCode.length - 3), 3) == 'POD')
		{
			return 1;
		}
		else
		{
			return 0;
		}
	}
		
}

function AVA_FindUdf(ItemId, UdfNo)
{
	var UdfExists = 'F';
	var soap;
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_itemid',null, 'anyof',ItemId);

	var cols = new Array();
	cols[0] = new nlobjSearchColumn('custrecord_ava_itemid');
	cols[1] = new nlobjSearchColumn('custrecord_ava_itemudf1');
	cols[2] = new nlobjSearchColumn('custrecord_ava_itemudf2');
	
	try
	{
		var searchresult = nlapiSearchRecord('customrecord_avaitemmapping', null, filters, cols);
		for(var i=0; searchresult != null && i < searchresult.length; i++)
		{
			if(UdfNo == 1)
			{
				var record = searchresult[i].getValue('custrecord_ava_itemudf1');
				soap = '\t\t\t\t\t\t<Ref1>' + record + '</Ref1>\n';
				UdfExists = 'T';
				break;
			}
			else if(UdfNo == 2)
			{
				var record = searchresult[i].getValue('custrecord_ava_itemudf2');
				soap = '\t\t\t\t\t\t<Ref2>' + record + '</Ref2>\n';
				UdfExists = 'T';
				break;
			}
		}
	}
	catch(err)
	{
		UdfExists = 'F';
	}   
	
	if(UdfExists == 'T')
	{
		return soap;
	}
	else
	{
		if(UdfNo == 1)
		{
			soap = '\t\t\t\t\t\t<Ref1/>\n';
		}
		else
		{ 
			soap = '\t\t\t\t\t\t<Ref2/>\n';
		}
		return soap;
	}
} 


function AVA_GetEntityUseCodes(AddressId, Mode)
{
	var soap, entitymap;
	var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;	

	try
	{
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
		{
			var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=customrecord_avaentityusemapping_new&custid=' + nlapiGetFieldValue('entity') + '&addid=' + AddressId, null, null );
			entitymap = response.getBody();
		}
		else
		{
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('custrecord_ava_customerid_new', null, 'anyof', nlapiGetFieldValue('entity'));
			
			var cols = new Array();
			cols[0] = new nlobjSearchColumn('custrecord_ava_customerid_new');
			cols[1] = new nlobjSearchColumn('custrecord_ava_addressid_new');
			cols[2] = new nlobjSearchColumn('custrecord_ava_entityusemap_new');
			
			var searchresult = nlapiSearchRecord('customrecord_avaentityusemapping_new', null, filters, cols);
			for(var i=0; searchresult != null && i< searchresult.length; i++)
			{
				if(searchresult[i].getValue('custrecord_ava_addressid_new') == AddressId)
				{
					entitymap = searchresult[i].getText('custrecord_ava_entityusemap_new');
					break;
				}
			}
		}

		if (Mode != null && Mode.length > 0 && Mode == '1')
		{
			soap = (entitymap != null && entitymap.length > 0) ? entitymap : '';
		}
		else
		{
			if((entitymap != null && entitymap.length > 0))
			{
				if (nlapiGetFieldValue('custpage_ava_context') != 'webstore')
				{
					soap = '\t\t\t\t<CustomerUsageType><![CDATA[' + entitymap.substring(0,25) + ']]></CustomerUsageType>\n';	
				}
				else
				{
					soap = (entitymap != null && entitymap.length > 0) ? entitymap : '';
				}
			}
			else
			{
				soap = '\t\t\t\t<CustomerUsageType/>\n';
			}
		}
	}
	catch(err)
	{
		if (Mode != null && Mode.length > 0 && Mode == '1')
		{
			soap = '';
		}
		else
		{
			soap = '\t\t\t\t<CustomerUsageType/>\n';
		}
	}
	return soap;      
}

function AVA_GetTaxEnvelope(actualcontents)
{
	var soap = null;
	soap = '<?xml version="1.0" encoding="utf-8"?>\n';
	soap += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n';
		soap += actualcontents;
	soap += '</soap:Envelope>';
	return soap;
}

function AVA_ConvertDate(Trans_Date)
{
	var AVA_Date, month, day, year;

	AVA_Date = new Date(nlapiStringToDate(Trans_Date));
	month = parseInt(AVA_Date.getMonth() + 1);
	day = AVA_Date.getDate();
	year = AVA_Date.getFullYear();
	
	month = month.toString();
	day = day.toString();

	if (month.length == 1)
	{
		month = '0' + month;
	}

	if (day.length == 1)
	{
		day = '0' + day;
	}

	AVA_Date = year + '-' + month + '-' + day;
	return AVA_Date;
}

function AVA_GetDate(Trans_Date, Date_Format)
{
	var DateString, AVA_Date, month, day, year;

	switch(Date_Format)
	{
		case 'MM/DD/YYYY': 
			var SplitDate = Trans_Date.split('/');
			year = SplitDate[2];
			month = parseFloat(SplitDate[0]).toString();
			day = parseInt(SplitDate[1]).toString();
			break;
				
		case 'DD/MM/YYYY':
			var SplitDate = Trans_Date.split('/');
			year = SplitDate[2];
			month = parseFloat(SplitDate[1]).toString();
			day = parseInt(SplitDate[0]).toString();
			break;  
		
		case 'DD-Mon-YYYY':
		case 'DD-MONTH-YYYY':
		case 'DD-MON-YYYY':
			var SplitDate = Trans_Date.split('-');
			year = SplitDate[2];
			month = parseFloat(AVA_GetMonthName(SplitDate[1])).toString();
			day = parseInt(SplitDate[0]).toString();
			break;  
		
		case 'DD.MM.YYYY':
			var SplitDate = Trans_Date.split('.');
			year = SplitDate[2];
			month = parseFloat(SplitDate[1]).toString();
			day = parseInt(SplitDate[0]).toString();
			break;
		
		case 'DD MONTH, YYYY':
			var SplitDate = Trans_Date.split(' ');
			year = SplitDate[2];
			month = parseFloat(AVA_GetMonthName(SplitDate[1].substring(0,SplitDate[1].length-1))).toString();
			day = parseInt(SplitDate[0]).toString();
			break;
		
		case 'YYYY/MM/DD':
			var SplitDate = Trans_Date.split('/');
			year = SplitDate[0];
			month = parseFloat(SplitDate[1]).toString();
			day = parseInt(SplitDate[2]).toString();
			break;
		
		case 'YYYY-MM-DD':
			var SplitDate =Trans_Date.split('-');
			year = SplitDate[0];
			month = parseFloat(SplitDate[1]).toString();
			day = parseInt(SplitDate[2]).toString();
			break;
		
		default:    
			AVA_Date = new Date(Trans_Date);
			month = parseInt(AVA_Date.getMonth() + 1);
			day = AVA_Date.getDate();
			year = AVA_Date.getFullYear();
			
			month = month.toString();
			day = day.toString();
			break;
	} 

	if (month.length == 1)
	{
		month = '0' + month;
	}

	if (day.length == 1)
	{
		day = '0' + day;
	}

	AVA_Date = year + '-' + month + '-' + day;
	return AVA_Date;
}

function AVA_TransactionUpdate(soapXML)
{
	AVA_XMLTaxLines = new Array();
	AVA_XMLTaxDetails = new Array();

	var TaxLine   = nlapiSelectValues( soapXML, "//*[name()='TaxLine']");
	var LineNo    = nlapiSelectValues( soapXML, "//*[name()='No']");
	var TaxCode   = nlapiSelectValues( soapXML, "//*[name()='TaxCode']");
	var Taxability  = nlapiSelectValues( soapXML, "//*[name()='Taxability']");
	var Exemption   = nlapiSelectValues( soapXML, "//*[name()='Exemption']");
	var Discount  = nlapiSelectValues( soapXML, "//*[name()='Discount']");
	var Taxable   = nlapiSelectValues( soapXML, "//*[name()='Taxable']");
	var Rate    = nlapiSelectValues( soapXML, "//*[name()='Rate']");
	var Tax     = nlapiSelectValues( soapXML, "//*[name()='Tax']");
	var TaxDetails  = nlapiSelectValues( soapXML, "//*[name()='TaxDetails']");
	
	for(var i=0, j=0; i < TaxLine.length; i++, j++)
	{
		AVA_XMLTaxLines[i] = new Array(9);
		AVA_XMLTaxLines[i][0] = LineNo[i];
		AVA_XMLTaxLines[i][1] = TaxCode[i];
		AVA_XMLTaxLines[i][2] = Taxability[i];
		AVA_XMLTaxLines[i][3] = Exemption[i];
		AVA_XMLTaxLines[i][4] = Discount[i];
		AVA_XMLTaxLines[i][5] = Taxable[i];
		AVA_XMLTaxLines[i][6] = Rate[i];
		AVA_XMLTaxLines[i][7] = Tax[i];
		AVA_XMLTaxLines[i][8] = TaxDetails[i];
	}
	return true;  
}

function AVA_GetAllLocations()
{
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('name');
	cols[1] = new nlobjSearchColumn('address1');
	cols[2] = new nlobjSearchColumn('address2');
	cols[3] = new nlobjSearchColumn('city');
	cols[4] = new nlobjSearchColumn('state');
	cols[5] = new nlobjSearchColumn('zip');
	cols[6] = new nlobjSearchColumn('country');
	cols[7] = new nlobjSearchColumn('custrecord_ava_ispos');
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

	var searchResult = nlapiSearchRecord('location', null, filters, cols)
	if(searchResult != null && searchResult.length > 0)
	{
		var obj = JSON.stringify(searchResult);
	}
	else
	{
		var obj = null;
	}
	return obj;
}


function AVA_TransactionTabBeforeLoad(type, form)
{
	var ConnectorStartTime = new Date();
	var VerifyCredentials = AVA_VerifyCredentials();
	
	form.setScript('customscript_avageneralscript_client');
	
	form.addField('custpage_ava_readconfig','longtext','ConfigRecord');
	form.getField('custpage_ava_readconfig').setDisplayType('hidden');
	
	if(VerifyCredentials == 0)
	{
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
		{
			var AVA_ExecutionContext = nlapiGetContext().getExecutionContext();
			
			if(AVA_ExecutionContext == 'userinterface' || AVA_ExecutionContext == 'userevent' || AVA_ExecutionContext == 'webservices' || AVA_ExecutionContext == 'csvimport' || AVA_ExecutionContext == 'scheduled' || AVA_ExecutionContext == 'suitelet' || AVA_ExecutionContext == 'webstore')
			{
				form.addField('custpage_ava_context', 'text', 'AVA_ExecutionContext');
				form.getField('custpage_ava_context').setDisplayType('hidden');
				form.getField('custpage_ava_context').setDefaultValue(AVA_ExecutionContext);
				
				form.addField('custpage_ava_environment', 'text', 'AVA_Environment');
				form.getField('custpage_ava_environment').setDisplayType('hidden');
				form.getField('custpage_ava_environment').setDefaultValue(nlapiGetContext().getEnvironment());
				
				var DocTaxCode = 'T';
				var DocLocation = 'F';
				
				if(form.getField('taxitem') == null)
				{
					DocTaxCode = 'F';
				}
				
				if(DocTaxCode == 'F'  && nlapiGetLineItemField('item','taxcode', 1) == null)
				{
					DocTaxCode = 'F';
				}
				else
				{
					DocTaxCode = 'T';
				}
				
				if(DocTaxCode == 'T')
				{
					if (AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
					{
						form.addField('custpage_ava_usecodeusuage', 'checkbox', 'Entity/Use Code');
						form.getField('custpage_ava_usecodeusuage').setDisplayType('hidden');
						form.getField('custpage_ava_usecodeusuage').setDefaultValue('F');
					}
					
					form.addField('custpage_ava_exists', 'integer', 'AVA_Exists');
					form.getField('custpage_ava_exists').setDisplayType('hidden');
					form.getField('custpage_ava_exists').setDefaultValue(VerifyCredentials);
					
					form.addField('custpage_ava_lineloc', 'checkbox', 'LineLoc');
					form.getField('custpage_ava_lineloc').setDisplayType('hidden');
					
					if(AVA_TaxInclude == 'F' && form.getField('custbody_ava_taxinclude') != null)
					{
						form.getField('custbody_ava_taxinclude').setDisplayType('hidden');
					}

					// Update custpage_ava_lineloc based on form level fields rather than Preferences
					// Check Line level locations first
					
					if (nlapiGetLineItemField('item','location', 1) != null)
					{
						DocLocation = 'T'; //Line-level locations
						form.getField('custpage_ava_lineloc').setDefaultValue('T');
					}

					if (DocLocation == 'F')
					{
						if (form.getField('location') != null)
						{
							form.getField('custpage_ava_lineloc').setDefaultValue('F');
						}
						else
						{
							form.getField('custpage_ava_lineloc').setDefaultValue('F');
						}
					}

					var recordType = nlapiGetRecordType();
					if((recordType == 'creditmemo' || recordType == 'cashrefund' || recordType == 'returnauthorization') && nlapiGetFieldValue('createdfrom') != null && nlapiGetFieldValue('createdfrom').length > 0)
					{
						var cols = new Array();
						cols[0] = 'trandate';
						cols[1] = 'createdfrom';
						cols[2] = 'type';  
						if(nlapiGetContext().getFeature('accountingperiods') == true && (AVA_UsePostingPeriod == 'T' || AVA_UsePostingPeriod == true))
						{
							cols[3] = 'postingperiod';
						}
						
						var createdFrom = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),cols);
						if(createdFrom['type'] == 'SalesOrd' || createdFrom['type'] == 'RtnAuth')
						{
							var AVA_Flag = 'F';
							var filters = new Array();
							filters[0] = new nlobjSearchFilter('mainline', null, 'is', 'F');
							if(createdFrom['type'] != 'RtnAuth')
							{
								filters[1] = new nlobjSearchFilter('internalid', null, 'anyof', nlapiGetFieldValue('createdfrom'));
							}
							else
							{
								var CreateEffectiveId = nlapiLookupField('transaction', nlapiGetFieldValue('createdfrom'), 'createdfrom');
								if (CreateEffectiveId.length > 0)
								{
									filters[1] = new nlobjSearchFilter('internalid', null, 'anyof', CreateEffectiveId);
								}
								else
								{
									filters[1] = new nlobjSearchFilter('internalid', null, 'anyof', nlapiGetFieldValue('createdfrom'));
								}
							}
							var cols = new Array();
							cols[0]  = new nlobjSearchColumn('applyingtransaction');  
							cols[1]  = new nlobjSearchColumn('type'); 
							cols[2]  = new nlobjSearchColumn('internalid'); 
							cols[3]  = new nlobjSearchColumn('applyinglinktype');
							
							var searchresult = nlapiSearchRecord('transaction', null, filters, cols);
							for (var ii=0; searchresult != null && ii < searchresult.length; ii++)
							{
								if(searchresult[ii].getValue('type') == 'SalesOrd' && searchresult[ii].getValue('applyinglinktype') == 'OrdBill') 
								{
									if(nlapiGetContext().getFeature('accountingperiods') == true && (AVA_UsePostingPeriod == 'T' || AVA_UsePostingPeriod == true))
									{
										var PostDate = nlapiLookupField('transaction',searchresult[ii].getValue('applyingtransaction'),'postingperiod','true');
										var createdDate = PostDate.substring(4, PostDate.length) + '-' + AVA_GetMonthName(PostDate.substring(0, 3)) + '-01';
										createdDate = AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), createdDate);
									}
									else
									{
										var createdDate = nlapiLookupField('transaction', searchresult[ii].getValue('applyingtransaction'), 'trandate');
									}
									AVA_Flag = 'T';
									break;
								}
							}

							if (AVA_Flag == 'F')
							{
								if (createdFrom['createdfrom'] != null && createdFrom['createdfrom'].length > 0)
								{
									if(nlapiGetContext().getFeature('accountingperiods') == true && (AVA_UsePostingPeriod == 'T' || AVA_UsePostingPeriod == true))
									{
										var PostDate = nlapiLookupField('transaction',createdFrom['createdfrom'],'postingperiod','true');
										var createdDate = PostDate.substring(4, PostDate.length) + '-' + AVA_GetMonthName(PostDate.substring(0, 3)) + '-01';
										createdDate = AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), createdDate);
									}
									else
									{
										if(nlapiGetContext().getFeature('accountingperiods') == true && (AVA_UsePostingPeriod == 'T' || AVA_UsePostingPeriod == true))
										{
											var PostDate = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),'postingperiod','true');
											var createdDate = PostDate.substring(4, PostDate.length) + '-' + AVA_GetMonthName(PostDate.substring(0, 3)) + '-01';
											createdDate = AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), createdDate);
										}
										else
										{
											var cols2 = new Array();
											cols2[0] = 'trandate';
											cols2[1] = 'createdfrom';
											var createddate1 = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),cols2);
											var createdDate = nlapiLookupField('transaction',createddate1['createdfrom'],'trandate');
										}
									}
								}
								else
								{
									if(nlapiGetContext().getFeature('accountingperiods') == true && (AVA_UsePostingPeriod == 'T' || AVA_UsePostingPeriod == true))
									{
										var PostDate = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),'postingperiod', 'true');
										var createdDate = PostDate.substring(4, PostDate.length) + '-' + AVA_GetMonthName(PostDate.substring(0, 3)) + '-01';
										createdDate = AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), createdDate);
									}
									else
									{
										var createdDate = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),'trandate');							
									}
								}
							}
						}
						else if(createdFrom['type'] == 'CustInvc' || createdFrom['type'] == 'CashSale')
						{
							if(nlapiGetContext().getFeature('accountingperiods') == true && (AVA_UsePostingPeriod == 'T' || AVA_UsePostingPeriod == true))
							{
								var PostDate = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),'postingperiod', 'true');
								var createdDate = PostDate.substring(4, PostDate.length) + '-' + AVA_GetMonthName(PostDate.substring(0, 3)) + '-01';
								createdDate = AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), createdDate);
							}
							else
							{
								var createdDate = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),'trandate');
							}
						}
						else
						{
							//TODO
							var createdDate = (createdFrom['createdfrom']!=null && createdFrom['createdfrom'].length > 0) ? nlapiLookupField('transaction',createdFrom['createdfrom'],'trandate') : createdFrom['trandate'];  
						}
										
						form.addField('custpage_ava_createfromdate', 'date', 'Created From Date');
						form.getField('custpage_ava_createfromdate').setDisplayType('hidden');
						form.getField('custpage_ava_createfromdate').setDefaultValue(createdDate);
					}
					
					form.addField('custpage_ava_dateformat', 'text', 'Date Format');
					form.getField('custpage_ava_dateformat').setDisplayType('hidden');
					form.getField('custpage_ava_dateformat').setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
					
					var TaxCode = AVA_DefaultTaxCode;
					TaxCode = (TaxCode != null) ? TaxCode.substring(0, TaxCode.lastIndexOf('+')) : '';
		
					form.addField('custpage_ava_deftax', 'text', 'Def Tax');
					form.getField('custpage_ava_deftax').setDisplayType('hidden');
					form.getField('custpage_ava_deftax').setDefaultValue(TaxCode);
					
					form.addField('custpage_ava_deftaxid', 'text', 'Def Tax ID');
					form.getField('custpage_ava_deftaxid').setDisplayType('hidden');
					
					form.addField('custpage_ava_taxcodestatus', 'integer', 'TaxCode Status');
					form.getField('custpage_ava_taxcodestatus').setDisplayType('hidden');
					form.getField('custpage_ava_taxcodestatus').setDefaultValue(0);
					
					form.addField('custpage_ava_headerid', 'integer', 'TaxHeader Id');
					form.getField('custpage_ava_headerid').setDisplayType('hidden');
				
					form.addField('custpage_ava_document', 'checkbox', 'AvaTax Document');
					form.getField('custpage_ava_document').setDisplayType('hidden');
					form.getField('custpage_ava_document').setDefaultValue('F');
					
					BillCostToCust = nlapiGetContext().getSetting('FEATURE', 'billscosts');
					form.addField('custpage_ava_billcost', 'checkbox', 'Bill Cost Feature');
					form.getField('custpage_ava_billcost').setDefaultValue(BillCostToCust);
					form.getField('custpage_ava_billcost').setDisplayType('hidden');
			
					form.addField('custpage_ava_notemsg', 'longtext', 'Note Message');
					form.getField('custpage_ava_notemsg').setDisplayType('hidden');
					
					form.addField('custpage_ava_beforeloadconnector', 'integer', 'BeforeLoad Connector').setDefaultValue(0);
					form.getField('custpage_ava_beforeloadconnector').setDisplayType('hidden');
					
					form.addField('custpage_ava_clientlatency', 'integer', 'Client Latency').setDefaultValue(0);
					form.getField('custpage_ava_clientlatency').setDisplayType('hidden');
					
					form.addField('custpage_ava_clientconnector', 'integer', 'Client Connector').setDefaultValue(0);
					form.getField('custpage_ava_clientconnector').setDisplayType('hidden');
					
					form.addField('custpage_ava_beforesubmitlatency', 'integer', 'BeforeSubmit Latency').setDefaultValue(0);
					form.getField('custpage_ava_beforesubmitlatency').setDisplayType('hidden');
					
					form.addField('custpage_ava_beforesubmitconnector', 'integer', 'BeforeSubmit Connector').setDefaultValue(0);
					form.getField('custpage_ava_beforesubmitconnector').setDisplayType('hidden');
											
					if(nlapiGetContext().getSetting('PREFERENCE', 'CHARGE_FOR_SHIPPING') == 'T' && nlapiGetRecordType() != 'returnauthorization')
					{
						if(form.getField('shipmethod') != null)
						{
							form.addField('custpage_ava_shipping', 'checkbox', 'Shipping Exists');
							form.getField('custpage_ava_shipping').setDefaultValue('T');
							form.getField('custpage_ava_shipping').setDisplayType('hidden');
							
							if(form.getField('taxitem') == null)
							{
								form.addField('custpage_ava_shiptaxcode', 'text', 'Ship Tax Code');
								form.getField('custpage_ava_shiptaxcode').setDisplayType('hidden');
							}
						}
					}
					
					if(nlapiGetContext().getSetting('PREFERENCE', 'CHARGE_FOR_HANDLING') == 'T' && nlapiGetRecordType() != 'returnauthorization')
					{
						if(form.getField('shipmethod') != null)
						{
							form.addField('custpage_ava_handling', 'checkbox', 'Handling Exists');
							form.getField('custpage_ava_handling').setDefaultValue('T');
							form.getField('custpage_ava_handling').setDisplayType('hidden');
							
							if(form.getField('taxitem') == null)
							{
								form.addField('custpage_ava_handlingtaxcode', 'text', 'Handling Tax Code');
								form.getField('custpage_ava_handlingtaxcode').setDisplayType('hidden');
							}
						}
					}
					
					if(BillCostToCust == 'T')
					{
						if(form.getSubList('itemcost') != null || form.getSubList('expcost') != null || form.getSubList('time') != null)
						{
							if(form.getSubList('itemcost') != null)
							{
								//field to check if any of the line in the Billable tabs are selected or not
								//this can avid unnecessary call to Bill cost coding.
								form.addField('custpage_ava_itemcostlinesel','checkbox','ItemCost LineSel');
								form.getField('custpage_ava_itemcostlinesel').setDisplayType('hidden');
							}
							
							if(form.getSubList('expcost') != null)
							{
								//field to check if any of the line in the Billable tabs are selected or not
								//this can avid unnecessary call to Bill cost coding.
								form.addField('custpage_ava_expcostlinesel','checkbox','ExpCost LineSel');
								form.getField('custpage_ava_expcostlinesel').setDisplayType('hidden');
							}
							
							if(form.getSubList('time') != null)
							{
								//field to check if any of the line in the Billable tabs are selected or not
								//this can avid unnecessary call to Bill cost coding.
								form.addField('custpage_ava_timelinesel','checkbox','Time LineSel');
								form.getField('custpage_ava_timelinesel').setDisplayType('hidden');
							}
						}
						else
						{
							form.getField('custpage_ava_billcost').setDefaultValue('F');
							BillCostToCust = 'F';
						}
					}
					
					
					if((type == 'create' || type == 'edit' || type == 'copy'))
					{
						if(form.getField('taxitem') != null)
						{
							form.addField('custpage_ava_formtaxcode', 'text', 'Form Tax Code');
							form.getField('custpage_ava_formtaxcode').setDisplayType('hidden');
						}

						if((AVA_DisableLocationCode == 'F' || AVA_DisableLocationCode == false))
						{
							form.addField('custpage_ava_alllocations', 'longtext', 'All Locations');
							form.getField('custpage_ava_alllocations').setDisplayType('hidden');
							form.getField('custpage_ava_alllocations').setDefaultValue(AVA_GetAllLocations());
						}
						
						if(AVA_ExecutionContext == 'webstore')
						{
							form.addField('custpage_ava_partnerid', 'text', 'Partner ID');
							form.getField('custpage_ava_partnerid').setDisplayType('hidden');
						}
					}
					
					if(AVA_EnableDiscount == 'T' && (type == 'create' || type == 'view' || type == 'edit' || type == 'copy'))
					{
						var AVA_FormDiscountMapping = form.addField('custpage_ava_formdiscountmapping', 'select', 'Discount Mapping', null , 'items');
						AVA_FormDiscountMapping.addSelectOption('0','Gross Amount');
						AVA_FormDiscountMapping.addSelectOption('1','Net Amount');
						
						if(nlapiGetFieldValue('custbody_ava_discountmapping') != null && nlapiGetFieldValue('custbody_ava_discountmapping').length > 0)
						{
							AVA_FormDiscountMapping.setDefaultValue(nlapiGetFieldValue('custbody_ava_discountmapping'));
						}
						else
						{
							AVA_FormDiscountMapping.setDefaultValue(AVA_DiscountMapping);
						}
					}
								
					var AVA_DocType = AVA_RecordType(); 
					if((AVA_CalculateonDemand == 'T' || AVA_CalculateonDemand == true) && (type == 'create' || type == 'edit' || type == 'copy'))
					{
						form.addButton('custpage_ava_calculatetax', 'Calculate Tax', "AVA_CalculateOnDemand()");
					}
			
			
					form.addTab('custpage_avatab', 'AvaTax');
					
					if((AVA_DocType == 'SalesInvoice') || (AVA_DocType == 'ReturnInvoice'))
					{
						form.addField('custpage_ava_docno', 			'text', 	'AvaTax Document Number', 	null, 'custpage_avatab');
						form.getField('custpage_ava_docno').setDisplayType('inline');
						
						form.addField('custpage_ava_docdate', 			'text', 	'Document Date', 			null, 'custpage_avatab');
						form.getField('custpage_ava_docdate').setDisplayType('inline');
						
						form.addField('custpage_ava_docstatus', 		'text', 	'Document Status', 			null, 'custpage_avatab'); 
						form.getField('custpage_ava_docstatus').setDisplayType('inline');
			
						form.addField('custpage_ava_taxdate',			'text',		'Tax Calculation Date', 	null, 'custpage_avatab');
						form.getField('custpage_ava_taxdate').setDisplayType('inline');
						
						form.addField('custpage_ava_totalamount',		'currency', 'Total Amount',				null, 'custpage_avatab');
						form.getField('custpage_ava_totalamount').setDisplayType('inline');
						
						form.addField('custpage_ava_totaldiscount', 	'currency',	'Total Discount', 			null, 'custpage_avatab');
						form.getField('custpage_ava_totaldiscount').setDisplayType('inline');
						
						form.addField('custpage_ava_totalnontaxable', 	'currency', 'Total Non-Taxable', 		null, 'custpage_avatab');
						form.getField('custpage_ava_totalnontaxable').setDisplayType('inline');
						
						form.addField('custpage_ava_totaltaxable',		'currency', 'Total Taxable', 			null, 'custpage_avatab');
						form.getField('custpage_ava_totaltaxable').setDisplayType('inline');
						
						form.addField('custpage_ava_totaltax',			'currency', 'Total Tax', 				null, 'custpage_avatab');
						form.getField('custpage_ava_totaltax').setDisplayType('inline');
						
						if(nlapiGetFieldValue('tax2total') != null)
						{
							form.addField('custpage_ava_gsttax',      'currency', 'GST/HST Tax',        null, 'custpage_avatab');
							form.getField('custpage_ava_gsttax').setDisplayType('inline');
							
							form.addField('custpage_ava_psttax',      'currency', 'PST Tax',        null, 'custpage_avatab');
							form.getField('custpage_ava_psttax').setDisplayType('inline');
						}
										
						var AVA_TotalTax = 0 ;
						if((type == 'edit') || (type == 'view') && nlapiGetRecordId() != null)
						{
							var cols = new Array();
							cols[0]  = new nlobjSearchColumn('custrecord_ava_documentinternalid');	//NetSuite Document Internal Id
							cols[1]  = new nlobjSearchColumn('custrecord_ava_documentid');			//AvaTax Document ID
							cols[2]  = new nlobjSearchColumn('custrecord_ava_documentno');			//NetSuite Document No
							cols[3]  = new nlobjSearchColumn('custrecord_ava_documentdate');		//Transaction Date
							cols[4]  = new nlobjSearchColumn('custrecord_ava_documentstatus');		//AvaTax Document Status
							cols[5]  = new nlobjSearchColumn('custrecord_ava_taxcalculationdate');	//Tax Calculation Date
							cols[6]  = new nlobjSearchColumn('custrecord_ava_totalamount');			//Total Amount
							cols[7]  = new nlobjSearchColumn('custrecord_ava_totaldiscount');		//Total Discount
							cols[8]  = new nlobjSearchColumn('custrecord_ava_totalnontaxable');		//Total Non-Taxable Amount
							cols[9]  = new nlobjSearchColumn('custrecord_ava_totaltaxable');		//Total Taxable
							cols[10] = new nlobjSearchColumn('custrecord_ava_totaltax');			//Total Tax
							cols[11] = new nlobjSearchColumn('custrecord_ava_shipcode');
							cols[12] = new nlobjSearchColumn('custrecord_ava_basecurrency');			//Base Currency
							cols[13] = new nlobjSearchColumn('custrecord_ava_exchangerate');			//Exchange Rate
							cols[14] = new nlobjSearchColumn('custrecord_ava_foreigncurr');			//Shipping Code
							cols[15] = new nlobjSearchColumn('custrecord_ava_gsttax');      //GST/HST
							cols[16] = new nlobjSearchColumn('custrecord_ava_psttax');      //PST
			
							var Multiplier = (AVA_DocType == 'SalesInvoice')? 1 : -1;
							
							var filters = new Array();
							filters[0] = new nlobjSearchFilter('custrecord_ava_documentinternalid', null, 'anyof', nlapiGetRecordId());
							
							var searchresult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, cols);
							var AVA_LineExists = 'F';
							
							for(var i=0; searchresult != null && i < searchresult.length; i++)
							{
								var recordid = searchresult[i].getValue('custrecord_ava_documentinternalid');
								
								if(nlapiGetRecordId() == recordid)
								{
									if(type == 'edit')
									{
										form.getField('custpage_ava_docno').setDefaultValue(searchresult[i].getValue('custrecord_ava_documentinternalid'));
									}
									else
									{
										var URL1 = nlapiResolveURL('SUITELET', 'customscript_avagettaxhistory_suitelet', 'customdeploy_gettaxhistory', false);
										URL1 = URL1 + '&doctype=' + AVA_RecordType() +'&doccode=' + nlapiGetRecordId() + '&rectype=' + nlapiGetRecordType();
		
										var FinalURL = '<a href="' + URL1 + '" target="_blank">' + searchresult[i].getValue('custrecord_ava_documentinternalid') + '</a>';
										form.getField('custpage_ava_docno').setDefaultValue(FinalURL);
									}
										
									form.getField('custpage_ava_docdate').setDefaultValue(searchresult[i].getValue('custrecord_ava_documentdate'));
									form.getField('custpage_ava_docstatus').setDefaultValue(AVA_DocumentStatus(searchresult[i].getValue('custrecord_ava_documentstatus')));
									form.getField('custpage_ava_taxdate').setDefaultValue(searchresult[i].getValue('custrecord_ava_taxcalculationdate'));
									
									var Totalamount = parseFloat(searchresult[i].getValue('custrecord_ava_totalamount'));
									Totalamount = (Totalamount != 0)? Totalamount * Multiplier: Totalamount;
									form.getField('custpage_ava_totalamount').setDefaultValue(Totalamount);
									
									var Totaldiscount = parseFloat(searchresult[i].getValue('custrecord_ava_totaldiscount'));
									Totaldiscount = (Totaldiscount != 0)? Totaldiscount * Multiplier: Totaldiscount;
									form.getField('custpage_ava_totaldiscount').setDefaultValue(Totaldiscount);
					
									var Totalnontaxable = parseFloat(searchresult[i].getValue('custrecord_ava_totalnontaxable'));
									Totalnontaxable = (Totalnontaxable != 0)? Totalnontaxable * Multiplier: Totalnontaxable;
									form.getField('custpage_ava_totalnontaxable').setDefaultValue(Totalnontaxable);
					
									var Totaltaxable = parseFloat(searchresult[i].getValue('custrecord_ava_totaltaxable'));
									Totaltaxable = (Totaltaxable != 0)? Totaltaxable * Multiplier: Totaltaxable;
									form.getField('custpage_ava_totaltaxable').setDefaultValue(Totaltaxable);
									
									var Totaltax = parseFloat(searchresult[i].getValue('custrecord_ava_totaltax'));
									Totaltax = (Totaltax != 0)? Totaltax * Multiplier: Totaltax;
									form.getField('custpage_ava_totaltax').setDefaultValue(Totaltax);
									
									if(nlapiGetFieldValue('tax2total') != null)
									{
										var GSTtax = parseFloat(searchresult[i].getValue('custrecord_ava_gsttax'));
										GSTtax = (GSTtax != null && GSTtax != 0) ? GSTtax * Multiplier : GSTtax;
										form.getField('custpage_ava_gsttax').setDefaultValue(GSTtax);
										
										var PSTtax = parseFloat(searchresult[i].getValue('custrecord_ava_psttax'));
										PSTtax = (PSTtax != null && PSTtax != 0) ? PSTtax * Multiplier : PSTtax;
										form.getField('custpage_ava_psttax').setDefaultValue(PSTtax);
									}
									
									form.getField('custpage_ava_headerid').setDefaultValue(searchresult[i].getId());
									
									AVA_LineExists = 'T';
									break;
								}
							}
							
							
						}
					}
					
					if((type == 'edit') || (type == 'view') && nlapiGetRecordId() != null)
					{
						var AVA_LogSubList = form.addSubList ('custpage_avanotestab', 'staticlist', 'Logs', 'custpage_avatab');
							
						AVA_LogSubList.addField('custpage_ava_datetime','text','Date');
			
						var AVA_AuthorList = AVA_LogSubList.addField('custpage_ava_author','select','Author','employee');
						AVA_AuthorList.setDisplayType('inline');
			
						AVA_LogSubList.addField('custpage_ava_title','text','Title');
						AVA_LogSubList.addField('custpage_ava_memo','textarea','Memo');
						
						var filters = new Array();
						filters[0] = new nlobjSearchFilter('custrecord_ava_transaction',  null, 'is',  nlapiGetRecordId());
						
						var cols = new Array();
						cols[0]  = new nlobjSearchColumn('custrecord_ava_title');
						cols[1]  = new nlobjSearchColumn('custrecord_ava_note');
						cols[2]  = new nlobjSearchColumn('custrecord_ava_creationdatetime');
						cols[3]  = new nlobjSearchColumn('custrecord_ava_author');
						
						var searchResult = nlapiSearchRecord('customrecord_avatransactionlogs', null, filters, cols);
						
						for(var j=0; searchResult != null && j < searchResult.length; j++)
						{
							AVA_LogSubList.setLineItemValue('custpage_ava_datetime', j+1, searchResult[j].getValue('custrecord_ava_creationdatetime'));
							AVA_LogSubList.setLineItemValue('custpage_ava_author', j+1, searchResult[j].getValue('custrecord_ava_author'));
							AVA_LogSubList.setLineItemValue('custpage_ava_title', j+1, searchResult[j].getValue('custrecord_ava_title'));
							
							if(searchResult[j].getValue('custrecord_ava_note').length > 175)
							{           
								var URL1 = nlapiResolveURL('SUITELET', 'customscript_avatransactionlog_suitelet', 'customdeploy_ava_transactionlog', false);
								URL1 = URL1 + '&noteid=' + searchResult[j].getId().toString();
								var FinalURL = '<a href="' + URL1 + '" target="_blank">more...</a>';
							
								AVA_LogSubList.setLineItemValue('custpage_ava_memo', j+1, searchResult[j].getValue('custrecord_ava_note').substring(0, 175) + ' ' + FinalURL);
							}
							else
							{
								AVA_LogSubList.setLineItemValue('custpage_ava_memo', j+1, searchResult[j].getValue('custrecord_ava_note'));
							}
						}
					}

					// If transactions are created from New Menu bar.
					if (type == 'create' && nlapiGetFieldValue('entity') != null && nlapiGetFieldValue('entity').length > 0)
					{
						nlapiSetFieldValue('custpage_ava_taxcodestatus', '1');
						if(AVA_ExecutionContext == 'webstore')
						{
							AVA_GetEntity();
						}

						//Ship-To Address Fields
						if (nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0 && nlapiGetFieldValue('shipaddresslist') > 0 && nlapiGetField('custbody_ava_shiptousecode') != null)
						{
							//Check for Entity/Use Code Values from Config and fetch the Entity/Use Code Mapping if any
							if (AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
							{
								var AVA_ShipToUseCode = AVA_GetEntityUseCodes(nlapiGetFieldValue('shipaddresslist'), '1');
								if (AVA_ShipToUseCode != null && AVA_ShipToUseCode.length > 0)
								{
									nlapiSetFieldText('custbody_ava_shiptousecode', AVA_ShipToUseCode, false);
								}
							}
					
							//Fetch Lat/Long for Ship-To Address List
							var Coordinates = AVA_ReturnCoordinates(nlapiGetFieldValue('entity'), nlapiGetFieldValue('shipaddresslist'));
							if (Coordinates[0] == 1)
							{
								nlapiSetFieldValue('custbody_ava_shipto_latitude', Coordinates[1]);
								nlapiSetFieldValue('custbody_ava_shipto_longitude', Coordinates[2]);
							}
						}
						
						//Bill-To Address Fields
						if (nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0 && nlapiGetFieldValue('billaddresslist') > 0 && nlapiGetField('custbody_ava_billtousecode') != null)
						{
							//Check for Entity/Use Code Values from Config and fetch the Entity/Use Code Mapping if any
							if (AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
							{
								var UseCodeExists = 'F';
								if (nlapiGetFieldValue('shipaddresslist') != null && (nlapiGetFieldValue('shipaddresslist') == nlapiGetFieldValue('billaddresslist')))
								{
									if (nlapiGetFieldValue('custbody_ava_shiptousecode') != null && nlapiGetFieldText('custbody_ava_shiptousecode').length > 0)
									{
										nlapiSetFieldText('custbody_ava_billtousecode', nlapiGetFieldText('custbody_ava_shiptousecode'));
										UseCodeExists = 'T';
									}
								}

								if (UseCodeExists == 'F')
								{
									if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
									{
										var AVA_BillToUseCode = AVA_GetEntityUseCodes(nlapiGetFieldValue('billaddresslist'), '1');
										if (AVA_BillToUseCode != null && AVA_BillToUseCode.length > 0)
										{
											nlapiSetFieldText('custbody_ava_billtousecode', AVA_BillToUseCode);
										}
									}
								}
							}
								
							//Fetch Lat/Long for Bill-To Address List
							if(nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude') != null && nlapiGetFieldValue('custbody_ava_billto_latitude') != null && nlapiGetFieldValue('custbody_ava_billto_longitude') != null)
							{
								var LatLong = 'F';
								if (nlapiGetFieldValue('shipaddresslist') == nlapiGetFieldValue('billaddresslist'))
								{
									if (nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_latitude').length > 0 && nlapiGetFieldValue('custbody_ava_shipto_longitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude').length > 0)
									{
										nlapiSetFieldValue('custbody_ava_billto_latitude', nlapiGetFieldValue('custbody_ava_shipto_latitude'));
										nlapiSetFieldValue('custbody_ava_billto_longitude', nlapiGetFieldValue('custbody_ava_shipto_longitude'));
										LatLong = 'T';
									}
								}
								
								if (LatLong == 'F')
								{
									var Coordinates = AVA_ReturnCoordinates(nlapiGetFieldValue('entity'), nlapiGetFieldValue('billaddresslist'));
									if (Coordinates[0] == 1)
									{
										nlapiSetFieldValue('custbody_ava_billto_latitude', Coordinates[1]);
										nlapiSetFieldValue('custbody_ava_billto_longitude', Coordinates[2]);
									}
								}
							}
						}
						nlapiSetFieldValue('custpage_ava_taxcodestatus', '0');
					}
				}
			}
		}
		
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('AddressSvc') != -1)
		{
			if((AVA_EnableAddValonTran == 'T' || AVA_EnableAddValonTran == true) && (type == 'create' || type == 'edit' || type == 'copy'))
			{
				form.addButton('custpage_ava_validatebillto', 'Validate Bill-To Address', "AVA_ValidateAddress(2)");
				form.addButton('custpage_ava_validateshipto', 'Validate Ship-To Address', "AVA_ValidateAddress(3)");
			}
		}
		
		if(type != 'view' && form.getField('custpage_ava_beforeloadconnector') != null)
		{
			var ConnectorEndTime = new Date();
			var ConnectorTime = ConnectorEndTime.getTime() - ConnectorStartTime.getTime();
			form.getField('custpage_ava_beforeloadconnector').setDefaultValue(ConnectorTime);
		}
	}
}

function AVA_VerifyCredentials()
{ 
	if(nlapiGetContext().getExecutionContext() == 'webstore' && nlapiGetFieldValue('entity') == 0)
	{
		return 1;
	}
	
	var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
	if(searchresult != null)
	{
		for(var i=0; searchresult != null && i < searchresult.length; i++)
		{
			var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[i].getId());
			nlapiSetFieldValue('custpage_ava_readconfig', JSON.stringify(record));
			var AVA_LoadValues = AVA_LoadValuesToGlobals(record);
			break;
		}
		return 0;
	}
	else
	{
		return 1;
	}
}

function AVA_CalculateOnDemand()
{
	nlapiSetFieldValue('custpage_ava_taxcodestatus', '0');
	nlapiSetFieldValue('custpage_ava_notemsg', '');

	if(AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
	{
		nlapiSetFieldValue('custpage_ava_usecodeusuage', 'T');
	}

	if(AVA_RequiredFields() == 0) 
	{
		if(AVA_ItemsTaxLines() != false)
		{
			var CalculateTax = AVA_CalculateTax();
		}
	}	
	else
	{
		if(nlapiGetFieldValue('custpage_ava_context') != 'webstore')
		{
			if (AVA_ShowMessages == 1 || AVA_ShowMessages == 3)
			{
				alert("This Document has not used AvaTax Services for Tax Calculation. " + AVA_ErrorCodeDesc(AVA_ErrorCode));
			}
		}
	}
}

function AVA_TransactionInit(type)
{
	if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
	{
		AVA_LoadValuesFromField();
	}
	
	if(AVA_ServiceTypes != null && AVA_ServiceTypes.length > 0 && AVA_ServiceTypes.search('TaxSvc') != -1)
	{		
		AVA_InitTaxCall = 'T';

		if(type == 'edit' || type == 'create' || type == 'copy')
		{
			if(nlapiGetFieldValue('taxitem') != null)
			{
				nlapiSetFieldValue('custpage_ava_formtaxcode', nlapiGetFieldText('taxitem'));
			}
			else
			{
				if(nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F')))
				{
					nlapiSetFieldValue('custpage_ava_shiptaxcode', nlapiGetFieldText('shippingtaxcode'));
					nlapiSetFieldValue('custpage_ava_handlingtaxcode', nlapiGetFieldText('handlingtaxcode'));
				}
			}

			if(nlapiGetFieldValue('custpage_ava_context') == 'userinterface')
			{
				AVA_EnableDisableLatLongFields();
				AVA_EnableDisableEntityFields();
			}
		}   

		if((type == 'edit') && (nlapiGetFieldValue('custpage_ava_headerid')!=null) && (nlapiGetFieldValue('custpage_ava_headerid').length > 0))
		{
			if(nlapiGetFieldValue('custpage_ava_docstatus') != 'Cancelled' && AVA_MainTaxCodeCheck() == 0)
			{
				var TaxTotal = 0, PSTTotal = 0;
				TaxTotal = parseFloat(nlapiGetFieldValue('custpage_ava_totaltax')); 
				
				if(nlapiGetFieldValue('tax2total') != null)
				{
					TaxTotal = parseFloat(nlapiGetFieldValue('custpage_ava_gsttax'));
					PSTTotal = parseFloat(nlapiGetFieldValue('custpage_ava_psttax'));
					nlapiSetFieldValue('taxamount2override', PSTTotal, true);
					document.forms['main_form'].elements['taxamount2override'].value = format_currency(PSTTotal);  
					setInlineTextValue(document.getElementById('taxamount2override_val'),format_currency(PSTTotal));
				}
				nlapiSetFieldValue('taxamountoverride', TaxTotal, true);
				document.forms['main_form'].elements['taxamountoverride'].value = format_currency(TaxTotal);  
				setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(TaxTotal));
		
				if(nlapiGetRecordType() == 'creditmemo')
				{
					if(nlapiGetFieldValue('autoapply') == 'T')
					{
						AVA_UnApply();
						AVA_CreditAutoApply(TaxTotal, PSTTotal);
					}
					else
					{
						AVA_CreditManualApply(TaxTotal, PSTTotal);
					}
				}
			}
		}
		
		AVA_InitTaxCall = 'F';
	}
	else
	{
		if(AVA_AccountValue != null && AVA_AccountValue.length > 0 && AVA_LicenseKey != null && AVA_LicenseKey.length > 0 && AVA_ServiceTypes != null && AVA_ServiceTypes.length == 0)
		{
			alert("Please re-run the AvaTax configuration at 'AvaTax > Setup > Configure AvaTax' to proceed further with AvaTax services. Please contact the administrator");
		}
	}
}

function AVA_EnableDisableLatLongFields()
{
	if (nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto') == 'T')
	{
		nlapiDisableField('custbody_ava_shipto_latitude', true);
		nlapiDisableField('custbody_ava_shipto_longitude', true);
		
		nlapiDisableLineItemField('item', 'custcol_ava_shipto_latitude', false);
		nlapiDisableLineItemField('item', 'custcol_ava_shipto_longitude', false);
	}
	else
	{
		nlapiDisableField('custbody_ava_shipto_latitude', false);
		nlapiDisableField('custbody_ava_shipto_longitude', false);
		
		nlapiDisableLineItemField('item', 'custcol_ava_shipto_latitude', true);
		nlapiDisableLineItemField('item', 'custcol_ava_shipto_longitude', true);
	}
}

function AVA_EnableDisableEntityFields()
{
	if (AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
	{
		nlapiDisableField('custbody_ava_billtousecode', false);
		if (nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto') == 'T')
		{
			nlapiDisableField('custbody_ava_shiptousecode', true);
			nlapiDisableLineItemField('item', 'custcol_ava_shiptousecode', false);
		}
		else
		{
			nlapiDisableField('custbody_ava_shiptousecode', false);
			nlapiDisableLineItemField('item', 'custcol_ava_shiptousecode', true);
		}
	}
	else
	{
		nlapiDisableField('custbody_ava_shiptousecode', true);
		nlapiDisableField('custbody_ava_billtousecode', true);
		nlapiDisableLineItemField('item', 'custcol_ava_shiptousecode', true);
	}
}

function AVA_MainTaxCodeCheck()
{
	AVA_GetNSLines();	
	
	AVA_GetTaxcodes();
	AVA_LocationPOS = 0;
	
	if((AVA_DisableLocationCode == 'F' || AVA_DisableLocationCode == false))
	{
		AVA_GetLocations();
		if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F' && nlapiGetFieldValue('location') != null && nlapiGetFieldValue('location').length > 0 && nlapiGetFieldValue('custbody_ava_pickup') == 'T')
		{
			AVA_LocationPOS = 1;
		}
	}
	if(AVA_LocationPOS == 0)
	{
		AVA_GetMultiShipAddr();
	}

	var TaxCode = nlapiGetFieldValue('custpage_ava_deftax');  

	if(TaxCode != null && TaxCode.length == 0)
	{
		AVA_ErrorCode = 17;
		return 1;
	}

	if (nlapiGetField('taxitem') != null) 
	{
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == null)
		{
			AVA_ErrorCode = 5;
			return 1;
		}

		if(nlapiGetFieldValue('custpage_ava_formtaxcode') != '-Not Taxable-') 
		{   
			if ((nlapiGetFieldValue('istaxable') == 'T' || nlapiGetFieldValue('istaxable') == 'Yes') || (nlapiGetFieldValue('custpage_ava_formtaxcode') != null && nlapiGetFieldValue('custpage_ava_formtaxcode').length > 0))
			{
				if((nlapiGetFieldValue('custpage_ava_formtaxcode').substring(0, TaxCode.length) != TaxCode))  
				{
					AVA_ErrorCode = 6;
					return 1; 
				}
			}
		
			if ((nlapiGetFieldValue('istaxable') == null || nlapiGetFieldValue('istaxable') == '' || (nlapiGetFieldValue('istaxable') != null && nlapiGetFieldValue('istaxable').length <= 0) || nlapiGetFieldValue('istaxable') == 'F' || nlapiGetFieldValue('istaxable') == 'No') && ((nlapiGetFieldValue('custpage_ava_formtaxcode') != null && nlapiGetFieldValue('custpage_ava_formtaxcode').length > 0 && nlapiGetFieldValue('custpage_ava_formtaxcode').substring(0, TaxCode.length) != TaxCode) || (nlapiGetFieldValue('custpage_ava_formtaxcode') != null && nlapiGetFieldValue('custpage_ava_formtaxcode').length <= 0)))
			{
				AVA_ErrorCode = 6;
				return 1;
			}
		}
		
		if(nlapiGetFieldValue('custpage_ava_shipping') != 'T' && nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0)
		{
			AVA_ErrorCode = 10;
			return 1;
		}
		
		if(nlapiGetFieldValue('custpage_ava_handling') != 'T' && nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0)
		{
			AVA_ErrorCode = 11;
			return 1;
		}
	}
	else
	{
		var AVA_Lines = 'F', LineTaxCode;
		
		for(var line = 0 ; AVA_NS_Lines != null && line < AVA_NS_Lines.length ; line++)
		{
			LineTaxCode = AVA_TaxcodeArray[line];
			var linetype = nlapiGetLineItemValue('item','itemtype',line+1);
			if(LineTaxCode != '-Not Taxable-' && !(linetype == 'Description' || linetype == 'Subtotal' || linetype == 'Group' || linetype == 'EndGroup')) 
			{
				if(LineTaxCode != null && LineTaxCode.length > 0)
				{
					if((LineTaxCode.substring(0, TaxCode.length) != TaxCode))
					{
						AVA_Lines = 'T';
						break;
					}
				}
				else
				{
					AVA_Lines = 'T';
					break;
				}
			}
		}
		
		if(AVA_Lines == 'T')
		{
			AVA_ErrorCode = 9;
			return 1;
		}

		// Check for Billable Discount Taxcodes
		if(nlapiGetFieldValue('custpage_ava_billcost') == 'T')
		{
			if(BillItemFlag == 'T') // If Billable Item tab have atleast one item selected
			{
				LineTaxCode = null;
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') != 0)
				{
					if(nlapiGetFieldValue('itemcosttaxcode') != null && nlapiGetFieldValue('itemcosttaxcode').length > 0)
					{
						LineTaxCode = nlapiLookupField('salestaxitem', nlapiGetFieldValue('itemcosttaxcode'),'itemid');
						if(LineTaxCode == null)
						{
							LineTaxCode = nlapiLookupField('taxgroup', nlapiGetFieldValue('itemcosttaxcode'),'itemid');								
						}
					}
				}
				else
				{
					LineTaxCode = nlapiGetFieldText('itemcosttaxcode');
				}
				
				if(LineTaxCode != null && LineTaxCode.length > 0 && LineTaxCode != '-Not Taxable-' && LineTaxCode.substring(0, TaxCode.length) != TaxCode) 
				{
					AVA_ErrorCode = 20;
					return 1;
				}				
			}

			if(BillExpFlag == 'T') // If Billable Expense tab have atleast one item selected
			{
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') != 0)
				{
					LineTaxCode = null;
					if(nlapiGetFieldValue('expcosttaxcode') != null && nlapiGetFieldValue('expcosttaxcode').length > 0)
					{
						LineTaxCode = nlapiLookupField('salestaxitem', nlapiGetFieldValue('expcosttaxcode'),'itemid');
						if(LineTaxCode == null)
						{
							LineTaxCode = nlapiLookupField('taxgroup', nlapiGetFieldValue('expcosttaxcode'),'itemid');								
						}
					}
				}
				else
				{
					LineTaxCode = nlapiGetFieldText('expcosttaxcode');
				}
				
				if(LineTaxCode != null && LineTaxCode.length > 0 && LineTaxCode != '-Not Taxable-' && LineTaxCode.substring(0, TaxCode.length) != TaxCode) 
				{
					AVA_ErrorCode = 21;
					return 1;
				}				
			}
			
			if(BillTimeFlag == 'T') // If Billable Time tab have atleast one item selected
			{				
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') != 0)
				{
					LineTaxCode = null;
					if(nlapiGetFieldValue('timetaxcode') != null && nlapiGetFieldValue('timetaxcode').length > 0)
					{
						LineTaxCode = nlapiLookupField('salestaxitem', nlapiGetFieldValue('timetaxcode'),'itemid');
						if(LineTaxCode == null)
						{
							LineTaxCode = nlapiLookupField('taxgroup', nlapiGetFieldValue('timetaxcode'),'itemid');								
						}
					}
				}
				else
				{
					LineTaxCode = nlapiGetFieldText('timetaxcode');
				}
				
				if(LineTaxCode != null && LineTaxCode.length > 0 && LineTaxCode != '-Not Taxable-' && LineTaxCode.substring(0, TaxCode.length) != TaxCode) 
				{
					AVA_ErrorCode = 22;
					return 1;
				}				
			}
		}
			
		if(nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F')))
		{		
			/* 2. Check for Shipping Tax Code equals 'AVATAX' */
			if(nlapiGetFieldValue('custpage_ava_shipping') == 'T' && nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0)
			{
				var ShipTaxCode = nlapiGetFieldValue('custpage_ava_shiptaxcode');
				var ShipTaxRate = nlapiGetFieldValue('shippingtax1rate');
				
				if(ShipTaxCode != '-Not Taxable-')
				{
					if((ShipTaxCode == null) || (ShipTaxCode.substring(0, TaxCode.length) != TaxCode))
					{
						AVA_ErrorCode = 10;
						return 1;
					}
				}
			}
			else if(nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0)
			{
				//If Ship method is not selected and amount is greater than 0 and ( taxcode is missing or not missing )then should we restrict the call
				AVA_ErrorCode = 10;
				return 1;
			}
			
			/* 3. Check for Handling Tax Code equals 'AVATAX' */
			if(nlapiGetFieldValue('custpage_ava_handling') == 'T' && nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0)
			{
				var HandlingTaxCode = nlapiGetFieldValue('custpage_ava_handlingtaxcode');
				var HandlingTaxRate = nlapiGetFieldValue('handlingtax1rate');
				if(HandlingTaxCode != '-Not Taxable-')
				{
					if((HandlingTaxCode == null) || (HandlingTaxCode.substring(0, TaxCode.length) != TaxCode))
					{
						AVA_ErrorCode = 11;
						return 1;
					}
				}
			}
			else if(nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0)
			{
				//If Ship method is not selected and handling amount is greater than 0 and ( taxcode is missing or not missing )then should we restrict the call
				AVA_ErrorCode = 11;
				return 1;
			}
		}
	}
	return 0;
}

function AVA_RecalculateLine(type)
{
	try
	{
		AVA_FieldChangeTaxCall = 'F'; 
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
		{
			if(type == 'item' && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
			{
				if((AVA_DisableLine == 'F' || AVA_DisableLine == false) && nlapiGetCurrentLineItemValue('item','itemtype') == 'Group')
				{
					//using this flag to avoid declaration of a new variable for this ITem Group blocking issue
					//This will avoid the first call out of two while adding the Group item.
					AVA_FieldChangeTaxCall = 'F';
				}
				else
				{
					AVA_FieldChangeTaxCall = 'T';
				}

				if((nlapiGetFieldValue('custpage_ava_exists') == 0) && (AVA_DisableLine == 'F' || AVA_DisableLine == false) && (AVA_InitTaxCall == 'F') && (AVA_FieldChangeTaxCall != 'F'))
				{
					nlapiSetFieldValue('custpage_ava_taxcodestatus', '0');
					if(AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
					{
						nlapiSetFieldValue('custpage_ava_usecodeusuage', 'T');
					}

					if(AVA_RequiredFields() == 0) 
					{
						if(AVA_ItemsTaxLines() != false) 
						{
							var CalculateTax = AVA_CalculateTax();
							return CalculateTax;
						}
						else
						{
							if (AVA_ShowMessages == 1 || AVA_ShowMessages == 3)
							{
								alert("This Document has not used AvaTax Services. " + AVA_ErrorCodeDesc(AVA_ErrorCode));
							}
							return true;
						}
					}
					else
					{
						if (AVA_ShowMessages == 1 || AVA_ShowMessages == 3)
						{
							alert("This Document has not used AvaTax Services. " + AVA_ErrorCodeDesc(AVA_ErrorCode));
						}
						return true;
					}
				}
				AVA_FieldChangeTaxCall = 'T';
			}
			else if(type == 'itemcost' || type == 'expcost' || type == 'time')
			{
				if(nlapiGetCurrentLineItemValue(type,'apply') == 'T')
				{
					if((nlapiGetFieldValue('custpage_ava_exists') == 0) && (AVA_DisableLine == 'F' || AVA_DisableLine == false) && (AVA_InitTaxCall == 'F') && (AVA_FieldChangeTaxCall != 'F'))
					{
						nlapiSetFieldValue('custpage_ava_taxcodestatus', '0');
						if(AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
						{
							nlapiSetFieldValue('custpage_ava_usecodeusuage', 'T');
						}

						if(AVA_RequiredFields() == 0) 
						{
							if(AVA_ItemsTaxLines() != false) 
							{
								var CalculateTax = AVA_CalculateTax();
								return CalculateTax;
							}
							else
							{
								return true;
							}
						}
						else
						{
							if (AVA_ShowMessages == 1 || AVA_ShowMessages == 3)
							{
								alert("This Document has not used AvaTax Services. " + AVA_ErrorCodeDesc(AVA_ErrorCode));
							}
							return true;
						}
					}
				}
				AVA_FieldChangeTaxCall = 'T';
			}
			else if(type == 'apply')
			{
				var TaxTotal = parseFloat(nlapiGetFieldValue('taxamountoverride')); 
				var PSTTotal = parseFloat(nlapiGetFieldValue('taxamount2override'));
		
				AVA_CreditManualApply(TaxTotal, PSTTotal);
				
				nlapiSetFieldValue('taxamountoverride', TaxTotal, true);
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
				{
					document.forms['main_form'].elements['taxamountoverride'].value = format_currency(TaxTotal);  
					setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(TaxTotal)); 
				}
				
				if(nlapiGetFieldValue('tax2total') != null)
				{
					nlapiSetFieldValue('taxamount2override', PSTTotal, true);
					if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
					{
						document.forms['main_form'].elements['taxamount2override'].value = format_currency(PSTTotal);  
						setInlineTextValue(document.getElementById('taxamount2override_val'),format_currency(PSTTotal)); 
					}
				}	
				
				return true;
			}	
			
			if(type == 'item' && nlapiGetFieldValue('custpage_ava_context') == 'webstore')
			{
				AVA_CalculateOnDemand();
			}	
		}	
	}
	catch(err)
	{
		nlapiLogExecution('DEBUG', 'AVA_RecalculateLine - Error', err.message);
	}
}

function AVA_ErrorCodeDesc(error)
{
	var ErrorText;
	switch(error)
	{
		case 1: 
				ErrorText = 'AvaTax Calculation is disabled in Configuration Settings.';
				break;
		case 2: 
				ErrorText = 'No Line Item added.';
				break;
		case 3: 
				ErrorText = 'No Customer selected.';
				break;
		case 4: 
				ErrorText = 'Transaction Date Missing.';
				break;
		case 5: 
				ErrorText = 'Taxcode missing at Header Level.';
				break;  
		case 6: 
				ErrorText = 'Taxcode selected is not an AVATAX Taxcode.';
				break;
		case 7: 
				ErrorText = 'Location selected at Header is not a United States or Canadian Location.';
				break;    
		case 8: 
				ErrorText = 'Location selected for one of the Line Items is not a United States or Canadian Location.';
				break;    
		case 9: 
				ErrorText = 'Taxcode is not set to AVATAX or the Tax rates are not equal to zero for all the line items.';
				break;        
		case 10: 
				ErrorText = 'Ship Method not selected, Shipping Taxcode is not an AVATAX Taxcode or the Shipping Tax rate is not equal to zero.';
				break;          
		case 11: 
				ErrorText = 'Ship Method not selected, Handling Taxcode is not set to AVATAX or the Handling Tax rate is not equal to zero.';
				break;          
		case 12: 
				//ErrorText = 'Billing Address/Shipping Address is Missing.';
				ErrorText = 'Shipping/Billing Address or Latitude & Longitude co-ordinates are missing.';
				break;      
		case 13: 
				ErrorText = 'Billing Address is Missing.';
				break;  
		case 14: 
				ErrorText = 'Invalid Billing or Shipping Address.';
				break;    
		case 15: 
				ErrorText = 'None of the items selected is an Inventory, Non-inventory or Download Item.';
				break;  
//		case 16:
//				ErrorText = 'Subsidiary Custom Record is not existing';
//				break;  
		case 17:
				ErrorText = 'Default Taxcode not assigned in the Configurations settings.';
				break;
		case 18:
				ErrorText = 'Item Description missing for the item(s).';
				break;
		case 19:
				ErrorText = 'AvaTax Production credentials cannot be used in test environment(s). Transaction was not posted.';
				break;  
		case 20:
				ErrorText = 'Billable Item\'s Discount Taxcode is not set to an AVATAX Taxcode.';
				break;   
		case 21:
				ErrorText = 'Billable Expenses Discount Taxcode is not set to an AVATAX Taxcode.';
				break;
		case 22:
				ErrorText = 'Billable Time Discount Taxcode is not set to an AVATAX Taxcode.';
				break; 		
		
		case 23:
				ErrorText = 'Invalid DocType for AvaTax services.';
				break;		

		case 24:
			ErrorText = "Invalid value set for CustomerCode in AVACONFIG customrecord.";
			break;

		default: 
				ErrorText = error;        
				break;
	}
	
	return ErrorText;
}


function AVA_RequiredFields()
{
	// 1. Check if AvaTax is enabled
	if(AVA_DisableTax == 'T' || AVA_DisableTax == true)
	{
		AVA_ErrorCode = 1;
		return 1;
	}

	// 2. Check if the Environment is correct
	if(nlapiGetFieldValue('custpage_ava_environment') != 'PRODUCTION' && AVA_ServiceUrl.search('development') == -1)
	{
		AVA_ErrorCode = 19;
		return 1;
	}

	// 3. Check if Lines exist
	if(nlapiGetFieldValue('custpage_ava_context') == 'webstore')
	{
		if(nlapiGetLineItemCount('item') <= 0)
		{
			AVA_ErrorCode = 2;			
			return 1;
		}
	}
	else if(nlapiGetFieldValue('haslines') == 'F')
	{
		AVA_ErrorCode = 2;
		return 1;
	}

	// 4. Check for Customers
	if(nlapiGetFieldValue('custpage_ava_context') == 'webstore')
	{
		if (nlapiGetFieldValue('entity') <= 0)
		{
			AVA_ErrorCode = 3;
			return 1;
		}
	}
	else
	{
		if (nlapiGetFieldValue('entity').length == 0)
		{
			AVA_ErrorCode = 3;
			return 1;
		}
	}

	// 4.1 Check for CustomerCode in AVACONFIG record
	if (AVA_CustomerCode != null && AVA_CustomerCode > 7)
	{
		AVA_ErrorCode = 24;
		return 1;
	}
	
	// 5. Check for Date
	if (nlapiGetFieldValue('trandate').length == 0)
	{
		AVA_ErrorCode = 4;
		return 1;
	}

	// 6. Check if Taxable at Header Level or at Line level
	var CheckTax = AVA_MainTaxCodeCheck();
	if(CheckTax == 1)
	{
		return 1;
	}
	
	// 7. Check for Ship to
	if(AVA_LocationPOS == 0)
	{
		if(nlapiGetField('taxitem') != null)
		{
			var TaxCode = nlapiGetFieldValue('custpage_ava_formtaxcode');
			TaxCode = (TaxCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode != null && AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : TaxCode;
			if(TaxCode != null && TaxCode.substr((TaxCode.length - 3), 3) != 'POS')
			{
				var AddressList = AVA_GetDestinationAddress();
				//var AddressResult = (AddressList == 1) ? 1 : ((AddressList[7] == null) ? 1 : 0);
				var AddressResult = (AddressList == 1) ? 1 : ((AddressList == 0) ? 0 : (AddressList[7] == null) ? 1 : 0);
				if(AddressResult == 1)
				{
					AVA_ErrorCode = (AddressList == 1) ? AVA_ErrorCode : 14;
					return 1;
				}
			}
		}
		else
		{
			if(nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F')))
			{			
				for(var line = 0 ; AVA_NS_Lines != null && line < AVA_NS_Lines.length ; line++)
				{			
					var TaxCode = AVA_TaxcodeArray[line];  
					TaxCode = (TaxCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode != null && AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : TaxCode;
		
					if(TaxCode != null && TaxCode.substr((TaxCode.length - 3), 3) != 'POS')
					{
						var AddressList = AVA_GetDestinationAddress();					
						//var AddressResult = (AddressList == 1) ? 1 : ((AddressList[7] == null) ? 1 : 0);
						var AddressResult = (AddressList == 1) ? 1 : ((AddressList == 0) ? 0 : (AddressList[7] == null) ? 1 : 0);
						if(AddressResult == 1)
						{
							AVA_ErrorCode = (AddressList == 1) ? AVA_ErrorCode : 14;
							return 1;
						}
					}
				}		

				if(nlapiGetFieldValue('shippingtaxcode') != null && nlapiGetFieldValue('shippingcost') != null && nlapiGetFieldValue('shippingcost') > 0)
				{
					var TaxCode = nlapiGetFieldValue('custpage_ava_shiptaxcode');
					TaxCode = (TaxCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : TaxCode;
		
					if(TaxCode.substr((TaxCode.length - 3), 3) != 'POS')
					{
						var AddressList = AVA_GetDestinationAddress();
						var AddressResult = (AddressList == 1) ? 1 : ((AddressList[7] == null) ? 1 : 0);
						if(AddressResult == 1)
						{
							AVA_ErrorCode = (AddressList == 1) ? AVA_ErrorCode : 14;
							return 1;
						}
					}
				}
					
				if(nlapiGetFieldValue('handlingtaxcode') != null && nlapiGetFieldValue('handlingcost') != null && nlapiGetFieldValue('handlingcost') > 0)
				{ 
					var TaxCode = nlapiGetFieldValue('custpage_ava_handlingtaxcode');
					TaxCode = (TaxCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : TaxCode;
		
					if(TaxCode.substr((TaxCode.length - 3), 3) != 'POS')
					{
						var AddressList = AVA_GetDestinationAddress();
						var AddressResult = (AddressList == 1) ? 1 : ((AddressList[7] == null) ? 1 : 0);
						if(AddressResult == 1)
						{
							AVA_ErrorCode = (AddressList == 1) ? AVA_ErrorCode : 14;
							return 1;
						}
					}
				}
			}
			else if(nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto') == 'T')
			{
				// This will check ship addresses of Item lines as well as Ship Groups.
				for(var AddrIndex = 0; AVA_MultiShipAddArray != null && AddrIndex < AVA_MultiShipAddArray.length ; AddrIndex++)
				{
					var AddressList = AVA_MultiShipAddArray[AddrIndex][1];				
					if(AddressList == null || (AddressList != null && AddressList.length <= 0))
					{
						AddressList = AVA_GetDestinationAddress();	
					}
					//var AddressResult = (AddressList == 1) ? 1 : ((AddressList[7] == null) ? 1 : 0);
					var AddressResult = (AddressList == 1) ? 1 : ((AddressList.length > 0) ? 0 :(AddressList[7] == null) ? 1 : 0);
					if(AddressResult == 1)
					{
						AVA_ErrorCode = (AddressList == 1) ? AVA_ErrorCode : 14;
						return 1;
					}
				}
			}
		}	
	}

	// 8. Check if Inventory Items Type exist
	var ItemsExist = 'F';
	for(var i =0; i< nlapiGetLineItemCount('item'); i++)
	{
		var LineType = nlapiGetLineItemValue('item','itemtype',i+1);
		switch(LineType)
		{
			case 'Discount':
			case 'Markup':
			case 'Description':
			case 'Subtotal':
			case 'Group':
			case 'EndGroup':
				break;

			default:
				ItemsExist = 'T';
				/*if((nlapiGetLineItemValue('item','description',i+1) == null || nlapiGetLineItemValue('item','description',i+1).length <= 0) && (AVA_ShowMessages == 1 || AVA_ShowMessages == 3))
				{
					alert('Item Description missing for Item: ' + nlapiGetLineItemValue('item','custcol_ava_item', i+1) + ' at line ' + parseInt(i+1));
//					No more restricting the tax call when Item Description is missing. Just alerting the user.					
//					AVA_ErrorCode = 18;
//					return 1;
				}*/
				break;
		}
	}
	
	if(ItemsExist == 'F' && BillItemFlag == 'F' && BillExpFlag == 'F' && BillTimeFlag == 'F')
	{		
		AVA_ErrorCode = 15;
		return 1;
	}
	
	// 9. Check if AVA_RecordType value is not '0'
	if(nlapiGetFieldValue('custpage_ava_context') != 'webstore' && AVA_RecordType() == 0)
	{
		AVA_ErrorCode = 23;
		return 1;
	}
	
	return 0;
}

function AVA_EvaluateTranAbort()
{
	var AVA_AbortSave = 'F';
	
	switch(nlapiGetFieldValue('custpage_ava_context'))
	{
		case 'userevent':
			AVA_AbortSave = ((AVA_AbortBulkBilling == 'T' || AVA_AbortBulkBilling == true) ? 'T' : 'F');
			break;

		case 'userinterface':
			AVA_AbortSave = ((AVA_AbortUserInterfaces == 'T' || AVA_AbortUserInterfaces == true)? 'T' : 'F');
			break;

		case 'webservices':
			AVA_AbortSave = ((AVA_AbortWebServices == 'T' || AVA_AbortWebServices == true) ? 'T' : 'F');
			break;

		case 'csvimport':
			AVA_AbortSave = ((AVA_AbortCSVImports == 'T' || AVA_AbortCSVImports == true ) ?'T' : 'F');
			break;

		case 'scheduled':
			AVA_AbortSave = ((AVA_AbortScheduledScripts == 'T' || AVA_AbortScheduledScripts == true) ? 'T' : 'F');
			break;

		case 'suitelet':
			AVA_AbortSave = ((AVA_AbortSuitelets == 'T' || AVA_AbortSuitelets == true)? 'T' : 'F');
			break;

		default:
			break;
	}

	return AVA_AbortSave;
}

function AVA_GetMultiShipAddr()
{
	var ArrIndex = 0;
	if(nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto') == 'T')
	{
		AVA_MultiShipAddArray = new Array();
		for(var line = 0 ; AVA_NS_Lines != null && line < AVA_NS_Lines.length ; line++)
		{
			if(AVA_NS_Lines[line][0] == 'item')
			{				
				var TaxCode = AVA_TaxcodeArray[line];  
				TaxCode = (TaxCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : TaxCode;
				if(TaxCode != null && TaxCode.substr((TaxCode.length - 3), 3) != 'POS')
				{
					var AddrExist = 'F';
					if(line != 0)
					{
						//Check if address is already used..
						for(var m=0; m < AVA_MultiShipAddArray.length ; m++)
						{
							if(nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]) == AVA_MultiShipAddArray[m][0])
							{
								AddrExist = 'T';
								break;
							}
							//TODO: try reading the lat/long co-ordinates
						}
					}
					
					if(AddrExist == 'F')
					{
						ArrIndex = (AVA_MultiShipAddArray != null && AVA_MultiShipAddArray.length > 0) ? AVA_MultiShipAddArray.length : ArrIndex;												
						AVA_MultiShipAddArray[ArrIndex] = new Array();
						if(nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]).length > 0)
						{
							//if ship-to field selected at line level
							AVA_MultiShipAddArray[ArrIndex] = new Array();
							AVA_MultiShipAddArray[ArrIndex][0] = nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]);
							AVA_MultiShipAddArray[ArrIndex][1] = new Array();
							
							for(var k=0; k < nlapiGetLineItemCount('iladdrbook') ; k++)
							{
								if(nlapiGetLineItemValue('item', 'shipaddress', AVA_NS_Lines[line][1]) == nlapiGetLineItemValue('iladdrbook', 'iladdrinternalid', k+1))
								{
									AVA_MultiShipAddArray[ArrIndex][1][0] = 'Ship-To Address - ' + nlapiGetLineItemValue('iladdrbook', 'iladdrinternalid', k+1);
									AVA_MultiShipAddArray[ArrIndex][1][1] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr1', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr1', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr1', k+1).substring(0,50) : '';
									AVA_MultiShipAddArray[ArrIndex][1][2] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr2', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr2', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr2', k+1).substring(0,50) : '';
									AVA_MultiShipAddArray[ArrIndex][1][3] = '';
									AVA_MultiShipAddArray[ArrIndex][1][4] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipcity', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipcity', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipcity', k+1).substring(0,50) : '';
									AVA_MultiShipAddArray[ArrIndex][1][5] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipstate', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipstate', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipstate', k+1).substring(0,50) : '';
									AVA_MultiShipAddArray[ArrIndex][1][6] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipzip', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipzip', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipzip', k+1).substring(0,50) : '';
									AVA_MultiShipAddArray[ArrIndex][1][7] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipcountry', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipcountry', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipcountry', k+1).substring(0,50) : '';
									AVA_MultiShipAddArray[ArrIndex][1][8] = (nlapiGetLineItemValue('item', 'custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item', 'custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]).length > 0) ? nlapiGetLineItemValue('item', 'custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]) : '';
									AVA_MultiShipAddArray[ArrIndex][1][9] = (nlapiGetLineItemValue('item', 'custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item', 'custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]).length > 0) ? nlapiGetLineItemValue('item', 'custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]) : '';
									ArrIndex++;
									break;
								}
							}	
						}
						else
						{
							var LatLong = 'F';
							if (nlapiGetLineItemValue('item', 'custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue('item', 'custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]).length > 0)
							{
								AVA_MultiShipAddArray[ArrIndex][0] = 'Ship-To Lat/Long-' + AVA_NS_Lines[line][1];
								AVA_MultiShipAddArray[ArrIndex][1] = new Array();
								AVA_MultiShipAddArray[ArrIndex][1][0] = 'Ship-To Lat/Long-' + AVA_NS_Lines[line][1];
								AVA_MultiShipAddArray[ArrIndex][1][1] = nlapiGetLineItemValue('item', 'custcol_ava_shipto_latitude', AVA_NS_Lines[line][1]);
								AVA_MultiShipAddArray[ArrIndex][1][2] = nlapiGetLineItemValue('item', 'custcol_ava_shipto_longitude', AVA_NS_Lines[line][1]);
								LatLong = 'T';
							}
							
							if(LatLong == 'F')
							{
								//no ship-to selected at line level
								if(nlapiGetFieldValue('shipaddress') != null && nlapiGetFieldValue('shipaddress').length > 0 && nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0)
								{
									AVA_MultiShipAddArray[ArrIndex][0] = nlapiGetFieldValue('shipaddress');
									AVA_MultiShipAddArray[ArrIndex][1] = new Array();
									AVA_MultiShipAddArray[ArrIndex][1] = AVA_GetAddresses(1, 1);
								}
								else
								{
									if (nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_latitude').length > 0 && nlapiGetFieldValue('custbody_ava_shipto_longitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude').length > 0)
									{
										AVA_MultiShipAddArray[ArrIndex][0] = 'Header Ship-To Lat/Long';
										AVA_MultiShipAddArray[ArrIndex][1] = new Array();
										AVA_MultiShipAddArray[ArrIndex][1][0] = 'Header Ship-To Lat/Long';
										AVA_MultiShipAddArray[ArrIndex][1][1] = nlapiGetFieldValue('custbody_ava_shipto_latitude');
										AVA_MultiShipAddArray[ArrIndex][1][2] = nlapiGetFieldValue('custbody_ava_shipto_longitude');
									}
									else if(nlapiGetFieldValue('billaddress') != null && nlapiGetFieldValue('billaddress').length > 0 && nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
									{
										AVA_MultiShipAddArray[ArrIndex][0] = nlapiGetFieldValue('billaddress');
										AVA_MultiShipAddArray[ArrIndex][1] = new Array();
										AVA_MultiShipAddArray[ArrIndex][1] = AVA_GetAddresses(2, 1);
									}
									else if (nlapiGetFieldValue('custbody_ava_billto_latitude') != null && nlapiGetFieldValue('custbody_ava_billto_latitude').length > 0 && nlapiGetFieldValue('custbody_ava_billto_longitude') != null && nlapiGetFieldValue('custbody_ava_billto_longitude').length > 0)
									{
										AVA_MultiShipAddArray[ArrIndex][0] = 'Header Bill-To Lat/Long';
										AVA_MultiShipAddArray[ArrIndex][1] = new Array();
										AVA_MultiShipAddArray[ArrIndex][1][0] = 'Header Bill-To Lat/Long';
										AVA_MultiShipAddArray[ArrIndex][1][1] = nlapiGetFieldValue('custbody_ava_billto_latitude');
										AVA_MultiShipAddArray[ArrIndex][1][2] = nlapiGetFieldValue('custbody_ava_billto_longitude');
									}
								}
							}
						}		
					}
				}
			}
		}
		
		for(var ship = 0 ; AVA_ShipGroupTaxcodes != null && ship < AVA_ShipGroupTaxcodes.length ; ship++)
		{
			var AmtField = (AVA_ShipGroupTaxcodes[ship][3] == 'FREIGHT') ? 'shippingrate' : 'handlingrate';		
			
			var TaxCode = AVA_ShipGroupTaxcodes[ship][2];  
			TaxCode = (TaxCode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : TaxCode;
			
			if(nlapiGetLineItemValue('shipgroup', AmtField, AVA_ShipGroupTaxcodes[ship][0]) > 0 && TaxCode != null && TaxCode.substr((TaxCode.length - 3), 3) != 'POS')
			{						
				var AddrExist = 'F';
				
				var shipAddId = nlapiGetLineItemValue('shipgroup', 'destinationaddressref', AVA_ShipGroupTaxcodes[ship][0]);
				
				if(shipAddId == null || shipAddId.length <= 0)
				{
					shipAddId = (nlapiGetFieldValue('shipaddress') != null && nlapiGetFieldValue('shipaddress').length > 0) ? nlapiGetFieldValue('shipaddress') : nlapiGetFieldValue('billaddress');
				}
													
				if(line != 0)
				{
					for(var m=0; m < AVA_MultiShipAddArray.length ; m++)
					{
						if(shipAddId == AVA_MultiShipAddArray[m][0])
						{
							AddrExist = 'T';
							break;
						}
					}
				}
				
				if(AddrExist == 'F')
				{
					ArrIndex = (AVA_MultiShipAddArray != null && AVA_MultiShipAddArray.length > 0) ? AVA_MultiShipAddArray.length : ArrIndex;
					
					AVA_MultiShipAddArray[ArrIndex] = new Array();
					
					if(nlapiGetLineItemValue('shipgroup', 'destinationaddressref', AVA_ShipGroupTaxcodes[ship][0]) == null || nlapiGetLineItemValue('shipgroup', 'destinationaddressref', AVA_ShipGroupTaxcodes[ship][0]).length <= 0)
					{
						if(nlapiGetFieldValue('shipaddress') != null && nlapiGetFieldValue('shipaddress').length > 0)
						{
							AVA_MultiShipAddArray[ArrIndex][0] = nlapiGetFieldValue('shipaddress');
							AVA_MultiShipAddArray[ArrIndex][1] = new Array();
							AVA_MultiShipAddArray[ArrIndex][1] = AVA_GetAddresses(1, 1);
						}
						else
						{
							AVA_MultiShipAddArray[ArrIndex][0] = nlapiGetFieldValue('billaddress');
							AVA_MultiShipAddArray[ArrIndex][1] = new Array();
							AVA_MultiShipAddArray[ArrIndex][1] = AVA_GetAddresses(2, 1);
						}
					}
					else
					{						
						AVA_MultiShipAddArray[ArrIndex][0] = shipAddId;
						AVA_MultiShipAddArray[ArrIndex][1] = new Array();
						
						for(var k=0; k < nlapiGetLineItemCount('iladdrbook') ; k++)
						{
							if(shipAddId == nlapiGetLineItemValue('iladdrbook', 'iladdrinternalid', k+1))
							{
								AVA_MultiShipAddArray[ArrIndex][1][0] = 'Ship-To Address - ' + nlapiGetLineItemValue('iladdrbook', 'iladdrinternalid', k+1);
								AVA_MultiShipAddArray[ArrIndex][1][1] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr1', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr1', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr1', k+1).substring(0,50) : '';
								AVA_MultiShipAddArray[ArrIndex][1][2] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr2', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr2', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipaddr2', k+1).substring(0,50) : '';
								AVA_MultiShipAddArray[ArrIndex][1][3] = '';
								AVA_MultiShipAddArray[ArrIndex][1][4] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipcity', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipcity', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipcity', k+1).substring(0,50) : '';
								AVA_MultiShipAddArray[ArrIndex][1][5] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipstate', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipstate', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipstate', k+1).substring(0,50) : '';
								AVA_MultiShipAddArray[ArrIndex][1][6] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipzip', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipzip', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipzip', k+1).substring(0,50) : '';
								AVA_MultiShipAddArray[ArrIndex][1][7] = (nlapiGetLineItemValue('iladdrbook', 'iladdrshipcountry', k+1) != null && nlapiGetLineItemValue('iladdrbook', 'iladdrshipcountry', k+1).length > 0) ? nlapiGetLineItemValue('iladdrbook', 'iladdrshipcountry', k+1).substring(0,50) : '';																				
								ArrIndex++;
							}
						}
					}		
				}					
			}		
		}			
	}
}

function AVA_GetLocations()
{
	if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F')
	{
		AVA_HeaderLocation = new Array();
		if(nlapiGetFieldValue('location') != null && nlapiGetFieldValue('location').length > 0)
		{
			AVA_HeaderLocation = AVA_GetAddresses(nlapiGetFieldValue('location'), 2);
		}
	}
	else
	{
		AVA_LocationPOS = 1;
		var TabType, TabCount, Taxcode = null;	
		AVA_LocationArray = new Array();
		
		if (nlapiGetFieldValue('taxitem') != null) 
		{
			Taxcode = nlapiGetFieldValue('custpage_ava_formtaxcode');
			Taxcode = (Taxcode == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : Taxcode;			
		}		

		for(var line = 0 ; AVA_NS_Lines != null && line < AVA_NS_Lines.length ; line++)
		{
			var AVA_ExistFlag = 'F'; // Flag to check if an address already exists in the Location Array
			var AVA_LocArrIndex; // Index whose location details need to be copied into a different Array item
			var AVA_LocArrLen = (AVA_LocationArray != null) ? AVA_LocationArray.length : 0; //Length of Location Array
			var AVA_LocationID = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'location', AVA_NS_Lines[line][1]); // Location internal ID of a line item.
			var PickUpCheck = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'custcol_ava_pickup', AVA_NS_Lines[line][1]);
			if(PickUpCheck != 'T')
			{
				AVA_LocationPOS = 0;
			}
	
			if (nlapiGetFieldValue('taxitem') == null) 
			{	
				Taxcode = (AVA_TaxcodeArray[line] == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : AVA_TaxcodeArray[line];				
			}			
	
			if(Taxcode != null && Taxcode.substr((Taxcode.length - 3), 3) != 'POD')
			{											
				// Loop to find if the current line location internal id exists in the location array						
				for(var locCtr = 0 ; locCtr < AVA_LocArrLen ; locCtr++)
				{
					if(AVA_LocationArray[locCtr][0] != null && AVA_LocationID == AVA_LocationArray[locCtr][0])
					{
						AVA_ExistFlag = 'T';
						AVA_LocArrIndex = locCtr;
						break;
					}
				}
				
				AVA_LocationArray[AVA_LocArrLen] = new Array();

				if(AVA_LocationID != null && AVA_LocationID.length > 0)
				{					
					AVA_LocationArray[AVA_LocArrLen][0] = AVA_LocationID;
										
					if(AVA_ExistFlag == 'T')
					{
						// Location Details exists in Location Array, so copy the details
						AVA_LocationArray[AVA_LocArrLen][1] = new Array();
						AVA_LocationArray[AVA_LocArrLen][1] = AVA_LocationArray[AVA_LocArrIndex][1];
					}
					else
					{
						AVA_LocationArray[AVA_LocArrLen][1] = new Array();
						AVA_LocationArray[AVA_LocArrLen][1] = AVA_GetAddresses(AVA_LocationID, 2);
					}
					if(AVA_NS_Lines[line][0] != 'item' && AVA_LocationArray[AVA_LocArrLen][1][8] == false)
					{
						AVA_LocationPOS = 0;
					}
				}
				else
				{
					AVA_LocationArray[AVA_LocArrLen][0] = null;
					AVA_LocationArray[AVA_LocArrLen][1] = null;
				}
			}
			else
			{					
				AVA_LocationArray[AVA_LocArrLen] = new Array();
				AVA_LocationArray[AVA_LocArrLen][0] = null
				AVA_LocationArray[AVA_LocArrLen][1] = null;
			}
		}	
		
		if(nlapiGetFieldValue('ismultishipto') != null && nlapiGetFieldValue('ismultishipto') == 'T')
		{			
			var shipLineTaxcode = null;
			
			for(var ship = 0 ; AVA_ShipGroupTaxcodes != null && ship < AVA_ShipGroupTaxcodes.length ; ship++)
			{
				var AVA_ExistFlag = 'F'; // Flag to check if an address already exists in the Location Array
				var AVA_LocArrIndex; // Index whose location details need to be copied into a different Array item
				var AVA_LocArrLen = (AVA_LocationArray != null) ? AVA_LocationArray.length : 0; //Length of Location Array
				var AVA_LocationID = nlapiGetLineItemValue('shipgroup', 'sourceaddressref',AVA_ShipGroupTaxcodes[ship][0]); // Location internal ID of a line item.
				var AmtField = (AVA_ShipGroupTaxcodes[ship][3] == 'FREIGHT') ? 'shippingrate' : 'handlingrate';		

				shipLineTaxcode = (AVA_ShipGroupTaxcodes[ship][2] == null || AVA_ShipGroupTaxcodes[ship][2] == '-Not Taxable-') ? ((AVA_DefaultTaxCode.lastIndexOf('+') != -1) ? AVA_DefaultTaxCode.substring(0, AVA_DefaultTaxCode.lastIndexOf('+')) : AVA_DefaultTaxCode) : AVA_ShipGroupTaxcodes[ship][2];
				//If the shipping/handling taxcode is AVATAX or AVATAX-POS only then include location in location array

				if(nlapiGetLineItemValue('shipgroup', AmtField, AVA_ShipGroupTaxcodes[ship][0]) > 0 && shipLineTaxcode != null && shipLineTaxcode.substr((shipLineTaxcode.length - 3), 3) != 'POD')
				{							
					// Loop to find if the current line location internal id exists in the location array						
					for(var locCtr = 0 ; locCtr < AVA_LocArrLen ; locCtr++)
					{
						if(AVA_LocationArray[locCtr][0] != null && AVA_LocationID == AVA_LocationArray[locCtr][0])
						{
							AVA_ExistFlag = 'T';
							AVA_LocArrIndex = locCtr;
							break;
						}
					}
	
					AVA_LocationArray[AVA_LocArrLen] = new Array();
					
					if(AVA_LocationID != null && AVA_LocationID.length > 0)
					{					
						AVA_LocationArray[AVA_LocArrLen][0] = AVA_LocationID;
											
						if(AVA_ExistFlag == 'T')
						{
							// Location Details exists in Location Array, so copy the details
							AVA_LocationArray[AVA_LocArrLen][1] = new Array();
							AVA_LocationArray[AVA_LocArrLen][1] = AVA_LocationArray[AVA_LocArrIndex][1];
						}
						else
						{
							AVA_LocationArray[AVA_LocArrLen][1] = new Array();
							AVA_LocationArray[AVA_LocArrLen][1] = AVA_GetAddresses(AVA_LocationID, 2);
						}
					}
					else
					{
						AVA_LocationArray[AVA_LocArrLen][0] = null
						AVA_LocationArray[AVA_LocArrLen][1] = null;
					}		
				}
				else
				{					
					AVA_LocationArray[AVA_LocArrLen] = new Array();
					AVA_LocationArray[AVA_LocArrLen][0] = null
					AVA_LocationArray[AVA_LocArrLen][1] = null;
				}
			}
		}				
	}

}

function AVA_GetTaxcodes()
{	
	
	var record;
	if(nlapiGetFieldValue('custpage_ava_taxcodestatus') != 0)
	{
		record =  nlapiGetNewRecord();
	}
	
	if(nlapiGetFieldValue('taxitem') != null)
	{
		if(nlapiGetFieldValue('taxitem').length > 0)
		{
			if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
			{
				AVA_HeaderTaxcode = nlapiGetFieldText('taxitem');
			}
			else
			{
				var taxitemValue = record.getFieldText('taxitem') == null ? record.getFieldValue('taxitem_display') : record.getFieldText('taxitem');
				AVA_HeaderTaxcode = taxitemValue;
			}
			nlapiSetFieldValue('custpage_ava_formtaxcode', AVA_HeaderTaxcode);
		}
	}
	else
	{
		var TabType;	
		AVA_TaxcodeArray = new Array();
		
		for(var line = 0 ; AVA_NS_Lines != null && line < AVA_NS_Lines.length ; line++)
		{

			var AVA_TaxcodeArrayLen = AVA_TaxcodeArray.length;
			
			if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
			{
				AVA_TaxcodeArray[AVA_TaxcodeArrayLen] = nlapiGetLineItemText(AVA_NS_Lines[line][0], 'taxcode', AVA_NS_Lines[line][1]);
			}
			else
			{
				var taxcodeName = record.getLineItemText(AVA_NS_Lines[line][0], 'taxcode', AVA_NS_Lines[line][1]) == null ? record.getLineItemValue(AVA_NS_Lines[line][0], 'taxcode_display', AVA_NS_Lines[line][1]) : record.getLineItemText(AVA_NS_Lines[line][0], 'taxcode', AVA_NS_Lines[line][1]);
				AVA_TaxcodeArray[AVA_TaxcodeArrayLen] = taxcodeName;
			}						
		}		
		
		if(nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F')))
		{
			if(nlapiGetFieldValue('shippingtaxcode') != null)
			{
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
				{
					nlapiSetFieldValue('custpage_ava_shiptaxcode', nlapiGetFieldText('shippingtaxcode'));
				}
				else
				{
					var shippingTaxcode = record.getFieldText('shippingtaxcode') == null ? record.getFieldValue('shippingtaxcode_display') : record.getFieldText('shippingtaxcode');
					nlapiSetFieldValue('custpage_ava_shiptaxcode', shippingTaxcode);
				}
			}
			
			if(nlapiGetFieldValue('handlingtaxcode') != null)
			{
				if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
				{ 
					nlapiSetFieldValue('custpage_ava_handlingtaxcode', nlapiGetFieldText('handlingtaxcode'));
				}
				else
				{
					var handlingTaxcode = record.getFieldText('handlingtaxcode') == null ? record.getFieldValue('handlingtaxcode_display') : record.getFieldText('handlingtaxcode');
					nlapiSetFieldValue('custpage_ava_handlingtaxcode', handlingTaxcode);
				}
			}		
		}
		else
		{
			var AVA_DefTaxCodeId = nlapiGetFieldValue('custpage_ava_deftaxid');
			var AVA_DefTaxCode = nlapiGetFieldValue('custpage_ava_deftax');
			
			AVA_ShipGroupTaxcodes = new Array();
			
			for(var j=0, i=0 ; j < nlapiGetLineItemCount('shipgroup') ; j++)
			{
				AVA_ShipGroupTaxcodes[i] = new Array();
				AVA_ShipGroupTaxcodes[i][0] = j+1;//LineNumber
				AVA_ShipGroupTaxcodes[i][1] = nlapiGetLineItemValue('shipgroup', 'shippingtaxcode', j+1);//Shipping line taxcode Id

				if(AVA_ShipGroupTaxcodes[i][1] != null && AVA_ShipGroupTaxcodes[i][1].length > 0)
				{
					if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
					{
						AVA_ShipGroupTaxcodes[i][2] = nlapiGetLineItemText('shipgroup', 'shippingtaxcode', AVA_ShipGroupTaxcodes[i][0]);
					}
					else
					{
						AVA_ShipGroupTaxcodes[i][2] = record.getLineItemText('shipgroup', 'shippingtaxcode', AVA_ShipGroupTaxcodes[i][0]);
					}					
				}
				else
				{
					AVA_ShipGroupTaxcodes[i][1] = AVA_DefTaxCodeId;
					AVA_ShipGroupTaxcodes[i][2] = AVA_DefTaxCode;
				}

				AVA_ShipGroupTaxcodes[i][3] = 'FREIGHT';
				i++;
				
				if(nlapiGetFieldValue('custpage_ava_handling') != null)
				{
					AVA_ShipGroupTaxcodes[i] = new Array();
					AVA_ShipGroupTaxcodes[i][0] = j+1;//LineNumber
					AVA_ShipGroupTaxcodes[i][1] = nlapiGetLineItemValue('shipgroup', 'handlingtaxcode', j+1);//Handling line taxcode Id
					
					if(AVA_ShipGroupTaxcodes[i][1] != null && AVA_ShipGroupTaxcodes[i][1].length > 0)
					{
						if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
						{
							AVA_ShipGroupTaxcodes[i][2] = nlapiGetLineItemText('shipgroup', 'handlingtaxcode', AVA_ShipGroupTaxcodes[i][0]);
						}
						else
						{
							AVA_ShipGroupTaxcodes[i][2] = record.getLineItemText('shipgroup', 'handlingtaxcode', AVA_ShipGroupTaxcodes[i][0]);
						}								
					}
					else
					{
						AVA_ShipGroupTaxcodes[i][1] = AVA_DefTaxCodeId;
						AVA_ShipGroupTaxcodes[i][2] = AVA_DefTaxCode;
					}
					AVA_ShipGroupTaxcodes[i][3] = 'MISCELLANEOUS';
					i++;
				}
			}
		}
	}

	return true;
}

function AVA_GetNSLines()
{	
	var TabType, TabCount;	
	AVA_NS_Lines = new Array();
	
	BillItemFlag = 'F'; 
	BillExpFlag = 'F'; 
	BillTimeFlag = 'F';
	BillItemTAmt = BillExpTAmt = BillTimeTAmt = 0;
	
	//1: Items tab, 2: Billable Items, 3: Billable Exp, 4: Billable Time
	TabCount = (nlapiGetFieldValue('custpage_ava_billcost') == 'T') ? 4 : 1; 

	for(var tab = 0 ; tab < TabCount ; tab++)
	{
		TabType = (tab == 0) ? 'item' : ((tab == 1) ? 'itemcost' : ((tab == 2) ? 'expcost' : 'time'));				

		for(var line = 0 ; line < nlapiGetLineItemCount(TabType) ; line++)
		{
			//Continue only if its a line from Items tab or when the apply checkbox is marked true for a Billable line.
			if(TabType != 'item' && nlapiGetLineItemValue(TabType, 'apply', line+1) != 'T')
				{ continue; }			
			
			var ArrIndex = AVA_NS_Lines.length;						
								
			AVA_NS_Lines[ArrIndex] = new Array();
			AVA_NS_Lines[ArrIndex][0] = TabType;
			AVA_NS_Lines[ArrIndex][1] = parseFloat(line+1);
			
			if(TabType == 'itemcost')
			{
				BillItemFlag = 'T';
				BillItemTAmt += (nlapiGetLineItemValue(TabType, 'amount', line+1) != null && nlapiGetLineItemValue(TabType, 'amount', line+1).length > 0) ? parseFloat(nlapiGetLineItemValue(TabType, 'amount', line+1)) : 0;
			}
			else if(TabType == 'expcost')
			{
				BillExpFlag = 'T';
				BillExpTAmt += (nlapiGetLineItemValue(TabType, 'amount', line+1) != null && nlapiGetLineItemValue(TabType, 'amount', line+1).length > 0) ? parseFloat(nlapiGetLineItemValue(TabType, 'amount', line+1)) : 0;
			}
			else if(TabType == 'time')
			{
				BillTimeFlag = 'T';
				BillTimeTAmt += (nlapiGetLineItemValue(TabType, 'amount', line+1) != null && nlapiGetLineItemValue(TabType, 'amount', line+1).length > 0) ? parseFloat(nlapiGetLineItemValue(TabType, 'amount', line+1)) : 0;
			}
		}
	}	
	
}


function AVA_ItemsTaxLines()
{
	var prev_lineno =0;
	var Itemtype, Itemid, amount, cnt=0, cnt1=0;
	var AVA_ItemTaxable, AVA_GroupBegin, AVA_GroupStart, AVA_GroupEnd, TaxCodeID, TaxCode, TaxFlag;
	
	AVA_LineNames   = new Array(); // Stores the line names
	AVA_LineType    = new Array(); // Stores the Line Type
	AVA_LineAmount  = new Array(); // Stores the Line amounts 
	AVA_TaxLines    = new Array(); // Stores the value 'T' for Item Type and 'F' for Non-Item Type like discount, payment, markup, description, subtotal, groupbegin and endgroup
	AVA_Taxable     = new Array(); // Stores the value 'T' if line is taxable else 'F'
	AVA_LineQty     = new Array(); // Stores the Line Qty
	AVA_TaxCodes    = new Array(); // Stores the Tax Code Status
	AVA_LineTab     = new Array(); // Stores the tab name to which the line item belongs
	AVA_LineNum     = new Array(); // Stores line number of items in each tab
	AVA_PickUpFlag  = new Array(); // Stores the Point of Sale flag for each line
	
	for(var i=0 ; i<nlapiGetLineItemCount('item') ; i++)
	{
		
		AVA_LineTab[i] = 'item';
		AVA_LineNum[i] = parseFloat(i+1);
		
		AVA_LineType[i]     = nlapiGetLineItemValue('item','itemtype',i+1);
		
		if(AVA_LineType[i] != 'EndGroup')
		{
			if(nlapiGetContext().getFeature('barcodes') == true && (AVA_EnableUpcCode == 'T' || AVA_EnableUpcCode == true) && (nlapiGetLineItemValue('item','custcol_ava_upccode',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_upccode',i+1).length > 0))
			{
				AVA_LineNames[i]  =  'UPC:' + nlapiGetLineItemValue('item','custcol_ava_upccode',i+1).substring(0,50);
			}
			else
			{
				AVA_LineNames[i]  = (nlapiGetLineItemValue('item','custcol_ava_item',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_item',i+1).length > 0) ? nlapiGetLineItemValue('item','custcol_ava_item',i+1).substring(0,50) : '';
			}
		}
		else
		{
			AVA_LineNames[i] = 'End Group';
		}

		if(AVA_LineType[i] == 'Payment')
		{
			AVA_LineQty[i] = 1;
		}
		else
		{
			AVA_LineQty[i] = nlapiGetLineItemValue('item','quantity',i+1);
		}

		if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1).length > 0)
		{
			if(parseFloat(nlapiGetLineItemValue('item','custcol_ava_gross_amount1',i+1)) != parseFloat(nlapiGetLineItemValue('item','amount',i+1)))
			{
				AVA_LineAmount[i]     = nlapiGetLineItemValue('item','amount',i+1);
			}
			else
			{
				AVA_LineAmount[i]     = nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1);
			}
		}
		else
		{
			AVA_LineAmount[i]     = nlapiGetLineItemValue('item','amount',i+1);
		}
		
		if (nlapiGetFieldValue('taxitem') != null) 
		{
			AVA_Taxable[i]    = nlapiGetLineItemValue('item','istaxable',i+1);
			AVA_TaxCodes[i]   = AVA_IdentifyTaxCode(nlapiGetFieldValue('custpage_ava_formtaxcode'));
		}
		else
		{
			TaxCode = AVA_TaxcodeArray[i];
			AVA_Taxable[i] = (TaxCode == '-Not Taxable-')? 'F' : 'T';
			AVA_TaxCodes[i] = AVA_IdentifyTaxCode(TaxCode);
		}
		
		AVA_PickUpFlag[i] = nlapiGetLineItemValue('item','custcol_ava_pickup',i+1);
		
		if(i == (AVA_GroupBegin-1))
		{
			for(var k=i; k<=AVA_GroupEnd ; k++)
			{
				AVA_LineType[k]     = nlapiGetLineItemValue('item','itemtype',k+1);

				if(AVA_LineType[k] != 'EndGroup')
				{
					if(nlapiGetContext().getFeature('barcodes') == true && (AVA_EnableUpcCode == 'T' || AVA_EnableUpcCode == true) && (nlapiGetLineItemValue('item','custcol_ava_upccode',k+1) != null && nlapiGetLineItemValue('item','custcol_ava_upccode',k+1).length > 0))
					{
						AVA_LineNames[k]  =  'UPC:' + nlapiGetLineItemValue('item','custcol_ava_upccode',k+1).substring(0,50);
					}
					else
					{
						AVA_LineNames[k]  = (nlapiGetLineItemValue('item','custcol_ava_item',k+1) != null && nlapiGetLineItemValue('item','custcol_ava_item',k+1).length > 0) ? nlapiGetLineItemValue('item','custcol_ava_item',k+1).substring(0,50) : '';
					}
				}
				else
				{
					AVA_LineNames[k] = 'End Group';
				}
				
				if(AVA_LineType[k] == 'Payment')
				{
					AVA_LineQty[k] = 1;
				}
				else
				{
					AVA_LineQty[k] = nlapiGetLineItemValue('item','quantity',k+1);
				}
				
				if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1).length > 0)
				{
					if(parseFloat(nlapiGetLineItemValue('item','custcol_ava_gross_amount1',k+1)) != parseFloat(nlapiGetLineItemValue('item','amount',k+1)))
					{
						AVA_LineAmount[k]     = nlapiGetLineItemValue('item','amount',k+1);
					}
					else
					{
						AVA_LineAmount[k]     = nlapiGetLineItemValue('item','custcol_ava_gross_amount',k+1);
					}
				}
				else
				{
					AVA_LineAmount[k]     = nlapiGetLineItemValue('item','amount',k+1);
				}
					
				if (nlapiGetField('taxitem') != null) 
				{
					AVA_Taxable[k]    = nlapiGetLineItemValue('item','istaxable',k+1);
					AVA_TaxCodes[k]   = AVA_IdentifyTaxCode(nlapiGetFieldValue('custpage_ava_formtaxcode'));
				}
				else
				{
					TaxCode = AVA_TaxcodeArray[k];
					AVA_Taxable[k]  = (TaxCode == '-Not Taxable-')? 'F' : 'T';
					AVA_TaxCodes[k] = AVA_IdentifyTaxCode(TaxCode);
				}
				
				switch(AVA_LineType[k])
				{
					case 'Discount':
					case 'Markup':
						if((AVA_EnableDiscount == true || AVA_EnableDiscount == 'T') && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0)
						{
							//Discount Mechanism
							AVA_LineQty[k] = 1;
							AVA_TaxLines[k]='T';
							AVA_Taxable[k] = 'F';
							if (k == i)
							{
								AVA_TaxLines[k]='F';
							}
						}
						else
						{
							if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T')
							{
								AVA_LineQty[k] = 1;
								AVA_TaxLines[k] = 'T';
								if (k == i)
								{
									AVA_TaxLines[k]='F';
								}
							}
							else
							{
								AVA_TaxLines[k] = 'F';
								AVA_Taxable [k] = 'F';
								var discountItem = nlapiGetLineItemValue('item','amount',k+1);//here current lines discount is fetched
								if(discountItem.indexOf('%') != -1)
								{
									discountItem = discountItem.substring(0,discountItem.indexOf('%'));
								}
								if(discountItem != 0)
								{
									if(k==i)//when there is no preceeding Inv Item before a Discount item
									{
										AVA_LineQty[k] = 1;
										AVA_LineAmount[k] = discountItem;
										AVA_TaxLines[k] = 'T';//This section's discount will be sent as Line exempt
										
									}
									else
									{   
										var totallines = 0;
										for(var prev = k; AVA_LineType[prev] != 'InvtPart' && AVA_LineType[prev] != 'Subtotal' && AVA_LineType[prev] != 'Kit' && AVA_LineType[prev] != 'Assembly' && AVA_LineType[prev] != 'NonInvtPart' && AVA_LineType[prev] != 'OthCharge' && AVA_LineType[prev] != 'Service' && AVA_LineType[prev] != 'Group' && AVA_LineType[prev] != 'GiftCert' && AVA_LineType[prev] != 'DwnLdItem'; prev--); //searches for the preceeding Inv Item, subtotal or Kit item
										var prevItemAmt = AVA_LineAmount[prev];//this fetches the preceeding InvItem's amount
										AVA_LineAmount[k] = discountItem;
													
						
										if(AVA_LineType[prev] == 'Group')
										{
											AVA_LineQty[k] = 1;
											AVA_LineAmount[k] = discountItem;
											AVA_TaxLines[k]='T';
										}
										
										if((AVA_LineType[prev] == 'InvtPart' || AVA_LineType[prev] == 'Kit' || AVA_LineType[prev] == 'Assembly' || AVA_LineType[prev] == 'NonInvtPart' || AVA_LineType[prev] == 'OthCharge' || AVA_LineType[prev] == 'Service' || AVA_LineType[prev] == 'GiftCert' || AVA_LineType[prev] == 'DwnLdItem') && AVA_Taxable[prev] == 'T')//when the preceeding item is Inventory and is taxable
										{
											AVA_LineAmount[prev] = parseFloat(prevItemAmt) + parseFloat(discountItem);//as we wud hve set some value earlier for the Inv item, that's why when Discount is identified below it, the Inv item's amount is exchanged with the discounted amt
										}
										
										if((AVA_LineType[prev] == 'InvtPart' || AVA_LineType[prev] == 'Kit' || AVA_LineType[prev] == 'Assembly' || AVA_LineType[prev] == 'NonInvtPart' || AVA_LineType[prev] == 'OthCharge' || AVA_LineType[prev] == 'Service' || AVA_LineType[prev] == 'GiftCert' || AVA_LineType[prev] == 'DwnLdItem') && AVA_Taxable[prev] == 'F')//when the preceeding item is Inventory but is not taxable
										{
											AVA_LineQty[k] = 1;
											AVA_LineAmount[k] = discountItem;
											AVA_TaxLines[k]='T';
										}
										
										if(AVA_LineType[prev] == 'Subtotal')//when the preceeding item is a Subtotal item
										{
											var totalamt = 0;//to get total of all taxable items
											for(var j = prev-1; AVA_LineType[j] != 'Subtotal' && AVA_LineType[j] != 'Group' ; j--)//finds the last subtotal line, so that the discount can be divided among the taxable items which appears between these two subtotals   
											{
												if(AVA_LineType[j] != 'Description' && AVA_LineType[j] != 'Discount' && AVA_LineType[j] != 'Markup' && AVA_LineType[j] != 'Group' && AVA_LineType[j] != 'EndGroup' && AVA_LineType[j] != 'Subtotal')
												{
													totalamt += parseFloat(AVA_LineAmount[j]);
													totallines++;
												}
											}
											
											for(j=j+1 ;j!=prev; j++)//to add part of discount to all taxable items which appears between two subtotal items(this doesn't include subtotal which appear in a group item)
											{
												if(AVA_LineType[j] != 'Description' && AVA_LineType[j] != 'Discount' && AVA_LineType[j] != 'Markup' && AVA_LineType[j] != 'Group' && AVA_LineType[j] != 'EndGroup' && AVA_LineType[j] != 'Subtotal')
												{
													var discAmt = (parseFloat(discountItem / totalamt)* parseFloat(AVA_LineAmount[j])); 
													AVA_LineAmount[j] = parseFloat(AVA_LineAmount[j]) + parseFloat(discAmt);
												}
											}
			
											if(totallines == 0 )
											{
												AVA_LineQty[k] = 1;
												AVA_LineAmount[k] = discountItem;
												AVA_TaxLines[k]='T';
											}
										}     
									}
								}
							}
						}
						break;
						
					case 'Description': 
					case 'Subtotal':
						AVA_TaxLines[k] = 'F';
						break;
						
					case 'Payment':
						AVA_TaxLines[k] = 'T';
						AVA_Taxable[k] = 'F';
						break;
					
					case 'EndGroup':
						AVA_LineNames[k]  = 'EndGroup'
						AVA_LineType[k]   = 'EndGroup';
						if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1).length > 0)
						{
							if(parseFloat(nlapiGetLineItemValue('item','custcol_ava_gross_amount1',k+1)) != parseFloat(nlapiGetLineItemValue('item','amount',k+1)))
							{
								AVA_LineAmount[k]   = nlapiGetLineItemValue('item','amount',k+1);
							}
							else
							{
								AVA_LineAmount[k]   = nlapiGetLineItemValue('item','custcol_ava_gross_amount',k+1);
							}
						}
						else
						{
							AVA_LineAmount[k]   = nlapiGetLineItemValue('item','amount',k+1);
						}
						AVA_TaxLines[k]   = 'F';
						AVA_Taxable[k]    = 'F';
						break;
															
					default:
						AVA_TaxLines[k] = 'T';
						//EndGroup Item from Webservice call
						if(nlapiGetLineItemValue('item','item',k+1) == 0)
						{
							AVA_LineNames[k]  = 'EndGroup'
							AVA_LineType[k]   = 'EndGroup';	
							if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1).length > 0)
							{
								if(parseFloat(nlapiGetLineItemValue('item','custcol_ava_gross_amount1',k+1)) != parseFloat(nlapiGetLineItemValue('item','amount',k+1)))
								{
									AVA_LineAmount[k]   = nlapiGetLineItemValue('item','amount',k+1);
								}
								else
								{
									AVA_LineAmount[k]   = nlapiGetLineItemValue('item','custcol_ava_gross_amount',k+1);
								}
							}
							else
							{
								AVA_LineAmount[k]   = nlapiGetLineItemValue('item','amount',k+1);
							}	
							AVA_TaxLines[k] = 'F';
							AVA_Taxable[k]    = 'F';
						}	
						break;  
				}
			}
			i = k-1;//as i would be incremented when the loop ends, that's why deducted 1 so that i be equal to the End of Group line
		}
			
		switch(AVA_LineType[i])
		{
			case 'Discount':
			case 'Markup':
				if((AVA_EnableDiscount == true || AVA_EnableDiscount == 'T') && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 0)
				{
					//Discount Mechanism
					AVA_LineQty[i] = 1;
					AVA_TaxLines[i]='T';
					AVA_Taxable[i] = 'F';
					if (i == 0)
					{
						AVA_TaxLines[i]='F';
					}
				}
				else
				{
					if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T')
					{
						AVA_LineQty[i] = 1;
						AVA_TaxLines[i]='T';
						if (i == 0)
						{
							AVA_TaxLines[i]='F';
						}
					}
					else
					{
						var discountItem = nlapiGetLineItemValue('item','amount',i+1);//here current lines discount is fetched
						if(discountItem.indexOf('%') != -1)
						{
							discountItem = discountItem.substring(0,discountItem.indexOf('%'));
						}
						if(discountItem != 0)
						{
							if(i==0)
							{
								AVA_LineQty[i] = 1;
								AVA_LineAmount[i] = discountItem;
								AVA_TaxLines[i]='T';
							}
							else
							{ 
								var totallines = 0;
								AVA_TaxLines[i]='F';      
								for(var prev = i-1; AVA_LineType[prev] != 'InvtPart' && AVA_LineType[prev] != 'EndGroup' && AVA_LineType[prev] != 'Subtotal' && AVA_LineType[prev] != 'Kit' && AVA_LineType[prev] != 'Assembly' && AVA_LineType[prev] != 'NonInvtPart' && AVA_LineType[prev] != 'OthCharge' && AVA_LineType[prev] != 'Service' && AVA_LineType[prev] != 'GiftCert' && AVA_LineType[prev] != 'DwnLdItem' && prev>=0; prev--);//checks whether the prev item is an Inv Item, a Group or a Subtotal  
								
								if(prev < 0)
								{
									AVA_LineQty[i] = 1;
									AVA_LineAmount[i] = discountItem;
									AVA_TaxLines[i]='T';
								}
								
								if(AVA_LineType[prev] == 'EndGroup')//if prev item is a Group item
								{ 
									var totalamt = 0; // this var will save the total of taxable items' amounts so that we can divide the discount amount proportionately
									for(var j = prev-1; AVA_LineType[j] != 'Group'; j--)//it finds the start of the Group
									{ 
										if(AVA_LineType[j] != 'Description' && AVA_LineType[j] != 'Discount' && AVA_LineType[j] != 'Markup' && AVA_LineType[j] != 'Group' && AVA_LineType[j] != 'EndGroup' && AVA_LineType[j] != 'Subtotal')
										{
											totalamt += parseFloat(AVA_LineAmount[j]);
											totallines++;
										}
									}
									
									var rate = nlapiGetLineItemValue('item','rate',i+1);
									for(var m = j+1; m != prev; m++)
									{
										if(AVA_LineType[m] != 'Description' && AVA_LineType[m] != 'Discount' && AVA_LineType[m] != 'Markup' && AVA_LineType[m] != 'Group' && AVA_LineType[m] != 'EndGroup' && AVA_LineType[m] != 'Subtotal')
										{
											var discAmt = (parseFloat(discountItem / totalamt)* parseFloat(AVA_LineAmount[m])); 
											AVA_LineAmount[m] = parseFloat(AVA_LineAmount[m]) + parseFloat(discAmt);
										}
									}
								}
									
								if(AVA_LineType[prev] == 'Subtotal')//if prev item is a Subtotal
								{
									var totalamt = 0;//to get total of all taxable items
									var groupFlag = 0;//to avoid those subtotal items which appear in a group item
									var subtotalFlag = 0;
									
									for(var j = prev-1; j>=0 ; j--)//finds the last subtotal line, so that the discount can be divided among the taxable items which appears between these two subtotals    
									{
										if(AVA_LineType[j] == 'EndGroup')
										{
											groupFlag = 1; 
										}
										
										if(AVA_LineType[j] == 'Group')
										{
											groupFlag = 0; 
										}
										
										if(AVA_LineType[j] == 'Subtotal' && groupFlag == 0)
										{
											if(subtotalFlag == 0)
											{
												for(var n = j-1; n >= 0 ; n--)
												{
													if(AVA_LineType[n] == 'EndGroup')
													{
														 groupFlag = 1; 
													}
													
													if(AVA_LineType[n] == 'Group')
													{
														 groupFlag = 0; 
													}
													
													if(AVA_LineType[n] != 'Description' && AVA_LineType[n] != 'Discount' && AVA_LineType[n] != 'Markup' && AVA_LineType[n] != 'Group' && AVA_LineType[n] != 'EndGroup' && AVA_LineType[n] != 'Subtotal')
													{
														totalamt += parseFloat(AVA_LineAmount[n]);
														totallines++;
													}
													else if(AVA_LineType[n] == 'Subtotal' && groupFlag == 0)//for scenario where subtotal is not inside a group item
													{
														break;
													}
												}
												
												for(n = n+1 ; n != j ; n++)
												{
													if(AVA_LineType[n] != 'Description' && AVA_LineType[n] != 'Discount' && AVA_LineType[n] != 'Markup' && AVA_LineType[n] != 'Group' && AVA_LineType[n] != 'EndGroup' && AVA_LineType[n] != 'Subtotal')
													{
														var discAmt = (parseFloat(discountItem / totalamt)* parseFloat(AVA_LineAmount[n])); 
														AVA_LineAmount[n] = parseFloat(AVA_LineAmount[n]) + parseFloat(discAmt);
													}
												}
												break;
											}
											else
											{
												break;
											}  
										}
										else
										{
											if(AVA_LineType[j] != 'Description' && AVA_LineType[j] != 'Discount' && AVA_LineType[j] != 'Markup' && AVA_LineType[j] != 'Group' && AVA_LineType[j] != 'EndGroup' && AVA_LineType[j] != 'Subtotal')
											{
												subtotalFlag = 1
												totalamt += parseFloat(AVA_LineAmount[j]);
												totallines++;
											}
										}
									}
									
									for(j=j+1 ;j!=prev; j++)//to add part of discount to all taxable items which appears between two subtotal items(this doesn't include subtotal which appear in a group item)
									{
										if(AVA_LineType[j] != 'Description' && AVA_LineType[j] != 'Discount' && AVA_LineType[j] != 'Markup' && AVA_LineType[j] != 'Group' && AVA_LineType[j] != 'EndGroup' && AVA_LineType[j] != 'Subtotal')
										{
											var discAmt = (parseFloat(discountItem / totalamt)* parseFloat(AVA_LineAmount[j])); 
											AVA_LineAmount[j] = parseFloat(AVA_LineAmount[j]) + parseFloat(discAmt);
										}
									}
								}
								
								if((AVA_LineType[prev] == 'Subtotal' || AVA_LineType[prev] == 'EndGroup') && totallines == 0 )
								{
									AVA_LineQty[i] = 1;
									AVA_LineAmount[i] = discountItem;
									AVA_TaxLines[i]='T';
								}
								
								if(AVA_LineType[prev] == 'InvtPart' || AVA_LineType[prev] == 'Kit' || AVA_LineType[prev] == 'Assembly' || AVA_LineType[prev] == 'NonInvtPart' || AVA_LineType[prev] == 'OthCharge' || AVA_LineType[prev] == 'Service' || AVA_LineType[prev] == 'GiftCert' || AVA_LineType[prev] == 'DwnLdItem')//if prev item is an Inventory
								{
									var invItem = AVA_LineAmount[prev];//this fetches the preceeding InvItem's amount
									AVA_LineAmount[prev] = parseFloat(invItem) + parseFloat(discountItem);//as we wud hve set some value earlier for the Inv item, that's why when Discount is identified below it, the Inv item's amount is exchanged with the discounted amt
								}       
							}
						}
					}
				}
				break;
			
			case 'Description':
			case 'Subtotal':
				AVA_TaxLines[i] = 'F';
				break;

			case 'Group':
				AVA_GroupBegin = i+2;//will save the item line num of the first member of group
				for(var k=AVA_GroupBegin; nlapiGetLineItemValue('item','itemtype',k) != 'EndGroup' && nlapiGetLineItemValue('item','item',k) != 0; k++)
				{					
					AVA_GroupEnd = k;					
				}
				
				i = AVA_GroupBegin-2;
				AVA_TaxLines[i] = 'F';
				AVA_Taxable[i]  = 'F';
				continue;

			case 'EndGroup':
				AVA_LineNames[i]  = 'EndGroup'
				AVA_LineType[i]   = 'EndGroup';
				if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1).length > 0)
				{
					if(parseFloat(nlapiGetLineItemValue('item','custcol_ava_gross_amount1',i+1)) != parseFloat(nlapiGetLineItemValue('item','amount',i+1)))
					{
						AVA_LineAmount[i]   = nlapiGetLineItemValue('item','amount',i+1);
					}
					else
					{
						AVA_LineAmount[i]   = nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1);
					}
				}
				else
				{
					AVA_LineAmount[i]   = nlapiGetLineItemValue('item','amount',i+1);
				}
				AVA_TaxLines[i] = 'F';
				AVA_Taxable[i]    = 'F';
				break;
				
			case 'Payment':
				prev_lineno = i;
				AVA_TaxLines[i] = 'T';
				AVA_Taxable[i] = 'F';
				break;
							
			default:
				prev_lineno = i;
				AVA_TaxLines[i] = 'T';
				//EndGroup Item from Webservice call
				if(nlapiGetLineItemValue('item','item',i+1) == 0)
				{
					AVA_LineNames[i]  = 'EndGroup'
					AVA_LineType[i]   = 'EndGroup';
					if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1) != null && nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1).length > 0)
					{
						if(parseFloat(nlapiGetLineItemValue('item','custcol_ava_gross_amount1',i+1)) != parseFloat(nlapiGetLineItemValue('item','amount',i+1)))
						{
							AVA_LineAmount[i]   = nlapiGetLineItemValue('item','amount',i+1);
						}
						else
						{
							AVA_LineAmount[i]   = nlapiGetLineItemValue('item','custcol_ava_gross_amount',i+1);
						}
					}
					else
					{
						AVA_LineAmount[i]   = nlapiGetLineItemValue('item','amount',i+1);
					}
					AVA_TaxLines[i] = 'F';
					AVA_Taxable[i]    = 'F';
				}				
				break;
		}
	}

	if(nlapiGetFieldValue('custpage_ava_billcost') == 'T')
	{
		if(AVA_GetBillables() == false)//to get items from Billable subtabs of a transaction
		{
			return false;
		}
	}
}

function AVA_GetItemInfo(NSArrLine, ItemArrIndx)
{		
	if(AVA_NS_Lines[NSArrLine][0] == 'time' && AVA_BillableTimeName != 1)
	{
		AVA_LineNames[NSArrLine] = 'Billable Time';// Item name
		AVA_ItemInfoArr[ItemArrIndx][0] = NSArrLine;
	}
	else
	{
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0 && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
		{
			try
			{
				var response;	
				var UpcCodeFlag = 'F';
				if(nlapiGetContext().getFeature('barcodes') == true && (AVA_EnableUpcCode == 'T' || AVA_EnableUpcCode == true))
				{
					UpcCodeFlag = 'T';
				}
				var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;				
				response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=item&id=' + nlapiGetLineItemValue(AVA_NS_Lines[NSArrLine][0], 'item', AVA_NS_Lines[NSArrLine][1]) +'&upccodeflag='+ UpcCodeFlag, null, null );
				
				var fieldValues;	
				fieldValues = response.getBody().split('+');			
			
				if(nlapiGetContext().getFeature('barcodes') == true && (AVA_EnableUpcCode == 'T' || AVA_EnableUpcCode == true) && (fieldValues[5] != null && fieldValues[5].length > 0))
				{
					AVA_LineNames[NSArrLine] = 'UPC:' + fieldValues[5];//UPC Code
				}
				else
				{
					AVA_LineNames[NSArrLine] = fieldValues[0];// Item name
				}
				AVA_ItemInfoArr[ItemArrIndx][0] = NSArrLine;
				AVA_ItemInfoArr[ItemArrIndx][1] = fieldValues[1];//UDF1
				AVA_ItemInfoArr[ItemArrIndx][2] = fieldValues[2];//UDF2
				AVA_ItemInfoArr[ItemArrIndx][3] = fieldValues[3];//taxcodemapping
				AVA_ItemInfoArr[ItemArrIndx][4] = fieldValues[4];//IncomeAccount
			}
			catch(err)
			{
				var TabName = (AVA_NS_Lines[NSArrLine][0] == 'itemcost') ? 'Billable Items ' : ((AVA_NS_Lines[NSArrLine][0] == 'expcost') ? 'Billable Expenses' : 'Billable Time');
				AVA_ErrorCode = 'Unable to fetch information of Item at line: ' + AVA_NS_Lines[NSArrLine][1] + ' selected in the ' + TabName + ' tab.';
				return false;
			}
	
		}
		else
		{
			var cols = new Array();
			cols[0] = 'itemid';
			cols[1] = 'custitem_ava_udf1';
			cols[2] = 'custitem_ava_udf2';
			cols[3] = 'custitem_ava_taxcode';
			cols[4] = 'incomeaccount';
			if(nlapiGetContext().getFeature('barcodes') == true && (AVA_EnableUpcCode == 'T' || AVA_EnableUpcCode == true))
			{
				cols[5] = 'upccode';
			}
			
			try
			{
			
				var ItemRec = nlapiLookupField('item',nlapiGetLineItemValue(AVA_NS_Lines[NSArrLine][0], 'item', AVA_NS_Lines[NSArrLine][1]), cols);								
				var IncomeAccount = null;		
		
				try
				{			
					IncomeAccount = nlapiLookupField('account',ItemRec['incomeaccount'], 'acctname');							
				}
				catch(err)
				{
					IncomeAccount = ItemRec['incomeaccount'];
				}
				
				if(nlapiGetContext().getFeature('barcodes') == true && (AVA_EnableUpcCode == 'T' || AVA_EnableUpcCode == true) && (ItemRec['upccode'] != null && ItemRec['upccode'].length > 0))
				{
					AVA_LineNames[NSArrLine] = 'UPC:' + ItemRec['upccode'];//UPC Code
				}
				else
				{
					AVA_LineNames[NSArrLine] = ItemRec['itemid'];// Item name
				}
				AVA_ItemInfoArr[ItemArrIndx][0] = NSArrLine;
				AVA_ItemInfoArr[ItemArrIndx][1] = ItemRec['custitem_ava_udf1'];//UDF1
				AVA_ItemInfoArr[ItemArrIndx][2] = ItemRec['custitem_ava_udf2'];//UDF2
				AVA_ItemInfoArr[ItemArrIndx][3] = ItemRec['custitem_ava_taxcode'];//taxcodemapping
				AVA_ItemInfoArr[ItemArrIndx][4] = IncomeAccount;//IncomeAccount
			}
			catch(err)
			{
				var TabName = (AVA_NS_Lines[NSArrLine][0] == 'itemcost') ? 'Billable Items ' : ((AVA_NS_Lines[NSArrLine][0] == 'expcost') ? 'Billable Expenses' : 'Billable Time');
				AVA_ErrorCode = 'Unable to fetch information of Item at line: ' + AVA_NS_Lines[NSArrLine][1] + ' selected in the ' + TabName + ' tab.';
				return false;
			}
		}
	}
	
	return true;
	
}

function AVA_GetBillables()
{
	AVA_ItemInfoArr = new Array();
	
	var ArrCtr = AVA_LineType.length, QtyField, TaxableField, DiscAmtField, DiscTaxableField, DiscTaxcodeField;
	var line = nlapiGetLineItemCount('item');
	var DiscountAmt, TabTotalAmt;

	for( ; AVA_NS_Lines != null && line < AVA_NS_Lines.length ; line++)
	{
		QtyField     = (AVA_NS_Lines[line][0] == 'itemcost') ? 'itemcostcount'   : ((AVA_NS_Lines[line][0] == 'expcost') ? ''                : 'qty');		
		TabTotalAmt  = (AVA_NS_Lines[line][0] == 'itemcost') ? BillItemTAmt      : ((AVA_NS_Lines[line][0] == 'expcost') ? BillExpTAmt       : BillTimeTAmt);
		DiscAmtField = (AVA_NS_Lines[line][0] == 'itemcost') ? 'itemcostdiscamount'  : ((AVA_NS_Lines[line][0] == 'expcost') ? 'expcostdiscamount'  : 'timediscamount');

		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
		{
			if(AVA_NS_Lines[line][0] == 'expcost' && nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'category', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'category', AVA_NS_Lines[line][1]).length > 0)
			{
				var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;	
				var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=expensecategory&id=' + nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'category', AVA_NS_Lines[line][1]), null, null );
				var ItemName = response.getBody();
				AVA_LineNames[line] = (ItemName != null && ItemName.length > 0) ? ItemName : 'Billable Expense';
			}			
			else if(AVA_NS_Lines[line][0] != 'expcost' && nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'item', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'item', AVA_NS_Lines[line][1]).length > 0)
			{
				var arrLength = AVA_ItemInfoArr.length;

				AVA_ItemInfoArr[arrLength] = new Array();
				if(AVA_GetItemInfo(line, arrLength) == false)
				{
					return false;
				}
			}
			else if(AVA_NS_Lines[line][0] == 'expcost')
			{
				AVA_LineNames[line] = 'Billable Expense';
			}
		}
		else
		{
			if(AVA_NS_Lines[line][0] == 'expcost' && nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'category', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'category', AVA_NS_Lines[line][1]).length > 0)
			{
				var ItemName;
				try
				{ 
					ItemName = nlapiLookupField('expensecategory', nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'category', AVA_NS_Lines[line][1]), 'name');
				}
				catch(err)
				{
				}
				AVA_LineNames[line] = (ItemName != null && ItemName.length > 0) ? ItemName : 'Billable Expense';
			}
			else if(AVA_NS_Lines[line][0] != 'expcost' &&  nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'item', AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'item', AVA_NS_Lines[line][1]).length > 0)
			{	
				var arrLength = AVA_ItemInfoArr.length;
				AVA_ItemInfoArr[arrLength] = new Array();
				if(AVA_GetItemInfo(line, arrLength) == false)
				{
					return false;
				}
			}
			else if(AVA_NS_Lines[line][0] == 'expcost')
			{
				AVA_LineNames[line] = 'Billable Expense';
			}			
		}			

		AVA_LineType[line]  = 'Billable ' + AVA_NS_Lines[line][0]; 

		//Get Item Qty
		AVA_LineQty[line] =  (AVA_NS_Lines[line][0] == 'itemcost' || AVA_NS_Lines[line][0] == 'time') ? nlapiGetLineItemValue(AVA_NS_Lines[line][0], QtyField, AVA_NS_Lines[line][1]) : 1;
		
		//Get Item amount
		if((AVA_TaxInclude == 'T' || AVA_TaxInclude == true) && nlapiGetFieldValue('custbody_ava_taxinclude') != null && nlapiGetFieldValue('custbody_ava_taxinclude') == 'T' && nlapiGetLineItemValue(AVA_NS_Lines[line][0],'custcol_ava_gross_amount',AVA_NS_Lines[line][1]) != null && nlapiGetLineItemValue(AVA_NS_Lines[line][0],'custcol_ava_gross_amount',AVA_NS_Lines[line][1]).length > 0)
		{
			if(parseFloat(nlapiGetLineItemValue(AVA_NS_Lines[line][0],'custcol_ava_gross_amount1',AVA_NS_Lines[line][1])) != parseFloat(nlapiGetLineItemValue(AVA_NS_Lines[line][0],'amount',AVA_NS_Lines[line][1])))
			{
				AVA_LineAmount[line] = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'amount', AVA_NS_Lines[line][1]);
			}
			else
			{
				AVA_LineAmount[line] = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'custcol_ava_gross_amount', AVA_NS_Lines[line][1]);
			}
		}
		else
		{
			AVA_LineAmount[line] = nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'amount', AVA_NS_Lines[line][1]);
		}
			
		DiscountAmt = nlapiGetFieldValue(DiscAmtField);

		if(DiscountAmt != null && DiscountAmt.length >0)
		{
			if(((AVA_EnableDiscount == 'T' || AVA_EnableDiscount == true) && nlapiGetFieldValue('custpage_ava_formdiscountmapping') == 1) || (AVA_EnableDiscount == 'F' || AVA_EnableDiscount == false))
			{
				AVA_LineAmount[line] = parseFloat(AVA_LineAmount[line]) + (parseFloat(AVA_LineAmount[line]/TabTotalAmt) * parseFloat(DiscountAmt));
			}
		}
		
		//Get Taxability
		if (nlapiGetFieldValue('taxitem') != null) 
		{
			AVA_Taxable[line] 	= nlapiGetLineItemValue(AVA_NS_Lines[line][0], 'taxable', AVA_NS_Lines[line][1]);
			AVA_TaxCodes[line] 	= AVA_IdentifyTaxCode(nlapiGetFieldValue('custpage_ava_formtaxcode'));
		}
		else
		{			
			TaxCode = AVA_TaxcodeArray[line];
			AVA_Taxable[line] = (TaxCode == '-Not Taxable-') ? 'F' : 'T';
			AVA_TaxCodes[line] = AVA_IdentifyTaxCode(TaxCode);
		}

		AVA_TaxLines[line] = 'T';

	}

	return true;
}

function AVA_LoadValuesToGlobals(record) 
{
	try
	{
		/* Header level Details */
		AVA_AccountValue 		= record.getFieldValue('custrecord_ava_accountvalue');	
		AVA_LicenseKey	 		= record.getFieldValue('custrecord_ava_licensekey');	
		AVA_ServiceUrl 	 		= record.getFieldValue('custrecord_ava_url');	
		AVA_ExpiryDate			= record.getFieldValue('custrecord_ava_expirydate');	
		AVA_ServiceTypes        = record.getFieldValue('custrecord_ava_servicetypes');
		AVA_EnableBatchService  = record.getFieldValue('custrecord_ava_enablebatchservice');
		AVA_Username            = record.getFieldValue('custrecord_ava_username');
		AVA_Password            = record.getFieldValue('custrecord_ava_password');
		
		/* General Tab Elements Detail */
		AVA_UDF1 				= record.getFieldValue('custrecord_ava_udf1');	
		AVA_UDF2 				= record.getFieldValue('custrecord_ava_udf2');	
		AVA_EntityUseCode 		= record.getFieldValue('custrecord_ava_entityusecode');	
		AVA_ItemAccount 		= record.getFieldValue('custrecord_ava_itemaccount');	
		AVA_TaxCodeMapping      = record.getFieldValue('custrecord_ava_taxcodemapping');
		AVA_DefaultShippingCode = record.getFieldValue('custrecord_ava_defshipcode');	
		AVA_DefaultMiscCode 	= record.getFieldValue('custrecord_ava_defmisccode');	
		AVA_CustomerCode 		= record.getFieldValue('custrecord_ava_customercode'); 
		AVA_MarkCustTaxable     = record.getFieldValue('custrecord_ava_markcusttaxable');
		AVA_DefaultCustomerTaxcode  = record.getFieldValue('custrecord_ava_defaultcustomer');
		AVA_BillableTimeName 		= record.getFieldValue('custrecord_ava_billtimename');
		AVA_ShowMessages 			= record.getFieldValue('custrecord_ava_showmessages');
		
		/* Tax Calculation Elements Details */	
		AVA_DisableTax 			= record.getFieldValue('custrecord_ava_disabletax');	
		AVA_DisableLine			= record.getFieldValue('custrecord_ava_disableline');	
		AVA_CalculateonDemand	= record.getFieldValue('custrecord_ava_taxondemand');	
		AVA_DefaultTaxCode		= record.getFieldValue('custrecord_ava_deftaxcode');
		AVA_EnableLogging		= record.getFieldValue('custrecord_ava_enablelogging');
		AVA_DecimalPlaces  		= record.getFieldValue('custrecord_ava_decimalplaces');
		AVA_TaxRate				= record.getFieldValue('custrecord_ava_taxrate');
		AVA_UsePostingPeriod 	= record.getFieldValue('custrecord_ava_usepostingdate');
		AVA_TaxInclude          = record.getFieldValue('custrecord_ava_taxinclude');
		AVA_EnableDiscount      = record.getFieldValue('custrecord_ava_enablediscount');
		AVA_DiscountMapping     = record.getFieldValue('custrecord_ava_discountmapping');
		AVA_DiscountTaxCode		= record.getFieldValue('custrecord_ava_discounttaxcode');
		AVA_DisableLocationCode = record.getFieldValue('custrecord_ava_disableloccode');
		AVA_EnableUpcCode = record.getFieldValue('custrecord_ava_enableupccode');
		
		AVA_AbortBulkBilling	= record.getFieldValue('custrecord_ava_abortbulkbilling');
		AVA_AbortUserInterfaces = record.getFieldValue('custrecord_ava_abortuserinterfaces');
		AVA_AbortWebServices    = record.getFieldValue('custrecord_ava_abortwebservices');
		AVA_AbortCSVImports   	= record.getFieldValue('custrecord_ava_abortcsvimports');
		AVA_AbortScheduledScripts  = record.getFieldValue('custrecord_ava_abortscheduledscripts');;
		AVA_AbortSuitelets         = record.getFieldValue('custrecord_ava_abortsuitelets');;

		/* Default Ship From Address */
		AVA_Def_Addressee		 = record.getFieldValue('custrecord_ava_addressee');
		AVA_Def_Addr1			 = record.getFieldValue('custrecord_ava_address1');
		AVA_Def_Addr2			 = record.getFieldValue('custrecord_ava_address2');
		AVA_Def_City			 = record.getFieldValue('custrecord_ava_city');
		AVA_Def_State			 = record.getFieldValue('custrecord_ava_state');
		AVA_Def_Zip				 = record.getFieldValue('custrecord_ava_zip');
		var ReturnCountryName    = AVA_CheckCountryName(record.getFieldValue('custrecord_ava_country'));
		AVA_Def_Country          = ReturnCountryName[1];
		
		/* Address Validation Elements Details */
		AVA_DisableAddValidation      = record.getFieldValue('custrecord_ava_disableaddvalidation');  
		AVA_AddUpperCase     = record.getFieldValue('custrecord_ava_adduppercase'); 
		AVA_AddBatchProcessing = record.getFieldValue('custrecord_ava_addbatchprocessing'); 
		AVA_EnableAddValonTran = record.getFieldValue('custrecord_ava_enableaddvalontran');  

	}	
	catch(err)
	{
		// When fields are not getting accessed.
	}

	return 0;
}

function AVA_TransactionSave()
{
	var ConnectorStartTime = new Date();
	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
	{
		try
		{
			if(nlapiGetFieldValue('custpage_ava_docstatus') != null || nlapiGetFieldValue('custpage_ava_docstatus') != 'Cancelled'  && nlapiGetFieldValue('custpage_ava_context') != 'webstore')
			{
				nlapiSetFieldValue('custpage_ava_taxcodestatus', '0');
				if(AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
				{
					nlapiSetFieldValue('custpage_ava_usecodeusuage', 'T');
				}
				
				if (AVA_RequiredFields() == 0)
				{	
					AVA_CreateNotes = 'T';
				
					if(AVA_ItemsTaxLines() != false)
					{
						var CalculateTax = AVA_CalculateTax();
						if(CalculateTax == false)
						{
							AVA_LogTaxResponse('T');
							if (AVA_AbortUserInterfaces == 'T' || AVA_AbortUserInterfaces == true)
							{
								alert('AvaTax - Aborting the save operation due to tax calculation error(s)/incomplete data.');
								return false;
							}
						}
						nlapiSetFieldValue('custpage_ava_document', 'T');
					}
					else
					{
						AVA_LogTaxResponse('F');
						nlapiSetFieldValue('custpage_ava_document', 'F');
					}			
				}
				else
				{
					if (AVA_ShowMessages == 1 || AVA_ShowMessages == 3)
					{
						alert("This Document has not used AvaTax Services for Tax Calculation. " + AVA_ErrorCodeDesc(AVA_ErrorCode));
					}
					AVA_LogTaxResponse('F');
					nlapiSetFieldValue('custpage_ava_document', 'F');
					if ((AVA_AbortUserInterfaces == 'T' || AVA_AbortUserInterfaces == true) && (AVA_ErrorCode == 12 || AVA_ErrorCode == 14))
					{
						alert('AvaTax - Aborting the save operation due to tax calculation error(s)/incomplete data.');
						return false;
					}
				}
			}
			
			nlapiSetFieldValue('custpage_ava_taxcodestatus', 3);
			if(nlapiGetFieldValue('custpage_ava_context') != 'webstore' && AVA_ResultCode == 'Success')
			{
				var ConnectorEndTime = new Date();
				var ConnectorTime = (AVA_ConnectorEndTime.getTime() - ConnectorStartTime.getTime()) + (ConnectorEndTime.getTime() - AVA_ConnectorStartTime.getTime());
				nlapiSetFieldValue('custpage_ava_clientlatency', AVA_LatencyTime);
				nlapiSetFieldValue('custpage_ava_clientconnector', ConnectorTime);
			}
			return true;
		}
		catch(err)
		{
			nlapiSetFieldValue('custpage_ava_taxcodestatus', 0);
		}
	}	
	
	return true;
}


function AVA_TransactionTabBeforeSubmit(type)
{
	var ConnectorStartTime = new Date();
	AVA_ReadConfig('1');
	
	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)	
	{	
		if(type != 'delete' && (nlapiGetFieldValue('custpage_ava_context') == 'userevent' || nlapiGetFieldValue('custpage_ava_context') == 'userinterface' || nlapiGetFieldValue('custpage_ava_context') == 'webservices' || nlapiGetFieldValue('custpage_ava_context') == 'csvimport' || nlapiGetFieldValue('custpage_ava_context') == 'scheduled' || nlapiGetFieldValue('custpage_ava_context') == 'suitelet' || nlapiGetFieldValue('custpage_ava_context') == 'webstore'))
		{
			if((AVA_EnableDiscount == 'T' || AVA_EnableDiscount == true) && nlapiGetFieldValue('custbody_ava_discountmapping') != null)
			{
				nlapiSetFieldValue('custbody_ava_discountmapping', parseInt(nlapiGetFieldValue('custpage_ava_formdiscountmapping')));
			}
			
			AVA_CreateNotes = 'T';
			nlapiSetFieldValue('custpage_ava_taxcodestatus', '3');
			
			if (AVA_RequiredFields() == 0)
			{
				if(AVA_ItemsTaxLines() != false)
				{
					var CalculateTax = AVA_CalculateTax();
					if(CalculateTax == false)
					{
						AVA_LogTaxResponse('T');
						if (AVA_EvaluateTranAbort() == 'T')
						{
							var e1 = nlapiCreateError('Aborting Save', 'AvaTax - Aborting the save operation due to tax calculation error(s)/incomplete data.');
							throw e1.getDetails();
						}
					}
					nlapiSetFieldValue('custpage_ava_document', 'T');
				}
				else
				{
					AVA_LogTaxResponse('F');
					nlapiSetFieldValue('custpage_ava_document', 'F');
				}
			}
			else
			{
				if (AVA_EvaluateTranAbort() == 'T' && (AVA_ErrorCode == 12 || AVA_ErrorCode == 14))
				{
					var e1 = nlapiCreateError('Aborting Save', 'AvaTax - Aborting the save operation due to tax calculation error(s)/incomplete data.');
					throw e1.getDetails();
				}
			
				if(AVA_ErrorCode != 0 && AVA_ErrorCode != 1 && AVA_ErrorCode != 5 && AVA_ErrorCode != 6 && AVA_ErrorCode != 9 && AVA_ErrorCode != 10 && AVA_ErrorCode != 11 && AVA_ErrorCode != 17 && AVA_ErrorCode != 19) //5,6,9,10,11,17,19
				{
					if(nlapiGetFieldValue('istaxable') != null)
					{
						nlapiSetFieldValue('taxrate', 0);
					}
					else
					{
						var CanadaFlag = 'F';
						
						if(nlapiGetFieldValue('tax2total') != null)
						{
							CanadaFlag = 'T';
						}
						
						for(var line = 0 ; AVA_NS_Lines != null && line < AVA_NS_Lines.length ; line++)
						{
							nlapiSetLineItemValue(AVA_NS_Lines[line][0], 'taxrate1', AVA_NS_Lines[line][1], 0);  
							
							if(CanadaFlag == 'T')
							{
								nlapiSetLineItemValue(AVA_NS_Lines[line][0], 'taxrate2', AVA_NS_Lines[line][1], 0);  
							}
						}
						
						if(nlapiGetFieldValue('ismultishipto') == null || (nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto').length <= 0 || nlapiGetFieldValue('ismultishipto') == 'F')))
						{
							if(nlapiGetFieldValue('shippingtax1rate') != null)
							{
								nlapiSetFieldValue('shippingtax1rate', 0);
							}
							
							if(CanadaFlag == 'T' && nlapiGetFieldValue('shippingtax2rate') != null)
							{
								nlapiSetFieldValue('shippingtax2rate', 0);
							}
													
							if(nlapiGetFieldValue('handlingtax1rate') != null)
							{
								nlapiSetFieldValue('handlingtax1rate', 0);
							}
							
							if(CanadaFlag == 'T' && nlapiGetFieldValue('handlingtax2rate') != null)
							{
								nlapiSetFieldValue('handlingtax2rate', 0);
							}
						}
					}
					
					AVA_TotalTax = 0;
					AVA_DocType = AVA_RecordType();
					AVA_SetDocTotal(AVA_DocType);
				}
				
				if(nlapiGetFieldValue('custpage_ava_context') == 'userevent' || nlapiGetFieldValue('custpage_ava_context') == 'webservices' || nlapiGetFieldValue('custpage_ava_context') == 'csvimport' || nlapiGetFieldValue('custpage_ava_context') == 'scheduled' || nlapiGetFieldValue('custpage_ava_context') == 'suitelet' || nlapiGetFieldValue('custpage_ava_context') == 'webstore')
				{
					AVA_LogTaxResponse('F');
					nlapiSetFieldValue('custpage_ava_document', 'F');
				}
			}		
		}	
		nlapiSetFieldValue('custpage_ava_taxcodestatus', '1');
		if(type != 'delete' && AVA_ResultCode == 'Success')
		{
			var ConnectorEndTime = new Date();
			var ConnectorTime = (AVA_ConnectorEndTime.getTime() - ConnectorStartTime.getTime()) + (ConnectorEndTime.getTime() - AVA_ConnectorStartTime.getTime());
			nlapiSetFieldValue('custpage_ava_beforesubmitlatency', AVA_LatencyTime);
			nlapiSetFieldValue('custpage_ava_beforesubmitconnector', ConnectorTime);
		}
	}
}

function AVA_TransactionTabAfterSubmit(type)
{
	var ConnectorStartTime = new Date();
	AVA_ReadConfig('1');
	
	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)		
	{		
		if(nlapiGetFieldValue('custpage_ava_context') == 'userevent' || nlapiGetFieldValue('custpage_ava_context') == 'userinterface' || nlapiGetFieldValue('custpage_ava_context') == 'webservices' || nlapiGetFieldValue('custpage_ava_context') == 'csvimport' || nlapiGetFieldValue('custpage_ava_context') == 'scheduled' || nlapiGetFieldValue('custpage_ava_context') == 'suitelet' || nlapiGetFieldValue('custpage_ava_context') == 'webstore')
		{
			var AVA_Doc = 'F', CancelType, CancelStatus;
			multiCurr = (nlapiGetFieldValue('isbasecurrency')=='F')? 'T' : 'F';
				
			var AVA_DocType = AVA_RecordType();
			
			if((AVA_DocType == 'SalesInvoice') || (AVA_DocType == 'ReturnInvoice'))
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('mainline',      null, 'is',   'T');
				filters[1] = new nlobjSearchFilter('memorized',       null, 'is',   'T');
				filters[2] = new nlobjSearchFilter('internalid',      null, 'is',   nlapiGetRecordId());
				var searchResult = nlapiSearchRecord('transaction', null, filters, null);
				
				if(searchResult == null)
				{
					if((nlapiGetFieldValue('custpage_ava_docstatus') != 'Cancelled') && (nlapiGetFieldValue('custpage_ava_document') == 'T'))
					{
						AVA_GetNSLines();					
						AVA_GetTaxcodes();	
						
						AVA_LocationPOS = 0;
						if((AVA_DisableLocationCode == 'F' || AVA_DisableLocationCode == false))
						{
							AVA_GetLocations();
							if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F' && nlapiGetFieldValue('location') != null && nlapiGetFieldValue('location').length > 0 && nlapiGetFieldValue('custbody_ava_pickup') == 'T')
							{
								AVA_LocationPOS = 1;
							}
						}
						
						if(AVA_LocationPOS == 0)
						{
							AVA_GetMultiShipAddr();
						}
						
						if(AVA_ItemsTaxLines() != false)
						{
							AVA_Doc = 'T';
							var AVA_DocNo = nlapiLookupField(nlapiGetRecordType(), nlapiGetRecordId(), 'tranid');
						}
						else
						{
							AVA_Doc = 'F';
						}
					}
			
					if((type == 'create') && (AVA_Doc == 'T') && (nlapiGetFieldValue('custpage_ava_docstatus') != 'Cancelled'))
					{
						if(AVA_CalculateTax() == true)
						{
							var record = nlapiCreateRecord('customrecord_avataxheaderdetails');
							
							AVA_UpdateHeaderRecord(record, AVA_DocNo);
						}
						else
						{
							AVA_LogTaxResponse('T');
						}
					} 
					else if((type == 'edit') &&  (nlapiGetFieldValue('custpage_ava_docstatus') != 'Cancelled')) 
					{
						var filters1 = new Array();
						filters1[0] = new nlobjSearchFilter('mainline', null, 'is', 'T');
						filters1[1] = new nlobjSearchFilter('internalid', null, 'anyof', nlapiGetRecordId());
						filters1[2] = new nlobjSearchFilter('voided', null, 'is' ,'T');
						
						var search1 = nlapiSearchRecord(nlapiGetRecordType(), null, filters1, null);
						if(search1 != null)
						{
							var headerid = nlapiGetFieldValue('custpage_ava_headerid');
							if(headerid.length > 0)
							{
								CancelType = 'DocVoided';
								CancelStatus = 'Cancelled';
								var CancelTax = AVA_CancelTax(CancelType);
								if(CancelTax == 0)
								{
									nlapiSubmitField('customrecord_avataxheaderdetails', headerid , 'custrecord_ava_documentstatus', AVA_DocumentStatus(CancelStatus));
								}
							}
						}
						else
						{
							if(AVA_Doc == 'T')
							{
								if(AVA_CalculateTax() == true)
								{
									if(nlapiGetFieldValue('custpage_ava_headerid') != null && nlapiGetFieldValue('custpage_ava_headerid').length > 0)
									{
										var record = nlapiLoadRecord('customrecord_avataxheaderdetails', nlapiGetFieldValue('custpage_ava_headerid'));
									}
									else
									{
										var record = nlapiCreateRecord('customrecord_avataxheaderdetails');
									}
								
									AVA_UpdateHeaderRecord(record, AVA_DocNo);
								}
								else
								{
									AVA_LogTaxResponse('T');
								}
							}
							else
							{
								AVA_LogTaxResponse('F');
							}
						}
					}
					else if(type == 'delete') 
					{
						AVA_DocDelete();
					}
					else if (AVA_Doc == 'F')
					{
						AVA_LogTaxResponse('F');      
					}
				}
			}
			else
			{
				AVA_LogTaxResponse('F');
			}
		}
	}
	if(type != 'delete')
	{
		var ConnectorEndTime = new Date();
		if(AVA_DocType == 'SalesInvoice' || AVA_DocType == 'ReturnInvoice')
		{
			if(AVA_ResultCode == 'Success')
			{
				var ConnectorTime = (AVA_ConnectorEndTime.getTime() - ConnectorStartTime.getTime()) + (ConnectorEndTime.getTime() - AVA_ConnectorStartTime.getTime());
				var ConnectorMetrics = ', BeforeLoad(CONNECTORTIME - ' + nlapiGetFieldValue('custpage_ava_beforeloadconnector') + ' ms), TransactionSave(CONNECTORTIME - ' + nlapiGetFieldValue('custpage_ava_clientconnector') + ' ms, LATENCY - ' + nlapiGetFieldValue('custpage_ava_clientlatency') + ' ms), BeforeSubmit(CONNECTORTIME - ' + nlapiGetFieldValue('custpage_ava_beforesubmitconnector') + ' ms, LATENCY - ' + nlapiGetFieldValue('custpage_ava_beforesubmitlatency') + ' ms), AfterSubmit(CONNECTORTIME - ' + ConnectorTime + ' ms, LATENCY - ' + AVA_LatencyTime + '  ms)';
				nlapiLogExecution('Debug', 'CONNECTORMETRICS', 'Doc No - ' + nlapiGetRecordId() + ConnectorMetrics);
			}
		}
		else
		{
			var ConnectorTime = ConnectorEndTime.getTime() - ConnectorStartTime.getTime();
			var ConnectorMetrics = ', BeforeLoad(CONNECTORTIME - ' + nlapiGetFieldValue('custpage_ava_beforeloadconnector') + ' ms), TransactionSave(CONNECTORTIME - ' + nlapiGetFieldValue('custpage_ava_clientconnector') + ' ms, LATENCY - ' + nlapiGetFieldValue('custpage_ava_clientlatency') + ' ms), BeforeSubmit(CONNECTORTIME - ' + nlapiGetFieldValue('custpage_ava_beforesubmitconnector') + ' ms, LATENCY - ' + nlapiGetFieldValue('custpage_ava_beforesubmitlatency') + ' ms), AfterSubmit(CONNECTORTIME - ' + ConnectorTime + '  ms)';
			nlapiLogExecution('Debug', 'CONNECTORMETRICS', 'Doc No - ' + nlapiGetRecordId() + ConnectorMetrics);
		}
	}
}

function AVA_DocType(DocumentType)
{
	switch(DocumentType)
	{
		case 'SalesOrder':
		case 'invoice':
			return 1;
			break;
			
		case 'SalesInvoice':
		case 'cashsale':
			return 2;
			break;    
			
		case 'PurchaseOrder':
		case 'creditmemo':
			return 3;
			break;    

		case 'PurchaseInvoice':
		case 'cashrefund':
			return 4;
			break;    

		case 'ReturnOrder':
		case 'returnauthorization':
			return 5;
			break;    

		case 'ReturnInvoice':
			return 6;
			break;    

		default:
			return 0;
			break;
	}     
}

function AVA_UpdateHeaderRecord(record, AVA_DocNo)
{
	record.setFieldValue('custrecord_ava_documentinternalid',   nlapiGetRecordId());
	record.setFieldValue('custrecord_ava_documentid',       AVA_DocID);
	record.setFieldValue('custrecord_ava_documentno',       AVA_DocNo);
	record.setFieldValue('custrecord_ava_documentdate',     AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), AVA_DocDate)); 
	record.setFieldValue('custrecord_ava_documenttype',     AVA_DocType(AVA_DocumentType));
	record.setFieldValue('custrecord_ava_documentstatus',     AVA_DocumentStatus(AVA_DocStatus));
	record.setFieldValue('custrecord_ava_netsuitedoctype',    AVA_DocType(nlapiGetRecordType()));
	record.setFieldValue('custrecord_ava_taxcalculationdate',   AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), AVA_TaxDate));
	record.setFieldValue('custrecord_ava_totalamount',      nlapiFormatCurrency(AVA_TotalAmount));
	record.setFieldValue('custrecord_ava_totaldiscount',    nlapiFormatCurrency(AVA_TotalDiscount));
	record.setFieldValue('custrecord_ava_totalnontaxable',    nlapiFormatCurrency(AVA_TotalExemption));
	record.setFieldValue('custrecord_ava_totaltaxable',     nlapiFormatCurrency(AVA_TotalTaxable));
	record.setFieldValue('custrecord_ava_totaltax',       nlapiFormatCurrency(AVA_TotalTax));
	record.setFieldValue('custrecord_ava_scheduled',      'F');
	record.setFieldValue('custrecord_ava_shipcode',       ShippingCode);
	record.setFieldValue('custrecord_ava_exchangerate', exchangeRate);

	if(multiCurr == 'T')
	{
		record.setFieldValue('custrecord_ava_multicurrency','T');
	}
	
	if(nlapiGetFieldValue('tax2total') != null)
	{
		record.setFieldValue('custrecord_ava_gsttax',       nlapiFormatCurrency(AVA_GSTTotal));
		record.setFieldValue('custrecord_ava_psttax',       nlapiFormatCurrency(AVA_PSTTotal));
	}
	
	var headerid = nlapiSubmitRecord(record, false);
}

function AVA_DocumentStatus(DocStatus)
{
	switch(DocStatus)
	{
		case 'Temporary':
			return 0;
			break;
		
		case '0':
			return 'Temporary';
			break;
			
		case 'Saved':
			return 1;
			break;
		
		case '1':
			return 'Saved';
			break;
				
		case 'Posted':
			return 2;
			break;
		
		case '2':
			return 'Posted';
			break;
			
		case 'Committed':
			return 3;
			break;
		
		case '3':
			return 'Committed';
			break;
				
		case 'Cancelled':
			return 4;
			break;
		
		case '4':
			return 'Cancelled';
			break;
				
		case 'Adjusted':
			return 5;
			break;
		
		case '5':
			return 'Adjusted';
			break;
				
		default:
			return -1;
			break;    
	}
}

function AVA_CancelTax(CancelType)
{
	var AVA_AccountValue, AVA_LicenseKey, AVA_ServiceUrl, AVA_Exists;
	var AVA_DocType = AVA_RecordType();   

	var cols = new Array();
	cols[0] = new nlobjSearchColumn('custrecord_ava_accountvalue');
	cols[1] = new nlobjSearchColumn('custrecord_ava_licensekey');
	cols[2] = new nlobjSearchColumn('custrecord_ava_url');
	
	var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, cols);
	for(var i=0; searchresult != null && i < searchresult.length; i++)
	{
		AVA_AccountValue = searchresult[i].getValue('custrecord_ava_accountvalue');
		AVA_LicenseKey = searchresult[i].getValue('custrecord_ava_licensekey');
		AVA_ServiceUrl = searchresult[i].getValue('custrecord_ava_url');
		AVA_Exists = 'T';
		break;
	}
	
	if(AVA_Exists == 'T')
	{
		var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
		
		var headers = AVA_TaxHeader(security);
		var body = AVA_CancelTaxBody(AVA_DocType, CancelType);
		var soapPayload = AVA_BuildEnvelope(headers + body);
	
		var soapHead = new Array();
		soapHead['Content-Type'] = 'text/xml';
		soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/CancelTax';
	
		var response = nlapiRequestURL(AVA_ServiceUrl + '/tax/taxsvc.asmx' , soapPayload, soapHead);
		if (response.getCode() == 200)
		{
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);
			var ResultCode = nlapiSelectValue( soapXML, "//*[name()='ResultCode']");
			if (ResultCode == 'Success')
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
			return 1;
		}
	}
	else
	{
		return 1;
	}
}

function AVA_CancelTaxBody(AVA_DocType, CancelType)
{
	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<CancelTax xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<CancelTaxRequest>\n';
//				soap += '\t\t\t\t<DocId><![CDATA[' + nlapiGetFieldValue('custpage_ava_docid1') + ']]></DocId>\n';
				soap += '\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
				soap += '\t\t\t\t<DocType><![CDATA[' + AVA_DocType + ']]></DocType>\n';
				soap += '\t\t\t\t<DocCode><![CDATA[' + nlapiGetRecordId() + ']]></DocCode>\n';
				soap += '\t\t\t\t<CancelCode><![CDATA[' + CancelType + ']]></CancelCode>\n';
			soap += '\t\t\t</CancelTaxRequest>\n';	
		soap += '\t\t</CancelTax>\n';
	soap += '\t</soap:Body>\n';

	return soap;	
}

function AVA_DocDelete()
{
	if(nlapiGetFieldValue('custpage_ava_headerid') != null && nlapiGetFieldValue('custpage_ava_headerid').length > 0)
	{
		var AVA_DocStatus = nlapiLookupField('customrecord_avataxheaderdetails', nlapiGetFieldValue('custpage_ava_headerid'), 'custrecord_ava_documentstatus');
		CancelType = (AVA_DocStatus == 1)? 'DocDeleted' : 'DocVoided';
		CancelStatus = 'Cancelled';
		
		var CancelTax = AVA_CancelTax(CancelType);
//		AVA_DocID = nlapiLookupField('customrecord_avataxheaderdetails', nlapiGetFieldValue('custpage_ava_headerid'), 'custrecord_ava_documentid');
		
		if(CancelTax == 0 && AVA_DocStatus == 1)
		{
			nlapiDeleteRecord('customrecord_avataxheaderdetails', nlapiGetFieldValue('custpage_ava_headerid'));
		}
		else
		{
			nlapiSubmitField('customrecord_avataxheaderdetails', nlapiGetFieldValue('custpage_ava_headerid') , 'custrecord_ava_documentstatus', AVA_DocumentStatus(CancelStatus));
		}
	}
}

/*******************************************************************************************************
// START OF ADDING AVATAX TAB DURING RUN-TIME TO THE FOLLOWING ITEM TYPES
// 1. INVENTORY ITEM
// 2. ASSEMBLY ITEM
// 3. KIT
// 4. NON-INVENTORY ITEM
//      a. FOR RESALE
//      b. FOR SALE
// 5. OTHER CHARGE ITEM
//      a. FOR RESALE
//      b. FOR SALE
// 6. SERVICE ITEM
//		a. FOR RESALE
//		b. FOR SALE
*******************************************************************************************************/

function AVA_InventoryTabBeforeLoad(type, form) // Adds a tab to the Inventory form
{
	if(nlapiGetField('custpage_ava_readconfig') == null)
	{
		form.addField('custpage_ava_readconfig','longtext','ConfigRecord');
		form.getField('custpage_ava_readconfig').setDisplayType('hidden');
		AVA_ReadConfig('1');	
	}
	
	form.addField('custpage_ava_servicetypes', 'text', 'Service Types').setDisplayType('hidden');	
	form.getField('custpage_ava_servicetypes').setDefaultValue(AVA_ServiceTypes);
	
	// Flag identification to decide on which Inventory Item screen to add the tab.
	// Default Value 'F' - No adding of tab and 'T' for adding tab. 
	var AVA_DesignTab = 'F'; 
	
	if ((nlapiGetFieldValue('subtype') != 'Purchase') && (nlapiGetContext().getExecutionContext() == 'userinterface'))
	{
		form.getField('custitem_ava_udf1').setDisplayType('hidden');
		form.getField('custitem_ava_udf2').setDisplayType('hidden');
		form.getField('custitem_ava_taxcode').setDisplayType('hidden');
	}

	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
	{	
		switch(nlapiGetRecordType())
		{
			case 'inventoryitem':
			case 'lotnumberedinventoryitem':
			case 'serializedinventoryitem':
			case 'assemblyitem':
			case 'lotnumberedassemblyitem':
			case 'serializedassemblyitem':
			case 'kititem':
			case 'downloaditem':
			case 'giftcertificateitem':
				AVA_DesignTab = 'T'; 
				break;
			
			case 'noninventoryitem':
			case 'otherchargeitem':
			case 'serviceitem':
				if (nlapiGetFieldValue('subtype') != 'Purchase')
				{
					AVA_DesignTab = 'T'; 
				}
				break;
					
			default:
				break;
		}
		
		if (AVA_DesignTab == 'T')
		{
			form.addTab('custpage_avatab', 'AvaTax');
			
			var AVA_Udf1  = form.addField('custpage_ava_udf1', 'text', 'User Defined 1', null, 'custpage_avatab');
			AVA_Udf1.setMaxLength(250);
			
			var AVA_Udf2  = form.addField('custpage_ava_udf2', 'text', 'User Defined 2', null, 'custpage_avatab');
			AVA_Udf2.setMaxLength(250);
			
			var AVA_ItemMappingId = form.addField('custpage_ava_itemmapid', 'text', 'AVA Item Mapping ID', null);
			AVA_ItemMappingId.setDisplayType('hidden');
			
			var AVA_TaxCodeMapping  = form.addField('custpage_ava_taxcodemapping', 'text', 'AvaTax Tax Code', null, 'custpage_avatab');
			AVA_TaxCodeMapping.setMaxLength(25);
		
			if ((type == 'edit') || (type == 'view') || (type == 'xedit'))
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_itemid', null, 'anyof', nlapiGetRecordId());
				
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('custrecord_ava_itemudf1');
				columns[1] = new nlobjSearchColumn('custrecord_ava_itemudf2');
				columns[2] = new nlobjSearchColumn('custrecord_ava_itemtaxcodemapping');
					
				var searchresult = nlapiSearchRecord('customrecord_avaitemmapping', null, filters, columns);
				
				if (searchresult != null)
				{
					for(var i=0; searchresult != null && i < Math.min(1, searchresult.length) ; i++)
					{
						form.getField('custpage_ava_itemmapid').setDefaultValue(searchresult[i].getId());
						form.getField('custpage_ava_udf1').setDefaultValue(searchresult[i].getValue('custrecord_ava_itemudf1'));
						form.getField('custpage_ava_udf2').setDefaultValue(searchresult[i].getValue('custrecord_ava_itemudf2'));
						form.getField('custpage_ava_taxcodemapping').setDefaultValue(searchresult[i].getValue('custrecord_ava_itemtaxcodemapping'));
					}
				}
				else
				{
					form.getField('custpage_ava_udf1').setDefaultValue((nlapiGetFieldValue('custitem_ava_udf1') != null && nlapiGetFieldValue('custitem_ava_udf1').length > 0) ? nlapiGetFieldValue('custitem_ava_udf1') : '');
					form.getField('custpage_ava_udf2').setDefaultValue((nlapiGetFieldValue('custitem_ava_udf2') != null && nlapiGetFieldValue('custitem_ava_udf2').length > 0) ? nlapiGetFieldValue('custitem_ava_udf2') : '');
					form.getField('custpage_ava_taxcodemapping').setDefaultValue((nlapiGetFieldValue('custitem_ava_taxcode') != null && nlapiGetFieldValue('custitem_ava_taxcode').length > 0) ? nlapiGetFieldValue('custitem_ava_taxcode') : '');
				}
			}
			
			if (type == 'copy')
			{
				if (nlapiGetFieldValue('custitem_ava_taxcode') != null && nlapiGetFieldValue('custitem_ava_taxcode').length != 0)
				{
					form.getField('custpage_ava_taxcodemapping').setDefaultValue(nlapiGetFieldValue('custitem_ava_taxcode'));
				}

				if (nlapiGetFieldValue('custitem_ava_udf1') != null && nlapiGetFieldValue('custitem_ava_udf1').length != 0)
				{
					form.getField('custpage_ava_udf1').setDefaultValue(nlapiGetFieldValue('custitem_ava_udf1')); 
				}

				if (nlapiGetFieldValue('custitem_ava_udf2') != null && nlapiGetFieldValue('custitem_ava_udf2').length != 0)
				{
					form.getField('custpage_ava_udf2').setDefaultValue(nlapiGetFieldValue('custitem_ava_udf2'));
				}
			}
		}
	}
}

function AVA_InventorySaveRecord()
{
	if(nlapiGetFieldValue('custpage_ava_servicetypes') != null && nlapiGetFieldValue('custpage_ava_servicetypes').search('TaxSvc') != -1)
	{
		nlapiSetFieldValue('custitem_ava_udf1', nlapiGetFieldValue('custpage_ava_udf1'));
		nlapiSetFieldValue('custitem_ava_udf2', nlapiGetFieldValue('custpage_ava_udf2'));
		nlapiSetFieldValue('custitem_ava_taxcode', nlapiGetFieldValue('custpage_ava_taxcodemapping'));
	}
	return true;
}

function AVA_InventoryTabBeforeSubmit(type)
{
	if(nlapiGetFieldValue('custpage_ava_servicetypes') != null && nlapiGetFieldValue('custpage_ava_servicetypes').search('TaxSvc') != -1)
	{
		if(nlapiGetContext().getExecutionContext() != 'csvimport')
		{
			nlapiSetFieldValue('custitem_ava_udf1',nlapiGetFieldValue('custpage_ava_udf1'));
			nlapiSetFieldValue('custitem_ava_udf2',nlapiGetFieldValue('custpage_ava_udf2'));
			nlapiSetFieldValue('custitem_ava_taxcode',nlapiGetFieldValue('custpage_ava_taxcodemapping'));
		}
	}
}


function AVA_InventoryTabAfterSubmit(type)
{
	if (nlapiGetRecordId() > 0)
	{
		if(nlapiGetFieldValue('custpage_ava_readconfig') != null && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
		{
			AVA_ReadConfig('1');
		}

		if (nlapiGetContext().getExecutionContext() == 'csvimport')
		{
			var ItemInactive = nlapiLookupField('item', nlapiGetRecordId(), 'isinactive');
			ItemInactive = (ItemInactive == null) ? 'F' : ItemInactive;
		}
		else
		{
			ItemInactive = nlapiGetFieldValue('isinactive');
			ItemInactive = (ItemInactive == null)? nlapiLookupField('item', nlapiGetRecordId(), 'isinactive'): ItemInactive;
		}

		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1 && ItemInactive != 'T')
		{	
			var record, AVA_ItemSet = 'F';
			var UDF1 = nlapiGetFieldValue('custitem_ava_udf1');
			var UDF2 = nlapiGetFieldValue('custitem_ava_udf2');
			var MapId;
		
			if(type == 'xedit')
			{		
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_itemid', null, 'anyof', nlapiGetRecordId());
				
				var searchresult = nlapiSearchRecord('customrecord_avaitemmapping', null, filters, null);
				for(var i=0; searchresult != null && i < Math.min(1, searchresult.length) ; i++)
				{
					MapId = searchresult[i].getId();
				}
			}
			MapId = (MapId != null && MapId.length > 0) ? MapId : nlapiGetFieldValue('custpage_ava_itemmapid');
			var AvaTaxTaxcode =  nlapiGetFieldValue('custitem_ava_taxcode');
	
			if(((UDF1 !=null && UDF1.length !=0) || (UDF2 !=null && UDF2.length !=0) || (AvaTaxTaxcode !=null && AvaTaxTaxcode.length !=0)))
			{
				if (type == 'create')
				{
					record = nlapiCreateRecord('customrecord_avaitemmapping');
					AVA_ItemSet = 'T'
				}
				else if(type == 'edit' || type == 'xedit')
				{
					if(MapId != null && MapId.length != 0)
					{
						record = nlapiLoadRecord('customrecord_avaitemmapping', MapId);
						AVA_ItemSet = 'T'
					}
					else
					{
						record = nlapiCreateRecord('customrecord_avaitemmapping');
						AVA_ItemSet = 'T'
					}
				}

				if(AVA_ItemSet == 'T')
				{
					record.setFieldValue('custrecord_ava_itemid',     nlapiGetRecordId());
					record.setFieldValue('custrecord_ava_itemudf1',   nlapiGetFieldValue('custitem_ava_udf1'));
					record.setFieldValue('custrecord_ava_itemudf2',   nlapiGetFieldValue('custitem_ava_udf2'));
					record.setFieldValue('custrecord_ava_itemtaxcodemapping',   nlapiGetFieldValue('custitem_ava_taxcode'));
							
					var itemid = nlapiSubmitRecord(record, false);
				}
			}

			if ((type == 'delete' && MapId != null && MapId.length != 0) || ((UDF1==null || UDF1.length ==0) && (UDF2 ==null || UDF2.length ==0) && (AvaTaxTaxcode ==null || AvaTaxTaxcode.length ==0) && (MapId != null && MapId.length != 0)))
			{
				nlapiDeleteRecord('customrecord_avaitemmapping', MapId);
			}
		}
	}
}


function AVA_NoticePage(AVA_Message)
{
	var redirecttype = 'history.back()';
	var AVA_NoticeError = '<html><link rel="stylesheet" href="/core/styles/pagestyles.nl?ct=-142&bglt=EEEEEE&bgmd=FFEBC2&bgdk=787878&bgon=211F5E&bgoff=FFCC66&bgbar=211F5E&tasktitletext=FFCC66&crumbtext=FFD88A&headertext=B39163&ontab=FFFFFF&offtab=000033&text=000000&link=000000&bgbody=FFFFFF&bghead=FFFFFF&portlet=D3D2DF&portletlabel=000000&bgbutton=FFE599&bgrequiredfld=FFFFE5&font=Verdana%2CHelvetica%2Csans-serif&size_site_content=8pt&size_site_title=8pt&size=1.0&nlinputstyles=T&NS_VER=2007.0.5">' +
								'<body bgcolor="#FFFFFF" link="#000000" vlink="#000000" alink="#330099" text="#000000" topmargin=0 marginheight=1>' +
								'<img src="/images/nav/stretch.gif" width="10">' +
								'<img src="/images/logos/netsuite30.gif" border=0>' +
								'<TABLE border=0 cellPadding=0 cellSpacing=0 width=100%>' +
									'<tr><td class=bglt>' +
										'<table border=0 cellspacing=0 cellpadding=5 width=100%>' +
											'<tr><td class=textboldnolink>Notice</td></tr>' +
											'<tr><td vAlign=top><table border=0 cellspacing=0 cellpadding=0 width=100%>' +
												'<TR><TD class=text>&nbsp;</TD></TR>' + 
												'<tr><td class=text><img src="/images/5square.gif" width=5 height=5>\t' + AVA_Message + '</td></tr>' +
												'<TR><TD class=text>&nbsp;</TD></TR>' +
												'</table></td>' +
											'</tr>' +
										'</TABLE></TD>' +
									'<tr><TD style="" >' +
										'<table id="tbl_goback" cellpadding=0 cellspacing=0 border=0 style="cursor:hand;">' +
											'<TR><TD class=text>&nbsp;</TD></TR>' +
											'<tr>' +
												'<td nowrap class="rndbuttoncaps" background="/images/buttons/upper_left_cap.gif"><img src="/images/nav/stretch.gif" border=0 width=4></td>' +
													'<TD height=20 valign="bottom" nowrap class="rndbuttonbody" background="/images/buttons/upper_body.gif" style="padding-top:2">' +
//													'<INPUT type="button" style="vertical-align:middle; " class="rndbuttoninpt" value="Go Back" id="goback" name="goback" onclick="history.back();return false;" ></TD>' +
													'<INPUT type="button" style="vertical-align:middle; " class="rndbuttoninpt" value="Go Back" id="goback" name="goback" onclick="' + redirecttype + ';return false;" ></TD>' +
													'<td nowrap class="rndbuttoncaps" background="/images/buttons/upper_right_cap.gif"><img src="/images/nav/stretch.gif" border=0 width=4></td>' +
											'</tr>' + 
										'</table></TD>' +
									'</tr>' +
								'</TABLE></HTML>';
	return AVA_NoticeError;
	
}

function AVA_DateFormat(Date_Format, AVA_Date)
{
	var year = AVA_Date.substring(0,4);
	var month = AVA_Date.substring(5,7);
	var day = parseInt(AVA_Date.substring(8,10), 10);
	
	if (Date_Format == 'MM/DD/YYYY')
	{
		AVA_Date = month + '/' + day + '/' + year;
	}
	else if (Date_Format == 'DD/MM/YYYY')
	{
		AVA_Date = day + '/' + month + '/' + year;
	}
	else if(Date_Format == 'DD-Mon-YYYY' || Date_Format == 'DD-MON-YYYY')
	{   
		var monthname = AVA_GetMonthName(parseInt(month, 10));
		AVA_Date = day + '-' + monthname.substring(0,3) + '-' + year;
	}
	else if(Date_Format == 'DD.MM.YYYY')
	{
		AVA_Date = day + '.' + month + '.' + year;
	}
	else if(Date_Format == 'DD-MONTH-YYYY')
	{
		var monthname = AVA_GetMonthName(parseInt(month, 10));
		AVA_Date = day + '-' + monthname + '-' + year;
	} 
	else if(Date_Format == 'DD MONTH, YYYY')
	{
		var monthname = AVA_GetMonthName(parseInt(month, 10));
		AVA_Date = day + ' ' + monthname + ', ' + year;
	} 
	else if(Date_Format === 'YYYY/MM/DD')
	{
		AVA_Date = year + '/' + month + '/' + day;
	} 
	else if(Date_Format == 'YYYY-MM-DD')
	{
		AVA_Date = year + '-' + month + '-' + day;
	} 
	return AVA_Date;
}

function AVA_GetMonthName(MonthName)
{
	var month;
	switch(MonthName)
	{
		case 1:
			month = 'January';
			break;
			
		case 'JANUARY':
		case 'January':
		case 'JAN':
		case 'Jan':
			month = '01';
			break;
			
		case 2:
			month = 'February';
			break;

		case 'FEBRUARY':
		case 'February':
		case 'FEB':
		case 'Feb':
			month = '02';
			break;

		case 3:
			month = 'March';
			break;

		case 'MARCH':
		case 'March':
		case 'MAR':
		case 'Mar':
			month = '03';
			break;

		case 4:
			month = 'April';
			break;

		case 'APRIL':
		case 'April':
		case 'APR':
		case 'Apr':
			month = '04';
			break;

		case 5:
			month = 'May';
			break;

		case 'MAY':
		case 'May':
			month = '05';
			break;

		case 6:
			month = 'June';
			break;

		case 'JUNE':
		case 'June':
		case 'JUN':
		case 'Jun':
			month = '06';
			break;

		case 7:
			month = 'July';
			break;

		case 'JULY':
		case 'July':
		case 'JUL':
		case 'Jul':
			month = '07';
			break;

		case 8:
			month = 'August';
			break;

		case 'AUGUST':
		case 'August':
		case 'AUG':
		case 'Aug':
			month = '08';
			break;

		case 9:
			month = 'September';
			break;

		case 'SEPTEMBER':
		case 'September':
		case 'SEP':
		case 'Sep':
			month = '09';
			break;

		case 10:
			month = 'October';
			break;

		case 'OCTOBER':
		case 'October':
		case 'OCT':
		case 'Oct':
			month = '10';
			break;

		case 11:
			month = 'November';
			break;

		case 'NOVEMBER':
		case 'November':
		case 'NOV':
		case 'Nov':
			month = '11';
			break;

		case 12:
			month = 'December';
			break;

		case 'DECEMBER':
		case 'December':
		case 'DEC':
		case 'Dec':
			month = '12';
			break;

		default:
			break;
	}
	return month; 
}

function AVA_ReadConfig(type)
{
	if(type == '0')
	{
		var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
		for(var i=0; searchresult != null && i < searchresult.length; i++)
		{
			var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[i].getId());
			AVA_LoadValuesToGlobals(record);
		}
	}
	else
	{
		if(nlapiGetField('custpage_ava_readconfig') != null)
		{
			var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
			for(var i=0; searchresult != null && i < searchresult.length; i++)
			{
				var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[i].getId());
				nlapiSetFieldValue('custpage_ava_readconfig', JSON.stringify(record));
				AVA_LoadValuesToGlobals(record);
			}
		}
		else
		{
			if(nlapiGetFieldValue('custpage_ava_readconfig') != null) // && nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
			{
				if(nlapiGetFieldValue('custpage_ava_readconfig').length > 0)
				{
					AVA_LoadValuesFromField();
				}
			}
			else
			{
				//During Cancel Orders & Approve Orders
				var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[i].getId());
					nlapiSetFieldValue('custpage_ava_readconfig', JSON.stringify(record));
					AVA_LoadValuesToGlobals(record);
				}
			}
		}
	}
}

function AVA_LoadValuesFromField()
{
	var record = JSON.parse(nlapiGetFieldValue('custpage_ava_readconfig'));
	/* Header level Details */
	AVA_AccountValue = record['custrecord_ava_accountvalue']; 
	AVA_LicenseKey = record['custrecord_ava_licensekey'];  
	AVA_ServiceUrl = record['custrecord_ava_url']; 
	AVA_ExpiryDate = record['custrecord_ava_expirydate'];  
	AVA_ServiceTypes = record['custrecord_ava_servicetypes']; 
	
	/* General Tab Elements Detail */
	AVA_UDF1 = record['custrecord_ava_udf1'];  
	AVA_UDF2 = record['custrecord_ava_udf2'];  
	AVA_EntityUseCode = record['custrecord_ava_entityusecode']; 
	AVA_ItemAccount = record['custrecord_ava_itemaccount']; 
	AVA_TaxCodeMapping = record['custrecord_ava_taxcodemapping'];
	AVA_DefaultShippingCode = record['custrecord_ava_defshipcode']; 
	AVA_DefaultMiscCode = record['custrecord_ava_defmisccode']; 
	AVA_CustomerCode = record['custrecord_ava_customercode']; 
	AVA_MarkCustTaxable = record['custrecord_ava_markcusttaxable'];
	AVA_DefaultCustomerTaxcode = record['custrecord_ava_defaultcustomer'];
	AVA_BillableTimeName = record['custrecord_ava_billtimename'];
	AVA_ShowMessages = record['custrecord_ava_showmessages'];
	
	/* Tax Calculation Elements Details */  
	AVA_DisableTax  = record['custrecord_ava_disabletax'];  
	AVA_DisableLine  = record['custrecord_ava_disableline']; 
	AVA_CalculateonDemand = record['custrecord_ava_taxondemand']; 
	AVA_DefaultTaxCode = record['custrecord_ava_deftaxcode']; 
	AVA_EnableLogging = record['custrecord_ava_enablelogging'];
	AVA_DecimalPlaces = record['custrecord_ava_decimalplaces'];
	AVA_TaxRate = record['custrecord_ava_taxrate'];
	AVA_UsePostingPeriod = record['custrecord_ava_usepostingdate'];
	AVA_TaxInclude       = record['custrecord_ava_taxinclude'];
	AVA_EnableDiscount = record['custrecord_ava_enablediscount'];
	AVA_DiscountMapping = record['custrecord_ava_discountmapping'];
	AVA_DiscountTaxCode = record['custrecord_ava_discounttaxcode'];
	AVA_DisableLocationCode = record['custrecord_ava_disableloccode'];
	AVA_EnableUpcCode = record['custrecord_ava_enableupccode'];
	
	AVA_AbortBulkBilling = record['custrecord_ava_abortbulkbilling'];
	AVA_AbortUserInterfaces = record['custrecord_ava_abortuserinterfaces'];
	AVA_AbortWebServices = record['custrecord_ava_abortwebservices'];
	AVA_AbortCSVImports  = record['custrecord_ava_abortcsvimports'];
	AVA_AbortScheduledScripts  = record['custrecord_ava_abortscheduledscripts'];
	AVA_AbortSuitelets = record['custrecord_ava_abortsuitelets'];
	
	/* Address Validation Elements Details */
	AVA_DisableAddValidation = record['custrecord_ava_disableaddvalidation'];  
	AVA_AddUpperCase = record['custrecord_ava_adduppercase']; 
	AVA_AddBatchProcessing = record['custrecord_ava_addbatchprocessing']; 
	AVA_EnableAddValonTran = record['custrecord_ava_enableaddvalontran']; 
	
	AVA_Def_Addressee		 = record['custrecord_ava_addressee'];
	AVA_Def_Addr1			 = record['custrecord_ava_address1'];
	AVA_Def_Addr2			 = record['custrecord_ava_address2'];
	AVA_Def_City			 = record['custrecord_ava_city'];
	AVA_Def_State			 = record['custrecord_ava_state'];
	AVA_Def_Zip				 = record['custrecord_ava_zip'];
	var ReturnCountryName    = AVA_CheckCountryName(record['custrecord_ava_country']);
	AVA_Def_Country          = ReturnCountryName[1];
}

function LTrim(str)
{
	for (var i=0; ((str.charAt(i)<=" ")&&(str.charAt(i)!="")); i++);
	return str.substring(i,str.length);
}

function RTrim(str)
{
	for (var i=str.length-1; ((str.charAt(i)<=" ")&&(str.charAt(i)!="")); i--);
	return str.substring(0,i+1);
}

function Trim(str)
{
	return LTrim(RTrim(str));
}

function AVA_ViewTaxDetails(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 6 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_GetTaxHistoryForm = nlapiCreateForm('AvaTax Transaction Details');
			AVA_GetTaxHistoryForm.setTitle('AvaTax Transaction Details');
			
			AVA_ReadConfig('0'); 
			var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey); 
			var headers = AVA_Header(security);
			var body = AVA_GetTaxHistory(request.getParameter('doctype'),request.getParameter('doccode'));
			var soapPayload = AVA_GetTaxEnvelope(headers + body);
			
			var soapHead = new Array();
			soapHead['Content-Type'] = 'text/xml';
			soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/GetTaxHistory';
		
			var AVA_GetHistoryResponse = nlapiRequestURL(AVA_ServiceUrl + '/tax/taxsvc.asmx' , soapPayload, soapHead);
			if (AVA_GetHistoryResponse.getCode() == 200)
			{
				var soapText = AVA_GetHistoryResponse.getBody();
				var soapXML = nlapiStringToXML(soapText);
				
				var GetTaxHistoryResult = nlapiSelectNode(soapXML, "//*[name()='GetTaxHistoryResult']");
				var ResultCode = nlapiSelectValue( GetTaxHistoryResult, "//*[name()='ResultCode']");
				
				if (ResultCode == 'Success') 
				{
					var GetTaxRequest = nlapiSelectNode(soapXML, "//*[name()='GetTaxRequest']");
					var GetTaxResult = nlapiSelectNode(soapXML, "//*[name()='GetTaxResult']");
					
					AVA_GetTaxHistoryForm.addField('ava_docno',     'text',   'AvaTax Document No');
					AVA_GetTaxHistoryForm.getField('ava_docno').setDefaultValue(nlapiSelectValue( GetTaxResult, "./*[name()='DocCode']"));
					AVA_GetTaxHistoryForm.getField('ava_docno').setDisplayType('inline');
					
					AVA_GetTaxHistoryForm.addField('ava_customer',    'text',   'Customer');
					AVA_GetTaxHistoryForm.getField('ava_customer').setDefaultValue(nlapiSelectValue( GetTaxRequest, "./*[name()='CustomerCode']"));
					AVA_GetTaxHistoryForm.getField('ava_customer').setDisplayType('inline');
					
					AVA_GetTaxHistoryForm.addField('ava_docdate',   'text',   'Document Date');
					AVA_GetTaxHistoryForm.getField('ava_docdate').setDefaultValue(AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'), nlapiSelectValue( GetTaxResult, "./*[name()='DocDate']")));
					AVA_GetTaxHistoryForm.getField('ava_docdate').setDisplayType('inline');
					
					AVA_GetTaxHistoryForm.addField('ava_docstatus',   'text',   'Document Status');
					AVA_GetTaxHistoryForm.getField('ava_docstatus').setDefaultValue(nlapiSelectValue( GetTaxResult, "./*[name()='DocStatus']"));
					AVA_GetTaxHistoryForm.getField('ava_docstatus').setDisplayType('inline');
					
					AVA_GetTaxHistoryForm.addField('ava_calcdate',    'text',   'Tax Calculation Date');
					AVA_GetTaxHistoryForm.getField('ava_calcdate').setDefaultValue(AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'),nlapiSelectValue( GetTaxResult, "./*[name()='TaxDate']")));
					AVA_GetTaxHistoryForm.getField('ava_calcdate').setDisplayType('inline');
					
					AVA_GetTaxHistoryForm.addField('ava_doctype',   'text',   'Document Type');
					AVA_GetTaxHistoryForm.getField('ava_doctype').setDefaultValue(nlapiSelectValue( GetTaxResult, "./*[name()='DocType']"));
					AVA_GetTaxHistoryForm.getField('ava_doctype').setDisplayType('inline');
					
					AVA_GetTaxHistoryForm.addTab('custpage_avatab', 'AvaTax Transaction Details');
					AVA_GetTaxHistoryForm = AVA_GetHistoryTab( AVA_GetTaxHistoryForm, soapXML, 'custpage_avatab');
							
					var RecordType = request.getParameter('rectype');
					RecordType = (RecordType=='invoice')? 'Invoice': ((RecordType=='cashsale')? 'Cash Sale' : ((RecordType=='cashrefund') ? 'Cash Refund' : ((RecordType=='creditmemo') ? 'Credit Memo' : RecordType)));
								
					AVA_GetTaxHistoryForm.addPageLink('breadcrumb',RecordType,null);                      
					response.writePage(AVA_GetTaxHistoryForm);
				}
				else if(ResultCode == 'Warning')
				{
					nlapiLogExecution('DEBUG', 'Warning');
				}
				else if (ResultCode == 'Error' || ResultCode == 'Exception')
				{
					var AVA_Message = 'The selected document could not be found on AvaTax services. Please contact Avalara Support';
					var AVA_Notice = AVA_NoticePage(AVA_Message);
					response.write(AVA_Notice);
				}
			}
			else
			{
				var AVA_Message = 'Invalid Request. Please contact Avalara Support';
				var AVA_Notice = AVA_NoticePage(AVA_Message);
				response.write(AVA_Notice);
			}     
		}
	}
}

function AVA_GetHistoryTab(AVA_GetTaxHistoryForm, soapXML, Tab)
{
	var GetTaxRequest = nlapiSelectNode(soapXML, "//*[name()='GetTaxRequest']");
	var GetTaxResult = nlapiSelectNode(soapXML, "//*[name()='GetTaxResult']");
	var TaxLines = nlapiSelectNode(soapXML, "//*[name()='TaxLines']");

	var TaxLine = new Array();
	TaxLine = nlapiSelectNodes(TaxLines, "./*[name()='TaxLine']");

	var Lines = nlapiSelectNode(soapXML, "//*[name()='Lines']");
	var Line = new Array();
	
	Line = nlapiSelectNodes(Lines, "./*[name()='Line']");
		
	AVA_GetTaxHistoryForm.addField('ava_totalamount', 'currency', 'Total Amount',       null, Tab);
	AVA_GetTaxHistoryForm.getField('ava_totalamount').setDefaultValue( nlapiFormatCurrency( nlapiSelectValue( GetTaxResult, "./*[name()='TotalAmount']")));
	AVA_GetTaxHistoryForm.getField('ava_totalamount').setDisplayType('inline');
								
	AVA_GetTaxHistoryForm.addField('ava_totaldiscount', 'currency', 'Total Discount',       null, Tab);
	AVA_GetTaxHistoryForm.getField('ava_totaldiscount').setDefaultValue( nlapiFormatCurrency( nlapiSelectValue( GetTaxResult, "./*[name()='TotalDiscount']")));
	AVA_GetTaxHistoryForm.getField('ava_totaldiscount').setDisplayType('inline');
					
	AVA_GetTaxHistoryForm.addField('ava_nontaxable',  'currency', 'Total Non-Taxable',    null, Tab);
	AVA_GetTaxHistoryForm.getField('ava_nontaxable').setDefaultValue( nlapiFormatCurrency( nlapiSelectValue( GetTaxResult, "./*[name()='TotalExemption']")));
	AVA_GetTaxHistoryForm.getField('ava_nontaxable').setDisplayType('inline');
									
	AVA_GetTaxHistoryForm.addField('ava_taxable',   'currency', 'Total Taxable',      null, Tab);
	AVA_GetTaxHistoryForm.getField('ava_taxable').setDefaultValue( nlapiFormatCurrency( nlapiSelectValue( GetTaxResult, "./*[name()='TotalTaxable']")));
	AVA_GetTaxHistoryForm.getField('ava_taxable').setDisplayType('inline');
																	
	AVA_GetTaxHistoryForm.addField('ava_totaltax',    'currency', 'Total Tax',        null, Tab);
	AVA_GetTaxHistoryForm.getField('ava_totaltax').setDefaultValue( nlapiFormatCurrency( nlapiSelectValue( GetTaxResult, "./*[name()='TotalTax']")));
	AVA_GetTaxHistoryForm.getField('ava_totaltax').setDisplayType('inline');
									
	var html = '<table cellpadding="2" align="center"><caption><font size="2"><b>Tax Details</b></font></caption><tr><td bgcolor="#CCCCCC"><font size="2"><b>No</b></font></td><td bgcolor="#CCCCCC" align="center"><font size="2"><b>Item</b></font></td><td bgcolor="#CCCCCC" align="center"><font size="2"><b>Taxcode</b></font></td><td bgcolor="#CCCCCC" align="center"><font size="2"><b>Use Code</b></font></td><td bgcolor="#CCCCCC" align="center"><font size="2"><b>Discount</b></font></td><td bgcolor="#CCCCCC" align="center"><font size="2"><b>Exemption</b></font></td><td bgcolor="#CCCCCC" align="center"><font size="2"><b>Taxable</b></font></td><td bgcolor="#CCCCCC" align="center"><font size="2"><b>Rate</b></font></td><td bgcolor="#CCCCCC" align="center" colspan="2"><font size="2"><b>Tax</b></font></td><td bgcolor="#CCCCCC" align="center" colspan="2"><font size="2"><b>Tax Included</b></font></tr>';
	
	for(var j=0 ; j < TaxLine.length ; )
	{
		for(var i=0; i < TaxLine.length ; i++)
		{
			if(parseFloat(nlapiSelectValue( TaxLine[i], "./*[name()='No']")) == parseFloat(j+1))
			{
				html += '<tr>';
				html += '<td><font size="2">' + nlapiSelectValue( TaxLine[i], "./*[name()='No']")             + '</font></td>';//item number
				html += '<td><font size="2">' + nlapiSelectValue( Line[i], "./*[name()='ItemCode']")          + '</font></td>';//item name
				html += '<td align="right"><font size="2">' + nlapiSelectValue( TaxLine[i], "./*[name()='TaxCode']") + '</font></td>';//Taxcode
				html += '<td align="right"><font size="2">' + ((nlapiSelectValue( Line[i], "./*[name()='CustomerUsageType']") != null && nlapiSelectValue( Line[i], "./*[name()='CustomerUsageType']").length > 0) ? nlapiSelectValue( Line[i], "./*[name()='CustomerUsageType']") : nlapiSelectValue( GetTaxRequest, "./*[name()='CustomerUsageType']")) + '</font></td>';//UseCode
				html += '<td align="right"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue( TaxLine[i], "./*[name()='Discount']"))  + '</font></td>';//discount
				html += '<td align="right"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue( TaxLine[i], "./*[name()='Exemption']")) + '</font></td>';//Exemption
				html += '<td align="right"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue( TaxLine[i], "./*[name()='Taxable']")) + '</font></td>';//Taxable
				html += '<td align="right"><font size="2">' + parseFloat(nlapiSelectValue( TaxLine[i], "./*[name()='Rate']"))   + '</font></td>';//Rate
				html += '<td align="right" colspan="2"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue( TaxLine[i], "./*[name()='Tax']"))   + '</font></td>';//Tax
				html += '<td align="right" colspan="2"><font size="2">' + ((nlapiSelectValue( TaxLine[i], "./*[name()='TaxIncluded']") == 'true') ? 'Yes' : 'No') + '</font></td>';//TaxIncluded
				html += '</tr>';
				
				html += '<tr><th></th><td bgcolor="#CCCCCC" align="center" colspan="3"><font size="2">Jurisdiction Type</font></td><td bgcolor="#CCCCCC" align="center"><font size="2">Jurisdiction</font></td><td bgcolor="#CCCCCC" align="center"><font size="2">Tax Name</font></td><td align="center" bgcolor="#CCCCCC"><font size="2">Rate</font></td><td align="center" bgcolor="#CCCCCC"><font size="2">Exempt</font></td><td align="center" bgcolor="#CCCCCC"><font size="2">Non-Taxable</font></td><td align="center" bgcolor="#CCCCCC"><font size="2">Taxable</font></td><td align="center" bgcolor="#CCCCCC"><font size="2">Tax</font></td></tr>';
				
				var TaxDetails = nlapiSelectNode(TaxLine[i], "./*[name()='TaxDetails']");
				var TaxDetail = new Array();
				TaxDetail = nlapiSelectNodes(TaxDetails, "./*[name()='TaxDetail']");
				for(var k=0; k < TaxDetail.length ; k++)
				{
					html += '<tr>';
					html += '<td></td>';
					html += '<td colspan="3"><font size="2">' + nlapiSelectValue( TaxDetail[k], "./*[name()='JurisType']")                    + '</font></td>';//JurisType
					html += '<td><font size="2">' + nlapiSelectValue( TaxDetail[k], "./*[name()='JurisName']")                    + '</font></td>';//JurisName
					html += '<td><font size="2">' + nlapiSelectValue( TaxDetail[k], "./*[name()='TaxName']")                    + '</font></td>';//TaxName
					html += '<td align="right"><font size="2">' + String(parseFloat(nlapiSelectValue( TaxDetail[k], "./*[name()='Rate']"))  * 100).substring(0,4) + '%</font></td>';//Rate
					html += '<td align="right"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue( TaxDetail[k], "./*[name()='Exemption']")) + '</font></td>';//Exemption
					html += '<td align="right"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue(TaxDetail[k], "./*[name()='NonTaxable']")) + '</font></td>';//Taxable
					html += '<td align="right"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue( TaxDetail[k], "./*[name()='Taxable']"))   + '</font></td>';//Rate
					html += '<td align="right"><font size="2">' + nlapiFormatCurrency(nlapiSelectValue( TaxDetail[k], "./*[name()='Tax']"))     + '</font></td>';//Tax
					html += '</tr>';
				}   
				html += '<tr><td colspan="11"><hr/></td></tr>';
				j++;
				break;
			}
		}
	}
	
	html += '</table>';

	var taxDetailHtml = AVA_GetTaxHistoryForm.addField('ava_linedetails', 'help',   html,  null, Tab);
	taxDetailHtml.setLayoutType('outsidebelow','startrow');
	
	return AVA_GetTaxHistoryForm;
	
}


function AVA_GetTaxHistory(RecordType, RecordId)
{
	var soap = null;
	soap = '\t<soap:Body>\n';
		soap += '\t\t<GetTaxHistory xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<GetTaxHistoryRequest>\n';
				soap += '\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
				soap += '\t\t\t\t<DocType><![CDATA[' + RecordType + ']]></DocType>\n';
				soap += '\t\t\t\t<DocCode><![CDATA[' + RecordId + ']]></DocCode>\n';  
				soap += '\t\t\t\t<DetailLevel>Tax</DetailLevel>\n';
			soap += '\t\t\t</GetTaxHistoryRequest>\n';
		soap += '\t\t</GetTaxHistory>\n';   
	soap += '\t</soap:Body>\n';
		
	return soap;  
}

function AVA_ReturnCoordinates(EntityId, ShipAddressId)
{
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_custid', null, 'is', EntityId);
	filters[1] = new nlobjSearchFilter('custrecord_ava_addid', null, 'is', ShipAddressId);

	var cols = new Array();
	cols[0] = new nlobjSearchColumn('custrecord_ava_latitude');
	cols[1] = new nlobjSearchColumn('custrecord_ava_longitude');
	
	var result = new Array();
	
	var searchresult = nlapiSearchRecord('customrecord_avacoordinates', null, filters, cols);		
	if (searchresult != null)
	{
		for(var m=0; searchresult != null && m < searchresult.length; m++)
		{
			result[0] = 1;
			result[1] = searchresult[m].getValue('custrecord_ava_latitude');
			result[2] = searchresult[m].getValue('custrecord_ava_longitude');
		}
	}
	else
	{
		result[0] = 0;
	}
	return result;
}

function AVA_TransactionFieldChange(type, name)
{
	try
	{
		if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
		{
			var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;	
			
			if(type == 'item' && name == 'shipaddress')
			{
				if (AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
				{
					if (nlapiGetCurrentLineItemValue('item', 'shipaddress') != null && nlapiGetCurrentLineItemValue('item', 'shipaddress').length > 0)
					{
						if(nlapiGetCurrentLineItemValue('item', 'custcol_ava_shiptousecode') != null)
						{
							var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=customrecord_avaentityusemapping_new&custid=' + nlapiGetFieldValue('entity') + '&addid=' + nlapiGetCurrentLineItemValue('item', 'shipaddress'), null, null );
							var AVA_ShipToUseCode = response.getBody();
							
							if (AVA_ShipToUseCode != null && AVA_ShipToUseCode.length > 0)
							{
								nlapiSetCurrentLineItemText('item', 'custcol_ava_shiptousecode', AVA_ShipToUseCode, false);
							}
							else
							{
								nlapiSetCurrentLineItemText('item', 'custcol_ava_shiptousecode', '', false);
							}
						}
					}
					else
					{
						if(nlapiGetCurrentLineItemValue('item', 'custcol_ava_shiptousecode') != null)
						{
							nlapiSetCurrentLineItemText('item', 'custcol_ava_shiptousecode', '', false);	
						}
						
					}
				}
			
				if (nlapiGetCurrentLineItemValue('item', 'shipaddress') != null && nlapiGetCurrentLineItemValue('item', 'shipaddress').length > 0)
				{
					if(nlapiGetCurrentLineItemValue('item', 'custcol_ava_shipto_latitude') != null && nlapiGetCurrentLineItemValue('item', 'custcol_ava_shipto_longitude') != null)
					{
						var Coordinates = AVA_ReturnCoordinates(nlapiGetFieldValue('entity'), nlapiGetCurrentLineItemValue('item', 'shipaddress'));
						if (Coordinates[0] == 1)
						{
							nlapiSetCurrentLineItemValue('item', 'custcol_ava_shipto_latitude', Coordinates[1], false);
							nlapiSetCurrentLineItemValue('item', 'custcol_ava_shipto_longitude', Coordinates[2], false);
						}
						else
						{
							nlapiSetCurrentLineItemValue('item', 'custcol_ava_shipto_latitude', '', false);
							nlapiSetCurrentLineItemValue('item', 'custcol_ava_shipto_longitude', '', false);
						}
					}
				}
				else
				{
					if(nlapiGetCurrentLineItemValue('item', 'custcol_ava_shipto_latitude') != null && nlapiGetCurrentLineItemValue('item', 'custcol_ava_shipto_longitude') != null)
					{
						nlapiSetCurrentLineItemValue('item', 'custcol_ava_shipto_latitude', '', false);
						nlapiSetCurrentLineItemValue('item', 'custcol_ava_shipto_longitude', '', false);
					}
				}
			}
			
			if (type == 'item' && name == 'custcol_ava_shiptousecode')
			{
				if (nlapiGetCurrentLineItemText('item', 'custcol_ava_shiptousecode') != null && nlapiGetCurrentLineItemText('item', 'custcol_ava_shiptousecode').length > 0)
				{
					if (nlapiGetCurrentLineItemValue('item', 'shipaddress') != null && nlapiGetCurrentLineItemValue('item', 'shipaddress').length <= 0)
					{
						alert('Please select Ship-To Address for passing the required Entity/Use-Code');
						nlapiSetCurrentLineItemText('item', 'custcol_ava_shiptousecode', '', false);
					}
				}
			}

			if(name == 'shipmethod')
			{
				if(nlapiGetFieldValue('shipmethod') != null && nlapiGetFieldValue('shipmethod').length > 0)
				{
					nlapiSetFieldValue('custpage_ava_shipping', 'T', false);
					nlapiSetFieldValue('custpage_ava_handling', 'T', false);
				}
				else
				{
					nlapiSetFieldValue('custpage_ava_shipping', 'F', false);
					nlapiSetFieldValue('custpage_ava_handling', 'F', false);
				}
			}
			
			if(nlapiGetLineItemCount('item') > 1 && (name == 'billaddresslist' || name == 'shipaddresslist'))
			{
				AVA_FieldChangeTaxCall = 'F';
			}
			
			if(type == 'itemcost' || type == 'expcost' || type == 'time')
			{
				if(name != 'apply')
				{
					AVA_FieldChangeTaxCall = 'F';
				}
			}

			if (name == 'shipaddresslist' && AVA_ValidFlag == 'F')
			{
				//Check for Entity/Use Code Values from Config and fetch the Entity/Use Code Mapping if any
				if ((AVA_EntityUseCode == 'T'  || AVA_EntityUseCode == true) && (nlapiGetFieldValue('ismultishipto') == null || nlapiGetFieldValue('ismultishipto') == 'F'))
				{
					if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0 && nlapiGetFieldValue('custbody_ava_shiptousecode') != null)
					{
						var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=customrecord_avaentityusemapping_new&custid=' + nlapiGetFieldValue('entity') + '&addid=' + nlapiGetFieldValue('shipaddresslist'), null, null );
						var AVA_ShipToUseCode = response.getBody();
						
						if (AVA_ShipToUseCode != null && AVA_ShipToUseCode.length > 0)
						{
							nlapiSetFieldText('custbody_ava_shiptousecode', AVA_ShipToUseCode, false);
						}
						else
						{
							nlapiSetFieldText('custbody_ava_shiptousecode', '', false);
						}
					}
					else
					{
						nlapiSetFieldText('custbody_ava_shiptousecode', '', false);
					}
				}
				
				if(nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude') != null)
				{
					if (nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length > 0 && nlapiGetFieldValue('shipaddresslist') > 0)
					{
						var Coordinates = AVA_ReturnCoordinates(nlapiGetFieldValue('entity'), nlapiGetFieldValue('shipaddresslist'));
						if (Coordinates[0] == 1)
						{
							nlapiSetFieldValue('custbody_ava_shipto_latitude', Coordinates[1], false);
							nlapiSetFieldValue('custbody_ava_shipto_longitude', Coordinates[2], false);
						}
						else
						{
							nlapiSetFieldValue('custbody_ava_shipto_latitude', '', false);
							nlapiSetFieldValue('custbody_ava_shipto_longitude', '', false);
						}
					}
					else
					{
						nlapiSetFieldValue('custbody_ava_shipto_latitude', '', false);
						nlapiSetFieldValue('custbody_ava_shipto_longitude', '', false);
					}
				}
			}
			
			if (name == 'custbody_ava_shiptousecode')
			{
				if (nlapiGetFieldText('custbody_ava_shiptousecode') != null && nlapiGetFieldText('custbody_ava_shiptousecode').length > 0)
				{
					if (nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist').length <= 0)
					{
						alert('Please select Ship-To Address for passing the required Entity/Use-Code');
						nlapiSetFieldText('custbody_ava_shiptousecode', '', false);
					}
				}
			}

			if (name == 'billaddresslist' && AVA_ValidFlag == 'F')
			{
				if (AVA_EntityUseCode == 'T' || AVA_EntityUseCode == true)
				{
					var UseCodeExists = 'F';
					if (nlapiGetFieldValue('shipaddresslist') == nlapiGetFieldValue('billaddresslist'))
					{
						if (nlapiGetFieldText('custbody_ava_shiptousecode').length > 0 && nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0)
						{
							nlapiSetFieldText('custbody_ava_billtousecode', nlapiGetFieldText('custbody_ava_shiptousecode'), false);
							UseCodeExists = 'T';
						}
					}
					
					if (UseCodeExists == 'F')
					{
						if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0 && nlapiGetFieldValue('custbody_ava_billtousecode') != null)
						{
							var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=customrecord_avaentityusemapping_new&custid=' + nlapiGetFieldValue('entity') + '&addid=' + nlapiGetFieldValue('billaddresslist'), null, null );
							var AVA_BillToUseCode = response.getBody();
							
							if (AVA_BillToUseCode != null && AVA_BillToUseCode.length > 0)
							{
								nlapiSetFieldText('custbody_ava_billtousecode', AVA_BillToUseCode, false);
							}
							else
							{
								nlapiSetFieldText('custbody_ava_billtousecode', '', false);
							}
						}
						else
						{
							nlapiSetFieldText('custbody_ava_billtousecode', '', false);
						}
					}
				}
			
				if (nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length > 0 && nlapiGetFieldValue('billaddresslist') > 0)
				{
					var LatLong = 'F';
					if (nlapiGetFieldValue('shipaddresslist') == nlapiGetFieldValue('billaddresslist'))
					{
						if (nlapiGetFieldValue('custbody_ava_shipto_latitude') != null && nlapiGetFieldValue('custbody_ava_shipto_longitude') != null && nlapiGetFieldValue('custbody_ava_billto_latitude') != null && nlapiGetFieldValue('custbody_ava_billto_longitude') != null && nlapiGetFieldValue('custbody_ava_shipto_latitude').length > 0 && nlapiGetFieldValue('custbody_ava_shipto_longitude').length > 0)
						{
							nlapiSetFieldValue('custbody_ava_billto_latitude', nlapiGetFieldValue('custbody_ava_shipto_latitude'), false);
							nlapiSetFieldValue('custbody_ava_billto_longitude', nlapiGetFieldValue('custbody_ava_shipto_longitude'), false);
							LatLong = 'T';
						}
					}
					
					if (LatLong == 'F')
					{
						if (nlapiGetFieldValue('custbody_ava_billto_latitude') != null && nlapiGetFieldValue('custbody_ava_billto_longitude') != null)
						{
							var Coordinates = AVA_ReturnCoordinates(nlapiGetFieldValue('entity'), nlapiGetFieldValue('billaddresslist'));
							if (Coordinates[0] == 1)
							{
								nlapiSetFieldValue('custbody_ava_billto_latitude', Coordinates[1], false);
								nlapiSetFieldValue('custbody_ava_billto_longitude', Coordinates[2], false);
							}
							else
							{
								nlapiSetFieldValue('custbody_ava_billto_latitude', '', false);
								nlapiSetFieldValue('custbody_ava_billto_longitude', '', false);
							}
						}
					}
				}
				else
				{
					nlapiSetFieldValue('custbody_ava_billto_latitude', '', false);
					nlapiSetFieldValue('custbody_ava_billto_longitude', '', false);
				}
			}
			
			if (name == 'custbody_ava_billtousecode')
			{
				if (nlapiGetFieldText('custbody_ava_billtousecode') != null && nlapiGetFieldText('custbody_ava_billtousecode').length > 0)
				{
					if (nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist').length <= 0)
					{
						alert('Please select Bill-To Address for passing the required Entity/Use-Code');
						nlapiSetFieldText('custbody_ava_billtousecode', '', false);
					}
				}
			}

			if(name == 'ismultishipto')
			{
				AVA_FieldChangeTaxCall = 'F';
				AVA_EnableDisableLatLongFields();
				AVA_EnableDisableEntityFields();
			}
			
			if(name == 'taxitem')
			{
				nlapiSetFieldValue('custpage_ava_formtaxcode', nlapiGetFieldText('taxitem'));
			}
		}
		return true;
	}
	catch(err)
	{
		nlapiLogExecution('DEBUG', 'AVA_TransactionFieldChange - Error', err.message);
	}
}

function AVA_GetEntity()
{
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('isperson');
	cols[1] = new nlobjSearchColumn('firstname');
	cols[2] = new nlobjSearchColumn('middlename');
	cols[3] = new nlobjSearchColumn('lastname');
	cols[4] = new nlobjSearchColumn('companyname');
	cols[5] = new nlobjSearchColumn('entityid');
	
	if (nlapiGetFieldValue('partner') != null && nlapiGetFieldValue('partner').length > 0)
	{
		var filters = new Array();
		//filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		filters[filters.length] = new nlobjSearchFilter('internalid', null, 'anyof', nlapiGetFieldValue('partner'));

		var searchResult = nlapiSearchRecord('partner', null, filters, cols);     
		if(searchResult != null && searchResult.length > 0)
		{
			nlapiSetFieldValue('custpage_ava_partnerid', JSON.stringify(searchResult));
		}
	}
	else
	{
		nlapiSetFieldValue('custpage_ava_partnerid', '');
	}
}

function AVA_FormatDate(Date_Format, AVA_Date)
{
	var AVA_FormattedDate = new Date();
		
	if (Date_Format == 'MM/DD/YYYY')//Checked
	{
		var SplitDate = AVA_Date.split('/');
		var year = SplitDate[2];
		var month = parseFloat(SplitDate[0])-1;
		var day = parseInt(SplitDate[1]);
		
		AVA_FormattedDate.setFullYear(year,month,day);
					
	}
	else if (Date_Format == 'DD/MM/YYYY')//Checked
	{
		var SplitDate = AVA_Date.split('/');
		var year = SplitDate[2];
		var month = parseFloat(SplitDate[1]) - 1;
		var day = parseInt(SplitDate[0]);
			
		AVA_FormattedDate.setFullYear(year,month,day);
						
	}
	else if(Date_Format == 'DD-Mon-YYYY' || Date_Format == 'DD-MONTH-YYYY')//Checked
	{ 
		var SplitDate = AVA_Date.split('-');
		var year = SplitDate[2];
		var month = parseFloat(AVA_GetMonthName(SplitDate[1])) - 1;
		var day = parseInt(SplitDate[0]);
			
		AVA_FormattedDate.setFullYear(year,month,day);
			
	}
	else if(Date_Format == 'DD.MM.YYYY')//Checked
	{
		var SplitDate = AVA_Date.split('.');
		var year = SplitDate[2];
		var month = parseFloat(SplitDate[1]) - 1;
		var day = parseInt(SplitDate[0]);
				
		AVA_FormattedDate.setFullYear(year,month,day);
				
	}
	else if(Date_Format == 'DD-MONTH-YYYY')//Checked
	{   
		var SplitDate = AVA_Date.split('-');
		var year = SplitDate[2];
		var month = parseFloat(AVA_GetMonthName(SplitDate[1])) - 1;
		var day = parseInt(SplitDate[0]);
					
		AVA_FormattedDate.setFullYear(year,month,day);

	} 
	else if(Date_Format == 'DD MONTH, YYYY')//Checked
	{
		var SplitDate = AVA_Date.split(' ');
		var year = SplitDate[2];
		var month = parseFloat(AVA_GetMonthName(SplitDate[1].substring(0,SplitDate[1].length-1))) - 1;
		var day = parseInt(SplitDate[0]);
							
		AVA_FormattedDate.setFullYear(year,month,day);
		
	} 
	else if(Date_Format === 'YYYY/MM/DD')
	{
		var SplitDate = AVA_Date.split('/');
		var year = SplitDate[0];
		var month = parseFloat(SplitDate[1]) - 1;
		var day = parseInt(SplitDate[2]);
					
		AVA_FormattedDate.setFullYear(year,month,day);
						
	} 
	else if(Date_Format == 'YYYY-MM-DD')
	{
		var SplitDate =AVA_Date.split('-');
		var year = SplitDate[0];
		var month = parseFloat(SplitDate[1]) - 1;
		var day = parseInt(SplitDate[2]);
					
		AVA_FormattedDate.setFullYear(year,month,day);
	} 
	
	return AVA_FormattedDate;
}

function AVA_RecordLoadSuitelet(request,reponse)
{
	try
	{
		var recordValues = '';
		var cols = new Array();	
		switch(request.getParameter('type'))
		{
			case 'location':
				var AddressList = new Array();
				var record = nlapiLoadRecord('location',request.getParameter('id'));
				AddressList[0] = (record.getFieldValue('name')!=null)?(record.getFieldValue('name')).substring(0,49) : '';
				AddressList[1] = (record.getFieldValue('addr1')!=null)?(record.getFieldValue('addr1')).substring(0,49) : '';
				AddressList[2] = (record.getFieldValue('addr2')!=null)?(record.getFieldValue('addr2')).substring(0,49) : '';
				AddressList[3] = '';
				AddressList[4] = (record.getFieldValue('city')!=null)?(record.getFieldValue('city')).substring(0,49) : '';
				AddressList[5] = (record.getFieldValue('state')!=null)?(record.getFieldValue('state')).substring(0,2) : '';
				AddressList[6] = (record.getFieldValue('zip')!=null)?(record.getFieldValue('zip')).substring(0,10) : '';
				AddressList[7] = (record.getFieldValue('country')!=null)?(record.getFieldValue('country')).substring(0,49) : '';
				recordValues = AddressList[0] + '+' + AddressList[1] + '+' + AddressList[2] + '+' + AddressList[3] + '+' + AddressList[4] + '+' + AddressList[5] + '+' + AddressList[6] + '+' + AddressList[7];
				break;
				
			case 'customer':
				var record = nlapiLoadRecord('customer',request.getParameter('id'));
				cols[0] = record.getFieldValue('isperson');
				cols[1] = record.getFieldValue('firstname');
				cols[2] = record.getFieldValue('middlename');
				cols[3] = record.getFieldValue('lastname');
				cols[4] = record.getFieldValue('companyname');
				cols[5] = record.getFieldValue('entityid');
				cols[6] = record.getFieldValue('partner');
				
				recordValues = cols[0] + '+' + cols[1] + '+' + cols[2] + '+' + cols[3] + '+' + cols[4] + '+' + cols[5] + '+' + cols[6];
				break;

			case 'partner':
				var record = nlapiLoadRecord('partner',request.getParameter('id'));
				cols[0] = record.getFieldValue('isperson');
				cols[1] = record.getFieldValue('firstname');
				cols[2] = record.getFieldValue('middlename');
				cols[3] = record.getFieldValue('lastname');
				cols[4] = record.getFieldValue('companyname');
				cols[5] = record.getFieldValue('entityid');
				
				recordValues = cols[0] + '+' + cols[1] + '+' + cols[2] + '+' + cols[3] + '+' + cols[4] + '+' + cols[5];
				break;
				
			case 'customrecord_avacustomerexemptmapping':
				var ExemptId = null;
				var filters1 = new Array();
				filters1[0] = new nlobjSearchFilter('custrecord_ava_exemptcustomerid', null, 'anyof', request.getParameter('id'));
				
				var cols1 = new Array();
				cols1[0] = new nlobjSearchColumn('custrecord_ava_exemptno');  
				var searchresult = nlapiSearchRecord('customrecord_avacustomerexemptmapping', null, filters1, cols1);     
				
				if(searchresult != null)
				{
					ExemptId = searchresult[0].getValue('custrecord_ava_exemptno');
				}
				recordValues = ExemptId;
				break;
						
			case 'customrecord_avaentityusemapping_new':
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_customerid_new', null, 'anyof', request.getParameter('custid'));
								
				var cols = new Array();
				cols[0] = new nlobjSearchColumn('custrecord_ava_customerid_new');
				cols[1] = new nlobjSearchColumn('custrecord_ava_addressid_new');
				cols[2] = new nlobjSearchColumn('custrecord_ava_entityusemap_new');
				
				var searchresult = nlapiSearchRecord('customrecord_avaentityusemapping_new', null, filters, cols);
				for(var i=0; searchresult != null && i < searchresult.length; i++)
				{
					if(searchresult[i].getValue('custrecord_ava_addressid_new') == request.getParameter('addid'))
					{
						recordValues = searchresult[i].getText('custrecord_ava_entityusemap_new');
						break;
					}
				}
				break;
						
			/*case 'salestaxitem':
				var filter = new Array();
				filter[0] = new nlobjSearchFilter('itemid',null,'is',request.getParameter('defcode'));
															
				var searchresult = nlapiSearchRecord('salestaxitem',null,filter,null); 
				if(searchresult==null)
				{
					searchresult = nlapiSearchRecord('taxgroup',null,filter,null); 
					recordValues = (searchresult!=null)? searchresult[0].getId() : '';
				}
				else
				{
					recordValues = searchresult[0].getId();
				}
				break;*/
			
			case 'employee':
				var cols = new Array();
				cols[0] = 'firstname';
				cols[1] = 'middlename';
				cols[2] = 'lastname';
				cols[3] = 'entityid';
				
				var EmpRec = null;
				try
				{
					EmpRec = nlapiLookupField('employee',request.getParameter('id'), cols);
					recordValues = (EmpRec['firstname']!=null && EmpRec['firstname'].length >0 ) ? (EmpRec['firstname'] + ((EmpRec['middlename']!=null && EmpRec['middlename'].length > 0) ? ( ' ' + EmpRec['middlename'] + ' ' ) : ' ') + EmpRec['lastname']) : EmpRec['entityid']; 
				}
				catch(err)
				{
				}
				break;
			
			case 'customrecord_avaconfig':
				var searchresult =  nlapiSearchRecord('customrecord_avaconfig', null, null, null);
				recordValues = (searchresult != null)? '0' : '1'; // 0 - Records Exists , 1 - No Records 
				break;  

			case 'customrecord_avareconcilebatch':
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_batchname', null, 'is', request.getParameter('batchname'));

				var searchresult = nlapiSearchRecord('customrecord_avareconcilebatch', null, filters, null);
				recordValues = (searchresult != null)? '0' : '1'; // 0 - Batch Name already Exists , 1 - Batch doesn't exist
				break;

			case 'customrecord_avarecalculatebatch':
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('name', null, 'is', request.getParameter('batchname'));

				var searchresult = nlapiSearchRecord('customrecord_avarecalculatebatch', null, filters, null);
				recordValues = (searchresult != null && searchresult.length > 0)? '0' : '1'; // 0 - Batch Name already Exists , 1 - Batch doesn't exist
				break;

			case 'item':
				var cols = new Array();
				cols[0] = 'itemid';
				cols[1] = 'custitem_ava_udf1';
				cols[2] = 'custitem_ava_udf2';
				cols[3] = 'custitem_ava_taxcode';
				cols[4] = 'incomeaccount';
				if(request.getParameter('upccodeflag') == 'T')
				{
					cols[5] = 'upccode';
				}

				var ItemRec = nlapiLookupField('item',request.getParameter('id'), cols);				
				
				var IncomeAccount = null;
				
				try
				{
					if(ItemRec['incomeaccount'] != null && ItemRec['incomeaccount'].length > 0)
					{
						IncomeAccount = nlapiLookupField('account',ItemRec['incomeaccount'], 'acctname');				
					}
				}
				catch(err)
				{
					IncomeAccount = ItemRec['incomeaccount'];
				}
				
				recordValues = ItemRec['itemid'] + '+' + ItemRec['custitem_ava_udf1'] + '+' + ItemRec['custitem_ava_udf2'] + '+' + ItemRec['custitem_ava_taxcode'] + '+' + IncomeAccount + '+' + ItemRec['upccode'];					
				break;
				
			case 'expensecategory':	
				recordValues = nlapiLookupField('expensecategory', request.getParameter('id'), 'name');				
				break;

			case 'customeraddr':
				var CustRec = nlapiLoadRecord('customer',request.getParameter('id'));

				for(var i = 1; i <= CustRec.getLineItemCount('addressbook'); i++)
				{
					if (CustRec.getLineItemValue('addressbook', 'addressid', i) == request.getParameter('addid'))
					{
						CustRec.setLineItemValue('addressbook', 'addr1', i, request.getParameter('line1'));
						CustRec.setLineItemValue('addressbook', 'addr2', i, request.getParameter('line2'));
						CustRec.setLineItemValue('addressbook', 'country', i, request.getParameter('country'));
						CustRec.setLineItemValue('addressbook', 'zip', i, request.getParameter('zipcode'));
						CustRec.setLineItemValue('addressbook', 'state', i, request.getParameter('state'));
						CustRec.setLineItemValue('addressbook', 'city', i, request.getParameter('city'));
						var recid = nlapiSubmitRecord(CustRec, false, true);
						break;
					}
				}
				recordValues = 'T';
				break;
				
			default:  
				break;
		}
		
		response.write(recordValues);
	}
	catch(err)
	{
		nlapiLogExecution('Debug','Error',err);
		nlapiLogExecution('Debug','Error Details',err.getDetails());
		//Exemption ID might not exist for each and every customer, in tht case while writing null value to response it can throw an er.or.
	}
}

function AVA_LogTaxResponse(AvaTaxDoc, response, StartTime)
{
	var MemoText;
	var authorname;

	if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
	{
		MemoText = AVA_LoggingTextBody(AvaTaxDoc, response, StartTime);
		nlapiSetFieldValue('custpage_ava_notemsg', MemoText);
	}
	else
	{
		if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 3)
		{
			if(nlapiGetFieldValue('custpage_ava_context') == 'userevent' || nlapiGetFieldValue('custpage_ava_context') == 'webservices' || nlapiGetFieldValue('custpage_ava_context') == 'csvimport' || nlapiGetFieldValue('custpage_ava_context') == 'scheduled' || nlapiGetFieldValue('custpage_ava_context') == 'suitelet' || nlapiGetFieldValue('custpage_ava_context') == 'webstore')
			{
				MemoText = AVA_LoggingTextBody(AvaTaxDoc, response, StartTime);
				nlapiSetFieldValue('custpage_ava_notemsg', MemoText);
			}
		}
		else
		{
			var DateTime = new Date();
			
			try
			{
				authorname = nlapiLookupField('employee', nlapiGetContext().getUser(), 'entityid');
			}
			catch(err)
			{
			}
			
			//Client side or BeforeSubmit(only if order go processed thru Bill Sales Order) log
			if(nlapiGetFieldValue('custpage_ava_notemsg') != null && nlapiGetFieldValue('custpage_ava_notemsg').length > 0)
			{
				var record = nlapiCreateRecord('customrecord_avatransactionlogs');
				record.setFieldValue('custrecord_ava_transaction', nlapiGetRecordId());
				var MemoText = nlapiGetFieldValue('custpage_ava_notemsg');
				MemoText = (MemoText != null) ? MemoText.substring(0,3990) : '';
				record.setFieldValue('custrecord_ava_note', MemoText);
				record.setFieldValue('custrecord_ava_title', 'AvaTax Log - Client');
				record.setFieldValue('custrecord_ava_creationdatetime', DateTime);
				
				if (authorname != null && authorname.length > 0)
				{
					record.setFieldValue('custrecord_ava_author', nlapiGetContext().getUser());
				}
				var recId = nlapiSubmitRecord(record, false);
			}
			
			var AVA_DocType = AVA_RecordType(); 
			if((AVA_DocType == 'SalesInvoice') || (AVA_DocType == 'ReturnInvoice'))
			{
				var MemoText = AVA_LoggingTextBody(AvaTaxDoc, response, StartTime);
				//Server side After Submit log
				var record = nlapiCreateRecord('customrecord_avatransactionlogs');
				record.setFieldValue('custrecord_ava_transaction', nlapiGetRecordId());
				record.setFieldValue('custrecord_ava_note', (MemoText != null) ? MemoText.substring(0,3990) : '');
				record.setFieldValue('custrecord_ava_title', 'AvaTax Log - Server');
				record.setFieldValue('custrecord_ava_creationdatetime', DateTime);
				
				if (authorname != null && authorname.length > 0)
				{
					record.setFieldValue('custrecord_ava_author', nlapiGetContext().getUser());
				}
				var recId = nlapiSubmitRecord(record, false);
			}
		}
	}
}

function AVA_LoggingTextBody(AvaTaxDoc, response, StartTime)
{
	var MemoText;

	if(AVA_EnableLogging == 'T' || AVA_EnableLogging == true)
	{

		if(AvaTaxDoc == 'T')
		{
			if(response != null)
			{
				var soapText = response.getBody();
				var soapXML = nlapiStringToXML(soapText);
				var GetTaxResult = nlapiSelectNode(soapXML, "//*[name()='GetTaxResult']");
				
				MemoText = 'The Document has used AvaTax Services.';
				MemoText += '\n ************************** SOAP Request Start ******************** ';
				MemoText += '\n SOAP Request Date & Time - ' + StartTime;
				MemoText += '\n AvaTax Document Type - ' + nlapiSelectValue( GetTaxResult, "//*[name()='DocType']");
				MemoText += '\n AvaTax Document Number - ' + nlapiSelectValue( GetTaxResult, "//*[name()='DocCode']");
			
				var RecordType = nlapiGetRecordType();
				var AVA_DocType = AVA_RecordType();
				
				if(AVA_DocType == 'SalesInvoice')
				{
					RecordType = (RecordType == 'invoice') ? 'Invoice' : ((RecordType == 'cashsale')? 'Cash Sale' : ((RecordType == 'cashrefund') ? 'Cash Refund' : 'Credit Memo'));
				}
				else
				{
					RecordType = (RecordType == 'salesorder') ? 'Sales Order' : ((RecordType == 'estimate') ? 'Estimate/Quote' : 'Return Authorization');
				}
				
				MemoText += '\n NetSuite Document Type - ' + RecordType + (nlapiGetFieldValue('custpage_ava_context') == 'webstore' ? '- Web Store' : '');
				
				MemoText += '\n NetSuite Document Date - ' + nlapiGetFieldValue('trandate');
				MemoText += '\n *************************** SOAP Request End ******************** ';
				MemoText += '\n ************************** SOAP Response Start ****************** ';
					
				if(response.getCode() == 200)
				{
					MemoText += '\n SOAP Response Status - ' + nlapiSelectValue( GetTaxResult, "//*[name()='ResultCode']");
					MemoText += '\n SOAP Response - ' + soapText;
					
					var FirstRespArr = MemoText.split('<TaxLines>',2);
					if(FirstRespArr != null && FirstRespArr.length > 1)
					{
						var SecondRespArr = FirstRespArr[1].split('<Locked>',2);
						var ThirdRespArr = SecondRespArr[1].split('TaxSummary>',3);
						if(ThirdRespArr[0] != null && ThirdRespArr[0].length > 0)
						{
							MemoText = FirstRespArr[0] + '<TaxLines/><TaxAddresses/><Locked>' + ThirdRespArr[0].substring(0,ThirdRespArr[0].length-1) + ThirdRespArr[2];
						}
					}
				}
				else
				{
					MemoText += '\n SOAP Response Status - Error: Invalid keys were entered';
					MemoText += '\n SOAP Response - ' + soapText;
				}
			
				MemoText += '\n ************************** SOAP Response End ********************';
			}
			else
			{
				MemoText = 'This Document has used AvaTax Services. ';
				
				if(AVA_ErrorCode != 0 && IsNumeric(AVA_ErrorCode.toString()) == false)
				{
					MemoText += AVA_ErrorCode;
				}
			}
		}
		else
		{
			MemoText = 'This Document has not used AvaTax Services. ';
			
			if(nlapiGetFieldValue('custpage_ava_taxcodestatus') != 1)
			{
				MemoText += (IsNumeric(AVA_ErrorCodeDesc(AVA_ErrorCode).toString()) == false) ? AVA_ErrorCodeDesc(AVA_ErrorCode) : '';
			}
		} 
	}
	else
	{
		if(AvaTaxDoc == 'T')
		{
			MemoText = 'The Tax calculation call to AvaTax was successful. ';
			
			if(AVA_ErrorCode != 0 && IsNumeric(AVA_ErrorCode.toString()) == false)
			{
				MemoText += AVA_ErrorCode;
			}
		}
		else
		{
			MemoText = 'This Document has not used AvaTax Services. ';
		
			if(nlapiGetFieldValue('custpage_ava_taxcodestatus') != 1)
			{
				MemoText += (IsNumeric(AVA_ErrorCodeDesc(AVA_ErrorCode).toString()) == false) ? AVA_ErrorCodeDesc(AVA_ErrorCode) : '';
			}
		} 
	}
		
	return MemoText;
}

function IsNumeric(sText)
{
	var ValidChars = "0123456789";
	var IsNumber = true;
	var Char;
	
	for (i = 0; (i < 4 || i < sText.length) && IsNumber == true; i++) 
	{ 
		Char = sText.charAt(i); 
		if (ValidChars.indexOf(Char) == -1) 
		{
			IsNumber = false;
		}
	}
	
	return IsNumber;
}

function AVA_CheckService(ServiceType)
{
	var AVA_Message = 'This service is not enabled in your AvaTax account. Please contact Avalara support.';
	
	try
	{
		AVA_ReadConfig('0');
		
		switch(ServiceType)
		{
			case 'TaxSvc': 	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') != -1)
						 		return 0;
							break;
			case 'AddressSvc': 	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('AddressSvc') != -1)
						 		return 0;
							break;
			case 'AvaCert2Svc': 	if(AVA_ServiceTypes != null && AVA_ServiceTypes.search('AvaCert2Svc') != -1)
						 		return 0;
							break;
			case 'BatchSvc': 	if(AVA_EnableBatchService == 'T' && (AVA_Username != null && AVA_Username.length > 0)  && (AVA_Password != null &&  AVA_Password.length > 0))
						 		{
									return 0;
						 		}
								else
								{
									AVA_Message = 'This feature is not enabled in your AvaTax Configuration. Please contact the Administrator.';
								}
							break;
			default: 			break;
		}
		
		var AVA_Notice = AVA_NoticePage(AVA_Message);
		response.write(AVA_Notice);
	}
	catch(err)
	{
		var AVA_Notice = AVA_NoticePage(AVA_Message);
		response.write(AVA_Notice);
	}
}

function AVA_CheckSecurity( SuiteletNumber )
{
	var AVA_Message = 'You do not have access to this functionality. Contact the system administrator';

	try
	{
	   var RoleId = nlapiGetContext().getRole();
	   
	   if (RoleId !=  3)
	   {
	   	var AssignedRoleID = AVA_GetSuiteletParameter(SuiteletNumber);
	   	
	       var RoleExists = 'F';
	
	        for (var i=0; AssignedRoleID != null && AssignedRoleID != 'Error' && i < AssignedRoleID.length; i++)
	       {
	           if (AssignedRoleID[i] == RoleId)
	           {
					RoleExists = 'T';
	               break;
	            }
	       }
			
	       if (RoleExists == 'F')
	       {
	           var AVA_Notice = AVA_NoticePage(AVA_Message);
	            response.write(AVA_Notice);      
	       }
	       else
	       {
	       	return 0;
	       }
	   }
	   else
	   {
	   	return 0;
	   }
	
	}
	catch(err)
	{
	
	   var AVA_Notice = AVA_NoticePage(AVA_Message);
	   response.write(AVA_Notice); 
	}    
               
}


function AVA_GetSuiteletParameter(SuiteletNumber)
{
	var RoleIds = new Array()
	
	try
	{
		switch(SuiteletNumber)
		{
			case 1: 
					//AVA_CommittedList_Suitlet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_committedlistroleid').split(',');
					break;
					
			case 2: 
					//AVA_Config_Suitlet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_configroleid').split(',');
					break;
					
			case 3: 
					//AVA_CustomerList_Suitlet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_customerlistroleid').split(',');
					break;
					
			case 4: 
					//AVA_EntityUseForm_Suitlet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_entityuseformroleid').split(',');
					break;
					
			case 5:
					//AVA_EntityUseList_Suitlet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_entityuselistroleid').split(',');
					break;
					
			case 6: 
					//AVA_GetTaxHistory_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_gettaxhistoryroleid').split(',');
					break;
					
			case 7: 
					//AVA_ReconcileResultList_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_reconcilelistroleid').split(',');
					break;
					
			case 8:
					//AVA_ReconciliationResult_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_reconciliationresultroleid').split(',');
					break;    
					
			case 9:
					//AVA_Reconciliation_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_reconciliationroleid').split(',');
					break;
					
			case 10: 
					//AVA_ShippingCodeForm_Suitlet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_shippingcoderoleid').split(',');
					break;
					
			case 11: 
					//AVA_ShippingCodeList_Suitlet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_shippinglistroleid').split(',');
					break;
					
			case 12:
					//AVA_TransactionList_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_transactionlistroleid').split(',');
					break;  
					
			case 13:
					//AVA_VoidedList_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_voidedlistroleid').split(',');
					break;
					
			case 14:
					//AVA_EntityMap_Suitlet
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_entitymaproleid').split(',');
					break;	
					
			case 15:		
					//AVA_TransactionLog_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_logroleid').split(',');
					break; 				
			
			case 16:
					//AVA_AddressValidation_Suitlet
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_addressassistantroleid').split(',');
					break;  
			
			case 17:
					//AVA_AddressValidationResult_Suitelet
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_addressresultsroleid').split(',');
					break;  
			
			case 18:
					//AVA_AddressValidationBatch_Suitelet
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_addressbatchroleid').split(',');
					break;    
					
			case 19:
					//AVA_QuickAddressValidation_Suitlet
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_addressquickvalidateroleid').split(',');
					break; 

			case 20:
					//AVA_RecalculateUtility_Suitelet 
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_recalcroleid').split(',');
					break; 

			case 21:
					//AVA_ViewRecalculationBatches_Suitelet  
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_viewbatchesroleid').split(',');
					break; 
			case 22:
					//AVA_UseTaxCreateBatches_Suitlet  
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_usetaxroleid').split(',');
					break;
				
			case 23:
					//AVA_UseTaxViewBatches_Suitlet  
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_usetaxviewroleid').split(',');
					break;
					
			case 24:
					//AVA_GetCertificates_Suitlet  
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_getcertificatesroleid').split(',');
					break;
					
			case 25:
					//AVA_GetCertImage_SuiteLet  
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_certimageroleid').split(',');
					break;
					
			case 26:
					//AVA_Certificates_Suitelet  
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_certificatesroleid').split(',');
					break;
					
			case 27:
					//AVA_GetCertificatesStatus_Suitelet  
					RoleIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_certificatestatusroleid').split(',');
					break;
					
			default:
 					RoleIds = 'Error';
					break;		
		
		}
	}
	catch(err)
	{
		RoleIds = 'Error';
	}
	
	return RoleIds;
}

/*function AVA_LoadConfigFieldsToGlobals()
{
	AVA_AccountValue 		= nlapiGetFieldValue('custpage_ava_accountvalue');	
	AVA_LicenseKey	 		= nlapiGetFieldValue('custpage_ava_licensekey');	
	AVA_ServiceUrl 	 		= nlapiGetFieldValue('custpage_ava_url');	
	AVA_ExpiryDate			= nlapiGetFieldValue('custpage_ava_serviceurl');	
	AVA_ServiceTypes   		= nlapiGetFieldValue('custpage_ava_servicetypes'); 
	
	// General Tab Elements Detail 
	AVA_UDF1 				= nlapiGetFieldValue('custpage_ava_udf1enabled');	
	AVA_UDF2 				= nlapiGetFieldValue('custpage_ava_udf2enabled');	
	AVA_EntityUseCode 		= nlapiGetFieldValue('custpage_ava_entityusecode');	
	AVA_ItemAccount 		= nlapiGetFieldValue('custpage_ava_itemaccount');	
	AVA_TaxCodeMapping      = nlapiGetFieldValue('custpage_ava_taxidmapping');
	AVA_CustomerCode        = nlapiGetFieldValue('custpage_ava_customercode'); 
	AVA_DefaultShippingCode = nlapiGetFieldValue('custpage_ava_defshipcode');	
	AVA_DefaultMiscCode 	= nlapiGetFieldValue('custpage_ava_defmisccode');	
	AVA_DefaultCustomerTaxcode = nlapiGetFieldValue('custpage_ava_defaultcustomer');
	AVA_BillableTimeName 	= nlapiGetFieldValue('custpage_ava_billtimename');
	AVA_ShowMessages      = nlapiGetFieldValue('custpage_ava_showmessages');	
	
	// Tax Calculation Elements Details 
	AVA_DisableTax 			= nlapiGetFieldValue('custpage_ava_disabletax');	
	AVA_DisableLine			= nlapiGetFieldValue('custpage_ava_disableline');	
	AVA_EnableLogging		= nlapiGetFieldValue('custpage_ava_enablelog');
	AVA_DecimalPlaces   	= nlapiGetFieldValue('custpage_ava_decimalplaces');
	AVA_TaxRate				= nlapiGetFieldValue('custpage_ava_taxrate');
	AVA_UsePostingPeriod    = nlapiGetFieldValue('custpage_ava_usepostingperiod');
	AVA_TaxInclude          = nlapiGetFieldValue('custpage_ava_taxinclude');
	AVA_DefaultTaxCode		= nlapiGetFieldValue('custpage_ava_deftaxcode');
	AVA_AbortBulkBilling	= nlapiGetFieldValue('custpage_ava_abortbulkbilling');
	AVA_AbortUserInterfaces = nlapiGetFieldValue('custpage_ava_abortuserinterface');
	AVA_AbortWebServices    = nlapiGetFieldValue('custpage_ava_abortwebservices'); 
	AVA_AbortCSVImports   	= nlapiGetFieldValue('custpage_ava_abortcsvimports');
	AVA_AbortScheduledScripts  = nlapiGetFieldValue('custpage_ava_abortscheduledscripts');
	AVA_AbortSuitelets = nlapiGetFieldValue('custpage_ava_abortsuitelets');

	//Default Ship From Address 
	AVA_Def_Addressee		 = nlapiGetFieldValue('custpage_ava_addressee');
	AVA_Def_Addr1			 = nlapiGetFieldValue('custpage_ava_address1');
	AVA_Def_Addr2			 = nlapiGetFieldValue('custpage_ava_address2');
	AVA_Def_City			 = nlapiGetFieldValue('custpage_ava_city');
	AVA_Def_State			 = nlapiGetFieldValue('custpage_ava_state');
	AVA_Def_Zip				 = nlapiGetFieldValue('custpage_ava_zip');
	AVA_Def_Country			 = nlapiGetFieldValue('custpage_ava_country');	
		
}*/

//Scheduled Script for moving existing User Notes to Custom Record

function AVA_DeleteTransactionLogs()
{
	var StartTime = new Date();
	var EndTime = new Date();
	EndTime = StartTime;
	EndTime.setMinutes(StartTime.getMinutes() + 9);
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('title',  null, 'startswith',  'AvaTax');
	filters[1] = new nlobjSearchFilter('mainline',  'transaction', 'is', 'T');
	
	var cols = new Array();
	cols[0]  = new nlobjSearchColumn('title');
	cols[1]  = new nlobjSearchColumn('notedate');
	cols[2]  = new nlobjSearchColumn('note');
	cols[3]  = new nlobjSearchColumn('internalid');
	cols[4]  = new nlobjSearchColumn('internalid','transaction');
	cols[5]  = new nlobjSearchColumn('author');
	
	var searchResult = nlapiSearchRecord('note', null, filters, cols);
	
	for(var i=0; searchResult !=null && i<Math.min(AVA_DelMax, searchResult.length) ; i++)
	{
		var CurrTime = new Date();
		
		if(CurrTime<EndTime)
		{
			var record = nlapiCreateRecord('customrecord_avatransactionlogs');
			record.setFieldValue('custrecord_ava_transaction', searchResult[i].getValue('internalid','transaction'));
			record.setFieldValue('custrecord_ava_note', searchResult[i].getValue('note'));
			record.setFieldValue('custrecord_ava_title', searchResult[i].getValue('title'));
			record.setFieldValue('custrecord_ava_creationdatetime', searchResult[i].getValue('notedate'));
			
			var authorname = nlapiLookupField('employee', searchResult[i].getValue('author'), 'entityid');
			if (authorname != null && authorname.length > 0)
			{
				record.setFieldValue('custrecord_ava_author', searchResult[i].getValue('author'));
			}
			
			var recId = nlapiSubmitRecord(record, false);
			
			nlapiDeleteRecord('note', searchResult[i].getId());
		}
		else
		{
			break;
		}
	}
}

//Scheduled script for deleting custom record logs of deleted transactions

function AVA_DeleteLogsOfDeletedTransactions()
{
	var StartTime = new Date();
	var EndTime = new Date();
	EndTime = StartTime;
	EndTime.setMinutes(StartTime.getMinutes() + 9);
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_transaction', null, 'anyof', '@NONE@');
	
	var searchResult = nlapiSearchRecord('customrecord_avatransactionlogs', null, filters, null);
	
	for(var i=0; searchResult !=null && i<Math.min(AVA_DelMax, searchResult.length); i++)
	{
		var CurrTime = new Date();
		
		if(CurrTime<EndTime)
		{
			nlapiDeleteRecord('customrecord_avatransactionlogs', searchResult[i].getId());
		}
		else
		{
			break;
		}
	}
}

//Suitelet for Transaction Logs

function AVA_ViewTransactionLog(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 14 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_TransactionLogForm = nlapiCreateForm('AvaTax Transaction Log');
			AVA_TransactionLogForm.setTitle('AvaTax Transaction Log');
			
			var record = nlapiLoadRecord('customrecord_avatransactionlogs', request.getParameter('noteid'));
			
			AVA_TransactionLogForm.addField('ava_transaction',  'select', 'Transaction', 'transaction');
			AVA_TransactionLogForm.getField('ava_transaction').setDefaultValue(record.getFieldValue('custrecord_ava_transaction'));
			AVA_TransactionLogForm.getField('ava_transaction').setDisplayType('inline');
			AVA_TransactionLogForm.getField('ava_transaction').setLayoutType('startrow','startcol');
			
			AVA_TransactionLogForm.addField('ava_title',      'text',   'Title');
			AVA_TransactionLogForm.getField('ava_title').setDefaultValue(record.getFieldValue('custrecord_ava_title'));
			AVA_TransactionLogForm.getField('ava_title').setDisplayType('inline');
			
			AVA_TransactionLogForm.addField('ava_creationdate',   'text',   'Creation Date');
			AVA_TransactionLogForm.getField('ava_creationdate').setDefaultValue(record.getFieldValue('custrecord_ava_creationdatetime'));
			AVA_TransactionLogForm.getField('ava_creationdate').setDisplayType('inline');
			AVA_TransactionLogForm.getField('ava_creationdate').setLayoutType('endrow','startcol');
			
			AVA_TransactionLogForm.addField('ava_author',   'select',   'Author','employee');
			AVA_TransactionLogForm.getField('ava_author').setDefaultValue(record.getFieldValue('custrecord_ava_author'));
			AVA_TransactionLogForm.getField('ava_author').setDisplayType('inline');

			AVA_TransactionLogForm.addField('ava_note',   'textarea',   'Memo');
			AVA_TransactionLogForm.getField('ava_note').setDefaultValue(record.getFieldValue('custrecord_ava_note'));
			AVA_TransactionLogForm.getField('ava_note').setDisplayType('inline');
			AVA_TransactionLogForm.getField('ava_note').setLayoutType('outsidebelow','startrow');

			response.writePage(AVA_TransactionLogForm);
		
		}
	}
}

function AVA_RecalculateForm(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 20 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{			
			form = nlapiCreateForm('Recalculation Utility');
			form.setScript('customscript_ava_recalculateform');
			form.setTitle('Recalculation Utility');
		
			form.addFieldGroup('ava_batchdata', '<b>Batch Information</b>');
			form.addField('ava_batchname',			'text',		'Batch Name',  null, 'ava_batchdata');
			form.getField('ava_batchname').setMandatory(true);
			form.addField('ava_batchdesc',  		'text', 	'Description', null, 'ava_batchdata');

			form.addField('ava_customer',	'select',	'Customer',  'customer', 'ava_batchdata');
			
			var DateFormat 	= form.addField('ava_dateformat',		'text',			'Date Format');
			DateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
			DateFormat.setDisplayType('hidden');
			
			form.addFieldGroup('ava_recordtypes', '<b>Record Type(s)</b>');
			form.addField('ava_alltypes', 	'checkbox', 'All', null, 'ava_recordtypes').setLayoutType('startrow');
			form.addField('ava_allhelp', 	'label',	'(Includes Estimates, Sales Orders, Invoice, CashSale, Return Authorization, Cash Refund & Credit Memo)', null, 'ava_recordtypes').setLayoutType('midrow');

			form.addField('ava_estimate',   'checkbox', 'Estimates', null, 'ava_recordtypes');
			form.addField('ava_salesorder', 'checkbox', 'Sales Order', null, 'ava_recordtypes');
			form.addField('ava_invoice', 	'checkbox', 'Invoice', null, 'ava_recordtypes');
			form.addField('ava_cashsale', 	'checkbox', 'Cash Sale', null, 'ava_recordtypes').setLayoutType('normal','startcol');
			form.addField('ava_returnauth', 'checkbox', 'Return Authorization', null, 'ava_recordtypes');
			form.addField('ava_creditmemo', 'checkbox', 'Credit Memo', null, 'ava_recordtypes');
			form.addField('ava_cashrefund', 'checkbox', 'Cash Refund', null, 'ava_recordtypes');
			
			form.addFieldGroup('ava_filter', '<b>Filter Criteria</b>');
	    	form.addField('ava_recalcbase',	'label',	'Perform Recalculation Based on:', null, 'ava_filter').setLayoutType('startrow');
			form.addField('ava_recalctype', 'radio',	'Transaction Date',	'td', 'ava_filter').setLayoutType('midrow');
			form.addField('ava_recalctype', 'radio',	'Date Created',	'dc', 'ava_filter').setLayoutType('midrow');
			form.addField('ava_recalctype', 'radio',	'Date Modified', 'dm',  'ava_filter').setLayoutType('endrow');
			form.getField('ava_recalctype').setDefaultValue('td');
			
			form.addField('ava_fromdate',	'date',		'From Date', null, 'ava_filter').setLayoutType('startrow');
			form.getField('ava_fromdate').setMandatory(true);
			form.addField('ava_todate',		'date',		'To Date', null, 'ava_filter').setLayoutType('endrow');
			form.getField('ava_todate').setMandatory(true);
			
			form.addSubmitButton('Submit');
			form.addResetButton('Reset');
			form.addPageLink('crosslink', 'View Recalculation Batches', nlapiResolveURL('SUITELET', 'customscript_ava_recalcbatches', 'customdeploy_ava_recalcbatches'));
			
			response.writePage(form);
		
		}
		else
		{
			var record = nlapiCreateRecord('customrecord_avarecalculatebatch');
						
			record.setFieldValue('name', 							request.getParameter('ava_batchname'));	
			record.setFieldValue('custrecord_ava_recalcbatchname',	request.getParameter('ava_batchname'));	
			record.setFieldValue('custrecord_ava_recalcdesc',		request.getParameter('ava_batchdesc'));	
			record.setFieldValue('custrecord_ava_customer', request.getParameter('ava_customer'));
			record.setFieldValue('custrecord_ava_all',				request.getParameter('ava_alltypes'));
			record.setFieldValue('custrecord_ava_estimate',			request.getParameter('ava_estimate'));
			record.setFieldValue('custrecord_ava_salesorder',		request.getParameter('ava_salesorder'));
			record.setFieldValue('custrecord_ava_invoice',			request.getParameter('ava_invoice'));
			record.setFieldValue('custrecord_ava_cashsale',			request.getParameter('ava_cashsale'));
			record.setFieldValue('custrecord_ava_returnauth',		request.getParameter('ava_returnauth'));
			record.setFieldValue('custrecord_ava_creditmemo',		request.getParameter('ava_creditmemo'));
			record.setFieldValue('custrecord_ava_cashrefund',		request.getParameter('ava_cashrefund'));
			record.setFieldValue('custrecord_ava_recalcfromdate', 	request.getParameter('ava_fromdate'));	
			record.setFieldValue('custrecord_ava_recalctodate', 	request.getParameter('ava_todate'));
			record.setFieldValue('custrecord_ava_recalctype', 		request.getParameter('ava_recalctype'));
			record.setFieldValue('custrecord_ava_recalcstatus', 	0);					
						
			var recId = nlapiSubmitRecord(record, false);
			
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('custrecord_ava_recalcstatus', null, 'lessthan', 2);
			var searchResult3 = nlapiSearchRecord('customrecord_avarecalculatebatch', null, filters, null);
			if(searchResult3 != null && searchResult3.length == 1)
			{
				//nlapiScheduleScript('customscript_avarecalctaxes_sched','customdeploy_ava_recalctaxes_deploy1');
				nlapiScheduleScript('customscript_ava_reconciletaxes_sched','customdeploy_ava_recalctaxes_deploy1');
			}
			
			nlapiSetRedirectURL('SUITELET', 'customscript_ava_recalcbatches', 'customdeploy_ava_recalcbatches');
		}
	}
}

function AVA_RecalculateSave()
{
	if (nlapiGetFieldValue('ava_batchname') != null && nlapiGetFieldValue('ava_batchname').length <= 0)
	{
		alert('Please enter value(s) for Batch Name.')
		document.forms['main_form'].ava_batchname.focus();
		return false;
	}
	
	if ((nlapiGetFieldValue('ava_alltypes') == 'F') && (nlapiGetFieldValue('ava_estimate') == 'F') && (nlapiGetFieldValue('ava_salesorder') == 'F') && (nlapiGetFieldValue('ava_invoice') == 'F') && (nlapiGetFieldValue('ava_cashsale') == 'F') && (nlapiGetFieldValue('ava_returnauth') == 'F') && (nlapiGetFieldValue('ava_creditmemo') == 'F') && (nlapiGetFieldValue('ava_cashrefund') == 'F'))
	{
		alert('Select any one record type to perform recalculation');
		return false;
	}
	
	if (nlapiGetFieldValue('ava_fromdate') != null && nlapiGetFieldValue('ava_fromdate').length <= 0)
	{
		alert('Please enter value(s) for From Date.')
		document.forms['main_form'].ava_fromdate.focus();
		return false;
	}
	
	if (nlapiGetFieldValue('ava_todate') != null && nlapiGetFieldValue('ava_todate').length <= 0)
	{
		alert('Please enter value(s) for To Date.')
		document.forms['main_form'].ava_todate.focus();
		return false;
	}

	var StartDate = new Date(AVA_FormatDate(nlapiGetFieldValue('ava_dateformat'), nlapiGetFieldValue('ava_fromdate')));
	var EndDate = new Date(AVA_FormatDate(nlapiGetFieldValue('ava_dateformat'), nlapiGetFieldValue('ava_todate')));
	
	if(EndDate < StartDate)
	{
		alert('To Date should be greater than or equal to From Date');
		return false;
	}	

	var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload') + '&type=customrecord_avarecalculatebatch&batchname=' + nlapiGetFieldValue('ava_batchname'), null, null );
	if(response.getBody() == '0') // Batch name already exists
	{
		alert('Batch Name already Exists. Enter a new Batch Name');
		document.forms['main_form'].ava_batchname.focus();
		return false;
	}
	return true;
}

function AVA_RecalculateChange(type, name, linenum)
{
	if (name == 'ava_alltypes')
	{
		if (nlapiGetFieldValue('ava_alltypes') == 'T')
		{
			nlapiDisableField('ava_estimate', 	true);
			nlapiDisableField('ava_salesorder', true);
			nlapiDisableField('ava_invoice', 	true);
			nlapiDisableField('ava_cashsale', 	true);
			nlapiDisableField('ava_returnauth', true);
			nlapiDisableField('ava_creditmemo', true);
			nlapiDisableField('ava_cashrefund', true);
		}
		else
		{
			nlapiDisableField('ava_estimate', 	false);
			nlapiDisableField('ava_salesorder', false);
			nlapiDisableField('ava_invoice', 	false);
			nlapiDisableField('ava_cashsale', 	false);
			nlapiDisableField('ava_returnauth', false);
			nlapiDisableField('ava_creditmemo', false);
			nlapiDisableField('ava_cashrefund', false);
		}
	}
}

function AVA_RecalcViewBatches(request,response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 21 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_RecalcBatchForm = nlapiCreateForm('Recalculate Tax Batches');
			AVA_RecalcBatchForm.setTitle('Recalculate Tax Batches');
			AVA_RecalcBatchForm.setScript('customscript_avadeletebatch_client');
			
			AVA_RecalcBatchForm.addField('ava_helptext', 'label', '* All - Includes Estimates, Sales Orders, Invoice, CashSale, Return Authorization, Cash Refund & Credit Memo');
			var AVA_RecalcBatchList = AVA_RecalcBatchForm.addSubList('custpage_avarecalcbatchlist', 'list','Select Batches');
		    AVA_RecalcBatchList.addField('ava_recalcbatid','text', 'Batch ID').setDisplayType('hidden');
		    AVA_RecalcBatchList.addField('apply','checkbox', 'Delete');
		    AVA_RecalcBatchList.addField('ava_batchname',		'text', 'Name');
		    AVA_RecalcBatchList.addField('ava_recordtypes',		'text', 'Record Type(s)*');
		    AVA_RecalcBatchList.addField('ava_fromdate',		'date', 'From Date');
		    AVA_RecalcBatchList.addField('ava_todate',			'date', 'To Date');
		    AVA_RecalcBatchList.addField('ava_batchstatus',		'text', 'Batch Status');
		    
		    var cols = new Array();
			cols[0]  = new nlobjSearchColumn('name');
			cols[1]  = new nlobjSearchColumn('custrecord_ava_recalcbatchname');
			cols[2]  = new nlobjSearchColumn('custrecord_ava_all');
			cols[3]  = new nlobjSearchColumn('custrecord_ava_estimate');
			cols[4]  = new nlobjSearchColumn('custrecord_ava_salesorder');
			cols[5]  = new nlobjSearchColumn('custrecord_ava_invoice');
			cols[6]  = new nlobjSearchColumn('custrecord_ava_cashsale');
			cols[7]  = new nlobjSearchColumn('custrecord_ava_returnauth');
			cols[8]  = new nlobjSearchColumn('custrecord_ava_creditmemo');
			cols[9]  = new nlobjSearchColumn('custrecord_ava_cashrefund');
			cols[10]  = new nlobjSearchColumn('custrecord_ava_recalcfromdate');
			cols[11]  = new nlobjSearchColumn('custrecord_ava_recalctodate');
			cols[12]  = new nlobjSearchColumn('custrecord_ava_recalcstatus');
			
			var searchresult = nlapiSearchRecord('customrecord_avarecalculatebatch', null, null, cols);
				
			for(var i = 0; searchresult != null && i < searchresult.length; i++)
			{
				AVA_RecalcBatchList.setLineItemValue('ava_recalcbatid', 	i+1, 	searchresult[i].getId());
				AVA_RecalcBatchList.setLineItemValue('ava_batchname', 	i+1, 	searchresult[i].getValue('name'));

				var RecordTypes = '';
				if (searchresult[i].getValue('custrecord_ava_all') == 'T')
				{
					RecordTypes = 'All';
				}
				else
				{
					RecordTypes = (searchresult[i].getValue('custrecord_ava_estimate') == 'T') ? RecordTypes + 'Estimate\n' : RecordTypes;
					RecordTypes = (searchresult[i].getValue('custrecord_ava_salesorder') == 'T') ? RecordTypes + 'Sales Order\n' : RecordTypes;
					RecordTypes = (searchresult[i].getValue('custrecord_ava_invoice') == 'T') ? RecordTypes + 'Invoice\n' : RecordTypes;
					RecordTypes = (searchresult[i].getValue('custrecord_ava_cashsale') == 'T') ? RecordTypes + 'CashSale\n' : RecordTypes;
					RecordTypes = (searchresult[i].getValue('custrecord_ava_returnauth') == 'T') ? RecordTypes + 'Return Authorization\n' : RecordTypes;
					RecordTypes = (searchresult[i].getValue('custrecord_ava_creditmemo') == 'T') ? RecordTypes + 'Credit Memo\n' : RecordTypes;
					RecordTypes = (searchresult[i].getValue('custrecord_ava_cashrefund') == 'T') ? RecordTypes + 'Cash Refund' : RecordTypes;
				}
				AVA_RecalcBatchList.setLineItemValue('ava_recordtypes', 	i+1, 	RecordTypes);
				AVA_RecalcBatchList.setLineItemValue('ava_fromdate', 		i+1, 	searchresult[i].getValue('custrecord_ava_recalcfromdate'));
				AVA_RecalcBatchList.setLineItemValue('ava_todate', 			i+1, 	searchresult[i].getValue('custrecord_ava_recalctodate'));
				var BatchStatus = searchresult[i].getValue('custrecord_ava_recalcstatus');
				
				BatchStatus = (BatchStatus == 0) ? 'In Queue' : ((BatchStatus == 1) ? 'In Progress' : ((BatchStatus == 2) ? 'Completed' : 'Error'));
				AVA_RecalcBatchList.setLineItemValue('ava_batchstatus', 	i+1, 	BatchStatus);
			}
	 		
	 		AVA_RecalcBatchForm.addSubmitButton('Submit');
			AVA_RecalcBatchForm.addPageLink('crosslink', 'Create Recalculation Batch', nlapiResolveURL('SUITELET', 'customscript_ava_recalcutility', 'customdeploy_recalcform'));
			
			response.writePage(AVA_RecalcBatchForm);
		}
		else
		{
			var LineCount	= request.getLineItemCount('custpage_avarecalcbatchlist');
			for ( var i = 1; i <= LineCount ; i++ )
			{
				if (request.getLineItemValue('custpage_avarecalcbatchlist','apply', i) == 'T')
				{
					var BatchId = request.getLineItemValue('custpage_avarecalcbatchlist','ava_recalcbatid', i);
					//nlapiLogExecution('DEBUG', 'BatchId', BatchId);
					nlapiDeleteRecord('customrecord_avarecalculatebatch', BatchId);
				}
			}
			nlapiSetRedirectURL('TASKLINK', 'CARD_-29');			
		}
	}
}

function AVA_RecalculateTaxes()
{
	// Batch Statuses:
	// 0 = not started / In Queue
	// 1 = In Progress
	// 2 = Completed
	// 3 = Error 
	
	var scriptContext = nlapiGetContext();
	var flag = 0;
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_recalcstatus', null, 'lessthan', 2);
	
	var cols = new Array();
	cols[0]  = new nlobjSearchColumn('custrecord_ava_all');
	cols[1]  = new nlobjSearchColumn('custrecord_ava_estimate');
	cols[2]  = new nlobjSearchColumn('custrecord_ava_salesorder');
	cols[3]  = new nlobjSearchColumn('custrecord_ava_invoice');
	cols[4]  = new nlobjSearchColumn('custrecord_ava_cashsale');
	cols[5]  = new nlobjSearchColumn('custrecord_ava_returnauth');
	cols[6]  = new nlobjSearchColumn('custrecord_ava_creditmemo');
	cols[7]  = new nlobjSearchColumn('custrecord_ava_cashrefund');
	cols[8]  = new nlobjSearchColumn('custrecord_ava_recalcfromdate');
	cols[9]  = new nlobjSearchColumn('custrecord_ava_recalctodate');
	cols[10] = new nlobjSearchColumn('custrecord_ava_recalcstatus');
	cols[11] = new nlobjSearchColumn('custrecord_ava_recalctype');
	cols[12] = new nlobjSearchColumn('custrecord_ava_lasttranid');
	cols[13] = new nlobjSearchColumn('custrecord_ava_customer');
	
	var searchResult = nlapiSearchRecord('customrecord_avarecalculatebatch', null, filters, cols);
	for(var i = 0; nlapiGetContext().getRemainingUsage() > RecalcMinUsage && searchResult != null && i < searchResult.length ; i++)
	{
		BatchId = searchResult[i].getId();
		Rec_All = searchResult[i].getValue('custrecord_ava_all'); 
		Rec_Estimate = searchResult[i].getValue('custrecord_ava_estimate'); 
		Rec_SalesOrder = searchResult[i].getValue('custrecord_ava_salesorder'); 
		Rec_Invoice = searchResult[i].getValue('custrecord_ava_invoice'); 
		Rec_CashSale = searchResult[i].getValue('custrecord_ava_cashsale'); 
		Rec_RetuAuth = searchResult[i].getValue('custrecord_ava_returnauth'); 
		Rec_CreditMemo = searchResult[i].getValue('custrecord_ava_creditmemo'); 
		Rec_CashRefund = searchResult[i].getValue('custrecord_ava_cashrefund'); 
		FromDate = searchResult[i].getValue('custrecord_ava_recalcfromdate'); 
		ToDate = searchResult[i].getValue('custrecord_ava_recalctodate'); 
		BatchStatus = searchResult[i].getValue('custrecord_ava_recalcstatus'); 
		RecalcType = searchResult[i].getValue('custrecord_ava_recalctype'); 
		LastTranId = searchResult[i].getValue('custrecord_ava_lasttranid');
		BatchCustomer = searchResult[i].getValue('custrecord_ava_customer');
		
		//1. Check Batch Status - If '0' then set to In Progress, If '1' continue processing
		//2. set filters based on the required type
		//3. store the last processed id
		while(BatchStatus == 0 || BatchStatus == 1)
		{
			if(scriptContext.getRemainingUsage() > RecalcMinUsage)
			{
				if (BatchStatus == 0) nlapiSubmitField('customrecord_avarecalculatebatch', BatchId, 'custrecord_ava_recalcstatus', 1, false);
				
				var filters = new Array();
				filters[filters.length] = new nlobjSearchFilter('mainline', 		null, 'is', 'T');

				if (RecalcType == 'td')
				{
					filters[filters.length] = new nlobjSearchFilter('trandate', 	null, 'within', FromDate, ToDate); 	//Filter Based on Transaction Date
				}
				else if(RecalcType == 'dc')
				{
					filters[filters.length] = new nlobjSearchFilter('datecreated', 	null, 'within', FromDate, ToDate); //Filter Based on Date created
				}
				else
				{
					filters[filters.length] = new nlobjSearchFilter('lastmodifieddate', 	null, 'within', FromDate, ToDate); //Filter Based on Date modified
				}
				
				if (Rec_All == 'T')
				{
					var TypeArray = new Array('Estimate','SalesOrd','CustInvc','CashSale','RtnAuth','CashRfnd','CustCred');
					filters[filters.length] = new nlobjSearchFilter('type', 		null, 'anyof', 	TypeArray);
				}
				else
				{
					var TypeArray = new Array(); 
					if (Rec_Estimate == 'T')  TypeArray[TypeArray.length] = 'Estimate'; 
					if (Rec_SalesOrder == 'T')  TypeArray[TypeArray.length] = 'SalesOrd'; 
					if (Rec_Invoice == 'T')  TypeArray[TypeArray.length] = 'CustInvc';
					if (Rec_CashSale == 'T')  TypeArray[TypeArray.length] = 'CashSale';
					if (Rec_RetuAuth == 'T')  TypeArray[TypeArray.length] = 'RtnAuth'; //RtnAuth
					if (Rec_CreditMemo == 'T')  TypeArray[TypeArray.length] = 'CashRfnd';
					if (Rec_CashRefund == 'T')  TypeArray[TypeArray.length] = 'CustCred';
					filters[filters.length] = new nlobjSearchFilter('type', 		null, 'anyof', 	TypeArray);
				}

				filters[filters.length] = new nlobjSearchFilter('voided',    null, 'is', 'F');
				if(LastTranId > 0)
				{
					filters[filters.length] = new nlobjSearchFilter('internalidnumber', 		null, 'greaterthan', 	LastTranId);
				}
				
				if(BatchCustomer != null && BatchCustomer > 0)
				{
					filters[filters.length] = new nlobjSearchFilter('entity',null ,'is',BatchCustomer);
				}
				var searchResult1 = nlapiSearchRecord('transaction', null, filters, null);
				var RecalcBreak = 'F';
				if(searchResult1 != null && searchResult1.length > 0)
				{
					for(var k=0; k < searchResult1.length; k++)					
					{
						if (nlapiGetContext().getRemainingUsage() > RecalcMinUsage)
						{
							try
							{
								var RecordId = nlapiLoadRecord(searchResult1[k].getRecordType(), searchResult1[k].getId());
								var recId = nlapiSubmitRecord(RecordId, false);
								nlapiLogExecution('DEBUG', 'Record Processed', 'BatchId-' + BatchId + ' , RecordId-' + recId + ', RecordType-' + searchResult[k].getRecordType());
								//nlapiLogExecution('DEBUG', 'Record Processed', recId);
								LastTranId = searchResult1[k].getId();
							}
							catch(err)
							{
								nlapiLogExecution('ERROR', 'Error', 'BatchId-' + BatchId + ' , RecordId-' + searchResult1[k].getId() + ', RecordType-' + searchResult1[k].getRecordType());
								//nlapiLogExecution('ERROR', 'RecId', searchResult[k].getId());
								LastTranId = searchResult1[k].getId();
								//break;
							}
						}
						else
						{
							var fields = new Array();
							var values = new Array();
							
							fields[fields.length] = 'custrecord_ava_recalcstatus';
							fields[fields.length] = 'custrecord_ava_lasttranid';
							
							values [values.length] = 1;
							values [values.length] = LastTranId;
							//nlapiSubmitField('customrecord_avarecalculatebatch', BatchId, 'custrecord_ava_recalcstatus', 1, false);
							nlapiSubmitField('customrecord_avarecalculatebatch', BatchId, fields, values, false);
							RecalcBreak = 'T';
							flag = 1;
							nlapiScheduleScript(scriptContext.getScriptId(), scriptContext.getDeploymentId());
							break;
						}
					}
					if(flag == 1)
					{
						flag = 0;
						break;
					}
				}
				if (RecalcBreak == 'F')
				{
					var fields = new Array();
					var values = new Array();
					
					fields[fields.length] = 'custrecord_ava_recalcstatus';
					fields[fields.length] = 'custrecord_ava_lasttranid';
					
					values [values.length] = 2;
					values [values.length] = 0;
					
					nlapiSubmitField('customrecord_avarecalculatebatch', BatchId, fields, values, false);
					BatchStatus = 2;
				}
			}
			else
			{
				nlapiSubmitField('customrecord_avarecalculatebatch', BatchId, 'custrecord_ava_recalcstatus', 2, false);			
				break;
			}
		}
	}
	if (nlapiGetContext().getRemainingUsage() > RecalcMinUsage)
	{
		var filters1 = new Array();
		filters1[0] = new nlobjSearchFilter('custrecord_ava_recalcstatus', null, 'lessthan', 2);
		var searchResult2 = nlapiSearchRecord('customrecord_avarecalculatebatch', null, filters1, null);
		if(searchResult2 != null)
		{
				AVA_RecalculateTaxes();
		}
	}
}

function AVA_Decrypt(input)
{
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	var base64test = /[^A-Za-z0-9\+\/\=]/g;
	if (base64test.exec(input)) 
	{
		alert("There were invalid base64 characters in the input text.\n" +
		"Valid base64 characters are A-Z, a-z, 0-9, ?, ?, and ?\n" +
		"Expect errors in decoding.");
	}
	
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	do 
	{
		enc1 = keyStr.indexOf(input.charAt(i++));
		enc2 = keyStr.indexOf(input.charAt(i++));
		enc3 = keyStr.indexOf(input.charAt(i++));
		enc4 = keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 != 64)
		{
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}

		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";

	} while (i < input.length);

	return output;
}

function AVA_GetDiscountSoap(soapLine, DiscountField, AmountField, Multiplier)
{
	var soap = '\t\t\t\t\t<Line>\n';
	soap += '\t\t\t\t\t\t<No><![CDATA[' + parseInt(soapLine) + ']]></No>\n';
	
	if(nlapiGetFieldValue('ismultishipto') != null && (nlapiGetFieldValue('ismultishipto') == 'T' || nlapiGetFieldValue('ismultishipto') == 'Yes'))
	{
		soap += '\t\t\t\t\t\t<OriginCode/>\n';
		soap += '\t\t\t\t\t\t<DestinationCode/>\n';
	}
	else
	{
		if(AVA_LocationPOS == 1)
		{
			soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + nlapiGetFieldText('location') + ']]></OriginCode>\n';
			soap += '\t\t\t\t\t\t<DestinationCode><![CDATA[' + nlapiGetFieldText('location') + ']]></DestinationCode>\n';
		}
		else
		{
			if(nlapiGetFieldValue('custpage_ava_lineloc') == 'F')
			{
				if (nlapiGetFieldValue('location') != null && nlapiGetFieldValue('location').length > 0)
				{
					
					soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + nlapiGetFieldText('location') + ']]></OriginCode>\n';
				}
				else
				{
					soap += '\t\t\t\t\t\t<OriginCode><![CDATA[' + AVA_Def_Addressee + ']]></OriginCode>\n';
				}
			}
			else
			{
				soap += '\t\t\t\t\t\t<OriginCode/>\n';
			}
			
			if(nlapiGetFieldValue('shipaddresslist') != null && nlapiGetFieldValue('shipaddresslist') > 0)
			{
				soap += '\t\t\t\t\t\t<DestinationCode>Ship-To Address</DestinationCode>\n';
			}
			else 
			{
				if(nlapiGetFieldValue('shipaddress') != null && nlapiGetFieldValue('shipaddress') > 0)
				{
					soap += '\t\t\t\t\t\t<DestinationCode>Custom Ship-To Address</DestinationCode>\n';
				}
				else
				{
					if(nlapiGetFieldValue('billaddresslist') != null && nlapiGetFieldValue('billaddresslist') > 0)
					{
						soap += '\t\t\t\t\t\t<DestinationCode>Bill-To Address</DestinationCode>\n';
					}
					else
					{
						soap += '\t\t\t\t\t\t<DestinationCode>Custom Bill-To Address</DestinationCode>\n';
					}
				}
			}
		}
	}
	
	soap += '\t\t\t\t\t\t<ItemCode><![CDATA[' + nlapiGetFieldText(DiscountField) + ']]></ItemCode>\n';
	if((AVA_DiscountTaxCode != null && AVA_DiscountTaxCode.length > 0))
	{
		soap += '\t\t\t\t\t\t<TaxCode><![CDATA['+ AVA_DiscountTaxCode +']]></TaxCode>\n';
	}
	soap += '\t\t\t\t\t\t<Qty>1</Qty>\n';	
	soap += '\t\t\t\t\t\t<Amount>' + parseFloat(nlapiGetFieldValue(AmountField)) * Multiplier  + '</Amount>\n';
	soap += '\t\t\t\t\t\t<Discounted>0</Discounted>\n';
	soap += '\t\t\t\t\t\t<RevAcct/>\n';
	soap += '\t\t\t\t\t\t<Ref2/>\n';
	soap += '\t\t\t\t\t\t<Ref2/>\n';
	soap += '\t\t\t\t\t\t<ExemptionNo/>\n';
	soap += '\t\t\t\t\t\t<CustomerUsageType/>\n';	
	soap += '\t\t\t\t\t\t<Description/>\n';
	soap += '\t\t\t\t\t</Line>\n';
	
	return soap;
}

function AVA_LocationBeforeLoad(type, form)
{
	if(nlapiGetField('custpage_ava_readconfig') == null)
	{
		form.addField('custpage_ava_readconfig','longtext','ConfigRecord');
		form.getField('custpage_ava_readconfig').setDisplayType('hidden');
		AVA_ReadConfig('1');	
	}
	
	if(AVA_ServiceTypes == null || AVA_ServiceTypes != null && AVA_ServiceTypes.search('TaxSvc') == -1 || AVA_DisableTax == 'T' || AVA_DisableTax == true)
	{
		form.getField('custrecord_ava_ispos').setDisplayType('hidden');
	}
}

function AVA_LoadCustomerId(RecordType, Id)
{
	if(nlapiGetFieldValue('custpage_ava_taxcodestatus') == 0)
	{
		var webstoreFlag = (nlapiGetFieldValue('custpage_ava_context') == 'webstore') ? true : false;	
		
		var response = nlapiRequestURL( nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload', webstoreFlag) + '&type=' + RecordType + '&id=' + Id, null, null );
		var fieldValues = response.getBody().split('+');
		return fieldValues;
	}
	else
	{
		var record = nlapiLoadRecord(RecordType, Id);
		var CustRec = record.getFieldValue('entityid');
		return CustRec;					
	}
}