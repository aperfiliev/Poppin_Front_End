/**
 * Description: SuiteCommerce Advanced Features (Gift Registry)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 3.0
*/

/**
 * GIFT REGISTRY
 * Deletes a Gift Registry Theme
 * Recives: the theme internal id.
 * @param {String} request, response  
 * @return {JSON} response
 */

function remove(request, response){	
    var strGiftRegistryId = request.getParameter("giftregistryid");
    var strCallback = unescape(request.getParameter("callback"));
    var strReturn = "", strJSON = "";
    nlapiLogExecution("DEBUG", "Remove Gift Registry", "----START----");    
    try {
        var arrFilters = [];
        arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_gir_itm_id", null, "is", strGiftRegistryId));
        var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_gir_itm", null, arrFilters, null);
        if (isEmptyArray(arrSearchResults)) {
            nlapiDeleteRecord("customrecord_gir_thm", strGiftRegistryId);
            strReturn = "({Errors:[]});"
        }
        else {
            strReturn = "({Errors:[{code:'-1',details:'The Gift Registry can not be deleted, please delete all the items first.'}]});"
        }
        response.write(strCallback + strReturn);
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
    nlapiLogExecution("DEBUG", "Remove Gift Registry", "Usage: " + nlapiGetContext().getRemainingUsage());
    nlapiLogExecution("DEBUG", "Remove Gift Registry", "-----END-----");
}

/**
 * GIFT REGISTRY
 * Gets the Gift Registries
 * Recives: the theme internal id.
 * @param {String} request, response 
 * @return {JSON} response
 */
function get(request, response){
    var strCustomerId = unescape(request.getParameter("customerid"));
    var strSiteNumber = request.getParameter("sitenumber");
	var strCallback = unescape(request.getParameter("callback"));
	var strAddonOption = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_gir_getoption");
	var arrLytFilters = [], arrLytColumns = [], arrFilters = [], arrColumns = [], intItemsCount = 0, strJSON = "", strItems = "";
    nlapiLogExecution("DEBUG", "Get Gift Registries", "----START----");
    try {
        if (checkLicense(strSiteNumber, 'gir')) {
			nlapiLogExecution("DEBUG", "Get Gift Registries", "License OK");
			if (!isEmpty(strCustomerId) && !isEmpty(strSiteNumber)) {
				nlapiLogExecution("DEBUG", "Get Gift Registries", "Parameters OK - customerid: " + strCustomerId + ", site: " + strSiteNumber);
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_option", null, "is", strAddonOption));
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_sitenumber", null, "equalto", strSiteNumber));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listtpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listcelltpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_bundlename"));
				var arrSearchResultsLyt = nlapiSearchRecord("customrecord_gpr_addonslyts", null, arrLytFilters, arrLytColumns);
				if (!isEmptyArray(arrSearchResultsLyt)) {
					nlapiLogExecution("DEBUG", "Get Gift Registries", "Layout OK");
					var strHtmlListTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[0]);
					var strHtmlListCellTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[1]);
					var strBundleName = arrSearchResultsLyt[0].getValue(arrLytColumns[2]);
					if (!isEmpty(strHtmlListCellTpl) && !isEmpty(strHtmlListTpl)) {
						nlapiLogExecution("DEBUG", "Get Gift Registries", "Templates OK");	
						var strHtmlListCell = "", strHtmlListResult = "";
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_gir_customerid", null, "is", strCustomerId));
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_gir_sitenumber", null, "equalto", strSiteNumber));
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_gir_name"));
						var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_gir", null, arrFilters, arrColumns);											
						if (!isEmptyArray(arrSearchResults)) {
							for (var i = 0; i < Math.min(500, arrSearchResults.length); i++) {
								strHtmlListCell = strHtmlListCellTpl;
								objSearchResult = arrSearchResults[i];
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMID>/g, objSearchResult.id);
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMNAME>/g, objSearchResult.getValue(arrColumns[0]));
								strHtmlListCell = strHtmlListCell.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
								strHtmlListCell = strHtmlListCell.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
								strHtmlListResult += strHtmlListCell;
								intItemsCount++;
							}
							nlapiLogExecution("DEBUG", "Get Gift Registries", "Finish Loop Items");
						}
						var strHtmlList = strHtmlListTpl;
						strHtmlList = strHtmlList.replace(/<NLLISTTOTAL>/g, intItemsCount.toString());
						strHtmlList = strHtmlList.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
						strHtmlList = strHtmlList.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());						
						var strCommentsRegExp = "<!--([^<]*)";
						var regExpCooments = new RegExp(strCommentsRegExp, "g");
						strJSON = strCallback + "({Results:{html:'" + escape(strHtmlList.replace("<NLLISTRESULT>", strHtmlListResult).replace(regExpCooments, "")) + "'},Errors:[]});";						
					}else{
						nlapiLogExecution("ERROR", "Get Gift Registries", "Templates not Found");
						strJSON = strCallback + "({Errors:[{code:'-1',details:'Templates not Found'}]});";						
					}
				}else{
					nlapiLogExecution("ERROR", "Get Gift Registries", "Layout not Found");
					strJSON = strCallback + "({Errors:[{code:'-1',details:'Layout not Found'}]});";					
				}
			}else{
				nlapiLogExecution("ERROR", "Get Gift Registries", "Invalid parameters");
				strJSON = strCallback + "({Errors:[{code:'-1',details:'Invalid parameters.'}]});";				
			}            
        }else {
           	nlapiLogExecution("ERROR", "Get Gift Registries", "Invalid License");
			strJSON = strCallback + "({Errors:[{code:'-1',details:'The Gift Registry is Disabled for this Website.'}]});";			
        }
        response.write(strJSON);        
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
    nlapiLogExecution("DEBUG", "Get Gift Registries", "Usage: " + nlapiGetContext().getRemainingUsage());
    nlapiLogExecution("DEBUG", "Get Gift Registries", "-----END-----");
}

/**
 * GIFT REGISTRY
 * Gets the Others Gift Registries
 * Recives: the theme internal id.
 * @param {String} request, response 
 * @return {JSON} response
 */
function getShared(request, response){
    var strCustomerEmail = unescape(request.getParameter("customeremail"));
    var strSiteNumber = request.getParameter("sitenumber");
	var strCallback = unescape(request.getParameter("callback"));
	var strAddonOption = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_gir_getsharedoption");
	var arrLytFilters = [], arrLytColumns = [], arrFilters = [], arrColumns = [], intItemsCount = 0, strJSON = "", strItems = "";
    nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "----START----");
    try {
        if (checkLicense(strSiteNumber, 'gir')) {
			nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "License OK");
			if (!isEmpty(strCustomerEmail) && !isEmpty(strSiteNumber)) {
				nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "Parameters OK - customerid: " + strCustomerEmail + ", site: " + strSiteNumber);
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_option", null, "is", strAddonOption));
				arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_sitenumber", null, "equalto", strSiteNumber));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listtpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listcelltpl"));
				arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_bundlename"));
				var arrSearchResultsLyt = nlapiSearchRecord("customrecord_gpr_addonslyts", null, arrLytFilters, arrLytColumns);
				if (!isEmptyArray(arrSearchResultsLyt)) {
					nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "Layout OK");
					var strHtmlListTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[0]);
					var strHtmlListCellTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[1]);
					var strBundleName = arrSearchResultsLyt[0].getValue(arrLytColumns[2]);
					if (!isEmpty(strHtmlListCellTpl) && !isEmpty(strHtmlListTpl)) {
						nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "Templates OK");	
						var strHtmlListCell = "", strHtmlListResult = "";					
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_gir_shr_email", null, "is", strCustomerEmail));
						arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_gir_sitenumber", "custrecord_gpr_aae_gir_shr_id", "equalto", strSiteNumber));
						arrColumns.push(new nlobjSearchColumn("internalid","custrecord_gpr_aae_gir_shr_id"));
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_gir_name","custrecord_gpr_aae_gir_shr_id"));
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_gir_cfname","custrecord_gpr_aae_gir_shr_id"));						
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_gir_clname","custrecord_gpr_aae_gir_shr_id"));
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_gir_ccname","custrecord_gpr_aae_gir_shr_id"));
						arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_gir_cemail","custrecord_gpr_aae_gir_shr_id"));
						var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_gir_shr", null, arrFilters, arrColumns);											
						if (!isEmptyArray(arrSearchResults)) {
							for (var i = 0; i < Math.min(500, arrSearchResults.length); i++) {
								strHtmlListCell = strHtmlListCellTpl;
								objSearchResult = arrSearchResults[i];
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMID>/g, objSearchResult.getValue(arrColumns[0]));
								strHtmlListCell = strHtmlListCell.replace(/<NLITEMNAME>/g, objSearchResult.getValue(arrColumns[1]));
								strHtmlListCell = strHtmlListCell.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
								strHtmlListCell = strHtmlListCell.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
								strHtmlListCell = strHtmlListCell.replace(/<NLCFNAME>/g, objSearchResult.getValue(arrColumns[2]));
								strHtmlListCell = strHtmlListCell.replace(/<NLCLNAME>/g, objSearchResult.getValue(arrColumns[3]));
								strHtmlListCell = strHtmlListCell.replace(/<NLCCNAME>/g, objSearchResult.getValue(arrColumns[4]));
								strHtmlListCell = strHtmlListCell.replace(/<NLCEMAIL>/g, objSearchResult.getValue(arrColumns[5]));
								strHtmlListResult += strHtmlListCell;
								intItemsCount++;
							}
							nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "Finish Loop Items");
						}
						var strHtmlList = strHtmlListTpl;
						strHtmlList = strHtmlList.replace(/<NLLISTTOTAL>/g, intItemsCount.toString());
						strHtmlList = strHtmlList.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
						strHtmlList = strHtmlList.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());						
						var strCommentsRegExp = "<!--([^<]*)";
						var regExpCooments = new RegExp(strCommentsRegExp, "g");
						strJSON = strCallback + "({Results:{html:'" + escape(strHtmlList.replace("<NLLISTRESULT>", strHtmlListResult).replace(regExpCooments, "")) + "'},Errors:[]});";						
					}else{
						nlapiLogExecution("ERROR", "Get Shared Gift Registries", "Templates not Found");
						strJSON = strCallback + "({Errors:[{code:'-1',details:'Templates not Found'}]});";						
					}
				}else{
					nlapiLogExecution("ERROR", "Get Shared Gift Registries", "Layout not Found");
					strJSON = strCallback + "({Errors:[{code:'-1',details:'Layout not Found'}]});";					
				}
			}else{
				nlapiLogExecution("ERROR", "Get Shared Gift Registries", "Invalid parameters");
				strJSON = strCallback + "({Errors:[{code:'-1',details:'Invalid parameters.'}]});";				
			}            
        }else {
           	nlapiLogExecution("ERROR", "Get Shared Gift Registries", "Invalid License");
			strJSON = strCallback + "({Errors:[{code:'-1',details:'The Gift Registry is Disabled for this Website.'}]});";			
        }
        response.write(strJSON);        
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
    nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "Usage: " + nlapiGetContext().getRemainingUsage());
    nlapiLogExecution("DEBUG", "Get Shared Gift Registries", "-----END-----");
}

/**
 * GIFT REGISTRY
 * Gets the Others Gift Registry Themes
 * Recives: the customerId, siteNumber, display amd the container for display the theme info
 * @param {Object} request
 * @param {Object} response
 * Returns: html code with response messages
 * @return {String} response
 */
function girGetOthersThemes(request, response){
    var strCustomerId = unescape(request.getParameter("customerid"));
    var strSiteNumber = request.getParameter("sitenumber");
    var strDisplay = request.getParameter("display");
    var strDisplayInfo = request.getParameter("displayinfo");
    
    var arrThemeShareFilters = new Array();
    var arrThemeShareColumns = new Array();
    var arrCustomerFilters = new Array();
    var arrCustomerColumns = new Array();
    var strHtml = "";
    
    var bolCheckLicense = checkLicense(strSiteNumber, 'gir');
    if (bolCheckLicense == true) {
        arrCustomerFilters[0] = new nlobjSearchFilter("entityid", null, "is", strCustomerId, null);
        arrCustomerColumns[0] = new nlobjSearchColumn("email");
        arrCustomerColumns[1] = new nlobjSearchColumn("firstname");
        arrCustomerColumns[2] = new nlobjSearchColumn("lastname");
        var arrSearchResultsCustomers = nlapiSearchRecord("customer", null, arrCustomerFilters, arrCustomerColumns);
        if (arrSearchResultsCustomers != null && arrSearchResultsCustomers.length != 0) {
            arrThemeShareFilters[0] = new nlobjSearchFilter("custrecord_gir_thm_shr_email", null, "is", arrSearchResultsCustomers[0].getValue(arrCustomerColumns[0]));
            arrThemeShareFilters[1] = new nlobjSearchFilter("custrecord_gir_thm_sitenumber", "custrecord_gir_thm_shr_themeid", "equalto", strSiteNumber);
            arrThemeShareColumns[0] = new nlobjSearchColumn("custrecord_gir_thm_name", "custrecord_gir_thm_shr_themeid");
            arrThemeShareColumns[1] = new nlobjSearchColumn("custrecord_gir_thm_customerid", "custrecord_gir_thm_shr_themeid");
            arrThemeShareColumns[2] = new nlobjSearchColumn("custrecord_gir_thm_shr_themeid");
            var arrSearchResultsThemesShare = nlapiSearchRecord("customrecord_gir_thm_shr", null, arrThemeShareFilters, arrThemeShareColumns);
            if (arrSearchResultsThemesShare != null && arrSearchResultsThemesShare.length != 0) {
                strHtml += '<ul class="gir_list">';
                for (var i = 0; i < arrSearchResultsThemesShare.length; i++) {
                    var objSearchResultsThemeShare = arrSearchResultsThemesShare[i];
                    var strThemeId = objSearchResultsThemeShare.getValue(arrThemeShareColumns[2]);
                    var strThemeName = objSearchResultsThemeShare.getValue(arrThemeShareColumns[0]);
                    var arrCustomerFields = ['lastname', 'firstname', 'email'];
                    var objCustomer = nlapiLookupField('customer', objSearchResultsThemeShare.getValue(arrThemeShareColumns[1]), arrCustomerFields);
                    if (objCustomer != null) {
                        strHtml += '<li class="gir_list_node1">';
                        strHtml += '<div class="gir_list_node1_name">' + objCustomer.lastname + ', ' + objCustomer.firstname + ' (' + objCustomer.email + ')</div>';
                        strHtml += '<li class="gir_list_node">';
                        strHtml += '<div id="name_otherstheme' + strThemeId + '" class="gir_list_node_name"><a href="javascript:girViewOthersThemeInfo(' + strThemeId + ',' + "'" + strDisplayInfo + "'" + ');">' + strThemeName + '</a></div>';
                        strHtml += '<br class="clear">';
                        strHtml += '</li>';
                        strHtml += '</li>';
                    }
                }
                strHtml += '</ul>';
            }
            else {
                strHtml += '<table>';
                strHtml += '<tr><td class="gir_text"><label>There are no Gift Registries Shared with you</label></td></tr>';
                strHtml += '<tr><td>&nbsp;</td></tr>';
                strHtml += '</table>';
            }
        }
    }
    else {
        strHtml += '<table>';
        strHtml += '<tr><td class="gir_text"><label>The Gift registry is Disabled</label></td></tr>';
        strHtml += '<tr><td>&nbsp;</td></tr>';
        strHtml += '</table>';
    }
    strHtml = strHtml.replace(/\n/g, ' ');
    strHtml = escape(strHtml);
    response.write("var strHtml = unescape('" + strHtml + "');document.getElementById('" + strDisplay + "').innerHTML=strHtml;");
}

/**
 * GIFT REGISTRY
 * Gets the Gift Registry Themes to display in a drill down
 * Recives: the customer internal id, the site number and the display for populate the list
 * @param {String} request, response
 * Returns: html code with response messages
 * @return {String} response
 */
function girGetThemesList(request, response){
    var strCustomerId = unescape(request.getParameter("customerid"));
    var strSiteNumber = request.getParameter("sitenumber");
    var display = request.getParameter("display");
    
    var themeFilters = new Array();
    var themeColumns = new Array();
    var arrCustomerFilters = new Array();
    var arrCustomerColumns = new Array();
    var strHtml = "";
    
    arrCustomerFilters[0] = new nlobjSearchFilter("entityid", null, "is", strCustomerId, null);
    var arrSearchResultsCustomers = nlapiSearchRecord("customer", null, arrCustomerFilters, arrCustomerColumns);
    if (arrSearchResultsCustomers != null && arrSearchResultsCustomers.length != 0) {
        themeFilters[0] = new nlobjSearchFilter("custrecord_gir_thm_customerid", null, "is", arrSearchResultsCustomers[0].id, null);
        themeFilters[1] = new nlobjSearchFilter("custrecord_gir_thm_sitenumber", null, "equalto", strSiteNumber, null);
        themeColumns[0] = new nlobjSearchColumn("custrecord_gir_thm_name");
        var searchResultsThemes = nlapiSearchRecord("customrecord_gir_thm", null, themeFilters, themeColumns);
        strHtml += '<select id="gir_themes_list"  name="gir_themes_list"><option selected value="-Select Theme-">-Select Theme-</option>';
        if (searchResultsThemes != null && searchResultsThemes.length != 0) {
            for (var i = 0; i < searchResultsThemes.length; i++) {
                var searchResultsTheme = searchResultsThemes[i];
                var themeId = searchResultsTheme.id;
                var name = searchResultsTheme.getValue("custrecord_gir_thm_name");
                strHtml += '<option value="' + themeId + '">' + name + '</option>';
            }
        }
        strHtml += '</select>';
    }
    strHtml = strHtml.replace(/\n/g, ' ');
    strHtml = escape(strHtml);
    response.write("var strHtml = unescape('" + strHtml + "');document.getElementById('" + display + "').innerHTML=strHtml;");
}

/**
 * GIFT REGISTRY
 * Adds an item to the Gift Registry Themes
 * Recives: the customer internal id, the site number, the themeid and the itemid
 * @param {String} request, response
 * Returns: html code with response messages
 * @return {String} response
 */
function girAddThemeItem(request, response){
    var strCustomerId = request.getParameter('customerid');
    var strSiteNumber = request.getParameter('sitenumber');
    var themeId = request.getParameter('themeid');
    var itemId = request.getParameter('itemid');
    var itemQty = request.getParameter('itemqty');
    
    var arrCustomerFilters = new Array();
    var arrCustomerColumns = new Array();
    var themeFilters = new Array();
    var themeColumns = new Array();
    var filters = new Array();
    var strHtml = '';
    
    var bolCheckLicense = checkLicense(strSiteNumber, 'gir');
    if (bolCheckLicense == true) {
        arrCustomerFilters[0] = new nlobjSearchFilter('entityid', null, 'is', strCustomerId, null);
        var arrSearchResultsCustomers = nlapiSearchRecord('customer', null, arrCustomerFilters, arrCustomerColumns);
        if (arrSearchResultsCustomers != null && arrSearchResultsCustomers.length != 0) {
            themeFilters[0] = new nlobjSearchFilter("custrecord_gir_thm_customerid", null, "is", arrSearchResultsCustomers[0].id, null);
            themeFilters[1] = new nlobjSearchFilter("custrecord_gir_thm_sitenumber", null, "equalto", strSiteNumber, null);
            themeFilters[2] = new nlobjSearchFilter("internalid", null, "is", themeId, null);
            var searchResultsThemes = nlapiSearchRecord("customrecord_gir_thm", null, themeFilters, themeColumns);
            if (searchResultsThemes != null && searchResultsThemes.length != 0) {
                filters[0] = new nlobjSearchFilter('custrecord_gir_thm_itm_themeid', null, 'is', themeId, null);
                filters[1] = new nlobjSearchFilter('custrecord_gir_thm_itm_itemid', null, 'is', itemId, null);
                var searchResults = nlapiSearchRecord('customrecord_gir_thm_itm', null, filters, null);
                if (searchResults == null || searchResults.length == 0) {
                    var themeItem = nlapiCreateRecord('customrecord_gir_thm_itm');
                    themeItem.setFieldValue('custrecord_gir_thm_itm_themeid', themeId);
                    themeItem.setFieldValue('custrecord_gir_thm_itm_itemid', itemId);
                    themeItem.setFieldValue('custrecord_gir_thm_itm_qty', itemQty);
                    nlapiSubmitRecord(themeItem, false, true);
                    strHtml += "alert('The item was added to your Gift Registry.');";
                }
                else {
                    strHtml += "alert('The item is already in your Gift Registry.');";
                }
            }
            else {
                strHtml += "alert('The Gift Registry was deleted, this page will be refreshed');window.location.reload();";
            }
        }
    }
    else {
        strHtml += "alert('The Gift Registry is Disabled.');";
    }
    response.write(strHtml);
}

function girViewThemeInfo(request, response){
    var context = nlapiGetContext();
    var bolMultiSite = nlapiGetContext().getFeature('MULTISITE');
    var strCompanyId = context.getCompany();
    var strThemeId = request.getParameter("themeid");
    var strDisplay = request.getParameter("display");
    var strGirUrl = unescape(request.getParameter("girurl"));
    
    var strHtml = "";
    var arrFilters = new Array();
    var arrColumns = new Array();
    
    var themeFields = ['custrecord_gir_thm_name', 'custrecord_gir_thm_duedate', 'custrecord_gir_thm_description', 'custrecord_gir_thm_public', 'custrecord_gir_thm_sitenumber'];
    var objTheme = nlapiLookupField('customrecord_gir_thm', strThemeId, themeFields);
    if (objTheme != null) {
        strHtml += '<div class="gri_theme_status_wrap">';
        strHtml += '<table class="gir_table_theme_info" border="0" cellpadding="0" cellspacing="0">';
        strHtml += '<tr>';
        strHtml += '<td class="gir_table_theme_info_label">Gift Registry:</td>';
        strHtml += '<td class="gir_table_theme_info_data">' + objTheme.custrecord_gir_thm_name + '</td>';
        strHtml += '</tr>';
        strHtml += '<tr>';
        strHtml += '<td class="gir_table_theme_info_label">Description:</td>';
        strHtml += '<td class="gir_table_theme_info_data">' + objTheme.custrecord_gir_thm_description + '</td>';
        strHtml += '</tr>';
        strHtml += '<tr>';
        strHtml += '<td class="gir_table_theme_info_label">Due Date:</td>';
        strHtml += '<td class="gir_table_theme_info_data">' + objTheme.custrecord_gir_thm_duedate + '</td>';
        strHtml += '</tr>';
        strHtml += '<tr>';
        strHtml += '<td class="gir_table_theme_info_label">Public:</td>';
        var strChecked = '';
        if (objTheme.custrecord_gir_thm_public == 'T') {
            strChecked = 'checked';
        }
        strHtml += '<td class="gir_table_theme_info_data"><input type="checkbox" ' + strChecked + ' name="gir_theme_status" id="gir_theme_status"/></td>';
        strHtml += '</tr>';
        strHtml += '</table>';
        strHtml += '<div class="gir_btn_update"><a href="javascript:girUpdateThemeStatus(' + strThemeId + ",'gir_theme_status'" + ');"><span>Update Status</span></a></div>';
        strHtml += '</div>';
        strHtml += '<div class="gri_theme_items_wrap">';
        arrFilters[0] = new nlobjSearchFilter('custrecord_gir_thm_itm_themeid', null, 'is', strThemeId);
        arrFilters[1] = new nlobjSearchFilter("isinactive", "custrecord_gir_thm_itm_itemid", "is", 'F');
        arrFilters[2] = new nlobjSearchFilter("isonline", "custrecord_gir_thm_itm_itemid", "is", 'T');
        if (bolMultiSite == true) {
            arrFilters[3] = new nlobjSearchFilter("website", "custrecord_gir_thm_itm_itemid", "is", objTheme.custrecord_gir_thm_sitenumber);
        }
        arrColumns[0] = new nlobjSearchColumn("storedisplayname", "custrecord_gir_thm_itm_itemid");
        arrColumns[1] = new nlobjSearchColumn("salesdescription", "custrecord_gir_thm_itm_itemid");
        arrColumns[2] = new nlobjSearchColumn("thumbnailurl", "custrecord_gir_thm_itm_itemid");
        arrColumns[3] = new nlobjSearchColumn("itemurl", "custrecord_gir_thm_itm_itemid");
        arrColumns[4] = new nlobjSearchColumn("custrecord_gir_thm_customerid", "custrecord_gir_thm_itm_themeid");
        arrColumns[5] = new nlobjSearchColumn("custrecord_gir_thm_itm_itemid");
        arrColumns[6] = new nlobjSearchColumn("custrecord_gir_thm_itm_qty");
        var arrSearchResults = nlapiSearchRecord("customrecord_gir_thm_itm", null, arrFilters, arrColumns);
        if (arrSearchResults == null || arrSearchResults.length == 0) {
            strHtml += '<table>';
            strHtml += '<tr><td class="gir_text"><label>There are no Items in the Gift Registry</label></td></tr>';
            strHtml += '<tr><td>&nbsp;</td></tr>';
            strHtml += '</table>';
        }
        else {
            strHtml += '<table class="gir_table_theme" border="0" cellpadding="0" cellspacing="0" width="100%">';
            strHtml += '<thead><tr>';
            strHtml += '<th scope="col" class="gir_image"><span>Image</span></th>';
            strHtml += '<th scope="col" class="gir_name"><span>Name</span></th>';
            strHtml += '<th scope="col" class="gir_description"><span>Description</span></th>';
            strHtml += '<th scope="col" class="gir_price"><span>Price</span></th>';
            strHtml += '<th scope="col" class="gir_qty"><span>Qty</span></th>';
            strHtml += '<th scope="col" class="gir_remove"><span>Remove</span></th>';
            strHtml += '</tr></thead><tbody>';
            var objCurrency = getBaseCurrency();
            for (var i = 0; i < Math.min(500, arrSearchResults.length); i++) {
                var objSearchResult = arrSearchResults[i];
                var strItemId = arrSearchResults[i].getValue(arrColumns[5]);
                var arrFiltersItem = new Array();
                var arrColumnsItem = new Array();
                arrFiltersItem[0] = new nlobjSearchFilter('internalid', null, 'is', strItemId);
                arrFiltersItem[1] = new nlobjSearchFilter('customer', 'pricing', 'is', objSearchResult.getValue(arrColumns[4]));
                if (bolMultiSite == true) {
                    arrFiltersItem[2] = new nlobjSearchFilter("website", null, "is", objTheme.custrecord_gir_thm_sitenumber, null);
                    if (objCurrency.getId() != null) {
                        arrFiltersItem[3] = new nlobjSearchFilter('currency', 'pricing', 'is', objCurrency.getId());
                    }
                }
                else {
                    if (objCurrency.getId() != null) {
                        arrFiltersItem[2] = new nlobjSearchFilter('currency', 'pricing', 'is', objCurrency.getId());
                    }
                }
                arrColumnsItem[0] = new nlobjSearchColumn('unitprice', 'pricing');
                var arrSearchResultsItems = nlapiSearchRecord('item', null, arrFiltersItem, arrColumnsItem);
                var classTr = "";
                if (i % 2 != 0) {
                    classTr = 'class="gir_odd_cell"';
                }
                else {
                    classTr = "";
                }
                var strItemName = objSearchResult.getValue(arrColumns[0]);
                var strImgUrl = objSearchResult.getValue(arrColumns[2]);
                var strDescription = objSearchResult.getValue(arrColumns[1]);
                var strItemUrl = objSearchResult.getValue(arrColumns[3]);
                var strItemQty = objSearchResult.getValue(arrColumns[6]);
                var strPrice = arrSearchResultsItems[0].getValue(arrColumnsItem[0]);
                if (strItemName == null || strItemName == '') {
                    strItemName = "&nbsp;";
                }
                if (strDescription == null || strDescription == '') {
                    strDescription = "&nbsp;";
                }
                if (strPrice == null || strPrice == '') {
                    strPrice = "&nbsp;";
                }
                else {
                    strPrice = objCurrency.getSymbol() + strPrice;
                }
                strHtml += '<tr' + classTr + '>';
                strHtml += '<td class="gir_col_1"><a href="' + strItemUrl + '"><img src="' + strImgUrl + '" border="0"/></a></td>';
                strHtml += '<td class="gir_col_2"><a href="' + strItemUrl + '">' + strItemName + '</a></td>';
                strHtml += '<td class="gir_col_3">' + strDescription + '</td>';
                strHtml += '<td class="gir_col_4"><span>' + strPrice + '</span></td>';
                strHtml += '<td class="gir_col_5"><input class="input" value="' + strItemQty + '" maxlength="6" size="6" id="qty" onchange="javascript:girUpdateThemeItemQty(' + objSearchResult.id + ',this);" name="qty"/></td>';
                strHtml += '<td class="gir_col_6"><a href="javascript:girRemoveThemeItem(' + strThemeId + ',' + objSearchResult.id + ",'" + strDisplay + "','" + strGirUrl + "'" + ');"><span>Remove</span></a></td>';
                strHtml += '</tr>';
            }
            strHtml += '</tbody>';
            strHtml += '<tfoot>';
            strHtml += '<tr>';
            strHtml += '<td colspan="5" class="gir_updqty"><a href="javascript:girUpdateQty();"><span>Update Theme Items Quantity</span></a></td>';
            strHtml += '<td colspan="6" class="gir_clear"><a href="javascript:girClearThemeItems(' + strThemeId + ",'" + strDisplay + "','" + strGirUrl + "'" + ');"><span>Clear Theme Items</span></a></td>';
            strHtml += '</tr>'
            strHtml += '</tfoot>';
            strHtml += '</table>';
        }
        strHtml += '</div>';
        strHtml += '<div class="gri_theme_shares_wrap">';
        strHtml += '<p class="gir_warp_title">Share Theme</p>';
        strHtml += '<div class="gir_wrap_box">';
        strHtml += '<label class="gir_label">Email:</label>';
        strHtml += '<input type="text" name="gir_share_email" id="gir_share_email" class="gir_input"/>';
        strHtml += '</div>';
        strHtml += '<div class="gir_btn_share"><a href="javascript:girShareTheme(' + strThemeId + ',' + "'gir_share_email','" + strDisplay + "', '" + strGirUrl + "'" + ');"><span>Share Theme</span></a></div>';
        
        var arrShareFilters = new Array();
        var arrShareColumns = new Array();
        strHtml += '<p class="gir_warp_title">This Gift Registry is Shared With:</p>';
        arrShareFilters[0] = new nlobjSearchFilter("custrecord_gir_thm_shr_themeid", null, "is", strThemeId, null);
        arrShareColumns[0] = new nlobjSearchColumn("custrecord_gir_thm_shr_email");
        var arrSearchResultsShares = nlapiSearchRecord("customrecord_gir_thm_shr", null, arrShareFilters, arrShareColumns);
        if (arrSearchResultsShares != null && arrSearchResultsShares.length != 0) {
            strHtml += '<ul class="gir_list">';
            for (var i = 0; i < arrSearchResultsShares.length; i++) {
                var objSearchResultsShare = arrSearchResultsShares[i];
                var strShareId = objSearchResultsShare.id;
                var strShareEmail = objSearchResultsShare.getValue("custrecord_gir_thm_shr_email");
                strHtml += '<li class="gir_list_node">';
                strHtml += '<div id="email_theme_share' + strShareId + '" class="gir_list_node_name"><a href="javascript:girShareInfo(' + strShareId + ');">' + strShareEmail + '</a></div>';
                strHtml += '<div id="remove_theme_share' + strShareId + '" class="gir_list_node_link"><a href="javascript:girRemoveThemeShare(' + strThemeId + ',' + strShareId + ",'" + strDisplay + "','" + strGirUrl + "'" + ');"><span>Remove</span></a></div>';
                strHtml += '<br class="clear">';
                strHtml += '</li>';
            }
            strHtml += '</ul>';
        }
        else {
            strHtml += '<table>';
            strHtml += '<tr><td class="gir_text"><label>There are no Shares for this Gift Registry</label></td></tr>';
            strHtml += '<tr><td>&nbsp;</td></tr>';
            strHtml += '</table>';
        }
        strHtml += '</div>';
        
        strHtml = strHtml.replace(/\n/g, ' ');
        strHtml = escape(strHtml);
        response.write("var strHtml = unescape('" + strHtml + "');document.getElementById('" + strDisplay + "').innerHTML=strHtml;");
    }
    else {
        response.write("alert('The Gift Registry not exist or was deleted');window.location.reload();");
    }
}

/**
 * GIFT REGISTRY
 * GIFT REGISTRY
 * Gets the Others Gift Registry Themes
 * Recives: the themeid, display container to display the theme info
 * @param {Object} request
 * @param {Object} response
 * @return {String} response
 */
function girViewOthersThemeInfo(request, response){
    var objContext = nlapiGetContext();
    var strCompanyId = objContext.getCompany();
    var bolMultiSite = nlapiGetContext().getFeature('MULTISITE');
    var strThemeId = request.getParameter("themeid");
    var strDisplay = request.getParameter("display");
    
    var strHtml = "";
    var arrFilters = new Array();
    var arrColumns = new Array();
    
    var themeFields = ['custrecord_gir_thm_name', 'custrecord_gir_thm_duedate', 'custrecord_gir_thm_description', 'custrecord_gir_thm_sitenumber', 'custrecord_gir_thm_sitenumber'];
    var objTheme = nlapiLookupField('customrecord_gir_thm', strThemeId, themeFields);
    if (objTheme != null) {
        strHtml += '<div class="gri_theme_status_wrap">';
        strHtml += '<table class="gir_table_theme_info" border="0" cellpadding="0" cellspacing="0">';
        strHtml += '<tr>';
        strHtml += '<td class="gir_table_theme_info_label">Gift Registry:</td>';
        strHtml += '<td class="gir_table_theme_info_data">' + objTheme.custrecord_gir_thm_name + '</td>';
        strHtml += '</tr>';
        strHtml += '<tr>';
        strHtml += '<td class="gir_table_theme_info_label">Description:</td>';
        strHtml += '<td class="gir_table_theme_info_data">' + objTheme.custrecord_gir_thm_description + '</td>';
        strHtml += '</tr>';
        strHtml += '<tr>';
        strHtml += '<td class="gir_table_theme_info_label">Due Date:</td>';
        strHtml += '<td class="gir_table_theme_info_data">' + objTheme.custrecord_gir_thm_duedate + '</td>';
        strHtml += '</tr>';
        strHtml += '<tr>';
        strHtml += '</table>';
        strHtml += '</div>';
        strHtml += '<div class="gri_theme_items_wrap">';
        arrFilters[0] = new nlobjSearchFilter('custrecord_gir_thm_itm_themeid', null, 'is', strThemeId);
        arrFilters[1] = new nlobjSearchFilter("isinactive", "custrecord_gir_thm_itm_itemid", "is", 'F');
        arrFilters[2] = new nlobjSearchFilter("isonline", "custrecord_gir_thm_itm_itemid", "is", 'T');
        if (bolMultiSite == true) {
            arrFilters[3] = new nlobjSearchFilter("website", "custrecord_gir_thm_itm_itemid", "is", objTheme.custrecord_gir_thm_sitenumber);
        }
        arrColumns[0] = new nlobjSearchColumn("storedisplayname", "custrecord_gir_thm_itm_itemid");
        arrColumns[1] = new nlobjSearchColumn("salesdescription", "custrecord_gir_thm_itm_itemid");
        arrColumns[2] = new nlobjSearchColumn("onlinecustomerprice", "custrecord_gir_thm_itm_itemid");
        arrColumns[3] = new nlobjSearchColumn("thumbnailurl", "custrecord_gir_thm_itm_itemid");
        arrColumns[4] = new nlobjSearchColumn("itemurl", "custrecord_gir_thm_itm_itemid");
        arrColumns[5] = new nlobjSearchColumn("custrecord_gir_thm_customerid", "custrecord_gir_thm_itm_themeid");
        arrColumns[6] = new nlobjSearchColumn("custrecord_gir_thm_itm_itemid");
        arrColumns[7] = new nlobjSearchColumn("custrecord_gir_thm_itm_qty");
        var arrSearchResults = nlapiSearchRecord("customrecord_gir_thm_itm", null, arrFilters, arrColumns);
        if (arrSearchResults == null || arrSearchResults.length == 0) {
            strHtml += '<table>';
            strHtml += '<tr><td class="gir_text"><label>There are no Items in the Gift Registry</label></td></tr>';
            strHtml += '<tr><td>&nbsp;</td></tr>';
            strHtml += '</table>';
        }
        else {
            strHtml += '<table class="gir_table_others_theme" border="0" cellpadding="0" cellspacing="0" width="100%">';
            strHtml += '<thead><tr>';
            strHtml += '<th scope="col" class="gir_image"><span>Image</span></th>';
            strHtml += '<th scope="col" class="gir_name"><span>Name</span></th>';
            strHtml += '<th scope="col" class="gir_description"><span>Description</span></th>';
            strHtml += '<th scope="col" class="gir_price"><span>Price</span></th>';
            strHtml += '<th scope="col" class="gir_qty_needed"><span>Qty Needed</span></th>';
            strHtml += '<th scope="col" class="gir_qty"><span>Qty</span></th>';
            strHtml += '<th scope="col" class="gir_check"><span>Check</span></th>';
            strHtml += '</tr></thead><tbody>';
            var strItemsGir = '';
            var objCurrency = getBaseCurrency();
            for (var i = 0; i < Math.min(500, arrSearchResults.length); i++) {
                var objSearchResult = arrSearchResults[i];
                var strItemId = arrSearchResults[i].getValue(arrColumns[6]);
                strItemsGir += strItemId + ';';
                
                var arrFiltersItem = new Array();
                var arrColumnsItem = new Array();
                arrFiltersItem[0] = new nlobjSearchFilter('internalid', null, 'is', strItemId);
                arrFiltersItem[1] = new nlobjSearchFilter('customer', 'pricing', 'is', objSearchResult.getValue(arrColumns[5]));
                if (bolMultiSite == true) {
                    arrFiltersItem[2] = new nlobjSearchFilter("website", null, "is", objTheme.custrecord_gir_thm_sitenumber, null);
                    if (objCurrency.getId() != null) {
                        arrFiltersItem[3] = new nlobjSearchFilter('currency', 'pricing', 'is', objCurrency.getId());
                    }
                }
                else {
                    if (objCurrency.getId() != null) {
                        arrFiltersItem[2] = new nlobjSearchFilter('currency', 'pricing', 'is', objCurrency.getId());
                    }
                }
                arrColumnsItem[0] = new nlobjSearchColumn('unitprice', 'pricing');
                var arrSearchResultsItems = nlapiSearchRecord('item', null, arrFiltersItem, arrColumnsItem);
                var objItemRecord = nlapiLoadRecord(arrSearchResultsItems[0].recordType, arrSearchResultsItems[0].id);
                var strOptions = objItemRecord.getFieldValues('itemoptions');
                var strChkDisable = '';
                if (strOptions != null && strOptions.length > 0) {
                    strChkDisable = 'disabled';
                }
                var strClassTr = "";
                if (i % 2 != 0) {
                    strClassTr = 'class="gir_odd_cell"';
                }
                else {
                    strClassTr = "";
                }
                var strItemName = objSearchResult.getValue(arrColumns[0]);
                var strImgUrl = objSearchResult.getValue(arrColumns[3]);
                var strDescription = objSearchResult.getValue(arrColumns[1]);
                var strItemUrl = objSearchResult.getValue(arrColumns[4]);
                var strItemQty = objSearchResult.getValue(arrColumns[7]);
                var strPrice = arrSearchResultsItems[0].getValue(arrColumnsItem[0]);
                if (strItemName == null || strItemName == '') {
                    strItemName = "&nbsp;";
                }
                if (strDescription == null || strDescription == '') {
                    strDescription = "&nbsp;";
                }
                if (strPrice == null || strPrice == '') {
                    strPrice = "&nbsp;";
                }
                else {
                    strPrice = objCurrency.getSymbol() + strPrice;
                }
                strHtml += '<tr' + strClassTr + '>';
                strHtml += '<td class="gir_col_1"><a href="' + strItemUrl + '"><img src="' + strImgUrl + '" border="0"/></a></td>';
                strHtml += '<td class="gir_col_2"><a href="' + strItemUrl + '">' + strItemName + '</a></td>';
                strHtml += '<td class="gir_col_3">' + strDescription + '</td>';
                strHtml += '<td class="gir_col_4"><span>' + strPrice + '</span></td>';
                strHtml += '<td class="gir_col_5"><span>' + strItemQty + '</span></td>';
                strHtml += '<td class="gir_col_6"><input class="input" value="1" maxlength="6" size="6" id="qty_' + strItemId + '" name="qty_' + strItemId + '"/></td>';
                strHtml += '<td class="gir_col_7"><input name="chk_' + strItemId + '" type="checkbox" id="chk_' + strItemId + '" ' + strChkDisable + ' value="0"></td>';
                strHtml += '</tr>';
            }
            strHtml += '</tbody>';
            strHtml += '<tfoot>';
            strHtml += '<tr>';
            strHtml += '<td colspan="7" class="gir_addtocart"><a href="javascript:girAddToCart(' + "'" + strCompanyId + "','" + objTheme.custrecord_gir_thm_sitenumber + "'," + strThemeId + ');"><span>Add To Cart</span></a></td>';
            strHtml += '</tr>'
            strHtml += '</tfoot>';
            strHtml += '</table>';
            strHtml += '<table>';
            strHtml += '<tr><td>&nbsp;</td></tr>';
            strHtml += '<tr><td class="gir_text"><label>* If checkbox is disabled, please go to the item and select the correct options before adding to cart.</label></td></tr>';
            strHtml += '</table>'
        }
        strHtml += '</div>';
        
        strHtml = strHtml.replace(/\n/g, ' ');
        strHtml = escape(strHtml);
        response.write("var strItemsGir = '';var strHtml = unescape('" + strHtml + "');document.getElementById('" + strDisplay + "').innerHTML=strHtml;strItemsGir='" + strItemsGir + "';");
    }
    else {
        response.write("alert('The Gift Registry not exist or was deleted');window.location.reload();");
    }
}

/**
 * GIFT REGISTRY
 * Update the item quantity in a theme
 * Recives: the item record internal id.
 * @param {Object} request
 * @param {Object} response
 * Returns: html code with response messages
 * @return {String} response
 */
function girUpdateThemeItemQty(request, response){
    var strItemRecordId = request.getParameter("itemrecordid");
    var intItemQty = parseInt(request.getParameter("itemqty"));
    var strHtml = "";
    nlapiSubmitField('customrecord_gir_thm_itm', strItemRecordId, 'custrecord_gir_thm_itm_qty', intItemQty)
    
}

/**
 * GIFT REGISTRY
 * Create a new share email for the them
 * Recives the themeid and the email
 * @param {Object} request
 * @param {Object} response
 */
function girShareTheme(request, response){
    var objContext = nlapiGetContext();
    var strThemeId = request.getParameter("themeid");
    var strEmailShare = unescape(request.getParameter("emailshare"));
    var srtWebSiteUrl = unescape(request.getParameter("girurl"));
    var strHtml = '';
    
		
    var strEmailSubject = objContext.getSetting('SCRIPT', 'custscript_gir_emailsubject');
    var strEmailBody = objContext.getSetting('SCRIPT', 'custscript_gir_emailbody');
    var intEmployeeFrom = objContext.getSetting('SCRIPT', 'custscript_gir_emp_emailfrom');
    
    var arrThemeFields = ['custrecord_gir_thm_name', 'custrecord_gir_thm_duedate', 'custrecord_gir_thm_description', 'custrecord_gir_thm_customerid.firstname', 'custrecord_gir_thm_customerid.lastname', 'custrecord_gir_thm_customerid.email'];
    var objTheme = nlapiLookupField('customrecord_gir_thm', strThemeId, arrThemeFields);
    if (objTheme != null) {
        var arrShareFilters = new Array();
        arrShareFilters[0] = new nlobjSearchFilter("custrecord_gir_thm_shr_themeid", null, "is", strThemeId, null);
        arrShareFilters[1] = new nlobjSearchFilter("custrecord_gir_thm_shr_email", null, "is", strEmailShare, null);
        var arrSearchResultsShares = nlapiSearchRecord("customrecord_gir_thm_shr", null, arrShareFilters, null);
        if (arrSearchResultsShares == null || arrSearchResultsShares.length == 0) {
            var girThemeShare = nlapiCreateRecord("customrecord_gir_thm_shr");
            girThemeShare.setFieldValue("custrecord_gir_thm_shr_themeid", strThemeId);
            girThemeShare.setFieldValue("custrecord_gir_thm_shr_email", strEmailShare);
            nlapiSubmitRecord(girThemeShare, false, true);
            strHtml += '<html>';
            strHtml += '<style>';
            strHtml += '.gir_share_info { width: 500px;	border-spacing: 0; border: 4px solid #F4F4F4; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; }';
            strHtml += '.gir_share_info td { vertical-align: top; text-align: left; }';
            strHtml += '.gir_share_info th { background-color: #0076A3;	color: #FFFFFF;	font-weight: normal; text-align: left; text-transform: capitalize; padding: 2px; }';
            strHtml += '.gir_share_info_text { font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: bold; }';
            strHtml += '.gir_share_info_text a { color: #006699; text-decoration: none; }';
            strHtml += '.gir_share_info_text a:hover { color:#009193; text-decoration:none; }';
            strHtml += '</style>';
            strHtml += '<body>';
            strHtml += '<p class="gir_share_info_text">Email: ' + objTheme['custrecord_gir_thm_customerid.email'] + ', ' + objTheme['custrecord_gir_thm_customerid.lastname'] + ', ' + objTheme['custrecord_gir_thm_customerid.firstname'] + ' shared this Gift Registry with you</p>';
            strHtml += '<table class="gir_share_info">';
            strHtml += '<tr>';
            strHtml += '<th scope="row">Gift Registry:</th>';
            strHtml += '<td>' + objTheme.custrecord_gir_thm_name + '</td>'
            strHtml += '</tr>';
            strHtml += '<tr>';
            strHtml += '<th scope="row">Description:</th>'
            strHtml += '<td>' + objTheme.custrecord_gir_thm_description + '</td>';
            strHtml += '</tr>';
            strHtml += '<tr>';
            strHtml += '<th scope="row">Due Date:</th>';
            strHtml += '<td>' + objTheme.custrecord_gir_thm_duedate + '</td>';
            strHtml += '</tr>';
            strHtml += '</table>';
            strHtml += '<p class="gir_share_info_text"></p>';
            strHtml += '<p class="gir_share_info_text">' + strEmailBody + ' <a href="' + srtWebSiteUrl + '">' + srtWebSiteUrl + '</a><span>, with ' + strEmailShare + '</span></p>';
            strHtml += '</body>';
            strHtml += '</html>';
            nlapiSendEmail(parseInt(intEmployeeFrom), strEmailShare, strEmailSubject, strHtml, null, null, null);
        }
        else {
            response.write("alert('The Gift Registry is already shared with that email')");
        }
    }
    else {
        response.write("alert('The Theme not exist or was deleted')");
    }
}

/**
 * GIFT REGISTRY
 * Deletes a Gift Registry Theme Share
 * Recives: the theme item internal id.
 * @param {String} request, response
 * Returns: html code with response messages
 * @return {String} response
 */
function girRemoveThemeItem(request, response){
    var strThemeItemId = request.getParameter("themeitemid");
    var strHtml = "";
    
    try {
        nlapiDeleteRecord("customrecord_gir_thm_itm", strThemeItemId);
    } 
    catch (ex) {
        if (ex.getCode != null) // instanceof does not work on the server
        {
            strHtml = 'alert("NetSuite Error details ' + ex.getCode() + ': ' + ex.getDetails() + '");';
        }
        else {
            strHtml = 'alert("JavaScript Error details ' + ex.message + '");';
        }
        
        
        /*
         throw nlapiCreateError('ABC123', 'The customer record was ' +
         'saved. However, there was a system ' +
         'error when trying to generate a ' +
         'follow-up task for the sales rep.', true); // true supresses email
         */
    }
    response.write(strHtml);
    
}

/**
 * GIFT REGISTRY
 * Deletes all Gift Registry Theme Items
 * Recives: the theme internal id.
 * @param {String} request, response
 * Returns: html code with response messages
 * @return {String} response
 */
function girClearThemeItems(request, response){
    var strThemeId = request.getParameter("themeid");
    var strHtml = "";
    
    try {
        var arrThemeItemsFilters = new Array();
        arrThemeItemsFilters[0] = new nlobjSearchFilter("custrecord_gir_thm_itm_themeid", null, "is", strThemeId, null);
        var arrSearchResultsThemesItems = nlapiSearchRecord("customrecord_gir_thm_itm", null, arrThemeItemsFilters, null);
        if (arrSearchResultsThemesItems != null && arrSearchResultsThemesItems.length > 0) {
            for (var intI = 0; intI < arrSearchResultsThemesItems.length; intI++) {
                nlapiDeleteRecord("customrecord_gir_thm_itm", arrSearchResultsThemesItems[intI].id);
            }
        }
        else {
            strHtml += "The are no items in the Gift Registry";
        }
    } 
    catch (ex) {
        if (ex.getCode != null) // instanceof does not work on the server
        {
            strHtml = 'alert("NetSuite Error details ' + ex.getCode() + ': ' + ex.getDetails() + '");';
        }
        else {
            strHtml = 'alert("JavaScript Error details ' + ex.message + '");';
        }
    }
    response.write(strHtml);
    
}

/**
 * GIFT REGISTRY
 * Deletes a Gift Registry Theme Share
 * Recives: the theme share internal id.
 * @param {String} request, response
 * Returns: html code with response messages
 * @return {String} response
 */
function girRemoveThemeShare(request, response){
    var strThemeShareId = request.getParameter("themeshareid");
    var strHtml = "";
    
    try {
        nlapiDeleteRecord("customrecord_gir_thm_shr", strThemeShareId);
    } 
    catch (ex) {
        if (ex.getCode != null) // instanceof does not work on the server
        {
            strHtml = 'alert("NetSuite Error details ' + ex.getCode() + ': ' + ex.getDetails() + '");';
        }
        else {
            strHtml = 'alert("JavaScript Error details ' + ex.message + '");';
        }
        /*
         throw nlapiCreateError('ABC123', 'The customer record was ' +
         'saved. However, there was a system ' +
         'error when trying to generate a ' +
         'follow-up task for the sales rep.', true); // true supresses email
         */
    }
    response.write(strHtml);
    
}


/**
 * GIFT REGISTRY
 * Add Bougth Items
 * Recives: the customer ID, the site number, the theme name, the theme description and the due date for that theme.
 * @param {String} request, response
 * Returns: html code with response messages
 * @return {String} response
 */
function girAddBougthItems(request, response){
    var strCustomerId = unescape(request.getParameter("customerid"));
    var strItemsMulti = request.getParameter("itemsmulti");
    var strThemeId = request.getParameter("themeid");
    
    var arrCustomerFilters = new Array();
    var arrBoughtItemsFilters = new Array();
    var strHtml = '';
    var arrMulti = strItemsMulti.split(';');
    
    arrCustomerFilters[0] = new nlobjSearchFilter("entityid", null, "is", strCustomerId, null);
    var arrSearchResultsCustomers = nlapiSearchRecord("customer", null, arrCustomerFilters, null);
    if (arrSearchResultsCustomers != null && arrSearchResultsCustomers.length != 0) {
        for (var intI = 0; intI < arrMulti.length; intI++) {
            var arrItem = arrMulti[intI].split(',');
            var girBoughtItem = nlapiCreateRecord("customrecord_gir_bgt_itm");
            girBoughtItem.setFieldValue("custrecord_gir_bgt_customerid", arrSearchResultsCustomers[0].id);
            girBoughtItem.setFieldValue("custrecord_gir_bgt_themeid", strThemeId);
            girBoughtItem.setFieldValue("custrecord_gir_bgt_itemid", arrItem[0]);
            girBoughtItem.setFieldValue("custrecord_gir_bgt_qty", parseInt(arrItem[1]));
            girBoughtItem.setFieldValue("custrecord_gir_bgt_conf_qty", parseInt(arrItem[1]));
            girBoughtItem.setFieldValue("custrecord_gir_bgt_bgt", 'F');
            nlapiSubmitRecord(girBoughtItem, false, true);
        }
    }
    response.write(strHtml);
}

function girConfirmBougthItems(){

    try {
        strSalesOrderId = nlapiGetRecordId();
        var objSalesOrder = nlapiLoadRecord('salesorder', strSalesOrderId);
        var bolWebstore = objSalesOrder.getFieldValue('webstore');
        
        if (bolWebstore) {
            strCustomerId = objSalesOrder.getFieldValue('entity');
            var intLineCount = objSalesOrder.getLineItemCount('item');
            for (var intI = 1; intI <= intLineCount; intI++) {
                var strItemId = objSalesOrder.getLineItemValue('item', 'item', intI);
                var intQty = forceParseInt(objSalesOrder.getLineItemValue('item', 'quantity', intI));
                
                var arrBoughtItemsFilters = new Array();
                var arrBoughtItemsColumns = new Array();
                arrBoughtItemsFilters[0] = new nlobjSearchFilter("custrecord_gir_bgt_customerid", null, "is", strCustomerId.toString(), null);
                arrBoughtItemsFilters[1] = new nlobjSearchFilter("custrecord_gir_bgt_itemid", null, "is", strItemId.toString(), null);
                arrBoughtItemsFilters[2] = new nlobjSearchFilter("custrecord_gir_bgt_bgt", null, "is", 'F', null);
                arrBoughtItemsColumns[0] = new nlobjSearchColumn("custrecord_gir_bgt_themeid");
                arrBoughtItemsColumns[1] = new nlobjSearchColumn("custrecord_gir_bgt_qty");
                arrBoughtItemsColumns[2] = new nlobjSearchColumn("custrecord_gir_bgt_conf_qty");
                var arrSearchResultsBoughtItems = nlapiSearchRecord("customrecord_gir_bgt_itm", null, arrBoughtItemsFilters, arrBoughtItemsColumns);
                if (arrSearchResultsBoughtItems != null && arrSearchResultsBoughtItems.length > 0) {
                    for (var intJ = 0; intJ < arrSearchResultsBoughtItems.length; intJ++) {
                        var arrSearchResultBoughtItem = arrSearchResultsBoughtItems[intJ];
                        var strThemeId = arrSearchResultBoughtItem.getValue(arrBoughtItemsColumns[0]);
                        var intQtyBougth = forceParseInt(arrSearchResultBoughtItem.getValue(arrBoughtItemsColumns[1]));
                        var intUnconfQtyBougth = forceParseInt(arrSearchResultBoughtItem.getValue(arrBoughtItemsColumns[2]));
                        // 5 - 2 =  3
                        // 2 - 5 = -3
                        // 2 - 2 =  0
                        var intQtyUpdUnconf = intUnconfQtyBougth - intQty;
                        if (intQtyUpdUnconf <= 0) {
                            intQtyUpdUnconf = 0;
                            intQtyUpd = intQtyBougth;
                            intQty = intQty - intQtyBougth
                        }
                        else {
                            intQtyUpd = intQty;
                        }
                        
                        var arrThemeItemFilters = new Array();
                        var arrThemeItemColumns = new Array();
                        
                        arrThemeItemFilters[0] = new nlobjSearchFilter('custrecord_gir_thm_itm_themeid', null, 'is', strThemeId, null);
                        arrThemeItemFilters[1] = new nlobjSearchFilter('custrecord_gir_thm_itm_itemid', null, 'is', strItemId.toString(), null);
                        arrThemeItemColumns[0] = new nlobjSearchColumn("custrecord_gir_thm_itm_qty");
                        var arrSearchResultsThemeItems = nlapiSearchRecord('customrecord_gir_thm_itm', null, arrThemeItemFilters, arrThemeItemColumns);
                        if (arrSearchResultsThemeItems != null && arrSearchResultsThemeItems.length > 0) {
                            var arrSearchResultThemeItem = arrSearchResultsThemeItems[0];
                            var intQtyThemeItem = forceParseInt(arrSearchResultThemeItem.getValue(arrThemeItemColumns[0]));
                            var intQtyUpdThemeItem = intQtyThemeItem - intQtyUpd;
                            if (intQtyUpdThemeItem < 0) {
                                intQtyUpdThemeItem = 0;
                            }
                            nlapiSubmitField('customrecord_gir_thm_itm', arrSearchResultThemeItem.getId(), 'custrecord_gir_thm_itm_qty', intQtyUpdThemeItem);
                        }
                        var arrBoughtFields = ['custrecord_gir_bgt_conf_qty', 'custrecord_gir_bgt_bgt']
                        var arrBoughtValues = new Array();
                        arrBoughtValues[0] = intQtyUpdUnconf.toString();
                        if (intQtyUpdUnconf == 0) {
                            arrBoughtValues[1] = 'T';
                        }
                        else {
                            arrBoughtValues[1] = 'F';
                        }
                        nlapiSubmitField('customrecord_gir_bgt_itm', arrSearchResultBoughtItem.getId(), arrBoughtFields, arrBoughtValues);
                        if (intQtyUpdUnconf > 0) {
                            break;
                        }
                    }
                }
            }
        }
    } 
    catch (ex) {
        if (ex.getCode != null) // instanceof does not work on the server
        {
            nlapiLogExecution('ERROR', 'NetSuite Error details ' + ex.getCode() + ': ' + ex.getDetails());
        }
        else {
            nlapiLogExecution('ERROR', 'JavaScript Error details ' + ex.message);
        }
        /*
         throw nlapiCreateError('ABC123', 'The customer record was ' +
         'saved. However, there was a system ' +
         'error when trying to generate a ' +
         'follow-up task for the sales rep.', true); // true supresses email
         */
    }
}


/**
 * GIFT REGISTRY
 * Search for public gift registries
 * @param {Object} request
 * @param {Object} response
 */
function girGetPublicThemes(request, response){

    function SearchResult(strThemeId, strThemeName, strLastName, strFirsName){
        this.themeid = strThemeId;
        this.themename = strThemeName;
        this.lastname = strLastName;
        this.firstname = strFirsName;
        this.getThemeId = function(){
            return this.themeid;
        }
        this.getThemeName = function(){
            return this.themename;
        }
        this.getLastName = function(){
            return this.lastname;
        }
        this.getFirstName = function(){
            return this.firstname;
        }
    }
    
    var objContext = nlapiGetContext();
    var strGirSearch = unescape(request.getParameter("girsearch"));
    var strResultVar = request.getParameter("resultvar");
    var strItemCountVar = request.getParameter("itemscountvar");
    var strSiteNumber = request.getParameter("sitenumber");
    
    var arrThemeFilters = new Array();
    var arrThemeColumns = new Array();
    var intItemsCount = 0;
    var strHtml = '';
    var arrResults = new Array()
    
    var bolCheckLicense = checkLicense(strSiteNumber, 'gir');
    if (bolCheckLicense == true) {
        arrThemeFilters[0] = new nlobjSearchFilter('custrecord_gir_thm_name', null, 'contains', strGirSearch);
        arrThemeFilters[1] = new nlobjSearchFilter('custrecord_gir_thm_sitenumber', null, 'equalto', strSiteNumber);
        arrThemeFilters[2] = new nlobjSearchFilter('custrecord_gir_thm_public', null, 'is', 'T');
        arrThemeColumns[0] = new nlobjSearchColumn('custrecord_gir_thm_name');
        arrThemeColumns[1] = new nlobjSearchColumn('lastname', 'custrecord_gir_thm_customerid');
        arrThemeColumns[2] = new nlobjSearchColumn('firstname', 'custrecord_gir_thm_customerid');
        var arrSearchResultsThemes = nlapiSearchRecord('customrecord_gir_thm', null, arrThemeFilters, arrThemeColumns);
        if (arrSearchResultsThemes != null && arrSearchResultsThemes.length > 0) {
            for (var intI = 0; intI < Math.min(25, arrSearchResultsThemes.length); intI++) {
                var arrSearchResultThemes = arrSearchResultsThemes[intI];
                var strThemeId = arrSearchResultThemes.getId();
                var strLastName = arrSearchResultThemes.getValue(arrThemeColumns[1]);
                var strFirstName = arrSearchResultThemes.getValue(arrThemeColumns[2]);
                var strThemeName = arrSearchResultThemes.getValue(arrThemeColumns[0]);
                arrResults[intItemsCount] = new SearchResult(strThemeId, strThemeName, strLastName, strFirstName);
                intItemsCount++;
            }
        }
        arrThemeFilters[0] = new nlobjSearchFilter('custrecord_gir_thm_sitenumber', null, 'equalto', strSiteNumber);
        arrThemeFilters[1] = new nlobjSearchFilter('email', 'custrecord_gir_thm_customerid', 'contains', strGirSearch);
        arrThemeFilters[2] = new nlobjSearchFilter('custrecord_gir_thm_public', null, 'is', 'T');
        arrThemeColumns[0] = new nlobjSearchColumn('custrecord_gir_thm_name');
        arrThemeColumns[1] = new nlobjSearchColumn('lastname', 'custrecord_gir_thm_customerid');
        arrThemeColumns[2] = new nlobjSearchColumn('firstname', 'custrecord_gir_thm_customerid');
        var arrSearchResultsThemes = nlapiSearchRecord('customrecord_gir_thm', null, arrThemeFilters, arrThemeColumns);
        if (arrSearchResultsThemes != null && arrSearchResultsThemes.length > 0) {
            for (var intI = 0; intI < Math.min(25, arrSearchResultsThemes.length); intI++) {
                var arrSearchResultThemes = arrSearchResultsThemes[intI];
                var strThemeId = arrSearchResultThemes.getId();
                var strLastName = arrSearchResultThemes.getValue(arrThemeColumns[1]);
                var strFirstName = arrSearchResultThemes.getValue(arrThemeColumns[2]);
                var strThemeName = arrSearchResultThemes.getValue(arrThemeColumns[0]);
                arrResults[intItemsCount] = new SearchResult(strThemeId, strThemeName, strLastName, strFirstName);
                intItemsCount++;
            }
        }
        
        if (intItemsCount == 0) {
            strHtml += '<div class="gir_unselected" style="heigth: 12px;"><span class="gir_result_name" >No Results Found</span></div>';
            intItemsCount = -1;
        }
        else {
            arrResults = girRemoveDuplicates(arrResults);
            for (var intI = 0; intI < arrResults.length; intI++) {
                strHtml += '<div id="' + arrResults[intI].getThemeId() + '" class="gir_unselected">';
                strHtml += '<span class="gir_result_name" >' + arrResults[intI].getLastName() + ', ' + arrResults[intI].getFirstName() + ' - ( ' + arrResults[intI].getThemeName() + ' )</span>';
                strHtml += '<a href="javascript:girViewPublicThemeInfo(' + arrResults[intI].getThemeId() + ",'gir_publicthemesinfo');" + '">View</a>';
                strHtml += '</div>';
            }
            
        }
    }
    else {
        strHtml += '<div class="gir_unselected" style="heigth: 12px;"><span class="gir_result_name" >Gift Registry is Disabled.</span></div>';
        intItemsCount = -1;
    }
    strHtml = escape(strHtml);
    response.write("var strHtml = unescape('" + strHtml + "');" + strResultVar + ".html(strHtml);" + strItemCountVar + "=" + intItemsCount.toString() + ";");
}

function girRemoveDuplicates(array){
    if (isNullOrUndefined(array)) {
        return array;
    }
    
    var arrNew = new Array();
    
    o: for (var i = 0, n = array.length; i < n; i++) {
        for (var x = 0, y = arrNew.length; x < y; x++) {
            if (arrNew[x].getThemeId() == array[i].getThemeId()) {
                continue o;
            }
        }
        
        arrNew[arrNew.length] = array[i];
    }
    
    return arrNew;
}

/**
 * GIFT REGISTRY
 * Upates the Theme Status
 * Recives: the theme Id and the Status
 * @param {String} request, response
 * Returns: html code with response messages
 * @return {String} response
 */
function girUpdateThemeStatus(request, response){

    var strThemeId = request.getParameter("themeid");
    var strStatus = unescape(request.getParameter("status"));
    var strHtml = '';
    
    try {
        nlapiSubmitField('customrecord_gir_thm', strThemeId, 'custrecord_gir_thm_public', strStatus);
        strHtml = 'alert("Status Saved Successfully");';
    } 
    catch (ex) {
        if (ex.getCode != null) // instanceof does not work on the server
        {
            strHtml = 'alert("NetSuite Error details ' + ex.getCode() + ': ' + ex.getDetails() + '");';
        }
        else {
            strHtml = 'alert("JavaScript Error details ' + ex.message + '");';
        }
    }
    response.write(strHtml);
    
}
