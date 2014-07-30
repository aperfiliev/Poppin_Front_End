/**
 * Plug-in script for Item Specific Promotion
 *
 * Version    Date            Author           Remarks
 * 1.00       16 Nov 2011     adimaunahan
 *                            rwong
 *
 */

function getPromotionDiscount(promotionsInput, promotionsOutput){
	
	try{
		advPromoLogger('DEBUG', 'using Item Specific plugin');
		advPromoLogger('DEBUG', 'Available usage: ' + nlapiGetContext().getRemainingUsage());
		
		var promotionsInputModel = new AdvPromoPromotionInputModel(promotionsInput);
		
		// available APIs
		var executionContext = nlapiGetContext().getExecutionContext();
		var promoId = promotionsInputModel.getPromotionId();
		var customerId = promotionsInputModel.getCustomerId();
		var currencyId = promotionsInputModel.getCurrencyId();
		var itemsAmount = promotionsInputModel.getItemsAmount();
		var transactionDate = promotionsInputModel.getTransactionDate();
		var shippingItemId = promotionsInputModel.getSelectedShippingItemId();
		var lineItems = promotionsInputModel.getItemLines();
		var shippingItems = promotionsInputModel.getShippingItems();
		var subsidiaryId = promotionsInputModel.getSubsidiaryId();
		var siteId = promotionsInputModel.getSiteId();

		advPromoLogger('DEBUG', 'Promotions Input', 
				'executionContext = ' + executionContext // debugger, webstore
				+ '\n' + 'promotionId = ' + promoId
				+ '\n' + 'customerId = ' + customerId
				+ '\n' + 'currencyId = ' + currencyId
				+ '\n' + 'itemsAmount = ' + itemsAmount
				+ '\n' + 'transactionDate = ' + transactionDate
				+ '\n' + 'shippingItemId = ' + shippingItemId
				+ '\n' + 'lineItems.length = ' + lineItems.length
				+ '\n' + 'shippingItems.length = ' + shippingItems.length
				+ '\n' + 'subsidiaryId = ' + subsidiaryId
				+ '\n' + 'siteId = ' + siteId
		);

		var itemLines = promotionsInputModel.getItemLines();
		debugDetailMsg = '';
		for (var i = 0; i < itemLines.length; i++)
		{
			var itemLine = itemLines[i];
			debugDetailMsg += 'Line number = ' + itemLine.getLineNum() + ', ' +
			'Item type = ' + itemLine.getItemType() + ', ' +
			'Item ID = ' + itemLine.getItemId() + ', ' +
			'Quantity = ' + itemLine.getQuantity() + ', ' + 
			'Amount = ' + itemLine.getAmount() + '.\n';
		}
		advPromoLogger('DEBUG', 'Item Machines', debugDetailMsg);
		
		// retrieve essential fields from Promotion Record
		var fields = ['custrecord_advpromo_subsidiary', 'custrecord_advpromo_is_tiered'];
		var columns = nlapiLookupField('promotioncode', promoId, fields);
		var isTiered = columns.custrecord_advpromo_is_tiered;
		var promoRecord = null;
//		var promoRecord = nlapiLoadRecord('promotioncode', promoId);
		var isApplyToAllOrders = isAnyOrder(promoId); //promoRecord.getFieldValue('custrecord_advpromo_all_orders');
//		var isPercent = promoRecord.getFieldValue('discounttype');
//		var promoRate = promoRecord.getFieldValue('rate');
//		var promoSubsidiaryIds = promoRecord.getFieldValues('custrecord_advpromo_subsidiary');
//		var promoSiteIds = promoRecord.getFieldValues('custrecord_advpromo_channel');
//		var isTiered = promoRecord.getFieldValue('custrecord_advpromo_is_tiered');

		if(!nlapiGetContext().getFeature('SUBSIDIARIES')){ //rwong
			var subsidiaries = columns.custrecord_advpromo_subsidiary;
			if(subsidiaries == ''){
//				promoRecord.setFieldValue('custrecord_advpromo_subsidiary', 1);
//				nlapiSubmitRecord(promoRecord, true, true);
				nlapiSubmitField('promotioncode', promoId, 'custrecord_advpromo_subsidiary', 1);
			}
		}

		advPromoLogger('DEBUG', 'Promotion Record', 
				'isApplyToAllOrders = ' + isApplyToAllOrders
				+ '\n' + 'isTiered = ' + isTiered
		);

		if(isTiered == 'T'){
			initializeTieredModel(promotionsInputModel, promoId, promoRecord);
		}
		else{
			initializeModel(promotionsInputModel, promotionsOutput, promoId, promoRecord);	
		}		

		advPromoLogger('DEBUG', 'Apply Criteria',  
			'Actual Field Values: ' + mainModel.isApplyAnyCustomerCriteria + ', ' + mainModel.isApplyAnyOrderCriteria + '\n' +
			'Eligibility > Customer : ' +
			(mainModel.isApplyAnyCustomerCriteria == CONST_APPLY_CUSTOMER_CRITERIA_ANY || mainModel.isApplyAnyCustomerCriteria == null
					? 'Any Criteria' : 'All Criteria') + '\n' +
					'Eligibility > Order : ' +
					(mainModel.isApplyAnyOrderCriteria == CONST_APPLY_ORDER_CRITERIA_ANY || mainModel.isApplyAnyOrderCriteria == null 
							? 'Any Criteria' : 'All Criteria') + '\n' +
			'Apply Discount to Highest Valued Item = ' + mainModel.discountHighestPriceFirst
		);		
		
		debugDetailMsg = '';
		for(var i = 0; i < mainModel.eligibleCustomers.length; i++){
			debugDetailMsg += 'id = ' + mainModel.eligibleCustomers[i].id 
			+ ', type = ' + mainModel.eligibleCustomers[i].type 
			+ ', group = ' + mainModel.eligibleCustomers[i].group
			+ ', ids = ' + mainModel.eligibleCustomers[i].eligibleIds
			+ '\n';
		}
		advPromoLogger('DEBUG', 'Eligible Customer Model', debugDetailMsg);
		
		var isEligible = isEligibleCart(promotionsInputModel, mainModel, errorModel);
		advPromoLogger('DEBUG', 'isEligibleCart = ' + isEligible);
		
		if(isEligible){
			// if tiered, update the mainModel again and use the correct tier level
			if(isTiered == 'T'){
				updateMainModelWithTier(promotionsInputModel, mainModel);	
			}	
			
			debugDetailMsg = '';
			for(var i = 0; i < mainModel.promotionDiscountModel.length; i++){
				var o = mainModel.promotionDiscountModel[i];
				debugDetailMsg += 'promotionDiscountModel[' + i + ']\n'
					+ 'id = ' + o.id + '\n' 
					+ 'type = ' + o.type + '\n' 
					+ 'isPercent = ' + o.isPercent + '\n' 
					+ 'amount = ' + o.amount + '\n' 
					+ 'isUnit = ' + o.isUnit + '\n' 
					+ 'limit = ' + o.limit + '\n'
					+ 'isFixedPrice = ' + o.isFixedPrice + '\n'
					+ '\n';
			}
			advPromoLogger('DEBUG', 'Promotion Discount (before)', debugDetailMsg);
			
			
			applyItemDiscount(promotionsInputModel, promotionsOutput, mainModel);
			
			
		}
		else{
			if(errorModel.failedMinimumPurchase == null && errorModel.failedSite == null && errorModel.failedSubsidiary == null){
				promotionsOutput.setPromotionError("NO_APPLICABLE_ITEMS_FOUND");
				advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'setting NO_APPLICABLE_ITEMS_FOUND error');	
			}
			else if(errorModel.failedMinimumPurchase != null){
				promotionsOutput.addPromotionErrorParameter(errorModel.failedMinimumPurchase);
				promotionsOutput.setPromotionError("A_MINIMUM_ORDER_AMOUNT_OF_1_IS_REQUIRED_TO_USE_THIS_COUPON_CODE");
				advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'setting A_MINIMUM_ORDER_AMOUNT_OF_1_IS_REQUIRED_TO_USE_THIS_COUPON_CODE error');	
			}
			else if(errorModel.failedSite == true){
				promotionsOutput.setPromotionError("THIS_COUPON_DOES_NOT_APPLY_TO_THIS_SITE");
				advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'setting THIS_COUPON_DOES_NOT_APPLY_TO_THIS_SITE');
			} 
			else if (errorModel.failedSubsidiary == true){
				promotionsOutput.setPromotionError("THIS_COUPON_DOES_NOT_APPLY_TO_THIS_SUBSIDIARY");
				advPromoLogger('AUDIT', 'Advanced Promotion Bundle', 'setting THIS_COUPON_DOES_NOT_APPLY_TO_THIS_SUBSIDIARY');
			}
		}

		debugDetailMsg = '';
		for(var i = 0; i < mainModel.lineItemItemIds.length; i++){
			debugDetailMsg += i + ' - ' + mainModel.lineItemItemIds[i] + '\n';
		}
		advPromoLogger('DEBUG', 'Line Item IDs', debugDetailMsg);		

		debugDetailMsg = '';
		for(var i = 0; i < mainModel.eligibleOrders.length; i++){
			var o = mainModel.eligibleOrders[i];

			debugDetailMsg += ''
				+ '\n iid/sid = ' + o.id 
				+ '\n type = ' + o.type 
				+ '\n minPurchase = ' + o.minPurchase 
				+ '\n isUnit = ' + o.isUnit
				+ '\n eligibleItemIds = ' + o.eligibleItemIds
				+ '\n savedSearchId = ' + o.savedSearchId
				+ '\n actualPurchase = ' + o.actualPurchase
				+ '\n eligibleItemIdsInItemMachine = ' + o.eligibleItemIdsInItemMachine
				+ '\n passed = ' + o.passed
				+ '\n remainingEligibleItemsForBxGy = ' + o.remainingEligibleItemsForBxGy
				+ '\n';
			}
		advPromoLogger('DEBUG', 'Eligible Orders', debugDetailMsg);

		debugDetailMsg = '';
		for(var i = 0; i < mainModel.promotionDiscountModel.length; i++){
			var o = mainModel.promotionDiscountModel[i];
			debugDetailMsg += 'promotionDiscountModel[' + i + ']\n'
				+ 'id = ' + o.id + '\n' 
				+ 'type = ' + o.type + '\n' 
				+ 'isPercent = ' + o.isPercent + '\n' 
				+ 'amount = ' + o.amount + '\n' 
				+ 'isUnit = ' + o.isUnit + '\n' 
				+ 'limit = ' + o.limit + '\n'
				+ 'isFixedPrice = ' + o.isFixedPrice + '\n'
				+ '\n';;
		}
		advPromoLogger('DEBUG', 'Promotion Discount', debugDetailMsg);
		
		advPromoLogger('DEBUG', 'Plugin complete.');
		advPromoLogger('DEBUG', 'Remaining usage: ' + nlapiGetContext().getRemainingUsage());
	}
	catch(e)
	{
		if (e instanceof nlobjError) 
		{
			advPromoLogger(
					'ERROR',
					'nlobjError exception',
					e.getCode() + ', ' +
					e.getDetails() + ', ' +
					e.getStackTrace()
			);
		} 
		else 
		{
			advPromoLogger(
					'ERROR',
					'exception',
					e.name + ', ' +
					e.message 
			);
		}
	}
}

function getName(locale, NLSingleStringOutput){
	NLSingleStringOutput.setString('Item-Based Promotions');
}

function getFormName(nullInput, NLSingleStringOutput){
	NLSingleStringOutput.setString('Item Specific Promotion Form');
}