/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Dec 2012     adimaunahan
 *
 */


var relayout = new cds_commons.ClientUtil();
relayout.moveContentTagLabel();
		
function pageInit(type){
	
	var divTitle = Ext.select('#main_form div.pt_title');
	if(divTitle){
		if(type == 'create'){
			divTitle.update('New Content Tag');	
		}
		else if(type == 'edit'){
			divTitle.update('Edit Content Tag');
		}	
	}	
}

function saveRecord(){
	
	var clientUtil = new cds_commons.ClientUtil();
	
	var name = nlapiGetFieldValue('name');
	var currId = nlapiGetRecordId();
	
	if(name){
		name = name.trim();
		
		if(clientUtil.validateTag(name) == false){
			alert('Please enter tags in this format: TAGCATEGORY:TAGSTRING');
			return false;
		}
				
		filters = [
           new nlobjSearchFilter('name', null, 'is', name)
        ];

        var res = nlapiSearchRecord('customrecord_ns_cd_tag', null, filters, null);
        if(res){
        	var id = res[0].getId();
        	
        	if(currId != id){
        		alert('Content Tag must be unique.');
            	return false;	
        	}
        }	
	}
	
	return true;
}
