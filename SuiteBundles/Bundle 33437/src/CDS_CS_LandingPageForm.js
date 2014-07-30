/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Nov 2012     adimaunahan      initial implementation
 *
 */
function pageInit(type){
	
	// set to Landing Page type
	nlapiSetFieldValue('custrecord_ns_cdp_type', 1);
	
	// modify Title
	var divTitle = Ext.select('#main_form div.pt_title');
	if(divTitle){
		if(type == 'create'){
			divTitle.update('New Landing Page');	
		}
		else if(type == 'edit'){
			divTitle.update('Edit Landing Page');
		}	
	}
}

function fieldChanged(type, name, linenum){

}

function saveRecord(){
	
//	alert('start: ' + nlapiGetContext().getRemainingUsage());
	var ret = true;
	var urls = [], tags = [];
	var siteId = nlapiGetFieldValue('custrecord_ns_cdp_site');
	var clientUtil = new cds_commons.ClientUtil();
	
	tags = nlapiGetFieldValues('custrecord_ns_cdp_tag');
	var targetUrl = nlapiGetFieldValue('custrecord_ns_cdp_url');
	if(targetUrl){
		
		ret = clientUtil.validateUrl(targetUrl);
		if(ret == false){
			alert(cds_commons.ERROR_INVALID_URL);
			return false;
		}
		
		urls.push(targetUrl);
	}	

	// prevent setting Merchandising Rule in Main Body
	var mainBodyId = nlapiGetFieldValue('custrecord_ns_cdp_mainbody');
	if(mainBodyId){
		var contentType = nlapiLookupField('customrecord_ns_cd_content', mainBodyId, 'custrecord_ns_cdc_type', false);
		if(contentType == cds_commons.CONST_MERCHANDISING_RULE_ID){
			alert(cds_commons.ERROR_MAIN_BODY_FIELD_MERCH_RULE_NOT_ALLOWED);
			return false;
		}
	}
	
	// prevent non-Approved entries in Content Rule tab
	ret = clientUtil.validateApprovedContent();
	
	// prevent page with same site, url, and tag combination 
	try{
		ret = clientUtil.validateUrlAndTag(urls, tags, siteId);
		if(!ret){
			return ret;
		}	
	}
	catch(e){
		return true;
	}		
		
//	alert('end: ' + nlapiGetContext().getRemainingUsage());	
	
	return ret;
}

/**
 * This is called by closeContentPopup and sets the existing Merch rule as selected in the Content dropdown
 * @param {Object} contains contentId which is the customrecord_ns_cd_content internalid and target which opened the content window
 * @returns {Void}
 */
function popupCallback(params){
	//if last fieldChanged event for Landing page was from the Content Rule Subtab > Content list 
	if(params.target == 'recmachcustrecord_ns_cdpc_pageid:custrecord_ns_cdpc_contentid'){
		nlapiSetCurrentLineItemValue('recmachcustrecord_ns_cdpc_pageid', 'custrecord_ns_cdpc_contentid', params.contentId);
	}
}