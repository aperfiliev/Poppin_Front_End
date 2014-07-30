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
 * Date:		Thu Nov 29 2012 08:45:04 GMT-0500 (EST)
 ***********************************************************************/
// promo code values
var ASSORTED_GEL_INK_PENS_PROMO_CODE = 48; // 9:sandobx , 48:prod
var ASSORTED_GEL_INK_PENS_ITEM_ID = 608;

var ASSORTED_GEL_INK_PENS_REASON = 'The item "Assorted Gel Pen, Box Of 6" must be added manually because of "MustHavePoppin" promotion\n';

/**
 * The following checkts the "needs manual resolution" checkbox and adds a reason why it needs manual resolution
 * @author pablo.herrera-batz@erpguru.com
 * @param {String} type : user event execution script
 * @return nothing
 */
function beforeSubmit_checkManualResolution(type){
    if (type == 'create') {
        var promocode = nlapiGetFieldValue('couponcode');
        if (promocode != null && promocode == ASSORTED_GEL_INK_PENS_PROMO_CODE) {
            // check manual resolution
            nlapiSetFieldValue('custbody_needs_manual_resolution', 'T');
            // append reason in "reason for pending approval" field
            var reason = nlapiGetFieldValue('custbody_reason_pending_approval');
            if (reason == null || reason == '') {
                reason = ASSORTED_GEL_INK_PENS_REASON;
            } else {
                reason += '\n' + ASSORTED_GEL_INK_PENS_REASON;
            }
            nlapiSetFieldValue('custbody_reason_pending_approval', reason);
        }
    }
}
