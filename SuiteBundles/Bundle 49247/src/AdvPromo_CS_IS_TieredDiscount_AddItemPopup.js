/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Jun 2012     gguillen
 *
 */

var TRANS_CS_IS_TieredDiscount_AddItemPopup = {};
function init_CS_IS_TieredDiscount_AddItemPopup() {
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
	translates.push(new TranslateMember('error.promo.offer', 'ERROR_PROMO_OFFER', 'You can only set the limit to units for currency-based promo offers. Please change either the promo offer or limit to continue saving this setting.')); // new translation string
	translates.push(new TranslateMember('error.currency.limit', 'ERROR_CURRENCY_LIMIT', 'You have selected limit currencies not found in your Eligibility settings. Please remove them to continue saving this setting.')); // new translation string
	translates.push(new TranslateMember('error.currency.promo', 'ERROR_CURRENCY_PROMO', 'You have used currencies that you did not use to define eligibility for this promotion. Tiered promotion discounts must use the same currencies used to define the eligibility for this promotion.')); // new translation string
	translates.push(new TranslateMember('error.discount.limit', 'ERROR_DISCOUNT_LIMIT', 'Please input values for all selected currencies to continue saving this setting. If you do not wish to set a limit for this promo offer, click the Limit radio button.')); // new translation string
	
	// new error string
	translates.push(new TranslateMember('error.not.incremental', 'ERROR_VAUES_NOT_INCREMENTAL', 'Tier values must be in increasing order.'));
	translates.push(new TranslateMember('error.equal.values.unit', 'ERROR_UNITS_EQUAL_VALUE', 'You have tiers with matching values. Each tier must have a unique value.'));
	translates.push(new TranslateMember('error.equal.values.currency', 'ERROR_CURRENCY_EQUAL_VALUE', 'You have tiers with matching values for the same currency. Each tier for a given currency must have a unique amount.'));
	
	translates.push(new TranslateMember('text.please.wait', 'TEXT_PLEASE_WAIT', 'Please Wait'));
	translates.push(new TranslateMember('text.loading.page', 'TEXT_LOADING_PAGE', 'Loading page...'));
	translates.push(new TranslateMember('text.percent.completed', 'TEXT_PERCENT_COMPLETED', 'completed'));
	translates.push(new TranslateMember('text.discount.on.highest', 'TEXT_DISCOUNT_ON_HIGHEST', 'Apply Discount to Highest Valued Item'));
	
	TRANS_CS_IS_TieredDiscount_AddItemPopup = new TranslateHelper(translates);
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER1  = 'Tier 1';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER2  = 'Tier 2';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER3  = 'Tier 3';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER4  = 'Tier 4';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER5  = 'Tier 5';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER6  = 'Tier 6';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER7  = 'Tier 7';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER8  = 'Tier 8';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER9  = 'Tier 9';
	TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER10 = 'Tier 10';
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_TieredDiscount_AddItemPopup);
if (TranslateInit) TranslateInit();

Ext.MessageBox.show({
	title: TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_PLEASE_WAIT,
	msg: TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_LOADING_PAGE + '...',
	progressText: '0% ' + TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_PERCENT_COMPLETED,
	progress:true,
	closable:false,
	width:300
});

var currencyList;
var limitListObj;
var fromItem = 'F', fromItemSearch = 'F';

function pageInit(type){
	var tierlabels = [];
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER1);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER2);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER3);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER4);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER5);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER6);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER7);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER8);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER9);
	tierlabels.push(TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_TIER10);

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

	// check info on 'Apply Discount to Highest Valued Item' field
	if(tiers && tiers.length > 0){
		// check tier 1's discount info
		if(tiers[0] && tiers[0].disc && tiers[0].disc.length > 0){
			// set default value of 'Apply Discount to Highest Valued Item' field
			if(tiers[0].disc[0].discHighest == 'T'){
				nlapiSetFieldValue('custpage_advpromo_disc_on_highest', 'T');
			}
		}
	}
	
	// handle Edit mode behvior of forcing the old value for the 'Apply Discount to Highest Valued Item' field
	if(nlapiGetFieldValue('custpage_promo_id') && window.parent.AdvPromo.PromotionCs.origDiscountOnHighest == 'T'){
		nlapiSetFieldValue('custpage_advpromo_disc_on_highest', 'T');
	}
	
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

			// if this is a new discount definition, set default limit (radio) to unit
			isUnit = true;

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
						limitUnit = tiers[0].disc[0].limit == '' ? '' : tiers[0].disc[0].limit; // retain empty string to avoid NaN result in parseInt
					}
				}else{
					limitValues = [];
					limitCur = [];
					for(var j=0; j<tiers[0].disc.length; j++){
						limitValues.push(tiers[0].disc[j].limit == '' ? '' : tiers[0].disc[j].limit); // retain empty string to avoid NaN result in parseInt
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

	if(itemIds != null || itemIds.length != 0){
		fromItem = nlapiGetFieldValue('custpage_advpromo_tier_item_flag');
		fromItemSearch = nlapiGetFieldValue('custpage_advpromo_tier_itemsearch_flag');

		if(fromItem == 'T'){
			nlapiSetFieldValues('custpage_advpromo_items_mselect', itemIds);
		}
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


	//promo offer
	var theLabel = new LabelWithHelp(TRANS_CS_IS_TieredDiscount_AddItemPopup.LABEL_PROMO_OFFER, 'custpage_advpromo_promo');

//	if(parent.nlapiGetFieldText('customform') == "Buy X Get Y Promotion Form"){
//		var theLabel = new LabelWithHelp(TRANS_CS_IS_TieredDiscount_AddItemPopup.LABEL_LIMIT, 'custpage_advpromo_limit');
//		$.allLimitForm = new TextboxObject(theLabel, 'limitAmount', 'custpage_limit_items', '');
//
//		$.allPromoForm.register($.allLimitForm); // allLimitForm is registered as an observer of allPromoForm
//	} else {
		var selectOptions = limitListObj;
		var selectedValues = [""];
		var inputBoxValues = [""];

		var selectBoxPrefix='currencyUnit', valuePrefix='amount', containerId='custpage_limit_items';
		var theLabel = "", defaultRadio = 0;

		if(!isUnit){
			defaultRadio = 1;
		}


		if(limitValues.length != 0){
			if(limitCur.length != 0) 
			{
				inputBoxValues = limitCur;
				selectedValues = limitValues;
				limitValues = [];
			}
			valueBox = new TextboxObject(theLabel, valuePrefix, containerId, limitValues);
			var selector = new ValueUnitObject(theLabel, 'currencyUnitt', 'amountt', containerId, selectOptions, inputBoxValues, selectedValues);
		}else{
			var selector = new ValueUnitObject(theLabel, 'currencyUnitt', 'amountt', containerId, selectOptions);
			valueBox = new TextboxObject(theLabel, valuePrefix, containerId);
		}

		var theLabel1 = new LabelWithHelp(TRANS_CS_IS_TieredDiscount_AddItemPopup.LABEL_LIMIT, 'custpage_advpromo_limit');
		var theLabel2 = new LabelWithHelp(TRANS_CS_IS_TieredDiscount_AddItemPopup.LABEL_DISCOUNT_UPTO, 'custpage_advpromo_upto');
		var labels = new ToggleLabels(theLabel1, theLabel2, '');

		$.allLimitForm = new Toggle(selectBoxPrefix, valuePrefix, containerId, labels, valueBox, selector, defaultRadio);
//		$.selector = selector;
//		$.selectCurr.register($.allLimitForm);	// allLimitForm is registered as an observer of allPromoForm
//	}

	// adjust layout of multiselect
	var z1 = $('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table');
	var z2 = $('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2)');
	z1.find('tbody > tr > td:nth-child(1)').css('width', '100px');
	$('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody').append('<tr></tr>');
	$('#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2)').append(z2);

	prettifyLayout(fromItem);
	fixAlignment(fromItem);
	
	var f = function(v){
		return function(){
		    if(v == 12){
		    	Ext.MessageBox.hide.defer(100, Ext.MessageBox);
		    }
		    else{
		        var i = v/11;
		        Ext.MessageBox.updateProgress(i, Math.round(10*i)+'% ' + TRANS_CS_IS_TieredDiscount_AddItemPopup.TEXT_PERCENT_COMPLETED);
		    }
		};
   	};
   	
   	for(var i = 1; i < 13; i++){
   		setTimeout(f(i), i*100);
   	}
   	
   	Ext.get("div__body").dom.style.visibility="visible";
}

function fixAlignment(fromItem){
	if(fromItem){
		// adjustments on Promotional Offer and Limit/Up to fields
		// set size of 1st column of offer field on Promotional Offer table
		var styles = {'width': '212px', 'padding-right': '4px'};
		$('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1)').css(styles); 
		
		// set size of 1st column of tier fields on Promotional Offer table
		styles = {'width': '242px', 'padding-right': '4px'};
		$('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(1)').css(styles); 
		
		// set size of 1st column of tier fields on Promotional Offer table when in Currency mode
		styles = {'width': '242px', 'padding-right': '4px'};
		$('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1)').css(styles);
		
		// set size of 1st column of Limit/Up To table
		styles = {'width': '89px', 'text-align': 'right', 'vertical-align': 'top'};
		$('#custpage_outer_table_val > table:nth-child(4) > tbody > tr > td:nth-child(1)').css(styles); 
		
		// add padding-right: 5px on 2nd column of Limit/Up To table. also fix vertical alignment
		styles = {'padding-right': '5px', 'vertical-align': 'top', 'width': '150px'};
		$('#custpage_outer_table_val > table:nth-child(4) > tbody > tr > td:nth-child(2)').css(styles);
		
		// make width: 236px of Apply to Highest field since text is wrapping in IE
		$('#custpage_advpromo_disc_on_highest_fs_lbl').parent().css('width', '248px');	
	}
	else{
		// set size of 1st column of offer field on Promotional Offer table
		var styles = {'width': '194px'};
		$('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1)').css(styles); 
		
		var styles = {'width': '222px', 'padding-right': '2px'};
		$('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(1)').css(styles);
		
		// set size of 1st column of tier fields on Promotional Offer table when in Currency mode
		styles = {'width': '223px', 'padding-right': '4px'};
		$('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1)').css(styles);
		
		// set size of 1st column of Limit/Up To table
		styles = {'width': '89px', 'text-align': 'right', 'vertical-align': 'top'};
		$('#custpage_outer_table_val > table:nth-child(4) > tbody > tr > td:nth-child(1)').css(styles);
		
		// add padding-right: 5px on 2nd column of Limit/Up To table. also fix vertical alignment
		styles = {'padding-right': '5px', 'vertical-align': 'top', 'width': '128px'};
		$('#custpage_outer_table_val > table:nth-child(4) > tbody > tr > td:nth-child(2)').css(styles);
		
		// make width: 236px of Apply to Highest field since text is wrapping in IE
		$('#custpage_advpromo_disc_on_highest_fs_lbl').parent().css('width', '228px');	
	}
}

function prettifyLayout(fromItem){
//	alert(fromItem);

	var addAnotherLink;

	if(fromItem){
		// to hide the Add Tier link
		addAnotherLink = $('html > body > div:nth-child(4) > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > span > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(11) > td:nth-child(2) > a');

		// to fix layout of Promotional Offer
		var promoOffer = $('html > body > div:nth-child(4) > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > span > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(1)');
		promoOffer.empty();
		promoOffer.append('<div class="smallgraytextnolink" style="text-align: right; float:left; margin: 2px 0 0 30px">' + TRANS_CS_IS_TieredDiscount_AddItemPopup.LABEL_PROMO_OFFER + '</div>');
		promoOffer.append('<div style="float:left; margin: 0 0 0 3px"></div>');

		var offerSelectDiv = $('html > body > div:nth-child(4) > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > span > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(1) > div:nth-child(2)');
		var offerSelect = $('#offerSelect');
		promoOffer.append('<div style="clear:both"></div>');

		offerSelectDiv.append(offerSelect);
	}
	else{
		// to hide the Add Tier link
		addAnotherLink = $('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(11) > td:nth-child(2) > a');

		// to fix layout of Promotional Offer
		var promoOffer = $('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(1)');
		promoOffer.empty();
		promoOffer.append('<div class="smallgraytextnolink" style="text-align: right; float:left; margin: 2px 0 0 30px">' + TRANS_CS_IS_TieredDiscount_AddItemPopup.LABEL_PROMO_OFFER + '</div>');
		promoOffer.append('<div style="float:left; margin: 0 0 0 3px"></div>');

		var offerSelectDiv = $('#custpage_outer_table_val > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(1) > div:nth-child(2)');
		var offerSelect = $('#offerSelect');
		promoOffer.append('<div style="clear:both"></div>');

		offerSelectDiv.append(offerSelect);
	}

	// to hide the Add Tier link
	addAnotherLink.hide();

//	alert('end');	
}

function cancelDiscountItem(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
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

	// check if eligibilities and limits have the same count
	if(elig.length != limits.length){
		return false;
	}

	// create hash map currencyId=limitsIndex
	// currencyId = internal id of currency
	// limitsIndex = array index of currencyId in limits[]
	for ( var i = 0; i < limits.length; i++) {
		if (!lCurMap.hasOwnProperty(limits[i].key)) {
			lCurMap[limits[i].key] = i;
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
					alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_UNITS_EQUAL_VALUE);

				if (parseFloat(originalValues[i]) > parseFloat(originalValues[i + 1]))
					alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_VAUES_NOT_INCREMENTAL);

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
						alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_CURRENCY_EQUAL_VALUE);		

					if (parseFloat(tierredValues[currencies[i]][j]) > parseFloat(tierredValues[currencies[i]][j + 1]))
						alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_VAUES_NOT_INCREMENTAL);

					return false;
				}
			}
		}
	}
	
	return true;
}

function addItemSearch()
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
		this.discHighest = '';
	};

	var sOffer = $.selectOffer.getSelectedValue();	// whether currency or percent
	var values = [], tiers = [], limitVal = [];
	var discountOnHighest = nlapiGetFieldValue('custpage_advpromo_disc_on_highest');

	if (fromItem == 'T')
	{
		var itemSelect = nlapiGetFieldValues('custpage_advpromo_items_mselect');

		// check that items must be mandatory
		if(itemSelect == null || itemSelect == ''){
			alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_ITEM);
			return;
		}

		// check if valid items
		if(!isValidItemTypes(itemSelect)){
			alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_DISCOUNT_ITEM);
			return;
		}
	}

	if(parent.nlapiGetFieldText('customform') == "Buy X Get Y Promotion Form"){
		if($.allLimitForm.getValues() instanceof Array){ 
			alert('You can only set the limit to units for this type of promotion');
			return;
		}
	}

	if(sOffer == 0){	// promo is in percent
		values = $.selectPercent.getValues();
		limitVal = $.allLimitForm.getValues();

		// validate percent promo fields
		if(!validatePercentFields(values)) 
			return;

		// validate limit fields
		if (!validateLimitEntries(limitVal))
			return;

		if(limitVal instanceof Array){	// discount is in currency

			for(var i=0; i<values.length; i++){

				var disc = [];
				for(j=0; j<limitVal.length; j++){

					// if current limit is empty, return error and require a value to proceed
					// if user does not want to provide any limit values but selected 'Up to a Total Discount Of' radio, force him to select 'Limit' radio instead
					if(limitVal[j].value == ''){
						alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_DISCOUNT_LIMIT);
						return;
					}

					var discObj = new DiscountLines();
					discObj.offer = values[i];
					discObj.limit = limitVal[j].value == '' ? '' : limitVal[j].value; // retain empty string to avoid NaN result in parseInt
					discObj.lcur = parseInt(limitVal[j].key);
					disc.push(discObj);
				}
				tiers.push(disc);
			}

			// validate matching of eligibility and limit currencies
			if(!isEligibilityAndLimitCurrencyMatched(window.parent.AdvPromo.PromotionCs.tiers, limitVal)){
				alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_CURRENCY_LIMIT);
				return;
			}

		}else{	// discount is in units

			for(var i=0; i<values.length; i++){

				var discObj = new DiscountLines();
				discObj.offer = values[i];
				discObj.limit = limitVal == '' ? '' : limitVal;  // retain empty string to avoid NaN result in parseInt
				tiers.push([discObj]);
			}
		}

	}else{	// promo is in currency
		values = $.selectCurr.getValues();
		limitVal = $.allLimitForm.getValues();

		if(limitVal instanceof Array){ // do not allow if limit is set to currency (since promo offer is currency)
			alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_PROMO_OFFER);
			return;
		}

		// validate limit fields
		if (!validateLimitEntries(limitVal))
			return;

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
				discObj.limit = limitVal == '' ? '' : limitVal; // if promo is currency, discount is always in units, retain empty string to avoid NaN result in parseInt
				disc.push(discObj);
			}
			tiers.push(disc);
		}

		// validate matching of eligibility and promo offer currencies
		if(!isEligibilityAndDiscountCurrencyMatched(window.parent.AdvPromo.PromotionCs.tiers, tiers)){
			alert(TRANS_CS_IS_TieredDiscount_AddItemPopup.ERROR_CURRENCY_PROMO);
			return;
		}
		
	}
	
	// validate if tierred discounts are arranged in the increasing order
	if  (!IsTierredDiscountsIncremental(tiers))
		return;

	// update tiers variable and add the new flag for discount on highest.
	// tiers is an array of array. sample format: [[{"id":null,"op":"A","offer":"1","ocur":"","limit":"","lcur":"","eref":-1,"discHighest":""}],[{"id":null,"op":"A","offer":"2","ocur":"","limit":"","lcur":"","eref":-1,"discHighest":""}]]
	if(discountOnHighest == 'T'){
		for(var i = 0; i < tiers.length; i++){
			for(var j = 0; j < tiers[i].length; j++){
				tiers[i][j].discHighest = 'T';
			}	
		}
	}
	
	if(fromItemSearch == 'T'){
		var itemSelect = nlapiGetFieldValue('custpage_advpromo_itemsearch_dropdown');	// this is a required field, needs validation on this
		var itemSelectText = nlapiGetFieldText('custpage_advpromo_itemsearch_dropdown');	// this is a required field, needs validation on this
		window.parent.AdvPromo.PromotionCs.addTierDiscountItem(tiers, [itemSelect, itemSelectText], 1);	// itemAddType: 1 = item search, 2 = item
	}else if(fromItem == 'T'){
		var itemSelect = nlapiGetFieldValues('custpage_advpromo_items_mselect');	// this is a required field, needs validation on this
		window.parent.AdvPromo.PromotionCs.addTierDiscountItem(tiers, itemSelect, 2);	// itemAddType: 1 = item search, 2 = item
	}

	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}
