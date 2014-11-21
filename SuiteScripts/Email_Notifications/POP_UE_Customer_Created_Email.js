function sendCustomerCreatedEmail(type) {
	if(type == 'create' && nlapiGetContext().getExecutionContext() === "webstore"){
		try{
			var customer = nlapiGetNewRecord();
			if( EmialConfiguration.isEmailAvaialable(customer.getFieldValue('email')) == false ){
				nlapiLogExecution('ERROR', 'Attempt to send email : ', "NO. Customer email is empty. RecordId : " + customer.getId() + " . Exiting from execution.");
				return;				
			}
			var parentCompanyId = customer.getFieldValue('parent');
			if( ( parentCompanyId in EmialConfiguration.WS_INTEGRATION_CSTMR_PARENT_COMPANIES ) == false){
				//subscribeForNewsLetters(customer);
				var resultString = tryPrepareAndSendEmail(customer);
				if(resultString == EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT){
					nlapiLogExecution('DEBUG', 'Attempt to send email : ', "OK");	
				}
				else{
					ErrorLogger.logerror(resultString, "CUSTOMER CREATED EMAIL : Error appeared on attempt to send an Email");
					//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
				}
			}
			else{
				nlapiLogExecution('DEBUG', 'Attempt to send email : ', "NO, customer is created by integration app");
			}
		}
		catch(e){
			ErrorLogger.logExceptionError(e, "CUSTOMER CREATED EMAIL : Error appeared on attempt to send an Email");
			//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
		}
	}
}
function tryPrepareAndSendEmail(customer){

	nlapiLogExecution('DEBUG', 'Attempt to send email : ', "Record Id : " + customer.getId() + " . Email : " + customer.getFieldValue('email'));
	var customTagValues = new Array();
	var customerName = customer.getFieldValue('firstname');
		if(customerName == null)
			customerName = customer.getFieldValue('entityid');
		if(customer.getFieldValue('isperson') == 'F')
			customerName = customer.getFieldValue('companyname');
		customTagValues['NL_CUSTOMER_NAME'] = customerName;
		
	//send welcome email to user if his subscription status is soft opt-in
	var subscriptionStatus = customer.getFieldValue('globalsubscriptionstatus');
	var recordsToAttachWith = new Object();
	recordsToAttachWith['entity'] = customer.getId();
	if(  subscriptionStatus == EmialConfiguration.SOFT_OPT_IN_ID)
	{
		try{
			var mergedEmailTempFile = nlapiMergeRecord(EmialConfiguration.CUSTOMER_WELCOME_EMAIL_TMPL_ID, 'customer', customer.getId(), null, null, customTagValues);
		}
		catch(e){
			throw e;
		}
		var emailSubject = mergedEmailTempFile.getName();
		var emailBody = mergedEmailTempFile.getValue();
		try{
			nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, customer.getFieldValue('email'), emailSubject, emailBody);
			//PPT-224/REQ-25 fix
			/*attach Message record to the communication tab on Customer record*/
			var message = nlapiCreateRecord('message');
			message.setFieldValue('message', emailBody);
			message.setFieldValue('subject', emailSubject);
			message.setFieldValue('author', EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID);
			message.setFieldValue('recipient', customer.getId());
			nlapiSubmitRecord(message, false);
			/*-------*/
		}
		catch(e){
			throw e;
		}
	}
	
	//send new account email
	try{
		var mergedEmailTempFile = nlapiMergeRecord(EmialConfiguration.NEW_ACCOUNT_WELCOME_EMAIL_TMPL_ID, 'customer', customer.getId(), null, null, customTagValues);
	}
	catch(e){
		throw e;
	}
	var emailSubject = mergedEmailTempFile.getName();
	var emailBody = mergedEmailTempFile.getValue();
	
	try{
		nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, customer.getFieldValue('email'), emailSubject, emailBody);
		//PPT-224/REQ-25 fix
		/*attach Message record to the communication tab on Customer record*/
		var message = nlapiCreateRecord('message');
		message.setFieldValue('message', emailBody);
		message.setFieldValue('subject', emailSubject);
		message.setFieldValue('author', EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID);
		message.setFieldValue('recipient', customer.getId());
		nlapiSubmitRecord(message, false);
		/*-------*/
	}
	catch(e){
		throw e;
	}
	
	return EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT;
}
/*
function subscribeForNewsLetters(customer) {
	var subscriptionStatus = customer.getFieldValue('globalsubscriptionstatus');
	if(subscriptionStatus == EmialConfiguration.SOFT_OPT_IN_ID)
	{
		var rec   = nlapiLoadRecord('customer',customer.getId()),
			count = rec.getLineItemCount('subscriptions');
		for(var i=1;i<=count;i++){
			var subText = rec.getLineItemText('subscriptions', 'subscription', i);
			if (subText ===  "Newsletters") {
				rec.setLineItemValue('subscriptions', 'subscribed', i, 'T');
				nlapiSubmitRecord(rec);
				break;
			}
		}
	}
}
*/