/**
 * Description: SuiteCommerce Advanced Features (Cart Abandonment Notifications)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author fbuschiazzo
*  @version 1.0
*/
 
/**
 * CART ABANDONMENT NOTIFICATION
 * Send notification to customer when the item has been stayed in the cart for more than 30 days
 */
function cartAbandonment(){
	nlapiLogExecution("DEBUG", "Schedule Send Notifications", "----START----");
    try {
        var arrItemsId = [];
        var objCustomers = {};
        var strSitesNumber = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_can_sitenumbers");
        var strTemplateId = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_can_notftplid");
        var strEmployeeId = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_can_notfempid");
        var strTemplateCellId = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_can_notftplcellid");		
		nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Email Template: "+strTemplateId);
		nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Email Cell Template: "+strTemplateCellId);
		nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Template Employee: "+strEmployeeId);
		nlapiLogExecution("DEBUG", "Schedule Send Notifications", "List of Sites Number: "+strSitesNumber);				
		if (!isEmpty(strTemplateId) && !isEmpty(strEmployeeId) && !isEmpty(strTemplateCellId) && !isEmpty(strSitesNumber)) {
			var arrSitesNumber = strSitesNumber.split(",");
			var arrFilters = [], arrColumns = [];
			arrFilters.push(new nlobjSearchFilter('datemodified', 'shoppingcart', 'onOrBefore', 'daysAgo30'));
			//Array of Customers which have items in cart for 30 days or more
			var arrSearchResults = nlapiSearchRecord("customer", "customsearch_gpr_aae_ss_can", arrFilters, null);
			if (!isEmptyArray(arrSearchResults)) {
				for (var i = 0; i < arrSearchResults.length; i++) {
            		var strCustomerId = arrSearchResults[i].getId();
                	var itemId = arrSearchResults[i].getValue("item", "shoppingCart");
                	if(!objCustomers.hasOwnProperty(strCustomerId)) {
                    	objCustomers[strCustomerId] = {
                        	"email" : arrSearchResults[i].getValue("email"),
                        	"items" : {}
                    	};
                    	objCustomers[strCustomerId].items[itemId] = {};
                    }
					else{
		    			if(!objCustomers[strCustomerId].items.hasOwnProperty(itemId)) 
		    				objCustomers[strCustomerId].items[itemId] = {};
		    		}
		    		//Array of all items Id's
		    		arrItemsId.push(itemId);
				}
				for(var i = 0; i < arrSitesNumber.length; i++){
					var objItemsInfo = loadItemInfo(arrItemsId, arrSitesNumber[i]);
					//Send Notification
					sendCartAbandonmentNotification(objCustomers, objItemsInfo, strTemplateId, strEmployeeId, strTemplateCellId);	
				}
			}
		}else{
			nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Empty Template. Empty Employee or empty Site Number");
		}      
	} 
	catch (ex) {
    	if (ex.getDetails != undefined) {
    	     nlapiLogExecution("DEBUG",  "Schedule Send Notifications", "Process Error", ex.getCode() + ": " + ex.getDetails());
    	}
    	else {
    	    nlapiLogExecution("DEBUG",  "Schedule Send Notifications", "Unexpected Error", ex.toString());
    	}
	}
	nlapiLogExecution("DEBUG", "Schedule Calculate Credits", "-----END-----");	
}
					
function loadItemInfo(arrItems, siteNumber) {
    nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Items Found: " + arrItems.join(","));
    var arrFilters = [], arrColumns = [], objItemsResult = {};
    arrFilters.push(new nlobjSearchFilter("internalid", null, "is", arrItems));
    arrFilters.push(new nlobjSearchFilter("isonline", null, "is", "T"));
    arrFilters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
    arrFilters.push(new nlobjSearchFilter("matrixchild", null, "is", "F"));
    arrFilters.push(new nlobjSearchFilter("website", null, "is", siteNumber));
    arrColumns.push(new nlobjSearchColumn("storedisplayname"));
    arrColumns.push(new nlobjSearchColumn("thumbnailurl"));
    arrColumns.push(new nlobjSearchColumn("itemurl"));
    arrColumns.push(new nlobjSearchColumn("onlinecustomerprice"));
    arrColumns.push(new nlobjSearchColumn("storedescription"));
    arrColumns.push(new nlobjSearchColumn("salesdescription"));
    var arrSearchResults = nlapiSearchRecord("item", null, arrFilters, arrColumns);
    if(!isEmptyArray(arrSearchResults)) {
        nlapiLogExecution("DEBUG", "Schedule Send Notifications", "No matrix child found: " + arrSearchResults.length);
        for(var i = 0; i < arrSearchResults.length; i++) {
        	if(!objItemsResult.hasOwnProperty(arrItems[i])) {
            	objItemsResult[arrItems[i]] = {
                	"internalid" : arrSearchResults[i].getId(),
                	"storedisplayname" : arrSearchResults[i].getValue("storedisplayname"),
                	"thumbnailurl" : arrSearchResults[i].getValue("thumbnailurl"),
                	"itemurl" : arrSearchResults[i].getValue("itemurl"),
                	"onlinecustomerprice" : arrSearchResults[i].getValue("onlinecustomerprice"),
                	"salesdescription" : arrSearchResults[i].getValue("salesdescription"),
                	"storedescription" : arrSearchResults[i].getValue("storedescription")
            	};
        	}
        }
    }
    arrFilters = [];
    arrColumns = [];
    arrFilters.push(new nlobjSearchFilter("internalid", null, "is", arrItems));
    arrFilters.push(new nlobjSearchFilter("isonline", null, "is", "T"));
    arrFilters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
    arrFilters.push(new nlobjSearchFilter("matrixchild", null, "is", "T"));
    arrFilters.push(new nlobjSearchFilter("website", null, "is", siteNumber));
    arrColumns.push(new nlobjSearchColumn("storedisplayname", "parent"));
    arrColumns.push(new nlobjSearchColumn("thumbnailurl", "parent"));
    arrColumns.push(new nlobjSearchColumn("itemurl", "parent"));
    arrColumns.push(new nlobjSearchColumn("onlinecustomerprice"));
    arrColumns.push(new nlobjSearchColumn("storedescription", "parent"));
    arrColumns.push(new nlobjSearchColumn("salesdescription", "parent"));
    arrSearchResults = nlapiSearchRecord("item", null, arrFilters, arrColumns);
    if(!isEmptyArray(arrSearchResults)) {
        nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Matrix child found: " + arrSearchResults.length);
        for(var i = 0; i < arrSearchResults.length; i++) {
            if(!objItemsResult.hasOwnProperty(arrItems[i])) {
            	objItemsResult[arrItems[i]] = {
            	    "internalid" : arrSearchResults[i].getId(),
            	    "storedisplayname" : arrSearchResults[i].getValue("storedisplayname", "parent"),
            	    "thumbnailurl" : arrSearchResults[i].getValue("thumbnailurl", "parent"),
            	    "itemurl" : arrSearchResults[i].getValue("itemurl", "parent"),
            	    "onlinecustomerprice" : arrSearchResults[i].getValue("onlinecustomerprice"),
            	    "salesdescription" : arrSearchResults[i].getValue("salesdescription", "parent"),
            	    "storedescription" : arrSearchResults[i].getValue("storedescription", "parent")
            	};
        	}
        }
    }
    return objItemsResult;
}

function sendCartAbandonmentNotification(objCustomers, objItemsInfo, strTemplateId, strEmployeeId, strTemplateCellId) {
    var recTemplate = nlapiLoadRecord("customrecord_gpr_addonstpls", strTemplateCellId);
    var strTemplateCell = recTemplate.getFieldValue("custrecord_gpr_addonstpls_code");
    nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Customer: " + JSON.stringify(objCustomers));
    for(var strCustomerId in objCustomers) {
        var strEmail = objCustomers[strCustomerId].email;
        var objItems = objCustomers[strCustomerId].items;
		var mailCustomer = nlapiMergeRecord(strTemplateId, 'customer', strCustomerId);
        var strItemsHTML = "";
        for(var strItemId in objItems) {
            var strItemIdInfo = objItemsInfo[strItemId];
            if(strItemIdInfo != "undefined"){
	            var strAuxItemCellTpl = strTemplateCell;
	            var strItemUrlRegExp = '<NLITEMURL([^"]*)';
	            var regExpItemUrl = new RegExp(strItemUrlRegExp, "g");
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(regExpItemUrl, strItemIdInfo.itemurl);
	            var strItemImgRegExp = '<NLITEMTHUMBNAIL([^"]*)';
	            var regExpItemImgUrl = new RegExp(strItemImgRegExp, "g");
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(regExpItemImgUrl, strItemIdInfo.thumbnailurl);
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(/<NLITEMNAME>/g, strItemIdInfo.storedisplayname);
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(/<NLITEMSTOREDESCRIPTION>/g, strItemIdInfo.storedescription);
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(/<NLITEMSALESDESCRIPTION>/g, strItemIdInfo.salesdescription);
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(/<NLITEMPRICE>/g, strItemIdInfo.onlinecustomerprice);
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(/<NLITEMID>/g, strItemIdInfo.internalid);
	            var strCommentsRegExp = "<!--([^<]*)";
	            var regExpCooments = new RegExp(strCommentsRegExp, "g");
	            strAuxItemCellTpl = strAuxItemCellTpl.replace(regExpCooments, "");
	            strItemsHTML += strAuxItemCellTpl;            	
            }
        }
        if(strItemsHTML != ""){
        	nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Items HTML: " + strItemsHTML);
        	var strBody = mailCustomer.getValue();
        	strBody = strBody.replace(/<CAAITEMLIST>/g, strItemsHTML);
        	var records = {};
        	records['entity'] = strCustomerId;
        	//Change strEmail for your email address to test the results
        	nlapiSendEmail(strEmployeeId, strEmail, "Cart Abandonment Notification", strBody, null, null, records);
    	}else{
    		nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Items not found in this site");
    	}
    }
}