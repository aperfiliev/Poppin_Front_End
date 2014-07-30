/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Feb 2012     dembuscado
 *
 */

/**
 * @param {String} type Access mode: create, copy, edit
 * @return {void}
 */

var TRANS_CS_CustomerSearch = {};
function init__CS_CustomerSearch() {
	var translates = [];
	translates.push(new TranslateMember('error.customer.ss.exists', 'ERROR_CUST_SEARCH_EXISTS', 'Customer Saved Search already exists in the sublist'));
	TRANS_CS_CustomerSearch = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init__CS_CustomerSearch);
if (TranslateInit) TranslateInit();


function pageInit(type){

}

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


/*
 * Add functions to customer saved search
 * 
 * 
 */

function commitAddRow(){

//	var desc = nlapiGetFieldValue('custpage_advpromo_add_customer_savedsearch_description');
//	var savesearchId = nlapiGetFieldValue('custpage_advpromo_add_customer_savedsearch_dropdown');
//	var savesearchLabel = nlapiGetFieldText('custpage_advpromo_add_customer_savedsearch_dropdown'); 

//	var noOfRecords = Object.keys(window.parent.AdvPromo.PromotionCs.arr).length;

//	//add new record to arr
//	var newObjectId = noOfRecords + 1 + '_newid';
//	var saveSearchObj = {};
//	saveSearchObj.promocode = window.parent.nlapiGetFieldValue('code');
//	saveSearchObj.description = desc;
//	saveSearchObj.savesearchId = savesearchId
//	saveSearchObj.saveSearchLabel = savesearchLabel;
//	saveSearchObj.type = 1;	// Add customer saved search is type 1	//A dge
//	saveSearchObj.operation = 'A';

//	addToObject(saveSearchObj, newObjectId, null);	// there is no groupObj when type is 2 

//	var theWindow = window.parent.Ext.WindowMgr.getActive();
//	theWindow.close();

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
		saveSearchObj.savesearchId = savesearchId;
		saveSearchObj.saveSearchLabel = savesearchLabel;
		saveSearchObj.type = 1;	// Add customer saved search is type 1	//A dge
		saveSearchObj.operation = 'A';

		window.parent.AdvPromo.PromotionCs.globalParam[sidKey][savesearchId]= savesearchId;

		addToObject(saveSearchObj, newObjectId, null);	// there is no groupObj when type is 2 

		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	}else{
		alert(TRANS_CS_CustomerSearch.ERROR_CUST_SEARCH_EXISTS);
	}
}

/*
 * 
 */
function cancelCustomerAdd(){
	//alert("cancel was clicked!!!!")
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}//end
function addToObject(obj, idd, groupObj){

	window.parent.AdvPromo.PromotionCs.arr[idd] = {};

	// fields common to both types
	window.parent.AdvPromo.PromotionCs.arr[idd].promocode = obj.promocode;
	window.parent.AdvPromo.PromotionCs.arr[idd].operation = obj.operation;
	window.parent.AdvPromo.PromotionCs.arr[idd].type = obj.type;


	switch(obj.type){
//	case 1:	// customer Id	//D dge
	case 2: // customer Id //A dge
		var groupId = obj.groupId;
		window.parent.AdvPromo.PromotionCs.arr[idd].groupId = obj.groupId;

		// object declaration of fields
		window.parent.AdvPromo.PromotionCs.arr[idd].group = {};  
		window.parent.AdvPromo.PromotionCs.arr[idd].group[groupId] = {};
		window.parent.AdvPromo.PromotionCs.arr[idd].group[groupId].customerIds = {};
		window.parent.AdvPromo.PromotionCs.arr[idd].group[groupId].customerNames = {};


		// parse the customer Names with or in between objects // make this a global subroutine later which will return selected Customer string
		var selectedCustomers = "";
		for (elem in groupObj.customerNames){
			if(selectedCustomers == "") {
				selectedCustomers = groupObj.customerNames[elem];
			}else{ 
				selectedCustomers = selectedCustomers + " or " + groupObj.customerNames[elem];
			}			   
		}
		window.parent.AdvPromo.PromotionCs.arr[idd].selectedCustomers = selectedCustomers;	//string representation of selected customer in the sublist

		//populate fields of object
		window.parent.AdvPromo.PromotionCs.arr[idd].group[groupId].customerIds = groupObj.customerIds;
		window.parent.AdvPromo.PromotionCs.arr[idd].group[groupId].customerNames = groupObj.customerNames;

		break;
//		case 2: // customer saved search	//D dge
	case 1: // customer saved search	//A	dge
		window.parent.AdvPromo.PromotionCs.arr[idd].description = obj.description;
		window.parent.AdvPromo.PromotionCs.arr[idd].savesearchId = obj.savesearchId;
		window.parent.AdvPromo.PromotionCs.arr[idd].savesearchName = obj.saveSearchLabel;

		break;
	}

	window.parent.AdvPromo.PromotionCs.insertValues(window.parent.AdvPromo.PromotionCs.arr[idd], idd);
}


/*
 * Edit functions to customer saved search
 * 
 * 
 */


function commitRow(){
//	var desc = nlapiGetFieldValue('custpage_advpromo_description');
//	var idd = nlapiGetFieldValue('custpage_advpromo_idd');
//	var row = nlapiGetFieldValue('custpage_advpromo_rownum');
//	var savesearchId = nlapiGetFieldValue('custpage_advpromo_editcustomer');
//	var savesearchLabel = nlapiGetFieldText('custpage_advpromo_editcustomer'); 

//	window.parent.AdvPromo.PromotionCs.syncEditToListObject(1,[idd, row, desc, savesearchId, savesearchLabel]);	
//	var theWindow = window.parent.Ext.WindowMgr.getActive();
//	theWindow.close();



	var desc = nlapiGetFieldValue('custpage_advpromo_description');
	var idd = nlapiGetFieldValue('custpage_advpromo_idd');
	var row = nlapiGetFieldValue('custpage_advpromo_rownum');
	var savesearchId = nlapiGetFieldValue('custpage_advpromo_editcustomer');
	var savesearchLabel = nlapiGetFieldText('custpage_advpromo_editcustomer'); 

	sidKey = 'customersid';

	if(!window.parent.AdvPromo.PromotionCs.globalParam[sidKey].hasOwnProperty(savesearchId)){
		window.parent.AdvPromo.PromotionCs.globalParam[sidKey][savesearchId]= savesearchId;
		delete window.parent.AdvPromo.PromotionCs.globalParam[sidKey][window.parent.AdvPromo.PromotionCs.arr[idd].savesearchId];
		window.parent.AdvPromo.PromotionCs.syncEditToListObject(1,[idd, row, desc, savesearchId, savesearchLabel]);	
		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	}else{
		if(savesearchId == window.parent.AdvPromo.PromotionCs.arr[idd].savesearchId){
			window.parent.AdvPromo.PromotionCs.syncEditToListObject(1,[idd, row, desc, savesearchId, savesearchLabel]);	
			var theWindow = window.parent.Ext.WindowMgr.getActive();
			theWindow.close();
		}else{
			alert(TRANS_CS_CustomerSearch.ERROR_CUST_SEARCH_EXISTS);
		}
	}

}




