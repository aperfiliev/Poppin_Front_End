/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Sep 2013     ashykalov
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
	if (name == 'essettings_exitsurveyid'){
		var surveyid = nlapiGetFieldValue('essettings_exitsurveyid');
		window.onbeforeunload = null;
		window.location = 'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=285&deploy=1&selectedexitsurvey='+surveyid;
	}
}
function validateLine(type){
	if(type==='essettings_questionssublist'){
		var id = nlapiGetCurrentLineItemValue(type, 'sublistid');
		var name = nlapiGetCurrentLineItemValue(type, 'sublistname');
		
		if(typeof id == null || id == ''){
			var surveylink = nlapiGetFieldValue('essettings_exitsurveyid');
			var newQuestionId = CreateQuestion(name, surveylink);
			nlapiSetCurrentLineItemValue(type, 'sublistid', newQuestionId, false);
		}
		else{
			console.log(id);
			var questionRecord = nlapiLoadRecord('customrecord200', id);
			questionRecord.setFieldValue('name', name);
			nlapiSubmitRecord(questionRecord);
		}
		
	}
	
	return true;
}
function validateInsert(type){
	console.log('validateinsert' + type);
	return true;
}
function validateDelete(type){
	if(type==='essettings_questionssublist'){
		var id = nlapiGetCurrentLineItemValue(type, 'sublistid');
		var questionRecord = nlapiLoadRecord('customrecord200', id);
		questionRecord.setFieldValue('custrecord_essurveylink', '');
		nlapiSubmitRecord(questionRecord);
		return true;
	}
	
}
function recalc(type){
	//console.log('recalc' + type);
	//return true;
}
function lineInit(type){
	//console.log('lineinit' + type);
}
function CreateQuestion(name, surveylink){
	var newQuestion = nlapiCreateRecord('customrecord200');
	newQuestion.setFieldValue('name', name);
	newQuestion.setFieldValue('custrecord_essurveylink', surveylink);
	newQuestionId = nlapiSubmitRecord(newQuestion);
	console.log(newQuestionId);
	return newQuestionId;
}
