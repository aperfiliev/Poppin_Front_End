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
 * Reviewed by:
 * Review Date:
 *
 ***********************************************************************/
/**
 * The following function approves the SO
 * @author   pablo.herrera-batz@erpguru.com
 * @param {String} type : User Event Script Execution Type
 */
function afterSubmit_approveSO(type){
    if (type == 'create' || type == 'edit') {
        var salesorder = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId()); // 10 Units
        // validate the sales order is pending approval
        if (salesorder.getFieldValue('orderstatus') != null && salesorder.getFieldValue('orderstatus') == PENDING_APPROVAL_SUE) { // defined in POP_LIB_SalesOrderAutomation.js
            validateApproval(salesorder);
        }
    }
}

/**
 * The following function validates if the SO should be approved and approves it
 * @author   pablo.herrera-batz@erpguru.com
 * @param {Object} salesorder : current sales order record
 * @return nothing
 */
function validateApproval(salesorder){
    var errorString = '';
    // None of the line items are backordered
    if (itemsBackordered(salesorder)) { // 10 Units
        errorString += 'At least one item is backordered\n';
        salesorder.setFieldValue('custbody_has_backordered_items', 'T');
    }
    // The source of the order is "Web (Poppin Shop)"
    if (salesorder.getFieldValue('source') == null || salesorder.getFieldValue('source') != WEB_POPPIN_SHOP_SUE) { // defined in POP_LIB_SalesOrderAutomation.js
        //   errorString += 'Source is not "Web (Poppin Shop)"\n';
    }
    // Payment method is one of the following
    //    a. PayPal, and Authorization ID is populated
    //    b. Credit Card (Visa, Amex, MC and Discovery), P/N Ref./Auth Code is populated, AVS Zip Match is "Y", and CSC Match is "Y".
    errorString = validatePayment(salesorder, errorString);
    // Location is "DOT Com Distribution"
    if (salesorder.getFieldValue('location') == null || salesorder.getFieldValue('location') != DOT_COM_DISTRIBUTION) { // defined in POP_LIB_SalesOrderAutomation.js
        errorString += 'Location is not "DOT Com Distribution"\n';
    }
    // Order amount is less than $1000
    var amount = salesorder.getFieldValue('total');
    if (amount != null && amount >= 1000) {
        errorString += 'Amount is greater than 1,000.00 $\n';
    }
    // Billing Zip and Shipping Zip don't match, and order amount is less than $100
    var billingZip = salesorder.getFieldValue('billzip');
    var shippingZip = salesorder.getFieldValue('shipzip');
    if (billingZip == null) {
        billingZip = '';
    }
    if (shippingZip == null) {
        shippingZip = '';
    }
    if (billingZip != shippingZip && amount >= 100) {
        errorString += 'Billing zip and shipping zip do not match and amount is greater than 100.00 $\n';
    }
    // check "3PL Integration - Needs Manual Resol." if customer is CUSTOMER_TO_EXCLUDE
    if (salesorder.getFieldValue('entity') == CUSTOMER_TO_EXCLUDE) { // defined in POP_LIB_SalesOrderAutomation.js
        salesorder.setFieldValue('custbody_needs_manual_resolution', 'T');
    }
    
    // Submit the reasons why the SO was not approved
    if (errorString != '') {
        try {
            salesorder.setFieldValue('custbody_reason_pending_approval', errorString);
            nlapiSubmitRecord(salesorder); // 20 Units
        } catch (e) {
            logError(e, 'SO ' + salesorder.getId() + ' was not updated', DEFAULT_EMAIL_AUTHOR); // call POP_LIB_SalesOrderAutomation.js
        }
    } else {
        // Approve the Sales Order and erase earlier error messages in "Reason for Pending Approval" field
        try {
            // only approve if customer is not CUSTOMER_TO_EXCLUDE
            if (salesorder.getFieldValue('entity') != CUSTOMER_TO_EXCLUDE) { // defined in POP_LIB_SalesOrderAutomation.js
                salesorder.setFieldValue('orderstatus', PENDING_FULFILLMENT); // defined in POP_LIB_SalesOrderAutomation.js			
            }
            salesorder.setFieldValue('custbody_reason_pending_approval', '');
            nlapiSubmitRecord(salesorder); // 20 Units
        } catch (e) {
            logError(e, 'SO ' + salesorder.getId() + ' was not approved', DEFAULT_EMAIL_AUTHOR); // call POP_LIB_SalesOrderAutomation.js
        }
    }
}

/**
 * The following function checks if at least one item is backordered
 * @author   pablo.herrera-batz@erpguru.com
 * @param {Object} salesorder : current sales order record
 * @return {boolean} true if an item is backordered
 */
function itemsBackordered(salesorder){
    for (var i = 0; i < salesorder.getLineItemCount('item'); i++) {
        if (salesorder.getLineItemValue('item', 'createpo', i + 1) != 'DropShip') {
            var qtyLeft = salesorder.getLineItemValue('item', 'quantityavailable', i + 1) - salesorder.getLineItemValue('item', 'quantity', i + 1);
            if (qtyLeft < 0) {
                return true;
            }
        }
    }
    return false;
}

/**
 * The following function validates the payment method and values related to the payment
 * Payment method is one of the following
 *    a. PayPal, and Authorization ID is populated
 *    b. Credit Card (Visa, Amex, MC and Discovery), P/N Ref./Auth Code is populated, AVS Zip Match is "Y", and CSC Match is "Y".
 * @author   pablo.herrera-batz@erpguru.com
 * @param {Object} salesorder : current sales order record
 * @param {String} errorString : string with the reasons why SO won't be approved
 * @return {String} errorString : string with the reasons why SO won't be approved
 */
function validatePayment(salesorder, errorString){
    var paymentMethod = salesorder.getFieldValue('paymentmethod');
    if (paymentMethod == null || paymentMethod == '') {
        errorString += 'No payment method\n';
    } else {
        // PayPal, and Authorization ID is populated
        if (paymentMethod == PAYPAL) { // defined in POP_LIB_SalesOrderAutomation.js
            var authorisationId = salesorder.getFieldValue('paypalauthid');
            if (authorisationId == null || authorisationId == '') {
                errorString += 'Authorization ID is empty\n';
            }
        } else if (paymentMethod == VISA || paymentMethod == MARSTER_CARD || paymentMethod == DISCOVER || paymentMethod == AMRICAN_EXPRESS) { // defined in POP_LIB_SalesOrderAutomation.js
            // Credit Card (Visa, Amex, MC and Discovery), P/N Ref./Auth Code is populated, AVS Zip Match is "Y", and CSC Match is "Y".
            /**
             As per WR6469, Credit Card validation is replaced by a check on Payment Event results.
             if (salesorder.getFieldValue('pnrefnum') == null || salesorder.getFieldValue('pnrefnum') == '') {
             errorString += 'P/N Ref. is empty\n';
             }
             if (salesorder.getFieldValue('authcode') == null || salesorder.getFieldValue('authcode') == '') {
             errorString += 'Auth. Code is empty\n';
             }
             if (salesorder.getFieldValue('ccavszipmatch') == null || salesorder.getFieldValue('ccavszipmatch') != 'Y') {
             errorString += 'AVS Zip Match is not "Y"\n';
             }
             if (salesorder.getFieldValue('ccsecuritycodematch') == null || salesorder.getFieldValue('ccsecuritycodematch') != 'Y') {
             errorString += 'CSC Match is not "Y"\n';
             }
             */
            //Added by felix.guinet@erpguru.com on October 16th, 2013: WR6469 
            if (verifyPaymentApproved(salesorder) == false) {
                errorString += 'Payment was not Approved. See Billing tab for details. \n';
            }
        } else {
            errorString += 'Payment is not PayPal or Credit Card\n';
        }
    }
    return errorString;
}



/**
 * The following function validates if the latest Payment Event on the SO is ACCEPT
 * @author   felix.guinet@erpguru.com
 * @param {Object} salesorder : current sales order record.
 * @return {boolean} true if payment event is ACCEPT. false otherwise.
 */
function verifyPaymentApproved(salesorder){
    var filters = [];
    filters[0] = new nlobjSearchFilter('paymenteventresult', null, 'anyof', 'ACCEPT');
    filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'T');
    filters[2] = new nlobjSearchFilter('internalid', null, 'is', salesorder.getId());
    
    var searchResults = nlapiSearchRecord('transaction', null, filters, null);
    
    if (searchResults != null && searchResults.length > 0) {
        return true;
    } else {
        return false;
    }
}
