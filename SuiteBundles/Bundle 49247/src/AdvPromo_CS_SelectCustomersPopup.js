var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

var TRANS_CS_AddCustomerSaveSearchPopup = {};
function init_CS_AddCustomerSaveSearchPopup() {
	var translates = [];
	translates.push(new TranslateMember('error.customer.select', 'SELECT_CUSTOMER', 'Please select at least one customer from the list'));
	TRANS_CS_AddCustomerSaveSearchPopup = new TranslateHelper(translates);
}

var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_AddCustomerSaveSearchPopup);
if (TranslateInit) TranslateInit();

AdvPromo.SelectCustomerCS = new function () {

	this.save = function(){
		
		var customerIds = nlapiGetFieldValues('custpage_advpromo_customers');
		var customerNames = nlapiGetFieldTexts('custpage_advpromo_customers');
		var modelIndex = nlapiGetFieldValue('custpage_advpromo_index');
		
		if(!customerIds || (customerIds && customerIds.length == 0) || (customerIds && customerIds.length == 1 && !customerIds[0])){
			alert(TRANS_CS_AddCustomerSaveSearchPopup.SELECT_CUSTOMER);
			return;
		}
		
		if(modelIndex){
			// access the main model directly
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].op = 'E';
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].id = customerIds;
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].name = customerNames;
			
		}
		else{
			var custObj = {}; 
			custObj.type = AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER;	
			custObj.op = 'A';
			custObj.id = customerIds;
			custObj.name = customerNames;
			
			window.parent.AdvPromo.PromotionCs.eligibleCustomersObj.push(custObj);
		}

		window.parent.AdvPromo.PromotionCs.sublistMgr.renderEligibilityCustomerSublistEditMode(true);
		window.parent.Ext.WindowMgr.getActive().close();
	};
	
	this.cancel = function() {
		window.parent.Ext.WindowMgr.getActive().close();
	};
};