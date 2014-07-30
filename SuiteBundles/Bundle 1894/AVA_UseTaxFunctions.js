/******************************************************************************************************
	Script Name  - AVA_UseTaxFunctions.js
	Company      - Avalara Technologies Pvt Ltd.
******************************************************************************************************/

/******************************************************************************************************/
/* Global Values Decalartion */
/******************************************************************************************************/
{
	var UseTaxMinUsage = 300;
	var BatchId,BatchVendor,Rec_All, Rec_PurchaseOrder,Rec_PurchaseInvoice,BatchFromDate,BatchToDate,LastTranId ,BatchStatus,CompanyId,BatchName,FileNameCount;
	var AVA_EncryptData, AVA_Verifycheck = 0, AVA_Message, AVA_AccountType;	
}
/***********************************************************************************************************/


function AVA_UseTaxForm(request, response)
{
	if(AVA_CheckService('BatchSvc') == 0 && AVA_CheckSecurity( 22 ) == 0)
	{	
		if(request.getMethod() == 'GET')
		{
			nlapiLogExecution('Debug','Use Tax Field', AVA_EnableBatchService);
			var form = nlapiCreateForm('Consumer UseTax Form');
			form.setScript('customscript_ava_usetaxform_client');
			form.setTitle('Consumer Use Tax Utility');
			
			var verification = form.addField('ava_verifycheck',			'text',		'Verification Check',  null, null);
			verification.setDefaultValue('0');
			verification.setDisplayType('hidden');
			
			form.addField('ava_disabletax',	'checkbox',	'Disable Tax',  null, null);
			form.getField('ava_disabletax').setDefaultValue(AVA_DisableTax);
			form.getField('ava_disabletax').setDisplayType('hidden');
			
			form.addFieldGroup('ava_batchdata', '<b>Batch Information</b>');
			form.addField('ava_batchname',			'text',		'Batch Name',  null, 'ava_batchdata').setHelpText("Please give the name for the Batch");
			form.getField('ava_batchname').setMandatory(true);
			
			form.addField('ava_vendor',	'select',	'Vendor',  'vendor', 'ava_batchdata');
			
			var DateFormat 	= form.addField('ava_dateformat',		'text',			'Date Format');
			DateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
			DateFormat.setDisplayType('hidden');
			
			
			form.addFieldGroup('ava_filter', '<b>Filter Criteria</b>');
			form.addField('ava_usetaxbase',	'label',	'Perform UseTax Calculation Based on:', null, 'ava_filter').setLayoutType('startrow');
			form.addField('ava_usetaxtype', 'radio',	'Transaction Date',	'td', 'ava_filter').setLayoutType('midrow');
			form.addField('ava_usetaxtype', 'radio',	'Date Created',	'dc', 'ava_filter').setLayoutType('midrow');
			form.addField('ava_usetaxtype', 'radio',	'Date Modified', 'dm',  'ava_filter').setLayoutType('endrow');
			form.getField('ava_usetaxtype').setDefaultValue('td');
			
			form.addField('ava_transfromdate',	'date',		'From Date', null, 'ava_filter').setLayoutType('startrow');;
			form.getField('ava_transfromdate').setMandatory(true);
			form.addField('ava_transtodate',		'date',		'To Date', null, 'ava_filter').setLayoutType('endrow');
			form.getField('ava_transtodate').setMandatory(true);
			
			form.addSubmitButton('Submit');
			form.addResetButton('Reset');
			
			form.addPageLink('crosslink', 'View Consumer Use Tax Batches', nlapiResolveURL('SUITELET', 'customscript_ava_usetaxbatches', 'customdeploy_ava_usetaxbatches'));
			response.writePage(form);
		}
		else
		{
			var flag = 0;
			if(request.getParameter('ava_verifycheck') == 0)
			{
				if (request.getParameter('ava_batchname') != null && request.getParameter('ava_batchname').length <= 0)
				{
					AVA_Message = 'Please enter value(s) for Batch Name.';
					flag = 1;
				}
				
				if (flag == 0 && request.getParameter('ava_transfromdate') != null && request.getParameter('ava_transfromdate').length <= 0)
				{
					AVA_Message = 'Please enter value(s) for From Date.';	
					flag =1;
				}
				
				if (flag == 0 && request.getParameter('ava_transtodate') != null && request.getParameter('ava_transtodate').length <= 0)
				{
					AVA_Message = 'Please enter value(s) for To Date.';	
					flag =1;
				}
				
				var StartDate = new Date(AVA_FormatDate(request.getParameter('ava_dateformat'), request.getParameter('ava_transfromdate')));
				var EndDate = new Date(AVA_FormatDate(request.getParameter('ava_dateformat'), request.getParameter('ava_transtodate')));
				
				if(flag == 0 && EndDate < StartDate)
				{
					AVA_Message = 'To Date should be greater than or equal to From Date';
					flag =1;
				}
				
				if(flag == 0 && request.getParameter('ava_disabletax') == 'T')
				{
					AVA_Message = 'AvaTax Calculation is disabled in Configuration Settings.';
					flag =1;
				}
				
				if(flag == 1)
				{
					var AVA_Notice = AVA_NoticePage(AVA_Message);
					response.write(AVA_Notice);
				}	
			}
			
			if(flag == 0)
			{
				var record = nlapiCreateRecord('customrecord_avausetaxbatch');
				
				record.setFieldValue('name', request.getParameter('ava_batchname'));
				record.setFieldValue('custrecord_ava_usetaxbatchname', request.getParameter('ava_batchname'));
				record.setFieldValue('custrecord_ava_vendor', request.getParameter('ava_vendor'));
				record.setFieldValue('custrecord_ava_transfromdate', request.getParameter('ava_transfromdate'));
				record.setFieldValue('custrecord_ava_transtodate', request.getParameter('ava_transtodate'));
				record.setFieldValue('custrecord_ava_usetaxtype', request.getParameter('ava_usetaxtype'));
				record.setFieldValue('custrecord_ava_usetaxstatus',	0);
				record.setFieldValue('custrecord_ava_companyid', 0);
				record.setFieldValue('custrecord_ava_filenamecount', 1);
				var recId = nlapiSubmitRecord(record, false);	
				
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_ava_usetaxstatus', null, 'lessthan', 2);
				var searchResult = nlapiSearchRecord('customrecord_avausetaxbatch', null, filters, null);
				if(searchResult != null && searchResult.length == 1)
				{
					nlapiScheduleScript('customscript_avausetax_sched','customdeploy_avausetax_sched');
				}
				nlapiSetRedirectURL('SUITELET', 'customscript_ava_usetaxbatches', 'customdeploy_ava_usetaxbatches');
			}	
		}
	}
}

function AVA_UseTaxViewBatches(request,response)
{
	if(AVA_CheckService('BatchSvc') == 0 && AVA_CheckSecurity( 23 ) == 0)
	{	
		if(request.getMethod() == 'GET')
		{
			var AVA_UseTaxBatchForm = nlapiCreateForm('Consumer Use Tax Batches');
			AVA_UseTaxBatchForm.setTitle('Consumer Use Tax Batches');
			AVA_UseTaxBatchForm.setScript('customscript_avadeletebatch_client');
			
			var AVA_UseTaxBatchList = AVA_UseTaxBatchForm.addSubList('custpage_avausetaxbatchlist', 'list','Select Batches');
			AVA_UseTaxBatchList.addField('ava_usetaxbatid','text', 'Batch ID').setDisplayType('hidden');
			AVA_UseTaxBatchList.addField('apply','checkbox', 'Delete');
			AVA_UseTaxBatchList.addField('ava_batchname',		'text', 'Name');
			AVA_UseTaxBatchList.addField('ava_transfromdate',		'date', 'Purchase Bill From Date');
			AVA_UseTaxBatchList.addField('ava_transtodate',			'date', 'Purchase Bill To Date');
			AVA_UseTaxBatchList.addField('ava_batchstatus',			'text', 'Batch Status');
			
			var cols = new Array();
			cols[cols.length] = new nlobjSearchColumn('name');
			cols[cols.length] = new nlobjSearchColumn('custrecord_ava_usetaxbatchname');
			cols[cols.length] = new nlobjSearchColumn('custrecord_ava_transfromdate');
			cols[cols.length] = new nlobjSearchColumn('custrecord_ava_transtodate');
			cols[cols.length] = new nlobjSearchColumn('custrecord_ava_usetaxstatus');
			
			var searchresult = nlapiSearchRecord('customrecord_avausetaxbatch', null, null, cols);
			
			for(var i = 0; searchresult != null && i < searchresult.length; i++)
			{
				AVA_UseTaxBatchList.setLineItemValue('ava_usetaxbatid', 	i+1, 	searchresult[i].getId());
				AVA_UseTaxBatchList.setLineItemValue('ava_batchname', 	i+1, 	searchresult[i].getValue('name'));
				AVA_UseTaxBatchList.setLineItemValue('ava_transfromdate',i+1, searchresult[i].getValue('custrecord_ava_transfromdate'));
				AVA_UseTaxBatchList.setLineItemValue('ava_transtodate',i+1, searchresult[i].getValue('custrecord_ava_transtodate'));
				var BatchStatus = searchresult[i].getValue('custrecord_ava_usetaxstatus');
				
				BatchStatus = (BatchStatus == 0) ? 'In Queue' : ((BatchStatus == 1) ? 'In Progress' : ((BatchStatus == 2) ? 'Completed' : 'Error'));
				AVA_UseTaxBatchList.setLineItemValue('ava_batchstatus', 	i+1, 	BatchStatus);		
			}
			
			AVA_UseTaxBatchForm.addSubmitButton('Submit');
			AVA_UseTaxBatchForm.addButton('ava_refresh','Refresh', "window.location = '" + nlapiResolveURL('SUITELET', 'customscript_ava_usetaxbatches', 'customdeploy_ava_usetaxbatches') + "&compid=" + nlapiGetContext().getCompany() + "&whence='");
			AVA_UseTaxBatchForm.addPageLink('crosslink', 'Create Consumer Use Tax Batch', nlapiResolveURL('SUITELET', 'customscript_ava_createusetaxbatch', 'customdeploy_ava_createusetaxbatch'));
			response.writePage(AVA_UseTaxBatchForm);
		}
		else
		{
			var LineCount	= request.getLineItemCount('custpage_avausetaxbatchlist');
			for ( var i = 1; i <= LineCount ; i++ )
			{
				if (request.getLineItemValue('custpage_avausetaxbatchlist','apply', i) == 'T')
				{
					var BatchId = request.getLineItemValue('custpage_avausetaxbatchlist','ava_usetaxbatid', i);
					nlapiLogExecution('DEBUG', 'BatchId', BatchId);
					nlapiDeleteRecord('customrecord_avausetaxbatch', BatchId);
				}
			}
			nlapiSetRedirectURL('TASKLINK', 'CARD_-29');	
		}
	}
}

function AVA_UseTaxSave()
{
	if (nlapiGetFieldValue('ava_batchname') != null && nlapiGetFieldValue('ava_batchname').length <= 0)
	{
		alert('Please enter value(s) for Batch Name.')
		document.forms['main_form'].ava_batchname.focus();
		return false;
	}
	
	if (nlapiGetFieldValue('ava_transfromdate') != null && nlapiGetFieldValue('ava_transfromdate').length <= 0)
	{
		alert('Please enter value(s) for From Date.')
		document.forms['main_form'].ava_transfromdate.focus();
		return false;
	}
	
	if (nlapiGetFieldValue('ava_transtodate') != null && nlapiGetFieldValue('ava_transtodate').length <= 0)
	{
		alert('Please enter value(s) for To Date.')
		document.forms['main_form'].ava_transtodate.focus();
		return false;
	}
	
	var StartDate = new Date(AVA_FormatDate(nlapiGetFieldValue('ava_dateformat'), nlapiGetFieldValue('ava_transfromdate')));
	var EndDate = new Date(AVA_FormatDate(nlapiGetFieldValue('ava_dateformat'), nlapiGetFieldValue('ava_transtodate')));
	
	if(EndDate < StartDate)
	{
		alert('To Date should be greater than or equal to From Date');
		return false;
	}
	
	if(nlapiGetFieldValue('ava_disabletax') == 'T')
	{
		alert('AvaTax Calculation is disabled in Configuration Settings.');
		return false;
	}
	
	nlapiSetFieldValue('ava_verifycheck','1');
	return true;
}

function AVA_UseTax()
{
	// Batch Statuses:
	// 0 = not started / In Queue
	// 1 = In Progress
	// 2 = Completed
	// 3 = Error 
	
	var flag = 0;
	AVA_ReadConfig('0');
	var filter = new Array();
	filter[0] = new nlobjSearchFilter('custrecord_ava_usetaxstatus', null, 'lessthan', 2);
	
	var col = new Array();
	col[col.length] = new nlobjSearchColumn('custrecord_ava_usetaxbatchname');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_vendor');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_transfromdate');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_transtodate');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_usetaxtype');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_usetaxstatus');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_companyid');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_lasttransid');
	col[col.length] = new nlobjSearchColumn('custrecord_ava_filenamecount');
	
	var searchResult = nlapiSearchRecord('customrecord_avausetaxbatch', null, filter, col);
	for(var i = 0; nlapiGetContext().getRemainingUsage() > UseTaxMinUsage && searchResult != null && i < searchResult.length ; i++)
	{
		BatchId	 		= 	searchResult[i].getId();
		BatchName		=	searchResult[i].getValue('custrecord_ava_usetaxbatchname');
		BatchVendor 	= 	searchResult[i].getValue('custrecord_ava_vendor');
		BatchFromDate	=	searchResult[i].getValue('custrecord_ava_transfromdate');
		BatchToDate		=	searchResult[i].getValue('custrecord_ava_transtodate');
		UseTaxType		=	searchResult[i].getValue('custrecord_ava_usetaxtype');
		LastTranId 		=	searchResult[i].getValue('custrecord_ava_lasttransid');
		BatchStatus		=	searchResult[i].getValue('custrecord_ava_usetaxstatus');
		CompanyId		=	searchResult[i].getValue('custrecord_ava_companyid');
		FileNameCount	=	searchResult[i].getValue('custrecord_ava_filenamecount');
		
		while(BatchStatus == 0 || BatchStatus == 1)
		{
			if(nlapiGetContext().getRemainingUsage() > UseTaxMinUsage)
			{
				if (BatchStatus == 0) nlapiSubmitField('customrecord_avausetaxbatch', BatchId, 'custrecord_ava_usetaxstatus', 1, false);

				var searchResult1 = AVA_SearchTransactions();
				var UseTaxBreak = 0;
				if(searchResult1 != null && searchResult1.length > 0)
				{
					if(BatchStatus == 0 && CompanyId == 0)
					{
						flag = AVA_CompanyFetch();
					}
					else
					{
						//if usage exceed then flag is set to 1.
						flag = 1;
					}
					
					//batch save
					if(flag == 1)
					{
						var locations = AVA_GetAllLocations();
						var FileContent = 'ProcessCode,DocCode,DocType,DocDate,CompanyCode,CustomerCode,EntityUseCode,LineNo,TaxCode,TaxDate,ItemCode,Description,Qty,Amount,Discount,Ref1,Ref2,ExemptionNo,RevAcct,DestAddress,DestCity,DestRegion,DestPostalCode,DestCountry,OrigAddress,OrigCity,OrigRegion,OrigPostalCode,OrigCountry,LocationCode,SalesPersonCode,PurchaseOrderNo,CurrencyCode,ExchangeRate,ExchangeRateEffDate,PaymentDate,TaxIncluded,DestTaxRegion,OrigTaxRegion,Taxable,TaxType,TotalTax,CountryName,CountryCode,CountryRate,CountryTax,StateName,StateCode,StateRate,StateTax,CountyName,CountyCode,CountyRate,CountyTax,CityName,CityCode,CityRate,CityTax,Other1Name,Other1Code,Other1Rate,Other1Tax,Other2Name,Other2Code,Other2Rate,Other2Tax,Other3Name,Other3Code,Other3Rate,Other3Tax,Other4Name,Other4Code,Other4Rate,Other4Tax,ReferenceCode,BuyersVATNo \n';
						for(var k=0; k < searchResult1.length; k++)					
						{
							var LineNo = 1;
							if(nlapiGetContext().getRemainingUsage() > UseTaxMinUsage)
							{
								var Record = nlapiLoadRecord(searchResult1[k].getRecordType(), searchResult1[k].getId());
								nlapiLogExecution('Debug', 'Record id', searchResult1[k].getId());
								AVA_GetItemsTaxLines(Record);
								for(var i = 0; AVA_TaxLines != null && i < AVA_TaxLines.length; i++)
								{
									if(AVA_TaxLines[i] == 'T')
									{
										var TransType 	= 2;
									
										var DocDate = AVA_GetDate(searchResult1[k].getValue('trandate') , nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
										
										var ItemCode = AVA_LineNames[i].replace(/"/g, "\"\"");
										if(ItemCode.search(",") != -1) ItemCode = "\"" + ItemCode + "\"";
										
										if(AVA_LineTab[i] == 'item')
										{
											var Desc = (Record.getLineItemValue('item', 'description', i + 1) != null && Record.getLineItemValue('item', 'description', i + 1).length > 0) ? Record.getLineItemValue('item', 'description', i + 1) : ItemCode;
											Desc = Desc.replace(/"/g, "\"\"");
											if(Desc.search(",") != -1) Desc = "\"" + Desc + "\"";
										}
										else
										{
											var Desc = ItemCode;
										}
										
										var ref1 = (searchResult1[k].getValue('isperson','vendor') == 'T') ? (searchResult1[k].getValue('firstname','vendor') + ((searchResult1[k].getValue('middlename','vendor') != null && searchResult1[k].getValue('middlename','vendor').length > 0) ? ( ' ' + searchResult1[k].getValue('middlename','vendor')) : ' ') + ((searchResult1[k].getValue('lastname','vendor') != null && searchResult1[k].getValue('lastname','vendor').length > 0) ? ( ' ' + searchResult1[k].getValue('lastname','vendor')) : '')) : (searchResult1[k].getValue('companyname','vendor'));
										ref1 = ref1.replace(/"/g, "\"\"");
										if(ref1.search(",") != -1) ref1 = "\"" + ref1 + "\"";
											
										var CustomerCode = searchResult1[k].getValue('entityid','vendor');
										CustomerCode = CustomerCode.replace(/"/g, "\"\"");
										if(CustomerCode.search(",") != -1) CustomerCode = "\"" + CustomerCode + "\"";
										
										FileContent +='3,';												//process code
										FileContent += searchResult1[k].getValue('internalid') +',';	//Doc Code
										FileContent += TransType +',';									//DocType
										FileContent += DocDate +',';									//DocDate
										FileContent += nlapiGetContext().getCompany() +',';				//Company Code
										FileContent += CustomerCode.substring(0, 49)+', ,';				//Customer code
										FileContent += LineNo +', , ,';									//Line No
										FileContent += ItemCode +',';									//ItemCode
										FileContent += Desc.substring(0,255) + ',';						//Description
										FileContent += AVA_LineQty[i] +',';								//Qty
										FileContent += AVA_LineAmount[i] +', ,';						//Amount
										FileContent += ref1.substring(0, 50) +',';						//Ref1
										FileContent += ',';												//Ref2
										FileContent += ',';												//Exception
										FileContent += AVA_AccountType[i] +',';							//RevAcct
										if(searchResult1[k].getValue('shipaddresslist') != null && searchResult1[k].getValue('shipaddresslist').length > 0)
										{
											FileContent += searchResult1[k].getValue('shipaddress1') +','    // DestAddress
											FileContent += searchResult1[k].getValue('shipcity') +','		//	Dest city
											FileContent += searchResult1[k].getValue('shipstate') +','		//DestState
											FileContent += searchResult1[k].getValue('shipzip') +','		//DestZip
											FileContent += searchResult1[k].getValue('shipcountry') +',';	//DestCountry
										}
										else
										{
											var id = searchResult1[k].getValue('billaddresslist');
											
											FileContent += searchResult1[k].getValue('billaddress1') +','
											FileContent += searchResult1[k].getValue('billcity') +','
											FileContent += searchResult1[k].getValue('billstate') +','
											FileContent += searchResult1[k].getValue('billzip') +','
											FileContent += searchResult1[k].getValue('billcountry') +',';
										}
										if((searchResult1[k].getValue('location') != null && searchResult1[k].getValue('location').length > 0) || (searchResult1[k].getText('location') != null && searchResult1[k].getText('location').length > 0))
										{
											FileContent += searchResult1[k].getValue('address1','location') +',';	//origAddress
											FileContent += searchResult1[k].getValue('city','location') +',';		//origCity
											FileContent += searchResult1[k].getValue('state','location')+',';		//origregion
											FileContent += searchResult1[k].getValue('zip','location')+',';			//origPostal
											FileContent += searchResult1[k].getValue('country','location')+',';		//OrigCountry
											FileContent += searchResult1[k].getValue('name','location').substring(0, 50)+',';	//location code
										}
										else
										{
											if(Record.getLineItemValue(AVA_LineTab[i], 'location', i + 1) != null && Record.getLineItemValue(AVA_LineTab[i], 'location', i + 1) > 0)
											{
												var AddressList = AVA_GetLocationAddresses(Record.getLineItemValue(AVA_LineTab[i], 'location', i + 1), locations)
												FileContent += AddressList[1] +',';
												FileContent += AddressList[4] +',';
												FileContent += AddressList[5]+',';
												FileContent += AddressList[6]+',';
												FileContent += AddressList[7]+',';
												FileContent += AddressList[0]+',';
											}
											else
											{
												FileContent += AVA_Def_Addr1 +',';
												FileContent += AVA_Def_City +',';
												FileContent += AVA_Def_State+',';
												FileContent += AVA_Def_Zip+',';
												FileContent += AVA_Def_Country	+',';
												FileContent += AVA_Def_Addressee+',';
											}
										}
										
										FileContent += searchResult1[k].getValue('salesrep').substring(0, 24)+','; //salesrep
										FileContent += searchResult1[k].getValue('number') + ',';					//PurchaseOrderNo
										//FileContent += ', , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ,\n';
										FileContent += Record.getFieldValue('currencysymbol') + ','; // CurrencyCode
										FileContent += Record.getFieldValue('exchangerate') + ','; // Exchange Rate
										FileContent += DocDate + ','; // Exchange Rate effective date
										FileContent += ', , , , , ,';
										FileContent += ','; // Total tax
										FileContent += ', , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ,\n';
										LineNo++;
									}
								}
								
								LastTranId = searchResult1[k].getId();
							}
							else
							{
								UseTaxBreak = 1;
								AVA_BatchSave(FileContent);
								
								var fields = new Array();
								var values = new Array();
								
								fields[fields.length] = 'custrecord_ava_usetaxstatus';
								fields[fields.length] = 'custrecord_ava_lasttransid';
								fields[fields.length] = 'custrecord_ava_filenamecount';
								
								values [values.length] = 1;
								values [values.length] = LastTranId;
								values [values.length] = parseInt(FileNameCount) + 1;
								nlapiSubmitField('customrecord_avausetaxbatch', BatchId, fields, values, false);
								break;
							}
						}
					}
				}
				if(UseTaxBreak == 0 && flag == 1)
				{
					if(searchResult1 != null && searchResult1.length > 0)
					{
						AVA_BatchSave(FileContent);
					}
					var fields = new Array();
					var values = new Array();
					
					fields[fields.length] = 'custrecord_ava_usetaxstatus';
					fields[fields.length] = 'custrecord_ava_lasttransid';
					fields[fields.length] = 'custrecord_ava_companyid';
					
					values [values.length] = 2;
					values [values.length] = 0;
					values [values.length] = 0;
					
					nlapiSubmitField('customrecord_avausetaxbatch', BatchId, fields, values, false);
					BatchStatus = 2;
				}
			}
			else
			{
				break;
			}
		}
	}
	if (nlapiGetContext().getRemainingUsage() > UseTaxMinUsage)
	{
		var filters1 = new Array();
		filters1[0] = new nlobjSearchFilter('custrecord_ava_usetaxstatus', null, 'lessthan', 2);
		var searchResult2 = nlapiSearchRecord('customrecord_avausetaxbatch', null, filters1, null);
		if(searchResult2 != null)
		{
			AVA_UseTax();
		}
	}
	else
	{
		nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId());
	}
}

function AVA_UseTaxChange(type, name, linenum)
{
	if(name == 'ava_alltypes')
	{
		if (nlapiGetFieldValue('ava_alltypes') == 'T')
		{
			nlapiDisableField('ava_purchaseorder', 	true);
			nlapiDisableField('ava_purchaseinvoice', true);
		}
		else
		{
			nlapiDisableField('ava_purchaseorder', 	false);
			nlapiDisableField('ava_purchaseinvoice', false);
		}
	}
}

function AVA_UseTaxSecurity(AVA_Username, AVA_Password)
{
	var soap = null;
	soap = '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\n';
		soap += '<wsse:UsernameToken>\n';
		soap += '<wsse:Username>' + AVA_Username +'</wsse:Username>\n';
		soap += '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+ AVA_Decrypt(AVA_Password) +'</wsse:Password>\n';
		soap += '</wsse:UsernameToken>\n';
	soap += '</wsse:Security>\n';
	return soap;
}

function AVA_UseTaxHeader(security)
{
	var soap = null;
	soap = '<soapenv:Header>\n';
	soap += security;
	soap += '<Profile>\n';
		soap += '<Name><![CDATA[' + nlapiGetContext().getName() + ']]></Name>\n';
		soap += '<Client><![CDATA[NetSuite]]></Client>\n';
		soap += '<Adapter/>\n';
		soap += '<Machine/>\n';
	soap += '</Profile>\n';
	soap += '</soapenv:Header>\n';
	return soap;
}

function AVA_CompanyFetchBody(headers)
{
	var soap = null;
	soap = '<soapenv:Body>\n';
	soap += '<CompanyFetch>\n';
		soap += '<FetchRequest>\n';
			soap += '<Filters>CompanyCode=\'' + nlapiGetContext().getCompany() + '\'</Filters>\n';
			soap += '<MaxCount>0</MaxCount>\n';
			soap += '<PageIndex>0</PageIndex>\n';
			soap += '<PageSize>0</PageSize>\n';
			soap += '<RecordCount>0</RecordCount>\n';
		soap += '</FetchRequest>\n';
	soap += '</CompanyFetch>\n';
	soap += '</soapenv:Body>\n';
	return soap;
}

function AVA_UseTaxBody(headers)
{
	var soap = null;
	soap = '<soapenv:Body>\n';
		soap += '<BatchSave>\n';
			soap += '<Batch>\n';
				soap += '<AccountId>0</AccountId>\n';
				soap += '<BatchId>0</BatchId>\n';
				soap += '<BatchTypeId>TransactionImport</BatchTypeId>\n';
				soap += '<CompanyId>' + CompanyId + '</CompanyId>\n';
				soap += '<CreatedDate>0001-01-01T00:00:00</CreatedDate>\n';
				soap += '<CreatedDate></CreatedDate>\n';
				soap += '<CreatedUserId>0</CreatedUserId>\n';
					soap += '<Files>\n';
						soap += '<BatchFile>\n';
							soap += '<BatchFileId>0</BatchFileId>\n';
							soap += '<BatchId>0</BatchId>\n';
							soap += '<Content>' + AVA_EncryptData + '</Content>\n';
							soap += '<ContentType>text/csv</ContentType>\n';
							soap += '<Ext>CSV</Ext>\n';
							//soap += '<Name>assess-NS' + BatchName + '_' + FileNameCount + '.csv</Name>\n';
							soap += '<Name>assess-NS-' + BatchName + '.' + FileNameCount + '.csv</Name>\n';
							soap += '<Size>0</Size>\n';
							soap += '<ErrorCount>0</ErrorCount>\n';
						soap += '</BatchFile>\n';
					soap += '</Files>\n';
				soap += '<CompletedDate>0001-01-01T00:00:00</CompletedDate>\n';
				soap += '<CompletedDate></CompletedDate>\n';
				soap += '<ModifiedUserId>0</ModifiedUserId>\n';
				//soap += '<Name>assess-NS' + BatchName + '_' + FileNameCount + '</Name>\n';
				soap += '<Name>assess-NS-' + BatchName + '.' + FileNameCount + '.csv</Name>\n';
				soap += '<RecordCount>0</RecordCount>\n';
				soap += '<CurrentRecord>0</CurrentRecord>\n';
			soap += '</Batch>\n';
		soap += '</BatchSave>\n';
	soap += '</soapenv:Body>\n';
	return soap;
}

function AVA_UseTaxEnvelope(actualcontents)
{
	var soap = null;
	soap = '<?xml version="1.0" encoding="utf-8"?>\n';
	soap += '<soapenv:Envelope xmlns="http://avatax.avalara.com/services" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n';
	soap += actualcontents
	soap += '</soapenv:Envelope>\n';
	return soap;
}

function AVA_CompanyFetch()
{
	var soapCompanyHead = new Array();
	soapCompanyHead['Content-Type'] = 'text/xml';
	soapCompanyHead['SOAPAction'] = 'http://avatax.avalara.com/services/CompanyFetch';
	
	var security    = AVA_UseTaxSecurity(AVA_Username, AVA_Password);
	var headers	    = AVA_UseTaxHeader(security);	
	var body	    = AVA_CompanyFetchBody(headers);
	var soapPayload = AVA_UseTaxEnvelope(headers + body);
	
	var response = nlapiRequestURL(AVA_ServiceUrl + '/account/accountsvc.asmx' , soapPayload, soapCompanyHead);
	if (response.getCode() == 200)
	{
		var soapText = response.getBody();
		var soapXML = nlapiStringToXML(soapText);
		var CompanyFetchResult = nlapiSelectNode(soapXML, "//*[name()='CompanyFetchResult']");
		var AVA_ResultCode = nlapiSelectValue( CompanyFetchResult, "//*[name()='ResultCode']");
		var RecordCount = nlapiSelectValue(soapXML, "//*[name()='RecordCount']");
		
		if (AVA_ResultCode == 'Success' && RecordCount == '1') 
		{
			var CompanyNodes = nlapiSelectNode( soapXML, "//*[name()='Company']");
			CompanyId = nlapiSelectValue( CompanyNodes, "//*[name()='CompanyId']");
			// store value in custom record
			nlapiSubmitField('customrecord_avausetaxbatch', BatchId, 'custrecord_ava_companyid', CompanyId, false);
			return 1; 
		}
		else
		{
			nlapiLogExecution('Debug','Error','Selected company not Found in Admin Console');
			nlapiSubmitField('customrecord_avausetaxbatch', BatchId, 'custrecord_ava_usetaxstatus', 3, false);
			BatchStatus = 3;
		}
	}
}

function AVA_BatchSave(FileContent)
{
	AVA_EncryptData = nlapiEncrypt(FileContent, 'base64');

	var security = AVA_UseTaxSecurity(AVA_Username, AVA_Password);
	var headers	 = AVA_UseTaxHeader(security);	
	var body	 = AVA_UseTaxBody(headers);
	var soapPayload = AVA_UseTaxEnvelope(headers + body);
	
	var soapHead = new Array();
	soapHead['Content-Type'] = 'text/xml';
	soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/BatchSave';

	var response = nlapiRequestURL(AVA_ServiceUrl + '/batch/batchsvc.asmx' , soapPayload, soapHead);
	if (response.getCode() == 200)
	{
		nlapiLogExecution('Debug','Batch save', 'Batch saved');
	}
}

function AVA_GetItemsTaxLines(record)
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
	AVA_AccountType = new Array(); // Stores Income account name
	AVA_LineTab     = new Array(); //Stores the tab name to which the line item belongs

	for(var i = 0 ; i < record.getLineItemCount('item'); i++)
	{
		AVA_LineTab[i] = 'item';
		AVA_AccountType[i] = (record.getLineItemValue('item', 'custcol_ava_incomeaccount', i+1) != null && record.getLineItemValue('item', 'custcol_ava_incomeaccount', i+1).length > 0) ? record.getLineItemValue('item', 'custcol_ava_incomeaccount', i+1).substring(0,50) : '';
		
		AVA_LineType[i]     = record.getLineItemValue('item','itemtype',i+1);

		if(AVA_LineType[i] != 'EndGroup')
		{
			AVA_LineNames[i]  = (record.getLineItemValue('item','custcol_ava_item',i+1) != null && record.getLineItemValue('item','custcol_ava_item',i+1).length > 0) ? record.getLineItemValue('item','custcol_ava_item',i+1).substring(0,50) : '';
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
			AVA_LineQty[i] = record.getLineItemValue('item','quantity',i+1);
		}
		
		AVA_LineAmount[i]     = record.getLineItemValue('item','amount',i+1);
		
		if(i == (AVA_GroupBegin-1))
		{
			for(var k=i; k<=AVA_GroupEnd ; k++)
			{
				AVA_LineTab[k] = 'item';
				AVA_AccountType[k] = (record.getLineItemValue('item', 'custcol_ava_incomeaccount', k+1) != null && record.getLineItemValue('item', 'custcol_ava_incomeaccount', k+1).length > 0) ? record.getLineItemValue('item', 'custcol_ava_incomeaccount', k+1).substring(0,50) : '';
				AVA_LineType[k]     = record.getLineItemValue('item','itemtype',k+1);

				if(AVA_LineType[k] != 'EndGroup')
				{
					AVA_LineNames[k]  = (record.getLineItemValue('item','custcol_ava_item',k+1) != null && record.getLineItemValue('item','custcol_ava_item',k+1).length > 0) ? record.getLineItemValue('item','custcol_ava_item',k+1).substring(0,50) : '';
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
					AVA_LineQty[k] = record.getLineItemValue('item','quantity',k+1);
				}
				
				AVA_LineAmount[k]     = record.getLineItemValue('item','amount',k+1);
				
				switch(AVA_LineType[k])
				{
					case 'Discount':
					case 'Markup':
						AVA_TaxLines[k] = 'F';
						AVA_Taxable [k] = 'F';
						var discountItem = record.getLineItemValue('item','amount',k+1);//here current lines discount is fetched
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
						AVA_LineAmount[k]   = record.getLineItemValue('item','amount',k+1);
						AVA_TaxLines[k]   = 'F';
						AVA_Taxable[k]    = 'F';
						break;
															
					default:
						AVA_TaxLines[k] = 'T';
						//EndGroup Item from Webservice call
						if(record.getLineItemValue('item','item',k+1) == 0)
						{
							AVA_LineNames[k]  = 'EndGroup'
							AVA_LineType[k]   = 'EndGroup';
							AVA_LineAmount[k]   = record.getLineItemValue('item','amount',k+1);
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
				var discountItem = record.getLineItemValue('item','amount',i+1);//here current lines discount is fetched  
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
							
							var rate = record.getLineItemValue('item','rate',i+1);
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
				break;
			
			case 'Description':
			case 'Subtotal':
				AVA_TaxLines[i] = 'F';
				break;

			case 'Group':
				AVA_GroupBegin = i+2;//will save the item line num of the first member of group
				for(var k=AVA_GroupBegin; record.getLineItemValue('item','itemtype',k) != 'EndGroup' && record.getLineItemValue('item','item',k) != 0; k++)
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
				AVA_LineAmount[i]   = record.getLineItemValue('item','amount',i+1);
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
				if(record.getLineItemValue('item','item',i+1) == 0)
				{
					AVA_LineNames[i]  = 'EndGroup'
					AVA_LineType[i]   = 'EndGroup';
					AVA_LineAmount[i]   = record.getLineItemValue('item','amount',i+1);
					AVA_TaxLines[i] = 'F';
					AVA_Taxable[i]    = 'F';
				}				
				break;
		}
	}
	
	AVA_GetExpenseItems(record);
}

function AVA_GetExpenseItems(record)
{
	for(var i = 0; i < record.getLineItemCount('expense'); i++)
	{
		AVA_LineTab[AVA_LineTab.length] = 'expense';
		AVA_TaxLines[AVA_TaxLines.length] = 'T';
		AVA_LineNames[AVA_LineNames.length] = (record.getLineItemValue('expense', 'category_display', i + 1) != null && record.getLineItemValue('expense', 'category_display', i + 1).length > 0) ? record.getLineItemValue('expense', 'category_display', i + 1) : '';
		AVA_LineQty[AVA_LineQty.length] = 1;
		var AccountType = (record.getLineItemValue('expense', 'account_display', i + 1) != null && record.getLineItemValue('expense', 'account_display', i + 1).length > 0) ? record.getLineItemValue('expense', 'account_display', i + 1) : '';
		if(AccountType.indexOf(':') != -1)
		{
			AccountType = AccountType.substring(AccountType.indexOf(':') + 1, AccountType.indexOf(':') + AccountType.length + 1);
		}
		AVA_AccountType[AVA_AccountType.length] = AccountType.substring(0, 50);
		AVA_LineAmount[AVA_LineAmount.length] = record.getLineItemValue('expense', 'amount', i + 1);
	}
}

function AVA_GetLocationAddresses(LocId, locations)
{
	var AddressList = new Array();
	var AVA_Locations = JSON.parse(locations);
	for(var i in AVA_Locations)
	{
		if (AVA_Locations[i].id == LocId)
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
			break;
		}
	}
	
	return AddressList;
}

function AVA_SearchTransactions()
{
	var cols = new Array();
	cols[cols.length]  = new nlobjSearchColumn('internalid'); 							// Doc Code
	cols[cols.length]  = new nlobjSearchColumn('trandate');								// Doc Date
	cols[cols.length]  = new nlobjSearchColumn('type');
	cols[cols.length]  = new nlobjSearchColumn('entityid','vendor'); 					// Customer code
	cols[cols.length]  = new nlobjSearchColumn('shipaddress1');				
	cols[cols.length]  = new nlobjSearchColumn('shipcity');								//DestCity
	cols[cols.length]  = new nlobjSearchColumn('shipstate');							//DestState
	cols[cols.length]  = new nlobjSearchColumn('shipzip');								//DestZip
	cols[cols.length]  = new nlobjSearchColumn('shipcountry');							//DestCountry
	cols[cols.length]  = new nlobjSearchColumn('billaddress1');		
	cols[cols.length]  = new nlobjSearchColumn('billcity');								//DestCity
	cols[cols.length]  = new nlobjSearchColumn('billstate');							//DestState
	cols[cols.length]  = new nlobjSearchColumn('billzip');								//DestZip
	cols[cols.length]  = new nlobjSearchColumn('billcountry');							//DestCountry
	cols[cols.length]  = new nlobjSearchColumn('location');
	cols[cols.length]  = new nlobjSearchColumn('name','location');
	cols[cols.length]  = new nlobjSearchColumn('address1','location');					// OrigAddress
	cols[cols.length]  = new nlobjSearchColumn('city','location');						// OrigCity
	cols[cols.length]  = new nlobjSearchColumn('state','location');						// origZip
	cols[cols.length]  = new nlobjSearchColumn('zip','location');						// OrigRegion
	cols[cols.length]  = new nlobjSearchColumn('country','location');					// OrigCountry
	cols[cols.length]  = new nlobjSearchColumn('salesrep');								// SalesPersonCode
	cols[cols.length]  = new nlobjSearchColumn('number');								// PurchaseOrderNo
	cols[cols.length]  = new nlobjSearchColumn('shipaddress','vendor');					// Subsidiary name
	cols[cols.length]  = new nlobjSearchColumn('isperson','vendor');
	cols[cols.length]  = new nlobjSearchColumn('firstname','vendor');
	cols[cols.length]  = new nlobjSearchColumn('middlename','vendor');
	cols[cols.length]  = new nlobjSearchColumn('lastname','vendor');
	cols[cols.length]  = new nlobjSearchColumn('companyname','vendor');
	
	var filters = new Array();
	filters[filters.length] = new nlobjSearchFilter('mainline', null, 'is', 'T');
	filters[filters.length] = new nlobjSearchFilter('voided',    null, 'is', 'F');
	
	filters[filters.length] = new nlobjSearchFilter('type', null, 'is', 'VendBill');
	filters[filters.length] = new nlobjSearchFilter('custbody_ava_accrueusetax', null, 'is','T');
	
	if (UseTaxType == 'td')
	{
		filters[filters.length] = new nlobjSearchFilter('trandate', null, 'within', BatchFromDate, BatchToDate); 	//Filter Based on Transaction Date
	}
	else if(UseTaxType == 'dc')
	{
		filters[filters.length] = new nlobjSearchFilter('datecreated', null, 'within', BatchFromDate , BatchToDate); //Filter Based on Date created
	}
	else
	{
		filters[filters.length] = new nlobjSearchFilter('lastmodifieddate', null, 'within', BatchFromDate, BatchToDate); //Filter Based on Date modified
	}
	
	if(BatchVendor != null && BatchVendor.length > 0)
	{
		filters[filters.length] = new nlobjSearchFilter('entity',null ,'is',BatchVendor);
	}
	
	if(LastTranId > 0)
	{
		filters[filters.length] = new nlobjSearchFilter('internalidnumber', null, 'greaterthan', LastTranId);
	}
	
	var searchResult1 = nlapiSearchRecord('transaction', null, filters, cols);
	return searchResult1;
}

function AVA_PurchaseTransactionTabBeforeLoad(type, form)
{
	if(AVA_VerifyCredentials() == 0)
	{
		var recordType = nlapiGetRecordType();
		nlapiLogExecution('Debug','RecordType',nlapiGetRecordType());
		if(recordType == 'vendorbill')
		{
			if(AVA_EnableBatchService == 'F' && form.getField('custbody_ava_accrueusetax') != null)
			{
					form.getField('custbody_ava_accrueusetax').setDisplayType('hidden');
			}
		}	
		else
		{
			form.getField('custbody_ava_accrueusetax').setDisplayType('hidden');
		}
	}
}