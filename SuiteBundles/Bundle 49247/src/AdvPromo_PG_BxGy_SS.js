/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Mar 2012     adimaunahan
 *
 */

function getPromotionDiscount(promotionsInput, promotionsOutput){

	try{
		advPromoLogger('DEBUG', 'using Buy X Get Y plugin');
		advPromoLogger('DEBUG', 'Available usage: ' + nlapiGetContext().getRemainingUsage());

		var promotionsInputModel = new AdvPromoPromotionInputModel(promotionsInput);
		
		var promoId = promotionsInputModel.getPromotionId();
		var promoRecord = null;		
		var fields = ['custrecord_advpromo_subsidiary', 'custrecord_advpromo_is_tiered'];
		var columns = nlapiLookupField('promotioncode', promoId, fields);
		var isTiered = columns.custrecord_advpromo_is_tiered;

		if(!nlapiGetContext().getFeature('SUBSIDIARIES')){ //rwong
//			if(promoRecord.getFieldValue('custrecord_advpromo_subsidiary') == ''){
//				promoRecord.setFieldValue('custrecord_advpromo_subsidiary', 1);
//				nlapiSubmitRecord(promoRecord, true, true);
//			}
			
			var subsidiaries = columns.custrecord_advpromo_subsidiary;
			if(subsidiaries == ''){
				nlapiSubmitField('promotioncode', promoId, 'custrecord_advpromo_subsidiary', 1);
			}
		}

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

		var isEligible = isEligibleCart(promotionsInputModel, mainModel, errorModel);
		advPromoLogger('DEBUG', 'isEligibleCart = ' + isEligible);

		if(isEligible){
			// if tiered, update the mainModel again and use the correct tier level
			if(isTiered == 'T'){
				updateMainModelWithTier(promotionsInputModel, mainModel);	
			}
			
			applyBogoDiscount(promotionsInputModel, promotionsOutput, mainModel);
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
		for(var i = 0; i < mainModel.eligibleOrders.length; i++){
			var o = mainModel.eligibleOrders[i];

			debugDetailMsg += 'iid/sid = ' + o.id + ', type = ' + o.type + ', minPurchase = ' + o.minPurchase + ', isUnit = ' + o.isUnit + '\n';
		}
		advPromoLogger('DEBUG', 'Eligible Orders', debugDetailMsg);

		debugDetailMsg = '';
		for(var i = 0; i < mainModel.promotionDiscountModel.length; i++){
			var o = mainModel.promotionDiscountModel[i];
			debugDetailMsg += i + ' - id = ' + o.id + ', type = ' + o.type + ', isPercent = ' + o.isPercent + ', amount = ' + o.amount + ', isUnit = ' + o.isUnit + ', limit = ' + o.limit + '\n';
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
					'nlobjError exception.' +
					e.getCode() + ', ' +
					e.getDetails() + ', ' +
					e.getStackTrace()
			);
		} 
		else 
		{
			advPromoLogger(
					'ERROR',
					'exception. ' +
					e.name + ', ' +
					e.message 
			);
		}
	}	
}

function getName(locale, NLSingleStringOutput){
	NLSingleStringOutput.setString('Buy X, Get Y Promotions');
}

function getFormName(nullInput, NLSingleStringOutput){
	NLSingleStringOutput.setString('Buy X Get Y Promotion Form');
}
