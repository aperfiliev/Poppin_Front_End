/******************************************************************************************************
	Script Name - 	AVA_AddressValidation.js
	Company - 		Avalara Technologies Pvt Ltd.
******************************************************************************************************/

{/*************************************GLOBAL VARIABLES*************************************************/
	
	var validatedLine1,	validatedLine2, validatedLine3, validatedCity, validatedRegion, validatedPostalCode, validatedCounty, validatedCountry;
	var MinUsage = 300, detailRecIdArr = new Array(), AVA_ListLimit = 10;
	var totalRec = 0, valCorrect = 0, valFail = 0, lastProcessedId;
}


{/********************************SUITELET FUNCTIONS****************************************************/


/********************************************************************************************************
Address Validation Assistant
**********************************************************************************************************/

function AVA_AddressValidationAssistant(request, response)
{
	if(AVA_CheckService('AddressSvc') == 0 && AVA_CheckSecurity( 16 ) == 0)
	{
	
	    /**
	
	    * Implementation of a simple setup assistant with support for multiple setup steps and sequential or ad-hoc step traversal.
	
	    * State is managed throughout the life of the user's session but is not persisted across sessions. Doing so would
	
	    * require writing this information to a custom record.
	
	    *
	
	    * @param request request object
	
	    * @param response response object
	
	    */
	
	    	/* first create assistant object and define its steps. */
		
	    	var assistant = nlapiCreateAssistant("Address Validation Assistant", false);
	
	    	assistant.setOrdered( true );
	
	    	nlapiLogExecution( 'DEBUG', "Create Assistant ", "Assistant Created" );     
	
	    	assistant.addStep('ava_validationtype', 'Select Type').setHelpText("Select the type of <b>record</b> below, for which you want to perform the address validation.");
	
	    	assistant.addStep('ava_filtercriteria', 'Set Data Filter').setHelpText("Select the option to filter the records below.");   
		
	    	assistant.addStep('ava_summary', 'Summary Information').setHelpText("Summary of your Assistant Work.<br> You have made the following choices to run Address Validation process.");
	
	
	    	/* handle page load (GET) requests. */
	
	    	if (request.getMethod() == 'GET')
	    	{
	    				
			assistant.setScript('customscript_avaaddressvalidation_client');
			
	    		/*.Check whether the assistant is finished */
	
	    		if ( !assistant.isFinished() )
	    		{
	    			
	    			// If initial step, set the Splash page and set the intial step
	
	    			 if ( assistant.getCurrentStep() == null )
	                {
	
	    				assistant.setCurrentStep(assistant.getStep( "ava_validationtype") );     
	
	    				assistant.setSplash("Welcome to the AvaTax Address Validation Assistant!", "<b>What you'll be doing</b><br>The AvaTax Address Validation Setup Assistant will walk you through the process of configuring your NetSuite account to run Address validation utility..", "<b>When you finish</b><br>your account will be ready to run scheduled scripts to validate addresses as per the settings you made.");
	
	    			 } 
	
	    			var step = assistant.getCurrentStep();
	     
	
	    			// Build the page for a step by adding fields, field groups, and sublists to the assistant
	
	    			if (step.getName() == 'ava_validationtype')
	    			{
	    				var lastStep = null;
	    				try
	    				{
	    					lastStep = assistant.getLastStep();
	    					nlapiLogExecution('Debug','Lst Step Record Type', lastStep.getFieldValue('ava_recordtype'));
	    				}
	    				catch(err)
	    				{    					
	    				}
	    				
	    				assistant.addFieldGroup('ava_recordtype', 'What type of record you want to run the address validation against?');
					
	    				assistant.addField('ava_recordtype', 'radio', 'Location', 'l', 'recordtype');
	
	    				assistant.addField('ava_recordtype', 'radio', 'Customer', 'c', 'recordtype'); 
	    				
	    				assistant.getField( 'ava_recordtype', 's' ).setDefaultValue( (lastStep != null && lastStep.getFieldValue('ava_recordtype') != null) ? lastStep.getFieldValue('ava_recordtype') : 'l' );
	
	    			}
	    			else if (step.getName() == 'ava_filtercriteria')
	    			{
	    				
	    				var lastStep = assistant.getLastStep();
	    				
	    				assistant.addField('ava_recordtype','text', 'Record Type');
	    				assistant.getField('ava_recordtype').setDefaultValue(lastStep.getFieldValue('ava_recordtype'));
	    				assistant.getField('ava_recordtype').setDisplayType('hidden');
	    				
	    					
	    				if (lastStep.getFieldValue('ava_recordtype') == 'l')// If record Type selected in last step was Location
	    				{
	    					assistant.addField('ava_loctypelabel','label','Type of Location(s) to be validated ')
	
	    					assistant.addField('ava_loctype', 'radio','All Locations','a');	    					
		    				
		    				assistant.addField('ava_loctype', 'radio','Specific Location(s)', 'p');
	
		    				assistant.getField('ava_loctype').setDefaultValue( 'a' );
	    					
	    					
	    					assistant.addField('ava_separator','help','<hr><br>').setLayoutType('startrow');
	    					
	 					    					
	    					assistant.addField('ava_locationlist','multiselect','Select Location(s) ', 'location').setLayoutType('startrow');
	    					
	//    					assistant.getField('ava_locationlist').setDisplayType('disabled');
	    					
	    					assistant.addField('ava_subloc','checkbox','Include Sub-Location(s) ').setLayoutType('startrow');
	    					
	//    					assistant.getField('ava_subloc').setDisplayType('disabled');
	    					
	    					assistant.addField('ava_activechkbox','checkbox','Only Active Records ').setLayoutType('startrow');	 
	    					
	    					assistant.getField('ava_activechkbox').setDefaultValue('T');
	    					
	    					assistant.addField('ava_separator1','help','<hr><br>').setLayoutType('startrow');
	    					
	    				}   				
	    				else if (lastStep.getFieldValue('ava_recordtype') == 'c')// If record Type selected in last step was Customer
	    				{
	    					assistant.addField('ava_typelabel','label','Type ').setLayoutType('startrow');
	
		    				assistant.addField('ava_type', 'radio','Lead', 'l').setLayoutType('midrow');
		
		    				assistant.addField('ava_type', 'radio','Prospect','p').setLayoutType('midrow');
		
		    				assistant.addField('ava_type', 'radio','Customer','c').setLayoutType('endrow');
		
		    				assistant.getField( 'ava_type', 'c' ).setDefaultValue( 'c' );
		    				
		    				assistant.addField('ava_separator','help','<br>');
		    				
	    					
	    					assistant.addField('ava_custtypelabel','label','What type of customers? ').setLayoutType('startrow');
	
		    				assistant.addField('ava_custtype', 'radio','Individual', 'i').setLayoutType('midrow');
		
		    				assistant.addField('ava_custtype', 'radio','Company','c').setLayoutType('midrow');
		
		    				assistant.addField('ava_custtype', 'radio','Both','b').setLayoutType('endrow');
		
		    				assistant.getField( 'ava_custtype', 'b' ).setDefaultValue( 'b' );
		    				
		    				assistant.addField('ava_separator1','help','<br>');
	    					
	    					
	    					assistant.addFieldGroup("ava_addfilters", "Additional Filters");	    				
	    						    				
	    						    				
		    				assistant.addField('ava_daterangelabel','label','Date Created ', null,'ava_addfilters').setLayoutType('startrow');
		
		    				assistant.addField('ava_startdate', 'date','Start Date', null,'ava_addfilters').setLayoutType('startrow');
						
		    				assistant.addField('ava_enddate', 'date','End Date', null,'ava_addfilters').setLayoutType('startrow');
	
		    				
		    				assistant.addField('ava_addresstypelabel','label','<br>Address Type ', null, 'ava_addfilters').setLayoutType('startrow');
	
		    				assistant.addField('ava_addresstype', 'radio','All', 'a', 'ava_addfilters');
		
		    				assistant.addField('ava_addresstype', 'radio','Default Billing','b', 'ava_addfilters');
		
		    				assistant.addField('ava_addresstype', 'radio','Default Shipping','s','ava_addfilters');
		    				
		    				assistant.addField('ava_addresstype', 'radio','Default Billing & Shipping','d','ava_addfilters');
		
		    				assistant.getField('ava_addresstype', 'a' ).setDefaultValue( 'a' );
		    					    				
		    				
		    				assistant.addField('ava_separator2','help','<br>', null, 'ava_addfilters');
		    				
		    				assistant.addField('ava_activechkbox','checkbox','Only Active Records ', null,'ava_addfilters').setLayoutType('startrow');	 
		    				
		    				assistant.getField('ava_activechkbox').setDefaultValue('T');
	    					
	    				}     				
	    				  				
	    			}
	    			else if (step.getName() == 'ava_summary')
	    			{  				
	    				
	    				// get previously submitted steps
	
	    				var vtStep = assistant.getStep( 'ava_validationtype' );
	
	    				var fcStep = assistant.getStep( 'ava_filtercriteria' );
	    				
	
	    				assistant.addFieldGroup("ava_validationsummary", "Address Validation Process Summary");
	
	    				assistant.addField('ava_recordtype1','label','What type of record you want to run Address Validation for?  ', null,'validationsummary' ).setLayoutType('startrow');
					
					
					var recordType = vtStep.getFieldValue( 'ava_recordtype' );
					
	     			assistant.addField('ava_recordtype','text', 'Record Type');
	     			
	     			assistant.getField('ava_recordtype').setDefaultValue(recordType);
	     			
	     			assistant.getField('ava_recordtype').setDisplayType('hidden');
	     			
	     			
	     			assistant.addField('ava_recordtypelabel','label',(recordType == 'l' ? 'Location' : 'Customer'), null,'validationsummary' ).setLayoutType('midrow');
	     			
					if(recordType == 'l')
					{
						 				
	     				var selectedLoc = new Array();
	     				
	     				selectedLoc = fcStep.getFieldValues( 'ava_locationlist' );  									
						
						if(fcStep.getFieldValue('ava_loctype') == 'p')
						{						
							assistant.addField('ava_locationlabel','label','Location(s) ', null,'validationsummary' ).setLayoutType('startrow');					
							
							var filter = new Array();
		     				
		     				filter[0] = new nlobjSearchFilter('internalid', null, 'anyof', selectedLoc);
							
							var columns = new Array();
							
							columns[0] = new nlobjSearchColumn('name');					
							
							var searchResult = nlapiSearchRecord('location', null, filter, columns);
							
							var selectedLocString = '';
							
							for(var i=0; searchResult != null && i<searchResult.length ; i++)
							{
								
								selectedLocString += searchResult[i].getValue('name') + '\n';	
								
							}
		     				
		     				assistant.addField('ava_locationvalue','textarea',null, null,'validationsummary' ).setLayoutType('startrow');
		     				
		     				assistant.getField('ava_locationvalue').setDefaultValue(selectedLocString);
		     				
		     				assistant.getField('ava_locationvalue').setDisplayType('inline');	   
		     				
		     					     				    				
		     				assistant.addField('ava_includesubloc','checkbox', 'Include Sub-Location(s) ', null,'validationsummary' ).setLayoutType('startrow');
	     				
		     				assistant.getField('ava_includesubloc').setDefaultValue(fcStep.getFieldValue('ava_subloc'));
		     				
		     				assistant.getField('ava_includesubloc').setDisplayType('inline');
							
						}
		
						
	//					assistant.addField('activechkbxlabel','label','Only Active Records: ', null, 'validationsummary' ).setLayoutType('startrow');
	//					
	//					assistant.addField('activechkbxvalue','label', ((fcStep.getFieldValue( 'ava_activechkbox' ) == 'Yes') ? 'Yes' : 'No'), null,'validationsummary' ).setLayoutType('midrow');
	
						assistant.addField('ava_activechkbxvalue','checkbox', 'Only Active Records ', null,'validationsummary' ).setLayoutType('startrow');
	     				
	     				assistant.getField('ava_activechkbxvalue').setDefaultValue(fcStep.getFieldValue('ava_activechkbox'));
	     				
	     				assistant.getField('ava_activechkbxvalue').setDisplayType('inline');
						
					}
					else if(recordType == 'c')
					{     
										
	     				assistant.addField('ava_typelabel','label','Type ', null,'validationsummary' ).setLayoutType('startrow');
	     				
	     				var subType = fcStep.getFieldValue( 'ava_type' );
	     				
	     				assistant.addField('ava_type','label',(subType == 'l' ? 'Lead' : (subType == 'p' ? 'Prospect' : 'Customer')), null,'validationsummary' ).setLayoutType('midrow');
	
	     				
	     				assistant.addField('ava_custtypelabel','label','Type of Customers ', null,'validationsummary' ).setLayoutType('startrow');
	     				
	     				var customerType = fcStep.getFieldValue( 'ava_custtype' );
	     				
	     				assistant.addField('ava_custtype','label',(customerType == 'i' ? 'Individual' : (customerType == 'c' ? 'Company' : 'Individuals and Companies')), null,'validationsummary' ).setLayoutType('midrow');
	     				
	     				assistant.addField('ava_datelabel','label','Date Created ', null,'validationsummary' ).setLayoutType('startrow');
	   					
	   					if(fcStep.getFieldValue( 'ava_startdate' ) != null && fcStep.getFieldValue( 'ava_enddate' ) != null)
	   					{
	   						assistant.addField('ava_datevalue','label', ((fcStep.getFieldValue( 'ava_startdate' ) != null && fcStep.getFieldValue( 'ava_startdate' ).length > 0) ? fcStep.getFieldValue( 'ava_startdate' ) : '___') + ' to '+ (fcStep.getFieldValue( 'ava_enddate' ) != null && fcStep.getFieldValue( 'ava_enddate' ).length > 0 ? fcStep.getFieldValue( 'ava_enddate' ) : '___'), null,'validationsummary' ).setLayoutType('midrow');
	   					}
	   					   					
	     				
	     				assistant.addField('ava_addtypelabel','label','Address Type ', null,'validationsummary' ).setLayoutType('startrow');
	     				
	     				var addressType = fcStep.getFieldValue( 'ava_addresstype' );     				
	     				
	     				assistant.addField('ava_addtype','label',(addressType == 'a' ? 'All' : (addressType == 'b' ? 'Default Billing' : (addressType == 's' ? 'Default Shipping' : 'Default Billing & Shipping'))), null,'validationsummary' ).setLayoutType('midrow');
	     				
	     				
						assistant.addField('ava_activechkbxvalue','checkbox', 'Only Active Records ', null,'validationsummary' ).setLayoutType('startrow');
	     				
	     				assistant.getField('ava_activechkbxvalue').setDefaultValue(fcStep.getFieldValue('ava_activechkbox'));
	     				
	     				assistant.getField('ava_activechkbxvalue').setDisplayType('inline');
						
					}
									
					assistant.addField('ava_separator1','help','<br><hr><br>');
					
					assistant.addField('ava_batchname','text','Batch Name ');
					
					assistant.getField('ava_batchname').setHelpText('Provide a unique Batch Name to save the above choices for future reference.', true);	
					
					assistant.getField('ava_batchname').setMandatory(true);
					
					assistant.addField('ava_batchdesc','textarea','Description ');
					
					assistant.getField('ava_batchdesc').setHelpText('(Optional) Provide a useful description for this validation.', true);
					
					assistant.addField('ava_separator2','help','<br><hr><br>');
					
	//				assistant.getButton('next').setLabel('Save & Run');
	     			
	    			}  					
	
	    		} 
	
	    		response.writePage(assistant);
	
	    	}
	    	/* handle user submit (POST) requests. */
	    	else
	    	{
	    		assistant.setError( null );     
	
	    		/* 1. if they clicked the finish button, mark setup as done and redirect to assistant page */
	
	    		if (assistant.getLastAction() == "finish")
	    		{
	    			
	    			var vtStep = assistant.getStep( 'ava_validationtype' );
	    			
	    			var fcStep = assistant.getStep( 'ava_filtercriteria' );
	    			
	    			var summaryStep = assistant.getStep( 'ava_summary' );
	    			
	    			var recordType = vtStep.getFieldValue( 'ava_recordtype' );
		
	    			var validationRecord = nlapiCreateRecord('customrecord_avaaddressvalidationbatch');    			
	
	    			validationRecord.setFieldValue('name', request.getParameter('ava_batchname'));
	    			
	    			validationRecord.setFieldValue('custrecord_ava_batchdescription', request.getParameter('ava_batchdesc'));
	    			
	    			validationRecord.setFieldValue('custrecord_ava_recordtype', recordType);
	    			
	    			validationRecord.setFieldValue('custrecord_ava_progress', 0);
	    			
	    			validationRecord.setFieldValue('custrecord_ava_status', 0);
	    			
	    			validationRecord.setFieldValue('custrecord_ava_totaladdresses', 0);
	    			
	    			validationRecord.setFieldValue('custrecord_ava_validaddresses', 0);
	    			
	    			validationRecord.setFieldValue('custrecord_ava_invalidaddresses', 0);			
	    			
	    			
				if(recordType == 'l')
				{
					validationRecord.setFieldValue('custrecord_ava_locationlist', fcStep.getFieldValue('ava_locationlist'));
					
					validationRecord.setFieldValue('custrecord_ava_locationaddresstype', fcStep.getFieldValue('ava_loctype'));
					
					validationRecord.setFieldValue('custrecord_ava_includesublocations', fcStep.getFieldValue('ava_subloc'));
				}
				else if(recordType == 'c')
	    			{
	    				validationRecord.setFieldValue('custrecord_ava_customersubtype', fcStep.getFieldValue('ava_type'));
	    				
	    				validationRecord.setFieldValue('custrecord_ava_customertype', fcStep.getFieldValue('ava_custtype'));
	    				
	    				validationRecord.setFieldValue('custrecord_ava_customerstartdate', fcStep.getFieldValue('ava_startdate'));
	    				
	    				validationRecord.setFieldValue('custrecord_ava_customerenddate', fcStep.getFieldValue('ava_enddate'));
	    				
	    				validationRecord.setFieldValue('custrecord_ava_custaddresstype', fcStep.getFieldValue('ava_addresstype'));
				
	    			}
	    			
	    			validationRecord.setFieldValue('custrecord_ava_onlyactive', fcStep.getFieldValue('ava_activechkbox'));    			
	    			
	    			var recId = nlapiSubmitRecord(validationRecord, false);
	    			
	    			// UI    			
	    			var resultUrl = nlapiResolveURL('SUITELET', 'customscript_avaaddvalidresults_suitelet', 'customdeploy_avaaddressvalidationresults');
	    			
	    			var assistantUrl = nlapiResolveURL('SUITELET', 'customscript_avaddressvalidation_suitlet', 'customdeploy_avaaddressvalidation');
	    			
	    			var finishedText = "Congratulations! You have completed the AvaTax Address Validation Assistant.<tr><td colspan=2> &nbsp; </td></tr>";
	    			finishedText += "<tr><td colspan=2 class=text align=left>Quick Links</td></tr><tr><td class=textbold style='padding-left:50; padding-top:20' colspan=2 align=left valign=top><a href='" + resultUrl + "'>View Saved Batches</a></td></tr>";
	    			finishedText += "<tr><td class=text colspan=2 style='padding-left:50;' align=left valign=top>Click this link to review the list of address validation batches. You may start another Address Validation batch from this page.</td></tr>";
	    			finishedText += "<tr> <td class=textbold style='padding-left:50; padding-top:20' colspan=2 align=left valign=top><a href='" + assistantUrl + "'>Start Another Batch</a></td></tr>";
	    			finishedText += "<tr><td class=text colspan=2 style='padding-left:50;' align=left valign=top>Click this link to return to the beginning of the Address Validation assistant and start another batch.</td></tr>";
	    			
	    			var filters = new Array();
	    			filters[0] = new nlobjSearchFilter('custrecord_ava_status', null, 'lessthan', 2);
	    			var searchResult3 = nlapiSearchRecord('customrecord_avaaddressvalidationbatch', null, filters, null);
	    			if(searchResult3 != null && searchResult3.length == 1)
	    			{
	    				nlapiScheduleScript('customscript_avaaddressvalidation_sched','customdeploy_addressvalidate_deploy1');  			
	    			}
	    			
	    			assistant.setFinished(finishedText);
	
	    			assistant.sendRedirect( response );
	
	    		}
	    		/* 2. if they clicked the "cancel" button, take them to a different page (setup tab) altogether as
	    			appropriate. */
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
}


/**********************************************************************************************************
View Results Suitelet
**********************************************************************************************************/


//Screen to show list of all batches
function AVA_AddressValidationResultsForm(request, response)
{
	if(AVA_CheckService('AddressSvc') == 0 && AVA_CheckSecurity( 17 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{
			var AVA_AddressForm = nlapiCreateForm('Address Validation Batches');
			AVA_AddressForm.setTitle('Address Validation Processes');
			AVA_AddressForm.setScript('customscript_avaaddressvalidation_client');
			
			var AVA_AddressList = AVA_AddressForm.addSubList('custpage_avabatchlist', 'list','Batches');
		    AVA_AddressList.addField('ava_batchid','text', 'Batch ID').setDisplayType('hidden');
		    AVA_AddressList.addField('ava_delete','checkbox', 'Delete');
		    AVA_AddressList.addField('ava_batchname','text', 'Name');
		    AVA_AddressList.addField('ava_batchtype','text', 'Record Type');
		    AVA_AddressList.addField('ava_batchdate','date', 'Created On');
		    AVA_AddressList.addField('ava_batchprogress','text', 'Progress');
		    AVA_AddressList.addField('ava_batchstatus','text', 'Status');
		    AVA_AddressList.addField('ava_viewdetails','text', 'Details');
		    
		    var cols = new Array();
			cols[0]  = new nlobjSearchColumn('name');
			cols[1]  = new nlobjSearchColumn('custrecord_ava_recordtype');
			cols[2]  = new nlobjSearchColumn('created');
			cols[3]  = new nlobjSearchColumn('custrecord_ava_progress');
			cols[4]  = new nlobjSearchColumn('custrecord_ava_status');
						
			var searchResult = nlapiSearchRecord('customrecord_avaaddressvalidationbatch', null, null, cols);
			
			for(var i=0; searchResult != null && i<searchResult.length; i++)
			{
				AVA_AddressList.setLineItemValue('ava_batchid', i+1, searchResult[i].getId());
				AVA_AddressList.setLineItemValue('ava_batchname', i+1, searchResult[i].getValue('name'));
				
				var recordType = searchResult[i].getValue('custrecord_ava_recordtype');
				recordType = ((recordType == 'l') ? 'Location' : 'Customer');
				AVA_AddressList.setLineItemValue('ava_batchtype', i+1, recordType);
				
				AVA_AddressList.setLineItemValue('ava_batchdate', i+1, searchResult[i].getValue('created').split(' ')[0]);
				AVA_AddressList.setLineItemValue('ava_batchprogress', i+1, searchResult[i].getValue('custrecord_ava_progress'));
				
				var BatchStatus = searchResult[i].getValue('custrecord_ava_status');	
				
				switch(BatchStatus)
				{
					case '0': BatchStatus = 'In Queue';
							break;
					case '1': BatchStatus = 'In Progress';
							break;
					case '2': BatchStatus = 'Validation Completed';
							break;
					case '3': BatchStatus = 'Marking Records for Updation';
							break;
					case '4': BatchStatus = 'Records Marked for Updation';
							break; 
					case '5': BatchStatus = 'Updation Completed';
							break;
					case '6': BatchStatus = 'Deletion';
							break;
					default: BatchStatus = 'Error';
							break;				
				}
						
//				BatchStatus = (BatchStatus == 0) ? 'In Queue' : ((BatchStatus == 1) ? 'In Progress' : ((BatchStatus == 2) ? 'Completed' : 'Error'));

				AVA_AddressList.setLineItemValue('ava_batchstatus', i+1, BatchStatus);				
				
				if(searchResult[i].getValue('custrecord_ava_status') == 2 || searchResult[i].getValue('custrecord_ava_status') == 3 || searchResult[i].getValue('custrecord_ava_status') == 4 || searchResult[i].getValue('custrecord_ava_status') == 5)
				{
					var URL1 = nlapiResolveURL('SUITELET', 'customscript_avaaddvalidbatch_suitelet', 'customdeploy_avaaddressvalidationbatch', false);
					URL1 = URL1 + '&ava_batchid=' + searchResult[i].getId() + '&ava_status=1&ava_mode=view&ava_page=f';
					var FinalURL = '<a href="' + URL1 + '" target="_blank">View Details</a>';
					
					AVA_AddressList.setLineItemValue('ava_viewdetails',			i+1, FinalURL);
				}
				
			}
		    
		    AVA_AddressForm.addSubmitButton('Submit');
	 	    AVA_AddressForm.addButton('ava_refresh','Refresh', "window.location = '" + nlapiResolveURL('SUITELET', 'customscript_avaaddvalidresults_suitelet', 'customdeploy_avaaddressvalidationresults') + "&compid=" + nlapiGetContext().getCompany() + "&whence='");	    
	 	    AVA_AddressForm.addPageLink('crosslink', 'Create Address Validation Batch', nlapiResolveURL('SUITELET', 'customscript_avaddressvalidation_suitlet', 'customdeploy_avaaddressvalidation'));
		    
		    response.writePage(AVA_AddressForm);			
		}
		else
		{
			//set batch status field value to 6 for deletion
			
			var LineCount	= request.getLineItemCount('custpage_avabatchlist');
			
			for ( var i = 1; i <= LineCount ; i++ )
			{
				if ( request.getLineItemValue('custpage_avabatchlist','ava_delete', i) == 'T')
				{
					var BatchId = request.getLineItemValue('custpage_avabatchlist','ava_batchid', i);
				
					var fields = new Array();
					var values = new Array();
					
					fields[0] = 'custrecord_ava_status';
					values[0] = 6;
					
					fields[1] ='custrecord_ava_progress';
					values[1] = 0;					
									
					nlapiSubmitField('customrecord_avaaddressvalidationbatch', BatchId, fields, values, false);
				}
			}			   
			nlapiScheduleScript('customscript_avadeleteaddvalbatch_sched','customdeploy_avadeladdvalbatch_deploy1');
	   		nlapiSetRedirectURL('TASKLINK', 'CARD_-29');
		}
	}
}


/**********************************************************************************************************
Batch Suitelet
**********************************************************************************************************/

// Screen to show a particular batch and all the related records
function AVA_AddressValidationBatchForm(request, response)
{
	if(AVA_CheckService('AddressSvc') == 0 && AVA_CheckSecurity( 18 ) == 0)
	{
	
		var BatchId = request.getParameter('ava_batchid');
		
		if(request.getMethod() == 'GET')
		{
			var AVA_AddressListForm = nlapiCreateForm('Address Validation Batch');		
			AVA_AddressListForm.setScript('customscript_avaaddvalresult_client');
			AVA_AddressListForm.setTitle('Address Validation Batch');
			
			var BatchStatus = request.getParameter('ava_status');	
			var AVA_Message = 'Batch Name or Batch Status Missing';
			
			if(BatchId == null || BatchId == '' || BatchStatus == null || BatchStatus == '')  
			{
				var AVA_Notice = AVA_NoticePage(AVA_Message);
				response.write(AVA_Notice);
			}
			else
			{
			
				var batchRecord = nlapiLoadRecord('customrecord_avaaddressvalidationbatch', BatchId);			
				
				AVA_AddressListForm.addField('ava_batchid', 'select', 'Batch Name', 'customrecord_avaaddressvalidationbatch').setDisplayType('inline');
				AVA_AddressListForm.getField('ava_batchid').setDefaultValue(BatchId);
				
				//Field - Record Type: Customer, Location
				AVA_AddressListForm.addField('ava_recordtype','text','Record Type').setDisplayType('inline');
				var recordType = batchRecord.getFieldValue('custrecord_ava_recordtype');
				AVA_AddressListForm.getField('ava_recordtype').setDefaultValue((recordType == 'c') ? 'Customer' : 'Location');	
				
				//Further fields depend upon Record Type
				if(recordType == 'c')//for customer
				{
					//Field - SubType : Lead, Prospect or Customer
					AVA_AddressListForm.addField('ava_subtype','text','Sub Type').setDisplayType('inline');
					var subType = batchRecord.getFieldValue('custrecord_ava_customersubtype');
					AVA_AddressListForm.getField('ava_subtype').setDefaultValue((subType == 'c') ? 'Customer' : (subType == 'l' ? 'Lead' : 'Prospect'));					
	
					//Field - Customer Type : Individual, Company or Both
					AVA_AddressListForm.addField('ava_custtype','text','Customer Type').setDisplayType('inline');
					var custType = batchRecord.getFieldValue('custrecord_ava_customersubtype');
					AVA_AddressListForm.getField('ava_custtype').setDefaultValue((custType == 'i') ? 'Individial' : (custType == 'c' ? 'Company' : 'Individuals and Companies'));					
					
					//Field - Start Date 
					if(batchRecord.getFieldValue('custrecord_ava_customerstartdate') != null)
					{
						AVA_AddressListForm.addField('ava_startdate','date','Start Date').setDisplayType('inline');
						AVA_AddressListForm.getField('ava_startdate').setDefaultValue(batchRecord.getFieldValue('custrecord_ava_customerstartdate'));
					}
					
					//Field - End Date 
					if(batchRecord.getFieldValue('custrecord_ava_customerenddate') != null)
					{
						AVA_AddressListForm.addField('ava_enddate','date','End Date').setDisplayType('inline');
						AVA_AddressListForm.getField('ava_enddate').setDefaultValue(batchRecord.getFieldValue('custrecord_ava_customerenddate'));
					}
					
					//Field - Address Type: All (a), Default Billing (b), Default Shipping (s), Default Billing & Shipping (bs)
					AVA_AddressListForm.addField('ava_addresstype', 'text', 'Address Type').setDisplayType('inline');
					var addType = batchRecord.getFieldValue('custrecord_ava_custaddresstype');
					AVA_AddressListForm.getField('ava_addresstype').setDefaultValue((addType == 'a') ? 'All' : (addType == 'b' ? 'Default Billing' : (addType == 's' ? 'Default Shipping' : 'Default Billing & Shipping')));	
					AVA_AddressListForm.getField('ava_addresstype').setLayoutType("normal", "startcol");
					
				}
				else if(recordType == 'l')//for location
				{
					//Field - Address Type: All Addresses (a), Specific Locations (p)
					AVA_AddressListForm.addField('ava_addresstype', 'text', 'Address Type').setDisplayType('inline');
					var addType = batchRecord.getFieldValue('custrecord_ava_locationaddresstype');
					AVA_AddressListForm.getField('ava_addresstype').setDefaultValue((addType == 'a') ? 'All' : 'Specific Location(s)');	
					AVA_AddressListForm.getField('ava_addresstype').setLayoutType("normal", "startcol");
					
					if(addType == 'p')
					{
						//Field - Selected Locations
						AVA_AddressListForm.addField('ava_locations', 'multiselect', 'Selected Locations', 'location').setDisplayType('inline');
						AVA_AddressListForm.getField('ava_locations').setDefaultValue(batchRecord.getFieldValue('custrecord_ava_locationlist'));	
					}	
				}
				
				//Field - Only Active records
				AVA_AddressListForm.addField('ava_onlyactive', 'checkbox', 'Include Inactive').setDisplayType('inline');
				AVA_AddressListForm.getField('ava_onlyactive').setDefaultValue(batchRecord.getFieldValue('custrecord_ava_onlyactive'));	
										
				var SelectCriteria = AVA_AddressListForm.addField('ava_status','select','Sublist Criteria');
				SelectCriteria.addSelectOption('0','All');
				SelectCriteria.addSelectOption('1','Validated');
				SelectCriteria.addSelectOption('2','Non-Validated');
				SelectCriteria.addSelectOption('3','Validation Saved');
				SelectCriteria.addSelectOption('4','Updation Failed');
				SelectCriteria.setDefaultValue(BatchStatus);
	
				totalRec = batchRecord.getFieldValue('custrecord_ava_totaladdresses');
				valCorrect = batchRecord.getFieldValue('custrecord_ava_validaddresses');
				valFail = batchRecord.getFieldValue('custrecord_ava_invalidaddresses');
	
	
				AVA_SetResultSublist(AVA_AddressListForm, recordType, batchRecord.getId());
				
				if((nlapiGetLineItemCount('custpage_avaresults') == -1 || nlapiGetLineItemCount('custpage_avaresults') > 0) && (batchRecord.getFieldValue('custrecord_ava_status') == '2' || batchRecord.getFieldValue('custrecord_ava_status') == '3') && BatchStatus == '1' && request.getParameter('ava_mode') == 'view')
				{				
					AVA_AddressListForm.addButton('ava_updatebutton','Update Validated Records', 'AVA_UpdateBatchRecords(' + BatchId + ',' + BatchStatus + ')');				
				}
				
				if(request.getParameter('ava_mode') == 'edit')
				{
					AVA_AddressListForm.addSubmitButton('Submit');
				}
				
				
				
				try
				{				
					var temphtml = '<span style="padding: 10px 25px; display: inline-block; position: relative; left: -20px; margin-bottom: 5px;" class="bgmd"><img src="/images/x.gif" class="totallingTopLeft"><img src="/images/x.gif" class="totallingTopRight"><img src="/images/x.gif" class="totallingBottomLeft"><img src="/images/x.gif" class="totallingBottomRight"><table cellspacing="0" cellpadding="0" border="0" class="totallingtable">';
					temphtml += '<tbody><tr><td><span class="smallgraytextnolink">Total Addresses  &nbsp;&nbsp;</span></td><td ALIGN="right"><span class="smallgraytextnolink">' + totalRec + '</span></td></tr><tr><td>&nbsp;&nbsp;</td><td>&nbsp;&nbsp;</td></tr>';
					temphtml += '<tr><td><span class="smallgraytextnolink">*Valid Addresses &nbsp;&nbsp;</span></td><td ALIGN="right"><span class="smallgraytextnolink">' + valCorrect + '</span></td></tr><tr><td>&nbsp;&nbsp;</td><td>&nbsp;&nbsp;</td></tr>';
					temphtml += '<tr><td><span class="smallgraytextnolink">Non-Valid Addresses &nbsp;&nbsp;</span></td><td ALIGN="right"><span class="smallgraytextnolink">' + valFail + '</span></td></tr></tbody></table></span>';
						
					AVA_AddressListForm.addField('ava_stats', 'inlinehtml', '').setDisplayType('inline');
					AVA_AddressListForm.getField('ava_stats').setDefaultValue(temphtml);
					AVA_AddressListForm.getField('ava_stats').setLayoutType("normal", "startcol");			
				}
				catch(err)
				{
					AVA_AddressListForm.addField('ava_totalrec', 'text', 'Total Addresses ').setDisplayType('inline');
					AVA_AddressListForm.getField('ava_totalrec').setDefaultValue(totalRec);
					AVA_AddressListForm.getField('ava_totalrec').setLayoutType("normal", "startcol");	
					
					AVA_AddressListForm.addField('ava_valcorrect', 'text', '*Valid Addresses ').setDisplayType('inline');
					AVA_AddressListForm.getField('ava_valcorrect').setDefaultValue(valCorrect);
									
					AVA_AddressListForm.addField('ava_valfail', 'text', 'Non-Valid Addresses ').setDisplayType('inline');
					AVA_AddressListForm.getField('ava_valfail').setDefaultValue(valFail);				
				}
				
				AVA_AddressListForm.addField('ava_help', 'help', '*Includes addresses that exist in Validation Saved status also');
							
				
			 	response.writePage(AVA_AddressListForm);    
			}
						
		}
		else
		{
			// If record status sublist selection is Validated
			if(request.getParameter('ava_status') == 1 && request.getLineItemCount('custpage_avaresults') > 0)
			{
				AVA_ReadConfig('0');
	
				for(var i=0 ; i<request.getLineItemCount('custpage_avaresults') ; i++)
				{
					var oldStatus = nlapiLookupField('customrecord_avaaddvalidationbatchrecord', request.getLineItemValue('custpage_avaresults', 'ava_id', i+1), 'custrecord_ava_validationstatus');
	
					if(request.getLineItemValue('custpage_avaresults', 'ava_update', i+1) == 'T' && oldStatus != '3')
					{
						nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', request.getLineItemValue('custpage_avaresults', 'ava_id', i+1), 'custrecord_ava_validationstatus', '3');									
					}
					else if(request.getLineItemValue('custpage_avaresults', 'ava_update', i+1) == 'F' && oldStatus == '3')
					{
						nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', request.getLineItemValue('custpage_avaresults', 'ava_id', i+1), 'custrecord_ava_validationstatus', '1');									
					}
				}
				
				nlapiSubmitField('customrecord_avaaddressvalidationbatch', BatchId, 'custrecord_ava_status', '4');			
	
			}	
			
			nlapiSetRedirectURL('TASKLINK', 'CARD_-29');	
		}
	
	}
}

/**********************************************************************************************************
Quick Validate Suitelet
**********************************************************************************************************/

function AVA_QuickValidationForm(request, response)
{
	if(AVA_CheckService('AddressSvc') == 0 && AVA_CheckSecurity( 19 ) == 0)
	{
		if(request.getMethod() == 'GET')
		{			
			var Addressform = nlapiCreateForm('Validate Address');
			Addressform.setScript('customscript_avaaddressvalidation_client');

//			Addressform.addField('ava_message', 'label', '* - You must specify at least Line/ZIP, or Line/City/State').setLayoutType('startrow');
			
			Addressform.addField('ava_add1', 'text',	'** Address 1 ').setLayoutType('normal','startrow');
			Addressform.addField('ava_add2', 'text',	'Address 2 ').setLayoutType('normal','startrow');
			Addressform.addField('ava_add3', 'text',	'Address 3 ').setLayoutType('normal','startrow');
			Addressform.addField('ava_city', 'text',	'** City ').setLayoutType('normal','startrow');
			Addressform.addField('ava_state', 'text',	'** State (Province) ').setLayoutType('startrow','startrow');			
			Addressform.addField('ava_zip', 'text',	'** ZIP/Postal Code ').setLayoutType('normal','startrow');		
			Addressform.addField('ava_country', 'text',	'** Country ').setLayoutType('normal','startrow');
			
			Addressform.addButton('ava_validate','Validate', "AVA_QuickValidateAddress()");
			Addressform.addButton('ava_clear','Clear', "AVA_ClearAddressFields()");
			
			response.writePage(Addressform);
		}
	}
}


}
	
		
{/********************************CLIENT SIDE FUNCTIONS*************************************************/

function AVA_UpdateBatchRecords(BatchId, BatchStatus)
{
	if(nlapiGetLineItemCount('custpage_avaresults') > 0)
	{
		//update batch with status 3
		nlapiSubmitField('customrecord_avaaddressvalidationbatch', BatchId, 'custrecord_ava_status', 3);
	}
	
	var URL1 = nlapiResolveURL('SUITELET', 'customscript_avaaddvalidbatch_suitelet', 'customdeploy_avaaddressvalidationbatch', false);
	URL1 = URL1 + '&ava_batchid=' + BatchId + '&ava_status=' + BatchStatus + '&ava_mode=edit&ava_page=f'; 
	window.location = URL1 + '&compid=' + nlapiGetContext().getCompany() + '&whence=';

}

// PageInit function of Assistant suitelet
function AVA_PageInit()
{
	if(nlapiGetFieldValue('ava_loctype') != null && nlapiGetFieldValue('ava_loctype') == 'a')
	{
		nlapiDisableField('ava_locationlist', true);
		nlapiDisableField('ava_subloc', true);
	}
}

// Field Change function of Assistant suitelet
function AVA_FieldChange(type, name)
{
	if(name == 'ava_loctype')
	{
		if(nlapiGetFieldValue('ava_loctype') == 'a')
		{			
			nlapiDisableField('ava_locationlist', true);
			nlapiDisableField('ava_subloc', true);
		}
		else if(nlapiGetFieldValue('ava_loctype') == 'p')
		{			
			nlapiDisableField('ava_locationlist', false);
			nlapiDisableField('ava_subloc', false);	
		}
	}	
}


// Field Change function of AVA_AddressValidationBatchForm suitelet
function AVA_BatchFormFieldChange(type, name)
{
	if(name == 'ava_status')
	{
		setWindowChanged(window, false);
		var URL1 = nlapiResolveURL('SUITELET', 'customscript_avaaddvalidbatch_suitelet', 'customdeploy_avaaddressvalidationbatch', false);
		URL1 = URL1 + '&ava_batchid=' + nlapiGetFieldValue('ava_batchid') + '&ava_status=' + nlapiGetFieldValue('ava_status') + '&ava_mode=view&ava_page=f'; 
		window.location = URL1;
	}
}


// Save function of Assistant and AVA_AddressValidationResltsForm suitelet
function AVA_SaveRecord()
{
	
	//When particular location(s) needs to be validated then check if Location(s) have been selected or not
	if(nlapiGetFieldValue('ava_recordtype') == 'l' && nlapiGetFieldValue('ava_loctype') != null && nlapiGetFieldValue('ava_loctype') == 'p' && nlapiGetFieldValue('ava_locationlist').length <= 0)
	{
		alert('Please select Location(s).');
		return false;
	}
	
	
	
	var alertFlag = 'F', alertMsg = '';
	
	for ( var i = 1; i <= nlapiGetLineItemCount('custpage_avabatchlist'); i++ )
	{
		if( nlapiGetLineItemValue('custpage_avabatchlist','ava_delete', i) == 'T' )
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
								
				case 'Validation Completed': 
								BatchStatus = 2;
								break;
								
		 		case 'Marking Records for Updation':      
		 						BatchStatus = 3;
		 						break;	
		 						
				case 'Records Marked for Updation': 
							    BatchStatus = 4;
		 						break;
		 							
				case 'Updation Completed': 
								BatchStatus = 5;
								break;
								
				case 'Deletion': 
								BatchStatus = 6;
								break;
								
				case 'default': 
								BatchStatus = 7;
								break;		 												 		   				
			}
			
			if(BatchStatus == 1 || BatchStatus == 3)
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
	


}



{/********************************COMMON FUNCTIONS*************************************************/

function AVA_PagingLinkClick()
{		
	// If record status sublist selection is Validated
	if(nlapiGetFieldValue('ava_status') == 1 && nlapiGetLineItemCount('custpage_avaresults') > 0)
	{
		AVA_ReadConfig('0');
		if(AVA_AddBatchProcessing == 0)
		{
			for(var i=0 ; i<nlapiGetLineItemCount('custpage_avaresults') ; i++)
			{
				var oldStatus = nlapiLookupField('customrecord_avaaddvalidationbatchrecord', nlapiGetLineItemValue('custpage_avaresults', 'ava_id', i+1), 'custrecord_ava_validationstatus');

				if(nlapiGetLineItemValue('custpage_avaresults', 'ava_update', i+1) == 'T' && oldStatus != '3')
				{
					nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', nlapiGetLineItemValue('custpage_avaresults', 'ava_id', i+1), 'custrecord_ava_validationstatus', '3');									
				}
				else if(nlapiGetLineItemValue('custpage_avaresults', 'ava_update', i+1) == 'F' && oldStatus == '3')
				{
					nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', nlapiGetLineItemValue('custpage_avaresults', 'ava_id', i+1), 'custrecord_ava_validationstatus', '1');									
				}
			}			
		}
	}
	
	setWindowChanged(window, false);	
}



function AVA_SetResultSublist(AVA_AddressListForm, recordType, batchId)
{	
	var AVA_ListStart = (request.getParameter('ava_start') == null || (request.getParameter('ava_start') != null && request.getParameter('ava_start').length == 0)) ? 0 : request.getParameter('ava_start');
	var AVA_ListEnd = (request.getParameter('ava_end') != null && request.getParameter('ava_end').length > 0) ? request.getParameter('ava_end') : 0;
	var AVA_Tab = AVA_AddressListForm.addTab('custpage_avatab', 'Sample Tab');	
	
	var FirstLink = '&lt;&lt;First Page';
	var PrevLink = 'Previous';
	var NextLink = 'Next';
	var LastLink = 'Last Page&gt;&gt;';
				
	var AVA_AddressList = AVA_AddressListForm.addSubList('custpage_avaresults', 'list', 'Results', AVA_Tab);
	
	if(request.getParameter('ava_mode') == 'edit')
	{
		AVA_AddressList.addMarkAllButtons();
		
		// add sublist columns
		AVA_AddressList.addField('ava_id','text', 'ID').setDisplayType('hidden');
		AVA_AddressList.addField('ava_update', 'checkbox', 'Update');
	}
	
	AVA_AddressList.addField('ava_name','text', 'Name').setDisplayType('normal');
	
	if(recordType != 'l')
	{
		AVA_AddressList.addField('ava_addtype','text', 'Address Type').setDisplayType('normal');
	}
	
	AVA_AddressList.addField('ava_origadd','textarea', 'Original Address').setDisplayType('normal');
	AVA_AddressList.addField('ava_validadd','textarea', 'Validated Address').setDisplayType('normal');
	AVA_AddressList.addField('ava_status','text', 'Status').setDisplayType('normal');
	AVA_AddressList.addField('ava_error','text', 'Message').setDisplayType('normal');
	
	//add values to sublist
	var filter = new Array();
	var filterprev = new Array();
	var filternext = new Array();
	
	filter[filter.length] = new nlobjSearchFilter('custrecord_ava_validationbatch', null, 'anyof', batchId);
	filterprev[filterprev.length] =  new nlobjSearchFilter('custrecord_ava_validationbatch', null, 'anyof', batchId);
	filternext[filternext.length] =  new nlobjSearchFilter('custrecord_ava_validationbatch', null, 'anyof', batchId);

	nlapiLogExecution('Debug','Status ', request.getParameter('ava_status'));
	// for only Validated or Error records need to be shown
	if(request.getParameter('ava_status') == '1')
	{
		filter[filter.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'isnot', '2');	
		filter[filter.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'isnot', '4');	
		
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'isnot', '2');	
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'isnot', '4');
		
		filternext[filternext.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'isnot', '2');	
		filternext[filternext.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'isnot', '4');
	}
	else if(request.getParameter('ava_status') == '2')
	{
		filter[filter.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '2');
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '2');
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '2');
	}
	else if(request.getParameter('ava_status') == '3')
	{
		filter[filter.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '4');
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '4');
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '4');
	}
	else if(request.getParameter('ava_status') == '4')
	{
		filter[filter.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '5');
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '5');
		filterprev[filterprev.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '5');
	}


	// for Next Page
	if(request.getParameter('ava_end') != null && request.getParameter('ava_page') == 'n')
	{		
		filter[filter.length] = new nlobjSearchFilter('INTERNALIDNUMBER', null, 'greaterthan', parseInt(request.getParameter('ava_end')));
	}
	// for First and Prev Page
	else if(request.getParameter('ava_start') != null && request.getParameter('ava_page') == 'p')
	{
		filter[filter.length] = new nlobjSearchFilter('INTERNALIDNUMBER', null, 'lessthan', parseInt(request.getParameter('ava_start')));	
	}

	var cols = new Array();
	cols[cols.length] = new nlobjSearchColumn('internalid', null, null);
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validationbatch');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedrecordtype');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedrecordid');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_origline1');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_origline2');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_origline3');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_origcity');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_origstate');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_origzip');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_origcountry');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedline1');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedline2');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedline3');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedcity');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedstate');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedzip');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedcountry');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_errormsg');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validationstatus');
	cols[cols.length] = new nlobjSearchColumn('custrecord_ava_addresstype');
	cols[cols.length]= cols[0].setSort((request.getParameter('ava_page') == 'p' || request.getParameter('ava_page') == 'l') ? true : false);
//	cols[cols.length]= cols[0].setSort();
	
	
	var searchRecord = nlapiSearchRecord('customrecord_avaaddvalidationbatchrecord', null, filter, cols);
	
	if(request.getParameter('ava_page') == 'p' || request.getParameter('ava_page') == 'l')
	{	
		if(request.getParameter('ava_page') == 'l')
		{
			var count = (request.getParameter('ava_status') == '0' ? totalRec : (request.getParameter('ava_status') == '1' ? valCorrect : valFail));
			AVA_ListLimit = parseInt(count - (Math.floor(count/AVA_ListLimit) * AVA_ListLimit));		
		}
		
		var tempRecArray = new Array();
		var arrayCtr = 0;
		while(tempRecArray.length != AVA_ListLimit)
		{
			tempRecArray[tempRecArray.length] = searchRecord[arrayCtr];	
			arrayCtr++;	
		}
		
		searchRecord = new Array();
		for(var m=0, ctr = tempRecArray.length - 1; searchRecord.length != tempRecArray.length ; m++, ctr--)
		{
			searchRecord[m] = tempRecArray[ctr];
		}
	}	
	
	
	if(searchRecord != null)
	{
		nlapiLogExecution('Debug','ava_page: ' + request.getParameter('ava_page'), searchRecord.length);
		nlapiLogExecution('Debug','First Rec', searchRecord[0].getId());
		AVA_ListStart = searchRecord[0].getId();
				
		for(var i=0; i<Math.min( AVA_ListLimit, searchRecord.length) ; i++)
		{
			AVA_AddressList.setLineItemValue('ava_id', i+1, searchRecord[i].getId());
			
			var recType = searchRecord[i].getValue('custrecord_ava_validatedrecordtype');
			var fieldName = (recType == 's' || recType == 'l') ? 'name' : 'entityid';
			var addType = searchRecord[i].getValue('custrecord_ava_addresstype');
			addType = (recType == 'c' && addType == 's') ? 'Default Shipping' : (recType == 'c' && addType == 'b' ? 'Default Billing' : (recType == 'c' && addType == 'd' ? 'Default Billing & Shipping' : ''));
			recType = (recType == 'c' ? 'customer' : 'location');		 
			
			var displayName = nlapiLookupField(recType, searchRecord[i].getValue('custrecord_ava_validatedrecordid'), fieldName);
			AVA_AddressList.setLineItemValue('ava_name', i+1, displayName);
			AVA_AddressList.setLineItemValue('ava_addtype', i+1, addType);
			
			var orgAdd = (searchRecord[i].getValue('custrecord_ava_origline1') != null && searchRecord[i].getValue('custrecord_ava_origline1') != '') ? searchRecord[i].getValue('custrecord_ava_origline1') + ' \n' : '';
			orgAdd += (searchRecord[i].getValue('custrecord_ava_origline2') != null && searchRecord[i].getValue('custrecord_ava_origline2') != '') ? searchRecord[i].getValue('custrecord_ava_origline2') + ' \n' : '';
			orgAdd += (searchRecord[i].getValue('custrecord_ava_origline3') != null && searchRecord[i].getValue('custrecord_ava_origline3') != '') ? searchRecord[i].getValue('custrecord_ava_origline3') + ' \n' : '';
			orgAdd += searchRecord[i].getValue('custrecord_ava_origcity') + ' \n';
			orgAdd += searchRecord[i].getValue('custrecord_ava_origstate') + ' \n';
			orgAdd += searchRecord[i].getValue('custrecord_ava_origzip') + ' \n';
			orgAdd += searchRecord[i].getValue('custrecord_ava_origcountry') + ' \n';
			
			AVA_AddressList.setLineItemValue('ava_origadd', i+1, orgAdd);
			
			var valAdd = (searchRecord[i].getValue('custrecord_ava_validatedline1') != null && searchRecord[i].getValue('custrecord_ava_validatedline1') != '') ? searchRecord[i].getValue('custrecord_ava_validatedline1') + ' \n' : '';
			valAdd += (searchRecord[i].getValue('custrecord_ava_validatedline2') != null && searchRecord[i].getValue('custrecord_ava_validatedline2') != '') ? searchRecord[i].getValue('custrecord_ava_validatedline2') + ' \n' : '';
			valAdd += (searchRecord[i].getValue('custrecord_ava_validatedline3') != null && searchRecord[i].getValue('custrecord_ava_validatedline3') != '') ? searchRecord[i].getValue('custrecord_ava_validatedline3') + ' \n' : '';
			valAdd += searchRecord[i].getValue('custrecord_ava_validatedcity') + ' \n';
			valAdd += searchRecord[i].getValue('custrecord_ava_validatedstate') + ' \n';
			valAdd += searchRecord[i].getValue('custrecord_ava_validatedzip') + ' \n';
			valAdd += searchRecord[i].getValue('custrecord_ava_validatedcountry') + ' \n';
			AVA_AddressList.setLineItemValue('ava_validadd', i+1, valAdd);
			
			var errMsg = searchRecord[i].getValue('custrecord_ava_errormsg');
			AVA_AddressList.setLineItemValue('ava_error', i+1, errMsg);
			
			var valStatus = searchRecord[i].getValue('custrecord_ava_validationstatus');
			if(AVA_AddressList.getField('ava_update') != null)
			{
				AVA_AddressList.setLineItemValue('ava_update', i+1, (valStatus == '3') ? 'T' : 'F');
			}
			AVA_AddressList.setLineItemValue('ava_status', i+1, ((valStatus == '1') ? 'Validated' : ((valStatus == '2') ? 'Error' : ((valStatus == '3') ? 'To be Saved' : 'Validation Saved'))));
						
		}
		
		AVA_ListEnd = searchRecord[i-1].getId();
		
		//First Page

		var URL1 = nlapiResolveURL('SUITELET', 'customscript_avaaddvalidbatch_suitelet', 'customdeploy_avaaddressvalidationbatch', false);
		URL1 = URL1 + '&ava_batchid=' + request.getParameter('ava_batchid') + '&ava_status=' + request.getParameter('ava_status') + '&ava_mode=' + (request.getParameter('ava_mode') == 'edit' ? 'edit' : 'view') + '&ava_start=' + AVA_ListStart + '&ava_end=' + AVA_ListEnd;		
		

		// for First and Prev Page
		if(request.getParameter('ava_page') == 'p')
		{
			filterprev[filterprev.length] = new nlobjSearchFilter('INTERNALIDNUMBER', null, 'lessthan', parseInt(AVA_ListStart));	
		}
		
		var searchPrev = nlapiSearchRecord('customrecord_avaaddvalidationbatchrecord', null, filterprev, cols);
		
		
		if(request.getParameter('ava_page') != 'f' && searchPrev != null && searchPrev.length > 0)
		{
			FirstLink = '<b><a href="'+ URL1 + '&ava_page=f' + '" onclick=AVA_PagingLinkClick()>\t\t\t\t&lt;&lt;First Page</a></b>';
			PrevLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 + '&ava_page=p' +'" onclick=AVA_PagingLinkClick()>Previous</a></b>';
		}		
		
		nlapiLogExecution('Debug','Page: ' + request.getParameter('ava_page') + ' AVA_ListEnd: ' + AVA_ListEnd);
		if(request.getParameter('ava_page') == 'f' || request.getParameter('ava_page') == 'p' || request.getParameter('ava_page') == 'n')
		{		
			filternext[filternext.length] = new nlobjSearchFilter('INTERNALIDNUMBER', null, 'greaterthan', parseInt(AVA_ListEnd));
			nlapiLogExecution('Debug','Filter Length' + filternext.length);		
			
			var searchNext = nlapiSearchRecord('customrecord_avaaddvalidationbatchrecord', null, filternext, cols);
			
			if(searchNext != null && searchNext.length > 0)
			{
				NextLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 + '&ava_page=n' +'" onclick=AVA_PagingLinkClick()>Next</a></b>';
				LastLink = '<b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+ URL1 + '&ava_page=l' +'" onclick=AVA_PagingLinkClick()>Last Page&gt;&gt;</a></b>';
			}
		}
				
	}
	

	var emptyCells = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
	var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1">' + FirstLink+ '</font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
	html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1">' + LastLink+ '</font></td></tr></table>';
	
//	var html = '<table cellspacing="20" align="center"><tr>' + emptyCells + emptyCells +'<td><font size="1"> </font></td><td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;' + PrevLink + '</font></td>';
//	html +='<td><font size="1">|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + NextLink + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|</font></td><td><font size="1"> </font></td></tr></table>';

	var PagingHtml = AVA_AddressListForm.addField('ava_pagelinks',	'help',		html,	 null, AVA_Tab);
	PagingHtml.setLayoutType('outsidebelow','startrow');
	
}

function AVA_QuickValidateAddress()
{
	var addr1 = nlapiGetFieldValue('ava_add1');
	var addr2 = nlapiGetFieldValue('ava_add2');
	var addr3 = nlapiGetFieldValue('ava_add3');
	var city = nlapiGetFieldValue('ava_city');
	var state = nlapiGetFieldValue('ava_state');
	var zip = nlapiGetFieldValue('ava_zip');
	var country = nlapiGetFieldValue('ava_country');
	var msg = AVA_ValidateAddress(addr1, addr2, addr3, city, state, zip, country);
	
	if(msg != null && msg.length == 0)
	{
		var AVA_Message = 'Address Validation was Successful. \n\n';
		AVA_Message += '\t Line 1:       \t ' + validatedLine1 + '\n';
		AVA_Message += (validatedLine2 != '') ? '\t Line2:       \t ' + validatedLine2 + '\n' : '';
		AVA_Message += (validatedLine3 != '') ? '\t Line3:       \t ' + validatedLine3 + '\n' : '';
		AVA_Message += '\t City:          \t ' + validatedCity + '\n';
		AVA_Message += '\t Region:        \t ' + validatedRegion + '\n';
		AVA_Message += '\t PostalCode: ' + validatedPostalCode + '\n';
		
		var StateCheck = AVA_CheckCountryName(validatedRegion);
		var Country = (StateCheck[0] == 0 ? validatedRegion : validatedCountry);
		
		AVA_Message += '\t Country:       \t ' + Country + '\n\n';
		
		alert(AVA_Message);
		
		nlapiSetFieldValue('ava_add1', 		validatedLine1, 		false);
		nlapiSetFieldValue('ava_add2', 		validatedLine2, 		false);
		nlapiSetFieldValue('ava_add3', 		validatedLine3, 		false);
		nlapiSetFieldValue('ava_city', 		validatedCity, 			false);
		nlapiSetFieldValue('ava_state', 	validatedRegion, 		false);
		nlapiSetFieldValue('ava_zip', 		validatedPostalCode, 	false);
		nlapiSetFieldValue('ava_country', 	Country, 				false);
	}
	else
	{
		alert(msg);
	}
}

function AVA_ValidateAddress(addr1, addr2, addr3, city, state, zip, country)
{
	var error = '';
	
	AVA_ReadConfig('0');
	
	var response ;
	var security = AVA_TaxSecurity(AVA_AccountValue, AVA_LicenseKey);
	var headers = AVA_TaxHeader(security); 
	var body = AVA_ValidateShipFromAddressBody(addr1, addr2, addr3, city, state, zip, country);
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
				validatedLine1 		= nlapiSelectValues( soapXML, "//*[name()='Line1']");
				validatedLine2 		= nlapiSelectValues( soapXML, "//*[name()='Line2']");
				validatedLine3 		= nlapiSelectValues( soapXML, "//*[name()='Line3']");
				validatedCity  		= nlapiSelectValues( soapXML, "//*[name()='City']");
				validatedRegion  	= nlapiSelectValue( soapXML, "//*[name()='Region']");
				validatedPostalCode  = nlapiSelectValues( soapXML, "//*[name()='PostalCode']");
				validatedCounty	= nlapiSelectValues( soapXML, "//*[name()='County']");
				validatedCountry  	= nlapiSelectValue( soapXML, "//*[name()='Country']");
			}
			else
			{
				error = nlapiSelectValue( ValidateResult, "//*[name()='Summary']");
			}
		}

	}
	catch(err)
	{
		error = err;
//		alert('Address Validation was not Successful. ' + err);
	}
	
	return error;
}

function AVA_ClearAddressFields()
{
	nlapiSetFieldValue('ava_add1','');
	nlapiSetFieldValue('ava_add2','');
	nlapiSetFieldValue('ava_add3','');
	nlapiSetFieldValue('ava_city','');
	nlapiSetFieldValue('ava_state','');
	nlapiSetFieldValue('ava_zip','');
	nlapiSetFieldValue('ava_country','');
}

function AVA_ValidateShipFromAddressBody(addr1, addr2, addr3, city, state, zip, country)
{
 	var soap = null;
 	soap = '\t<soap:Body>\n';
 		soap += '\t\t<Validate xmlns="http://avatax.avalara.com/services">\n';
 			soap += '\t\t\t<ValidateRequest>\n';
 				soap += '\t\t\t\t<Address>\n';
 					soap += '\t\t\t\t\t<AddressCode>1</AddressCode>\n';
 					soap += '\t\t\t\t\t<Line1><![CDATA[' + ((addr1 != null) ? Trim(addr1) : '') + ']]></Line1>\n';
 					soap += '\t\t\t\t\t<Line2><![CDATA[' + ((addr2 != null) ? Trim(addr2) : '') + ']]></Line2>\n';
 					soap += '\t\t\t\t\t<Line3><![CDATA[' + ((addr3 != null) ? Trim(addr3) : '') + ']]></Line3>\n';
 					soap += '\t\t\t\t\t<City><![CDATA[' + ((city != null) ? Trim(city) : '') + ']]></City>\n';
 					soap += '\t\t\t\t\t<Region><![CDATA[' + ((state != null) ? Trim(state) : '') + ']]></Region>\n';
 					soap += '\t\t\t\t\t<PostalCode><![CDATA[' + ((zip != null) ? Trim(zip) : '') + ']]></PostalCode>\n';
					var ReturnCountryName = AVA_CheckCountryName(country != null ? Trim(country) : '');
 					soap += '\t\t\t\t\t<Country><![CDATA[' + ReturnCountryName[1] + ']]></Country>\n';
 				soap += '\t\t\t\t</Address>\n';	
 				soap += '\t\t\t\t<TextCase>' + ((AVA_AddUpperCase == true || AVA_AddUpperCase == 'T') ? 'Upper' : 'Default') + '</TextCase>\n'; 				
				soap += '\t\t\t\t<Coordinates>false</Coordinates>\n';
 			soap += '\t\t\t</ValidateRequest>\n';
 		soap += '\t\t</Validate>\n';
 	soap += '\t</soap:Body>\n';
 	
 	return soap;
}


}

{/********************************SCHEDULED FUNCTIONS*************************************************/


function AVA_ValidateBatchAddresses()
{
	AVA_ReadConfig('0');
	var scriptContext = nlapiGetContext();
	nlapiLogExecution('Debug','Scheduled Script','Start');	
		
	var batchFilter = new Array();
	batchFilter[0] = new nlobjSearchFilter('custrecord_ava_status', null, 'lessthan', 2);
	
	var batchCol = new Array();
	batchCol[0] = new nlobjSearchColumn('custrecord_ava_recordtype');
	
	var searchResult = nlapiSearchRecord('customrecord_avaaddressvalidationbatch', null, batchFilter, batchCol);
	
	for(var i = 0; nlapiGetContext().getRemainingUsage() > MinUsage && searchResult != null && i < searchResult.length ; i++)
	{	
		nlapiSubmitField('customrecord_avaaddressvalidationbatch', searchResult[i].getId(), 'custrecord_ava_status', 1);
			
		nlapiLogExecution('Debug','searchResult: ' + i , ' ID: ' + searchResult[i].getId());	
		if(searchResult[i].getValue('custrecord_ava_recordtype') == 'c')
		{	nlapiLogExecution('Debug','Record type' ,'Customer');	
			AVA_ValidateCustomerAddress(searchResult[i].getId());
		}
		else if(searchResult[i].getValue('custrecord_ava_recordtype') == 'l')
		{	nlapiLogExecution('Debug','Record type' ,'Location');
			AVA_ValidateLocationAddress(searchResult[i].getId());
		}	
	}
	if(nlapiGetContext().getRemainingUsage() > MinUsage)
	{
		var batchFilter1 = new Array();
		batchFilter1[0] = new nlobjSearchFilter('custrecord_ava_status', null, 'lessthan', 2);
		
		var searchResult1 = nlapiSearchRecord('customrecord_avaaddressvalidationbatch', null, batchFilter1, null);
		if(searchResult1 != null && searchResult1.length > 0 )
		{
			AVA_ValidateBatchAddresses();	
		}
	}
	else
	{
		nlapiScheduleScript(scriptContext.getScriptId() , scriptContext.getDeploymentId());	
	}
}


function AVA_ValidateCustomerAddress(BatchId)
{	
	var c = 0;
	var batchRecord = nlapiLoadRecord('customrecord_avaaddressvalidationbatch', BatchId);
	
	totalRec = batchRecord.getFieldValue('custrecord_ava_totaladdresses');
	valCorrect = batchRecord.getFieldValue('custrecord_ava_validaddresses');
	valFail = batchRecord.getFieldValue('custrecord_ava_invalidaddresses');
	lastProcessedId = batchRecord.getFieldValue('custrecord_ava_lastprocessedid');
			
	var recordFilter = new Array();
	
	var recordType = batchRecord.getFieldValue('custrecord_ava_customersubtype');
	recordType = (recordType == 'l' ? 'LEAD' : (recordType == 'p' ? 'PROSPECT' : 'CUSTOMER'));
	nlapiLogExecution('Debug','Sub Record Type: ' + recordType);	

	//filter only active records
	if(batchRecord.getFieldValue('custrecord_ava_onlyactive') == 'T')
	{
		recordFilter[recordFilter.length] =  new nlobjSearchFilter('isinactive', null, 'is', 'F');
		nlapiLogExecution('Debug','isinactive: ' + 'F');
	}
		
	// to filter as per customer type: Individual or Company	
	if(batchRecord.getFieldValue('custrecord_ava_customertype') != 'b')
	{
		var isPerson = batchRecord.getFieldValue('custrecord_ava_customertype') == 'i' ? 'T' : 'F';
		recordFilter[recordFilter.length] =  new nlobjSearchFilter('isperson', null, 'is', isPerson);
		nlapiLogExecution('Debug','isPerson: ' + isPerson);
	}

	if(batchRecord.getFieldValue('custrecord_ava_customerstartdate') != null && batchRecord.getFieldValue('custrecord_ava_customerstartdate').length > 0 && batchRecord.getFieldValue('custrecord_ava_customerenddate') != null && batchRecord.getFieldValue('custrecord_ava_customerenddate').length > 0)
	{
		recordFilter[recordFilter.length] =  new nlobjSearchFilter('datecreated', null, 'within', new Date(batchRecord.getFieldValue('custrecord_ava_customerstartdate')), new Date(batchRecord.getFieldValue('custrecord_ava_customerenddate')));
		nlapiLogExecution('Debug','datecreated: ' + batchRecord.getFieldValue('custrecord_ava_customerstartdate') + ' - ' + batchRecord.getFieldValue('custrecord_ava_customerenddate'));
	}
	
	if(lastProcessedId != null && lastProcessedId.length > 0)
	{
		recordFilter[recordFilter.length] =  new nlobjSearchFilter('INTERNALIDNUMBER', null, 'greaterthan', parseInt(lastProcessedId));
		nlapiLogExecution('Debug','lastProcessedId: ' + lastProcessedId);
	}
	
	var cols = new Array();
	cols[cols.length] = new nlobjSearchColumn('internalid', null, null);
	cols[cols.length]= cols[0].setSort();
	
	var custResult = nlapiSearchRecord('customer', null, recordFilter, cols);
	
	try
	{
		//for to loop thru the customer records
		for(  ; nlapiGetContext().getRemainingUsage() > MinUsage && custResult != null && c < custResult.length ; c++ )
		{
			try
			{
				var customer = nlapiLoadRecord('customer', custResult[c].getId());
				var CustId = custResult[c].getId();
				
				if(customer.getFieldValue('stage') == recordType)
				{
					var addType = batchRecord.getFieldValue('custrecord_ava_custaddresstype');
					
					for( var addr = 1 ; customer.getLineItemCount('addressbook') != null && addr <= customer.getLineItemCount('addressbook') ; addr++ )
					{
						var createFlag = (addType == 'a' || ((addType == 'bs' || addType == 'b') && customer.getLineItemValue('addressbook', 'defaultbilling', addr) == 'T') || ((addType == 'bs' || addType == 's') && customer.getLineItemValue('addressbook', 'defaultshipping', addr) == 'T')) ? true : false;
						
						if(createFlag)
						{
							var detailRecord = nlapiCreateRecord('customrecord_avaaddvalidationbatchrecord');
							detailRecord.setFieldValue('custrecord_ava_validationbatch', batchRecord.getId());
							
							//save values based on record type
							detailRecord.setFieldValue('custrecord_ava_validationaddressid', customer.getLineItemValue('addressbook', 'addressid', addr));
							
							var custAddType = (customer.getLineItemValue('addressbook', 'defaultbilling', addr) == 'T' && customer.getLineItemValue('addressbook', 'defaultshipping', addr) == 'T') ? 'd' : ((customer.getLineItemValue('addressbook', 'defaultbilling', addr) == 'T') ? 'b' : ((customer.getLineItemValue('addressbook', 'defaultshipping', addr) == 'T') ? 's' : ''));
							detailRecord.setFieldValue('custrecord_ava_addresstype', custAddType);
							detailRecord.setFieldValue('custrecord_ava_validatedrecordtype', batchRecord.getFieldValue('custrecord_ava_recordtype'));
							detailRecord.setFieldValue('custrecord_ava_validatedrecordid', custResult[c].getId());
							
							var orig_add1 = customer.getLineItemValue('addressbook', 'addr1', addr);
							var orig_add2 = customer.getLineItemValue('addressbook', 'addr2', addr);
							var orig_city = customer.getLineItemValue('addressbook', 'city', addr);
							var orig_state = customer.getLineItemValue('addressbook', 'state', addr);
							var orig_zip = customer.getLineItemValue('addressbook', 'zip', addr);
							var orig_country = customer.getLineItemValue('addressbook', 'country', addr);	
							var orig_AddressId = customer.getLineItemValue('addressbook', 'addressid', addr);
							
							//Original Address
							detailRecord.setFieldValue('custrecord_ava_origline1', orig_add1);
							detailRecord.setFieldValue('custrecord_ava_origline2', orig_add2);
			//				detailRecord.setFieldValue('custrecord_ava_origline3', '');
							detailRecord.setFieldValue('custrecord_ava_origcity', orig_city);
							detailRecord.setFieldValue('custrecord_ava_origstate', orig_state);
							detailRecord.setFieldValue('custrecord_ava_origzip', orig_zip);
							detailRecord.setFieldValue('custrecord_ava_origcountry', orig_country);
							
							//Validate the above address and save it in the record
							var msg = AVA_ValidateAddress(orig_add1, orig_add2, '', orig_city, orig_state, orig_zip, orig_country);					
							
							if(msg == null || (msg != null && msg.length == 0))
							{
								detailRecord.setFieldValue('custrecord_ava_validatedline1', ((validatedLine1 != null) ? validatedLine1 : ''));
								detailRecord.setFieldValue('custrecord_ava_validatedline2', ((validatedLine2 != null) ? validatedLine2 : ''));
			//					detailRecord.setFieldValue('custrecord_ava_validatedline3', ((validatedLine3 != null) ? validatedLine3 : ''));
								detailRecord.setFieldValue('custrecord_ava_validatedcity', validatedCity);
								detailRecord.setFieldValue('custrecord_ava_validatedstate', validatedRegion);
								detailRecord.setFieldValue('custrecord_ava_validatedzip', validatedPostalCode);

								var StateCheck = AVA_CheckCountryName(validatedRegion);
								var Country = (StateCheck[0] == 0 ? validatedRegion : validatedCountry);
								
								detailRecord.setFieldValue('custrecord_ava_validatedcountry', Country);
								detailRecord.setFieldValue('custrecord_ava_validationstatus', '1');//Validated
							}
							else
							{
								detailRecord.setFieldValue('custrecord_ava_errormsg', msg);
								detailRecord.setFieldValue('custrecord_ava_validationstatus', '2');//Error
							}	
							
							var detailRecId = nlapiSubmitRecord(detailRecord);
							
							if(detailRecord.getFieldValue('custrecord_ava_validationstatus') == '1')
							{
								valCorrect++;
							}
							else
							{
								valFail++;
							}
							
							totalRec++;				
							
							// Auto update customer addresses if Automatic is selected in config				
							if(AVA_AddBatchProcessing == 1 && detailRecord.getFieldValue('custrecord_ava_validationstatus') == 1)
							{
								try
								{
									customer.setLineItemValue('addressbook', 'addr1', addr, validatedLine1);
									customer.setLineItemValue('addressbook', 'addr2', addr, validatedLine2);
									customer.setLineItemValue('addressbook', 'city', addr, validatedCity);
									customer.setLineItemValue('addressbook', 'state', addr, validatedRegion);
									customer.setLineItemValue('addressbook', 'zip', addr, validatedPostalCode);
									customer.setLineItemValue('addressbook', 'country', addr, Country);	
									nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', detailRecId, 'custrecord_ava_validationstatus', '4');				
								
								}
								catch(err)
								{
									//Updation Failed
									nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', detailRecId, 'custrecord_ava_validationstatus', '5');					
								}								
							}
						}
					}	
					
					if(AVA_AddBatchProcessing == 1)
					{
						var custId = nlapiSubmitRecord(customer);							
					}
				}
			}	
			catch(err)
			{
				nlapiLogExecution('Error','Got Error while processing records for Customer: ', custResult[c].getId());
			}
			finally
			{
				// If the execution has not completed because of usage exceeded or some other issue, update the status
				fields = new Array();
				values = new Array();
				
				//percentage of number of customers processed
				fields[fields.length] = 'custrecord_ava_progress';
				values[values.length] = Math.ceil((c/custResult.length) * 100);			
						
				fields[fields.length] = 'custrecord_ava_totaladdresses';
				values[values.length] = totalRec;
				
				fields[fields.length] = 'custrecord_ava_validaddresses';
				values[values.length] = valCorrect;
				
				fields[fields.length] = 'custrecord_ava_invalidaddresses';
				values[values.length] = valFail;
				
				nlapiSubmitField('customrecord_avaaddressvalidationbatch', BatchId, fields, values);		
			}
		}
	}
	catch(e)
	{
		nlapiLogExecution('Error','Got Error while processing records for Customer: ', custResult[c].getId());
	}
	finally
	{
		// If the execution has not completed because of usage exceeded or some other issue, update the status
		fields = new Array();
		values = new Array();
								
		fields[fields.length] = 'custrecord_ava_status';
		values[values.length] = (custResult != null && c < custResult.length) ? '1' : (AVA_AddBatchProcessing == 1 ? '5' : '2');
		
		if((custResult != null && c >= custResult.length))
		{
			fields[fields.length] = 'custrecord_ava_progress';
			values[values.length] = 100;	
		}
		
		if(c > 0)
		{
			fields[fields.length] = 'custrecord_ava_lastprocessedid';
			values[values.length] = custResult[c-1].getId();
		}
		
		nlapiSubmitField('customrecord_avaaddressvalidationbatch', BatchId, fields, values);

	}

}

function AVA_UpdateCoordinates(CustId, AddressId, Latitude, Longitude)
{
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_ava_custid', null, 'anyof', CustId);
	filters[1] = new nlobjSearchFilter('custrecord_ava_addid', null, 'is', AddressId);
	
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('custrecord_ava_custid');
	cols[1] = new nlobjSearchColumn('custrecord_ava_addid');
	cols[2] = new nlobjSearchColumn('custrecord_ava_latitude');
	cols[3] = new nlobjSearchColumn('custrecord_ava_longitude');
	cols[4] = new nlobjSearchColumn('custrecord_ava_customerinternalid');

	var searchresult = nlapiSearchRecord('customrecord_avacoordinates', null, filters, cols);				
	if (searchresult != null)
	{
		for (var i = 0; i < searchresult.length; i++)
		{
			var fields = new Array();
			fields[0] = 'custrecord_ava_custid';
			fields[1] = 'custrecord_ava_addid';
			fields[2] = 'custrecord_ava_latitude';
			fields[3] = 'custrecord_ava_longitude';
			fields[4] = 'custrecord_ava_customerinternalid';

			var values = new Array();
			values[0] = CustId;					
			values[1] = AddressId;					
			values[2] = Latitude;					
			values[3] = Longitude;					
			values[4] = CustId;					
			
			nlapiSubmitField('customrecord_avacoordinates', searchresult[i].getId(), fields, values);
		}
	}
	else
	{
		var record = nlapiCreateRecord('customrecord_avacoordinates');	
		record.setFieldValue('custrecord_ava_custid', CustId);
		record.setFieldValue('custrecord_ava_addid', AddressId);
		record.setFieldValue('custrecord_ava_latitude', Latitude);
		record.setFieldValue('custrecord_ava_longitude', Longitude);
		record.setFieldValue('custrecord_ava_customerinternalid', CustId);
		var recid = nlapiSubmitRecord(record);						
	}
}

function AVA_ValidateLocationAddress(BatchId)
{
	var l = 0;
	var batchRecord = nlapiLoadRecord('customrecord_avaaddressvalidationbatch', BatchId);
	var includeSub = batchRecord.getFieldValue('custrecord_ava_includesublocations');
	
	totalRec = batchRecord.getFieldValue('custrecord_ava_totaladdresses');
	valCorrect = batchRecord.getFieldValue('custrecord_ava_validaddresses');
	valFail = batchRecord.getFieldValue('custrecord_ava_invalidaddresses');
	lastProcessedId = batchRecord.getFieldValue('custrecord_ava_lastprocessedid');

			
	var recordFilter = new Array();
	
	//filter only active records
	if(batchRecord.getFieldValue('custrecord_ava_onlyactive') == 'T')
	{
		recordFilter[recordFilter.length] =  new nlobjSearchFilter('isinactive', null, 'is', 'F');
	}
		
	// to filter specific locations
	if(batchRecord.getFieldValue('custrecord_ava_locationaddresstype') == 'p')
	{	
		recordFilter[recordFilter.length] =  new nlobjSearchFilter('internalid', null, 'anyof', batchRecord.getFieldValues('custrecord_ava_locationlist'));
	}
	
	if(lastProcessedId != null && lastProcessedId.length > 0)
	{
		recordFilter[recordFilter.length] =  new nlobjSearchFilter('INTERNALIDNUMBER', null, 'greaterthan', parseInt(lastProcessedId));
	}
	
	var cols = new Array();
	cols[cols.length] = new nlobjSearchColumn('internalid', null, null);
	cols[cols.length]= cols[0].setSort();

	var locResult = nlapiSearchRecord('location', null, recordFilter, null);
	var processedLocIds = new Array(); // array to take care of Include-Sub Location feature
		
	try
	{
		for( ;  nlapiGetContext().getRemainingUsage() > MinUsage && locResult != null && l < locResult.length ; l++)
		{
			try
			{
				var processFlag = true;
				
				//to loop thru processed Location Ids
				for( var p = 0; processedLocIds != null && p < processedLocIds.length ; p++ )
				{
					if(processedLocIds[p] == locResult[l].getId())
					{
						processFlag = false;
						break;
					}
				}
				
				if(processFlag)
				{
					if(batchRecord.getFieldValue('custrecord_ava_includesublocations') == 'T')
					{
						var subLocFilter = new Array();
												
						//filter only active records
						if(batchRecord.getFieldValue('custrecord_ava_onlyactive') == 'T')
						{
							subLocFilter[subLocFilter.length] =  new nlobjSearchFilter('isinactive', null, 'is', 'F');
						}
						
						subLocFilter[subLocFilter.length] =  new nlobjSearchFilter('parent', null, 'is', locResult[l].getId());
					
						var locSubResult = nlapiSearchRecord('location', null, subLocFilter, null);
						
						for(var sl= 0 ; locSubResult != null && sl < locSubResult.length ; sl++)
						{
							var subLocFlag = true;
							//to loop thru processed Location Ids
							for( var p = 0; processedLocIds != null && p < processedLocIds.length ; p++ )
							{
								if(processedLocIds[p] == locSubResult[sl].getId())
								{
									subLocFlag = false;
									break;
								}
							}
								
							if(subLocFlag)
							{
								var detailRecord = nlapiCreateRecord('customrecord_avaaddvalidationbatchrecord');
								detailRecord.setFieldValue('custrecord_ava_validationbatch', batchRecord.getId());
								
								//save values based on record type
		//						detailRecord.setFieldValue('custrecord_ava_validationaddressid', customer.getLineItemValue('addressbook', 'addressid', addr));
		//						detailRecord.setFieldValue('custrecord_ava_addresstype', batchRecord.getFieldValue('custrecord_ava_custaddresstype'));// this value is not useful in this context
								detailRecord.setFieldValue('custrecord_ava_validatedrecordtype', batchRecord.getFieldValue('custrecord_ava_recordtype'));
								detailRecord.setFieldValue('custrecord_ava_validatedrecordid', locSubResult[sl].getId());
								
								var locationRec = nlapiLoadRecord('location', locResult[l].getId());
					
								var orig_add1 = locationRec.getFieldValue('addr1');
								var orig_add2 = locationRec.getFieldValue('addr2');
								var orig_city = locationRec.getFieldValue('city');
								var orig_state = locationRec.getFieldValue('state');
								var orig_zip = locationRec.getFieldValue('zip');
								var orig_country = locationRec.getFieldValue('country');	
								
								//Original Address
								detailRecord.setFieldValue('custrecord_ava_origline1', orig_add1);
								detailRecord.setFieldValue('custrecord_ava_origline2', orig_add2);
					//				detailRecord.setFieldValue('custrecord_ava_origline3', '');
								detailRecord.setFieldValue('custrecord_ava_origcity', orig_city);
								detailRecord.setFieldValue('custrecord_ava_origstate', orig_state);
								detailRecord.setFieldValue('custrecord_ava_origzip', orig_zip);
								detailRecord.setFieldValue('custrecord_ava_origcountry', orig_country);
								
								//Validate the above address and save it in the record
								var msg = AVA_ValidateAddress(orig_add1, orig_add2, '', orig_city, orig_state, orig_zip, orig_country);					
								
								if(msg == null || (msg != null && msg.length == 0))
								{
									detailRecord.setFieldValue('custrecord_ava_validatedline1', validatedLine1);
									detailRecord.setFieldValue('custrecord_ava_validatedline2', validatedLine2);
					//					detailRecord.setFieldValue('custrecord_ava_validatedline3', validatedLine3);
									detailRecord.setFieldValue('custrecord_ava_validatedcity', validatedCity);
									detailRecord.setFieldValue('custrecord_ava_validatedstate', validatedRegion);
									detailRecord.setFieldValue('custrecord_ava_validatedzip', validatedPostalCode);

									var StateCheck = AVA_CheckCountryName(validatedRegion);
									var Country = (StateCheck[0] == 0 ? validatedRegion : validatedCountry);
									
									detailRecord.setFieldValue('custrecord_ava_validatedcountry', Country);
									detailRecord.setFieldValue('custrecord_ava_validationstatus', '1');//Validated
								}
								else
								{
									detailRecord.setFieldValue('custrecord_ava_errormsg', msg);
									detailRecord.setFieldValue('custrecord_ava_validationstatus', '2');//Error
								}				
								
								var detailRecId = nlapiSubmitRecord(detailRecord);	
								processedLocIds[processedLocIds.length] = locSubResult[sl].getId();
								
								if(detailRecord.getFieldValue('custrecord_ava_validationstatus') == '1')
								{
									valCorrect++;
								}
								else
								{
									valFail++;
								}
								
								totalRec++;	
								
								// Auto update location addresses if Automatic is selected in config				
								if(AVA_AddBatchProcessing == 1 && detailRecord.getFieldValue('custrecord_ava_validationstatus') == '1')
								{
									try
									{
										locationRec.setFieldValue('addr1', validatedLine1);
										locationRec.setFieldValue('addr2', validatedLine2);
										locationRec.setFieldValue('city', validatedCity);
										locationRec.setFieldValue('state', validatedRegion);
										locationRec.setFieldValue('zip', validatedPostalCode);
										locationRec.setFieldValue('country', Country);
										
										var locId = nlapiSubmitRecord(locationRec);
										
										nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', detailRecId, 'custrecord_ava_validationstatus', '4');
									}
									catch(err)
									{
										//Updation Failed
										nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', detailRecId, 'custrecord_ava_validationstatus', '5');					
									}
								}						
							}
						}				
										
					}			
					
					var detailRecord = nlapiCreateRecord('customrecord_avaaddvalidationbatchrecord');
					detailRecord.setFieldValue('custrecord_ava_validationbatch', batchRecord.getId());
					
					//save values based on record type
		//			detailRecord.setFieldValue('custrecord_ava_validationaddressid', customer.getLineItemValue('addressbook', 'addressid', addr));
		//			detailRecord.setFieldValue('custrecord_ava_addresstype', batchRecord.getFieldValue('custrecord_ava_custaddresstype'));// this value is not useful in this context
					detailRecord.setFieldValue('custrecord_ava_validatedrecordtype', batchRecord.getFieldValue('custrecord_ava_recordtype'));
					detailRecord.setFieldValue('custrecord_ava_validatedrecordid', locResult[l].getId());
					
					var locationRec = nlapiLoadRecord('location', locResult[l].getId());
					
					var orig_add1 = locationRec.getFieldValue('addr1');
					var orig_add2 = locationRec.getFieldValue('addr2');
					var orig_city = locationRec.getFieldValue('city');
					var orig_state = locationRec.getFieldValue('state');
					var orig_zip = locationRec.getFieldValue('zip');
					var orig_country = locationRec.getFieldValue('country');	
					
					//Original Address
					detailRecord.setFieldValue('custrecord_ava_origline1', orig_add1);
					detailRecord.setFieldValue('custrecord_ava_origline2', orig_add2);
		//				detailRecord.setFieldValue('custrecord_ava_origline3', '');
					detailRecord.setFieldValue('custrecord_ava_origcity', orig_city);
					detailRecord.setFieldValue('custrecord_ava_origstate', orig_state);
					detailRecord.setFieldValue('custrecord_ava_origzip', orig_zip);
					detailRecord.setFieldValue('custrecord_ava_origcountry', orig_country);
					
					//Validate the above address and save it in the record
					var msg = AVA_ValidateAddress(orig_add1, orig_add2, '', orig_city, orig_state, orig_zip, orig_country);					
					
					if(msg == null || (msg != null && msg.length == 0))
					{
						detailRecord.setFieldValue('custrecord_ava_validatedline1', ((validatedLine1 != null) ? validatedLine1 : ''));
						detailRecord.setFieldValue('custrecord_ava_validatedline2', ((validatedLine2 != null) ? validatedLine2 : ''));
		//					detailRecord.setFieldValue('custrecord_ava_validatedline3', ((validatedLine3 != null) ? validatedLine3 : ''));
						detailRecord.setFieldValue('custrecord_ava_validatedcity', validatedCity);
						detailRecord.setFieldValue('custrecord_ava_validatedstate', validatedRegion);
						detailRecord.setFieldValue('custrecord_ava_validatedzip', validatedPostalCode);

						var StateCheck = AVA_CheckCountryName(validatedRegion);
						var Country = (StateCheck[0] == 0 ? validatedRegion : validatedCountry);

						detailRecord.setFieldValue('custrecord_ava_validatedcountry', Country);
						detailRecord.setFieldValue('custrecord_ava_validationstatus', '1');//Validated
					}
					else
					{
						detailRecord.setFieldValue('custrecord_ava_errormsg', msg);
						detailRecord.setFieldValue('custrecord_ava_validationstatus', '2');//Error
					}				
					
					var detailRecId = nlapiSubmitRecord(detailRecord);
					processedLocIds[processedLocIds.length] = locResult[l].getId();
					
					if(detailRecord.getFieldValue('custrecord_ava_validationstatus') == '1')
					{
						valCorrect++;
					}
					else
					{
						valFail++;
					}
					
					totalRec++;	
					
					// Auto update location addresses if Automatic is selected in config				
					if(AVA_AddBatchProcessing == 1 && detailRecord.getFieldValue('custrecord_ava_validationstatus') == '1')
					{
						try
						{
							locationRec.setFieldValue('addr1', validatedLine1);
							locationRec.setFieldValue('addr2', validatedLine2);
							locationRec.setFieldValue('city', validatedCity);
							locationRec.setFieldValue('state', validatedRegion);
							locationRec.setFieldValue('zip', validatedPostalCode);
							locationRec.setFieldValue('country', Country);
							
							var locId = nlapiSubmitRecord(locationRec);
							
							nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', detailRecId, 'custrecord_ava_validationstatus', '4');
						}														
						catch(err)
						{
							//Updation Failed
							nlapiSubmitField('customrecord_avaaddvalidationbatchrecord', detailRecId, 'custrecord_ava_validationstatus', '5');					
						}
					}
				}
			}
			catch(err)
			{
				nlapiLogExecution('Error','Got Error while processing records for Location: ', locResult[l].getId());
			}
			finally
			{
				// If the execution has not completed because of usage exceeded or some other issue, update the status
				fields = new Array();
				values = new Array();
				
				//percentage of number of locations processed
				fields[fields.length] = 'custrecord_ava_progress';
				values[values.length] = Math.ceil((l/locResult.length) * 100);			
						
				fields[fields.length] = 'custrecord_ava_totaladdresses';
				values[values.length] = totalRec;
				
				fields[fields.length] = 'custrecord_ava_validaddresses';
				values[values.length] = valCorrect;
				
				fields[fields.length] = 'custrecord_ava_invalidaddresses';
				values[values.length] = valFail;
				
				nlapiSubmitField('customrecord_avaaddressvalidationbatch', BatchId, fields, values);	
			}
		}
	}
	catch(e)
	{
		nlapiLogExecution('Error','Got Error while processing records for Location: ', locResult[l].getId());
	}
	finally
	{
		// If the execution has not completed because of usage exceeded or some other issue, update the status
		fields = new Array();
		values = new Array();
								
		fields[fields.length] = 'custrecord_ava_status';
		values[values.length] = (locResult != null && l < locResult.length) ? '1' : (AVA_AddBatchProcessing == 1 ? '5' : '2');
					
		if((locResult != null && l >= locResult.length))
		{
			fields[fields.length] = 'custrecord_ava_progress';
			values[values.length] = 100;	
		}			
					
		if(l > 0)
		{				
			fields[fields.length] = 'custrecord_ava_lastprocessedid';
			values[values.length] = locResult[l-1].getId();
		}
		
		nlapiSubmitField('customrecord_avaaddressvalidationbatch', BatchId, fields, values);	
	}
	
}

function AVA_UpdateValidatedAddress()
{
	// TODO: Fetch batches with status 4
	// Filter detail records which are marked as To be Saved status of 3
	// Update the validated addresses into main records one by one.
	
	var batchFilter = new Array();
	batchFilter[0] = new nlobjSearchFilter('custrecord_ava_status', null, 'equalto', 4);
	
	var batchCol = new Array();
	batchCol[0] = new nlobjSearchColumn('custrecord_ava_recordtype');	
	
	var searchResult = nlapiSearchRecord('customrecord_avaaddressvalidationbatch', null, batchFilter, batchCol);
	
	for(var i = 0; nlapiGetContext().getRemainingUsage() > MinUsage && searchResult != null && i < searchResult.length ; i++)
	{
		var detailRecFilter = new Array();
		detailRecFilter[detailRecFilter.length] = new nlobjSearchFilter('custrecord_ava_validationbatch', null, 'anyof', searchResult[i].getId());
		detailRecFilter[detailRecFilter.length] = new nlobjSearchFilter('custrecord_ava_validationstatus', null, 'is', '3');
		
		var cols = new Array();
		cols[cols.length] = new nlobjSearchColumn('internalid', null, null);
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validationbatch');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedrecordtype');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedrecordid');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validationaddressid');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedline1');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedline2');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedline3');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedcity');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedstate');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedzip');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validatedcountry');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_errormsg');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_validationstatus');
		cols[cols.length] = new nlobjSearchColumn('custrecord_ava_addresstype');
	
		var detailRecords = nlapiSearchRecord('customrecord_avaaddvalidationbatchrecord', null, detailRecFilter, cols);
		nlapiLogExecution('Debug','Batch Records Search Length',detailRecords.length);	
		for(var j=0; nlapiGetContext().getRemainingUsage() > MinUsage && detailRecords != null && j < detailRecords.length ; j++)
		{
			try
			{
				nlapiLogExecution('Debug','searchResult: ' + i , ' ID: ' + searchResult[i].getId());	
				if(searchResult[i].getValue('custrecord_ava_recordtype') == 'c')
				{	
					nlapiLogExecution('Debug','Record type' ,'Customer');
					var customer = nlapiLoadRecord('customer', detailRecords[j].getValue('custrecord_ava_validatedrecordid'));
					
					for(var addr=1; customer.getLineItemCount('addressbook') != null && addr <= customer.getLineItemCount('addressbook'); addr++)
					{
						if(customer.getLineItemValue('addressbook', 'addressid', addr) == detailRecords[j].getValue('custrecord_ava_validationaddressid'))
						{
							customer.setLineItemValue('addressbook', 'addr1', addr, detailRecords[j].getValue('custrecord_ava_validatedline1'));
							customer.setLineItemValue('addressbook', 'addr2', addr, detailRecords[j].getValue('custrecord_ava_validatedline2'));
							customer.setLineItemValue('addressbook', 'city', addr, detailRecords[j].getValue('custrecord_ava_validatedcity'));
							customer.setLineItemValue('addressbook', 'state', addr, detailRecords[j].getValue('custrecord_ava_validatedstate'));
							customer.setLineItemValue('addressbook', 'zip', addr, detailRecords[j].getValue('custrecord_ava_validatedzip'));
							customer.setLineItemValue('addressbook', 'country', addr, detailRecords[j].getValue('custrecord_ava_validatedcountry'));
							//AVA_UpdateCoordinates(detailRecords[j].getValue('custrecord_ava_validatedrecordid'), detailRecords[j].getValue('custrecord_ava_validationaddressid'), detailRecords[j].getValue('custrecord_ava_validatedlatitude'), detailRecords[j].getValue('custrecord_ava_validatedlongitude'));
							customer.setLineItemValue('addressbook', 'country', addr, detailRecords[j].getValue('custrecord_ava_validatedcountry'));
						}
					}
					var custId = nlapiSubmitRecord(customer);
				}
				else if(searchResult[i].getValue('custrecord_ava_recordtype') == 'l')
				{	
					nlapiLogExecution('Debug','Record type' ,'Location');
				
					var locationRec = nlapiLoadRecord('location', detailRecords[j].getValue('custrecord_ava_validatedrecordid'));
					
					locationRec.setFieldValue('addr1', detailRecords[j].getValue('custrecord_ava_validatedline1'));
					locationRec.setFieldValue('addr2', detailRecords[j].getValue('custrecord_ava_validatedline2'));
					locationRec.setFieldValue('city', detailRecords[j].getValue('custrecord_ava_validatedcity'));
					locationRec.setFieldValue('state', detailRecords[j].getValue('custrecord_ava_validatedstate'));
					locationRec.setFieldValue('zip', detailRecords[j].getValue('custrecord_ava_validatedzip'));
					locationRec.setFieldValue('country', detailRecords[j].getValue('custrecord_ava_validatedcountry'));
					
					var locId = nlapiSubmitRecord(locationRec);
				}	
			
				nlapiSubmitField('customrecord_avaaddvalidationbatchrecord',detailRecords[j].getId(), 'custrecord_ava_validationstatus', '4');		
				
			}
			catch(err)
			{
				nlapiLogExecution('Debug','Updation of Record: ' + searchResult[i].getValue('custrecord_ava_recordtype') + ' with ID: ' + detailRecords[j].getValue('custrecord_ava_validatedrecordid') + ' was not successful.');				
				nlapiLogExecution('Debug','err: ' ,err);	
			}			
		}		
		
		//Update Batch Status with 5: Updation Completed
		if(nlapiGetContext().getRemainingUsage() > MinUsage && j == detailRecords.length)
		{
			nlapiSubmitField('customrecord_avaaddressvalidationbatch', searchResult[i].getId(), 'custrecord_ava_status', '5');		
		}
	}
	
}

//Scheduled Script for deletion of Custom records
function AVA_DeleteAddressValidationRecords()
{
	while(nlapiGetContext().getRemainingUsage() > MinUsage)
	{	
		nlapiLogExecution('Debug','Start Deletion','');
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_ava_status', null, 'equalto', 6);
	 	
		var searchResult = nlapiSearchRecord('customrecord_avaaddressvalidationbatch', null, filters, null);

		if(searchResult != null && searchResult.length > 0)
		{
			for(var i=0; nlapiGetContext().getRemainingUsage() > MinUsage && i < searchResult.length ; i++)
			{					
				while(nlapiGetContext().getRemainingUsage() > MinUsage)
				{						
					var  delCtr = 0, custfilters = new Array();		
					custfilters[0] = new nlobjSearchFilter('custrecord_ava_validationbatch', null, 'anyof', searchResult[i].getId());
							  
					try
					{
						var searchCust = nlapiSearchRecord('customrecord_avaaddvalidationbatchrecord', null, custfilters, null);
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
							nlapiLogExecution('Debug','Batch records searchCust:',searchCust.length);
														
							for(var k=0; nlapiGetContext().getRemainingUsage() > MinUsage && k < searchCust.length ; k++)
							{			
								nlapiDeleteRecord('customrecord_avaaddvalidationbatchrecord', searchCust[k].getId());
								nlapiLogExecution('Debug','record deleted', searchCust[k].getId());
							}
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
						nlapiDeleteRecord('customrecord_avaaddressvalidationbatch', searchResult[i].getId());
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
}