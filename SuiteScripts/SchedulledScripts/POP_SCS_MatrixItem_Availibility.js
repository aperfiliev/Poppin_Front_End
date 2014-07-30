/**
  * Version    Date            Author           Remarks
 * 1.00       07 April 2014     Perfiliev Andrey  Change matrix item 'isonline' attribute according to item location availability
 
 */
 
var EMAIL_FROM_EMPLOYEE_INTERNAL_ID = 285810;
var EMAIL_TO_ADDRESS = 'aperfiliev@malkosua.com';
var SAVED_SEARCH_ID_FOR_MATRIX_CHILD_ITEMS = 'customsearch_inventorymatrix';
var GOVERNANCE_TRESHOLD = 20;

function updateMatrixChildItemAvailability(){
	try {
		nlapiLogExecution('DEBUG', 'Starting execute scheduled script', '');
		var searchresults = nlapiSearchRecord('item', SAVED_SEARCH_ID_FOR_MATRIX_CHILD_ITEMS, null, null);
		if 	(searchresults != null){		
			for ( var i = 0; i < searchresults.length; i++ ){ 
				var searchresult = searchresults[ i ];	
				var internalId = searchresult.getId();
				var locationQuantityAvailable = searchresult.getValue('locationquantityavailable');	
				var prevState = searchresult.getValue('isonline');				
				var curState;
				if (locationQuantityAvailable == "" || locationQuantityAvailable == 0){
					curState = 'F'	;																	
				} else {
					curState='T';									
				}
				if (prevState != curState){
					var recItem = nlapiLoadRecord('inventoryitem',internalId);
					nlapiLogExecution('DEBUG','Isonline attribute for item id=', internalId+' will be set to '+curState);
					recItem.setFieldValue('isonline',curState);
					nlapiSubmitRecord(recItem,true,true);
				}								
				checkGovernance();				
			}			
		} else {
			nlapiLogExecution('ERROR', 'Can\'t execute saved search with id=', JSON.stringify(SAVED_SEARCH_ID_FOR_MATRIX_CHILD_ITEMS));
		}	
	}
	catch (e){
		nlapiLogExecution('ERROR', 'Exception occurs while executing scheduled script: ', e);
	}
	nlapiLogExecution('DEBUG', 'Scheduled script execution successfully done', '');
}

function checkGovernance(){
 var context = nlapiGetContext();
 if( context.getRemainingUsage() < GOVERNANCE_TRESHOLD )
 {
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