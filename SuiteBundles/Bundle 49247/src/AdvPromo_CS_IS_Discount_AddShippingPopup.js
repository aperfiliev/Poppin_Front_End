/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jan 2012     dembuscado
 *
 */

/**
 * @param {String} type Access mode: create, copy, edit
 * @return {void}
 */

var TRANS_CS_IS_Discount_AddShippingPopup = {};
function init_CS_IS_Discount_AddShippingPopup() {
	var translates = [];
	translates.push(new TranslateMember('label.percentoff', 'LABEL_PERCENT_OFF', 'Percent Off'));
	translates.push(new TranslateMember('label.amount.set', 'LABEL_SET_AMOUNT', 'Set Amount'));
	translates.push(new TranslateMember('text.units', 'TEXT_UNIT', 'Units'));
	translates.push(new TranslateMember('text.none', 'TEXT_NONE', '-None-'));
	translates.push(new TranslateMember('text.off', 'TEXT_OFF', 'Off'));
	translates.push(new TranslateMember('text.or', 'TEXT_OR', 'or'));
	translates.push(new TranslateMember('text.on', 'TEXT_ON', 'on'));
	translates.push(new TranslateMember('error.amount.enter', 'ERROR_AMOUNT_ENTER', 'Please enter value(s) for: amount'));
	translates.push(new TranslateMember('error.amount.nan', 'ERROR_AMOUNT_NAN', 'Invalid amount value. Values must be numbers'));
	translates.push(new TranslateMember('error.amount.range', 'ERROR_AMOUNT_RANGE', 'Invalid amount value. Values must be greater than zero.'));
	translates.push(new TranslateMember('error.percent.enter', 'ERROR_PERCENT_ENTER', 'Please enter value(s) for: percent'));
	translates.push(new TranslateMember('error.percent.nan', 'ERROR_PERCENT_NAN', 'Invalid percent value. Values must be numbers'));
	translates.push(new TranslateMember('error.percent.range', 'ERROR_PERCENT_RANGE', 'Invalid percent value. Values must be greater than zero and must not exceed 100.'));
	translates.push(new TranslateMember('error.shipping.select', 'ERROR_SHIPPING_SELC', 'Please select at least one method from the list'));
	TRANS_CS_IS_Discount_AddShippingPopup = new TranslateHelper(translates);
}
var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_IS_Discount_AddShippingPopup);
if (TranslateInit) TranslateInit();



var valueBox;
var currencyList;
function pageInit(type){
	currencyList = JSON.parse(nlapiGetFieldValue('custpage_currencies_shipping'));

	currencyList.sort(function (a, b) {
		if ((a.value == 0) && (b.value != 0)) return -1;
		else if ((a.value != 0) && (b.value == 0)) return 1;
		else if (a.text.toLocaleUpperCase() < b.text.toLocaleUpperCase()) return -1;
		else if (a.text.toLocaleUpperCase() > b.text.toLocaleUpperCase()) return 1;
		else return 0;
	});

	var theLabel = '';

	//shipping price
//	$.shippingPriceForm = new ValueUnitObject(theLabel, 'shipCurrencyUnit', 'shipAmount', 'custpage_shipping_price', currencyList);

	var selectBoxPrefix='currencyUnit', valuePrefix='amount', containerId='custpage_all_items_list2';
	$('#' + containerId).css('border-collapse', 'collapse');

	var selectOptions = currencyList;
	var selectedValues = [];
	var inputBoxValues = [];

	var theLabel = "";
	valueBox = new TextboxObject(theLabel, valuePrefix, containerId);

	var selector = new ValueUnitObject(theLabel, 'currencyUnitt', 'amountt', containerId, selectOptions);

	var theLabel1 = new LabelWithHelp(TRANS_CS_IS_Discount_AddShippingPopup.LABEL_PERCENT_OFF, 'custpage_advpromo_shipping');
	var theLabel2 = new LabelWithHelp(TRANS_CS_IS_Discount_AddShippingPopup.LABEL_SET_AMOUNT,  'custpage_advpromo_shipping');
	var labels = new ToggleLabels(theLabel1, theLabel2, '');


	$.shippingPriceForm = new Toggle(selectBoxPrefix, valuePrefix, containerId, labels, valueBox, selector);
	$.selector = selector;


	var stopper = true;
}

/*
 * 
 */
function cancelDiscountShipping(){
	var theWindow = window.parent.Ext.WindowMgr.getActive();
	theWindow.close();
}

function validateDiscountShipping(fields){
	if(fields instanceof Array){
		var size = fields.length;
		for(var i=0; i<size; i++){
			if(fields[i].value == "" || fields[i].value == null){
				alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_AMOUNT_ENTER);
				return false;
			}
			// input should be numeric
			if(isNaN(fields[i].value)){
				alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_AMOUNT_NAN);
				return false;
			}
			if(fields[i].value <= 0){
				alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_AMOUNT_RANGE);
				return false;
			}
		}
	} else {
		if(fields == "" || fields == null){
			alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_PERCENT_ENTER);
			return false;
		}
		// input should be numeric
		if(isNaN(fields)){
			alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_PERCENT_NAN);
			return false;
		}
		if(fields <= 0 || fields > 100){
			alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_PERCENT_RANGE);
			return false;
		}
	}
	return true;
}

function validateDiscountShipMethod(shipMethodIds){
	if(shipMethodIds.length == 0){
		alert(TRANS_CS_IS_Discount_AddShippingPopup.ERROR_SHIPPING_SELC);
		return false;
	}
	return true;
}

function addShippingPrice(){
	var shippingPriceList = [];
	var shippingMethod = [];

	var shipMethodIds = [];
	var shipMethodNames = [];
	var shippingObjArr = [];

	shipMethodNames = nlapiGetFieldTexts('custpage_advpromo_shipping_method_multiselect');

	shipMethodIds = nlapiGetFieldValues('custpage_advpromo_shipping_method_multiselect');

	var shipOr = "";
	var priceOr = "";
	var methodNum = shipMethodNames.length;

	shippingPriceList = $.shippingPriceForm.getValues();

	if(validateDiscountShipping(shippingPriceList) && validateDiscountShipMethod(shipMethodIds)){
		if(shippingPriceList instanceof Array){
			for (var i = 0; i < shippingPriceList.length; i++){
				var currency = shippingPriceList[i].key;

				shippingObjArr.push({"amount":shippingPriceList[i].value, "currency":currency, "isPercent":'F', "type":'3', "oper":'A'});		// shipping type is 3 in promotion discount

				var skey = parseInt(shippingPriceList[i].key);
				if(priceOr == "") {
					priceOr = shippingPriceList[i].value + " " + retrieveText(currencyList, skey);
				}else{ 
					priceOr = priceOr + " " + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_OR + " " + shippingPriceList[i].value + " " + retrieveText(currencyList, skey);
				}
			}
		}else{
			priceOr = shippingPriceList + '% ' + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_OFF;
			var currency = '';
			shippingObjArr.push({"amount":shippingPriceList, "currency":currency, "isPercent":'T', "type":'3', "oper":'A'});
		}

		//disjunct shipping methods into one line
		for (var j = 0; j < methodNum; j++){
			if(shipOr == "") {
				shipOr = " " + TRANS_CS_IS_Discount_AddShippingPopup.TEXT_ON + " "  + shipMethodNames[j];
			}else{ 
				shipOr = shipOr + " / " + shipMethodNames[j];
			}
		}

		var textDisplay = priceOr + shipOr;

		window.parent.AdvPromo.PromotionCs.addShippingMethodToObject([shippingObjArr, shipMethodNames, shipMethodIds],textDisplay, 'custpage_advpromo_discount_list', 'A');// trigger adding of data to sublist
		var theWindow = window.parent.Ext.WindowMgr.getActive();
		theWindow.close();

	}
}


