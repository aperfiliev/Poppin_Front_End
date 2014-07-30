/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Feb 2012     adimaunahan
 *                            rwong
 *
 */
var TRANS_UI_CS_Library = {};
function init_UI_CS_Library() {
	var translates_UI_CS_Library = [];
	translates_UI_CS_Library.push(new TranslateMember('label.customers.select', 'LABEL_SELECT_CUSTOMERS', 'Select Customers'));
	translates_UI_CS_Library.push(new TranslateMember('label.customers.ss.select', 'LABEL_SELECT_CUSTOMERS_SS', 'Select Customer Saved Search'));
	translates_UI_CS_Library.push(new TranslateMember('label.customers.ss.new', 'LABEL_NEW_CUSTOMER_SS', 'Create New Customer Search'));
	translates_UI_CS_Library.push(new TranslateMember('label.item.add', 'LABEL_ADD_ITEM', 'Add Item'));
	translates_UI_CS_Library.push(new TranslateMember('label.items.ss.add', 'LABEL_ADD_ITEM_SS', 'Add Item Saved Search'));
	translates_UI_CS_Library.push(new TranslateMember('label.ss.new', 'LABEL_NEW_SS', 'New Saved Search'));
	translates_UI_CS_Library.push(new TranslateMember('label.order.discount.new', 'LABEL_NEW_ORDER_DISC', 'New Order Discount'));
	translates_UI_CS_Library.push(new TranslateMember('label.shipping.applycart', 'LABEL_SHIPPING_ALL_ITEM', 'Shipping Applicable to All Items in the CART'));
	translates_UI_CS_Library.push(new TranslateMember('label.shipping.discount.new', 'LABEL_NEW_SHIPPING_DISC', 'New Shipping Discount'));
	translates_UI_CS_Library.push(new TranslateMember('label.order.total.set', 'LABEL_ORDER_TOTAL', 'Set Order Total'));
	translates_UI_CS_Library.push(new TranslateMember('label.items.select', 'LABEL_SELECT_ITEMS', 'Select Items'));
	translates_UI_CS_Library.push(new TranslateMember('label.items.ss.select', 'LABEL_SELECT_ITEM_SS', 'Select Item Saved Search'));
	translates_UI_CS_Library.push(new TranslateMember('label.items.ss.new', 'LABEL_NEW_ITEM_SS', 'Create New Item Saved Search'));
	translates_UI_CS_Library.push(new TranslateMember('label.order.discount.edit', 'LABEL_EDIT_ORDER_DISC', 'Edit Order Discount'));
	translates_UI_CS_Library.push(new TranslateMember('label.shipping.discount.edit', 'LABEL_EDIT_SHIP_DISC', 'Edit Shipping Discount'));
	translates_UI_CS_Library.push(new TranslateMember('label.shipping.isfree.edit', 'EDIT_ISFSHIPPING', 'Edit Item Specific Free Shipping'));
	translates_UI_CS_Library.push(new TranslateMember('label.shipping.item.search.free.edit', 'EDIT_SS_ISFSHIPPING', 'Edit Item Saved Search for Free Shipping'));
	translates_UI_CS_Library.push(new TranslateMember('label.discount.upto', 'LABEL_DISC_UPTO', 'Discount Up to'));
	translates_UI_CS_Library.push(new TranslateMember('label.remove', 'LABEL_REMOVE', 'Remove'));
	translates_UI_CS_Library.push(new TranslateMember('label.promo.offer', 'LABEL_PROMO_OFFER', 'Promotional Offer'));
	translates_UI_CS_Library.push(new TranslateMember('label.addanother', 'LABEL_ADD_ANOTHER', 'Add Another'));
	translates_UI_CS_Library.push(new TranslateMember('error.offer.enter', 'ERROR_OFFER_ENTER', 'Please enter value(s) for: Promotional Offer'));
	translates_UI_CS_Library.push(new TranslateMember('error.offer.nan', 'ERROR_OFFER_NAN', 'Invalid Promotional Offer value. Values must be numbers'));
	translates_UI_CS_Library.push(new TranslateMember('error.offer.range.percent', 'ERROR_OFFER_RANGE_PCNT', 'Invalid Promotional Offer value. Values must be greater than zero and must not exceed 100.'));
	translates_UI_CS_Library.push(new TranslateMember('error.offer.range', 'ERROR_OFFER_RANGE', 'Invalid Promotional Offer value. Values must be greater than zero.'));
	translates_UI_CS_Library.push(new TranslateMember('error.limit.enter', 'ERROR_LIMIT_ENTER', 'Please enter value(s) for: Limit'));
	translates_UI_CS_Library.push(new TranslateMember('error.discount.nan', 'ERROR_DISCOUNT_NAN', 'Invalid Discount value. Values must be numbers'));
	translates_UI_CS_Library.push(new TranslateMember('error.limit.nan', 'ERROR_LIMIT_NAN', 'Invalid Limit value. Values must be numbers'));
	translates_UI_CS_Library.push(new TranslateMember('error.limit.range', 'ERROR_LIMIT_RANGE', 'Invalid Limit value. Values must be numbers from 1 to 99,999,999,999'));
	translates_UI_CS_Library.push(new TranslateMember('error.amount.nan', 'ERROR_AMOUNT_NAN', 'Invalid amount value. Values must be numbers'));
	translates_UI_CS_Library.push(new TranslateMember('error.amount.range', 'ERROR_AMOUNT_RANGE', 'Invalid amount value. Values must be greater than zero.'));
	translates_UI_CS_Library.push(new TranslateMember('text.nolimit', 'TEXT_NOLIMIT', 'No Limit'));
	TRANS_UI_CS_Library = new TranslateHelper(translates_UI_CS_Library);
}

var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_UI_CS_Library);
if (TranslateInit) TranslateInit();


var url  = window.location.href;
var index = url.indexOf('/app');
var baseUrl = url.substring(0, index);

var promotionalOffers = new Array();
var promotionalLimits = new Array();
var currencyList = new Array();

var discountType = new Array();
var shippingOffer = new Array();
var shippingMethod = new Array();

function pageInit(type){
	
	var modelJson = nlapiGetFieldValue('custpage_model_json');

	populateCurrencyList();

	if(modelJson == null || modelJson == ''){
		// initialize Promotional Offers
		promotionalOffers = new Array();
		var obj = new PromotionalOfferModel();
		promotionalOffers.push(obj);

		// initialize Promotional Limits
		promotionalLimits = new Array();
		obj = new PromotionalLimitModel();
		promotionalLimits.push(obj);

		// initialize Discount Type
		discountType = new Array();
		obj = new DiscountTypeModel();
		discountType.push(obj);

		// initialize Shipping Offers
		shippingOffer = new Array();
		obj = new ShippingOfferModel();
		shippingOffer.push(obj);

		// initialize Shipping Method
		shippingMethod = new Array();
		obj = new ShippingMethodModel();
		shippingMethod.push(obj);
	}
	else{
		var model = JSON.parse(modelJson);

		if(model.promotionalOffers != null){
			// initialize Promotional Offers
			promotionalOffers = model.promotionalOffers;

			// initialize Promotional Limits
			promotionalLimits = model.promotionalOfferLimits;
		}

		if(model.shippingOffer != null){
			// initialize Discount Type
			discountType = model.discountType;

			// initialize Shipping Offers
			shippingOffer = model.shippingOffer;

			// initialize Shipping Method
			shippingMethod = model.shippingMethod;
		}
	}	

	renderSelectedLimits();
	renderPromotionalOffers();
	renderDiscountType();
	renderShippingOffer();
	renderShippingMethod();
	renderEligibleOrders(type);
}


//function addPopupLink(type, name){
//	var addLink = baseUrl;
//	var title;
//	var popUpHeight = 400;
//	var popUpWidth = 600;
//	var windowOpen = false;
//
//	var closer = encodeURIComponent(baseUrl + nlapiResolveURL('SUITELET', 'customscript_advpromo_closer_sl', 'customdeploy_advpromo_closer_sl'));
//
//	if(name == 'custpage_advpromo_addcustomer'){	// Eligible Customer popup suitelets
//		switch (type) {
//		case 1:	//customer id
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_os_cust_addid_ss', 'customdeploy_advpromo_os_cust_addid_ss');
//			title = TRANS_UI_CS_Library.LABEL_SELECT_CUSTOMERS;
//			popUpHeight = 200;
//			popUpWidth = 400;
//			break;
//
//		case 2:	// customer saved search
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_os_cust_addsrch_ss', 'customdeploy_advpromo_os_cust_addsrch_ss');
//			title = TRANS_UI_CS_Library.LABEL_SELECT_CUSTOMERS_SS;
//			popUpHeight = 200;
//			popUpWidth = 650;
//			break;
//
//		case 3:
//			addLink = baseUrl + '/app/common/search/search.nl?searchtype=Customer&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
//			title = TRANS_UI_CS_Library.LABEL_NEW_CUSTOMER_SS;
//			popUpHeight = 550;
//			popUpWidth = 700;
//			windowOpen = true;
//
//			break;
//		};
//	} 
//
//	if(name == 'custpage_advpromo_discount_item'){
//		switch (type){
//		case 1:	// add item
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_dis_additem_ss', 'customdeploy_advpromo_is_dis_additem_ss');
//			title = TRANS_UI_CS_Library.LABEL_ADD_ITEM;
//			break;
//
//		case 2:	// add item search
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_dis_additmss_ss', 'customdeploy_advpromo_is_dis_additmss_ss');
//			title = TRANS_UI_CS_Library.LABEL_ADD_ITEM_SS;
//			break;
//
//		case 3: // new item saved search
//			addLink = baseUrl + '/app/common/search/search.nl?searchtype=Item&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
//			title = LABEL_NEW_SS;
//			windowOpen = true;
//			break;
//
//		case 4: // new order discount
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_os_dis_neworder_ss', 'customdeploy_advpromo_os_dis_neworder_ss');
//			title = TRANS_UI_CS_Library.LABEL_NEW_ORDER_DISC;
//			popUpHeight = 200;
//			popUpWidth = 400;
//
//			break;
//		};
//	}
//
//	if(name == 'custpage_advpromo_discount_shipping'){
//		switch (type){
//		case 1:
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_dis_addship_ss', 'customdeploy_advpromo_is_dis_addship_ss');
//			title = TRANS_UI_CS_Library.LABEL_SHIPPING_ALL_ITEM;
//			popUpHeight = 300;
//			popUpWidth = 400;
//			break;
//
//		case 2:
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_os_dis_addship_ss', 'customdeploy_advpromo_os_dis_addship_ss');
//			title = TRANS_UI_CS_Library.LABEL_NEW_SHIPPING_DISC;
//			popUpHeight = 300;
//			popUpWidth = 400;
//			break;
//		};
//	}
//
//	if(name == 'custpage_advpromo_addorder'){
//		switch (type){
//		case 1:	// all item
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_order_add_all', 'customdeploy_advpromo_is_order_add_all');
//			title = TRANS_UI_CS_Library.LABEL_ORDER_TOTAL;
//			popUpHeight = 200;
//			popUpWidth = 400;
//			break;
//		case 2:	// add item
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_order_add_item', 'customdeploy_advpromo_is_order_add_item');
//			title = TRANS_UI_CS_Library.LABEL_SELECT_ITEMS;
//			popUpHeight = 300;
//			popUpWidth = 400;
//			break;
//		case 3:	// add item search
//			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_order_add_searc', 'customdeploy_advpromo_is_order_add_searc');
//			title = TRANS_UI_CS_Library.LABEL_SELECT_ITEM_SS;
//			popUpHeight = 200;
//			popUpWidth = 600;
//			break;
//		case 4: // new item saved search
//			addLink = baseUrl + '/app/common/search/search.nl?searchtype=Item&rectype=-1&cu=T&e=F&ifrmcntnr=T&whence=' + closer;
//			title = TRANS_UI_CS_Library.LABEL_NEW_ITEM_SS;
//			popUpHeight = 550;
//			popUpWidth = 700;
//			windowOpen = true;
//			break;
//		}
//	}
//
//	if (windowOpen) {
//		var windowSize = 'width=' + popUpWidth + ',height=' + popUpHeight + ',scrollbars=yes,dialog=yes';
//		window.open(addLink, 'AddSearchPopup', windowSize);
//	} else {
//		nlExtOpenWindow(addLink, 'thepopup', popUpWidth, popUpHeight, 0, 0, title, null);
//	}
//}

function editPopupLink(type, name, globalModel){
	var addLink = baseUrl;
	var title;
	var popUpHeight = 800;
	var popUpWidth = 800;
	if(name == 'custpage_advpromo_discount_item'){
		switch (type){
		case 4: // new order discount
			var model = new Object();
			model.promotionalOffers = globalModel.promotionalOffers;
			model.promotionalOfferLimits = globalModel.promotionalOfferLimits;

			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_os_dis_neworder_ss', 'customdeploy_advpromo_os_dis_neworder_ss')
			+ '&modelJson=' + encodeURIComponent(JSON.stringify(model));

			title = TRANS_UI_CS_Library.LABEL_EDIT_ORDER_DISC;
			popUpHeight = 200;
			popUpWidth = 400;

			break;
		}
	}

	if(name == 'custpage_advpromo_discount_shipping'){
		switch (type){
		case 2: // new shipping discount
			var model = new Object();
			model.discountType = globalModel.discountType;
			model.shippingOffer = globalModel.shippingOffer;
			model.shippingMethod = globalModel.shippingMethod;

			addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_os_dis_addship_ss', 'customdeploy_advpromo_os_dis_addship_ss')
			+ '&modelJson=' + encodeURIComponent(JSON.stringify(model));

			title = TRANS_UI_CS_Library.LABEL_EDIT_SHIP_DISC;
			popUpHeight = 300;
			popUpWidth = 400;

			break;
		case 3: //isf shipping. added a dummy row number to be used as flag for action (used by the isfs CS to check for add/edit mode).
			if(AdvPromo.PromotionCs.isfShippingObj.searchId == null){
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss') + "&mIds=" + encodeURIComponent(globalModel.shipIds) +"&itemIds=" + encodeURIComponent(globalModel.itemIds)  + "&rowNum=" + 1;
				title = TRANS_UI_CS_Library.EDIT_ISFSHIPPING;
				popUpHeight = 500;
				popUpWidth = 650;
			}
			else{
				addLink = nlapiResolveURL('SUITELET', 'customscript_advpromo_is_freeshipping_ss', 'customdeploy_advpromo_is_freeshipping_ss') + "&mIds=" + encodeURIComponent(globalModel.shipIds) +"&savedSearchId=" + encodeURIComponent(globalModel.searchId)  + "&rowNum=" + 1;
				title = TRANS_UI_CS_Library.EDIT_SS_ISFSHIPPING;
				popUpHeight = 520;
				popUpWidth = 400;
			}
			break;
		}

	}

	nlExtOpenWindow(addLink, 'thepopup', popUpWidth, popUpHeight, 0, 0, title, null);
}

function cancelOrderDiscount(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function saveOrderDiscount(){

	var isValid = validateEntries();

	if(isValid){
		populateSelectedLimits();
		populatePromoOffers();

		var mainModel = new MainModel();
		mainModel.promotionalOffers = promotionalOffers;
		mainModel.promotionalOfferLimits = promotionalLimits;

		window.parent.AdvPromo.PromotionCs.renderOrderSublist(mainModel);
		window.parent.AdvPromo.PromotionCs.flagChanged();

		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();	
	}
	else{
		// show error message using jQuery
	}	
}

function validateEntries(){
	var ret = true;
	var error = '';

	// check if promotional offers are valid
	var offerType = $('#promo_offer_div_0_typeId').val();

	// check if offer is percent	
	if(offerType == '0'){
		var currentDiv = $('#promo_offer_div_0_amount');
		var offerAmountStr = currentDiv.val();
		var offerAmount = parseFloat(offerAmountStr);

		if(offerAmountStr.trim() == ''){
			error = TRANS_UI_CS_Library.ERROR_OFFER_ENTER;
			ret = false;
		}
		else if(isNaN(offerAmountStr)){
			error = TRANS_UI_CS_Library.ERROR_OFFER_NAN;
			ret = false;
		}
		else if(offerAmount > 100 || offerAmount < 1){
			error = TRANS_UI_CS_Library.ERROR_OFFER_RANGE_PCNT;
			ret = false;
		}

		if(ret == false){
			currentDiv.focus();
		}
	}
	else{
		// get all promotional offers
		var inputCount = $('input[id^="promo_offer_div_"]');

		for(var i = 0; i < inputCount.length; i++){
			var currentDiv = $('#promo_offer_div_' + i + '_amount');

			var offerAmountStr = currentDiv.val();
			var offerAmount = parseFloat(offerAmountStr);

			if(offerAmountStr.trim() == ''){
				error = TRANS_UI_CS_Library.ERROR_OFFER_ENTER;
				ret = false;
			}
			else if(isNaN(offerAmountStr)){
				error = TRANS_UI_CS_Library.ERROR_OFFER_NAN;
				ret = false;
			}
			else if(offerAmount < 0){
				error = TRANS_UI_CS_Library.ERROR_OFFER_RANGE;
				ret = false;
			}

			if(ret == false){
				currentDiv.focus();
				break;
			}
		}
	}

	if(ret == true && offerType == '0'){
		// check if limits are valid
		var inputCount = $('input[id^="promo_limit_div_"]');

		if(inputCount.length > 1){
			for(var i = 0; i < inputCount.length; i++){
				var currentDiv = $('#promo_limit_div_' + i + '_amount');

				var offerAmountStr = currentDiv.val();
				var offerAmount = parseFloat(offerAmountStr);

				if(offerAmountStr.trim() == ''){
					error = TRANS_UI_CS_Library.ERROR_LIMIT_ENTER;
					ret = false;
				}
				else if(isNaN(offerAmountStr)){
					error = TRANS_UI_CS_Library.ERROR_DISCOUNT_NAN;
					ret = false;
				}
				else if(offerAmount < 0){
					error = TRANS_UI_CS_Library.ERROR_LIMIT_RANGE;
					ret = false;
				}

				if(ret == false){
					currentDiv.focus();
					break;
				}
			}	
		}
		else { // promotional offer is % so make limit optional
			// check if limit is a valid number
			var currentDiv = $('#promo_limit_div_0_amount');

			var offerAmountStr = currentDiv.val();
			
			if(offerAmountStr != ""){
				var offerAmount = parseFloat(offerAmountStr);

				if(isNaN(offerAmountStr)){
//					error = TRANS_UI_CS_Library.ERROR_LIMIT_NAN;
					error = TRANS_UI_CS_Library.ERROR_DISCOUNT_NAN;
					ret = false;
				}
				else if(offerAmount < 0){
					error = TRANS_UI_CS_Library.ERROR_LIMIT_RANGE;
					ret = false;
				}	
			}			
		}				
	}	

	if(ret == false){
		alert(error);
	}

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
			currencyList.push({"value":id, "text":name});
		}	
	}else{
//		var recCurrency = nlapiLoadRecord('currency', 1);
//		currencyList.push({"value":1, "text":recCurrency.getFieldValue('symbol')});
		
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

function addAnotherPromoOffer(){
	populatePromoOffers();
	var obj = new PromotionalOfferModel();
	promotionalOffers.push(obj);
	renderPromotionalOffers();
}

function deleteAnotherPromoOffer(divId){
	var targetName = '#' + divId;
	$(targetName).empty().remove();
	populatePromoOffers();
	renderPromotionalOffers();
}

function deleteLimit(divId){
	var targetName = '#' + divId;
	$(targetName).empty().remove();
	populateSelectedLimits();
	renderSelectedLimits();
}

function addAnotherLimit(rowCount){
	populateSelectedLimits();
	var obj = new PromotionalLimitModel();
	promotionalLimits.push(obj);
	renderSelectedLimits();
}

function deleteLimit(divId){
	var targetName = '#' + divId;
	$(targetName).empty().remove();
	populateSelectedLimits();
	renderSelectedLimits();
}

function populateSelectedLimits(){
	var divCount = $('#promo_limit_div > div');

	promotionalLimits = new Array();

	var dmsg = '';

	divCount.each(function(index, elem) {
		var divName = $(elem).attr('id');

		if(index != divCount.length-1){
			var obj = new PromotionalLimitModel();
			obj.amount = $('#' + divName + '_amount').val();
			obj.currencyId = $('#' + divName + '_typeId').val() == null ? '1' : $('#' + divName + '_typeId').val();
			obj.isUnit = false;
			obj.limitLabel = $('#' + divName + '_typeId option:selected').text();

			promotionalLimits.push(obj);
		}		
	});

//	alert(JSON.stringify(promotionalLimits));	
}

function populatePromoOffers(){
	var divCount = $('#promo_offer_div > div');

	promotionalOffers = new Array();

	var dmsg = '';

	divCount.each(function(index, elem) {
		var divName = $(elem).attr('id');

		if(index != divCount.length-1){
			var obj = new PromotionalOfferModel();
			obj.amount = $('#' + divName + '_amount').val();
			obj.currencyId = $('#' + divName + '_typeId').val();
			obj.isPercent = $('#' + divName + '_typeId').val() == 0 ? true : false; // <%> has a value of 0
			var label = $('#' + divName + '_typeId option:selected').text();
			obj.offerLabel = label == '%' ? '% off' : label;

			promotionalOffers.push(obj);
		}		
	});

//	alert(JSON.stringify(promotionalOffers));	
}

function renderSelectedLimits(){
	var htmlCodeStr = '';

	for(var i = 0; i < promotionalLimits.length; i++){
		var limitObj = promotionalLimits[i];
		var divName = 'promo_limit_div_' + i;

		htmlCodeStr += '<div id="'+ divName +'">';

		htmlCodeStr += '<div class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; margin: 0 10px 0 0">';

		if(i == 0){
			htmlCodeStr += '<a href="javascript:void(\'help\');" class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; cursor:help;" onclick="nlFieldHelp(96,\'NONE_NEEDED\', \'custpage_advpromo_discount\', this);" onmouseout="this.className=\'smallgraytextnolink\';" onmouseover="this.className=\'smallgraytext\'; return true;">';
			htmlCodeStr += TRANS_UI_CS_Library.LABEL_DISC_UPTO;
			htmlCodeStr += '</a>';
		}
		else{
			htmlCodeStr += '&nbsp;';	
		}

		htmlCodeStr += '</div>';
		htmlCodeStr += '<div style="float:left; margin: 0 5px 0 0">';
		var limitAmount = limitObj.amount == null || limitObj.amount == -1 ? '' : limitObj.amount;
		htmlCodeStr += '<input id="'+ divName + '_amount' +'" type="text" class="inputrt" value="' + limitAmount + '"/>';
		htmlCodeStr += '</div>';

		if(currencyList.length != 0){
			htmlCodeStr += '<div style="float:left;">';
			htmlCodeStr += '<select class="inputreq" id="'+ divName + '_typeId' +'" name="limit_type">';

			for(var j = 0; j < currencyList.length; j++){
				var currValue = currencyList[j].value;
				var currText = currencyList[j].text;

				if(limitObj.currencyId == currValue) {
					htmlCodeStr += '<option value="'+ currValue +'" selected>'+ currText +'</option>';	
				}
				else{
					htmlCodeStr += '<option value="'+ currValue +'">'+ currText +'</option>';
				}
			}

			htmlCodeStr += '</select>';
			htmlCodeStr += '</div>';
			if(i != 0){
				htmlCodeStr += '<div style="float:left;">';
				htmlCodeStr += '<a class="smallgraytextnolink" href="javascript:deleteLimit(\''+ divName +'\');" style="margin: 2 0 0 5px;">' + TRANS_UI_CS_Library.LABEL_REMOVE + '</a>';
				htmlCodeStr += '</div>';
			}	
		}

		htmlCodeStr += '<div style="clear:both;"></div>';
		htmlCodeStr += '</div>';
	}

	htmlCodeStr += '<div>'; // start of Add Another div

	if(promotionalLimits.length < currencyList.length && promotionalLimits.length != 0){
		htmlCodeStr += '<a class="smallgraytextnolink" href="javascript:addAnotherLimit();" style="margin: 0 0 0 115px;">Add Another</a>';	
	}

	htmlCodeStr += '</div>'; // end of Add Another div

	$('#promo_limit_div').html(htmlCodeStr);

	$('select[id$="_typeId"][name="limit_type"]').change(function() {
		populateSelectedLimits();
		renderSelectedLimits();
	});

	$('select[id$="_typeId"][name="limit_type"]').each(function(index, elem) {
		var selectId = $(elem).attr('id');

		var selectedValue = $('#' + selectId + ' option:selected').val();
		renderLimitDropdown(selectId, selectedValue);		
	});
}

function renderPromotionalOffers(){
	var htmlCodeStr = '';

	// check if promotional offer is a percentage
	if(promotionalOffers.length == 1 && promotionalOffers[0].isPercent){
		for(var i = 0; i < promotionalOffers.length; i++){
			var offerObj = promotionalOffers[i];
			var divName = 'promo_offer_div_' + i;

			htmlCodeStr += '<div id="'+ divName +'">';

			htmlCodeStr += '<div class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; margin: 0 10px 0 0">';

			if(i == 0){
				htmlCodeStr += '<a href="javascript:void(\'help\');" class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; cursor:help;" onclick="nlFieldHelp(96,\'NONE_NEEDED\', \'custpage_advpromo_offer\', this);" onmouseout="this.className=\'smallgraytextnolink\';" onmouseover="this.className=\'smallgraytext\'; return true;">';
				htmlCodeStr += TRANS_UI_CS_Library.LABEL_PROMO_OFFER;
				htmlCodeStr += '</a>';
			}
			else{
				htmlCodeStr += '&nbsp;';	
			}

			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="float:left; margin: 0 5px 0 0">';
			var offerAmount = offerObj.amount == null || offerObj.amount == -1 ? '' : offerObj.amount;
			htmlCodeStr += '<input id="'+ divName + '_amount' +'" type="text" class="inputrt"  value="' + offerAmount + '"/>';
			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="float:left;">';
			htmlCodeStr += '<select class="inputreq" id="promo_offer_div_0_typeId" name="promo_offer_type">';
			htmlCodeStr += '<option value="0">&#37;</option>';
			htmlCodeStr += '<option value="-1" disabled>-------</option>';

			if(currencyList.length != 0){
				for(var i = 0; i < currencyList.length; i++){
					htmlCodeStr += '<option value="'+ currencyList[i].value +'">'+ currencyList[i].text +'</option>';
				}
			}
			else{
				htmlCodeStr += '<option value="'+ 1 +'">'+ TRANS_UI_CS_Library.LABEL_FLAT_AMOUNT +'</option>';
			}

			htmlCodeStr += '</select>';
			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="clear:both;"></div>';
			htmlCodeStr += '</div>';
		}

		htmlCodeStr += '<div></div>'; // for Add Another div

		renderSelectedLimits();
	}
	else if(promotionalOffers.length == 1 && promotionalOffers[0].isPercent == false){ // currency but allow switching to %
		for(var i = 0; i < promotionalOffers.length; i++){
			var offerObj = promotionalOffers[i];
			var divName = 'promo_offer_div_' + i;

			htmlCodeStr += '<div id="'+ divName +'">';

			htmlCodeStr += '<div class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; margin: 0 10px 0 0">';

			if(i == 0){
				htmlCodeStr += '<a href="javascript:void(\'help\');" class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; cursor:help;" onclick="nlFieldHelp(96,\'NONE_NEEDED\', \'custpage_advpromo_offer\', this);" onmouseout="this.className=\'smallgraytextnolink\';" onmouseover="this.className=\'smallgraytext\'; return true;">';
				htmlCodeStr += TRANS_UI_CS_Library.LABEL_PROMO_OFFER;
				htmlCodeStr += '</a>';
			}
			else{
				htmlCodeStr += '&nbsp;';	
			}

			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="float:left; margin: 0 5px 0 0">';
			var offerAmount = offerObj.amount == null || offerObj.amount == -1 ? '' : offerObj.amount;
			htmlCodeStr += '<input id="'+ divName + '_amount' +'" type="text" class="inputrt" value="' + offerAmount + '"/>';
			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="float:left;">';
			htmlCodeStr += '<select class="inputreq" id="promo_offer_div_0_typeId" name="promo_offer_type">';
			htmlCodeStr += '<option value="0">&#37;</option>';
			htmlCodeStr += '<option value="-1" disabled>-------</option>';

			if(currencyList.length != 0){
				for(var j = 0; j < currencyList.length; j++){
					var currValue = currencyList[j].value;
					var currText = currencyList[j].text;					

					if(offerObj.currencyId == currValue) {
						htmlCodeStr += '<option value="'+ currValue +'" selected>'+ currText +'</option>';	
					}
					else{
						htmlCodeStr += '<option value="'+ currValue +'">'+ currText +'</option>';
					}
				}
			}
			else{
				htmlCodeStr += '<option value="'+ 1 +'">'+ TRANS_UI_CS_Library.LABEL_FLAT_AMOUNT +'</option>';
			}

			htmlCodeStr += '</select>';
			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="clear:both;"></div>';
			htmlCodeStr += '</div>';
		}

		htmlCodeStr += '<div>'; // start of Add Another div

		if(promotionalOffers.length < currencyList.length){
			htmlCodeStr += '<a class="smallgraytextnolink" href="javascript:addAnotherPromoOffer();" style="margin: 0 0 0 115px;">' + TRANS_UI_CS_Library.LABEL_ADD_ANOTHER + '</a>';	
		}

		htmlCodeStr += '</div>'; // end of Add Another div

		// remove Limit
		promotionalLimits = new Array();
		var obj = new PromotionalLimitModel();
		promotionalLimits.push(obj);
		$('#promo_limit_div').html('');
	}
	else{ // all currencies

		for(var i = 0; i < promotionalOffers.length; i++){
			var offerObj = promotionalOffers[i];
			var divName = 'promo_offer_div_' + i;

			htmlCodeStr += '<div id="'+ divName +'">';

			htmlCodeStr += '<div class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; margin: 0 10px 0 0">';

			if(i == 0){
				htmlCodeStr += '<a href="javascript:void(\'help\');" class="smallgraytextnolink" style="float:left; text-align: right; width: 105px; cursor:help;" onclick="nlFieldHelp(96,\'NONE_NEEDED\', \'custpage_advpromo_offer\', this);" onmouseout="this.className=\'smallgraytextnolink\';" onmouseover="this.className=\'smallgraytext\'; return true;">';
				htmlCodeStr += TRANS_UI_CS_Library.LABEL_PROMO_OFFER;
				htmlCodeStr += '</a>';
			}
			else{
				htmlCodeStr += '&nbsp;';	
			}

			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="float:left; margin: 0 5px 0 0">';
			var offerAmount = offerObj.amount == null || offerObj.amount == -1 ? '' : offerObj.amount;
			htmlCodeStr += '<input id="'+ divName + '_amount' +'" type="text" class="inputrt" value="' + offerAmount + '"/>';
			htmlCodeStr += '</div>';
			htmlCodeStr += '<div style="float:left;">';
			htmlCodeStr += '<select class="inputreq" id="'+ divName + '_typeId' +'" name="promo_offer_type">';

			if(currencyList.length != 0){
				for(var j = 0; j < currencyList.length; j++){
					var currValue = currencyList[j].value;
					var currText = currencyList[j].text;					

					if(offerObj.currencyId == currValue) {
						htmlCodeStr += '<option value="'+ currValue +'" selected>'+ currText +'</option>';	
					}
					else{
						htmlCodeStr += '<option value="'+ currValue +'">'+ currText +'</option>';
					}
				}
			}
			else{
				htmlCodeStr += '<option value="'+ 1 +'">'+ TRANS_UI_CS_Library.LABEL_FLAT_AMOUNT +'</option>';
			}

			htmlCodeStr += '</select>';
			htmlCodeStr += '</div>';

			if(i != 0){
				htmlCodeStr += '<div style="float:left;">';
				htmlCodeStr += '<a class="smallgraytextnolink" href="javascript:deleteAnotherPromoOffer(\''+ divName +'\');" style="margin: 2 0 0 5px;">' + TRANS_UI_CS_Library.LABEL_REMOVE + '</a>';
				htmlCodeStr += '</div>';
			}	

			htmlCodeStr += '<div style="clear:both;"></div>';
			htmlCodeStr += '</div>';
		}

		htmlCodeStr += '<div>'; // start of Add Another div

		if(promotionalOffers.length < currencyList.length){
			htmlCodeStr += '<a class="smallgraytextnolink" href="javascript:addAnotherPromoOffer();" style="margin: 0 0 0 115px;">' + TRANS_UI_CS_Library.LABEL_ADD_ANOTHER + '</a>';	
		}

		htmlCodeStr += '</div>'; // end of Add Another div
	}

	$('#promo_offer_div').html(htmlCodeStr);


	$('select[id$="_typeId"][name="promo_offer_type"]').change(function() {
		populatePromoOffers();
		renderPromotionalOffers();
	});

	$('select[id$="_typeId"][name="promo_offer_type"]').each(function(index, elem) {
		var selectId = $(elem).attr('id');

		var selectedValue = $('#' + selectId + ' option:selected').val();
		renderPromoOfferDropdown(selectId, selectedValue);		
	});
}

function renderLimitDropdown(exceptId, optionValue){
	$('select[id$="_typeId"][name="limit_type"]').each(function(index) {
		var selectId = $(this).attr('id');

		if(selectId != exceptId){
			$('#' + selectId + ' option[value="' + optionValue + '"]').remove();
		}		
	});
}

function renderPromoOfferDropdown(exceptId, optionValue){
	$('select[id$="_typeId"][name="promo_offer_type"]').each(function(index, source) {
		var selectId = $(source).attr('id');

		if(selectId != exceptId){
			$('#' + selectId + ' option[value="' + optionValue + '"]').remove();
		}		
	});
}

function renderDiscountType(){
	// set Discount Type
	for(var i = 0; i < discountType.length; i++){
		if(discountType[i].discountType != -1){
			$('#promo_discount_' + discountType[i].discountType).attr('checked', true);
		}
	}
}

function renderShippingOffer(){
	if($('input:radio[name=disc_type]:checked').val() == 'percent'){		
		$('#promo_shipping_offer_div_percent_0_percent').attr('disabled', false);
		var divCount = $('#promo_shipping_offer_amount > div');
		for(var i = 0; i < divCount.length - 1; i++){
			$('#promo_shipping_offer_div_amount_' + i + '_amount').attr('disabled', true);
			$('#promo_shipping_offer_div_amount_' + i + '_currency').attr('disabled', true);
		}
		// $('a').hide();
		if($('#promo_shipping_offer_div_percent_0_percent').val() == ''){
			renderSelectedOffers('percent');
		}
	}

	if($('input:radio[name=disc_type]:checked').val() == 'amount'){
		var clear = true;
		$('#promo_shipping_offer_div_percent_0_percent').attr('disabled', true);
		var divCount = $('#promo_shipping_offer_amount > div');
		for(var i = 0; i < divCount.length - 1; i++){
			$('#promo_shipping_offer_div_amount_' + i + '_amount').attr('disabled', false);		
			$('#promo_shipping_offer_div_amount_' + i + '_currency').attr('disabled', false);
			if($('#promo_shipping_offer_div_amount_' + i + '_amount').val() != ''){
				clear = false;
			}
		}
		// $('a').show();
		if(clear){
			renderSelectedOffers('amount');
		}
	}

	// bind this onclick event once.
	if ($('input:radio[name=disc_type]').data('events') == undefined) {
		$('input:radio[name=disc_type]').click( function(event) {
			// initialize Shipping Offers
			shippingOffer = new Array();
			obj = new ShippingOfferModel();
			shippingOffer.push(obj);
			renderShippingOffer();
		});
	}
}

function renderShippingMethod(){	// populate Shipping Method
	for(var i = 0; i < shippingMethod.length; i++){
		$('#promo_shipping_method').val(shippingMethod[i].shippingMethod);
	}
}

function renderSelectedOffers(discType){
	var htmlCodeStr = '';
	for(var i = 0; i < shippingOffer.length; i++){
		var offerObj = shippingOffer[i];

		var divName = 'promo_shipping_offer_div_' + discType + '_' + i;

		htmlCodeStr += '<div id="' + divName + '">';

		var offerAmount = offerObj.amount == null || offerObj.amount == -1 ? '' : offerObj.amount;
		htmlCodeStr += '<input id="'+ divName + '_' + discType +'" class="inputrt" type="text"  style="margin: 0 0 8 5px;"  value="' + offerAmount + '"/>';

		if(discType == 'amount'){
			htmlCodeStr += '<select id="'+ divName + '_currency' +'" class="inputreq" style="margin: 0 0 8 5px; height: 19px; width: 47px; border: 1px solid #D5DEE7;">';

			for(var j = 0; j < currencyList.length; j++){
				var currValue = currencyList[j].value;
				var currText = currencyList[j].text;

				if(offerObj.currencyId == currValue) {
					htmlCodeStr += '<option value="'+ currValue +'" selected>'+ currText +'</option>';
				}
				else{
					htmlCodeStr += '<option value="'+ currValue +'">'+ currText +'</option>';
				}
			}

			htmlCodeStr += '</select>';
			if(shippingOffer.length - 1 > 0){
				htmlCodeStr += '<a href="javascript:deleteOffer(\''+ divName +'\');" class="smallgraytextnolink" style="cursor: pointer; display: inline; margin: 2 0 0 0px;">' + TRANS_UI_CS_Library.LABEL_REMOVE + '</a>';
			}
			htmlCodeStr += '<div style="clear:both;"></div>';
		}
		htmlCodeStr += '</div>';
	}

	if(discType == 'percent'){
		$('#promo_shipping_offer_percent').html(htmlCodeStr);
	}

	if(discType == 'amount'){
		htmlCodeStr += '<div id="promo_shipping_offer_add_another">'; // start of Add Another div

		if(shippingOffer.length < currencyList.length){
			htmlCodeStr += '<a href="javascript:addAnotherOffer();" class="smallgraytextnolink" style="cursor: pointer; display: inline;">' + TRANS_UI_CS_Library.LABEL_ADD_ANOTHER + '</a>';
		}

		htmlCodeStr += '</div>'; // end of Add Another div

		$('#promo_shipping_offer_amount').html(htmlCodeStr);

		$('select[id$="_currency"]').change(function() {
			populateSelectedOffers();
			renderSelectedOffers('amount');
		});

		$('select[id$="_currency"]').each(function(index, elem) {
			var exceptId = $(elem).attr('id');
			var selectedValue = $('#' + exceptId + ' option:selected').val();

			$('select[id$="_currency"]').each(function(index, elem) {
				var selectId = $(elem).attr('id');

				if(selectId != exceptId){
					$('#' + selectId + ' option[value="' + selectedValue + '"]').remove();
				}
			});
		});
	}
}

function addAnotherOffer(rowCount){
	populateSelectedOffers();
	var obj = new ShippingOfferModel();
	shippingOffer.push(obj);
	renderSelectedOffers('amount');
}

function deleteOffer(divName){
	$('#'+divName + '').remove();
	populateSelectedOffers();
	renderSelectedOffers('amount');
}

function populateDiscountType(){
	discountType = new Array();

	var obj = new DiscountTypeModel();
	obj.discountType = $('input:radio[name=disc_type]:checked').val();
	discountType.push(obj);
}

function populateSelectedOffers(){
	if($('input:radio[name=disc_type]:checked').val() == 'percent'){
		shippingOffer = new Array();
		var obj = new ShippingOfferModel();
		obj.amount = $('#promo_shipping_offer_div_percent_0_percent').val();
		shippingOffer.push(obj);
	}

	if($('input:radio[name=disc_type]:checked').val() == 'amount'){
		var divCount = $('#promo_shipping_offer_amount > div');

		shippingOffer = new Array();

		divCount.each(function(index, elem){
			var divName = $(elem).attr('id');

			if(index != divCount.length -1){
				var obj = new ShippingOfferModel();
				obj.currencyId = $('#' + divName + '_currency').val();
				obj.amount = $('#' + divName + '_amount').val();
				obj.currencyLabel = $('#' + divName + '_currency option:selected').text();
				shippingOffer.push(obj);
			}
		});
	}
}

function populateShippingMethod(){
	shippingMethod = new Array();

	var obj = new ShippingMethodModel();

	$('#promo_shipping_method :selected').each(function(i, selected){
		obj.shippingMethod[i] = $(selected).val();
		obj.shippingMethodLabel[i] = $(selected).text();
	});
	shippingMethod.push(obj);
}

function cancelShippingDiscount(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function saveShippingDiscount(){

	var isValid = validateShippingEntries();

	if(isValid){
		populateDiscountType();
		populateSelectedOffers();
		populateShippingMethod();

		var shippingModel = new ShippingModel();
		shippingModel.discountType = discountType;
		shippingModel.shippingOffer = shippingOffer;
		shippingModel.shippingMethod = shippingMethod;

		window.parent.AdvPromo.PromotionCs.renderShippingSublist(shippingModel);
		window.parent.AdvPromo.PromotionCs.flagChanged();

		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();
	}
}

function validateShippingEntries(){
	var ret = true;
	var error = '';

	var discType = $('input:radio[name=disc_type]:checked').val();

	var inputCount = $('input[id^="promo_shipping_offer_div_'+ discType +'_"]');

	for(var i = 0; i < inputCount.length; i++){
		var currentDiv = $('#promo_shipping_offer_div_' + discType + '_' + i + '_' + discType);
		if(currentDiv.val() == null || currentDiv.val() == ''){	//Mandatory
			error = 'Please enter value(s) for: ' + $('input:radio[name=disc_type]:checked + label').text();
			ret = false;
		}else if(!$.isNumeric(currentDiv.val())){	//Numeric
			error = 'Invalid ' + $('input:radio[name=disc_type]:checked + label').text() + ' value. Values must be numbers.';
			ret = false;
		}else if( discType == 'percent' && (currentDiv.val() > 100 || currentDiv.val() <= 0)){	//Percent Range 
			error = 'Invalid ' + $('input:radio[name=disc_type]:checked + label').text() + ' value. Values must be greater than zero and must not exceed 100.';
			ret = false;
		}else if(discType == 'amount' && currentDiv.val() <= 0){	//Less than 0
			error = 'Invalid ' + $('input:radio[name=disc_type]:checked + label').text() + ' value. Values must be greater than zero';
			ret = false;
		}
		if(ret == false){
			currentDiv.focus();
			break;
		}
	}

	if($('#promo_shipping_method').val() == null || $('#promo_shipping_method').val() == ''){
		error = 'Please select at least one ' + $('#promo_shipping_method_div').text() + ' from the list';
		ret = false;
	}

	if(ret == false){
		alert(error);
	}

	return ret;
}

function renderSublistModel(){
	var tableId = 'custpage_advpromo_discount_list';

	subListModel = new Array();

	if(orderDiscountSublist != null && orderDiscountSublist!= ''){
		for(var i = 0; i < orderDiscountSublist.length; i++){
			subListModel.push({
				"name":orderDiscountSublist[i].name,
				"promotionalOffer":orderDiscountSublist[i].promotionalOffer,
				"limit":(orderDiscountSublist[i].limit == null)? ' ':orderDiscountSublist[i].limit,
				"previewLink": (orderDiscountSublist[i].previewLink == null)? ' ':orderDiscountSublist[i].previewLink,
				"editLink": orderDiscountSublist[i].editLink,
				"deleteLink": orderDiscountSublist[i].deleteLink
			});
		}
	}

	// special handling for tiered order spec shipping discount
	// push order discounts into subListModel first before pushing shipping discounts
	// otherwise existing order discounts will be erased from the sublist view
	if(nlapiGetFieldValue('custrecord_advpromo_is_tiered') == 'T'){
		
		try{
			
			for(var i = 0; i < tiers.length; i++){// traverse list of tiers
				
				// set default values (case: no order discounts defined yet)
				var promotionalOffer = TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE;
				var limit = TRANS_UI_CS_Library.TEXT_NOLIMIT;
				var editLink = '';
				
				// check and get oder discount values
				var orderDiscounts = tiers[i].disc;// get list of order discounts for current tier
				if(orderDiscounts != null){// only update values if there are defined order discounts, else push the default values
				
					// build content for Promotional Offer and Discout Up To (limit) columns
					for (var j = 0; j < orderDiscounts.length; j++){// traverse list of order discounts
						
						var orderDiscount = orderDiscounts[j];// get current order discount
						if(orderDiscount.ocur == ''){// promo offer is NOT in currency (promo offer is %)
							
							promotionalOffer = orderDiscount.offer + ' %';
							// check if there are limit definitions before updating default value (NONE)
							if(orderDiscount.lcur != ''){
								var currentLimit = orderDiscount.limit + ' ' + getCurrencySymbol(orderDiscount.lcur);// getCurrencySymbol method accessed from AdvPromo_CS_OrderSpecificEntryForm
								limit = limit == TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NOLIMIT ? currentLimit : limit + ' or ' + currentLimit;// add 'or' after consecutive currencies after the first currency
							}
							
						}else{// promo offer is in currency
							
							var currency = orderDiscount.offer + ' ' + getCurrencySymbol(orderDiscount.ocur);// getCurrencySymbol method accessed from AdvPromo_CS_OrderSpecificEntryForm
							promotionalOffer = promotionalOffer == TRANS_CS_IS_OrderSpecificEntryForm.TEXT_NONE ? currency : promotionalOffer + ' or ' + currency;// add 'or' after consecutive currencies after the first currency
						
						}
					}
					
					// build content for Edit column, only display this link along with Tier 1
					editLink = i == 0 ? makeLink('E', i, i, 43, tableId) : editLink;
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
	
	if(orderShippingSublist != null && orderShippingSublist!= ''){
		for(var i = 0; i < orderShippingSublist.length; i++){
			subListModel.push({
				"name":orderShippingSublist[i].name,
				"promotionalOffer":orderShippingSublist[i].promotionalOffer,
				"limit":TRANS_UI_CS_Library.TEXT_NOLIMIT,
				"previewLink": (orderShippingSublist[i].previewLink == null)? ' ':orderShippingSublist[i].previewLink,
				"editLink":makeDiscountLink(2, 'editShippingDiscount'),
				"deleteLink":makeDiscountLink(2, 'deleteShippingDiscount')
			});
		}
	}
	//following the existing logic, isfshipping will always be the last item on sublist. order discount is always first.
	//TODO: refactor codes for better handling of future expansions.
	if(isfShippingSublist != null && isfShippingSublist!= ''){
		for(var i = 0; i < isfShippingSublist.length; i++){
			subListModel.push({
				"name":isfShippingSublist[i].name,
				"promotionalOffer":isfShippingSublist[i].promotionalOffer,
				"limit":TRANS_UI_CS_Library.TEXT_NOLIMIT,
				"previewLink": (isfShippingObj.searchId == null)? ' ':makeLink('P', (1), isfShippingObj.searchId, 'Item'),
				"editLink": makeDiscountLink(3, 'editisfShippingDiscount'),
				"deleteLink": makeDiscountLink(3, 'deleteisfShippingDiscount')
			});
		}
	}
	
	//	clear sublist first
	clearDiscountSublist();
	for(var i = 0; i < subListModel.length; i++){
		var rowName = subListModel[i].name;
		var rowPromoOffer = subListModel[i].promotionalOffer;
		var rowLimit = subListModel[i].limit;
		var rowPreviewLink = subListModel[i].previewLink;
		var rowEditLink = subListModel[i].editLink;
		var rowDeleteLink = subListModel[i].deleteLink;
		addRow(tableId, [rowName, rowPromoOffer, rowLimit, rowPreviewLink, rowEditLink, rowDeleteLink]);
	}
}


var elligbleOrders = [];
var eligOrderPass = null;

function setEligOrder(order) {
	eligOrderPass = order;
}

function getEligOrder() {
	var retVal = eligOrderPass;
	eligOrderPass = null; 
	return retVal;
}
function renderEligibleOrders(type) {
	if ((type == 'edit')||(type == 'view')) {
		var orders = JSON.parse(nlapiGetFieldValue('custpage_advpromo_discount_json_order'));
		if (!(orders instanceof Array)) return;
		for (var i = 0; i < orders.length; i++) { 
			addRowOrderTab(orders[i]);
		}
	}
}

function addRowOrderTab(values) {
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
	if ( (rows == 1) && (!(firstRow.attr('id'))) ) {
		firstRow.remove();
		rows = 0;
	}

	var previewAnch = (objCopy.savedSearch) ? 	makeLink('P', (rows), objCopy.savedSearch ,orderType, sublistName, objCopy) : '';
	var deleteAnch = makeLink('D', (rows), objCopy.id, orderType, sublistName, objCopy);
	var editAnch = makeLink('E', (rows), objCopy.id,orderType, null, objCopy );

	// We need to convert *convert* values to an array because passing objects between parent
	// and child window does not preserve its type.
	// That is Array instance on popup is detected as Object only on parent Window
	var sublistData = [objCopy.label, objCopy.description, previewAnch, editAnch, deleteAnch];

	// for (var i = 0; i < values.length; i++) toSend.push(values[i]);

	elligbleOrders.push(objCopy);

	addRow(sublistName, sublistData);

}

function editRowOrderTab(values) {
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

	var previewAnch = (objCopy.savedSearch) ? 	AdvPromo.PromotionCs.makeLink('P', (row), objCopy.savedSearch ,orderType, sublistName, objCopy) : '';
	var deleteAnch = AdvPromo.PromotionCs.makeLink('D', (row), objCopy.id, orderType, sublistName, objCopy);
	var editAnch = AdvPromo.PromotionCs.makeLink('E', (row), objCopy.id,orderType, null, objCopy );

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
		for (var i=0; elligbleOrders.length; i++ ) {
			if (elligbleOrders[i].id == objCopy.id) {
				elligbleOrders[i] = objCopy;
				found = true;
				break;
			}
		}
		if (!found) elligbleOrders.push(objCopy);
	}
	window.parent.AdvPromo.PromotionCs.flagChanged();

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
//dudai 
function retrieveText(list, key){
	for( var i = 0; i < list.length; i++){
		if(list[i].value == key){
			return list[i].text;
		}
	}

	return null;
}

/*	validateDiscountItemFields
 *  - validate Item Specific Promotion->Discount->Item and Item Saved Search
 */
function validateDiscountItemFields(fields) {
	var i;

	for (i = 0; i < fields.length; i++) {
		// mandatory
		if (fields[i].value == '' || fields[i].value == null) {
            alert(TRANS_UI_CS_Library.ERROR_OFFER_ENTER);
            return false;
		}
        
		// input should be numeric
		if (isNaN(fields[i].value)) {
			alert(TRANS_UI_CS_Library.ERROR_OFFER_NAN);
			return false;
		}

        if (fields[i].key == 0) {
            // handle percentage input
			if (fields[i].value <= 0 || fields[i].value > 100) {
				alert(TRANS_UI_CS_Library.ERROR_OFFER_RANGE_PCNT);
				return false;
			}
		}
        else {
            // handle currency input
            if (fields[i].value <= 0) {
				alert(TRANS_UI_CS_Library.ERROR_OFFER_RANGE);
				return false;
			}
        }
	}
	return true;
}

function validatePercentFields(fields) {
	var i;

	for (i = 0; i < fields.length; i++) {
        if (fields[i] == '' || fields[i] == null) {
            alert(TRANS_UI_CS_Library.ERROR_OFFER_ENTER);
            return false;
        }
		
		// input should be numeric
		if (isNaN(fields[i])) {
			alert(TRANS_UI_CS_Library.ERROR_OFFER_NAN);
			return false;
		}

		if(fields[i] <= 0 || fields[i] > 100) {
			alert(TRANS_UI_CS_Library.ERROR_OFFER_RANGE_PCNT);
			return false;
		}
	}
	
	return true;
}

function validateLimitEntries(fields) {
	if (fields instanceof Array) { // limit is in currency
		for (var i = 0; i < fields.length; i++) {
			// input should be numeric
			if (isNaN(fields[i].value)) {
				alert(TRANS_UI_CS_Library.ERROR_AMOUNT_NAN);
				return false;
			}
			if (fields[i].value <= 0 && fields[i].value != "") {
				alert(TRANS_UI_CS_Library.ERROR_AMOUNT_RANGE);
				return false;
			}
		}
	}
    else { // limit is in units
		// input should be numeric
		if (isNaN(fields)) {
			alert(TRANS_UI_CS_Library.ERROR_LIMIT_NAN);
			return false;
		}
		if (fields < 1 && fields!="") {
			alert(TRANS_UI_CS_Library.ERROR_LIMIT_RANGE);
			return false;
		}
	}
	return true;
}