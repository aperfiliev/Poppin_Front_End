/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 May 2014     bserednytskyy
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function pageInit(type){
	//ID of "IB FedEx Ground" shipping item is 2729
    nlapiSetFieldValue('shipmethod', 2729);
    //ID of "000133 Turnstone - Steelcase" vendor is 73784
    nlapiSetFieldValue('entity', 73784);
    var vendor = nlapiLoadRecord("vendor",73784);     
    var terms =  nlapiLoadRecord("term",vendor.getFieldValue('terms'));
    nlapiSetFieldValue('custbodyvendor_terms', terms.getFieldValue('name'));
}

