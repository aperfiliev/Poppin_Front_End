function isPromoItem(request, response) {
try{
	var itemID = request.getParameter("_promoitemid");
	nlapiLogExecution("DEBUG", "ispromoitem item id", itemID);
	var arrFilters = [
			new nlobjSearchFilter("custitem_ispromotional", null, "is", "T"),
			new nlobjSearchFilter("internalid", null, "is", itemID) ];
	var arrItems = nlapiSearchRecord('item', null, arrFilters, null);
	nlapiLogExecution("DEBUG", "ispromoitem", arrItems instanceof Array
			&& arrItems.length);
	if (arrItems instanceof Array && arrItems.length) {
		nlapiLogExecution("DEBUG", "ispromoitem", "IS!");
		response.write("1");
	} else {
		response.write("");
	}
}catch(e){
response.write("");
}
}