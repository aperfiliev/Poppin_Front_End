/**
 * Description: SuiteCommerce Advanced Features (Recently Viewed Items)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 3.0
*/
 
/**
 * RECENTLY VIEWED ITEMS
 * Shows the recently viewed items of a customer
 * Receives the items list separated with comma and the container id in which the items will be shown
 * @param {String} request
 * @param {String} response
 * Returns the JSON code in order to show the items in the Customer Wish List
 * @return {JSON} response
 */
function getItems(request, response){   
    var strItems = request.getParameter('items');
	var strItemsNoCart = request.getParameter('itemsnocart');
    var strSiteNumber = request.getParameter('sitenumber');
    var strCallback = unescape(request.getParameter("callback"));
    var bolMultiSite = nlapiGetContext().getFeature('MULTISITE');
    var strAddonOption = nlapiGetContext().getSetting('SCRIPT', 'custscript_gpr_aae_rvi_addonsltsoption');
    var arrItems = [], arrItemsNoCart = [];
    var strJSON = "", intItemsCount = 0 ;
	nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "----START----");    
	nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "Items:" + strItems );
    try {
        if (!isEmpty(strItems)) {
			nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "Items no Empty");
			arrItems = strItems.split(",");
            if (!isEmptyArray(arrItems)) {
				nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "No Empty items Array");                
                if (checkLicense(strSiteNumber, 'rvi')) {
					nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "Valid License");					
					var arrLytFilters = [], arrLytColumns = [];                   
					arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_option", null, "is", strAddonOption));
					arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_sitenumber", null, "equalto", strSiteNumber));
                    arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listtpl"));
                    arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listcelltpl"));
                    arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_numcolumns"));
                    arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_maxitems"));
					arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_bundlename"));
                    var arrSearchResultsLyt = nlapiSearchRecord("customrecord_gpr_addonslyts", null, arrLytFilters, arrLytColumns);
                    if (!isEmptyArray(arrSearchResultsLyt)) {
						nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "RVI Layout Found");
                        var strHtmlListTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[0]);
                        var strHtmlListCellTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[1]);
                        var intMaxItems = arrSearchResultsLyt[0].getValue(arrLytColumns[3]);
						var strBundleName = arrSearchResultsLyt[0].getValue(arrLytColumns[4]);
                        var intNumColumns = arrSearchResultsLyt[0].getValue(arrLytColumns[2]);
                        if (!isEmpty(strHtmlListCellTpl) && !isEmpty(strHtmlListTpl)) {
							nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "RVI Template Found");							
                            var strHtmlListCell = "", strHtmlListResult = "", strItemsResult = "";														
                            for (var i = (Math.min(intMaxItems, arrItems.length) - 1); i >= 0; i--) {
								var arrFiltersItem = [], arrColumnsItem = [];
								nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "Item: " + arrItems[i]);
                                //for (var i = (searchResultsItems.length-1); (i >= 0 && intItemsCount < intMaxItems)  ; i--) {
                                arrFiltersItem.push(new nlobjSearchFilter('internalid', null, 'is', arrItems[i]));
                                arrFiltersItem.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
                                arrFiltersItem.push(new nlobjSearchFilter('isonline', null, 'is', 'T'));
                                if (bolMultiSite == true) {
                                    arrFiltersItem.push(new nlobjSearchFilter('website', null, 'is', strSiteNumber));
                                }
                                arrColumnsItem.push(new nlobjSearchColumn('storedisplayname'));
                                arrColumnsItem.push(new nlobjSearchColumn('itemurl'));
                                arrColumnsItem.push(new nlobjSearchColumn('thumbnailurl'));
                                var arrSearchResultsItems = nlapiSearchRecord('item', null, arrFiltersItem, arrColumnsItem);
                                if (!isEmptyArray(arrSearchResultsItems)) {
									nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "Item Found");
									var objSearchResultItem = arrSearchResultsItems[0];
									var bolNoCart = "false";
									if(!isEmpty(strItemsNoCart)){
										arrItemsNoCart = strItemsNoCart.split(",");
										for (var j = 0; j < arrItemsNoCart.length; j++) {
											if(objSearchResultItem.id == arrItemsNoCart[j]){
												bolNoCart = "true";
												break;	
											}											
										}
									}                                    
                                    strHtmlListCell = strHtmlListCellTpl;                                   
                                    strHtmlListCell = strHtmlListCell.replace(/<NLITEMID>/g, objSearchResultItem.id);
                                    strItemsResult += "{internalid:'" + objSearchResultItem.id + "',url:'" + escape(objSearchResultItem.getValue(arrColumnsItem[1])) + "',nocart:" + bolNoCart + "},";                                    
                                    var strName = objSearchResultItem.getValue(arrColumnsItem[0]);
                                    if (strName == null || strName == '') {
                                        strName = '&nbsp;';
                                    }
                                    strHtmlListCell = strHtmlListCell.replace(/<NLITEMNAME>/g, strName);
                                    
                                    var strImgUrlRegExp = '<NLITEMIMGURL([^"]*)';
                                    var regExpImgUrl = new RegExp(strImgUrlRegExp, 'g');
                                    strHtmlListCell = strHtmlListCell.replace(regExpImgUrl, objSearchResultItem.getValue(arrColumnsItem[2]));
                                     nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "Img Url:"+objSearchResultItem.getValue(arrColumnsItem[2]));    
                                    var strItemUrlRegExp = '<NLITEMURL([^"]*)';
                                    var regExpItemUrl = new RegExp(strItemUrlRegExp, 'g');
                                    strHtmlListCell = strHtmlListCell.replace(regExpItemUrl, objSearchResultItem.getValue(arrColumnsItem[1]));
                                    
                                    if ((intItemsCount % intNumColumns) == 0 && intItemsCount > 0) {
                                        strHtmlListResult += '</ul><ul>';
                                    }
                                    intItemsCount++;
									
									strHtmlListCell = strHtmlListCell.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
									strHtmlListCell = strHtmlListCell.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
									
                                    strHtmlListResult = strHtmlListCell + strHtmlListResult;                                    
                                }
                            }
							nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "Finish Loop");
                            strItemsResult = strItemsResult.substring(0, (strItemsResult.length - 1));
                            var strHtmlList = strHtmlListTpl;
                            strHtmlList = strHtmlList.replace('<NLLISTTOTAL>', intItemsCount.toString());
							strHtmlList = strHtmlList.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
							strHtmlList = strHtmlList.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
                            var strCommentsRegExp = '<!--([^<]*)';
                            var regExpCooments = new RegExp(strCommentsRegExp, 'g');
                            strJSON = strCallback + "({Results:{html:'" + escape(strHtmlList.replace('<NLLISTRESULT>', strHtmlListResult).replace(regExpCooments, '')) + "'},Items:[" + strItemsResult + "],Errors:[]})";
                            response.write(strJSON);
                        }
                        else {
                            nlapiLogExecution('ERROR', 'Recently Viewed Items', 'Templates not Found');
                            strJSON = strCallback + "({Errors:[{code:'-1',details:'Templates not Found'}]})";
                            response.write(strJSON);
                        }
                    }
                    else {
                        nlapiLogExecution('ERROR', 'Recently Viewed Items', 'Layout not Found');
                        strJSON = strCallback + "({Errors:[{code:'-1',details:'Layout not Found'}]})";
                        response.write(strJSON);
                    }
                }
                else {
                    nlapiLogExecution('ERROR', 'Recently Viewed Items', 'Invalid License');
                    strJSON = strCallback + "({Errors:[{code:'-1',details:'The Recently Viewed Items is Disabled for this Website.'}]})";
                    response.write(strJSON);
                }
            }
        }
    } 
    catch (ex) {
        if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
        {
            nlapiLogExecution('ERROR', 'NetSuite Error details', ex.getCode() + ': ' + ex.getDetails());
            strJSON = strCallback + "({Errors:[{code:'" + escape(ex.getCode()) + "',details:'" + escape(ex.getDetails()) + "'}]})";
            response.write(strJSON);
        }
        else {
            nlapiLogExecution('ERROR', 'JavaScript Error details', ex.message);
            strJSON = strCallback + "({Errors:[{code:'0',details:'" + escape(ex.message) + "'}]})";
            response.write(strJSON);
        }
    }
    nlapiLogExecution("DEBUG", "Show Recently Viewed Items", "-----END-----");    
}
