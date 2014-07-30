/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Nov 2013     ashykalov
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */

function clientSaveRecord(result, status, message){	
	if(result.length>0){
		alert("user exist");
		return false;
	}
else{
		alert("user doesnt exist");
		return true;
	}
}
function response(){}

