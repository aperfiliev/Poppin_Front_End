
var TRANS_UI_Library = {};

TRANS_UI_Library.LABEL_SHIPPING_DISCOUNT = 'Shipping Discount';
TRANS_UI_Library.LABEL_ORDER_DISCOUNT = 'Order Discount';


// CONSTANTS 
var CONST_ORDER_SPECIFIC_ENTRY_FORM_NAME = 'Order Specific Promotion Form';
var CONST_ITEM_SPECIFIC_ENTRY_FORM_NAME = 'Item Specific Promotion Form';
var CONST_BUYX_GETY_ENTRY_FORM_NAME = 'Buy X Get Y Promotion Form';	//A 20120326
var CONST_ORDER_SPECIFIC_ENTRY_IMPL_NAME = 'CUSTOMSCRIPT_ADVPROMO_ORDER_SPECIFIC';
var CONST_ITEM_SPECIFIC_ENTRY_IMPL_NAME = 'CUSTOMSCRIPT_ADVPROMO_ITEM_SPECIFIC';
var CONST_BUYX_GETY_ENTRY_IMPL_NAME = 'CUSTOMSCRIPT_ADVPROMO_BUYX_GETY';	//rwong

var CONST_DISCOUNT_TAB_ADD_ITEM = '1';
var CONST_DISCOUNT_TAB_ADD_ITEM_SEARCH = '2';
var CONST_DISCOUNT_TAB_NEW_SAVED_SEARCH = '3';
var CONST_DISCOUNT_TAB_NEW_ORDER_DISCOUNT = '4';

var CONST_DISCOUNT_TAB_ADD_SHIPPING = '1';
var CONST_DISCOUNT_TAB_NEW_SHIPPING_DISCOUNT = '2';

var CONST_DISCOUNT_TYPE_ITEM = '1';
var CONST_DISCOUNT_TYPE_ORDER = '2';
var CONST_DISCOUNT_TYPE_SHIPPING = '3';
var CONST_DISCOUNT_TYPE_FIXED_PRICE = '4';
var CONST_DISCOUNT_TYPE_ITEM_SPEC_FREE_SHIPPING = '5';

var CONST_FREE_SHIPPING_TYPE_ITEM = '1';
var CONST_FREE_SHIPPING_TYPE_ITEM_SEARCH = '2';

var ss_currencyList = new Array();

function populateCustomRecords(promoId){

	// Save Order Discount
	var itemStr = nlapiGetFieldValue('custpage_advpromo_discount_json_item'); //declared this in beforeLoad
	var shippingStr = nlapiGetFieldValue('custpage_advpromo_discount_json_shipmethod');

	saveOrderDiscount(promoId, itemStr);
	saveShippingDiscount(promoId, shippingStr);
}

function editCustomRecords(promoId){

	var itemStr = nlapiGetFieldValue('custpage_advpromo_discount_json_item'); //declared this in beforeLoad
	var shippingStr = nlapiGetFieldValue('custpage_advpromo_discount_json_shipmethod');

	deleteOrderDiscount(promoId);

	if(itemStr != ''){
		saveOrderDiscount(promoId, itemStr);	
	}	

	if(shippingStr != ''){
		saveShippingDiscount(promoId, shippingStr);
	}
}

function saveOrderDiscount(promoId, jsonStr){

	if(jsonStr != null && jsonStr != '' && jsonStr != '[]'){
		// Create Promotion Discount
		var discRec = nlapiCreateRecord('customrecord_advpromo_discount');
		discRec.setFieldValue('custrecord_advpromo_discount_promo_code', promoId);
		discRec.setFieldValue('custrecord_advpromo_discount_type', 2);
		discRec.setFieldValue('custrecord_advpromo_discount_label', TRANS_UI_Library.LABEL_ORDER_DISCOUNT);
		discRec.setFieldValue('custrecord_advpromo_discount_description', TRANS_UI_Library.LABEL_ORDER_DISCOUNT);

		var promoDiscountId = nlapiSubmitRecord(discRec, true);

		// Create Promotional Offer
		var arrObjs = JSON.parse(jsonStr); 

		for(var i = 0; i < arrObjs.length; i++){
			var model = arrObjs[i];
			model.limit = model.limit == 0 ? '' : model.limit;

			var promoOfferRec = nlapiCreateRecord('customrecord_advpromo_promotional_offer');
			promoOfferRec.setFieldValue('custrecord_advpromo_poffer_discount', promoDiscountId);
			promoOfferRec.setFieldValue('custrecord_advpromo_poffer_amount', model.amount);
			promoOfferRec.setFieldValue('custrecord_advpromo_poffer_is_percent', model.isPercent);
			promoOfferRec.setFieldValue('custrecord_advpromo_poffer_limit', model.limit);
			promoOfferRec.setFieldValue('custrecord_advpromo_poffer_is_unit', model.isUnit);
			promoOfferRec.setFieldValue('custrecord_advpromo_poffer_currency', model.currId);

			nlapiSubmitRecord(promoOfferRec, true);
		}	
	}
}

function deleteItemDiscount(promoId){

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', ' start promoId='+promoId);

	var filters = new Array();
	var columns = new Array();

	var promoDiscounts = null;
	var promoOffers = null;
	var promoShippingPrices = null;
	var promoShippingMethods = null;
	var eligibleCustomers = null;
	var eligibleOrders = null;
	var minimumPurchases = null;
	var tierData = null;

	var discountIds = new Array();	
	var eligibleOrderIds = new Array();

	if(promoId!=null && promoId!='' && promoId!=undefined){
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', [promoId]);
		columns[0] = new nlobjSearchColumn('internalid');
		promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_customer_promo_code', null, 'anyof', promoId);
		columns[0] = new nlobjSearchColumn('internalid');
		eligibleCustomers = nlapiSearchRecord('customrecord_advpromo_eligible_customer', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_order_promo_code', null, 'anyof', promoId);
		columns[0] = new nlobjSearchColumn('internalid');
		eligibleOrders = nlapiSearchRecord('customrecord_advpromo_eligible_order', null, filters, columns);
		
		filters = new Array();	// tier db
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_tier_promo_code', null, 'anyof', [promoId]);
		columns[0] = new nlobjSearchColumn('internalid');
		tierData = nlapiSearchRecord('customrecord_advpromo_tier', null, filters, columns);
	}

	
	if(tierData != null){	// delete tier records
		  for(var i=0; i<tierData.length; i++){
		    nlapiDeleteRecord('customrecord_advpromo_tier', tierData[i].getValue('internalid'));
		  }
	}
	

	if(promoDiscounts!=null){
		for(var i = 0; i < promoDiscounts.length; i++){
			discountIds.push(promoDiscounts[i].getValue('internalid'));
		}
	}

	if(eligibleOrders != null){
		for(var d = 0; d < eligibleOrders.length; d++){
			eligibleOrderIds.push(eligibleOrders[d].getValue('internalid'));
		}
	}

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', ' eligibleOrderIds='+eligibleOrderIds);

	if(eligibleOrderIds!=null && eligibleOrderIds!='' && eligibleOrderIds!=undefined)
	{
		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eligibleOrderIds);
		columns[0] = new nlobjSearchColumn('internalid');
		minimumPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
	}

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', ' discountIds='+discountIds);

	if(discountIds!=null && discountIds!='' && discountIds!=undefined){
		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_poffer_discount', null, 'anyof', discountIds);
		columns[0] = new nlobjSearchColumn('internalid');
		promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_sprice_discount', null, 'anyof', discountIds);
		columns[0] = new nlobjSearchColumn('internalid');
		promoShippingPrices = nlapiSearchRecord('customrecord_advpromo_shipping_price', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_smethod_discount', null, 'anyof', discountIds);
		columns[0] = new nlobjSearchColumn('internalid');
		promoShippingMethods = nlapiSearchRecord('customrecord_advpromo_shipping_method', null, filters, columns);
	}

	// Delete Promotional Offer
	if(promoOffers != null){
		for(var i = 0; i < promoOffers.length; i++){
			nlapiDeleteRecord('customrecord_advpromo_promotional_offer', promoOffers[i].getValue('internalid'));
		}	
	}	

	//Delete Promotion Shipping Price
	if(promoShippingPrices != null){
		for(var b = 0; b < promoShippingPrices.length; b++){
			nlapiDeleteRecord('customrecord_advpromo_shipping_price', promoShippingPrices[b].getValue('internalid'));
		}	
	}	

	//Delete Promotion SHipping Method
	if(promoShippingMethods != null){
		for(var a = 0; a < promoShippingMethods.length; a++){
			nlapiDeleteRecord('customrecord_advpromo_shipping_method', promoShippingMethods[a].getValue('internalid'));
		}	
	}

	//Delete Eligible Customer
	if(eligibleCustomers != null){
		for(var q = 0; q < eligibleCustomers.length; q++){
			nlapiDeleteRecord('customrecord_advpromo_eligible_customer', eligibleCustomers[q].getValue('internalid'));
		}	
	}	

	//Delete Minimum Purchase
	if(minimumPurchases != null){
		for(var p = 0; p < minimumPurchases.length; p++){
			nlapiDeleteRecord('customrecord_advpromo_min_purchase', minimumPurchases[p].getValue('internalid'));
		}	
	}	
	//Delete Eligible Order
	if(eligibleOrders != null){
		for(var o = 0; o < eligibleOrderIds.length; o++){
			nlapiDeleteRecord('customrecord_advpromo_eligible_order', eligibleOrderIds[o]);
		}
	}

	// Delete Promotion Discount
	if(promoDiscounts != null){
		for(var i = 0; i < discountIds.length; i++){
			nlapiDeleteRecord('customrecord_advpromo_discount', discountIds[i]);
		}
	}

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', 'end');
}

function deleteOrderPromo(promoId){

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', ' start promoId='+promoId);

	var filters = new Array();
	var columns = new Array();

	var promoDiscounts = null;
	var promoOffers = null;
	var promoShippingPrices = null;
	var promoShippingMethods = null;
	var eligibleCustomers = null;
	var eligibleOrders = null;
	var minimumPurchases = null;
	var tierData = null;

	var discountIds = new Array();	
	var eligibleOrderIds = new Array();

	if(promoId!=null && promoId!='' && promoId!=undefined){
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', [promoId]);
		columns[0] = new nlobjSearchColumn('internalid');
		promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_customer_promo_code', null, 'anyof', promoId);
		columns[0] = new nlobjSearchColumn('internalid');
		eligibleCustomers = nlapiSearchRecord('customrecord_advpromo_eligible_customer', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_order_promo_code', null, 'anyof', promoId);
		columns[0] = new nlobjSearchColumn('internalid');
		eligibleOrders = nlapiSearchRecord('customrecord_advpromo_eligible_order', null, filters, columns);
		
		filters = new Array();	// tier db
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_tier_promo_code', null, 'anyof', [promoId]);
		columns[0] = new nlobjSearchColumn('internalid');
		tierData = nlapiSearchRecord('customrecord_advpromo_tier', null, filters, columns);

	}

	if(tierData != null){	// delete tier records
		  for(var i=0; i<tierData.length; i++){
		    nlapiDeleteRecord('customrecord_advpromo_tier', tierData[i].getValue('internalid'));
		  }
	}


	if(promoDiscounts!=null){
		for(var i = 0; i < promoDiscounts.length; i++){
			discountIds.push(promoDiscounts[i].getValue('internalid'));
		}
	}

	if(eligibleOrders != null){
		for(var d = 0; d < eligibleOrders.length; d++){
			eligibleOrderIds.push(eligibleOrders[d].getValue('internalid'));
		}
	}

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', ' eligibleOrderIds='+eligibleOrderIds);

	if(eligibleOrderIds!=null && eligibleOrderIds!='' && eligibleOrderIds!=undefined)
	{
		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eligibleOrderIds);
		columns[0] = new nlobjSearchColumn('internalid');
		minimumPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
	}

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', ' discountIds='+discountIds);

	if(discountIds!=null && discountIds!='' && discountIds!=undefined){
		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_poffer_discount', null, 'anyof', discountIds);
		columns[0] = new nlobjSearchColumn('internalid');
		promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_sprice_discount', null, 'anyof', discountIds);
		columns[0] = new nlobjSearchColumn('internalid');
		promoShippingPrices = nlapiSearchRecord('customrecord_advpromo_shipping_price', null, filters, columns);

		filters = new Array();
		columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_smethod_discount', null, 'anyof', discountIds);
		columns[0] = new nlobjSearchColumn('internalid');
		promoShippingMethods = nlapiSearchRecord('customrecord_advpromo_shipping_method', null, filters, columns);
	}

	// Delete Promotional Offer
	if(promoOffers != null){
		for(var i = 0; i < promoOffers.length; i++){
			nlapiDeleteRecord('customrecord_advpromo_promotional_offer', promoOffers[i].getValue('internalid'));
		}	
	}	

	//Delete Promotion Shipping Price
	if(promoShippingPrices != null){
		for(var b = 0; b < promoShippingPrices.length; b++){
			nlapiDeleteRecord('customrecord_advpromo_shipping_price', promoShippingPrices[b].getValue('internalid'));
		}	
	}	

	//Delete Promotion SHipping Method
	if(promoShippingMethods != null){
		for(var a = 0; a < promoShippingMethods.length; a++){
			nlapiDeleteRecord('customrecord_advpromo_shipping_method', promoShippingMethods[a].getValue('internalid'));
		}	
	}

	//Delete Eligible Customer
	if(eligibleCustomers != null){
		for(var q = 0; q < eligibleCustomers.length; q++){
			nlapiDeleteRecord('customrecord_advpromo_eligible_customer', eligibleCustomers[q].getValue('internalid'));
		}	
	}	

	//Delete Minimum Purchase
	if(minimumPurchases != null){
		for(var p = 0; p < minimumPurchases.length; p++){
			nlapiDeleteRecord('customrecord_advpromo_min_purchase', minimumPurchases[p].getValue('internalid'));
		}	
	}	
	//Delete Eligible Order
	if(eligibleOrders != null){
		for(var o = 0; o < eligibleOrderIds.length; o++){
			nlapiDeleteRecord('customrecord_advpromo_eligible_order', eligibleOrderIds[o]);
		}
	}

	// Delete Promotion Discount
	if(promoDiscounts != null){
		for(var i = 0; i < discountIds.length; i++){
			nlapiDeleteRecord('customrecord_advpromo_discount', discountIds[i]);
		}
	}

	nlapiLogExecution('DEBUG', 'deleteItemDiscount', 'end');
}


function deleteOrderDiscount(promoId){

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', [promoId]);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_advpromo_discount_type');

	var promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);
	if(promoDiscounts == null){
		return;
	}

	var discountIds = new Array();
	for(var i = 0; i < promoDiscounts.length; i++){
		// do not delete item specific free shipping type, it is done by updateItemSpecificFreeShippingRecords()
		if(promoDiscounts[i].getValue('custrecord_advpromo_discount_type') != CONST_DISCOUNT_TYPE_ITEM_SPEC_FREE_SHIPPING){
			discountIds.push(promoDiscounts[i].getValue('internalid'));	
		}
	}

	if(discountIds && discountIds.length > 0){
		// Delete Promotional Offer
		filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_advpromo_poffer_discount', null, 'anyof', discountIds);
		columns = new Array();
		columns[0] = new nlobjSearchColumn('internalid');

		var promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);

		if(promoOffers != null){
			for(var i = 0; i < promoOffers.length; i++){
				nlapiDeleteRecord('customrecord_advpromo_promotional_offer', promoOffers[i].getValue('internalid'));
			}	
		}	

		// Load Shipping Price
		var filters = new Array();
		filters.push(new nlobjSearchFilter('custrecord_advpromo_sprice_discount', null, 'anyof', discountIds));

		var columns = new Array();
		columns.push(new nlobjSearchColumn('internalid'));

		var shipPrice = nlapiSearchRecord('customrecord_advpromo_shipping_price', null, filters, columns);

		// Delete Shipping Price
		for(i in shipPrice){
			nlapiDeleteRecord('customrecord_advpromo_shipping_price', shipPrice[i].getValue('internalid'));
		}

		// Load Shipping Method
		var filters = new Array();
		filters.push(new nlobjSearchFilter('custrecord_advpromo_smethod_discount', null, 'anyof', discountIds));

		var columns = new Array();
		columns.push(new nlobjSearchColumn('internalid'));

		var shipMethod = nlapiSearchRecord('customrecord_advpromo_shipping_method', null, filters, columns);

		// Delete Shipping Method
		for(i in shipMethod){
			nlapiDeleteRecord('customrecord_advpromo_shipping_method', shipMethod[i].getValue('internalid'));
		}

		// Delete Promotion Discount
		for(var i = 0; i < discountIds.length; i++){
			nlapiDeleteRecord('customrecord_advpromo_discount', discountIds[i]);
		}	
	}
}

function generateOrderDiscountSublistInitJson(promoId){
	var ret = '';

	// initialize currency ID and label lookup table
	populateCurrencyList();

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', [promoId]);
	filters[1] = new nlobjSearchFilter('custrecord_advpromo_discount_type', null, 'anyof', [CONST_DISCOUNT_TYPE_ORDER]);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');

	var promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);
	if(promoDiscounts == null){
		return ret;
	}

	var discountIds = new Array();

	for(var i = 0; i < promoDiscounts.length; i++){
		discountIds.push(promoDiscounts[i].getValue('internalid'));
	}

	filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_poffer_discount', null, 'anyof', discountIds);
	columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_advpromo_poffer_amount');
	columns[1] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_percent');
	columns[2] = new nlobjSearchColumn('custrecord_advpromo_poffer_currency');
	columns[3] = new nlobjSearchColumn('custrecord_advpromo_poffer_limit');
	columns[4] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_unit');

	var promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);

	var promoOfferDbRecs = new Array();
	if(promoOffers != null){
		for(var i = 0; i < promoOffers.length; i++){
			var amount = promoOffers[i].getValue('custrecord_advpromo_poffer_amount');
			var isPercent = promoOffers[i].getValue('custrecord_advpromo_poffer_is_percent');
			var currencyId = promoOffers[i].getValue('custrecord_advpromo_poffer_currency');
			var limit = promoOffers[i].getValue('custrecord_advpromo_poffer_limit');
			var isUnit = promoOffers[i].getValue('custrecord_advpromo_poffer_is_unit');

			var o = new PromotionalOfferJsonDbModel();
			o.amount = amount; 
			o.isPercent = isPercent; 
			o.limit = limit;  
			o.isUnit = isUnit; 
			o.currId = currencyId; 

			promoOfferDbRecs.push(o);
		}	
	}	

	// transform this to mainModel.promotionalOffers and mainModel.promotionalOfferLimits
	var model = new MainModel();
	if(promoOfferDbRecs.length > 0){
		// check the first entry first
		var firstEnt = promoOfferDbRecs[0];

		if(firstEnt.isPercent == 'T'){
			// mainModel.promotionalOffers.length is just 1
			var pO = new PromotionalOfferModel();
			pO.currencyId = '0';
			pO.offerLabel = '% off';
			pO.amount = firstEnt.amount;
			pO.isPercent = true;

			model.promotionalOffers.push(pO);

			if(firstEnt.isUnit == 'T'){
				// mainModel.promotionalOfferLimits.length is just 1
				var pO = new PromotionalLimitModel();
				pO.currencyId = '0';
				pO.limitLabel = firstEnt.limit == 0 ? '' : ' unit(s)';
				pO.amount = firstEnt.limit == 0 ? '' : firstEnt.limit;
				pO.isUnit = true;

				model.promotionalOfferLimits.push(pO);
			}
			else{
				// mainModel.promotionalOfferLimits.length is the number of distinct currId
				for(var i = 0; i < promoOfferDbRecs.length; i++){
					var pO = new PromotionalLimitModel();
					var o = promoOfferDbRecs[i];

					pO.currencyId = o.currId;
					pO.limitLabel = getCurrencySymbol(o.currId);
					pO.amount = o.limit;
					pO.isUnit = false;

					model.promotionalOfferLimits.push(pO);
				}
			}
		}
		else{
			// mainModel.promotionalOffers.length is the number of distinct currId
			for(var i = 0; i < promoOfferDbRecs.length; i++){
				var pO = new PromotionalOfferModel();
				var o = promoOfferDbRecs[i];

				pO.currencyId = o.currId;
				pO.offerLabel = getCurrencySymbol(o.currId);
				pO.amount = o.amount;
				pO.isPercent = false;

				model.promotionalOffers.push(pO);
			}

			if(firstEnt.isUnit == 'T'){
				// mainModel.promotionalOfferLimits.length is just 1
				var pO = new PromotionalLimitModel();
				pO.currencyId = '0';
				pO.limitLabel = firstEnt.limit == 0 ? '' : ' unit(s)';
				pO.amount = firstEnt.limit == 0 ? '' : firstEnt.limit;
				pO.isUnit = true;

				model.promotionalOfferLimits.push(pO);
			}
			else{
				// mainModel.promotionalOfferLimits.length is the number of distinct currId
				for(var i = 0; i < promoOfferDbRecs.length; i++){
					var pO = new PromotionalLimitModel();
					var o = promoOfferDbRecs[i];

					pO.currencyId = o.currId;
					pO.limitLabel = getCurrencySymbol(o.currId);
					pO.amount = o.limit;
					pO.isUnit = false;

					model.promotionalOfferLimits.push(pO);
				}
			}
		}
	}

	// additional checking if promotional offer is currency
	if(model.promotionalOfferLimits.length == 1 && model.promotionalOfferLimits[0].isUnit){
		model.promotionalOfferLimits = new Array();
	}

	ret = JSON.stringify(model);

	return ret;
}

function populateCurrencyList(){

	if(isFeatureEnabled('MULTICURRENCY')){
		var searchFilters = new Array();
		searchFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		var searchColumns = new Array();
		searchColumns[0] = new nlobjSearchColumn('symbol');
		var currencySearch = nlapiSearchRecord('currency', null, searchFilters, searchColumns);

		for (var i = 0; i < currencySearch.length; i++) {
			var id = currencySearch[i].getId();
			var name = currencySearch[i].getValue('symbol');
			ss_currencyList.push({"value":id, "text":name});
		}	
	}else{
		var recCurrency = nlapiLoadRecord('currency', 1);
		ss_currencyList.push({"value":1, "text":recCurrency.getFieldValue('symbol')});
		
//		var url = window.location.href; 
//		var index = url.indexOf('/app');
//		var linkprefix = url.substring(0, index);
//		var headerinfo = {};
//		headerinfo['User-Agent-x'] = 'SuiteScript-Call';
//		var urlformapping = nlapiResolveURL('SUITELET', 'customscript_advpromo_currency_symbol_sl', 'customdeploy_advpromo_currency_symbol_sl');
//		var requestUrl = linkprefix + urlformapping;
//		var urlResponse = nlapiRequestURL(requestUrl, null, headerinfo); 
//		var responseBody = urlResponse.getBody();
//		
//		ss_currencyList.push({"value":1, "text":responseBody});
	}
}

function getCurrencySymbol(currId){

	var ret = 'N/A';

	for (var i = 0; i < ss_currencyList.length; i++) {
		if(parseInt(ss_currencyList[i].value) == parseInt(currId)){
			return ss_currencyList[i].text;
		}
	}

	return ret;
}

function isFeatureEnabled(featureId){
	var ret = false;

	if(featureId != null){
		var objContext = nlapiGetContext();
		if(objContext.getSetting("FEATURE", featureId) == 'T'){
			ret = true;
		}	
	}

	return ret;
}

function saveShippingDiscount(promoId, shippingStr){

	if(shippingStr != null && shippingStr != ''){
		shippingStr = JSON.parse(shippingStr);
		// Create Promotion Discount
		var discRec = nlapiCreateRecord('customrecord_advpromo_discount');
		discRec.setFieldValue('custrecord_advpromo_discount_promo_code', promoId);
		discRec.setFieldValue('custrecord_advpromo_discount_type', 3);
		discRec.setFieldValue('custrecord_advpromo_discount_label', TRANS_UI_Library.LABEL_SHIPPING_DISCOUNT);
		discRec.setFieldValue('custrecord_advpromo_discount_description', TRANS_UI_Library.LABEL_SHIPPING_DISCOUNT);

		var promoDiscountId = nlapiSubmitRecord(discRec, true);

		for(var i = 0; i < shippingStr.discountType.length; i++){
			var discountType = shippingStr.discountType[i].discountType;
		}

		for(var i = 0; i < shippingStr.shippingOffer.length; i++){
			var shipPrice = nlapiCreateRecord('customrecord_advpromo_shipping_price');

			shipPrice.setFieldValue('custrecord_advpromo_sprice_discount', promoDiscountId);

			shipPrice.setFieldValue('custrecord_advpromo_sprice_amount', shippingStr.shippingOffer[i].amount);

			if(shippingStr.shippingOffer[i].currencyId > 0){
				shipPrice.setFieldValue('custrecord_advpromo_sprice_currency', shippingStr.shippingOffer[i].currencyId);
			}

			if(discountType == 'percent'){
				shipPrice.setFieldValue('custrecord_advpromo_sprice_is_percent', 'T');
			}

			if(discountType == 'amount'){
				shipPrice.setFieldValue('custrecord_advpromo_sprice_is_percent', 'F');
			}
			nlapiSubmitRecord(shipPrice, true);
		}

		var shippingIds = [];
		for(var i = 0; i < shippingStr.shippingMethod.length; i++){
			for(var j = 0; j < shippingStr.shippingMethod[i].shippingMethodLabel.length; j++){
				shippingIds.push(shippingStr.shippingMethod[i].shippingMethod[j]);
			}
		}
		
		if(shippingIds){
			nlapiSubmitField('customrecord_advpromo_discount', promoDiscountId, 'custrecord_advpromo_discount_isf_smethod', shippingIds);	
		}
	}
}

function generateIsfShippingDiscountSublistInitJson(promoId){
	var ret = '';
	
	try{
		var filters = [
       	    new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', [promoId]),
       	    new nlobjSearchFilter('custrecord_advpromo_discount_type', null, 'equalto', CONST_DISCOUNT_TYPE_ITEM_SPEC_FREE_SHIPPING)
        ];
       	
       	var columns = [
            new nlobjSearchColumn('custrecord_advpromo_discount_iatype'),
            new nlobjSearchColumn('custrecord_advpromo_discount_sid'),
            new nlobjSearchColumn('custrecord_advpromo_discount_iid'),
            new nlobjSearchColumn('custrecord_advpromo_discount_isf_smethod')
        ];
       	
       	var promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);
       	if(promoDiscounts){
       		ret = {};
       		
       		for(var i = 0; i < promoDiscounts.length; i++){
       			ret.op = '';
       			ret.discId = promoDiscounts[i].getId();
       			
       			var arrStr = promoDiscounts[i].getValue('custrecord_advpromo_discount_isf_smethod');
       			ret.shipIds = arrStr ? arrStr.split(',') : [];
       			
       			arrStr = promoDiscounts[i].getText('custrecord_advpromo_discount_isf_smethod');
       			ret.shipLabels = arrStr ? arrStr.split(',') : [];
       			
       			var iatype = promoDiscounts[i].getValue('custrecord_advpromo_discount_iatype');
       			switch(iatype){
	       			case CONST_FREE_SHIPPING_TYPE_ITEM:
	       				arrStr = promoDiscounts[i].getValue('custrecord_advpromo_discount_iid'); 
	           			ret.itemIds = arrStr ? arrStr.split(',') : [];
	           			
	           			arrStr = promoDiscounts[i].getText('custrecord_advpromo_discount_iid'); 
	           			ret.itemLabels = arrStr ? arrStr.split(',') : [];
						
						break;
					case CONST_FREE_SHIPPING_TYPE_ITEM_SEARCH:
						arrStr = promoDiscounts[i].getValue('custrecord_advpromo_discount_sid'); 
	           			ret.searchId = arrStr;
	           			
	           			arrStr = promoDiscounts[i].getText('custrecord_advpromo_discount_sid'); 
	           			ret.searchName = arrStr;
						
						break;
       			}
       		}
       		
       		ret = JSON.stringify(ret);
       	}	
	}
	catch(e){
		nlapiLogExecution('Error', 'Advanced Promotion', 'generateIsfShippingDiscountSublistInitJson(): ' + e);
	}
	
	return ret;
}

function generateShippingDiscountSublistInitJson(promoId){
	var ret = '';

	// initialize currency ID and label lookup table
	populateCurrencyList();

	nlapiLogExecution('DEBUG','promoId', promoId);

	// load Promotional Discount
	var filters = new Array();
	filters.push(new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', [promoId]));
	filters.push(new nlobjSearchFilter('custrecord_advpromo_discount_type', null, 'equalto', CONST_DISCOUNT_TYPE_SHIPPING));
	var columns = [
        new nlobjSearchColumn('internalid'),           
        new nlobjSearchColumn('custrecord_advpromo_discount_isf_smethod')
    ];

	var promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);
	if(promoDiscounts == null){
		return ret;
	}

	var discountIds = new Array();

	// only one Shipping Discount is allowed
	discountIds.push(promoDiscounts[0].getId());
	var shipMethIds = promoDiscounts[0].getValue('custrecord_advpromo_discount_isf_smethod');
	var shipMethNames = promoDiscounts[0].getText('custrecord_advpromo_discount_isf_smethod');
	
	// load Shipping Price
	var filters = new Array();
	filters.push(new nlobjSearchFilter('custrecord_advpromo_sprice_discount', null, 'anyof', discountIds));

	var columns = new Array();
	columns.push(new nlobjSearchColumn('internalid'));
	columns.push(new nlobjSearchColumn('custrecord_advpromo_sprice_amount'));
	columns.push(new nlobjSearchColumn('custrecord_advpromo_sprice_currency'));
	columns.push(new nlobjSearchColumn('custrecord_advpromo_sprice_is_percent'));

	var shipPrice = nlapiSearchRecord('customrecord_advpromo_shipping_price', null, filters, columns);
	if(shipPrice == null){
		return ret;
	}

	//load Shipping Method
	var model = new ShippingModel();
	var modelDiscountType = new DiscountTypeModel();

	if(shipPrice[0].getValue('custrecord_advpromo_sprice_is_percent') == 'T'){
		modelDiscountType.discountType = 'percent';
	}
	else{
		modelDiscountType.discountType = 'amount';
	}
	model.discountType.push(modelDiscountType);

	var shippingOffer = new Array();

	for(var i in shipPrice){
		var modelShippingOffer = new ShippingOfferModel();
		modelShippingOffer.amount = shipPrice[i].getValue('custrecord_advpromo_sprice_amount');
		if(shipPrice[i].getValue('custrecord_advpromo_sprice_currency') != null && shipPrice[i].getValue('custrecord_advpromo_sprice_currency') != ''){
			modelShippingOffer.currencyId = shipPrice[i].getValue('custrecord_advpromo_sprice_currency');
			modelShippingOffer.currencyLabel = getCurrencySymbol(shipPrice[i].getValue('custrecord_advpromo_sprice_currency'));
		}
		shippingOffer.push(modelShippingOffer);
	}

	if(shippingOffer != ''){
		model.shippingOffer = shippingOffer;
	}

	var shippingMethod = new Array();

	var modelShippingMethod = new ShippingMethodModel();

	var arrIds = (shipMethIds ? shipMethIds.split(',') : []);
	var arrNames = (shipMethNames ? shipMethNames.split(',') : []);
	for(var i = 0; i < arrIds.length; i++){
		modelShippingMethod.shippingMethod[i] = arrIds[i];
		modelShippingMethod.shippingMethodLabel[i] = arrNames[i];
	}
	
	shippingMethod.push(modelShippingMethod);

	if(shippingMethod != ''){
		model.shippingMethod = shippingMethod;
	}

	ret = JSON.stringify(model);
	nlapiLogExecution('DEBUG','ret', ret);
	return ret;
}

function truncateTextField(pText, pLength) {
	if (!pText) return null;
	var length = (isNaN(pLength)) ? 300 : pLength;
	if (pText.length < length) return pText;
	return (pText.substring(0, (length > 3) ? (length - 3) : length) + '...');
}
