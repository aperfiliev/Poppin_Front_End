var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

var TRANS_CS_SelectCustomerSavedSearchPopup = {};
function init_CS_AddCustomerSaveSearchPopup() {
	var translates = [];
	translates.push(new TranslateMember('error.customer.ss.exists', 'SEARCH_EXISTS', 'Customer Saved Search already exists in the sublist'));
	translates.push(new TranslateMember('error.customer.select', 'SELECT_CUSTOMER', 'Please select at least one customer from the list'));
	TRANS_CS_SelectCustomerSavedSearchPopup = new TranslateHelper(translates);
}

var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_AddCustomerSaveSearchPopup);
if (TranslateInit) TranslateInit();

AdvPromo.SelectCustSrchCS = new function () {

	this.isNewRowUnique = function(savedSearchId, eligibleCustomersModel){
		
		if(!savedSearchId || !eligibleCustomersModel){
			return false;
		}
		
		if(eligibleCustomersModel){
			for(var i = 0; i < eligibleCustomersModel.length; i++){
				var mod = eligibleCustomersModel[i];
				
				if(parseInt(mod.type) === AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH
					&& parseInt(mod.id) === parseInt(savedSearchId) && mod.op !== 'D'){
					return false;
				}
			}	
		}
		
		return true;
	};
	
	this.save = function(){
		
		var savedSearchId = nlapiGetFieldValue('custpage_advpromo_savedsearch');
		var savedSearchName = nlapiGetFieldText('custpage_advpromo_savedsearch');
		var description = nlapiGetFieldValue('custpage_advpromo_description');
		var modelIndex = nlapiGetFieldValue('custpage_advpromo_index');
		
		if(!savedSearchId){ // won't happen since there's always one selected
			alert(TRANS_CS_SelectCustomerSavedSearchPopup.SELECT_CUSTOMER);
			return;
		}
		
		if(modelIndex){
			var oldSavedSearchId = window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].id;
			if(oldSavedSearchId != savedSearchId){
				// check for duplicate entry in sublist
				if(!this.isNewRowUnique(savedSearchId, window.parent.AdvPromo.PromotionCs.eligibleCustomersObj)){
					alert(TRANS_CS_SelectCustomerSavedSearchPopup.SEARCH_EXISTS);
					return;
				}
			}
			
			// access the main model directly
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].op = 'E';
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].id = savedSearchId;
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].name = savedSearchName;
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].desc = description;
			
			window.parent.AdvPromo.PromotionCs.sublistMgr.renderEligibilityCustomerSublistEditMode(true);
		}
		else{
			// check for duplicate entry in sublist
			if(!this.isNewRowUnique(savedSearchId, window.parent.AdvPromo.PromotionCs.eligibleCustomersObj)){
				alert(TRANS_CS_SelectCustomerSavedSearchPopup.SEARCH_EXISTS);
				return;
			}
			
			var custObj = {}; 
			custObj.type = AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH;	
			custObj.op = 'A';
			custObj.id = savedSearchId;
			custObj.name = savedSearchName;
			custObj.desc = description;
			
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj.push(custObj);
			window.parent.AdvPromo.PromotionCs.sublistMgr.renderEligibilityCustomerSublistEditMode(true);	
		}

		window.parent.Ext.WindowMgr.getActive().close();
	};
	
	this.cancel = function() {
		window.parent.Ext.WindowMgr.getActive().close();
	};
};