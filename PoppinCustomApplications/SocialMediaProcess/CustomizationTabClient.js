/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Nov 2013     ashykalov
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   //alert('hello'+type);
	//alert(nlapiGetFieldValue('custbody_art_work'));
	nlapiSetFieldValue('custbody_art_work', '/site/pp-customization');
	
}
