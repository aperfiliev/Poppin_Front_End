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
		window.location = 'https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=284&deploy=1&selectedexitsurvey='+surveyid;
	}
	else if(name == 'essettings_questionid'){
		var surveyid = nlapiGetFieldValue('essettings_exitsurveyid');
		var questionid = nlapiGetFieldValue('essettings_questionid');
		window.onbeforeunload = null;
		window.location = 'https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=284&deploy=1&selectedexitsurvey='+surveyid+'&selectedquestion='+questionid;
	}
}
function validateLine(type){
	if(type==='essettings_questionssublist'){
		var id = nlapiGetCurrentLineItemValue(type, 'sublistquestionid');
		var name = nlapiGetCurrentLineItemValue(type, 'sublistname');
		console.log(id);
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
	else if(type==='essettings_answerssublist'){
		var id = nlapiGetCurrentLineItemValue(type, 'sublistanswerid');
		var name = nlapiGetCurrentLineItemValue(type, 'sublistname');
		
		if(typeof id == null || id == ''){
			var questionlink = nlapiGetFieldValue('essettings_questionid');
			var newAnswerId = CreateAnswer(name, questionlink);
			nlapiSetCurrentLineItemValue(type, 'sublistid', newAnswerId, false);
		}
		else{
			console.log(id);
			var answerRecord = nlapiLoadRecord('customrecord201', id);
			answerRecord.setFieldValue('name', name);
			nlapiSubmitRecord(answerRecord);
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
		var id = nlapiGetCurrentLineItemValue(type, 'sublistquestionid');
		var questionRecord = nlapiLoadRecord('customrecord200', id);
		questionRecord.setFieldValue('custrecord_essurveylink', '');
		nlapiSubmitRecord(questionRecord);
		return true;
	}
	if(type==='essettings_answerssublist'){
		var id = nlapiGetCurrentLineItemValue(type, 'sublistanswerid');
		var answerRecord = nlapiLoadRecord('customrecord201', id);
		answerRecord.setFieldValue('custrecord_esquestionlink', '');
		nlapiSubmitRecord(answerRecord);
		return true;
	}
	
}
function CreateQuestion(name, surveylink){
	var newQuestion = nlapiCreateRecord('customrecord200');
	newQuestion.setFieldValue('name', name);
	newQuestion.setFieldValue('custrecord_essurveylink', surveylink);
	newQuestionId = nlapiSubmitRecord(newQuestion);
	console.log(newQuestionId);
	return newQuestionId;
}
function CreateAnswer(name, questionlink){
	var newAnswer = nlapiCreateRecord('customrecord201');
	newAnswer.setFieldValue('name', name);
	newAnswer.setFieldValue('custrecord_esquestionlink', questionlink);
	newAnswerId = nlapiSubmitRecord(newAnswer);
	//console.log(newQuestionId);
	return newAnswerId;
}
function recalc(type){
	//console.log('recalc' + type);
	//return true;
}
function lineInit(type){
	//console.log('lineinit' + type);
}