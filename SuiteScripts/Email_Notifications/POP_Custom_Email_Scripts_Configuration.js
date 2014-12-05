var EmialConfiguration = 
{ 
	SOFT_OPT_IN_ID : 1,
	SOFT_OPT_OUT_ID : 2,
	EMAIL_AUTHOR_EMPLOYEE_ID : '538457',
	CUSTOMER_WELCOME_EMAIL_TMPL_ID : 50,
	LEAD_WELCOME_EMAIL_TMLP_ID : 54,
	/*CUSTOMER_WEBLEAD_WELCOME_EMAIL_TMPL_ID : 43,*/
	SALES_ORDER_CREATED_EMAIL_TMPL_ID : 51,
	FULFILL_ITEM_CREATED_EMAIL_TMPL_ID : 52,
	CREDIT_MEMO_RETURN_EMAIL_TMPL_ID : 53,
	NEW_ACCOUNT_WELCOME_EMAIL_TMPL_ID : 49,
	BARNES_N_NOBLE_INVOICE_TMPL_ID : 66,
	GIFT_CERT_RECIEVED_EMAIL_TMPL_ID : 71,
	ERROR_EMAIL_RECIPIENTS : ['stymoshenko@malkosua.com', 'aperfiliev@malkosua.com'],
	SUCCESS_EMAIL_SEND_ATTEMPT : "ok",
	WS_INTEGRATION_CSTMR_PARENT_COMPANIES : {
		'169589' : '', '166474' : '', '113118' : '', '180442' : ''
	},
	WEB_DEPARTMENT_ID : 1,
	ALLOWED_DEPARTMENTS : {
		'1' : '', '4' : '', '5' : '', '26' : ''
	},
	WS_INTEGRATION_CSTMR_EMAILS : {
		'staplesonline@poppin.com' : '',
		'quill@poppin.com' : '',
		'indigo@poppin.com' : '',
		'staplesretail@poppin.com' : '' 
	},
	UPS_SHIPPING_METHODS_ID_LIST : {
		'2740' : '', '3680' : '', '2741' : ''
	},
	UPS_SHIPING_DETAILS_LINK : 'http://wwwapps.ups.com/etracking/tracking.cgi?track.x=0&track.y=0&InquiryNumber1=',
	isEmailAvaialable : function(email){
		if(email == '' || email == null || email == undefined)
			return false;
		return true;
	}
};
var ErrorLogger = {
	logExceptionError : function(err, subject){
		var msg = [];
		
		if (err.getCode != null) {
			msg.push('[SuiteScript exception]');
			msg.push('Error Code: {0}' + err.getCode());
			msg.push('Error Data: {0}' + err.getDetails());
			msg.push('Error Ticket: {0}' + err.getId());
			if (err.getInternalId) {
				msg.push('Record ID: {0}' + err.getInternalId());
			}
			if (err.getUserEvent) {
				msg.push('Script: {0}' + err.getUserEvent());
			}
			msg.push('User: {0}' + nlapiGetUser());
			msg.push('Role: {0}\n' + nlapiGetRole());
			
			var stacktrace = err.getStackTrace();
			if (stacktrace) {
				msg.push('Stack Trace');
				msg.push('\n---------------------------------------------');
				
				if (stacktrace.length > 20) {
					msg.push('**stacktrace length > 20**');
					msg.push(stacktrace);
				} else {
					msg.push('**stacktrace length < 20**');
					for (var i = 0; stacktrace != null && i < stacktrace.length; i++) {
						msg.push(stacktrace[i]);
					}
				}
			}
		} else {
			msg.push('[javascript exception]');
			msg.push('User: {0}' + nlapiGetUser());
			msg.push(err.toString());
		}
		
		nlapiLogExecution('error', subject, msg);
		
		var context = nlapiGetContext();
		var companyId = context.getCompany();
		var environment = context.getEnvironment();
		subject = "An Error Has Occurred - " + subject + '(NS Acct #' + companyId + ' ' + environment + ')';
		nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, EmialConfiguration.ERROR_EMAIL_RECIPIENTS, subject, msg); // 10 Units
	},
	logerror : function(msg, subject){
		nlapiLogExecution('error', subject, msg);
		
		var context = nlapiGetContext();
		var companyId = context.getCompany();
		var environment = context.getEnvironment();
		subject = "An Error Has Occurred - " + subject + '(NS Acct #' + companyId + ' ' + environment + ')';
		nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, EmialConfiguration.ERROR_EMAIL_RECIPIENTS, subject, msg);
	}
}