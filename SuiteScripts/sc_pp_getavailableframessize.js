function getAvailableFramesSizes(request, response) {
	
	try {
		
		var _ids = request.getParameter("_ids").split(",");

		var arrFilters = [
				new nlobjSearchFilter('internalid', null, 'is', _ids),
				new nlobjSearchFilter('isinactive', null, 'is', "F"),
				new nlobjSearchFilter('isonline', null, 'is', "T"),
				new nlobjSearchFilter('thumbnailurl', null, 'isnotempty', "T") ];
		
		var column = new nlobjSearchColumn("thumbnailurl");
		var column2 = new nlobjSearchColumn("custitem_availablesize_thumb");
		
		var arrResults = nlapiSearchRecord("item", null, arrFilters, [ column, column2 ]);
		var objResultsMap = {};
		
		if (arrResults && arrResults.length) {
			
			for ( var i = 0, len = arrResults.length; i < len; i++) {
				
				var fileID = arrResults[i].getValue(column2), 
					strURL = (fileID ? nlapiLoadFile(fileID).getURL(): arrResults[i].getValue(column) + "&resizeid=-1&resizew=41&resizeh=41" ).replace("sandbox","cdn-sb");

					objResultsMap[arrResults[i].id] = strURL;
			}
		}

		response.write(JSON.stringify(objResultsMap));

	} catch (e) {
		getErrorMessage(e, "getAvailableFramesSizes");
		response.write("{\"error\":1}");
	}

}