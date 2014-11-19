function fulfillmentCreatedEmail(type) {
	if(type == 'create'){
		try{
			var fulfillment = nlapiGetNewRecord();
			//nlapiLogExecution('ERROR', 'fulfillment ship method ', fulfillment.getFieldValue('shipmethod'));
			//nlapiLogExecution('ERROR', 'linkedtrackingnumbers :  ', fulfillment.getFieldValue('linkedtrackingnumbers'));
			//nlapiLogExecution('ERROR', 'trackingnumbers :  ', fulfillment.getFieldValue('trackingnumbers'));
			
			var orderFilters = new Array();
			var orderColumns = new Array();
				orderFilters[0] = new nlobjSearchFilter( 'internalid', null, 'is', fulfillment.getFieldValue('createdfrom') );
				orderColumns[0] = new nlobjSearchColumn( 'tranid' );
				orderColumns[1] = new nlobjSearchColumn( 'trackingnumbers' );
				orderColumns[2] = new nlobjSearchColumn( 'department' );
				orderColumns[3] = new nlobjSearchColumn( 'shipmethod' );
				
			var searchResult = nlapiSearchRecord('salesorder', null, orderFilters, orderColumns);
			if(searchResult == null){
				ErrorLogger.logerror("Can not execute search on Sales order to get transaction details.", "SALES ORDER SHIPPED EMAIL : Error appeared on attempt to send an Email");
				return;
			}
			var salesOrder = { 'tranid' :  searchResult[0].getValue('tranid'), 'trackingnumbers' :  searchResult[0].getValue('trackingnumbers'),
								'shipmethod' :  searchResult[0].getValue('shipmethod') }
			
			var customerId = fulfillment.getFieldValue('entity');			
			var customerFilters = new Array();
			var customerColumns = new Array();
			var customerEmail = "";
			customerFilters[0] = new nlobjSearchFilter( 'internalid', null, 'is', customerId );
			customerColumns[0] = new nlobjSearchColumn( 'firstname' );
			customerColumns[1] = new nlobjSearchColumn( 'email' );
			customerColumns[2] = new nlobjSearchColumn( 'isperson' );
			customerColumns[3] = new nlobjSearchColumn( 'companyname' );
			var customerSearchResult = nlapiSearchRecord('customer', null, customerFilters, customerColumns);	
			if (customerSearchResult){
				customerEmail = customerSearchResult[0].getValue('email');
			}			
			if ((searchResult[0].getValue('department') in EmialConfiguration.ALLOWED_DEPARTMENTS == true)&&(( customerEmail in EmialConfiguration.WS_INTEGRATION_CSTMR_EMAILS ) == false)){
				var resultString = tryPrepareAndSendEmail(fulfillment, salesOrder, customerSearchResult);
				if(resultString == EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT){
					nlapiLogExecution('DEBUG', 'Attempt to send email : ', "OK");	
				}
				else{
					ErrorLogger.logerror(resultString, "SALES ORDER SHIPPED EMAIL : Error appeared on attempt to send an Email");
					//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
				}
			}
			else{
				nlapiLogExecution('DEBUG', 'Attempt to send email : ', 'NO. Department is not Web.');	
			}
		}
		catch(e){
			ErrorLogger.logExceptionError(e, "SALES ORDER SHIPPED EMAIL : Error appeared on attempt to send an Email");
			//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
		}
	}
}
function tryPrepareAndSendEmail(fulfillment, salesOrder , customerSearch){
	var customTagValues = new Array();	
	var trContentStyle = "style=\"font-size:13px\"";
	var tdContentStyle = "style=\"padding:10px;text-align:center;color:#666;border-top:1px dotted\"";
	var tdHeaderStyle = "style=\"padding:10px;font-weight:bold;text-align:center;font-size:13px;color:#333;border-top:1px dotted\"";
	var customerEmail = "";

	if(customerSearch != null){
		customerEmail = customerSearch[0].getValue('email');
		if(customerSearch[0].getValue('isperson') == 'T')
				customTagValues['NL_CUSTOMER_NAME'] = customerSearch[0].getValue('firstname');
			else
				customTagValues['NL_CUSTOMER_NAME'] = customerSearch[0].getValue('companyname');
	}
	else{
		return "Can not execute search or it is empty on Sales order to get customer details.";
	}
	if( EmialConfiguration.isEmailAvaialable(customerEmail) == false ){
		return "Customer email is empty. RecordId : " + fulfillment.getId() + " . Exited from execution.";
	}
	nlapiLogExecution('DEBUG', 'Attempt to send email : ', "Record Id : " + fulfillment.getId() + " . Email : " + customerEmail);
	var lineItemCount = fulfillment.getLineItemCount('item');
	var inventoryItems = new Array();
	var itemIndex = 1;//iine item index starts from 1 in Netsuite, not from 0
	
	var soLineItemsMap = { };
	
	for(var i = 1; i <= lineItemCount; i++){
		var itemInternalId = fulfillment.getLineItemValue('item', 'item', i);
		var itemOtpions = fulfillment.getLineItemValue('item', 'options', i);
		soLineItemsMap[itemInternalId] = {
			internalId : itemInternalId,
			quantity : fulfillment.getLineItemValue('item', 'quantity', i),
			rate : fulfillment.getLineItemValue('item', 'rate', i),
			amount : fulfillment.getLineItemValue('item', 'amount', i),
			options : (itemOtpions != null) ? itemOtpions : "-",
			'name' : '',
			'description' : '',
			'imageurl' : ''};
	}
	var soLineItemsInternalIdsArray = new Array();
	var index = 0;
	for(var property in soLineItemsMap){
		soLineItemsInternalIdsArray[index] = soLineItemsMap[property].internalId;
		index++;
	}
	var itemTypes = new Array();
	itemTypes[0] = 'InvtPart';
	itemTypes[1] = 'Kit';
	
	var filters = new Array();
	var columns = new Array();
	
	filters[0] = new nlobjSearchFilter( 'internalid', null, 'anyof', soLineItemsInternalIdsArray );
	filters[1] = new nlobjSearchFilter( 'type', null, 'anyof', itemTypes );
	columns[0] = new nlobjSearchColumn( 'displayname' );
	columns[1] = new nlobjSearchColumn( 'purchasedescription');
	columns[2] = new nlobjSearchColumn( 'description');
	columns[3] = new nlobjSearchColumn( 'internalid');
	//columns[4] = new nlobjSearchColumn( 'thumbnailurl');
	columns[4] = new nlobjSearchColumn( 'custitem_display_thumbnail');
	
	var searchresults = nlapiSearchRecord('item', null, filters, columns);
	if(searchresults == null){
			return "Can not execute search or it is empty on Sales order to get item details.";
	}
	var itemTableHtml = "<table style=\"width:480px;\"><tr>" +
			"<td " + tdHeaderStyle + ">Item</td><td " + tdHeaderStyle + " >Description</td>" + "<td " + tdHeaderStyle + ">Qty</td></tr>";
	
	for(var i = 0; searchresults != null && i < searchresults.length; i++){
		var searchResult = searchresults[i];
		var soLineItem = soLineItemsMap[ searchResult.getValue('internalid') ];
		soLineItem['name'] = searchResult.getValue('displayname');
		soLineItem['description'] = (searchResult.getValue('purchasedescription') != '') ? searchResult.getValue('purchasedescription') : searchResult.getValue('description');
		//soLineItem['imageurl'] = (searchResult.getValue('thumbnailurl') != '') ? searchResult.getValue('thumbnailurl') : '';
		soLineItem['imageurl'] = (searchResult.getValue('custitem_display_thumbnail') != '') ? searchResult.getValue('custitem_display_thumbnail') : '';
	}
	for(var property in soLineItemsMap){
		itemTableHtml += "<tr "+ trContentStyle+ ">";
		itemTableHtml += "<td "+ tdContentStyle +"><img src=\"" + soLineItemsMap[property]['imageurl'] + "\" width=100 height=80 style=\"width:100px;height:80px\" ></img></td>";
		itemTableHtml += "<td "+ tdContentStyle +">" + soLineItemsMap[property]['description'] + "</td>";
		itemTableHtml += "<td "+ tdContentStyle +">" + parseFloat(soLineItemsMap[property]['quantity']).toFixed(0) + "</td>";
		itemTableHtml += "</tr>";
	}
	itemTableHtml += "</table>";
	
	customTagValues['NL_FULLFILMENT_ITEMS_TABLE'] = itemTableHtml;
	customTagValues['NL_SALES_ORDER_TRAN_ID'] = salesOrder['tranid'];
	customTagValues['NL_TRACKING_NUMBERS'] = "";
	if(salesOrder['shipmethod'] in EmialConfiguration.UPS_SHIPPING_METHODS_ID_LIST){
		var trackingNumbersArray = salesOrder['trackingnumbers'].split("<BR>");
		if(trackingNumbersArray.length > 1){
			for(var i = 0; i < trackingNumbersArray.length; i++){
				customTagValues['NL_TRACKING_NUMBERS'] += "<a style=\"font-weight:bold;color: #f4792d; text-decoration: none\" href = \"" + EmialConfiguration.UPS_SHIPING_DETAILS_LINK + trackingNumbersArray[i] + "\"> " + 
						trackingNumbersArray[i] + "</a>";
			}
		}
		else{
			customTagValues['NL_TRACKING_NUMBERS'] = "<a style=\"font-weight:bold;color: #f4792d; text-decoration: none\" href = \"" + EmialConfiguration.UPS_SHIPING_DETAILS_LINK + salesOrder['trackingnumbers'] + "\"> " + 
						salesOrder['trackingnumbers'] + "</a>";
		}
	}
	else{
		customTagValues['NL_TRACKING_NUMBERS'] = salesOrder['trackingnumbers'];
	}
	
	try{
		var mergedEmailTempFile = nlapiMergeRecord(EmialConfiguration.FULFILL_ITEM_CREATED_EMAIL_TMPL_ID, 'itemfulfillment', fulfillment.getId(), null, null, customTagValues);
	}
	catch(e){
		throw e;
	}
	var emailSubject = mergedEmailTempFile.getName();
	var emailBody = mergedEmailTempFile.getValue();
	var recordsToAttachWith = new Object();
		recordsToAttachWith['transaction'] = fulfillment.getId();
	var subject = "Guess what: Your Poppin order is on its way!";
	
	try{
		nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, customerEmail, subject, emailBody);
		//PPT-224/REQ-25 fix
		/*attach Message record to the communication tab on Item Fulfillment record*/
		var message = nlapiCreateRecord('message');
		message.setFieldValue('message', emailBody);
		message.setFieldValue('subject', subject);
		message.setFieldValue('author', EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID);
		message.setFieldValue('recipient', fulfillment.getFieldValue('entity'));
		message.setFieldValue('transaction',  fulfillment.getId());
		nlapiSubmitRecord(message, false);
		/*-------*/
	}
	catch(e){
		throw e;
	}
	
	return EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT;
}
