/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Jan 2012     dembuscado
 *
 */

/**
 * @param {String} type Access mode: create, copy, edit
 * @return {void}
 */
var TRANS_CS_IS_Discount_AddItemPopup = {};
function init_CS_IS_Discount_AddItemPopup() {
	var translates = [];
	translates.push(new TranslateMember('label.item', 'LABEL_ITEM', 'Item'));
	translates.push(new TranslateMember('label.promo.offer', 'LABEL_PROMO_OFFER', 'Promotional Offer'));
	translates.push(new TranslateMember('label.limit', 'LABEL_LIMIT', 'Limit'));
	translates.push(new TranslateMember('label.discount.upto.total', 'LABEL_DISCOUNT_UPTO', 'Up to a Total Discount Of'));
	translates.push(new TranslateMember('text.units', 'TEXT_UNIT', 'Units'));
	translates.push(new TranslateMember('text.off', 'TEXT_OFF', 'Off'));
	translates.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates.push(new TranslateMember('error.discount.item', 'ERROR_DISCOUNT_ITEM', 'You have selected an item that is not a Product Item or Service Item in your selection. Please remove it to continue saving this setting.'));
	translates.push(new TranslateMember('error.item', 'ERROR_ITEM', 'Please select at least one item from the list'));
	translates.push(new TranslateMember('text.nolimit', 'TEXT_NOLIMIT', 'No Limit'));
	translates.push(new TranslateMember('text.please.wait', 'TEXT_PLEASE_WAIT', 'Please Wait'));
	translates.push(new TranslateMember('text.loading.page', 'TEXT_LOADING_PAGE', 'Loading page...'));
	translates.push(new TranslateMember('text.percent.completed', 'TEXT_PERCENT_COMPLETED', 'completed'));
	translates.push(new TranslateMember('text.discount.on.highest', 'TEXT_DISCOUNT_ON_HIGHEST', 'Apply Discount to Highest Valued Item'));
	TRANS_CS_IS_Discount_AddItemPopup = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_Discount_AddItemPopup);
if (TranslateInit) TranslateInit();

Ext.MessageBox.show({
	title: TRANS_CS_IS_Discount_AddItemPopup.TEXT_PLEASE_WAIT,
	msg: TRANS_CS_IS_Discount_AddItemPopup.TEXT_LOADING_PAGE + '...',
	progressText: '0% ' + TRANS_CS_IS_Discount_AddItemPopup.TEXT_PERCENT_COMPLETED,
	progress:true,
	closable:false,
	width:300
});

var currencyList;
var limitListObj;

function pageInit(type){
	
	var promoId = nlapiGetFieldValue('custpage_promo_id');
	
	// if Edit mode, use the original value of 'Apply Discount to Highest Valued Item' field
	if(promoId && window.parent.AdvPromo.PromotionCs.origDiscountOnHighest == 'T'){
		nlapiSetFieldValue('custpage_advpromo_disc_on_highest', 'T');
	}
	
	currencyList = JSON.parse(nlapiGetFieldValue('custpage_currencies'));
	if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
		currencyList.splice(0, 1);
	}
	limitListObj = JSON.parse(nlapiGetFieldValue('custpage_currencies_limit'));

	currencyList.sort(function (a, b) {
		if ((a.value == 0) && (b.value != 0)) return -1;
		else if ((a.value != 0) && (b.value == 0)) return 1;
		else if (a.text.toLocaleUpperCase() < b.text.toLocaleUpperCase()) return -1;
		else if (a.text.toLocaleUpperCase() > b.text.toLocaleUpperCase()) return 1;
		else return 0;
	});

	var theLabel = '';
	var selectBoxPrefix = 'itemSearch'; 
	var valuePrefix = null; 
	var containerId = 'custpage_all_items'; 


	//promo offer
	var theLabel = new LabelWithHelp(TRANS_CS_IS_Discount_AddItemPopup.LABEL_PROMO_OFFER, 'custpage_advpromo_promo');
	$.allPromoForm = new ValueUnitObject(theLabel, 'promoCurrencyUnit', 'promoAmount', 'custpage_promo_offer_items', currencyList);

	if(parent.nlapiGetFieldText('customform') == "Buy X Get Y Promotion Form"){
		var theLabel = new LabelWithHelp(TRANS_CS_IS_Discount_AddItemPopup.LABEL_LIMIT, 'custpage_advpromo_limit');
		$.allLimitForm = new TextboxObject(theLabel, 'limitAmount', 'custpage_limit_items', '');

		$.allPromoForm.register($.allLimitForm); // allLimitForm is registered as an observer of allPromoForm
	} else {
		var selectOptions = limitListObj;
		var selectedValues = [];
		var inputBoxValues = [];

		var selectBoxPrefix='currencyUnit', valuePrefix='amount', containerId='custpage_limit_items';
		var theLabel = "";
		valueBox = new TextboxObject(theLabel, valuePrefix, containerId);

		var selector = new ValueUnitObject(theLabel, 'currencyUnitt', 'amountt', containerId, selectOptions);
		var theLabel1 = new LabelWithHelp(TRANS_CS_IS_Discount_AddItemPopup.LABEL_LIMIT, 'custpage_advpromo_limit');
		var theLabel2 = new LabelWithHelp(TRANS_CS_IS_Discount_AddItemPopup.LABEL_DISCOUNT_UPTO, 'custpage_advpromo_upto');

		var labels = new ToggleLabels(theLabel1, theLabel2, '');


		$.allLimitForm = new Toggle(selectBoxPrefix, valuePrefix, containerId, labels, valueBox, selector);
		$.selector = selector;

		$.allPromoForm.register($.allLimitForm);	// allLimitForm is registered as an observer of allPromoForm
	}

	var stopper = true;

	// adjust layout of multiselect
	var z1 = $('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table');
	var z2 = $('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2)');
	z1.find('tbody > tr > td:nth-child(1)').css('width', '100px');
	$('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody').append('<tr></tr>');
	$('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2)').append(z2);
	
	// adjustments on Promotional Offer and Limit/Up to fields
	// set width of 1st column of Promotional Offer table
	var styles = {'width': '230px', 'padding-right': '5px'};
	$('#custpage_promo_offer_items > table > tbody > tr > td:nth-child(1)').css(styles); 
	
	// set width of 1st column of Limit/Up To table. also fix vertical alignment
	styles = {'width': '106px', 'vertical-align': 'top', 'text-align': 'right'};
	$('#custpage_outer_table_val > table > tbody > tr > td:nth-child(1)').css(styles); 
	
	// add padding-right: 5px on 2nd column of Limit/Up To table. also fix vertical alignment
	styles = {'padding-right': '5px', 'vertical-align': 'top'};
	$('#custpage_outer_table_val > table > tbody > tr > td:nth-child(2)').css(styles);
	
	// set width of Apply to Highest field since text is wrapping in IE/Chrome
	$('#custpage_advpromo_disc_on_highest_fs_lbl').parent().css('width', '236px');
	
	// if Buy X, Get Y type, add padding on 1st column of Limit table
	styles = {'width': '230px', 'padding-right': '5px'};
	$('#custpage_limit_items > table > tbody > tr > td:nth-child(1)').css(styles);
	
	var f = function(v){
		return function(){
		    if(v == 12){
		    	Ext.MessageBox.hide.defer(100, Ext.MessageBox);
		    }
		    else{
		        var i = v/11;
		        Ext.MessageBox.updateProgress(i, Math.round(10*i)+'% ' + TRANS_CS_IS_Discount_AddItemPopup.TEXT_PERCENT_COMPLETED);
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

function addItemSearch(){
	var itemObjArr = [];
	var itemSearchList = [];
	var promoList = [];
	var limitList = [];
	var limit2List = []; 

 	var itemMultiSelectValues = nlapiGetFieldValues('custpage_advpromo_items_mselect');	var itemMultiSelectTexts = nlapiGetFieldTexts('custpage_advpromo_items_mselect');
	var discountOnHighest = nlapiGetFieldValue('custpage_advpromo_disc_on_highest');

	// check that items must be mandatory
	if(nlapiGetFieldValues('custpage_advpromo_items_mselect') == null || nlapiGetFieldValues('custpage_advpromo_items_mselect') == ''){
		alert(TRANS_CS_IS_Discount_AddItemPopup.ERROR_ITEM);
		return;
	}

	// check if valid items
	if(!isValidItemTypes(itemMultiSelectValues)){
		alert(TRANS_CS_IS_Discount_AddItemPopup.ERROR_DISCOUNT_ITEM);
		return;
	}

	promoList = $.allPromoForm.getValues();
//	limitList = $.allLimitForm.getValues();
	limit2List = $.allLimitForm.getValues();

	var itemNum = itemMultiSelectValues.length; 
	var promoNum = promoList.length;
//	var limitNum = limitList.length;
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

	if(validateDiscountItemFields(promoList) && validateLimitEntries(limit2List)){
		if(limit2List instanceof Array){	// limit is in currency
			amount = promoList[0].value;
			amountUnit = retrieveText(currencyList, promoList[0].key);
			amountUnitId = promoList[0].key;
			if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
				promoOr = amount + " " + amountUnit;
			}else{
				promoOr = amount + " " + amountUnit + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OFF;
			}

			for (var i = 0; i < limit2List.length; i++){
				if(limit2List[i].value != ""){
					if(limitOr == "") {
						limitOr = limit2List[i].value + " " + retrieveText(limitListObj, limit2List[i].key) + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OFF;
					}else{ 
						limitOr = limitOr + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OR + " " + limit2List[i].value + " " + retrieveText(limitListObj, limit2List[i].key) + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OFF;
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
				limitUnit = TRANS_CS_IS_Discount_AddItemPopup.TEXT_UNIT;
				limitOr = TRANS_CS_IS_Discount_AddItemPopup.TEXT_NOLIMIT;
			}
		}else{	// limit is in units
			isUnit = true;
			limitVal = limit2List;
			limitUnitId = '0';
			limitUnit = TRANS_CS_IS_Discount_AddItemPopup.TEXT_UNIT;

			if(limitVal == "" || parseInt(limitVal) == 0){
				limitOr = TRANS_CS_IS_Discount_AddItemPopup.TEXT_NOLIMIT;
			}else{
				limitOr = limitVal + " " + limitUnit;
			}
			//disjunct promo and unit as one line
			for (var i = 0; i < promoNum; i++){
				if(promoOr == "") {
					if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
						promoOr = promoList[i].value + " " + retrieveText(currencyList, promoList[i].key)
					}else{
						promoOr = promoList[i].value + " " + retrieveText(currencyList, promoList[i].key) + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OFF;
					}

				}else{ 
					if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
						promoOr = promoOr + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OR + " " + promoList[i].value + " " + retrieveText(currencyList, promoList[i].key);						
					}else{
						promoOr = promoOr + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OR + " " + promoList[i].value + " " + retrieveText(currencyList, promoList[i].key) + " " + TRANS_CS_IS_Discount_AddItemPopup.TEXT_OFF;
					}
				}
		}
		}

		var arrNameOr = new Array();
		for( var i = 0; i < itemNum; i++ ){
			var itemId = itemMultiSelectValues[i];
			var itemText = itemMultiSelectTexts[i];

			// disjunct itemText as one line
			if(nameOr == "") {
				nameOr = itemText;
			}else{ 
				nameOr = nameOr + " or " + itemText;
			}
			arrNameOr.push(itemId);
		}

		// if limit field is in unit
		if(isUnit){
			for(var j = 0; j < promoNum; j++){
				var amount = promoList[j].value;
				var amountUnit = retrieveText(currencyList, promoList[j].key);
				var amountUnitId = promoList[j].key;
				
				itemObjArr.push({"id":arrNameOr, "text":'', "amount":amount, "aunit":amountUnitId, "limit":limitVal, "lunit":limitUnitId, "isUnit":'T', "isPercent":'F', "oper":'A', "discHighest": discountOnHighest});
			}
		} else{ //limit is in currency
			for(var j = 0; j < limit2List.length; j++){
				var limitVal = limit2List[j].value;
				var limitUnit = retrieveText(limitListObj, limit2List[j].key);
				var limitUnitId = limit2List[j].key;

				itemObjArr.push({"id":arrNameOr, "text":'', "amount":amount, "aunit":amountUnitId, "limit":limitVal, "lunit":limitUnitId, "isUnit":'F', "isPercent":'T', "oper":'A', "discHighest": discountOnHighest});
			}
		}

		if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
			promoOr = "Fixed Price:" + promoOr;
		}
		
		if(discountOnHighest == 'T'){
			promoOr = TRANS_CS_IS_Discount_AddItemPopup.TEXT_DISCOUNT_ON_HIGHEST + ' / ' + promoOr;
		}

		window.parent.AdvPromo.PromotionCs.addItemIdToObject(itemObjArr, [nameOr, promoOr, limitOr], 'custpage_advpromo_discount_list', false, 'A');

		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	} //end validation 
}
