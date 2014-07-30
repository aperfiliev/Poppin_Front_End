/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Nov 2011     adimaunahan
 * 1.1		  13 Dec 2011	  dembuscado		Implemented edit and delete functionality, sublist display via DOM	
 * 			  19 Dec 2011	  dembuscado		Synchronized data in sublist to custom record							
 */

var TRANS_CS_ItemSpecificEntryForm = {};
function init_CS_ItemSpecificEntryForm() {
	var translates = [];
	translates.push(new TranslateMember('label.customers.select', 'SELECT_CUSTOMERS', 'Select Customers'));
	translates.push(new TranslateMember('label.customers.ss.select', 'SELECT_CUST_SEARCH', 'Select Customer Saved Search'));
	translates.push(new TranslateMember('label.customers.ss.new', 'CREATE_CUST_SEARCH', 'Create New Customer Search'));
	translates.push(new TranslateMember('label.items.select', 'SELECT_ITEM', 'Select Item'));
	translates.push(new TranslateMember('label.items.ss.select', 'SELECT_ITEM_SEARCH', 'Select Item Saved Search'));
	translates.push(new TranslateMember('label.items.ss.new', 'CREATE_ITEM_SEARCH', 'Create New Item Saved Search'));
	translates.push(new TranslateMember('label.order.discount.new.long', 'NEW_ORDER_DISC', 'New Order Discount (% or Amount Off)'));
	translates.push(new TranslateMember('label.shipping.discount.new', 'NEW_SHIPPING_DISC', 'New Shipping Discount'));
	translates.push(new TranslateMember('label.shipping.isfree.new', 'NEW_ISFSHIPPING', 'New Item Specific Free Shipping'));
	translates.push(new TranslateMember('label.shipping.isfree.edit', 'EDIT_ISFSHIPPING', 'Edit Item Specific Free Shipping'));
	translates.push(new TranslateMember('label.shipping.item.search.free.new', 'NEW_SS_ISFSHIPPING', 'Select Item Saved Search for Free Shipping'));
	translates.push(new TranslateMember('label.shipping.item.search.free.edit', 'EDIT_SS_ISFSHIPPING', 'Edit Item Saved Search for Free Shipping'));
	translates.push(new TranslateMember('label.order.total.set', 'ORDER_TOTAL', 'Set Order Total'));
	translates.push(new TranslateMember('label.shipping.discount', 'SHIPPING_DISC', 'Shipping Discount'));
	translates.push(new TranslateMember('confirm.removerow', 'CONFIRM_REMOVE_ROW', 'Are you sure you want to remove this row?'));	
	translates.push(new TranslateMember('confirm.eligibility.edit', 'CONFIRM_ELIGIBILITY_EDIT', 'Changing the eligibility criteria will remove all discount settings. Do you want to continue?')); // new translation string
	translates.push(new TranslateMember('label.edit', 'EDIT', 'Edit'));
	translates.push(new TranslateMember('label.remove', 'REMOVE', 'Remove'));
	translates.push(new TranslateMember('label.preview', 'PREVIEW', 'Preview'));
	translates.push(new TranslateMember('text.search.results', 'TEXT_SEARCH_RESULTS', 'Search Results'));
	translates.push(new TranslateMember('label.customers.ss.edit', 'POPUP_TITLE_EDIT_SELECT_CUSTOMER_SAVED_SEARCH', 'Edit Customer Saved Search'));
	translates.push(new TranslateMember('label.customers.edit', 'POPUP_TITLE_EDIT_SELECT_CUSTOMERS', 'Edit Customers'));
	translates.push(new TranslateMember('label.item.edit', 'EDIT_ITEM', 'Edit Item'));
	translates.push(new TranslateMember('label.item.savedsearch.edit', 'EDIT_SEARCH_ITEM', 'Edit Item Saved Search'));
	translates.push(new TranslateMember('label.shipping.discount.edit', 'EDIT_SHIPPING', 'Edit Shipping Discount'));
	translates.push(new TranslateMember('label.order.total.edit', 'EDIT_ORDER_TOTAL', 'Edit Order Total'));
	translates.push(new TranslateMember('error.customer.select', 'ERROR_SELECT_CUSTOMER', 'Please select at least one customer from the list'));
	translates.push(new TranslateMember('error.create.tiers', 'ERROR_CREATE_TIERS', 'Eligibility and/or discount rules are already defined for this promotion. Please remove all rules to update this field.')); // new translation string
	translates.push(new TranslateMember('label.none', 'TRANS_LABEL_NONE', '-None-'));
	translates.push(new TranslateMember('label.order.total.set', 'TRANS_LABEL_ORDER_TOTAL', 'Set Order Total'));
	translates.push(new TranslateMember('label.items.select', 'TRANS_LABEL_SELECT_ITEMS', 'Select Items'));
	translates.push(new TranslateMember('label.items.ss.select', 'TRANS_LABEL_SELECT_ITEM_SS', 'Select Item Saved Search'));
	translates.push(new TranslateMember('label.items.ss.new', 'TRANS_LABEL_NEW_ITEM_SS', 'Create New Item Saved Search'));
	translates.push(new TranslateMember('text.on', 'TEXT_ON', 'on'));
	translates.push(new TranslateMember('text.off', 'TEXT_OFF', 'Off'));
	translates.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates.push(new TranslateMember('error.create.promotion.standard', 'ERROR_CREATE_PROMOTION_STANDARD', 'You cannot use an Advanced Promotions form after selecting Standard Promotion on the previous page. If you want to create an advanced promotion, go to Lists > Marketing > Promotions > New >, and select an advanced promotion type.'));
	translates.push(new TranslateMember('label.freeshipping', 'TEXT_FREE_SHIPPING', 'Free shipping'));
	translates.push(new TranslateMember('text.and', 'TEXT_AND', 'and'));
	translates.push(new TranslateMember('text.nolimit', 'TEXT_NOLIMIT', 'No Limit'));
	translates.push(new TranslateMember('label.discount.on.highest', 'LABEL_DISCOUNT_ON_HIGHEST', 'Apply Discount to Highest Valued Item'));
	TRANS_CS_ItemSpecificEntryForm = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions)
	TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_ItemSpecificEntryForm);
if (TranslateInit)
	TranslateInit();

var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.PromotionCs = new function () {
	var url = window.location.href;
	var index = url.indexOf('/app');
	var baseUrl = url.substring(0, index);
	var groupMap = {}, discItemObj = {}, discShippingObj = {};
	
	var delKeys = []; // contains internal ids to be deleted in tiers custom record

	var elligbleOrders = [];
	var eligOrderPass = null;
	
	this.globalParam = {};
	this.arr = {};
	this.isfShippingObj = '';
	this.origIsfShippingObj = '';
	this.origDiscountOnHighest = ''; // only used in Edit mode
	
	this.sublistMgr = AdvPromo.SublistManager;
	
	// used by Select Customers and Select Customer Saved Search popup
	this.eligibleCustomersObj = [];
	this.origEligibleCustomersObj = [];
	
	this.tiers = []; // sublist object for the tiered promotion data
	
	this.setEligOrder = function(order) {
		eligOrderPass = order;
	};

	this.getEligOrder = function() {
		var retVal = eligOrderPass;
		eligOrderPass = null;
		return retVal;
	};

	this.objectKeys = function(obj) {
		if (!obj)
			return [];
		if ((($.browser.msie) && ($.browser.version < 9)) || (($.browser.safari) && ($.browser.version < 5))) {
			var a = [];
			$.each(obj, function(k) {
				a.push(k);
			});
			return a;
		} else {
			try {
				return (obj) ? Object.keys(obj) : [];
			} catch (e) { // fallback
				var a = [];
				$.each(obj, function(k) {
					a.push(k);
				});
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

	this.saveRecord = function() {

		var customForm = nlapiGetFieldText("customform");
		
		if(nlapiGetFieldValue("implementation") == "default"){	// check if promotion is created via plugin or standard promotion
			alert(TRANS_CS_ItemSpecificEntryForm.ERROR_CREATE_PROMOTION_STANDARD);
			return false;
		}

		
		// eligible customer tab
		// construct the JSON containing the DB operations after comparing the old and new model
		var finalEligibleCustomersObj = this.sublistMgr.constructEligibleCustomerDbOperation(AdvPromo.PromotionCs.origEligibleCustomersObj, AdvPromo.PromotionCs.eligibleCustomersObj);
		nlapiSetFieldValue('custpage_advpromo_elig_json_customer', JSON.stringify(finalEligibleCustomersObj));
		nlapiSetFieldValue('custrecord_advpromo_customer_criteria', nlapiGetFieldValue('custpage_advpromo_applycriteria'));

		// discount tab
		var dItemObj = JSON.stringify(discItemObj);
		nlapiSetFieldValue('custpage_advpromo_discount_json_item', dItemObj);

		var dShipObj = JSON.stringify(discShippingObj);
		nlapiSetFieldValue('custpage_advpromo_discount_json_shipmethod', dShipObj);
		
		// for Item Specific Free Shipping support 
		var finalIsfShippingObj = compareIsfsSublistModels(AdvPromo.PromotionCs.origIsfShippingObj, AdvPromo.PromotionCs.isfShippingObj);
		if(finalIsfShippingObj.op){
			var ifsShipJson = JSON.stringify(finalIsfShippingObj);
			nlapiSetFieldValue('custpage_advpromo_discount_json_isf_ship', ifsShipJson);
		}		
		
		// order tab
		var orders = JSON.stringify(elligbleOrders);
		nlapiSetFieldValue('custpage_advpromo_discount_json_order', orders);
		nlapiSetFieldValue('custrecord_advpromo_order_criteria', nlapiGetFieldValue('custpage_advpromo_applyto_order'));

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
		nlapiSetFieldValue('custpage_advpromo_json_tier_delkeys', JSON.stringify(delKeys)); // submit internal ids to be deleted

		// Validation for BOGO, Buy X and Get Y are mandatory
		if (customForm == "Buy X Get Y Promotion Form") {
			var buyXFlag = true;
			var getYFlag = true;

			var tier = nlapiGetFieldValue('custrecord_advpromo_is_tiered');
			if(tier == 'T'){
				if(AdvPromo.PromotionCs.tiers.length == 0){
					buyXFlag = false;
				}else{
					if(!hasTierDiscount(AdvPromo.PromotionCs.tiers)){
						getYFlag = false;
					}
				}
			}else{
			if (orders == null || orders == '' || orders == undefined || orders == '[]') {
				buyXFlag = false;
			}

			if (orders != null && orders != '' && orders != undefined && orders != '[]') {
				for ( var i = 0; i < elligbleOrders.length; i++) {
					if (elligbleOrders[i].remove == false) {
						buyXFlag = true;
						break;
					} else {
						buyXFlag = false;
					}
				}
			}

			if (dItemObj == null || dItemObj == '' || dItemObj == undefined || dItemObj == '{}') {
				getYFlag = false;
			}

			if (dItemObj != null && dItemObj != '' && dItemObj != undefined && dItemObj != '{}') {
				for ( var i in discItemObj) {
					if (discItemObj[i].oper != 'D') {
						getYFlag = true;
						break;
					} else {
						getYFlag = false;
					}
				}
			}
			}

			if (buyXFlag == true && getYFlag == true) {
				return true;
			} else if (buyXFlag == false) {
				alert('Please enter value(s) for: Buy X');
				return false;
			} else if (getYFlag == false) {
				alert('Please enter value(s) for: Get Y');
				return false;
			}
		}
		return true;
	};

	this.cleanArr = function() {
		var theString = JSON.stringify(AdvPromo.PromotionCs.arr); // substring theString if it exceeds text area capacity

		for ( var idd in AdvPromo.PromotionCs.arr) {
			var s = idd.length - 6;
			var e = idd.length;
			var pattern = idd.substring(s, e);

			switch (AdvPromo.PromotionCs.arr[idd].operation) {

			case null:
				delete AdvPromo.PromotionCs.arr[idd];
				break;
			case 'A':
				// don't do anything
				break;
			case 'E':
				if (pattern == '_newid' && parseInt(AdvPromo.PromotionCs.arr[idd].type) == 1) { // if customer id, change operation A
					AdvPromo.PromotionCs.arr[idd].operation = 'A';
				}

				break;
			case 'D':
				if (pattern == '_newid') { // if idd has pattern '_newid', non-existent in DB
					delete AdvPromo.PromotionCs.arr[idd];
				} else {
					//					// remove all properties of arr, retain only arr[idd]
					delete AdvPromo.PromotionCs.arr[idd].promocode;

					delete AdvPromo.PromotionCs.arr[idd].description;
					delete AdvPromo.PromotionCs.arr[idd].savesearchId;

					if (AdvPromo.PromotionCs.arr[idd].type == 1) {
						delete AdvPromo.PromotionCs.arr[idd].groupId;
					} else if (AdvPromo.PromotionCs.arr[idd].type == 2) {
						delete AdvPromo.PromotionCs.arr[idd].promocodeDropdownId;
						delete AdvPromo.PromotionCs.arr[idd].savesearchName;
					}
					delete AdvPromo.PromotionCs.arr[idd].type;
				}
				break;
			}
		}

		theString = JSON.stringify(AdvPromo.PromotionCs.arr); // substring theString if it exceeds text area capacity
	};

	this.pageInit = function(type) {
		if(nlapiGetFieldValue("implementation") == "default" && type == 'create'){	// check if promotion is created via plugin or standard promotion
			alert(TRANS_CS_ItemSpecificEntryForm.ERROR_CREATE_PROMOTION_STANDARD);
			window.history.back();
		}

		
		// disable 'Create Tiers' on edit mode
		if (type == 'edit') {
			nlapiDisableField('custrecord_advpromo_is_tiered', true);
			nlapiDisableField('custrecord_advpromo_set_manual_price', true);
		}
		
		// check set manual price status
		if(nlapiGetFieldValue('custrecord_advpromo_set_manual_price') == 'T'){
			AdvPromo.PromotionCs.globalParam['set_manual_price'] = 'T';
		}else{
			AdvPromo.PromotionCs.globalParam['set_manual_price'] = 'F';
		}

		// hide standard tabs
//		hideTab();

		// Eligibility Customers tab
		AdvPromo.PromotionCs.initEligibilityCustomer(type);
		// check if data is from tiered custom record or from normal custom record

		var tier = nlapiGetFieldValue('custrecord_advpromo_is_tiered');
		if (tier == 'T') {
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
			
			nlapiRemoveSelectOption('custpage_advpromo_discount_item', '1');
			nlapiRemoveSelectOption('custpage_advpromo_discount_item', '2');
			nlapiRemoveSelectOption('custpage_advpromo_discount_item', '3');
		} else {
			AdvPromo.PromotionCs.tierModeOff();
			AdvPromo.PromotionCs.initEligibilityOrder(type);
			// Discount tab
			AdvPromo.PromotionCs.initDiscount(type);
		}
	};

	this.hideTab = function() {
		/** todo
		 * 	rename custom record field ids
		 */
		$('#minorderamtlnk').hide();
		$('#minorderamt_wrapper').hide();
		ShowTab("custpage_advpromo_eligibility_tab", true);

	};

	this.initDiscount = function(type) {
		var itemObjArr = [], shipObjArr = [];
		var nameOr = "", promoOr = "", limitOr = "", shipPriceOr = "", shipMethodOr = "";
		var shipMethodIds = [];// internal id of shipping method record
		var shipMethodNames = [];
		var selShipMethodIds = []; //internal id of selected shipping method in the dropdown 
		var discHighest = '';
		
		var itemSearchType;
		var displayOnce = true;

		var promoId = nlapiGetRecordId();
		var promoCodeIds = new Array();
		promoCodeIds.push(promoId);

		var filters = new Array();
		if (type == 'edit') {
			filters[0] = new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', promoCodeIds);
			var columns = [
				new nlobjSearchColumn('internalid'),
				new nlobjSearchColumn('custrecord_advpromo_discount_type'),
				new nlobjSearchColumn('custrecord_advpromo_discount_iatype'),
				new nlobjSearchColumn('custrecord_advpromo_discount_iid'),
				new nlobjSearchColumn('custrecord_advpromo_discount_sid'),
				new nlobjSearchColumn('custrecord_advpromo_discount_label'),
				new nlobjSearchColumn('custrecord_advpromo_discount_isf_smethod'),
				new nlobjSearchColumn('custrecord_advpromo_apply_to_highest')
            ];			
			
			var promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);

			if (promoDiscounts != null) {
				var promoDiscountCount = promoDiscounts.length;

				for ( var i = 0; i < promoDiscountCount; i++) {
					var discountId = promoDiscounts[i].getId();
					var discountType = promoDiscounts[i].getValue('custrecord_advpromo_discount_type');
					var itemAddType = promoDiscounts[i].getValue('custrecord_advpromo_discount_iatype');
					var itemId = promoDiscounts[i].getValue('custrecord_advpromo_discount_iid');
					var itemText = promoDiscounts[i].getText('custrecord_advpromo_discount_iid');
					var savedSearchId = promoDiscounts[i].getValue('custrecord_advpromo_discount_sid');
					var savedSearchText = promoDiscounts[i].getText('custrecord_advpromo_discount_sid');
					var label = promoDiscounts[i].getValue('custrecord_advpromo_discount_label');
					var shipMethIds = promoDiscounts[i].getValue('custrecord_advpromo_discount_isf_smethod');
					var shipMethNames = promoDiscounts[i].getText('custrecord_advpromo_discount_isf_smethod');
					var discountIds = new Array();
					discountIds.push(discountId);
					filters = new Array();

					switch (parseInt(discountType)) {
					case 4:
					case 1:
						var objId;
						var objText;
						
						// set this value if discount is an item or fixed price
						discHighest = promoDiscounts[i].getValue('custrecord_advpromo_apply_to_highest');

						if (itemAddType == 1) { // type saved search
							objId = savedSearchId;
							objText = savedSearchText;
							itemSearchType = true;
						} else { // type item
							objId = itemId;
							objText = itemText;
							itemSearchType = false;
						}

						// generate nameOr
						nameOr = objText;
						nameOr = nameOr.replace(/,/gi, ' or ');

						// promo offer db
						filters[0] = new nlobjSearchFilter('custrecord_advpromo_poffer_discount', null, 'anyof', discountIds);
						columns = new Array();
						columns[0] = new nlobjSearchColumn('custrecord_advpromo_poffer_amount');
						columns[1] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_percent');
						columns[2] = new nlobjSearchColumn('custrecord_advpromo_poffer_currency');
						columns[3] = new nlobjSearchColumn('custrecord_advpromo_poffer_limit');
						columns[4] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_unit');

						var promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);

						if (promoOffers != null) {

							var promoOfferCount = promoOffers.length;

							for ( var j = 0; j < promoOfferCount; j++) {
								var promoId = promoOffers[j].getId();
								var amount = promoOffers[j].getValue('custrecord_advpromo_poffer_amount');
								var isPercent = promoOffers[j].getValue('custrecord_advpromo_poffer_is_percent');
								var currency = promoOffers[j].getValue('custrecord_advpromo_poffer_currency');
								//							var currText = promoOffers[j].getText('custrecord_advpromo_poffer_currency');
								var currText = AdvPromo.PromotionCs.getCurrencySymbol(currency);
								var isUnit = promoOffers[j].getValue('custrecord_advpromo_poffer_is_unit');
								var limit = promoOffers[j].getValue('custrecord_advpromo_poffer_limit');
								var amountUnitId;
								var limitUnitId;
								var amountUnitText;
								var limitUnitText;

								// check if currency or unit
								if (isUnit == 'T') {
									limitUnitId = 0;
									limitUnitText = 'Units';
								} else {
									limitUnitId = currency;
									limitUnitText = currText;
								}

								if (isPercent == 'T') {
									amountUnitId = 0;
									amountUnitText = '%';
								} else {
									amountUnitId = currency;
									amountUnitText = currText;
								}

								itemObjArr.push({
									"discId" : discountId,
									"promoId" : promoId,
									"id" : objId,
									"text" : objText,
									"amount" : amount,
									"aunit" : amountUnitId,
									"limit" : limit,
									"lunit" : limitUnitId,
									"isUnit" : isUnit,
									"isPercent" : isPercent,
									"oper" : 'null',
									"discHighest": discHighest
								});

								//build json object based on the retrieved data
								discItemObj[promoId] = {};

								discItemObj[promoId].type = itemAddType;
								discItemObj[promoId].itemid = objId;
								discItemObj[promoId].label = objText; // same for description field
								discItemObj[promoId].amt = amount;
								discItemObj[promoId].isunit = isUnit;

								// check this out
								if (isUnit == 'T') { // if isUnit is T, limit unit is stored in currency
									discItemObj[promoId].curr = limitUnitId;

								} else {
									discItemObj[promoId].curr = amountUnitId;
								}

								discItemObj[promoId].isPercent = isPercent;
								discItemObj[promoId].limit = limit;

								discItemObj[promoId].promoId = promoId;
								discItemObj[promoId].discId = discountId;
								discItemObj[promoId].oper = null;
								discItemObj[promoId].discHighest = discHighest;

								if (displayOnce) {
									// generate promoOr
									if (promoOr == "" || isPercent == 'T') {
										if(AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
											promoOr = amount + " " + amountUnitText;
										}else{
											promoOr = amount + " " + amountUnitText + " Off";
										}

									} else {
										if(AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
											promoOr = promoOr + " or " + amount + " " + amountUnitText;
										}else{
											promoOr = promoOr + " or " + amount + " " + amountUnitText + " Off";
										}
									}

									// generate limitOr
                                    if (limit && limitUnitText && limitOr.indexOf(limit + ' ' + limitUnitText) === -1) {
                                        if (limitOr === '') {
                                            limitOr = limit + ' ' + limitUnitText;
                                        }
                                        else {
                                            limitOr += ' or ' + limit + ' ' + limitUnitText;
                                        }
                                    }
								}
							}

							displayOnce = false;
						}
						break;

					case 3: // shipping method

						// read shipping price list
						filters[0] = new nlobjSearchFilter('custrecord_advpromo_sprice_discount', null, 'anyof', discountIds);
						columns = new Array();
						columns[0] = new nlobjSearchColumn('custrecord_advpromo_sprice_amount');
						columns[1] = new nlobjSearchColumn('custrecord_advpromo_sprice_is_percent');
						columns[2] = new nlobjSearchColumn('custrecord_advpromo_sprice_currency');

						var shippingPrices = nlapiSearchRecord('customrecord_advpromo_shipping_price', null, filters, columns);

						if (shippingPrices != null) {
							var priceCount = shippingPrices.length;
							for ( var j = 0; j < priceCount; j++) {
								var priceId = shippingPrices[j].getId();
								var amount = shippingPrices[j].getValue('custrecord_advpromo_sprice_amount');
								var isPercent = shippingPrices[j].getValue('custrecord_advpromo_sprice_is_percent');
								var currency = shippingPrices[j].getValue('custrecord_advpromo_sprice_currency');
								//							var currText = shippingPrices[j].getText('custrecord_advpromo_sprice_currency');
								var currText = AdvPromo.PromotionCs.getCurrencySymbol(currency);

								//build json object
								discShippingObj[priceId] = {};

								discShippingObj[priceId].amount = amount;
								discShippingObj[priceId].curr = currency;
								discShippingObj[priceId].isPercent = isPercent;
								discShippingObj[priceId].oper = null;

								shipObjArr.push({
									"amount" : amount,
									"currency" : currency
								});
								if (shipPriceOr == "") {
									if (isPercent == 'T') {
										shipPriceOr = amount + "% " + TRANS_CS_ItemSpecificEntryForm.TEXT_OFF;
									} else {
										shipPriceOr = amount + " " + currText;
									}

								} else {
									shipPriceOr = shipPriceOr + " or " + amount + " " + currText;
								}
							}

						}

						// read shipping method	
						var arrIds = (shipMethIds ? shipMethIds.split(',') : []);
						var arrNames = (shipMethNames ? shipMethNames.split(',') : []);
						
						if(arrIds){
							for (var j = 0; j < arrIds.length; j++) {
								var method = arrIds[j];
//								shipMethodIds.push(''); // no need for this since the custom record will be deleted
								selShipMethodIds.push(method);

								if(shipMethodOr == "") {
									shipMethodOr = arrNames[j];
								} else {
									shipMethodOr = shipMethodOr + "/" + arrNames[j];
								}	
							}
							discShippingObj['savShipIds'] = shipMethodIds;
							discShippingObj['discId'] = discountId;						
							
						}
						
						break;
					}
				}
			}

			if (shipMethodOr != "") {
				shipPriceOr = shipPriceOr + ' ' + TRANS_CS_ItemSpecificEntryForm.TEXT_ON + ' ' + shipMethodOr;
			}

			if (itemObjArr.length != 0) {
				if(AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'T'){
					promoOr = "Fixed Price: " + promoOr;
				}
				
				if(discHighest == 'T'){
					promoOr = TRANS_CS_ItemSpecificEntryForm.LABEL_DISCOUNT_ON_HIGHEST + ' / ' + promoOr;
					AdvPromo.PromotionCs.origDiscountOnHighest = 'T';
				}
				
				if(limitOr == ''){
					limitOr = TRANS_CS_ItemSpecificEntryForm.TEXT_NOLIMIT;
				}
				AdvPromo.PromotionCs.addItemIdToObject(itemObjArr, [ nameOr, promoOr, limitOr ], 'custpage_advpromo_discount_list', itemSearchType, null); // itemSearchType true if item saved search, operationType is null if just loaded
			} else {
				nlapiRemoveSelectOption('custpage_advpromo_discount_item');
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', '-None-', false);
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '1', 'Select Item', false);
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '2', 'Select Item Search', false);
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '3', 'Create New Saved Search', false);

			}

			if (AdvPromo.PromotionCs.objectKeys(discShippingObj).length != 0) {
				AdvPromo.PromotionCs.addShippingMethodToObject([ shipObjArr, [], selShipMethodIds ], shipPriceOr, 'custpage_advpromo_discount_list', null);
			} else {
				// handle re-insertion of add shipping dropdown
			}

			showFreeShippingRuleInSublist(TRANS_CS_ItemSpecificEntryForm);
		}
	};

	this.getCurrencySymbol = function(key) {
		if (AdvPromo.PromotionCs.isFeatureEnabled('MULTICURRENCY')) {
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

	this.initEligibilityOrder = function(type) {
		// nlapiSetFieldValue('custpage_advpromo_json_test', '{1}');
		if ((type == 'edit') || (type == 'view')) {
			// nlapiSetFieldValue('custpage_advpromo_applyto_order', nlapiGetFieldValue('custrecord_advpromo_order_criteria'));
			var orders = JSON.parse(nlapiGetFieldValue('custpage_advpromo_discount_json_order'));
			if (!(orders instanceof Array))
				return;
			for ( var i = 0; i < orders.length; i++) {
				AdvPromo.PromotionCs.addRowOrderTab(orders[i]);
			}
		}
	};

	this.initTieredShipMethod = function(){

		var itemObjArr = [], shipObjArr = [];
		var  shipPriceOr = "", shipMethodOr = "";
		var shipMethodIds = [];// internal id of shipping method record
		var selShipMethodIds = []; //internal id of selected shipping method in the dropdown 
		var promoId = nlapiGetRecordId();
		var promoCodeIds = new Array();

		promoCodeIds.push(promoId);

		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', promoCodeIds);
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('internalid');
		columns[1] = new nlobjSearchColumn('custrecord_advpromo_discount_type');
		columns[2] = new nlobjSearchColumn('custrecord_advpromo_discount_iatype');
		columns[3] = new nlobjSearchColumn('custrecord_advpromo_discount_iid');
		columns[4] = new nlobjSearchColumn('custrecord_advpromo_discount_sid');
		columns[5] = new nlobjSearchColumn('custrecord_advpromo_discount_label');
		columns[6] = new nlobjSearchColumn('custrecord_advpromo_discount_isf_smethod');

		var promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);

		if(promoDiscounts != null){
			var promoDiscountCount = promoDiscounts.length;

			for(var i = 0; i < promoDiscountCount; i++){
				var discountId = promoDiscounts[i].getId();	
				var discountType = promoDiscounts[i].getValue('custrecord_advpromo_discount_type');
				var shipMethIds = promoDiscounts[i].getValue('custrecord_advpromo_discount_isf_smethod');
				var shipMethNames = promoDiscounts[i].getText('custrecord_advpromo_discount_isf_smethod');

				var discountIds = new Array();
				discountIds.push(discountId);
				filters = new Array();

				switch(parseInt(discountType)){

				case 3:	// shipping method
					// read shipping price list
					filters[0] = new nlobjSearchFilter('custrecord_advpromo_sprice_discount', null, 'anyof', discountIds);
					columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_advpromo_sprice_amount');
					columns[1] = new nlobjSearchColumn('custrecord_advpromo_sprice_is_percent');
					columns[2] = new nlobjSearchColumn('custrecord_advpromo_sprice_currency');

					var shippingPrices = nlapiSearchRecord('customrecord_advpromo_shipping_price', null, filters, columns);

					if(shippingPrices != null){
						var priceCount = shippingPrices.length;
						for(var j=0; j<priceCount; j++){
							var priceId = shippingPrices[j].getId();
							var amount = shippingPrices[j].getValue('custrecord_advpromo_sprice_amount');
							var isPercent = shippingPrices[j].getValue('custrecord_advpromo_sprice_is_percent');
							var currency = shippingPrices[j].getValue('custrecord_advpromo_sprice_currency');
							var currText = AdvPromo.PromotionCs.getCurrencySymbol(currency);

							//build json object
							discShippingObj[priceId] = {};
							discShippingObj[priceId].amount = amount;
							discShippingObj[priceId].curr = currency;
							discShippingObj[priceId].isPercent = isPercent;
							discShippingObj[priceId].oper = null;

							shipObjArr.push({"amount":amount, "currency":currency});	
							if(shipPriceOr == ""){
								if(isPercent == 'T'){
									shipPriceOr = amount + "% " + TRANS_CS_ItemSpecificEntryForm.TEXT_OFF;
								}else{
									shipPriceOr = amount + " " + currText;
								}
							}else{
								shipPriceOr = shipPriceOr + " or " + amount + " " + currText; 
							}
						}
					}

					// read shipping method	
					var arrIds = (shipMethIds ? shipMethIds.split(',') : []);
					var arrNames = (shipMethNames ? shipMethNames.split(',') : []);

					if(arrIds){
						for (var j = 0; j < arrIds.length; j++) {
							var method = arrIds[j];
//							shipMethodIds.push(''); // no need for this since the custom record will be deleted
							selShipMethodIds.push(method);

							if(shipMethodOr == "") {
								shipMethodOr = arrNames[j];
							} else {
								shipMethodOr = shipMethodOr + "/" + arrNames[j];
							}	
						}
						discShippingObj['savShipIds'] = shipMethodIds;
						discShippingObj['discId'] = discountId;						
					}
					
					break;
				}
			}
		}

		if(shipMethodOr != ""){
			shipPriceOr = shipPriceOr + ' ' + TRANS_CS_ItemSpecificEntryForm.TEXT_ON + ' ' + shipMethodOr;
		}

		if(AdvPromo.PromotionCs.objectKeys(discShippingObj).length != 0){
			AdvPromo.PromotionCs.addShippingMethodToObject([shipObjArr,[], selShipMethodIds], shipPriceOr, 'custpage_advpromo_discount_list', null);
		}else{
			// handle re-insertion of add shipping dropdown
		}
		
		showFreeShippingRuleInSublist(TRANS_CS_ItemSpecificEntryForm);
		
		var stop = true;

	};

	this.initTieredData = function(type) {
		if ((type == 'edit') || (type == 'view')) {
			AdvPromo.PromotionCs.globalParam['31_tablerow'] = 0;
			AdvPromo.PromotionCs.tiers = JSON.parse(nlapiGetFieldValue('custpage_advpromo_tier_json_order_disc'));
			var itemOr = "";
			var discItemOr = "";
			var renderLink = false;
			var renderEdit = true;
			var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();

			AdvPromo.PromotionCs.itemSpecProperties.tiers = AdvPromo.PromotionCs.tiers.length;
			// process tiers for sublist display
			for ( var i = 0; i < AdvPromo.PromotionCs.tiers.length; i++) {
				if (AdvPromo.PromotionCs.tiers[i].etype == 1) { // item search
					itemOr = AdvPromo.PromotionCs.tiers[i].esdesc;
				} else if (AdvPromo.PromotionCs.tiers[i].etype == 2) {
//					itemOr = AdvPromo.PromotionCs.getItemDescriptionFormat(AdvPromo.PromotionCs.tiers[i].eiid); // format eligible items
					itemOr = AdvPromo.PromotionCs.tiers[i].itemOr;
				}

				// check for other type of promotion
				if (AdvPromo.PromotionCs.tiers[i].dtype == 1) { // for item spec promotion
					if (AdvPromo.PromotionCs.tiers[i].disatype == 1) { // item search
						discItemOr = AdvPromo.PromotionCs.tiers[i].ditemOr;
					} else {
//						discItemOr = AdvPromo.PromotionCs.getItemDescriptionFormat(AdvPromo.PromotionCs.tiers[i].diid); // format discount items
						discItemOr = AdvPromo.PromotionCs.tiers[i].ditemOr;
					}
				}

				if (i == 0) {
					renderLink = true;
				} else {
					renderLink = false;
				}
				// during loading, rowId is the same as objId
				AdvPromo.PromotionCs.addTieredRowOrderTab(AdvPromo.PromotionCs.tiers[i], i, renderLink, i, currencyMap); // display order tab data
				AdvPromo.PromotionCs.addTieredDiscountTab(AdvPromo.PromotionCs.tiers[i], i, renderLink, i, renderEdit, currencyMap); // display discount tab data
			}
			
			// store original value of 'Apply Discount to Highest Valued Item' 
			if(AdvPromo.PromotionCs.tiers && AdvPromo.PromotionCs.tiers.length > 0 && AdvPromo.PromotionCs.tiers[0].disc && AdvPromo.PromotionCs.tiers[0].disc.length > 0){
				AdvPromo.PromotionCs.origDiscountOnHighest = AdvPromo.PromotionCs.tiers[0].disc[0].discHighest;	
			}

			if (itemOr != "") {
				AdvPromo.PromotionCs.addRow('custpage_advpromo_eligible_order_list', [ AdvPromo.PromotionCs.truncateTextField("Item: " + itemOr), "", "", "", "" ]);
			}
			if (discItemOr != "") {
				AdvPromo.PromotionCs.addRow('custpage_advpromo_discount_list', [ AdvPromo.PromotionCs.truncateTextField("Item: " + discItemOr), " ", " ", " ", " ", " " ]);
			}

			AdvPromo.PromotionCs.initTieredShipMethod();
		}
	};

	this.initEligibilityCustomer = function(type) {

		// populate eligibleCustomersObj
		this.sublistMgr.initializeEligibilityCustomerSublistModel(TRANS_CS_ItemSpecificEntryForm);
		
		// render model to sublist
		this.sublistMgr.renderEligibilityCustomerSublistEditMode();
		
	};

	this.fieldChange = function(type, name, linenum) {

		// Create Tiers check box events
		if (name == 'custrecord_advpromo_is_tiered') {
			
			// get NEW and PREVIOUS value of Create Tiers checkbox
			var newTier = nlapiGetFieldValue('custrecord_advpromo_is_tiered');
			var prevTier = newTier == 'T' ? 'F' : 'T';
			
			// get count of existing eligibility rules
			// AdvPromo.PromotionCs.tiers.length if Check Tiers previously checked
			// elligbleOrders.length if Check Tiers previously unchecked
			var eligibilityRulesCount = prevTier == 'T' ? AdvPromo.PromotionCs.tiers.length : elligbleOrders.length;
			
			// if there are existing eligibility rules defined
			// also check if there are existing shipping discounts defined
			if(eligibilityRulesCount != 0 || AdvPromo.PromotionCs.globalParam.hasOwnProperty("tShipMethod")) {
				
				// revert checkbox to previous value, set isFireFieldChanged to false
				nlapiSetFieldValue('custrecord_advpromo_is_tiered', prevTier, false);
				
				// prompt user that this field cannot be changed
				alert(TRANS_CS_ItemSpecificEntryForm.ERROR_CREATE_TIERS);

			} else {
				
				// otherwise, proceed with switch of views
				if (newTier == 'T') {
					AdvPromo.PromotionCs.tierModeOn();
					nlapiDisableField('custrecord_advpromo_set_manual_price', true);
				} else {
					AdvPromo.PromotionCs.tierModeOff();
					nlapiDisableField('custrecord_advpromo_set_manual_price', false);
				}
			}
		}

		if(name == 'custrecord_advpromo_set_manual_price'){
			var newSetValue = nlapiGetFieldValue(name);
			var prevSetValue = newSetValue == 'T' ? 'F' : 'T';
			
			if(elligbleOrders.length != 0 || AdvPromo.PromotionCs.globalParam.hasOwnProperty("tShipMethod")){
				nlapiSetFieldValue(name, prevSetValue, false);
				alert(TRANS_CS_ItemSpecificEntryForm.ERROR_CREATE_TIERS);
			}
			
			if(nlapiGetFieldValue('custrecord_advpromo_set_manual_price') == 'T'){
				AdvPromo.PromotionCs.globalParam['set_manual_price'] = 'T';
				nlapiDisableField('custrecord_advpromo_is_tiered', true);
			}else{
				AdvPromo.PromotionCs.globalParam['set_manual_price'] = 'F';
				nlapiDisableField('custrecord_advpromo_is_tiered', false);
			}
		}

		var nType = parseInt(nlapiGetFieldValue(name));
		if (!nType)
			return;
		// on change of dropdown list
		if (name == 'custpage_advpromo_addcustomer' || name == 'custpage_advpromo_discount_item') {
			if (nlapiGetFieldValue(name) == '1') // item or customer
			{
				AdvPromo.PromotionCs.addPopupLink(1, name);
			}

			if (nlapiGetFieldValue(name) == '2') // item or customer saved search
			{
				AdvPromo.PromotionCs.addPopupLink(2, name);
			}

			if (nlapiGetFieldValue(name) == '3') {
				AdvPromo.PromotionCs.addPopupLink(3, name);
			}

			if (nlapiGetFieldValue(name) == '4') {
				AdvPromo.PromotionCs.addPopupLink(4, name);
			}

			nlapiSetFieldValue(name, '0', false);
		}

		// on change of shipping dropdown
		if (name == 'custpage_advpromo_discount_shipping') {
			switch(nlapiGetFieldValue(name)){
				case '1': // New Shipping Discount
					AdvPromo.PromotionCs.addPopupLink(1, name);
					break;
				case '2': // New Item Specific Free Shipping
					AdvPromo.PromotionCs.addPopupLink(2, name);
					break;
				case '3': // Select Item Saved Search for Free Shipping
					AdvPromo.PromotionCs.addPopupLink(3, name);
					break;
			}
			
			nlapiSetFieldValue(name, '0', false);
		} else if (name == 'custpage_advpromo_addorder') {
			// alert('value: ' + nlapiGetFieldValue(name));
			AdvPromo.PromotionCs.addPopupLink(nType, name);
			nlapiSetFieldValue(name, '0', false);
		}

		// This will only trigger for One World accounts
		if (nlapiGetContext().getFeature('SUBSIDIARIES')) {

			if (name == 'discount') { // on change of Discount Item
				var fldSubsidiaries = new Array();
				var recDiscountItem = nlapiLoadRecord('discountitem', nType);
				var fldSubsidiary = recDiscountItem.getFieldValues('subsidiary');
				var fldIncludeChildren = recDiscountItem.getFieldValue('includechildren');

				// check if Subsidiary Field returns an array
				if (fldSubsidiary instanceof Array) {
					for ( var i in fldSubsidiary) {
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
				title = TRANS_CS_ItemSpecificEntryForm.SELECT_CUSTOMERS;
				popUpHeight = 200;
				popUpWidth = 400;

				break;

			case 2: // customer saved search
//				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_add_customer_ss', 'customdeploy_advpromo_add_customer_ss');
				addLink = nlapiResolveURL('SUITELET', 'customscript_ap_select_custsrch_sl', 'customdeploy_ap_select_custsrch_sl');
				title = TRANS_CS_ItemSpecificEntryForm.SELECT_CUST_SEARCH;
				popUpHeight = 200;
				popUpWidth = 650;

				break;

			case 3:
				addLink = baseUrl + '/app/common/search/search.nl?searchtype=Customer&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
				title = TRANS_CS_ItemSpecificEntryForm.CREATE_CUST_SEARCH;
				popUpHeight = 550;
				popUpWidth = 700;
				windowOpen = true;

				break;
			}
		}

		if (name == 'custpage_advpromo_discount_item') {
			switch (type) {
			case 1: // add item
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[1].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[1].deployname);
				addLink += '&promoId=' + nlapiGetRecordId(); // empty if new mode
				title = TRANS_CS_ItemSpecificEntryForm.SELECT_ITEM;
				popUpHeight = 300;
				popUpWidth = 550;
				break;

			case 2: // add item search
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[2].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[2].deployname);
				addLink += '&promoId=' + nlapiGetRecordId(); // empty if new mode
				title = TRANS_CS_ItemSpecificEntryForm.SELECT_ITEM_SEARCH;
				popUpHeight = 300;
				popUpWidth = 550;
				break;

			case 3: // new item saved search

				addLink = baseUrl + '/app/common/search/search.nl?searchtype=Item&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
				title = TRANS_CS_ItemSpecificEntryForm.CREATE_ITEM_SEARCH;
				popUpHeight = 550;
				popUpWidth = 700;
				windowOpen = true;
				break;

			case 4: // new order discount
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[4].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[4].deployname);
				title = TRANS_CS_ItemSpecificEntryForm.NEW_ORDER_DISC;
				popUpHeight = 300;
				popUpWidth = 400;

				break;
			}
		}

		if (name == 'custpage_advpromo_discount_shipping') {
			switch (type) {
			case 1:
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_dis_addship_ss', 'customdeploy_advpromo_is_dis_addship_ss');
				title = TRANS_CS_ItemSpecificEntryForm.NEW_SHIPPING_DISC;
				popUpHeight = 300;
				popUpWidth = 400;
				break;
			case 2:
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss');
				title = TRANS_CS_ItemSpecificEntryForm.NEW_ISFSHIPPING;
				popUpHeight = 500;
				popUpWidth = 650;
				break;
			case 3: //add dummy value for savedSearchId to be used as flag
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss')+"&savedSearchId=" + '-1' ;
				title = TRANS_CS_ItemSpecificEntryForm.NEW_SS_ISFSHIPPING;
				popUpHeight = 520;
				popUpWidth = 400;
				break;
			}
		}

		if (name == 'custpage_advpromo_addorder') {
			AdvPromo.PromotionCs.globalParam['tier_dtype'] = 1;	// item specific promotion discount type
			switch (type) {
			case 1: // all item
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addOrderPopups[1].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addOrderPopups[1].deployname);
				title = TRANS_CS_ItemSpecificEntryForm.ORDER_TOTAL;
				popUpHeight = 200;
				popUpWidth = 400;
				break;
			case 2: // add item
				// addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_order_add_item', 'customdeploy_advpromo_is_order_add_item');
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addOrderPopups[2].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addOrderPopups[2].deployname);
				title = TRANS_CS_ItemSpecificEntryForm.SELECT_ITEM;
				popUpHeight = 300;
				popUpWidth = 400;
				break;
			case 3: // add item search
				// addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_order_add_searc', 'customdeploy_advpromo_is_order_add_searc');
				addLink = nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addOrderPopups[3].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addOrderPopups[3].deployname);
				title = TRANS_CS_ItemSpecificEntryForm.SELECT_ITEM_SEARCH;
				popUpHeight = 200;
				popUpWidth = 600;
				break;
			case 4: // new item saved search
				addLink = baseUrl + '/app/common/search/search.nl?searchtype=Item&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
				title = TRANS_CS_ItemSpecificEntryForm.CREATE_ITEM_SEARCH;
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

	//instance of arr object with elements is only accessible to this method
	//build the array object here with necessary data to be synchronized to db

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

	this.insertCustomerIds = function(selectedCustomers, recordType, idd) {
		// check recordType should be 2
		var theType = 'custpage_advpromo_eligible_customer_list';
		var theTable = $('#' + theType + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), idd, recordType, theType);
		var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), idd, recordType);

		AdvPromo.PromotionCs.addRow(theType, [ selectedCustomers, selectedCustomers, '', editAnch, deleteAnch ]); // if type is customer id
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
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}
		var recordType = obj.type;
		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), idd, recordType, theType);
		var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), idd, recordType, theType);

		// call addRow depending on the obj.type

		switch (parseInt(obj.type)) {
		case 2:
			var searchText = obj.searchText;
			searchText = searchText.replace(/,/gi, " or ");

			AdvPromo.PromotionCs.addRow(theType, [ searchText, searchText, "", editAnch, deleteAnch ]); // if type is customer id
			break;
		case 1:
			var previewAnch = AdvPromo.PromotionCs.makeLink('P', (rows), obj.savesearchId, recordType);
			AdvPromo.PromotionCs.addRow(theType, [ obj.savesearchName, obj.description, previewAnch, editAnch, deleteAnch ]); // if type is customer saved search
			break;
		}
	};

	this.addItemIdToObject = function(objArr, orArr, theType, itemSearchType, operationType) {
		//	var theType = 'custpage_advpromo_discount_list';
		var previewAnch = "";

		var theTable = $('#' + theType + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		if (itemSearchType) {
			var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), null, '22', theType);
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '22', theType, objArr);
			previewAnch = AdvPromo.PromotionCs.makeLink('P', (rows), objArr[0].id, null);

			if (operationType != null) {
				AdvPromo.PromotionCs.packItemToObject(objArr, 1, operationType);
			}

		} else {
			var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), null, '21', theType);
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '21', theType, objArr);

			if (operationType != null) {
				AdvPromo.PromotionCs.packItemToObject(objArr, 2, operationType);
			}

		}

		AdvPromo.PromotionCs.addRow(theType, [ orArr[0], orArr[1], orArr[2], previewAnch, editAnch, deleteAnch ]);

		//remove these selection, addition of sublist entry is restricted to one time only
		//if objArr != null, only then that the dropdown selection will be disabled
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '1');
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '2');
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '3');
	};

	this.packShippingToObject = function(shipPriceObj, shipMethod) {
		//shipping price
		for ( var i = 0; i < shipPriceObj.length; i++) {
			discShippingObj[i + '_newid'] = {};

			discShippingObj[i + '_newid'].amount = shipPriceObj[i].amount;
			discShippingObj[i + '_newid'].curr = shipPriceObj[i].currency;
			discShippingObj[i + '_newid'].isPercent = shipPriceObj[i].isPercent;
			discShippingObj[i + '_newid'].oper = shipPriceObj[i].oper;
		}

		//shipping method
		discShippingObj['addShipIds'] = {};
		discShippingObj['addShipIds'] = shipMethod;
	};

	this.packItemToObject = function(obj, addType, operationType) { // Item = 2, saved search = 1
		for ( var i = 0; i < obj.length; i++) {

			discItemObj[i + '_newid'] = {};

			discItemObj[i + '_newid'].type = addType;
			discItemObj[i + '_newid'].itemid = obj[i].id;
			discItemObj[i + '_newid'].label = obj[i].text; // same for description field
			discItemObj[i + '_newid'].amt = obj[i].amount;
			discItemObj[i + '_newid'].isunit = obj[i].isUnit;
			discItemObj[i + '_newid'].discHighest = obj[i].discHighest;

			if (obj[i].isUnit == 'T') { // if isUnit is T, limit unit is stored in currency
				discItemObj[i + '_newid'].curr = obj[i].aunit;

			} else {
				discItemObj[i + '_newid'].curr = obj[i].lunit;
			}

			discItemObj[i + '_newid'].isPercent = obj[i].isPercent;
			discItemObj[i + '_newid'].limit = obj[i].limit;

			switch (operationType) { // to test
			case 'A':
				discItemObj[i + '_newid'].oper = 'A';
				break;
			case 'D':
				discItemObj[i + '_newid'].oper = 'D';
				discItemObj[i + '_newid'].promoId = obj[i].promoId;
				discItemObj[i + '_newid'].discId = obj[i].discId;
				break;

			default:
				discItemObj[i + '_newid'].promoId = obj[i].promoId;
				discItemObj[i + '_newid'].discId = obj[i].discId;
				discItemObj[i + '_newid'].oper = null;
				break;

			}
		}
	};

	this.addShippingMethodToObject = function(objArr, orArr, theType, operationType) {

		var previewAnch = "";

		var theTable = $('#' + theType + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '23', theType, objArr);
		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), null, '23', theType);

		if (operationType != null) { // if null loaded from custom record
			var shipObjArr = objArr[0];
			var shipMethodNames = objArr[1];
			var shipMethodIds = objArr[2];

			AdvPromo.PromotionCs.packShippingToObject(shipObjArr, shipMethodIds);
		}

		AdvPromo.PromotionCs.addRow(theType, [ TRANS_CS_ItemSpecificEntryForm.SHIPPING_DISC, orArr, TRANS_CS_ItemSpecificEntryForm.TEXT_NOLIMIT, previewAnch, editAnch, deleteAnch ]); // can add a type for specific row number, discount tab only

		AdvPromo.PromotionCs.globalParam['tShipMethod'] = {};
		AdvPromo.PromotionCs.globalParam['tShipMethod'].name = TRANS_CS_ItemSpecificEntryForm.SHIPPING_DISC;
		AdvPromo.PromotionCs.globalParam['tShipMethod'].promoOr = orArr;
		AdvPromo.PromotionCs.globalParam['tShipMethod'].objArr = objArr;
		AdvPromo.PromotionCs.globalParam['tShipMethod'].editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '23',theType, objArr);
		AdvPromo.PromotionCs.globalParam['tShipMethod'].deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), null, '23', theType);

		//remove all selection. XOR condition for shipping discount and ISFS
		nlapiRemoveSelectOption('custpage_advpromo_discount_shipping');
		nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
	};

	this.addisfShippingToObject = function(selectedisfShipping, nameDisplay, textDisplay,  theType, rowNumber) {

		//update the AdvPromo.PromotionCs.isfShippingObj
		AdvPromo.PromotionCs.isfShippingObj = selectedisfShipping;
		var previewAnch = "";

		var theTable = $('#' + theType + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}
		if(AdvPromo.PromotionCs.isfShippingObj.searchId){
			previewAnch = AdvPromo.PromotionCs.makeLink('P', (rows), AdvPromo.PromotionCs.isfShippingObj.searchId, 'Item');
		}
		//check if savedsearch mode
		var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '24', theType, []);
		//'add new' mode
		if(!rowNumber){
			var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), null, '24', theType);
			AdvPromo.PromotionCs.addRow(theType, [ nameDisplay, textDisplay, TRANS_CS_ItemSpecificEntryForm.TEXT_NOLIMIT, previewAnch, editAnch, deleteAnch ]); // can add a type for specific row number, discount tab only
		}
		else{ //'edit' mode
			
			$("#custpage_advpromo_discount_listcol" + rowNumber + "0").text(nameDisplay);
			$("#custpage_advpromo_discount_listcol" + rowNumber + "1").text(textDisplay);
			$("#custpage_advpromo_discount_listcol" + rowNumber + "2").text(TRANS_CS_ItemSpecificEntryForm.TEXT_NOLIMIT);

			// remove the link to Edit and create a new one with associated record
			$("#custpage_advpromo_discount_listcol" + rowNumber + "4").children().remove();
			$("#custpage_advpromo_discount_listcol" + rowNumber + "4").append(editAnch);
			if(AdvPromo.PromotionCs.isfShippingObj.searchId){
				$("#custpage_advpromo_discount_listcol" + rowNumber + "3").children().remove();
				$("#custpage_advpromo_discount_listcol" + rowNumber + "3").append(previewAnch);
			}
			//fix for false negative. ( - window has not changed popup message)
			setWindowChanged(window, true);
		}
		//remove all selection. XOR condition for shipping discount and ISFS
		nlapiRemoveSelectOption('custpage_advpromo_discount_shipping');
		nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
	};

	this.addRow = function(tableId, theValues) {
		var className;
		var i;
		var newCol;
		var newText;
		var values;

		// Table Name is sublist name with suffix "_splits"
		// var theTable = document.getElementById(tableId + "_splits");
		var theTable = $('#' + tableId + '_splits');

		var row = theTable[0].rows.length - 1; // decrement by 1 to not include the header

		// Initial content of first non-header row if no content is "No records to show".
		// Delete this row
		var firstRow = theTable.children().children(':nth-child(2)');
		if ((row == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			row = 0;
		}

		var newRow = $('<tr>');

		// Row ID is sublistName + "row" + rownumber
		// rownumber is zero (1st row) to n..
		newRow.attr('id', (tableId + 'row' + (row)));

		// CSS cladd ID for line. Alternating styles/color for each row.
		if (row % 2)
			className = 'listtext';
		else
			className = 'listtexthl';
		//	className = 'listtexthl';	// for tiered promotion

		// Do not call directly from popup window! Passed array will not be
		// detected as intance of Array, but an instanceof Object.
		if (theValues instanceof Array) {
			values = theValues;
		} else {
			values = [ theValues ];
		}

		for (i = 0; i < values.length; i++) {
			newCol = $('<td>');
			newCol.attr('id', (tableId + 'col' + (row) + (i)));
			// if (!(values[i] instanceof HTMLElement))
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
		//	var theType = 'custpage_advpromo_eligible_customer_list';

		var r = confirm(TRANS_CS_ItemSpecificEntryForm.CONFIRM_REMOVE_ROW);
		if (r == true) {
			switch (parseInt(recordType)) {
			// case 1 and 2 Eligible Customer Tab
			case 2: //Customer Id		
				AdvPromo.PromotionCs.arr[idd].operation = 'D';
				break;
			case 1: // saved search		
				AdvPromo.PromotionCs.arr[idd].operation = 'D';
				var sid = AdvPromo.PromotionCs.arr[idd].savesearchId;
				delete AdvPromo.PromotionCs.globalParam['customersid'][sid];
				break;

			case 21: // DiscountTab Item

			case 22: // DiscountTab SavedSearch 
				nlapiRemoveSelectOption('custpage_advpromo_discount_item');
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', '-None-', false);
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '1', 'Select Item', false);
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '2', 'Select Item Search', false);
				nlapiInsertSelectOption('custpage_advpromo_discount_item', '3', 'Create New Saved Search', false);

				// remove data from discItemObj
				for ( var i in discItemObj) {
					if (discItemObj[i].oper == 'A' || discItemObj[i].oper == 'E') { // if currently oper is 'A' or 'E', don't pass to the server anymore
						delete discItemObj[i];
					} else {
						discItemObj[i].oper = 'D';
					}
				}
				break;

			case 23: // DiscountTab Shipping
				
				//always put the shipping discount as first option of the drop down list
				nlapiRemoveSelectOption('custpage_advpromo_discount_shipping');
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '1', TRANS_CS_ItemSpecificEntryForm.NEW_SHIPPING_DISC, false); 
				//always show isfs when shipping discount is shown
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '2', TRANS_CS_ItemSpecificEntryForm.NEW_ISFSHIPPING, false);
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '3', TRANS_CS_ItemSpecificEntryForm.NEW_SS_ISFSHIPPING, false);
				
				// remove data from discShipObj
				for ( var i in discShippingObj) {
					if (discShippingObj[i].oper == 'A') {
						delete discShippingObj[i];
					} else {
						discShippingObj[i].oper = 'D';
					}
				}

				//make sure that shipping method is also deleted
				if (discShippingObj.hasOwnProperty("savShipIds")) {
					discShippingObj["delShipIds"] = discShippingObj["savShipIds"];
					delete discShippingObj["savShipIds"];
				} else {
					// nothing to delete
				}
				
				// delete copy of shipping method for tiered promotion
				if(AdvPromo.PromotionCs.globalParam.hasOwnProperty("tShipMethod")){
					delete AdvPromo.PromotionCs.globalParam["tShipMethod"];
				}
				break;
				
			case 24: //ifshipping
				//always put the shipping discount as first option of the drop down list
				nlapiRemoveSelectOption('custpage_advpromo_discount_shipping');
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '1', TRANS_CS_ItemSpecificEntryForm.NEW_SHIPPING_DISC, false);
				//always show isfs when shipping discount is shown
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '2', TRANS_CS_ItemSpecificEntryForm.NEW_ISFSHIPPING, false);
				nlapiInsertSelectOption('custpage_advpromo_discount_shipping', '3', TRANS_CS_ItemSpecificEntryForm.NEW_SS_ISFSHIPPING, false);
				
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
				break;
			// case 3x reserved for tiered promotion
			case 31: // delete all rows in eligible order tab tiered promotion
				AdvPromo.PromotionCs.deleteTieredAllOrdersSublist(idd, AdvPromo.PromotionCs.itemSpecProperties.tiers);
				AdvPromo.PromotionCs.addTierDiscountShipping();	// restore shipping method line if any
				break;

			case 32:

				break;

			case 3:
				var idx = 0;
				var numeric = new RegExp("^([0-9]+_)*[0-9]+$");
				for (idx = 0; idx < elligbleOrders.length; idx++) {
					if (elligbleOrders[idx].id == theObj.id) {
						// elligbleOrders[idx] = theObj;
						if (numeric.test(elligbleOrders[idx].id)) {
							elligbleOrders[idx].remove = true;
						} else {
							elligbleOrders.splice(idx, 1);
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
		rows = theTable[0].rows.length; //-- commented out, use the same row count from eligible orders to prevent deletion of shipping discount, if defined

		for ( var i = rows; i > 1; i--) {
			AdvPromo.PromotionCs.deleteTieredRow(sublistName, i);
		}

		// if operation == null, push to delKey array and empty the array content.
		if (AdvPromo.PromotionCs.tiers[objId].op == 'A') {
			AdvPromo.PromotionCs.tiers.splice(objId, tiersize);
		} else {
			delKeys = AdvPromo.PromotionCs.getTieredKeys(AdvPromo.PromotionCs.tiers);
			AdvPromo.PromotionCs.tiers.splice(objId, tiersize);
		}

		// delete eligible order dropdown selection
		nlapiRemoveSelectOption('custpage_advpromo_addorder');
		nlapiInsertSelectOption('custpage_advpromo_addorder', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '1', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_ORDER_TOTAL, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '2', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_SELECT_ITEMS, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '3', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_SELECT_ITEM_SS, false);
		nlapiInsertSelectOption('custpage_advpromo_addorder', '4', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NEW_ITEM_SS, false);

		// delete discount dropdown selection
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '1');
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '2');
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '3');
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
		var className;
		var i;
		var j;

		// Table Name is sublist name with suffix "_splits"
		var theTable = $('#' + tableId + "_splits");
		theTable.children().children(':nth-child(' + (row + 2) + ')').remove(); // orig code
		var rows = theTable[0].rows.length;

		var columnClass = function(pClassName) {
			var className = pClassName;
			this.changeClass = function(i, elem) {
				$(elem).attr('class', className);
			};
		};
		var colInst = null;

		for (i = 1; i < rows; i++) {
			if (i % 2)
				className = 'listtexthl';
			else
				className = 'listtext';
			theTable.children().children(':nth-child(' + (i + 1) + ')').attr('id', (tableId + 'row' + (i - 1)));
			colInst = new columnClass(className);
			theTable.children().children(':nth-child(' + (i + 1) + ')').children().each(colInst.changeClass);
			delete colInst;
		}
	};

	this.makeLink = function(operationType, row, idd, recordType, theType, objArr) {

		var LinkHandler = function(reference, pFuncName, pIdd, pRecType, pTheType, pTheObj) {

			var ref = reference;
			var funcName = pFuncName;
			var recType = pRecType;
			var grpId = pIdd;
			var theType = pTheType;
			var theObj = pTheObj;

			this.action = function() {
				var rowId = reference.parent().parent()[0].rowIndex - 1;
				if (funcName)
					funcName(rowId, grpId, recType, theType, theObj);
			};
		};

		var anch = $('<a>');
		var anchText = null;
		var action = null;

		switch (operationType) {
		case 'E':
			action = AdvPromo.PromotionCs.modifyRow;
			anchText = TRANS_CS_ItemSpecificEntryForm.EDIT;
			break;
		case 'D':
			action = AdvPromo.PromotionCs.removeRow;
			anchText = TRANS_CS_ItemSpecificEntryForm.REMOVE;
			break;
		case 'P': // no preview for recordType 1
			action = AdvPromo.PromotionCs.previewRow;
			anchText = TRANS_CS_ItemSpecificEntryForm.PREVIEW;
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

	this.previewRow = function(rowNumber, idd) {
		nlExtOpenWindow(baseUrl + "/app/common/search/searchresults.nl?searchid=" + idd, 'thepopup', 700, 550, 0, 0, "Search Results", null);
	};

	//pass theType as parameter
	this.modifyRow = function(rowNumber, idd, recordType, theType, theObj) {
		AdvPromo.PromotionCs.editRow(theType, rowNumber, idd, recordType, theObj);
	};

	this.editRow = function(tableId, row, idd, recordType, theObj) {
		AdvPromo.PromotionCs.globalParam['tier_dtype'] = 1;	// item specific promotion discount type tier promotion
		// Table Name is sublist name with suffix "_splits"
		var theTable = $('#' + tableId + "_splits");

		firstCol = theTable.children().children(':nth-child(' + (row + 2) + ')').children(':nth-child(1)').text();
		secondCol = theTable.children().children(':nth-child(' + (row + 2) + ')').children(':nth-child(2)').text();

		// will display different links depending on whether type is customer saved search or customer id
		switch (parseInt(recordType)) {
		case 1: //saved search		
			
			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_edit_customer_ss', 'customdeploy_advpromo_edit_customer_ss') + "&idd=" + idd + "&recName=" + encodeURIComponent(firstCol) + "&recDesc=" + encodeURIComponent(secondCol) + "&rowNum=" + row + "&savesearchId=" + encodeURIComponent(AdvPromo.PromotionCs.arr[idd].savesearchId);
			var z = nlExtOpenWindow(editLink, 'thepopup', 650, 200, 0, 0, TRANS_CS_ItemSpecificEntryForm.POPUP_TITLE_EDIT_SELECT_CUSTOMER_SAVED_SEARCH, null); //width, height
			break;

		case 2: // customer id		
			var customerGroup = new Array();
			customerGroup = AdvPromo.PromotionCs.arr[idd].savesearchId;

			var size = customerGroup.length;
			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_edit_customerid_ss', 'customdeploy_advpromo_edit_customerid_ss') + "&customerGroup=" + encodeURIComponent(customerGroup) + "&groupId=" + encodeURIComponent(idd) + "&rowNum=" + row + "&size=" + size;
			var z = nlExtOpenWindow(editLink, 'thepopup', 400, 200, 0, 0, TRANS_CS_ItemSpecificEntryForm.POPUP_TITLE_EDIT_SELECT_CUSTOMERS, null);

			break;

		case 21: // item
			var promoId = nlapiGetRecordId(); // empty if new mode
			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_dis_edititem_ss', 'customdeploy_advpromo_is_dis_edititem_ss') + "&itemObj=" + encodeURIComponent(JSON.stringify(theObj)) + "&rowNum=" + row + '&promoId=' + promoId;
			var z = nlExtOpenWindow(editLink, 'thepopup', 550, 300, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_ITEM, null);
			break;

		case 22: // item saved search
			var promoId = nlapiGetRecordId(); // empty if new mode
			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_dis_ediitmss_ss', 'customdeploy_advpromo_is_dis_ediitmss_ss') + "&itemObj=" + encodeURIComponent(JSON.stringify(theObj)) + "&rowNum=" + row + '&promoId=' + promoId;
			var z = nlExtOpenWindow(editLink, 'thepopup', 550, 300, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_SEARCH_ITEM, null);

			break;

		case 23: // shipping 
			var shipObjArr = theObj[0];
			var shipMethodNames = theObj[1];
			var shipMethodIds = theObj[2];

			AdvPromo.PromotionCs.globalParam['23_selShipMethodIds'] = shipMethodIds;
			AdvPromo.PromotionCs.globalParam['23_selAmountCurr'] = shipObjArr;
			AdvPromo.PromotionCs.globalParam['23_row'] = row;

			var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_dis_editship_ss', 'customdeploy_advpromo_is_dis_editship_ss') + "&mIds=" + encodeURIComponent(shipMethodIds) + "&rowNum=" + row;
			var z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_SHIPPING, null);

			break;
			
		case 24: // isfshipping
			if(AdvPromo.PromotionCs.isfShippingObj.searchId == null){
				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss') + "&mIds=" + encodeURIComponent(AdvPromo.PromotionCs.isfShippingObj.shipIds) +"&itemIds=" + encodeURIComponent(AdvPromo.PromotionCs.isfShippingObj.itemIds) + "&rowNum=" + row;
				nlExtOpenWindow(editLink, 'thepopup', 650, 500, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_ISFSHIPPING, null);	
			}
			else{
				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss') + "&mIds=" + encodeURIComponent(AdvPromo.PromotionCs.isfShippingObj.shipIds) +"&savedSearchId=" + encodeURIComponent(AdvPromo.PromotionCs.isfShippingObj.searchId) + "&rowNum=" + row;
				nlExtOpenWindow(editLink, 'thepopup', 400, 520, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_SS_ISFSHIPPING, null);			
			}
			break;
		
		// case 3x reserved for tiered promotion eligible order
		case 31: // Tiered promotion Eligible Order -> edit order total
			if (confirm(TRANS_CS_ItemSpecificEntryForm.CONFIRM_ELIGIBILITY_EDIT)) {
				AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
				AdvPromo.PromotionCs.globalParam['31_tiersize'] = AdvPromo.PromotionCs.itemSpecProperties.tiers;

				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_trd_ord_edi_all', 'customdeploy_advpromo_is_trd_ord_edi_all');
				var z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_ORDER_TOTAL, null);
			}
			break;

		case 32: // Tiered promotion Eligible Order -> edit item
			if (confirm(TRANS_CS_ItemSpecificEntryForm.CONFIRM_ELIGIBILITY_EDIT)) {
				AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
				AdvPromo.PromotionCs.globalParam['31_tiersize'] = AdvPromo.PromotionCs.itemSpecProperties.tiers;
				AdvPromo.PromotionCs.globalParam['32_itemSelect'] = AdvPromo.PromotionCs.tiers[0].eiid;

				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_trd_ord_editem', 'customdeploy_advpromo_is_trd_ord_editem');
				var z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_ITEM, null);
			}
			break;

		case 33: // Tiered promotion Eligible Order -> select item search
			if (confirm(TRANS_CS_ItemSpecificEntryForm.CONFIRM_ELIGIBILITY_EDIT)) {
				AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
				AdvPromo.PromotionCs.globalParam['31_tiersize'] = AdvPromo.PromotionCs.itemSpecProperties.tiers;

				var editLink = baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_is_trd_ord_edittms', 'customdeploy_advpromo_is_trd_ord_edittms') + "&selSearch=" + AdvPromo.PromotionCs.tiers[0].esid;
				var z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_SEARCH_ITEM, null);
			}
			break;

		case 41: // Tiered promotion Discount	 -> edit item
			AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
			var promoId = nlapiGetRecordId(); // empty if new mode
			var editLink = baseUrl + nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[1].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[1].deployname)
				+ '&promoId=' + promoId;
			title = TRANS_CS_ItemSpecificEntryForm.EDIT_ITEM
			var z = nlExtOpenWindow(editLink, 'thepopup', 575, 400, 0, 0, title, null);

			break;

		case 42: // Tiered promotion Discount	 -> edit item search
			var promoId = nlapiGetRecordId(); // empty if new mode
			AdvPromo.PromotionCs.globalParam['31_tablerow'] = idd;
			var editLink = baseUrl + nlapiResolveURL('SUITELET', AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[2].scriptname, AdvPromo.PromotionCs.itemSpecProperties.addDiscountPopups[2].deployname) + "&selSearch=" + AdvPromo.PromotionCs.tiers[0].dsid
				+ '&promoId=' + promoId;
			title = TRANS_CS_ItemSpecificEntryForm.EDIT_SEARCH_ITEM
			var z = nlExtOpenWindow(editLink, 'thepopup', 575, 400, 0, 0, title, null);
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
			if (suffix == '_advpromo_is_order_edit_sear') {
				z = nlExtOpenWindow(editLink, 'thepopup', 600, 200, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_SEARCH_ITEM, null);
			} else if (suffix == '_advpromo_is_order_edit_item') {
				z = nlExtOpenWindow(editLink, 'thepopup', 400, 300, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_ITEM, null);
			} else if (suffix == '_advpromo_is_order_edit_all') {
				z = nlExtOpenWindow(editLink, 'thepopup', 400, 200, 0, 0, TRANS_CS_ItemSpecificEntryForm.EDIT_ORDER_TOTAL, null);
			}

		}
	};

	//move to AdvancedPromotion_CS_EdditCustomerxxxPopup.js
	//This function is called from the popup
	this.commitRow = function() {
		var desc = nlapiGetFieldValue('custpage_advpromo_description');
		var idd = nlapiGetFieldValue('custpage_advpromo_idd');
		var row = nlapiGetFieldValue('custpage_advpromo_rownum');
		var savesearchId = nlapiGetFieldValue('custpage_advpromo_editcustomer');
		var savesearchLabel = nlapiGetFieldText('custpage_advpromo_editcustomer');

		sidKey = 'customersid';

		if (!window.parent.AdvPromo.PromotionCs.globalParam[sidKey].hasOwnProperty(savesearchId)) {
			window.parent.AdvPromo.PromotionCs.globalParam[sidKey][savesearchId] = savesearchId;
			delete window.parent.AdvPromo.PromotionCs.globalParam[sidKey][window.parent.AdvPromo.PromotionCs.AdvPromo.PromotionCs.arr[idd].savesearchId];
			window.parent.AdvPromo.PromotionCs.parentMethod(idd, row, desc, savesearchId, savesearchLabel);
			var theWindow = window.parent.Ext.WindowMgr.getActive();
			theWindow.close();
		} else {
			if (savesearchId == window.parent.AdvPromo.PromotionCs.AdvPromo.PromotionCs.arr[idd].savesearchId) {
				window.parent.AdvPromo.PromotionCs.parentMethod(idd, row, desc, savesearchId, savesearchLabel);
				var theWindow = window.parent.Ext.WindowMgr.getActive();
				theWindow.close();
			} else {
				alert('Customer Saved Search already exists in the sublist');
			}
		}
	};

	this.cancelEligibilityCustomer = function() {
		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	};

	this.editCustomerId = function() {
		//get selected values of the user
		var customerIds = nlapiGetFieldValues('custpage_advpromo_edit_customer_multiselect');
		var customerNames = nlapiGetFieldTexts('custpage_advpromo_edit_customer_multiselect');
		var row = nlapiGetFieldValue('custpage_advpromo_rownumgroup');
		var groupId = nlapiGetFieldValue('custpage_advpromo_group_id');

		if (customerIds.length != 0) {
			var groupObj = {};
			groupObj.row = row;
			groupObj.groupId = groupId;
			groupObj.customerIds = customerIds;
			groupObj.customerNames = customerNames;

			window.parent.AdvPromo.PromotionCs.syncEditToListObject(2, groupObj); // type 2 = customer Id		
			var theWindow = window.parent.Ext.WindowMgr.getActive();
			theWindow.close();
		} else {
			alert(TRANS_CS_ItemSpecificEntryForm.ERROR_SELECT_CUSTOMER);
		}
	};

	this.syncEditToListObject = function(recordType, obj, textArr) {
		// textArr contains the data to be synchronized to the sublist , used for record type 21, 22, 23

		var row = parseInt(obj.row);

		switch (recordType) {
		// case 1 and 2 -> Eligibility customer
		case 2:
			var theType = 'custpage_advpromo_eligible_customer_list';

			var selectedCustomers = "";
			var groupId = obj.groupId;

			for ( var elem in obj.customerNames) {
				if (selectedCustomers == "") {
					selectedCustomers = obj.customerNames[elem];
				} else {
					selectedCustomers = selectedCustomers + " or " + obj.customerNames[elem];
				}
			}

			//mark current values for deletion and add a new record in arr
			AdvPromo.PromotionCs.arr[groupId].operation = 'D';

			var noOfRecords = AdvPromo.PromotionCs.objectKeys(AdvPromo.PromotionCs.arr).length;
			var newObjectId = noOfRecords + 1 + '_newid';
			AdvPromo.PromotionCs.arr[newObjectId] = {};
			AdvPromo.PromotionCs.arr[newObjectId].promocode = nlapiGetFieldValue('code');
			AdvPromo.PromotionCs.arr[newObjectId].type = 2; // Add customer id is type 2	
			AdvPromo.PromotionCs.arr[newObjectId].operation = 'A';
			AdvPromo.PromotionCs.arr[newObjectId].savesearchId = obj.customerIds;
			// var savesearchId = obj.customerIds;

			var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (row), newObjectId, recordType, theType);
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (row), newObjectId, recordType);
			// var previewAnch = (savesearchId) ? 	AdvPromo.PromotionCs.makeLink('P', (row), savesearchId , 1, 'custpage_advpromo_eligible_customer', null) : '';
			// $("#custpage_advpromo_eligible_customer_listcol" + row + "2").children().remove();
			// $("#custpage_advpromo_eligible_customer_listcol" + row + "2").append($(previewAnch));

			$("#custpage_advpromo_eligible_customer_listcol" + row + "3").children().remove();
			$("#custpage_advpromo_eligible_customer_listcol" + row + "4").children().remove();
			$("#custpage_advpromo_eligible_customer_listcol" + row + "3").append(editAnch);
			$("#custpage_advpromo_eligible_customer_listcol" + row + "4").append(deleteAnch);

			$("#custpage_advpromo_eligible_customer_listcol" + row + "0").text(selectedCustomers);
			$("#custpage_advpromo_eligible_customer_listcol" + row + "1").text(selectedCustomers);

			break;

		case 1:

			break;

		case 21: //discount tab item

			var theTable = $('#' + 'custpage_advpromo_discount_list' + '_splits');
			var rows = theTable[0].rows.length - 1;

			var nameOr = textArr[0];
			var promoOr = textArr[1];
			var limitOr = textArr[2];
			var rowNum = parseInt(textArr[3]);

			// delete everything with _newid key, flag everything with real key then append the new elements in obj
			for ( var i in discItemObj) {
				if (discItemObj[i].oper == 'A') {
					delete discItemObj[i];
				} else {
					discItemObj[i].oper = 'D';
				}
			}

			AdvPromo.PromotionCs.packItemToObject(obj, 2, 'A');

			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '21', 'custpage_advpromo_discount_list', obj); // new link to edit

			$("#custpage_advpromo_discount_listcol" + rowNum + "0").text(nameOr);
			$("#custpage_advpromo_discount_listcol" + rowNum + "1").text(promoOr);
			$("#custpage_advpromo_discount_listcol" + rowNum + "2").text(limitOr);

			// remove the link to Edit and create a new one with associated record
			$("#custpage_advpromo_discount_listcol" + rowNum + "4").children().remove();
			$("#custpage_advpromo_discount_listcol" + rowNum + "4").append(editAnch);

			break;

		case 22: //discount tab item saved search
			var theTable = $('#' + 'custpage_advpromo_discount_list' + '_splits');
			var rows = theTable[0].rows.length - 1;

			var nameOr = textArr[0];
			var promoOr = textArr[1];
			var limitOr = textArr[2];
			var rowNum = parseInt(textArr[3]);

			// delete everything with _newid key, flag everything with real key then append the new elements in obj
			for ( var i in discItemObj) {
				if (discItemObj[i].oper == 'A') {
					delete discItemObj[i];
				} else {
					discItemObj[i].oper = 'D';
				}
			}

			AdvPromo.PromotionCs.packItemToObject(obj, 1, 'A');

			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '22', 'custpage_advpromo_discount_list', obj); // new link to edit

			$("#custpage_advpromo_discount_listcol" + rowNum + "0").text(nameOr);
			$("#custpage_advpromo_discount_listcol" + rowNum + "1").text(promoOr);
			$("#custpage_advpromo_discount_listcol" + rowNum + "2").text(limitOr);

			// remove the link to Edit and create a new one with associated record
			$("#custpage_advpromo_discount_listcol" + rowNum + "4").children().remove();
			$("#custpage_advpromo_discount_listcol" + rowNum + "4").append(editAnch);

			break;

		case 23: //discount tab shipping
			var theTable = $('#' + 'custpage_advpromo_discount_list' + '_splits');
			var rows = theTable[0].rows.length - 1;

			var promoOr = textArr[0];
			var shipMethodIds = textArr[1];

			if (discShippingObj.hasOwnProperty('savShipIds')) {
				discShippingObj['delShipIds'] = discShippingObj['savShipIds'];
				delete discShippingObj['savShipIds'];

				for ( var index in discShippingObj) {
					if (discShippingObj[index].oper == 'A') {
						delete discShippingObj[index];
					} else {
						discShippingObj[index].oper = 'D';
					}
				}
			}

			AdvPromo.PromotionCs.packShippingToObject(obj, shipMethodIds);
			var editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '23', 'custpage_advpromo_discount_list', [ obj, [], shipMethodIds ]); // new link to edit
			var rowNum = AdvPromo.PromotionCs.globalParam['23_row'];

			$("#custpage_advpromo_discount_listcol" + rowNum + "0").text("Shipping Discount");
			$("#custpage_advpromo_discount_listcol" + rowNum + "1").text(promoOr);
			$("#custpage_advpromo_discount_listcol" + rowNum + "2").text(TRANS_CS_ItemSpecificEntryForm.TEXT_NOLIMIT);

			// remove the link to Edit and create a new one with associated record
			$("#custpage_advpromo_discount_listcol" + rowNum + "4").children().remove();
			$("#custpage_advpromo_discount_listcol" + rowNum + "4").append(editAnch);
			
			// for tiered promotion  
			AdvPromo.PromotionCs.globalParam['tShipMethod'].name = TRANS_CS_ItemSpecificEntryForm.SHIPPING_DISC;
			AdvPromo.PromotionCs.globalParam['tShipMethod'].promoOr = promoOr;
			AdvPromo.PromotionCs.globalParam['tShipMethod'].editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '23', 'custpage_advpromo_discount_list', [obj, [], shipMethodIds]);	// new link to edit

			break;

		}
		AdvPromo.PromotionCs.flagChanged();
	};

	this.parentMethod = function(idd, row, desc, savesearchId, savesearchLabel) {
		row = parseInt(row);

		$("#custpage_advpromo_eligible_customer_listcol" + row + "0").text(savesearchLabel);
		$("#custpage_advpromo_eligible_customer_listcol" + row + "1").text(desc);

		var previewAnch = (savesearchId) ? AdvPromo.PromotionCs.makeLink('P', (row), savesearchId, 1, 'custpage_advpromo_eligible_customer', null) : '';
		$("#custpage_advpromo_eligible_customer_listcol" + row + "2").children().remove();
		$("#custpage_advpromo_eligible_customer_listcol" + row + "2").append($(previewAnch));

		// edit the array of object as well
		AdvPromo.PromotionCs.arr[idd].description = desc; //description
		AdvPromo.PromotionCs.arr[idd].savesearchId = savesearchId;
		AdvPromo.PromotionCs.arr[idd].savesearchName = savesearchLabel;
		AdvPromo.PromotionCs.arr[idd].operation = 'E'; // mark for edit
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

	this.editRowOrderTab = function(values) {
		var sublistName = 'custpage_advpromo_eligible_order_list';
		var theTable = $('#' + sublistName + '_splits');
		var orderType = 3; // 3 is type for order on the delete, edit, and preview link

		var copier = function(orig) {
			// this line can actually deep copy objects. no functions though.
			var copy = JSON.parse(JSON.stringify(orig));
			return copy;
		};

		var objCopy = copier(values);

		var row = objCopy.rowRef;
		delete objCopy.rowRef;

		var previewAnch = (objCopy.savedSearch) ? AdvPromo.PromotionCs.makeLink('P', (row), objCopy.savedSearch, orderType, sublistName, objCopy) : '';
		var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (row), objCopy.id, orderType, sublistName, objCopy);
		var editAnch = AdvPromo.PromotionCs.makeLink('E', (row), objCopy.id, orderType, null, objCopy);

		$("#custpage_advpromo_eligible_order_listcol" + row + "0").text(objCopy.label);
		$("#custpage_advpromo_eligible_order_listcol" + row + "1").text(objCopy.description);
		$("#custpage_advpromo_eligible_order_listcol" + row + "2").children().remove();
		$("#custpage_advpromo_eligible_order_listcol" + row + "2").append($(previewAnch));
		$("#custpage_advpromo_eligible_order_listcol" + row + "3").children().remove();
		$("#custpage_advpromo_eligible_order_listcol" + row + "3").append($(editAnch));
		$("#custpage_advpromo_eligible_order_listcol" + row + "4").children().remove();
		$("#custpage_advpromo_eligible_order_listcol" + row + "4").append($(deleteAnch));

		if (!elligbleOrders) {
			elligbleOrders = [];
			elligbleOrders.push(objCopy);
		} else {
			var found = false;
			for ( var i = 0; elligbleOrders.length; i++) {
				if (elligbleOrders[i].id == objCopy.id) {
					elligbleOrders[i] = objCopy;
					found = true;
					break;
				}
			}
			if (!found)
				elligbleOrders.push(objCopy);
		}
		AdvPromo.PromotionCs.flagChanged();
	};

	this.isFeatureEnabled = function(featureId) {
		var ret = false;

		if (featureId != null) {
			var objContext = nlapiGetContext();
			if (objContext.getSetting("FEATURE", featureId) == 'T') {
				ret = true;
			}
		}

		return ret;
	};

	this.flagChanged = function() {
		var theValue = nlapiGetFieldValue('code');
		nlapiSetFieldValue('code', theValue);
	};

	var PopScriptId = function(script, deploy) {
		this.scriptname = script;
		this.deployname = deploy;
	};

	var ItemSpecPropertiesClass = function() {
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

	var TieredItemSpecPropertiesClass = function() {
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
		this.addDiscountPopups.push(new PopScriptId('customscript_advpromo_os_dis_neworder_ss', 'customdeploy_advpromo_os_dis_neworder_ss'));

	};
	TieredItemSpecPropertiesClass.prototype = ItemSpecPropertiesClass.prototype;

	this.normalItemSpecProperties = new ItemSpecPropertiesClass();
	this.tieredItemSpecProperties = new TieredItemSpecPropertiesClass();
	this.itemSpecProperties = this.normalItemSpecProperties;

	this.tierModeOn = function() {
		$('#custpage_advpromo_applyto_order_fs_lbl').hide();
		$('#custpage_advpromo_applyto_order_fs').hide();
		AdvPromo.PromotionCs.itemSpecProperties = AdvPromo.PromotionCs.tieredItemSpecProperties;
		
		nlapiRemoveSelectOption('custpage_advpromo_discount_item');
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
	};

	this.tierModeOff = function() {
		$('#custpage_advpromo_applyto_order_fs_lbl').show();
		$('#custpage_advpromo_applyto_order_fs').show();
		AdvPromo.PromotionCs.itemSpecProperties = AdvPromo.PromotionCs.normalItemSpecProperties;
		
		nlapiRemoveSelectOption('custpage_advpromo_discount_item');
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '1', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_SELECT_ITEMS, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '2', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_SELECT_ITEM_SS, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '3', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NEW_ITEM_SS, false);
	};

	this.getTierDetailsFormat = function(tierLineObj, currencyMap) {
		var minPur = "-none-";
		var promoOffer = "-none-";
		var limit = TRANS_CS_ItemSpecificEntryForm.TEXT_NOLIMIT;
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
					limit = discLines[0].limit + " units ";
				}
			} else {
				for ( var i = 0; i < discLines.length; i++) {
					if (limit == TRANS_CS_ItemSpecificEntryForm.TEXT_NOLIMIT) {
						if(discLines[i].limit == '') continue; // if current currency limit is empty (''), ignore and continue to next currency
						limit = discLines[i].limit + " " + currencyMap[discLines[i].lcur];
					} else {
						if(discLines[i].limit == '') continue; // if current currency limit is empty (''), ignore and continue to next currency
						limit = limit + " or " + discLines[i].limit + " " + currencyMap[discLines[i].lcur];
					}
				}
			}
		}

		return [ minPur, promoOffer, limit ];
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
			this.dhigh = ''; // discount on highest

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
							tierRec.dhigh = disc[0].discHighest;

							tierJsonObjs.push(tierRec);

						} else {
							for ( var k = 0; k < disc.length; k++) {
								tierRec.offer = disc[k].offer;
								tierRec.ocur = disc[k].ocur;
								tierRec.limit = disc[k].limit;
								tierRec.lcur = disc[k].lcur;
								tierRec.dhigh = disc[k].discHighest;
								
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

						tierRec.offer = disc[ref].offer;
						tierRec.ocur = disc[ref].ocur;
						tierRec.limit = disc[ref].limit;
						tierRec.lcur = disc[ref].lcur;
						tierRec.dhigh = disc[ref].discHighest;

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

	this.addTieredRowOrderTab = function(tierObj, rowId, renderLink, objId, currencyMap) {
		var rowLine = parseInt(rowId) + 1;
		var sublistName = 'custpage_advpromo_eligible_order_list';
		var theTable = $('#' + sublistName + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		//var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();

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

	this.addTieredDiscountTab = function(tierObj, rowId, renderLink, objId, renderEdit, currencyMap) {
		var rowLine = parseInt(rowId) + 1;
		var sublistName = 'custpage_advpromo_discount_list';
		var theTable = $('#' + sublistName + '_splits');

		var rows = theTable[0].rows.length - 1;

		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}

		//var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();

		var formatText = AdvPromo.PromotionCs.getTierDetailsFormat(tierObj, currencyMap);
		var purchaseOr = formatText[0]; // format minimum purchase
		var promoOr = formatText[1]; // format promotional offer
		var limitOr = formatText[2]; // format limit
		var editAnch = "";
		var previewAnch = "";	//A 231273

		var name = 'Tier ' + rowLine;

		// add 'Apply Discount to Highest Valued Item' to Promotional Offer text if applicable
		if(tierObj && tierObj.disc && tierObj.disc.length > 0){
			var discountOnHighest = tierObj.disc[0].discHighest;
			if(discountOnHighest == 'T'){
				promoOr = TRANS_CS_ItemSpecificEntryForm.LABEL_DISCOUNT_ON_HIGHEST + ' / ' + promoOr;
			}	
		}
		
		// case item search or item
		if (tierObj.disatype == 1) { // item search
			if (renderLink && renderEdit) {
				editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), objId, 42, sublistName);
				previewAnch = AdvPromo.PromotionCs.makeLink('P', (rows), parseInt(tierObj.dsid), null, sublistName);	//A 231273
				AdvPromo.PromotionCs.addRow(sublistName, [ name, promoOr, limitOr, previewAnch, editAnch, "" ]);
			} else {
				AdvPromo.PromotionCs.addRow(sublistName, [ name, promoOr, limitOr, "", "", "" ]);
			}

		} else { // item
			if (renderLink && renderEdit) {
				editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), objId, 41, sublistName);
				AdvPromo.PromotionCs.addRow(sublistName, [ name, promoOr, limitOr, "", editAnch, "" ]);
			} else {
				AdvPromo.PromotionCs.addRow(sublistName, [ name, promoOr, limitOr, "", "", "" ]);
			}
		}
	};

	this.addOrderTotal = function(tiers, renderEdit, fromEditDiscount) {
		
		// clear the discount sublist first to prevent the shipping discount from displaying twice
		// this happens when adding order discounts when the list already contains a shipping discount
		AdvPromo.PromotionCs.clearDiscountSublist();
		
		var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();
		
		for ( var i = 0; i < tiers.length; i++) {
			var renderLink = false;
			if (i == 0)
				renderLink = true;
			AdvPromo.PromotionCs.addOrderToSublist(tiers[i], renderLink, i, renderEdit, currencyMap);
		}

		if(!fromEditDiscount){
			AdvPromo.PromotionCs.addTierDiscountShipping();
		}
	};

	this.clearDiscountSublist = function(){
		$('tr[id^=custpage_advpromo_discount_listrow]').detach();
	};

	this.editOrderTotal = function(newTiers) {
		var rowRef = parseInt(AdvPromo.PromotionCs.globalParam['31_tablerow']);
		var tsize = parseInt(AdvPromo.PromotionCs.globalParam['31_tiersize']);

		AdvPromo.PromotionCs.deleteTieredAllOrdersSublist(rowRef, tsize);
		AdvPromo.PromotionCs.addOrderTotal(newTiers);
		AdvPromo.PromotionCs.flagChanged();	// A 231288
	};

	this.addOrderItem = function(tiers, renderEdit, itemSelect, fromEditDiscount) {
		AdvPromo.PromotionCs.clearDiscountSublist();
		
		var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();

		for ( var i = 0; i < tiers.length; i++) {
			var renderLink = false;
			if (i == 0)
				renderLink = true;
			AdvPromo.PromotionCs.addOrderToSublist(tiers[i], renderLink, i, renderEdit, currencyMap);
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
		AdvPromo.PromotionCs.flagChanged();	// A 231288
	};

	this.addOrderItemSearch = function(tiers, renderEdit, itemSearchSelectText, fromEditDiscount) {
		AdvPromo.PromotionCs.clearDiscountSublist();
		
		var currencyMap = AdvPromo.PromotionCs.getCurrencyMap();
		for ( var i = 0; i < tiers.length; i++) {
			var renderLink = false;
			if (i == 0)
				renderLink = true;
			AdvPromo.PromotionCs.addOrderToSublist(tiers[i], renderLink, i, renderEdit, currencyMap);
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
		AdvPromo.PromotionCs.flagChanged();	// A 231288
	};

	this.addOrderToSublist = function(tierObj, renderLink, rowId, renderEdit, currencyMap) {
		AdvPromo.PromotionCs.tiers.push(tierObj);
		AdvPromo.PromotionCs.addTieredRowOrderTab(tierObj, rowId, renderLink, AdvPromo.PromotionCs.tiers.length - 1, currencyMap);
		AdvPromo.PromotionCs.addTieredDiscountTab(tierObj, rowId, renderLink, AdvPromo.PromotionCs.tiers.length - 1, renderEdit, currencyMap);

		nlapiRemoveSelectOption('custpage_advpromo_addorder', '1');
		nlapiRemoveSelectOption('custpage_advpromo_addorder', '2');
		nlapiRemoveSelectOption('custpage_advpromo_addorder', '3');
		nlapiRemoveSelectOption('custpage_advpromo_addorder', '4');

		// enable discount dropdown selections
		nlapiRemoveSelectOption('custpage_advpromo_discount_item');
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '0', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NONE, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '1', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_SELECT_ITEMS, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '2', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_SELECT_ITEM_SS, false);
		nlapiInsertSelectOption('custpage_advpromo_discount_item', '3', TRANS_CS_ItemSpecificEntryForm.TRANS_LABEL_NEW_ITEM_SS, false);

	};

	this.addTierDiscountShipping = function(){
		// check if tShipMethod key exists
	   if(AdvPromo.PromotionCs.globalParam.hasOwnProperty('tShipMethod')){
			theType = 'custpage_advpromo_discount_list';
				var theTable = $('#' + theType + '_splits');
			var rows = theTable[0].rows.length - 1;
			AdvPromo.PromotionCs.globalParam['tShipMethod'].deleteAnch = AdvPromo.PromotionCs.makeLink('D', (rows), null, '23', theType);
			AdvPromo.PromotionCs.globalParam['tShipMethod'].editAnch = AdvPromo.PromotionCs.makeLink('E', (rows), null, '23',theType, AdvPromo.PromotionCs.globalParam['tShipMethod'].objArr);

			AdvPromo.PromotionCs.addRow('custpage_advpromo_discount_list', [AdvPromo.PromotionCs.globalParam['tShipMethod'].name,AdvPromo.PromotionCs.globalParam['tShipMethod'].promoOr, " ", " ", AdvPromo.PromotionCs.globalParam['tShipMethod'].editAnch, AdvPromo.PromotionCs.globalParam['tShipMethod'].deleteAnch]);
	   }
	   
	   showFreeShippingRuleInSublist(TRANS_CS_ItemSpecificEntryForm);
	};

	this.addTierDiscountItem = function(discLines, itemSelect, itemAddType) {

		// case with eligibility, empty discount
		var renderEdit = true;
		var eligLines = [];
		var newTier = [];
		var itemOr = "";
		var discItemOr = "";

		for ( var i = 0; i < AdvPromo.PromotionCs.tiers.length; i++) { // link discLines to AdvPromo.PromotionCs.tiers
			AdvPromo.PromotionCs.tiers[i].disatype = itemAddType;
			if (itemAddType == 1) {
				AdvPromo.PromotionCs.tiers[i].dsid = itemSelect[0];
			} else { // itemAddType = 2, items
				AdvPromo.PromotionCs.tiers[i].diid = itemSelect.toString();
			}

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

		// finally, render item on the sublist
		if (itemAddType == 1) {
			discItemOr = "Item Search: " + itemSelect[1];
		} else if (itemAddType == 2) {
			discItemOr = AdvPromo.PromotionCs.truncateTextField("Item: " + AdvPromo.PromotionCs.getItemDescriptionFormat(itemSelect.toString()));
		}

		if (itemOr != "") {
			AdvPromo.PromotionCs.addRow('custpage_advpromo_eligible_order_list', [ AdvPromo.PromotionCs.truncateTextField("Item: " + itemOr), " ", " ", " ", " " ]);
		}
		AdvPromo.PromotionCs.addRow('custpage_advpromo_discount_list', [ discItemOr, " ", " ", " ", " ", " " ]);
		AdvPromo.PromotionCs.addTierDiscountShipping();

		// delete discount dropdown selection
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '1');
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '2');
		nlapiRemoveSelectOption('custpage_advpromo_discount_item', '3');
		AdvPromo.PromotionCs.flagChanged();
	};

	this.truncateTextField = function(pText, pLength) {
		if (!pText) return null;
		var length = (isNaN(pLength)) ? 300 : pLength;
		if (pText.length < length) return pText;
		return (pText.substring(0, (length > 3) ? (length - 3) : length) + '...');
	};	
};