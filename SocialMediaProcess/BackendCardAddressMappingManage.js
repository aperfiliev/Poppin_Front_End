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
	//var userid = request.getParameter('userid');
	var cardid = request.getParameter('cardid');
	var addressid = request.getParameter('addressid');
	nlapiLogExecution('DEBUG','"Get METHOD"', method);
	//nlapiLogExecution('DEBUG', 'requestion userid',userid);
	var responseObject;
	if(method=='get'){
var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_cardaddressmapping_addressid');
        //columns[1] = new nlobjSearchColumn('custrecord_cardaddressmapping_cardid');
		var results = nlapiSearchRecord('customrecord_cardaddressmapping', null, new nlobjSearchFilter('custrecord_cardaddressmapping_cardid',null,'is', cardid), columns);
		if(results!=null)
		{
		   nlapiLogExecution('DEBUG','found mappings');
                   nlapiLogExecution('DEBUG', 'MAPPINF result', JSON.stringify(results[0]))
		   //var custrecord = nlapiLoadRecord('customer', results[0].getId());
		   responseObject={
		     "length":results.length,
		   //  "userid":userid,
		   //  "cardid":results[0].getValue("custrecord_cardaddressmapping_cardid"),
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
			newResult.setFieldValue('name', 'mapping'+cardid + "-" + addressid);
			
			//newResult.setFieldValue('custrecord_cardaddressmapping_userid', userid );
			newResult.setFieldValue('custrecord_cardaddressmapping_cardid', cardid);
			newResult.setFieldValue('custrecord_cardaddressmapping_addressid', addressid);
newResult.setFieldValue('custrecord_cardaddressmapping_userid', "333");
			newResultId = nlapiSubmitRecord(newResult);
nlapiLogExecution('DEBUG','New Result', newResult);
			nlapiLogExecution('DEBUG','result id', newResultId);
//response.writeLine(JSON.stringify(newResultId));
		} else if (method=='delete'){
						nlapiLogExecution('DEBUG','Delete map with credit card id', cardid);
			var results = nlapiSearchRecord('customrecord_cardaddressmapping', null, new nlobjSearchFilter('custrecord_cardaddressmapping_cardid',null,'is', cardid), null);
			if(results!=null)
			{
				nlapiDeleteRecord('customrecord_cardaddressmapping', results[0].getId());
			}
	}
	nlapiLogExecution('DEBUG','result', JSON.stringify(responseObject));
	response.writeLine(JSON.stringify(responseObject));
}
