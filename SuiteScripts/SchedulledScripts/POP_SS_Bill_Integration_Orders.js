function billIntegrationSalesOrders(){
	var MAX_RECORDS_PER_ONE_RUN = 150;
	var GOVERNANCE_TRESHOLD = 100;
	
	nlapiLogExecution('DEBUG', 'INFO :' , 'STARTING THE PROCESS OF BILLING THE INTEGRATION SALES ORDERS...');
	var searchResult = nlapiSearchRecord('salesorder', 'customsearch_integration_orders_to_bill', null, null);
	if(searchResult){
		for(var i = 0; i < searchResult.length; i++){
			if(i == MAX_RECORDS_PER_ONE_RUN){
				nlapiLogExecution('DEBUG', 'INFO : ', 'REACHED  MAX_RECORDS_PER_ONE_RUN of :' + MAX_RECORDS_PER_ONE_RUN);
				nlapiLogExecution('DEBUG', 'INFO : ', 'EXITING FROM EXECUTION.');
				return;
			}
			if( nlapiGetContext().getRemainingUsage() < GOVERNANCE_TRESHOLD ){
				nlapiLogExecution('DEBUG', 'INFO : ', 'EXITING FROM EXECUTION.');
				return;
			}
			nlapiLogExecution('DEBUG', 'INFO : ', 'BILLING SALES ORDER # :' + searchResult[i].getValue('internalid'));
			try{
				tryBillSalesOrder(searchResult[i].getValue('internalid'));
			}
			catch(ex){
				ErrorLogger.logExceptionError(ex, "Attempt to bill the integration salesorders FAILED.");
			}
		}	
	}
	nlapiLogExecution('DEBUG', 'INFO :', 'FINISHED THE PROCESS OF BILLING THE INTEGRATION SALES ORDERS.');
}
function tryBillSalesOrder(salesOrderInternalId){
	var fulfillmentFilters = new Array();
	var fulfullmentColumns = new Array();
	
	fulfillmentFilters[0] = new nlobjSearchFilter('mainline', null, 'is', 'T');
	fulfullmentColumns[0] = new nlobjSearchColumn('trandate');
	
	var invoicedate = "";
	fulfillmentFilters[1] = new nlobjSearchFilter('createdfrom', null, 'is', salesOrderInternalId);	
	var fulfillmentSearch = nlapiSearchRecord('itemfulfillment', null, fulfillmentFilters, fulfullmentColumns);
	if(fulfillmentSearch.length == 0)
		throw new Exception("PendingBilled Sales order does not have any fulfillments.");
	//try to find the most recent fulfillment to set invoice date
	invoicedate = fulfillmentSearch[0].getValue('trandate');
	if(fulfillmentSearch.length > 1){
		for(var j = 1; j < fulfillmentSearch.length; j++){
			invoicedate = getMostRecentDate(invoicedate, fulfillmentSearch[j].getValue('trandate'));
		}
	}
	var invoice = nlapiTransformRecord('salesorder', salesOrderInternalId, 'invoice');
	invoice.setFieldValue('trandate', invoicedate);
	var tranId = nlapiSubmitRecord(invoice, false, true);
	nlapiLogExecution('DEBUG', 'INFO : ', 'INVOICE HAS BEEN CREATED , # ' + tranId);
}
function getMostRecentDate(date1, date2){
	var date1Parsed = Date.parse(date1);
	var date2Parsed = Date.parse(date2);
	if(date1Parsed > date2Parsed)
		return date1;
	else if(date1Parsed < date2Parsed)
		return date2;
	return date1;//equals
}
