
var TRANS_CS_IS_Order_Items = {};
function init_CS_IS_Order_Items() {
	var translates = [];
	translates.push(new TranslateMember('label.percentoff', 'LABEL_PERCENT_OFF', 'Percent Off'));
	translates.push(new TranslateMember('label.amount.set', 'LABEL_SET_AMOUNT', 'Set Amount'));
	translates.push(new TranslateMember('label.purchase.min', 'LABEL_MIN_PURCHASE', 'Minimum Purchase'));
	translates.push(new TranslateMember('label.item', 'LABEL_ITEMS', 'Items'));
	translates.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates.push(new TranslateMember('text.on', 'TEXT_ON', 'on'));
	translates.push(new TranslateMember('text.units', 'TEXT_UNITS', 'Units'));
	translates.push(new TranslateMember('text.order.total', 'TEXT_ORDER_TOTAL', 'Order Total'));
	translates.push(new TranslateMember('error.minpurch.enter', 'ERROR_MINPURCH_ENTER', 'Please enter value(s) for: Minimum Purchase'));
	translates.push(new TranslateMember('error.minpurch.nan', 'ERROR_MINPURCH_NAN', 'Invalid Minimum Purchase value. Values must be numbers.'));
	translates.push(new TranslateMember('error.minpurch.range', 'ERROR_MINPURCH_RANGE', 'Invalid Minimum Purchase value. Values must be between 0 to 100,000,000,000'));
	translates.push(new TranslateMember('error.elig.order.item', 'ERROR_ELIG_ORDER_ITEM', 'You have selected an item that is not a Product Item or Service Item in your selection. Please remove it to continue saving this setting.'));
	translates.push(new TranslateMember('error.item', 'ERROR_ITEM', 'Please select at least one item from the list'));
	TRANS_CS_IS_Order_Items = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_Order_Items);
if (TranslateInit) TranslateInit();

function pageInitItems(type) {
	// alert(type);
	var context = nlapiGetContext();
	var multicurrencyON = context.getFeature('MULTICURRENCY');

	//var currencyNameColumn = new nlobjSearchColumn('name');
	var currencyNameColumn = null;
	var currencySearch = null;
	var currencyList = [{"value":"0", "text":TRANS_CS_IS_Order_Items.TEXT_UNITS}];
	var id = null;
	var name = null;
	var i;
	var eligOrder = null;
	var formName = parent.nlapiGetFieldText("customform");

	if(formName != 'Buy X Get Y Promotion Form'){
		if(multicurrencyON){
			currencyNameColumn = new nlobjSearchColumn('symbol');
			var searchFilters = new Array();
			searchFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
			currencySearch = nlapiSearchRecord('currency', null, searchFilters, [currencyNameColumn]);
			
	  		// check if set manual price is on, currency list is not valid if on
			if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'F' || formName == 'Order Specific Promotion Form'){
				for ( i = 0; i < currencySearch.length; i++) {
					id = currencySearch[i].getId();
					name = currencySearch[i].getValue(currencyNameColumn);
					currencyList.push({"value":id, "text":name});
				}
			}
		}else{
//			var recCurrency = nlapiLoadRecord('currency', 1);
//			currencyList.push({"value":1, "text":recCurrency.getFieldValue('symbol')});
			if(window.parent.AdvPromo.PromotionCs.globalParam['set_manual_price'] == 'F' || formName == 'Order Specific Promotion Form'){			
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

	$('#' + containerId).css('border-collapse', 'collapse');

	var selected, values;

	// var theLabel = "Items";
	var theLabel = new LabelWithHelp('Items', 'custpage_advpromo_items');
	var selectBoxPrefix = 'custpage_items';
	var valuePrefix = null;
	var containerId = 'custpage_all_items_list';
	var itemList = JSON.parse(nlapiGetFieldValue('custpage_items'));
	var selectOptions = [];

	if (nlapiGetFieldValue('custpage_is_edit') == 'T') {
		selected = [];
		eligOrder = JSON.parse(JSON.stringify(window.parent.AdvPromo.PromotionCs.getEligOrder()));
		selected = eligOrder.items;
		$.rowRef = eligOrder.rowRef;

		// set selected items
		if(selected != null){
			nlapiSetFieldValues('custpage_advpromo_items_mselect', selected);
		}
	}


//	$.itemsSelector = new ValueUnitObject(theLabel, 'custpage_items', null, containerId, itemList, selected, null);
	$.itemsSelector = null;
//	$.itemList = itemList;


	$.currencyList = currencyList;



	if (nlapiGetFieldValue('custpage_is_edit') == 'T') {
		selected = [];
		values = [];
		// var eligOrder = JSON.parse(JSON.stringify(window.parent.AdvPromo.PromotionCs.getEligOrder()));
		if (!eligOrder) JSON.parse(JSON.stringify(window.parent.AdvPromo.PromotionCs.getEligOrder()));
		for (i = 0; i < eligOrder.minimumPurchase.length; i++) {
			// Only show contents if its not flagged for deletion
			if(eligOrder.minimumPurchase[i].remove == false){
				values.push(eligOrder.minimumPurchase[i].amount);
				selected.push(eligOrder.minimumPurchase[i].currency);
			}
		}
		if (!($.rowRef)) $.rowRef = eligOrder.rowRef;
	}



	var theLabel = new LabelWithHelp(TRANS_CS_IS_Order_Items.LABEL_MIN_PURCHASE, 'custpage_advpromo_minpurchase');
	var selectBoxPrefix='custpage_currency';
	var valuePrefix='custpage_amount';
	var containerId='custpage_all_items_list';
	var selectOptions = currencyList;

	$.selector = new ValueUnitObject(theLabel, selectBoxPrefix, valuePrefix, containerId, selectOptions, selected, values);
	$.selectorType = 2; // items
	$.eligOrder_id = eligOrder ? eligOrder.id : null;
	$.oldminimumPurchase = eligOrder ? eligOrder.minimumPurchase : [];
	$.eligOrder_group = eligOrder ? eligOrder.group : null;

	// adjust Item multiselect field's layout
	var itemMultiSelectLabel = Ext.get("custpage_advpromo_items_mselect_fs_lbl");
	var parentTd = itemMultiSelectLabel.findParent('td', 2, true);
	parentTd.setStyle('width', '100px');	
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

function getItemString(key) {
	for (var i = 0; i < $.itemList.length; i++) {
		if ($.itemList[i].value == key) return $.itemList[i].text;
	}
	return null;
}

function getMinPurchId(currency) {
	for (var i = 0; i < $.oldminimumPurchase.length; i++) {
		if ($.oldminimumPurchase[i].currency ==  currency) return $.oldminimumPurchase[i].id;
	}
	return randomString(10);
}



function addItem() {

	var MinimumPurchase = function() {
		this.id = '';
		this.amount = '';
		this.currency = ''; // 0 is units.
		this.remove = false;
	};

	var EligibleOrders = function() {
		this.id = '';
		this.type = '';
		this.items = [];
		this.savedSearch = '';
		this.label = '';
		this.description = '';
		this.group = '';
		this.minimumPurchase = [];
		this.rowRef = null;
		this.remove = false;
	};

	var orders = new EligibleOrders();

	var labeldesc = TRANS_CS_IS_Order_Items.LABEL_ITEMS + ': ';
//	var items = $.itemsSelector.getValues();
	var items = convertValueOfMultiselect(nlapiGetFieldValues('custpage_advpromo_items_mselect'));

	// check that items must be mandatory
	if(nlapiGetFieldValues('custpage_advpromo_items_mselect') == null || nlapiGetFieldValues('custpage_advpromo_items_mselect') == ''){
		alert(TRANS_CS_IS_Order_Items.ERROR_ITEM);
		return;
	}

	// check if valid items
	if(!isValidItemTypes(nlapiGetFieldValues('custpage_advpromo_items_mselect'))){
		alert(TRANS_CS_IS_Order_Items.ERROR_ELIG_ORDER_ITEM);
		return;
	}

	var currencies = $.selector.getValues();
	var isNumeric = new RegExp('^[0-9]+(\.[0-9]+)?(e(\\+|-)[0-9]+)?$');
	if ((currencies.length >= 1)) {
		for (var i = 0; i < currencies.length; i++) {
			if (!(isNumeric.test(currencies[i].value))) {
				var message = '';
				if ((currencies[i].value == '') || (currencies[i].value == null)) {
					message = TRANS_CS_IS_Order_Items.ERROR_MINPURCH_ENTER;
				} else {
					message = TRANS_CS_IS_Order_Items.ERROR_MINPURCH_NAN;
				}
				window.alert(message);
				return;
			} else {
				if (!((currencies[i].value > 0) && (currencies[i].value < 100000000000) )) {
					window.alert(TRANS_CS_IS_Order_Items.ERROR_MINPURCH_RANGE);
					return;
				} 
			}
		}
	}

	var stringVal = '';
	if ((currencies.length == 1) && (currencies[0].key == "0")) {
		stringVal = 'Minimum of ' + currencies[0].value + ' units'; 
	} else {
		stringVal = 'Minimum purchase of ';
		for (var i = 0; i < currencies.length; i++) {
			stringVal += currencies[i].value + ' ' + getCurrString(currencies[i].key);
			if (i < (currencies.length - 1)) stringVal += ' or ';
		}
	}

	for (var i = 0; i < currencies.length; i++) {
		var tmpPurch = new MinimumPurchase();
		tmpPurch.amount = currencies[i].value;
		tmpPurch.currency = currencies[i].key;
		tmpPurch.id = getMinPurchId(tmpPurch.currency);
		orders.minimumPurchase.push(tmpPurch);
	}
	var isNumeric = new RegExp("^[0-9]+$");
	for (var i = 0; i < $.oldminimumPurchase.length; i++) {
		var hasOld = false;
		for (var j = 0; j < orders.minimumPurchase.length; j++) {
			if($.oldminimumPurchase[i].currency == orders.minimumPurchase[j].currency){
				hasOld = true;
				break;
			}
		}
		if (!hasOld) {
			if (isNumeric.test($.oldminimumPurchase[i].id)) {
				$.oldminimumPurchase[i].remove = true;
				orders.minimumPurchase.push($.oldminimumPurchase[i]);
			}
		}
	}
	
	var itemDesc = nlapiGetFieldTexts('custpage_advpromo_items_mselect');	//A 20120611	
	var itemIds = nlapiGetFieldValues('custpage_advpromo_items_mselect');	//A 20120611
	var itemSelectedList = [];	//A 20120611
	
	for(var i = 0; i < itemIds.length; i++){	//A 20120611
		var id = itemIds[i];		//A 20120611
		var name = itemDesc[i];		//A 20120611
		itemSelectedList.push({"value":id, "text":name});	//A 20120611
	}	//A 20120611
	
	$.itemList = itemSelectedList;	//A 20120611

	for (var i = 0; i < items.length; i++) {
		orders.items.push(items[i].key);
		labeldesc += getItemString(items[i].key);
		if (i < (items.length - 1)) labeldesc += ' or ';
	}

	orders.type = $.selectorType;
	orders.id = ($.eligOrder_id) ? $.eligOrder_id : randomString(10); // temporary
	orders.savedSearch = $.savedSearch;
	orders.label = labeldesc;
	orders.description = stringVal;

	if (nlapiGetFieldValue('custpage_is_edit') == 'T') {
		orders.rowRef = $.rowRef;
        
        var editRowOrderTab = window.parent.AdvPromo.PromotionCs.editRowOrderTab ||
            window.parent.editRowOrderTab || editRowOrderTab;
        editRowOrderTab(orders);
	} else {
		window.parent.AdvPromo.PromotionCs.addRowOrderTab(orders);
	}

	// temporarily disable this if debugging
	window.parent.Ext.WindowMgr.getActive().close();
}