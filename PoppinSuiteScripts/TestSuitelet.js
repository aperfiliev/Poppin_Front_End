/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Feb 2014     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var record = nlapiLoadRecord('customer', 275515);
	
	
	var numberOfAddresses = record.getLineItemCount('addressbook');
	nlapiLogExecution('DEBUG', 'numberOfAddresses', numberOfAddresses);

	for (var i=1; i <= numberOfAddresses; i++) 
	{
		nlapiLogExecution('DEBUG', 'Address Info1');
		var phone = record.getLineItemValue('addressbook','phone',i);
		if(phone.indexOf('ext:')>-1){
			phone = phone.replace('ext:','ext.');
			record.setLineItemValue('addressbook','phone',i, phone);
			nlapiLogExecution('DEBUG', 'Phone', phone);
			record.commitLineItem('phone');
		}
		
		nlapiLogExecution('DEBUG', 'Address Info',
				'\nphone='+
				phone);
   	}
	nlapiSubmitRecord(record);
	
	
}
