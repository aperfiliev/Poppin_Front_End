/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Jan 2012     adimaunahan
 *                            rwong
 */

/**
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @return {void}
 */
var mainModel;
var debugDetailMsg;
var errorModel;

var CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH = '1';
var CONST_ELIGIBLE_ORDER_TYPE_ITEM = '2';
var CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS = '3';

var CONST_ELIGIBLE_CUSTOMER_TYPE_SAVED_SEARCH = '1';
var CONST_ELIGIBLE_CUSTOMER_TYPE_ID = '2';

var CONST_APPLY_CUSTOMER_CRITERIA_ANY = '1';
var CONST_APPLY_CUSTOMER_CRITERIA_ALL = '2';

var CONST_APPLY_ORDER_CRITERIA_ANY = '1';
var CONST_APPLY_ORDER_CRITERIA_ALL = '2';

var CONST_DISCOUNT_TYPE_ITEM = '1';
var CONST_DISCOUNT_TYPE_ORDER = '2';
var CONST_DISCOUNT_TYPE_SHIPPING = '3';
var CONST_DISCOUNT_TYPE_FIXED_PRICE = '4';
var CONST_DISCOUNT_TYPE_ITEM_SPEC_FREE_SHIPPING = '5';

var CONST_DISCOUNT_ITEM_ADD_TYPE_SAVED_SEARCH = '1';
var CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM = '2';

var CONST_FREE_SHIPPING_TYPE_ITEM = '1';
var CONST_FREE_SHIPPING_TYPE_ITEM_SEARCH = '2';

var NLClass = function(args) {
	var klass = function() {
		return (this.initialize) ? this.initialize.apply(this, arguments) : this;
	};
	for (var key in args) klass.prototype[key] = args[key];
	return klass;
};

var AdvPromoPromotionInputModel = function (promotionsInput){
	var promotionId = promotionsInput.getPromotionId();
	var customerId = promotionsInput.getCustomerId();
	var currencyId = promotionsInput.getCurrencyId();
	var itemsAmount = promotionsInput.getItemsAmount();
	var transactionDate = promotionsInput.getTransactionDate();
	var selectedShippingItemId = promotionsInput.getSelectedShippingItemId();
	var itemLines = generateItemLinesModel(promotionsInput);
	var shippingItems = generateShippingItemModel(promotionsInput);
	var subsidiaryId = promotionsInput.getSubsidiaryId();
	var siteId = promotionsInput.getSiteId();
	
	/* public */
	function getPromotionId(){
		return promotionId;
	}
	
	function getCustomerId(){
		return customerId;
	}
	
	function getCurrencyId(){
		return currencyId;
	}
	
	function getItemsAmount(){
		return itemsAmount;
	}
	
	function getItemsQuantity(){
		var totalQuantity = 0;
		
		for (var i = 0; i < itemLines.length; i++) {
			totalQuantity += itemLines[i].getQuantity();
		}
		
		return totalQuantity;
	}
	
	function getTransactionDate(){
		return transactionDate;
	}
	
	function getSelectedShippingItemId(){
		return selectedShippingItemId;
	}
	
	function getItemLines(){
		return itemLines;
	}
	
	function getShippingItems(){
		return shippingItems;
	}
	
	function getSubsidiaryId(){
		return subsidiaryId;
	}
	
	function getSiteId(){
		return siteId;
	}
	
	/* private */
	function generateItemLinesModel(promotionsInput){
		var ret = [];
		
		var arr = promotionsInput.getItemLines();
		if(arr){
			for(var i = 0; i < arr.length; i++){
				ret.push(new AdvPromoPromotionItemLineModel(arr[i]));
			}	
		}
		
		return ret;
	}
	
	function generateShippingItemModel(promotionsInput){
		var ret = [];
		
		var arr = promotionsInput.getShippingItems();
		if(arr){
			for(var i = 0; i < arr.length; i++){
				ret.push(new AdvPromoPromotionShippingLineModel(arr[i]));
			}	
		}
		
		return ret;
	}
	
	return {
		getPromotionId: getPromotionId,  
		getCustomerId: getCustomerId, 
		getCurrencyId: getCurrencyId,
		getItemsAmount: getItemsAmount,
		getItemsQuantity: getItemsQuantity,
		getTransactionDate: getTransactionDate, 
		getSelectedShippingItemId: getSelectedShippingItemId, 
		getItemLines: getItemLines, 
		getShippingItems: getShippingItems,
		getSubsidiaryId: getSubsidiaryId,
		getSiteId: getSiteId 
    };
};

var AdvPromoPromotionItemLineModel = function (itemLine){
	var lineNum = itemLine.getLineNum();
	var itemType = itemLine.getItemType();
	var itemId = itemLine.getItemId();
	var quantity = itemLine.getQuantity();
	var amount = itemLine.getAmount();
	
	function getLineNum(){
		return lineNum;
	}
	
	function getItemType(){
		return itemType;
	}
	
	function getItemId(){
		return itemId;
	}
	
	function getQuantity(){
		return quantity;
	} 
	
	function getAmount(){
		return amount;
	}
	
	return {
		getLineNum: getLineNum,
		getItemType: getItemType,
		getItemId: getItemId,
		getQuantity: getQuantity,
		getAmount: getAmount
	};
};

var AdvPromoPromotionShippingLineModel = function (shippingInfo){
	var shippingId = shippingInfo.getShippingItemId();
	var shippingCost = shippingInfo.getShippingCost();
	var handlingCost = shippingInfo.getHandlingCost();
	
	function getShippingItemId(){
		return shippingId;
	}
	
	function getShippingCost(){
		return shippingCost;
	}
	
	function getHandlingCost(){
		return handlingCost;
	}
	
	return {
		getShippingItemId: getShippingItemId,
		getShippingCost: getShippingCost,
		getHandlingCost: getHandlingCost
	};
};

var MainModel = new NLClass({
	initialize : function () {
		this.promoRecord = null;
		this.lineItemItemIds = new Array(); // array of item Ids
		this.eligibleOrders = new Array(); // array of EligibleOrderModel
		this.eligibleCustomers = new Array(); // array of EligibleCustomerModel
		this.promotionDiscountModel = new Array(); // array of PromotionDiscountModel
		this.discountItemId = 0;
		this.isApplyAnyOrderCriteria = null; // CONST_APPLY_ORDER_CRITERIA_ANY, CONST_APPLY_ORDER_CRITERIA_ALL
		this.isApplyAnyCustomerCriteria = null; // CONST_APPLY_CUSTOMER_CRITERIA_ANY, CONST_APPLY_ORDER_CRITERIA_ALL
		this.lineItemModel = new Array(); // array of SortedLineItemModel (no sorting though)
		this.shippingDiscountModels = new Array(); // array of ShippingDiscountModel
		this.isfsDiscountModel = null; // instance of ShippingDiscountModel
		this.startDate = null;
		this.endDate = null;
		this.siteId = new Array(); //array of site Ids
		this.subsidiaryId = new Array; //array of subsidiary Ids
		this.promotionTierModels = new Array(); // array of PromotionTierModel
		this.isTiered = false;
		this.eligibilityCriteriaModel = null; // instance of OrderEligibilityCriteriaModel
		this.hasNoEligibilityCriteria = false;
		this.hasEligibilityCurrency = false;
		this.discountHighestPriceFirst = false;
	}
});

var EligibleOrderModel = new NLClass({
	initialize : function (id, type, eligibleItemIds) {
		this.id = id; // id is the internal id in Eligible Order
		this.type = type; // CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH, CONST_ELIGIBLE_ORDER_TYPE_ITEM
		this.eligibleItemIds = eligibleItemIds; // array of item Ids
		this.minPurchase = 0; 
		this.isUnit = 'T'; // 'T', 'F'
		this.savedSearchId = null;
		this.actualPurchase = 0;
		this.eligibleItemIdsInItemMachine = new Array(); // array of item Ids
		this.passed = false;
		this.remainingEligibleItemsForBxGy = 0;
	}
});

var EligibleCustomerModel = new NLClass({
	initialize : function () {
		this.id = -1; 
		this.type = -1; // CONST_ELIGIBLE_CUSTOMER_TYPE_SAVED_SEARCH, CONST_ELIGIBLE_CUSTOMER_TYPE_ID
		this.eligibleIds = new Array(); // array of customer Ids
		this.group = null;
	}
});

var PromotionDiscountModel = new NLClass({
	initialize : function () {
		this.id;
		this.type;
		this.isPercent; // 'T', 'F'
		this.amount;
		this.isUnit; // 'T', 'F'
		this.limit;
		this.isFixedPrice = false; // true, false
	}
});

var SortedLineItemModel = new NLClass({
	initialize : function (lineItemNum, itemId, quantity, itemTotalAmount, itemType) {
		this.lineItemNum = lineItemNum;   
		this.itemId = itemId; 
		this.quantity = quantity;
		this.itemTotalAmount = itemTotalAmount; 
		this.hasEligibility = 'F'; // 'T', 'F'
		this.hasDiscount = 'F'; // 'T', 'F'
		this.eligModelIndex = -1;
		this.discModelIndex = -1;
		this.type = itemType;
	}
});

var ShippingDiscountModel = new NLClass({
	initialize : function () {
		this.shippingCost = 0;
		this.handlingCost = 0; // not yet used. for future implementation
		this.shippingMethodId = -1; 
		this.finalShippingCost = -1; 
		this.applyToSelectedMethod = 'F'; // 'T', 'F'
		this.isPercent = 'F'; // 'T', 'F'
	}
});

var ItemSpecificFreeShippingDiscountModel = new NLClass({
	initialize : function () {
		this.type = null; // CONST_FREE_SHIPPING_TYPE_ITEM or CONST_FREE_SHIPPING_TYPE_ITEM_SEARCH
		this.itemIds = []; // array of ints
		this.savedSearchId = '';  // int
		this.shippingMethodIds = []; // array of ints
	}
});

var ErrorModel = new NLClass({
	initialize : function () {
		this.failedMinimumPurchase = null;
		this.failedSite = null;
		this.failedSubsidiary = null;
	}
});

var PromotionTierModel = new NLClass({
	initialize : function () {
		this.tierId;
		this.eligibilityType;
		this.eligibilityItem = new Array(); // an array of item IDs
		this.eligibilitySavedSearchId; // 
		this.eligibilityAmount;
		this.eligibilityCurrency = null;
		this.discountType;
		this.discountItemAddType; 
		this.discountItem = new Array(); // an array of item IDs
		this.discountSavedSearchId;
		this.discountOfferAmount;
		this.discountOfferCurrency = null;
		this.discountLimitAmount;
		this.discountLimitCurrency = null;		
	}
});

var OrderEligibilityCriteriaModel = new NLClass({
	
	initialize : function (numCriteria) {
		this.criteria = new Array(numCriteria); // an array for each criterion
		this.numberOfCriteria = numCriteria;
		this.eligibleItems = new Array(); // array of all line items that are eligible under at least one criteria. This is populated by addEligibleItem()
		this.numberOfEligibleItems = 0;
		
		for (var i=0; i < this.numberOfCriteria; i++){
			this.criteria[i] = new Array(); // each criterion has an array of items IDs. This is populated by addEligibleItem()
		}
	},
		
	/**
	 * @param itemId {Number} the item internal id
	 * @param nthCriterion {Number} this is the nth order eligibility criteria in the list (value should be 0 - n)
	 */
	addEligibleItem : function(itemId, nthCriterion){
		// key is item id preceded by the string item e.g. item125
		var key = 'item'+itemId;
		//map item to criterion
		this.criteria[nthCriterion][key] = itemId;
		
		//add item to eligibleItems
		if (this.eligibleItems[key] == null)
		{
			this.eligibleItems[key] = new Array();
			this.eligibleItems[key]['totalQty'] = 0;
			this.eligibleItems[key]['totalAmt'] = 0;
			this.numberOfEligibleItems++;
		}
	},
	
	/**
	 * 
	 * @param nthCriteria {Number} this is the nth order eligibility criterion in the list (index starts at 0)
	 * @param isUnit {Boolean} true, if quantity should be computed; false, if amount (currency) should be computed
	 * @returns {Number} could either be total amount or total quantity for the eligible items for this criterion
	 */
	getEligibleOrderTotal : function(nthCriteria, isUnit){
		var totalAmount = 0; // can be currency or quantity
		
		// go through each eligible line item for this criteria and compute total
		for (var key in this.criteria[nthCriteria]){
			//nlapiLogExecution('DEBUG', 'calculateTotal:' + key, this.eligibleItems[key]['totalQty'] + '; ' + this.eligibleItems[key]['totalAmt']);
			
			if(isUnit){
				totalAmount += this.eligibleItems[key]['totalQty'];
			}
			else{
				totalAmount += this.eligibleItems[key]['totalAmt'];
			}
		}
		return totalAmount;
	}
	
});

var DiscountCriteriaModel = function (){
	var savedSearches = {};
	var discountableIds = new Array();
	
	/* public */
	function mapItemsToSavedSearch(itemIds, savedSearchIds){
		if(savedSearchIds){
			for(var i = 0; i < savedSearchIds.length; i++){
				var ssid = savedSearchIds[i];
				
				// check if itemIds is an array and not empty

				var filters = new Array();
				filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', itemIds);
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('itemid');

				var searchObj = nlapiLoadSearch('item', ssid);
				searchObj.addFilters(filters);
				searchObj.addColumns(columns);
				var searchResult = searchObj.runSearch();
				var res = searchResult.getResults(0, itemIds.length);
				
				savedSearches[ssid] = new Array();
				if(res){
					for(var j = 0; j < res.length; j++){
						savedSearches[ssid].push(parseInt(res[j].getId()));
					}
				}
			}
		}
		
		generateDiscountableItems();
	}
	
	function isDiscountable(itemId){
		var ret = false;
		
		var index = discountableIds.indexOf(parseInt(itemId));
		
		if(index >= 0) ret = true; 
		
		return ret;
	}
	
	/* private */
	function stringify(obj, label){
		
		var msg = '';
		if(label) msg += label + ' = ';
	}
	
	function generateDiscountableItems(){
	
		for(var ssid in savedSearches){
			discountableIds = savedSearches[ssid];
		}
	}
	
	return {
		mapItemsToSavedSearch: mapItemsToSavedSearch,  
		isDiscountable: isDiscountable
    };
};