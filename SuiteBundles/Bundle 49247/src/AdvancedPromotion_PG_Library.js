/**
 * Library script for the Advanced Promotion plug-ins
 *
 * Version    Date            Author           Remarks
 * 1.00       28 Dec 2011     adimaunahan
 *                            rwong
 *
 */

var AdvPromo_PG_Library;
if(!AdvPromo_PG_Library) AdvPromo_PG_Library = {};

AdvPromo_PG_Library.CONFIG = {
		'showDebugMessages' : false
};

AdvPromo_PG_Library.Utility = function Utility(){
	var timeEntries = [];
	
	function startTime(index) {
		timeEntries[index] = Date.now();
	}
	
	function endTime(index) {
		if(timeEntries[index] != 'undefined'){
			var duration = Date.now() - timeEntries[index];
			advPromoLogger('EMERGENCY', 'Advanced Promotions', index + ': ' + duration + 'ms');
			delete timeEntries[index];
		}
	}
	
	return {
		startTime: startTime,
		endTime: endTime
    };
};

function initializeModel(promotionsInput, promotionsOutput, promoId, promoRecord){

	var itemIds = new Array(); // [34, 203, 3, 746, 200, 984, 198, 764, 9];
	var eligibleOrders = new Array(); //[34];

	mainModel = new MainModel();
	errorModel = new ErrorModel();

	var currCurrency = promotionsInput.getCurrencyId();
	var ignoreEligibilityCriteria = true; // to prevent adding additional eligibility criteria for multicurrency cases (issue 229056)

	// get all Item IDs from line items
	var itemLines = promotionsInput.getItemLines();
	for (var i = 0; i < itemLines.length; i++)
	{
		var itemLine = itemLines[i];

		itemIds.push(itemLine.getItemId());
	}
	
	// Get all Eligible Customers associated with the Promotion record
	var promoCodeIds = new Array();
	promoCodeIds.push(promoId);

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_customer_promo_code', null, 'anyof', promoCodeIds);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_advpromo_customer_cid');
	columns[1] = new nlobjSearchColumn('custrecord_advpromo_customer_type');
	columns[2] = new nlobjSearchColumn('custrecord_advpromo_customer_sid');
	columns[3] = new nlobjSearchColumn('custrecord_advpromo_customer_group');

	var eligibleCustomers = nlapiSearchRecord('customrecord_advpromo_eligible_customer', null, filters, columns);
	if(eligibleCustomers != null){
		for(var i = 0; i < eligibleCustomers.length; i++){
			var sId = eligibleCustomers[i].getValue('custrecord_advpromo_customer_sid');
			var type = eligibleCustomers[i].getValue('custrecord_advpromo_customer_type');
			var cId = eligibleCustomers[i].getValue('custrecord_advpromo_customer_cid');

			var eligibleCustomerModel = new EligibleCustomerModel();
			eligibleCustomerModel.type = type;

			switch(type){
			case CONST_ELIGIBLE_CUSTOMER_TYPE_SAVED_SEARCH:
				eligibleCustomerModel.id = sId;

				mainModel.eligibleCustomers.push(eligibleCustomerModel);
				break;
			case CONST_ELIGIBLE_CUSTOMER_TYPE_ID:

				eligibleCustomerModel.eligibleIds = new Array();

				// add to array
				var cidArr = new Array();
				if(cId != null){
					cidArr = cId.split(',');
				}	    			

				if(cidArr != null){
					for(var k = 0; k < cidArr.length; k++){
						eligibleCustomerModel.eligibleIds.push(parseInt(cidArr[k]));
					}	
				}

				mainModel.eligibleCustomers.push(eligibleCustomerModel);

				break;
			default:
				break;
			}
		}
	}

	// get all Item IDs from Eligible Orders
	promoCodeIds = new Array();
	promoCodeIds.push(promoId);

	filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_order_promo_code', null, 'anyof', promoCodeIds);
	columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_advpromo_order_label');
	columns[1] = new nlobjSearchColumn('custrecord_advpromo_order_iid');
	columns[2] = new nlobjSearchColumn('custrecord_advpromo_order_type');
	columns[3] = new nlobjSearchColumn('internalid');
	columns[4] = new nlobjSearchColumn('custrecord_advpromo_order_sid');

	// Get all Eligible Orders associated with the Promotion record
	var eligibleItemSaveSearches = nlapiSearchRecord('customrecord_advpromo_eligible_order', null, filters, columns);
	if(eligibleItemSaveSearches != null){
		var resCount = eligibleItemSaveSearches.length;

		for(var i = 0; i < resCount; i++){
			var iId = eligibleItemSaveSearches[i].getValue('custrecord_advpromo_order_iid');
			var sId = eligibleItemSaveSearches[i].getValue('custrecord_advpromo_order_sid');
			var type = eligibleItemSaveSearches[i].getValue('custrecord_advpromo_order_type');
			var id = eligibleItemSaveSearches[i].getValue('internalid');

			var eligibleOrderModel = new EligibleOrderModel();
			eligibleOrderModel.id = id;
			eligibleOrderModel.type = type;
			eligibleOrderModel.savedSearchId = sId;

			var eligibleItemIds = new Array();

			switch(type){
			case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:

				// get minimum purchase
				var eoids = new Array();
				eoids.push(id);
				filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eoids);
				columns = new Array();
				columns[0] = new nlobjSearchColumn('custrecord_advpromo_minp_amount');
				columns[1] = new nlobjSearchColumn('custrecord_advpromo_minp_currency');
				columns[2] = new nlobjSearchColumn('custrecord_advpromo_minp_is_unit');

				var minPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
				if(minPurchases != null){
					for(var j = 0; j < minPurchases.length; j++){
						var mpAmount = minPurchases[j].getValue('custrecord_advpromo_minp_amount');
						var mpCurrency = minPurchases[j].getValue('custrecord_advpromo_minp_currency');
						var mpIsUnit = minPurchases[j].getValue('custrecord_advpromo_minp_is_unit');

						if(mpIsUnit == 'T'){
							eligibleOrderModel.minPurchase = mpAmount;
							eligibleOrderModel.isUnit = mpIsUnit;
							ignoreEligibilityCriteria = false; // just to allow to add this in eligibility criteria (since it is in Unit)
							break; // just to be sure on preventing unit and currency together
						}
						else{
							// if currency, only select the current currency in Sales Order form
							if(currCurrency == mpCurrency){
								eligibleOrderModel.minPurchase = mpAmount;
								eligibleOrderModel.isUnit = mpIsUnit;
								ignoreEligibilityCriteria = false; // only add this in eligibility criteria (ignore other currencies)
								break;
							}
						}
					}
				}

				break;
			case CONST_ELIGIBLE_ORDER_TYPE_ITEM:

				// add to array
				var idArr = new Array();
				if(iId != null){
					idArr = iId.split(',');
				}	    			

				if(idArr != null){
					for(var k = 0; k < idArr.length; k++){
						eligibleItemIds.push(parseInt(idArr[k]));
					}	
				}	    			

				eligibleOrderModel.eligibleItemIds = eligibleItemIds;

				// get minimum purchase
				var eoids = new Array();
				eoids.push(id);
				filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eoids);
				columns = new Array();
				columns[0] = new nlobjSearchColumn('custrecord_advpromo_minp_amount');
				columns[1] = new nlobjSearchColumn('custrecord_advpromo_minp_currency');
				columns[2] = new nlobjSearchColumn('custrecord_advpromo_minp_is_unit');

				var minPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
				if(minPurchases != null){
					for(var j = 0; j < minPurchases.length; j++){
						var mpAmount = minPurchases[j].getValue('custrecord_advpromo_minp_amount');
						var mpCurrency = minPurchases[j].getValue('custrecord_advpromo_minp_currency');
						var mpIsUnit = minPurchases[j].getValue('custrecord_advpromo_minp_is_unit');

						if(mpIsUnit == 'T'){
							eligibleOrderModel.minPurchase = mpAmount;
							eligibleOrderModel.isUnit = mpIsUnit;
							ignoreEligibilityCriteria = false; // just to allow to add this in eligibility criteria (since it is in Unit)
							break; // just to be sure on preventing unit and currency together
						}
						else{
							// if currency, only select the current currency in Sales Order form
							if(currCurrency == mpCurrency){
								eligibleOrderModel.minPurchase = mpAmount;
								eligibleOrderModel.isUnit = mpIsUnit;
								ignoreEligibilityCriteria = false; // only add this in eligibility criteria (ignore other currencies)
								break;
							}
						}	    		    		
					}
				}

				break;
			case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:

				eligibleOrderModel.eligibleItemIds = new Array();

				// get minimum purchase
				var eoids = new Array();
				eoids.push(id);
				filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eoids);
				columns = new Array();
				columns[0] = new nlobjSearchColumn('custrecord_advpromo_minp_amount');
				columns[1] = new nlobjSearchColumn('custrecord_advpromo_minp_currency');
				columns[2] = new nlobjSearchColumn('custrecord_advpromo_minp_is_unit');

				var minPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
				if(minPurchases != null){
					for(var j = 0; j < minPurchases.length; j++){
						var mpAmount = minPurchases[j].getValue('custrecord_advpromo_minp_amount');
						var mpCurrency = minPurchases[j].getValue('custrecord_advpromo_minp_currency');
						var mpIsUnit = minPurchases[j].getValue('custrecord_advpromo_minp_is_unit');

						if(mpIsUnit == 'T'){
							eligibleOrderModel.minPurchase = mpAmount;
							eligibleOrderModel.isUnit = mpIsUnit;
							ignoreEligibilityCriteria = false; // just to allow to add this in eligibility criteria (since it is in Unit)
							break; // just to be sure on preventing unit and currency together
						}
						else{
							// if currency, only select the current currency in Sales Order form
							if(currCurrency == mpCurrency){
								eligibleOrderModel.minPurchase = mpAmount;
								eligibleOrderModel.isUnit = mpIsUnit;
								ignoreEligibilityCriteria = false; // only add this in eligibility criteria (ignore other currencies)
								break;
							}
						}	    		    		
					}
				}

				break;
			default:
				break;
			}

			// to prevent adding eligibility criteria to currencies that does not match the current SO's currency 
			if(ignoreEligibilityCriteria == false){
				eligibleOrders.push(eligibleOrderModel);	
			}			
			ignoreEligibilityCriteria = true;			
		}	
	}
	else{
		mainModel.hasNoEligibilityCriteria = true;
	}
	
	// get Shipping Model
	var shippingItems = promotionsInput.getShippingItems();
//	var selectedShippingItemId = promotionsInput.getSelectedShippingItemId();

	// set Eligible Orders
	mainModel.lineItemItemIds = itemIds;
	mainModel.eligibleOrders = eligibleOrders;
	mainModel = populatePromotionDiscountModel(promoId, promotionsInput.getCurrencyId(), mainModel);
	mainModel.lineItemModel = getSortedLineItems(promotionsInput, mainModel.discountHighestPriceFirst);

	// update Shipping Models to set their shipping and handling cost
	if(shippingItems != null){
		for(var i = 0; i < shippingItems.length; i++){

			var shippingInfo = shippingItems[i];		
			var shippingId = shippingInfo.getShippingItemId();
			var shippingCost = shippingInfo.getShippingCost();
			var handlingCost = shippingInfo.getHandlingCost();

			if(mainModel.shippingDiscountModels != null){
				for(var j = 0; j < mainModel.shippingDiscountModels.length; j++){
					if(shippingId == mainModel.shippingDiscountModels[j].shippingMethodId){
						mainModel.shippingDiscountModels[j].shippingCost = shippingCost;
						mainModel.shippingDiscountModels[j].handlingCost = handlingCost;
						break;
					}
				}	
			}			
		}	
	}	

	setMainFormModel(mainModel, promoId, promoRecord);
}

function initializeTieredModel(promotionsInput, promoId, promoRecord){
	
	mainModel = new MainModel();
	mainModel.isTiered = true;
	
	errorModel = new ErrorModel();
	
	var itemIds = new Array(); 

	var currCurrency = promotionsInput.getCurrencyId();

	// get all Item IDs from line items
	var itemLines = promotionsInput.getItemLines();
	for (var i = 0; i < itemLines.length; i++)
	{
		var itemLine = itemLines[i];

		itemIds.push(itemLine.getItemId());
	}
	
	mainModel.lineItemItemIds = itemIds;
	mainModel.eligibleCustomers = getEligibleCustomersModel(promoId);
	
	setFirstTierLevelInMainModel(mainModel, promoId, currCurrency);
	mainModel.lineItemModel = getSortedLineItems(promotionsInput, mainModel.discountHighestPriceFirst);
	
	setShippingDiscountModel(promotionsInput, mainModel);
	setMainFormModel(mainModel, promoId, promoRecord);
}

function setFirstTierLevelInMainModel(mainModel, promoId, currCurrency){
	
	// generate the model
	mainModel.promotionTierModels = generatePromotionTierModel(promoId, currCurrency, mainModel);
	
	debugDetailMsg = '';
	for(var i = 0; i < mainModel.promotionTierModels.length; i++){
		
		var iter = mainModel.promotionTierModels[i];
		
		debugDetailMsg += '' 
		+ 'tierId = ' + iter.tierId
		+ '\n eligibilityType = ' + iter.eligibilityType  
		+ '\n eligibilityItem = ' + iter.eligibilityItem
		+ '\n eligibilitySavedSearchId = ' + iter.eligibilitySavedSearchId 
		+ '\n eligibilityAmount = ' + iter.eligibilityAmount 
		+ '\n eligibilityCurrency = ' + iter.eligibilityCurrency 
		+ '\n discountType = ' + iter.discountType 
		+ '\n discountItemAddType = ' + iter.discountItemAddType  
		+ '\n discountItem = ' + iter.discountItem  // an array of item IDs
		+ '\n discountSavedSearchId = ' + iter.discountSavedSearchId 
		+ '\n discountOfferAmount = ' + iter.discountOfferAmount 
		+ '\n discountOfferCurrency = ' + iter.discountOfferCurrency 
		+ '\n discountLimitAmount = ' + iter.discountLimitAmount 
		+ '\n discountLimitCurrency = ' + iter.discountLimitCurrency 
		+ '\n\n';
	}
	
	// check if there's at least one tier defined
	mainModel.promotionDiscountModel = new Array();
	if(mainModel.promotionTierModels.length > 0){
		
		// use the first tier values and set it to mainModel's eligibility
		var firstTier = mainModel.promotionTierModels[0];

		mainModel.eligibleOrders = new Array();
		var eligibleOrderModel = new EligibleOrderModel();
		eligibleOrderModel.id = null;
		eligibleOrderModel.type = firstTier.eligibilityType;
		eligibleOrderModel.savedSearchId = firstTier.eligibilitySavedSearchId;
		eligibleOrderModel.minPurchase = firstTier.eligibilityAmount;
		eligibleOrderModel.isUnit = firstTier.eligibilityCurrency == '' ? 'T' : 'F';
		eligibleOrderModel.eligibleItemIds = firstTier.eligibilityItem;
		
		mainModel.eligibleOrders.push(eligibleOrderModel);
		
		// use the first tier values and set it to mainModel's discount
		switch(firstTier.discountType){
			case CONST_DISCOUNT_TYPE_ITEM:
				
				switch(firstTier.discountItemAddType){
					case CONST_DISCOUNT_ITEM_ADD_TYPE_SAVED_SEARCH:
						
						var promotionDiscountModel = new PromotionDiscountModel();
						
						promotionDiscountModel.id = firstTier.discountSavedSearchId;
						promotionDiscountModel.type = firstTier.discountItemAddType;
						promotionDiscountModel.isPercent = firstTier.discountOfferCurrency == '' ? 'T' : 'F';
						promotionDiscountModel.amount = firstTier.discountOfferAmount;
						promotionDiscountModel.isUnit = firstTier.discountLimitCurrency == '' ? 'T' : 'F';
						promotionDiscountModel.limit = firstTier.discountLimitAmount;
						
						mainModel.promotionDiscountModel.push(promotionDiscountModel);		
						
						break;
					case CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM:
						
						for(var i = 0; i < firstTier.discountItem.length; i++){
							var promotionDiscountModel = new PromotionDiscountModel();
							
							promotionDiscountModel.id = firstTier.discountItem[i];
							promotionDiscountModel.type = firstTier.discountItemAddType;
							promotionDiscountModel.isPercent = firstTier.discountOfferCurrency == '' ? 'T' : 'F';
							promotionDiscountModel.amount = firstTier.discountOfferAmount;
							promotionDiscountModel.isUnit = firstTier.discountLimitCurrency == '' ? 'T' : 'F';
							promotionDiscountModel.limit = firstTier.discountLimitAmount;
							
							mainModel.promotionDiscountModel.push(promotionDiscountModel);	
						}
						
						break;
				}
				
				break;
			case CONST_DISCOUNT_TYPE_ORDER:
				
				var promotionDiscountModel = new PromotionDiscountModel();
				
				promotionDiscountModel.isPercent = firstTier.discountOfferCurrency == '' ? 'T' : 'F';
				promotionDiscountModel.amount = firstTier.discountOfferAmount;
				promotionDiscountModel.isUnit = firstTier.discountLimitCurrency == '' ? 'T' : 'F';
				promotionDiscountModel.limit = firstTier.discountLimitAmount;
				
				mainModel.promotionDiscountModel.push(promotionDiscountModel);	
				
				break;
		}
	}
	
	// set Shipping Discount Model
	mainModel = populatePromotionDiscountModel(promoId, currCurrency, mainModel);
}

function updateMainModelWithTier(promotionsInput, mainModel){
	
	// additional checking for tiered promotion. if current promo is tiered and there's an empty Promotion Tier Model, it means that they are eligible
	// and no need to determine tier level
	if(mainModel.promotionTierModels.length == 0 && mainModel.isTiered == true){
		return;
	}
			
	//identify tier level
	var cartTierLevel = identifyCartTierLevel(promotionsInput, mainModel);
	
	// update eligibility
	mainModel.eligibleOrders[0].minPurchase = mainModel.promotionTierModels[cartTierLevel].eligibilityAmount;
	
	// update discount
	mainModel.promotionDiscountModel[0].amount = mainModel.promotionTierModels[cartTierLevel].discountOfferAmount;
	mainModel.promotionDiscountModel[0].limit = mainModel.promotionTierModels[cartTierLevel].discountLimitAmount;
}

function identifyCartTierLevel(promotionsInput, mainModel){
	var ret = -1;
	
	// determine type: unit or currency
	// determine item add type: item, saved search, or order total
	
	// use the first tier and get the actual purchases
	var totalActualPurchase = 0;
	
	for(var i = 0; i < mainModel.eligibleOrders.length; i++){
		var eorder = mainModel.eligibleOrders[i];

		var eorderType = eorder.type;
		var eorderIsUnit = eorder.isUnit;		

		// get the actual purchase based on the line items
		switch(eorderType){
		
			case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:
			case CONST_ELIGIBLE_ORDER_TYPE_ITEM:
				if(eorderIsUnit == 'T'){
					totalActualPurchase = mainModel.eligibilityCriteriaModel.getEligibleOrderTotal(i, true);
				}
				else{
					totalActualPurchase = mainModel.eligibilityCriteriaModel.getEligibleOrderTotal(i, false);
				}	
				
				break;
			case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:
				
				// support for Order Total-Unit Minimum Purchase
				if(eorderIsUnit == 'T'){	
					totalActualPurchase = promotionsInput.getItemsQuantity();
				}
				else{
					totalActualPurchase = promotionsInput.getItemsAmount();
				}
				
				break;
		}
	}

	// identify tier level
	for(var i = 0; i < mainModel.promotionTierModels.length; i++){
		var eorder = mainModel.promotionTierModels[i];
		
		var minimumPurchase = eorder.eligibilityAmount;
		
		if(totalActualPurchase < minimumPurchase){
			// check previous tier
			if(i != 0){
				ret = i-1;
				break;
			}
		}
		else{
			if(i == mainModel.promotionTierModels.length-1){
				ret = i;
				break;
			}
		}
	}
	
//	advPromoLogger('DEBUG', 'Tiered Promotion Level', 'Level ' + (ret+1) 
//		+ '\n Minimum Purchase: ' + mainModel.promotionTierModels[ret].eligibilityAmount
//		+ '\n Discount: ' + mainModel.promotionTierModels[ret].discountOfferAmount + ' (offer), ' + mainModel.promotionTierModels[ret].discountLimitAmount + ' (limit)' 
//	);
	
	return ret;
}

// can be unit tested
function generatePromotionTierModel(promoId, currCurrency, mainModel){
	
	var ret = new Array();
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_tier_promo_code', null, 'anyof', [ promoId ]);
	var columns = [
		new nlobjSearchColumn('custrecord_advpromo_tier_tier_id').setSort(),
		new nlobjSearchColumn('custrecord_advpromo_tier_elig_type'),
		new nlobjSearchColumn('custrecord_advpromo_tier_elig_iid'),
		new nlobjSearchColumn('custrecord_advpromo_tier_elig_sid'),
		new nlobjSearchColumn('custrecord_advpromo_tier_elig_amount'),
		new nlobjSearchColumn('custrecord_advpromo_tier_elig_currency'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_type'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_iatype'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_iid'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_sid'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_offer'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_offer_curr'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_limit'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_limit_curr'),
		new nlobjSearchColumn('custrecord_advpromo_tier_disc_highest')
    ];
	
	var promotionTiers = nlapiSearchRecord('customrecord_advpromo_tier', null, filters, columns);
	if(promotionTiers != null){
		for(var i = 0; i < promotionTiers.length; i++){
			
			var tierId = promotionTiers[i].getValue('custrecord_advpromo_tier_tier_id');
			var eligibilityType = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_type');
			var eligibilityItem = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_iid'); 
			var eligibilitySavedSearchId = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_sid'); 
			var eligibilityAmount = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_amount');
			var eligibilityCurrency = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_currency');
			var discountType = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_type');
			var discountItemAddType = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_iatype'); 
			var discountItem = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_iid'); 
			var discountSavedSearchId = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_sid');
			var discountOfferAmount = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_offer');
			var discountOfferCurrency = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_offer_curr');
			var discountLimitAmount = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_limit');
			var discountLimitCurrency = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_limit_curr');
			var discHighest = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_highest');
			
			// store the first row of the search result. this will serve as the base info on eligibility criteria
			if(i == 0){
				var eligibleOrderModel = new EligibleOrderModel();
				eligibleOrderModel.id = null;
				eligibleOrderModel.type = eligibilityType;
				eligibleOrderModel.savedSearchId = eligibilitySavedSearchId;
				eligibleOrderModel.eligibleItemIds = eligibilityItem ? eligibilityItem.split(',') : [];
				eligibleOrderModel.minPurchase = eligibilityAmount;
				eligibleOrderModel.isUnit = eligibilityCurrency == '' ? 'T' : 'F';
								
				mainModel.eligibleOrders.push(eligibleOrderModel);	
				
				// get the value of 'Apply Discount to Highest Valued Item'
				mainModel.discountHighestPriceFirst = discHighest == 'T' ? true : false;
			}	
			
			var newModel = new PromotionTierModel();
			
			// ignore records that doesn't match the currCurrency
			if( (eligibilityCurrency == '' && discountOfferCurrency == '' && discountLimitCurrency == '') ||
				(currCurrency == eligibilityCurrency || currCurrency == discountOfferCurrency || currCurrency == discountLimitCurrency)
			){
				newModel.tierId = tierId;
				newModel.eligibilityType = eligibilityType;
				newModel.eligibilitySavedSearchId = eligibilitySavedSearchId; 
				newModel.eligibilityAmount = eligibilityAmount;
				newModel.eligibilityCurrency = eligibilityCurrency;
				newModel.discountType = discountType;
				newModel.discountItemAddType = discountItemAddType;
				newModel.discountSavedSearchId = discountSavedSearchId;
				newModel.discountOfferAmount = discountOfferAmount;
				newModel.discountOfferCurrency = discountOfferCurrency;
				newModel.discountLimitAmount = discountLimitAmount;
				newModel.discountLimitCurrency = discountLimitCurrency;
				
				var idArr = new Array();
				if(eligibilityItem != null){
					idArr = eligibilityItem.split(',');
				}	    			

				if(idArr != null){
					for(var k = 0; k < idArr.length; k++){
						newModel.eligibilityItem.push(parseInt(idArr[k]));
					}	
				}
				
				idArr = null;
				if(discountItem != null){
					idArr = discountItem.split(',');
				}	    			

				if(idArr != null){
					for(var k = 0; k < idArr.length; k++){
						newModel.discountItem.push(parseInt(idArr[k]));
					}	
				}
				
				ret.push(newModel);
			}
		}
	}
	else{
		mainModel.hasNoEligibilityCriteria = true;
	}
	
	var hasEligibilityCurrency = false;
	
	// additional checking when Discount (Limit) is in currency and SO doesn't match any currencies
	if(ret.length == 0){
		if(promotionTiers != null){
			var previousTierId = 0;
			
			for(var i = 0; i < promotionTiers.length; i++){
				
				var tierId = promotionTiers[i].getValue('custrecord_advpromo_tier_tier_id');
				var eligibilityType = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_type');
				var eligibilityItem = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_iid'); 
				var eligibilitySavedSearchId = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_sid'); 
				var eligibilityAmount = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_amount');
				var eligibilityCurrency = promotionTiers[i].getValue('custrecord_advpromo_tier_elig_currency');
				var discountType = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_type');
				var discountItemAddType = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_iatype'); 
				var discountItem = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_iid'); 
				var discountSavedSearchId = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_sid');
				var discountOfferAmount = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_offer');
				var discountOfferCurrency = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_offer_curr');
				var discountLimitCurrency = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_limit_curr');
				var discHighest = promotionTiers[i].getValue('custrecord_advpromo_tier_disc_highest');
				
				// get the value of 'Apply Discount to Highest Valued Item'. only look at the first entry since all values should be the same for all 
				if(i == 0){
					mainModel.discountHighestPriceFirst = discHighest == 'T' ? true : false;
				}	
				
				var newModel = new PromotionTierModel();
				
				// if eligibility is in Units, consider the SO eligible regardless of currency
				if(currCurrency == eligibilityCurrency || eligibilityCurrency == ''){
					hasEligibilityCurrency = true;
				}
				
				// copy the Discount (Offer) amount
				if (discountLimitCurrency != '' && tierId != previousTierId ) {
					newModel.tierId = tierId;
					newModel.eligibilityType = eligibilityType;
					newModel.eligibilitySavedSearchId = eligibilitySavedSearchId; 
					newModel.eligibilityAmount = eligibilityAmount;
					newModel.eligibilityCurrency = eligibilityCurrency;
					newModel.discountType = discountType;
					newModel.discountItemAddType = discountItemAddType;
					newModel.discountSavedSearchId = discountSavedSearchId;
					newModel.discountOfferAmount = discountOfferAmount;
					newModel.discountOfferCurrency = discountOfferCurrency;
					
					var idArr = new Array();
					if(eligibilityItem != null){
						idArr = eligibilityItem.split(',');
					}	    			

					if(idArr != null){
						for(var k = 0; k < idArr.length; k++){
							newModel.eligibilityItem.push(parseInt(idArr[k]));
						}	
					}
					
					idArr = null;
					if(discountItem != null){
						idArr = discountItem.split(',');
					}	    			

					if(idArr != null){
						for(var k = 0; k < idArr.length; k++){
							newModel.discountItem.push(parseInt(idArr[k]));
						}	
					}
					
					// only add if Discount (Offer) is in %
					if(discountOfferCurrency == ''){
						
						// additional checking and clean up for Order Discount type
						if(newModel.discountType == CONST_DISCOUNT_TYPE_ORDER && newModel.discountLimitAmount == undefined){
							newModel.discountLimitAmount = '';
						}
						
						ret.push(newModel);	
					}					
				}
				
				previousTierId = tierId;
			}
		}	
		
		// additional checking if SO doesn't match any currencies for Eligibility. empty the Promotion Tier Model if that's the case
		if(!hasEligibilityCurrency){
			ret = new Array();
		}
	}
	
	mainModel.hasEligibilityCurrency = hasEligibilityCurrency;
	
//	debugDetailMsg = '';
//	for(var i = 0; i < ret.length; i++){
//		var o = ret[i];
//		debugDetailMsg += i + ' - tierId = ' + o.tierId 
//			+ '\n eligibilityType = ' + o.eligibilityType 
//			+ '\n eligibilityAmount = ' + o.eligibilityAmount 
//			+ '\n eligibilityCurrency = ' + o.eligibilityCurrency 
//			+ '\n discountType = ' + o.discountType 
//			+ '\n discountOfferAmount = ' + o.discountOfferAmount
//			+ '\n discountOfferCurrency = ' + o.discountOfferCurrency
//			+ '\n discountLimitAmount = ' + o.discountLimitAmount
//			+ '\n discountLimitCurrency = ' + o.discountLimitCurrency
//			+ '\n\n';
//	}
//	advPromoLogger('DEBUG', 'generatePromotionTierModel', debugDetailMsg);	
	
	return ret;
}

function getEligibleCustomersModel(promoId){
	
	var ret = new Array();
	
	// Get all Eligible Customers associated with the Promotion record
	var promoCodeIds = new Array();
	promoCodeIds.push(promoId);

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_customer_promo_code', null, 'anyof', promoCodeIds);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_advpromo_customer_cid');
	columns[1] = new nlobjSearchColumn('custrecord_advpromo_customer_type');
	columns[2] = new nlobjSearchColumn('custrecord_advpromo_customer_sid');
	columns[3] = new nlobjSearchColumn('custrecord_advpromo_customer_group');

	var eligibleCustomers = nlapiSearchRecord('customrecord_advpromo_eligible_customer', null, filters, columns);
	if(eligibleCustomers != null){
		for(var i = 0; i < eligibleCustomers.length; i++){
			var sId = eligibleCustomers[i].getValue('custrecord_advpromo_customer_sid');
			var type = eligibleCustomers[i].getValue('custrecord_advpromo_customer_type');
			var cId = eligibleCustomers[i].getValue('custrecord_advpromo_customer_cid');

			var eligibleCustomerModel = new EligibleCustomerModel();
			eligibleCustomerModel.type = type;

			switch(type){
			case CONST_ELIGIBLE_CUSTOMER_TYPE_SAVED_SEARCH:
				eligibleCustomerModel.id = sId;

				ret.push(eligibleCustomerModel);
				break;
			case CONST_ELIGIBLE_CUSTOMER_TYPE_ID:

				eligibleCustomerModel.eligibleIds = new Array();

				// add to array
				var cidArr = new Array();
				if(cId != null){
					cidArr = cId.split(',');
				}	    			

				if(cidArr != null){
					for(var k = 0; k < cidArr.length; k++){
						eligibleCustomerModel.eligibleIds.push(parseInt(cidArr[k]));
					}	
				}

				ret.push(eligibleCustomerModel);
				// end of 217516 

				break;
			default:
				break;
			}
		}
	}
	
	return ret;
}

function getEligibleOrdersModel(promoId, currCurrency){
	
	var ret = new Array();
	
	// get all Item IDs from Eligible Orders
	promoCodeIds = new Array();
	promoCodeIds.push(promoId);

	filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_order_promo_code', null, 'anyof', promoCodeIds);
	columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_advpromo_order_label');
	columns[1] = new nlobjSearchColumn('custrecord_advpromo_order_iid');
	columns[2] = new nlobjSearchColumn('custrecord_advpromo_order_type');
	columns[3] = new nlobjSearchColumn('internalid');
	columns[4] = new nlobjSearchColumn('custrecord_advpromo_order_sid');

	// Get all Eligible Orders associated with the Promotion record
	var eligibleItemSaveSearches = nlapiSearchRecord('customrecord_advpromo_eligible_order', null, filters, columns);
	if(eligibleItemSaveSearches != null){
		var resCount = eligibleItemSaveSearches.length;

		for(var i = 0; i < resCount; i++){
			var iId = eligibleItemSaveSearches[i].getValue('custrecord_advpromo_order_iid');
			var sId = eligibleItemSaveSearches[i].getValue('custrecord_advpromo_order_sid');
			var type = eligibleItemSaveSearches[i].getValue('custrecord_advpromo_order_type');
			var id = eligibleItemSaveSearches[i].getValue('internalid');

			var eligibleOrderModel = new EligibleOrderModel();
			eligibleOrderModel.id = id;
			eligibleOrderModel.type = type;
			eligibleOrderModel.savedSearchId = sId;

			var eligibleItemIds = new Array();

			switch(type){
				case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:
	
					// get minimum purchase
					var eoids = new Array();
					eoids.push(id);
					filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eoids);
					columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_advpromo_minp_amount');
					columns[1] = new nlobjSearchColumn('custrecord_advpromo_minp_currency');
					columns[2] = new nlobjSearchColumn('custrecord_advpromo_minp_is_unit');
	
					var minPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
					if(minPurchases != null){
						for(var j = 0; j < minPurchases.length; j++){
							var mpAmount = minPurchases[j].getValue('custrecord_advpromo_minp_amount');
							var mpCurrency = minPurchases[j].getValue('custrecord_advpromo_minp_currency');
							var mpIsUnit = minPurchases[j].getValue('custrecord_advpromo_minp_is_unit');
	
							if(mpIsUnit == 'T'){
								eligibleOrderModel.minPurchase = mpAmount;
								eligibleOrderModel.isUnit = mpIsUnit;
								break; // just to be sure on preventing unit and currency together
							}
							else{
								// if currency, only select the current currency in Sales Order form
								if(currCurrency == mpCurrency){
									eligibleOrderModel.minPurchase = mpAmount;
									eligibleOrderModel.isUnit = mpIsUnit;
									break;
								}
							}
						}
					}
	
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ITEM:
	
					// add to array
					var idArr = new Array();
					if(iId != null){
						idArr = iId.split(',');
					}	    			
	
					if(idArr != null){
						for(var k = 0; k < idArr.length; k++){
							eligibleItemIds.push(parseInt(idArr[k]));
						}	
					}	    			
	
					eligibleOrderModel.eligibleItemIds = eligibleItemIds;
	
					// get minimum purchase
					var eoids = new Array();
					eoids.push(id);
					filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eoids);
					columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_advpromo_minp_amount');
					columns[1] = new nlobjSearchColumn('custrecord_advpromo_minp_currency');
					columns[2] = new nlobjSearchColumn('custrecord_advpromo_minp_is_unit');
	
					var minPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
					if(minPurchases != null){
						for(var j = 0; j < minPurchases.length; j++){
							var mpAmount = minPurchases[j].getValue('custrecord_advpromo_minp_amount');
							var mpCurrency = minPurchases[j].getValue('custrecord_advpromo_minp_currency');
							var mpIsUnit = minPurchases[j].getValue('custrecord_advpromo_minp_is_unit');
	
							if(mpIsUnit == 'T'){
								eligibleOrderModel.minPurchase = mpAmount;
								eligibleOrderModel.isUnit = mpIsUnit;
								break; // just to be sure on preventing unit and currency together
							}
							else{
								// if currency, only select the current currency in Sales Order form
								if(currCurrency == mpCurrency){
									eligibleOrderModel.minPurchase = mpAmount;
									eligibleOrderModel.isUnit = mpIsUnit;
									break;
								}
							}	    		    		
						}
					}
	
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:
	
					eligibleOrderModel.eligibleItemIds = new Array();
	
					// get minimum purchase
					var eoids = new Array();
					eoids.push(id);
					filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_advpromo_minp_eligible_order', null, 'anyof', eoids);
					columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_advpromo_minp_amount');
					columns[1] = new nlobjSearchColumn('custrecord_advpromo_minp_currency');
					columns[2] = new nlobjSearchColumn('custrecord_advpromo_minp_is_unit');
	
					var minPurchases = nlapiSearchRecord('customrecord_advpromo_min_purchase', null, filters, columns);
					if(minPurchases != null){
						for(var j = 0; j < minPurchases.length; j++){
							var mpAmount = minPurchases[j].getValue('custrecord_advpromo_minp_amount');
							var mpCurrency = minPurchases[j].getValue('custrecord_advpromo_minp_currency');
							var mpIsUnit = minPurchases[j].getValue('custrecord_advpromo_minp_is_unit');
	
							if(mpIsUnit == 'T'){
								eligibleOrderModel.minPurchase = mpAmount;
								eligibleOrderModel.isUnit = mpIsUnit;
								break; // just to be sure on preventing unit and currency together
							}
							else{
								// if currency, only select the current currency in Sales Order form
								if(currCurrency == mpCurrency){
									eligibleOrderModel.minPurchase = mpAmount;
									eligibleOrderModel.isUnit = mpIsUnit;
									break;
								}
							}	    		    		
						}
					}
	
					break;
				default:
					break;
			}

			ret.push(eligibleOrderModel);
		}	
	}
	
	return ret;
}

function setShippingDiscountModel(promotionsInput, mainModel){
	
	// get Shipping Model
	var shippingItems = promotionsInput.getShippingItems();

	// update Shipping Models to set their shipping and handling cost
	if(shippingItems != null){
		for(var i = 0; i < shippingItems.length; i++){

			var shippingInfo = shippingItems[i];		
			var shippingId = shippingInfo.getShippingItemId();
			var shippingCost = shippingInfo.getShippingCost();
			var handlingCost = shippingInfo.getHandlingCost();

			if(mainModel.shippingDiscountModels != null){
				for(var j = 0; j < mainModel.shippingDiscountModels.length; j++){
					if(shippingId == mainModel.shippingDiscountModels[j].shippingMethodId){
						mainModel.shippingDiscountModels[j].shippingCost = shippingCost;
						mainModel.shippingDiscountModels[j].handlingCost = handlingCost;
						break;
					}
				}	
			}			
		}	
	}
}

function setMainFormModel(mainModel, promoId, promoRecord){
	
	var fields = [
	    'discount',
	    'custrecord_advpromo_order_criteria',
	    'custrecord_advpromo_customer_criteria',
	    'startdate',
	    'enddate',
	    'custrecord_advpromo_channel',
	    'custrecord_advpromo_subsidiary'
	];
	var columns = nlapiLookupField('promotioncode', promoId, fields);
	
	mainModel.promoRecord = promoRecord;
	mainModel.discountItemId = columns.discount;
	mainModel.isApplyAnyOrderCriteria = columns.custrecord_advpromo_order_criteria ? columns.custrecord_advpromo_order_criteria : null;
	mainModel.isApplyAnyCustomerCriteria = columns.custrecord_advpromo_customer_criteria ? columns.custrecord_advpromo_customer_criteria : null;
	mainModel.startDate = columns.startdate;
	mainModel.endDate = columns.enddate;	
	mainModel.siteId = convertToArray(columns.custrecord_advpromo_channel);
	mainModel.subsidiaryId = convertToArray(columns.custrecord_advpromo_subsidiary);	
}

function isAnyOrder(promoId){
	var ret = false;

	var promoCodeIds = new Array();
	promoCodeIds.push(promoId);

	filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_order_promo_code', null, 'anyof', promoCodeIds);
	columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_advpromo_order_label');

	// Get all Eligible Orders associated with the Promotion record
	var eligibleItemSaveSearches = nlapiSearchRecord('customrecord_advpromo_eligible_order', null, filters, columns);
	if(eligibleItemSaveSearches == null){
		ret = true;
	}

	return ret;
}


function isEligibleCart(promotionsInput, mainModel, errorModel){
	var ret = false;

	// check if within start and end date. already implemented in Core
	//	if(!isWithinDateRange(promotionsInput, mainModel)){
	//	advPromoLogger('DEBUG', 'Not within start and end date');
	//	return false;
	//	}

	// check if promo code is part of the site
	var siteId = promotionsInput.getSiteId();
	var isEligibleSiteRet = isEligibleSite(siteId, mainModel);

	advPromoLogger('DEBUG', 'Eligible Site = ' + isEligibleSiteRet);
	if(!isEligibleSiteRet){
		errorModel.failedSite = true;
		return false;
	}

	// check if promo code is part of the subsidiary
	var subsidiaryId = promotionsInput.getSubsidiaryId();
	var promoId = promotionsInput.getPromotionId();
	var isEligibleSubsidiaryRet = isEligibleSubsidiary(subsidiaryId, promoId, mainModel.discountItemId);

	advPromoLogger('DEBUG', 'Eligible Subsidiary = ' + isEligibleSubsidiaryRet);
	if(!isEligibleSubsidiaryRet){
		errorModel.failedSubsidiary = true;
		return false;
	}

	// check if customer is eligible
	var customerId = promotionsInput.getCustomerId();
	var isEligibleCustomerRet = isEligibleCustomer(customerId, mainModel);

	advPromoLogger('DEBUG', 'Eligible Customer = ' + isEligibleCustomerRet);
	if(!isEligibleCustomerRet){
		return false;
	}

	// instantiate Eligiblity Criteria Model
	var orderEligibilityModel = new OrderEligibilityCriteriaModel(mainModel.eligibleOrders.length);
	
	// if there's no eligibility criteria
	if(mainModel.hasNoEligibilityCriteria == true){
		return true;
	} 
	// additional checking for tiered promo
	else if(mainModel.isTiered == true){
		// additional checking for no matching currency in eligibility
		if(mainModel.promotionTierModels.length == 0 && mainModel.hasEligibilityCurrency == false){
			return false;
		}
		
		// additional checking for with matching currency, but didn't pass the eligible items ids
		mainModel.eligibilityCriteriaModel = orderEligibilityModel;
		if(isEligibleOrderTiered(promotionsInput, mainModel) == false){
			return false;
		}
	}
	// if a non-tiered promo has no matching currency in eligibility criteria
	else if(mainModel.eligibleOrders == null || (mainModel.eligibleOrders != null && mainModel.eligibleOrders.length == 0)){
		return false;
	}
		
	// 1st pass: Check if Items are Eligible
	ret = isEligibleOrder(promotionsInput, mainModel, orderEligibilityModel);
	
	// 2nd pass: Check if Minimum Purchases are met
	if(ret){
		ret = isEligibleByMinimumPurchase(promotionsInput, mainModel, errorModel, orderEligibilityModel);
		advPromoLogger('DEBUG', 'Eligible Order (Minimum Purchase) = ' + ret);
	}	
	else{
		advPromoLogger('DEBUG', '2nd pass: Eligible Order (Minimum Purchase) was skipped.');
	}
	
	// the information regarding which items and totals belong to eligibility criteria can be used in tier level identification
	mainModel.eligibilityCriteriaModel = orderEligibilityModel;

	return ret;
}

/*
 * Searches the Promotion Discount records that are associated to a Promotion record. Updates any or all of these "mainModel" fields: promotionDiscountModel, shippingDiscountModels, isfsDiscountModel  
 * 
 * @param {promoId} the internal ID of the main Promotion record
 * @param {currencyId} the intenal ID of the current Sales Order's currency
 * @param {updateMainModel} the global object, "mainModel"
 * @return {updateMainModel} the updated global object, "mainModel"
 */
function populatePromotionDiscountModel(promoId, currencyId, updateMainModel) {

	var promotionDiscountModels = new Array();

	// get all the Promotional Offer records
	var promoCodeIds = new Array();
	promoCodeIds.push(promoId);

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', null, 'anyof', promoCodeIds);
	var columns = [
        new nlobjSearchColumn('internalid'),
        new nlobjSearchColumn('custrecord_advpromo_discount_type'),
        new nlobjSearchColumn('custrecord_advpromo_discount_iatype'),
        new nlobjSearchColumn('custrecord_advpromo_discount_iid'),
        new nlobjSearchColumn('custrecord_advpromo_discount_sid'),
        new nlobjSearchColumn('custrecord_advpromo_discount_isf_smethod'),
        new nlobjSearchColumn('custrecord_advpromo_apply_to_highest')
    ];
	
	var promoDiscounts = nlapiSearchRecord('customrecord_advpromo_discount', null, filters, columns);
	if(promoDiscounts != null){
		var promoDiscountCount = promoDiscounts.length;

		for(var i = 0; i < promoDiscountCount; i++){
			var discountId = promoDiscounts[i].getValue('internalid');
			var discountType = promoDiscounts[i].getValue('custrecord_advpromo_discount_type');
			var itemAddType = promoDiscounts[i].getValue('custrecord_advpromo_discount_iatype');
			var itemId = promoDiscounts[i].getValue('custrecord_advpromo_discount_iid');
			var savedSearchId = promoDiscounts[i].getValue('custrecord_advpromo_discount_sid');
			var shipMethods = promoDiscounts[i].getValue('custrecord_advpromo_discount_isf_smethod');
			var discHighest = promoDiscounts[i].getValue('custrecord_advpromo_apply_to_highest');

			var discountIds = new Array();
			discountIds.push(discountId);

			switch(discountType){
				case CONST_DISCOUNT_TYPE_FIXED_PRICE:
				case CONST_DISCOUNT_TYPE_ITEM:
	
					// get the value of 'Apply Discount to Highest Valued Item' if discount is of type Item or Fixed Price only
					updateMainModel.discountHighestPriceFirst = promoDiscounts[i].getValue('custrecord_advpromo_apply_to_highest') == 'T' ? true : false;
					
					// get actual Promotional Offers
					filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_advpromo_poffer_discount', null, 'anyof', discountIds);
					columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_advpromo_poffer_amount');
					columns[1] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_percent');
					columns[2] = new nlobjSearchColumn('custrecord_advpromo_poffer_currency');
					columns[3] = new nlobjSearchColumn('custrecord_advpromo_poffer_limit');
					columns[4] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_unit');
	
					// determine type of discount
					switch(itemAddType){
						case CONST_DISCOUNT_ITEM_ADD_TYPE_SAVED_SEARCH:
		
							var promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);
							if(promoOffers != null){
								var promoOfferCount = promoOffers.length;
								var isPercent = null;
								var amount = -1;
								
								for(var j = 0; j < promoOfferCount; j++){
									amount = promoOffers[j].getValue('custrecord_advpromo_poffer_amount');
									isPercent = promoOffers[j].getValue('custrecord_advpromo_poffer_is_percent');
									var currency = promoOffers[j].getValue('custrecord_advpromo_poffer_currency');
									var isUnit = promoOffers[j].getValue('custrecord_advpromo_poffer_is_unit');
									var limit = promoOffers[j].getValue('custrecord_advpromo_poffer_limit');
		
									if(currencyId == currency || currency == ''){
										var promotionDiscountModel = new PromotionDiscountModel();
										promotionDiscountModel.id = savedSearchId;
										promotionDiscountModel.type = itemAddType;
										promotionDiscountModel.isPercent = isPercent;
										promotionDiscountModel.amount = amount;
										promotionDiscountModel.isUnit = isUnit;
										promotionDiscountModel.limit = limit;
										promotionDiscountModel.isFixedPrice = (discountType == CONST_DISCOUNT_TYPE_FIXED_PRICE ? true : false);
										promotionDiscountModels.push(promotionDiscountModel);
										break;
									}
								}
		
								// additional checking if there's a  % offer but didn't match the currency
								if(isPercent == 'T' && promotionDiscountModels.length == 0){
									// create the model
									var promotionDiscountModel = new PromotionDiscountModel();
									promotionDiscountModel.id = savedSearchId;
									promotionDiscountModel.type = itemAddType;
									promotionDiscountModel.isPercent = isPercent;
									promotionDiscountModel.amount = amount;
									promotionDiscountModel.isUnit = 'T';
									promotionDiscountModel.limit = '';
									promotionDiscountModel.isFixedPrice = (discountType == CONST_DISCOUNT_TYPE_FIXED_PRICE ? true : false);
									promotionDiscountModels.push(promotionDiscountModel);
								}
							}	    			
		
							break;
						case CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM:
		
							// 217517 start
							var idArr = new Array();
							if(itemId != null){
								idArr = itemId.split(',');
							}	    			
		
							if(idArr != null){
								var promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);
								for(var k = 0; k < idArr.length; k++){
		
									var singleItemId = idArr[k];
		
									if(promoOffers != null){
										var promoOfferCount = promoOffers.length;
										var isPercent = null;
										var amount = -1;
										var hasLimitCurrency = false;
										
										for(var j = 0; j < promoOfferCount; j++){
											amount = promoOffers[j].getValue('custrecord_advpromo_poffer_amount');
											isPercent = promoOffers[j].getValue('custrecord_advpromo_poffer_is_percent');
											var currency = promoOffers[j].getValue('custrecord_advpromo_poffer_currency');
											var isUnit = promoOffers[j].getValue('custrecord_advpromo_poffer_is_unit');
											var limit = promoOffers[j].getValue('custrecord_advpromo_poffer_limit');
											
											// currency will be '' if offer is in % and limit is in units or no limit 
											if(currencyId == currency || currency == ''){
												var promotionDiscountModel = new PromotionDiscountModel();
												promotionDiscountModel.id = singleItemId;
												promotionDiscountModel.type = itemAddType;
												promotionDiscountModel.isPercent = isPercent;
												promotionDiscountModel.amount = amount;
												promotionDiscountModel.isUnit = isUnit;
												promotionDiscountModel.limit = limit;
												promotionDiscountModel.isFixedPrice = (discountType == CONST_DISCOUNT_TYPE_FIXED_PRICE ? true : false);
												promotionDiscountModels.push(promotionDiscountModel);
												
												hasLimitCurrency = true;
												break;
											}
										}
		
										// additional checking if there's a  % offer but didn't match the currency
										if(isPercent == 'T' && hasLimitCurrency == false){
											// create the model
											var promotionDiscountModel = new PromotionDiscountModel();
											promotionDiscountModel.id = singleItemId;
											promotionDiscountModel.type = itemAddType;
											promotionDiscountModel.isPercent = isPercent;
											promotionDiscountModel.amount = amount;
											promotionDiscountModel.isUnit = 'T';
											promotionDiscountModel.limit = '';
											promotionDiscountModel.isFixedPrice = (discountType == CONST_DISCOUNT_TYPE_FIXED_PRICE ? true : false);
											promotionDiscountModels.push(promotionDiscountModel);
										}
									}
								}	
							}
							// 217517 end
		
							break;
						default:
							break;
					}
	
					updateMainModel.promotionDiscountModel = promotionDiscountModels;
					
					break;
				case CONST_DISCOUNT_TYPE_ORDER:
	
					// get actual Promotional Offers
					filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_advpromo_poffer_discount', null, 'anyof', discountIds);
					columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_advpromo_poffer_amount');
					columns[1] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_percent');
					columns[2] = new nlobjSearchColumn('custrecord_advpromo_poffer_currency');
					columns[3] = new nlobjSearchColumn('custrecord_advpromo_poffer_limit');
					columns[4] = new nlobjSearchColumn('custrecord_advpromo_poffer_is_unit');
	
					var promoOffers = nlapiSearchRecord('customrecord_advpromo_promotional_offer', null, filters, columns);
					if(promoOffers != null){
						var promoOfferCount = promoOffers.length;
	
						var isPercent = null;
						var amount = -1;
						var isUnit = null;
						
						for(var j = 0; j < promoOfferCount; j++){
							amount = promoOffers[j].getValue('custrecord_advpromo_poffer_amount');
							isPercent = promoOffers[j].getValue('custrecord_advpromo_poffer_is_percent');
							var currency = promoOffers[j].getValue('custrecord_advpromo_poffer_currency');
							isUnit = promoOffers[j].getValue('custrecord_advpromo_poffer_is_unit');
							var limit = promoOffers[j].getValue('custrecord_advpromo_poffer_limit');
	
							if(currencyId == currency || currency == ''){
								// create the model
								var promotionDiscountModel = new PromotionDiscountModel();
								promotionDiscountModel.id = savedSearchId;
								promotionDiscountModel.type = itemAddType;
								promotionDiscountModel.isPercent = isPercent;
								promotionDiscountModel.amount = amount;
								promotionDiscountModel.isUnit = isUnit;
								promotionDiscountModel.limit = limit;
								promotionDiscountModels.push(promotionDiscountModel);
								break;
							}
						}
	
						// additional checking if there's a  % offer but didn't match the currency
						if(isPercent == 'T' && promotionDiscountModels.length == 0){
							// create the model
							var promotionDiscountModel = new PromotionDiscountModel();
							promotionDiscountModel.id = savedSearchId;
							promotionDiscountModel.type = itemAddType;
							promotionDiscountModel.isPercent = isPercent;
							promotionDiscountModel.amount = amount;
							promotionDiscountModel.isUnit = isUnit;
							promotionDiscountModel.limit = '';
							promotionDiscountModels.push(promotionDiscountModel);
						}
					}
					
					updateMainModel.promotionDiscountModel = promotionDiscountModels;
	
					break;
				case CONST_DISCOUNT_TYPE_SHIPPING:
	
					var arrIds = (shipMethods ? shipMethods.split(',') : []);
					for(var j = 0; j < arrIds.length; j++){
						var mod = new ShippingDiscountModel();
						mod.shippingMethodId = parseInt(arrIds[j]);
						
						updateMainModel.shippingDiscountModels.push(mod);
					}
	
					// read Shipping Price record
					var isAmountInPercent = 'F';
					var finalShippingCost = -1;
	
					filters = new Array();
					filters[0] = new nlobjSearchFilter('custrecord_advpromo_sprice_discount', null, 'anyof', discountIds);
					columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_advpromo_sprice_amount');
					columns[1] = new nlobjSearchColumn('custrecord_advpromo_sprice_currency');
					columns[2] = new nlobjSearchColumn('custrecord_advpromo_sprice_is_percent');
	
					var shippingPrices = nlapiSearchRecord('customrecord_advpromo_shipping_price', null, filters, columns);
					if(shippingPrices != null){
						for(var j = 0; j < shippingPrices.length; j++){
							var amount = shippingPrices[j].getValue('custrecord_advpromo_sprice_amount');
							var currency = shippingPrices[j].getValue('custrecord_advpromo_sprice_currency');
							var isPercent = shippingPrices[j].getValue('custrecord_advpromo_sprice_is_percent');
	
							isAmountInPercent = isPercent;
	
							if(isPercent == 'T'){
								finalShippingCost = amount;
								break;
							}
							else{
								if(currencyId == parseInt(currency)){
									finalShippingCost = amount;
									break;
								}	
							}    		    		
						}	
					}	  				
	
					// update mainModel.shippingDiscountModels
					if(updateMainModel.shippingDiscountModels != null){
						for(var j = 0; j < updateMainModel.shippingDiscountModels.length; j++){
							updateMainModel.shippingDiscountModels[j].finalShippingCost = finalShippingCost;
							updateMainModel.shippingDiscountModels[j].isPercent = isAmountInPercent;
						}	
					}	  				
	
					break;
					
				case CONST_DISCOUNT_TYPE_ITEM_SPEC_FREE_SHIPPING:
					var arrIds = [];
					var isfsModel = new ItemSpecificFreeShippingDiscountModel();
					isfsModel.type = itemAddType;
					
					arrIds = (itemId ? itemId.split(',') : []);
					for(var j = 0; j < arrIds.length; j++){
						arrIds[j] = parseInt(arrIds[j]);
					}
					isfsModel.itemIds = arrIds;
					
					isfsModel.savedSearchId = (savedSearchId ? savedSearchId : '');
					
					arrIds = (shipMethods ? shipMethods.split(',') : []);
					for(var j = 0; j < arrIds.length; j++){
						arrIds[j] = parseInt(arrIds[j]);
					}
					isfsModel.shippingMethodIds = arrIds;
					
					updateMainModel.isfsDiscountModel = isfsModel;
					
					break;
			}
		}
	}
	
	return updateMainModel;
}

function applyItemDiscount(promotionsInput, promotionsOutput, mainModel){

	var discountItemId = mainModel.discountItemId;

	// sort the line items based on price
	var sortedLineItems = mainModel.lineItemModel;
	
	// Discount lookup table
	var discountableItemsTable = new DiscountCriteriaModel();
	
	// initialize Discount lookup table
	if(mainModel.promotionDiscountModel != null && mainModel.promotionDiscountModel.length > 0){
		if(mainModel.promotionDiscountModel[0].type == CONST_DISCOUNT_ITEM_ADD_TYPE_SAVED_SEARCH){
			var savedSearches = [];
			savedSearches.push(mainModel.promotionDiscountModel[0].id);
			
			var itemIds = [];
			for(var i = 0; i < sortedLineItems.length; i++) {

				var itemLine = sortedLineItems[i];		
				itemIds.push(itemLine.itemId);
			}
			
			discountableItemsTable.mapItemsToSavedSearch(itemIds, savedSearches);	
		}
		
		for(var i = 0; i < sortedLineItems.length; i++) {

			var itemLine = sortedLineItems[i];		
			var itemId = itemLine.itemId;
			var quantity = itemLine.quantity;
			var itemTotalAmount = itemLine.itemTotalAmount;
			var itemRate = itemTotalAmount / quantity;
			
			// loop over the promotionDiscountModel
			for(var j = 0; j < mainModel.promotionDiscountModel.length; j++) {

				var obj = mainModel.promotionDiscountModel[j];

				// check the type
				var type = obj.type;
				var id = obj.id;
				var isPercent = obj.isPercent == 'T' ? true : false;
				var amount = obj.amount;
				var limit = obj.limit;
				var isUnit = obj.isUnit == 'T' ? true : false;
				var isFixedPrice = obj.isFixedPrice;

				if(type == CONST_DISCOUNT_ITEM_ADD_TYPE_SAVED_SEARCH) {

//					var itemIds = new Array();
//					itemIds.push(itemId);
	//
//					var filters = new Array();
//					filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', itemIds);
//					var columns = new Array();
//					columns[0] = new nlobjSearchColumn('itemid');
	//
//					var searchObj = nlapiLoadSearch('item', id);
//					searchObj.addFilters(filters);
//					searchObj.addColumns(columns);
//					var searchResult = searchObj.runSearch();
//					var res = searchResult.getResults(0, 10);

//					if(res.length != 0){
					if(discountableItemsTable.isDiscountable(itemId)) {
						var insertDiscountLineItem = itemLine.lineItemNum;

						// determine quantity and limit
						if(limit == 0){
							
							if(isFixedPrice){
								var discAmount = calculateDiscountAmount(itemRate, amount);
								amount = discAmount * quantity;
								isPercent = false;
								
								advPromoLogger('DEBUG', 'Advanced Promotion', 'Applying Promotional Offer (Saved Search), Limit (Units) = 0. Adjusting price of line item [' + insertDiscountLineItem + '] using this amount: ' + amount );
							}
							else{
								advPromoLogger('DEBUG', 'Applying Promotional Offer, Limit (Units) = 0');
								
								if(isPercent == false && itemRate * quantity < amount){
									amount = itemRate * quantity;
								}	
							}
							
							if(amount != 0){
								promotionsOutput.addLineDiscount(insertDiscountLineItem, isPercent, amount);	
							}						
						}
						else if (limit > 0 || !limit){ // limit = undefined (or empty) if SO currency doesn't match promo. if limit = -1, skip promo discount

							if(isPercent){ 

								if(quantity > 0){ // additional checking if quantity = 0 to prevent division by 0 error

									if(isUnit){ // limit is unit
										// get the base price using amount and quantity
										var basePrice = itemTotalAmount / quantity;

										if(limit > quantity){
											// use quantity
											amount = (amount/100 * basePrice) * quantity;
											mainModel.promotionDiscountModel[j].limit = limit - quantity;

											if(mainModel.promotionDiscountModel[j].limit == 0){
												mainModel.promotionDiscountModel[j].limit = -1;
											}
										}
										else{
											// use limit
											amount = (amount/100 * basePrice) * limit;
											mainModel.promotionDiscountModel[j].limit = -1;
										}

										if(amount > 0){
											advPromoLogger('DEBUG', 'Applying Promotional Offer (Saved Search, Percent), Limit (Units)', 'insertDiscountLineItem = ' + insertDiscountLineItem + ', discountItemId = ' + discountItemId + ', isPercent = ' + isPercent + ', amount = ' + amount );
											// Issue 212496 start
											// promotionsOutput.addLineDiscount(insertDiscountLineItem, discountItemId, false, amount);
											promotionsOutput.addLineDiscount(insertDiscountLineItem, false, amount);
											// Issue 212496 end
										}  	
									}
									else { // limit is currency

										var discAmount = 0;

										discAmount = amount/100 * itemTotalAmount;

										if(discAmount > limit){
											discAmount = limit;
										}

										if(discAmount > 0){
											advPromoLogger('DEBUG', 'Applying Promotional Offer (Saved Search, Percent), Limit (Currency)', 'insertDiscountLineItem = ' + insertDiscountLineItem + ', discountItemId = ' + discountItemId + ', isPercent = ' + isPercent + ', amount = ' + amount );
											// Issue 212496 start
											// promotionsOutput.addLineDiscount(insertDiscountLineItem, discountItemId, false, discAmount);
											promotionsOutput.addLineDiscount(insertDiscountLineItem, false, discAmount);
											// Issue 212496 end
										}
									}
								}        					  	
							}
							else{
								
								if(limit > quantity){
									
									// use quantity
									if(isFixedPrice){
										var discAmount = calculateDiscountAmount(itemRate, amount);
										amount = discAmount * quantity;
									}
									else{
										
										if(itemRate < amount){
											amount = itemRate * quantity;
										}
										else{
											amount = amount * quantity;	
										}	
									}

									mainModel.promotionDiscountModel[j].limit = limit - quantity;

									if(mainModel.promotionDiscountModel[j].limit == 0){
										mainModel.promotionDiscountModel[j].limit = -1;
									}
								}
								else{
									
									// use limit
									if(isFixedPrice){
										var discAmount = calculateDiscountAmount(itemRate, amount);
										amount = discAmount * limit;
									}
									else{
										
										if(itemRate < amount){
											amount = itemRate * limit;
										}
										else{
											amount = amount * limit;	
										}	
									}								

									mainModel.promotionDiscountModel[j].limit = -1;
								}

								if(amount > 0){
									advPromoLogger('DEBUG', 'Applying Promotional Offer (Saved Search, Currency), Limit (Units)', 'insertDiscountLineItem = ' + insertDiscountLineItem + ', discountItemId = ' + discountItemId + ', isPercent = ' + isPercent + ', amount = ' + amount );
									// Issue 212496 start
									// promotionsOutput.addLineDiscount(insertDiscountLineItem, discountItemId, isPercent, amount); 
									promotionsOutput.addLineDiscount(insertDiscountLineItem, isPercent, amount);
									// Issue 212496 end
								}
								else if(isFixedPrice && limit > 0 && amount != 0){
									advPromoLogger('DEBUG', 'Advanced Promotion', 'Adjusting price of line item [' + insertDiscountLineItem + '] using this markup: ' + -amount );
									promotionsOutput.addLineDiscount(insertDiscountLineItem, isPercent, amount);
								}
							}    				        				
						}
					}	  	
				}
				else if (type == CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM) {

					// refer to mainModel.
					if(isEligibleItem(itemId, mainModel)){
						var insertDiscountLineItem = itemLine.lineItemNum;

						// determine quantity and limit
						if(limit == 0){ // if limit is empty
							
							if(isFixedPrice){
								var discAmount = calculateDiscountAmount(itemRate, amount);
								amount = discAmount * quantity;
								isPercent = false;
								
								advPromoLogger('DEBUG', 'Advanced Promotion', 'Applying Promotional Offer (Item), Limit (Units) = 0. Adjusting price of line item [' + insertDiscountLineItem + '] using this amount: ' + amount );
							}
							else{
								advPromoLogger('DEBUG', 'Applying Promotional Offer (Item), Limit (Units) = 0');
								
								if(isPercent == false && itemRate * quantity < amount){
									amount = itemRate * quantity;
								}	
							}
							
							if(amount != 0){
								promotionsOutput.addLineDiscount(insertDiscountLineItem, isPercent, amount);	
							}												
						}
						else if (limit > 0 || !limit){ // limit = undefined (or empty) if SO currency doesn't match promo. if limit = -1, skip promo discount
						
							if(isPercent){ 

								if(quantity > 0){ // additional checking if quantity = 0 to prevent division by 0 error

									if(isUnit){ // limit is unit
										// get the base price using amount and quantity
										var basePrice = itemTotalAmount / quantity;

										if(limit > quantity){
											// use quantity
											amount = (amount/100 * basePrice) * quantity;
											mainModel.promotionDiscountModel[j].limit = limit - quantity;

											if(mainModel.promotionDiscountModel[j].limit == 0){
												mainModel.promotionDiscountModel[j].limit = -1;
											}
										}
										else{
											// use limit
											amount = (amount/100 * basePrice) * limit;
											mainModel.promotionDiscountModel[j].limit = -1;
										}

										if(amount > 0){
											advPromoLogger('DEBUG', 'Applying Promotional Offer (Item, Percent), Limit (Units)', 'insertDiscountLineItem = ' + insertDiscountLineItem + ', discountItemId = ' + discountItemId + ', isPercent = ' + isPercent + ', amount = ' + amount );
											// Issue 212496 start
											// promotionsOutput.addLineDiscount(insertDiscountLineItem, discountItemId, false, amount);
											promotionsOutput.addLineDiscount(insertDiscountLineItem, false, amount);
											// Issue 212496 end
										}  	
									}
									else { // limit is currency

										var discAmount = 0;

										discAmount = amount/100 * itemTotalAmount;

										if(discAmount > limit){
											discAmount = limit;
										}

										if(discAmount > 0){
											advPromoLogger('DEBUG', 'Applying Promotional Offer (Item, Percent), Limit (Currency)', 'insertDiscountLineItem = ' + insertDiscountLineItem + ', discountItemId = ' + discountItemId + ', isPercent = ' + isPercent + ', amount = ' + amount );
											// Issue 212496 start
											// promotionsOutput.addLineDiscount(insertDiscountLineItem, discountItemId, false, discAmount);
											promotionsOutput.addLineDiscount(insertDiscountLineItem, false, discAmount);
											// Issue 212496 end
										}
									}
								}        					  	
							}
							else{
								if(limit > quantity){
									
									if(isFixedPrice){
										var discAmount = calculateDiscountAmount(itemRate, amount);
										amount = discAmount * quantity;
									}
									else{

										// use quantity
										if(itemRate < amount){
											amount = itemRate * quantity;
										}
										else{
											amount = amount * quantity;	
										}	
									}								

									mainModel.promotionDiscountModel[j].limit = limit - quantity;

									if(mainModel.promotionDiscountModel[j].limit == 0){
										mainModel.promotionDiscountModel[j].limit = -1;
									}
								}
								else{
									
									if(isFixedPrice){
										var discAmount = calculateDiscountAmount(itemRate, amount);
										amount = discAmount * limit;
									}
									else{
										// use limit
										if(itemRate < amount){
											amount = itemRate * limit;
										}
										else{
											amount = amount * limit;	
										}	
									}								

									mainModel.promotionDiscountModel[j].limit = -1;
								}

//								advPromoLogger('DEBUG', 'amount = ' + amount + ', mainModel.promotionDiscountModel[j].limit = ' + mainModel.promotionDiscountModel[j].limit);

								if(amount > 0){
									advPromoLogger('DEBUG', 'Applying Promotional Offer (Item, Currency), Limit (Units)', 'insertDiscountLineItem = ' + insertDiscountLineItem + ', discountItemId = ' + discountItemId + ', isPercent = ' + isPercent + ', amount = ' + amount );
									promotionsOutput.addLineDiscount(insertDiscountLineItem, isPercent, amount);
								}
								else if(isFixedPrice && limit > 0 && amount != 0){
									advPromoLogger('DEBUG', 'Advanced Promotion', 'Adjusting price of line item [' + insertDiscountLineItem + '] using this markup: ' + -amount );
									promotionsOutput.addLineDiscount(insertDiscountLineItem, isPercent, amount);
								}
							}    				        				
						}
					}

					break; // stop for-loop
				}
			}
		}
	}

	// apply shipping discounts
	applyShippingDiscount(promotionsInput, promotionsOutput, mainModel);
	
	// apply item specific free shipping discount
	applyItemSpecificFreeShipping(mainModel, promotionsOutput);
}

function applyOrderDiscount(promotionsInput, promotionsOutput, mainModel){

	// apply order discount
	var discAmount = 0;

	// check if model is empty
	if(mainModel.promotionDiscountModel.length == 0){
		advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'No order specific promotion applied');
	}
	else{
		debugDetailMsg = '';
		// loop over the promotionDiscountModel. there must be one entry only!
		for(var j = 0; j < mainModel.promotionDiscountModel.length; j++) {

			var obj = mainModel.promotionDiscountModel[j];

			// check the type
			var type = obj.type;
			var id = obj.id;
			var isPercent = (obj.isPercent == 'T' ? true : false);
			var amount = obj.amount;
			var limit = obj.limit;
			var isUnit = (obj.isUnit == 'T' ? true : false);

			debugDetailMsg += 'id = ' + id + ', type = ' + type + ', isPercent = ' + isPercent + ', amount = ' + amount + ', isUnit = ' + isUnit + ', limit = ' + limit + '\n';

			if(isPercent){ 

				if(isUnit){ // limit is unit
					
					if(limit != ''){
						// not supported
						advPromoLogger('ERROR', 'Advanced Promotion Bundle', 'Order Discount Promotional Offer (Percent), Limit (Unit) is not supported.');	
					}
					else{
						var subTotal = promotionsInput.getItemsAmount();
						discAmount = amount/100 * subTotal;

						if(discAmount > 0){
							advPromoLogger('DEBUG', 'Applying Order Discount Promotional Offer (Percent), Limit (None)');
							promotionsOutput.setOrderDiscount(false, discAmount);
						}
					}					
				}
				else { // limit is currency

					var subTotal = promotionsInput.getItemsAmount();
					discAmount = amount/100 * subTotal;

					// if limit is not set
					if(limit != ''){
						if(limit > discAmount){
							// retain discAmount value
						}
						else{
							// use limit
							discAmount = limit;
						}	
					}

					if(discAmount > 0){
						advPromoLogger('DEBUG', 'Applying Order Discount Promotional Offer (Percent), Limit (Currency)');
						promotionsOutput.setOrderDiscount(false, discAmount);
					}
				}      					  	
			}
			else{

				if(isUnit){ // limit is unit
					var subTotal = promotionsInput.getItemsAmount();
					
					// to apply Order Discount amount to Subtotal only (ignore Shipping Charges)
					if(subTotal <= amount){
						discAmount = subTotal;
					}
					else{
						discAmount = amount;	
					}					

					if(discAmount > 0){
						advPromoLogger('DEBUG', 'Applying Order Discount Promotional Offer (Currency), Limit (Unit)');
						promotionsOutput.setOrderDiscount(false, discAmount);
					}
				}
				else { // limit is currency
					// not supported
					advPromoLogger('ERROR', 'Advanced Promotion Bundle', 'Order Discount Promotional Offer (Currency), Limit (Currency) is not supported.');
				}   	
			} 
		}	
		advPromoLogger('DEBUG', 'Order Discount Model', debugDetailMsg);	
	}

	// apply shipping discounts
	applyShippingDiscount(promotionsInput, promotionsOutput, mainModel);
	
	// apply item specific free shipping discount
	applyItemSpecificFreeShipping(mainModel, promotionsOutput);
}

function applyShippingDiscount(promotionsInput, promotionsOutput, mainModel){

	if(mainModel.shippingDiscountModels.length > 0){

		debugDetailMsg = '';
		for(var i = 0; i < mainModel.shippingDiscountModels.length; i++){
			debugDetailMsg += 'shippingCost = ' + mainModel.shippingDiscountModels[i].shippingCost + ', ';
			debugDetailMsg += 'handlingCost = ' + mainModel.shippingDiscountModels[i].handlingCost + ', ';
			debugDetailMsg += 'shippingMethodId = ' + mainModel.shippingDiscountModels[i].shippingMethodId + ', ';
			debugDetailMsg += 'finalShippingCost = ' + mainModel.shippingDiscountModels[i].finalShippingCost + ', ';
			debugDetailMsg += 'applyToSelectedMethod = ' + mainModel.shippingDiscountModels[i].applyToSelectedMethod + ', ';
			debugDetailMsg += 'isPercent = ' + mainModel.shippingDiscountModels[i].isPercent + '\n';	
		}

		advPromoLogger('DEBUG', 'Shipping Discount Model', debugDetailMsg);

		// apply shipping discount
		for(var i = 0; i < mainModel.shippingDiscountModels.length; i++){

			var finalShipping = 0;
			var finalHandling = 0;

			var discountAmount = mainModel.shippingDiscountModels[i].finalShippingCost;
			var shippingActualAmount = mainModel.shippingDiscountModels[i].shippingCost;
			var handlingActualAmount = mainModel.shippingDiscountModels[i].handlingCost;

			if(mainModel.shippingDiscountModels[i].isPercent == 'T'){

				// for multicurrency issue. if SO's currency cannot be found in the shipping discount model, retain original shipping cost
				if(discountAmount == -1){
					discountAmount = 0; // make it 0% off
				}
				
				finalShipping = shippingActualAmount - (discountAmount * 0.01 * shippingActualAmount);
				finalHandling = handlingActualAmount - (discountAmount * 0.01 * handlingActualAmount);

				// to prevent negative amount
				finalShipping = finalShipping < 0 ? 0 : finalShipping;
				finalHandling = finalHandling < 0 ? 0 : finalHandling;

				promotionsOutput.updateShippingCost(
						mainModel.shippingDiscountModels[i].shippingMethodId, 
						finalShipping,
						finalHandling);
				advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'Applied ' + discountAmount +'% off shipping discount to ' 
						+ 'Shipping Cost (' + shippingActualAmount + ') and '
						+ 'Handling Cost (' + handlingActualAmount + ') of '
						+ 'Shipping ID ' + mainModel.shippingDiscountModels[i].shippingMethodId
						+ '. Final Cost: Shipping = ' + finalShipping + ', Handling = ' + finalHandling
				);
			}
			else{
				
				// for multicurrency issue. if SO's currency cannot be found in the shipping discount model, retain original shipping cost
				if(discountAmount == -1){
					
					// make it the actual shipping/handling cost
					finalShipping = shippingActualAmount; 
					finalHandling = handlingActualAmount;
				}
				else{
					
					finalShipping = discountAmount;
					finalHandling = 0;
				}				

				// to prevent negative amount
				finalShipping = finalShipping < 0 ? 0 : finalShipping;

				promotionsOutput.updateShippingCost(
						mainModel.shippingDiscountModels[i].shippingMethodId, 
						finalShipping,
						finalHandling);
				advPromoLogger('DEBUG', 'Advanced Promotion Bundle', 'Applied fixed amount (' + discountAmount + ') shipping discount to '
						+ 'Shipping Cost (' + shippingActualAmount + ') and '
						+ 'Handling Cost (' + handlingActualAmount + ') of '
						+ 'Shipping ID ' + mainModel.shippingDiscountModels[i].shippingMethodId
						+ '. Final Cost: Shipping = ' + finalShipping + ', Handling = ' + finalHandling
				);	
			}	
		}
	}
	else{
		advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'No shipping discount applied.');
	}
}

function applyBogoDiscount(promotionsInput, promotionsOutput, mainModel){
	updateActualPurchasesInEligibilityModel(mainModel);
	
	updateLineItemModelForBxGy(mainModel);
	
	var adjustedLimit = computeAdjustedLimitForBxGy(mainModel);
	
	updatePromotionDiscountModelForBxGy(mainModel, adjustedLimit);
	
	// similar to Item Discount
	applyItemDiscount(promotionsInput, promotionsOutput, mainModel);
}

/*
 * Reads mainModel.isfsDiscountModel, matches it against the item machine (mainModel.lineItemModel) then call and  
 * constructs the parameters for Promotion API setExcludeFromRateRequestJson()
 *
 * @param {mainModel} the global object, "mainModel". an instance of MainModel
 * @param {promotionsOutput} instance of NLPromotionsOutput (in Promotion API)
 * @return {mapParam} the map containing the parameters for setExcludeFromRateRequestJson()
 *
 */
function applyItemSpecificFreeShipping(mainModel, promotionsOutput){
	
	var mapParam = {}; 
	
	// make sure that the ff. conditions are true before processing anything
	// - there is an ISFS rule defined in the promo
	// - there are items in the item machine
	if(mainModel.isfsDiscountModel && mainModel.lineItemModel && mainModel.lineItemModel.length > 0){
		
		mapParam.shippingItemIds = mainModel.isfsDiscountModel.shippingMethodIds;
		mapParam.lineNums = [];
		
		// have a mapping of itemids and line numbers. i.e. item id 1 is found in line num 1, 5, 10
		var idAndLineNumMapping = {};
		for(var i = 0; i < mainModel.lineItemModel.length; i++){
			var itemid = mainModel.lineItemModel[i].itemId;
			
			if(idAndLineNumMapping[itemid]){
				idAndLineNumMapping[itemid].push(mainModel.lineItemModel[i]);
			}
			else{
				idAndLineNumMapping[itemid] = [mainModel.lineItemModel[i]];	
			}
		}
		
		// uniqueItemIds contains the unique itemids in the item machine 
		var uniqueItemIds = Object.keys(idAndLineNumMapping);
		
		// determine the type of ISFS model
		switch(mainModel.isfsDiscountModel.type){
			case CONST_FREE_SHIPPING_TYPE_ITEM:
				
				// loop on uniqueItemIds and see if the itemid is found in isfsDiscountModel.itemIds
				for(var i = 0; i < uniqueItemIds.length; i++){
					var itemid = uniqueItemIds[i];
					
					var res = mainModel.isfsDiscountModel.itemIds.indexOf(parseInt(itemid));
					if(res != -1){
						
						// get all the linenums where item id is found
						for(var j = 0; j < idAndLineNumMapping[itemid].length; j++){
							
							// only support Inventory and Assembly types
							var itemType = idAndLineNumMapping[itemid][j].type;
							switch(itemType){
								case 'InvtPart':
								case 'Assembly':
									mapParam.lineNums.push(idAndLineNumMapping[itemid][j].lineItemNum);		
									break;
							}	
						}
					}
				}		
				
				break;
			case CONST_FREE_SHIPPING_TYPE_ITEM_SEARCH:
				var filters = [
	               	new nlobjSearchFilter('internalid', null, 'anyof', uniqueItemIds)
                ];
				
				var columns = [
		            new nlobjSearchColumn('internalid')
                ];
				
				var searchObj = nlapiLoadSearch('item', mainModel.isfsDiscountModel.savedSearchId);
				searchObj.addFilters(filters);
				searchObj.addColumns(columns);
				var searchResult = searchObj.runSearch();
				var res = searchResult.getResults(0, 1000); // limit of 1000 for now
				
				for (var i = 0; i < res.length; i++){
					var itemid = res[i].getId();
					
					// get all the linenums of result itemids
					for(var j = 0; j < idAndLineNumMapping[itemid].length; j++){
						
						// only support Inventory and Assembly types
						var itemType = idAndLineNumMapping[itemid][j].type;
						switch(itemType){
							case 'InvtPart':
							case 'Assembly':
								mapParam.lineNums.push(idAndLineNumMapping[itemid][j].lineItemNum);		
								break;
						}
					}
				}
				
				break;
		}

		// prevent calling the API if no match in the line items
		if(mapParam.lineNums.length > 0){
			mapParam.lineNums = mapParam.lineNums.sort();

			advPromoLogger('DEBUG', 'Item Specific Free Shipping', 'Passing params ' + JSON.stringify(mapParam));
			
			try{
				promotionsOutput.setExcludeFromRateRequestJson(JSON.stringify(mapParam));	
			}
			catch(e){
				advPromoLogger('DEBUG', 'Item Specific Free Shipping', 'No setExcludeFromRateRequestJson() Promotions API found. Required NetSuite version: 2014.1.');
			}				
		}
		else{
			advPromoLogger('DEBUG', 'Item Specific Free Shipping', 'No applicable items to apply free shipping.');
		}
	}
	else{
		advPromoLogger('DEBUG', 'Item Specific Free Shipping', 'No item specific free shipping rule.');
	}
	
	return mapParam;
}

function isWithinDateRange(promotionsInput, mainModel){
	var ret = false;

	var transactionDate = promotionsInput.getTransactionDate();

	var tDateValue = new Date(transactionDate).valueOf();
	var sDateValue = new Date(mainModel.startDate).valueOf();
	var eDateValue = new Date(mainModel.endDate).valueOf();

	if(tDateValue >= sDateValue && tDateValue <= eDateValue){
		ret = true;
	}
	else{
		ret = false;
	}

	return ret;
}

function isEligibleItem(itemId, mainModel){

	var ret = false;

	if(mainModel.promotionDiscountModel){
		for(var i = 0; i < mainModel.promotionDiscountModel.length; i++){

			var id = mainModel.promotionDiscountModel[i].id;

			if(itemId == id){
				return true;
			}
		}	
	}	

	return ret;
}

function isEligibleOrder(promotionsInput, mainModel, eligibilityModel){

	var ret = false;
	
	// loop over the Eligible Orders. loop over the Line Items. if eligible order match the current line item, go to next eligible order.
	// if flag is set to All Criteria, return false if one eligible order doesn't match the current line item
	// if flag is set to Any Criteria, return true if one eligible match the current line item
	var promoId = promotionsInput.getPromotionId();
	var promoCodeIds = new Array();
	promoCodeIds.push(promoId);

	// if apply to all orders
	if(isAnyOrder(promoId)){
		ret = true;
	}

	var isApplyAnyCriteria = (mainModel.isApplyAnyOrderCriteria == CONST_APPLY_ORDER_CRITERIA_ANY || mainModel.isApplyAnyOrderCriteria == null) ? true : false; 

	// Get all Eligible Orders associated with the Promotion record
	if(mainModel.eligibleOrders.length > 0){
		
		for(var i = 0; i < mainModel.eligibleOrders.length; i++){
			var eorder = mainModel.eligibleOrders[i];
			
			var iId = eorder.eligibleItemIds; 
			var sId = eorder.savedSearchId;
			var type = eorder.type;

			switch(type) {
				case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:
					// additional checking to prevent SSS_INVALID_SRCH_OPERATOR
					if(mainModel.lineItemItemIds != null && mainModel.lineItemItemIds.length > 0){
						var filters = new Array();
						filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', mainModel.lineItemItemIds);
						var columns = new Array();
						columns[0] = new nlobjSearchColumn('internalid');
	
						var searchObj = nlapiLoadSearch('item', sId);
						searchObj.addFilters(filters);
						searchObj.addColumns(columns);
						var searchResult = searchObj.runSearch();
						var res = searchResult.getResults(0, 1000);
						
						for (var j = 0; j < res.length; j++){
							eligibilityModel.addEligibleItem(res[j].getValue(columns[0]), i);
						}
	
						// false = 0; true = 1. false means none of the items are not found in saved search
						if(res.length == 0){
							if(!isApplyAnyCriteria){
								return false;
							}
						}else{
							ret = true;
						}
					}
	
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ITEM:
					// just loop over line item item ids and see if it's present
					var passedItemCriteria = false;
	
					if(iId != null){
	
						for(var k = 0; k < iId.length; k++){
	
							if(mainModel.lineItemItemIds != null && mainModel.lineItemItemIds.length > 0){
								var res = mainModel.lineItemItemIds.indexOf(parseInt(iId[k]));
	
								// if one of the line item item id matches the eligible Ids AND ANY CRITERIA is set, return true
								// else if one of the line item item id matches the eligible Ids AND ANY CRITERIA is NOT set, go to next loop
								// else if one of the line item item id DOESN'T match the eligible Ids AND ANY CRITERIA is set, go to next loop
	
								// false = 0; true = 1
								// this criteria has passed if at least one of the item lines is in the eligible items
								if(res != -1){
									passedItemCriteria = true;
									eligibilityModel.addEligibleItem(iId[k], i);
								}	
							}
						}
						
						if(!passedItemCriteria){
							if(!isApplyAnyCriteria){
								return false;
							}
							//if isApplyAnyCriteria then maintain ret
						}else{
							ret = true;
						}
					}	
					
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:
					ret = true;		
	
					break;
				default:
					break;
			}
		}	
	}
	else{
		ret = true;
	}

	return ret;
}

function isEligibleOrderTiered(promotionsInput, mainModel){

	var ret = false;
	
	var promoId = promotionsInput.getPromotionId();
	var promoCodeIds = new Array();
	promoCodeIds.push(promoId);
	
	if(mainModel.eligibleOrders.length > 0){
		
		for(var i = 0; i < mainModel.eligibleOrders.length; i++){
			var eorder = mainModel.eligibleOrders[i];
			
			var iId = eorder.eligibleItemIds; 
			var sId = eorder.savedSearchId;
			var type = eorder.type;

			switch(type) {
				case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:
					// additional checking to prevent SSS_INVALID_SRCH_OPERATOR
					if(mainModel.lineItemItemIds != null && mainModel.lineItemItemIds.length > 0){
						var filters = new Array();
						filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', mainModel.lineItemItemIds);
						var columns = new Array();
						columns[0] = new nlobjSearchColumn('internalid');
	
						var searchObj = nlapiLoadSearch('item', sId);
						searchObj.addFilters(filters);
						searchObj.addColumns(columns);
						var searchResult = searchObj.runSearch();
						var res = searchResult.getResults(0, 1000);
						
						// false = 0; true = 1. false means none of the items are not found in saved search
						if(res && res.length > 0){
							return true;
						}else{
							return false;
						}
					}
	
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ITEM:
					// just loop over line item item ids and see if it's present
					if(iId != null){
	
						for(var k = 0; k < iId.length; k++){
	
							if(mainModel.lineItemItemIds != null && mainModel.lineItemItemIds.length > 0){
								var res = mainModel.lineItemItemIds.indexOf(parseInt(iId[k]));
	
								if(res != -1){
									return true;
								}	
							}
						}
					}	
					
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:
					ret = true;		
	
					break;
				
				default:
					break;
			}
		}	
	}
	else{
		ret = true;
	}

	return ret;
}

function isEligibleCustomer(customerId, mainModel){

	var ret = false;

	var isApplyAnyCriteria = (parseInt(mainModel.isApplyAnyCustomerCriteria) == parseInt(CONST_APPLY_CUSTOMER_CRITERIA_ANY) || mainModel.isApplyAnyCustomerCriteria == null) ? true : false;

	debugDetailMsg = '';
	if(mainModel.eligibleCustomers != null){

		// check if there's no model. it means that apply it to any customers
		if(mainModel.eligibleCustomers.length == 0){
			return true;
		}

		for(var i = 0; i < mainModel.eligibleCustomers.length; i++){

			var type = mainModel.eligibleCustomers[i].type;
			var id = mainModel.eligibleCustomers[i].id;

			switch(type){
			case CONST_ELIGIBLE_CUSTOMER_TYPE_SAVED_SEARCH:
				// run the Customer Saved Search
				var customerIds = new Array();
				customerIds.push(customerId);

				var filters = new Array();
				filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', customerIds);
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('entityid');

				var searchObj = nlapiLoadSearch('customer', id);
				searchObj.addFilters(filters);
				searchObj.addColumns(columns);
				var searchResult = searchObj.runSearch();
				var res = searchResult.getResults(0, 10);

				if(res.length == 0 && !isApplyAnyCriteria){
					return false;
				}
				else if(res.length == 0){
					ret = false;
				}
				else{
					ret = true;
					if(isApplyAnyCriteria){
						return ret;
					}
				}

				break;
			case CONST_ELIGIBLE_CUSTOMER_TYPE_ID:

				if(mainModel.eligibleCustomers[i].eligibleIds != null && mainModel.eligibleCustomers[i].eligibleIds.length > 0){
					var res = mainModel.eligibleCustomers[i].eligibleIds.indexOf(parseInt(customerId));

					// if one of the line item item id matches the eligible Ids AND ANY CRITERIA is set, return true
					// else if one of the line item item id matches the eligible Ids AND ANY CRITERIA is NOT set, go to next loop
					// else if one of the line item item id DOESN'T match the eligible Ids AND ANY CRITERIA is set, go to next loop
					// else if one of the line item item id DOESN'T match the eligible Ids AND ANY CRITERIA is NOT set, return false

					// false = 0; true = 1
					if(res == -1 && !isApplyAnyCriteria){
						return false;
					}
					else if(res == -1){
						ret = false;
					}
					else{
						ret = true;
						if(isApplyAnyCriteria){
							return ret;
						}
					}	
				}

				break;

			default:
				break;
			}

		}	
	}	

	return ret;
}

function isEligibleByMinimumPurchase(promotionsInput, mainModel, errorModel, eligibilityModel){

	var ret = true;

	var isApplyAnyCriteria = (mainModel.isApplyAnyOrderCriteria == CONST_APPLY_ORDER_CRITERIA_ANY || mainModel.isApplyAnyOrderCriteria == null) ? true : false;
	var minPurchase = 0;
	var isUnit = false;

	// loop over Eligible Orders and get the sum
	if(mainModel.eligibleOrders != null){
		// go through the line item model and compute total amounts and quantities per item
		var itemMachineTotalAmount = 0;
		var itemMachineTotalQuantity = 0;
		
		for(var j = 0; j < mainModel.lineItemModel.length; j++){
			var key = 'item' + mainModel.lineItemModel[j].itemId;
			if (eligibilityModel.eligibleItems[key] != null){
				eligibilityModel.eligibleItems[key]['totalQty'] += mainModel.lineItemModel[j].quantity;
				eligibilityModel.eligibleItems[key]['totalAmt'] += mainModel.lineItemModel[j].itemTotalAmount;
			}
			
			itemMachineTotalAmount += mainModel.lineItemModel[j].itemTotalAmount;
			itemMachineTotalQuantity += mainModel.lineItemModel[j].quantity;
			
		}
		
		for(var i = 0; i < mainModel.eligibleOrders.length; i++){
			
			var o = mainModel.eligibleOrders[i];
			var type = o.type;

			minPurchase = o.minPurchase;
			isUnit = (o.isUnit == 'T' ? true : false);

			var totalAmount = 0; // can be currency or quantity
			
			if(minPurchase == 0 && isUnit == true){
				return false;
			}
			
			switch(type){
				case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:
					totalAmount = eligibilityModel.getEligibleOrderTotal(i, isUnit);
					
					break;
	
				case CONST_ELIGIBLE_ORDER_TYPE_ITEM:
					totalAmount = eligibilityModel.getEligibleOrderTotal(i, isUnit);
					
					break;
					
				case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:
	
					if(isUnit){
						totalAmount = itemMachineTotalQuantity;
					}
					else{
						totalAmount = itemMachineTotalAmount;
					}
	
					break;
				default:
					// do nothing
					break;
			}

			if(minPurchase > totalAmount && !isApplyAnyCriteria){
				if(!isUnit){
					errorModel.failedMinimumPurchase = minPurchase;
				}
				return false;
			}
			else if(minPurchase <= totalAmount){
				mainModel.eligibleOrders[i].passed = true;
				if(isApplyAnyCriteria){
					return true;	
				}				
			}
			else if(minPurchase > totalAmount && isApplyAnyCriteria){
				ret = false;
			}
		}	
	}

	if(ret == false){
		if(!isUnit){
			errorModel.failedMinimumPurchase = minPurchase;
		}	
	}

	return ret;
}

function getSortedLineItems(promotionsInput, descending){
	var ret = Array();

	var lineItems = promotionsInput.getItemLines();
	if(lineItems && lineItems instanceof Array){
		for(var i = 0; i < lineItems.length; i++) {
			var itemLine = lineItems[i];
			var lineItemNum = i + 1;
			var itemId = itemLine.getItemId();
			var quantity = itemLine.getQuantity();
			var itemTotalAmount = itemLine.getAmount();
			var itemType = itemLine.getItemType();

			var o = new SortedLineItemModel();
			o.lineItemNum = lineItemNum;   
			o.itemId = itemId; 
			o.quantity = quantity;
			o.itemTotalAmount = itemTotalAmount;
			o.type = itemType;

			ret.push(o);
		}	

		sortByPrice(ret, descending);	
	}

	return ret;
}

function sortByPrice(arr, descending) {
	
	arr.sort(function(a, b){
		
		// due to floating point limitation (i.e. 6779.97 / 3 = 2259.9900000000002), we are setting the precision to 4 decimal digits for now
		var currPrice = (a.quantity == 0 ? 0 : Math.round(a.itemTotalAmount / a.quantity * 10000) / 10000); 
		var nextPrice = (b.quantity == 0 ? 0 : Math.round(b.itemTotalAmount / b.quantity * 10000) / 10000);
		
		return (descending ? nextPrice - currPrice : currPrice - nextPrice);
	});
}

//Utility Functions
function removeInArray(index, arr){
	arr = arr.slice(0,index).concat(arr.slice(i+index));
}

function isEligibleSite(siteId, mainModel){
	// Site is always eligible when working wtihin netsuite
	if(siteId == 0){
		return true;
	}
	if(mainModel.siteId != null){
		for(var i = 0; i < mainModel.siteId.length; i++){
			if(siteId == mainModel.siteId[i]){
				return true;
			}
		}
	}
	return false;
}

function isEligibleSubsidiary(subsidiaryId, promoId, discountId){
	if(!nlapiGetContext().getFeature('SUBSIDIARIES')){ //rwong
		return true;
	} else {
//		var recPromoCode = nlapiLoadRecord('promotioncode', promoId);
//		var fldDiscount = promoRecord.getFieldValue('discount');
		var fldDiscount = discountId;

		// if discount item == partner discount, default subsidiary is parent subsidiary or subsidiary id = 1
		if(fldDiscount == -6){
			return true;
		}

		var filters = new Array();
		var columns = new Array();

		filters.push(new nlobjSearchFilter('internalid', null, 'is', fldDiscount));
		columns.push(new nlobjSearchColumn('subsidiary'));

		var searchResult = nlapiSearchRecord('discountitem', null, filters, columns);

		for(var i in searchResult){
			if(subsidiaryId == searchResult[i].getValue('subsidiary')){
				return true;
			}
		}
	}
	return false;
}

function advPromoLogger(logLevel, title, detail){
	if(AdvPromo_PG_Library.CONFIG.showDebugMessages){
		nlapiLogExecution(logLevel, title, detail);
	}
}

function computeAdjustedLimitForBxGy(mainModel){
	// 2 cases: 
	// 1st - Discount has matching Eligibility condition
	// 2nd - Discount has no matching Eligibility condition
	// 
	// Algorithm: Use the Line Item Model and find the first row that has a 'T' in 'hasDiscount'. Then refer to the Eligibility Model to get the difference between Actual and Minimum Purchase
	
	var ret = 0;
	
	for(var i = 0; i < mainModel.lineItemModel.length; i++){
		var itemModel = mainModel.lineItemModel[i];

		var itemHasDiscount = itemModel.hasDiscount;
		var itemEligModelIndex = itemModel.eligModelIndex;
		var itemDiscModelIndex = itemModel.discModelIndex;
		
		if(itemHasDiscount == 'T'){
			
			// if line item has no matching eligibility, get the minimum between item qty and limit
			if(itemEligModelIndex == -1){
				var discModel = mainModel.promotionDiscountModel[itemDiscModelIndex];
				
				// additional checking if discount type is CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM
				if(discModel.type == CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM){
					if(discModel.limit != ''){
						ret += parseInt(discModel.limit);	
					}
					else{
						ret += parseInt(itemModel.quantity); // get the sum of B items
					}
				}
				else {
					if(discModel.limit != ''){
						ret = parseInt(discModel.limit);	
					}
					else{
						ret += parseInt(itemModel.quantity); // get the sum of B items
					}
				}					
			}
			else { // else, compute the difference between Actual and Minimum Purchase in Eligibility Model
				
				var discModel = mainModel.promotionDiscountModel[itemDiscModelIndex];
				
				var eorder = mainModel.eligibleOrders[itemEligModelIndex];
				
				var minPurchase = eorder.minPurchase;
				var actualPurchase = eorder.actualPurchase;
				
				var discountableAmount = actualPurchase - minPurchase;
				discountableAmount = discountableAmount > 0 ? discountableAmount : 0;
				
				// additional checking if discount type is CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM
				if(discModel.type == CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM){
					if(eorder.type == CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS){
						ret = discountableAmount;
					}
					else{
						ret += discountableAmount;
					}					 
				}
				else {
					if(eorder.type == CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS){
						
						var discountableLimit = parseInt(discModel.limit);
						
						if(discModel.limit != '' && discountableAmount > discountableLimit){
							
							ret = discountableLimit;	
						}
						else{
							ret = discountableAmount;
						}
					}
					else{
						if(discModel.limit != ''){
							ret = parseInt(discModel.limit);	
						}
						else{
							ret += parseInt(itemModel.quantity); 
						}	
					}
				}				
			}
		}
	}	
	
	return ret;
}

function markItemWithEligibility(itemId, indexInLineItemModel, mainModel){
	
	for(var i = 0; i < mainModel.eligibleOrders.length; i++){
		
		var eorder = mainModel.eligibleOrders[i];
		var eorderType = eorder.type;
		
		switch(eorderType){
			case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:
				var ids = new Array();
				ids.push(itemId);
		
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', ids);
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('itemid');
		
				var searchObj = nlapiLoadSearch('item', eorder.savedSearchId);
				searchObj.addFilters(filters);
				searchObj.addColumns(columns);
				var searchResult = searchObj.runSearch();
				var res = searchResult.getResults(0, 10);
		
				if(res.length > 0){
					
					if(eorder.passed){
						mainModel.lineItemModel[indexInLineItemModel].hasEligibility = 'T';
						mainModel.lineItemModel[indexInLineItemModel].eligModelIndex = i;
						
						return true;	
					}					
				}
		
				break;
			case CONST_ELIGIBLE_ORDER_TYPE_ITEM:
		
				if(eorder.eligibleItemIds != null){
		
					var idIndex = eorder.eligibleItemIds.indexOf(parseInt(itemId));
		
					if(idIndex != -1){
						
						if(eorder.passed){
							mainModel.lineItemModel[indexInLineItemModel].hasEligibility = 'T';
							mainModel.lineItemModel[indexInLineItemModel].eligModelIndex = i;
							
							return true;	
						}
					}
				}
		
				break;
			case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:
		
				mainModel.lineItemModel[indexInLineItemModel].hasEligibility = 'T';
				mainModel.lineItemModel[indexInLineItemModel].eligModelIndex = i;
				
				return true;
				
				// what if there's a Saved Search or Item Eligibility too?
		}				
	}
	
	return false;
}

function markItemWithDiscount(itemId, indexInLineItemModel, mainModel){
	
	for(var i = 0; i < mainModel.promotionDiscountModel.length; i++){
		
		var promo = mainModel.promotionDiscountModel[i];
		var pType = promo.type;
		var pId = promo.id;
		
		switch(pType){
			case CONST_DISCOUNT_ITEM_ADD_TYPE_SAVED_SEARCH:
				var ids = new Array();
				ids.push(itemId);
		
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', ids);
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('itemid');
		
				var searchObj = nlapiLoadSearch('item', pId);
				searchObj.addFilters(filters);
				searchObj.addColumns(columns);
				var searchResult = searchObj.runSearch();
				var res = searchResult.getResults(0, 10);
		
				if(res.length > 0){
					mainModel.lineItemModel[indexInLineItemModel].hasDiscount = 'T';
					mainModel.lineItemModel[indexInLineItemModel].discModelIndex = i;
					
					return true;
				}
		
				break;
			case CONST_DISCOUNT_ITEM_ADD_TYPE_ITEM:
		
				if(parseInt(itemId) == parseInt(pId)){
					mainModel.lineItemModel[indexInLineItemModel].hasDiscount = 'T';
					mainModel.lineItemModel[indexInLineItemModel].discModelIndex = i;
					
					return true;
				}
		
				break;
		}				
	}
	
	return false;
}

function updateActualPurchasesInEligibilityModel(mainModel){
	// loop over the Eligible Order model and update the actual purchases
	for(var i = 0; i < mainModel.eligibleOrders.length; i++){
		var eorder = mainModel.eligibleOrders[i];

		var eorderType = eorder.type;
		var eorderIsUnit = eorder.isUnit;		

		// get the actual purchase based on the line items
		for(var j = 0; j < mainModel.lineItemModel.length; j++){
			var itemModel = mainModel.lineItemModel[j];

			var itemId = itemModel.itemId;
			var itemQty = itemModel.quantity;
//			var itemTotalAmount = itemModel.itemTotalAmount;

			var matched = false;

			switch(eorderType){
				case CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH:
					var ids = new Array();
					ids.push(itemId);
	
					var filters = new Array();
					filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', ids);
					var columns = new Array();
					columns[0] = new nlobjSearchColumn('itemid');
	
					var searchObj = nlapiLoadSearch('item', eorder.savedSearchId);
					searchObj.addFilters(filters);
					searchObj.addColumns(columns);
					var searchResult = searchObj.runSearch();
					var res = searchResult.getResults(0, 10);
	
					if(res.length > 0){
						matched = true;
					}
	
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ITEM:
	
					if(eorder.eligibleItemIds != null){
	
						var idIndex = eorder.eligibleItemIds.indexOf(parseInt(itemId));
	
						if(idIndex != -1){
							matched = true;
						}
					}
	
					break;
				case CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS:
	
					matched = true;
	
					break;
			}				

			if(matched){
//				eorder.eligibleItemIdsInItemMachine.push(parseInt(itemId));

				if(eorderIsUnit == 'T'){
					mainModel.eligibleOrders[i].actualPurchase = mainModel.eligibleOrders[i].actualPurchase + itemQty;

					if(eorderType == CONST_ELIGIBLE_ORDER_TYPE_ALL_ITEMS){
						var totalPurchase = 0;

						for(var k = 0; k < mainModel.lineItemModel.length; k++){
							var currItemModel = mainModel.lineItemModel[k];

							totalPurchase += currItemModel.quantity;
						}

						mainModel.eligibleOrders[i].actualPurchase = totalPurchase;
					}
					
					// set the allowed items
					var allowedItems = parseInt(mainModel.eligibleOrders[i].actualPurchase) - parseInt(mainModel.eligibleOrders[i].minPurchase);
					allowedItems = allowedItems < 0 ? 0 : allowedItems;
					mainModel.eligibleOrders[i].remainingEligibleItemsForBxGy = allowedItems;
				}
				else{
					mainModel.eligibleOrders[i].actualPurchase = 0;
					advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'Currency value for Buy X Minimum Purchase is not supported');
				}
			}
		}
	}

	debugDetailMsg = '';
	for(var i = 0; i < mainModel.eligibleOrders.length; i++){
		var o = mainModel.eligibleOrders[i];

		var eids = '';
		if(o.eligibleItemIds != null){
			for(var j = 0; j < o.eligibleItemIds.length; j++){
				eids += o.eligibleItemIds[j] + ', ';
			}	
		}

		var eidsInItemMach = '';
		if(o.eligibleItemIdsInItemMachine != null){
			for(var j = 0; j < o.eligibleItemIdsInItemMachine.length; j++){
				eidsInItemMach += o.eligibleItemIdsInItemMachine[j] + ', ';
			}	
		}

		debugDetailMsg += 'id = ' + o.id + ', type = ' + o.type + ', minPurchase = ' + o.minPurchase + ', isUnit = ' + o.isUnit + ', savedSearchId = ' + o.savedSearchId 
		+ ', eligibleIds = ' + eids 
		+ ', actualPurchase = ' + o.actualPurchase
		+ ', eidsInItemMach = ' + eidsInItemMach
		+ ', passed = ' + o.passed
		+ ', remainingEligibleItemsForBxGy = ' + o.remainingEligibleItemsForBxGy
		+ '\n';
	}
	advPromoLogger('DEBUG', 'Eligible Orders (Processed)', debugDetailMsg);
}

function updateLineItemModelForBxGy(mainModel){
	
	for(var i = 0; i < mainModel.lineItemModel.length; i++){
		var currItemModel = mainModel.lineItemModel[i];

		markItemWithEligibility(currItemModel.itemId, i, mainModel);
		markItemWithDiscount(currItemModel.itemId, i, mainModel);
	}
	
	// update quantities
	for(var i = 0; i < mainModel.lineItemModel.length; i++){
		var lineItem = mainModel.lineItemModel[i];
		var lineItemRate = lineItem.itemTotalAmount / lineItem.quantity;

		if(lineItem.hasEligibility == 'T' && lineItem.hasDiscount == 'T'){
			// get the diff between minimum purchase and actual quantity
			// logic is different if Item and Saved Search
			if(mainModel.eligibleOrders[lineItem.eligModelIndex].type == CONST_ELIGIBLE_ORDER_TYPE_ITEM){
				var remainingEligibleItems = mainModel.eligibleOrders[lineItem.eligModelIndex].remainingEligibleItemsForBxGy;
				
				if(remainingEligibleItems > 0){
					if(lineItem.quantity > remainingEligibleItems){
						mainModel.lineItemModel[i].quantity = remainingEligibleItems;
						mainModel.lineItemModel[i].itemTotalAmount = remainingEligibleItems * lineItemRate;
						
						mainModel.eligibleOrders[lineItem.eligModelIndex].remainingEligibleItemsForBxGy = 0;
					}
					else{
						remainingEligibleItems -= parseInt(mainModel.lineItemModel[i].quantity);
						remainingEligibleItems = remainingEligibleItems < 0 ? 0 : remainingEligibleItems;
						
						mainModel.eligibleOrders[lineItem.eligModelIndex].remainingEligibleItemsForBxGy = remainingEligibleItems;
					}
				}
				else{
					mainModel.lineItemModel[i].quantity = 0;
					mainModel.lineItemModel[i].itemTotalAmount = 0;
				}
			}
			else if(mainModel.eligibleOrders[lineItem.eligModelIndex].type == CONST_ELIGIBLE_ORDER_TYPE_SAVED_SEARCH){
				var remainingEligibleItems = mainModel.eligibleOrders[lineItem.eligModelIndex].remainingEligibleItemsForBxGy;
				
				if(remainingEligibleItems > 0){
					if(lineItem.quantity > remainingEligibleItems){
						mainModel.lineItemModel[i].quantity = remainingEligibleItems;
						mainModel.lineItemModel[i].itemTotalAmount = remainingEligibleItems * lineItemRate;
						
						mainModel.eligibleOrders[lineItem.eligModelIndex].remainingEligibleItemsForBxGy = 0;
					}
					else{
						remainingEligibleItems -= parseInt(mainModel.lineItemModel[i].quantity);
						remainingEligibleItems = remainingEligibleItems < 0 ? 0 : remainingEligibleItems;
						
						mainModel.eligibleOrders[lineItem.eligModelIndex].remainingEligibleItemsForBxGy = remainingEligibleItems;
					}
				}
				else{
					mainModel.lineItemModel[i].quantity = 0;
					mainModel.lineItemModel[i].itemTotalAmount = 0;
				}
			}
		}		
	}
	
	debugDetailMsg = '';
	for(var i = 0; i < mainModel.lineItemModel.length; i++){
		var lineItem = mainModel.lineItemModel[i];

		debugDetailMsg += 'itemId = ' + lineItem.itemId
		+ ', lineItemNum = ' + lineItem.lineItemNum   
		+ ', quantity = ' + lineItem.quantity
		+ ', itemTotalAmount = ' + lineItem.itemTotalAmount
		+ ', hasEligibility = ' + lineItem.hasEligibility
		+ ', hasDiscount = ' + lineItem.hasDiscount
		+ ', eligModelIndex = ' + lineItem.eligModelIndex
		+ '\n';
	}
	advPromoLogger('DEBUG', 'Line Items (Processed)', debugDetailMsg);	
}

function updatePromotionDiscountModelForBxGy(mainModel, adjustedLimit){
	// adjust the promotion discount model
	for(var j = 0; j < mainModel.promotionDiscountModel.length; j++){ // length of this will be more than one if promoType is ITEM

		if(j > 0){ // means promoType is ITEM
			break;
		}

		var promo = mainModel.promotionDiscountModel[j];

		var promoLimit = promo.limit;
		var promoIsUnit = promo.isUnit;

		// if limit is empty
		if(promoLimit == null || promoLimit == ''){
			mainModel.promotionDiscountModel[0].limit = adjustedLimit;
		}
		
		if(promoIsUnit == 'T'){
			if(promoLimit >= adjustedLimit){
				mainModel.promotionDiscountModel[0].limit = adjustedLimit;
			}

			if(mainModel.promotionDiscountModel[0].limit <= 0){
				mainModel.promotionDiscountModel[0].limit = -1;
			}	
		}
		else{
			mainModel.promotionDiscountModel[0].limit = -1;
			advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'Currency value for Get Y Limit is not supported');
		}
	}

	debugDetailMsg = '';
	for(var i = 0; i < mainModel.promotionDiscountModel.length; i++){
		var o = mainModel.promotionDiscountModel[i];
		debugDetailMsg += i + ' - id = ' + o.id + ', type = ' + o.type + ', isPercent = ' + o.isPercent + ', amount = ' + o.amount + ', isUnit = ' + o.isUnit + ', limit = ' + o.limit + '\n';
	}
	advPromoLogger('DEBUG', 'Promotion Discount (Processed)', debugDetailMsg);
}

function calculateDiscountAmount(oldPrice, newPrice){
	var ret = 0;
	
	ret = parseFloat(oldPrice).toFixed(2) - parseFloat(newPrice).toFixed(2);
	
	return ret;
}

function convertToArray(stringList){
	var ret = null;
	
	if(stringList){
		ret = stringList.split(',');
	}
	
	return ret;
}