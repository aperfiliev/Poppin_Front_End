/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Sep 2013     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if(request.getMethod()=='GET')
	{
		var selectedexitsurvey = request.getParameter('selectedexitsurvey');
		if(selectedexitsurvey == null || selectedexitsurvey == undefined){
			selectedexitsurvey = 1;
			}
		var selectedquestion = request.getParameter('selectedquestion');
		
		var form = nlapiCreateForm('Exit Survey Settings');
		form.setScript('customscript286');
		var exitsurveyitem = nlapiLoadRecord('customrecord203', selectedexitsurvey);
		var exitsurveyselect = form.addField('essettings_exitsurveyid', 'select', 'Exit Survey Select');
		exitsurveyselect.addSelectOption(1, 'Customer Exit Survey');
		exitsurveyselect.addSelectOption(2, 'Business Customer Exit Survey');
		exitsurveyselect.setDefaultValue(selectedexitsurvey);
		var questionselect = form.addField('essettings_questionid', 'select', 'Question Select');
		//for(var i=0;i<)
		form.addField('essettings_title', 'text','Survey Title').setDefaultValue(exitsurveyitem.getFieldValue('custrecord_estitle'));
		form.addField('essettings_body', 'textarea','Survey Body Text').setDefaultValue(exitsurveyitem.getFieldValue('custrecord_esbody'));
		
		//----------------questions sublist
	     var questionsublist = form.addSubList('essettings_questionssublist','inlineeditor','Questions');

	     var sublistidfield = questionsublist.addField('sublistid','text', 'internalid');
	     sublistidfield.setDisplayType('hidden');
	     var sublistsurveylinkfield = questionsublist.addField('sublistsurveylink','select', 'Survey','customrecord203');
	     sublistsurveylinkfield.setDisplayType('hidden');
	     questionsublist.addField('sublistname','text', 'Question');
	    
	     var questiondata = nlapiSearchRecord('customrecord200', null, 
	    		 new nlobjSearchFilter('custrecord_essurveylink', null, 'is', selectedexitsurvey),
	    			[new nlobjSearchColumn('internalid'), new nlobjSearchColumn('name'), new nlobjSearchColumn('custrecord_essurveylink')]);
	     
	     for(var i = 0; i < questiondata.length; i++)
			{
	    	 	
	    	 	questionselect.addSelectOption(questiondata[i].getValue('internalid'), questiondata[i].getValue('name'));
	    	 	nlapiLogExecution('DEBUG', 'selectedquestion', selectedquestion);
	    	 	if(i==0 && (selectedquestion == null || selectedquestion == undefined) ){selectedquestion = questiondata[i].getId(); nlapiLogExecution('DEBUG', 'QuestionId', selectedquestion);}//set default question option
	    	 	
	    	 	questionsublist.setLineItemValue('sublistquestionid', i+1, questiondata[i].getValue('internalid'));
	    	 	questionsublist.setLineItemValue('sublistname', i+1, questiondata[i].getValue('name'));
	    	 	questionsublist.setLineItemValue('sublistsurveylink', i+1, questiondata[i].getValue('custrecord_essurveylink'));
			}
	     questionselect.setDefaultValue(selectedquestion);
		//----------------answers sublist
	     var answersublist = form.addSubList('essettings_answerssublist','inlineeditor','Answers');

	     var sublistanswerid = answersublist.addField('sublistanswerid','text', 'internalid');
	     sublistanswerid.setDisplayType('hidden');
	     var sublistquestionlink = answersublist.addField('sublistquestionlink','select', 'Question','customrecord200');
	     sublistquestionlink.setDisplayType('hidden');
	     answersublist.addField('sublistname','text', 'Answer');

	     var answerdata = nlapiSearchRecord('customrecord201', null,
	    		   new nlobjSearchFilter('custrecord_esquestionlink', null , 'is', selectedquestion),
	    			[new nlobjSearchColumn('internalid'), new nlobjSearchColumn('name'), new nlobjSearchColumn('custrecord_esquestionlink')]);
	     if(answerdata!=null){
		     for(var i = 0; i < answerdata.length; i++)
				{
		    	 	answersublist.setLineItemValue('sublistanswerid', i+1, answerdata[i].getValue('internalid'));
		    	 	answersublist.setLineItemValue('sublistname', i+1, answerdata[i].getValue('name'));
		    	 	answersublist.setLineItemValue('sublistquestionlink', i+1, answerdata[i].getValue('custrecord_esquestionlink'));
				}
	     }
		form.addSubmitButton('Save Survey');
//		form.getField('essettings_bannerid').setHelpText('Selects banner and loads its current settings');//TODO: help text for fields

		response.writePage(form);
		
	}
else
	{
		//POST data to netsuite
		//save text data
		
		var selectedexitsurvey = request.getParameter('essettings_exitsurveyid');
		var selectedquestion = request.getParameter('selectedquestion');
		//nlapiLogExecution('DEBUG', 'selectedes:', selectedexitsurvey);
		
		if(selectedexitsurvey == null || selectedexitsurvey == undefined){
			selectedexitsurvey = 1;
		}
	
		var exitsurveyitem = nlapiLoadRecord('customrecord203', selectedexitsurvey);
		exitsurveyitem.setFieldValue('custrecord_estitle', request.getParameter('essettings_title'));
		exitsurveyitem.setFieldValue('custrecord_esbody', request.getParameter('essettings_body'));
	
		//build html string
		var htmloutput = '';
//		if(bannerinfoitem.getFieldValue('custrecord_enabled')=='T')
//		{
			//img params
		var questiondata = nlapiSearchRecord('customrecord200', null, 
	    		 new nlobjSearchFilter('custrecord_essurveylink', null, 'is', selectedexitsurvey),
	    			[new nlobjSearchColumn('internalid'), new nlobjSearchColumn('name'), new nlobjSearchColumn('custrecord_essurveylink')]);
		
		var resulthtml='';
		if(questiondata!=null)
		{
			for(var i = 0; i < questiondata.length; i++)
				{
					//get question for ns db and set default option that equals question name 
					resulthtml = resulthtml + '<select id="ddlquestion'+questiondata[i].getId()+'"><option value="0" selected="selected">'+questiondata[i].getValue('name')+'</option>';
					
					//get answers for current question
					var answerdata = nlapiSearchRecord('customrecord201', null,
				    		 new nlobjSearchFilter('custrecord_esquestionlink', null, 'is', questiondata[i].getId()),
				    			[new nlobjSearchColumn('internalid'), new nlobjSearchColumn('name'), new nlobjSearchColumn('custrecord_esquestionlink')]);
					
					if(answerdata!=null)
						{
							for(var i = 0; i < answerdata.length; i++)
								{
									resulthtml = resulthtml + '<option value="' + answerdata[i].getId() + '">' + answerdata[i].getValue('name') + '</option>';
									nlapiLogExecution('DEBUG','found answer', answerdata[i].getId() + ' ' +  answerdata[i].getValue('name'));
								}
						}
					else{
							nlapiLogExecution('DEBUG','Answers not found');
					}
					resulthtml = resulthtml + '</select>';
				}
		}
		//close question
		
		nlapiLogExecution('DEBUG','options html result', resulthtml);		
			htmloutput = '<div class="exitsurvey">'+ '<input type="button" class="closebutton" value="X" onclick="closeExitSurvey();">' + '<h2>' + exitsurveyitem.getFieldValue('custrecord_estitle') + '</h2>';
			htmloutput = htmloutput + '<p>' + exitsurveyitem.getFieldValue('custrecord_esbody') + '</p>';
			htmloutput = htmloutput + resulthtml;
			htmloutput = htmloutput + '<div><input class="orangeBtn" type="button" value="SUBMIT" onclick="submitExitSurvey();return false;"/></div>';
			htmloutput = htmloutput + '</div>';
			
//		}
		nlapiLogExecution('DEBUG','Html output', htmloutput);
		exitsurveyitem.setFieldValue('custrecord_eshtml', htmloutput);
		nlapiSubmitRecord(exitsurveyitem);
		var params = new Array();
		params['selectedexitsurvey'] = selectedexitsurvey;
		nlapiSetRedirectURL("SUITELET", "customscript285", "customdeploy1", null, params);
	}
}