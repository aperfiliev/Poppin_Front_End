function userEventBeforeLoad(type, form, request) {
	nlapiLogExecution('DEBUG', 'userEventBeforeLoad', 'all works!');
	
	
}
function userEventBeforeSubmit(type) {
	
	var newRec = nlapiGetNewRecord();
	var oldRec = nlapiGetOldRecord();
	var context = nlapiGetContext().getExecutionContext();
	
	if(type == 'edit' && context == 'userevent') {
		newRec.setFieldValue('leadsource', oldRec.getFieldValue('leadsource'));
	}
	
	
	nlapiLogExecution('DEBUG', 'newRec', JSON.stringify(newRec));
	nlapiLogExecution('DEBUG', 'oldRec', JSON.stringify(oldRec));
	nlapiLogExecution('DEBUG', 'type', type);
	nlapiLogExecution('DEBUG', 'context', context);
	
	nlapiLogExecution('DEBUG', 'userEventBeforeSubmit', 'all works!');
}
function userEventAfterSubmit(type) {
	nlapiLogExecution('DEBUG', 'userEventAfterSubmit', 'all works!');
}
