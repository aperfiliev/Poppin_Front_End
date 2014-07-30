/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jun 2012     gguillen
 *
 */



var TRANS_CS_IS_TieredOrder_AllItems = {};
function init_CS_IS_TieredOrder_AllItems() {
	var translates_CS_IS_TieredOrder_AllItems = [];
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('label.percentoff', 'LABEL_PERCENT_OFF', 'Percent Off'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('label.amount.set', 'LABEL_SET_AMOUNT', 'Set Amount'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('label.purchase.min', 'LABEL_MIN_PURCHASE', 'Minimum Purchase'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('label.add.tier', 'LABEL_ADD_TIER', 'Add Tier'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('text.on', 'TEXT_ON', 'on'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('text.units', 'TEXT_UNITS', 'Units'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('text.order.total', 'TEXT_ORDER_TOTAL', 'Order Total'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.minpurch.enter', 'ERROR_MINPURCH_ENTER', 'Please enter value(s) for: Minimum Purchase'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.minpurch.nan', 'ERROR_MINPURCH_NAN', 'Invalid Minimum Purchase value. Values must be numbers.'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.minpurch.range', 'ERROR_MINPURCH_RANGE', 'Invalid Minimum Purchase value. Values must be between 0 to 100,000,000,000'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.elig.order.item', 'ERROR_ELIG_ORDER_ITEM', 'You have selected an item that is not a Product Item or Service Item in your selection. Please remove it to continue saving this setting.'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.item', 'ERROR_ITEM', 'Please select at least one item from the list'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.minpurch.unmatch', 'ERROR_MINPURCH_UNMATCH', 'The units/currency setting must match for all tiers. Tiers defined by currency amounts must use the same currency for all tiers.'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('label.remove', 'LABEL_REMOVE', "Remove"));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('label.remove.tier', 'LABEL_REMOVE_TIER', "Remove Tier"));

	// new error string
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.not.incremental', 'ERROR_VAUES_NOT_INCREMENTAL', 'Tier values must be in increasing order.'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.equal.values.unit', 'ERROR_UNITS_EQUAL_VALUE', 'You have tiers with matching values. Each tier must have a unique value.'));
	translates_CS_IS_TieredOrder_AllItems.push(new TranslateMember('error.equal.values.currency', 'ERROR_CURRENCY_EQUAL_VALUE', 'You have tiers with matching values for the same currency. Each tier for a given currency must have a unique amount.'));


	TRANS_CS_IS_TieredOrder_AllItems = new TranslateHelper(translates_CS_IS_TieredOrder_AllItems);
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER1  = 'Tier 1';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER2  = 'Tier 2';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER3  = 'Tier 3';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER4  = 'Tier 4';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER5  = 'Tier 5';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER6  = 'Tier 6';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER7  = 'Tier 7';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER8  = 'Tier 8';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER9  = 'Tier 9';
	TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER10 = 'Tier 10';
}

var TranslateInitFunctions;
var TranslateInit;
var isSetItem = false, isSetItemSearch = false;
var promoType = parseInt(window.parent.AdvPromo.PromotionCs.globalParam['tier_dtype']);
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_TieredOrder_AllItems);
if (TranslateInit) TranslateInit();


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function pageInitAllItems(type){

	var context = nlapiGetContext();
	var multicurrencyON = context.getFeature('MULTICURRENCY');

	var currencyNameColumn = null;
	var currencySearch = null;
	var currencyList = [{"value":"0", "text": ("<" + TRANS_CS_IS_TieredOrder_AllItems.TEXT_UNITS + ">")}];
	var id = null;
	var name = null;
	var formName = parent.nlapiGetFieldText("customform");

	if(formName != 'Buy X Get Y Promotion Form'){
		if(multicurrencyON){
			currencyNameColumn = new nlobjSearchColumn('symbol');
			var searchFilters = new Array();
			searchFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
			currencySearch = nlapiSearchRecord('currency', null, searchFilters, [currencyNameColumn]);
			currencyList = [{"value":"0", "text":TRANS_CS_IS_TieredOrder_AllItems.TEXT_UNITS}];

			for ( var i = 0; i < currencySearch.length; i++) {
				id = currencySearch[i].getId();
				name = currencySearch[i].getValue(currencyNameColumn);
				currencyList.push({"value":id, "text":name});
			}
		}else{

			var url = window.location.href; 
			var index = url.indexOf('/app');
			var linkprefix = url.substring(0, index);
			var headerinfo = {};
			headerinfo['User-Agent-x'] = 'SuiteScript-Call';
			var urlformapping = nlapiResolveURL('SUITELET', 'customscript_advpromo_currency_symbol_sl', 'customdeploy_advpromo_currency_symbol_sl');
			var requestUrl = linkprefix + urlformapping;
			var urlResponse = nlapiRequestURL(requestUrl, null, headerinfo); 
			var responseBody = urlResponse.getBody();

			currencyList.push({"value":1, "text":responseBody});
		}

	}

	$.rowRef = null;

	// This sorts the currency list by name
	currencyList.sort(function (a, b) {
		if ((a.value == 0) && (b.value != 0)) return -1;
		else if ((a.value != 0) && (b.value == 0)) return 1;
		else if (a.text.toLocaleUpperCase() < b.text.toLocaleUpperCase()) return -1;
		else if (a.text.toLocaleUpperCase() > b.text.toLocaleUpperCase()) return 1;
		else return 0;
	});

	var selected = [[0]];
	var values = [[]];

	if (nlapiGetFieldValue('custpage_is_edit') == 'T') {
		selected = [];
		values = [];
		var tsize;
		switch(promoType){
		case 1:
			tsize = window.parent.AdvPromo.PromotionCs.itemSpecProperties.tiers;	
			break;
		case 2:
			tsize = window.parent.AdvPromo.PromotionCs.orderSpecProperties.tiers;
			break;
		}
//		var tsize = window.parent.AdvPromo.PromotionCs.itemSpecProperties.tiers;	
		$rowRef = window.parent.AdvPromo.PromotionCs.globalParam['31_tablerow'];

		for(var i=$rowRef; i< $rowRef+tsize; i++){
			var amt =[];
			var cur =[];
			var elig = window.parent.AdvPromo.PromotionCs.tiers[i].elig;
			if(elig[0].cur == ""){
				amt = [elig[0].amt];
				cur = [elig[0].cur];
			}else{
				for(var j=0; j<elig.length; j++){
					amt.push(parseFloat(elig[j].amt));
					cur.push(parseFloat(elig[j].cur));
				}
			}

			selected.push(cur);
			values.push(amt);
		}
	}

	if(nlapiGetFieldValue('custpage_advpromo_tier_additemsearch_flag') == 'T' || nlapiGetFieldValue('custpage_advpromo_tier_edititemsearch_flag') == 'T'){
		isSetItemSearch = true;
	}

	if(nlapiGetFieldValue('custpage_advpromo_tier_additem_flag') == 'T' || nlapiGetFieldValue('custpage_advpromo_tier_edititem_flag') == 'T'){
		isSetItem = true;
		// adjust layout of multiselect
		var z1 = $('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table');
		var z2 = $('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2)');
		z1.find('tbody > tr > td:nth-child(1)').css('width', '100px');
		$('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody').append('<tr></tr>');
		$('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2)').append(z2);

		if(nlapiGetFieldValue('custpage_advpromo_tier_edititem_flag') == 'T'){
			var itemIds = window.parent.AdvPromo.PromotionCs.globalParam['32_itemSelect'];
			nlapiSetFieldValues('custpage_advpromo_items_mselect', itemIds.split(","));
		}
	}

	$.currencyList = currencyList;

	// var theLabel = "Minimum Purchase";
	var theLabel = new LabelWithHelp(TRANS_CS_IS_TieredOrder_AllItems.LABEL_MIN_PURCHASE, 'custpage_advpromo_minpurchase');
	var selectBoxPrefix='custpage_currency';
	var valuePrefix='custpage_amount';
	var containerId='custpage_tiers';

	$('#' + containerId).css('border-collapse', 'collapse');


	var selectBoxPrefix='custpage_curr_tier';
	var valuePrefix='custpage_val_tier';
	var tierlabels = [];
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER1);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER2);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER3);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER4);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER5);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER6);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER7);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER8);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER9);
	tierlabels.push(TRANS_CS_IS_TieredOrder_AllItems.TEXT_TIER10);
//	var tb = new ValueUnitObjectGroup(tierlabels, selectBoxPrefix, valuePrefix, containerId, currencyList, [], [[], []]);
//	var tb = new ValueUnitObjectGroup(tierlabels, selectBoxPrefix, valuePrefix, containerId, currencyList, [[3],[3,4]], [[1], [2,3]]);
	var tb;
	if(isSetItemSearch){
		tb = new ValueUnitObjectGroup(tierlabels, selectBoxPrefix, valuePrefix, containerId, currencyList, selected, values, true);
	}
	else{
		tb = new ValueUnitObjectGroup(tierlabels, selectBoxPrefix, valuePrefix, containerId, currencyList, selected, values);
	}
	$.selector = tb;

	prettifyLayout(isSetItemSearch);
}

function prettifyLayout(fromItem){

	// rename Add Another to Add Another Tier
	var addTierLink = $('#custpage_tiers > table > tbody > tr:nth-child(11) > td > a');
	addTierLink.text(TRANS_CS_IS_TieredOrder_AllItems.LABEL_ADD_TIER);

	addTierLink.after('<div style="text-align: left; float:left; margin: 0 0 0 103px"></div>');
	var addTierDiv = $('#custpage_tiers > table > tbody > tr:nth-child(11) > td > div');
	addTierDiv.append(addTierLink);

	// prepare the placeholder for the renamed Remove link (to Remove Tier)
	addTierDiv.after('<div style="text-align: left; float:left; margin: 0 0 0 5px; width: 120px;"></div>');
	
	// move the 'Remove Tier' link beside 'Add Another Tier'
	var removeTierLabel = TRANS_CS_IS_TieredOrder_AllItems.LABEL_REMOVE;
	var removeTierAdjustedLabel = '| ' + TRANS_CS_IS_TieredOrder_AllItems.LABEL_REMOVE_TIER;
	
	var secondTd = $('#custpage_tiers > table > tbody > tr > td:nth-child(2) > a');
	var removeTierLink = secondTd.filter(function(index) {
		   return ($(this).text() == removeTierLabel || $(this).text() == removeTierAdjustedLabel);
	});

	// move the 'Remove Tier' link beside 'Add Another Tier'
	removeTierLink.text(removeTierAdjustedLabel);
	var removeTierDiv = $('#custpage_tiers > table > tbody > tr:nth-child(11) > td > div:nth-child(2)');
	removeTierDiv.empty();
	removeTierDiv.append(removeTierLink);
}

/*
 * 
 */
function cancelEligibilityOrder(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function getCurrString(key) {
	for (var i = 0; i < $.currencyList.length; i++) {
		if ($.currencyList[i].value == key) return $.currencyList[i].text;
	}
	return null;
}

function getMinPurchId(currency) {
	for (var i = 0; i < $.oldminimumPurchase.length; i++) {
		if ($.oldminimumPurchase[i].currency ==  currency) return $.oldminimumPurchase[i].id;
	}
	return randomString(10);
}

function isValidEligibilityTypes(){
	var ret = true;

	var eligibilityTypes = $('select[id^="custpage_curr_tier_"]');
	var hasUnit = false;
	var hasCurrency = false;
	var targetCurrencyCount = 1;
	var currentCurrencyCount = 1;
	var previousTrIndex = 0;
	var currencyTable = new Array(); // array of arrays (trCurrency) 
	var trCurrency = new Array(); // array of ints

	// loop over the select boxes
	jQuery.each(eligibilityTypes, function(index, value) { 

		var objId = $(this).attr('id');
		var trIndex = parseInt(objId.substring(19, 20)) + 1;

		// only process displyed 'tr'	
		var displayTypeObj = $('#custpage_tiers > table > tbody > tr:nth-child(' + trIndex + ')');
		var displayTypeValue = displayTypeObj.css('display');

		if(displayTypeValue != 'none'){

			var selectBoxValue = $(this).val();

			// if a unit is found, there must be no currency set
			if(parseInt(selectBoxValue) == 0){
				hasUnit = true;

				if(hasCurrency){
					ret = false;
				}
			}
			else{
				hasCurrency = true;

				if(previousTrIndex == trIndex){
					currentCurrencyCount++;

					// add the currency to trCurrency
					currencyTable[currencyTable.length-1].push(parseInt(selectBoxValue));
				}
				else{

					previousTrIndex = trIndex;
					currentCurrencyCount = 1;

					// add new trCurrency
					trCurrency = new Array();
					trCurrency.push(parseInt(selectBoxValue));

					currencyTable.push(trCurrency);
				}

				if(currentCurrencyCount > targetCurrencyCount){
					targetCurrencyCount = currentCurrencyCount;
				}

				if(hasUnit){
					ret = false;
				}
			}
		}		
	});

	if(ret == false) return ret;

//	alert('targetCurrencyCount = ' + targetCurrencyCount);
//	alert('currencyTable = ' + JSON.stringify(currencyTable));

	// check for matching currency count
	for(var i = 0; i < currencyTable.length; i++){
		var trCurrency = currencyTable[i];

		if(trCurrency.length != targetCurrencyCount){
			ret = false;
			break;
		}
	}

	if(ret == false) return ret;

	// check for matching currencies
	if(currencyTable.length > 0){
		for(var i = 0; i < currencyTable[0].length; i++){
			var currId = currencyTable[0][i];

			// start w/ 2nd array onwards
			for(var j = 1; j < currencyTable.length; j++){

				for(var k = 0; k < currencyTable[j].length; k++){
					var otherCurrId = currencyTable[j][k];

					if(currId == otherCurrId){
						break;
					}
					else{
						if(k == currencyTable[j].length -1){
							ret = false;
						}
					}

					if(ret == false) break;
				}

				if(ret == false) break;
			}

			if(ret == false) break;
		}	

//		alert('matching currencies, ret = ' + ret);
	}	

	return ret;
}

function addItem() {

	if(!isValidEligibilityTypes()){
		alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_MINPURCH_UNMATCH);
		return;
	}		

	// eligibility values
	var EligibleLines = function(){
		this.id = null;
		this.op = 'A';	// add operation	
		this.amt = 0;	 
		this.cur = '';	// 0 is units
	};

	var TierHead = function(){
		// create tier header
		this.op = 'A';		// add operation
		this.id = null;
		this.etype = 0;		// eligibility type
		this.dtype = 0;		// discount type
		this.disatype = 0;	//discount item add type;
		this.delKey = null;
		this.eiid = null;		// eligibility item id
		this.esid = null;		// eligibility search id
		this.esdesc = '';
		this.elig = null;
		this.disc = null;
		this.diid = null;		// discount item id
		this.dsid = null;		// discount search id
		this.dsdesc = '';
	};

	if (isSetItem)
	{
		// check that items must be mandatory
		if(nlapiGetFieldValues('custpage_advpromo_items_mselect') == null || nlapiGetFieldValues('custpage_advpromo_items_mselect') == '')
		{
			alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_ITEM);
			return;
		}

		// check if valid items
		if (!isValidItemTypes(nlapiGetFieldValues('custpage_advpromo_items_mselect')))
		{
			alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_ELIG_ORDER_ITEM);
			return;
		}
	}

	var tierLevel = $.selector.getValues();	
	var isNumeric = new RegExp('^[0-9]+(\.[0-9]+)?(e(\\+|-)[0-9]+)?$');
	var tierHeadObj;
	var tiers = [], itemSelect = null, itemSearchSelect = null, itemSearchSelectText = "";

	for(var i = 0; i < tierLevel.length; i++){
		var tierInput = tierLevel[i];

		if ((tierInput.length >= 1)) {
			for (var indx = 0; indx < tierInput.length; indx++) {
				if (!(isNumeric.test(tierInput[indx].value))) {
					var message = '';
					if ((tierInput[indx].value == '') || (tierInput[indx].value == null)) {
						message = TRANS_CS_IS_TieredOrder_AllItems.ERROR_MINPURCH_ENTER;
					} else {
						message = TRANS_CS_IS_TieredOrder_AllItems.ERROR_MINPURCH_NAN;
					}
					window.alert(message);
					return;
				} else {
					if (!((tierInput[indx].value > 0) && (tierInput[indx].value < 100000000000) )) {
						window.alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_MINPURCH_RANGE);
						return;
					}
				}
			}
		}

		tierHeadObj = new TierHead();
		tierHeadObj.id = i+1;	// tier id is incremental per popup
		if(isSetItemSearch){
			tierHeadObj.etype = 1;	// set item search
			tierHeadObj.esid = nlapiGetFieldValue('custpage_advpromo_itemsearch_dropdown');	
			tierHeadObj.esdesc = nlapiGetFieldText('custpage_advpromo_itemsearch_dropdown');	
		} else if(isSetItem){
			tierHeadObj.etype = 2;	// set item
			itemSelect = nlapiGetFieldValues('custpage_advpromo_items_mselect');	// this is a required field, needs validation on this
			tierHeadObj.eiid = nlapiGetFieldValues('custpage_advpromo_items_mselect').toString();
			// set item selected to eiid
		} else{
			tierHeadObj.etype = 3;	// set order total
		}

//		tierHeadObj.dtype = 1; // item specific
		tierHeadObj.dtype = promoType;

		for(var j = 0; j < tierInput.length; j++){
			var eligLineObj = new EligibleLines();
			eligLineObj.amt = tierInput[j].value;

			if(tierInput[j].key != 0){
				eligLineObj.cur = tierInput[j].key;
			}

			if(!(tierHeadObj.elig instanceof Array)){
				tierHeadObj.elig = [];
			}
			tierHeadObj.elig.push(eligLineObj);
		}

		tiers.push(tierHeadObj);
	}

	// determine if the tierred values are incremental
	if (!IsTierredValueIncremental(tiers))
		return;

	if(isSetItemSearch){
		itemSearchSelectText = nlapiGetFieldText('custpage_advpromo_itemsearch_dropdown');	
		if(nlapiGetFieldValue('custpage_is_edit') == 'T'){				//check if edit
			window.parent.AdvPromo.PromotionCs.editOrderItemSearch(tiers, itemSearchSelectText);
		}else{
			window.parent.AdvPromo.PromotionCs.addOrderItemSearch(tiers, null, itemSearchSelectText);
		}
	}else if(isSetItem){
		if(nlapiGetFieldValue('custpage_is_edit') == 'T'){				//check if edit
			window.parent.AdvPromo.PromotionCs.editOrderItem(tiers, itemSelect);
		}else{
			window.parent.AdvPromo.PromotionCs.addOrderItem(tiers, null, itemSelect);
		}
	}else{
		if (nlapiGetFieldValue('custpage_is_edit') == 'T') {			// check if edit
			window.parent.AdvPromo.PromotionCs.editOrderTotal(tiers);
		}else{		// if add
			window.parent.AdvPromo.PromotionCs.addOrderTotal(tiers);
		}
	}

	switch(promoType){
	case 1: // item spec/BOGO
		window.parent.AdvPromo.PromotionCs.itemSpecProperties.tiers = $.selector.getValues().length;
		break;
	case 2:	// order spec
		window.parent.AdvPromo.PromotionCs.orderSpecProperties.tiers = $.selector.getValues().length;
		break;
	}

	window.parent.Ext.WindowMgr.getActive().close();
	return;

}

// check if tierred values are arranged in the increasing order
function IsTierredValueIncremental(tiers)
{
	var tiersCount = tiers.length;
	var isUnit;

	if (tiersCount <= 0)
		return false;

	var elig = tiers[0].elig;

	// determine if the eligibility is in unit or in currency
	if (elig[0].cur == '')
		isUnit = true;
	else 
		isUnit = false;

	// eligibility is in unit
	if (isUnit)
	{
		var originalValues = [];
		var sortedValues = [];

		// store the original tierred values in an array
		for (var i = 0; i < tiersCount; i++)
		{
			elig = tiers[i].elig;
			originalValues.push(elig[0].amt);
		}

		// check if the elements are in the increasing order
		for (var i = 0; i < tiersCount - 1; i++)
		{
			if (parseFloat(originalValues[i]) >= parseFloat(originalValues[i + 1]))
			{
				if (parseFloat(originalValues[i]) == parseFloat(originalValues[i + 1]))
					alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_UNITS_EQUAL_VALUE);

				if (parseFloat(originalValues[i]) > parseFloat(originalValues[i + 1]))
					alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_VAUES_NOT_INCREMENTAL);

				return false;
			}
		}
	}
	// eligibility is in currency
	else 
	{
		// dictionary of tierred values
		// key = currency label and value = array of tierred values
		var tierredValues = {};
		var sortedTierredValues = {};
		var currencies = [];

		var eligCount = elig.length;

		// store the currncy label for the tierred values
		for (var i = 0; i < eligCount; i++)
		{
			currencies.push(elig[i].cur);

			// initialize the variables that will hold the tierread values
			tierredValues[elig[i].cur] = [];
			sortedTierredValues[elig[i].cur] = [];
		}

		// stores the tierred values into an array grouped according to their currency label
		for (var i = 0; i < tiersCount; i++)
		{
			elig = tiers[i].elig;
			for (var j = 0; j < eligCount; j++)
				tierredValues[elig[j].cur].push(elig[j].amt);
		}

		// check if the elements are in the increasing order
		for (var i = 0; i < currencies.length; i++)
		{
			for (var j = 0; j < tiersCount - 1; j++)
			{
				if (parseFloat(tierredValues[currencies[i]][j]) >= parseFloat(tierredValues[currencies[i]][j + 1]))
				{
					if (parseFloat(tierredValues[currencies[i]][j]) == parseFloat(tierredValues[currencies[i]][j + 1]))
						alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_CURRENCY_EQUAL_VALUE);		

					if (parseFloat(tierredValues[currencies[i]][j]) > parseFloat(tierredValues[currencies[i]][j + 1]))
						alert(TRANS_CS_IS_TieredOrder_AllItems.ERROR_VAUES_NOT_INCREMENTAL);

					return false;
				}
			}
		}
	}

	return true;
}



