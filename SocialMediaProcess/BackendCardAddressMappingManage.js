/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Jan 2014     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var method = request.getParameter('method');
	var userid = request.getParameter('userid');
	var cardid = request.getParameter('cardid');
	var addressid = request.getParameter('addressid');
	
	nlapiLogExecution('DEBUG', 'requestion userid',userid);
	var responseObject;
	if(method=='get'){
		var results = nlapiSearchRecord('customrecord_cardaddressmapping', null, new nlobjSearchFilter('custrecord_cardaddressmapping_userid',null,'is', userid), null);
		if(results!=null)
		{
		   nlapiLogExecution('DEBUG','found mappings');
		   //var custrecord = nlapiLoadRecord('customer', results[0].getId());
		   responseObject={
		     "length":results.length,
		     "userid":results[0].getValue("custrecord_cardaddressmapping_userid"),
		     "cardid":results[0].getValue("custrecord_cardaddressmapping_cardid"),
		     "addressid":results[0].getValue("custrecord_cardaddressmapping_addressid")
		   };
		}
		else{
		  responseObject={
		    "length":0
		  };
		}
	}
	else if(method=='set'){
			var newResult = nlapiCreateRecord('customrecord_cardaddressmapping');
			newResult.setFieldValue('name', 'mapping'+userid);
			
			newResult.setFieldValue('custrecord_cardaddressmapping_userid', userid );
			newResult.setFieldValue('custrecord_cardaddressmapping_cardid', cardid);
			newResult.setFieldValue('custrecord_cardaddressmapping_addressid', addressid);
			newResultId = nlapiSubmitRecord(newResult);
			nlapiLogExecution('DEBUG','result id', newResultId);
	}
	nlapiLogExecution('DEBUG','result', JSON.stringify(responseObject));
	response.writeLine(JSON.stringify(responseObject));
}
