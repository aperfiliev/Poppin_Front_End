/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Feb 2012     dembuscado
 *
 */

/**
 * @param {String} type Access mode: create, copy, edit
 * @return {void}
 */

var TRANS_CS_IS_Discount_EditItemSavedSearchPopup = {};
function init_CS_IS_Discount_EditItemSavedSearchPopup() {
	var translates = [];
	translates.push(new TranslateMember('label.item', 'LABEL_ITEM', 'Item'));
	translates.push(new TranslateMember('label.promo.offer', 'LABEL_PROMO_OFFER', 'Promotional Offer'));
	translates.push(new TranslateMember('label.limit', 'LABEL_LIMIT', 'Limit'));
	translates.push(new TranslateMember('label.discount.upto.total', 'LABEL_DISCOUNT_UPTO', 'Up to a Total Discount Of'));
	translates.push(new TranslateMember('text.units', 'TEXT_UNITS', 'Units'));
	translates.push(new TranslateMember('text.off', 'TEXT_OFF', 'Off'));
	translates.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates.push(new TranslateMember('text.nolimit', 'TEXT_NOLIMIT', 'No Limit'));
	translates.push(new TranslateMember('text.please.wait', 'TEXT_PLEASE_WAIT', 'Please Wait'));
	translates.push(new TranslateMember('text.loading.page', 'TEXT_LOADING_PAGE', 'Loading page...'));
	translates.push(new TranslateMember('text.percent.completed', 'TEXT_PERCENT_COMPLETED', 'completed'));
	translates.push(new TranslateMember('text.discount.on.highest', 'TEXT_DISCOUNT_ON_HIGHEST', 'Apply Discount to Highest Valued Item'));
	TRANS_CS_IS_Discount_EditItemSavedSearchPopup = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_Discount_EditItemSavedSearchPopup);
if (TranslateInit) TranslateInit();

Ext.MessageBox.show({
	title: TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_PLEASE_WAIT,
	msg: TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_LOADING_PAGE + '...',
	progressText: '0% ' + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_PERCENT_COMPLETED,
	progress:true,
	closable:false,
	width:300
});

var currencyList;
var itemList;
var itemObj;
var limitListObj;

function pageInit(type){

	currencyList = JSON.parse(nlapiGetFieldValue('custpage_currencies_savedsearch_edit'));
	if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
		currencyList.splice(0, 1);
	}
	limitListObj = JSON.parse(nlapiGetFieldValue('custpage_currencies_savedsearch_limit_edit'));
	itemList = JSON.parse(nlapiGetFieldValue('custpage_itemsearch_edit'));
	itemObj = JSON.parse(nlapiGetFieldValue('custpage_object_select_savedsearch_edit'));
	rowNum = nlapiGetFieldValue('custpage_advpromo_rownum_savedsearch_edit');
	promoId = nlapiGetFieldValue('custpage_promo_id');
	
	// if Edit mode, use the original value of 'Apply Discount to Highest Valued Item' field
	if(promoId && window.parent.AdvPromo.PromotionCs.origDiscountOnHighest == 'T'){
		nlapiSetFieldValue('custpage_advpromo_disc_on_highest', 'T');
	}	

	currencyList.sort(function (a, b) {
		if ((a.value == 0) && (b.value != 0)) return -1;
		else if ((a.value != 0) && (b.value == 0)) return 1;
		else if (a.text.toLocaleUpperCase() < b.text.toLocaleUpperCase()) return -1;
		else if (a.text.toLocaleUpperCase() > b.text.toLocaleUpperCase()) return 1;
		else return 0;
	});

	var itemSelect = [];
	var promoSelect = [];
	var promoValues = [];
	var limitSelect = [];
	var limitValues = [];

	var item = itemObj[0].id;
	var limit = '';
	var promo = '';

	var oneLimit = false;
	var onePromo = false;
	var oneItem = true;


	if(itemObj[0].isUnit == 'T'){
		limitSelect.push(itemObj[0].lunit);
		limitValues.push(itemObj[0].limit);

		promoSelect.push(itemObj[0].aunit);
		promoValues.push(itemObj[0].amount);

		oneLimit = true;
	}else{
		limitSelect.push(itemObj[0].lunit);
		limitValues.push(itemObj[0].limit);

		promoSelect.push(itemObj[0].aunit);
		promoValues.push(itemObj[0].amount);

		onePromo = true;
	}

	for(var j=1; j<itemObj.length; j++){
		if(item == itemObj[j].id){
			if(oneLimit){
				promoSelect.push(itemObj[j].aunit);
				promoValues.push(itemObj[j].amount);
			}

			if(onePromo){
				limitSelect.push(itemObj[j].lunit);
				limitValues.push(itemObj[j].limit);
			}
		}
	}

	item = '';
	for(var i = 0; i< itemObj.length; i++){
		if(item != itemObj[i].id){
			itemSelect.push(itemObj[i].id);
		}

		item = itemObj[i].id;
	}


	var theLabel = '';
	var selectBoxPrefix = 'item'; 
	var valuePrefix = null; 
	var containerId = 'custpage_all_items'; 

	//promo offer
	var theLabel = new LabelWithHelp('Promotional Offer', 'custpage_advpromo_offer');
	$.allPromoForm = new ValueUnitObject(theLabel, 'promoCurrencyUnit', 'promoAmount', 'custpage_promo_offer_savedsearch_edit', currencyList, promoSelect, promoValues);

	if(parent.nlapiGetFieldText('customform') == "Buy X Get Y Promotion Form"){
		var theLabel1 = new LabelWithHelp(TRANS_CS_IS_Discount_EditItemSavedSearchPopup.LABEL_LIMIT, 'custpage_advpromo_limit');
		$.allLimitForm = new TextboxObject(theLabel1, 'limitAmount', 'custpage_limit_savedsearch_edit', limitValues);

		$.allPromoForm.register($.allLimitForm); // allLimitForm is registered as an observer of allPromoForm
	}else{
		var selectOptions = limitListObj;
		var selectedValues = [];
		var inputBoxValues = [];
		var defaultRadio = 0;
		var percentValue = ""; 		// value of amount in percent

		if(limitValues.length == 1 && limitSelect[0] == 0){
			percentValue = limitValues[0];
			selectedValues = [""];
			inputBoxValues = [""];
		}else{
			for(var i=0; i<limitValues.length; i++){
				inputBoxValues.push(limitValues[i]);
				selectedValues.push(limitSelect[i]);
			}
			defaultRadio = 1;
		}

		var selectBoxPrefix='currencyUnit', valuePrefix='amount', containerId='custpage_limit_savedsearch_edit';
		var theLabel = "";
		valueBox = new TextboxObject(theLabel, valuePrefix, containerId, percentValue);

		var selector = new ValueUnitObject(theLabel, 'currencyUnitt', 'amountt', containerId, selectOptions, selectedValues, inputBoxValues);

		var theLabel1 = new LabelWithHelp(TRANS_CS_IS_Discount_EditItemSavedSearchPopup.LABEL_LIMIT, 'custpage_advpromo_limit');
		var theLabel2 = new LabelWithHelp(TRANS_CS_IS_Discount_EditItemSavedSearchPopup.LABEL_DISCOUNT_UPTO, 'custpage_advpromo_upto');
		var labels = new ToggleLabels(theLabel1, theLabel2, '');

		$.allLimitForm = new Toggle(selectBoxPrefix, valuePrefix, containerId, labels, valueBox, selector, defaultRadio);
		$.selector = selector;
		$.allPromoForm.register($.allLimitForm);	// allLimitForm is registered as an observer of allPromoForm
	}
	var stopper = true;
	
	// adjustments on Promotional Offer and Limit/Up to fields
	// set width of 1st column of Promotional Offer table
	var styles = {'width': '230px', 'padding-right': '5px'};
	$('#custpage_promo_offer_savedsearch_edit > table > tbody > tr > td:nth-child(1)').css(styles); 
	
	// set width of 1st column of Limit/Up To table. also fix vertical alignment
	styles = {'width': '106px', 'vertical-align': 'top', 'text-align': 'right'};
	$('#custpage_outer_table_edit_val > table > tbody > tr > td:nth-child(1)').css(styles); 
	
	// add padding-right: 5px on 2nd column of Limit/Up To table. also fix vertical alignment
	styles = {'padding-right': '5px', 'vertical-align': 'top'};
	$('#custpage_outer_table_edit_val > table > tbody > tr > td:nth-child(2)').css(styles);
	
	// set width of Apply to Highest field since text is wrapping in IE/Chrome
	$('#custpage_advpromo_disc_on_highest_fs_lbl').parent().css('width', '236px');
	
	// if Buy X, Get Y type, add padding on 1st column of Limit table
	styles = {'width': '230px', 'padding-right': '5px'};
	$('#custpage_limit_savedsearch_edit > table > tbody > tr > td:nth-child(1)').css(styles);
	
	var f = function(v){
		return function(){
		    if(v == 12){
		    	Ext.MessageBox.hide.defer(100, Ext.MessageBox);
		    }
		    else{
		        var i = v/11;
		        Ext.MessageBox.updateProgress(i, Math.round(10*i)+'% ' + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_PERCENT_COMPLETED);
		    }
		};
   	};
   	
   	for(var i = 1; i < 13; i++){
   		setTimeout(f(i), i*100);
   	}
   	
   	Ext.get("div__body").dom.style.visibility="visible";
}

function cancelDiscountItem(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function editItemSavedSearch(){

	var delArr = [];
	for(var i=0; i<itemObj.length; i++){
		if(itemObj[i].oper == 'null'){
			itemObj[i].oper = 'D';
			delArr.push(itemObj[i]);
		}
	}

	itemObj = [];
	promoList = $.allPromoForm.getValues();
	limit2List = $.allLimitForm.getValues();
	
	if(validateDiscountItemFields(promoList) && validateLimitEntries(limit2List)){
		var result = addPackToSublist(promoList, limit2List, itemObj);

//		itemObjArr, nameOr, promoOr, limitOr

		//result[0] = itemObjArr = itemObj

		var nameOr = result[1];
		var promoOr = result[2];
		var limitOr = result[3];

		window.parent.AdvPromo.PromotionCs.syncEditToListObject(22, itemObj, [nameOr, promoOr, limitOr, rowNum, delArr]);

		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	}
}

function addPackToSublist(promoList, limit2List, itemObjArr){
	var promoNum = promoList.length;
	var isUnit = false;
	var limitVal;
	var limitUnit;
	var limitUnitId;
	var amount;
	var amountUnit;
	var amountUnitId;
	var nameOr = "";
	var promoOr = "";
	var limitOr = "";
	var limitList = [];
	var discountOnHighest = nlapiGetFieldValue('custpage_advpromo_disc_on_highest');

	if(limit2List instanceof Array){	// limit is in currency
		amount = promoList[0].value;
		amountUnit = retrieveText(currencyList, promoList[0].key);
		amountUnitId = promoList[0].key;
		if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
			promoOr = amount + " " + amountUnit;
		}else{
			promoOr = amount + " " + amountUnit + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OFF;
		}
		

		for (var i = 0; i < limit2List.length; i++){
			if(limit2List[i].value != ""){
				if(limitOr == "") {
					limitOr = limit2List[i].value + " " + retrieveText(limitListObj, limit2List[i].key) + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OFF;
				}else{ 
					limitOr = limitOr + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OR + " " + limit2List[i].value + " " + retrieveText(limitListObj, limit2List[i].key) + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OFF;
				}
				limitList.push(limit2List[i]);
			}
		}
		//clean limit entry, eliminate blank fields
		limit2List = limitList;

		if(limit2List.length == 0){
			isUnit = true;
			limitUnitId = '0';
			limitVal = "";
			limitUnit = TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_UNITS;
			limitOr = TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_NOLIMIT;
		}
	}else{	// limit is in units
		isUnit = true;
		limitVal = limit2List;
		limitUnitId = '0';
		limitUnit = TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_UNITS;

		if(limitVal == "" || parseInt(limitVal) == 0){
			limitOr = TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_NOLIMIT;
		}else{
			limitOr = limitVal + " " + limitUnit;
		}

		//disjunct promo and unit as one line
		for (var i = 0; i < promoNum; i++){
			if(promoOr == "") {
				if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
					promoOr = promoList[i].value + " " + retrieveText(currencyList, promoList[i].key);
				}else{
					promoOr = promoList[i].value + " " + retrieveText(currencyList, promoList[i].key) + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OFF;
				}

			}else{ 
				if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
					promoOr = promoOr + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OR + " " + promoList[i].value + " " + retrieveText(currencyList, promoList[i].key);					
				}else{
					promoOr = promoOr + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OR + " " + promoList[i].value + " " + retrieveText(currencyList, promoList[i].key) + " " + TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_OFF;
				}
			}
		}
	}

	var itemId = nlapiGetFieldValue('custpage_advpromo_itemsearch_dropdown_edit');
	var itemText = nlapiGetFieldText('custpage_advpromo_itemsearch_dropdown_edit');
	nameOr = itemText;

	// if limit field is in unit
	if(isUnit){
		for(var j = 0; j < promoNum; j++){
			var amount = promoList[j].value;
			var amountUnit = retrieveText(currencyList, promoList[j].key);
			var amountUnitId = promoList[j].key;

			itemObjArr.push({"id":itemId, "text":itemText, "amount":amount, "aunit":amountUnitId, "limit":limitVal, "lunit":limitUnitId, "isUnit":'T', "isPercent":'F', "oper":'A', "discHighest": discountOnHighest}); 
		}
	} else{ //limit is in currency
		for(var j = 0; j < limit2List.length; j++){
			var limit = limit2List[j].value;
			var limitUnit = retrieveText(limitListObj, limit2List[j].key);
			var limitUnitId = limit2List[j].key;

			itemObjArr.push({"id":itemId, "text":itemText, "amount":amount, "aunit":amountUnitId, "limit":limit, "lunit":limitUnitId, "isUnit":'F', "isPercent":'T', "oper":'A', "discHighest": discountOnHighest}); 
		}
	}
	
	if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
		promoOr = "Fixed Price: " + promoOr;
	}
	
	if(discountOnHighest == 'T'){
		promoOr = TRANS_CS_IS_Discount_EditItemSavedSearchPopup.TEXT_DISCOUNT_ON_HIGHEST + ' / ' + promoOr;
	}
	
	return ([itemObjArr, nameOr, promoOr, limitOr]);
}