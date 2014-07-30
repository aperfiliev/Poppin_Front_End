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
 * Date:     Mon Oct 01 2012 11:11:12 GMT-0400 (EDT)
 *
 * Reviewed by:
 * Review Date:
 *
 ***********************************************************************/
// Sales Order
var DOT_COM_DISTRIBUTION = 4; // location is dot com distribution
var WEB_POPPIN_SHOP = 'NLWebStore'; // source is web
var WEB_POPPIN_SHOP_SUE = 'Web (Poppin Shop)';
var PENDING_APPROVAL = 'SalesOrd:A';
var PENDING_APPROVAL_SUE = 'A'; // pending approval for sue script
var PENDING_FULFILLMENT = 'B';
var PENDING_BILLING = 'SalesOrd:F';

// Payment
var PAYPAL = 8;
var VISA = 5;
var AMRICAN_EXPRESS = 6;
var MARSTER_CARD = 4;
var DISCOVER = 3;

// Email
var DEFAULT_EMAIL_AUTHOR = 100897; // 100897 : 3PL Integration
var LOGGING_EMAIL = 'logging@erpguru.com';

var CUSTOMER_TO_EXCLUDE = 113148; // SO from this customer have to be manually approved, 113148 : Account Test Order
/**
 * This function verifies if usage metering is getting dangerously low
 * If so, it schedules another execution of the script, then throws an error to kill the current execution
 * @param {int} maxUnits : minimum number of units that should be left in the metering
 * @param {String} paramName : name of the script parameter
 * @param {int} paramValue : value of the script parameter
 * @return nothing
 */
function verifyMetering(maxUnits, paramName, paramValue){
    if (nlapiGetContext().getExecutionContext() == 'scheduled' && nlapiGetContext().getRemainingUsage() <= maxUnits) {
        nlapiLogExecution('audit', 'verifyMetering()', 'Metering low, scheduling another execution');
        var params = {
            paramName: currentRecordId
        }; // script parameter
        nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), params); // 20 Units
        throw nlapiCreateError('METERING_LOW_ERR_CODE', 'Usage metering low, another execution has been scheduled', true);
    }
}

/**
 * Logs an error in NetSuite, whether it's and nlobjError object or a plain Javascript error.
 *
 * @param {Object} err The nlobjError object or the plain Javascript error.
 * @param {Object} title The title that will be given to the error log.
 * @param {Object} emailAuthorID The internal ID of the active employee record which will be used as
 * the author of the emailed error log.
 */
function logError(err, title, emailAuthorID){
    var msg = [];
    
    if (err.getCode != null) {
        msg.push('[SuiteScript exception]');
        msg.push('Error Code: {0}' + err.getCode());
        msg.push('Error Data: {0}' + err.getDetails());
        msg.push('Error Ticket: {0}' + err.getId());
        if (err.getInternalId) {
            msg.push('Record ID: {0}' + err.getInternalId());
        }
        if (err.getUserEvent) {
            msg.push('Script: {0}' + err.getUserEvent());
        }
        msg.push('User: {0}' + nlapiGetUser());
        msg.push('Role: {0}\n' + nlapiGetRole());
        
        var stacktrace = err.getStackTrace();
        if (stacktrace) {
            msg.push('Stack Trace');
            msg.push('\n---------------------------------------------');
            
            if (stacktrace.length > 20) {
                msg.push('**stacktrace length > 20**');
                msg.push(stacktrace);
            } else {
                msg.push('**stacktrace length < 20**');
                for (var i = 0; stacktrace != null && i < stacktrace.length; i++) {
                    msg.push(stacktrace[i]);
                }
            }
        }
    } else {
        msg.push('[javascript exception]');
        msg.push('User: {0}' + nlapiGetUser());
        msg.push(err.toString());
    }
    
    nlapiLogExecution('error', title, msg);
    
    //MG Add to title the company ID and environment type, and email the error to our logging email.
    if (emailAuthorID != null && emailAuthorID != '' && !isNaN(emailAuthorID)) {
        var context = nlapiGetContext();
        var companyId = context.getCompany();
        var environment = context.getEnvironment();
        title = "An Error Has Occurred - " + title + '(NS Acct #' + companyId + ' ' + environment + ')';
        nlapiSendEmail(emailAuthorID, LOGGING_EMAIL, title, msg); // 10 Units
    }
}
