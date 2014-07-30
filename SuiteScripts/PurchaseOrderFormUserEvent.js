function userEventBeforeLoad(type, form, request) {
	var fob = form.getField('fob');
	fob.setDefaultValue('FOB');
	
	var userId = nlapiGetUser();
	var employee = form.getField('employee');
	employee.setDefaultValue(userId);
	
	
	nlapiLogExecution('DEBUG', 'userEventBeforeLoad', 'type:' + type + ', user:' + userId + ', request:'+request);
}

function userEventBeforeSubmit(type) {
	var newRec			= nlapiGetNewRecord();
	//var context			= nlapiGetContext().getExecutionContext();
	
	//if(context == 'csvimport' && type == 'create') {
	//var total_quantity		= newRec.getFieldValue('custbody10');
		
	var lineNum = newRec.getLineItemCount('item');
	var total = 0;
	for(var j = 0; j < lineNum; j++) {
		total = total + parseInt(newRec.getLineItemValue('item', 'quantity', j+1));
	}
	newRec.setFieldValue('custbody10', total);
	
	//}
}

function userEventAfterSubmit(type) {
	
}
