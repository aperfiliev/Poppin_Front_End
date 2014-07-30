/***********************************************************************
 *
 * The following javascript code is created by ERP Guru Inc.,
 * a NetSuite Partner. It is a SuiteFlex component containing custom code
 * intented for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": ERP Guru shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:  ERP Guru inc., www.erpguru.com
 * Author:   pablo.herrera-batz@erpguru.com
 * Date:     Mon Sep 17 2012 11:37:16 GMT-0400 (EDT)
 *
 ***********************************************************************/
/**
 * The following function searches for all the SO pending approval and approves them
 * @author   pablo.herrera-batz@erpguru.com
 * @return nothing
 */
function salesOrderApproval(){
    var lastProcessedSO = nlapiGetContext().getSetting('SCRIPT', 'custscript_last_so_approved');
    if (lastProcessedSO == null) {
        lastProcessedSO = 0;
    }
    
    // get all the SO that need to be approved
    var filters = [];
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
    filters.push(new nlobjSearchFilter('status', null, 'anyof', PENDING_APPROVAL)); // defined in POP_LIB_SalesOrderAutomation.js
    // check only SO with backordered items, other cases are covered by SUE script
    filters.push(new nlobjSearchFilter('custbody_has_backordered_items', null, 'is', 'T'));
    filters.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthanorequalto', lastProcessedSO));
    
    var columns = [];
    columns.push(new nlobjSearchColumn('custbody_reason_pending_approval'));
    columns.push(new nlobjSearchColumn('entity'));
    
    var search = nlapiCreateSearch('salesorder', filters, columns);
    var searchResultSet = search.runSearch();
    searchResultSet.forEachResult(approveSO);
}

/**
 * The following function validates that if the SO should be approved and approves it
 * @author   pablo.herrera-batz@erpguru.com
 * @param {Object} eachResult : a result from the search
 * @return {boolean} true : forEachResults expects it
 */
function approveSO(eachResult){
    var errorString = eachResult.getValue('custbody_reason_pending_approval');
    verifyMetering(100, 'custscript_last_so_approved', eachResult.getId()); // call POP_LIB_SalesOrderAutomation.js
    // None of the line items are backordered
    if (!itemsBackordered(eachResult)) { // 10 Units
        var hasBackorderedItems = true;
        // Remove backorder error from errorString
        var lines = errorString.split('\n');
        errorString = '';
        for (var i = 0; i < lines.length; i++) {
            if (lines[i] != 'At least one item is backordered') {
                errorString += lines[i] + '\n';
            }
        }
        
        if (errorString == '\n') {
            errorString = '';
        }
        
        // Submit the reasons why the SO was not approved
        var fields = [];
        var values = [];
        if (errorString != '') {
            try {
                fields = ['custbody_reason_pending_approval', 'custbody_has_backordered_items'];
                values = [errorString, 'F'];
                nlapiSubmitField(eachResult.getRecordType(), eachResult.getId(), fields, values); // 30 Units
            } catch (e) {
                logError(e, 'SO ' + eachResult.getId() + ' was not updated', DEFAULT_EMAIL_AUTHOR); // 10 Units,  call POP_LIB_SalesOrderAutomation.js
            }
        } else {
            // Approve the Sales Order and erase earlier error messages in "Reason for Pending Approval" field
            try {
                if (eachResult.getValue('entity') != CUSTOMER_TO_EXCLUDE) {
                    fields.push('orderstatus');
                    values.push(PENDING_FULFILLMENT); // defined in POP_LIB_SalesOrderAutomation.js
                }
                fields.push('custbody_reason_pending_approval');
                values.push('');
                fields.push('custbody_has_backordered_items');
                values.push('F');
                /* 
                 * Modification June 19th 2013
                 * by pablo.herrera-batz@erpguru.com
                 * Add a timestamp to know when the SO was approved
                 */
                fields.push('custbody_approval_timestamp');
                values.push(new Date().getTime()); // current server time
                nlapiSubmitField(eachResult.getRecordType(), eachResult.getId(), fields, values); // 30 Units
            } catch (e) {
                logError(e, 'SO ' + eachResult.getId() + ' was not approved', DEFAULT_EMAIL_AUTHOR); // 10 Units, call POP_LIB_SalesOrderAutomation.js
            }
        }
    }
    
    return true;
}

/**
 * The following function checks if at least one item is backordered
 * @author   pablo.herrera-batz@erpguru.com
 * @param {Object} eachResult : a result from the search
 * @return {boolean} true if an item is backordered
 */
function itemsBackordered(eachResult){
    var rec = nlapiLoadRecord(eachResult.getRecordType(), eachResult.getId()); // 10 Units
    for (var i = 0; i < rec.getLineItemCount('item'); i++) {
        if (rec.getLineItemValue('item', 'createpo', i + 1) != 'DropShip') {
            var qtyLeft = rec.getLineItemValue('item', 'quantityavailable', i + 1) - rec.getLineItemValue('item', 'quantity', i + 1);
            if (qtyLeft < 0) {
                return true;
            }
        }
    }
    return false;
}
