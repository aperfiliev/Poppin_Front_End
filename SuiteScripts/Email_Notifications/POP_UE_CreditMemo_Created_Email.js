function sendCreditMemoEmail(type) {
	if(type == 'create'){
		try{
			var resultString = tryPrepareAndSendEmail();
			if(resultString == EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT){
				nlapiLogExecution('DEBUG', 'Attempt to send email : ', "OK");	
			}
			else{
				ErrorLogger.logerror(resultString, "RETURN (CREDIT MEMO) CREATED EMAIL : Error appeared on attempt to send an Email");
				//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
			}
		}
		catch(e){
			ErrorLogger.logExceptionError(e, "RETURN (CREDIT MEMO) : Error appeared on attempt to send an Email");
			//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
		}
	}
}
function tryPrepareAndSendEmail(){
	var creditMemo = nlapiGetNewRecord();
		var customTagValues = new Array();
		var customerId = creditMemo.getFieldValue('entity');
		var customerEmail = "";
		var customerFilters = new Array();
		var customerColumns = new Array();
			customerFilters[0] = new nlobjSearchFilter( 'internalid', null, 'is', customerId );
			customerColumns[0] = new nlobjSearchColumn( 'firstname' );
			customerColumns[1] = new nlobjSearchColumn( 'email' );
			customerColumns[2] = new nlobjSearchColumn( 'isperson' );
			customerColumns[3] = new nlobjSearchColumn( 'companyname' );
		var searchResult = nlapiSearchRecord('customer', null, customerFilters, customerColumns);
		if(searchResult == null){
			return "Can not execute search or it is empty on Return (Credit-Memo) to get customer details.";
		}
		
		customerEmail = searchResult[0].getValue('email');
		if( EmialConfiguration.isEmailAvaialable(customerEmail) == false ){
			return "Customer email is empty. RecordId : " + creditMemo.getId() + " . Exited from execution.";
		}
		nlapiLogExecution('DEBUG', 'Attempt to send email : ', "Record Id : " + creditMemo.getId() + " . Email : " + customerEmail);
		if(searchResult[0].getValue('isperson') == 'T')
			customTagValues['NL_CUSTOMER_NAME'] = searchResult[0].getValue('firstname');
		else
			customTagValues['NL_CUSTOMER_NAME'] = searchResult[0].getValue('companyname');
		try{
			var mergedEmailTempFile = nlapiMergeRecord(EmialConfiguration.CREDIT_MEMO_RETURN_EMAIL_TMPL_ID, 'creditmemo', creditMemo.getId(), null, null, customTagValues);
		}
		catch(e){
			throw e;
		}
		var emailSubject = mergedEmailTempFile.getName();
		var emailBody = mergedEmailTempFile.getValue();
		var recordsToAttachWith = new Object();
		recordsToAttachWith['transaction'] = creditMemo.getId();
		try{
			nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, customerEmail, emailSubject, emailBody, null,null,recordsToAttachWith);
		}
		catch(e){
			throw e;
		}
		return EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT;
}
