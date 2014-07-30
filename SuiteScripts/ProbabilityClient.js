/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Feb 2014     Administrator
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
	setProbability();
}

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
	if(name === 'custbody_probability') {
		setCusbodyProbability();
	} else if(name === 'probability') {
		setProbability();
	}
}

function setProbability(){
	var probability = parseFloat(nlapiGetFieldValue('probability'));
	switch (probability) {
	case 25:
		nlapiSetFieldValue('custbody_probability', 2, false);
		break;
	case 50:
		nlapiSetFieldValue('custbody_probability', 3, false);
		break;
	case 75:
		nlapiSetFieldValue('custbody_probability', 4, false);
		break;
	case 90:
		nlapiSetFieldValue('custbody_probability', 5, false);
		break;
	case 100:
		nlapiSetFieldValue('custbody_probability', 6, false);
		break;
	default: // '0'
		nlapiSetFieldValue('custbody_probability', 1, false);
		break;
	}
}

function setCusbodyProbability(){
	var custbody_probability = nlapiGetFieldValue('custbody_probability');
	switch (custbody_probability) {
	case '2':
		nlapiSetFieldValue('probability', '25.0%', false);
		break;
	case '3':
		nlapiSetFieldValue('probability', '50.0%', false);
		break;
	case '4':
		nlapiSetFieldValue('probability', '75.0%', false);
		break;
	case '5':
		nlapiSetFieldValue('probability', '90.0%', false);
		break;
	case '6':
		nlapiSetFieldValue('probability', '100.0%', false);
		break;
	default: // '0'
		nlapiSetFieldValue('probability', '0', false);
		break;
	}
}