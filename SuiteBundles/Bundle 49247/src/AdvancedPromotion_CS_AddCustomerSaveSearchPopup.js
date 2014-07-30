/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Dec 2011     dembuscado		Client Script for AdvancedPromotion_SL_AddCustomerSaveSearchPopup_SS.js
 *
 */

/**
 * @param {String} type Access mode: create, copy, edit
 * @return {void}
 */

var TRANS_CS_AddCustomerSaveSearchPopup = {};
function init_CS_AddCustomerSaveSearchPopup() {
	var translates = [];
	translates.push(new TranslateMember('error.customer.ss.exists', 'SEARCH_EXISTS', 'Customer Saved Search already exists in the sublist'));
	translates.push(new TranslateMember('error.customer.select', 'SELECT_CUSTOMER', 'Please select at least one customer from the list'));
	TRANS_CS_AddCustomerSaveSearchPopup = new TranslateHelper(translates);
}

var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_AddCustomerSaveSearchPopup);
if (TranslateInit) TranslateInit();

function objectKeys(obj) {
	if (!obj) return [];
	if ((($.browser.msie) && ($.browser.version < 9)) || 
		(($.browser.safari) && ($.browser.version < 5))) {
		var a = [];
		$.each(obj, function(k){ a.push(k);});
		return a;
	} else {
		try {
			return (obj) ? Object.keys(obj) : [];
		} catch (e) { // fallback
			var a = [];
			$.each(obj, function(k){ a.push(k);});
			return a;
		}
	}
}

function commitAddRow(){

	var desc = nlapiGetFieldValue('custpage_advpromo_add_customer_savedsearch_description');
	var savesearchId = nlapiGetFieldValue('custpage_advpromo_add_customer_savedsearch_dropdown');
	var savesearchLabel = nlapiGetFieldText('custpage_advpromo_add_customer_savedsearch_dropdown'); 

	var noOfRecords = objectKeys(window.parent.AdvPromo.PromotionCs.arr).length;

	sidKey = 'customersid';


	if(!window.parent.AdvPromo.PromotionCs.globalParam[sidKey].hasOwnProperty(savesearchId)){
		//add new record to arr
		var newObjectId = noOfRecords + 1 + '_newid';
		var saveSearchObj = {};
		saveSearchObj.promocode = window.parent.nlapiGetFieldValue('code');
		saveSearchObj.description = desc;
		saveSearchObj.savesearchId = savesearchId
		saveSearchObj.saveSearchLabel = savesearchLabel;
		saveSearchObj.type = 1;	// Add customer saved search is type 1	
		saveSearchObj.operation = 'A';

		window.parent.AdvPromo.PromotionCs.globalParam[sidKey][savesearchId]= savesearchId;

		window.parent.AdvPromo.PromotionCs.addToObject(saveSearchObj, newObjectId, null);	// there is no groupObj when type is 2 

		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	}else{
		alert(TRANS_CS_AddCustomerSaveSearchPopup.SEARCH_EXISTS);
	}

	//validate if 

}

/*
 * 
 */
function cancelEligibilityCustomer(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function getGroupNumber(){

	return Math.floor(Math.random()*1000001);	// temporary number generator

}


function randomString(length) {
	var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	var rand = 0;
	var retval = '';
	var i = 0;
	var idx = 0;
	for (i = 0; i < length; i++) {
		idx = Math.floor(chars.length * Math.random());
		retval = retval + chars[idx];
	}
	return retval;
}

function addCustomerId(){
	var customerIds = nlapiGetFieldValues('custpage_advpromo_add_customer_multiselect');
	var customerNames = nlapiGetFieldTexts('custpage_advpromo_add_customer_multiselect');

	var noOfRecords = objectKeys(window.parent.AdvPromo.PromotionCs.arr).length;	
	var newObjectId = noOfRecords + 1 + '_newid';				
	//note: nlapiGetFieldTexts and nlapiGetFieldValues have inconsistent results for empty multiselect fields.
	// so this is the safest test until the inconsistency is fixed. ( even the simple ! fails sometimes.
	if(!customerIds || customerIds == null || customerIds == ''){
		alert(TRANS_CS_AddCustomerSaveSearchPopup.SELECT_CUSTOMER);
		return;
	}
	// object declaration of fields
	var custObj = {}; 
	//populate fields of object
	custObj.promocode = window.parent.nlapiGetFieldValue('code');
	custObj.type = 2;	// Add customer id is type 2	
	custObj.operation = 'A';
	custObj.customerIds = customerIds;
	custObj.customerNames = customerNames;

	window.parent.AdvPromo.PromotionCs.addCustomerIdToObject(custObj);

	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

