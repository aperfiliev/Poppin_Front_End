/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Feb 2012     adimaunahan
 *                            rwong
 */

var TRANS_CS_IS_OrderSpecificEntryForm = {};
function init_CS_IS_OrderSpecificEntryForm() {
	var translates = [];
	translates.push(new TranslateMember('label.purchase.min', 'LABEL_MIN_PURCHASE', 'Minimum Purchase'));
	translates.push(new TranslateMember('label.edit', 'EDIT', 'Edit'));
	translates.push(new TranslateMember('label.remove', 'REMOVE', 'Remove'));
	translates.push(new TranslateMember('label.preview', 'PREVIEW', 'Preview'));
	translates.push(new TranslateMember('label.order.discount.new', 'TEXT_NEW_ORDER_DISC', 'New Order Discount'));
	translates.push(new TranslateMember('label.shipping.discount.new', 'TEXT_NEW_SHIP_DISC', 'New Shipping Discount'));
	translates.push(new TranslateMember('label.shipping.isfree.new', 'NEW_ISFSHIPPING', 'New Item Specific Free Shipping'));
	translates.push(new TranslateMember('label.shipping.item.search.free.new', 'NEW_SS_ISFSHIPPING', 'Select Item Saved Search for Free Shipping'));
	translates.push(new TranslateMember('label.customers.edit', 'POPUP_TITLE_EDIT_SELECT_CUSTOMERS', 'Edit Customer'));
	translates.push(new TranslateMember('label.customers.ss.edit', 'POPUP_TITLE_EDIT_SELECT_CUSTOMER_SAVED_SEARCH', 'Edit Customer Saved Search'));
	translates.push(new TranslateMember('label.order.total.edit', 'EDIT_ORDER_TOTAL', 'Edit Order Total'));
	translates.push(new TranslateMember('label.item.edit', 'EDIT_ITEM', 'Edit Item'));
	translates.push(new TranslateMember('label.item.savedsearch.edit', 'EDIT_SEARCH_ITEM', 'Edit Item Saved Search'));
	translates.push(new TranslateMember('text.off', 'TEXT_OFF', 'Off'));
	translates.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates.push(new TranslateMember('text.on', 'TEXT_ON', 'on'));
	translates.push(new TranslateMember('text.units', 'TEXT_UNITS', 'Units'));
	translates.push(new TranslateMember('text.order.discount', 'TEXT_ORDER_DISC', 'Order Discount'));
	translates.push(new TranslateMember('text.shipping.discount', 'TEXT_SHIPPING_DISC', 'Shipping Discount'));
	translates.push(new TranslateMember('text.savedsearch', 'TEXT_SAVED_SEARCH', 'Saved Search'));
	translates.push(new TranslateMember('text.none', 'TEXT_NONE', '-None-'));
	translates.push(new TranslateMember('text.search.results', 'TEXT_SEARCH_RESULTS', 'Search Results'));
	translates.push(new TranslateMember('error.minpurch.enter', 'ERROR_MINPURCH_ENTER', 'Please enter value(s) for: Minimum Purchase'));
	translates.push(new TranslateMember('error.minpurch.nan', 'ERROR_MINPURCH_NAN', 'Invalid Minimum Purchase value. Values must be numbers.'));
	translates.push(new TranslateMember('error.minpurch.range', 'ERROR_MINPURCH_RANGE', 'Invalid Minimum Purchase value. Values must be between 0 to 100,000,000,000'));
	translates.push(new TranslateMember('error.create.tiers', 'ERROR_CREATE_TIERS', 'Eligibility and/or discount rules are already defined for this promotion. Please remove all rules to update this field.')); // new translation string
	translates.push(new TranslateMember('confirm.removerow', 'QUERY_REMOVE_ROW', 'Are you sure you want to remove this row?'));
	translates.push(new TranslateMember('confirm.eligibility.edit', 'CONFIRM_ELIGIBILITY_EDIT', 'Changing the eligibility criteria will remove all discount settings. Do you want to continue?')); // new translation string
	// additional translation
	translates.push(new TranslateMember('label.none', 'TRANS_LABEL_NONE', '-None-'));
	translates.push(new TranslateMember('label.order.total.set', 'TRANS_LABEL_ORDER_TOTAL', 'Set Order Total'));
	translates.push(new TranslateMember('label.items.select', 'TRANS_LABEL_SELECT_ITEMS', 'Select Items'));
	translates.push(new TranslateMember('label.items.ss.select', 'TRANS_LABEL_SELECT_ITEM_SS', 'Select Item Saved Search'));
	translates.push(new TranslateMember('label.items.ss.new', 'TRANS_LABEL_NEW_ITEM_SS', 'Create New Item Saved Search'));
	translates.push(new TranslateMember('label.items.ss.order', 'TRANS_LABEL_NEW_ORDER_SS', 'New Order Discount'));
	translates.push(new TranslateMember('label.items.ss.edit_order', 'TRANS_LABEL_EDIT_ORDER_SS', 'Edit Order Discount'));
	translates.push(new TranslateMember('error.create.promotion.standard', 'ERROR_CREATE_PROMOTION_STANDARD', 'You cannot use an Advanced Promotions form after selecting Standard Promotion on the previous page. If you want to create an advanced promotion, go to Lists > Marketing > Promotions > New >, and select an advanced promotion type.'));
	translates.push(new TranslateMember('label.freeshipping', 'TEXT_FREE_SHIPPING', 'Free shipping'));
	translates.push(new TranslateMember('text.and', 'TEXT_AND', 'and'));
	translates.push(new TranslateMember('text.nolimit', 'TEXT_NOLIMIT', 'No Limit'));
	translates.push(new TranslateMember('error.mismatch.currency', 'ERROR_MISMATCH_CURRENCY', 'The discount currency is different from the eligibility currency. Please correct and submit again.'));
	
	TRANS_CS_IS_OrderSpecificEntryForm = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_OrderSpecificEntryForm);
if (TranslateInit) TranslateInit();

var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.PromotionCs = new function () {
	
	var delkeys = [];		// contains internal ids to be deleted in tiers custom record
	var eligibleOrders = [];
	var eligibleOrderPass = null;
	
	this.mainModel = null;
	this.origModel = null;
	this.orderDiscountSublist = new Array();
	this.orderShippingSublist = new Array();
	this.isfShippingSublist = new Array();
	
	this.arr = {};
	this.globalParam = {};
	this.isfShippingObj = '';
	this.origIsfShippingObj = '';
	this.tiers = [];			// sublist object for the tiered promotion data
	
	this.sublistMgr = AdvPromo.SublistManager;
	
	// used by Select Customers popup
	this.eligibleCustomersObj = [];
	this.origEligibleCustomersObj = [];

	this.setEligOrder = function(order) {
		eligOrderPass = order;
	};

	this.getEligOrder = function() {
		var retVal = eligOrderPass;
		eligOrderPass = null;
		return retVal;
	};

	this.objectKeys = function(obj) {
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
	};

	this.isHTMLElement = function(theElement) {
		var HTMLElement;
		if (!theElement) return false;
		if (HTMLElement) {
			return (theElement instanceof HTMLElement);
		} else {
			// For IE < 8 or IE 9 in QuirksMode
			return ((theElement.nodeType == 1) || (theElement.nodeType == 3));
		}
	};

	this.pageInit = function(type){

		if(nlapiGetFieldValue("implementation") == "default" && type == 'create'){	// check if promotion is created via plugin or standard promotion
			alert(TRANS_CS_IS_OrderSpecificEntryForm.ERROR_CREATE_PROMOTION_STANDARD);
			window.history.back();
		}
		
		// disable 'Create Tiers' on edit mode
		if (type == 'edit') {
			nlapiDisableField('custrecord_advpromo_is_tiered', true);
		}

		// hide standard tabs
//		hideTab();

		// Eligibility Customers tab
		AdvPromo.PromotionCs.initEligibilityCustomer(type);

		var tier = nlapiGetFieldValue('custrecord_advpromo_is_tiered');
		if (tier == 'T')
		{
			// disable Create Tiers checkbox
			$('#custrecord_advpromo_is_tiered_fs').removeClass("checkbox_ck");
			$('#custrecord_advpromo_is_tiered_fs').addClass("checkbox_disabled_ck");
			AdvPromo.PromotionCs.tierModeOn();

			AdvPromo.PromotionCs.initTieredData(type);

			if (AdvPromo.PromotionCs.tiers.length != 0) { // disable select options if  sublist is not empty
				nlapiRemoveSelectOption('custpage_advpromo_addorder', '1');
				nlapiRemoveSelectOption('custpage_advpromo_addorder', '2');
				nlapiRemoveSelectOption('custpage_advpromo_addorder', '3');
				nlapiRemoveSelectOption('custpage_advpromo_addorder', '4');
			}
			
			nlapiRemoveSelectOption('custpage_advpromo_discount_item', '4');
		}
		else {
			AdvPromo.PromotionCs.tierModeOff();

			var modelJson = nlapiGetFieldValue('custpage_advpromo_discount_json_item');
			var shipJson = nlapiGetFieldValue('custpage_advpromo_discount_json_shipmethod');

			if(modelJson != null && modelJson != ''){
				AdvPromo.PromotionCs.renderOrderSublist(JSON.parse(modelJson));
				AdvPromo.PromotionCs.origModel = AdvPromo.PromotionCs.mainModel;
			}

			if(shipJson != null && shipJson != ''){
				AdvPromo.PromotionCs.renderShippingSublist(JSON.parse(shipJson));
			}

			AdvPromo.PromotionCs.renderEligibleOrders(type);
		}
		
		// for Item Specific Free Shipping
		showFreeShippingRuleInSublist(TRANS_CS_IS_OrderSpecificEntryForm);
	};
	
	this.renderEligibleOrders = function(type) {
		if ((type == 'edit')||(type == 'view')) {
			var orders = JSON.parse(nlapiGetFieldValue('custpage_advpromo_discount_json_order'));
			if (!(orders instanceof Array)) return;
			for (var i = 0; i < orders.length; i++) { 
				AdvPromo.PromotionCs.addRowOrderTab(orders[i]);
			}
		}
	};

	this.getItemDescriptionFormat = function(id) {
		var ids = id.split(",");
		var desc = "";
		for ( var i = 0; i < ids.length; i++) {
			if (desc == "") {
				desc = nlapiLookupField('item', ids[i], 'name');
			} else {
				desc = desc + " or " + nlapiLookupField('item', ids[i], 'name');
			}
		}
		return desc;
	};

	this.initTieredData = function(type) {
		if ((type == 'edit') || (type == 'view')) {

//			AdvPromo.PromotionCs.globalParam['31_tablerow'] = 0;

			AdvPromo.PromotionCs.tiers = JSON.parse(nlapiGetFieldValue('custpage_advpromo_tier_json_order_disc'));
			var itemOr = "";
			var discItemOr = "";
			var renderLink = false;
			var renderEdit = true;

			AdvPromo.PromotionCs.orderSpecProperties.tiers = AdvPromo.PromotionCs.tiers.length;

			// process tiers for sublist display
			for ( var i = 0; i < AdvPromo.PromotionCs.tiers.length; i++) {
				if (AdvPromo.PromotionCs.tiers[i].etype == 1) { // item search
					itemOr = AdvPromo.PromotionCs.tiers[i].esdesc;
				} else if (AdvPromo.PromotionCs.tiers[i].etype == 2) {
					itemOr = AdvPromo.PromotionCs.getItemDescriptionFormat(AdvPromo.PromotionCs.tiers[i].eiid); // format eligible items
				}

				if (i == 0) {
					renderLink = true;
				} else {
					renderLink = false;
				}

				// during loading, rowId is the same as objId
				AdvPromo.PromotionCs.addTieredRowOrderTab(AdvPromo.PromotionCs.tiers[i], i, renderLink, i); // display order tab data
				AdvPromo.PromotionCs.addTieredDiscountTab(AdvPromo.PromotionCs.tiers[i], i, renderLink, i, renderEdit); // display discount tab data
			}

			if (itemOr != "") {
				AdvPromo.PromotionCs.addRow('custpage_advpromo_eligible_order_list', [ AdvPromo.PromotionCs.truncateTextField("Item: " + itemOr), "", "", "", "" ]);
			}
			if (discItemOr != "") {
				AdvPromo.PromotionCs.addRow('custpage_advpromo_discount_list', [ AdvPromo.PromotionCs.truncateTextField("Item: " + discItemOr), " ", " ", " ", " ", " " ]);
			}
			
			// render shipping discount
			// custpage_advpromo_discount_json_shipmethod is set from AdvPromo_UE_EntryForm_SS -> beforeLoad, tiered, edit
			var shipJson = nlapiGetFieldValue('custpage_advpromo_discount_json_shipmethod');
			// reused portion of code from initPage
			if(shipJson != null && shipJson != ''){
				AdvPromo.PromotionCs.renderShippingSublist(JSON.parse(shipJson));
			}
		}
	};

	this.getTierDetailsFormat = function(tierLineObj, currencyMap) {
		var minPur = "-none-";
		var promoOffer = "-none-";
		var limit = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT;
		var eligLines = tierLineObj.elig;
		var discLines = tierLineObj.disc;

		//min purchase -> eligibility
		if (eligLines[0].cur == "") { // minimum purchase is in unit
			minPur = "Minimum of " + eligLines[0].amt + " units ";
		} else { //minimum purchase is in currency
			for ( var i = 0; i < eligLines.length; i++) {
				if (minPur == "-none-") {
					minPur = "Minimum of " + eligLines[i].amt + " " + currencyMap[eligLines[i].cur];
				} else {
					minPur = minPur + " or " + eligLines[i].amt + " " + currencyMap[eligLines[i].cur];
				}
			}
		}

		if ((discLines != null) && (discLines.length > 0)) {
			// promotional offer -> discount
			if (discLines[0].ocur == "") {
				promoOffer = discLines[0].offer + " % ";
			} else {
				for ( var i = 0; i < discLines.length; i++) {
					if (promoOffer == "-none-") {
						promoOffer = discLines[i].offer + " " + currencyMap[discLines[i].ocur];
					} else {
						promoOffer = promoOffer + " or " + discLines[i].offer + " " + currencyMap[discLines[i].ocur];
					}
				}
			}

			// limit -> discount
			if (discLines[0].lcur == "") {
				if (discLines[0].limit != "") {
					limit = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT;
				}
			} else {
				if (discLines[0].limit == 0)
				{
					limit = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT;
				}
				else
				{
					for ( var i = 0; i < discLines.length; i++) {
						if (limit == TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT) {
							limit = discLines[i].limit + " " + currencyMap[discLines[i].lcur];
						} else {
							limit = limit + " or " + discLines[i].limit + " " + currencyMap[discLines[i].lcur];
						}
					}
				}
			}
		}

		return [ minPur, promoOffer, limit ];
	};

	this.getCurrencyMap = function() {
		var curMap = {};
		
		var context = nlapiGetContext();
		var multicurrencyON = context.getFeature('MULTICURRENCY');

		if(multicurrencyON){
		var searchFilters = new Array();
		searchFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		var searchColumns = new Array();
		searchColumns[0] = new nlobjSearchColumn('symbol');
		var currencySearch = nlapiSearchRecord('currency', null, searchFilters, searchColumns);

		for ( var i = 0; i < currencySearch.length; i++) {
			var id = currencySearch[i].getId();
			var name = currencySearch[i].getValue('symbol');
			if (!curMap.hasOwnProperty(id)) {
				curMap[id] = name;
			}
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
			
			curMap[1] = responseBody;
		}
		return curMap;
	};

	this.addTieredRowOrderTab = function(tierObj, rowId, renderLink, objId) {
		var rowLine = parseInt(rowId) + 1;
		var sublistName = 'custpage_advpromo_eligible_order_list';
		var theTable = $('#' + sublistName + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();

		var formatText = AdvPromo.PromotionCs.getTierDetailsFormat(tierObj, currencyMap);
		var purchaseOr = formatText[0]; // format minimum purchase
		var promoOr = formatText[1]; // format promotional offer
		var limitOr = formatText[2]; // format limit

		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), objId, 31, sublistName); // param 31, delete tiered row 
		var previewAnch = "";	//A 231273
		var name = 'Tier ' + rowLine;

		switch (parseInt(tierObj.etype)) {
		case 1: // item search
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), objId, 33, sublistName);
			previewAnch = AdvPromo.PromotionCs.makeLink('P', (rows), parseInt(tierObj.esid), null, sublistName);	//A 231273
			break;
		case 2: // item
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), objId, 32, sublistName);
			break;

		case 3: // order total
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), objId, 31, sublistName);
			break;
		}

		// case item search or item
		if (tierObj.etype == 1) { // item search
			if (renderLink) {
				AdvPromo.PromotionCs.addRow(sublistName, [ name, purchaseOr, previewAnch, editAnch, deleteAnch ]); // if type is item search, add preview link	//A 231273
			} else {
				AdvPromo.PromotionCs.addRow(sublistName, [ name, purchaseOr, "", "", "" ]); // if type is item search, add preview link
			}

		} else { // item
			if (renderLink) {
				AdvPromo.PromotionCs.addRow(sublistName, [ name, purchaseOr, "", editAnch, deleteAnch ]); // don't render preview
			} else {
				AdvPromo.PromotionCs.addRow(sublistName, [ name, purchaseOr, "", "", "" ]); // don't render preview
			}
		}
	};

	this.addTieredDiscountTab = function(tierObj, rowId, renderLink, objId, renderEdit) {
		var rowLine = parseInt(rowId) + 1;
		var sublistName = 'custpage_advpromo_discount_list';
		var theTable = $('#' + sublistName + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();

		var formatText = AdvPromo.PromotionCs.getTierDetailsFormat(tierObj, currencyMap);
		var purchaseOr = formatText[0]; // format minimum purchase
		var promoOr = formatText[1]; // format promotional offer
		var limitOr = formatText[2]; // format limit
		var editAnch = "";
		var name = 'Tier ' + rowLine;

		if (renderLink && renderEdit) {
			editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), objId, 43, sublistName);
			AdvPromo.PromotionCs.addRow(sublistName, [ name, promoOr, limitOr, "", editAnch, "" ]);
		} else {
			AdvPromo.PromotionCs.addRow(sublistName, [ name, promoOr, limitOr, "", "", "" ]);
		}
	};

	this.addTierDiscountItem = function(discLines, itemSelect, itemAddType) {

		// case with eligibility, empty discount
		var renderEdit = true;
		var eligLines = [];
		var newTier = [];
		var itemOr = "";
		var discItemOr = "";

		for ( var i = 0; i < AdvPromo.PromotionCs.tiers.length; i++) { // link discLines to tiers
			AdvPromo.PromotionCs.tiers[i].disatype = '';
			AdvPromo.PromotionCs.tiers[i].dsid = '';
			AdvPromo.PromotionCs.tiers[i].diid = '';

			// insert discLine as the new value before pushing to newTier
			AdvPromo.PromotionCs.tiers[i].disc = discLines[i];
			newTier.push(AdvPromo.PromotionCs.tiers[i]);
		}

		AdvPromo.PromotionCs.deleteTieredAllOrdersSublist(0, AdvPromo.PromotionCs.tiers.length);

		//update eligibility data during edit of discount tab, compress redundant items
		for ( var j = 0; j < newTier.length; j++) {
			var elig = newTier[j].elig;
			if (elig[0].cur == "") {
				newTier[j].elig = [ elig[0] ];
			}
			newTier[j].op = 'A';
		}

		var fromEditDiscount = true;
		switch (parseInt(newTier[0].etype)) {
		case 1: // item savedsearch
			AdvPromo.PromotionCs.addOrderItemSearch(newTier, renderEdit, newTier[0].esdesc, fromEditDiscount);
			break;
		case 2: // item 
			AdvPromo.PromotionCs.addOrderItem(newTier, renderEdit, newTier[0].eiid, fromEditDiscount);
			break;
		case 3: // set order total
			AdvPromo.PromotionCs.addOrderTotal(newTier, renderEdit, fromEditDiscount);
			break;
		}

		AdvPromo.PromotionCs.addTierDiscountShipping();

		// delete discount dropdown selection
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '4');
		AdvPromo.PromotionCs.flagChanged();
	};

	this.hideTab = function(){
		/** todo
		 * 	rename custom record field ids
		 */
		$('#minorderamtlnk').hide();
		$('#minorderamt_wrapper').hide();
		ShowTab("custpage_advpromo_eligibility_tab", true);

	};

	this.initEligibilityCustomer = function(type){
		// populate eligibleCustomersObj
		this.sublistMgr.initializeEligibilityCustomerSublistModel(TRANS_CS_IS_OrderSpecificEntryForm);
		
		// render model to sublist
		this.sublistMgr.renderEligibilityCustomerSublistEditMode();
	};

	this.saveRecord = function(){

		if(nlapiGetFieldValue("implementation") == "default"){	// check if promotion is created via plugin or standard promotion
			alert(TRANS_CS_IS_OrderSpecificEntryForm.ERROR_CREATE_PROMOTION_STANDARD);
			return false;
		}
		// eligible customer tab
		var finalEligibleCustomersObj = this.sublistMgr.constructEligibleCustomerDbOperation(AdvPromo.PromotionCs.origEligibleCustomersObj, AdvPromo.PromotionCs.eligibleCustomersObj);
		nlapiSetFieldValue('custpage_advpromo_elig_json_customer', JSON.stringify(finalEligibleCustomersObj));
		
		nlapiSetFieldValue('custrecord_advpromo_customer_criteria', nlapiGetFieldValue('custpage_advpromo_applycriteria'));

		if(AdvPromo.PromotionCs.orderShippingSublist != null && AdvPromo.PromotionCs.orderShippingSublist != ''){
			nlapiSetFieldValue('custpage_advpromo_discount_json_shipmethod', JSON.stringify(shippingModel));
		}
		else{
			nlapiSetFieldValue('custpage_advpromo_discount_json_shipmethod', '');
		}
		
		var isUnit = true;
		var isNoLimit = false;
		var isNoElligibility = false;
		var isNoOrderDiscount = false;
		//array of objects
		var arrEligibility = new Array; 
		if(elligbleOrders && elligbleOrders.length){
			for(var e = 0; e < elligbleOrders.length; e++){
				//get only the fields that are not marked for deletion
				if(elligbleOrders[e].remove != true){
					for(var m = 0; m < elligbleOrders[e].minimumPurchase.length; m++){
						if(elligbleOrders[e].minimumPurchase[m].remove == false){ 
							arrEligibility.push(elligbleOrders[e].minimumPurchase[m])
						}
					}
				}
			}
		}
		//arrEligibility = elligbleOrders && elligbleOrders.length && elligbleOrders[0].minimumPurchase;
		var arrCurrIdEligible = new Array;
		if(arrEligibility.length){
			for(var index = 0; index < arrEligibility.length; index++){
				if(arrEligibility[index].currency != 0){
					isUnit =  isUnit?false:isUnit; // one time flag to check if all legibility are in units
					//avoid duplicates
					if(arrCurrIdEligible.indexOf(arrEligibility[index].currency) == -1){
						arrCurrIdEligible.push(arrEligibility[index].currency);
					}
				}
				
			}
		} else{
			isNoElligibility = true;
		}
		var arrDiscount = AdvPromo.PromotionCs.mainModel?JSON.parse(AdvPromo.PromotionCs.compareModel()):[];
		var  arrCuurIDDiscount = new Array;
		if(arrDiscount.length){
			for(var d = 0; d < arrDiscount.length; d++){
				//if discount by percent and no currency limit, no need to check
				if((!arrDiscount[d].limit || (arrDiscount[d].limit == "")) && arrDiscount[d].isPercent == 'T'){
					isNoLimit = true;
					break;
				}
				arrCuurIDDiscount.push(arrDiscount[d].currId);
			}
		} else {
			isNoOrderDiscount = true;
		}
		//sort arrays
		arrCurrIdEligible.sort();
		arrCuurIDDiscount.sort();
		//check for equality
		//check only if there's something to check	
		if(!isUnit && !isNoLimit && !isNoElligibility && !isNoOrderDiscount) {
			if(arrCurrIdEligible.length !== arrCuurIDDiscount.length){
				alert(TRANS_CS_IS_OrderSpecificEntryForm.ERROR_MISMATCH_CURRENCY);
				return false;
			}
			for(var y = arrCurrIdEligible.length; y--;){
				if(arrCurrIdEligible[y] !== arrCuurIDDiscount[y]){
					alert(TRANS_CS_IS_OrderSpecificEntryForm.ERROR_MISMATCH_CURRENCY);
					return false;
				}
			}
		}
		
		var orders = (elligbleOrders) ? JSON.stringify(elligbleOrders) : '[]';
		nlapiSetFieldValue('custpage_advpromo_discount_json_order', orders);
		nlapiSetFieldValue('custrecord_advpromo_order_criteria', nlapiGetFieldValue('custpage_advpromo_applyto_order'));

		if(AdvPromo.PromotionCs.mainModel == null){
			nlapiSetFieldValue('custpage_advpromo_discount_json_item', '');
		}
		else{
			// cleanup empty currencies in limits
			for(var i = 0; i < AdvPromo.PromotionCs.mainModel.promotionalOfferLimits.length; i++){
				if(AdvPromo.PromotionCs.mainModel.promotionalOfferLimits[i].amount.trim() == ''){
					AdvPromo.PromotionCs.mainModel.promotionalOfferLimits[i].currencyId = null;
				}
			}		

			var mainModelJson = JSON.stringify(AdvPromo.PromotionCs.mainModel);

			var ltext = '';
			for(var i = 0; i < 20; i++){
				ltext += mainModelJson;
			}

//			nlapiSetFieldValue('custpage_advpromo_discount_json_item', AdvPromo.PromotionCs.generateOrderDiscountDbJson());
			nlapiSetFieldValue('custpage_advpromo_discount_json_item', AdvPromo.PromotionCs.compareModel());
		}

		function hasTierDiscount(tiers) {
			for ( var i = 0; i < tiers.length; i++) {
				if (tiers[i].disc == null)
					return false;
			}

			return true;
		}

		// tiered promotion
		if ((AdvPromo.PromotionCs.tiers.length != 0) && !hasTierDiscount(AdvPromo.PromotionCs.tiers)) {
			alert('Please define discount criteria');
			return false;
		}

		var tierObj = AdvPromo.PromotionCs.buildTierJsonObj(AdvPromo.PromotionCs.tiers);
		nlapiSetFieldValue('custpage_advpromo_json_tier_data', JSON.stringify(tierObj));
		nlapiSetFieldValue('custpage_advpromo_json_tier_delkeys', JSON.stringify(delkeys)); // submit internal ids to be deleted

		// for Item Specific Free Shipping
		var finalIsfShippingObj = compareIsfsSublistModels(AdvPromo.PromotionCs.origIsfShippingObj, AdvPromo.PromotionCs.isfShippingObj);
		if(finalIsfShippingObj.op){
			nlapiSetFieldValue('custpage_advpromo_discount_json_isf_ship', JSON.stringify(finalIsfShippingObj));
		}		
		
		return true;
	};

	this.buildTierJsonObj = function(tiers) {
		var tierJsonObjs = [];
		var promoIsCur = true;

		TierRec = function() {
			// create tier header
			this.tid = 0; // tier id
			this.etype = 0; // eligibility type
			this.eiid = null; // eligibility item id
			this.esid = null; // eligibility search id
			this.eamt = 0;
			this.ecur = '';

			this.dtype = 0; // discount type
			this.diatype = 0; //discount item add type;
			this.diid = 0; // discount item id
			this.dsid = 0; // discount search id
			this.offer = 0;
			this.ocur = '';
			this.limit = 0;
			this.lcur = '';

		};

		if (tiers.length != 0 && tiers[0].op != null) {
			// process convert tiers to JsonObj
			for ( var i = 0; i < tiers.length; i++) {
				var dCurMap = {};
				var elig = tiers[i].elig;
				var disc = tiers[i].disc;
				var tierRec;

				// generate currency map for discount list
				if (disc[0].ocur == "") { // promo is in units, limit is in currency
					if (disc[0].lcur != "") {
						dCurMap = AdvPromo.PromotionCs.getDiscountCurrencyMap(disc, !promoIsCur);
					}
				} else { //promo is in currency, limit in units
					dCurMap = AdvPromo.PromotionCs.getDiscountCurrencyMap(disc, promoIsCur);
				}

				for ( var j = 0; j < elig.length; j++) { // navigate thru all the elements in elig x discount list
					var tierRec = new TierRec();
					tierRec.tid = tiers[i].id;
					tierRec.etype = tiers[i].etype;
					tierRec.eiid = tiers[i].eiid;
					tierRec.esid = tiers[i].esid;
					tierRec.eamt = elig[j].amt;
					tierRec.ecur = elig[j].cur;

					tierRec.dtype = tiers[i].dtype;
					tierRec.diatype = tiers[i].disatype;
					tierRec.diid = tiers[i].diid;
					tierRec.dsid = tiers[i].dsid;

					if ((elig[0].cur == "") || (disc[0].ocur == "" && disc[0].lcur == "")) { // check if eligibility is in currency or in units
						if ((disc[0].ocur == "" && disc[0].lcur == "")) {
							tierRec.offer = disc[0].offer;
							tierRec.ocur = disc[0].ocur;
							tierRec.limit = disc[0].limit;
							tierRec.lcur = disc[0].lcur;

							tierJsonObjs.push(tierRec);

						} else {
							for ( var k = 0; k < disc.length; k++) {
								tierRec.offer = disc[k].offer;
								tierRec.ocur = disc[k].ocur;
								tierRec.limit = disc[k].limit;
								tierRec.lcur = disc[k].lcur;
								tierJsonObjs.push(tierRec);

								tierRec = new TierRec();
								tierRec.tid = tiers[i].id;
								tierRec.etype = tiers[i].etype;
								tierRec.eiid = tiers[i].eiid;
								tierRec.esid = tiers[i].esid;
								tierRec.eamt = elig[j].amt;
								tierRec.ecur = elig[j].cur;

								tierRec.dtype = tiers[i].dtype;
								tierRec.diatype = tiers[i].disatype;
								tierRec.diid = tiers[i].diid;
								tierRec.dsid = tiers[i].dsid;
							}
						}
					} else {
						var ref = dCurMap[elig[j].cur];

						if (!ref)
							ref = 0;
						
						tierRec.offer = disc[ref].offer;
						tierRec.ocur = disc[ref].ocur;
						tierRec.limit = disc[ref].limit;
						tierRec.lcur = disc[ref].lcur;
						
						tierJsonObjs.push(tierRec);
					}

				}
			}
		}

		return (tierJsonObjs);
	};

	this.getDiscountCurrencyMap = function(discList, isPromo) {
		dCurMap = {};

		for ( var i = 0; i < discList.length; i++) {
			if (isPromo) {
				if (!dCurMap.hasOwnProperty(discList[i].ocur)) {
					dCurMap[discList[i].ocur] = i;
				}
			} else { // discount up to
				if (!dCurMap.hasOwnProperty(discList[i].lcur)) {
					dCurMap[discList[i].lcur] = i;
				}
			}

		}

		return dCurMap;
	};

	this.cleanArr = function(){ 
		var theString = JSON.stringify(AdvPromo.PromotionCs.arr); 	// substring theString if it exceeds text area capacity

		for (var idd in AdvPromo.PromotionCs.arr){
			var s = idd.length - 6;
			var e = idd.length;
			var pattern = idd.substring(s,e);

			switch(AdvPromo.PromotionCs.arr[idd].operation){

			case null:
				delete AdvPromo.PromotionCs.arr[idd];
				break;
			case 'A':
				// don't do anything
				break;
			case 'E':
				if(pattern== '_newid' && parseInt(AdvPromo.PromotionCs.arr[idd].type) == 1){	// if customer id, change operation A
					AdvPromo.PromotionCs.arr[idd].operation = 'A';
				}
				break;
			case 'D':
				if(pattern == '_newid'){	// if idd has pattern '_newid', non-existent in DB
					delete AdvPromo.PromotionCs.arr[idd];
				}else{
					//					// remove all properties of arr, retain only arr[idd]
					delete AdvPromo.PromotionCs.arr[idd].promocode;  

					delete AdvPromo.PromotionCs.arr[idd].description; 
					delete AdvPromo.PromotionCs.arr[idd].savesearchId;

					if(AdvPromo.PromotionCs.arr[idd].type == 1){
						delete AdvPromo.PromotionCs.arr[idd].groupId;
					}else if(AdvPromo.PromotionCs.arr[idd].type == 2){
						delete AdvPromo.PromotionCs.arr[idd].promocodeDropdownId;
						delete AdvPromo.PromotionCs.arr[idd].savesearchName;
					}
					delete AdvPromo.PromotionCs.arr[idd].type;
				}
				break;
			}
		}

		theString = JSON.stringify(AdvPromo.PromotionCs.arr); 	// substring theString if it exceeds text area capacity
	};

	var PopScriptId = function(script, deploy) {
		this.scriptname = script;
		this.deployname = deploy;
	};

	var OrderSpecPropertiesClass = function() {
		this.type = 0;
		this.tiers = 1;
		this.addOrderPopups = [];

		this.addOrderPopups.push(new PopScriptId());
		this.addOrderPopups.push(new PopScriptId('customscript_advpromo_is_order_add_all', 'customdeploy_advpromo_is_order_add_all'));
		this.addOrderPopups.push(new PopScriptId('customscript_advpromo_is_order_add_item', 'customdeploy_advpromo_is_order_add_item'));
		this.addOrderPopups.push(new PopScriptId('customscript_advpromo_is_order_add_searc', 'customdeploy_advpromo_is_order_add_searc'));

		this.addDiscountPopups = [];
		this.addDiscountPopups.push(new PopScriptId());
		this.addDiscountPopups.push(new PopScriptId('customscript_advpromo_is_dis_additem_ss', 'customdeploy_advpromo_is_dis_additem_ss'));
		this.addDiscountPopups.push(new PopScriptId('customscript_advpromo_is_dis_additmss_ss', 'customdeploy_advpromo_is_dis_additmss_ss'));
		this.addDiscountPopups.push(new PopScriptId());
		this.addDiscountPopups.push(new PopScriptId('customscript_advpromo_os_dis_neworder_ss', 'customdeploy_advpromo_os_dis_neworder_ss'));

	};

	var TieredOrderSpecPropertiesClass = function() {
		this.type = 1;
		this.tiers = 1;
		this.addOrderPopups = [];

		this.addOrderPopups.push(new PopScriptId());
		this.addOrderPopups.push(new PopScriptId('customscript_advpromo_is_trd_ord_add_all', 'customdeploy_advpromo_is_trd_ord_add_all'));
		this.addOrderPopups.push(new PopScriptId('customscript_advpromo_is_trd_ord_additem', 'customdeploy_advpromo_is_trd_ord_additem'));
		this.addOrderPopups.push(new PopScriptId('customscript_advpromo_is_trd_ord_aditmss', 'customdeploy_advpromo_is_trd_ord_aditmss'));

		this.addDiscountPopups = [];
		this.addDiscountPopups.push(new PopScriptId());
		this.addDiscountPopups.push(new PopScriptId('customscript_advpromo_is_tdis_additem_ss', 'customdeploy_advpromo_is_tdis_additem_ss'));
		this.addDiscountPopups.push(new PopScriptId('customscript_advpromo_is_tdis_aditmss_ss', 'customdeploy_advpromo_is_tdis_aditmss_ss'));
		this.addDiscountPopups.push(new PopScriptId());
		this.addDiscountPopups.push(new PopScriptId('customscript_advpromo_os_tdis_newordr_ss', 'customdeploy_advpromo_os_tdis_newordr_ss'));

	};
	TieredOrderSpecPropertiesClass.prototype = OrderSpecPropertiesClass.prototype;

	this.normalOrderSpecProperties = new OrderSpecPropertiesClass();
	this.tieredOrderSpecProperties = new TieredOrderSpecPropertiesClass();
	this.orderSpecProperties = this.normalOrderSpecProperties;

	this.addPopupLink = function(type, name) {
		var addLink = baseUrl;
		var title;
		var popUpHeight = 400;
		var popUpWidth = 600;
		var windowOpen = false;

		var closer = encodeURIComponent(baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_closer_sl', 'customdeploy_advpromo_closer_sl'));

		if (name == 'custpage_advpromo_addcustomer') {
			switch (type) {
			case 1: //customer id
//				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_add_customerid_ss', 'customdeploy_advpromo_add_customerid_ss');
				addLink = nlapiResolveURL('SUITELET', 'customscript_ap_select_customers_sl', 'customdeploy_ap_select_customers_sl');
				title = TRANS_UI_CS_Library.LABEL_SELECT_CUSTOMERS;
				popUpHeight = 200;
				popUpWidth = 400;

				break;

			case 2: // customer saved search
//				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_add_customer_ss', 'customdeploy_advpromo_add_customer_ss');
				addLink = nlapiResolveURL('SUITELET', 'customscript_ap_select_custsrch_sl', 'customdeploy_ap_select_custsrch_sl');
				title = TRANS_UI_CS_Library.LABEL_SELECT_CUSTOMERS_SS;
				popUpHeight = 200;
				popUpWidth = 650;

				break;

			case 3:
				addLink = baseUrl + '/app/common/search/search.nl?searchtype=Customer&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
				title = TRANS_UI_CS_Library.LABEL_NEW_CUSTOMER_SS;
				popUpHeight = 550;
				popUpWidth = 700;
				windowOpen = true;

				break;
			}
		}

		if (name == 'custpage_advpromo_discount_item') {
			switch (type) {
			case 4: // new order discount
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.orderSpecProperties.addDiscountPopups[4].scriptname, AdvPromo.PromotionCs.orderSpecProperties.addDiscountPopups[4].deployname);
				title = TRANS_UI_CS_Library.LABEL_NEW_ORDER_DISC;
				popUpHeight = 300;
				popUpWidth = 450;

				break;
			}
		}

		if (name == 'custpage_advpromo_discount_shipping') {
			switch (type) {
			case 2:
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_os_dis_addship_ss', 'customdeploy_advpromo_os_dis_addship_ss');
				title = TRANS_UI_CS_Library.LABEL_NEW_SHIPPING_DISC;
				popUpHeight = 300;
				popUpWidth = 400;
				break;
			case 3:
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss');
				title = TRANS_CS_IS_OrderSpecificEntryForm.NEW_ISFSHIPPING;
				popUpHeight = 500;
				popUpWidth = 650;
				break;
			case 4: //add dummy value for savedSearchId to be used as flag
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss')+"&savedSearchId=" + '-1';
				title = TRANS_CS_IS_OrderSpecificEntryForm.NEW_SS_ISFSHIPPING;
				popUpHeight = 520;
				popUpWidth = 400;
				break;
			}
		}

		if (name == 'custpage_advpromo_addorder') {
			AdvPromo.PromotionCs.globalParam['tier_dtype'] = 2;	// order specific promotion discount type
			switch (type) {
			case 1: // all item
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.orderSpecProperties.addOrderPopups[1].scriptname, AdvPromo.PromotionCs.orderSpecProperties.addOrderPopups[1].deployname);
				title = TRANS_UI_CS_Library.LABEL_ORDER_TOTAL;
				popUpHeight = 200;
				popUpWidth = 400;
				break;
			case 2: // add item
				// addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_order_add_item', 'customdeploy_advpromo_is_order_add_item');
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.orderSpecProperties.addOrderPopups[2].scriptname, AdvPromo.PromotionCs.orderSpecProperties.addOrderPopups[2].deployname);
				title = TRANS_UI_CS_Library.LABEL_SELECT_ITEMS;
				popUpHeight = 300;
				popUpWidth = 400;
				break;
			case 3: // add item search
				// addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_order_add_searc', 'customdeploy_advpromo_is_order_add_searc');
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.orderSpecProperties.addOrderPopups[3].scriptname, AdvPromo.PromotionCs.orderSpecProperties.addOrderPopups[3].deployname);
				title = TRANS_UI_CS_Library.LABEL_SELECT_ITEM_SS;
				popUpHeight = 200;
				popUpWidth = 600;
				break;
			case 4: // new item saved search
				addLink = baseUrl + '/app/common/search/search.nl?searchtype=Item&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
				title = TRANS_UI_CS_Library.LABEL_NEW_ITEM_SS;
				popUpHeight = 550;
				popUpWidth = 700;
				windowOpen = true;
				break;
			}
		}

		if (windowOpen) {
			var windowSize = 'width=' + popUpWidth + ',height=' + popUpHeight + ',scrollbars=yes,dialog=yes';
			window.open(addLink, 'AddSearchPopup', windowSize);
		} else {
			var z = nlExtOpenWindow(addLink, 'thepopup', popUpWidth, popUpHeight, 0, 0, title, null);
		}
	};

	this.tierModeOn = function() {
		$('#custpage_advpromo_applyto_order_fs_lbl').hide();
		$('#custpage_advpromo_applyto_order_fs').hide();
		AdvPromo.PromotionCs.orderSpecProperties = AdvPromo.PromotionCs.tieredOrderSpecProperties;
		
		nlapiRemoveSelectOption('custpage_advpromo_discount_item');
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_NONE, false);
	};

	this.tierModeOff = function() {
		$('#custpage_advpromo_applyto_order_fs_lbl').show();
		$('#custpage_advpromo_applyto_order_fs').show();
		AdvPromo.PromotionCs.orderSpecProperties = AdvPromo.PromotionCs.normalOrderSpecProperties;
		
		nlapiRemoveSelectOption('custpage_advpromo_discount_item');
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_NONE, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '4', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_NEW_ORDER_SS, false);
	};

	this.fieldChanged = function(type, name, linenum){

		// Create Tiers check box events
		if (name == 'custrecord_advpromo_is_tiered') {

			// get NEW and PREVIOUS value of Create Tiers checkbox
			var newTier = nlapiGetFieldValue('custrecord_advpromo_is_tiered');
			var prevTier = newTier == 'T' ? 'F' : 'T';

			// get count of existing eligibility rules
			// tiers.length if Check Tiers previously checked
			// elligbleOrders.length if Check Tiers previously unchecked
			var eligibilityRulesCount = prevTier == 'T' ? AdvPromo.PromotionCs.tiers.length : elligbleOrders.length;

			// if there are existing eligibility rules defined
			// also check if there are existing shipping discounts defined
			if(eligibilityRulesCount != 0 || AdvPromo.PromotionCs.globalParam.hasOwnProperty("tShipMethod")) {

				// revert checkbox to previous value, set isFireFieldChanged to false
				nlapiSetFieldValue('custrecord_advpromo_is_tiered', prevTier, false);

				// prompt user that this field cannot be changed
				alert(TRANS_CS_IS_OrderSpecificEntryForm.ERROR_CREATE_TIERS);

			} else {

				// otherwise, proceed with switch of views
				if (newTier == 'T') {
					AdvPromo.PromotionCs.tierModeOn();
				} else {
					AdvPromo.PromotionCs.tierModeOff();
				}
			}
		}

		// on change of dropdown list
		if(name == 'custpage_advpromo_addcustomer'){
			if (nlapiGetFieldValue(name) == '1')		// item or customer
			{
				AdvPromo.PromotionCs.addPopupLink(1, name);
			}
			if (nlapiGetFieldValue(name) == '2')	// item or customer saved search
			{
				AdvPromo.PromotionCs.addPopupLink(2, name);
			}

			if (nlapiGetFieldValue(name) == '3')
			{
				AdvPromo.PromotionCs.addPopupLink(3, name);
			}

			nlapiSetFieldValue(name, '0', false);
		}
		if (name == 'custpage_advpromo_discount_item' ){
			if (nlapiGetFieldValue(name) == '4')
			{
				AdvPromo.PromotionCs.addPopupLink(4, name);
			}

			nlapiSetFieldValue(name, '0', false);
		}

		if(name == 'custpage_advpromo_discount_shipping'){
			
			switch(nlapiGetFieldValue(name)){
				case '2': // New Shipping Discount
					AdvPromo.PromotionCs.addPopupLink(2, name);
					break;
				case '3': // New Item Specific Free Shipping
					AdvPromo.PromotionCs.addPopupLink(3, name);
					break;
				case '4': // Select Item Saved Search for Free Shipping
					AdvPromo.PromotionCs.addPopupLink(4, name);
					break;
			}

			nlapiSetFieldValue(name, '0', false);
		}
		if (name == 'custpage_advpromo_addorder') {
			var nType = parseInt(nlapiGetFieldValue(name));
			if (!nType) return;
			AdvPromo.PromotionCs.addPopupLink(nType, name); // replace this
			nlapiSetFieldValue(name, '0', false);
		}

		// This will only trigger for One World accounts
		if(nlapiGetContext().getFeature('SUBSIDIARIES')){
			// on change of Discount Item
			if(name == 'discount'){
				var nType = parseInt(nlapiGetFieldValue(name));
				if (!nType) return;

				var fldSubsidiaries = new Array();
				var recDiscountItem = nlapiLoadRecord('discountitem', nType);		 
				var fldSubsidiary = recDiscountItem.getFieldValues('subsidiary');
				var fldIncludeChildren = recDiscountItem.getFieldValue('includechildren');

				// check if Subsidiary Field returns an array
				if(fldSubsidiary instanceof Array){
					for(var i in fldSubsidiary){
						fldSubsidiaries.push(fldSubsidiary[i]);
					}
				} else {
					fldSubsidiaries.push(fldSubsidiary);
				}

				nlapiSetFieldValues('custrecord_advpromo_subsidiary', fldSubsidiaries, false);
				nlapiSetFieldValue('custpage_advpromo_include_children', fldIncludeChildren, false);
				nlapiSetFieldValue('custrecord_advpromo_include_children', fldIncludeChildren, false);
			}
		}
	};

	this.renderOrderSublist = function(model){
		AdvPromo.PromotionCs.mainModel = model;

//		alert('renderOrderSublist = ' + JSON.stringify(AdvPromo.PromotionCs.mainModel));
		AdvPromo.PromotionCs.orderDiscountSublist = new Array();
		AdvPromo.PromotionCs.orderDiscountSublist = AdvPromo.PromotionCs.generateOrderDiscountModel(AdvPromo.PromotionCs.mainModel);

		AdvPromo.PromotionCs.renderSublistModel();

		// hide/show Order Discount dropdown
		if(AdvPromo.PromotionCs.mainModel.promotionalOffers.length > 0){
			nlapiRemoveSelectOption('custpage_advpromo_discount_item');
			nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE, false);
		}
		else{
			nlapiRemoveSelectOption('custpage_advpromo_discount_item');
			nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE, false);
			nlapiInsertSelectOption('custpage_advpromo_discount_item', '4', TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NEW_ORDER_DISC, false);
		}
	};
	
	this.renderSublistModel = function(){
		var tableId = 'custpage_advpromo_discount_list';

		subListModel = new Array();

		if(AdvPromo.PromotionCs.orderDiscountSublist != null && AdvPromo.PromotionCs.orderDiscountSublist!= ''){
			for(var i = 0; i < AdvPromo.PromotionCs.orderDiscountSublist.length; i++){
				subListModel.push({
					"name":AdvPromo.PromotionCs.orderDiscountSublist[i].name,
					"promotionalOffer":AdvPromo.PromotionCs.orderDiscountSublist[i].promotionalOffer,
					"limit":(AdvPromo.PromotionCs.orderDiscountSublist[i].limit == null)? ' ':AdvPromo.PromotionCs.orderDiscountSublist[i].limit,
					"previewLink": (AdvPromo.PromotionCs.orderDiscountSublist[i].previewLink == null)? ' ':AdvPromo.PromotionCs.orderDiscountSublist[i].previewLink,
					"editLink": AdvPromo.PromotionCs.orderDiscountSublist[i].editLink,
					"deleteLink": AdvPromo.PromotionCs.orderDiscountSublist[i].deleteLink
				});
			}
		}

		// special handling for tiered order spec shipping discount
		// push order discounts into subListModel first before pushing shipping discounts
		// otherwise existing order discounts will be erased from the sublist view
		if(nlapiGetFieldValue('custrecord_advpromo_is_tiered') == 'T'){
			
			try{
				
				for(var i = 0; i < AdvPromo.PromotionCs.tiers.length; i++){// traverse list of tiers
					
					// set default values (case: no order discounts defined yet)
					var promotionalOffer = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE;
					var limit = TRANS_UI_CS_Library.TEXT_NOLIMIT;
					var editLink = '';
					
					// check and get oder discount values
					var orderDiscounts = AdvPromo.PromotionCs.tiers[i].disc;// get list of order discounts for current tier
					if(orderDiscounts != null){// only update values if there are defined order discounts, else push the default values
					
						// build content for Promotional Offer and Discout Up To (limit) columns
						for (var j = 0; j < orderDiscounts.length; j++){// traverse list of order discounts
							
							var orderDiscount = orderDiscounts[j];// get current order discount
							if(orderDiscount.ocur == ''){// promo offer is NOT in currency (promo offer is %)
								
								promotionalOffer = orderDiscount.offer + ' %';
								// check if there are limit definitions before updating default value (NONE)
								if(orderDiscount.lcur != ''){
									var currentLimit = orderDiscount.limit + ' ' + AdvPromo.PromotionCs.getCurrencySymbol(orderDiscount.lcur);// getCurrencySymbol method accessed from AdvPromo_CS_OrderSpecificEntryForm
									limit = limit == TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT ? currentLimit : limit + ' or ' + currentLimit;// add 'or' after consecutive currencies after the first currency
								}
								
							}else{// promo offer is in currency
								
								var currency = orderDiscount.offer + ' ' + AdvPromo.PromotionCs.getCurrencySymbol(orderDiscount.ocur);// getCurrencySymbol method accessed from AdvPromo_CS_OrderSpecificEntryForm
								promotionalOffer = promotionalOffer == TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE ? currency : promotionalOffer + ' or ' + currency;// add 'or' after consecutive currencies after the first currency
							
							}
						}
						
						// build content for Edit column, only display this link along with Tier 1
						editLink = i == 0 ? AdvPromo.PromotionCs.makeLink('E', i, i, 43, tableId) : editLink;
					}
					
					// push order discount
					subListModel.push({
						"name":"Tier " + (i + 1),
						"promotionalOffer":promotionalOffer,
						"limit":limit,
						"previewLink":'',
						"editLink":editLink,
						"deleteLink":''
					});
				}
				
			}catch(err){
				alert(err.message);
			}
		}
		
		if(AdvPromo.PromotionCs.orderShippingSublist != null && AdvPromo.PromotionCs.orderShippingSublist!= ''){
			for(var i = 0; i < AdvPromo.PromotionCs.orderShippingSublist.length; i++){
				subListModel.push({
					"name":AdvPromo.PromotionCs.orderShippingSublist[i].name,
					"promotionalOffer":AdvPromo.PromotionCs.orderShippingSublist[i].promotionalOffer,
					"limit":TRANS_UI_CS_Library.TEXT_NOLIMIT,
					"previewLink": (AdvPromo.PromotionCs.orderShippingSublist[i].previewLink == null)? ' ':AdvPromo.PromotionCs.orderShippingSublist[i].previewLink,
					"editLink":AdvPromo.PromotionCs.makeDiscountLink(2, 'editShippingDiscount'),
					"deleteLink":AdvPromo.PromotionCs.makeDiscountLink(2, 'deleteShippingDiscount')
				});
			}
		}
		//following the existing logic, isfshipping will always be the last item on sublist. order discount is always first.
		//TODO: refactor codes for better handling of future expansions.
		if(AdvPromo.PromotionCs.isfShippingSublist != null && AdvPromo.PromotionCs.isfShippingSublist!= ''){
			for(var i = 0; i < AdvPromo.PromotionCs.isfShippingSublist.length; i++){
				subListModel.push({
					"name":AdvPromo.PromotionCs.isfShippingSublist[i].name,
					"promotionalOffer":AdvPromo.PromotionCs.isfShippingSublist[i].promotionalOffer,
					"limit":TRANS_UI_CS_Library.TEXT_NOLIMIT,
					"previewLink": (AdvPromo.PromotionCs.isfShippingObj.searchId == null)? ' ':AdvPromo.PromotionCs.makeLink('P', (1), AdvPromo.PromotionCs.isfShippingObj.searchId, 'Item'),
					"editLink": AdvPromo.PromotionCs.makeDiscountLink(3, 'editisfShippingDiscount'),
					"deleteLink": AdvPromo.PromotionCs.makeDiscountLink(3, 'deleteisfShippingDiscount')
				});
			}
		}
		
		//	clear sublist first
		AdvPromo.PromotionCs.clearDiscountSublist();
		for(var i = 0; i < subListModel.length; i++){
			var rowName = subListModel[i].name;
			var rowPromoOffer = subListModel[i].promotionalOffer;
			var rowLimit = subListModel[i].limit;
			var rowPreviewLink = subListModel[i].previewLink;
			var rowEditLink = subListModel[i].editLink;
			var rowDeleteLink = subListModel[i].deleteLink;
			AdvPromo.PromotionCs.addRow(tableId, [rowName, rowPromoOffer, rowLimit, rowPreviewLink, rowEditLink, rowDeleteLink]);
		}
	};

	this.clearDiscountSublist = function(){
		$('tr[id^=custpage_advpromo_discount_listrow]').detach();
	};

	this.generateOrderDiscountModel = function(currModel){
		var model = new Array();

		// Order Discount
		var orderDisc = new OrderDiscountSublistModel();
		orderDisc.name = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_ORDER_DISC;
		orderDisc.promotionalOffer = '';
		for(var i = 0; i < currModel.promotionalOffers.length; i++){
			var label = currModel.promotionalOffers[i].offerLabel;
			if(label == '% off'){
				orderDisc.promotionalOffer += currModel.promotionalOffers[i].amount + currModel.promotionalOffers[i].offerLabel;
			}
			else{
				orderDisc.promotionalOffer += currModel.promotionalOffers[i].amount + ' ' + currModel.promotionalOffers[i].offerLabel;
			}

			if(i != currModel.promotionalOffers.length - 1){
				orderDisc.promotionalOffer += ' ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_OR + ' ';
			}
		}
		orderDisc.limit = '';
		for(var i = 0; i < currModel.promotionalOfferLimits.length; i++){
			orderDisc.limit += currModel.promotionalOfferLimits[i].amount + ' ' + currModel.promotionalOfferLimits[i].limitLabel;
			if(i != currModel.promotionalOfferLimits.length - 1){
				orderDisc.limit += ' ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_OR + ' ';
			}
			if(currModel.promotionalOfferLimits[i].amount == ''){
				orderDisc.limit = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT;
			}
		}

		if(currModel.promotionalOfferLimits.length == 0){
			orderDisc.limit = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT;
		} 

		// Edit link
		orderDisc.editLink = AdvPromo.PromotionCs.makeDiscountLink(1, 'editOrderDiscount');
		orderDisc.deleteLink = AdvPromo.PromotionCs.makeDiscountLink(1, 'deleteOrderDiscount');

		if(orderDisc.promotionalOffer != ''){
			model.push(orderDisc);
		}

		return model;
	};

	this.insertCustomerIds = function(selectedCustomers, recordType, idd){
		// check recordType should be 2
		var theType = 'custpage_advpromo_eligible_customer_list';
		var theTable = $('#' + theType + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ( (rows == 1) && (!(firstRow.attr('id'))) ) {
			firstRow.remove();
			rows = 0;
		}

		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), idd, recordType, theType);
		var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), idd, recordType);

		AdvPromo.PromotionCs.addRow(theType, [selectedCustomers, selectedCustomers, '', editAnch, deleteAnch]);	// if type is customer id
	};

	this.addToObject = function(obj, idd, groupObj) {

		AdvPromo.PromotionCs.arr[idd] = {};

		// fields common to both types
		AdvPromo.PromotionCs.arr[idd].promocode = obj.promocode;
		AdvPromo.PromotionCs.arr[idd].operation = obj.operation;
		AdvPromo.PromotionCs.arr[idd].type = obj.type;

		switch (obj.type) {
		case 2: // customer Id 
			break;
		case 1: // customer saved search	
			AdvPromo.PromotionCs.arr[idd].description = obj.description;
			AdvPromo.PromotionCs.arr[idd].savesearchId = obj.savesearchId;
			AdvPromo.PromotionCs.arr[idd].savesearchName = obj.saveSearchLabel;

			break;
		}

		AdvPromo.PromotionCs.insertValues(AdvPromo.PromotionCs.arr[idd], idd);
	};

	this.insertValues = function(obj, idd) {
		var theType = 'custpage_advpromo_eligible_customer_list';
		var theTable = $('#' + theType + '_splits');

		var rows = theTable[0].rows.length - 1;
		var firstRow = theTable.children().children(':nth-child(2)');
		if ( (rows == 1) && (!(firstRow.attr('id'))) ) {
			firstRow.remove();
			rows = 0;
		}
		var recordType = obj.type;
		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), idd, recordType, theType);
		var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), idd, recordType, theType);


		// call addRow depending on the obj.type

		switch(parseInt(obj.type)){
		case 2: 	
			var searchText = obj.searchText;
			searchText = searchText.replace(/,/gi, (' ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_OR + ' '));

			AdvPromo.PromotionCs.addRow(theType, [searchText, searchText, "", editAnch, deleteAnch]);	// if type is customer id
			break;

		case 1: 
			var previewAnch = AdvPromo.PromotionCs.makeLink('P', (rows), obj.savesearchId, recordType);
			AdvPromo.PromotionCs.addRow(theType, [obj.savesearchName, obj.description, previewAnch, editAnch, deleteAnch]);	// if type is customer saved search
			break;
		}
	};

	this.addRow = function(tableId, theValues) {

//		alert(JSON.stringify(theValues));

		var	className;
		var i;
		var newCol;
		var newText;
		var values;

		// Table Name is sublist name with suffix "_splits"
		// var theTable = document.getElementById(tableId + "_splits");
		var theTable = $('#' + tableId +  '_splits');

		var row = theTable[0].rows.length - 1; // decrement by 1 to not include the header

		// Initial content of first non-header row if no content is "No records to show".
		// Delete this row
		var firstRow = theTable.children().children(':nth-child(2)');
		if ( (row == 1) && (!(firstRow.attr('id'))) ) {
			firstRow.remove();
			row = 0;
		}

		var newRow = $('<tr>');

		// Row ID is sublistName + "row" + rownumber
		// rownumber is zero (1st row) to n..
		newRow.attr('id', (tableId + 'row' + (row)));


		// CSS cladd ID for line. Alternating styles/color for each row.
		if (row % 2) className = 'listtext';
		else className = 'listtexthl';


		if (theValues instanceof Array) values = theValues;
		else values = [theValues];

		for (i = 0; i < values.length; i++) {
			newCol = $('<td>');
			newCol.attr('id', (tableId + 'col' + (row) + (i)));
			if (AdvPromo.PromotionCs.isHTMLElement(values[i]))
				newCol.append(values[i]);
			else
				newCol.text(values[i]);
			newCol.attr('class', className);
			newRow.append(newCol);
		}
		theTable.children().append(newRow);
	};

	this.removeRow = function(rowNumber, idd, recordType, theType, theObj) {
		var r= confirm('Are you sure you want to remove this row?');
		if(r == true){
			switch(parseInt(recordType)){
			// case 1 and 2 Eligible Customer Tab
			case 2: //Customer Id		
				AdvPromo.PromotionCs.arr[idd].operation = 'D';
				break;
			case 1: 	// saved search		
				AdvPromo.PromotionCs.arr[idd].operation = 'D';
				var sid = AdvPromo.PromotionCs.arr[idd].savesearchId;
				delete AdvPromo.PromotionCs.globalParam['customersid'][sid];
				break;
				// case 3x reserved for tiered promotion
			case 31: // delete all rows in eligible order tab tiered promotion
				AdvPromo.PromotionCs.deleteTieredAllOrdersSublist(idd, AdvPromo.PromotionCs.orderSpecProperties.tiers);
				AdvPromo.PromotionCs.addTierDiscountShipping();
				break;

			case 3:
				var idx = 0;
				var numeric = new RegExp("^([0-9]+_)*[0-9]+$");
				for (idx=0; idx < elligbleOrders.length; idx++ ) {
					if (elligbleOrders[idx].id == theObj.id) {
						// elligbleOrders[idx] = theObj;
						if (numeric.test(elligbleOrders[idx].id)) {
							elligbleOrders[idx].remove = true;
						} else {
							elligbleOrders.splice(idx,1);
						}
						break;
					}
				}

				// to follow;
			}
			if (parseInt(recordType) != 31) { // for normal promotion
				AdvPromo.PromotionCs.deleteRow(theType, rowNumber, idd, recordType);
			}
		}
		AdvPromo.PromotionCs.flagChanged();
	};

	this.deleteTieredAllOrdersSublist = function(objId, tiersize) {
		var sublistName = 'custpage_advpromo_eligible_order_list';
		var theTable = $('#' + sublistName + '_splits');

		var rows = theTable[0].rows.length;
		//	alert(rows);

		for ( var i = rows; i > 1; i--) {
			AdvPromo.PromotionCs.deleteTieredRow(sublistName, i);
		}

		// do this to discount tab as well
		sublistName = 'custpage_advpromo_discount_list';
		theTable = $('#' + sublistName + '_splits');
		//rows = theTable[0].rows.length; -- commented out, use the same row count from eligible orders to prevent deletion of shipping discount, if defined

		for ( var i = rows; i > 1; i--) {
			AdvPromo.PromotionCs.deleteTieredRow(sublistName, i);
		}

		// if operation == null, push to delKey array and empty the array content.
		if (AdvPromo.PromotionCs.tiers[objId].op == 'A') {
			AdvPromo.PromotionCs.tiers.splice(objId, tiersize);
		} else {
			delkeys = AdvPromo.PromotionCs.getTieredKeys(AdvPromo.PromotionCs.tiers);
			AdvPromo.PromotionCs.tiers.splice(objId, tiersize);
		}

		// delete eligible order dropdown selection
		nlapiRemoveSelectOption('custpage_advpromo_addorder');
		nlapiInsertSelectOption('custpage_advpromo_addorder', '0', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_NONE, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '1', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_ORDER_TOTAL, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '2', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_SELECT_ITEMS, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '3', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_SELECT_ITEM_SS, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '4', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_NEW_ITEM_SS, false);

		// delete discount dropdown selection
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '4');
	};

	this.getTieredKeys = function(tiers) {
		var keys = [];

		for ( var i = 0; i < tiers.length; i++) {
			var elig = tiers[i].elig;
			for ( var j = 0; j < elig.length; j++) {

				keys.push(parseInt(elig[j].id));
			}
		}
		return keys;
	};

	this.deleteTieredRow = function(tableId, row) {
		// Table Name is sublist name with suffix "_splits"
		var theTable = $('#' + tableId + "_splits");
		theTable.children().children(':nth-child(' + (row) + ')').remove();
	};

	//deletes a row in the sublist via jquery

	this.deleteRow = function(tableId, row, idd, recordType) {

		var	className;
		var i;
		var j;

		// Table Name is sublist name with suffix "_splits"
		var theTable = $('#' + tableId + "_splits");

		theTable.children().children(':nth-child(' + (row + 2)  + ')').remove();
		var rows = theTable[0].rows.length;
		var cols = 0;

		var columnClass = function(pClassName) {
			var className = pClassName;
			this.changeClass = function(i, elem) {$(elem).attr('class', className);};
		};
		var colInst = null;

		for (i = 1; i < rows; i++) {
			if (i % 2) className = 'listtexthl';
			else className = 'listtext';
			theTable.children().children(':nth-child(' + (i + 1)  + ')').attr('id', (tableId + 'row' + (i - 1)));
			colInst = new columnClass(className);
			theTable.children().children(':nth-child(' + (i + 1)  + ')').children().each(colInst.changeClass);
			cols = theTable.children().children(':nth-child(' + (i + 1)  + ')')[0].cells.length;
			for (j = 0; j < cols; j++) {
				theTable.children().children(':nth-child(' + (i + 1)  + ')').children(':nth-child(' + (j+1)  + ')').attr('id', tableId+ '_listcol' + (i-1) + (j) );
			}
			delete colInst;
		}


	};

	this.previewRow = function(rowNumber, idd){
		nlExtOpenWindow(baseUrl + "/app/common/search/searchresults.nl?searchid=" + idd, 'thepopup', 700, 550, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.TEXT_SEARCH_RESULTS, null);
	};

	//pass theType as parameter
	this.modifyRow = function(rowNumber, idd, recordType, theType, theObj){
		AdvPromo.PromotionCs.editRow(theType, rowNumber, idd, recordType, theObj);
	};

	this.editRow = function(tableId, row, idd, recordType, theObj){
		AdvPromo.PromotionCs.globalParam['tier_dtype'] = 2;	// order specific promotion discount type tier promotion
		// Table Name is sublist name with suffix "_splits"
		var theTable = $('#' + tableId + "_splits");

		firstCol  = theTable.children().children(':nth-child(' + (row + 2)  + ')').children(':nth-child(1)').text();
		secondCol = theTable.children().children(':nth-child(' + (row + 2)  + ')').children(':nth-child(2)').text();

		// will display different links depending on whether type is customer saved search or customer id
		switch(parseInt(recordType)){
		case 2: // customer id		
			var customerGroup = new Array();
			customerGroup = AdvPromo.PromotionCs.arr[idd].savesearchId;

			var size = customerGroup.length;

			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_os_cust_editid_ss', 'customdeploy_advpromo_os_cust_editid_ss') + "&customerGroup=" + encodeURIComponent(customerGroup) + "&groupId=" + encodeURIComponent(idd) + "&rowNum=" + row + "&size=" + size ;
			var z = nlExtOpenWindow(editLink, 'thepopup', 400, 200, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.POPUP_TITLE_EDIT_SELECT_CUSTOMERS, null);

			break;

		case 1: //saved search		
			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_os_cust_edisrch_ss', 'customdeploy_advpromo_os_cust_edisrch_ss') + "&idd=" + idd +"&recName=" + encodeURIComponent(firstCol) + "&recDesc=" + encodeURIComponent(secondCol) + "&rowNum=" + row + "&savesearchId=" + encodeURIComponent(AdvPromo.PromotionCs.arr[idd].savesearchId);
			var z = nlExtOpenWindow(editLink, 'thepopup', 650, 200, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.POPUP_TITLE_EDIT_SELECT_CUSTOMER_SAVED_SEARCH, null);
			break;

		case 3:
			var suffix = '';
			if (theObj.type == '1') {
				suffix = '_advpromo_is_order_edit_sear';
			} else if ((theObj.type == '2') && (theObj.items.length)) {
				suffix = '_advpromo_is_order_edit_item';
			} else if (theObj.type == '3') {
				suffix = '_advpromo_is_order_edit_all';
			} else {
				return;
			}
			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript' + suffix, 'customdeploy' + suffix);
			theObj.rowRef = row;
			AdvPromo.PromotionCs.setEligOrder(theObj);
			var z;
			if(suffix == '_advpromo_is_order_edit_sear'){
				z = nlExtOpenWindow(editLink, 'thepopup', 600, 200, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.EDIT_SEARCH_ITEM, null);
			}else if(suffix == '_advpromo_is_order_edit_item'){
				z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.EDIT_ITEM, null);
			}else if(suffix == '_advpromo_is_order_edit_all'){
				z = nlExtOpenWindow(editLink, 'thepopup', 400, 200, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.EDIT_ORDER_TOTAL, null);
			}
			break;
			// case 3x reserved for tiered promotion eligible order
		case 31: // Tiered promotion Eligible Order -> edit order total
			if (confirm(TRANS_CS_IS_OrderSpecificEntryForm.CONFIRM_ELIGIBILITY_EDIT)) {
				AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
				AdvPromo.PromotionCs.globalParam['31_tiersize'] = AdvPromo.PromotionCs.orderSpecProperties.tiers;

				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_trd_ord_edi_all', 'customdeploy_advpromo_is_trd_ord_edi_all');
				var z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.EDIT_ORDER_TOTAL, null);
			}
			break;

		case 32: // Tiered promotion Eligible Order -> edit item
			if (confirm(TRANS_CS_IS_OrderSpecificEntryForm.CONFIRM_ELIGIBILITY_EDIT)) {
				AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
				AdvPromo.PromotionCs.globalParam['31_tiersize'] = AdvPromo.PromotionCs.orderSpecProperties.tiers;
				AdvPromo.PromotionCs.globalParam['32_itemSelect'] = tiers[0].eiid;

				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_trd_ord_editem', 'customdeploy_advpromo_is_trd_ord_editem');
				var z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.EDIT_ITEM, null);
			}
			break;

		case 33: // Tiered promotion Eligible Order -> select item search
			if (confirm(TRANS_CS_IS_OrderSpecificEntryForm.CONFIRM_ELIGIBILITY_EDIT)) {
				AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
				AdvPromo.PromotionCs.globalParam['31_tiersize'] = AdvPromo.PromotionCs.orderSpecProperties.tiers;

//				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_trd_ord_editms', 'customdeploy_advpromo_is_trd_ord_editms') + "&selSearch=" + AdvPromo.PromotionCs.tiers[0].esid;
				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_trd_ord_edittms', 'customdeploy_advpromo_is_trd_ord_edittms') + "&selSearch=" + AdvPromo.PromotionCs.tiers[0].esid;
				var z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.EDIT_SEARCH_ITEM, null);
			}
			break;

		case 43: // Tiered promotion Discount -> New Order\
			//if (confirm(EDIT_ORDER_CONFIRMATION)) { -- commented out, this confirm dialogue should only show when editing eligibility
				AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
				AdvPromo.PromotionCs.globalParam['31_tiersize'] = AdvPromo.PromotionCs.orderSpecProperties.tiers;

				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_os_tdis_newordr_ss', 'customdeploy_advpromo_os_tdis_newordr_ss') + "&selSearch=" + AdvPromo.PromotionCs.tiers[0].esid;
				var z = nlExtOpenWindow(editLink, 'thepopup', 450, 300, 0, 0, TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_EDIT_ORDER_SS, null);
			//}
			break;
		}
	};

	this.syncEditToListObject = function(recordType, obj, textArr){

		var row = parseInt(obj.row);

		switch(recordType){
		// case 1 and 2 -> Eligibility customer
		case 2:		
			var theType = 'custpage_advpromo_eligible_customer_list';

			var selectedCustomers = "";
			var groupId = obj.groupId;

			for (var elem in obj.customerNames){
				if(selectedCustomers == "") {
					selectedCustomers = obj.customerNames[elem];
				}else{ 
					selectedCustomers = selectedCustomers + ' ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_OR + ' ' + obj.customerNames[elem];
				}			   
			}

			//mark current values for deletion and add a new record in arr
			AdvPromo.PromotionCs.arr[groupId].operation = 'D';

			var noOfRecords = AdvPromo.PromotionCs.objectKeys(AdvPromo.PromotionCs.arr).length;
			var newObjectId = noOfRecords + 1 + '_newid';
			AdvPromo.PromotionCs.arr[newObjectId] = {};
			AdvPromo.PromotionCs.arr[newObjectId].promocode = nlapiGetFieldValue('code');
			AdvPromo.PromotionCs.arr[newObjectId].type = 2;	// Add customer id is type 2	
			AdvPromo.PromotionCs.arr[newObjectId].operation = 'A';
			AdvPromo.PromotionCs.arr[newObjectId].savesearchId = obj.customerIds;

			var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (row), newObjectId, recordType, theType);
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (row), newObjectId, recordType);

			$("#custpage_advpromo_eligible_customer_listcol" + row + "3").children().remove();
			$("#custpage_advpromo_eligible_customer_listcol" + row + "4").children().remove();
			$("#custpage_advpromo_eligible_customer_listcol" + row + "3").append(editAnch);
			$("#custpage_advpromo_eligible_customer_listcol" + row + "4").append(deleteAnch);

			$("#custpage_advpromo_eligible_customer_listcol" + row + "0").text(selectedCustomers);
			$("#custpage_advpromo_eligible_customer_listcol" + row + "1").text(selectedCustomers);
			break;

		case 1: 	
//			[idd, row, desc, savesearchId, saveSearchLabel]
			row = parseInt(obj[1]);
			var idd = obj[0];
			var desc = obj[2];
			var savesearchId = obj[3];
			var savesearchLabel = obj[4];

			var previewAnch = (savesearchId) ? 	AdvPromo.PromotionCs.makeLink('P', (row), savesearchId , 1, 'custpage_advpromo_eligible_customer', null) : '';
			$("#custpage_advpromo_eligible_customer_listcol" + row + "2").children().remove();
			$("#custpage_advpromo_eligible_customer_listcol" + row + "2").append($(previewAnch));

			$("#custpage_advpromo_eligible_customer_listcol" + row + "0").text(savesearchLabel);
			$("#custpage_advpromo_eligible_customer_listcol" + row + "1").text(desc);
			AdvPromo.PromotionCs.arr[idd].description = desc;	//description
			AdvPromo.PromotionCs.arr[idd].savesearchId = savesearchId;
			AdvPromo.PromotionCs.arr[idd].savesearchName = savesearchLabel;
			AdvPromo.PromotionCs.arr[idd].operation = 'E';   // mark for edit

			break;
		}
		AdvPromo.PromotionCs.flagChanged();
	};

	this.generateOrderDiscountDbJson = function(){
		var ret = '';
		var arr = new Array();

		// compare old and new model for Order Discount
		// check if length is the same
		if(AdvPromo.PromotionCs.mainModel.promotionalOffers.length == AdvPromo.PromotionCs.origModel.promotionalOffers.length
				&& AdvPromo.PromotionCs.mainModel.promotionalOfferLimits.length == AdvPromo.PromotionCs.origModel.promotionalOfferLimits.length){

		}

		return ret;

		// we're just adding now
		// get the combination of Offer and Limit (multiply them)
		var modelCount = 0;
		var promotionalOffersLength = AdvPromo.PromotionCs.mainModel.promotionalOffers.length;
		var promotionalOfferLimitsLength = AdvPromo.PromotionCs.mainModel.promotionalOfferLimits.length;

		if(promotionalOffersLength > 0 && promotionalOfferLimitsLength == 0){
			modelCount = promotionalOffersLength;
		}
		else if(promotionalOffersLength == 0 && promotionalOfferLimitsLength > 0){
			modelCount = promotionalOfferLimitsLength;
		}
		else if(promotionalOffersLength > 0 && promotionalOfferLimitsLength > 0){
			modelCount = promotionalOffersLength * promotionalOfferLimitsLength;
		}

		// initialize array count
		for(var i = 0; i < modelCount; i++){
			var o = new PromotionalOfferJsonDbModel();
			o.oper = 'A';

			var offerIndex = i % promotionalOffersLength;
			var limitIndex = i % promotionalOfferLimitsLength;

			var offerModel = AdvPromo.PromotionCs.mainModel.promotionalOffers[offerIndex];
			var limitModel = AdvPromo.PromotionCs.mainModel.promotionalOfferLimits[limitIndex];

			o.amount = offerModel.amount;
			o.isPercent = offerModel.isPercent ? 'T' : 'F';
			o.limit = limitModel.amount;
			o.isUnit = limitModel.isUnit ? 'T' : 'F';
			o.currId = limitModel.isUnit == false ? limitModel.currencyId : (offerModel.isPercent ? -1 : offerModel.currencyId);

			arr.push(o);
		}

		ret = JSON.stringify(arr);

		return ret;
	};

	this.makeDiscountLink = function(sublistIndex, linkOper){

		var LinkHandler = function(index, type, name, model, func) {

			var arrIndex = index;
			var funcName = func;
			var typeParam = type;
			var nameParam = name;
			var globalModel = model;

			this.action = function() {
				if (funcName) funcName(typeParam, nameParam, globalModel);
			};
		};

		// create and return a jQuery DOM instance
		var anch = $('<a>');
		anch.css('cursor', 'pointer');
		anch.css('text-decoration', 'underline');

		var linkHandler;

		switch(linkOper){
		case 'editOrderDiscount':
			anch.text(TRANS_CS_IS_OrderSpecificEntryForm.EDIT);
			linkHandler = new LinkHandler(sublistIndex, 4, 'custpage_advpromo_discount_item', AdvPromo.PromotionCs.mainModel, editPopupLink);

			break;
		case 'deleteOrderDiscount':
			anch.text(TRANS_CS_IS_OrderSpecificEntryForm.REMOVE);
			linkHandler = new LinkHandler(null, null, null, null, AdvPromo.PromotionCs.deleteOrderDiscountLink);

			break;
		case 'editShippingDiscount':
			anch.text(TRANS_CS_IS_OrderSpecificEntryForm.EDIT);
			linkHandler = new LinkHandler(sublistIndex, 2, 'custpage_advpromo_discount_shipping', shippingModel, editPopupLink);

			break;
		case 'deleteShippingDiscount':
			anch.text(TRANS_CS_IS_OrderSpecificEntryForm.REMOVE);
			linkHandler = new LinkHandler(null, null, null, null, AdvPromo.PromotionCs.deleteShippingDiscountLink);

			break;
		case 'editisfShippingDiscount':
			anch.text(TRANS_CS_IS_OrderSpecificEntryForm.EDIT);
			linkHandler = new LinkHandler(sublistIndex, 3, 'custpage_advpromo_discount_shipping', AdvPromo.PromotionCs.isfShippingObj, editPopupLink);
			break;
		case 'deleteisfShippingDiscount':
			anch.text(TRANS_CS_IS_OrderSpecificEntryForm.REMOVE);
			linkHandler = new LinkHandler(null, null, null, null, AdvPromo.PromotionCs.deleteisfShippingDiscountLink);

			break;
		default:
			break;
		}

		anch.click(linkHandler.action);
		return anch[0];
	};

	this.makeLink = function(operationType, row, idd, recordType, theType, objArr){

		var LinkHandler = function(reference, pFuncName, pIdd, pRecType, pTheType, pTheObj) {

			var ref = reference;
			var funcName = pFuncName;
			var recType = pRecType;
			var grpId = pIdd;
			var theType = pTheType;
			var theObj = pTheObj;

			this.action = function() {
				var rowId = reference.parent().parent()[0].rowIndex - 1;
				if (funcName) funcName(rowId, grpId , recType, theType, theObj);
			};
		};


		var anch = $('<a>');
		var anchText = null;
		var action = null;

		switch(operationType){
		case 'E':
			action = AdvPromo.PromotionCs.modifyRow;
			anchText = TRANS_CS_IS_OrderSpecificEntryForm.EDIT;
			break;
		case 'D':
			action = AdvPromo.PromotionCs.removeRow;
			anchText = TRANS_CS_IS_OrderSpecificEntryForm.REMOVE;
			break;
		case 'P': // no preview for recordType 1
			action = AdvPromo.PromotionCs.previewRow;
			anchText = TRANS_CS_IS_OrderSpecificEntryForm.PREVIEW;
			break;
		}
		var linkHandler = new LinkHandler(anch, action, idd, recordType, theType, objArr);
		anch.click(linkHandler.action);
		anch.text(anchText);
		// anch.attr("href", "");
		anch.css('cursor', 'pointer');
		anch.css('text-decoration', 'underline');
		return anch[0];
	};

	this.deleteOrderDiscountLink = function(type, name, globalModel){
		var r= confirm(TRANS_CS_IS_OrderSpecificEntryForm.QUERY_REMOVE_ROW);
		if(r == true){
			AdvPromo.PromotionCs.mainModel.promotionalOffers = new Array();
			AdvPromo.PromotionCs.mainModel.promotionalOfferLimits = new Array();

			AdvPromo.PromotionCs.renderOrderSublist(AdvPromo.PromotionCs.mainModel);
		}
	};

	this.compareModel = function(){
		var ret = '';
		var arr = new Array();

		// get the combination of Offer and Limit (multiply them)
		var modelCount = 0;
		var promotionalOffersLength = AdvPromo.PromotionCs.mainModel.promotionalOffers.length;
		var promotionalOfferLimitsLength = AdvPromo.PromotionCs.mainModel.promotionalOfferLimits.length;

		if(promotionalOffersLength > 0 && promotionalOfferLimitsLength == 0){
			modelCount = promotionalOffersLength;
		}
		else if(promotionalOffersLength == 0 && promotionalOfferLimitsLength > 0){
			modelCount = promotionalOfferLimitsLength;
		}
		else if(promotionalOffersLength > 0 && promotionalOfferLimitsLength > 0){
			modelCount = promotionalOffersLength * promotionalOfferLimitsLength;
		}

		// initialize array count
		for(var i = 0; i < modelCount; i++){
			var o = new PromotionalOfferJsonDbModel();
			o.oper = 'A';

			var offerIndex = i % promotionalOffersLength;
			var limitIndex = i % promotionalOfferLimitsLength;

			var offerModel = AdvPromo.PromotionCs.mainModel.promotionalOffers[offerIndex];
			var limitModel = AdvPromo.PromotionCs.mainModel.promotionalOfferLimits[limitIndex];

			o.amount = offerModel.amount;
			o.isPercent = offerModel.isPercent ? 'T' : 'F';

			if(limitModel != null){
				o.limit = limitModel.amount;
				o.isUnit = limitModel.isUnit ? 'T' : 'F';
				o.currId = limitModel.isUnit == false ? limitModel.currencyId : (offerModel.isPercent ? -1 : offerModel.currencyId);	
			}
			else{
				o.limit = 0; // special case
				o.isUnit = 'T';
				o.currId = offerModel.currencyId;
			}			

			arr.push(o);
		}

		ret = JSON.stringify(arr);

		return ret;
	};

	this.renderShippingSublist = function(model){
		//var tableId = 'custpage_advpromo_discount_list';

		shippingModel = model;
		AdvPromo.PromotionCs.orderShippingSublist = new Array();
		AdvPromo.PromotionCs.orderShippingSublist = AdvPromo.PromotionCs.generateShippingDiscountModel(shippingModel);

		AdvPromo.PromotionCs.renderSublistModel();

		//	hide/show Shipping Discount dropdown
		
		if(shippingModel.shippingOffer.length > 0 || AdvPromo.PromotionCs.isfShippingObj.shipIds != null){
			nlapiRemoveSelectOption('custpage_advpromo_discount_shipping');
			nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '0', TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE, false);
		}
		else{
			nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '2', TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NEW_SHIP_DISC, false);
			nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '3', TRANS_CS_IS_OrderSpecificEntryForm.NEW_ISFSHIPPING, false);
			nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '4', TRANS_CS_IS_OrderSpecificEntryForm.NEW_SS_ISFSHIPPING, false);
		}
	};

	this.generateShippingDiscountModel = function(currModel){
		var model = new Array();

		//	Shipping Discount
		var shippingDisc = new OrderDiscountSublistModel();
		shippingDisc.name = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_SHIPPING_DISC;
		shippingDisc.promotionalOffer = '';

		for(var i = 0; i < currModel.discountType.length; i++){

			if(currModel.discountType[i].discountType == 'percent'){
				shippingDisc.promotionalOffer += currModel.shippingOffer[i].amount + '% ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_OFF + ' ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_ON + ' ';
			}

			if(currModel.discountType[i].discountType == 'amount'){
				for(var i = 0; i < currModel.shippingOffer.length; i++){
					shippingDisc.promotionalOffer += currModel.shippingOffer[i].amount + " " + currModel.shippingOffer[i].currencyLabel;
					if(i != currModel.shippingOffer.length - 1){
						shippingDisc.promotionalOffer += ' ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_OR + ' ';
					}
				}
				shippingDisc.promotionalOffer += ' ' + TRANS_CS_IS_OrderSpecificEntryForm.TEXT_ON + ' ';
			}
		}

		for(var i = 0; i < currModel.shippingMethod.length; i++){
			for(var j = 0; j < currModel.shippingMethod[i].shippingMethodLabel.length; j++){
				shippingDisc.promotionalOffer += currModel.shippingMethod[i].shippingMethodLabel[j];
				if(j < currModel.shippingMethod[i].shippingMethodLabel.length - 1){
					shippingDisc.promotionalOffer += ' / ';
				}
			}
		}

		shippingDisc.limit = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT;

		// Edit link
		shippingDisc.editLink = AdvPromo.PromotionCs.makeDiscountLink(2, 'editShippingDiscount');
		shippingDisc.deleteLink = AdvPromo.PromotionCs.makeDiscountLink(2, 'deleteShippingDiscount');

		if(shippingDisc.promotionalOffer != ''){
			model.push(shippingDisc);
		}

		// update global parameters to store shipping discount details
		// this is important because when offer discounts are edited, the entire sublist is emptied and rewritten
		// if tShipMethod is unset, the shipping discount in the sublist will not be rewritten
		AdvPromo.PromotionCs.globalParam['tShipMethod'] = {};
		AdvPromo.PromotionCs.globalParam['tShipMethod'].name = shippingDisc.name;
		AdvPromo.PromotionCs.globalParam['tShipMethod'].promoOr = shippingDisc.promotionalOffer;
		AdvPromo.PromotionCs.globalParam['tShipMethod'].editAnch = AdvPromo.PromotionCs.makeDiscountLink(2, 'editShippingDiscount');
		AdvPromo.PromotionCs.globalParam['tShipMethod'].deleteAnch = AdvPromo.PromotionCs.makeDiscountLink(2, 'deleteShippingDiscount');
		
		return model;
	};

	this.deleteisfShippingDiscountLink = function(type, name, globalModel){
		var r= confirm(TRANS_CS_IS_OrderSpecificEntryForm.QUERY_REMOVE_ROW);
		if(r == true){
			//remove data
			AdvPromo.PromotionCs.isfShippingObj.itemIds = null;
			AdvPromo.PromotionCs.isfShippingObj.shipIds = null;
			AdvPromo.PromotionCs.isfShippingObj.itemLabels = null;
			AdvPromo.PromotionCs.isfShippingObj.shipLabels = null;
			AdvPromo.PromotionCs.isfShippingObj.searchId = null;
			AdvPromo.PromotionCs.isfShippingObj.searchName = null;
			
			//mark for deletion in db
			AdvPromo.PromotionCs.isfShippingObj.op = 'D';
			AdvPromo.PromotionCs.isfShippingObj.delId = AdvPromo.PromotionCs.isfShippingObj.discId;
			//clear sublist item for isfs
			AdvPromo.PromotionCs.isfShippingSublist = new Array();	
		    AdvPromo.PromotionCs.renderSublistModel();
			//add back all the options
			nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '2', TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NEW_SHIP_DISC, false);
			nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '3', TRANS_CS_IS_OrderSpecificEntryForm.NEW_ISFSHIPPING, false);
			nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '4', TRANS_CS_IS_OrderSpecificEntryForm.NEW_SS_ISFSHIPPING, false);
		}
	};

	this.deleteShippingDiscountLink = function(type, name, globalModel){
		var r= confirm(TRANS_CS_IS_OrderSpecificEntryForm.QUERY_REMOVE_ROW);
		if(r == true){
			shippingModel.discountType = new Array();
			shippingModel.shippingOffer = new Array();
			shippingModel.shippingMethod = new Array();

			AdvPromo.PromotionCs.renderShippingSublist(shippingModel);
			
			// delete stored shipping discount info
			// this should be done to prevent the removed shipping discount from reappearing when order discounts are edited
			if(AdvPromo.PromotionCs.globalParam.hasOwnProperty("tShipMethod")){
				delete AdvPromo.PromotionCs.globalParam["tShipMethod"];
			}
			
		}
	};

	this.flagChanged = function() {
		var theValue = nlapiGetFieldValue('code');
		nlapiSetFieldValue('code', theValue);
	};


	this.addOrderTotal = function(tiers, renderEdit, fromEditDiscount) {

		// clear the discount sublist first to prevent the shipping discount from displaying twice
		// this happens when adding order discounts when the list already contains a shipping discount
		AdvPromo.PromotionCs.clearDiscountSublist();
		
		for ( var i = 0; i < tiers.length; i++) {
			var renderLink = false;
			if (i == 0)
				renderLink = true;
			AdvPromo.PromotionCs.addOrderToSublist(tiers[i], renderLink, i, renderEdit);
		}

		if(!fromEditDiscount){
			AdvPromo.PromotionCs.addTierDiscountShipping();
		}
	};

	this.editOrderTotal = function(newTiers) {
		var rowRef = parseInt(AdvPromo.PromotionCs.globalParam['31_tablerow']);
		var tsize = parseInt(AdvPromo.PromotionCs.globalParam['31_tiersize']);

		AdvPromo.PromotionCs.deleteTieredAllOrdersSublist(rowRef, tsize);
		AdvPromo.PromotionCs.addOrderTotal(newTiers);
		AdvPromo.PromotionCs.flagChanged();
	};

	this.addOrderItem = function(tiers, renderEdit, itemSelect, fromEditDiscount) {
		AdvPromo.PromotionCs.clearDiscountSublist();
		for ( var i = 0; i < tiers.length; i++) {
			var renderLink = false;
			if (i == 0)
				renderLink = true;
			AdvPromo.PromotionCs.addOrderToSublist(tiers[i], renderLink, i, renderEdit);
		}
		// render item selected in the sublist
		var itemOr = AdvPromo.PromotionCs.getItemDescriptionFormat(itemSelect.toString());
		AdvPromo.PromotionCs.addRow('custpage_advpromo_eligible_order_list', [ AdvPromo.PromotionCs.truncateTextField("Item: " + itemOr), " ", " ", " ", " " ]);

		if(!fromEditDiscount){
			AdvPromo.PromotionCs.addTierDiscountShipping();
		}
	};
	
	this.editOrderItem = function(tiers, itemSelect) {
		var rowRef = parseInt(AdvPromo.PromotionCs.globalParam['31_tablerow']);
		var tsize = parseInt(AdvPromo.PromotionCs.globalParam['31_tiersize']);

		AdvPromo.PromotionCs.deleteTieredAllOrdersSublist(rowRef, tsize);
		AdvPromo.PromotionCs.addOrderItem(tiers, null, itemSelect);
		AdvPromo.PromotionCs.flagChanged();
	};

	this.addOrderItemSearch = function(tiers, renderEdit, itemSearchSelectText, fromEditDiscount) {
		AdvPromo.PromotionCs.clearDiscountSublist();
		for ( var i = 0; i < tiers.length; i++) {
			var renderLink = false;
			if (i == 0)
				renderLink = true;
			AdvPromo.PromotionCs.addOrderToSublist(tiers[i], renderLink, i, renderEdit);
		}
		// render item selected in the sublist
		var itemOr = itemSearchSelectText;
		AdvPromo.PromotionCs.addRow('custpage_advpromo_eligible_order_list', [ "Item Search:" + itemOr, " ", " ", " ", " " ]);

		if(!fromEditDiscount){
			AdvPromo.PromotionCs.addTierDiscountShipping();
		}
	};

	this.editOrderItemSearch = function(tiers, itemSearchSelectText) {
		var rowRef = parseInt(AdvPromo.PromotionCs.globalParam['31_tablerow']);
		var tsize = parseInt(AdvPromo.PromotionCs.globalParam['31_tiersize']);

		AdvPromo.PromotionCs.deleteTieredAllOrdersSublist(rowRef, tsize);
		AdvPromo.PromotionCs.addOrderItemSearch(tiers, null, itemSearchSelectText);
		AdvPromo.PromotionCs.flagChanged();
	};

	this.addOrderToSublist = function(tierObj, renderLink, rowId, renderEdit) {
		AdvPromo.PromotionCs.tiers.push(tierObj);
		AdvPromo.PromotionCs.addTieredRowOrderTab(tierObj, rowId, renderLink, AdvPromo.PromotionCs.tiers.length - 1);
		AdvPromo.PromotionCs.addTieredDiscountTab(tierObj, rowId, renderLink, AdvPromo.PromotionCs.tiers.length - 1, renderEdit);

		nlapiRemoveSelectOption('custpage_advpromo_addorder', '1');
		nlapiRemoveSelectOption('custpage_advpromo_addorder', '2');
		nlapiRemoveSelectOption('custpage_advpromo_addorder', '3');
		nlapiRemoveSelectOption('custpage_advpromo_addorder', '4');

		// enable discount dropdown selections
		nlapiRemoveSelectOption('custpage_advpromo_discount_item');
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_NONE, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '4', TRANS_CS_IS_OrderSpecificEntryForm.TRANS_LABEL_NEW_ORDER_SS, false);
	};

	this.addTierDiscountShipping = function(){
		// check if tShipMethod key exists
		if(AdvPromo.PromotionCs.globalParam.hasOwnProperty('tShipMethod')){

			AdvPromo.PromotionCs.globalParam['tShipMethod'].editAnch = AdvPromo.PromotionCs.makeDiscountLink(2, 'editShippingDiscount');
			AdvPromo.PromotionCs.globalParam['tShipMethod'].deleteAnch = AdvPromo.PromotionCs.makeDiscountLink(2, 'deleteShippingDiscount');

			AdvPromo.PromotionCs.addRow('custpage_advpromo_discount_list', [AdvPromo.PromotionCs.globalParam['tShipMethod'].name,AdvPromo.PromotionCs.globalParam['tShipMethod'].promoOr, TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT, " ", AdvPromo.PromotionCs.globalParam['tShipMethod'].editAnch, AdvPromo.PromotionCs.globalParam['tShipMethod'].deleteAnch]);
		}
		//TODO: full code refactor to eliminate convoluted clearing/rendering of sublist.
		AdvPromo.PromotionCs.renderSublistModel();
	};

	// code reused from AdvancedPromotion_CS_ItemSpecificEntryForm
	// to be used by AdvPromo_UI_CS_Library for rewriting of order discounts upon edit of shipping discount
	this.getCurrencySymbol = function(key) {
		if (isFeatureEnabled('MULTICURRENCY')) {
			var searchFilters = new Array();
			searchFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
			var searchColumns = new Array();
			searchColumns[0] = new nlobjSearchColumn('symbol');
			var currencySearch = nlapiSearchRecord('currency', null, searchFilters, searchColumns);

			for ( var i = 0; i < currencySearch.length; i++) {
				var id = currencySearch[i].getId();
				var name = currencySearch[i].getValue('symbol');
				if (id == key) {
					return name;
				}
			}
		} else {
			//		var recCurrency = nlapiLoadRecord('currency', 1);
			//		return recCurrency.getFieldValue('symbol');

			var url = window.location.href;
			var index = url.indexOf('/app');
			var linkprefix = url.substring(0, index);
			var headerinfo = {};
			headerinfo['User-Agent-x'] = 'SuiteScript-Call';
			var urlformapping = nlapiResolveURL('SUITELET', 'customscript_advpromo_currency_symbol_sl', 'customdeploy_advpromo_currency_symbol_sl');
			var requestUrl = linkprefix + urlformapping;
			var urlResponse = nlapiRequestURL(requestUrl, null, headerinfo);
			var responseBody = urlResponse.getBody();

			return responseBody;
		}
	};

	this.addCustomerIdToObject = function(obj) {
		switch (obj.type) {
		case 2: // customer record		
			var selectedCustomers = "";
			for (elem in obj.customerNames) {

				if (selectedCustomers == "") {
					selectedCustomers = obj.customerNames[elem];
				} else {
					selectedCustomers = selectedCustomers + " or " + obj.customerNames[elem];
				}
			}

			var noOfRecords = AdvPromo.PromotionCs.objectKeys(AdvPromo.PromotionCs.arr).length;
			var newObjectId = noOfRecords + 1 + '_newid';
			AdvPromo.PromotionCs.arr[newObjectId] = {};
			AdvPromo.PromotionCs.arr[newObjectId].promocode = nlapiGetFieldValue('code');
			AdvPromo.PromotionCs.arr[newObjectId].type = 2; // Add customer id is type 2	
			AdvPromo.PromotionCs.arr[newObjectId].operation = 'A';
			AdvPromo.PromotionCs.arr[newObjectId].savesearchId = obj.customerIds;

			AdvPromo.PromotionCs.insertCustomerIds(selectedCustomers, 2, newObjectId);
			break;
		}

	};

	this.truncateTextField = function(pText, pLength) {
		if (!pText) return null;
		var length = (isNaN(pLength)) ? 300 : pLength;
		if (pText.length < length) return pText;
		return (pText.substring(0, (length > 3) ? (length - 3) : length) + '...');
	};

	this.addisfShippingToObject = function(selectedisfShipping, nameDisplay, textDisplay,  theType, rowNumber) {

		//update the isfShippingObj
		AdvPromo.PromotionCs.isfShippingObj = selectedisfShipping;
		//use the logic flow of existing codes for shipping and order discount.
		//TODO: refactor the codes for better handling of future expansions.
		
		AdvPromo.PromotionCs.isfShippingSublist = new Array();
		var isfshippingDisc = new OrderDiscountSublistModel();
		isfshippingDisc.name = nameDisplay;
		isfshippingDisc.promotionalOffer = textDisplay;
		isfshippingDisc.limit = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT;
		AdvPromo.PromotionCs.isfShippingSublist.push(isfshippingDisc);
		AdvPromo.PromotionCs.renderSublistModel();
		//set for edit mode only
		if(rowNumber){
			AdvPromo.PromotionCs.flagChanged();
		}
		
		//remove all selection, addition of sublist entry is restricted to one time only
		nlapiRemoveSelectOption('custpage_advpromo_discount_shipping');
		nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '0', TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE, false);
	};
	
	this.addRowOrderTab = function(values) {
		var sublistName = 'custpage_advpromo_eligible_order_list';
		var theTable = $('#' + sublistName + '_splits');
		var orderType = 3; // 3 is type for order on the delete, edit, and preview link

		var copier = function(orig) {
			// this line can actually deep copy objects. no functions though.
			var copy = JSON.parse(JSON.stringify(orig));
			return copy;
		};

		var objCopy = copier(values);
		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		var previewAnch = (objCopy.savedSearch) ? AdvPromo.PromotionCs.makeLink('P', (rows), objCopy.savedSearch, orderType, sublistName, objCopy) : '';
		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), objCopy.id, orderType, sublistName, objCopy);
		var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), objCopy.id, orderType, null, objCopy);

		// We need to convert *convert* values to an array because passing objects between parent
		// and child window does not preserve its type.
		// That is Array instance on popup is detected as Object only on parent Window
		var sublistData = [ objCopy.label, objCopy.description, previewAnch, editAnch, deleteAnch ];

		// for (var i = 0; i < values.length; i++) toSend.push(values[i]);

		elligbleOrders.push(objCopy);

		AdvPromo.PromotionCs.addRow(sublistName, sublistData);

	};
};