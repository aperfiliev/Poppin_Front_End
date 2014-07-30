function service(request, response) {
	
	var action = request.getParameter('action');
	response.setContentType("JSON");
	
	nlapiLogExecution('DEBUG', 'INFO', action);
	switch(action){
		
		case "get":
		
		    var	searchResults = nlapiSearchRecord('customrecord_card_message_message', 
													null, 
													[new nlobjSearchFilter('isinactive', null, 'is', 'F')],
													[
														new nlobjSearchColumn('custrecord_cardmessage_occasion'),
														new nlobjSearchColumn('custrecord_cardmessage_message')																																																																					
													]);
		    if (searchResults){

				nlapiLogExecution('DEBUG', 'INFO', JSON.stringify(searchResults));
				response.write(JSON.stringify(searchResults));

		    }else{
			
				response.write("[]");
				
			}
			
		
		break;
		case "set":
			try{
				
				var msg = request.getParameter('msg');
				var occassion = request.getParameter('occassion');
				//nlapiLogExecution('DEBUG','msg',msg);
				//nlapiLogExecution('DEBUG','occassion',occassion);
				var order = nlapiGetWebContainer().getShoppingSession().getOrder();
				
				order.setCustomFieldValues({"custbody_cardmessage" : msg });
				order.setCustomFieldValues({"custbody_cardocation" : occassion});
				var customfields = order.getCustomFieldValues();
				nlapiLogExecution('DEBUG','custom field',JSON.stringify(customfields));
				
				response.write('{"response":"ok"}');
				
				
			}catch(x){
				//nlapiLogExecution('DEBUG','catch x',JSON.stringify(x));
				response.write('{"response":"error", "detail":"' + x + '"}');
				
			}
			
		break;
		

		case "ocation":
			try{
				
				var ocationmsg = request.getParameter('ocationmsg');
				var order = nlapiGetWebContainer().getShoppingSession().getOrder();
				order.setCustomFieldValues( {"custbody_cardocation" : ocationmsg });
				response.write("{'response':'ok'}");
				
				
			}catch(x){
				
				response.write("{'response':'error', 'detail':'" + x + "'}");
				
			}
			break;
		case "getordermessage":
		
				var order = nlapiGetWebContainer().getShoppingSession().getOrder();
				var cardmessagefields = order.getCustomFieldValues();
				
				var result = {};
				for(var i = 0; i < cardmessagefields.length;i++){
					if(cardmessagefields[i].name=='custbody_cardocation'){
						result.ocation = cardmessagefields[i].value;
					}
					if(cardmessagefields[i].name=='custbody_cardmessage'){
						result.message = cardmessagefields[i].value;
					}
					
				}
				nlapiLogExecution('DEBUG','result', JSON.stringify(result));
				if(result){
					response.write(JSON.stringify(result));
				}
		break;


	}
	
}
//