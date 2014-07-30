/**
 * Data Migration scheduled script
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Mar 2014     adimaunahan
 *
 */

var psg_advpromo;
if (!psg_advpromo) {
    psg_advpromo = {};
}

psg_advpromo.CustomLogger = function CustomLogger()
{
	var showDebugMessages = true;
	var logTitle = 'AdvPromo Logger';
	
	this.debug = function(message) {		
		if(showDebugMessages){
			nlapiLogExecution('DEBUG', logTitle, message);
		}
	};

	this.error = function(message) {		
		if(showDebugMessages){
			nlapiLogExecution('ERROR', logTitle, message);
		}
	};

	this.debugVar = function(varName, varValue) {		
		if(showDebugMessages){
			nlapiLogExecution('DEBUG', logTitle, varName + ': ' + varValue);
		}
	};

	this.audit = function(message) {		
		if(showDebugMessages){
			nlapiLogExecution('AUDIT', logTitle, message);
		}
	};
};

psg_advpromo.DataMigrator = function DataMigrator() {

	var logger = new psg_advpromo.CustomLogger();
	
	// TODO: move this to globals
	this.DISCOUNT_TYPE_SHIPPING = '3';	

    // make this class a singleton
	if ( DataMigrator.prototype._singletonInstance ) {
		return DataMigrator.prototype._singletonInstance;
	}

	DataMigrator.prototype._singletonInstance = this;
	
	this.moveShippingMethods = function(promoid, batchcount){
		
		var retStatus = {};
		var lastPromoId = -1;
		var recordsProcessed = 0;
		
		try{
			logger.debug('promoid = ' + promoid + ', batchcount = ' + batchcount);
			
			// if promoid is null, start at the beginning
			// if promoid is -1, end search
			// if promoid has a value, do search
			var filters = [];
			if(promoid == -1){
				retStatus.recordsProcessed = 0;
				retStatus.lastPromoId = -1;
				
				return retStatus;
			}
			else {
				if(promoid){
					filters.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthan', promoid));	
				}
				
				var columns = [
		            new nlobjSearchColumn('internalid').setSort()   
		        ];
				
				var promoRes = nlapiSearchRecord('promotioncode', null, filters, columns);
				if(promoRes){
					var limit = (batchcount >= promoRes.length ? promoRes.length: batchcount); 
					for(var i = 0; i < limit; i++){
						
						var targetPromoId = promoRes[i].getId();
						
						// get the Promotion Dicount ID and its shipping method ids
						var discountId = 1;
						var shippingMethodIds = [];
						var discountFilters = [
		                    new nlobjSearchFilter('custrecord_advpromo_discount_promo_code', 'custrecord_advpromo_smethod_discount', 'is', targetPromoId),
		                    new nlobjSearchFilter('custrecord_advpromo_discount_type', 'custrecord_advpromo_smethod_discount', 'is', this.DISCOUNT_TYPE_SHIPPING) // only get the Shipping type
		                ];
						
						var discountColumns = [
			                new nlobjSearchColumn('custrecord_advpromo_discount_promo_code', 'custrecord_advpromo_smethod_discount').setSort(),
			                new nlobjSearchColumn('custrecord_advpromo_smethod_method'),
			                new nlobjSearchColumn('custrecord_advpromo_smethod_discount')
			            ];
						
						var shipRes = nlapiSearchRecord('customrecord_advpromo_shipping_method', null, discountFilters, discountColumns);
						if(shipRes){
							// Promotion Dicount ID should be the same for all shipping methods
							discountId = shipRes[0].getValue('custrecord_advpromo_smethod_discount');
							
							for(var s = 0; s < shipRes.length; s++){
								shippingMethodIds.push(shipRes[s].getValue('custrecord_advpromo_smethod_method'));
							}
							
							// copy list of shipping method IDs to AP Promotion Shipping Method's custrecord_advpromo_smethod_method			
							nlapiSubmitField('customrecord_advpromo_discount', discountId, 'custrecord_advpromo_discount_isf_smethod', shippingMethodIds);
							recordsProcessed++;
						}
						
						lastPromoId = targetPromoId;
					}	
				}
			}
			
		}
		catch(e){
			logger.error(e);
		}
		
		retStatus.recordsProcessed = recordsProcessed;
		retStatus.lastPromoId = lastPromoId;
		
		return retStatus;
	};
};

function advpromo_scheduled(type) {
	
	var logger = new psg_advpromo.CustomLogger();

	logger.debug('Data migration has started. Governance: ' + nlapiGetContext().getRemainingUsage());
	var dataMigrator = new psg_advpromo.DataMigrator();
	
	try {
		var nsContext = nlapiGetContext();
		var SCRIPT_PARAM_OPERATION = 'custscript_advpromo_operation';
		var SCRIPT_PARAM_START_PROMO_ID = 'custscript_advpromo_start_promoid';
		var SCRIPT_PARAM_BATCH_COUNT = 'custscript_advpromo_batch_count';

		var operation = nsContext.getSetting('SCRIPT', SCRIPT_PARAM_OPERATION);
		var promoid = nsContext.getSetting('SCRIPT', SCRIPT_PARAM_START_PROMO_ID);
		var batchcount = nsContext.getSetting('SCRIPT', SCRIPT_PARAM_BATCH_COUNT);
		
		if(!batchcount) batchcount = 100; // default batchcount to 100
		
		switch(operation){
			case 'moveshippingmethods':
				
				var statusObj = dataMigrator.moveShippingMethods(promoid, batchcount);
				logger.debug(statusObj.recordsProcessed + ' promotion record(s) udpated.');
				
				if(statusObj.lastPromoId != -1){
					nlapiScheduleScript(
			            nsContext.getScriptId(),
			            nsContext.getDeploymentId(),
			            {	
			            	custscript_advpromo_operation: 'moveshippingmethods', 
			            	custscript_advpromo_start_promoid: statusObj.lastPromoId,
			            	custscript_advpromo_batch_count: batchcount		            	
		            	}
			        );
				}
				
				break;
			default:
				logger.error('Invalid operation type.');
		}
	}
	catch(e){
		logger.error(e);
	}
	
	logger.debug('Data migration completed successfully. Governance: ' + nlapiGetContext().getRemainingUsage());
}