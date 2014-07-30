/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Dec 2013     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var email = request.getParameter('email');
	var columns = new Array();
	//columns[0]= new nlobjSearchColumn('Email');
	columns[0]= new nlobjSearchColumn('firstname','contactprimary');
	var filters = [];
	filters[0] = new nlobjSearchFilter('email', null, 'is', email, null);
	filters[1]= new nlobjSearchFilter('weblead', null, 'is', 'T', null);
	filters[2]= new nlobjSearchFilter('giveaccess', null, 'is', 'T', null);
	var results = nlapiSearchRecord('customer', null, filters , columns);
	var responseObject;
	if(results!=null)
		{
			nlapiLogExecution('DEBUG','found lead with weblead = true');
			//var custrecord = nlapiLoadRecord('customer', results[0].getId());
			responseObject={
					"length":results.length,
					"customerid":results[0].getId(),
					"contact":results[0].getValue("firstname","contactprimary")
			};
		}
	else{
		responseObject={
				"length":0
		};
	}
	
	nlapiLogExecution('DEBUG','resultstring: ',JSON.stringify(responseObject));
	//var jsonString = JSON.stringify(responseObject);
	//response.setContentType('JSON');
	response.write(JSON.stringify(responseObject));
	//response.writeLine(JSON.stringify(columnsresult));
}
