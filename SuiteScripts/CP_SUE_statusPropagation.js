/*
 ***********************************************************************
 *
 * The following javascript code is created by ERP Guru,
 * a NetSuite Partner. It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": ERP Guru shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:		ERP Guru inc., www.erpguru.com
 * Author:		charles-antoine.dupont@erpguru.com
 * File:		CP_SUE_statusPropagation.js
 * Date:		13/09/2012
 *
 ***********************************************************************/
//used to classify the importance of status of entities
//lead =1, prospect =2, customer =3
var ENTITY_STATUS_ORDER_MAP = {
    7: 1,
    6: 1,
    21: 1,
    9: 2,
    18: 2,
    20: 2,
    8: 2,
    23: 2,
    26: 2,
    13: 3
};

/**
 * This script will propagate the status of customer through
 * its hierarchy whenever a customer is updated
 *
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} type
 */
function afterSubmit_propagateEntityStatusOn(type){

    var currentCustomer;
    
    if (type == "edit" || type == "create") {
        currentCustomer = nlapiGetNewRecord();
        propagateStatus(currentCustomer);
    }
    if (type == "xedit") {
        var currentCustomerId = nlapiGetRecordId();
        
        currentCustomer = nlapiLoadRecord("customer", currentCustomerId);
        propagateStatus(currentCustomer);
    }
}

/**
 * Driver of the status propagation script
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} currentCustomer
 */
function propagateStatus(currentCustomer){

    var status = currentCustomer.getFieldValue("entitystatus");
    
    var customerTree = getFullCustomerStatusTree(currentCustomer);
    
    processTree(customerTree, currentCustomer);
}

/**
 * Will start from the given customer and bubble up the new status
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} customerTree
 * @param {Object} currentCustomer
 */
function processTree(customerTree, currentCustomer){

    nlapiLogExecution("DEBUG", "processTree", "customerTree:" + JSON.stringify(customerTree) + "  customer:" + currentCustomer);
    
    var customerId = currentCustomer.getId();
    var customerSiblings = getSiblings(customerTree, customerId);
    var newStatus = currentCustomer.getFieldValue("entitystatus");
    
    var soldTo = nlapiGetFieldValue("custentity_related_soldto");
    var internalId = nlapiGetRecordId();
    var recordType = nlapiGetRecordType();
    
    while (currentCustomer != null) {
        var greatestSiblingStatus = isCustomerStatusGreaterOrEqualTo(customerSiblings, currentCustomer);
        
        nlapiLogExecution("DEBUG", "greatestSiblingStatus:", greatestSiblingStatus);
        nlapiLogExecution("DEBUG", "customerSiblings:", JSON.stringify(customerSiblings));
        
        if (greatestSiblingStatus != null && greatestSiblingStatus != "") {
            nlapiLogExecution("DEBUG", " if (greatestSiblingStatus != null) {", "currentCustomer:" + JSON.stringify(currentCustomer));
            
            //sets parent as current
            currentCustomer = adjustStatusOfParent(currentCustomer, greatestSiblingStatus);
            
            //refresh siblings
            customerSiblings = getSiblings(customerTree, currentCustomer.getId());
            
            
        } else {
            currentCustomer = null;
        }
    }
}

/**
 * Sets the status of the parent of the given customer.
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} customer
 * @param {Object} greatestSiblingStatus
 * @returns {Object} new customer object or null
 */
function adjustStatusOfParent(customer, greatestSiblingStatus){

    nlapiLogExecution("DEBUG", "", JSON.stringify(customer));
    
    var parentCustomer = customer.getFieldValue("parent");
    
    if (parentCustomer != null && parentCustomer != "") {
        var newCustomer = nlapiLoadRecord("customer", parentCustomer);
        newCustomer.setFieldValue("entitystatus", greatestSiblingStatus);
        
        nlapiSubmitRecord(newCustomer);
        nlapiLogExecution("DEBUG", "adjustStatusOfParent", JSON.stringify(newCustomer));
        //console.log("submit:" + newCustomer.getId()+" setToStatus:"+greatestSiblingStatus);
        return newCustomer;
    }
    
    return null;
}

/**
 * Returns the status of the current customer if it is equal or greater than the rest of its siblings
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} allSiblings
 * @param {Object} currentCustomer
 * @returns {integer} id of the status being returned, or null if no status returned
 */
function isCustomerStatusGreaterOrEqualTo(allSiblings, currentCustomer){

    if (allSiblings != null && allSiblings != "") {
        var currentCustomerStatusRating = ENTITY_STATUS_ORDER_MAP[currentCustomer.getFieldValue("entitystatus")];
        var highestRating = currentCustomerStatusRating;
        var highestStatus = currentCustomer.getFieldValue("entitystatus");
        
        //if for any sibling, its status is greater than the currentCustomer, do nothing, else, bubble up the status
        for (var i = 0; i < allSiblings.length; i++) {
            if (highestRating < ENTITY_STATUS_ORDER_MAP[allSiblings[i].status]) {
                highestRating = ENTITY_STATUS_ORDER_MAP[allSiblings[i].status];
                highestStatus = allSiblings[i].status;
            }
        }
    }
    
    //if there is no siblings or if the new status is greater than or equal to all siblings,
    //then status should be returned to be used for bubling up
    return highestStatus;
}


/**
 * Returns the siblings of the given customer id by using the tree object passed as a parameter
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} tree
 * @param {Object} targetCustomerId
 * returns {[object]} array of customer objects
 */
function getSiblings(tree, targetCustomerId){

    var siblings = null;
    
    if (tree.internalid != targetCustomerId) {
        //find targetCustomer 
        var rootNode = tree;
        
        if (rootNode.subcustomers != null && rootNode.subcustomers.length > 0) {
        
            for (var i = 0; i < rootNode.subcustomers.length; i++) {
                if (rootNode.subcustomers[i].internalid == targetCustomerId) {
                    siblings = rootNode.subcustomers;
                } else {
                    var nextNode = rootNode.subcustomers[i];
                    
                    //could be recursive starting here if trees were bigger 
                    if (nextNode.subcustomers != null &&
                    nextNode.subcustomers.length > 0) {
                        for (var j = 0; j < nextNode.subcustomers.length; j++) {
                            if (nextNode.subcustomers[j].internalid == targetCustomerId) {
                                siblings = nextNode.subcustomers;
                            }
                        }
                    }
                }
            }
        }
    }
    
    return siblings;
}


/**
 * Returns the root customer of the tree of the given customer
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} customer
 * @returns {nlobj} Record of the root entity
 */
function getRoot(customer){
    var rootCustomer = null;
    
    if (isRoot(customer)) {
        rootCustomer = customer;
    } else {
        var parentCustomerId = customer.getFieldValue("parent");
        var parentCustomer = nlapiLoadRecord("customer", parentCustomerId);
        
        while (!isRoot(parentCustomer) || parentCustomer == null) {
            if (parentCustomerId != null && parentCustomerId != "") {
                parentCustomer = nlapiLoadRecord("customer", parentCustomerId);
                parentCustomerId = parentCustomer.getFieldValue("parent");
            }
        }
        
        rootCustomer = parentCustomer;
    }
    
    return rootCustomer;
}

/**
 * If a customer's parent company field and sold to field are null, it is the root
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} customer
 * @returns {Boolean} is the customer a [crown/root] parent?
 */
function isRoot(customer){

    if (customer.getFieldValue("parent") == null &&
    (customer.getFieldValue("custentity_related_soldto") == null ||
    customer.getFieldValue("custentity_related_soldto") == customer.getId())) {
        return true;
    }
    
    return false;
}

/**
 * Main method (driver) to generate the full customer tree of any given
 * parent or child customer part of a tree.
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} currentCustomer
 */
function getFullCustomerStatusTree(currentCustomer){

    var rootCustomer = getRoot(currentCustomer);
    
    return getCustomerObject(rootCustomer, getSubCustomersOf(rootCustomer));
}

/**
 * Core method used to generate the customer tree.
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} customer
 * @param {Object} subcustomers
 */
function getCustomerObject(customer, subcustomerRecordArray){

    var customerId = customer.getId();
    var customerStatus = customer.getFieldValue("entitystatus");
    var customerParent = customer.getFieldValue("parent");
    var customerSoldTo = customer.getFieldValue("custentity_related_soldto");
    
    var customerNode = {
        internalid: customerId,
        status: customerStatus,
        parent: customerParent,
        soldto: customerSoldTo,
        subcustomers: []
    };
    
    if (subcustomerRecordArray != null && subcustomerRecordArray != "" && subcustomerRecordArray.length != 0) {
        for (var i = 0; i < subcustomerRecordArray.length; i++) {
            var subcustomer = getCustomerObject(subcustomerRecordArray[i], getSubCustomersOf(subcustomerRecordArray[i]));
            customerNode["subcustomers"].push(subcustomer);
        }
    }
    
    return customerNode;
}

/**
 * Returns the list of children customers of the given customer.
 * @author charles-antoine.dupont@erpguru.com
 * @param {Object} customer
 * @returns {[nlobjRecord]} Array of customer records
 */
function getSubCustomersOf(customer){

    var filters = [];
    filters.push(new nlobjSearchFilter("internalid", null, "is", customer.getId()));
    
    var columns = [];
    columns.push(new nlobjSearchColumn("internalid", "subcustomer"));
    columns.push(new nlobjSearchColumn("entitystatus", "subcustomer"));
    
    var search = nlapiCreateSearch("customer", filters, columns);
    var searchResultSet = search.runSearch();
    
    var searchResults = searchResultSet.getResults(0, 1000);
    var resultsRecords = [];
    
    
    if (searchResults != null && searchResults != "") {
        for (var i = 0; i < searchResults.length; i++) {
        
            var childId = searchResults[i].getValue("internalid", "subcustomer");
            
            if (childId != "" && childId != null) {
                resultsRecords.push(nlapiLoadRecord("customer", childId));
            }
        }
    }
    
    
    return resultsRecords;
}
