function sendOrderCreatedEmail(type) {
	if(type == 'create'){
		try{
			var salesOrder = nlapiGetNewRecord();
			var customerId = salesOrder.getFieldValue('entity');
			var customerEmail = "";
			var customerFilters = new Array();
			var customerColumns = new Array();
			
			var department = salesOrder.getFieldValue('department');
			
			customerFilters[0] = new nlobjSearchFilter( 'internalid', null, 'is', customerId );
			customerColumns[0] = new nlobjSearchColumn( 'firstname' );
			customerColumns[1] = new nlobjSearchColumn( 'email' );
			customerColumns[2] = new nlobjSearchColumn( 'isperson' );
			customerColumns[3] = new nlobjSearchColumn( 'companyname' );
		
			var searchResult = nlapiSearchRecord('customer', null, customerFilters, customerColumns);
			if(searchResult == null){
				ErrorLogger.logerror(resultString, "SALES ORDER RECIEVED EMAIL : Can not execute search or it is empty on Sales order to get customer details.");
				return;
			}
			customerEmail = searchResult[0].getValue('email');
			if( EmialConfiguration.isEmailAvaialable(customerEmail) == false ){
				ErrorLogger.logerror("Customer email is empty. RecordId : " + salesOrder.getId() + " . Exiting from execution.",
					"SALES ORDER RECIEVED EMAIL : Error appeared on attempt to send an Email");
				return;				
			}
			//nlapiLogExecution('DEBUG', 'department', department);
			//nlapiLogExecution('DEBUG', 'email', customerEmail);
			//department == '' : orders that are sent from web-site has a NULL department because this field is unsettable from WEB.
			//Assuming that if it is empty (e.g. equals to '' ) - department is WEB
			//if( ( customerEmail in EmialConfiguration.WS_INTEGRATION_CSTMR_EMAILS ) == false || ( department != null && department == EmialConfiguration.WEB_DEPARTMENT_ID )){
			if( ( customerEmail in EmialConfiguration.WS_INTEGRATION_CSTMR_EMAILS ) == false && 
				( department == '' || department in EmialConfiguration.ALLOWED_DEPARTMENTS == true ) )
			{
				var customer = {'firstname' : '', 'email' : customerEmail};
				if(searchResult[0].getValue('isperson') == 'T')
					customer['firstname'] = searchResult[0].getValue('firstname');
				else
					customer['firstname'] = searchResult[0].getValue('companyname');

				var resultString = tryPrepareAndSendEmail(salesOrder, customer);
				if(resultString == EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT){
					nlapiLogExecution('DEBUG', 'Attempt to send email : ', "OK");	
				}
				else{
					ErrorLogger.logerror(resultString, "SALES ORDER RECIEVED EMAIL : Error appeared on attempt to send an Email");
					//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
				}
			}
			else{
				nlapiLogExecution('DEBUG', 'Attempt to send email : ', 'NO. Sales order is sent from INTEGRATION app.');	
			}
		}
		catch(e){
			ErrorLogger.logExceptionError(e, "SALES ORDER RECIEVED EMAIL : Error appeared on attempt to send an Email");
			//nlapiLogExecution('ERROR', 'Attempt to send email : ', resultString);	
		}
	}
}
function tryPrepareAndSendEmail(salesOrder, customer){
		nlapiLogExecution('ERROR', 'Attempt to send email : ', "Record Id : " + salesOrder.getId() + " . Email : " + customer['email']);
		var orderFilters = new Array();
		var orderColumns = new Array();
			orderFilters[0] = new nlobjSearchFilter( 'internalid', null, 'is', salesOrder.getId() );
			orderColumns[0] = new nlobjSearchColumn( 'tranid' );
			orderColumns[1] = new nlobjSearchColumn( 'department' );
		var searchResult = nlapiSearchRecord('salesorder', null, orderFilters, orderColumns);
		if(null == searchResult){
			return "Can not execute search or it is empty on Sales order to get transaction id.";
		}
		var tranId =  searchResult[0].getValue('tranid');
		//nlapiLogExecution('DEBUG', 'newRec', JSON.stringify(salesOrder));
		var customTagValues = new Array();
		customTagValues['NL_CUSTOMER_NAME'] = customer['firstname'];
		
		var trContentStyle = "style=\"font-size:13px\"";
		var tdContentStyle = "style=\"padding:10px;text-align:center;color:#666;border-top:1px dotted\"";
		var tdHeaderStyle = "style=\"padding:10px;font-weight:bold;text-align:center;font-size:13px;color:#333;border-top:1px dotted\"";
		var tdHeaderLeftAlignStyle = "style=\"padding:10px;font-weight:bold;text-align:left;font-size:13px;color:#333;border-top:1px dotted\"";
		var tdContentLeftAlignStyle = "style=\"padding:10px;text-align:left;color:#666;border-top:1px dotted\"";
		
		
		var shipMethodFilters = new Array();
		var shipMethodColums = new Array();
		shipMethodFilters[0] = new nlobjSearchFilter( 'custrecordshipmethod', null, 'is', salesOrder.getFieldValue('shipmethod') );
		shipMethodColums[0] = new nlobjSearchColumn( 'custrecorddisplayname' );
		var searchResult = nlapiSearchRecord('customrecord_shipmethodid_to_displayname', null, shipMethodFilters, shipMethodColums);
		if(null == searchResult){
			return "Can not execute search or it is empty on Sales order to get shipment method details.";
		}
		var deliveryDays = searchResult[0].getValue('custrecorddisplayname');
		var lineItemCount = salesOrder.getLineItemCount('item');
		var inventoryItems = new Array();
		var itemIndex = 1;//iine item index starts from 1 in Netsuite, not from 0
		
		var soLineItemsMap = { };
		
		for(var i = 1; i <= lineItemCount; i++){
			var itemInternalId = salesOrder.getLineItemValue('item', 'item', i);
			var itemOtpions = salesOrder.getLineItemValue('item', 'options', i);
			if( itemInternalId in  soLineItemsMap){
				soLineItemsMap[itemInternalId].quantity = parseInt(soLineItemsMap[itemInternalId].quantity, 10) + parseInt(salesOrder.getLineItemValue('item', 'quantity', i),10);
				soLineItemsMap[itemInternalId].amount = parseInt(soLineItemsMap[itemInternalId].amount, 10) + parseInt(salesOrder.getLineItemValue('item', 'amount', i),10);
			}
			else{
				soLineItemsMap[itemInternalId] = {
					internalId : itemInternalId,
					quantity : salesOrder.getLineItemValue('item', 'quantity', i),
					rate : salesOrder.getLineItemValue('item', 'rate', i),
					amount : salesOrder.getLineItemValue('item', 'amount', i),
					options : (itemOtpions != null) ? itemOtpions : "-",
					'name' : '',
					'description' : '',
					'imageurl' : ''};
			}
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
		itemTypes[2] = 'GiftCert';
		
		
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
		if(null == searchresults){
			return "Can not execute search or it is empty on Sales order to get item details.";
		}
		var itemTableHtml = "<table style=\"width:480px\"><tr><td " + tdHeaderStyle +">Item</td><td " + tdHeaderLeftAlignStyle + ">Description</td>" +
					"<td " + tdHeaderStyle + ">Price</td><td " + tdHeaderStyle + ">Qty</td><td " + tdHeaderStyle + ">Total</td></tr>";
		
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
			itemTableHtml += "<td "+ tdContentStyle +"><img src=\"" + soLineItemsMap[property]['imageurl'] + "\" width=100 height=80 style=\"width:100px;height:80px\"\ ></img></td>";
			itemTableHtml += "<td "+ tdContentLeftAlignStyle +" >" + soLineItemsMap[property]['description'] + "</td>";
			itemTableHtml += "<td "+ tdContentStyle +">$" + parseFloat(soLineItemsMap[property]['rate']).toFixed(2) + "</td>";
			itemTableHtml += "<td "+ tdContentStyle +">" + parseFloat(soLineItemsMap[property]['quantity']).toFixed(0) + "</td>";
			itemTableHtml += "<td "+ tdContentStyle +">$" + parseFloat(soLineItemsMap[property]['amount']).toFixed(2) + "</td>";
			itemTableHtml += "</tr>";
		}
		itemTableHtml += "</table>";
		
		customTagValues['NL_SALES_ORDER_SHIP_TO_ADDRESS'] = salesOrder.getFieldValue('shipaddress');
		customTagValues['NL_SALES_ORDER_BILL_TO_ADDRESS'] = salesOrder.getFieldValue('billaddress');
		customTagValues['NL_SALES_ORDER_SUB_TOTAL'] = salesOrder.getFieldValue('subtotal');
		customTagValues['NL_SALES_ORDER_SHIPPING_COST'] = salesOrder.getFieldValue('shippingcost');
		customTagValues['NL_SALES_ORDER_TAX'] = salesOrder.getFieldValue('taxtotal');
		customTagValues['NL_SALES_ORDER_TOTAL'] = salesOrder.getFieldValue('total');
		customTagValues['NL_SALES_ORDER_DELIVERY'] = deliveryDays;
		
		customTagValues['NL_SALES_ORDER_DISCOUNT'] = ( salesOrder.getFieldValue('discounttotal') == 0.00) ? " " : "<tr><td style=\"color:#999;font-size:12px\">Promo code</td>"
													+ "<td style=\"color:red;font-size:12px\" >$" + salesOrder.getFieldValue('discounttotal') + "</td></tr>";
		customTagValues['NL_SALES_ORDER_GC'] = ( salesOrder.getFieldValue('giftcertapplied') == 0.00) ? " " : "<tr><td style=\"font-size:12px;font-weight:bold;\">Gift Card Applied</td>"
													+ "<td style=\"font-size:12px;font-weight:bold;\" >($" + salesOrder.getFieldValue('giftcertapplied') + ")</td></tr>";
		
		customTagValues['NL_SALES_ORDER_ITEMS_TABLE'] = itemTableHtml;
		try{
			var mergedEmailTempFile = nlapiMergeRecord(EmialConfiguration.SALES_ORDER_CREATED_EMAIL_TMPL_ID, 'salesorder', salesOrder.getId(), null, null, customTagValues);
		}
		catch(e){
			throw e;
		}
		var emailSubject = mergedEmailTempFile.getName();
		var emailBody = mergedEmailTempFile.getValue();
		var recordsToAttachWith = new Object();
		recordsToAttachWith['transaction'] = salesOrder.getId();
		try{
			nlapiSendEmail(EmialConfiguration.EMAIL_AUTHOR_EMPLOYEE_ID, customer['email'], "Smile! Your Poppin order [" + tranId + "] has been received", emailBody, null,null, recordsToAttachWith);
		}
		catch(e){
			throw e;
		}
		return EmialConfiguration.SUCCESS_EMAIL_SEND_ATTEMPT;
}
function setDepartmentBeforeSubmit(){
	if(type == 'create'){
		var salesOrder = nlapiGetNewRecord();
		var department = salesOrder.getFieldValue('department');
		nlapiLogExecution('DEBUG', 'BEFORE SUBMIT : source', salesOrder.getFieldValue('source'));
		if(department == '' || department == null || department == undefined){	
			salesOrder.setFieldValue('department', '1');
			nlapiLogExecution('DEBUG', 'BEFORE SUBMIT :', 'Setting SalesOrder department to Web.');
		}
		else
			nlapiLogExecution('DEBUG', 'BEFORE SUBMIT :', 'Department is not NULL. Skipping...');
	}
}
