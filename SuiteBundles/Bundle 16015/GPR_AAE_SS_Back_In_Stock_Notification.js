/**
 * Description: SuiteCommerce Advanced Features (Back In Stock Notification)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.5
*/

/**
 * BACK IN STOCK NOTIFICATION
 * Send the customer notifications when the item have stock
 */
function sendNotifications(){    
	nlapiLogExecution("DEBUG", "Schedule Send Notifications", "----START----");	
    try {
        var strTemplateId = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_bsn_notftplid");
		var strEmployeeId = nlapiGetContext().getSetting("SCRIPT", "custscript_gpr_aae_bsn_notfemplid");
		if (strTemplateId != "" && strTemplateId != null && strEmployeeId != "" && strEmployeeId != null) {
			var arrFilters = [], arrColumns = [];
			arrFilters.push(new nlobjSearchFilter('custrecord_gpr_aae_bsn_notified', null, 'is', 'F'));
			arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_bsn_email"));
			arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_bsn_childid"));
			arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_bsn_itemid"));
			var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_bsn", null, arrFilters, arrColumns);
			if (!isEmptyArray(arrSearchResults)) {
				nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Notifications Found");
				for (var i = 0; i < Math.min(800, arrSearchResults.length); i++) {
					var strItemId = arrSearchResults[i].getValue(arrColumns[2])					
					if (!isEmpty(arrSearchResults[i].getValue(arrColumns[1]))){
						nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Is a matrix child");
						strItemId = arrSearchResults[i].getValue(arrColumns[1]);
					}else{
						nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Is NOT a matrix");
					}
					var arrFiltersItem = [], arrColumnsItem = [];
		            arrFiltersItem.push(new nlobjSearchFilter('internalid', null, 'is', strItemId));
		            arrFiltersItem.push(new nlobjSearchFilter('quantityavailable', null, 'greaterthan', 0));
		            var arrSearchResultsItems = nlapiSearchRecord('item', null, arrFiltersItem, arrColumnsItem);
					
		            if (arrSearchResultsItems != null && arrSearchResultsItems.length > 0) {
						var objMailRec = nlapiMergeRecord(strTemplateId, arrSearchResults[i].getRecordType(), arrSearchResults[i].getId());
						var strEmailBody = objMailRec.getValue().replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
						nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Send notification to: " + arrSearchResults[i].getValue(arrColumns[0]));
						nlapiSendEmail(strEmployeeId, arrSearchResults[i].getValue(arrColumns[0]), objMailRec.getName(), strEmailBody, null, null, null);
						nlapiSubmitField('customrecord_gpr_aae_bsn', arrSearchResults[i].getId(), 'custrecord_gpr_aae_bsn_notified', 'T');
					}
				}
			}
		}else{
			nlapiLogExecution("DEBUG", "Schedule Send Notifications", "Empty Template or Empty Employee");
		}      
    } 
    catch (error) {
        if (error.getDetails != undefined) {
            nlapiLogExecution("DEBUG",  "Schedule Calculate Credits", "Process Error", error.getCode() + ": " + error.getDetails());
        }
        else {
            nlapiLogExecution("DEBUG",  "Schedule Calculate Credits", "Unexpected Error", error.toString());
        }
    }
    nlapiLogExecution("DEBUG", "Schedule Calculate Credits", "-----END-----");	
}

/**
 * BACK IN STOCK NOTIFICATION
 * Receives the paren item id, the options var name, the item var name and the container in which the notifications is displayed
 * @param {Object} params
 */
function checkQty(request,response){
    var strParentId = request.getParameter('parentid');
    var strStkSiteBehavior = nlapiGetContext().getSetting('SCRIPT', 'custscript_gpr_aae_bsn_stkbehavior');
	var strCallback = request.getParameter('callback');
    nlapiLogExecution("DEBUG", "Check Qty", "----START----");
    try {
		var arrItemFilters = [], arrItemColumns = [], strJSON = "";
		arrItemFilters.push(new nlobjSearchFilter('internalid', null, 'is', strParentId));
		arrItemColumns.push(new nlobjSearchColumn('quantityavailable'));
		arrItemColumns.push(new nlobjSearchColumn('outofstockbehavior'));
		var arrSearchResultItems = nlapiSearchRecord('item', null, arrItemFilters, arrItemColumns);
		if (!isEmptyArray(arrSearchResultItems)) {
			nlapiLogExecution("DEBUG", "Check Qty", "Item found.");
			var arrMatrixItemFilters = [];
			arrMatrixItemFilters.push(new nlobjSearchFilter('internalid', null, 'is', strParentId));
			arrMatrixItemFilters.push(new nlobjSearchFilter('matrix', null, 'is', 'T'));
			var arrSearchResultMatrixItems = nlapiSearchRecord('item', null, arrMatrixItemFilters, null);
			if (!isEmptyArray(arrSearchResultMatrixItems)) {
				nlapiLogExecution("DEBUG", "Check Qty", "Is a mtatrix item.");
				strJSON = "({Results:{available: false, matrix: true},Errors:[]});";
			}
			else {
				nlapiLogExecution("DEBUG", "Check Qty", "Is NOT matrix item");
				var intQty = arrSearchResultItems[0].getValue('quantityavailable');
				if (intQty.forceParseInt() <= 0) {
					var strStkBehavior = arrSearchResultItems[0].getValue('outofstockbehavior');
					if (strStkBehavior == '- Default -') {
						if (strStkSiteBehavior != 'Allow back orders with no out-of-stock message') {
							nlapiLogExecution("DEBUG", "Check Qty", "Item not available, but display de link because of the site stock behavior: " + strStkSiteBehavior);
							strJSON = "({Results:{available: false, matrix: false},Errors:[]});";
						}
						else {
							nlapiLogExecution("DEBUG", "Check Qty", "Item not available, but NOT display de link because of the site stock behavior: " + strStkSiteBehavior);
							strJSON = "({Results:{available: true, matrix: false},Errors:[]});";
						}
					}
					else {
						if (strStkBehavior != 'Allow back orders with no out-of-stock message') {
							nlapiLogExecution("DEBUG", "Check Qty", "Item not available, but display de link because of the item stock behavior: " + strStkBehavior);
							strJSON = "({Results:{available: false, matrix: false},Errors:[]});";
						}
						else {
							nlapiLogExecution("DEBUG", "Check Qty", "Item not available, but not display de link because of the item stock behavior: " + strStkBehavior);
							strJSON = "({Results:{available: true, matrix: false},Errors:[]});";
						}
					}
				}
				else {
					nlapiLogExecution("DEBUG", "Check Qty", "Item available.");
					strJSON = "({Results:{available: true, matrix: false, qty:" + intQty + "},Errors:[]});";
				}
			}
		}
		else {
			nlapiLogExecution("DEBUG", "Check Qty", "No item found.");
			strJSON = "({Errors:[{code:'0',details:'No item found.'}]});";
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
	nlapiLogExecution('DEBUG', 'Check Qty', 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Check Qty", "-----END-----");  
}

/**
 * BACK IN STOCK NOTIFICATION
 * Receives the paren item id, the child options, the item var name and the container in which the notifications is displayed
 * @param {Object} params
 */
function checkChildQty(request,response){
    var strParentId = request.getParameter('parentid');   
    var strChildOptions = unescape(request.getParameter('itemoptions'));
	var strCallback = request.getParameter('callback');   
    var strStkSiteBehavior = nlapiGetContext().getSetting('SCRIPT', 'custscript_gpr_aae_bsn_stkbehavior_child');    
    var arrChildOptions = strChildOptions.split('|'), strChildId = "", strJSON= "";
	
    nlapiLogExecution("DEBUG", "Check Child Qty", "----START----");
	try {			
		nlapiLogExecution("DEBUG", "Check Child Qty", "Params Item Options: " + strChildOptions);
        var arrItemFilters = [], arrItemColumns = [];
        arrItemFilters.push(new nlobjSearchFilter('internalid', null, 'is', strParentId));
        arrItemFilters.push(new nlobjSearchFilter('matrix', null, 'is', 'T'));
        var arrSearchResultItems = nlapiSearchRecord('item', null, arrItemFilters, arrItemColumns);
        if (!isEmptyArray(arrSearchResultItems)) {
			nlapiLogExecution("DEBUG", "Check Child Qty", "Parent Item Found.");
            var objItemRecord = nlapiLoadRecord(arrSearchResultItems[0].getRecordType(), arrSearchResultItems[0].getId());
            var arrItemOptions = objItemRecord.getFieldValues('itemoptions');
			nlapiLogExecution("DEBUG", "Check Child Qty", "Item Options: " + arrItemOptions.join(';'));
            var intLineCount = objItemRecord.getLineItemCount('matrixmach');
			nlapiLogExecution("DEBUG", "Check Child Qty", "Childs Count: " + intLineCount);
            var intFoundCount = 0;
            for (var i = 1; i <= intLineCount; i++) {
                var bolIsInactive = objItemRecord.getLineItemValue('matrixmach', 'mtrxinactive', i);
                var bolIsOnLine = objItemRecord.getLineItemValue('matrixmach', 'mtrxisonline', i);
                if (bolIsInactive == 'F' && bolIsOnLine == 'T') {
					nlapiLogExecution("DEBUG", "Check Child Qty", "Child online and active");
                    intFoundCount = 0;
                    for (var j = 1; j <= arrItemOptions.length; j++) {						
                        var strOptionValue = objItemRecord.getLineItemValue('matrixmach', 'mtrxoption' + j, i);
						nlapiLogExecution("DEBUG", "Check Child Qty", "Child: " + j + " " + strOptionValue);
                        if (strOptionValue == arrChildOptions[j - 1]) {
                            intFoundCount += 1;
                        }
                    }
                    if (intFoundCount == arrItemOptions.length) {						
                        strChildId = objItemRecord.getLineItemValue('matrixmach', 'mtrxid', i);
						nlapiLogExecution("DEBUG", "Check Child Qty", "Child match found: " + strChildId);
                        break;
                    }
                    intFoundCount = 0;
                    for (var k = 1; k <= arrItemOptions.length; k++) {
                        var strOptionValue = objItemRecord.getLineItemValue('matrixmach', 'mtrxoption' + k, i);
						nlapiLogExecution("DEBUG", "Check Child Qty", "Child: " + k + " " + strOptionValue);
                        if (strOptionValue == arrChildOptions[arrItemOptions.length - k]) {
                            intFoundCount += 1;
                        }
                    }
                    if (intFoundCount == arrItemOptions.length) {
                        strChildId = objItemRecord.getLineItemValue('matrixmach', 'mtrxid', i);
						nlapiLogExecution("DEBUG", "Check Child Qty", "Child match found: " + strChildId);
                        break;
                    }
                }
            }
            if (intFoundCount == arrItemOptions.length) {
				nlapiLogExecution("DEBUG", "Check Child Qty", "Matrix Child Found id: " + strChildId);				
                var intChildQty = nlapiLookupField(arrSearchResultItems[0].getRecordType(), strChildId, 'quantityavailable').forceParseInt();
                if (intChildQty <= 0) {
					nlapiLogExecution("DEBUG", "Check Child Qty", "Matrix Child Qty <= 0");
                    var strStkBehavior = nlapiLookupField(arrSearchResultItems[0].getRecordType(), strParentId, 'outofstockbehavior');
					nlapiLogExecution("DEBUG", "Check Child Qty", "Stock Behavior: " + strStkBehavior);
                    if (strStkBehavior == '- Default -') {
                        if (strStkSiteBehavior != 'Allow back orders with no out-of-stock message') {
							nlapiLogExecution("DEBUG", "Check Child Qty", "Item not available, but display de link because of the site stock behavior: " + strStkSiteBehavior);
							strJSON = "({Results:{available: false, childid: '" + strChildId + "'},Errors:[]});";
                        }
                        else {
							nlapiLogExecution("DEBUG", "Check Child Qty", "Item not available, but NOT display de link because of the site stock behavior: " + strStkSiteBehavior);
							strJSON = "({Results:{available: true, childid: '" + strChildId + "'},Errors:[]});";
                        }
                    }
                    else {
                        if (strStkBehavior != 'Allow back orders with no out-of-stock message') {
							nlapiLogExecution("DEBUG", "Check Child Qty", "Item not available, but display de link because of the item stock behavior: " + strStkBehavior);
							strJSON = "({Results:{available: false, childid: '" + strChildId + "'},Errors:[]});";
                        }
                        else {
							nlapiLogExecution("DEBUG", "Check Child Qty", "Item not available, but display de link because of the item stock behavior: " + strStkBehavior);
							strJSON = "({Results:{available: true, childid: '" + strChildId + "'},Errors:[]});";
                        }
                    }
                }
                else {					
					nlapiLogExecution("DEBUG", "Check Child Qty", "Matrix Child Qty = " + intChildQty);
					strJSON = "({Results:{available: true, qty:" + intQty + "},Errors:[]});";
                }
            }
            else {
				nlapiLogExecution("DEBUG", "Check Child Qty", "Child Item NOT found.");
				strJSON = "({Errors:[{code:'-2',details:'Child Item NOT found.'}]});";
            }
        }
        else {
			nlapiLogExecution("DEBUG", "Check Child Qty", "Parent Item NOT found.");
			strJSON = "({Errors:[{code:'-1',details:'No item found.'}]});";
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
	nlapiLogExecution('DEBUG', 'Check Child Qty', 'Usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution("DEBUG", "Check Child Qty", "-----END-----"); 
}
