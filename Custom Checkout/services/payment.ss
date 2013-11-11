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
			result: {}
		};

	try {
		var data = JSON.parse(request.getBody()),
			method = data.method,
			params = data.params,
			container = nlapiGetWebContainer(),
			session = container.getShoppingSession(),
			order = session.getOrder(),
			isLoggedIn = session.isLoggedIn();

		if ( method == 'paypalexpressCheckout' ) {
			var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints,
				checkoutSettings = {
					cancelurl: touchpoints.viewcart,
					continueurl: touchpoints.home,
					createorder: 'T',
					type: 'paypalexpress'
				};

			if ( !session.isLoggedIn() ) 
				session.registerGuest();

			session.proceedToCheckout( checkoutSettings );
		}
		else if ( method == 'googleCheckout' ) {
			var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints,
				checkoutSettings = {
					continueurl: touchpoints.home,
					editorderurl: touchpoints.viewcart,
					type: 'google'
				};

			if ( !session.isLoggedIn() ) 
				session.registerGuest();

			session.proceedToCheckout( checkoutSettings );
		}
		else if ( !isLoggedIn ) {
			retobj.header.status.code = 'ERR_USER_NOT_LOGGED_IN';
			retobj.header.status.message = 'Not logged In';
		}
		else if ( method == 'get' ) {
			var result = order.getPayment();

			if ( result )  {
				retobj.result.totalfound = 1;
				retobj.result.selectedpayment = result;
			}
		}
		else if ( method == 'getAll' ) {
			var paymenttypes = session.getPaymentMethods(),
				result = order.getPayment();

			retobj.result.totalfound = paymenttypes.length;
			retobj.result.paymenttypes = paymenttypes;

			if ( result )  {
				retobj.result.totalfound++;
				retobj.result.selectedpayment = result;
			}
		}
		else if ( method == 'getAvailableTypes' ) {
			var result = session.getPaymentMethods();
			retobj.result.totalfound = result.length;
			retobj.result.paymenttypes = result;
		}
		else if ( method == 'set' ) {
			var creditCard = null;
			
			if ( params.id ) {
				creditCard = session.getCustomer().getCreditCard( params.id );
				creditCard.ccsecuritycode = params.ccsecuritycode;
			}
			else {
				creditCard = params;
			}

			if ( creditCard ) {
				try {
					order.setPayment({
						paymentterms: 'CreditCard',
						creditcard: creditCard
					});
				}
				catch (e) {
					retobj.header.status.code = 'ERR_INVALID_CREDITCARD';
					retobj.header.status.message = 'Invalid Credit Card.';
				}
			}
			else {
				retobj.header.status.code = 'ERR_INVALID_CREDITCARD';
				retobj.header.status.message = 'Credit Card not found.';
			}

			retobj.result = order.getPayment();
		}
		else {
			retobj.header.status.code = 'ERR_NO_METHOD_FOUND';
			retobj.header.status.message = 'Method not found.';
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