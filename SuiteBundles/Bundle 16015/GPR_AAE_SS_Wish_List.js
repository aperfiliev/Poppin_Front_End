/**
 * Description: SuiteCommerce Advanced Features (Wish List)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 3.0
*/

/**
 * WISH LIST PROFESSIONAL
 * Gets and shows the items in the customer Wish List
 * Recives the Id of the Customer and the container id in which the items will be shown
 * @param {Object} request
 * @param {Object} response
 * Returns the JSON code in order to show the items in the Customer Wish List
 * @return {Object} response
 */
function getItems(request,response){    
    var bolMultiSite = nlapiGetContext().getFeature("MULTISITE");   
    var strCustomerId = unescape(request.getParameter("customerid"));
    var strSiteNumber = request.getParameter("sitenumber");   
	var strWlpNumber = unescape(request.getParameter("wlpnumber"));	
	var strCallback = unescape(request.getParameter("callback"));
	var strAddonOption = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_wlp_addonsltsoption");
	var arrLytFilters = [], arrLytColumns = [], arrFilters = [], arrColumns = [], intItemsCount = 0, strJSON = "", strItems = "";
	nlapiLogExecution("DEBUG", "Show Wish List", "----START----");	
	try {		
		if (checkLicense(strSiteNumber,"wlp")) {			
			nlapiLogExecution("DEBUG", "Show Wish List", "License OK");
			if (!isEmpty(strCustomerId) &&  !isEmpty(strSiteNumber)  &&  !isEmpty(strWlpNumber)){
				nlapiLogExecution("DEBUG", "Show Wish List",  "Parameters OK - customerid: " + strCustomerId + ", site: " + strSiteNumber);				
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_option", null, "is", strAddonOption));			
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_sitenumber", null, "equalto", strSiteNumber));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listtpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listcelltpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_bundlename"));
				var arrSearchResultsLyt = nlapiSearchRecord("customrecord_gpr_addonslyts", null, arrLytFilters, arrLytColumns);
				if(!isEmptyArray(arrSearchResultsLyt)){
					nlapiLogExecution("DEBUG", "Show Wish List", "Layout OK");				
					var strHtmlListTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[0]);
					var strHtmlListCellTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[1]);
					var strBundleName = arrSearchResultsLyt[0].getValue(arrLytColumns[2]);
					if(!isEmpty(strHtmlListCellTpl) && !isEmpty(strHtmlListTpl)) {
						nlapiLogExecution("DEBUG", "Show Wish List", "Templates OK");				
						var strHtmlListCell = "", strHtmlListResult = "";
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_customerid", null, "is", strCustomerId));
						arrFilters.push(new nlobjSearchFilter("isinactive", "custrecord_gpr_aae_wlp_itemid", "is", "F"));
						arrFilters.push(new nlobjSearchFilter("isonline", "custrecord_gpr_aae_wlp_itemid", "is", "T"));
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_sitenumber", null, "equalto", strSiteNumber));
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_number", null, "is", strWlpNumber));
						if (bolMultiSite) {
							nlapiLogExecution("DEBUG", "Show Wish List", "Multi Site");
							arrFilters.push(new nlobjSearchFilter("website", "custrecord_gpr_aae_wlp_itemid", "is", strSiteNumber));
						}
						arrColumns.push(new nlobjSearchColumn("storedisplayname", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("salesdescription", "custrecord_gpr_aae_wlp_itemid"));					
						arrColumns.push(new nlobjSearchColumn("thumbnailurl", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("itemurl", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("storedescription", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("storedetaileddescription", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns[0].setSort();
						var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_wlp", null, arrFilters, arrColumns);
						if (!isEmptyArray(arrSearchResults)) {
							nlapiLogExecution("DEBUG", "Show Wish List", "Items Found");
							for (var i = 0; i < Math.min(500, arrSearchResults.length); i++) {
								strHtmlListCell = strHtmlListCellTpl;
								var objSearchResult = arrSearchResults[i];
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMID>/g, objSearchResult.getValue(arrColumns[4]));
								strItems += "{internalid:'" + objSearchResult.getValue(arrColumns[4]) + "',url:'" + escape(objSearchResult.getValue(arrColumns[3])) + "'},";
								nlapiLogExecution("DEBUG", "Show Wish List", "Item Id: "+objSearchResult.getValue(arrColumns[4]));							
															
								var strName = objSearchResult.getValue(arrColumns[0]);
								if (isEmpty(strName)) {
									strName = "&nbsp;";
								}
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMNAME>/g, strName);
								
								var strDescription = objSearchResult.getValue(arrColumns[1]);
								if (isEmpty(strDescription)) {
									strDescription = "&nbsp;";
								}
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMDESCRIPTION>/g, strDescription);							
								var strImgUrlRegExp = '<NLITEMIMGURL([^"]*)';
								var regExpImgUrl = new RegExp(strImgUrlRegExp, "g");
								strHtmlListCell = strHtmlListCell.replace(regExpImgUrl, objSearchResult.getValue(arrColumns[2]));								    
								var strItemUrlRegExp = '<NLITEMURL([^"]*)';
								var regExpItemUrl = new RegExp(strItemUrlRegExp, "g");
								strHtmlListCell = strHtmlListCell.replace(regExpItemUrl, objSearchResult.getValue(arrColumns[3]));
								
								strHtmlListCell = strHtmlListCell.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
								strHtmlListCell = strHtmlListCell.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
								
								strHtmlListResult += strHtmlListCell;
								intItemsCount++;
							}
						}
						nlapiLogExecution("DEBUG", "Show Wish List", "Finish Loop Items");
						strItems = strItems.substring(0, (strItems.length - 1));
						var strHtmlList = strHtmlListTpl;
						strHtmlList = strHtmlList.replace(/<NLLISTTOTAL>/g, intItemsCount.toString());
						strHtmlList = strHtmlList.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
						strHtmlList = strHtmlList.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());						
						var strCommentsRegExp = "<!--([^<]*)";
						var regExpCooments = new RegExp(strCommentsRegExp, "g");
						strJSON = strCallback + "({Results:{html:'" + escape(strHtmlList.replace("<NLLISTRESULT>", strHtmlListResult).replace(regExpCooments, "")) + "'},Items:[" + strItems + "],Errors:[]});";
						response.write(strJSON);
					}
					else{
						nlapiLogExecution("ERROR", "Wish List Professional", "Templates not Found");
						strJSON = strCallback + "({Errors:[{code:'-1',details:'Templates not Found'}]});";
						response.write(strJSON);
					}
				}
				else{
					nlapiLogExecution("ERROR", "Wish List Professional", "Layout not Found");
					strJSON = strCallback + "({Errors:[{code:'-1',details:'Layout not Found'}]});";
					response.write(strJSON);				
				}
			}
			else{			
				nlapiLogExecution("ERROR", "Wish List Professional", "Invalid parameters");
				strJSON = strCallback + "({Errors:[{code:'-1',details:'Invalid parameters.'}]});";
				response.write(strJSON);
			}			
		}
		else{			
			nlapiLogExecution("ERROR", "Wish List Professional", "Invalid License");
			strJSON = strCallback + "({Errors:[{code:'-1',details:'The Wish List is Disabled for this Website.'}]});";
			response.write(strJSON);
		}
	}
	catch (ex) {
		if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
		{
			nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
			strJSON = strCallback + "({Errors:[{code:'" + escape(ex.getCode()) + "',details:'" + escape(ex.getDetails()) + "'}]});";
			response.write(strJSON);
        }
        else {
			nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
			strJSON = strCallback + "({Errors:[{code:'0',details:'" + escape(ex.message) + "'}]});";            
			response.write(strJSON);
        }
	}
	nlapiLogExecution('DEBUG', 'Show Wish List', 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Show Wish List", "-----END-----");    
}


/**
 * WISH LIST PROFESSIONAL
 * Gets and shows the saved cart items in the customer Wish List
 * Recives the Id of the Customer and the container id in which the items will be shown
 * @param {Object} request
 * @param {Object} response
 * Returns the JSON code in order to show the items in the Customer Wish List
 * @return {Object} response
 */
function getSavedCartItems(request,response){    
    var bolMultiSite = nlapiGetContext().getFeature("MULTISITE");   
    var strCustomerId = unescape(request.getParameter("customerid"));
    var strSiteNumber = request.getParameter("sitenumber");   
	var strWlpNumber = unescape(request.getParameter("wlpnumber"));	
	var strCallback = unescape(request.getParameter("callback"));
	var strAddonOption = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_wlp_scartaddonsoption");
	var arrLytFilters = [], arrLytColumns = [], arrFilters = [], arrColumns = [], intItemsCount = 0, strJSON = "", strItems = "";
	nlapiLogExecution("DEBUG", "Show Wish List", "----START----");	
	try {		
		if (checkLicense(strSiteNumber,"wlp")) {			
			nlapiLogExecution("DEBUG", "Show Wish List", "License OK");
			if (!isEmpty(strCustomerId) &&  !isEmpty(strSiteNumber)  &&  !isEmpty(strWlpNumber)){
				nlapiLogExecution("DEBUG", "Show Wish List",  "Parameters OK - customerid: " + strCustomerId + ", site: " + strSiteNumber);				
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_option", null, "is", strAddonOption));			
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_sitenumber", null, "equalto", strSiteNumber));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listtpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listcelltpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_bundlename"));
				var arrSearchResultsLyt = nlapiSearchRecord("customrecord_gpr_addonslyts", null, arrLytFilters, arrLytColumns);
				if(!isEmptyArray(arrSearchResultsLyt)){
					nlapiLogExecution("DEBUG", "Show Wish List", "Layout OK");				
					var strHtmlListTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[0]);
					var strHtmlListCellTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[1]);
					var strBundleName = arrSearchResultsLyt[0].getValue(arrLytColumns[2]);
					if(!isEmpty(strHtmlListCellTpl) && !isEmpty(strHtmlListTpl)) {
						nlapiLogExecution("DEBUG", "Show Wish List", "Templates OK");				
						var strHtmlListCell = "", strHtmlListResult = "";
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_customerid", null, "is", strCustomerId));
						arrFilters.push(new nlobjSearchFilter("isinactive", "custrecord_gpr_aae_wlp_itemid", "is", "F"));
						arrFilters.push(new nlobjSearchFilter("isonline", "custrecord_gpr_aae_wlp_itemid", "is", "T"));
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_sitenumber", null, "equalto", strSiteNumber));
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_number", null, "is", strWlpNumber));
						if (bolMultiSite) {
							nlapiLogExecution("DEBUG", "Show Wish List", "Multi Site");
							arrFilters.push(new nlobjSearchFilter("website", "custrecord_gpr_aae_wlp_itemid", "is", strSiteNumber));
						}
						arrColumns.push(new nlobjSearchColumn("storedisplayname", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("salesdescription", "custrecord_gpr_aae_wlp_itemid"));					
						arrColumns.push(new nlobjSearchColumn("thumbnailurl", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("itemurl", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("storedescription", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns.push(new nlobjSearchColumn("storedetaileddescription", "custrecord_gpr_aae_wlp_itemid"));
						arrColumns[0].setSort();
						var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_wlp", null, arrFilters, arrColumns);
						if (!isEmptyArray(arrSearchResults)) {
							nlapiLogExecution("DEBUG", "Show Wish List", "Items Found");
							for (var i = 0; i < Math.min(500, arrSearchResults.length); i++) {
								strHtmlListCell = strHtmlListCellTpl;
								var objSearchResult = arrSearchResults[i];
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMID>/g, objSearchResult.getValue(arrColumns[4]));
								strItems += "{internalid:'" + objSearchResult.getValue(arrColumns[4]) + "',url:'" + escape(objSearchResult.getValue(arrColumns[3])) + "'},";
								nlapiLogExecution("DEBUG", "Show Wish List", "Item Id: "+objSearchResult.getValue(arrColumns[4]));							
															
								var strName = objSearchResult.getValue(arrColumns[0]);
								if (isEmpty(strName)) {
									strName = "&nbsp;";
								}
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMNAME>/g, strName);
								
								var strDescription = objSearchResult.getValue(arrColumns[1]);
								if (isEmpty(strDescription)) {
									strDescription = "&nbsp;";
								}
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMDESCRIPTION>/g, strDescription);							
								var strImgUrlRegExp = '<NLITEMIMGURL([^"]*)';
								var regExpImgUrl = new RegExp(strImgUrlRegExp, "g");
								strHtmlListCell = strHtmlListCell.replace(regExpImgUrl, objSearchResult.getValue(arrColumns[2]));								    
								var strItemUrlRegExp = '<NLITEMURL([^"]*)';
								var regExpItemUrl = new RegExp(strItemUrlRegExp, "g");
								strHtmlListCell = strHtmlListCell.replace(regExpItemUrl, objSearchResult.getValue(arrColumns[3]));
								
								strHtmlListCell = strHtmlListCell.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
								strHtmlListCell = strHtmlListCell.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
								
								strHtmlListResult += strHtmlListCell;
								intItemsCount++;
							}
						}
						nlapiLogExecution("DEBUG", "Show Wish List", "Finish Loop Items");
						strItems = strItems.substring(0, (strItems.length - 1));
						var strHtmlList = strHtmlListTpl;
						strHtmlList = strHtmlList.replace(/<NLLISTTOTAL>/g, intItemsCount.toString());
						strHtmlList = strHtmlList.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
						strHtmlList = strHtmlList.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());						
						var strCommentsRegExp = "<!--([^<]*)";
						var regExpCooments = new RegExp(strCommentsRegExp, "g");
						strJSON = strCallback + "({Results:{html:'" + escape(strHtmlList.replace("<NLLISTRESULT>", strHtmlListResult).replace(regExpCooments, "")) + "'},Items:[" + strItems + "],Errors:[]});";
						response.write(strJSON);
					}
					else{
						nlapiLogExecution("ERROR", "Wish List Professional", "Templates not Found");
						strJSON = strCallback + "({Errors:[{code:'-1',details:'Templates not Found'}]});";
						response.write(strJSON);
					}
				}
				else{
					nlapiLogExecution("ERROR", "Wish List Professional", "Layout not Found");
					strJSON = strCallback + "({Errors:[{code:'-1',details:'Layout not Found'}]});";
					response.write(strJSON);				
				}
			}
			else{			
				nlapiLogExecution("ERROR", "Wish List Professional", "Invalid parameters");
				strJSON = strCallback + "({Errors:[{code:'-1',details:'Invalid parameters.'}]});";
				response.write(strJSON);
			}			
		}
		else{			
			nlapiLogExecution("ERROR", "Wish List Professional", "Invalid License");
			strJSON = strCallback + "({Errors:[{code:'-1',details:'The Wish List is Disabled for this Website.'}]});";
			response.write(strJSON);
		}
	}
	catch (ex) {
		if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
		{
			nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
			strJSON = strCallback + "({Errors:[{code:'" + escape(ex.getCode()) + "',details:'" + escape(ex.getDetails()) + "'}]});";
			response.write(strJSON);
        }
        else {
			nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
			strJSON = strCallback + "({Errors:[{code:'0',details:'" + escape(ex.message) + "'}]});";            
			response.write(strJSON);
        }
	}
	nlapiLogExecution('DEBUG', 'Show Wish List', 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Show Wish List", "-----END-----");    
}

/**
 * WISH LIST PROFESSIONAL
 * Adds an intem to the customer Wish List
 * Recives the internalid of the item and the Id of the Customer
 * @param {Object} request
 * @param {Object} response
 * Returns the JSON
 * @return {Object} response
 */
function addItem(request,response){	
    var strCustomerId = unescape(request.getParameter("customerid"));
	var strSiteNumber = request.getParameter("sitenumber");	
    var strItemId = request.getParameter("itemid");   
	var strWlpNumber = unescape(request.getParameter("wlpnumber"));	
	var strCallback = unescape(request.getParameter("callback"));  
	var arrFilters = [], strJSON = "";
	nlapiLogExecution("DEBUG", "Add Item Wish List", "----START----");
	try {		
		if (checkLicense(strSiteNumber,"wlp")) {
			nlapiLogExecution("DEBUG", "Add Item Wish List", "License OK");
			if (!isEmpty(strCustomerId) &&  !isEmpty(strSiteNumber)  && !isEmpty(strItemId)){
				nlapiLogExecution("DEBUG", "Add Item Wish List",  "Parameters OK - customerid: " + strCustomerId + ", site: " + strSiteNumber + ", itemid: " + strItemId);
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_customerid", null, "is", strCustomerId));
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_sitenumber", null, "equalto", strSiteNumber));
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_itemid", null, "is", strItemId));
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_number", null, "is", strWlpNumber));
				var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_wlp", null, arrFilters, null);
				if (isEmptyArray(arrSearchResults)) {
					var objCustomerWLP = nlapiCreateRecord("customrecord_gpr_aae_wlp");
					objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_customerid", strCustomerId);
					objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_sitenumber", strSiteNumber);
					objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_itemid", strItemId);
					objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_number", strWlpNumber);
					nlapiSubmitRecord(objCustomerWLP, false, true);
					nlapiLogExecution("DEBUG", "Add Item Wish List", "Item Added OK");
					strJSON = "({Results:{msgcode:'0',details:'Item Added OK'},Errors:[]});";					
				}
				else {
					nlapiLogExecution("DEBUG", "Add Item Wish List", "Item already on Wish List");
					strJSON = "({Results:{msgcode:'1',details:'Item already on Wish List'},Errors:[]});";				
				}
			}else{
				nlapiLogExecution("DEBUG", "Add Item Wish List", "Invalid Parameters");
				strJSON = "({Results:{msgcode:'2',details:'Invalid Parameters'},Errors:[]});";
			}		
		}else{
			nlapiLogExecution("DEBUG", "Add Item Wish List", "Wish List Disable");
			strJSON = "({Results:{msgcode:'3',details:'Wish List Disable'},Errors:[]});";
		}
		response.write(strCallback + strJSON);	    
	}
	catch (ex) {
		if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
		{
			nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
			strJSON = strCallback + "({Errors:[{code:'" + escape(ex.getCode()) + "',details:'" + escape(ex.getDetails()) + "'}]});";
			response.write(strJSON);
        }
        else {
			nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
			strJSON = strCallback + "({Errors:[{code:'0',details:'" + escape(ex.message) + "'}]});";            
			response.write(strJSON);
        }
	}
	nlapiLogExecution('DEBUG', "Add Item Wish List", 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Add Item Wish List", "-----END-----");
}

/**
 * WISH LIST PROFESSIONAL
 * Removes an item from the Customer Wish List
 * Receives the internalid of the item and the Id of the Customer 
 * @param {Object} request
 * @param {Object} response
 * Returns the java script code with the error messages
 * @return {Object} response
 */
function removeItem(request,response){
    var strCustomerId = unescape(request.getParameter("customerid"));
	var strSiteNumber = request.getParameter("sitenumber");
    var strItemId = request.getParameter("itemid");   
	var strWlpNumber = unescape(request.getParameter("wlpnumber"));	
	var strCallback = unescape(request.getParameter("callback"));  
	var arrFilters = [], strJSON = "";
	nlapiLogExecution("DEBUG", "Remove Item Wish List", "----START----");
	try {		
		if (checkLicense(strSiteNumber,"wlp")) {
			nlapiLogExecution("DEBUG", "Remove Item Wish List", "License OK");
			if (!isEmpty(strCustomerId) &&  !isEmpty(strSiteNumber) && !isEmpty(strItemId)){						
				nlapiLogExecution("DEBUG", "Remove Item Wish List", "Parameters OK - customerid: " + strCustomerId + ", site: " + strSiteNumber + ", itemid: " + strItemId);
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_customerid", null, "is", strCustomerId));
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_sitenumber", null, "equalto", strSiteNumber));
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_itemid", null, "is", strItemId));
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_number", null, "is", strWlpNumber));
				var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_wlp", null, arrFilters, null);				
				if (!isEmptyArray(arrSearchResults)) {
					nlapiDeleteRecord(arrSearchResults[0].getRecordType(), arrSearchResults[0].getId());
					nlapiLogExecution("DEBUG", "Remove Item Wish List", "Item Removed OK");
					strJSON = "({Results:{msgcode:'4',details:'Item Removed OK'},Errors:[]});";					
				}else{
					strJSON = "({Results:{msgcode:'7',details:'No Item Found'},Errors:[]});";	
				}				
			}else{
				nlapiLogExecution("DEBUG", "Remove Item Wish List", "Invalid Parameters");
				strJSON = "({Results:{msgcode:'2',details:'Invalid Parameters'},Errors:[]});";				
			}
		}
		else {
			nlapiLogExecution("DEBUG", "Remove Item Wish List", "Wish List Disable");
			strJSON = "({Results:{msgcode:'3',details:'Wish List Disable'},Errors:[]});";
		}
		response.write(strCallback + strJSON);
	} 
	catch (ex) {
		if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
		{
			nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
			strJSON = strCallback + "({Errors:[{code:'" + escape(ex.getCode()) + "',details:'" + escape(ex.getDetails()) + "'}]});";
			response.write(strJSON);
		}
		else {
			nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
			strJSON = strCallback + "({Errors:[{code:'0',details:'" + escape(ex.message) + "'}]});";
			response.write(strJSON);
		}
	}
	nlapiLogExecution('DEBUG', "Remove Item Wish List", 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Remove Item Wish List", "-----END-----");
}

/**
 * WISH LIST PROFESSIONAL
 * Clears all the items in the Customer Wish List
 * Receives the Id of the Customer
 * @param {String} params
 * Returns the java script code with the error messages
 * @return {String} response
 */
function clearItems(request,response){
    var strCustomerId = unescape(request.getParameter("customerid"));
	var strSiteNumber = request.getParameter("sitenumber");   
	var strWlpNumber = unescape(request.getParameter("wlpnumber"));	
	var strCallback = unescape(request.getParameter("callback"));  
	var arrFilters = [], strJSON = "";
	nlapiLogExecution("DEBUG", "Clear Items Wish List", "----START----");	
	try {		
		if (checkLicense(strSiteNumber, "wlp")) {
			nlapiLogExecution("DEBUG", "Clear Items Wish List", "License OK");
			if (!isEmpty(strCustomerId) &&  !isEmpty(strSiteNumber)){	
				nlapiLogExecution("DEBUG", "Clear Items Wish List", "Parameters OK - customerid: " + strCustomerId + ", site: " + strSiteNumber);		
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_customerid", null, "is", strCustomerId));		
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_sitenumber", null, "equalto", strSiteNumber));
				arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_number", null, "is", strWlpNumber));
				var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_wlp", null, arrFilters, null);
				if (!isEmptyArray(arrSearchResults)) {
					for (var i = 0; i < Math.min(500, arrSearchResults.length); i++) {
						nlapiDeleteRecord(arrSearchResults[i].getRecordType(), arrSearchResults[i].getId());						
					}
					nlapiLogExecution("DEBUG", "Clear Items Wish List", "All Item Cleared OK - total: " + arrSearchResults.length);
					strJSON = "({Results:{msgcode:'5',details:'Clear Items OK'},Errors:[]});";								
				}else{
					strJSON = "({Results:{msgcode:'8',details:'No Items Found'},Errors:[]});";
				}
			}else{
				nlapiLogExecution("DEBUG", "Clear Items Wish List", "Invalid Parameters");
				strJSON = "({Results:{msgcode:'2',details:'Invalid Parameters'},Errors:[]});";				
			}
		}
		else {
			nlapiLogExecution("DEBUG", "Clear Items Wish List", "Wish List Disable");
			strJSON = "({Results:{msgcode:'3',details:'Wish List Disable'},Errors:[]});";
		}
		response.write(strCallback + strJSON);
	} 
	catch (ex) {
		if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
		{
			nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
			strJSON = strCallback + "({Errors:[{code:'" + escape(ex.getCode()) + "',details:'" + escape(ex.getDetails()) + "'}]});";
			response.write(strJSON);
		}
		else {
			nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
			strJSON = strCallback + "({Errors:[{code:'0',details:'" + escape(ex.message) + "'}]});";
			response.write(strJSON);
		}
	}
	nlapiLogExecution('DEBUG', "Clear Items Wish List", 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Clear Items Wish List", "-----END-----");
}

/**
 * WISH LIST PROFESSIONAL
 * Adds items to the customer Wish List
 * Recives the internal ids of the items and the Id of the Customer
 * @param {Object} request
 * @param {Object} response
 * Returns the JSON
 * @return {Object} response
 */
function addCartItems(request,response){	
    var strCustomerId = unescape(request.getParameter("customerid"));
	var strSiteNumber = request.getParameter("sitenumber");    
	var strItemsId = unescape(request.getParameter("itemsid"));
	var strWlpNumber = unescape(request.getParameter("wlpnumber"));	
	var strCallback = unescape(request.getParameter("callback"));  
	var strJSON = "";
	nlapiLogExecution("DEBUG", "Add Items to the Wish List", "----START----");
	try {		
		if (checkLicense(strSiteNumber,"wlp")) {
			nlapiLogExecution("DEBUG", "Add Items to the Wish List", "License OK");
			if (!isEmpty(strCustomerId) &&  !isEmpty(strSiteNumber)  && !isEmpty(strItemsId)){
				nlapiLogExecution("DEBUG", "Add Items to the Wish List", "Parameters OK - customerid: " + strCustomerId + ", site: " + strSiteNumber + ", itemsid: " + strItemsId);
				var arrItems = strItemsId.split(';');
				var bolItemAdded = false;
				for (var i = 0; i < Math.min(500, arrItems.length); i++) {
					var arrFilters = [];					
					arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_customerid", null, "is", strCustomerId));
					arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_sitenumber", null, "equalto", strSiteNumber));
					arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_itemid", null, "is", arrItems[i]));
					arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_wlp_number", null, "is", strWlpNumber));
					var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_wlp", null, arrFilters, null);
					if (isEmptyArray(arrSearchResults)) {
						var objCustomerWLP = nlapiCreateRecord("customrecord_gpr_aae_wlp");
						objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_customerid", strCustomerId);
						objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_sitenumber", strSiteNumber);
						objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_itemid", arrItems[i]);
						objCustomerWLP.setFieldValue("custrecord_gpr_aae_wlp_number", strWlpNumber);
						nlapiSubmitRecord(objCustomerWLP, false, true);
						bolItemAdded = true;
						nlapiLogExecution("DEBUG", "Add Items to the Wish List", "Item Added OK: " + arrItems[i]);						
					}
				}
				if (bolItemAdded){
					strJSON = "({Results:{msgcode:'9',details:'Items Added OK'},Errors:[]});";	
				}else{
					strJSON = "({Results:{msgcode:'11',details:'All Items already on Wish List'},Errors:[]});";
				}								
			}else{
				nlapiLogExecution("DEBUG", "Add Items to the Wish List", "Invalid Parameters");
				strJSON = "({Results:{msgcode:'2',details:'Invalid Parameters'},Errors:[]});";
			}		
		}else{
			nlapiLogExecution("DEBUG", "Add Items to the Wish List", "Wish List Disable");
			strJSON = "({Results:{msgcode:'3',details:'Wish List Disable'},Errors:[]});";
		}
		response.write(strCallback + strJSON);	    
	}
	catch (ex) {
		if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
		{
			nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
			strJSON = strCallback + "({Errors:[{code:'" + escape(ex.getCode()) + "',details:'" + escape(ex.getDetails()) + "'}]});";
			response.write(strJSON);
        }
        else {
			nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
			strJSON = strCallback + "({Errors:[{code:'0',details:'" + escape(ex.message) + "'}]});";            
			response.write(strJSON);
        }
	}
	nlapiLogExecution('DEBUG', "Add Items to the Wish List", 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Add Items to the Wish List", "-----END-----");
}
