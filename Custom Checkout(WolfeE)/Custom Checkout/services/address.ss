/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
function service( request,response ) {
	var retobj = {
			header: {
				status: {
					code: 'SUCCESS',
					message: 'success'
				}
			},
			result: {}
		};

	try {
		var data = JSON.parse( request.getBody() || request.getParameter('data' ) ),
			method = data.method,
			params = data.params,
			container = nlapiGetWebContainer(),
			session = container.getShoppingSession(),
			isLoggedIn = session.isLoggedIn();

		// all methods require user to be logged in. Lets make sure that.
		if ( !isLoggedIn ) {
			retobj.header.status.code = 'ERR_USER_NOT_LOGGED_IN';
			retobj.header.status.message = 'Not logged In';

			response.setContentType('JSON');
			response.write( JSON.stringify( retobj ) );
			return;
		}
					
		var customer = session.getCustomer(),
			order = session.getOrder();

		if ( method == 'getAll' ) {
			var address = customer.getAddressBook();
			if ( address ) {
				var shippingAddress = order.getShippingAddress(),
					billingAddress = order.getBillingAddress();
			
				retobj.result.totalfound = address.length;
				retobj.result.addresses = address;
				
				if ( shippingAddress && shippingAddress.internalid ) {
					retobj.result.selectedshippingaddressid = shippingAddress.internalid;
				}else if ( address.length ) {
					if(address.length == 1){
						var addressid = address[0].internalid,
						result = order.setShippingAddress( addressid );
						retobj.result.selectedshippingaddressid = addressid;
					}else{
						var selected = false;
						for(var i = 0; i < address.length; i++) {
							if(address[i].defaultshipping === "T"){
								var addressid = address[i].internalid,
								result = order.setShippingAddress( addressid );
								retobj.result.selectedshippingaddressid = addressid;
								selected = true;
							}
						}
						if(!selected){
							// Always select the last one if none is choosen.
							var addressid = address[address.length-1].internalid,
							result = order.setShippingAddress( addressid );
							retobj.result.selectedshippingaddressid = addressid;
						}
					}
				}
				
				if ( billingAddress && billingAddress.internalid ) {
					retobj.result.selectedbillingaddressid = billingAddress.internalid;
				}
				else if ( address.length ) {
					if(address.length == 1){
						var addressid = address[0].internalid,
				 		result = order.setBillingAddress( addressid );
						retobj.result.selectedbillingaddressid = addressid;
					}else{
						var selected = false;
						for(var i = 0; i < address.length; i++) {
							if(address[i].defaultbilling === "T"){
								var addressid = address[i].internalid,
								result = order.setBillingAddress( addressid );
								retobj.result.selectedbillingaddressid = addressid;
								selected = true;
							}
						}
						if(!selected){
							// Always select the last one if none is choosen.
							var addressid = address[address.length-1].internalid,
							result = order.setBillingAddress( addressid );
							retobj.result.selectedbillingaddressid = addressid;
						}
					}
				}
			}
			else {
				retobj.result.totalFound = 0;
				retobj.result.addresses = [];
			}
		}
		else if ( method == 'get') {
			var address = customer.getAddress( params.id );
			
			if ( address ) {
				retobj.result.totalFound = 1;
				retobj.result.addresses = [ address ];
			}
		}
		else if ( method == 'update') {
			var result = customer.updateAddress( params.address );
		}
		else if ( method == 'getShipping') {
			var shippingAddress = order.getShippingAddress();

			if ( shippingAddress ) {
				retobj.result.totalfound = 1;
				retobj.result.addresses = [ shippingAddress ];
			}
		}
		else if ( method == 'getBilling') {
			var billingAddress = order.getBillingAddress();

			if ( billingAddress ) {
				retobj.result.totalfound = 1;
				retobj.result.addresses = [ billingAddress ];
			}
		}
		else if ( method == 'setShipping') {
			var result = order.setShippingAddress( params.id );
		}
		else if ( method == 'setBilling') {
			var result = order.setBillingAddress( params.id );
		}
		else if ( method == 'add') {
			var address = params.address,
				result = customer.addAddress( address );

			if ( result ) {
				address.internalid = result;
				
				var addressArray = customer.getAddressBook();

				if ( addressArray.length == 1 ) {
					// Auto select this address to be shipping and billing.
					var addressid = addressArray[0].internalid;

					order.setShippingAddress( addressid );
					order.setBillingAddress( addressid );
				
					retobj.result.selectedshippingaddressid = addressid;
					retobj.result.selectedbillingaddressid = addressid;
				}
				
				retobj.result.addresses = [ address ];
			}
		}
		else if ( method == 'remove') {
			var result = customer.removeAddress( params.id );
		}
		else {
			retobj.header.status.code = 'ERR_NO_METHOD_FOUND';
			retobj.header.status.message = 'No method found.';
		}
	}
	catch (e) {
		var code = 'ERR_UNEXPECTED',
			msg = 'error';

		if ( e instanceof nlobjError ) {
			code = e.getCode();
			msg = e.getDetails();
			nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
		}
		else {
			var error = nlapiCreateError(e);
			if ( error instanceof nlobjError ) {
				code = error.getCode();
				msg = error.getDetails();
				nlapiLogExecution( 'DEBUG', 'unexpected error', e.getCode() + '\n' + e.getDetails() );
			}
		}

		retobj.header.status.code = code;
		retobj.header.status.message = msg;
	}

	response.setContentType('JSON');
	response.writeLine( JSON.stringify( retobj ) );
}