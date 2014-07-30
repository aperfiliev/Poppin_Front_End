var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.SelectCustSrchSL = new function () {
	
	this.renderSuitelet = function(request, response) {
		
		var TRANS_HELP_ELIGIBLE_SEARCH = "<html><p>Select the customer saved search you want to use to define which customers are eligible for this promotion. Only public saved searches can be used for criteria.</p></html>";
		var TRANS_HELP_DESCRIPTION = "<html><p>The description for the saved search is shown here.</p></html>"; 
		var TRANS_LABEL_CUST_SEARCH = 'Customer Saved Search';
		var TRANS_LABEL_DESCRIPTION = 'Description';
		var TRANS_LABEL_SAVE = 'Save';
		var TRANS_LABEL_CANCEL = 'Cancel';
		var TRANS_LABEL_TITLE = 'Title';
		var TRANS_LABEL_CUSTOMER = 'Customer';
		
		try {
		    
			var t = advPromoTranslateInit();
		     
			TRANS_HELP_ELIGIBLE_SEARCH = t.translate('help.popup.addcustomerss.eligiblesearch');
			TRANS_HELP_DESCRIPTION = t.translate('help.popup.addcustomerss.description');
			TRANS_LABEL_CUST_SEARCH = t.translate('label.customer.search');
			TRANS_LABEL_DESCRIPTION = t.translate('label.description');
			TRANS_LABEL_SAVE = t.translate('label.save');
			TRANS_LABEL_CANCEL = t.translate('label.cancel');
			TRANS_LABEL_TITLE = t.translate('label.title');
			TRANS_LABEL_CUSTOMER = t.translate('label.customer'); 
			
		}
		catch(e) {
			nlapiLogExecution('ERROR', 'Advanced Promotion', 'Error in translation. ' + e);
		}
		
		if(request.getMethod() == "GET") {
			var modelIndex = request.getParameter('idx');
			var savedSearchId = request.getParameter('sid');
			var description = request.getParameter('desc');
			
			var form = nlapiCreateForm(TRANS_LABEL_TITLE, true);
			
			var customerFld = form.addField('custpage_advpromo_savedsearch', 'select', TRANS_LABEL_CUST_SEARCH);
			customerFld.setHelpText(TRANS_HELP_ELIGIBLE_SEARCH, false);
			var selOptions = AdvPromo.FieldFormatter.retrieveSavedSearchesOfScriptedRecord(TRANS_LABEL_CUSTOMER);
			if(selOptions){
				for(var i = 0; i < selOptions.length; i++){
					var selected = false;
					
					if(savedSearchId && savedSearchId == selOptions[i].id){
						selected = true;
					}
					
					customerFld.addSelectOption(selOptions[i].id, selOptions[i].text, selected);
				}	
			}
			
			var descFld = form.addField('custpage_advpromo_description', 'text', TRANS_LABEL_DESCRIPTION);
			descFld.setHelpText(TRANS_HELP_DESCRIPTION, false);
		    descFld.setDefaultValue(description);
			
			var indexFld = form.addField('custpage_advpromo_index', 'integer','Hidden');
			indexFld.setDefaultValue(modelIndex);
			indexFld.setDisplayType('hidden');

			form.setScript('customscript_ap_select_custsrch_cs');
		    
			form.addButton('custpage_save', TRANS_LABEL_SAVE, 'AdvPromo.SelectCustSrchCS.save()');
			form.addButton('custpage_cancel', TRANS_LABEL_CANCEL, 'AdvPromo.SelectCustSrchCS.cancel()');
			
		    response.writePage(form);
		}
	};
};