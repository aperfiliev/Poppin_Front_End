function sendCustomerCreatedEmail(type) {
	if(type == 'create' && nlapiGetContext().getExecutionContext() === "userevent"){
		try{
			var lead = nlapiGetNewRecord();
			if( EmialConfiguration.isEmailAvaialable(lead.getFieldValue('email')) == false ){
				nlapiLogExecution('ERROR', 'Attempt to send email : ', "NO. Lead email is empty. RecordId : " + lead.getId() + " . Exiting from execution.");
				return;				
			}
			var resultString = tryPrepareAndSendEmail(lead);
			if(resultString == EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT){
				nlapiLogExecution('DEBUG', 'Attempt to send email : ', "OK");	
			}
			else{
				ErrorLogger.logerror(resultString, "LEAD CREATED EMAIL : Error appeared on attempt to send an Email");
				//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
			}
		}
		catch(e){
			ErrorLogger.logExceptionError(e, "lead CREATED EMAIL : Error appeared on attempt to send an Email");
			//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
		}
	}
}
function tryPrepareAndSendEmail(lead){
	
	//var customTagValues = new Array();
	//send welcome email to Lead if his subscription status is soft opt-in
	nlapiLogExecution('ERROR', 'Attempt to send email : ', "Record Id : " + lead.getId() + " . Email : " + lead.getFieldValue('email'));
	var subscriptionStatus = lead.getFieldValue('globalsubscriptionstatus');
	if(subscriptionStatus == EmialConfiguration.SOFT_OPT_IN_ID){
		var leadName = lead.getFieldValue('companyname');
		//customTagValues['NL_lead_NAME'] = leadName;
			
		try{
			var mergedEmailTempFile = nlapiMergeRecord(EmialConfiguration.LEAD_WELCOME_EMAIL_TMLP_ID, 'lead', lead.getId(), null, null/*, customTagValues*/);
		}
		catch(e){
			throw e;
		}
		var emailSubject = mergedEmailTempFile.getName();
		var emailBody = mergedEmailTempFile.getValue();
		
		try{
			nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, lead.getFieldValue('email'), emailSubject, emailBody);
			//PPT-224/REQ-25 fix
			/*attach Message record to the communication tab on Lead record*/
			var message = nlapiCreateRecord('message');
			message.setFieldValue('message', emailBody);
			message.setFieldValue('subject', emailSubject);
			message.setFieldValue('author', EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID);
			message.setFieldValue('recipient', lead.getId());
			nlapiSubmitRecord(message, false);
			/*-------*/
		}
		catch(e){
			throw e;
		}
	}
	return EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT;
}
