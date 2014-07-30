/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Apr 2013     adimaunahan      initial implementation
 *
 */

function toggleInactives(isVisible, hideNavBar){
	var params = '';
	
	if(isVisible){
		params = '&showinactives=T';
	}
	
	if(hideNavBar){
		params += '&ifrmcntnr=T';
	}
	
	var targetURL = nlapiResolveURL('SUITELET', 'customscript_cds_sl_main_menu', 'customdeploy_cds_sl_main_menu');
	
//	nlapiSetRedirectURL('SUITELET', 'customscript_cds_sl_main_menu', 'customdeploy_cds_sl_main_menu');
	window.location = targetURL + params;
}

function redirectToNewPage(cfid, hideNavBar){
	
	var targetURL = nlapiResolveURL('RECORD','customrecord_ns_cd_page');
	var params = '&cf=' + cfid;
	
	if(hideNavBar){
		params += '&ifrmcntnr=T';
	}
		
	window.location = targetURL + params;
}

function submitInactives(){
	
	var targetURL = nlapiResolveURL('SUITELET', 'customscript_cds_sl_main_menu', 'customdeploy_cds_sl_main_menu');
	
	window.location = targetURL;
}