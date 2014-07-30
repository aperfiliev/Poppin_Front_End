/*
 ***********************************************************************
 *
 * The following javascript code is created by ERP Guru Inc.,
 * a NetSuite Partner. It is a SuiteFlex component containing custom code
 * intented for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": ERP Guru shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Author: charles-antoine.dupont@erpguru.com
 * File: POP_SUE_populateShippingLink.js
 * Date: August 29th, 2012
 * Last Updated: September 20th, 2012
 ***********************************************************************/
/**
 * This method populates the tracking info for the related item fulfillment / sales order
 * @author charles-antoine.dupont@erpguru.com
 * @param {String} access mode of netsuite
 *
 */
function afterSubmit_populateShippingLink(type){

    if (type == "create" || type == "edit" || type == "ship") {
    
        var itemFufillmentId = nlapiGetRecordId();
        var salesOrderId = nlapiGetFieldValue("createdfrom");
        
        
        var filters = [];
        filters.push(new nlobjSearchFilter("internalid", null, "is", itemFufillmentId));
        filters.push(new nlobjSearchFilter("trackingnumbers", null, "isnotempty"));
        
        var columns = [];
        columns.push(new nlobjSearchColumn("trackingnumbers"));
        
        var ifSearch = nlapiCreateSearch("itemfulfillment", filters, columns);
        var ifSearchResultSet = ifSearch.runSearch();
        var ifSearchResults = ifSearchResultSet.getResults(0, 1000);
        
        //use dictionary to easily avoid duplicates
        var trackNumberDict = {};
        //all tracking codes
        var trackingInfos = [];
        
        if (ifSearchResults != null && ifSearchResults != "") {
        
            //store unique tracking numbers
            for (var i = 0; i < ifSearchResults.length; i++) {
            
                var trackingNumbers = ifSearchResults[i].getValue("trackingnumbers");
                var trackingNumbersArr = trackingNumbers.split("<BR>");
                
                for (var j = 0; j < trackingNumbersArr.length; j++) {
                    trackNumberDict[trackingNumbersArr[j]] = trackingNumbersArr[j];
                    nlapiLogExecution("AUDIT", "trackingNumbersArr[j]", trackingNumbersArr[j]);
                }
                
            }
            
            //convert tracking numbers to individual html links or simple order numbers
            for (var number in trackNumberDict) {
                trackingInfos.push(getHtmlLinkFor(number));
            }
            
            try {
                nlapiSubmitField("salesorder", salesOrderId, "custbody_tracking_info", trackingInfos.toString());
            } catch (e) {
                nlapiLogExecution("DEBUG", "itemFufillment not on sales order", e);
            }
        }
    }
    
}

/**
 * Returns HTML code
 * @author charles-antoine.dupont@erpguru.com
 * @param {String} trackingNumber
 * @return {String} link for tracking number
 */
function getHtmlLinkFor(trackingNumber){

    var url = "";
    var trackingInfo = trackingNumber;
    
    if (isUpsTrackingNumber(trackingNumber)) {
        url = "http://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=" + trackingNumber;
    } else if (isUspsTrackingNumber(trackingNumber)) {
        url = "https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=" + trackingNumber;
    } else if (isFedexTrackingNumber(trackingNumber)) {
        url = "http://www.fedex.com/Tracking?action=track&tracknumbers=" + trackingNumber;
    } else if (isDhlTrackingNumber(trackingNumber)) {
        url = "http://www.dhl.com/content/g0/en/express/tracking.shtml?brand=DHL&AWB=" + trackingNumber;
    }
    
    nlapiLogExecution("AUDIT", "trackingNumber", trackingNumber);
    
    if (url != "") {
        trackingInfo = "<a href=\"" + url + "\" target=\"_blank\">" + trackingNumber + "</a>";
    }
    
    nlapiLogExecution("AUDIT", "trackingInfo", trackingInfo);
    
    return trackingInfo;
}

/**
 * is a FedexTrackingNumber?
 * @author charles-antoine.dupont@erpguru.com
 * @param {String} trackingNumber
 * @return {Boolean} answers the question
 */
function isFedexTrackingNumber(trackingNumber){
    if (trackingNumber.length == 12 || trackingNumber.length == 15) {
        return true;
    }
    return false;
}

/**
 * is a UpsTrackingNumber?
 * @author charles-antoine.dupont@erpguru.com
 * @param {String} trackingNumber
 * @return {Boolean} answers the question
 */
function isUpsTrackingNumber(trackingNumber){
    if (trackingNumber.substring(0, 2) == "1Z" ||
    trackingNumber.substring(0, 2) == "MI" ||
    (trackingNumber.length >= 22 && trackingNumber.length <= 34)) {
        return true;
    }
    return false;
}

/**
 * is a UspsTrackingNumber?
 * @author charles-antoine.dupont@erpguru.com
 * @param {String} trackingNumber
 * @return {Boolean} answers the question
 */
function isUspsTrackingNumber(trackingNumber){
    var twoLastChars = trackingNumber.substring(trackingNumber.length - 2, trackingNumber.length);
    
    if (trackingNumber.length == 20 || twoLastChars == "US") {
        return true;
    }
    return false;
}

/**
 * is a DhlTrackingNumber?
 * @author charles-antoine.dupont@erpguru.com
 * @param {String} trackingNumber
 * @return {Boolean} answers the question
 */
function isDhlTrackingNumber(trackingNumber){
    if (trackingNumber.length == 10) {
        return true;
    }
    return false;
}
