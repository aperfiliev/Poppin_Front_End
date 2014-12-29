/**
 * Module Description
 * 
 * Version	Date			Author		   Remarks
 * 1.00	   27 Aug 2013	 sforostiuk
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function service(request, response) {
	var returnval = null;
	try {
		var shoppingSession = nlapiGetWebContainer().getShoppingSession();
		var siteSetting = shoppingSession.getSiteSettings([ 'touchpoints' ]);
		var viewcart = siteSetting.touchpoints.viewcart;
		var homeurl = 'https://' + request.getHeader('Host') + siteSetting.touchpoints.checkout;
		var joint = ~homeurl.indexOf('?') ? '&' : '?';
		homeurl = homeurl + joint + 'paypal=DONE&fragment=review';


		var checkoutSetting = {
			type : 'paypalexpress',
			continueurl : homeurl,
			cancelurl : viewcart
		};

		nlapiGetWebContainer().getShoppingSession().proceedToCheckout(checkoutSetting);
	} catch (e) {
		var nle = nlapiCreateError(e);
		code = nle.getCode();
		msg = nle.getDetails();

		nlapiLogExecution('DEBUG', 'paypal checkout error', code + '\n' + msg);
		returnval = {
			status : 'error',
			reasoncode : code,
			message : msg
		};
		response.writeLine(JSON.stringify(returnval));
	}
}