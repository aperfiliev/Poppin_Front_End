var colorsMap = {
	aqua : true,
	black : true,
	brown : true,
	gray : true,
	limegreen : true,
	navy : true,
	orange : true,
	pink : true,
	poolblue : true,
	purple : true,
	red : true,
	white : true,
	yellow : true
};

function getItemsByColor(request, response) {
	try {
		var arrItems = removeEmptyValues((unescape(request
				.getParameter("sbcitems")) || "").split(","));
		var arrColumns = removeEmptyValues((request.getParameter("columns") || "")
				.split(","));
		var arrFilters = [
				new nlobjSearchFilter('isinactive', null, 'is', "F"),
				new nlobjSearchFilter('isonline', null, 'is', "T"),
				new nlobjSearchFilter('internalid', null, "is", arrItems) ];

		var objItemsLocations = {};
		for ( var k = 0; k < arrItems.length; k++)
			objItemsLocations[parseInt(arrItems[k])] = k;

		var i = 0;
		if (arrColumns.indexOf("category") == -1) {
			arrColumns.unshift(new nlobjSearchColumn('category'));
			i = 1;
		}

		for ( var len = arrColumns.length; i < len; i++)
			arrColumns[i] = new nlobjSearchColumn(arrColumns[i], null);
		var objSearch = nlapiCreateSearch('item', arrFilters, arrColumns);
		var objResultSet = objSearch.runSearch();
		var i = 0;
		var arrTempResults = [];
		var arrSearchResult = [];
		do {
			var j = i + 1000;
			arrTempResults = objResultSet.getResults(i, j);
			arrSearchResult = arrSearchResult.concat(arrTempResults);
			i = j;
		} while (arrTempResults.length == 1000)
			
		arrItems = [];
		if (arrSearchResult.length) {
			var objSearchResult = arrSearchResult[0];
			var lastItem = {
				"attributes" : getColumnsValues(objSearchResult, arrColumns),
				"id" : objSearchResult.id
			};
			var category = objSearchResult.getValue("category").split(" > ");
			category = category[category.length - 1];
			var objAddedItems = {};
			objAddedItems[objSearchResult.id] = lastItem;
			lastItem.attributes.category = category.length ? [ category ] : [];
			arrItems[objItemsLocations[lastItem.id]] = lastItem;
			var objAddedCats = {};
			objAddedCats[objSearchResult.id] = {};
			objAddedCats[objSearchResult.id][category] = true;
			var j = 1;
			for ( var i = 1, len = arrSearchResult.length; i < len; i++) {
				objSearchResult = arrSearchResult[i];
				category = objSearchResult.getValue("category").split(" > ");
				category = category[category.length - 1];
				if (!!objAddedItems[objSearchResult.id]) {
					if (category.length
							&& !objAddedCats[objSearchResult.id][category]
							&& !isColor(category)) {
						objAddedItems[objSearchResult.id].attributes.category
								.push(category);
						objAddedCats[objSearchResult.id][category] = true;
					}
				} else {
					lastItem = {
						"attributes" : getColumnsValues(objSearchResult,
								arrColumns),
						"id" : objSearchResult.id
					};
					lastItem.attributes.category = category.length ? [ category ]
							: [];
					objAddedItems[objSearchResult.id] = lastItem;
					arrItems[objItemsLocations[lastItem.id]] = lastItem;
					objAddedCats[objSearchResult.id] = {};
					objAddedCats[objSearchResult.id][category] = true;
				}
			}
		}
		response.write(JSON.stringify(arrItems));
	} catch (e) {
		getErrorMessage(e, "getItemsByColor");
		response.write("{\"error\":1}");
	}
}

function removeEmptyValues(arrVals) {
	var arrReturn = [];
	for ( var i = 0, len = arrVals.length; i < len; i++)
		if (arrVals[i].trim() != "")
			arrReturn.push(arrVals[i]);
	return arrReturn;
}

function isColor(strCategoryName) {
	return colorsMap[strCategoryName.toLowerCase().replace(/\s+/g, "")] == true;
}
