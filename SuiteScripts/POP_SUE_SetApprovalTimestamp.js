/*
 ***********************************************************************
 *
 * The following JavaScript code is created by ERP Guru,
 * a NetSuite Partner. It is a SuiteFlex component containing custom code
 * intented for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": ERP Guru shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:		ERP Guru inc., www.erpguru.com
 * Author:		pablo.herrera-batz@erpguru.com
 * File:		POP_SUE_SetApprovalTimestamp.js
 * Date:		Wed Jun 19 2013 13:20:25 GMT-0400 (EDT)
 ***********************************************************************/
/**
 * The following function sets the current time on the approval timestamp field when the sales order is approved
 * @author pablo.herrera-batz@erpguru.com
 * @param {string} type : user event execution type
 * @return nothing
 */
function afterSubmit_setTimestamp(type){
    // we load the record because status could have been changed by another SUE script, and we won't have the accurate value if we do nlapiGetFieldValue()
    var salesorder = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
    
    if (type == 'create') {
        if (salesorder.getFieldValue('orderstatus') == PENDING_FULFILLMENT) { // call POP_LIB_SalesOrderAutomation.js
            updateRecord(salesorder);
        }
    } else if (type == 'edit') {
        // validate that the order status was changed (sales order was approved)
        if (salesorder.getFieldValue('orderstatus') == PENDING_FULFILLMENT && nlapiGetOldRecord().getFieldValue('orderstatus') != PENDING_FULFILLMENT) { // call POP_LIB_SalesOrderAutomation.js
            updateRecord(salesorder);
        }
    } else if (type == 'approve') {
        updateRecord(salesorder);
    }
}

/**
 * The following function sets the current time on the approval timestamp field when the sales order is approved
 * @author pablo.herrera-batz@erpguru.com
 * @param {nlobjRecord} salesorder : current sales order
 * @return nothing
 */
function updateRecord(salesorder){
    salesorder.setFieldValue('custbody_approval_timestamp', new Date().getTime()); // current server time
    try {
        nlapiSubmitRecord(salesorder);
    } catch (e) {
        logError(e, 'sales order could not be update', DEFAULT_EMAIL_AUTHOR); // call POP_LIB_SalesOrderAutomation.js
    }
}
