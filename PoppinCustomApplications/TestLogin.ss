/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Apr 2014     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function service(request, response){
	// saving items to variable
	var orderObj = nlapiGetWebContainer().getShoppingSession().getOrder();
	
	//if we comment this line - everything works fine and login successfully
	var items = orderObj.getItems(["internalId", "quantity"]);
	nlapiLogExecution('DEBUG','login result 2',JSON.stringify(items));
	params = {
			"email":"tojinada@zoho.com",
			"password":"poppin"
			}
	
	result = nlapiGetWebContainer().getShoppingSession().login(params);

	result.redirecturl = nlapiGetWebContainer().getStandardTagLibrary().getCartUrl();
	nlapiLogExecution('DEBUG','login result 2',JSON.stringify(result));
	var loggedin = result.redirecturl.indexOf('cart=')==-1?'failure':'success';
	response.write(result.redirecturl+'\n'+loggedin +'\n items object: \n'+ JSON.stringify(items));
}
