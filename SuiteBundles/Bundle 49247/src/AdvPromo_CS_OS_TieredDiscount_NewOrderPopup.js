/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Aug 2012     taltar
 *
 */

function init_CS_OS_TieredDiscount_AddNewOrderPopup() {
	var translates = [];
	translates.push(new TranslateMember('label.item', 'LABEL_ITEM', 'Item'));
	translates.push(new TranslateMember('label.promo.offer', 'LABEL_PROMO_OFFER', 'Promotional Offer'));
	translates.push(new TranslateMember('label.limit', 'LABEL_LIMIT', 'Limit'));
	translates.push(new TranslateMember('label.discount.upto.total', 'LABEL_DISCOUNT_UPTO', 'Up to a Total Discount Of'));
	translates.push(new TranslateMember('text.units', 'TEXT_UNIT', 'Units'));
	translates.push(new TranslateMember('text.none', 'TEXT_NONE', '-None-'));
	translates.push(new TranslateMember('text.off', 'TEXT_OFF', 'Off'));
	translates.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates.push(new TranslateMember('error.discount.item', 'ERROR_DISCOUNT_ITEM', 'You have selected an item that is not a Product Item or Service Item in your selection. Please remove it to continue saving this setting.'));
	translates.push(new TranslateMember('error.item', 'ERROR_ITEM', 'Please select at least one item from the list'));

	// new error string
	translates.push(new TranslateMember('error.not.incremental', 'ERROR_VAUES_NOT_INCREMENTAL', 'Tier values must be in increasing order.'));
	translates.push(new TranslateMember('error.equal.values.unit', 'ERROR_UNITS_EQUAL_VALUE', 'You have tiers with matching values. Each tier must have a unique value.'));
	translates.push(new TranslateMember('error.equal.values.currency', 'ERROR_CURRENCY_EQUAL_VALUE', 'You have tiers with matching values for the same currency. Each tier for a given currency must have a unique amount.'));
	translates.push(new TranslateMember('error.elig.limitcurr.mismatch', 'ERROR_ELIGIBILITY_AND_LIMITCURR_MISMATCH', 'Every discount tier must include a setting for each currency you have used to define eligibility. Please add settings for the currencies you have not included in your discount tiers.'));
	translates.push(new TranslateMember('error.elig.promooffer.mismatch', 'ERROR_ELIGIBILITY_AND_PROMO_OFFER_MISMATCH', 'Every discount tier must include a setting for each currency you have used to define eligibility. Please add settings for the currencies you have not included in your discount tiers.'));
	translates.push(new TranslateMember('error.incomplete.currency.limits', 'ERROR_INCOMPLETE_CURR_LIMITS', 'Cannot save. Please provide the discount limit for other minimum purchase currencies'));


	'Cannot save. Mismatch found in eligibility and limit currencies.'

	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup = new TranslateHelper(translates);
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER1  = 'Tier 1';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER2  = 'Tier 2';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER3  = 'Tier 3';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER4  = 'Tier 4';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER5  = 'Tier 5';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER6  = 'Tier 6';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER7  = 'Tier 7';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER8  = 'Tier 8';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER9  = 'Tier 9';
	TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER10 = 'Tier 10';
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_OS_TieredDiscount_AddNewOrderPopup);
if (TranslateInit) TranslateInit();

function pageInit(type)
{
	var tierlabels = [];
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER1);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER2);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER3);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER4);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER5);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER6);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER7);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER8);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER9);
	tierlabels.push(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.TEXT_TIER10);

	var context = nlapiGetContext();
	var multicurrencyON = context.getFeature('MULTICURRENCY');
	if(multicurrencyON){
		currencyList = JSON.parse(nlapiGetFieldValue('custpage_currencies'));
		limitListObj = JSON.parse(nlapiGetFieldValue('custpage_currencies_limit'));
	}
	else{
		var url = window.location.href; 
		var index = url.indexOf('/app');
		var linkprefix = url.substring(0, index);
		var headerinfo = {};
		headerinfo['User-Agent-x'] = 'SuiteScript-Call';
		var urlformapping = nlapiResolveURL('SUITELET', 'customscript_advpromo_currency_symbol_sl', 'customdeploy_advpromo_currency_symbol_sl');
		var requestUrl = linkprefix + urlformapping;
		var urlResponse = nlapiRequestURL(requestUrl, null, headerinfo); 
		var responseBody = urlResponse.getBody();

		currencyList = new Array();
		limitListObj = new Array();
		
		currencyList.push({"value":1, "text":responseBody});
		limitListObj.push({"value":1, "text":responseBody});
	}	
	
	currencyList.sort(function (a, b) {
		if ((a.value == 0) && (b.value != 0)) return -1;
		else if ((a.value != 0) && (b.value == 0)) return 1;
		else if (a.text.toLocaleUpperCase() < b.text.toLocaleUpperCase()) return -1;
		else if (a.text.toLocaleUpperCase() > b.text.toLocaleUpperCase()) return 1;
		else return 0;
	});

	var tiers = window.parent.AdvPromo.PromotionCs.tiers;
	var amtValues = [], curValues = [], dummyValues = [], limitValues = [], limitCur = [], itemIds = [];
	var isPercent = false, hasDiscount = false, isUnit = false; 
	var toggleValue, curr, tb, limitUnit = "";
	var rowRef = window.parent.AdvPromo.PromotionCs.globalParam['31_tablerow'];

	if(rowRef == undefined){
		rowRef = 0;
	}

	for(var i=rowRef; i<tiers.length; i++){
		var amt =[];
		var cur =[];
		isPercent = false;
		hasDiscount = false;
		isUnit = false;

		if(tiers[i].disc == null){	// copy elig setup for currency
			if(tiers[i].elig[0].cur == ""){
				isPercent = true;	// set default to percent in popup display
			}else{
				for(var j=0; j<tiers[i].elig.length; j++){
					cur.push(parseInt(tiers[i].elig[j].cur));
				}
			}

		}else{	// load discount setup per tier
			hasDiscount = true;
			// load selected items
			if(parseInt(tiers[i].disatype) == 1){
				itemIds = parseInt(tiers[i].dsid);
			}else{
				itemIds = tiers[i].diid.split(",");
			}

			// check if promo is in currency or in percent
			if(tiers[i].disc[0].ocur == ""){	// promo offer is in percent
				amt.push(tiers[i].disc[0].offer);
				isPercent = true;

				if(tiers[i].disc[0].lcur == ""){	// limit is either in unit or in percent
					isUnit = true;
					if(tiers[0].disc[0].limit != ""){
						limitUnit = tiers[0].disc[0].limit;
					}
				}else{
					limitValues = [];
					limitCur = [];
					for(var j=0; j<tiers[0].disc.length; j++){
						limitValues.push(tiers[0].disc[j].limit);
						limitCur.push(parseInt(tiers[0].disc[j].lcur));
					}
				}
			}else{	// promo offer is in currency, limit is in units
				for(var j=0; j<tiers[i].disc.length; j++){
					amt.push(tiers[i].disc[j].offer);
					cur.push(parseInt(tiers[i].disc[j].ocur));
				}
				isUnit = true;
				if(tiers[0].disc[0].limit != ""){
					limitUnit = tiers[0].disc[0].limit;
				}
			}
		}

		amtValues.push(amt);
		dummyValues.push('');
		if(isUnit){
			if(limitUnit != ""){
				limitValues = [limitUnit];
			}
		}
		if(isPercent){
			continue;
		}
		curValues.push(cur);
	}

	if(isPercent){
		toggleValue = 0;
		if(hasDiscount){
			tb = new TextboxObjectGroup(tierlabels, 'promoPercent',  'custpage_promo_offer_items', amtValues);
			curr = new ValueUnitObjectGroupEdit(tierlabels,  'promoCurrencyUnit', 'promoAmount', 'custpage_promo_offer_items', currencyList, [], dummyValues);
		}else{
			tb = new TextboxObjectGroup(tierlabels, 'promoPercent',  'custpage_promo_offer_items', dummyValues);
			curr = new ValueUnitObjectGroupEdit(tierlabels,  'promoCurrencyUnit', 'promoAmount', 'custpage_promo_offer_items', currencyList, [], amtValues);
		}
	}else{
		toggleValue = 1;
		if(hasDiscount){
			tb = new TextboxObjectGroup(tierlabels, 'promoPercent',  'custpage_promo_offer_items', dummyValues);
			curr = new ValueUnitObjectGroupEdit(tierlabels,  'promoCurrencyUnit', 'promoAmount', 'custpage_promo_offer_items', currencyList, curValues, amtValues);
		}else{
			tb = new TextboxObjectGroup(tierlabels, 'promoPercent',  'custpage_promo_offer_items', amtValues);
			curr = new ValueUnitObjectGroupEdit(tierlabels,  'promoCurrencyUnit', 'promoAmount', 'custpage_promo_offer_items', currencyList, curValues, amtValues);
		}
	}

	var offerToggle = new ToggleSelector('promoSelector', 'custpage_promo_offer_items', 'Promo Offer', ['%', 'Currency' ],[tb, curr], toggleValue);
	$.selectPercent = tb;
	$.selectCurr = curr;
	$.selectOffer = offerToggle;

	var selectOptions = limitListObj;
	var containerId='custpage_limit_items';

	var theLabel = new LabelWithHelp(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.LABEL_DISCOUNT_UPTO, 'custpage_advpromo_upto');

	if(limitValues.length != 0 && limitCur.length != 0){
		inputBoxValues = limitCur;
		selectedValues = limitValues;
		limitValues = [];
		var selector = new ValueUnitObject(theLabel, 'currencyUnitt', 'amountt', containerId, selectOptions, inputBoxValues, selectedValues);
	}else{
		var selector = new ValueUnitObject(theLabel, 'currencyUnitt', 'amountt', containerId, selectOptions);
	}

	$.selector = selector;

	// add select change event for the id=offerselect combobox
	$('#offerSelect').change(
			function()
			{
				if ($('#offerSelect option:selected').val() == 0)
					$('#custpage_limit_items').show();
				// hide the element if the discount offer is in currency
				else 
					$('#custpage_limit_items').hide();
			}).change();

	// hide the 'Add' link
	addAnotherLink = $('html > body > div:nth-child(4) > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > table > tbody > tr > td > span > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(11) > td:nth-child(2) > a');
	addAnotherLink.hide();
	
	prettifyLayout();
}

function cancelDiscountItem(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function addNewOrder()
{
	// discount values	
	var DiscountLines = function(){
		this.id = null;
		this.op = 'A';  // this record exists in db
		this.offer = 0;
		this.ocur = '';
		this.limit = 0;
		this.lcur = '';
		this.eref = -1;	// reference to the corresponding elig line no
	};

	var sOffer = $.selectOffer.getSelectedValue();	// whether currency or percent
	var values = [], tiers = [], limitVal = [];

	if(sOffer == 0){	// promo is in percent

		values = $.selectPercent.getValues();
		limitVal = $.selector.getValues();

		// validate percent promo fields
		if(!validatePercentFields(values)) 
			return;

		// validate limit fields
		if (!validateLimitEntries(limitVal))
			return;

		// check if there is at least one discount limit provided for the set of available currencies
		var currLimits = 0;
		for (var i = 0; i < limitVal.length; i++)
		{
			if (limitVal[i].value != '')
				currLimits++;
		}

		// get the discount values
		for(var i=0; i<values.length; i++){
			var disc = [];

			for(j=0; j<limitVal.length; j++){

				// skip if discount limit is not provided for some currency units
				if (limitVal[j].value == '')
				{
					if (currLimits > 0 || (currLimits == 0 && j != 0))
						continue;
				}

				var discObj = new DiscountLines();
				discObj.offer = values[i];
				discObj.limit = limitVal[j].value == '' ? '' : limitVal[j].value;
				if(limitVal[j].value != ''){
					discObj.lcur = parseInt(limitVal[j].key);
				}
				
				disc.push(discObj);
			}

			tiers.push(disc);
		}

		if (currLimits >= window.parent.AdvPromo.PromotionCs.tiers[0].elig.length)
		{
			if(!isEligibilityAndLimitCurrencyMatched(window.parent.AdvPromo.PromotionCs.tiers, limitVal)){
				alert(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.ERROR_ELIGIBILITY_AND_LIMITCURR_MISMATCH);// ToDo: Translation
				return;
			}
		}	
		else
		{
			// check if the limits for all the eligible order currencies were provided
			if (currLimits != 0 && window.parent.AdvPromo.PromotionCs.tiers[0].elig[0].cur != '')
			{
				alert(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.ERROR_INCOMPLETE_CURR_LIMITS);// ToDo: Translation
				return;
			}
		}

	}else{	// promo is in currency
		values = $.selectCurr.getValues();
//		limitVal = $.selector.getValues();
		limitVal = '';

		for(var i=0; i<values.length; i++){

			// validate currency promo field
			if(!validateDiscountItemFields(values[i])) 
				return;

			var discLines = values[i];
			var disc = [];
			for(var j=0; j<discLines.length; j++){

				var discObj = new DiscountLines();
				discObj.ocur = parseInt(discLines[j].key);
				discObj.offer = discLines[j].value;
				discObj.limit = limitVal == '' ? '' : limitVal;			// if promo is currency, discount is always in units
				disc.push(discObj);
			}
			tiers.push(disc);
		}

		// validate matching of eligibility and discount currencies
		if(!isEligibilityAndDiscountCurrencyMatched(window.parent.AdvPromo.PromotionCs.tiers, tiers)){
			alert(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.ERROR_ELIGIBILITY_AND_PROMO_OFFER_MISMATCH);// ToDo: Translation
			return;
		}
	}

	// validate if tierred discounts are arranged in the increasing order
	if  (!IsTierredDiscountsIncremental(tiers))
		return;

	window.parent.AdvPromo.PromotionCs.addTierDiscountItem(tiers, [], 2);

	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

//check if the tierred discounts are arranged in the increasing order
function IsTierredDiscountsIncremental(tiers)
{
	var tierLength = tiers.length;
	var discount = tiers[0];

	if (discount[0].ocur == '')
	{
		var originalValues = [];

		// store the original tierred values in an array
		for (var i = 0; i < tierLength; i++)
		{
			originalValues.push(tiers[i][0].offer);
		}

		// check if the elements are in the increasing order
		for (var i = 0; i < tierLength - 1; i++)
		{
			if (parseFloat(originalValues[i]) >= parseFloat(originalValues[i + 1]))
			{
				if (parseFloat(originalValues[i]) == parseFloat(originalValues[i + 1]))
					alert(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.ERROR_UNITS_EQUAL_VALUE);

				if (parseFloat(originalValues[i]) > parseFloat(originalValues[i + 1]))
					alert(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.ERROR_VAUES_NOT_INCREMENTAL);

				return false;
			}
		}
	}
	else
	{
		// dictionary of tierred values
		// key = currency label and value = array of tierred values
		var tierredValues = {};
		var currencies = [];

		var dcount = discount.length;

		// store the currncy label for the tierred values
		for (var i = 0; i < dcount; i++)
		{
			currencies.push(discount[i].ocur);

			// initialize the variables that will hold the tierread values
			tierredValues[discount[i].ocur] = [];
		}

		// stores the tierred values into an array grouped according to their currency label
		for (var i = 0; i < tierLength; i++)
		{
			discount = tiers[i];
			for (var j = 0; j < dcount; j++)
				tierredValues[discount[j].ocur].push(discount[j].offer);
		}

		// check if the elements are in the increasing order
		for (var i = 0; i < currencies.length; i++)
		{
			for (var j = 0; j < tierLength - 1; j++)
			{
				if (parseFloat(tierredValues[currencies[i]][j]) >= parseFloat(tierredValues[currencies[i]][j + 1]))
				{
					if (parseFloat(tierredValues[currencies[i]][j]) == parseFloat(tierredValues[currencies[i]][j + 1]))
						alert(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.ERROR_CURRENCY_EQUAL_VALUE);		

					if (parseFloat(tierredValues[currencies[i]][j]) > parseFloat(tierredValues[currencies[i]][j + 1]))
						alert(TRANS_CS_OS_TieredDiscount_AddNewOrderPopup.ERROR_VAUES_NOT_INCREMENTAL);

					return false;
				}
			}
		}
	}

	return true;
}

//check if discount currencies are matched with defined eligibility currencies
function isEligibilityAndDiscountCurrencyMatched(eligTiers, discTiers){

	// verify if eligibility and discount have same number of tiers
	if(eligTiers.length != discTiers.length){
		return false;
	}

	for(var i = 0; i < eligTiers.length; i++){// traverse list of tiers
		var dCurMap = {};
		var elig = eligTiers[i].elig;// get current tier's list of eligibilities
		var disc = discTiers[i];// get current tier's list of discounts

		// sample first eligibility. if cur="", then all eligibilities are in units. no need to proceed with validation
		if(elig[0].cur == ""){
			return true;
		}

		// check if eligibilities and discounts have the same count
		if(elig.length != disc.length){
			return false;
		}

		// create hash map currencyId=discIndex
		// currencyId = internal id of currency
		// discIndex = array index of currencyId in disc[]
		for ( var j = 0; j < disc.length; j++) {
			if (!dCurMap.hasOwnProperty(disc[j].ocur)) {
				dCurMap[disc[j].ocur] = j;
			}
		}

		for(var j = 0; j < elig.length; j++){// traverse list of eligibilities
			var discIndex = Number(dCurMap[elig[j].cur]);// get discIndex mapped to currencyId of this eligibility
			if(isNaN(discIndex)){// if currencyId has no discIndex value (not in hash map)
				return false;
			}
		}
	}

	return true;
}

//check if limit currencies are matched with defined eligibility currencies
function isEligibilityAndLimitCurrencyMatched(eligTiers, limits){

	var lCurMap = {};
	var elig = eligTiers[0].elig;// get first tier's list of eligibilities as sample (since all tiers have same currencies)

	// sample first eligibility. if cur="", then all eligibilities are in units. no need to proceed with validation
	if(elig[0].cur == ""){
		return true;
	}

	var filledLimits = [];
	for (var i = 0; i < limits.length; i++)
		if (limits[i].value != '')  
			filledLimits.push(limits[i]);

	// check if eligibilities and limits have the same count
	if(elig.length != filledLimits.length)
		return false;

	// create hash map currencyId=limitsIndex
	// currencyId = internal id of currency
	// limitsIndex = array index of currencyId in limits[]
	for ( var i = 0; i < filledLimits.length; i++) 
	{
		if (!lCurMap.hasOwnProperty(filledLimits[i].key)) {
			lCurMap[filledLimits[i].key] = i;
		}
	}

	for(var i = 0; i < elig.length; i++){// traverse list of eligibilities
		var limitIndex = Number(lCurMap[elig[i].cur]);// get limitsIndex mapped to currencyId of this eligibility
		if(isNaN(limitIndex)){// if currencyId has no limitsIndex value (not in hash map)
			return false;
		}
	}

	return true;
}

function prettifyLayout(){

	// to fix layout of Promotional Offer
//	var promoOffer = $('html > body > div:nth-child(4) > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > span > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1)');
	var promoOffer = $('#custpage_outer_table_val > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1)');
	promoOffer.empty();
	promoOffer.append('<div class="smallgraytextnolink" style="text-align: right; float:left; margin: 2px 0 0 30px">Promo Offer</div>');
	promoOffer.append('<div style="float:left; margin: 0 0 0 3px"></div>');

//	var offerSelectDiv = $('html > body > div:nth-child(4) > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > span > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1) > div:nth-child(2)');
	var offerSelectDiv = $('#custpage_outer_table_val > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1) > div:nth-child(2)');
	var offerSelect = $('#offerSelect');
	promoOffer.append('<div style="clear:both"></div>');

	offerSelectDiv.append(offerSelect);
}
