/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Nov 2012     adimaunahan
 *
 */

// reorder unmovable fields
var relayout = new cds_commons.ClientUtil();
relayout.hideFieldsAndIcons();
relayout.moveFileAndContentRadioButtons();
	
//for validation when saving a record ('create' or 'edit')
var mode = '';
	
function removeNewSelectOptionValue() {
    var elements = document.getElementsByTagName('div');
    for (var i in elements) {
//        if (elements[i].innerHTML == '- New -' || elements[i].innerHTML == '&nbsp;') {
    	if (elements[i].innerHTML == '- New -') {
        	elements[i].style.display = 'none';
        }
    }	
}

/**
 * This is called upon closing the Add Content window (if user selects to use an existing merchandising rule)
 * @returns {Void}
 */
function closeContentPopup(){
	//get the currently selected merchandising id
	var target = getParameter('target');
	var recordutil = new cds_commons.RecordUtil();
	var contentId = recordutil.getExistingContentMerchandisingRule(nlapiGetFieldValue('custpage_ns_cdc_merchid'));
	window.opener.popupCallback({contentId: contentId, target:target});
}

function pageInit(type){
	mode = type;
	relayout.maskContentField(true);
//	var parent = window.opener;
//	
//	if(parent){
//		var langId = parent.Ext.get('custpage_cds_temp_langid').getValue();
//		if(langId){
//			nlapiSetFieldValue('custrecord_ns_cdc_lang', langId);
//		}
//		
//		var isMainBody = parent.Ext.get('custpage_cds_temp_ismainbody').getValue();
//		if(isMainBody){
//			nlapiSetFieldValue('custrecord_ns_cdc_ismainbody', isMainBody);
//		}
//	}
	
	// change title
	var divTitle = Ext.select('#main_form div.pt_title');
	if(divTitle){
		if(type == 'create'){
			divTitle.update('New Content');	
		}
		else if(type == 'edit'){
			divTitle.update('Edit Content');
		}	
	}
	
	if(type == 'edit'){
		// can't directly reuse fieldChanged, the name field is cleared. need to reset it again 
		var name = nlapiGetFieldValue('name');
		fieldChanged('', 'custrecord_ns_cdc_type', '');
		nlapiSetFieldValue('name', name);
	}
	else{
		fieldChanged('', 'custrecord_ns_cdc_type', '');	
		nlapiSetFieldValue('custrecord_ns_cdc_status', cds_commons.CONST_STATUS_ID);
	}
	
	// remove -New- options from dropdowns
	var inputSelect = Ext.select('#custrecord_ns_cdc_status_fs > input:nth-child(2)', true);
	inputSelect.on('focus', function(e,t) {
		removeNewSelectOptionValue();
	});
	
	inputSelect = Ext.select('#custrecord_ns_cdc_type_fs > input:nth-child(2)', true);
	inputSelect.on('focus', function(e,t) {
		removeNewSelectOptionValue();
	});	
}

function fieldChanged(type, name, linenum){
	
	var relayout = new cds_commons.ClientUtil();
	
	if(name == 'custrecord_ns_cdc_type'){
		var selectVal = nlapiGetFieldValue(name);
		
		if(selectVal == cds_commons.CONST_MERCHANDISING_RULE_ID){
			// enable Merchandising ID
			try{				
				nlapiDisableField('custpage_ns_cdc_merchid', false);
				// remove -New- options from dropdown
				
				var inputSelect = Ext.select('#custpage_ns_cdc_merchid_fs > input:nth-child(2)', true);
				inputSelect.on('focus', function(e,t) {
					removeNewSelectOptionValue();
				});
				// remove '+' images on dropdown
				var plusImg = Ext.get('custpage_ns_cdc_merchid_popup_new');
				if(plusImg){
					plusImg.remove();
				}
				
				//for Reset, if merchId has a value
				if(nlapiGetFieldValue('custpage_ns_cdc_merchid')){
					nlapiSetFieldValue('custpage_ns_cdc_merchname', nlapiGetFieldValue('name'));
				}
			}
			catch(e){}			
			
			// disable File Cabinet, Content, Name
			nlapiSetFieldValue('custrecord_ns_cdc_file', '');
			nlapiSetFieldValue('custrecord_ns_cdc_content', '');
			nlapiSetFieldValue('custpage_ns_cdc_source','rbfile');
			nlapiSetFieldValue('name', '');
			nlapiDisableField('name', true);
			nlapiDisableField('custrecord_ns_cdc_file', true);
//			nlapiDisableField('custrecord_ns_cdc_content', true);
			relayout.maskContentField(true);
			nlapiDisableField('custrecord_ns_cdc_status', true);
			nlapiDisableField('custrecord_ns_cdc_approved', true);
			
			// new requirement: instead of enabling/disabling items, hide/show them
			relayout.showMerchandisingFields(true);
		}
		else if (selectVal == cds_commons.CONST_HTML_CONTENT_TYPE_ID){
			// disable Merchandising ID
			try{
				if(nlapiGetFieldValue('custpage_ns_cdc_merchid') != ''){
					nlapiSetFieldValue('custpage_ns_cdc_merchid', '');	
				}
				nlapiDisableField('custpage_ns_cdc_merchid', true);	
			}
			catch(e){}			
			
			// enable File Cabinet, Content
			nlapiDisableField('custrecord_ns_cdc_file', false);
//			nlapiDisableField('custrecord_ns_cdc_content', false);
			relayout.maskContentField(false);
			nlapiDisableField('custrecord_ns_cdc_status', false);
			nlapiDisableField('custrecord_ns_cdc_approved', false);
			nlapiDisableField('name', false);
			
			// new requirement: instead of enabling/disabling items, hide/show them
			relayout.showMerchandisingFields(false);
		}
		else {
			// there is no selected type
			relayout.hideContentAndMerchandisingFields(false);
			nlapiSetFieldValue('name', '');
			nlapiSetFieldValue('custrecord_ns_cdc_file', '');
			nlapiSetFieldValue('custrecord_ns_cdc_content', '');
			nlapiSetFieldValue('custpage_ns_cdc_source','rbfile');
			nlapiDisableField('name', true);
			nlapiDisableField('custrecord_ns_cdc_file', true);
//			nlapiDisableField('custrecord_ns_cdc_content', true);
			relayout.maskContentField(true);
			nlapiDisableField('custrecord_ns_cdc_status', true);
			nlapiDisableField('custrecord_ns_cdc_approved', true);
			try{
				if(nlapiGetFieldValue('custpage_ns_cdc_merchid') != ''){
					nlapiSetFieldValue('custpage_ns_cdc_merchid', '');
				}
				nlapiDisableField('custpage_ns_cdc_merchid', true);
				nlapiSetFieldValue('custpage_ns_cdc_merchname', '');
			}
			catch(e){}	
		}
	}
	else if(name == 'custpage_ns_cdc_merchid'){
		
		try{
			var merchId = nlapiGetFieldValue('custpage_ns_cdc_merchid');
			
			nlapiSetFieldValue('custrecord_ns_cdc_merchid', merchId);	
			
			// get Merchandising Name and Status
			if(merchId){
				var fields = ['custrecord_merch_title', 'custrecord_is_approved'];
				var merchRec = nlapiLookupField('customrecord_merch_rule', merchId, fields);
				
				nlapiSetFieldValue('custpage_ns_cdc_merchname', merchRec.custrecord_merch_title);
				if(merchRec.custrecord_is_approved == 'T'){
					nlapiSetFieldValue('custrecord_ns_cdc_status', cds_commons.CONST_APPROVED_STATUS_ID);
					nlapiSetFieldValue('custrecord_ns_cdc_approved', 'T');
				}
				else{
					nlapiSetFieldValue('custrecord_ns_cdc_status', cds_commons.CONST_PENDING_STATUS_ID);
					nlapiSetFieldValue('custrecord_ns_cdc_approved', 'F');
				}
				// set Name (hidden) to Merchandising Title
				nlapiSetFieldValue('name', merchRec.custrecord_merch_title);
			}
			else{
				nlapiSetFieldValue('custpage_ns_cdc_merchname', '');
				nlapiSetFieldValue('custrecord_ns_cdc_status', cds_commons.CONST_PENDING_STATUS_ID);
				nlapiSetFieldValue('name', '');
			}
		}
		catch(e){}		
	}
	else if(name == 'custpage_ns_cdc_source'){
		try{
			if(nlapiGetFieldValue('custpage_ns_cdc_source') == 'rbfile'){
//				nlapiDisableField('custrecord_ns_cdc_content', true);
				relayout.maskContentField(true);
				nlapiDisableField('custrecord_ns_cdc_file', false);
			}else{
//				nlapiDisableField('custrecord_ns_cdc_content', false);
				relayout.maskContentField(false);
				nlapiDisableField('custrecord_ns_cdc_file', true);
			}
		}
		catch(e){}		
	}
}

function saveRecord() {
	var ret = true;
	
	var clientutil = new cds_commons.ClientUtil();
	var recordutil = new cds_commons.RecordUtil();
	
	var name = nlapiGetFieldValue('name');
	var merchId = nlapiGetFieldText('custpage_ns_cdc_merchid');
	var type = nlapiGetFieldValue('custrecord_ns_cdc_type');
	
	if(type == cds_commons.CONST_MERCHANDISING_RULE_ID){
		if(merchId == ''){
			ret = false;
			alert("Please enter value(s) for: Merchandising ID");
		}
		else{
			//check if an existing content already has this merch rule
			var contentId = recordutil.getExistingContentMerchandisingRule(nlapiGetFieldValue('custpage_ns_cdc_merchid'));
			if(contentId){
				if(mode=='create'){
	    	        var choice = confirm(cds_commons.CONFIRM_EXISTING_MERCH_CONTENT);
					if (choice){
						Ext.EventManager.on(window, 'beforeunload', closeContentPopup);
						NS.form.setChanged(false);
						window.close();
					}else{
						ret = false;
					}
				}else{ // edit mode
	    	        alert(cds_commons.ERROR_EXISTING_MERCH_CONTENT);
	    	        ret = false;
				}
			}
		} 	
	}else if(type == cds_commons.CONST_HTML_CONTENT_TYPE_ID){
		
		if(nlapiGetFieldValue('custpage_ns_cdc_source') == 'rbfile'){
			var fileName = nlapiGetFieldText('custrecord_ns_cdc_file');
			if(fileName == ''){
				ret = false;
				alert("Please enter value(s) for: File (.html or .htm only)");
				
			}else{
				// validate file extension
				ret = clientutil.validateFilename(fileName);
				if(!ret){
					alert(cds_commons.ERROR_INVALID_FILENAME);					
				}else{
					//remove the value of the "Text Editor" field
					nlapiSetFieldValue('custrecord_ns_cdc_content', '');
				}
			}
		}else{	
			if(nlapiGetFieldValue('custrecord_ns_cdc_content') == ''){
				ret = false;
				alert("Please enter value(s) for: Text Editor");
				
			}else{
				//remove the value of the "File (.html or .htm only)" field
				nlapiSetFieldValue('custrecord_ns_cdc_file', '');
			}
		}
	}	
	
	return ret;
}
