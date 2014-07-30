/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jul 2013     ashykalov
 *
 */

/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object
 */
function getRESTlet(dataIn) {
	var resultstring = '';
	for(var fieldname in datain)
		{
			if(datain.hasOwnProperty(fieldname))
				{
					resultstring += fieldname + ': ' + datain[fieldname];
				}
		}
	nlapiLogExecution('DEBUG', 'datain consist:', resultstring);
	return resultstring;
}
