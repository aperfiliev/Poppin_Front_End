function getCartItemNames(request, response) {
	var items = request.getParameter("_ids").split(",");
	var respObj = {};
	response.setContentType('JSON');
	if (items.length == 1 && items[0] == "") {
		response.write(respObj);
		return;
	}
	var arrFilter = [ new nlobjSearchFilter("internalid", null, "is", items) ];
	var results = nlapiSearchRecord("item", null, arrFilter,
			[ new nlobjSearchColumn("displayname") ]);
	for ( var i = 0; i < results.length; i++)
		respObj[results[i].id] = unescape(results[i].getValue("displayname"));
	response.write(JSON.stringify(respObj));
}