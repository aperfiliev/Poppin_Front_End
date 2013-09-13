/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Aug 2013     ashykalov
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	if (name == 'bansettings_bannerid'){
		var bannerid = nlapiGetFieldValue('bansettings_bannerid');
		window.onbeforeunload = null;
		window.location = 'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=275&deploy=1&selectedbanner='+bannerid;
	}
}
