var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.SelectCustomerSL = new function () {
	
	this.renderSuitelet = function(request, response) {
		
		var TRANS_HELP_CUSTOMER = "<html><p>Select the customers who are eligible to use this promotion. To select more than one customer, press and hold CTRL as you make your selections.</p></html>";
		var TRANS_LABEL_CUSTOMERS = 'Customers';
		var TRANS_LABEL_SAVE = 'Save';
		var TRANS_LABEL_CANCEL = 'Cancel';
		var TRANS_LABEL_TITLE = 'Title';
		
		try {
		    
		    var t = advPromoTranslateInit();
		
		    TRANS_HELP_CUSTOMER = t.translate('help.popup.addcustomer.customer');
		    TRANS_LABEL_CUSTOMERS = t.translate('label.customers');
		    TRANS_LABEL_SAVE = t.translate('label.save');
		    TRANS_LABEL_CANCEL = t.translate('label.cancel');
		    TRANS_LABEL_TITLE = t.translate('label.title');
		} 
		catch(e) {
			nlapiLogExecution('ERROR', 'Advanced Promotion', 'Error in translation. ' + e);
		}

		
		if(request.getMethod() == "GET") {
			var custIds = request.getParameter('cid');
			var modelIndex = request.getParameter('idx');
			
			var customers = [];
			if(custIds){				
				customers = custIds.split(',');
			}
			
			var form = nlapiCreateForm(TRANS_LABEL_TITLE, true);
			
			var customerFld = form.addField('custpage_advpromo_customers', 'multiselect', TRANS_LABEL_CUSTOMERS, 'customer');
			customerFld.setHelpText(TRANS_HELP_CUSTOMER, false);
			if(modelIndex){
				customerFld.setDefaultValue(customers);	
			}
			
			var indexFld = form.addField('custpage_advpromo_index', 'integer','Hidden');
			indexFld.setDefaultValue(modelIndex);
			indexFld.setDisplayType('hidden');

			form.setScript('customscript_ap_select_customers_cs');
		    
			form.addButton('custpage_save', TRANS_LABEL_SAVE, 'AdvPromo.SelectCustomerCS.save()');
			form.addButton('custpage_cancel', TRANS_LABEL_CANCEL, 'AdvPromo.SelectCustomerCS.cancel()');
			
		    response.writePage(form);
		}
	};
};