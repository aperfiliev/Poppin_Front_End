/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
function service(request,response) {
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
		var data = JSON.parse( request.getBody() ),
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
			response.writeLine( JSON.stringify( retobj ) );
			return;
		}

		var customer = session.getCustomer();

		if ( method == 'getAll' ) {
			var result = customer.getCreditCards();
			if ( result ) {
				retobj.result.totalfound = result.length;
				retobj.result.creditcards = result;
			}
			else {
				retobj.result.totalfound = 0;
				retobj.result.creditcards = [];
			}
		}
		else if ( method == 'add' ) {
			var result = customer.addCreditCard( params );
			retobj.result.id = result;

		}
		else if ( method == 'get' ) {
			var result = customer.getCreditCard( params.id );
			retobj.result.totalfound = 1;
			retobj.result.creditcards = [ result ];
		}
		else if ( method == 'update' ) {
			var result = customer.updateCreditCard( params );
		}
		else if ( method == 'remove' ) {
			var id = params.id;

			if ( !id ) {
				id = customer.addCreditCard( params );
			}

			retobj.result = customer.removeCreditCard( id );
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