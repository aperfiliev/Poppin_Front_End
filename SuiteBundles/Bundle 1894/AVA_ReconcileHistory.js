/******************************************************************************************
	Script Name  - AVA_ReconcileHistory.js
	Company      - Avalara Technologies Pvt Ltd.
******************************************************************************************/

{
	var recordIdArray, recordObjArray, AVA_PrevFlag, AVA_NextFlag;	
	var AVA_EndPage, AVA_LineCount, MultiCurr;
	
	//Batch Info Variables
	var BatchId, BatchName, StartDate, EndDate, LastDocCode;
	var Total = only_AVA = only_NS = only_CR = AVA_NS = NS_CR = AVA_CR = AVA_NS_CR = Reconciled = 0;
	
	var NSIdsText, NSIdsArray, NS_CreatedDocField, NS_NextDocField, NSIdsCurrText = '', CRIdsText, CRIdsArray, CR_CreatedDocField, CR_NextDocField, CRIdsCurrText = '', fields, values;
	
	var MinUsage = 300;
	
}

function AVA_ReconcileTransactions(request, response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 9 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_TransactionForm = nlapiCreateForm('Create Reconciliation Batch');
			AVA_TransactionForm.setScript('customscript_avareconcilelist_client');
			AVA_TransactionForm.setTitle('Create Reconciliation Batch');
			
			var DateFrom 	= AVA_TransactionForm.addField('ava_datefrom',		'date',			'Starting Date');
			DateFrom.setDefaultValue(nlapiGetContext().getSetting('SESSION', 'DateFrom'));
			DateFrom.setMandatory(true);
			
			var DateTo 		= AVA_TransactionForm.addField('ava_dateto',		'date',			'Ending Date');
			DateTo.setDefaultValue(nlapiGetContext().getSetting('SESSION', 'DateTo'));
			DateTo.setMandatory(true);
	
			var DateFormat 	= AVA_TransactionForm.addField('ava_dateformat',		'text',			'Date Format');
			DateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
			DateFormat.setMandatory(true);
			DateFormat.setDisplayType('hidden');
			
			var BatchName = AVA_TransactionForm.addField('ava_batchname',		'text',			'Batch Name');
			BatchName.setMandatory(true);
			
			var BatchHelp = AVA_TransactionForm.addField('ava_batchhelp',		'help',	'NOTE: For better performance, please select a date range which has got less than 1000 transactions.');
			BatchHelp.setLayoutType('outsidebelow');
			
			AVA_TransactionForm.addSubmitButton('Submit');
			//AVA_TransactionForm.addPageLink('breadcrumb', 'Create Batch', nlapiResolveURL('SUITELET', 'customscript_avareconcilelist_suitelet', 'customdeploy_avareconcilelist'));
			AVA_TransactionForm.addPageLink('crosslink', 'View Reconciliation Results', nlapiResolveURL('SUITELET', 'customscript_ava_reconciliation_suitelet', 'customdeploy_ava_reconcileresult'));
			response.writePage(AVA_TransactionForm);
		}
		else
		{
			try
			{
				var record = nlapiCreateRecord('customrecord_avareconcilebatch');
							
				record.setFieldValue('custrecord_ava_batchname', 				request.getParameter('ava_batchname'));					
				record.setFieldValue('custrecord_ava_batchstartdate', 	request.getParameter('ava_datefrom'));	
				record.setFieldValue('custrecord_ava_batchenddate', 		request.getParameter('ava_dateto'));	
				record.setFieldValue('custrecord_ava_batchstatus', 			0);					
				record.setFieldValue('custrecord_ava_batchprogress', 0);
							
				var recId = nlapiSubmitRecord(record, false);	
				
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_batchstatus', null, 'lessthan', 2);
				var searchResult3 = nlapiSearchRecord('customrecord_avareconcilebatch', null, filters, null);
				if(searchResult3 != null && searchResult3.length == 1)
				{
					nlapiScheduleScript('customscript_ava_reconcileavatax_sched','customdeploy_reconciletax_deploy1');  		
				}
			
				nlapiSetRedirectURL('SUITELET', 'customscript_ava_reconciliation_suitelet', 'customdeploy_ava_reconcileresult');
			}
			catch( e )
			{
				var code = e instanceof nlobjError ? e.getStackTrace() : e.description;
				var xml = '<?xml version="1.0" encoding="utf-8" ?>'+
						'<error>'+
							'<code>'+
								code +
							'</code>'+
						'</error>';
				response.write( xml );		
			}
		}	
	}
}

//Client side Save function for Suitelet AVA_ReconcileTransactions
function AVA_BatchSaveRecord()
{
	var BatchName = nlapiGetFieldValue('ava_batchname');
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
	
	if(nlapiGetFieldValue('ava_batchname').length == 0)
	{
		alert('Enter a Batch Name');
		return false;
	}

	StartDate = new Date(AVA_FormatDate(DateFormat,StartDate));
	EndDate = new Date(AVA_FormatDate(DateFormat,EndDate));
	
	if(EndDate < StartDate)
	{
		alert('Ending Date should be greater than or equal to Start Date');
		return false;
	}
		
	var response = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload') + '&type=customrecord_avaconfig', null, null );
	if(response.getBody() == '0') // If Config Record exists
	{
		var response1 = nlapiRequestURL(nlapiResolveURL('SUITELET', 'customscript_ava_recordload_suitelet', 'customdeploy_ava_recordload') + '&type=customrecord_avareconcilebatch&batchname=' + BatchName, null, null );
		if(response1.getBody() == '0') // Batch name already exists
		{
			alert('Batch Name already Exists. Enter a new Batch Name');
			document.forms['main_form'].ava_batchname.focus();
			return false;
		}
		return true;
	}
	else
	{
		alert('AvaTax Configuration not setup. Details missing');
		return false;
	}
}


function AVA_ReconcileData()
{
	nlapiLogExecution('Debug','AVA_ReconcileData Script successfully called','Batch Id: ' + nlapiGetContext().getSetting('SCRIPT', 'custscript_ava_reconcilebatchid'));
	
	var scriptContext = nlapiGetContext();
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_batchstatus', null, 'lessthan', 2);
	
	var searchResult = nlapiSearchRecord('customrecord_avareconcilebatch', null, filters, null);
	
	for(var i = 0; nlapiGetContext().getRemainingUsage() > MinUsage && searchResult != null && i < searchResult.length ; i++)
	{		
		BatchId = searchResult[i].getId();
		var BatchStatus = nlapiLookupField('customrecord_avareconcilebatch', BatchId, 'custrecord_ava_batchstatus');
		// Batch Phases:
		// '' or null = processing not started or none of the phase got completed.
		// 0 = First phase completed, i.e: Reconciled Avatax side records (AvaTax + NetSuite + CustomRecord)
		// 1 = Second phase completed, i.e: Reconciled Netsuite side records (NetSuite + CustomRecord)
		// 2 = Third phase completed, i.e: Reconciled Netsuite side Custom Records (Custom Record)-Reconciliation Completed 
		
		
		// Batch Statuses:
		// 0 = not started / In Queue
		// 1 = In Progress
		// 2 = Completed
		// 3 = Delete
		// 4 = Error 
			
		while(BatchStatus == 0 || BatchStatus == 1)
		{		
			var BatchPhase = nlapiLookupField('customrecord_avareconcilebatch', BatchId, 'custrecord_ava_batchphase');		
			nlapiLogExecution('Debug', 'AVA_ReconcileData: B\atchPhase: ', BatchPhase);
			if(scriptContext.getRemainingUsage() > MinUsage && BatchPhase != 2)
			{		
				switch(BatchPhase)
				{
					case 0:
					case '0': 
							nlapiLogExecution('Debug', 'Calling  AVA_GetNetsuiteTransactions', '');
							AVA_GetNetsuiteTransactions();
							nlapiLogExecution('Debug', 'Called  AVA_GetNetsuiteTransactions', '');
							break;
							
					case 1: 
					case '1':
							nlapiLogExecution('Debug', 'Calling  AVA_GetHeaderCustomRecordsData', '');
							AVA_GetHeaderCustomRecordsData();
							nlapiLogExecution('Debug', 'Called  AVA_GetHeaderCustomRecordsData', '');
							break;			
						
					default:
							nlapiLogExecution('Debug', 'Calling  AVA_GetAvataxTransactions', '');
						     AVA_GetAvataxTransactions('Committed');
						     nlapiLogExecution('Debug', 'Called  AVA_GetAvataxTransactions', '');
						     break;					
				}
			}
			else
			{
				nlapiLogExecution('Debug', 'In else: ', '');
				nlapiScheduleScript(scriptContext.getScriptId(), scriptContext.getDeploymentId());
				break;
			}
			
			BatchStatus = nlapiLookupField('customrecord_avareconcilebatch', BatchId, 'custrecord_ava_batchstatus');
		}
	}
	if (nlapiGetContext().getRemainingUsage() > RecalcMinUsage)
	{
		var filters1 = new Array();
		filters1[0] = new nlobjSearchFilter('custrecord_ava_batchstatus', null, 'lessthan', 2);
		var searchResult2 = nlapiSearchRecord('customrecord_avareconcilebatch', null, filters, null);
		if(searchResult2 != null)
		{
				AVA_ReconcileData();
		}
	}
}

function AVA_GetHeaderCustomRecordsData()
{
	var MultiCurrBatch, AVA_ResultFlag = true;
	
	while(nlapiGetContext().getRemainingUsage() > MinUsage && AVA_ResultFlag == true)
	{
		AVA_LoadBatchValues();
		
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_documentdate', 	null, 'within', StartDate, EndDate);
		filters[1] = new nlobjSearchFilter('custrecord_ava_documentstatus', 	null, 'equalto', 3);
	
		if(NSIdsArray != null && NSIdsArray.length > 0 && NSIdsArray != 'undefined')
		{
			filters[filters.length] = new nlobjSearchFilter('custrecord_ava_documentinternalid',null, 'noneof', NSIdsArray); 
		}
		
		if(CRIdsArray != null && CRIdsArray.length > 0 && CRIdsArray != 'undefined')
		{
			filters[filters.length] = new nlobjSearchFilter('internalid', 	null, 'noneof', 	CRIdsArray);
			nlapiLogExecution('Debug','CRIdsArray Length: ', CRIdsArray.length);
		}
		
		var columns = new Array();
	 	columns[0] = new nlobjSearchColumn('custrecord_ava_documentinternalid');
	 	columns[1] = new nlobjSearchColumn('custrecord_ava_documenttype');
		columns[2] = new nlobjSearchColumn('custrecord_ava_documentdate');
		columns[3] = new nlobjSearchColumn('custrecord_ava_documentstatus');
		columns[4] = new nlobjSearchColumn('custrecord_ava_totalamount');
		columns[5] = new nlobjSearchColumn('custrecord_ava_totaldiscount');
		columns[6] = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
		columns[7] = new nlobjSearchColumn('custrecord_ava_totaltaxable');
		columns[8] = new nlobjSearchColumn('custrecord_ava_totaltax');
		columns[9] = new nlobjSearchColumn('custrecord_ava_taxcalculationdate');
		columns[10] = new nlobjSearchColumn('custrecord_ava_documentid');
		columns[11] = new nlobjSearchColumn('custrecord_ava_multicurrency');
		columns[12] = new nlobjSearchColumn('custrecord_ava_exchangerate');
	  		
		var searchResult = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, columns);
		
		if(searchResult != null)
		{
			nlapiLogExecution('Debug','CRs Search Length: ', searchResult.length);
			for(var k=0; nlapiGetContext().getRemainingUsage() > MinUsage && k < searchResult.length ; k++)
			{			
				var CR_RecordId = searchResult[k].getId();
				nlapiLogExecution('Debug','CR_RecordId: ', CR_RecordId);
				var BatchChildRecord = nlapiCreateRecord('customrecord_avareconcilebatchrecords');
						
				//Setting in AVATAXHEADERDETAILS Custom record Data in AVARECONCILEBATCHRECORDS custom record
				BatchChildRecord.setFieldValue('custrecord_ava_batchid', BatchId);
				BatchChildRecord.setFieldValue('custrecord_ava_batchdoctype', 	searchResult[k].getValue('custrecord_ava_documenttype'));
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdoctype', searchResult[k].getValue('custrecord_ava_documenttype'));
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdocdate', searchResult[k].getValue('custrecord_ava_documentdate'));
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdocstatus', searchResult[k].getValue('custrecord_ava_documentstatus'));
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotalamount', searchResult[k].getValue('custrecord_ava_totalamount'));
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotaldiscount', searchResult[k].getValue('custrecord_ava_totaldiscount'));		
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtotalexemption', searchResult[k].getValue('custrecord_ava_totalnontaxable'));	
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltaxable', searchResult[k].getValue('custrecord_ava_totaltaxable'));	
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltax', searchResult[k].getValue('custrecord_ava_totaltax'));	
				var MultiCurr = searchResult[k].getValue('custrecord_ava_multicurrency');
				BatchChildRecord.setFieldValue('custrecord_ava_batchmulticurrency', MultiCurr);	
				if(MultiCurr == 'T')
				{
					MultiCurrBatch = 'T';
				}
				
				if(searchResult[k].getValue('custrecord_ava_exchangerate') != null && searchResult[k].getValue('custrecord_ava_exchangerate').length>0)
				{
					var TotalAmount = parseFloat(searchResult[k].getValue('custrecord_ava_totalamount')) / parseFloat(searchResult[k].getValue('custrecord_ava_exchangerate'));
					BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotalamountfc', TotalAmount);	
					var TotalTax = parseFloat(searchResult[k].getValue('custrecord_ava_totaltax')) / parseFloat(searchResult[k].getValue('custrecord_ava_exchangerate'));
					BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltaxfc', TotalTax);	
				}
				BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxdate', searchResult[k].getValue('custrecord_ava_taxcalculationdate'));			
				BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 3);//Only Custom Record
				var BatchRecId = nlapiSubmitRecord(BatchChildRecord, false);
				only_CR++;				
				
				var TempDocArray = CRIdsText;
				if(TempDocArray != null && TempDocArray.length > 3500)
				{									
					CR_NextDocField = CR_CreatedDocField;
					CRIdsCurrText += CR_RecordId + ',';
					CR_NextDocField = (CR_NextDocField=='custrecord_ava_createddocids1')? 'custrecord_ava_createddocids2' : ((CR_NextDocField == 'custrecord_ava_createddocids2') ? 'custrecord_ava_createddocids3': 'custrecord_ava_createddocids4');
				}
				else
				{
					CRIdsText += CR_RecordId + ',';
				}	
			}
			
			//Submit progress details into Batch
			fields = new Array();
			values = new Array();
		
			fields[0] = 'custrecord_ava_onlycr';
			values[0] = only_CR;
			
			if(CRIdsText != '')
			{
				fields[fields.length] = CR_CreatedDocField;
				values[values.length] = CRIdsText;	
			}
			
			if(CRIdsCurrText != '')
			{
				fields[fields.length] = CR_NextDocField;
				values[values.length] = CRIdsCurrText;	
			}
			
			if(MultiCurrBatch == 'T')
			{
				fields[fields.length] = 'custrecord_ava_multicurrencybatch';
				values[values.length] = 'T';
			}

			nlapiSubmitField('customrecord_avareconcilebatch',BatchId,fields,values,false);	
		}
		else
		{
			AVA_ResultFlag = false;
		}		
	}
	
	//Third phase is complete
	if(AVA_ResultFlag == false)
	{					
		fields = new Array();
		values = new Array();
								
		fields[fields.length] = 'custrecord_ava_batchphase';
		values[values.length] = 2;
		
		fields[fields.length] = 'custrecord_ava_batchstatus';
		values[values.length] = 2;
		
		Total = parseFloat(only_AVA) + parseFloat(only_NS);
		Total += parseFloat(only_CR) + parseFloat(AVA_NS);
		Total += parseFloat(AVA_CR) + parseFloat(NS_CR);
		Total += parseFloat(AVA_NS_CR) + parseFloat(Reconciled);
		
		fields[fields.length] = 'custrecord_ava_totalrecords';
		values[values.length] = Total;
		
		fields[fields.length] = 'custrecord_ava_batchprogress';
		values[values.length] = 100;	
		
		nlapiSubmitField('customrecord_avareconcilebatch', BatchId, fields, values);
	}
	
	
}


function AVA_GetNetsuiteTransactions()
{
	var MultiCurrBatch, AVA_ResultFlag = true;
	
	while(nlapiGetContext().getRemainingUsage() > MinUsage && AVA_ResultFlag == true)
	{
		AVA_LoadBatchValues();
		
		var TypeArray = new Array('CustInvc','CashSale','CustCred','CashRfnd');
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('mainline',  null, 'is', 		'T');
		filters[1] = new nlobjSearchFilter('type', 			null, 'anyof', 	TypeArray);
		filters[2] = new nlobjSearchFilter('trandate', 	null, 'within', StartDate, EndDate);
		filters[3] = new nlobjSearchFilter('voided', 			null, 'is', 	'F');
		filters[4] = new nlobjSearchFilter('memorized', 			null, 'is', 	'F');
		
		if(NSIdsArray != null && NSIdsArray.length > 0 && NSIdsArray != 'undefined')
		{
			filters[5] = new nlobjSearchFilter('internalid', 	null, 'noneof', NSIdsArray);
		}
		
		var searchResult = nlapiSearchRecord('transaction', null, filters, null);
		
		if(searchResult != null && searchResult.length > 0)
		{
			nlapiLogExecution('DEBUG','AVA_GetNetsuiteTransactions: searchResult:' , searchResult.length);
			for(var k=0; nlapiGetContext().getRemainingUsage() > MinUsage && k < searchResult.length; k++)
			{
				try
				{
					var DocType, NS_RecordType;
					var NS_Record = nlapiLoadRecord(searchResult[k].getRecordType(), searchResult[k].getId());
					
					var BatchChildRecord = nlapiCreateRecord('customrecord_avareconcilebatchrecords');
					
					//Setting in Netsuite Data in the custom record
					//BatchChildRecord.setFieldValue('custrecord_ava_batchid', BatchId);
					BatchChildRecord.setFieldValue('custrecord_ava_reconcilebatchname', BatchName);
					BatchChildRecord.setFieldValue('custrecord_ava_batchdocno', searchResult[k].getId());
					
					NS_RecordType = (NS_Record.getFieldValue('type') == 'custinvc' || NS_Record.getFieldValue('type') == 'cashsale') ? 1 : 2
					DocType = (NS_Record.getFieldValue('type') == 'custinvc') ? 1 : ((NS_Record.getFieldValue('type') == 'cashsale') ? 3 : ((NS_Record.getFieldValue('type') == 'cashrfnd') ? 4 : 5));
					
					var Multiplier = (NS_RecordType == 1)? 1 : -1;
					
					BatchChildRecord.setFieldValue('custrecord_ava_batchdoctype', 	DocType);
					BatchChildRecord.setFieldValue('custrecord_ava_netsuitedoctyp', NS_RecordType);
					
					var MultiCurr = (NS_Record.getFieldValue('isbasecurrency') == 'F') ? 'T' : 'F';
					BatchChildRecord.setFieldValue('custrecord_ava_batchmulticurrency', MultiCurr);
					
					if(MultiCurr == 'T')
					{
						MultiCurrBatch = 'T';
					}
										
					BatchChildRecord.setFieldValue('custrecord_ava_netsuitedocdate', NS_Record.getFieldValue('trandate'));
					
					var subtotal = (NS_Record.getFieldValue('subtotal') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('subtotal'));
					var shipcost = (NS_Record.getFieldValue('shippingcost') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('shippingcost'));
					var handlingcost = (NS_Record.getFieldValue('handlingcost') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('handlingcost'));
					var giftcert = (NS_Record.getFieldValue('giftcertapplied') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('giftcertapplied'));
					var exchangeRate = NS_Record.getFieldValue('exchangerate');
					
					var TotalAmount = parseFloat(subtotal) + parseFloat(shipcost) + parseFloat(handlingcost) + parseFloat(giftcert);
					BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotalamountfc', parseFloat(TotalAmount * Multiplier));
					
					TotalAmount = parseFloat(nlapiFormatCurrency(subtotal*exchangeRate)) + parseFloat(nlapiFormatCurrency(shipcost*exchangeRate)) + parseFloat(nlapiFormatCurrency(handlingcost*exchangeRate)) + parseFloat(nlapiFormatCurrency(giftcert*exchangeRate));
					BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotalamount', nlapiFormatCurrency(TotalAmount * Multiplier));
									
					var Discount = (NS_Record.getFieldValue('discountamount')== null) ? 0 : NS_Record.getFieldValue('discountamount');
					BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotaldiscount', Discount);
					
					var TaxTotal = (NS_Record.getFieldValue('taxtotal')== null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('taxtotal'));
					BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotaltaxfc', parseFloat(TaxTotal*Multiplier));
					
					TaxTotal = parseFloat(nlapiFormatCurrency(TaxTotal * exchangeRate));
					BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotaltax', nlapiFormatCurrency(TaxTotal * Multiplier));
					
					//setting in Header Detail Custom record Data in Batch Custom record
					
					var NS_CRExist = 'T', CR_RecordId;
					var custfilter = new Array();
					custfilter[0] = new nlobjSearchFilter('custrecord_ava_documentinternalid', null, 'is', searchResult[k].getId());
					custfilter[1] = new nlobjSearchFilter('custrecord_ava_documentstatus', null, 'is', 3);
					
					var columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_ava_documentno');
					columns[1] = new nlobjSearchColumn('custrecord_ava_documenttype');
					columns[2] = new nlobjSearchColumn('custrecord_ava_documentdate');
					columns[3] = new nlobjSearchColumn('custrecord_ava_documentstatus');
					columns[4] = new nlobjSearchColumn('custrecord_ava_totalamount');
					columns[5] = new nlobjSearchColumn('custrecord_ava_totaldiscount');
					columns[6] = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
					columns[7] = new nlobjSearchColumn('custrecord_ava_totaltaxable');
					columns[8] = new nlobjSearchColumn('custrecord_ava_totaltax');
					columns[9] = new nlobjSearchColumn('custrecord_ava_taxcalculationdate');
					columns[10] = new nlobjSearchColumn('custrecord_ava_multicurrency');
					columns[11] = new nlobjSearchColumn('custrecord_ava_exchangerate');
				 		  
					var searchRecords = nlapiSearchRecord('customrecord_avataxheaderdetails', null, custfilter, columns);
					
					if( searchRecords != null )
					{
						CR_RecordId = searchRecords[0].getId();
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdoctype', searchRecords[0].getValue('custrecord_ava_documenttype'));
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdocdate', searchRecords[0].getValue('custrecord_ava_documentdate'));
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdocstatus', searchRecords[0].getValue('custrecord_ava_documentstatus'));
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotalamount', searchRecords[0].getValue('custrecord_ava_totalamount'));
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotaldiscount', searchRecords[0].getValue('custrecord_ava_totaldiscount'));		
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtotalexemption', searchRecords[0].getValue('custrecord_ava_totalnontaxable'));	
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltaxable', searchRecords[0].getValue('custrecord_ava_totaltaxable'));	
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltax', searchRecords[0].getValue('custrecord_ava_totaltax'));	
						BatchChildRecord.setFieldValue('custrecord_ava_batchmulticurrency', searchRecords[0].getValue('custrecord_ava_multicurrency'));	
						if(searchRecords[0].getValue('custrecord_ava_exchangerate') != null && searchRecords[0].getValue('custrecord_ava_exchangerate').length>0)
						{
							var TotalAmount = parseFloat(searchRecords[0].getValue('custrecord_ava_totalamount')) / parseFloat(searchRecords[0].getValue('custrecord_ava_exchangerate'));
							BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotalamountfc', TotalAmount);	
							var TotalTax = parseFloat(searchRecords[0].getValue('custrecord_ava_totaltax')) / parseFloat(searchRecords[0].getValue('custrecord_ava_exchangerate'));
							BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltaxfc', TotalTax);	
						}
						BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxdate', searchRecords[0].getValue('custrecord_ava_taxcalculationdate'));			
					}
					else
					{
						NS_CRExist = 'F';
					}
					
					//set status flag in AVARECONCILEBATCHRECORDS
					if(NS_CRExist == 'F')
					{
						BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 2);//Only Netsuite
						only_NS++;
					}
					else 
					{
						BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 6);//Exists in Netsuite and Custom Record
						NS_CR++;
					}
					
					var BatchRecId = nlapiSubmitRecord(BatchChildRecord, false);
					
					var TempDocArray = NSIdsText;
							
					if(TempDocArray != null && TempDocArray.length > 3500)
					{
						NS_NextDocField = NS_CreatedDocField;
						NSIdsCurrText += searchResult[k].getId() + ',';
						NS_NextDocField = (NS_NextDocField=='custrecord_ava_nscreateddocids1')? 'custrecord_ava_nscreateddocids2' : ((NS_NextDocField == 'custrecord_ava_nscreateddocids2') ? 'custrecord_ava_nscreateddocids3': 'custrecord_ava_nscreateddocids4');
					}
					else
					{
						NSIdsText += searchResult[k].getId() + ',';
					}		
					
					var TempDocArray = CRIdsText;
					if(TempDocArray != null && TempDocArray.length > 3500)
					{									
						if(NS_CRExist == 'T')
						{
							CR_NextDocField = CR_CreatedDocField;
							CRIdsCurrText += CR_RecordId + ',';
							CR_NextDocField = (CR_NextDocField=='custrecord_ava_createddocids1')? 'custrecord_ava_createddocids2' : ((CR_NextDocField == 'custrecord_ava_createddocids2') ? 'custrecord_ava_createddocids3': 'custrecord_ava_createddocids4');

						}
					}
					else
					{
						if(NS_CRExist == 'T')
						{
							CRIdsText += CR_RecordId + ',';
						}
					}				
				}
				catch(err)
				{
					nlapiLogExecution('Error','Got Error on Record Submit for Netsuite DocId: ',searchResult[k].getId());
					break;
				}
			}
			
			//Submit progress details into Batch
			fields = new Array();
			values = new Array();
		
			fields[0] = 'custrecord_ava_onlyns';
			values[0] = only_NS;
			
			fields[1] = 'custrecord_ava_nscr';
			values[1] = NS_CR;
			
			if(NSIdsText != '')
			{
				fields[fields.length] = NS_CreatedDocField;
				values[values.length] = NSIdsText;	
			}
			
			if(NSIdsCurrText != '')
			{
				fields[fields.length] = NS_NextDocField;
				values[values.length] = NSIdsCurrText;	
			}
			
			if(CRIdsText != '')
			{
				fields[fields.length] = CR_CreatedDocField;
				values[values.length] = CRIdsText;	
			}
			
			if(CRIdsCurrText != '')
			{
				fields[fields.length] = CR_NextDocField;
				values[values.length] = CRIdsCurrText;	
			}
			
			if(MultiCurrBatch == 'T')
			{
				fields[fields.length] = 'custrecord_ava_multicurrencybatch';
				values[values.length] = 'T';
			}

			nlapiSubmitField('customrecord_avareconcilebatch',BatchId,fields,values,false);
		
		}
		else
		{
			AVA_ResultFlag = false;
		}		
	}
	
	//Second phase is complete
	if(AVA_ResultFlag == false)
	{					
		fields = new Array();
		values = new Array();
								
		fields[0] = 'custrecord_ava_batchphase';
		values[0] = 1;
		
		fields[1] = 'custrecord_ava_batchprogress';
		values[1] = 80;	
		
		nlapiSubmitField('customrecord_avareconcilebatch', BatchId, fields, values);
	}
}


function AVA_SplitTextField(FieldValue)
{
	var LastDocArray = new Array();
	
	LastDocArray = FieldValue.split(',');
	
	return LastDocArray;
}

function AVA_GetAvataxTransactions(DocStatus)
{
	nlapiLogExecution('Debug', 'In AVA_GetAvataxTransactions','');
	
	var MultiCurrBatch, AVA_ResultFlag = true;
	
	nlapiSubmitField('customrecord_avareconcilebatch', BatchId, 'custrecord_ava_batchstatus', 1);

	BatchName = nlapiLookupField('customrecord_avareconcilebatch', BatchId, 'custrecord_ava_batchname');
	
	AVA_ReadConfig('0');
	var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
	var headers = AVA_ReconcileTaxHeader(security);
	var soapHead = new Array();
	soapHead['Content-Type'] = 'text/xml';
	soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/ReconcileTaxHistory';

	while(nlapiGetContext().getRemainingUsage() > MinUsage && AVA_ResultFlag == true)
	{
		AVA_LoadBatchValues();
		
		var body = AVA_ReconcileTaxBody(DocStatus, LastDocCode);
		var soapPayload = AVA_GetTaxEnvelope(headers + body);		
	
		var response = nlapiRequestURL(AVA_ServiceUrl + '/tax/taxsvc.asmx' , soapPayload, soapHead);
		
		if (response.getCode() == 200)
		{
			var soapText = response.getBody();
			var soapXML = nlapiStringToXML(soapText);
			var ReconcileTaxResult = nlapiSelectNode(soapXML, "//*[name()='ReconcileTaxHistoryResult']");
			var ResultCode = nlapiSelectValue( ReconcileTaxResult, "./*[name()='ResultCode']");

			if (ResultCode == 'Success') 
			{
				var GetTaxResult = new Array();
				GetTaxResult = nlapiSelectNodes(ReconcileTaxResult, "//*[name()='GetTaxResult']");
				
				if(GetTaxResult != null && GetTaxResult.length > 0)
				{
					nlapiLogExecution('Debug', 'GetTaxResult Length' + i, GetTaxResult.length);	
					for(var i = 0; nlapiGetContext().getRemainingUsage() > MinUsage && i < GetTaxResult.length ; i++)
					{	
						nlapiLogExecution('Debug', 'GetTaxResult : i' + i, nlapiXMLToString(GetTaxResult[i]));	
						var NS_TranExist = NS_CRExist = 'F';//flag to indicate whether a record is existing in Netsuite or not.				
						var DocType = AVA_DocType(nlapiSelectValue( GetTaxResult[i], "./*[name()='DocType']"));
						
						try
						{						
							// If DocType = SalesInvoice or ReturnInvoice on AvaTax 
							if(DocType == 2 || DocType == 6)
							{
								var BatchChildRecord =  nlapiCreateRecord('customrecord_avareconcilebatchrecords');
								var NS_RecordId = nlapiSelectValue( GetTaxResult[i], "./*[name()='DocCode']");
								var CR_RecordId;
														
								//save reconcile avatax call data into custom record fields		
								//BatchChildRecord.setFieldValue('custrecord_ava_batchid', 				BatchId);	
								BatchChildRecord.setFieldValue('custrecord_ava_reconcilebatchname', 				BatchName);	
								BatchChildRecord.setFieldValue('custrecord_ava_avataxdoctype', 	DocType);	
								BatchChildRecord.setFieldValue('custrecord_ava_batchdoctype', 	DocType);							
								BatchChildRecord.setFieldValue('custrecord_ava_avataxdocdate', 	AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'),nlapiSelectValue( GetTaxResult[i], "./*[name()='DocDate']")));	
								BatchChildRecord.setFieldValue('custrecord_ava_avataxdocstatus', 	AVA_DocumentStatus(nlapiSelectValue( GetTaxResult[i], "./*[name()='DocStatus']")));
								BatchChildRecord.setFieldValue('custrecord_ava_avataxtotalamount', 	nlapiSelectValue( GetTaxResult[i], "./*[name()='TotalAmount']"));
								BatchChildRecord.setFieldValue('custrecord_ava_avataxtotaldiscount', 	nlapiSelectValue( GetTaxResult[i], "./*[name()='TotalDiscount']"));
								BatchChildRecord.setFieldValue('custrecord_ava_avatotalexemption', 	nlapiSelectValue( GetTaxResult[i], "./*[name()='TotalExemption']"));
								BatchChildRecord.setFieldValue('custrecord_ava_avatotaltaxable', 	nlapiSelectValue( GetTaxResult[i], "./*[name()='TotalTaxable']"));
								BatchChildRecord.setFieldValue('custrecord_ava_avatotaltax', 	nlapiSelectValue( GetTaxResult[i], "./*[name()='TotalTax']"));
								BatchChildRecord.setFieldValue('custrecord_ava_avataxdate', 	AVA_DateFormat(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'),nlapiSelectValue( GetTaxResult[i], "./*[name()='TaxDate']")));
								BatchChildRecord.setFieldValue('custrecord_ava_batchdocno', NS_RecordId);
								
								//save netsuite transaction data into custom record
								var NS_Record = null, NS_RecordType;
								if(DocType == 2)
								{
									try
									{
										var NS_Record = nlapiLoadRecord('invoice',NS_RecordId);
										NS_TranExist = 'T';
										DocType = 1;
									}
									catch(err)
									{
										try
										{
											var NS_Record = nlapiLoadRecord('cashsale',NS_RecordId);
											NS_TranExist = 'T';
											DocType = 3;
										}
										catch(err)
										{
											NS_TranExist = 'F';
										}
									}
								}
								else if(DocType == 6)
								{
									try
									{
										var NS_Record = nlapiLoadRecord('cashrefund',NS_RecordId);
										NS_TranExist = 'T';
										DocType = 4;
									}
									catch(err)
									{
										try
										{
											var NS_Record = nlapiLoadRecord('creditmemo',NS_RecordId);
											NS_TranExist = 'T';
											DocType = 5;
										}
										catch(err)
										{
											NS_TranExist = 'F';
										}
									}
								}									
								if(NS_TranExist == 'T')
								{							
									var Multiplier = (NS_Record.getFieldValue('type') == 'custinvc' || NS_Record.getFieldValue('type') == 'cashsale') ? 1 : -1;								
									NS_RecordType = (NS_Record.getFieldValue('type') == 'custinvc' || NS_Record.getFieldValue('type') == 'cashsale') ? 1 : 2;
									
									BatchChildRecord.setFieldValue('custrecord_ava_batchdoctype', 	DocType);
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitedocno', 	NS_RecordId);
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitedoctyp', NS_RecordType);
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitedocdate', NS_Record.getFieldValue('trandate'));
									
									var MultiCurr = (NS_Record.getFieldValue('isbasecurrency') == 'F') ? 'T' : 'F';
									BatchChildRecord.setFieldValue('custrecord_ava_batchmulticurrency', MultiCurr);								
									if(MultiCurr == 'T')
									{
										MultiCurrBatch = 'T';
									}
									var subtotal = (NS_Record.getFieldValue('subtotal') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('subtotal'));
									var shipcost = (NS_Record.getFieldValue('shippingcost') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('shippingcost'));
									var handlingcost = (NS_Record.getFieldValue('handlingcost') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('handlingcost'));
									var giftcert = (NS_Record.getFieldValue('giftcertapplied') == null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('giftcertapplied'));
									var exchangeRate = NS_Record.getFieldValue('exchangerate');
									
									var TotalAmount = parseFloat(subtotal) + parseFloat(shipcost) + parseFloat(handlingcost) + parseFloat(giftcert);
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotalamountfc', parseFloat(TotalAmount * Multiplier));
																											
									TotalAmount = parseFloat(nlapiFormatCurrency(subtotal*exchangeRate)) + parseFloat(nlapiFormatCurrency(shipcost*exchangeRate)) + parseFloat(nlapiFormatCurrency(handlingcost*exchangeRate)) + parseFloat(nlapiFormatCurrency(giftcert*exchangeRate));
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotalamount', nlapiFormatCurrency(TotalAmount * Multiplier));
									
									var Discount = nlapiFormatCurrency((NS_Record.getFieldValue('discountamount')== null) ? 0 : NS_Record.getFieldValue('discountamount'));
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotaldiscount', Discount);
									
									var TaxTotal = (NS_Record.getFieldValue('taxtotal')== null) ? 0 : nlapiFormatCurrency(NS_Record.getFieldValue('taxtotal'));
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotaltaxfc', parseFloat(TaxTotal * Multiplier));
									
									TaxTotal = parseFloat(nlapiFormatCurrency(TaxTotal * exchangeRate));
									BatchChildRecord.setFieldValue('custrecord_ava_netsuitetotaltax', nlapiFormatCurrency(TaxTotal * Multiplier));									
									
									var filters = new Array();								
									var columns = new Array();
									columns[0] = new nlobjSearchColumn('custrecord_ava_documentno');
									columns[1] = new nlobjSearchColumn('custrecord_ava_documenttype');
									columns[2] = new nlobjSearchColumn('custrecord_ava_documentdate');
									columns[3] = new nlobjSearchColumn('custrecord_ava_documentstatus');
									columns[4] = new nlobjSearchColumn('custrecord_ava_totalamount');
									columns[5] = new nlobjSearchColumn('custrecord_ava_totaldiscount');
									columns[6] = new nlobjSearchColumn('custrecord_ava_totalnontaxable');
									columns[7] = new nlobjSearchColumn('custrecord_ava_totaltaxable');
									columns[8] = new nlobjSearchColumn('custrecord_ava_totaltax');
									columns[9] = new nlobjSearchColumn('custrecord_ava_taxcalculationdate');
									columns[10] = new nlobjSearchColumn('custrecord_ava_documentid');
									columns[11] = new nlobjSearchColumn('custrecord_ava_multicurrency');
									columns[12] = new nlobjSearchColumn('custrecord_ava_exchangerate');
										
									// set filter to get related custom record
									filters[0] = new nlobjSearchFilter('custrecord_ava_documentinternalid', null, 'is', NS_RecordId);
									filters[1] = new nlobjSearchFilter('custrecord_ava_documentstatus', 	null, 'equalto', 3);
									
									var customRecord = nlapiSearchRecord('customrecord_avataxheaderdetails', null, filters, columns);
									
									if(customRecord != null)
									{
										CR_RecordId = customRecord[0].getId();
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdoctype', customRecord[0].getValue('custrecord_ava_documenttype'));
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdocdate', customRecord[0].getValue('custrecord_ava_documentdate'));
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxcrdocstatus', customRecord[0].getValue('custrecord_ava_documentstatus'));
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotalamount', customRecord[0].getValue('custrecord_ava_totalamount'));
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotaldiscount', customRecord[0].getValue('custrecord_ava_totaldiscount'));		
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtotalexemption', customRecord[0].getValue('custrecord_ava_totalnontaxable'));	
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltaxable', customRecord[0].getValue('custrecord_ava_totaltaxable'));	
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltax', customRecord[0].getValue('custrecord_ava_totaltax'));	
										BatchChildRecord.setFieldValue('custrecord_ava_batchmulticurrency', customRecord[0].getValue('custrecord_ava_multicurrency'));	
										if(customRecord[0].getValue('custrecord_ava_exchangerate') != null && customRecord[0].getValue('custrecord_ava_exchangerate').length > 0)
										{
											var TotalAmount = nlapiFormatCurrency(customRecord[0].getValue('custrecord_ava_totalamount')) / nlapiFormatCurrency(customRecord[0].getValue('custrecord_ava_exchangerate'));
											BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxtotalamountfc', nlapiFormatCurrency(TotalAmount));	
											var TotalTax = nlapiFormatCurrency(customRecord[0].getValue('custrecord_ava_totaltax')) / nlapiFormatCurrency(customRecord[0].getValue('custrecord_ava_exchangerate'));
											BatchChildRecord.setFieldValue('custrecord_ava_avacrtotaltaxfc', nlapiFormatCurrency(TotalTax));	
										}
										BatchChildRecord.setFieldValue('custrecord_ava_avacrtaxdate', customRecord[0].getValue('custrecord_ava_taxcalculationdate'));			
										NS_CRExist = 'T';
									}
								}
	//							else
	//							{
	//								filters[0] = new nlobjSearchFilter('custrecord_ava_documentid', null, 'is', nlapiSelectValue( GetTaxResult[i], "./*[name()='DocCode']"));
	//								filters[1] = new nlobjSearchFilter('custrecord_ava_documentstatus', 	null, 'is', 3);
	//							}
								
								
								//set status flag in AVARECONCILEBATCHRECORDS
								if(NS_TranExist == 'F')
								{
									if(NS_CRExist == 'F')
									{
										BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 1);//Only AVATAX			
										only_AVA++;
									}
									else
									{
										BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 5);//Exists only in AVATAX & CUSTOMRECORD
										AVA_CR++;
									}
								}
								else 
								{
									if(NS_CRExist == 'F')
									{
										BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 4);//Exists only in AVATAX & NETSUITE
										AVA_NS++;							
									}
									else
									{
										//Fo Total Amount comparison
										var AVA_TotalAmount = nlapiFormatCurrency(BatchChildRecord.getFieldValue('custrecord_ava_avataxtotalamount'));
										var NS_TotalAmount = nlapiFormatCurrency(BatchChildRecord.getFieldValue('custrecord_ava_netsuitetotalamount'));
										var CR_TotalAmount = nlapiFormatCurrency(BatchChildRecord.getFieldValue('custrecord_ava_avacrtaxtotalamount'));
																						
										//For Total Tax comparison
										var AVA_TotalTax = nlapiFormatCurrency(BatchChildRecord.getFieldValue('custrecord_ava_avatotaltax'));
										var NS_TotalTax = nlapiFormatCurrency(BatchChildRecord.getFieldValue('custrecord_ava_netsuitetotaltax'));
										var CR_TotalTax = nlapiFormatCurrency(BatchChildRecord.getFieldValue('custrecord_ava_avacrtotaltax'));
																															
										if((AVA_TotalAmount == NS_TotalAmount) && (NS_TotalAmount == CR_TotalAmount) && (CR_TotalAmount == AVA_TotalAmount))
										{
											if((AVA_TotalTax == NS_TotalTax) && (NS_TotalTax == CR_TotalTax) && (CR_TotalTax == AVA_TotalTax))
											{
												BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 8);//RECONCILED
												Reconciled++;
											}
											else
											{
												BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 7);//Exists in AVATAX & NETSUITE & CUSTOMRECORD
												AVA_NS_CR++;
											}
										}
										else 
										{
											BatchChildRecord.setFieldValue('custrecord_ava_statusflag', 7);//Exists in AVATAX & NETSUITE & CUSTOMRECORD
											AVA_NS_CR++;
										}
									}
								}			
								
								var BatchRecId = nlapiSubmitRecord(BatchChildRecord, false);
	
								LastDocCode = NS_RecordId;
								
								var TempDocArray = NSIdsText;
								
								if(TempDocArray != null && TempDocArray.length > 3500)
								{
									if(NS_TranExist == 'T')	
									{
										NS_NextDocField = NS_CreatedDocField;
										NSIdsCurrText += NS_RecordId + ',';
										NS_NextDocField = (NS_NextDocField=='custrecord_ava_nscreateddocids1')? 'custrecord_ava_nscreateddocids2' : ((NS_NextDocField == 'custrecord_ava_nscreateddocids2') ? 'custrecord_ava_nscreateddocids3': 'custrecord_ava_nscreateddocids4');
									}
								}
								else
								{
									if(NS_TranExist == 'T')	
									{
										NSIdsText += NS_RecordId + ',';
									}
								}
								
								var TempDocArray = CRIdsText;
								if(TempDocArray != null && TempDocArray.length > 3500)
								{									
									if(NS_CRExist == 'T')
									{
										CR_NextDocField = CR_CreatedDocField;
										CRIdsCurrText += CR_RecordId + ',';
										CR_NextDocField = (CR_NextDocField=='custrecord_ava_createddocids1')? 'custrecord_ava_createddocids2' : ((CR_NextDocField == 'custrecord_ava_createddocids2') ? 'custrecord_ava_createddocids3': 'custrecord_ava_createddocids4');

									}
								}
								else
								{
									if(NS_CRExist == 'T')
									{
										CRIdsText += CR_RecordId + ',';
									}
								}
							}
						}
						catch(err)
						{
							nlapiLogExecution('Error','Got Error on Record Submit for DocCode: ' + nlapiSelectValue( GetTaxResult[i], "./*[name()='DocCode']"), err);
							break;
						}
					}
					
					// Submit progress details into Batch 
					fields = new Array();
					values = new Array();
					
					if(NSIdsText != '')
					{
						fields[fields.length] = NS_CreatedDocField;
						values[values.length] = NSIdsText;	
					}
					
					if(NSIdsCurrText != '')
					{
						fields[fields.length] = NS_NextDocField;
						values[values.length] = NSIdsCurrText;	
					}
					
					if(CRIdsText != '')
					{
						fields[fields.length] = CR_CreatedDocField;
						values[values.length] = CRIdsText;	
					}
					
					if(CRIdsCurrText != '')
					{
						fields[fields.length] = CR_NextDocField;
						values[values.length] = CRIdsCurrText;	
					}
					
					fields[fields.length] = 'custrecord_ava_onlyava';
					values[values.length] = only_AVA;
					
					fields[fields.length] = 'custrecord_ava_avacr';
					values[values.length] = AVA_CR;
					
					fields[fields.length] = 'custrecord_ava_avans';
					values[values.length] = AVA_NS;
					
					fields[fields.length] = 'custrecord_ava_reconciled';
					values[values.length] = Reconciled;
					
					fields[fields.length] = 'custrecord_ava_avanscr';
					values[values.length] = AVA_NS_CR;
					
					fields[fields.length] = 'custrecord_ava_lastdoccode';
					values[values.length] = LastDocCode;
					
					if(MultiCurrBatch == 'T')
					{
						fields[fields.length] = 'custrecord_ava_multicurrencybatch';
						values[values.length] = 'T';
					}
					
					nlapiSubmitField('customrecord_avareconcilebatch', BatchId, fields, values);										
					
				}
				else if(GetTaxResult == null || (GetTaxResult != null && GetTaxResult.length == 0))
				{
					AVA_ResultFlag = false;
				}					
			}
			else
			{
				nlapiLogExecution('Debug', 'Please contact the administrator.', 'Result Code is not Success.');		
			}
		}
		else
		{
			nlapiLogExecution('Error', 'Please contact the administrator.', 'Reconciliation Tax History call was not successful.');		
		}
	}
	
	//First phase is complete
	if(AVA_ResultFlag == false)
	{					
		fields = new Array();
		values = new Array();
								
		fields[fields.length] = 'custrecord_ava_batchphase';
		values[values.length] = 0;
		
		fields[fields.length] = 'custrecord_ava_batchprogress';
		values[values.length] = 60;	
		
		nlapiSubmitField('customrecord_avareconcilebatch', BatchId, fields, values);
	}
}


function AVA_ReconcileTaxBody(DocStatus, LastDocCode)
{
	nlapiLogExecution('Debug', 'LastDocCode in AVA_ReconcileTaxBody', LastDocCode);
	var soap = null;
	soap = '\t<soap:Body>\n';
		soap += '\t\t<ReconcileTaxHistory xmlns="http://avatax.avalara.com/services">\n';
			soap += '\t\t\t<ReconcileTaxHistoryRequest>\n';
				soap += '\t\t\t\t<CompanyCode><![CDATA[' + nlapiGetContext().getCompany() + ']]></CompanyCode>\n';
//				soap += '\t\t\t\t<CompanyCode><![CDATA[SOA]]></CompanyCode>\n';
				if(LastDocCode != 0 && LastDocCode != null)
				{
					nlapiLogExecution('Debug', 'LastDocCode soap line added', '');
					soap += '\t\t\t\t<LastDocCode><![CDATA['+ LastDocCode + ']]></LastDocCode>\n';
				}
				soap += '\t\t\t\t<Reconciled>0</Reconciled>\n';
				soap += '\t\t\t\t<StartDate>'+ AVA_GetDate(StartDate,nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT')) +'</StartDate>\n';
				soap += '\t\t\t\t<EndDate>'+ AVA_GetDate(EndDate,nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT')) +'</EndDate>\n';
				soap += '\t\t\t\t<DocStatus><![CDATA['+ DocStatus +']]></DocStatus>\n';
			soap += '\t\t\t</ReconcileTaxHistoryRequest>\n';
		soap += '\t\t</ReconcileTaxHistory>\n';
	soap += '\t</soap:Body>\n';
	nlapiLogExecution('Debug', 'soap', soap);
	return soap;
}

function AVA_LoadBatchValues()
{
	var NSInternalIds = '', CRInternalIds = ''; 
	
	var BatchRecord = nlapiLoadRecord('customrecord_avareconcilebatch', BatchId);

	BatchName 	= BatchRecord.getFieldValue('custrecord_ava_batchname');
	StartDate		= BatchRecord.getFieldValue('custrecord_ava_batchstartdate');
	EndDate 		= BatchRecord.getFieldValue('custrecord_ava_batchenddate');
	only_AVA		= BatchRecord.getFieldValue('custrecord_ava_onlyava');
	AVA_CR 		= BatchRecord.getFieldValue('custrecord_ava_avacr');
	AVA_NS 		= BatchRecord.getFieldValue('custrecord_ava_avans');
	AVA_NS_CR 	= BatchRecord.getFieldValue('custrecord_ava_avanscr');
	Reconciled 	= BatchRecord.getFieldValue('custrecord_ava_reconciled');
	only_NS        = BatchRecord.getFieldValue('custrecord_ava_onlyns');
	NS_CR		= BatchRecord.getFieldValue('custrecord_ava_nscr');
	only_CR        = BatchRecord.getFieldValue('custrecord_ava_onlycr');
	LastDocCode	= BatchRecord.getFieldValue('custrecord_ava_lastdoccode');

	//Get NetSuite Processed Ids
	if(BatchRecord.getFieldValue('custrecord_ava_nscreateddocids1') != null && BatchRecord.getFieldValue('custrecord_ava_nscreateddocids1').length > 3500)
	{
		if(BatchRecord.getFieldValue('custrecord_ava_nscreateddocids2') != null && BatchRecord.getFieldValue('custrecord_ava_nscreateddocids2').length > 3500)
		{
			if(BatchRecord.getFieldValue('custrecord_ava_nscreateddocids3') != null && BatchRecord.getFieldValue('custrecord_ava_nscreateddocids3').length > 3500)
			{
				NSIdsText = BatchRecord.getFieldValue('custrecord_ava_nscreateddocids4');
				NS_CreatedDocField = 'custrecord_ava_nscreateddocids4';
			}
			else
			{
				NSIdsText = BatchRecord.getFieldValue('custrecord_ava_nscreateddocids3');
				NS_CreatedDocField = 'custrecord_ava_nscreateddocids3';
			}
		}
		else
		{
			NSIdsText = BatchRecord.getFieldValue('custrecord_ava_nscreateddocids2');
			NS_CreatedDocField = 'custrecord_ava_nscreateddocids2';
		}
	}
	else
	{
		NSIdsText = BatchRecord.getFieldValue('custrecord_ava_nscreateddocids1');
		NS_CreatedDocField = 'custrecord_ava_nscreateddocids1';
	}
	
	NS_NextDocField = NS_CreatedDocField;
	
	
	if(NSIdsText == null || NSIdsText == 0)
	{
		NSIdsText = '';
	}
	
	//Get Custom Record Processed Ids(for time being storing values in avatax id fields)
	if(BatchRecord.getFieldValue('custrecord_ava_createddocids1') != null && BatchRecord.getFieldValue('custrecord_ava_createddocids1').length > 3500)
	{
		if(BatchRecord.getFieldValue('custrecord_ava_createddocids2') != null && BatchRecord.getFieldValue('custrecord_ava_createddocids2').length > 3500)
		{
			if(BatchRecord.getFieldValue('custrecord_ava_createddocids3') != null && BatchRecord.getFieldValue('custrecord_ava_createddocids3').length > 3500)
			{
				CRIdsText = BatchRecord.getFieldValue('custrecord_ava_createddocids4');
				CR_CreatedDocField = 'custrecord_ava_createddocids4';
			}
			else
			{
				CRIdsText = BatchRecord.getFieldValue('custrecord_ava_createddocids3');
				CR_CreatedDocField = 'custrecord_ava_createddocids3';
			}
		}
		else
		{
			CRIdsText = BatchRecord.getFieldValue('custrecord_ava_createddocids2');
			CR_CreatedDocField = 'custrecord_ava_createddocids2';
		}
	}
	else
	{
		CRIdsText = BatchRecord.getFieldValue('custrecord_ava_createddocids1');
		CR_CreatedDocField = 'custrecord_ava_createddocids1';
	}
	
	CR_NextDocField = CR_CreatedDocField;
	
	if(CRIdsText == null || CRIdsText == 0)
	{
		CRIdsText = '';
	}
	
	if(BatchRecord.getFieldValue('custrecord_ava_batchphase') == '0' || BatchRecord.getFieldValue('custrecord_ava_batchphase') == '1')
	{	
		for(var i=1; i<=4 ; i++)
		{
			var NS_FieldIds = BatchRecord.getFieldValue('custrecord_ava_nscreateddocids'+i);
			NSInternalIds += NS_FieldIds;
			
			var CR_FieldIds = BatchRecord.getFieldValue('custrecord_ava_createddocids'+i);
			CRInternalIds += CR_FieldIds;
		}
		
		NSIdsArray = AVA_SplitTextField(NSInternalIds);
		CRIdsArray = AVA_SplitTextField(CRInternalIds);		
		
		if(BatchRecord.getFieldValue('custrecord_ava_batchphase') == '1')
		{
			NSIdsArray[NSIdsArray.length-1] = 0;//this was done so tht hte header custom records existing with null or blank value in 'NetSuite Document Internal ID' field can be fetched. Last element in the array is blank		
		}
	}


}


/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
//													End of First Suitelet
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////													



/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
//													Start of Second Suitelet
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////													

//Scheduled Script for deletion of Custom records
function AVA_DeleteReconciledCustomRecords()
{
	// Will be maintaining the deleted records counter in	custrecord_ava_avacr field of batch as this field will be always 0
	// bcoz of DocId removal.	

	while(nlapiGetContext().getRemainingUsage() > MinUsage)
	{	
		nlapiLogExecution('Debug','Start Deletion','');
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_batchstatus', null, 'equalto', 3);
	 	
	 	var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_ava_totalrecords');
	 	columns[1] = new nlobjSearchColumn('custrecord_ava_onlyava');
	 	columns[2] = new nlobjSearchColumn('custrecord_ava_batchname');
	 	
		var searchResult = nlapiSearchRecord('customrecord_avareconcilebatch', null, filters, columns);

		if(searchResult != null && searchResult.length > 0)
		{
			for(var i=0; nlapiGetContext().getRemainingUsage() > MinUsage && i < searchResult.length ; i++)
			{
				nlapiSubmitField('customrecord_avareconcilebatch', searchResult[i].getId(), 'custrecord_ava_batchprogress', 1, false);
					
				while(nlapiGetContext().getRemainingUsage() > MinUsage)
				{					
					nlapiLogExecution('Debug','Batch records:',searchResult[i].getId());
					var  delCtr = 0, custfilters = new Array();		
					//custfilters[0] = new nlobjSearchFilter('custrecord_ava_batchid', null, 'anyof', searchResult[i].getId());
					custfilters[0] = new nlobjSearchFilter('custrecord_ava_reconcilebatchname', null, 'is', searchResult[i].getValue('custrecord_ava_batchname'));
							  
					try
					{
						var searchCust = nlapiSearchRecord('customrecord_avareconcilebatchrecords', null, custfilters, null);
					}
					catch(err)
					{
						nlapiLogExecution('Debug', 'Search not success: ', err);
						nlapiLogExecution('Debug', 'Error Details: ', err.getDetails());
					}
					
					if(searchCust != null)
					{
						try
						{
							var TotalRecs = parseInt(searchResult[i].getValue('custrecord_ava_totalrecords'));
							
							nlapiLogExecution('Debug','Batch records searchCust:',searchCust.length);
														
							for(var k=0; nlapiGetContext().getRemainingUsage() > MinUsage && k < searchCust.length ; k++)
							{			
								nlapiDeleteRecord('customrecord_avareconcilebatchrecords', searchCust[k].getId());
								nlapiLogExecution('Debug','record deleted', searchCust[k].getId());
								delCtr++;
							}
	
							fields = new Array();
							values = new Array();
							
							fields[fields.length] ='custrecord_ava_batchprogress';
							values[fields.length] = Math.floor(((parseFloat(delCtr) + parseFloat((searchResult[i].getValue('custrecord_ava_avacr') != null && searchResult[i].getValue('custrecord_ava_avacr').length > 0 ? searchResult[i].getValue('custrecord_ava_avacr') : 0)))/ parseFloat(TotalRecs)) * 100);
							
							fields[fields.length] ='custrecord_ava_avacr';
							values[fields.length] = parseFloat(searchResult[i].getValue('custrecord_ava_avacr')) + parseFloat(delCtr);
							
							nlapiSubmitField('customrecord_avareconcilebatch', searchResult[0].getId(), fields, values, false);
						}
						catch(err)
						{
							nlapiLogExecution('Debug', 'Deletion not successful: ', err);
							nlapiLogExecution('Debug', 'Error Details: ', err.getDetails());
						}
												
					}
					else if(searchCust == null || searchCust.length == 0)
					{
						nlapiLogExecution('Debug','Batch records searchCust is null:','');
						nlapiDeleteRecord('customrecord_avareconcilebatch', searchResult[i].getId());
						break;
					}
				}
				
				if(nlapiGetContext().getRemainingUsage() <= MinUsage)
				{
					nlapiScheduleScript(nlapiGetContext.getScriptId(), nlapiGetContext.getDeploymentId());
				}
			}				
		}
		else
		{
			// no batches left for deletion
			break;
		}
	}
}


function AVA_ReconciliationResults(request,response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 8 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_TransactionForm = nlapiCreateForm('Reconciliation Batches');
			AVA_TransactionForm.setTitle('Reconciliation Batches');
			AVA_TransactionForm.setScript('customscript_avadeletebatch_client');
			
			var AVA_TransactionList = AVA_TransactionForm.addSubList('custpage_avabatchlist', 'list','Select Batches');
		    AVA_TransactionList.addField('ava_batchid','text', 'Batch ID').setDisplayType('hidden');
		    AVA_TransactionList.addField('apply','checkbox', 'Delete');
		    AVA_TransactionList.addField('ava_batchname','text', 'Name');
		    AVA_TransactionList.addField('ava_batchdate','date', 'Batch Date');
		    AVA_TransactionList.addField('ava_startdate','date', 'Start Date');
		    AVA_TransactionList.addField('ava_enddate','date', 'End Date');
		    AVA_TransactionList.addField('ava_batchprogress','text', 'Batch Progress');
		    AVA_TransactionList.addField('ava_batchstatus','text', 'Batch Status');
		    AVA_TransactionList.addField('ava_viewdetails','text', 'Details');
		    
		    var cols = new Array();
			cols[0]  = new nlobjSearchColumn('custrecord_ava_batchname');
			cols[1]  = new nlobjSearchColumn('custrecord_ava_batchdate');
			cols[2]  = new nlobjSearchColumn('custrecord_ava_batchstartdate');
			cols[3]  = new nlobjSearchColumn('custrecord_ava_batchenddate');
			cols[4]  = new nlobjSearchColumn('custrecord_ava_batchstatus');
			cols[5]  = new nlobjSearchColumn('custrecord_ava_batchprogress');
			cols[6]  = new nlobjSearchColumn('custrecord_ava_batchphase');
			
			var searchresult = nlapiSearchRecord('customrecord_avareconcilebatch', null, null, cols);
				
			for(var i = 0; searchresult != null && i < searchresult.length; i++)
			{
				AVA_TransactionList.setLineItemValue('ava_batchid', 	i+1, 	searchresult[i].getId());
				AVA_TransactionList.setLineItemValue('ava_batchname', 	i+1, 	searchresult[i].getValue('custrecord_ava_batchname'));
				AVA_TransactionList.setLineItemValue('ava_batchdate',	i+1,	searchresult[i].getValue('custrecord_ava_batchdate'));
				AVA_TransactionList.setLineItemValue('ava_startdate', 		i+1, searchresult[i].getValue('custrecord_ava_batchstartdate'));
				AVA_TransactionList.setLineItemValue('ava_enddate', 		i+1, 	searchresult[i].getValue('custrecord_ava_batchenddate'));
				var BatchStatus = searchresult[i].getValue('custrecord_ava_batchstatus');
			
				if(BatchStatus == 3)
				{
					var BatchPhase = searchresult[i].getValue('custrecord_ava_batchphase');
					BatchStatus = (BatchPhase == 0) ? 'In Queue for Deletion' : ((BatchPhase == 1) ? 'In Progress...Deleting Records' : 'Error');
				}
				else
				{
					BatchStatus = (BatchStatus == 0) ? 'In Queue' : ((BatchStatus == 1) ? 'In Progress' : ((BatchStatus == 2) ? 'Completed' : 'Error'));
				}
				
				AVA_TransactionList.setLineItemValue('ava_batchstatus', 	i+1, 	BatchStatus);
				AVA_TransactionList.setLineItemValue('ava_batchprogress', 		i+1, 	searchresult[i].getValue('custrecord_ava_batchprogress'));
				
				if(searchresult[i].getValue('custrecord_ava_batchstatus') == 2)
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_ava_reconcilelist_suitelet', 'customdeploy_ava_reconcilelist', false);
					URL1 = URL1 + '&ava_batchid=' + searchresult[i].getId() + '&ava_status=2&ava_liststart=0&ava_oldstatus=8&ava_linecount=0';
					var FinalURL = '<a href="' + URL1 + '" target="_blank">View Details</a>';
					
					AVA_TransactionList.setLineItemValue('ava_viewdetails',			i+1, FinalURL);
				}
			}
	 		
	 		AVA_TransactionForm.addSubmitButton('Submit');
	 		AVA_TransactionForm.addButton('ava_refresh','Refresh', "window.location = '" + nlapiResolveURL('SUITELET', 'customscript_ava_reconciliation_suitelet', 'customdeploy_ava_reconcileresult') + "&compid=" + nlapiGetContext().getCompany() + "&whence='");
	 		//AVA_TransactionForm.addPageLink('breadcrumb', 'View Reconciliation Results', nlapiResolveURL('SUITELET', 'customscript_ava_reconciliation_suitelet', 'customdeploy_ava_reconcileresult'));
			AVA_TransactionForm.addPageLink('crosslink', 'Create Reconciliation Batch', nlapiResolveURL('SUITELET', 'customscript_avareconcilelist_suitelet', 'customdeploy_avareconcilelist'));
			
			response.writePage(AVA_TransactionForm);
		}
		else
		{
			//set batch status field value to 3 for deletion
			
			var LineCount	= request.getLineItemCount('custpage_avabatchlist');
			
			for ( var i = 1; i <= LineCount ; i++ )
			{
				if ( request.getLineItemValue('custpage_avabatchlist','apply', i) == 'T')
				{
					var BatchId = request.getLineItemValue('custpage_avabatchlist','ava_batchid', i);
				
					var fields = new Array();
					var values = new Array();
					
					fields[0] = 'custrecord_ava_batchstatus';
					values[0] = 3;
					
					fields[1] ='custrecord_ava_batchprogress';
					values[1] = 0;
					
					fields[2] ='custrecord_ava_batchphase';
					values[2] = 0;
					
					fields[3] = 'custrecord_ava_onlyava';
					values[3] = 0;
									
					nlapiSubmitField('customrecord_avareconcilebatch', BatchId, fields, values, false);
				}
			}			
			nlapiScheduleScript('customscript_avadeletebatch_sched','customdeploy_avadeletebatch_deploy1');		
	   		nlapiSetRedirectURL('TASKLINK', 'CARD_-29');
		}
	}
}

function AVA_SaveRecord()
{
	var alertFlag = 'F', alertMsg = '';
	
	for ( var i = 1; i <= nlapiGetLineItemCount('custpage_avabatchlist'); i++ )
	{
		if( nlapiGetLineItemValue('custpage_avabatchlist','apply', i) == 'T' )
		{
			var BatchStatus = nlapiGetLineItemValue('custpage_avabatchlist','ava_batchstatus', i);
			switch(BatchStatus)
			{
				case 'In Queue': 		
								BatchStatus = 0;
								break;
									
				case 'In Progress': 
								BatchStatus = 1;
								break;	 
								
				case 'Completed': 
								BatchStatus = 2;
								break;
								
		 		case 'Delete':      
		 						BatchStatus = 3;
		 						break;	
		 						
				case 'default': 
							    BatchStatus = 4;
		 						break;							 		   				
			}
			
			if(BatchStatus == 1)
			{
				var BatchName = nlapiGetLineItemValue('custpage_avabatchlist','ava_batchname', i);
				alertFlag = 'T';
				alertMsg += BatchName + '\n';
			}
		}
	}
  
  if(alertFlag == 'T')
  {
  	alert('Following Batches are in Progress and cannot be deleted: \n' + alertMsg);
  	return false;
  }
  
  return true;
}

function AVA_ReconciliationList(request,response)
{
	if(AVA_CheckService('TaxSvc') == 0 && AVA_CheckSecurity( 7 ) == 0)
	{
		if(request.getMethod() == 'GET' || request.getMethod() == 'POST')
		{
			var BatchId = request.getParameter('ava_batchid');
			var BatchStatus = request.getParameter('ava_status');
			var AVA_Message = 'Batch Name or Batch Status Missing';
			
			BatchName = nlapiLookupField('customrecord_avareconcilebatch', BatchId, 'custrecord_ava_batchname');
			
			if(BatchId == null || BatchId == '' || BatchStatus == null || BatchStatus == '')  
			{
				var AVA_Notice = AVA_NoticePage(AVA_Message);
				response.write(AVA_Notice);
			}
			else
			{
				var AVA_TransactionForm = nlapiCreateForm('Reconciliation Results');
				AVA_TransactionForm.setTitle('Reconciliation Results');
				AVA_TransactionForm.setScript('customscript_ava_reconcileresult_client');
				
				AVA_TransactionForm.addField('ava_batchid', 'text', 'Batch ID').setDisplayType('hidden');
				AVA_TransactionForm.getField('ava_batchid').setDefaultValue(BatchId);
				
				AVA_TransactionForm.addField('ava_batchname', 'text', 'Batch Name').setDisplayType('inline');
				AVA_TransactionForm.getField('ava_batchname').setDefaultValue(BatchName);
		
				AVA_TransactionForm.addField('ava_batchdaterange','text','Batch Date Range').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_total','integer','Total Records').setDisplayType('inline');		   
				AVA_TransactionForm.addField('ava_onlyava','integer','Only AvaTax').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_onlyns','integer','Only NetSuite').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_onlycr','integer','Only Custom Record').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_avans','integer','AvaTax & NetSuite').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_nscr','integer','NetSuite & Custom Record').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_avacr','integer','AvaTax & Custom Record').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_avanscr','integer','AvaTax, NetSuite & Custom Record').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_reconciled','integer','Reconciled Count').setDisplayType('inline');
				AVA_TransactionForm.addField('ava_liststart','integer','List Start').setDisplayType('hidden');
							
				var SelectCriteria = AVA_TransactionForm.addField('ava_status','select','Sublist Criteria');
			    SelectCriteria.addSelectOption('1','Only AvaTax');
			    SelectCriteria.addSelectOption('2','Only NetSuite');
			    SelectCriteria.addSelectOption('3','Only Custom Record');
			    SelectCriteria.addSelectOption('4','AvaTax & NetSuite');
			    SelectCriteria.addSelectOption('5','AvaTax & Custom Record');
			    SelectCriteria.addSelectOption('6','NetSuite & Custom Record');
			    SelectCriteria.addSelectOption('7','AvaTax, NetSuite & Custom Record');
			    SelectCriteria.addSelectOption('8','Reconciled');
			    SelectCriteria.setDefaultValue(BatchStatus);

			  	AVA_RecordCountFilter(AVA_TransactionForm, BatchId);

			  	AVA_GetReconcileRecords(BatchId, BatchStatus);

			  	var AVA_Tab = AVA_TransactionForm.addTab('custpage_avatab', '');
      
			  	var AVA_TransactionList = AVA_TransactionForm.addSubList('results','list','Results',AVA_Tab);
				AVA_TransactionList.addField('ava_date','text', 'Document Date');
				AVA_TransactionList.addField('ava_tran','text', 'Document Code'); 
				if(MultiCurr == 'T')
				{   
					AVA_TransactionList.addField('ava_multicurr','text', 'Multi-Currency');
				}
				
				AVA_TransactionList.addField('ava_doctype','text', 'Document Type');
				AVA_TransactionList.addField('ava_avaamount','text', 'AvaTax Service Total Amount');
				AVA_TransactionList.addField('ava_avatax','text', 'AvaTax Service Total Tax');
				AVA_TransactionList.addField('ava_nsamount','text', 'NetSuite Total Amount');
				if(MultiCurr == 'T')
				{
					AVA_TransactionList.addField('ava_nsamountfc','text', 'NetSuite Total Amount (Foreign Currency)');
				}
				
				AVA_TransactionList.addField('ava_nstax','text', 'NetSuite Total Tax');
				if(MultiCurr == 'T')
				{
					AVA_TransactionList.addField('ava_nstaxfc','text', 'NetSuite Total Tax (Foreign Currency)');
				}
				AVA_TransactionList.addField('ava_cramount','text', 'AvaTax Custom Record Total Amount');
				if(MultiCurr == 'T')
				{
					AVA_TransactionList.addField('ava_cramountfc','text', 'AvaTax Custom Record Total Amount (Foreign Currency)');
				}
				AVA_TransactionList.addField('ava_crtax','text', 'AvaTax Custom Record Total Tax');
				if(MultiCurr == 'T')
				{
					AVA_TransactionList.addField('ava_crtaxfc','text', 'AvaTax Custom Record Total Tax (Foreign Currency)');
				}
				
				AVA_TransactionForm.addField('ava_oldstatus','integer','Old Status').setDisplayType('hidden');
			 	AVA_TransactionForm.getField('ava_oldstatus').setDefaultValue(request.getParameter('ava_oldstatus'));
				
				var ListStart = AVA_SetSublistValues(AVA_TransactionList, BatchId, parseFloat(BatchStatus));
				AVA_TransactionForm.getField('ava_liststart').setDefaultValue(ListStart);
				
				AVA_TransactionForm.addField('ava_linecount','integer','Line Count').setDisplayType('hidden');
				AVA_TransactionForm.getField('ava_linecount').setDefaultValue(AVA_LineCount);

				var FirstLink = '&lt;&lt;First Page';
				var PrevLink = 'Previous';
				var NextLink = 'Next';
				var LastLink = 'Last Page&gt;&gt;';
				
				//First Page
				if(AVA_PrevFlag == 'T')
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_ava_reconcilelist_suitelet', 'customdeploy_ava_reconcilelist', false);
					URL1 = URL1 + '&ava_batchid=' + request.getParameter('ava_batchid') + '&ava_status=' + request.getParameter('ava_status'); 
					URL1 += '&ava_liststart=0&ava_oldstatus=' + BatchStatus;
					
					var FinalURL;
				    //FinalURL = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">&lt;&lt;First Page</a>';//&gt;
				    FirstLink = '<b><a href="'+ URL1 +'">\t\t\t\t&lt;&lt;First Page</a></b>';//&gt;
				}	
					
				//Previous
				if(AVA_PrevFlag == 'T')
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_ava_reconcilelist_suitelet', 'customdeploy_ava_reconcilelist', false);
					URL1 = URL1 + '&ava_batchid=' + request.getParameter('ava_batchid') + '&ava_status=' + request.getParameter('ava_status'); 
					URL1 += '&ava_liststart='+ ListStart +'&ava_oldstatus=' + BatchStatus + '&ava_linecount=' + AVA_LineCount + '&ava_flag=F';
									
					PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Previous</a></b>';
				}
									
				//Next
				if(AVA_NextFlag == 'T')
				{
					URL1 = nlapiResolveURL('SUITELET', 'customscript_ava_reconcilelist_suitelet', 'customdeploy_ava_reconcilelist', false);
					URL1 = URL1 + '&ava_batchid=' + request.getParameter('ava_batchid') + '&ava_status=' + request.getParameter('ava_status') + '&ava_liststart=' + ListStart + '&ava_oldstatus=' + BatchStatus + '&ava_linecount=' + AVA_LineCount + '&ava_flag=T';
				
					NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Next</a></b>';
				}
				
				//Last Page
				if(AVA_NextFlag == 'T')
				{
					URL1 = nlapiResolveURL('SUITELET', 'customscript_ava_reconcilelist_suitelet', 'customdeploy_ava_reconcilelist', false);
					URL1 = URL1 + '&ava_batchid=' + request.getParameter('ava_batchid') + '&ava_status=' + request.getParameter('ava_status') + '&ava_liststart=' + AVA_EndPage + '&ava_oldstatus=' + BatchStatus + '&ava_linecount=' + AVA_LineCount;
				
					LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 +'">Last Page&gt;&gt;</a></b>';
				}
				
				var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
				var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
				html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
				var PagingHtml = AVA_TransactionForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
				PagingHtml.setLayoutType('outsidebelow','startrow');
	    		
	    		if(MultiCurr == 'T')
				{
	    				AVA_TransactionForm.addField('ava_star','help','(*) indicates Multi-Currency Transactions', null, AVA_Tab).setLayoutType('outsidebelow','startrow');
	    		}

//	    		AVA_TransactionForm.addSubmitButton('Refresh');
			 	response.writePage(AVA_TransactionForm);    
			}
		}
	}
		
}

function AVA_RecordCountFilter(AVA_TransactionForm, BatchId)
{
  	var BatchRec = nlapiLoadRecord('customrecord_avareconcilebatch',BatchId);
  	
	if(BatchRec != null)
	{
		var DateRange = BatchRec.getFieldValue('custrecord_ava_batchstartdate') + ' - ' + BatchRec.getFieldValue('custrecord_ava_batchenddate');
		AVA_TransactionForm.getField('ava_batchdaterange').setDefaultValue(DateRange);
				
		only_AVA = BatchRec.getFieldValue('custrecord_ava_onlyava');
		AVA_TransactionForm.getField('ava_onlyava').setDefaultValue(only_AVA);
		
		only_NS = BatchRec.getFieldValue('custrecord_ava_onlyns');
		AVA_TransactionForm.getField('ava_onlyns').setDefaultValue(only_NS);
		
		only_CR = BatchRec.getFieldValue('custrecord_ava_onlycr');
		AVA_TransactionForm.getField('ava_onlycr').setDefaultValue(only_CR);
		
		AVA_NS = BatchRec.getFieldValue('custrecord_ava_avans');
		AVA_TransactionForm.getField('ava_avans').setDefaultValue(AVA_NS);
		
		NS_CR = BatchRec.getFieldValue('custrecord_ava_nscr');
		AVA_TransactionForm.getField('ava_nscr').setDefaultValue(NS_CR);	
		
		AVA_CR = BatchRec.getFieldValue('custrecord_ava_avacr'); 
		AVA_TransactionForm.getField('ava_avacr').setDefaultValue(AVA_CR);
		
		AVA_NS_CR = BatchRec.getFieldValue('custrecord_ava_avanscr'); 
		AVA_TransactionForm.getField('ava_avanscr').setDefaultValue(AVA_NS_CR);
		
		Reconciled = BatchRec.getFieldValue('custrecord_ava_reconciled'); 
		AVA_TransactionForm.getField('ava_reconciled').setDefaultValue(Reconciled);
		
		Total = BatchRec.getFieldValue('custrecord_ava_totalrecords');
		AVA_TransactionForm.getField('ava_total').setDefaultValue(Total);
		
		MultiCurr = BatchRec.getFieldValue('custrecord_ava_multicurrencybatch');
	}
  
}


function AVA_SetSublistValues(AVA_TransactionList, BatchId, Criteria)
{
	nlapiLogExecution('Debug', 'Record Obj Array',recordObjArray.length);
	var RecordCountStart, RecordCountText;
	if(request.getMethod() == 'POST')
	{
		var j = m = 0;
		AVA_LineCount = 0;
	}
	else
	{
		var j = m = (request.getParameter('ava_oldstatus') == request.getParameter('ava_status'))? parseFloat(request.getParameter('ava_liststart')):0;
		AVA_LineCount = (request.getParameter('ava_oldstatus') == request.getParameter('ava_status'))? request.getParameter('ava_linecount'):0;
	}
	var ListLimit = nlapiGetContext().getSetting('PREFERENCE', 'LISTSEGMENTSIZE');
	var MaxLength = parseFloat(m) + parseFloat(ListLimit);	
		
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
		m = 0;		
		MaxLength = ListLimit;
	}
	
	for(var i=0 ; m < MaxLength && j<recordObjArray.length && j>=0; j++)
	{
		
		AVA_TransactionList.setLineItemValue('ava_date',i+1,AVA_GetDocDate(Criteria,j));
		var doctype = recordObjArray[j].getValue('custrecord_ava_batchdoctype');
		
		doctype = (doctype ==2)? 'SalesInvoice': ((doctype ==6)? 'ReturnInvoice': ((doctype ==1)? 'Invoice':((doctype ==3)? 'Cash Sale':((doctype ==4)? 'Cash Refund':'Credit Memo'))));
		AVA_TransactionList.setLineItemValue('ava_doctype',i+1,doctype);
		
		if(Criteria != 1 && Criteria != 3 && Criteria != 5)
		{
			doctype = (doctype=='Cash Sale')? 'cashsale':((doctype=='Credit Memo')? 'creditmemo' : ((doctype=='Cash Refund')?'cashrefund': 'invoice'));
			var URL1 = nlapiResolveURL('RECORD',doctype,recordObjArray[j].getValue('custrecord_ava_batchdocno'));
			
			var FinalURL = '<a href="' + URL1 + '" target="_blank">' + recordObjArray[j].getValue('custrecord_ava_batchdocno') + '</a>';
	
			AVA_TransactionList.setLineItemValue('ava_tran',i+1,FinalURL);
		}
		else
		{
			AVA_TransactionList.setLineItemValue('ava_tran',i+1,recordObjArray[j].getValue('custrecord_ava_batchdocno'));
		}
		
		AVA_TransactionList.setLineItemValue('ava_avaamount',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_avataxtotalamount')));
		AVA_TransactionList.setLineItemValue('ava_avatax',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_avatotaltax')));
		AVA_TransactionList.setLineItemValue('ava_nsamount',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_netsuitetotalamount')));
		AVA_TransactionList.setLineItemValue('ava_nstax',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_netsuitetotaltax')));
		AVA_TransactionList.setLineItemValue('ava_cramount',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_avacrtaxtotalamount')));
		AVA_TransactionList.setLineItemValue('ava_crtax',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_avacrtotaltax')));
		
		if(recordObjArray[j].getValue('custrecord_ava_batchmulticurrency') == 'T')
		{
			AVA_TransactionList.setLineItemValue('ava_multicurr',i+1,'*');
			AVA_TransactionList.setLineItemValue('ava_nsamountfc',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_netsuitetotalamountfc')));
			AVA_TransactionList.setLineItemValue('ava_nstaxfc',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_netsuitetotaltaxfc')));
			AVA_TransactionList.setLineItemValue('ava_cramountfc',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_avacrtaxtotalamountfc')));
			AVA_TransactionList.setLineItemValue('ava_crtaxfc',i+1,nlapiFormatCurrency(recordObjArray[j].getValue('custrecord_ava_avacrtotaltaxfc')));
		}
		m++;	
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
			RecordCountStart = (request.getParameter('ava_oldstatus') == request.getParameter('ava_status'))? parseFloat(request.getParameter('ava_liststart')):0;
		}
		RecordCountText = 'Records: ' + ((i==0) ? 0 : (parseFloat(RecordCountStart) + parseFloat(1))) + ' - ' + m;
	}
	  
	if(RecordCountStart>0)
	{
		AVA_PrevFlag = 'T'; 
	}
	
	if(m<recordObjArray.length)
	{
		AVA_NextFlag = 'T';
	}
  
	try
	{
		AVA_EndPage = String(parseFloat(recordObjArray.length)/parseFloat(ListLimit));
		var AmountSplit = new Array();
		AmountSplit = AVA_EndPage.split('.');
		AVA_EndPage = parseFloat(AmountSplit[0]) * parseFloat(ListLimit);		
				
		if(recordObjArray != null && (recordObjArray.length == AVA_EndPage))
		{
			AVA_EndPage = parseFloat(AVA_EndPage) - parseFloat(ListLimit);
		}
	}
	catch(err)
	{
	}
  
  AVA_TransactionList.setHelpText(RecordCountText);
		
	return j; 
}


function AVA_GetDocDate(Criteria,Ctr)
{
	var AVA_Date = null;
	switch(Criteria)
	{
		case 1: 	AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avataxdocdate');
					break;
						
		case 2: 	AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_netsuitedocdate');
					break;	
						
		case 3:		AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avacrtaxcrdocdate');
					break;	
						
		case 4: 	if(recordObjArray[Ctr].getValue('custrecord_ava_avataxdocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avataxdocdate');
					}
					else if(recordObjArray[Ctr].getValue('custrecord_ava_netsuitedocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_netsuitedocdate');
					}
					break;
						
		case 5: 	if(recordObjArray[Ctr].getValue('custrecord_ava_avataxdocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avataxdocdate');
					}
					else if(recordObjArray[Ctr].getValue('custrecord_ava_avacrtaxcrdocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avacrtaxcrdocdate');
					}
					break;		
						
		case 6: 	if(recordObjArray[Ctr].getValue('custrecord_ava_netsuitedocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_netsuitedocdate');
					}
					else if(recordObjArray[Ctr].getValue('custrecord_ava_avacrtaxcrdocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avacrtaxcrdocdate');
					}
					break;
						
		default: 	if(recordObjArray[Ctr].getValue('custrecord_ava_avataxdocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avataxdocdate');
					}
					else if(recordObjArray[Ctr].getValue('custrecord_ava_netsuitedocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_netsuitedocdate');
					}
					else if(recordObjArray[Ctr].getValue('custrecord_ava_avacrtaxcrdocdate') !=null)
					{			
						AVA_Date = recordObjArray[Ctr].getValue('custrecord_ava_avacrtaxcrdocdate');
					}
	}

	return AVA_Date;
}


function AVA_GetReconcileRecords(BatchId, Criteria)
{
	var BatchName = nlapiLookupField('customrecord_avareconcilebatch', BatchId, 'custrecord_ava_batchname');
	
	nlapiLogExecution('Debug','Criteria: ',Criteria);
	recordIdArray = new Array();
	recordObjArray= new Array();
	
 	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_reconcilebatchname',		null, 'is', BatchName);
	filters[1] = new nlobjSearchFilter('custrecord_ava_statusflag',		null, 'equalto', Criteria);
		 	 	
 	var cols = new Array();
	cols[0]  = new nlobjSearchColumn('custrecord_ava_batchdocno');
	cols[1]  = new nlobjSearchColumn('custrecord_ava_avataxtotalamount');
	cols[2]  = new nlobjSearchColumn('custrecord_ava_avatotaltax');
	cols[3]  = new nlobjSearchColumn('custrecord_ava_netsuitetotalamount');
	cols[4]  = new nlobjSearchColumn('custrecord_ava_netsuitetotaltax');
	cols[5]  = new nlobjSearchColumn('custrecord_ava_avacrtaxtotalamount');
	cols[6]  = new nlobjSearchColumn('custrecord_ava_avacrtotaltax');
	cols[7]  = new nlobjSearchColumn('custrecord_ava_statusflag');
	cols[8]  = new nlobjSearchColumn('custrecord_ava_avataxdocdate');
	cols[9]  = new nlobjSearchColumn('custrecord_ava_netsuitedocdate');
	cols[10] = new nlobjSearchColumn('custrecord_ava_avacrtaxcrdocdate');
	cols[11] = new nlobjSearchColumn('custrecord_ava_batchdoctype');
	cols[12] = new nlobjSearchColumn('custrecord_ava_batchmulticurrency');
	cols[13] = new nlobjSearchColumn('custrecord_ava_netsuitetotalamountfc');
	cols[14] = new nlobjSearchColumn('custrecord_ava_netsuitetotaltaxfc');
	cols[15] = new nlobjSearchColumn('custrecord_ava_avacrtaxtotalamountfc');
	cols[16] = new nlobjSearchColumn('custrecord_ava_avacrtotaltaxfc');
				
	var searchResult = nlapiSearchRecord('customrecord_avareconcilebatchrecords', null, filters, cols);
	
	while(searchResult != null && searchResult.length > 0)
	{
		nlapiLogExecution('Debug','searchResult Length: ',searchResult.length);
		for(var k=0; searchResult != null && k<searchResult.length; k++)
		{
			try
			{
				recordIdArray[recordIdArray.length] = searchResult[k].getId();
				recordObjArray[recordObjArray.length] = searchResult[k];
			}
			catch(err)
			{
				
			}
		}
		
		if(searchResult.length >= 1000)
		{	
			filters[2] = new nlobjSearchFilter('internalid', null, 'noneof', recordIdArray);
			
			searchResult = nlapiSearchRecord('customrecord_avareconcilebatchrecords', null, filters, cols);
		}
		else
		{
			break;
		}
	}
}


// Field change function to track change to the sublist criteria and diaplay data accordingly
function AVA_FieldChange(type, name)
{
	if(name == 'ava_status')
	{
		setWindowChanged(window, false);
		var URL1 = nlapiResolveURL('SUITELET', 'customscript_ava_reconcilelist_suitelet', 'customdeploy_ava_reconcilelist', false);
		URL1 = URL1 + '&ava_batchid=' + nlapiGetFieldValue('ava_batchid') + '&ava_status=' + nlapiGetFieldValue('ava_status') + '&ava_liststart=0&ava_oldstatus=8&ava_linecount=0'; 
		window.location = URL1;
	}	
}

function AVA_ReconcileTaxHeader(security)
{
	var soap = null;
	soap = '\t<soap:Header>\n';
		soap += security;
		soap += '\t\t<Profile xmlns="http://avatax.avalara.com/services">\n';
				soap += '\t\t\t<Name><![CDATA[6.0]]></Name>\n';
			soap += '\t\t\t<Client><![CDATA[' + AVA_ClientAtt + ']]></Client>\n';
				soap += '\t\t\t<Adapter/>\n';
				soap += '\t\t\t<Machine/>\n';
			soap += '\t\t</Profile>\n';
	soap += '\t</soap:Header>\n';
	return soap;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
//													End of Second Suitelet
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////													





