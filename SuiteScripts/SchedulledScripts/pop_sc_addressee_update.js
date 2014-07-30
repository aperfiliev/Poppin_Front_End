var SAVED_SEARCH_ID = 'customsearch_cust_addr';
var GOVERNANCE_TRESHOLD = 30;

function updateAddresBookAddressee(){  
	nlapiLogExecution('DEBUG','Start script execution', ''); 
	var res; 
	var rows = new Array(); 
	try {
		res = nlapiSearchRecord('customer', SAVED_SEARCH_ID, null, null);    
		if(res) {
			rows = rows.concat(res);
			while(res.length == 1000) {
				var lastId = res[999].getId();				
				res = nlapiSearchRecord('customer', SAVED_SEARCH_ID, [new nlobjSearchFilter("internalIdNumber", null, "greaterThan", lastId),], null);
				if(res) {
					rows = rows.concat(res);
				}
			}
		}
	} catch (ex) {		
		nlapiLogExecution('ERROR','ERROR executing saved search', SAVED_SEARCH_ID);
	} 
	if (rows && rows.length > 0){		
		var customerIds = new Object();		
		for ( var i = 0; i < rows.length; i++ ){
			var searchresult = rows[i];
			var id = searchresult.getId();
			if (customerIds[id]){
				continue;
			}			
			customerIds[id] = true;			
		}
		for (prop in customerIds){
			try{
				nlapiLogExecution('DEBUG','start processing customer', prop);
				var record = nlapiLoadRecord('customer', prop);
				var numberOfAddresses = record.getLineItemCount('addressbook');	
				for (var j=1; j <= numberOfAddresses; j++) 
				{
					var internalid = record.getLineItemValue('addressbook','internalid',j);
					var addressee = record.getLineItemValue('addressbook','addressee',j);
					if (addressee){
						if (addressee.indexOf(",")!=-1){				
							var newAddressee = (addressee.replace(", "," ")).replace(","," ");				
							record.setLineItemValue('addressbook', 'addressee', j, newAddressee);
						}
					}               
				}
				nlapiSubmitRecord(record, false,true);	
			} catch (ex){
				nlapiLogExecution('ERROR','ERROR processing customer', prop );
			}
			checkGovernance();			
		}		
	} else {
		nlapiLogExecution('ERROR', 'Couldn\'t load customers', '');
	}	
	nlapiLogExecution('DEBUG','Script execution successfully completed', '');
}

function checkGovernance(){
	var context = nlapiGetContext();
	if( context.getRemainingUsage() < GOVERNANCE_TRESHOLD ){
		var state = nlapiYieldScript();
		if( state.status == 'FAILURE'){
			nlapiLogExecution("ERROR","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
			throw "Failed to yield script";
		} 
		else if ( state.status == 'RESUME' ){
			nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason+".  Size = "+ state.size);
		} 
	}
}