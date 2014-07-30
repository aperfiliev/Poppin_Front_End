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
 * Date:     Tue Sep 18 2012 10:03:45 GMT-0400 (EDT)
 *
 * Reviewed by:
 * Review Date:
 *
 ***********************************************************************/
/**
 * The following function searches for all the SO pending billing and bills them
 * @author   pablo.herrera-batz@erpguru.com
 * @return nothing
 */
function salesOrderBilling(){
    var lastProcessedSO = nlapiGetContext().getSetting('SCRIPT', 'custscript_last_so_billed');
    if (lastProcessedSO == null) {
        lastProcessedSO = 0;
    }
    
    // get all the SO that need to be billed
    var filters = [];
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
    filters.push(new nlobjSearchFilter('status', null, 'anyof', PENDING_BILLING)); // defined in POP_LIB_SalesOrderAutomation.js
    filters.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthanorequalto', lastProcessedSO));
    filters.push(new nlobjSearchFilter('source', null, 'anyof', WEB_POPPIN_SHOP)); // defined in POP_LIB_SalesOrderAutomation.js
    filters.push(new nlobjSearchFilter('paymentmethod', null, 'anyof', [PAYPAL, VISA, AMRICAN_EXPRESS, MARSTER_CARD, DISCOVER])); // defined in POP_LIB_SalesOrderAutomation.js
    var columns = [];
    columns.push(new nlobjSearchColumn('paymentmethod'));
    columns.push(new nlobjSearchColumn('authcode'));
    columns.push(new nlobjSearchColumn('amount'));
    columns.push(new nlobjSearchColumn('custbody_reason_pending_billing'));
    
    var search = nlapiCreateSearch('salesorder', filters, columns);
    var searchResultSet = search.runSearch();
    searchResultSet.forEachResult(billSO);
}

/**
 * The following function validates if the SO should be billed and bills it
 * @author   pablo.herrera-batz@erpguru.com
 * @param {Object} eachResult : a result from the search
 * @return {boolean} true : forEachResults() expects it
 */
function billSO(eachResult){
    verifyMetering(150, 'custscript_last_so_billed', eachResult.getId()); // 20 Units, call POP_LIB_SalesOrderAutomation.js
    var creditCardApproved = true;
    
    // Payment method is one of the following
    //    a. PayPal
    //    b. Credit Card (Visa, Amex, MC and Discovery). In this case, change the accounting to hit the "Undeposited Funds" account -done in accounting preferences- and verify credit card was approved
    if (eachResult.getValue('paymentmethod') != PAYPAL) { // defined in POP_LIB_SalesOrderAutomation.js
        if (eachResult.getValue('authcode') == null || eachResult.getValue('authcode') == '') {
            // credit card not approved
            creditCardApproved = false;
        }
    }
    
    if (creditCardApproved) {
        // Bill sales order by creating a cash sale
        try {
            // get old reason for pending billing value
            var oldReasonPendingBilling = eachResult.getValue('custbody_reason_pending_billing');
            if (oldReasonPendingBilling == null) {
                oldReasonPendingBilling = '';
            }
            var newReasonPendingBilling = '';
            // transform sales order to cash sale, and validate that total amount is the same for both transactions 
            var cashsale = nlapiTransformRecord(eachResult.getRecordType(), eachResult.getId(), 'cashsale'); // 10 Units
            if (cashsale.getFieldValue('total') == eachResult.getValue('amount')) {
                var cashsaleId = nlapiSubmitRecord(cashsale); // 20 Units                
            } else {
                newReasonPendingBilling = 'The cash sale amount [' + cashsale.getFieldValue('total') + '] does not match the sales order amount [' + eachResult.getValue('amount') + ']';
            }
            if (oldReasonPendingBilling != newReasonPendingBilling) {
                nlapiSubmitField(eachResult.getRecordType(), eachResult.getId(), 'custbody_reason_pending_billing', newReasonPendingBilling); // 20 Units
            }
        } catch (e) {
            logError(e, 'SO ' + eachResult.getId() + ' was not billed', DEFAULT_EMAIL_AUTHOR); // 10 Units, call POP_LIB_SalesOrderAutomation.js
        }
    }
    return true;
}
