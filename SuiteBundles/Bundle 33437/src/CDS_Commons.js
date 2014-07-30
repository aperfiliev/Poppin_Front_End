var cds_commons;
if (!cds_commons) {
    cds_commons = {};
}

cds_commons.Logger = function Logger()
{
	var showDebugMessages = true;
	var logTitle = 'Content Delivery';
	
	function log(logLevel, detail) {
		
		if(showDebugMessages){
			nlapiLogExecution(logLevel, logTitle, detail);
		}
	}
	
	return {
		log: log
    };
};

cds_commons.CONST_LANDING_PAGE_FORM_NAME = 'Landing Page Form';
cds_commons.CONST_ENHANCED_PAGE_FORM_NAME = 'Enhanced Page Form';
cds_commons.CONST_PAGE_RECORD_NAME = 'NS CD Page';
cds_commons.CONST_LANDING_PAGE_TYPE_ID = 1;
cds_commons.CONST_ENHANCED_PAGE_TYPE_ID = 2;
cds_commons.HELP_MERCHANDISING_ID_FIELD = '<html><p>Select a Merchandising ID.</p><p> Only previously defined <em>active</em> Merchandising Rules are available for selection. Select the desired rule and then click Save.</p></html>';
cds_commons.HELP_MERCHANDISING_TITLE_FIELD = '<html><p>This field is auto-populated once a Merchandising ID is selected above.</p></html>';
cds_commons.ERROR_MAIN_BODY_FIELD_MERCH_RULE_NOT_ALLOWED = 'Merchandising rules cannot be used in the main body field, please choose another content record for the main body.';
cds_commons.ERROR_CONTENT_IS_NOT_APPROVED = 'Please confirm that you have approved content records in the Content Rule tab before saving this page.';
cds_commons.ERROR_CONTENT_IS_EMPTY = 'Please enter value for: Content';
cds_commons.ERROR_CONTENT_RULE_IS_EMPTY = 'Please create or choose at least one content record in the Content Rule tab in order to save this page.';
cds_commons.ERROR_INVALID_URL = 'Please enter a valid URL.';
cds_commons.ERROR_INVALID_FILENAME = 'There is a file type restriction for this selection. Please select \".html\" or \".htm\" file type.';
cds_commons.ERROR_EXISTING_MERCH_CONTENT = 'This merchandising rule has already been defined as a content.';
cds_commons.CONFIRM_EXISTING_MERCH_CONTENT = 'This merchandising rule has already been defined as a content. Would you like to use it?';
cds_commons.CONST_MERCHANDISING_RULE_ID = 2;
cds_commons.CONST_HTML_CONTENT_TYPE_ID = 5;
cds_commons.CONST_STATUS_ID = 2;
cds_commons.CONST_APPROVED_STATUS_ID = 1;
cds_commons.CONST_PENDING_STATUS_ID = 2;

cds_commons.RecordUtil = function RecordUtil()
{
	var logger = new cds_commons.Logger();
	
	function deletePage(id) {
		deleteUrls(id);
		deletePageContents(id);
//		deleteContents(id);
	}
	
	function deleteUrls(pageId) {
		
		try{
			filters = [
	           new nlobjSearchFilter('custrecord_ns_cdq_pageid', null, 'is', pageId)
	        ];

	        res = nlapiSearchRecord('customrecord_ns_cd_query', null, filters, null);
	        if(res){
	        	for(var i = 0; i < res.length; i++){
	        		nlapiDeleteRecord('customrecord_ns_cd_query', res[i].getId());	
	        	}
	        }	
		}
		catch(e){
			logger.log('ERROR', e);
		}
	}
	
	function deleteContents(pageId) {
		
		try{
			filters = [
	           new nlobjSearchFilter('custrecord_ns_cdc_page', null, 'is', pageId)
	        ];

	        res = nlapiSearchRecord('customrecord_ns_cd_content', null, filters, null);
	        if(res){
	        	for(var i = 0; i < res.length; i++){
	        		nlapiDeleteRecord('customrecord_ns_cd_content', res[i].getId());	
	        	}
	        }	
		}
		catch(e){
			logger.log('ERROR', e);
		}
	}
	
	function deletePageContents(pageId) {
		
		try{
			filters = [
	           new nlobjSearchFilter('custrecord_ns_cdpc_pageid', null, 'is', pageId)
	        ];
			
			columns = [
	           new nlobjSearchColumn('custrecord_ns_cdpc_contentid')
	        ];

	        res = nlapiSearchRecord('customrecord_ns_cd_pagecontent', null, filters, columns);
	        if(res){
	        	for(var i = 0; i < res.length; i++){
	        		nlapiDeleteRecord('customrecord_ns_cd_pagecontent', res[i].getId());
	        	}
	        }	
		}
		catch(e){
			logger.log('ERROR', e);
		}
	}
	
	function getFileContent(fileName) {
	   var results = nlapiSearchRecord("file", null, ['name', 'is', fileName]);
	   if (results === null) {
	       throw 'results === null; fileName=' + fileName;
	   }
	   
	   if (results.length > 1) {
	       throw 'results.length > 1; fileName=' + fileName;
	   }
	   
	   // we expect only 1 file
	   var file = nlapiLoadFile(results[0].getId());
	   return file.getValue();
	}
	
	/** 
	 * returns the first content record that uses the given merchandising rule
	 * @param {Number} merchandising rule (customrecord_merch_rule) internalid
	 * @returns {Number} content (customrecord_ns_cd_content) internalid
	 */
	function getExistingContentMerchandisingRule(merchId){
		//search contents that use the given merchandising Id
		var contentId = null;
		
		if(merchId){
			res = nlapiSearchRecord('customrecord_ns_cd_content'
					, null
					, [new nlobjSearchFilter('custrecord_ns_cdc_merchid',null,'is', merchId)]
					, [new nlobjSearchColumn('internalid')]);
			
			if(res){
				// if there will ever be multiple results, just get the first instance
				contentId = res[0].getValue('internalid');
			}
		}	
		return contentId;
	}
	
	return {
		deletePage: deletePage,
		getFileContent: getFileContent,
		getExistingContentMerchandisingRule: getExistingContentMerchandisingRule
    };
};

cds_commons.ClientUtil = function ClientUtil()
{
	var logger = new cds_commons.Logger();
	
	function validateUrlAndTag(urls, tags, siteId) {
		
//		alert('urls = ' + urls + ', tags = ' + tags);
		
		var filters = [];
		var ret = true;
		
		var columns = [	       
            new nlobjSearchColumn('name', 'custrecord_ns_cdq_pageid'),
            new nlobjSearchColumn('custrecord_ns_cdq_pageid')
	    ];
		
		// filter by tag
		if(!tags || tags.length == 0 || tags.toString() == [].toString()){
			filters.push(['custrecord_ns_cdq_pageid.custrecord_ns_cdp_tag', 'noneof', '@NONE@']);
			filters.push('and');
		}
		else{
			filters.push(['custrecord_ns_cdq_pageid.custrecord_ns_cdp_tag', 'allof', tags]);
			filters.push('and');
			filters.push(['custrecord_ns_cdq_pageid.custrecord_ns_cdp_tagcount', 'equalto', tags.length]);
			filters.push('and');
		}
		
		// filter by URL
		var urlfilters = [];
		for(var i = 0; i < urls.length; i++){
			urlfilters.push(['custrecord_ns_cdq_query', 'is', urls[i]]);
			if(i != urls.length-1){
				urlfilters.push('or');
			}
		}
		
		filters.push(urlfilters);
		filters.push('and');
		
		// filter by site
		if(!siteId){
   			siteId = -999; 
   		}
   		
		filters.push(['custrecord_ns_cdq_pageid.custrecord_ns_cdp_site', 'anyof', [siteId]]);
		
   		var searchObj = nlapiCreateSearch('customrecord_ns_cd_query', filters, columns);
		var resultSet = searchObj.runSearch();
		res = resultSet.getResults(0, 1);
		if(res && res.length > 0){
    		
    		var currPageId = nlapiGetRecordId();
    		
    		for(var i = 0; i < res.length; i++){
    			var r = res[i];
    			
    			if(currPageId != r.getValue('custrecord_ns_cdq_pageid')){
        			alert('You already have this page record with the same URL and tag attribute (ID ' 
            				+ r.getValue('custrecord_ns_cdq_pageid') + ': '
            				+ r.getValue('name', 'custrecord_ns_cdq_pageid') + '), please change your URL or tag and try again.');

            		return false;	
        		}	
    		}
    	}
		
		return ret;
	}
	
	function validateApprovedContent() {
		
		var ret = true;
		
		var contentCount = nlapiGetLineItemCount('recmachcustrecord_ns_cdpc_pageid');
		var type = nlapiGetFieldValue('custrecord_ns_cdp_type');
		
		if(type == cds_commons.CONST_ENHANCED_PAGE_TYPE_ID && contentCount == 0){
			alert(cds_commons.ERROR_CONTENT_RULE_IS_EMPTY);
			return false;
		}
		
		for(var i = 0; i < contentCount; i++){
			var contentId = nlapiGetLineItemValue('recmachcustrecord_ns_cdpc_pageid', 'custrecord_ns_cdpc_contentid', i+1);
			if(contentId){
				var status = nlapiLookupField('customrecord_ns_cd_content', contentId, 'custrecord_ns_cdc_status');
				
				if(status != cds_commons.CONST_APPROVED_STATUS_ID){
					alert(cds_commons.ERROR_CONTENT_IS_NOT_APPROVED);
					ret = false;
					break;
				}	
			}
		}
		
		return ret;
	}
	
	function validateTag(tagString) {
		
		var ret = false;
		
		if(tagString && tagString.trim() != ''){
			
			var regexpr = /^[^:]+\:[^:]+$/;
			var matches = tagString.match(regexpr);
			
			if(matches){
				ret = true;
			}			
		}
		
		return ret;
	}
	
	function validateUrl(urlString) {
		
		var ret = false;
		
		if(urlString && urlString.trim() != ''){
			
			// prevent instance of '//'
			var invalidStr = /\/{2}/;
			var matches = urlString.match(invalidStr);
			if(matches){
				return false;
			}
			
			// allow * at the start
			var regexpr = /^((\*)$|(\/([\w\.-]?)))/;
			matches = urlString.match(regexpr);
			if(matches){
				return true;
			}			
		}
		
		return ret;
	}
	
	function validateFilename(fileName) {
		
		var ret = false;
		
		if(fileName){
			var regexpr = /^.+(\.html|\.htm)$/gi;;
			var matches = fileName.match(regexpr);
			
			if(matches){
				ret = true;
			}
		}
		
		return ret;
	}
	
	/**
	 * This function rearranges the radio buttons, labels and rows. This is only called once in the client script.
	 */
	function moveFileAndContentRadioButtons() {
		
		var mainForm = Ext.get('main_form');
		var radioButtonLabels = mainForm.select('#custpage_ns_cdc_source_fs_lbl');
		var radioButtons = mainForm.select('#custpage_ns_cdc_source_fs');
		//replace the "File Cabinet" label with the radio button
		if(radioButtonLabels && radioButtons){
			radioButtonLabels.first().replaceWith(radioButtons.first());
		}

		//replace the "Content" label with the radio button
		try{
			radioButtonLabels.last().replaceWith(radioButtons.last());

		}catch(e){ //for IE 10
			var contentRBLabel = mainForm.select('table[class=table_fields] > tbody > tr:nth-child(8) #custpage_ns_cdc_source_fs_lbl');
			var contentRB = mainForm.select('table[class=table_fields] > tbody > tr:nth-child(8) #custpage_ns_cdc_source_fs');
			contentRBLabel.first().replaceWith(contentRB.first());
		}
		
		//move "File (.html or .htm only)" Cabinet label beside the radio button
		var fileLabel = mainForm.select('#custrecord_ns_cdc_file_fs_lbl');
		var fileLabelDiv = mainForm.select('table[class=table_fields] > tbody > tr:nth-child(7) > td:nth-child(2)');
		if (fileLabel && fileLabelDiv){
			fileLabelDiv.first().appendChild(fileLabel);
		}
		
		//move "Text Editor" label beside the radio button
		var contentLabel = mainForm.select('#custrecord_ns_cdc_content_fs_lbl');
		var contentLabelDiv = mainForm.select('table[class=table_fields] > tbody > tr:nth-child(8) > td:nth-child(2)');
		if (contentLabel && contentLabelDiv){
			contentLabelDiv.first().appendChild(contentLabel);
		}
		
		//move up "File (.html or .htm only)" radio button row
		var nameRow = mainForm.select('#name_fs_lbl').first().parent().parent();
		var fileRadioRow = mainForm.select('#custrecord_ns_cdc_file_fs_lbl').first().parent().parent();
		if(nameRow && fileRadioRow){
			nameRow.insertSibling(fileRadioRow,'after');
		}
		
		//move up "Text Editor" radio button row
		var fileSelectRow = mainForm.select('#custrecord_ns_cdc_file_fs').first().parent().parent();
		var textRadioRow = mainForm.select('#custrecord_ns_cdc_content_fs_lbl').first().parent().parent();
		if(fileSelectRow && textRadioRow){
			fileSelectRow.insertSibling(textRadioRow,'after');
		}
		
		//move up merchandising rows
		var typeRow = mainForm.select('#custrecord_ns_cdc_type_fs_lbl').first().parent().parent();
		var merchTitleRow = mainForm.select('#custpage_ns_cdc_merchname_fs_lbl').first().parent().parent();
		if(typeRow && merchTitleRow){
			typeRow.insertSibling(merchTitleRow,'after');
		}
		
		var merchIDRow = mainForm.select('#custpage_ns_cdc_merchid_fs_lbl').first().parent().parent();
		if(typeRow && merchIDRow){
			typeRow.insertSibling(merchIDRow,'after');
		}
	}
	
	/**
	 * This function hides/shows the (a)merchandising fields or (b)html content fields
	 * @param {Boolean} true - displays the merchandising fields and hides the html fields. false - displays the html fields
	 */
	function showMerchandisingFields(flag) {
		var mainForm = Ext.get('main_form');
		
		//merchandising fields
		var merchIDRow = mainForm.select('#custpage_ns_cdc_merchid_fs_lbl').first().parent().parent();
		var merchTitleRow = mainForm.select('#custpage_ns_cdc_merchname_fs_lbl').first().parent().parent();
		
		//content fields
		var nameRow = mainForm.select('#name_fs_lbl').first().parent().parent();
		var fileRadioRow = mainForm.select('#custrecord_ns_cdc_file_fs_lbl').first().parent().parent();
		var fileSelectRow = mainForm.select('#custrecord_ns_cdc_file_fs').first().parent().parent();
		var textRadioRow = mainForm.select('#custrecord_ns_cdc_content_fs_lbl').first().parent().parent();
		var textEditorRow = mainForm.select('#custrecord_ns_cdc_content_fs').first().parent().parent();
		
		if(flag){
			//show merchandising fields, hide content fields
			merchIDRow.setDisplayed('');
			merchTitleRow.setDisplayed('');
			nameRow.setDisplayed('none');
			fileRadioRow.setDisplayed('none');
			fileSelectRow.setVisible(false);
			textRadioRow.setVisible(false);
			textEditorRow.setVisible(false);
			
		}else{
			//hide merchandising fields, show content fields
			merchIDRow.setDisplayed('none');
			merchTitleRow.setDisplayed('none');
			nameRow.setDisplayed('');
			fileRadioRow.setDisplayed('');
			fileSelectRow.setVisible(true);
			textRadioRow.setVisible(true);
			textEditorRow.setVisible(true);
		}
			
		//depending on the radio button selected, enable/disable the file field or the content field
		if(!flag){
			if(nlapiGetFieldValue('custpage_ns_cdc_source') == 'rbfile'){
				maskContentField(true);
				//nlapiDisableField('custrecord_ns_cdc_content', true);
				nlapiDisableField('custrecord_ns_cdc_file', false);
			}else{
				maskContentField(false);
				//nlapiDisableField('custrecord_ns_cdc_content', false);
				nlapiDisableField('custrecord_ns_cdc_file', true);
			}
		}
	}
	
	/**
	 * Use this function instead of nlapiDiableField() to disable the Content Text Editor (custrecord_ns_cdc_content)
	 * @param {Boolean} true-masks the content field; false-unmasks the content field
	 */
	function maskContentField(display){
		var mainForm = Ext.get('main_form');
		var editorDiv = mainForm.select('#html-editor-container-custrecord_ns_cdc_content > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)');
		
		if(display == true){
			editorDiv.mask();
		}else{
			editorDiv.unmask();
		}	
	}
	
	/**
	 * This hides all the fields except the Type field (custrecord_ns_cdc_type). This is only called once in the client script.
	 */
	function hideFieldsAndIcons(){
		hideContentAndMerchandisingFields(true);
		
		// remove '+' images on dropdowns
		var plusImg = Ext.get('custrecord_ns_cdc_status_popup_new');
		if(plusImg){
			plusImg.remove();	
		}

		plusImg = Ext.get('custrecord_ns_cdc_type_popup_new');
		if(plusImg){
			plusImg.remove();	
		}
	}
	
	/**
	 * Hides the content fields (except 'Type') and merchandising fields
	 * @param {Boolean} true: if this is called for the first time when fields are not rearranged yet.
	 */
	function hideContentAndMerchandisingFields(initial){
		var mainForm = Ext.get('main_form');
		
		var nameRow = mainForm.select('#name_fs_lbl').first().parent().parent();
		var fileSelectRow = mainForm.select('#custrecord_ns_cdc_file_fs').first().parent().parent();
		var textEditorRow = mainForm.select('#custrecord_ns_cdc_content_fs').first().parent().parent();
		
		var merchIDRow = mainForm.select('#custpage_ns_cdc_merchid_fs_lbl').first().parent().parent();
		var merchTitleRow = mainForm.select('#custpage_ns_cdc_merchname_fs_lbl').first().parent().parent();
		
		if(initial){
			var fileRadioRow = mainForm.select('table[class=table_fields] > tbody > tr:nth-child(7)').first();
			var textRadioRow = mainForm.select('table[class=table_fields] > tbody > tr:nth-child(8)').first();
		}else{
			var fileRadioRow = mainForm.select('#custrecord_ns_cdc_file_fs_lbl').first().parent().parent();
			var textRadioRow = mainForm.select('#custrecord_ns_cdc_content_fs_lbl').first().parent().parent();			
		}

		nameRow.setDisplayed('none');
		fileSelectRow.setVisible(false);
		textEditorRow.setVisible(false);
		merchIDRow.setDisplayed('none');
		merchTitleRow.setDisplayed('none');
		fileRadioRow.setDisplayed('none');
		textRadioRow.setVisible(false);
		
	}
	
	function moveContentTagLabel(){
		//replace the Name label with the one for Tag (so that the FLH would be displayed)
		var mainForm = Ext.get('main_form');
		
		var fldTagField = mainForm.select('#custrecord_ns_cdt_tag_fs_lbl').first().parent().parent();
		if (fldTagField){
			fldTagField.setVisible(false);
		}
		
		var fldName = mainForm.select('#name_fs_lbl > a');
		var fldTag = mainForm.select('#custrecord_ns_cdt_tag_fs_lbl > a');
		
		if (fldName && fldTag){
			fldName.first().replaceWith(fldTag.first());
		}
	}
	
	return {
		validateUrlAndTag: validateUrlAndTag,
		validateApprovedContent: validateApprovedContent,
		validateTag: validateTag,
		moveFileAndContentRadioButtons: moveFileAndContentRadioButtons,
		showMerchandisingFields: showMerchandisingFields,
		maskContentField: maskContentField,
		hideFieldsAndIcons: hideFieldsAndIcons,
		hideContentAndMerchandisingFields: hideContentAndMerchandisingFields,
		validateUrl: validateUrl,
		validateFilename: validateFilename,
		moveContentTagLabel: moveContentTagLabel
    };
};