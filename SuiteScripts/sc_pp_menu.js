function getMenu(request, response) {
    var arrCols = [ new nlobjSearchColumn("name"),
            new nlobjSearchColumn("custrecord_cateogry_url"),
            new nlobjSearchColumn("custrecord_subcategories"),
            new nlobjSearchColumn("custrecord_is_root"),
            new nlobjSearchColumn("custrecord_order").setSort(),
            (new nlobjSearchColumn("created")).setSort() ],
        arrMenuItems = nlapiSearchRecord("customrecord_menu_item", null, null, arrCols),
        arrMenu      = [],
        len          = arrMenuItems.length,
        arrMenuItem,
        i;
    for (i = 0; i < len; i++) {
        arrMenuItem = arrMenuItems[i];
        if (arrMenuItem.getValue("custrecord_is_root") == "T") {
            var item = fetchItem(arrMenuItem);
            arrMenu.push(item);
        }
    }
    
    for (i = 0; i < arrMenu.length; i++)
        buildMenu(arrMenuItems, arrMenu[i].c);

    response.write(JSON.stringify(arrMenu));
}

function getItem(intId, arrMenuItems) {
    var i   = 0,
        len = arrMenuItems.length;
    while (i < len && arrMenuItems[i].id != intId)
        i++;
    len--;
    return fetchItem(splice(arrMenuItems, i));
}

function fetchItem(objSearchResult) {
    var children    = objSearchResult.getValue("custrecord_subcategories").split(","),
        arrChildren = [];
    for ( var i = 0, len = children.length; i < len; i++)
        if (children[i].replace(/\s+/g, "").length)
            arrChildren.push(children[i]);
    var item = {
        "i" : objSearchResult.getValue("custrecord_cateogry_url"),
        "n" : objSearchResult.getValue("name").replace(/\s*::.*/g,""),
        "o" : objSearchResult.getValue("custrecord_order"),
    };
    if (arrChildren.length)
        item.c = arrChildren;
    return item;
}

function buildMenu(arrMenuItems, arrMenu) {
    if (arrMenu) {
        for ( var i = 0, len = arrMenu.length; i < len; i++) {
            var item = getItem(arrMenu[i], arrMenuItems);
            buildMenu(arrMenuItems, item.c);
            arrMenu[i] = item;
        }
        arrMenu.sort(function(a, b) {
            if (a.o < b.o)
                return -1;
            else if (a.o > b.o)
                return 1;
            else
                return 0;
        });
    }
}

// Array.pop doesn't remove the desired item as espected
function pop(arr, arrDest) {
    return splice(arr, 0);
}

// Array.splice doesn't remove the desired item as espected
function splice(arr, i) {
    if (!(arr && arr.length))
        return;
    var item = arr[i];
    for ( var k = i + 1, len = arr.length; k < len; k++)
        arr[k - 1] = arr[k];
    // arr.length--; doesn't work
    return item;
}