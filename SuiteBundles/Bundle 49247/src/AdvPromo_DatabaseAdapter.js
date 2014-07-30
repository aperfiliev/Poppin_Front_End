var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.DatabaseAdapter = new function DatabaseAdapter() {
	
	this.applyEligibilityCustomerDbOperation = function(promoId, parsedObj){
		
		try{
			switch(parsedObj.op){
				case '':
					// do not update DB
					
					break;
				case 'A':
					// create new record
					var rec = nlapiCreateRecord('customrecord_advpromo_eligible_customer');
					rec.setFieldValue('custrecord_advpromo_customer_promo_code', promoId);
					rec.setFieldValue('custrecord_advpromo_customer_type', parsedObj.type);
					switch(parseInt(parsedObj.type)){
						case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH:
							rec.setFieldValue('custrecord_advpromo_customer_sid', parsedObj.id);
							rec.setFieldValue('custrecord_advpromo_customer_description', parsedObj.desc);
							break;
						case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER:
							rec.setFieldValues('custrecord_advpromo_customer_cid', parsedObj.id);
							break;
					}
					
					nlapiSubmitRecord(rec);
					
					break;
				case 'E':
					// update existing record
					if(parsedObj.recId){
						var type = '', cid = [], sid = '', description = '';
						
						type = parseInt(parsedObj.type);
						
						switch(type){
							case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH:
								cid = [];
								sid = parsedObj.id;
								description = parsedObj.desc;
								break;
							case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER:
								cid = parsedObj.id;
								sid = '';
								description = '';
								break;
						}
						
						nlapiSubmitField('customrecord_advpromo_eligible_customer', parsedObj.recId, 
							['custrecord_advpromo_customer_cid', 'custrecord_advpromo_customer_type', 'custrecord_advpromo_customer_sid', 'custrecord_advpromo_customer_description'],
							[cid, type, sid, description]
						);
					}				
					
					break;
				case 'D':
					// delete record
					nlapiDeleteRecord('customrecord_advpromo_eligible_customer', parsedObj.recId);
					
					break;
			}	
		}
		catch(e){
			nlapiLogExecution('Error', 'Advanced Promotion', 'applyEligibilityCustomerDbOperation(): ' + e);
		}
		
	};
	
	this.updateEligibleCustomerRecords = function(promoId, jsonStr){
		
		try{
			nlapiLogExecution('Error', 'Advanced Promotion', 'jsonStr: ' + jsonStr);
			
			if(jsonStr){
				var parsedObj = JSON.parse(jsonStr);
				
				for(var i = 0; i < parsedObj.length; i++){
					var eligCustModel = parsedObj[i];
					
					this.applyEligibilityCustomerDbOperation(promoId, eligCustModel);
				}
			}
		}
		catch(e){
			nlapiLogExecution('Error', 'Advanced Promotion', 'updateEligibleCustomerRecords(): ' + e);
		}
	};
	
	this.generateEligibilityCustomerSublistInitJson = function(promoId){
		var ret = '';
		
		try{
			var filters = [
	       	    new nlobjSearchFilter('custrecord_advpromo_customer_promo_code', null, 'anyof', [promoId])
	       	];
	       	
	       	var columns = [
	            new nlobjSearchColumn('custrecord_advpromo_customer_type'),
	            new nlobjSearchColumn('custrecord_advpromo_customer_sid'),
	            new nlobjSearchColumn('custrecord_advpromo_customer_cid'),
	            new nlobjSearchColumn('custrecord_advpromo_customer_description'),
	            new nlobjSearchColumn('internalid').setSort()
	        ];
	       	
	       	var eligCustomers = nlapiSearchRecord('customrecord_advpromo_eligible_customer', null, filters, columns);
	       	if(eligCustomers){
	       		
	       		var objArr = [];
	       		
	       		for(var i = 0; i < eligCustomers.length; i++){
	       			var arrStr = null;
	       			var jsonRow = {};
	       			
	       			jsonRow.op = '';
	       			jsonRow.recId = eligCustomers[i].getId();
	       			
	       			jsonRow.type = eligCustomers[i].getValue('custrecord_advpromo_customer_type');
	       			switch(parseInt(jsonRow.type)){
		       			case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER:
		       				arrStr = eligCustomers[i].getValue('custrecord_advpromo_customer_cid'); 
		           			jsonRow.id = arrStr ? arrStr.split(',') : [];
		           			
		           			arrStr = eligCustomers[i].getText('custrecord_advpromo_customer_cid'); 
		           			jsonRow.name = arrStr ? arrStr.split(',') : [];
							
							break;
						case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH:
							arrStr = eligCustomers[i].getValue('custrecord_advpromo_customer_sid'); 
		           			jsonRow.id = arrStr;
		           			
		           			arrStr = eligCustomers[i].getText('custrecord_advpromo_customer_sid'); 
		           			jsonRow.name = arrStr;
		           			
		           			jsonRow.desc = eligCustomers[i].getValue('custrecord_advpromo_customer_description');
							
							break;
	       			}
	       			
	       			objArr.push(jsonRow);
	       		}
	       		
	       		ret = JSON.stringify(objArr);
	       	}	
		}
		catch(e){
			nlapiLogExecution('Error', 'Advanced Promotion', 'generateEligibilityCustomerSublistInitJson(): ' + e);
		}
		
		return ret;
	};
	
	this.renderEligibilityCustomerSublistViewMode = function(promoId, sublistObj, transObj){
		
		try{
			var filters = [
	       	    new nlobjSearchFilter('custrecord_advpromo_customer_promo_code', null, 'anyof', [promoId])
	       	];
	       	
	       	var columns = [
	            new nlobjSearchColumn('custrecord_advpromo_customer_type'),
	            new nlobjSearchColumn('custrecord_advpromo_customer_sid'),
	            new nlobjSearchColumn('custrecord_advpromo_customer_cid'),
	            new nlobjSearchColumn('custrecord_advpromo_customer_description'),
	            new nlobjSearchColumn('internalid').setSort()
	        ];
	       	
	       	var eligCustomers = nlapiSearchRecord('customrecord_advpromo_eligible_customer', null, filters, columns);
	       	if(eligCustomers){
	       		for(var i = 0; i < eligCustomers.length; i++){
	       			
	       			var type = eligCustomers[i].getValue('custrecord_advpromo_customer_type');
	       			switch(parseInt(type)){
		       			case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER:
		       				
		           			var custNames = eligCustomers[i].getText('custrecord_advpromo_customer_cid'); 
		           			
		           			if(custNames){
		           				var custNamesSummary = custNames.replace(/,/gi, ' ' + transObj.TRANS_LABEL_TEXT_OR + ' '); 
			           			
		           				sublistObj.setLineItemValue('custpage_advpromo_eligible_customer_saved_search_name', i+1, 
	           						AdvPromo.FieldFormatter.truncateText(custNamesSummary));
		           				sublistObj.setLineItemValue('custpage_advpromo_eligible_customer_saved_search_description', i+1, 
	           						AdvPromo.FieldFormatter.truncateText(custNamesSummary));	
		           			}

		           			break;
						case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH:
							
							sublistObj.setLineItemValue('custpage_advpromo_eligible_customer_saved_search_name', i+1, 
								AdvPromo.FieldFormatter.truncateText(eligCustomers[i].getText('custrecord_advpromo_customer_sid')));
		           			sublistObj.setLineItemValue("custpage_advpromo_eligible_customer_saved_search_description", i+1, 
	           					AdvPromo.FieldFormatter.truncateText(eligCustomers[i].getValue('custrecord_advpromo_customer_description')));
		           			
							break;
	       			}
	       		}
	       	}	
		}
		catch(e){
			nlapiLogExecution('Error', 'Advanced Promotion', 'renderEligibilityCustomerSublistViewMode(): ' + e);
		}
	};
};