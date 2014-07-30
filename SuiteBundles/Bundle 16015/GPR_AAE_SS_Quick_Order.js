/**
 * Description: SuiteCommerce Advanced Features (Quick Order)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 1.0
*/
/**
 * QUICK ORDER ITEMS
 * @param {Object} request
 * @param {Object} response
 */
function getResults(request, response){
    var bolMultiSite = nlapiGetContext().getFeature('MULTISITE');
    var bolMatrix = nlapiGetContext().getFeature('MATRIXITEMS');
    var strItemSearch = unescape(request.getParameter("query"));
    var strSiteNumber = request.getParameter("sitenumber");    
    var arrFiltersItem = [], arrColumnsItem = [], strJSON = '', arrSuggestions = [], arrData = [];
    nlapiLogExecution("DEBUG", "Quick Order", "----START----");	
	nlapiLogExecution("DEBUG", "Quick Order", "Query: " + strItemSearch);
	try {	  
	    if (checkLicense(strSiteNumber, 'qio')) {
			nlapiLogExecution("DEBUG", "Quick Order", "Valid License");
	        arrFiltersItem.push(new nlobjSearchFilter('itemid', null, 'contains', strItemSearch));
			arrFiltersItem[0].setOr(true);
			arrFiltersItem[0].setLeftParens(1);
			arrFiltersItem.push(new nlobjSearchFilter('caption', null, 'contains', strItemSearch));
			arrFiltersItem[1].setOr(true);
			arrFiltersItem.push(new nlobjSearchFilter('displayname', null, 'contains', strItemSearch));			
			arrFiltersItem[2].setRightParens(1);
	        arrFiltersItem.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	        arrFiltersItem.push(new nlobjSearchFilter('isonline', null, 'is', 'T'));      
	        if (bolMatrix == true) {
	            arrFiltersItem.push(new nlobjSearchFilter('matrixchild', null, 'is', 'F'));      
				nlapiLogExecution("DEBUG", "Quick Order", "Is matrix Item");	
	        }
	        if (bolMultiSite == true) {
	            arrFiltersItem.push(new nlobjSearchFilter('website', null, 'is', strSiteNumber));
				nlapiLogExecution("DEBUG", "Quick Order", "Multi Website, site number: " + strSiteNumber);      
	        }
	        arrColumnsItem.push(new nlobjSearchColumn('itemid'));
			arrColumnsItem[0].setSort();
	        arrColumnsItem.push(new nlobjSearchColumn('itemurl'));
	        arrColumnsItem.push(new nlobjSearchColumn('storedisplayname'));			
	        var arrSearchResultsItems = nlapiSearchRecord('item', null, arrFiltersItem, arrColumnsItem);
	        if (!isEmptyArray(arrSearchResultsItems)) {
				nlapiLogExecution("DEBUG", "Quick Order", "Items Found");				
	            for (var intI = 0; intI < Math.min(99, arrSearchResultsItems.length); intI++) {              
	                var objSearchResultItem = arrSearchResultsItems[intI];
					var strItemId = objSearchResultItem.getId();
					var strItemUrl = objSearchResultItem.getValue(arrColumnsItem[1]);
	                var strSku = objSearchResultItem.getValue(arrColumnsItem[0]);
	                var strName = objSearchResultItem.getValue(arrColumnsItem[2]);
	                if (bolMatrix == true) {
                        var arrFiltersChildItem = [], arrColumnsChildItem = [];
                        arrFiltersChildItem.push(new nlobjSearchFilter('parent', null, 'is', objSearchResultItem.getId()));
                        arrFiltersChildItem.push(new nlobjSearchFilter('matrixchild', null, 'is', 'T'));
						arrFiltersChildItem.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	        			arrFiltersChildItem.push(new nlobjSearchFilter('isonline', null, 'is', 'T'));
						arrColumnsChildItem.push(new nlobjSearchColumn('itemid'));
						arrColumnsChildItem[0].setSort();
                        var arrSearchResultsChildItems = nlapiSearchRecord('item', null, arrFiltersChildItem, arrColumnsChildItem);
                        if (!isEmptyArray(arrSearchResultsChildItems)) {
							nlapiLogExecution("DEBUG", "Quick Order", "Child items Found");
							for (var intJ = 0; intJ < arrSearchResultsChildItems.length; intJ++) {
								var strChildItemId = arrSearchResultsChildItems[intJ].getId();
								var strChildSku = arrSearchResultsChildItems[intJ].getValue(arrColumnsChildItem[0]);
								strChildSku = strChildSku.replace(/'/g, '-').replace(/:/g,'').replace(strSku,'');
								arrSuggestions.push(strChildSku.trim());
								arrData.push({
								        "itemid": strChildItemId,
								        "url": strItemUrl,
								        "name": strName.replace(/'/g, '-')
								});								 
								        	                			
							}                            							
                        }
                        else {
							nlapiLogExecution("DEBUG", "Quick Order", "Child not Found");							
	                		arrSuggestions.push(strSku.replace(/'/g, '-'));
                            arrData.push({
                                    "itemid": strItemId ,
                                    "url": strItemUrl,
                                    "name": strName.replace(/'/g, '-')
                            });      
                        }
	                }
	                else {
						nlapiLogExecution("DEBUG", "Quick Order", "Not a matrix");
						arrSuggestions.push(strSku.replace(/'/g, '-'));
                        arrData.push({
                                "itemid": strItemId ,
                                "url": strItemUrl,
                                "name": strName.replace(/'/g, '-')
                        });
	                }
	            }
	        }else{
				nlapiLogExecution("DEBUG", "Quick Order", "Not Items Found");
			}
	    }else{
			nlapiLogExecution("DEBUG", "Quick Order", "Not a Valid License");
		}	    
	    response.write(JSON.stringify({"query": strItemSearch ,"suggestions": arrSuggestions,"data": arrData}));
	}
	catch (ex) {
		if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
		{			
			nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
			strJSON = "{query: '" + strItemSearch + "',suggestions: [],data: []}";			
			response.write(strJSON);
        }
        else {
			nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
			strJSON = "{query: '" + strItemSearch + "',suggestions: [],data: []}";            
			response.write(strJSON);
        }
	}
	nlapiLogExecution("DEBUG", "Quick Order", "-----END-----");  
}
