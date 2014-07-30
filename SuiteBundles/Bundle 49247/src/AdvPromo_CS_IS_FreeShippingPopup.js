// show the progress bar before pageInit()
Ext.MessageBox.show({
	title: 'Please Wait',
	msg: 'Loading page...',
	progressText: '0% completed',
	progress:true,
	closable:false,
	width:300
});


/**
 * @param {String} type Access mode: create, copy, edit
 * @return {void}
 */

var TRANS_CS_IS_Discount_AddShippingPopup = {};    
function init_CS_IS_Discount_AddShippingPopup() {
	var translates = [];
	translates.push(new TranslateMember('label.freeshipping', 'TEXT_FREE_SHIPPING', 'Free shipping'));
	translates.push(new TranslateMember('text.and', 'TEXT_AND', 'and'));
	translates.push(new TranslateMember('text.on', 'TEXT_ON', 'on'));
	translates.push(new TranslateMember('text.off', 'TEXT_OFF', 'Off'));
	translates.push(new TranslateMember('error.item.freeship.noselection', 'ERROR_FREESHIP_NOSELC', 'Please select value(s) for: Item, Shipping Method'));
	translates.push(new TranslateMember('error.item.freeship.noselection_ss', 'ERROR_FREESHIP_NOSELC_SS', 'Please select value(s) for: Item Saved Search, Shipping Method'));
	translates.push(new TranslateMember('error.item.freeship.select', 'ERROR_ITEM_FREESHIP_SELC', 'Please select at least one inventory or assembly item from the list.'));
	translates.push(new TranslateMember('error.shipping.freeship.select', 'ERROR_SHIPPING_FREESHIP_SELC', 'Please select at least one shipping method from the list.'));
	translates.push(new TranslateMember('error.shipping.freeship.select_ss', 'ERROR_SS_ISFS_SELC', 'Select one saved search from the list to continue.'));
	translates.push(new TranslateMember('error.item.freeship.invalid', 'ERROR_ITEM_FREESHIP_INVALID', 'Free item shipping only applies to inventory and assembly items. Remove non-inventory and non-assembly items to continue.'));
	translates.push(new TranslateMember('error.shipping.select', 'ERROR_SHIPPING_SELC', 'Please select at least one method from the list'));
	TRANS_CS_IS_Discount_AddShippingPopup = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_Discount_AddShippingPopup);
if (TranslateInit) TranslateInit();



var valueBox;
var currencyList;
function pageInit(type) {
	
	// determine field adjustment based on mode (item or saved search)
	var isSavedSeachMode = nlapiGetFieldValue('custpage_advpromo_isfshipping_ss');
	if(isSavedSeachMode == 'T'){
		$("#main_form > table > tbody > tr:nth-child(5) > td > table > tbody > tr > td:nth-child(1)").css("padding", "0 0 0 14px");
		$(".dropdownDiv").css("height", "400px");
	}
	else{
		//popup window will be exclusive for isfshipping use.
	   	$(".textareainput").css("height", "400px");
	   	$(".dropdownDiv").css("height", "400px");	
	}
   
	// taken from http://dev.sencha.com/deploy/ext-4.0.0/examples/message-box/msg-box.html
   	var f = function(v){
		return function(){
		    if(v == 12){
		    	Ext.MessageBox.hide.defer(100, Ext.MessageBox);
		    }
		    else{
		        var i = v/11;
		        Ext.MessageBox.updateProgress(i, Math.round(10*i)+'% completed');
		    }
		};
   	};
   	
   	for(var i = 1; i < 13; i++){
   		setTimeout(f(i), i*100);
   	}
   	
   	Ext.get("div__body").dom.style.visibility="visible";
}

/*
 * 
 */
function cancelDiscountShipping(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function addIsFreeShipping(){
   var shippingMethod = [];

	var shipMethodIds = [];
	var shipMethodNames = [];
	var shippingObjArr = [];
	
	//selected shipping
	shipMethodNames = nlapiGetFieldTexts('custpage_advpromo_shipping_method_multiselect');
	shipMethodIds = nlapiGetFieldValues('custpage_advpromo_shipping_method_multiselect');
	var savedSearchId =  nlapiGetFieldValue('custpage_advpromo_itemsearch_dropdown_edit');
	var savedSearchName = nlapiGetFieldText('custpage_advpromo_itemsearch_dropdown_edit');
	//selected items
	var itemNames = nlapiGetFieldTexts('custpage_advpromo_items_mselect');
	var itemIds = nlapiGetFieldValues('custpage_advpromo_items_mselect');
	//rowNumber (for edit mode)
	var rowNumber = nlapiGetFieldValue('custpage_advpromo_isfshipping_row');
	//saved search mode
	var ssMode = (nlapiGetFieldValue('custpage_advpromo_isfshipping_ss') == 'T');
	
	//make sure that savedSearchId and itemIds are exclusively OR.
	if(!shipMethodIds || shipMethodIds == null || shipMethodIds == ''){
		if(!ssMode){
			if(!itemIds || itemIds == null || itemIds == ''){
				alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_FREESHIP_NOSELC); 
				return;
			}
		}
		else if(!savedSearchId || savedSearchId == null || savedSearchId == '' || savedSearchId == -1) {
				alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_FREESHIP_NOSELC_SS);
				return;
		}
		
		alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_SHIPPING_FREESHIP_SELC);
		return;
	}
	
	if(ssMode){
		itemIds = null;		
		if(!savedSearchId || savedSearchId == null || savedSearchId == '' || savedSearchId == -1){
			alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_SS_ISFS_SELC);			
			return;
		}		
	}
	else{
		savedSearchId = null;
	}
	

	//note: nlapiGetFieldTexts and nlapiGetFieldValues have inconsistent results for empty multiselect fields.
	// so this is the safest test until the inconsistency is fixed. even the simple ! fails sometimes.
	// at least 1 item must be selected
	// at least 1 shipping method must be selected
	
	
	if(!ssMode){
		if(!itemIds || itemIds == null || itemIds == ''){
			alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_ITEM_FREESHIP_SELC);
			return;
		}
			// items must be assembly and inventory items only
		if(!hasValidItemsOnly(itemIds)){
			alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_ITEM_FREESHIP_INVALID);
			return;
		}
	}
		
	var isfShippingObj = {}; // item specific freeshipping parameter container
	
	//save the selections
	if(!rowNumber){
		isfShippingObj.op = 'N';
	}
	else{
		isfShippingObj.op = 'E';
	}
	isfShippingObj.itemIds = itemIds;
	isfShippingObj.shipIds = shipMethodIds;
	isfShippingObj.itemLabels = itemNames;
	isfShippingObj.shipLabels = shipMethodNames;
	isfShippingObj.searchId = savedSearchId;
	isfShippingObj.searchName = savedSearchName;
	
	// get the texts for displaying the selected items/shipping combination
	var shipOr = "";
	var itemOr = "";
	var methodNum = shipMethodNames.length;

	//disjunct shipping methods into one line
	for (var j = 0; j < methodNum; j++){
		if(shipOr == "") {
			shipOr = " " + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_ON + " "  + shipMethodNames[j];
		}else{ 
			shipOr = shipOr + " / " + shipMethodNames[j];
		}
	}
	var textDisplay =  '100% ' + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_OFF  + shipOr;
	
	//disjunct items in methods into multiple lines
	var nameDisplay  = '';
	if(ssMode){
		nameDisplay = TRANS_CS_IS_Discount_AddShippingPopup.TEXT_FREE_SHIPPING + ' ' + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_ON + ' ' + savedSearchName; //saved search name
	}
	else{
		
		var itemNum = itemIds.length;
		for (var k = 0; k < itemNum; k++){
			if(itemOr == "") {
				itemOr = " " + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_ON + " "  + itemNames[k];
			}else{ 
				itemOr = itemOr + " " + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_AND  + " " + itemNames[k];
			}
		}		
		nameDisplay = TRANS_CS_IS_Discount_AddShippingPopup.TEXT_FREE_SHIPPING + ' ' + itemOr;
	}
	window.parent.AdvPromo.PromotionCs.addisfShippingToObject(isfShippingObj, nameDisplay, textDisplay, 'custpage_advpromo_discount_list', rowNumber);// trigger adding of data to sublist
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();

}

/**
 * This function returns true if all the items in the array are assembly and inventory items. Otherwise, it returns false.
 * @param {String[]} array of item internal IDs
 * @returns {Boolean}
 */
function hasValidItemsOnly(items){
	var ret = false;
	
	var  filters = [];
	filters[0] = new nlobjSearchFilter('type', null, 'anyof', ['InvtPart','Assembly']);
	filters[1] = new nlobjSearchFilter('internalid', null, 'anyof', items);
	
	var columns = []
	columns[0] = new nlobjSearchColumn('internalid');
	
	var result = nlapiSearchRecord('item', null, filters, columns);
	
	if(result){
		if(result.length == items.length){
			ret = true;
		}
	}
	
	return ret;
}