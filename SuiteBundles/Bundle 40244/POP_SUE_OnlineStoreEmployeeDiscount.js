/*
 ***********************************************************************
 *
 * The following JavaScript code is created by ERP Guru,
 * a NetSuite Partner. It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": ERP Guru shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:		ERP Guru inc., www.erpguru.com
 * Author:	    max-elie.salomon@erpguru.com
 * Date:	    11/03/2013
 *
 * File: POP_SUE_OnlineStoreEmployeeDiscount.js
 *
 * needs a custom record (customrecord_domain_pricing)
 * with fields: custrecord_domain, custrecord_price_level, custrecord_company
 *
 ***********************************************************************/
var WEBSTORE_FORM_SO = '143';		//form for cash sales
var WEBSTORE_FORM_INV = '144';		//form for invoices
var LOG_AUTHOR = -5;				//employee from which error log emails come from

/**
 * beforeLoadEmployeeDiscount() : enter the script
 * @author: max-elie.salomon@erpguru.com
 * 
 * @param: {string} type : NetSuite type
 * @param: {nlobjForm} form : current form
 *
 */
function beforeLoadCheckUser(type, form){

    var formID = nlapiGetFieldValue('customform');
    if (type == 'create' && (formID == WEBSTORE_FORM_SO || formID == WEBSTORE_FORM_INV)) {
    
        var currentUser = nlapiGetFieldValue('entity'); //0 when no one logged in webstore  
        if (currentUser != null && currentUser != '' && currentUser != '0') {
            var customerRec = nlapiLoadRecord('customer', currentUser);
            
            if (customerRec != null) {
                domainCheck(customerRec);
            }
        }
    }
}

/**
 * domainCheck() : is this customer from a known email domain? if so set his price level
 *
 * @author: max-elie.salomon@erpguru.com
 * @param: customerRec -> the customer currently in the webstore
 */
function domainCheck(customerRec){

    var emailAddress = customerRec.getFieldValue('email');
    if (emailAddress != null && emailAddress != '') {
        //get the domain from the email address
        var index = emailAddress.indexOf("@");
        var emailDomain = emailAddress.slice((index + 1), emailAddress.length);
        if (emailDomain != null && emailDomain != '') {
            //search through DomainPricing records for a match
            var filters = [];
            filters[0] = new nlobjSearchFilter('custrecord_domain', null, 'is', emailDomain); // email domain
            filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
            var columns = [];
            columns[0] = new nlobjSearchColumn('custrecord_price_level'); // priceLevel
            columns[1] = new nlobjSearchColumn('custrecord_company'); // company
            var searchResults = nlapiSearchRecord('customrecord_domain_pricing', null, filters, columns);
            
            if (searchResults != null) {
				verifyLastName(customerRec);		//set last name to ** if there is none
                setPriceLevelAndParent(searchResults, customerRec);
            }
        }
    }
}

/**
 * verifyLastName() : webstore allows creation of customers without a last name and
 * this later poses a problem in Netsuite where it cannot be submitted after modification,
 * due to a mandatory field not being set
 *
 * @author: max-elie.salomon@erpguru.com
 * @param: customerRec -> the customer currently in the webstore
 */
function verifyLastName(customerRec){
	var lastName = customerRec.getFieldValue('lastname');
	if (lastName==null||lastName==''){
		customerRec.setFieldValue('lastname', '**');
	}
}

/**
 * setPriceLevelAndParent(): set the price level
 *
 * @author: max-elie.salomon@erpguru.com
 * @param: searchResults -> search results (domain pricing record)
 * 				customerRec -> the customer currently in the webstore
 */
function setPriceLevelAndParent(searchResults, customerRec){
    var priceLevel = searchResults[0].getValue('custrecord_price_level');
    var parentCompany = searchResults[0].getValue('custrecord_company');
    
    var customerPriceLevel = customerRec.getFieldValue('pricelevel');
    var customerParentCompany = customerRec.getFieldValue('parent');
    
    //submit record if needed    
    if (customerPriceLevel != priceLevel || customerParentCompany != parentCompany) {
    
        customerRec.setFieldValue('pricelevel', priceLevel);
        //make sure we are not setting self as parent
        var currentUser = customerRec.getFieldValue('entityid');
        if (parentCompany != currentUser) {
            customerRec.setFieldValue('parent', parentCompany);
        }
        
        try {
            nlapiSubmitRecord(customerRec);
        } catch (err) {
            logError(err, 'could not update customer record', LOG_AUTHOR);
        }
    }
}

