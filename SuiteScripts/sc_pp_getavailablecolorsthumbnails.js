function getAvailableColors(request, response) {
	try {
		var _ids = request.getParameter("_ids").split(",");
nlapiLogExecution('DEBUG',JSON.stringify(_ids));
		var arrFilters = [
				new nlobjSearchFilter('internalid', null, 'is', _ids),
				new nlobjSearchFilter('isinactive', null, 'is', "F"),
				new nlobjSearchFilter('isonline', null, 'is', "T"),
				new nlobjSearchFilter('thumbnailurl', null, 'isnotempty', "T") ];
		var column = new nlobjSearchColumn("thumbnailurl");
		var column2 = new nlobjSearchColumn("custitem_availablecolor_thumb");
		var arrResults = nlapiSearchRecord("item", null, arrFilters, [ column,
				column2 ]);
		var objResultsMap = {};
nlapiLogExecution('DEBUG','arrResults',JSON.stringify(arrResults));
		if (arrResults && arrResults.length) {
			for ( var i = 0, len = arrResults.length; i < len; i++) {
				var fileID = arrResults[i].getValue(column2), strURL = (fileID ? nlapiLoadFile(
						fileID).getURL()
						: arrResults[i].getValue(column)).replace("sandbox",
						"cdn-sb");
				objResultsMap[arrResults[i].id] = strURL;
			}
		}
		response.write(JSON.stringify(objResultsMap));
	} catch (e) {
		getErrorMessage(e, "getAvailableColors");
		response.write("{\"error\":1}");
	}
}