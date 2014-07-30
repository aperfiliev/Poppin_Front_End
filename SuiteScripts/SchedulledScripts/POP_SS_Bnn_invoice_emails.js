var GOVERNANCE_TRESHOLD = 20;
var CUSTOM_SAVED_SEARCH_ID = 'customsearch_bnn_so_search';
var INVOICE_SAVED_SEARCH_ID = 'customsearch_bnn_invoice_search';
var POPPIN_ADDRESS = 'Poppin Inc PO BOX 674781 Detroit, MI 48267-4871';
var POPPIN_TID = '27-0910153';

function processInvoices(){
	nlapiLogExecution('DEBUG', 'Starting execute scheduled script', '');
	var res; 
	var rows = new Array(); 
	try {
		res = nlapiSearchRecord('customrecord_pop_bn_invoice', CUSTOM_SAVED_SEARCH_ID, null, null);   
		if(res) {
			rows = rows.concat(res);
			while(res.length == 1000) {
				var lastId = res[999].getId();
				res = nlapiSearchRecord('customrecord_pop_bn_invoice', CUSTOM_SAVED_SEARCH_ID, [new nlobjSearchFilter("internalIdNumber", null, "greaterThan", lastId),], null);
				if(res) {
					rows = rows.concat(res);
				}
			}
		}
	} catch (ex) {
		//nlapiLogExecution('ERROR','Error occurs while executing '+CUSTOM_SAVED_SEARCH_ID, ex);
		ErrorLogger.logExceptionError(ex, "Error occurs while executing " + CUSTOM_SAVED_SEARCH_ID);
	} 
 
	if (rows && rows.length > 0){
		var soIdToStoreEmailMap = new Object();
		var soIds = new Array();
		var soIdToRecordIdMap = new Object();
		for ( var i = 0; i < rows.length; i++ ){
			var searchresult = rows[ i ];
			var id = searchresult.getId();   
			var soInternalID = searchresult.getValue('custrecord_so_internal_id');
			var storeEmail = searchresult.getValue('custrecord_store_email');
			soIdToStoreEmailMap[soInternalID] = storeEmail;
			soIds = soIds.concat(soInternalID);
			soIdToRecordIdMap[soInternalID] = id;
		}
  
		var invoiceResult;
		try{
			invoiceResult = nlapiSearchRecord('transaction', INVOICE_SAVED_SEARCH_ID, [ new nlobjSearchFilter('internalid', 'createdfrom', 'anyof', soIds) ], null);
		}
		catch (e){
			//nlapiLogExecution('ERROR','Error occurs while executing '+INVOICE_SAVED_SEARCH_ID, e);
			ErrorLogger.logExceptionError(e, "Error occurs while executing " + INVOICE_SAVED_SEARCH_ID);
		}  
   
		if (invoiceResult){
			var soIDToInvoiceObject = new Object(); 
			var invoice;
			for ( var i = 0; i < invoiceResult.length; i++ ){
				var searchresult = invoiceResult[ i ]; 
				var soInternalID = searchresult.getValue('internalid','createdfrom', null);

				if(!soIDToInvoiceObject[soInternalID]){
					invoice = new Object();
					invoice['NL_INTERNAL_ID'] = searchresult.getId();
					invoice['NL_BILLING_ADDRESS'] = searchresult.getValue('billaddress'); 
					invoice['NL_SHIPPING_ADDRESS'] = searchresult.getValue('shipaddress'); 
					invoice['NL_TRACKING_NUMBERS'] = searchresult.getValue('trackingnumbers','createdfrom',null); 
					invoice['NL_SHIPPING_CODE'] = searchresult.getValue('custbody_avashippingcode'); 
					invoice['NL_TRAN_ID'] = searchresult.getValue('tranid'); 
					invoice['NL_TRAN_DATE'] = searchresult.getValue('trandate');
					invoice['NL_SHIP_DATE'] = searchresult.getValue('shipdate');
					invoice['NL_TERMS'] = searchresult.getText('terms');
					invoice['NL_DUE_DATE'] = searchresult.getValue('duedate');
					invoice['NL_PO_NUMBER'] = searchresult.getValue('otherrefnum');
					invoice['NL_SALES_REP'] = searchresult.getValue('salesrep');
					invoice['NL_SHIP_METHOD'] = searchresult.getText('shipmethod');
					invoice['NL_CUSTOMER_NAME'] = searchresult.getValue('altname','customer',null);
					invoice['NL_AMOUNT_PAID'] = correctDecimal(searchresult.getValue('amountpaid'));					
					invoice['NL_AMOUT_REMAINING'] = correctDecimal(searchresult.getValue('amountremaining'));					
					invoice['NL_SHIP_COST'] = correctDecimal(searchresult.getValue('shippingcost'));
					invoice['NL_TOTAL_AMOUNT'] = correctDecimal(searchresult.getValue('totalamount'));  					
					invoice['NL_POPPIN_ADDRESS'] = POPPIN_ADDRESS;
					invoice['NL_POPPIN_TID'] = POPPIN_TID;
					invoice['NL_ITEMS_TABLE_HTML'] = "";
					soIDToInvoiceObject[soInternalID] = invoice;
				}
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "<tr style=\"color:#aaaaaa\">";
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "<td style=\"padding-left:20px;padding:2px;border-left:2px solid #f57e22;border-bottom:2px solid #f57e22;border-right:2px solid #f57e22;padding-bottom:3px\" > ";
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += searchresult.getValue('displayname','item',null);
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "</td>";
				
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "<td style=\"text-align:right;padding:2px;padding-bottom:3px;border-bottom:2px solid #f57e22;border-right:2px solid #f57e22;\">";
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += correctDecimal(searchresult.getValue('quantity'));
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "</td>";
				
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "<td style=\"border-bottom:2px solid #f57e22;padding:2px;border-right:2px solid #f57e22;padding-bottom:3px\">";
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += searchresult.getValue('salesdescription','item',null);
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "</td>";
				
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "<td style=\"text-align:right;padding:2px;border-bottom:2px solid #f57e22;border-right:2px solid #f57e22;padding-bottom:3px\">";
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += correctDecimal(searchresult.getValue('rate'));
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "</td>";
				
				var isTaxable = (searchresult.getValue('istaxable', 'item', null) == "T") ? "Yes" : "No" ;
				
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "<td style=\"border-bottom:2px solid #f57e22;padding:2px;padding-bottom:3px\">";
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += isTaxable;
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "</td>";
				
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "<td style=\"text-align:right;border-left:2px solid #f57e22;padding:2px;border-bottom:2px solid #f57e22;border-right:2px solid #f57e22;padding-bottom:3px\">";
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += correctDecimal(searchresult.getValue('amount'));
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "</td>";
				
				soIDToInvoiceObject[soInternalID]['NL_ITEMS_TABLE_HTML'] += "</tr>";
			}
		}
		for (property in soIDToInvoiceObject){
			var invoice = soIDToInvoiceObject[property];
			var email = soIdToStoreEmailMap[property];   
			checkGovernance();
			try {
				sendEmail(invoice, email);
			} 
			catch (exception) {
				//nlapiLogExecution('ERROR','Error occurs while sending email to '+email+', order ID='+property, exception);
				ErrorLogger.logExceptionError(exception, 'Error occurs while sending email to ' + email + ', order ID=' + property);
				continue;
			}
			var recordId = soIdToRecordIdMap[property];
			try {
				nlapiDeleteRecord('customrecord_pop_bn_invoice',recordId);
			} 
			catch (exception) {
				//nlapiLogExecution('ERROR','Error occurs while deleting record with id= '+recordId, exception);
				ErrorLogger.logExceptionError(exception, 'Error occurs while deleting record with id= ' + recordId);
			}
		}
 }
}

function sendEmail(invoiceObj, emailAddress){
    
	try{
		var mergedEmailTempFile = nlapiMergeRecord(EmialConfiguration.BARNES_N_NOBLE_INVOICE_TMPL_ID, 'invoice', invoiceObj['NL_INTERNAL_ID'], null, null, invoiceObj);
	}
	catch(e){
		throw e;
	}
	var emailSubject = mergedEmailTempFile.getName();
	var emailBody = mergedEmailTempFile.getValue();
	
	var recordsToAttachWith = new Object();
	recordsToAttachWith['transaction'] = invoiceObj['NL_INTERNAL_ID'];
	try{
		nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, emailAddress, emailSubject, emailBody, null,null,recordsToAttachWith);
	}
	catch(e){
		throw e;
	}
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

function correctDecimal(decNumber){
	var result;
	if (decNumber){
		if(isNaN(decNumber)){
			result = "0.00";
		} else {
			if (decNumber == .00){
				result = "0.00";
			} else {
				result = decNumber;
			}
		}
	} else{
		result = "0.00";
	}
	return result;
}