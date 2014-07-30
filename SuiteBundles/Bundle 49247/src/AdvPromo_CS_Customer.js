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

var translates = [];
translates.push(new TranslateMember('error.customer.select', 'ERROR_SELECT_CUSTOMER', 'Please select at least one customer from the list'));
var TRANS_CS_Customer = new TranslateHelper(translates);

function pageInit(type)
{
	var customerIdMultiselect;
	if (customerIdMultiselect = nlapiGetField('custpage_advpromo_edit_customer_multiselect'))
	{
		var customers = JSON.parse(nlapiGetFieldValue('custpage_advpromo_customers_id'));
		nlapiSetFieldValues('custpage_advpromo_edit_customer_multiselect', customers);
	}
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

/********************************
 * Add Customer functions
 * 
 * 
 * 
 * 
 */

function addCustomerId(){
	var customerIds = nlapiGetFieldValues('custpage_advpromo_add_customer_multiselect');
	var customerNames = nlapiGetFieldTexts('custpage_advpromo_add_customer_multiselect');

	var noOfRecords = objectKeys(window.parent.AdvPromo.PromotionCs.arr).length;	
	var newObjectId = noOfRecords + 1 + '_newid';				

	if(customerIds.length != 0){
		// object declaration of fields
		var custObj = {}; 

		//populate fields of object
		custObj.promocode = window.parent.nlapiGetFieldValue('code');
		custObj.type = 2;	// Add customer id is type 2	
		custObj.operation = 'A';
		custObj.customerIds = customerIds;
		custObj.customerNames = customerNames;

		addCustomerIdToObject(custObj);

		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	}else{
		alert(TRANS_CS_Customer.ERROR_SELECT_CUSTOMER);
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


function addCustomerIdToObject(obj, groupObj){
	switch(obj.type){
	case 2: // customer record		
		var selectedCustomers = "";
		for (elem in obj.customerNames){

			if(selectedCustomers == "") {
				selectedCustomers = obj.customerNames[elem];
			}else{ 
				selectedCustomers = selectedCustomers + " or " + obj.customerNames[elem];
			}
		}			   

		var noOfRecords = objectKeys(window.parent.AdvPromo.PromotionCs.arr).length;
		var newObjectId = noOfRecords + 1 + '_newid';
		window.parent.AdvPromo.PromotionCs.arr[newObjectId] = {};
		window.parent.AdvPromo.PromotionCs.arr[newObjectId].promocode = nlapiGetFieldValue('code');
		window.parent.AdvPromo.PromotionCs.arr[newObjectId].type = 2;	// Add customer id is type 2	
		window.parent.AdvPromo.PromotionCs.arr[newObjectId].operation = 'A';
		window.parent.AdvPromo.PromotionCs.arr[newObjectId].savesearchId = obj.customerIds;

		window.parent.AdvPromo.PromotionCs.insertCustomerIds(selectedCustomers, 2, newObjectId);
		break;
	}
}


/********************************
 * Edit Customer functions
 * 
 * 
 * 
 * 
 */

function editCustomerId(){
	//get selected values of the user
	var customerIds = nlapiGetFieldValues('custpage_advpromo_edit_customer_multiselect');
	var customerNames = nlapiGetFieldTexts('custpage_advpromo_edit_customer_multiselect');
	var row = nlapiGetFieldValue('custpage_advpromo_rownumgroup');
	var groupId = nlapiGetFieldValue('custpage_advpromo_group_id');
	if(!customerIds || customerIds == null || customerIds == ''){
		alert(TRANS_CS_Customer.ERROR_SELECT_CUSTOMER);
		return;
	}	
	var groupObj = {};
	groupObj.row = row;
	groupObj.groupId = groupId;
	groupObj.customerIds = customerIds;
	groupObj.customerNames = customerNames;

	window.parent.AdvPromo.PromotionCs.syncEditToListObject( 2, groupObj);	// type 2 = customer Id		
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}




