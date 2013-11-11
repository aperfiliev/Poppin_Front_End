/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
function service( request, response ) {
	var retobj = {
			header: {
				status: {
					code: 'SUCCESS',
					message: 'success'
				}
			},
			result: {
				promocode: {}
			}
		};

	try {
		var data = JSON.parse(request.getBody()),
			method = data.method,
			params = data.params,
			container = nlapiGetWebContainer(),
			session = container.getShoppingSession(),
			order = session.getOrder(),
			// all methods require user to be logged in. Lets make sure that.
			isLoggedIn = session.isLoggedIn();

		if (!isLoggedIn) {
			retobj.header.status.code = 'ERR_USER_NOT_LOGGED_IN';
			retobj.header.status.message = 'Not logged In';
			response.writeLine( JSON.stringify( retobj ) );
			return;
		}
		
		if (method == 'placeOrder') {
			var result = order.submit();
			
			if (result.statuscode != 'success') {
				retobj.header.status.code = 'ERR_UNEXPECTED';
				retobj.header.status.message = result.statuscode;
			}
			else {
				retobj.result = result;
			}
		}
		else if (method == 'applyPromo') {
		    var promocode = params.promocode;
		    try
		    {
		    	nlapiLogExecution("DEBUG", "PROMOCODE CHECKOUT",  JSON.stringify(params));
		    	if(JSON.stringify(promocode) == "{}"){
 					code = "ERR_WS_EMPTY_COUPON";
 					msg = "Coupon code is empty"; 	
 					retobj.header.status.code = code;
 					retobj.header.status.message = msg; 					
 	        	}else{
 	        		var updateResult = orderObj.applyPromotionCode(promocode);
 	        	}			
 	        }
			catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if (method == 'removePromo') {
			try {
				retobj.result = order.removePromotionCode( params.promocode );
			}
			catch (e) {
				var error = nlapiCreateError(e);
				code = error.getCode();
				msg = error.getDetails();

				retobj.header.status.code = code;
				retobj.header.status.message = msg;
			}
		}
		else if ( method == 'applyGiftCertificate' ) {
			order.applyGiftCertificate( params.certificate );
			retobj.result.appliedcertificate = params.certificate;
		}
		else if (method == 'removeAllGiftCertificates') {
			retobj.result = order.removeAllGiftCertificates();
		}
		else if ( method == 'setTermsAndConditions' ) {
			order.setTermsAndConditions( params.termsAgreed );
		}
		else if ( method == 'get' || method == 'getAll' ) {
			retobj.result.shipmethod = order.getFieldValues(['shipmethod']);
			retobj.result.shipmethods = order.getFieldValues(['shipmethods']);
			retobj.result.giftcertificates = order.getFieldValues(['giftcertificates']);
			retobj.result.promocodes = order.getFieldValues(['promocodes']);
			retobj.result.agreetermcondition = order.getFieldValues(['agreetermcondition']);
			retobj.result.billaddress = order.getFieldValues(['billaddress']);
			retobj.result.shipaddress = order.getFieldValues(['shipaddress']);
			retobj.result.payment = order.getFieldValues(['payment']);
			retobj.result.summary = order.getFieldValues(['summary']);
		}
		else {
			retobj.header.status.code = 'ERR_NO_METHOD_FOUND';
			retobj.header.status.message = 'Method not found.';
			response.writeLine( retobj );
			return;
		}

		var orderFields = session.getOrder().getFieldValues(['promocodes', 'giftcertificates', 'agreetermcondition']),
			promocodes = orderFields.promocodes,
			giftcertificates = orderFields.giftcertificates,
			checkout = session.getSiteSettings().checkout;
		
		if ( promocodes && promocodes.length ) {
		   retobj.result.promocode = promocodes[0];
		}

		if ( giftcertificates && giftcertificates.length ) {
		   retobj.result.giftcertificates = giftcertificates;
		}

		retobj.result.terms = {
			required: checkout.requiretermsandconditions == 'T',
			agreed: orderFields.agreetermcondition == 'T',
			template: checkout.termsandconditions
		};
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
			code = error.getCode();
			msg = error.getDetails();
			nlapiLogExecution( 'DEBUG', 'unexpected error', msg );
		}

		retobj.header.status.code = code;
		retobj.header.status.message = msg;
	}

	response.setContentType('JSON');
	response.writeLine( JSON.stringify( retobj ) );
}