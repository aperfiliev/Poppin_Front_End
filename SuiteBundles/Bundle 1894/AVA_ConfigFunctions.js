/******************************************************************************************
	Script Name  - AVA_ConfigFunctions.js
	Company      - Avalara Technologies Pvt Ltd.
******************************************************************************************/

{
	var AVA_ConfigRecordID, AVA_StatesArray, flag = 0, AVA_EncryptFlag = 0;
}

function AVA_ConfigForm(request, response)
{
	//Design of the form
	if(AVA_CheckSecurity( 2 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var form = nlapiCreateForm('Configuration');
			form.setScript('customscript_avaconfig_client');
			form.setTitle('Avalara Configuration');

			/* HEADER LEVEL FIELDS */
			form.addField('ava_accountvalue',		'text',			'Account ID');
			form.addField('ava_licensekey',			'password',		'License Key');
			form.getField('ava_licensekey').setMaxLength(30);	
			form.addField('ava_serviceurl', 			'text', 		'Service URL');
			form.addField('ava_expirydate', 			'date', 		'Expiry Date');
			form.addField('ava_username', 			    'text', 		'Username');
			form.addField('ava_password', 			    'password', 	'Password');
			form.getField('ava_password').setMaxLength(70);
	
			var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
	
			if(searchresult != null && searchresult.length > 0)
			{
				var AVA_Record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
				var AVA_LoadValues = AVA_LoadValuesToGlobals(AVA_Record);
				
				form.getField('ava_accountvalue').setDefaultValue(AVA_AccountValue);	
				form.getField('ava_licensekey').setDefaultValue(AVA_LicenseKey);				
				form.getField('ava_serviceurl').setDefaultValue(AVA_ServiceUrl);	
				form.getField('ava_expirydate').setDefaultValue(AVA_ExpiryDate);
				form.getField('ava_username').setDefaultValue(AVA_Username);	
				form.getField('ava_password').setDefaultValue(AVA_Password);

				form.getField('ava_accountvalue').setDisplayType('disabled');
				form.getField('ava_licensekey').setDisplayType('disabled');
				form.getField('ava_serviceurl').setDisplayType('disabled');	
				form.getField('ava_expirydate').setDisplayType('disabled');
				form.getField('ava_username').setDisplayType('disabled');	
				form.getField('ava_password').setDisplayType('disabled');

				if(AVA_ServiceTypes != null)
				{
					if(AVA_ServiceTypes.search('TaxSvc') != -1)
					{
						form.addTab('ava_general', 'General');
						form.addTab('ava_taxcalculation', 'Tax Calculation');
						
						// Adding Elements inside First Tab - General
						// Item Specific Fields
						form.addField('ava_itemhelp', 			'help',		'<b>Item Specific:</b><hr>', 		null, 'ava_general').setLayoutType('startrow','startcol');
						form.addField('ava_udf1', 			'checkbox',		'User Defined 1', 					null, 'ava_general');
						form.addField('ava_udf2', 			'checkbox', 	'User Defined 2', 					null, 'ava_general');						
						form.addField('ava_itemaccount', 		'checkbox', 	'Send Item Account to Avalara', 		null, 'ava_general');
						form.addField('ava_taxcodemapping', 	'checkbox', 	'Enable Tax Code Mapping', 			null, 'ava_general');						
						
						//Customer Specific Fields
						form.addField('ava_custhelp', 			'help',		'<b>Customer Specific:</b><hr>', 					null, 'ava_general').setLayoutType('startrow','startcol');						
						
						var AVA_CustCodeField	= form.addField('ava_customercode',		'select',		'Customer Code',			null, 'ava_general');				
						AVA_CustCodeField.addSelectOption('0','Customer ID');
						AVA_CustCodeField.addSelectOption('1','Customer Name');		
						AVA_CustCodeField.addSelectOption('2','Customer Internal ID');
						AVA_CustCodeField.addSelectOption('3','Partner ID');
						AVA_CustCodeField.addSelectOption('4','Partner Name');
						AVA_CustCodeField.addSelectOption('5','Partner Internal ID');
						AVA_CustCodeField.addSelectOption('6','Customer ID/Name');
						AVA_CustCodeField.addSelectOption('7','Partner ID/Name');
						AVA_CustCodeField.setHelpText('Customer Code with which the tax call needs to be made to AvaTax.', false);			
						
						var AVA_MarkCustomerTaxable	= form.addField('ava_markcusttaxable',		'select',		'Customers Default to Taxable',			null, 'ava_general');
						AVA_MarkCustomerTaxable.addSelectOption('0','');
						AVA_MarkCustomerTaxable.addSelectOption('1','New and Existing Customer(s)');
						AVA_MarkCustomerTaxable.addSelectOption('2','Only New Customer(s)');
						AVA_MarkCustomerTaxable.addSelectOption('3','Only Existing Customer(s)');
						
						var AVA_DefaultCustTaxcode	= form.addField('ava_defaultcustomer',		'select',		'Apply Default Taxcode To',			null, 'ava_general');
						AVA_DefaultCustTaxcode.addSelectOption('0','');
						AVA_DefaultCustTaxcode.addSelectOption('1','New and Existing Customer(s)');
						AVA_DefaultCustTaxcode.addSelectOption('2','Only New Customer(s)');
						AVA_DefaultCustTaxcode.addSelectOption('3','Only Existing Customer(s)');												
						
						form.addField('ava_entityusecode', 	'checkbox', 	'Enable Entity/Use Code', 			null, 'ava_general');
						
						//Miscellaneous Setting Fields
						form.addField('ava_mischelp', 			'help',		'<b>Miscellaneous Settings:</b><hr>', 					null, 'ava_general').setLayoutType('startrow','startcol');

						form.addField('ava_defshipcode',		'text',			'Default Shipping Code',			null, 'ava_general');
						form.addField('ava_defmisccode', 		'text', 		'Default Miscellaneous Code', 		null, 'ava_general');

						var AVA_ShowMsgs	= form.addField('ava_showmessages',		'select',		'Show Warnings/Errors',			null, 'ava_general');	
						AVA_ShowMsgs.addSelectOption('0','None');                                                                                                                                                                                                                                                                                                                                  
						AVA_ShowMsgs.addSelectOption('1','Only Warnings');                                                                                                                                                                                                                                                                                                      
						AVA_ShowMsgs.addSelectOption('2','Only Errors');                                                                                                                                                                                                                                                                                                              
						AVA_ShowMsgs.addSelectOption('3','Both');
						
						var AVA_BillTimeName;
						
						if(nlapiGetContext().getSetting('FEATURE', 'billscosts') == 'T')
						{
							AVA_BillTimeName	= form.addField('ava_billtimename',		'select',		'Billable Time Name',			null, 'ava_general');
							AVA_BillTimeName.addSelectOption('0','Billable Time');
							AVA_BillTimeName.addSelectOption('1','Item Name');
						}				

						// Adding Elements inside Second Tab - Tax Calcuation
						form.addField('ava_disabletax', 			'checkbox', 	'Disable Tax Calculation', 					null, 'ava_taxcalculation');
						form.addField('ava_disableline', 			'checkbox', 	'Disable Tax Calculation at line level', 	null, 'ava_taxcalculation');									
						
						form.addField('ava_enablelogging', 			'checkbox', 	'Enable Logging', 					null, 'ava_taxcalculation');						
						form.addField('ava_taxondemand', 			'checkbox', 	'Calculate Tax on Demand', 					null, 'ava_taxcalculation');	
						form.addField('ava_taxinclude', 			'checkbox', 	'Tax Included Capability', 					null, 'ava_taxcalculation');
						
						form.addField('ava_taxsettings', 'help','<br><b>Abort Save Operation on Tax Calculation Errors:</b></br><hr>', 	null, 'ava_taxcalculation');//.setLayoutType('startrow', 'startrow');
						form.addField('ava_abortbulkbilling', 		'checkbox', 	'Bulk Billing', 		null, 'ava_taxcalculation');
						form.addField('ava_abortuserinterfaces', 	'checkbox', 	'User Interfaces', 		null, 'ava_taxcalculation');			
						form.addField('ava_abortwebservices', 		'checkbox', 	'Webservices', 			null, 'ava_taxcalculation');
						form.addField('ava_abortcsvimports', 		'checkbox', 	'CSV Imports', 			null, 'ava_taxcalculation');
						form.addField('ava_abortscheduledscripts', 	'checkbox', 	'Scheduled Scripts', 	null, 'ava_taxcalculation');			
						form.addField('ava_abortsuitelets', 		'checkbox', 	'Suitelets', 			null, 'ava_taxcalculation');
						
						form.addField('ava_enablediscount', 		'checkbox', 	'Enable Discount Mechanism', 			    null, 'ava_taxcalculation').setLayoutType('normal', 'startcol');
						var AVA_ShowDiscountMapping	= form.addField('ava_discountmapping',		'select',		'Discount Mapping',			null, 'ava_taxcalculation');
						AVA_ShowDiscountMapping.addSelectOption('0', 'Gross Amount');
						AVA_ShowDiscountMapping.addSelectOption('1', 'Net Amount');
						form.addField('ava_discounttaxcode',		'text',		'Discount Tax Code',			null , 'ava_taxcalculation');
						
						var AVA_ShowTaxRate	= form.addField('ava_taxrate',		'select',		'Tax Rate',			null, 'ava_taxcalculation');
						AVA_ShowTaxRate.addSelectOption('0','Show Base Rate');
						AVA_ShowTaxRate.addSelectOption('1','Show Net Rate');
						//AVA_ShowTaxRate.setLayoutType('normal', 'startcol');

						var AVA_DeciPlaces	= form.addField('ava_decimalplaces',		'select',		'Round-off Tax percentage(Decimal Places)',			null, 'ava_taxcalculation');
						AVA_DeciPlaces.addSelectOption('2','2');
						AVA_DeciPlaces.addSelectOption('3','3');
						AVA_DeciPlaces.addSelectOption('4','4');
						AVA_DeciPlaces.addSelectOption('5','5');
						
						form.addField('ava_usepostingperiod', 			'checkbox', 	'Use Posting Period as Transaction date during Tax calls', 		null, 'ava_taxcalculation').setLayoutType('normal', 'startcol');
						form.addField('ava_disableloccode', 			'checkbox', 	'Disable Location Code', null, 'ava_taxcalculation');
						form.addField('ava_enableupccode', 			'checkbox', 	'Enable UPC Code as ItemCode', 		null, 'ava_taxcalculation');
						form.addField('ava_deftaxcode', 			'text', 		'Default Tax Code', 						null, 'ava_taxcalculation');
						//form.getField('ava_deftaxcode').setLayoutType('normal', 'startcol');											
						form.addField('ava_def_addrtext', 		'textarea', 'Address',			null, 'ava_taxcalculation');

						/*form.addField('ava_taxsettings', 'help','<b>Abort Save Operation on Tax Calculation Errors:</b><hr>', 	null, 'ava_taxcalculation').setLayoutType('startrow', 'startrow');
						form.addField('ava_abortbulkbilling', 		'checkbox', 	'Bulk Billing', 		null, 'ava_taxcalculation');
						form.addField('ava_abortuserinterfaces', 	'checkbox', 	'User Interfaces', 		null, 'ava_taxcalculation');			
						form.addField('ava_abortwebservices', 		'checkbox', 	'Webservices', 			null, 'ava_taxcalculation');
						form.addField('ava_abortcsvimports', 		'checkbox', 	'CSV Imports', 			null, 'ava_taxcalculation');
						form.addField('ava_abortscheduledscripts', 	'checkbox', 	'Scheduled Scripts', 	null, 'ava_taxcalculation');			
						form.addField('ava_abortsuitelets', 		'checkbox', 	'Suitelets', 			null, 'ava_taxcalculation');*/			
						
						//Setting values
						form.getField('ava_udf1').setDefaultValue(AVA_UDF1);	
						form.getField('ava_udf2').setDefaultValue(AVA_UDF2);	
						form.getField('ava_entityusecode').setDefaultValue(AVA_EntityUseCode);	
						form.getField('ava_itemaccount').setDefaultValue(AVA_ItemAccount);	
						form.getField('ava_taxcodemapping').setDefaultValue(AVA_TaxCodeMapping);
						
						if(AVA_CustomerCode != null && AVA_CustomerCode.length > 0)
						{
							form.getField('ava_customercode').setDefaultValue(AVA_CustomerCode);	
						}
						else
						{
							form.getField('ava_customercode').setDefaultValue('1');
						}
						
						if(AVA_MarkCustTaxable != null && AVA_MarkCustTaxable.length > 0)
						{
							form.getField('ava_markcusttaxable').setDefaultValue(AVA_MarkCustTaxable);
						}
						else
						{
							form.getField('ava_markcusttaxable').setDefaultValue('');
						}
												
						if(AVA_DefaultCustomerTaxcode != null && AVA_DefaultCustomerTaxcode.length > 0)
						{
							form.getField('ava_defaultcustomer').setDefaultValue(AVA_DefaultCustomerTaxcode);
						}
						else
						{
							form.getField('ava_defaultcustomer').setDefaultValue('');
						}

						if(AVA_ShowMessages != null && AVA_ShowMessages.length > 0)
						{
							form.getField('ava_showmessages').setDefaultValue(AVA_ShowMessages);
						}
						else
						{
							form.getField('ava_showmessages').setDefaultValue(3);
						}
						
						if(form.getField('ava_billtimename') != null)	
						{
							if(AVA_BillableTimeName != null && AVA_BillableTimeName.length > 0)
							{
								form.getField('ava_billtimename').setDefaultValue(AVA_BillableTimeName);	
							}
							else
							{
								form.getField('ava_billtimename').setDefaultValue(0);
							}
						}
						
						form.getField('ava_defshipcode').setDefaultValue(AVA_DefaultShippingCode);	
						form.getField('ava_defmisccode').setDefaultValue(AVA_DefaultMiscCode);	
						
						form.getField('ava_disabletax').setDefaultValue(AVA_DisableTax);	
				
						form.getField('ava_disableline').setDefaultValue(AVA_DisableLine);	
						form.getField('ava_taxondemand').setDefaultValue(AVA_CalculateonDemand);	
						form.getField('ava_enablelogging').setDefaultValue(AVA_EnableLogging);
						form.getField('ava_taxrate').setDefaultValue(AVA_TaxRate);
						form.getField('ava_decimalplaces').setDefaultValue(AVA_DecimalPlaces);
						form.getField('ava_usepostingperiod').setDefaultValue(AVA_UsePostingPeriod);
						form.getField('ava_taxinclude').setDefaultValue(AVA_TaxInclude);
						form.getField('ava_enablediscount').setDefaultValue(AVA_EnableDiscount);
						form.getField('ava_discounttaxcode').setDefaultValue(AVA_DiscountTaxCode);
						form.getField('ava_discountmapping').setDefaultValue(AVA_DiscountMapping);
						if (nlapiGetFieldValue('ava_enablediscount') == 'F')
						{
							form.getField('ava_discountmapping').setDisplayType('disabled');
							form.getField('ava_discounttaxcode').setDisplayType('disabled');
						}
						form.getField('ava_disableloccode').setDefaultValue(AVA_DisableLocationCode);
						form.getField('ava_enableupccode').setDefaultValue(AVA_EnableUpcCode);
						
						form.getField('ava_deftaxcode').setDefaultValue(AVA_DefaultTaxCode.substr(0, AVA_DefaultTaxCode.indexOf('+')));							
						
						var address = '';
						if (AVA_Def_Addressee.length > 0)
						{
							address = AVA_Def_Addressee + '\n' + AVA_Def_Addr1 + ((AVA_Def_Addr2 == null)? '' : '\n' + AVA_Def_Addr2) + '\n' + AVA_Def_City + '\n' + AVA_Def_State + '\n' + AVA_Def_Zip + '\n' + ((AVA_Def_Country=='US') ? 'United States' : 'Canada');
						}
						else
						{
							address = AVA_Def_Addr1 + ((AVA_Def_Addr2 == null)? '' : '\n' + AVA_Def_Addr2 ) + '\n' + AVA_Def_City + '\n' + AVA_Def_State + '\n' + AVA_Def_Zip + '\n' + ((AVA_Def_Country=='US') ? 'United States' : 'Canada');
						}
						form.getField('ava_def_addrtext').setDefaultValue(address);						

						form.getField('ava_abortbulkbilling').setDefaultValue(AVA_AbortBulkBilling);
						form.getField('ava_abortuserinterfaces').setDefaultValue(AVA_AbortUserInterfaces);
						form.getField('ava_abortwebservices').setDefaultValue(AVA_AbortWebServices);
						form.getField('ava_abortcsvimports').setDefaultValue(AVA_AbortCSVImports);
						form.getField('ava_abortscheduledscripts').setDefaultValue(AVA_AbortScheduledScripts);
						form.getField('ava_abortsuitelets').setDefaultValue(AVA_AbortSuitelets);
						
						//Setting Display Type
						form.getField('ava_udf1').setDisplayType('disabled');
						form.getField('ava_udf2').setDisplayType('disabled');
						form.getField('ava_entityusecode').setDisplayType('disabled');
						form.getField('ava_itemaccount').setDisplayType('disabled');
						form.getField('ava_taxcodemapping').setDisplayType('disabled');
						form.getField('ava_defshipcode').setDisplayType('disabled');
						form.getField('ava_defmisccode').setDisplayType('disabled');
						form.getField('ava_customercode').setDisplayType('disabled');
						AVA_MarkCustomerTaxable.setDisplayType('disabled');
						AVA_DefaultCustTaxcode.setDisplayType('disabled');

						if(form.getField('ava_billtimename') != null)
						{
							form.getField('ava_billtimename').setDisplayType('disabled');
						}
						
						form.getField('ava_disabletax').setDisplayType('disabled');
						form.getField('ava_disableline').setDisplayType('disabled');
						form.getField('ava_taxondemand').setDisplayType('disabled');
						form.getField('ava_enablelogging').setDisplayType('disabled');	
						form.getField('ava_decimalplaces').setDisplayType('disabled');
						form.getField('ava_taxrate').setDisplayType('disabled');
						form.getField('ava_showmessages').setDisplayType('disabled');
						form.getField('ava_usepostingperiod').setDisplayType('disabled');
						form.getField('ava_taxinclude').setDisplayType('disabled');
						form.getField('ava_enablediscount').setDisplayType('disabled');
						form.getField('ava_discountmapping').setDisplayType('disabled');
						form.getField('ava_discounttaxcode').setDisplayType('disabled');
						form.getField('ava_disableloccode').setDisplayType('disabled');
						form.getField('ava_enableupccode').setDisplayType('disabled');
						form.getField('ava_deftaxcode').setDisplayType('disabled');
						form.getField('ava_def_addrtext').setDisplayType('disabled');	

						form.getField('ava_abortbulkbilling').setDisplayType('disabled');
						form.getField('ava_abortuserinterfaces').setDisplayType('disabled');
						form.getField('ava_abortwebservices').setDisplayType('disabled');
						form.getField('ava_abortcsvimports').setDisplayType('disabled');
						form.getField('ava_abortscheduledscripts').setDisplayType('disabled');
						form.getField('ava_abortsuitelets').setDisplayType('disabled');
					}
					
					if(AVA_ServiceTypes.search('AddressSvc') != -1)
					{
						form.addTab('ava_addressvalidation', 'Address Validation');
						
						// Adding Elements inside Third Tab - Address Validation
						var AVA_DisableAddVal = form.addField('ava_disableaddvalidation', 			'checkbox', 	'Disable Address Validation', 		null, 'ava_addressvalidation');
						var AVA_EnableAddressValonTran = form.addField('ava_enableaddvalontran', 	'checkbox', 	'Enable Address Validation on Transaction(s)', 		null, 'ava_addressvalidation');
						var AVA_UpperCaseAddress = form.addField('ava_uppercaseaddress', 			'checkbox', 	'Result in Upper Case', 		null, 'ava_addressvalidation').setLayoutType('startrow','startcol');
						
						var AVA_AddBatchProField = form.addField('ava_addbatchprocessing', 		'select', 	'Batch Processing', 					null, 'ava_addressvalidation');
						AVA_AddBatchProField.addSelectOption('manual', 'Manual');
						AVA_AddBatchProField.addSelectOption('automatic', 'Automatic');
						AVA_AddBatchProField.setHelpText('Manual: Once the addresses are validated, user would need to select all the addresses that he want to get updated in the respective customer or location record(s) manually. \n Automatic: In this case, as soon as the addresses get validated, it will get updated in the respective customer or location record(s) automatically. ', false);
						
						// Setting Values
						form.getField('ava_disableaddvalidation').setDefaultValue(AVA_DisableAddValidation);	
						form.getField('ava_uppercaseaddress').setDefaultValue(AVA_AddUpperCase);	
						form.getField('ava_addbatchprocessing').setDefaultValue((AVA_AddBatchProcessing == 0) ? 'manual' : 'automatic');
						form.getField('ava_enableaddvalontran').setDefaultValue(AVA_EnableAddValonTran);
						
						if(AVA_DisableAddValidation == 'T')
						{
							form.getField('ava_uppercaseaddress').setDefaultValue('F');
							form.getField('ava_uppercaseaddress').setDisplayType('disabled');
							form.getField('ava_addbatchprocessing').setDefaultValue('manual');
							form.getField('ava_addbatchprocessing').setDisplayType('disabled');
							form.getField('ava_enableaddvalontran').setDisplayType('disabled');
						}
						
						AVA_DisableAddVal.setDisplayType('disabled');					
						AVA_UpperCaseAddress.setDisplayType('disabled');
						AVA_AddBatchProField.setDisplayType('disabled');	
						AVA_EnableAddressValonTran.setDisplayType('disabled');
					}
				}
				
				form.addTab('ava_about', 'About Avalara');
				
				// Adding Elements inside Fourth Tab - About AvaTax
				var dYear = new Date();
				var AVA_Copyright 		= form.addField('ava_copyright', 			'help', 	'Copyright &copy ' + dYear.getFullYear() + ' Avalara, Inc. All Rights Reserved.', 		null, 'ava_about');
				
				var AVA_Ver 			= form.addField('ava_version', 				'text', 	'Version', 													null, 'ava_about');
				AVA_Ver.setDisplayType('inline');
				AVA_Ver.setDefaultValue(AVA_ClientAtt);
				
				var AVA_SerVersion 		= form.addField('ava_serversion', 			'text', 	'AvaTax Version', 									null, 'ava_about');
				AVA_SerVersion.setDisplayType('inline');
				AVA_SerVersion.setDefaultValue(AVA_Ping());
				
				var AVA_Email 			= form.addField('ava_email', 				'email', 	'Email', 													null, 'ava_about');
				AVA_Email.setDisplayType('inline');
				AVA_Email.setDefaultValue('support@avalara.com');
				
				var AVA_Phone 			= form.addField('ava_phone', 				'phone', 	'Phone', 													null, 'ava_about');
				AVA_Phone.setDisplayType('inline');
				AVA_Phone.setDefaultValue('(877)-780-4848');
				
				var AVA_Web				= form.addField('ava_web', 					'url', 		'Website', 													null, 'ava_about');
				AVA_Web.setDisplayType('inline');
				AVA_Web.setDefaultValue('http://www.avalara.com/');
		
				var AVA_AdminConsole	= form.addField('ava_adminconsole', 		'url', 		'AvaTax Connect DashBoard', 								null, 'ava_about');
				AVA_AdminConsole.setDisplayType('inline');
				AVA_AdminConsole.setDefaultValue((AVA_ServiceUrl.search('development') != -1) ? 'https://admin-development.avalara.net/login.aspx' : 'https://admin-avatax.avalara.net/login.aspx');
				
				var AVA_UserCenter		= form.addField('ava_usercenter', 			'url', 			'Avalara User Center', 									null, 'ava_about');
				AVA_UserCenter.setDisplayType('inline');
				AVA_UserCenter.setDefaultValue('http://www.avalara.com/index.cfm/fa/usercenter');

				form.addButton('ava_homepage', 	'Home',	"window.location = '" + nlapiResolveURL('TASKLINK', 'CARD_-29') + "'");

				response.writePage(form);				
				
			}
			else
			{
				nlapiSetRedirectURL('SUITELET', 'customscript_avaconfig_wizard', 'customdeploy_ava_configurewizard', null, null);
			}
		}
	}
}

function AVA_SetValuesFromGlobals(FormName)
{
	if(FormName.getCurrentStep().getName() == 'ava_credentials')
	{		
		/* Header level Details */
		FormName.getField('ava_accountvalue').setDefaultValue((nlapiGetFieldValue('ava_accountvalue') != null && nlapiGetFieldValue('ava_accountvalue').length > 0 && nlapiGetFieldValue('ava_accountvalue') != AVA_AccountValue) ? nlapiGetFieldValue('ava_accountvalue') : AVA_AccountValue);	
		FormName.getField('ava_licensekey').setDefaultValue((nlapiGetFieldValue('ava_licensekey') != null && nlapiGetFieldValue('ava_licensekey').length > 0 && nlapiGetFieldValue('ava_licensekey') != AVA_LicenseKey) ? nlapiGetFieldValue('ava_licensekey') : AVA_LicenseKey);
		FormName.getField('ava_serviceurl').setDefaultValue((nlapiGetFieldValue('ava_serviceurl') != null && nlapiGetFieldValue('ava_serviceurl').length > 0 && nlapiGetFieldValue('ava_serviceurl') != AVA_ServiceUrl) ? nlapiGetFieldValue('ava_serviceurl') : AVA_ServiceUrl);
		FormName.getField('ava_expirydate').setDefaultValue((nlapiGetFieldValue('ava_expirydate') != null && nlapiGetFieldValue('ava_expirydate').length > 0 && nlapiGetFieldValue('ava_expirydate') != AVA_ExpiryDate) ? nlapiGetFieldValue('ava_expirydate') : AVA_ExpiryDate);
		FormName.getField('ava_enablebatchservice').setDefaultValue((nlapiGetFieldValue('ava_enablebatchservice') != null && nlapiGetFieldValue('ava_enablebatchservice') != AVA_EnableBatchService) ? nlapiGetFieldValue('ava_enablebatchservice') : (AVA_EnableBatchService != null && AVA_EnableBatchService != 'undefined' ? AVA_EnableBatchService : 'F'));
		FormName.getField('ava_username').setDefaultValue((nlapiGetFieldValue('ava_username') != null && nlapiGetFieldValue('ava_username').length > 0 && nlapiGetFieldValue('ava_username') != AVA_Username) ? nlapiGetFieldValue('ava_username') : AVA_Username);
		FormName.getField('ava_password').setDefaultValue((nlapiGetFieldValue('ava_password') != null && nlapiGetFieldValue('ava_password').length > 0 && nlapiGetFieldValue('ava_password') != AVA_Password) ? nlapiGetFieldValue('ava_password') : AVA_Password);
		
		if(AVA_EnableBatchService == 'T')
		{
			FormName.getField('ava_username').setDisplayType('normal');
			FormName.getField('ava_password').setDisplayType('normal');
		}
	}
	
	if(FormName.getCurrentStep().getName() == 'ava_taxsetup1')
	{
		/* General Tab Elements Detail */
		FormName.getField('ava_udf1').setDefaultValue((nlapiGetFieldValue('ava_udf1') != null && nlapiGetFieldValue('ava_udf1') != AVA_UDF1) ? nlapiGetFieldValue('ava_udf1') : (AVA_UDF1 != null && AVA_UDF1 != 'undefined' ? AVA_UDF1 : 'F'));	
		FormName.getField('ava_udf2').setDefaultValue((nlapiGetFieldValue('ava_udf2') != null && nlapiGetFieldValue('ava_udf2') != AVA_UDF2) ? nlapiGetFieldValue('ava_udf2') : (AVA_UDF2 != null && AVA_UDF2 != 'undefined' ? AVA_UDF2 : 'F'));	
		FormName.getField('ava_entityusecode').setDefaultValue((nlapiGetFieldValue('ava_entityusecode') != null && nlapiGetFieldValue('ava_entityusecode') != AVA_EntityUseCode) ? nlapiGetFieldValue('ava_entityusecode') : (AVA_EntityUseCode != null && AVA_EntityUseCode != 'undefined' ? AVA_EntityUseCode : 'F'));				
		FormName.getField('ava_itemaccount').setDefaultValue((nlapiGetFieldValue('ava_itemaccount') != null && nlapiGetFieldValue('ava_itemaccount') != AVA_ItemAccount) ? nlapiGetFieldValue('ava_itemaccount') : (AVA_ItemAccount != null && AVA_ItemAccount != 'undefined' ? AVA_ItemAccount : 'F'));				
		FormName.getField('ava_taxcodemapping').setDefaultValue((nlapiGetFieldValue('ava_taxcodemapping') != null && nlapiGetFieldValue('ava_taxcodemapping') != AVA_TaxCodeMapping) ? nlapiGetFieldValue('ava_taxcodemapping') : (AVA_TaxCodeMapping != null && AVA_TaxCodeMapping != 'undefined' ? AVA_TaxCodeMapping : 'F'));	
		
		if(AVA_CustomerCode != null && AVA_CustomerCode.length > 0)
		{
			FormName.getField('ava_customercode').setDefaultValue((nlapiGetFieldValue('ava_customercode') != null && nlapiGetFieldValue('ava_customercode') != AVA_CustomerCode) ? nlapiGetFieldValue('ava_customercode') : AVA_CustomerCode);				
		}
		else
		{
			FormName.getField('ava_customercode').setDefaultValue('1');
		}
		
		if(AVA_MarkCustTaxable != null && AVA_MarkCustTaxable.length > 0)
		{
			FormName.getField('ava_markcusttaxable').setDefaultValue((nlapiGetFieldValue('ava_markcusttaxable') != null && nlapiGetFieldValue('ava_markcusttaxable') != AVA_MarkCustTaxable) ? nlapiGetFieldValue('ava_markcusttaxable') : AVA_MarkCustTaxable);							
		}
		else
		{
			FormName.getField('ava_markcusttaxable').setDefaultValue('');
		}
		
		if(AVA_DefaultCustomerTaxcode != null && AVA_DefaultCustomerTaxcode.length > 0)
		{
			FormName.getField('ava_defaultcustomer').setDefaultValue((nlapiGetFieldValue('ava_defaultcustomer') != null && nlapiGetFieldValue('ava_defaultcustomer') != AVA_DefaultCustomerTaxcode) ? nlapiGetFieldValue('ava_defaultcustomer') : AVA_DefaultCustomerTaxcode);							
		}
		else
		{
			FormName.getField('ava_defaultcustomer').setDefaultValue('');
		}

		if(AVA_ShowMessages != null && AVA_ShowMessages.length > 0)
		{
			FormName.getField('ava_showmessages').setDefaultValue((nlapiGetFieldValue('ava_showmessages') != null && nlapiGetFieldValue('ava_showmessages') != AVA_ShowMessages) ? nlapiGetFieldValue('ava_showmessages') : AVA_ShowMessages);							
		}
		else
		{
			FormName.getField('ava_showmessages').setDefaultValue('3');
		}
		
		if(FormName.getField('ava_billtimename') != null)	
		{
			if(AVA_BillableTimeName != null && AVA_BillableTimeName.length > 0)
			{
				FormName.getField('ava_billtimename').setDefaultValue((nlapiGetFieldValue('ava_billtimename') != null && nlapiGetFieldValue('ava_billtimename') != AVA_BillableTimeName) ? nlapiGetFieldValue('ava_billtimename') : AVA_BillableTimeName);												
			}
			else
			{
				FormName.getField('ava_billtimename').setDefaultValue(0);
			}
		}
	
		FormName.getField('ava_defshipcode').setDefaultValue((nlapiGetFieldValue('ava_defshipcode') != null && nlapiGetFieldValue('ava_defshipcode') != AVA_DefaultShippingCode) ? nlapiGetFieldValue('ava_defshipcode') : AVA_DefaultShippingCode);													
		FormName.getField('ava_defmisccode').setDefaultValue((nlapiGetFieldValue('ava_defshipcode') != null && nlapiGetFieldValue('ava_defmisccode') != AVA_DefaultMiscCode) ? nlapiGetFieldValue('ava_defmisccode') : AVA_DefaultMiscCode);												
	}
	
	if(FormName.getCurrentStep().getName() == 'ava_taxsetup2')
	{	
		var firstStep = FormName.getStep( "ava_credentials" );
	
		FormName.getField('ava_accountvalue').setDefaultValue(firstStep.getFieldValue('ava_accountvalue'));
		FormName.getField('ava_licensekey').setDefaultValue(firstStep.getFieldValue('ava_licensekey'));
		FormName.getField('ava_serviceurl').setDefaultValue(firstStep.getFieldValue('ava_serviceurl'));

		
		/* Tax Calculation Elements Details */	
		FormName.getField('ava_disabletax').setDefaultValue((nlapiGetFieldValue('ava_disabletax') != null && nlapiGetFieldValue('ava_disabletax') != AVA_DisableTax) ? nlapiGetFieldValue('ava_disabletax') : (AVA_DisableTax != null && AVA_DisableTax != 'undefined' ? AVA_DisableTax : 'F'));	

		if (AVA_DisableTax == 'T')
		{
			FormName.getField('ava_disableline').setDisplayType('disabled');
			FormName.getField('ava_taxondemand').setDisplayType('disabled');
			FormName.getField('ava_enablelogging').setDisplayType('disabled');
			FormName.getField('ava_taxrate').setDisplayType('disabled');
			FormName.getField('ava_decimalplaces').setDisplayType('disabled');
			FormName.getField('ava_usepostingperiod').setDisplayType('disabled');
			FormName.getField('ava_taxinclude').setDisplayType('disabled');
			FormName.getField('ava_enablediscount').setDisplayType('disabled');
			FormName.getField('ava_discountmapping').setDisplayType('disabled');
			FormName.getField('ava_discounttaxcode').setDisplayType('disabled');
			FormName.getField('ava_disableloccode').setDisplayType('disabled');
			FormName.getField('ava_abortbulkbilling').setDisplayType('disabled');
			FormName.getField('ava_abortuserinterfaces').setDisplayType('disabled');
			FormName.getField('ava_abortwebservices').setDisplayType('disabled');
			FormName.getField('ava_abortcsvimports').setDisplayType('disabled');
			FormName.getField('ava_abortscheduledscripts').setDisplayType('disabled');
			FormName.getField('ava_abortsuitelets').setDisplayType('disabled');
		}
	
		FormName.getField('ava_disableline').setDefaultValue((nlapiGetFieldValue('ava_disableline') != null && nlapiGetFieldValue('ava_disableline') != AVA_DisableLine) ? nlapiGetFieldValue('ava_disableline') : (AVA_DisableLine != null && AVA_DisableLine != 'undefined' ? AVA_DisableLine : 'T'));	
		FormName.getField('ava_taxondemand').setDefaultValue((nlapiGetFieldValue('ava_taxondemand') != null && nlapiGetFieldValue('ava_taxondemand') != AVA_CalculateonDemand) ? nlapiGetFieldValue('ava_taxondemand') : (AVA_CalculateonDemand != null && AVA_CalculateonDemand != 'undefined' ? AVA_CalculateonDemand : 'F'));	
		FormName.getField('ava_enablelogging').setDefaultValue((nlapiGetFieldValue('ava_enablelogging') != null && nlapiGetFieldValue('ava_enablelogging') != AVA_EnableLogging) ? nlapiGetFieldValue('ava_enablelogging') : (AVA_EnableLogging != null && AVA_EnableLogging != 'undefined' ? AVA_EnableLogging : 'F'));	
		FormName.getField('ava_taxrate').setDefaultValue((nlapiGetFieldValue('ava_taxrate') != null && AVA_TaxRate != null && AVA_TaxRate != undefined && nlapiGetFieldValue('ava_taxrate') != AVA_TaxRate) ? nlapiGetFieldValue('ava_taxrate') : (AVA_TaxRate != null && AVA_TaxRate != 'undefined' ? AVA_TaxRate : '2'));	
		FormName.getField('ava_decimalplaces').setDefaultValue((nlapiGetFieldValue('ava_decimalplaces') != null && AVA_DecimalPlaces != null && AVA_DecimalPlaces != undefined && nlapiGetFieldValue('ava_decimalplaces') != AVA_DecimalPlaces) ? nlapiGetFieldValue('ava_decimalplaces') : (AVA_DecimalPlaces != null && AVA_DecimalPlaces != 'undefined' ? AVA_DecimalPlaces : '2'));	
		FormName.getField('ava_usepostingperiod').setDefaultValue((nlapiGetFieldValue('ava_usepostingperiod') != null && nlapiGetFieldValue('ava_usepostingperiod') != AVA_UsePostingPeriod) ? nlapiGetFieldValue('ava_usepostingperiod') : (AVA_UsePostingPeriod != null && AVA_UsePostingPeriod != 'undefined' ? AVA_UsePostingPeriod : 'F'));
		FormName.getField('ava_taxinclude').setDefaultValue((nlapiGetFieldValue('ava_taxinclude') != null && nlapiGetFieldValue('ava_taxinclude') != AVA_TaxInclude) ? nlapiGetFieldValue('ava_taxinclude') : (AVA_TaxInclude != null && AVA_TaxInclude != 'undefined' ? AVA_TaxInclude : 'F'));	
		FormName.getField('ava_discounttaxcode').setDefaultValue((nlapiGetFieldValue('ava_discounttaxcode') != null && nlapiGetFieldValue('ava_discounttaxcode') != AVA_DiscountTaxCode) ? nlapiGetFieldValue('ava_discounttaxcode') : (AVA_DiscountTaxCode != null && AVA_DiscountTaxCode != 'undefined' ? AVA_DiscountTaxCode : 'NT'));
		FormName.getField('ava_enablediscount').setDefaultValue((nlapiGetFieldValue('ava_enablediscount') != null && nlapiGetFieldValue('ava_enablediscount') != AVA_EnableDiscount) ? nlapiGetFieldValue('ava_enablediscount') : (AVA_EnableDiscount != null && AVA_EnableDiscount != 'undefined' ? AVA_EnableDiscount : 'F'));
		FormName.getField('ava_discountmapping').setDefaultValue((nlapiGetFieldValue('ava_discountmapping') != null && AVA_DiscountMapping != null && AVA_DiscountMapping != undefined && nlapiGetFieldValue('ava_discountmapping') != AVA_DiscountMapping) ? nlapiGetFieldValue('ava_discountmapping') : (AVA_DiscountMapping != null && AVA_DiscountMapping != 'undefined' ? AVA_DiscountMapping : '1'));
		if (AVA_EnableDiscount == 'T')
		{
			FormName.getField('ava_discountmapping').setDisplayType('normal');
			FormName.getField('ava_discounttaxcode').setDisplayType('normal');
		}
		FormName.getField('ava_disableloccode').setDefaultValue((nlapiGetFieldValue('ava_disableloccode') != null && nlapiGetFieldValue('ava_disableloccode') != AVA_DisableLocationCode) ? nlapiGetFieldValue('ava_disableloccode') : (AVA_DisableLocationCode != null && AVA_DisableLocationCode != 'undefined' ? AVA_DisableLocationCode : 'F'));
		FormName.getField('ava_enableupccode').setDefaultValue((nlapiGetFieldValue('ava_enableupccode') != null && nlapiGetFieldValue('ava_enableupccode') != AVA_EnableUpcCode) ? nlapiGetFieldValue('ava_enableupccode') : (AVA_EnableUpcCode != null && AVA_EnableUpcCode != 'undefined' ? AVA_EnableUpcCode : 'F'));
		FormName.getField('ava_abortbulkbilling').setDefaultValue((nlapiGetFieldValue('ava_abortbulkbilling') != null && AVA_AbortBulkBilling != null && AVA_AbortBulkBilling != undefined && nlapiGetFieldValue('ava_abortbulkbilling') != AVA_AbortBulkBilling) ? nlapiGetFieldValue('ava_abortbulkbilling') : (AVA_AbortBulkBilling != null && AVA_AbortBulkBilling != 'undefined' ? AVA_AbortBulkBilling : 'F'));	
		FormName.getField('ava_abortuserinterfaces').setDefaultValue((nlapiGetFieldValue('ava_abortuserinterfaces') != null && AVA_AbortUserInterfaces != null && AVA_AbortUserInterfaces != undefined && nlapiGetFieldValue('ava_abortuserinterfaces') != AVA_AbortUserInterfaces) ? nlapiGetFieldValue('ava_abortuserinterfaces') : (AVA_AbortUserInterfaces != null && AVA_AbortUserInterfaces != 'undefined' ? AVA_AbortUserInterfaces : 'F'));	
		FormName.getField('ava_abortwebservices').setDefaultValue((nlapiGetFieldValue('ava_abortwebservices') != null && AVA_AbortWebServices != null && AVA_AbortWebServices != undefined && nlapiGetFieldValue('ava_abortwebservices') != AVA_AbortWebServices) ? nlapiGetFieldValue('ava_abortwebservices') : (AVA_AbortWebServices != null && AVA_AbortWebServices != 'undefined' ? AVA_AbortWebServices : 'F'));	
		FormName.getField('ava_abortcsvimports').setDefaultValue((nlapiGetFieldValue('ava_abortcsvimports') != null && AVA_AbortCSVImports != null && AVA_AbortCSVImports != undefined && nlapiGetFieldValue('ava_abortcsvimports') != AVA_AbortCSVImports) ? nlapiGetFieldValue('ava_abortcsvimports') : (AVA_AbortCSVImports != null && AVA_AbortCSVImports != 'undefined' ? AVA_AbortCSVImports : 'F'));	
		FormName.getField('ava_abortscheduledscripts').setDefaultValue((nlapiGetFieldValue('ava_abortscheduledscripts') != null && AVA_AbortScheduledScripts != null && AVA_AbortScheduledScripts != undefined && nlapiGetFieldValue('ava_abortscheduledscripts') != AVA_AbortScheduledScripts) ? nlapiGetFieldValue('ava_abortscheduledscripts') : (AVA_AbortScheduledScripts != null && AVA_AbortScheduledScripts != 'undefined' ? AVA_AbortScheduledScripts : 'F'));	
		FormName.getField('ava_abortsuitelets').setDefaultValue((nlapiGetFieldValue('ava_abortsuitelets') != null && AVA_AbortSuitelets != null && AVA_AbortSuitelets != undefined && nlapiGetFieldValue('ava_abortsuitelets') != AVA_AbortSuitelets) ? nlapiGetFieldValue('ava_abortsuitelets') : (AVA_AbortSuitelets != null && AVA_AbortSuitelets != 'undefined' ? AVA_AbortSuitelets : 'F'));	
	
		var val = (nlapiGetFieldValue('ava_deftaxcode') != null && nlapiGetFieldValue('ava_deftaxcode') != AVA_DefaultTaxCode) ? nlapiGetFieldValue('ava_deftaxcode') : (AVA_DefaultTaxCode != null && AVA_DefaultTaxCode != 'undefined' ? AVA_DefaultTaxCode : '');
		FormName.getField('ava_deftaxcode').setDefaultValue(val);					
		
		val = val.substr(val.lastIndexOf('+')+1, val.length);
		FormName.getField('ava_deftaxcoderate').setDefaultValue(val);	
		if (flag == 0)
		{
			var info = nlapiLoadConfiguration('companyinformation');
		}

		/* Default Ship From Address */
		FormName.getField('ava_def_addressee').setDefaultValue((nlapiGetFieldValue('ava_def_addressee') != null && nlapiGetFieldValue('ava_def_addressee') != AVA_Def_Addressee) ? nlapiGetFieldValue('ava_def_addressee') : (AVA_Def_Addressee != null && AVA_Def_Addressee != 'undefined' ? AVA_Def_Addressee : info.getFieldValue('address1')));
		FormName.getField('ava_def_addr1').setDefaultValue((nlapiGetFieldValue('ava_def_addr1') != null && nlapiGetFieldValue('ava_def_addr1') != AVA_Def_Addr1) ? nlapiGetFieldValue('ava_def_addr1') : (AVA_Def_Addr1 != null && AVA_Def_Addr1 != 'undefined' ? AVA_Def_Addr1 : info.getFieldValue('address1')));
		FormName.getField('ava_def_addr2').setDefaultValue((nlapiGetFieldValue('ava_def_addr2') != null && nlapiGetFieldValue('ava_def_addr2') != AVA_Def_Addr2) ? nlapiGetFieldValue('ava_def_addr2') : (AVA_Def_Addr2 != null && AVA_Def_Addr2 != 'undefined' ? AVA_Def_Addr2 : flag == 0 ? info.getFieldValue('address2'): ''));
		FormName.getField('ava_def_city').setDefaultValue((nlapiGetFieldValue('ava_def_city') != null && nlapiGetFieldValue('ava_def_city') != AVA_Def_City) ? nlapiGetFieldValue('ava_def_city') : (AVA_Def_City != null && AVA_Def_City != 'undefined' ? AVA_Def_City : info.getFieldValue('city')));
		if(AVA_Def_Country != 'US')
		{
			AVA_FetchStates(FormName,AVA_Def_Country);
		}
		
		FormName.getField('ava_def_zip').setDefaultValue((nlapiGetFieldValue('ava_def_zip') != null && nlapiGetFieldValue('ava_def_zip') != AVA_Def_Zip) ? nlapiGetFieldValue('ava_def_zip') : (AVA_Def_Zip != null && AVA_Def_Zip != 'undefined' ? AVA_Def_Zip : info.getFieldValue('zip')));
		FormName.getField('ava_def_country').setDefaultValue((nlapiGetFieldValue('ava_def_country') != null && nlapiGetFieldValue('ava_def_country') != AVA_Def_Country) ? nlapiGetFieldValue('ava_def_country') : (AVA_Def_Country != null && AVA_Def_Country != 'undefined' ? AVA_Def_Country : info.getFieldValue('country')));
		FormName.getField('ava_def_state').setDefaultValue((nlapiGetFieldValue('ava_def_state') != null && nlapiGetFieldValue('ava_def_state') != AVA_Def_State) ? nlapiGetFieldValue('ava_def_state') : (AVA_Def_State != null && AVA_Def_State != 'undefined' ? AVA_Def_State : info.getFieldValue('dropdownstate')));
		var address = '';
		if (AVA_Def_Addressee != null && AVA_Def_Addressee != 'undefined' && AVA_Def_Addressee.length > 0)
		{
			address = AVA_Def_Addressee + '\n' + AVA_Def_Addr1 + ((AVA_Def_Addr2 == null)? '' : '\n' + AVA_Def_Addr2) + '\n' + AVA_Def_City + '\n' + AVA_Def_State + '\n' + AVA_Def_Zip + '\n' + ((AVA_Def_Country=='US') ? 'United States' : 'Canada');
		}
		else
		{
			address = info.getFieldValue('address1') + '\n' + info.getFieldValue('address1') + ((info.getFieldValue('address2') != null && info.getFieldValue('address2').length > 0)? '\n' + info.getFieldValue('address2') : '') + '\n' + info.getFieldValue('city') + '\n' + info.getFieldValue('dropdownstate') + '\n' + info.getFieldValue('zip') + '\n' + info.getFieldValue('country');
		}
		
		FormName.getField('ava_def_addrtext').setDefaultValue(address);			
		
	}
	
	if(FormName.getCurrentStep().getName() == 'ava_addsetup')
	{	
		FormName.getField('ava_disableaddvalidation').setDefaultValue((nlapiGetFieldValue('ava_disableaddvalidation') != null && nlapiGetFieldValue('ava_disableaddvalidation') != AVA_DisableAddValidation) ? nlapiGetFieldValue('ava_disableaddvalidation') : (AVA_DisableAddValidation != null && AVA_DisableAddValidation != 'undefined' ? AVA_DisableAddValidation : 'F'));	
		FormName.getField('ava_uppercaseaddress').setDefaultValue((nlapiGetFieldValue('ava_uppercaseaddress') != null && nlapiGetFieldValue('ava_uppercaseaddress') != AVA_AddUpperCase) ? nlapiGetFieldValue('ava_uppercaseaddress') : (AVA_AddUpperCase != null && AVA_AddUpperCase != 'undefined' ? AVA_AddUpperCase : 'F'));	
		FormName.getField('ava_addbatchprocessing').setDefaultValue((nlapiGetFieldValue('ava_addbatchprocessing') != null && nlapiGetFieldValue('ava_addbatchprocessing') != ((AVA_AddBatchProcessing == 0) ? 'manual' : 'automatic')) ? nlapiGetFieldValue('ava_addbatchprocessing') : ((AVA_AddBatchProcessing == 0) ? 'manual' : 'automatic'));			
		FormName.getField('ava_enableaddvalontran').setDefaultValue((nlapiGetFieldValue('ava_enableaddvalontran') != null && nlapiGetFieldValue('ava_enableaddvalontran') != AVA_EnableAddValonTran) ? nlapiGetFieldValue('ava_enableaddvalontran') : (AVA_EnableAddValonTran != null && AVA_EnableAddValonTran != 'undefined' ? AVA_EnableAddValonTran : 'F'));
		
		if(AVA_DisableAddValidation == 'T')
		{
			FormName.getField('ava_uppercaseaddress').setDefaultValue('F');
			FormName.getField('ava_uppercaseaddress').setDisplayType('disabled');
			FormName.getField('ava_addbatchprocessing').setDefaultValue('manual');
			FormName.getField('ava_addbatchprocessing').setDisplayType('disabled');
			FormName.getField('ava_enableaddvalontran').setDisplayType('disabled');
		}
	}
}

function AVA_ConfigWizardChanged(type, name, linenum)
{
	var AVA_Address = new Array(7);
	var address = '';
	
	if(name == 'ava_def_country')
	{
		if(nlapiGetFieldValue('ava_def_country') == 'CA')
		{
			AVA_FilterStates('CA');
		}
		
		if(nlapiGetFieldValue('ava_def_country') == 'US')
		{
			AVA_FilterStates('US');
		}
	}
	
	
	/* Start of 1st Check */
	if (name == 'ava_disabletax')
	{
		if (nlapiGetFieldValue('ava_disabletax') == 'T')
		{
			if (confirm('Are you sure you want to disable AvaTax Tax Calculation ?') == true)
			{
				AVA_DisableTaxFields(true);
			}
			else
			{
				nlapiSetFieldValue('ava_disabletax', 'F');
			}
		}
		else
		{
			AVA_DisableTaxFields(false);
		}
	}
	/* End of 1st Check */		

	/* Start of 2nd Check */		
	if(name == 'ava_deftaxcode')
	{
		var val = nlapiGetFieldValue('ava_deftaxcode');
		val = val.substr(val.lastIndexOf('+')+1, val.length);
		nlapiSetFieldValue('ava_deftaxcoderate', val, 'F');
	}
	
	/* End of 2nd Check */	
		
	/* Start of 3rd Check */		
	if ((name == 'ava_def_addressee') || (name == 'ava_def_addr1') || (name == 'ava_def_addr2') || (name == 'ava_def_city') || (name == 'ava_def_state') || (name == 'ava_def_zip') || (name == 'ava_def_country'))
	{
		if (nlapiGetFieldValue('ava_def_addressee') != null)
		{
			AVA_Address[0] = (nlapiGetFieldValue('ava_def_addressee').length > 0)? nlapiGetFieldValue('ava_def_addressee') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_addr1') != null)
		{
			AVA_Address[1] = (nlapiGetFieldValue('ava_def_addr1').length > 0)? nlapiGetFieldValue('ava_def_addr1') + '\n' : '';
		}
		if(nlapiGetFieldValue('ava_def_addr2') != null)
		{
			AVA_Address[2] = (nlapiGetFieldValue('ava_def_addr2').length > 0)? nlapiGetFieldValue('ava_def_addr2') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_city') != null)
		{
			AVA_Address[3] = (nlapiGetFieldValue('ava_def_city').length > 0) ? nlapiGetFieldValue('ava_def_city') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_state') != null)
		{
			AVA_Address[4] = (nlapiGetFieldValue('ava_def_state').length > 0) ? nlapiGetFieldValue('ava_def_state') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_zip') != null)
		{
			AVA_Address[5] = (nlapiGetFieldValue('ava_def_zip').length > 0) ? nlapiGetFieldValue('ava_def_zip') + '\n' : '';
		}
		if (nlapiGetFieldValue('ava_def_country') != null)
		{
			AVA_Address[6] = nlapiGetFieldText('ava_def_country');
		}

		for(var i=0; i <= 6 ; i++)
		{
			address = address +  AVA_Address[i];
		}
		
		nlapiSetFieldValue('ava_def_addrtext', address, false);
	}
	/* End of 3rd Check */		
		
	if(name == 'ava_addressvalidate')
	{		
		if(nlapiGetFieldValue('ava_addressvalidate') == 'T')
		{			
			var response ;
			var security = AVA_TaxSecurity(nlapiGetFieldValue('ava_accountvalue'), nlapiGetFieldValue('ava_licensekey'));
			var headers = AVA_Header(security);
			var body = AVA_ValidateShipFromAddressBody();
			var soapPayload = AVA_BuildEnvelope(headers + body);
			
			var soapHead = new Array();
			soapHead['Content-Type'] = 'text/xml';
			soapHead['SOAPAction'] = '"http://avatax.avalara.com/services/Validate"';
			
			try
			{	
				response = nlapiRequestURL(nlapiGetFieldValue('ava_serviceurl') + '/address/addresssvc.asmx', soapPayload, soapHead);
				
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
						var Region  	= nlapiSelectValues( soapXML, "//*[name()='Region']");
						var PostalCode  = nlapiSelectValues( soapXML, "//*[name()='PostalCode']");
						var Country  	= nlapiSelectValues( soapXML, "//*[name()='Country']");
							
						if(nlapiGetFieldValue('ava_def_country') != Country)
						{
							AVA_FilterStates(Country);
						}
							
						nlapiSetFieldValue('ava_def_addr1', 	Line1, false);
						nlapiSetFieldValue('ava_def_addr2', 	Line2, false);
						nlapiSetFieldValue('ava_def_city', 		City, false);
							
						nlapiSetFieldValue('ava_def_state', 	Region, false);
						nlapiSetFieldValue('ava_def_zip', 		PostalCode, false);
						nlapiSetFieldValue('ava_def_country', 	Country, false);
							
						var address = '';
						Line2 = (Line2 !=null && Line2.length > 0)? '\n' + Line2 : '';
						address = nlapiGetFieldValue('ava_def_addressee') + '\n' + Line1 + Line2 + City + '\n' + Region + '\n' + PostalCode + '\n' + ((Country=='US') ? 'United States' : 'Canada');
						nlapiSetFieldValue('ava_def_addrtext',address, false);
							
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
		nlapiSetFieldValue('ava_addressvalidate', 'F', false);
	}	
	
	if(name == 'ava_disableaddvalidation')
	{
		if(nlapiGetFieldValue('ava_disableaddvalidation') == 'T')
		{
			nlapiSetFieldValue('ava_uppercaseaddress', 'F');
			nlapiDisableField('ava_uppercaseaddress', true);
			nlapiSetFieldValue('ava_addbatchprocessing', 'manual');
			nlapiDisableField('ava_addbatchprocessing', true);
			nlapiDisableField('ava_enableaddvalontran', true);
		}
		else if(nlapiGetFieldValue('ava_disableaddvalidation') == 'F')
		{
			nlapiDisableField('ava_uppercaseaddress', false);
			nlapiDisableField('ava_addbatchprocessing', false);
			nlapiDisableField('ava_enableaddvalontran', false);
		}
	}

	/* Start of 5th check */
	if(name == 'ava_customercode')
	{
		if(nlapiGetFieldValue('ava_customercode') >= 3)
		{
			if(nlapiGetContext().getFeature('prm') != true)
			{
				alert('Partner information cannot be passed to service as the required features are not enabled.');
			}
			else
			{
				if(nlapiGetContext().getFeature('multipartner') == true)
				{
					alert('Customer information will be passed to the service as Multi-Partner Management feature is enabled.');
				}
			}
		}
	}
	
	if(name == 'ava_enablebatchservice')
	{
		var displaytype = (nlapiGetFieldValue('ava_enablebatchservice') == 'T') ? false : true;
		nlapiDisableField('ava_username', displaytype);
		nlapiDisableField('ava_password', displaytype);
	}
	
	if(name == 'ava_licensekey' && AVA_EncryptFlag == 0)
	{
		var licensekey = nlapiGetFieldValue('ava_licensekey');
		if(licensekey != null && licensekey.length > 0)
		{
			if(licensekey.length > 16)
			{
				licensekey = licensekey.substring(0, 16);
			}
			
			AVA_EncryptFlag = 1;
			nlapiSetFieldValue('ava_licensekey', nlapiEncrypt(licensekey, 'base64'));
		}
	}
	
	if(name == 'ava_password' && AVA_EncryptFlag == 0)
	{
		var password = nlapiGetFieldValue('ava_password');
		if(password != null && password.length > 0)
		{
			if(password.length > 50)
			{
				password = password.substring(0, 50);
			}
			
			AVA_EncryptFlag = 1;
			nlapiSetFieldValue('ava_password', nlapiEncrypt(password, 'base64'));
		}
	}
	
	if(name == 'ava_enablediscount')
	{
		var displaytype = (nlapiGetFieldValue('ava_enablediscount') == 'T') ? false : true;
		nlapiDisableField('ava_discountmapping', displaytype);
		nlapiDisableField('ava_discounttaxcode', displaytype);
	}

	AVA_EncryptFlag = 0;
}

function AVA_DisableTaxFields(displaytype)
{
	nlapiDisableField('ava_disableline', 			displaytype);
	nlapiDisableField('ava_taxondemand', 			displaytype);
	nlapiDisableField('ava_enablelogging', 			displaytype);
	nlapiDisableField('ava_deftaxcode', 			displaytype);
	nlapiDisableField('ava_taxrate', 				displaytype);
	nlapiDisableField('ava_decimalplaces', 			displaytype);
	nlapiDisableField('ava_usepostingperiod', 		displaytype);
	nlapiDisableField('ava_taxinclude', 	    	displaytype);
	nlapiDisableField('ava_enablediscount', 	    displaytype);
	var display = (displaytype == true) ? true : ((nlapiGetFieldValue('ava_enablediscount') == 'T') ? false : true);
	nlapiDisableField('ava_discountmapping', 	    display);
	nlapiDisableField('ava_discounttaxcode', 	    display);
	nlapiDisableField('ava_disableloccode', 	    displaytype);
	nlapiDisableField('ava_enableupccode',	 	    displaytype);
	nlapiDisableField('ava_abortbulkbilling', 		displaytype);
	nlapiDisableField('ava_abortuserinterfaces', 	displaytype);
	nlapiDisableField('ava_abortwebservices', 		displaytype);
	nlapiDisableField('ava_abortcsvimports', 		displaytype);
	nlapiDisableField('ava_abortscheduledscripts', 	displaytype);
	nlapiDisableField('ava_abortsuitelets', 		displaytype);
}

function AVA_ConfigWizardSave()
{
	var connResult = true;
	
	if(nlapiGetFieldValue('ava_servicetypes') != null)
	{
		connResult = AVA_ConfigTestConnection();
		nlapiSetFieldValue('ava_servicetypes', AVA_ServiceTypes);
	}
	
	if(nlapiGetFieldValue('ava_deftaxcoderate') != null)
	{
		var TaxRate = nlapiGetFieldText('ava_deftaxcoderate');
		if(TaxRate.indexOf('%') == -1)
		{
			if(parseFloat(TaxRate) > 0)
			{
				alert('Default Tax Code rate selected should be equal to zero');
				return false;
			}
		}
		else
		{
			TaxRate = TaxRate.substr(0, TaxRate.indexOf('%'));
			if(parseFloat(TaxRate) > 0)
			{
				alert('Default Tax Code rate selected should be equal to zero');
				return false;
			}
		}
	}

	if(nlapiGetFieldValue('ava_customercode') >= 3)
	{
		if(nlapiGetContext().getFeature('prm') != true)
		{
			alert('Partner information cannot be passed to service as the required features are not enabled.');
			return false;
		}
	}
	
	if(nlapiGetFieldValue('ava_enablediscount') == 'T')
	{
		if(nlapiGetFieldValue('ava_discounttaxcode') == null || nlapiGetFieldValue('ava_discounttaxcode').length == 0)
		{
			alert('Please Enter Discount Tax Code');
			return false;
		}
	}
	return connResult;
}

function AVA_LoadConfigData(assistant)
{
	var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
	
	if(searchresult != null && searchresult.length > 0)
	{
		flag = 1;
		var AVA_Record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
		var AVA_LoadValues = AVA_LoadValuesToGlobals(AVA_Record);				
	}
	
	AVA_SetValuesFromGlobals(assistant);
}



function AVA_AvaTaxConfigurationWizard(request, response)
{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
	var assistant = nlapiCreateAssistant("Avalara Configuration Assistant", false);	 
	assistant.setOrdered( true );                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
	
	assistant.addStep('ava_credentials', 'Enter Avalara Credentials').setHelpText( "Enter Avalara credentials provided to you at the time of registration.");

	//assistant.addStep('ava_taxsetup1', 'General Settings ').setHelpText("General settings related to AvaTax Service." + space + "<img src='http://a0.twimg.com/profile_images/74890681/Avalara_button1_normal.jpg'/>");   
	assistant.addStep('ava_taxsetup1', 'General Settings ').setHelpText("General settings related to Avalara Service.");
	assistant.addStep('ava_taxsetup2', 'Tax Calculation Settings ').setHelpText("Settings related to Avalara Tax Calculation.");   
	assistant.addStep('ava_addsetup', 'Address Validation Settings ').setHelpText("Settings related to Avalara Address Service.");
	assistant.addStep('ava_info', 'Avalara Details').setHelpText("Avalara Information.");
	
	/* handle page load (GET) requests. */
	if (request.getMethod() == 'GET')
	{
		assistant.setScript('customscript_avaconfig_client');
		
		/*.Check whether the assistant is finished */
		if ( !assistant.isFinished() )
		{
			// If initial step, set the Splash page and set the intial step
			if ( assistant.getCurrentStep() == null )
			{
				assistant.setCurrentStep(assistant.getStep( 'ava_credentials' ) ); 
				assistant.setSplash("Welcome to the AvaTax Configuration Assistant!", "<b>What you'll be doing</b><br>The AvaTax Configuration Setup Assistant will walk you through the process of configuring your NetSuite account to run AvaTax utility.", "<b>When you finish</b><br>your account will be ready to make AvaTax service calls as per the settings you made.");
			}
			
			var step = assistant.getCurrentStep();  
			
			// Build the page for a step by adding fields, field groups, and sublists to the assistant    
			if (step.getName() == 'ava_credentials')
			{
				AVA_AvaTaxConfigSetup(assistant); 
	
				AVA_LoadConfigData(assistant);                                                                                                                                                                                                                                                                                                                                                                                                   
			
			}
			else if (step.getName() == 'ava_taxsetup1')
			{
				var firstStep = assistant.getStep( "ava_credentials" );
				
				AVA_ServiceTypes = firstStep.getFieldValue('ava_servicetypes');

				if(AVA_ServiceTypes.search('TaxSvc') != -1)
				{
					AVA_GeneralConfigSetup(assistant);
					
				}   
				else if(AVA_ServiceTypes.search('AddressSvc') != -1)
				{
					assistant.setCurrentStep(assistant.getStep( "ava_addsetup" )); 
					
					AVA_AddressConfigSetup(assistant);
				}  
				else
				{
					assistant.setCurrentStep(assistant.getStep( "ava_info" ));
					AVA_AboutAvaTaxConfig(assistant);
				}                                                                                                                                                                                                                                                                    

			}
			else if (step.getName() == 'ava_taxsetup2')
			{
				var firstStep = assistant.getStep("ava_credentials");
				
				AVA_ServiceTypes = firstStep.getFieldValue('ava_servicetypes');
				
				if(assistant.getLastStep().getName() == "ava_addsetup" && AVA_ServiceTypes.search("TaxSvc") == -1)
				{
					assistant.setCurrentStep(assistant.getStep( "ava_credentials" )); 	
					AVA_AvaTaxConfigSetup(assistant);
				} 
				else
				{											
					AVA_TaxCalcConfigSetup(assistant);                                                                                                                                                                    
				}
			
			}	
			else if (step.getName() == 'ava_addsetup')			
			{
				var firstStep = assistant.getStep("ava_credentials");
				
				AVA_ServiceTypes = firstStep.getFieldValue('ava_servicetypes');
				
				if(assistant.getLastStep().getName() == "ava_info" && AVA_ServiceTypes.search("AddressSvc") == -1)
				{
					if(AVA_ServiceTypes.search("TaxSvc") != -1)
					{
						assistant.setCurrentStep(assistant.getStep( "ava_taxsetup2" )); 						
						AVA_TaxCalcConfigSetup(assistant);	
					}
					else
					{
						assistant.setCurrentStep(assistant.getStep( "ava_credentials" )); 	
						AVA_AvaTaxConfigSetup(assistant);
					}
				} 
				else
				{
					if(AVA_ServiceTypes.search("AddressSvc") != -1)
					{
						assistant.setCurrentStep(assistant.getStep( "ava_addsetup" ));
						AVA_AddressConfigSetup(assistant);
					}
					else
					{
						//show final page
						assistant.setCurrentStep(assistant.getStep( "ava_info" ));
						AVA_AboutAvaTaxConfig(assistant);
					}
				}
			}
			else if (step.getName() == 'ava_info')	
			{
				assistant.setCurrentStep(assistant.getStep( "ava_info" ));
				AVA_AboutAvaTaxConfig(assistant);
			}
		}         
		          
		response.writePage(assistant);
		          
	}              
	/* handle user submit (POST) requests. */ 
	else           
	{              
		assistant.setError( null ); 
		          
		if (assistant.getLastAction() == "finish")
		{         
			var crdntlStep = assistant.getStep( 'ava_credentials' );
			var gnlStep = assistant.getStep( 'ava_taxsetup1' );	    			
	    	var taxStep = assistant.getStep( 'ava_taxsetup2' );
	    	var addStep = assistant.getStep( 'ava_addsetup' );
			
			var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
			
			if (searchresult != null && searchresult.length > 0)
			{
				var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[0].getId());
			}
			else
			{
				var record = nlapiCreateRecord('customrecord_avaconfig');
			}
			
			record.setFieldValue('custrecord_ava_accountvalue', 	crdntlStep.getFieldValue('ava_accountvalue'));	
			record.setFieldValue('custrecord_ava_licensekey', 		crdntlStep.getFieldValue('ava_licensekey'));	
			record.setFieldValue('custrecord_ava_url', 				crdntlStep.getFieldValue('ava_serviceurl'));	
			record.setFieldValue('custrecord_ava_servicetypes', 	crdntlStep.getFieldValue('ava_servicetypes'));	
			record.setFieldValue('custrecord_ava_expirydate', 		crdntlStep.getFieldValue('ava_expirydate'));	
			record.setFieldValue('custrecord_ava_enablebatchservice', crdntlStep.getFieldValue('ava_enablebatchservice'));	
			if(crdntlStep.getFieldValue('ava_enablebatchservice') == 'T')
			{
				record.setFieldValue('custrecord_ava_username', 		  crdntlStep.getFieldValue('ava_username'));	
				record.setFieldValue('custrecord_ava_password', 		  crdntlStep.getFieldValue('ava_password'));
			}
			
			/* General Tab Elements Detail */
			record.setFieldValue('custrecord_ava_udf1', 			gnlStep.getFieldValue('ava_udf1') );	
			record.setFieldValue('custrecord_ava_udf2', 			gnlStep.getFieldValue('ava_udf2'));	
			record.setFieldValue('custrecord_ava_entityusecode', 	gnlStep.getFieldValue('ava_entityusecode'));	
			record.setFieldValue('custrecord_ava_itemaccount', 		gnlStep.getFieldValue('ava_itemaccount'));	
			record.setFieldValue('custrecord_ava_taxcodemapping', 	gnlStep.getFieldValue('ava_taxcodemapping'));	
			record.setFieldValue('custrecord_ava_customercode', 	gnlStep.getFieldValue('ava_customercode'));
			record.setFieldValue('custrecord_ava_markcusttaxable',  gnlStep.getFieldValue('ava_markcusttaxable'));
			record.setFieldValue('custrecord_ava_defaultcustomer',  gnlStep.getFieldValue('ava_defaultcustomer'));
			record.setFieldValue('custrecord_ava_showmessages', 	gnlStep.getFieldValue('ava_showmessages'));
			
			if(gnlStep.getFieldValue('ava_billtimename') != null && gnlStep.getFieldValue('ava_billtimename').length > 0)
			{
				record.setFieldValue('custrecord_ava_billtimename', 	gnlStep.getFieldValue('ava_billtimename'));
			}
			
			var defshipcode = gnlStep.getFieldValue('ava_defshipcode');
			defshipcode = (defshipcode != null && defshipcode.length > 1)? defshipcode.substring(0,(defshipcode.length)): defshipcode;

			var defmisccode = gnlStep.getFieldValue('ava_defmisccode');
			defmisccode = (defmisccode != null && defmisccode.length > 1)? defmisccode.substring(0,(defmisccode.length)): defmisccode;
			
			record.setFieldValue('custrecord_ava_defshipcode', 		defshipcode);	
			record.setFieldValue('custrecord_ava_defmisccode', 		defmisccode);	
		
			/* Tax Calculation Elements Details */	
			record.setFieldValue('custrecord_ava_disabletax', 		taxStep.getFieldValue('ava_disabletax'));	
			record.setFieldValue('custrecord_ava_disableline', 		taxStep.getFieldValue('ava_disableline'));	
			record.setFieldValue('custrecord_ava_taxondemand', 		taxStep.getFieldValue('ava_taxondemand'));
			record.setFieldValue('custrecord_ava_enablelogging', 	taxStep.getFieldValue('ava_enablelogging'));
			record.setFieldValue('custrecord_ava_taxrate', 			taxStep.getFieldValue('ava_taxrate'))
			record.setFieldValue('custrecord_ava_decimalplaces', 	taxStep.getFieldValue('ava_decimalplaces'))
			record.setFieldValue('custrecord_ava_deftaxcode', 		taxStep.getFieldValue('ava_deftaxcode'));	
			record.setFieldValue('custrecord_ava_usepostingdate',   taxStep.getFieldValue('ava_usepostingperiod'));
			record.setFieldValue('custrecord_ava_taxinclude',       taxStep.getFieldValue('ava_taxinclude'));
			record.setFieldValue('custrecord_ava_enablediscount',   taxStep.getFieldValue('ava_enablediscount'));
			record.setFieldValue('custrecord_ava_discountmapping',  taxStep.getFieldValue('ava_discountmapping'));
			record.setFieldValue('custrecord_ava_discounttaxcode',  taxStep.getFieldValue('ava_discounttaxcode'));
			record.setFieldValue('custrecord_ava_disableloccode',   taxStep.getFieldValue('ava_disableloccode'));
			record.setFieldValue('custrecord_ava_enableupccode',   taxStep.getFieldValue('ava_enableupccode'));
		
			record.setFieldValue('custrecord_ava_abortbulkbilling', 	taxStep.getFieldValue('ava_abortbulkbilling'));
			record.setFieldValue('custrecord_ava_abortuserinterfaces', 	taxStep.getFieldValue('ava_abortuserinterfaces'));
			record.setFieldValue('custrecord_ava_abortwebservices', 	taxStep.getFieldValue('ava_abortwebservices'));
			record.setFieldValue('custrecord_ava_abortcsvimports', 		taxStep.getFieldValue('ava_abortcsvimports'));
			record.setFieldValue('custrecord_ava_abortscheduledscripts', taxStep.getFieldValue('ava_abortscheduledscripts'));
			record.setFieldValue('custrecord_ava_abortsuitelets', 		taxStep.getFieldValue('ava_abortsuitelets'));
			
			/* Default Ship From Address */				
			record.setFieldValue('custrecord_ava_addressee',		taxStep.getFieldValue('ava_def_addressee'));
			record.setFieldValue('custrecord_ava_address1',			taxStep.getFieldValue('ava_def_addr1'));
			record.setFieldValue('custrecord_ava_address2',			taxStep.getFieldValue('ava_def_addr2'));
			record.setFieldValue('custrecord_ava_city',				taxStep.getFieldValue('ava_def_city'));
			record.setFieldValue('custrecord_ava_state',			taxStep.getFieldValue('ava_def_state'));
			record.setFieldValue('custrecord_ava_zip',				taxStep.getFieldValue('ava_def_zip'));
			record.setFieldValue('custrecord_ava_country',			taxStep.getFieldValue('ava_def_country'));
						
			record.setFieldValue('custrecord_ava_disableaddvalidation', addStep.getFieldValue('ava_disableaddvalidation'));
			record.setFieldValue('custrecord_ava_adduppercase', 		addStep.getFieldValue('ava_uppercaseaddress'));
			record.setFieldValue('custrecord_ava_addbatchprocessing', 	(addStep.getFieldValue('ava_addbatchprocessing') == 'manual' ? '0' : '1'));
			record.setFieldValue('custrecord_ava_enableaddvalontran',  addStep.getFieldValue('ava_enableaddvalontran'));

			var avaidl = nlapiSubmitRecord(record, false);
			
			var configSuitelet = nlapiResolveURL('SUITELET', 'customscript_avaconfig_suitlet', 'customdeploy_configuration', null, null);
			var wizardSuitelet = nlapiResolveURL('SUITELET', 'customscript_avaconfig_wizard', 'customdeploy_ava_configurewizard', null, null);
			
			var finishedText = "Congratulations! You have completed the Avalara Configuration Assistant.<tr><td colspan=2> &nbsp; </td></tr>";                                                                                                        
			finishedText += "<tr><td colspan=2 class=text align=left>Quick Links</td></tr><tr><td class=textbold style='padding-left:50; padding-top:20' colspan=2 align=left valign=top><a href='" + configSuitelet + "'>View Avalara Configuration</a></td></tr>";   
			finishedText += "<tr><td class=text colspan=2 style='padding-left:50;' align=left valign=top>Click this link to view the Avalara Configuration settings done.</td></tr>";     
			finishedText += "<tr> <td class=textbold style='padding-left:50; padding-top:20' colspan=2 align=left valign=top><a href='" + wizardSuitelet + "'>Modify Avalara Configuration</a></td></tr>";                                                           
			finishedText += "<tr><td class=text colspan=2 style='padding-left:50;' align=left valign=top>Click this link to change any Avalara configuration details.</td></tr>";                              
			    			                                                                                                                                                                                                                               
			assistant.setFinished(finishedText);                                                                                                                                                                                                          
			                                                                                                                                                                                                                                              
			assistant.sendRedirect( response );                                                                                                                                                                                              
                                                                                                                                                                                                                                          
        	}    
		/* 2. if they clicked the "cancel" button, take them to a different page (setup tab) altogether as appropriate. */
		else if (assistant.getLastAction() == "cancel")
		{
			nlapiSetRedirectURL('tasklink', "CARD_-10");
		}
		/* 3. For all other actions (next, back, jump), process the step and redirect to assistant page. */
		else     
		{
			if( !assistant.hasError() )	
			{
				assistant.setCurrentStep( assistant.getNextStep() );
			}	

			assistant.sendRedirect( response );
		}
	}         
}

function AVA_AvaTaxConfigSetup(assistant)
{	
	var firstStep = null;
	
	if(assistant.getLastStep() != null)
	{
		firstStep = assistant.getStep('ava_credentials');
	}
	
	if(assistant.getCurrentStep().getName() == 'ava_credentials')
	{
		AVA_EncryptFlag = 0;
		AVA_AccountValue = AVA_LicenseKey = AVA_ServiceUrl = AVA_ExpiryDate = AVA_Username = AVA_Password = '';
		var AVA_GlobalDateFormat 	= assistant.addField('ava_globaldateformat',	'text',	 'Global Date Format');                                                                                                                                                                                                                                                                                                                                                                                                                          
		AVA_GlobalDateFormat.setDisplayType('hidden');		                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
		AVA_GlobalDateFormat.setDefaultValue(nlapiGetContext().getSetting('PREFERENCE', 'DATEFORMAT'));
		
		var AVA_ServiceTypesField 	= assistant.addField('ava_servicetypes',	'text',	 'Service Types');                                                                                                                                                                                                                                                                                                                                                                                                                          
		AVA_ServiceTypesField.setDisplayType('hidden');   
	}
	else		
	{
		AVA_AccountValue = firstStep.getFieldValue('ava_accountvalue');
		AVA_LicenseKey = firstStep.getFieldValue('ava_licensekey');
		AVA_ServiceUrl = firstStep.getFieldValue('ava_serviceurl');
		AVA_ExpiryDate = firstStep.getFieldValue('ava_expirydate');		
		AVA_EnableBatchService = firstStep.getFieldValue('ava_enablebatchservice');
		AVA_Username = firstStep.getFieldValue('ava_username');	
		AVA_Password = firstStep.getFieldValue('ava_password');
	}
		
	assistant.addFieldGroup("ava_credentialsinfo", "Avalara Credentials");

	assistant.addField('ava_accountvalue','text','Account ID ', null,'ava_credentialsinfo');
	assistant.getField('ava_accountvalue').setDefaultValue(AVA_AccountValue);  
	assistant.addField('ava_licensekey','password','License Key ', null,'ava_credentialsinfo');   
	assistant.getField('ava_licensekey').setMaxLength(30);
	assistant.getField('ava_licensekey').setDefaultValue(AVA_LicenseKey);                         
	assistant.addField('ava_serviceurl','text','Service URL ', null,'ava_credentialsinfo');
	assistant.getField('ava_serviceurl').setDefaultValue(AVA_ServiceUrl);  
	assistant.addField('ava_expirydate','text','Expiry Date ', null,'ava_credentialsinfo');
	assistant.getField('ava_expirydate').setDefaultValue(AVA_ExpiryDate);  
	
	assistant.addField('ava_enablebatchservice', 'checkbox', 'Enable UseTax Batch Service', null, 'ava_credentialsinfo').setLayoutType('normal','startcol');
	assistant.getField('ava_enablebatchservice').setDefaultValue('F');
	assistant.addField('ava_username', 'text', 'Username', null, 'ava_credentialsinfo');
	assistant.getField('ava_username').setDisplayType('disabled');
	assistant.getField('ava_username').setDefaultValue(AVA_Username); 
	assistant.addField('ava_password', 'password', 'Password', null, 'ava_credentialsinfo');
	assistant.getField('ava_password').setMaxLength(70);
	assistant.getField('ava_password').setDisplayType('disabled');
	assistant.getField('ava_password').setDefaultValue(AVA_Password);
}

function AVA_GeneralConfigSetup(assistant)
{
	AVA_AvaTaxConfigSetup(assistant);
	
	assistant.getField('ava_accountvalue').setDisplayType('inline');
	assistant.getField('ava_licensekey').setDefaultValue('****************');
	assistant.getField('ava_licensekey').setDisplayType('inline');  
	assistant.getField('ava_serviceurl').setDisplayType('inline');
	assistant.getField('ava_expirydate').setDisplayType('inline');	
	assistant.getField('ava_enablebatchservice').setLayoutType('normal','startcol');
	assistant.getField('ava_enablebatchservice').setDisplayType('hidden');
	assistant.getField('ava_username').setDisplayType('inline');
	assistant.getField('ava_password').setDisplayType('inline');
	if(AVA_Password != null && AVA_Password.length > 0)
	{
		assistant.getField('ava_password').setDefaultValue('********');
	}
	else
	{
		assistant.getField('ava_password').setDefaultValue('');
	}
	
	assistant.addFieldGroup("ava_itemsetting", "Item Specific Settings");
	assistant.addFieldGroup("ava_custsetting", "Customer Specific Settings");	
	assistant.addFieldGroup("ava_miscsetting", "Miscellaneous Settings");
			
	//General settings                                                                                                                                                                                                                                                                                                                                                              
	assistant.addField('ava_udf1', 			'checkbox',		'User Defined 1', 					null, 'ava_itemsetting');                                                                                                                                                                                                                                                  
	assistant.addField('ava_udf2', 			'checkbox', 	'User Defined 2', 					null, 'ava_itemsetting');                                                                                                                                                                                                                                                       	                                                                                                                                                                                                                                                    
	assistant.addField('ava_itemaccount', 		'checkbox', 	'Send Item Account to Avalara', 		null, 'ava_itemsetting').setLayoutType('normal','startcol');                                                                                                                                                                                                                                                     
	assistant.addField('ava_taxcodemapping', 	'checkbox', 	'Enable Tax Code Mapping', 			null, 'ava_itemsetting');                                                                                                                                                                                                                                                       
																																																																																													
	// Adding Customer default Options 
	assistant.addField('ava_entityusecode', 	'checkbox', 	'Enable Entity/Use Code', 			null, 'ava_custsetting');                                                                                                                                                                                                                                                       	
	
	var AVA_CustomerCode	= assistant.addField('ava_customercode',		'select',		'Customer Code',			null, 'ava_custsetting').setLayoutType('normal','startcol');
	AVA_CustomerCode.addSelectOption('0','Customer ID');	
	AVA_CustomerCode.addSelectOption('1','Customer Name');		
	AVA_CustomerCode.addSelectOption('2','Customer Internal ID');
	AVA_CustomerCode.addSelectOption('3','Partner ID');
	AVA_CustomerCode.addSelectOption('4','Partner Name');
	AVA_CustomerCode.addSelectOption('5','Partner Internal ID');
	AVA_CustomerCode.addSelectOption('6','Customer ID/Name');
	AVA_CustomerCode.addSelectOption('7','Partner ID/Name');
	AVA_CustomerCode.setHelpText('Customer/Partner Code with which the tax call will be made to AvaTax.', false);
				
	var AVA_MarkCustomerTaxable	= assistant.addField('ava_markcusttaxable',		'select',		'Customers Default to Taxable',			null, 'ava_custsetting').setLayoutType('normal','startcol');	
	AVA_MarkCustomerTaxable.addSelectOption('0','');                                                                                                                                                                                                                                                                                                                                  
	AVA_MarkCustomerTaxable.addSelectOption('1','New and Existing Customer(s)');                                                                                                                                                                                                                                                                                                      
	AVA_MarkCustomerTaxable.addSelectOption('2','Only New Customer(s)');                                                                                                                                                                                                                                                                                                              
	AVA_MarkCustomerTaxable.addSelectOption('3','Only Existing Customer(s)');	
				
	var AVA_DefaultCustomerTaxcode	= assistant.addField('ava_defaultcustomer',		'select',		'Apply Default Taxcode To',			null, 'ava_custsetting');                                                                                                                                                                                                                    
					                                                
	// Adding Taxcode defaulting Options                                                                                                                                                                                                                                                                                                                                                 
	AVA_DefaultCustomerTaxcode.addSelectOption('0','');                                                                                                                                                                                                                                                                                                                                  
	AVA_DefaultCustomerTaxcode.addSelectOption('1','New and Existing Customer(s)');                                                                                                                                                                                                                                                                                                      
	AVA_DefaultCustomerTaxcode.addSelectOption('2','Only New Customer(s)');                                                                                                                                                                                                                                                                                                              
	AVA_DefaultCustomerTaxcode.addSelectOption('3','Only Existing Customer(s)');												                                                                                                                                                                                                                                              
																																																																																														 
	var AVA_DefShipCode  	= assistant.addField('ava_defshipcode',		'select',		'Default Shipping Code',			null, 'ava_miscsetting');                                                                                                                                                                                                                               
	var AVA_DefMiscCode  	= assistant.addField('ava_defmisccode', 		'select', 		'Default Miscellaneous Code', 		null, 'ava_miscsetting');                                                                                                                                                                                                                

	var AVA_ShowMsgs	= assistant.addField('ava_showmessages',		'select',		'Show Warnings/Errors',			null, 'ava_miscsetting').setLayoutType('normal','startcol');	
	AVA_ShowMsgs.addSelectOption('0','None');                                                                                                                                                                                                                                                                                                                                  
	AVA_ShowMsgs.addSelectOption('1','Only Warnings');                                                                                                                                                                                                                                                                                                      
	AVA_ShowMsgs.addSelectOption('2','Only Errors');                                                                                                                                                                                                                                                                                                              
	AVA_ShowMsgs.addSelectOption('3','Both');
	
	var AVA_BillableTimeName;                                                                                                                                                                                                                                                                                                                                                            
																																																																																														 
	if(nlapiGetContext().getSetting('FEATURE', 'billscosts') == 'T')                                                                                                                                                                                                                                                                                                                     
	{                                                                                                                                                                                                                                                                                                                                                                                    
		AVA_BillableTimeName	= assistant.addField('ava_billtimename',		'select',		'Billable Time Name',			null, 'ava_miscsetting');                                                                                                                                                                                                                                   
		AVA_BillableTimeName.addSelectOption('0','Billable Time');                                                                                                                                                                                                                                                                                                                      
		AVA_BillableTimeName.addSelectOption('1','Item Name');                                                                                                                                                                                                                                                                                                                          
	}				                                                                                                                                                                                                                                                                                                                                                                 
	
	// Adding Shipping Codes                                                                                                                                                                                                                                                                                                                                               
	var searchresult = nlapiSearchRecord('customrecord_avashippingcodes', null, null, null);                                                                                                                                                                                                                                                                               
	if (searchresult != null)                                                                                                                                                                                                                                                                                                                                              
	{                                                                                                                                                                                                                                                                                                                                                                      
		AVA_DefShipCode.addSelectOption('', '');                                                                                                                                                                                                                                                                                                                          
		AVA_DefMiscCode.addSelectOption('', '');                                                                                                                                                                                                                                                                                                                          
																																																																																										   
		for (var i =0; i < Math.min(500, searchresult.length); i++)                                                                                                                                                                                                                                                                                                       
		{                                                                                                                                                                                                                                                                                                                                                                 
			var record = nlapiLoadRecord('customrecord_avashippingcodes',searchresult[i].getId());                                                                                                                                                                                                                                                                       
			AVA_DefShipCode.addSelectOption(record.getFieldValue('custrecord_ava_shippingcode'), record.getFieldValue('custrecord_ava_shippingcode'));                                                                                                                                                                                                                   
			AVA_DefMiscCode.addSelectOption(record.getFieldValue('custrecord_ava_shippingcode'), record.getFieldValue('custrecord_ava_shippingcode'));                                                                                                                                                                                                                   
		}                                                                                                                                                                                                                                                                                                                                                                 
	}      
	AVA_LoadConfigData(assistant);
}

function AVA_TaxCalcConfigSetup(assistant)
{
	assistant.addField('ava_accountvalue','text','Account ID ');
	assistant.getField('ava_accountvalue').setDisplayType('hidden');  
	assistant.addField('ava_licensekey','password','License Key ');   
	assistant.getField('ava_licensekey').setMaxLength(30);
	assistant.getField('ava_licensekey').setDisplayType('hidden');  	
	assistant.addField('ava_serviceurl','text','Service Url '); 
	assistant.getField('ava_serviceurl').setDisplayType('hidden');
	
	// Adding Elements inside Second Tab - Tax Calcuation                                                                                                                           
	var AVA_DisableTax 		= assistant.addField('ava_disabletax', 			'checkbox', 	'Disable Tax Calculation', 					null, 'ava_taxcalculation');             
	AVA_DisableTax.setLayoutType('normal','startcol');
	
	var AVA_DisableLine 	= assistant.addField('ava_disableline', 			'checkbox', 	'Disable Tax Calculation at line level', 	null, 'ava_taxcalculation');             
	AVA_DisableLine.setLayoutType('startrow');		
																																										 
	var AVA_EnableLogging		= assistant.addField('ava_enablelogging', 		'checkbox', 	'Enable Logging', 					null, 'ava_taxcalculation');
	AVA_EnableLogging.setLayoutType('normal','startcol');
	
	var AVA_TaxonDemand		= assistant.addField('ava_taxondemand', 			'checkbox', 	'Calculate Tax on Demand', 					null, 'ava_taxcalculation');                                                                                                                           
	
	var AVA_TaxInclude      = assistant.addField('ava_taxinclude',              'checkbox', 	'Tax Included Capability', 					null, 'ava_taxcalculation');
	var AVA_EnableDiscount	= assistant.addField('ava_enablediscount',          'checkbox', 	'Enable Discount Mechanism', 				null, 'ava_taxcalculation');
	AVA_EnableDiscount.setLayoutType('normal','startcol');
	
	var AVA_ShowDiscountMapping	= assistant.addField('ava_discountmapping',		'select',		'Discount Mapping',	null, 'ava_taxcalculation');
	AVA_ShowDiscountMapping.addSelectOption('0','Gross Amount');
	AVA_ShowDiscountMapping.addSelectOption('1','Net Amount');
	AVA_ShowDiscountMapping.setDisplayType('disabled');
	
	var AVA_DiscountTaxCode = assistant.addField('ava_discounttaxcode',		'text',		'Discount Tax Code', null).setDisplayType('disabled');
	AVA_DiscountTaxCode.setDisplayType('disabled');
	var AVA_ShowTaxRate	= assistant.addField('ava_taxrate',		'select',		'Tax Rate',			null, 'ava_taxcalculation');
	AVA_ShowTaxRate.addSelectOption('0','Show Base Rate');
	AVA_ShowTaxRate.addSelectOption('1','Show Net Rate');
	
	var AVA_DeciPlaces	= assistant.addField('ava_decimalplaces',		'select',		'Round-off Tax percentage(Decimal Places)',			null, 'ava_taxcalculation');
	AVA_DeciPlaces.addSelectOption('2','2');
	AVA_DeciPlaces.addSelectOption('3','3');
	AVA_DeciPlaces.addSelectOption('4','4');
	AVA_DeciPlaces.addSelectOption('5','5');

	var AVA_UsePostingPeriod = assistant.addField('ava_usepostingperiod', 		'checkbox',		'Use Posting Date as Transaction Date during Tax calls', null, 'ava_taxcalculation');
	if(nlapiGetContext().getFeature('accountingperiods') != true)
	{
		AVA_UsePostingPeriod.setDisplayType('disabled');
	}
	var AVA_DisableLocationCode = assistant.addField('ava_disableloccode', 		'checkbox',		'Disable Location Code', null, 'ava_taxcalculation');
	var AVA_EnableUpcCode = assistant.addField('ava_enableupccode', 		'checkbox',		'Enable UPC Code as ItemCode', null, 'ava_taxcalculation');
	if(nlapiGetContext().getFeature('barcodes') == false)
	{
		AVA_EnableUpcCode.setDisplayType('disabled');
	}
	
	var AVA_DefTaxcode 		= assistant.addField('ava_deftaxcode', 			'select', 		'Default Tax Code', 						null);     
	AVA_DefTaxcode.setMandatory(true);
	AVA_DefTaxcode.addSelectOption('', 	'');                                                                                                                               
																																												
	var AVA_DefTaxcodeRate 	= assistant.addField('ava_deftaxcoderate', 		'select', 		'Default Tax Code Rate', 					null);     
	AVA_DefTaxcodeRate.addSelectOption('', 	'');                                                                                                                               
	AVA_DefTaxcodeRate.setDisplayType('disabled');                                                                                                                             

	assistant.addFieldGroup("ava_taxsetting", "Abort Save Operation on Tax Calculation Errors");
	assistant.addField('ava_abortbulkbilling', 		'checkbox',		'Bulk Billing', 		null, 'ava_taxsetting');
	assistant.addField('ava_abortuserinterfaces', 	'checkbox', 	'User Interfaces', 		null, 'ava_taxsetting');                                                                                                                                                                                                                                                       	
	assistant.addField('ava_abortwebservices', 		'checkbox',		'Webservices', 			null, 'ava_taxsetting');
	assistant.addField('ava_abortcsvimports', 		'checkbox', 	'CSV Imports', 			null, 'ava_taxsetting').setLayoutType('normal','startcol');
	assistant.addField('ava_abortscheduledscripts', 'checkbox', 	'Scheduled Scripts', 	null, 'ava_taxsetting');                                                                                                                                                                                                                                                       	
	assistant.addField('ava_abortsuitelets', 		'checkbox', 	'Suitelets', 			null, 'ava_taxsetting');                                                                                                                                                                                                                                                       	

	//Address section
	assistant.addFieldGroup("ava_def_ship_from", "Default Ship From");
	
	var AVA_Def_Addressee 	= assistant.addField('ava_def_addressee', 		'text', 	'Addressee', 		null, 'ava_def_ship_from');
	AVA_Def_Addressee.setMandatory(true);
	AVA_Def_Addressee.setMaxLength(50);

	var AVA_Def_Addr1 	= assistant.addField('ava_def_addr1', 				'text', 	'Address 1', 		null, 'ava_def_ship_from');
	AVA_Def_Addr1.setMandatory(true);
	AVA_Def_Addr1.setMaxLength(50);
	
	var AVA_Def_Addr2 	= assistant.addField('ava_def_addr2', 				'text', 	'Address 2', 		null, 'ava_def_ship_from');
	AVA_Def_Addr2.setMandatory(false);
	AVA_Def_Addr2.setMaxLength(50);
	
	var AVA_Def_City  	= assistant.addField('ava_def_city', 				'text', 	'City', 			null, 'ava_def_ship_from');
	AVA_Def_City.setMandatory(true);
	AVA_Def_City.setMaxLength(50);
	
	var AVA_Def_State 	= assistant.addField('ava_def_state', 				'select', 	'State/Province', 	null, 'ava_def_ship_from');	
	AVA_Def_State.setMandatory(true);
	AVA_FetchStates(assistant,'US');

	var AVA_Def_Zip 	= assistant.addField('ava_def_zip', 					'text', 	'Zip', 				null, 'ava_def_ship_from');
	AVA_Def_Zip.setMandatory(true);
	AVA_Def_Zip.setMaxLength(13);
	
	var AVA_Def_Country = assistant.addField('ava_def_country', 				'select', 	'Country',		 	null, 'ava_def_ship_from');
	AVA_Def_Country.setMandatory(true);
	AVA_Def_Country.addSelectOption('', '');
	AVA_Def_Country.addSelectOption('CA', 'Canada');
	AVA_Def_Country.addSelectOption('US', 'United States');
	
	var AVA_Def_Address 	= assistant.addField('ava_def_addrtext', 		'textarea', 'Address',			null, 'ava_def_ship_from');
	AVA_Def_Address.setLayoutType('normal','startcol');
	AVA_Def_Address.setDisplayType('disabled');
	AVA_Def_Address.setDisplaySize(50,7);
	
	var AVA_AddressValidate = assistant.addField('ava_addressvalidate', 		'checkbox', 'Validate Address',			null, 'ava_def_ship_from');
	AVA_AddressValidate.setDefaultValue('F');                                                                                                                           
																																											   
	var TaxCodeID, TaxCodeName, TaxCodeRate;                                                                                                      
	AVA_TaxCodesArray = new Array();                                                                                                                                           
	AVA_TaxCodesTypeArray = new Array();                                                                                                                                       
																																												
	var filter = new Array();                                                                                                                                                  
	filter[0] = new nlobjSearchFilter('isinactive',null,'is','F');                                                                                                             
																																												
	var cols = new Array();                                                                                                                                                    
	cols[0] = new nlobjSearchColumn('itemid');                                                                                                                                 
	cols[1] = new nlobjSearchColumn('rate');                                                                                                                                                                                                                                                          
																																											   
	var searchresult = nlapiSearchRecord('salestaxitem', null, filter, cols);                                                                                                  																																								   
	
	for(var i=0; searchresult!=null && i < searchresult.length; i++)
	{
		TaxCodeName = searchresult[i].getValue('itemid');
		TaxCodeRate = searchresult[i].getValue('rate');
		if(TaxCodeName != '-Not Taxable-')
		{
			AVA_DefTaxcode.addSelectOption(TaxCodeName + '+' + searchresult[i].getId(), TaxCodeName);
			AVA_DefTaxcodeRate.addSelectOption(searchresult[i].getId(), TaxCodeRate);
			CntRecords++;
		}
	}                                                                                                                                                                        
																																											   
	// Retrieve Tax Groups
	var searchresult = nlapiSearchRecord('taxGroup', null, filter, cols);
	for(var i=0; searchresult!=null && i < searchresult.length; i++)
	{
		TaxGroupName = searchresult[i].getValue('itemid');
		TaxGroupRate = searchresult[i].getValue('rate');
		if(TaxGroupName != '-Not Taxable-')
		{
			AVA_DefTaxcode.addSelectOption(TaxGroupName + '+' + searchresult[i].getId(), TaxGroupName);
			AVA_DefTaxcodeRate.addSelectOption(searchresult[i].getId(), TaxGroupRate);
			CntRecords++;
		}
	}                                                                                                                                                                  																																		

	AVA_LoadConfigData(assistant);        
}

function AVA_AddressConfigSetup(assistant)
{
	AVA_AvaTaxConfigSetup(assistant);
	
	assistant.getField('ava_accountvalue').setDisplayType('inline');
	assistant.getField('ava_licensekey').setDefaultValue('****************');
	assistant.getField('ava_licensekey').setDisplayType('inline');  
	assistant.getField('ava_serviceurl').setDisplayType('inline');
	assistant.getField('ava_expirydate').setDisplayType('inline');	
	assistant.getField('ava_enablebatchservice').setLayoutType('normal','startcol');
	assistant.getField('ava_enablebatchservice').setDisplayType('hidden');
	assistant.getField('ava_username').setDisplayType('inline'); 
	assistant.getField('ava_password').setDisplayType('inline');
	if(AVA_Password != null && AVA_Password.length > 0)
	{
		assistant.getField('ava_password').setDefaultValue('********');
	}
	else
	{
		assistant.getField('ava_password').setDefaultValue('');
	}

	assistant.addFieldGroup("ava_addressvalidation", "Address Validation");

	// Adding Elements inside Third Tab - Address Validation                                                                                                                                                                                                                                                                                                                                                 
	var AVA_DisableAddValidation = assistant.addField('ava_disableaddvalidation', 	'checkbox', 	'Disable Address Validation', 		null, 'ava_addressvalidation');                                                                                                                                                                                                                                        
	var AVA_EnableAddValonTran = assistant.addField('ava_enableaddvalontran', 	'checkbox', 	'Enable Address Validation on Transaction(s)', 	null, 'ava_addressvalidation');
	var AVA_UpperCaseAddress = assistant.addField('ava_uppercaseaddress', 		'checkbox', 	'Result in Upper Case', 					null, 'ava_addressvalidation');                                                                                                                                                                                                                                   
	AVA_UpperCaseAddress.setLayoutType('normal','startcol');
	var AVA_AddBatchProcessing = assistant.addField('ava_addbatchprocessing', 		'select', 	'Batch Processing', 					null, 'ava_addressvalidation');                                                                                                                                                                                                                                   
	AVA_AddBatchProcessing.addSelectOption('manual', 'Manual');                                                                                                                                                                                                                                                                                                                                              
	AVA_AddBatchProcessing.addSelectOption('automatic', 'Automatic');                                                                                                                                                                                                                                                                                                                                        
	AVA_AddBatchProcessing.setHelpText('Manual: Once the addresses are validated, user would need to select all the addresses that he want to get updated in the respective customer or location record(s) manually. \n Automatic: In this case, as soon as the addresses get validated, it will get updated in the respective customer or location record(s) automatically. ', false);
	
	AVA_LoadConfigData(assistant);
}

function AVA_AboutAvaTaxConfig(assistant)
{
	var firstStep = assistant.getStep("ava_credentials");
	
	AVA_AccountValue = firstStep.getFieldValue('ava_accountvalue');
	AVA_LicenseKey = firstStep.getFieldValue('ava_licensekey');
	AVA_ServiceUrl = firstStep.getFieldValue('ava_serviceurl');
	AVA_ExpiryDate = firstStep.getFieldValue('ava_expirydate');
	
	assistant.addFieldGroup("ava_about", "About Avalara");

	// Adding Elements inside Fourth Tab - About AvaTax
	var dYear = new Date();
	var AVA_Copyright 		= assistant.addField('ava_copyright', 			'help', 	'Copyright &copy ' + dYear.getFullYear() + ' Avalara, Inc. All Rights Reserved.', 		null, 'ava_about');
	
	var AVA_Ver 			= assistant.addField('ava_version', 				'text', 	'Version', 													null, 'ava_about');
	AVA_Ver.setDisplayType('inline');
	AVA_Ver.setDefaultValue(AVA_ClientAtt);
		
	var AVA_SerVersion 			= assistant.addField('ava_serversion', 				'text', 	'AvaTax Version', 									null, 'ava_about');
	AVA_SerVersion.setDisplayType('inline');
	AVA_SerVersion.setDefaultValue(AVA_Ping());
	
	var AVA_Email 			= assistant.addField('ava_email', 				'email', 	'Email', 													null, 'ava_about');
	AVA_Email.setDisplayType('inline');
	AVA_Email.setDefaultValue('support@avalara.com');
	
	var AVA_Phone 			= assistant.addField('ava_phone', 				'phone', 	'Phone', 													null, 'ava_about');
	AVA_Phone.setDisplayType('inline');
	AVA_Phone.setDefaultValue('(877)-780-4848');
	
	var AVA_Web				= assistant.addField('ava_web', 					'url', 		'Website', 													null, 'ava_about');
	AVA_Web.setDisplayType('inline');
	AVA_Web.setDefaultValue('http://www.avalara.com/');
	AVA_Web.setLayoutType('normal','startcol');

	var AVA_AdminConsole	= assistant.addField('ava_adminconsole', 		'url', 		'AvaTax Connect DashBoard', 								null, 'ava_about');
	AVA_AdminConsole.setDisplayType('inline');
	AVA_AdminConsole.setDefaultValue((AVA_ServiceUrl.search('development') != -1) ? 'https://admin-development.avalara.net/login.aspx' : 'https://admin-avatax.avalara.net/login.aspx' );
	
	var AVA_UserCenter		= assistant.addField('ava_usercenter', 			'url', 			'Avalara User Center', 									null, 'ava_about');
	AVA_UserCenter.setDisplayType('inline');
	AVA_UserCenter.setDefaultValue('http://www.avalara.com/index.cfm/fa/usercenter');

}

function AVA_ConfigTestConnection()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
{                
	AVA_ServiceTypes = '';
	var AVA_AccountValue = nlapiGetFieldValue('ava_accountvalue');
	var AVA_LicenseKey = nlapiGetFieldValue('ava_licensekey');
	var AVA_URL = nlapiGetFieldValue('ava_serviceurl');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
	if ((AVA_AccountValue.length != 0) && (AVA_LicenseKey.length != 0) && (AVA_URL.length != 0))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
	{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
		var security = AVA_BuildSecurity(AVA_AccountValue, AVA_LicenseKey);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
		var headers = AVA_Header(security);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
		var body = AVA_IsAuthorizedBody();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
		var soapPayload = AVA_BuildEnvelope(headers + body);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
		var soapHead = new Array();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
		soapHead['Content-Type'] = 'text/xml';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
		soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/IsAuthorized';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
		                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
		try                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
		{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
			var AVA_Date;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
			var svcTypeUrl;	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
	        var AVA_Expirydate = null;
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
			for(var svc = 1; svc <= 2; svc++)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
			{			                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
				switch(svc)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
				{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
					case 1: svcTypeUrl = '/tax/taxsvc.asmx';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
							break;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
					//case 2: svcTypeUrl = '/address/addresssvc.asmx';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
							//break;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
					default: svcTypeUrl = '/avacert2/avacert2svc.asmx';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
							break;				                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
				}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
				
				response = nlapiRequestURL(AVA_URL + svcTypeUrl, soapPayload, soapHead);  

				if (response.getCode() == 200)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
				{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
					var soapText = response.getBody();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
					var soapXML = nlapiStringToXML(soapText);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
			 		                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
					var IsAuthorizedResult = nlapiSelectNode(soapXML, "//*[name()='IsAuthorizedResult']");                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
				                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
					var ResultCode = nlapiSelectValue(IsAuthorizedResult, "//*[name()='ResultCode']");   
					
					if (ResultCode == 'Success')                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
					{                                                                  
						AVA_Expirydate = nlapiSelectValue(IsAuthorizedResult, "//*[name()='Expires']");                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
						AVA_Date = AVA_DateFormat(nlapiGetFieldValue('ava_globaldateformat'), AVA_Expirydate);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           						
						nlapiSetFieldValue('ava_expirydate', AVA_Date);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
						//AVA_ServiceTypes += (svc == 1) ? 'TaxSvc' : ((svc == 2) ? ', AddressSvc' : ', AvaCertSvc');
						AVA_ServiceTypes += (svc == 1) ? 'TaxSvc, AddressSvc, ' : 'AvaCert2Svc';
					}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
				}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
			}  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
			if(AVA_Date != null && AVA_Date.length > 0)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
			{             
				if(AVA_ServiceTypes != null && AVA_ServiceTypes.length > 0)
				{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
					if(nlapiGetFieldValue('ava_enablebatchservice') == 'T')
					{
						if(AVA_BatchServiceTestConnection() == false)
						{
							return false;
						}
					}
					alert("License keys validated successfully. License Keys are valid till " + AVA_Date);   
					return true;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
				}
				else
				{
					alert("No services enabled for this account. Please contact Avalara Support.");
					return false; 
				}
			}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
			else                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
			{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
				alert("Enter the correct Account Value and License key and URL provided during registration.");  
				return false;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
			}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
		}		                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
		catch(err)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
		{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
			alert("Please contact Avalara Support on (877)-780-4848");          
			return false;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
		}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
	}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
	else                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
	{      
		alert("Not all required fields have been entered");
		if(nlapiGetFieldValue('ava_accountvalue').length == 0)
		{
			document.forms['main_form'].ava_accountvalue.focus();
		}
		else if(nlapiGetFieldValue('ava_licensekey').length == 0)
		{
			document.forms['main_form'].ava_licensekey.focus();
		}
		else if(nlapiGetFieldValue('ava_serviceurl').length == 0)
		{
			document.forms['main_form'].ava_serviceurl.focus();
		}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
          
          return false;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
	}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
}    
	
function AVA_FilterStates(Country)
{
	AVA_GetStatesArray(Country);
	var dropfld = document.forms['main_form'].elements['ava_def_state'];
	dropfld = getDropdown(dropfld);
	dropfld.deleteAllOptions();
	
	for(var i=0; i<AVA_StatesArray.length ; i++)
	{
		dropfld.addOption(AVA_StatesArray[i][1], AVA_StatesArray[i][0], i);
	}
}	

function AVA_GetStatesArray(Country)
{
	AVA_StatesArray = new Array();
	
	if(Country == 'US')
	{
		AVA_StatesArray[0] = new Array();
		AVA_StatesArray[0][0] = ''; 
		AVA_StatesArray[0][1] = '';
		AVA_StatesArray[1] = new Array();
		AVA_StatesArray[1][0] = 'AK'; 
		AVA_StatesArray[1][1] = 'Alaska';
		AVA_StatesArray[2] = new Array();
		AVA_StatesArray[2][0] = 'AL'; 
		AVA_StatesArray[2][1] = 'Alabama';
		AVA_StatesArray[3] = new Array();
		AVA_StatesArray[3][0] = 'AR'; 
		AVA_StatesArray[3][1] = 'Arkansas';
		AVA_StatesArray[4] = new Array();
		AVA_StatesArray[4][0] = 'AS'; 
		AVA_StatesArray[4][1] = 'American Samoa';
		AVA_StatesArray[5] = new Array();
		AVA_StatesArray[5][0] = 'AZ'; 
		AVA_StatesArray[5][1] = 'Arizona';
		AVA_StatesArray[6] = new Array();
		AVA_StatesArray[6][0] = 'CA'; 
		AVA_StatesArray[6][1] = 'California';
		AVA_StatesArray[7] = new Array();
		AVA_StatesArray[7][0] = 'CO'; 
		AVA_StatesArray[7][1] = 'Colorado';
		AVA_StatesArray[8] = new Array();
		AVA_StatesArray[8][0] = 'CT'; 
		AVA_StatesArray[8][1] = 'Connecticut';
		AVA_StatesArray[9] = new Array();
		AVA_StatesArray[9][0] = 'DC'; 
		AVA_StatesArray[9][1] = 'District Of Columbia';
		AVA_StatesArray[10] = new Array();
		AVA_StatesArray[10][0] = 'DE'; 
		AVA_StatesArray[10][1] = 'Delaware';
		AVA_StatesArray[11] = new Array();
		AVA_StatesArray[11][0] = 'FL'; 
		AVA_StatesArray[11][1] = 'Florida';
		AVA_StatesArray[12] = new Array();
		AVA_StatesArray[12][0] = 'FM'; 
		AVA_StatesArray[12][1] = 'Federated-Micronesia';
		AVA_StatesArray[13] = new Array();
		AVA_StatesArray[13][0] = 'GA'; 
		AVA_StatesArray[13][1] = 'Georgia';
		AVA_StatesArray[14] = new Array();
		AVA_StatesArray[14][0] = 'GU'; 
		AVA_StatesArray[14][1] = 'Guam';
		AVA_StatesArray[15] = new Array();
		AVA_StatesArray[15][0] = 'HI'; 
		AVA_StatesArray[15][1] = 'Hawaii';
		AVA_StatesArray[16] = new Array();
		AVA_StatesArray[16][0] = 'IA'; 
		AVA_StatesArray[16][1] = 'Iowa';
		AVA_StatesArray[17] = new Array();
		AVA_StatesArray[17][0] = 'ID'; 
		AVA_StatesArray[17][1] = 'Idaho';
		AVA_StatesArray[18] = new Array();
		AVA_StatesArray[18][0] = 'IL'; 
		AVA_StatesArray[18][1] = 'Illinois';
		AVA_StatesArray[19] = new Array();
		AVA_StatesArray[19][0] = 'IN'; 
		AVA_StatesArray[19][1] = 'Indiana';
		AVA_StatesArray[20] = new Array();
		AVA_StatesArray[20][0] = 'KS'; 
		AVA_StatesArray[20][1] = 'Kansas';
		AVA_StatesArray[21] = new Array();
		AVA_StatesArray[21][0] = 'KY'; 
		AVA_StatesArray[21][1] = 'Kentucky';
		AVA_StatesArray[22] = new Array();
		AVA_StatesArray[22][0] = 'LA'; 
		AVA_StatesArray[22][1] = 'Louisiana';
		AVA_StatesArray[23] = new Array();
		AVA_StatesArray[23][0] = 'MA'; 
		AVA_StatesArray[23][1] = 'Massachusetts';
		AVA_StatesArray[24] = new Array();
		AVA_StatesArray[24][0] = 'MD'; 
		AVA_StatesArray[24][1] = 'Maryland';
		AVA_StatesArray[25] = new Array();
		AVA_StatesArray[25][0] = 'ME'; 
		AVA_StatesArray[25][1] = 'Maine';
		AVA_StatesArray[26] = new Array();
		AVA_StatesArray[26][0] = 'MH'; 
		AVA_StatesArray[26][1] = 'Marshall Islands';
		AVA_StatesArray[27] = new Array();
		AVA_StatesArray[27][0] = 'MI'; 
		AVA_StatesArray[27][1] = 'Michigan';
		AVA_StatesArray[28] = new Array();
		AVA_StatesArray[28][0] = 'MN'; 
		AVA_StatesArray[28][1] = 'Minnesota';
		AVA_StatesArray[29] = new Array();
		AVA_StatesArray[29][0] = 'MO'; 
		AVA_StatesArray[29][1] = 'Missouri';
		AVA_StatesArray[30] = new Array();
		AVA_StatesArray[30][0] = 'MP'; 
		AVA_StatesArray[30][1] = 'N. Mariana Islands';
		AVA_StatesArray[31] = new Array();
		AVA_StatesArray[31][0] = 'MS'; 
		AVA_StatesArray[31][1] = 'Mississippi';
		AVA_StatesArray[32] = new Array();
		AVA_StatesArray[32][0] = 'MT'; 
		AVA_StatesArray[32][1] = 'Montana';
		AVA_StatesArray[33] = new Array();
		AVA_StatesArray[33][0] = 'NC'; 
		AVA_StatesArray[33][1] = 'North Carolina';
		AVA_StatesArray[34] = new Array();
		AVA_StatesArray[34][0] = 'ND'; 
		AVA_StatesArray[34][1] = 'North Dakota';
		AVA_StatesArray[35] = new Array();
		AVA_StatesArray[35][0] = 'NE'; 
		AVA_StatesArray[35][1] = 'Nebraska';
		AVA_StatesArray[36] = new Array();
		AVA_StatesArray[36][0] = 'NH'; 
		AVA_StatesArray[36][1] = 'New Hampshire';
		AVA_StatesArray[37] = new Array();
		AVA_StatesArray[37][0] = 'NJ'; 
		AVA_StatesArray[37][1] = 'New Jersey';
		AVA_StatesArray[38] = new Array();
		AVA_StatesArray[38][0] = 'NM'; 
		AVA_StatesArray[38][1] = 'New Mexico';
		AVA_StatesArray[39] = new Array();
		AVA_StatesArray[39][0] = 'NV'; 
		AVA_StatesArray[39][1] = 'Nevada';
		AVA_StatesArray[40] = new Array();
		AVA_StatesArray[40][0] = 'NY'; 
		AVA_StatesArray[40][1] = 'New York';
		AVA_StatesArray[41] = new Array();
		AVA_StatesArray[41][0] = 'OH'; 
		AVA_StatesArray[41][1] = 'Ohio';
		AVA_StatesArray[42] = new Array();
		AVA_StatesArray[42][0] = 'OK'; 
		AVA_StatesArray[42][1] = 'Oklahoma';
		AVA_StatesArray[43] = new Array();
		AVA_StatesArray[43][0] = 'OR'; 
		AVA_StatesArray[43][1] = 'Oregon';
		AVA_StatesArray[44] = new Array();
		AVA_StatesArray[44][0] = 'PA'; 
		AVA_StatesArray[44][1] = 'Pennsylvania';
		AVA_StatesArray[45] = new Array();
		AVA_StatesArray[45][0] = 'PR'; 
		AVA_StatesArray[45][1] = 'Puerto Rico';
		AVA_StatesArray[46] = new Array();
		AVA_StatesArray[46][0] = 'PW'; 
		AVA_StatesArray[46][1] = 'Palau';
		AVA_StatesArray[47] = new Array();
		AVA_StatesArray[47][0] = 'RI'; 
		AVA_StatesArray[47][1] = 'Rhode Island';
		AVA_StatesArray[48] = new Array();
		AVA_StatesArray[48][0] = 'SC'; 
		AVA_StatesArray[48][1] = 'South Carolina';
		AVA_StatesArray[49] = new Array();
		AVA_StatesArray[49][0] = 'SD'; 
		AVA_StatesArray[49][1] = 'South Dakota';
		AVA_StatesArray[50] = new Array();
		AVA_StatesArray[50][0] = 'TN'; 
		AVA_StatesArray[50][1] = 'Tennessee';
		AVA_StatesArray[51] = new Array();
		AVA_StatesArray[51][0] = 'TX'; 
		AVA_StatesArray[51][1] = 'Texas';
		AVA_StatesArray[52] = new Array();
		AVA_StatesArray[52][0] = 'UM'; 
		AVA_StatesArray[52][1] = 'Us Minor Outlying Islands';
		AVA_StatesArray[53] = new Array();
		AVA_StatesArray[53][0] = 'UT'; 
		AVA_StatesArray[53][1] = 'Utah';
		AVA_StatesArray[54] = new Array();
		AVA_StatesArray[54][0] = 'VA'; 
		AVA_StatesArray[54][1] = 'Virginia';
		AVA_StatesArray[55] = new Array();
		AVA_StatesArray[55][0] = 'VI'; 
		AVA_StatesArray[55][1] = 'Virgin Islands';
		AVA_StatesArray[56] = new Array();
		AVA_StatesArray[56][0] = 'VT'; 
		AVA_StatesArray[56][1] = 'Vermont';
		AVA_StatesArray[57] = new Array();
		AVA_StatesArray[57][0] = 'WA'; 
		AVA_StatesArray[57][1] = 'Washington';
		AVA_StatesArray[58] = new Array();
		AVA_StatesArray[58][0] = 'WI'; 
		AVA_StatesArray[58][1] = 'Wisconsin';
		AVA_StatesArray[59] = new Array();
		AVA_StatesArray[59][0] = 'WV'; 
		AVA_StatesArray[59][1] = 'West Virginia';
		AVA_StatesArray[60] = new Array();
		AVA_StatesArray[60][0] = 'WY'; 
		AVA_StatesArray[60][1] = 'Wyoming';
		AVA_StatesArray[61] = new Array();
		AVA_StatesArray[61][0] = 'AE'; 
		AVA_StatesArray[61][1] = 'Armed Forces Europe';
		AVA_StatesArray[62] = new Array();
		AVA_StatesArray[62][0] = 'AA'; 
		AVA_StatesArray[62][1] = 'Armed Forces The Americas';
		AVA_StatesArray[63] = new Array();
		AVA_StatesArray[63][0] = 'AP'; 
		AVA_StatesArray[63][1] = 'Armed Forces Pacific';
		
 	}
 	else if(Country == 'CA')
 	{
 		AVA_StatesArray[0] = new Array();
		AVA_StatesArray[0][0] = ''; 
		AVA_StatesArray[0][1] = '';
		AVA_StatesArray[1] = new Array();
		AVA_StatesArray[1][0] = 'AB'; 
		AVA_StatesArray[1][1] = 'Alberta';
		AVA_StatesArray[2] = new Array();
		AVA_StatesArray[2][0] = 'BC'; 
		AVA_StatesArray[2][1] = 'British Columbia';
		AVA_StatesArray[3] = new Array();
		AVA_StatesArray[3][0] = 'MB'; 
		AVA_StatesArray[3][1] = 'Manitoba';
		AVA_StatesArray[4] = new Array();
		AVA_StatesArray[4][0] = 'NL'; 
		AVA_StatesArray[4][1] = 'Newfoundland And Labrador';
		AVA_StatesArray[5] = new Array();
		AVA_StatesArray[5][0] = 'NB'; 
		AVA_StatesArray[5][1] = 'New Brunswick';
		AVA_StatesArray[6] = new Array();
		AVA_StatesArray[6][0] = 'NT'; 
		AVA_StatesArray[6][1] = 'Northwest Territories';
		AVA_StatesArray[7] = new Array();
		AVA_StatesArray[7][0] = 'NS'; 
		AVA_StatesArray[7][1] = 'Nova Scotia';
		AVA_StatesArray[8] = new Array();
		AVA_StatesArray[8][0] = 'NU'; 
		AVA_StatesArray[8][1] = 'Nunavut';
		AVA_StatesArray[9] = new Array();
		AVA_StatesArray[9][0] = 'ON'; 
		AVA_StatesArray[9][1] = 'Ontario';
		AVA_StatesArray[10] = new Array();
		AVA_StatesArray[10][0] = 'PE'; 
		AVA_StatesArray[10][1] = 'Prince Edward Island';
		AVA_StatesArray[11] = new Array();
		AVA_StatesArray[11][0] = 'QC'; 
		AVA_StatesArray[11][1] = 'Quebec';
		AVA_StatesArray[12] = new Array();
		AVA_StatesArray[12][0] = 'SK'; 
		AVA_StatesArray[12][1] = 'Saskatchewan';
		AVA_StatesArray[13] = new Array();
		AVA_StatesArray[13][0] = 'YT'; 
		AVA_StatesArray[13][1] = 'Yukon Territory';
 		
 	}
}
	
function AVA_FetchStates(form,Country)
{
	AVA_GetStatesArray(Country);
	var AVA_Def_State = form.getField('ava_def_state');
	
	for(var i=0; i<AVA_StatesArray.length; i++)
	{
		AVA_Def_State.addSelectOption(AVA_StatesArray[i][0],AVA_StatesArray[i][1]);
	}
}

function AVA_ValidateShipFromAddressBody()
{
 	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<Validate xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<ValidateRequest>\n';
 				soap += '\t\t\t\t<Address>\n';
 					soap += '\t\t\t\t\t<AddressCode>1</AddressCode>\n';
 					soap += '\t\t\t\t\t<Line1><![CDATA[' + nlapiGetFieldValue('ava_def_addr1') + ']]></Line1>\n';
 					soap += '\t\t\t\t\t<Line2><![CDATA[' + nlapiGetFieldValue('ava_def_addr2') + ']]></Line2>\n';
 					soap += '\t\t\t\t\t<Line3/>\n';
 					soap += '\t\t\t\t\t<City><![CDATA[' + nlapiGetFieldValue('ava_def_city') + ']]></City>\n';
 					soap += '\t\t\t\t\t<Region><![CDATA[' + nlapiGetFieldValue('ava_def_state') + ']]></Region>\n';
 					soap += '\t\t\t\t\t<PostalCode><![CDATA[' + nlapiGetFieldValue('ava_def_zip') + ']]></PostalCode>\n';
 					soap += '\t\t\t\t\t<Country><![CDATA[' + nlapiGetFieldValue('ava_def_country') + ']]></Country>\n';
 				soap += '\t\t\t\t</Address>\n';	
 				soap += '\t\t\t\t<TextCase>Default</TextCase>\n';
 				soap += '\t\t\t\t<Coordinates>false</Coordinates>\n';
 			soap += '\t\t\t</ValidateRequest>\n';
 		soap += '\t\t</Validate>\n';
 	soap += '\t</soap:Body>\n';
 	
 	return soap;
}

function AVA_BatchServiceTestConnection()
{
	if(nlapiGetFieldValue('ava_username') != null && nlapiGetFieldValue('ava_username').length > 0 && nlapiGetFieldValue('ava_password') != null && nlapiGetFieldValue('ava_password').length > 0)
	{
		var security = AVA_BuildSecurity(nlapiGetFieldValue('ava_username'), nlapiGetFieldValue('ava_password'));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
		var headers = AVA_Header(security);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
		var body = AVA_IsAuthorizedBody();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
		var soapPayload = AVA_BuildEnvelope(headers + body);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
																																																																																																																																																																																																																																																																																																																																																																																									   
		var soapHead = new Array();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
		soapHead['Content-Type'] = 'text/xml';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
		soapHead['SOAPAction'] = 'http://avatax.avalara.com/services/IsAuthorized';
		
		try
		{
			var response = nlapiRequestURL(nlapiGetFieldValue('ava_serviceurl') + '/batch/batchsvc.asmx', soapPayload, soapHead);
			if(response.getCode() == 200)
			{
				var soapText = response.getBody();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
				var soapXML = nlapiStringToXML(soapText);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
																																																																																																																																																																																																																																																																																																																																																																																								
				var IsAuthorizedResult = nlapiSelectNode(soapXML, "//*[name()='IsAuthorizedResult']");                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
																																																																																																																																																																																																																																																																																																																																																																																								 
				var ResultCode = nlapiSelectValue(IsAuthorizedResult, "//*[name()='ResultCode']");   
				
				if (ResultCode == 'Success')                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
				{
					return true;
				}
				else
				{
					alert(nlapiSelectValue(IsAuthorizedResult, "//*[name()='Summary']"));  
					return false;
				}
			}
			else
			{
				alert("Enter the correct Username and Password.");  
				return false;
			}
		}
		catch(err)
		{
			alert("Please contact Avalara Support on (877)-780-4848");          
			return false;
		}
	}
	else
	{
		alert("Not all required fields have been entered");
		if(nlapiGetFieldValue('ava_username').length == 0)
		{
			document.forms['main_form'].ava_username.focus();
		}
		else if(nlapiGetFieldValue('ava_password').length == 0)
		{
			document.forms['main_form'].ava_password.focus();
		}
		
		return false;
	}
}

function AVA_EncryptCredentials(toversion, fromversion)
{
	var searchresult = nlapiSearchRecord('customrecord_avaconfig', null, null, null);
	if(searchresult != null)
	{
		for(var i = 0; searchresult != null && i < searchresult.length; i++)
		{
			var record = nlapiLoadRecord('customrecord_avaconfig', searchresult[i].getId());
			var licensekey = record.getFieldValue('custrecord_ava_licensekey');
			if(licensekey != null && licensekey.length <= 16)
			{
				record.setFieldValue('custrecord_ava_licensekey', nlapiEncrypt(licensekey, 'base64'));
			}
			var id = nlapiSubmitRecord(record, false);
		}
	}
	
	var filter = new Array();
	filter[0] = new nlobjSearchFilter('name', null, 'is', 'AVA_ExemptionCertificate');
	
	var column = new Array();
 	column[0] = new nlobjSearchColumn('internalid'); 

	var searchresult1 = nlapiSearchRecord('folder', null, filter, column);

	if(searchresult1 == null)
	{
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('name', null, 'is', 'Bundle 1894');
		
		var columns = new Array();
	 	columns[0] = new nlobjSearchColumn('internalid'); 

		var searchresult2 = nlapiSearchRecord('folder', null, filters, columns);
		var folder = nlapiCreateRecord('folder');
		folder.setFieldValue('parent',searchresult2[0].getValue('internalid'));
		folder.setFieldValue('name','AVA_ExemptionCertificate');
		var FolderId = nlapiSubmitRecord(folder);
	}
}

function AVA_BundleAfterInstall(toversion)
{
	var filter = new Array();
	filter[0] = new nlobjSearchFilter('name', null, 'is', 'AVA_ExemptionCertificate');
	
	var column = new Array();
 	column[0] = new nlobjSearchColumn('internalid'); 

	var searchresult1 = nlapiSearchRecord('folder', null, filter, column);
	
	if(searchresult1 == null)
	{
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('name', null, 'is', 'Bundle 1894');
		
		var columns = new Array();
	 	columns[0] = new nlobjSearchColumn('internalid'); 
	
		var searchresult = nlapiSearchRecord('folder', null, filters, columns);
		var folder = nlapiCreateRecord('folder');
		folder.setFieldValue('parent',searchresult[0].getValue('internalid'));
		folder.setFieldValue('name','AVA_ExemptionCertificate');
		var FolderId = nlapiSubmitRecord(folder);
	}
}