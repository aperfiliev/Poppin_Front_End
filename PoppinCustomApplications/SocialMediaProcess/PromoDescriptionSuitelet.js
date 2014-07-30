/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Sep 2013     sforostiuk
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	try{
		var code = request.getParameter('code');
		nlapiLogExecution('DEBUG','search code',code);
		var internalid = request.getParameter('internalid');
		nlapiLogExecution('DEBUG','internal id',internalid);
		
		var couponcolumns = [];
		var couponfilters = [];
		couponcolumns[0]= new nlobjSearchColumn('promotion');
		//couponfilters[0] = new nlobjSearchFilter('internalid', null, 'is', internalid, null);
		couponfilters[0] = new nlobjSearchFilter('code', null, 'is', code, null);
		var couponsearchresults = nlapiSearchRecord('couponcode', null, couponfilters, couponcolumns);
		if(couponsearchresults){
			nlapiLogExecution('DEBUG','promotion id',couponsearchresults[0].getValue(couponcolumns[0]));
		}
		//------------
		var columns = [];
		columns[0]= new nlobjSearchColumn('custrecord_promo_details_html');
		columns[1]= new nlobjSearchColumn('description');
		var filters = [];
		var description = '';
		if(couponsearchresults){
			//filters[0] = new nlobjSearchFilter('internalid', null, 'is', internalid, null);
			filters[0] = new nlobjSearchFilter('name', null, 'is', couponsearchresults[0].getValue(couponcolumns[0]), null);
			var searchresults = nlapiSearchRecord('promotioncode', null, filters, columns);
			
			description = searchresults[0].getValue(columns[0]);
			nlapiLogExecution('DEBUG','column 0',searchresults[0].getValue(columns[0]));
			nlapiLogExecution('DEBUG','description 1',description);
			nlapiLogExecution('DEBUG','name',searchresults[0].getValue(columns[2]));
			nlapiLogExecution('DEBUG','code',searchresults[0].getValue(columns[3]));
			if (description === '') {
				description = searchresults[0].getValue(columns[1]);
				nlapiLogExecution('DEBUG','column 1',searchresults[0].getValue(columns[1]));
				nlapiLogExecution('DEBUG','description 2',description);
			}
			
		}
		
		response.write(description);
	}
	catch(e){
		nlapiLogExecution('ERROR','unhandled exception',e.getCode() + ' ' + e.getDetails());
	}
}
