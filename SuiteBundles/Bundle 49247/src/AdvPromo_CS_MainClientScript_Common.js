/**
 * Common/Utility functions used in the main client scripts of Item, Order, Buy X Get Y entry forms
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Dec 2014     adimaunahan
 *                            
 */


function compareIsfsSublistModels(oldModel, newModel) {
	var ret = {};
	
	oldModel = oldModel ? oldModel : {op: ''};
	newModel = newModel ? newModel : {op: ''};
	
	switch(newModel.op){
		case '':
			ret = oldModel;
			
			break;
		case 'N':
			if(oldModel.discId){
				// if record is already in DB
				ret.op = 'E';
				ret.discId = oldModel.discId; 
				if(newModel.itemIds) ret.itemIds = newModel.itemIds;
				if(newModel.searchId) ret.searchId = newModel.searchId;
				ret.shipIds = newModel.shipIds;
			}
			else{
				// if new record
				ret.op = 'N';
				if(newModel.itemIds) ret.itemIds = newModel.itemIds;
				if(newModel.searchId) ret.searchId = newModel.searchId;
				ret.shipIds = newModel.shipIds;
			}
			
			break;
		case 'E':
			if(oldModel.discId){
				// if record is already in DB
				ret.op = 'E';
				ret.discId = oldModel.discId; 
				if(newModel.itemIds) ret.itemIds = newModel.itemIds;
				if(newModel.searchId) ret.searchId = newModel.searchId;
				ret.shipIds = newModel.shipIds;
			}
			else{
				// if new record
				ret.op = 'N';
				if(newModel.itemIds) ret.itemIds = newModel.itemIds;
				if(newModel.searchId) ret.searchId = newModel.searchId;
				ret.shipIds = newModel.shipIds;
			}
			
			break;
		case 'D':
			if(oldModel.discId){
				// if record is already in DB
				ret.op = 'D';
				ret.delId = oldModel.discId;
			}
			else{
				// if new record, then do nothing
				ret.op = '';
			}			
			
			break;
	}
	
	return ret;
}

/*
 * Function that displays the Free Shipping rule in the Discount tab sublist by reading from the isfShippingObj or 
 *    origIsfShippingObj global variable. On page load, it uses the origIsfShippingObj, but on succeeding
 *    operations, i.e. new/edit/delete of free shipping rule, it uses the isfShippingObj. The 2 variables are 
 *    the models used by the Item Specific Free Shipping popup and the free shipping row in the Discount sublist. 
 *  
 * This function is called during Edit mode only and on these events:
 *    - on page load
 *    - when updating the Eligibility criteria of a tiered promotion (since the Discount tab is cleared and re-rendered)
 *    
 */
function showFreeShippingRuleInSublist(transObj){
	
	try{
		var currentObj = null;
		
		switch(AdvPromo.PromotionCs.isfShippingObj.op){
			case 'D':
				return;
			case 'N':
			case 'E':
				// isfShippingObj is a global variable containing the info from popup
				currentObj = AdvPromo.PromotionCs.isfShippingObj;
				break;
			default:
				// origIsfShippingObj is a global variable containing the info from custom record
				var isfsJson = nlapiGetFieldValue('custpage_advpromo_discount_json_isf_ship');
				if(isfsJson){
					AdvPromo.PromotionCs.origIsfShippingObj = JSON.parse(isfsJson);
					currentObj = AdvPromo.PromotionCs.origIsfShippingObj;	
				}
				break;
		}
		
		var nameColumnText = transObj.TEXT_FREE_SHIPPING + ' ' + transObj.TEXT_ON + ' ';
		var promoOfferColumnText = '100% ' + transObj.TEXT_OFF + ' ' + transObj.TEXT_ON + ' ';
		
		if(currentObj){
			// Name column
			if(currentObj.itemLabels && currentObj.itemLabels.length > 0){ // item
				for(var j = 0; j < currentObj.itemLabels.length; j++){
					nameColumnText += currentObj.itemLabels[j];
					if(j != currentObj.itemLabels.length - 1){
						nameColumnText += '\n' + transObj.TEXT_AND + ' ';	
					}
				}
			}
			else{ // saved search
				nameColumnText += currentObj.searchName;
			}
			
			// Promo Offer column
			for(var j = 0; j < currentObj.shipLabels.length; j++){
				promoOfferColumnText += currentObj.shipLabels[j];
				if(j != currentObj.shipLabels.length - 1){
					promoOfferColumnText += ' / ';	
				}
			}
			
			AdvPromo.PromotionCs.addisfShippingToObject(currentObj, nameColumnText, promoOfferColumnText, 'custpage_advpromo_discount_list', null);
		}	
	}
	catch(e){
		alert('Error in showFreeShippingRuleInSublist(). ' + e);
	}
}