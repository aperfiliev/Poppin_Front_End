/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Nov 2012     adimaunahan      initial implementation
 *
 */
function pageInit(type){
	
	// set to Landing Page type
	nlapiSetFieldValue('custrecord_ns_cdp_type', 2);
	
	// modify Title
	var divTitle = Ext.select('#main_form div.pt_title');
	if(type == 'create'){
		divTitle.update('New Enhanced Page');	
	}
	else if(type == 'edit'){
		divTitle.update('Edit Enhanced Page');
	}
}

function fieldChanged(type, name, linenum){
	
}

function validateLine(type){
	
	var ret = true;
	
	if(type == 'recmachcustrecord_ns_cdq_pageid'){
		var clientUtil = new cds_commons.ClientUtil();
		var url = nlapiGetCurrentLineItemValue('recmachcustrecord_ns_cdq_pageid', 'custrecord_ns_cdq_query');
		ret = clientUtil.validateUrl(url);
		if(ret == false){
			alert(cds_commons.ERROR_INVALID_URL);
			return false;
		}
	}
	
	return true;
}

function saveRecord(){
	
//	alert('start: ' + nlapiGetContext().getRemainingUsage());
	var ret = true;
	var urls = [], tags = [];
	var siteId = nlapiGetFieldValue('custrecord_ns_cdp_site');
	
	tags = nlapiGetFieldValues('custrecord_ns_cdp_tag');
	
	var urlCount = nlapiGetLineItemCount('recmachcustrecord_ns_cdq_pageid');
	
	// prevent empty Target URL
	if(urlCount == 0){
		alert("Please enter at least one Target URL");
		return false;
	}
	
	for(var i = 0; i < urlCount; i++){
		var targetUrl = nlapiGetLineItemValue('recmachcustrecord_ns_cdq_pageid', 'custrecord_ns_cdq_query', (i+1));
		
		urls.push(targetUrl);
	}
	
	// prevent page with same site, url, and tag combination 
	var clientUtil = new cds_commons.ClientUtil();
	ret = clientUtil.validateUrlAndTag(urls, tags, siteId);
	if(!ret){
		return ret;
	}
	
	// prevent non-Approved entries in Content Rule tab
	ret = clientUtil.validateApprovedContent();
	
//	alert('end: ' + nlapiGetContext().getRemainingUsage());
	
	return ret;
}

/**
 * This is called by closeContentPopup and sets the existing Merch rule as selected in the Content dropdown
 * @param {Object} contains contentId which is the customrecord_ns_cd_content internalid and target which opened the content window
 * @returns {Void}
 */
function popupCallback(params){
	if(params.target == 'recmachcustrecord_ns_cdpc_pageid:custrecord_ns_cdpc_contentid'){
		nlapiSetCurrentLineItemValue('recmachcustrecord_ns_cdpc_pageid', 'custrecord_ns_cdpc_contentid', params.contentId);
	}
}