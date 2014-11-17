function getAvailableColors(request, response) {
    try {
        var _ids = request.getParameter("_ids").split(","),
        arrFilters = [
                new nlobjSearchFilter('internalid', null, 'is', _ids),
                new nlobjSearchFilter('isinactive', null, 'is', "F"),
                new nlobjSearchFilter('isonline', null, 'is', "T"),
                new nlobjSearchFilter('thumbnailurl', null, 'isnotempty', "T") ],
        column = new nlobjSearchColumn("thumbnailurl"),
        column2 = new nlobjSearchColumn("custitem_availablecolor_thumb"),
        arrResults = nlapiSearchRecord("item", null, arrFilters, [ column,
                column2 ]),
        objResultsMap = {},
        len = arrResults.length,
        searchElement,
        i;
        if (arrResults && len) {
            for (i = 0; i < len; i++) {
                searchElement = arrResults[i];
                fileID = searchElement.getValue(column2), strURL = (fileID ? nlapiLoadFile(
                        fileID).getURL()
                        : searchElement.getValue(column)).replace("sandbox",
                        "cdn-sb");
                objResultsMap[searchElement.id] = strURL;
            }
        }
        response.write(JSON.stringify(objResultsMap));
    } catch (e) {
        getErrorMessage(e, "getAvailableColors");
        response.write("{\"error\":1}");
    }
}