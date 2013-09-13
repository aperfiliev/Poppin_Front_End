/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2013     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var email = request.getParameter('email');
	nlapiLogExecution('DEBUG','email: ',email);
	var columns = new Array();
	columns[0]= new nlobjSearchColumn('Email');
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('email', null, 'is', email, null);
	var results = nlapiSearchRecord('customer', null, filters , columns);
	var responseObject;
	if(results!=null)
		{
			var custrecord = nlapiLoadRecord('customer', results[0].getId());
			custrecord.setFieldValue('custentity33', request.getParameter('password'));
			var result = nlapiSubmitRecord(custrecord, null, true);
			if (result){
				responseObject={
						"message" : "success",
						"customerid" : result
				};
			}
			else{
				responseObject={
						"message":"failed"
				};
			}
		}
	else{
		responseObject={
				"message":"failed"
		};
	}
	nlapiLogExecution('DEBUG','resultstring: ',JSON.stringify(responseObject));
	response.writeLine(JSON.stringify(responseObject));
}
