function getOrderData(request, response) {
	var flDiscount = 0;
	var arrItems = [];
	try {
		var promoCode = request.getParameter("promocode");
		var arritemsInOrder = unescape(request.getParameter("orderitems"))
				.split("||");
		var objItemsMap = {};
		var arrItemsIds = [];
		var subtotal = 0;
		for ( var inum = 0, len = arritemsInOrder.length; inum < len; inum++) {
			var itemAttributes = arritemsInOrder[inum].split("|");
			var intQty = parseInt(itemAttributes[4]);
			var flPrice = parseFloat(itemAttributes[3]);
			var sku = itemAttributes[0];
			if (flPrice > 0) {
				arrItemsIds[inum] = sku;
				objItemsMap[sku] = {
					"sku" : sku,
					"productName" : itemAttributes[1],
					"productCategoryName" : itemAttributes[2],
					"productCategoryId" : itemAttributes[2],
					"price" : flPrice,
					"discount" : 0.0,
					"quantity" : intQty,
					"total" : flPrice * intQty
				};
				subtotal += objItemsMap[sku].total;
				arrItems.push(objItemsMap[sku]);
			}
		}
		var orderSubtotal = parseFloat(unescape(request
				.getParameter("subtotal")));
		flDiscount = subtotal - orderSubtotal;

		var objBasePriceCol = new nlobjSearchColumn("baseprice");
		var objOnlinePriceCol = new nlobjSearchColumn("onlineprice");
		var objSKUCol = new nlobjSearchColumn("itemid");
		var objCategoryIDCol = new nlobjSearchColumn("category");
		var relDiscount = flDiscount / subtotal;
		for ( var j = 0, len2 = arrItemsIds.length; j < len2; j++) {
			var itemById = true;
			var arrItemBasePrices = nlapiSearchRecord("item", null,
					[ new nlobjSearchFilter("internalid", null, "is",
							arrItemsIds[j]) ], [ objBasePriceCol,
							objOnlinePriceCol, objSKUCol, objCategoryIDCol ]);
			if (!arrItemBasePrices || !arrItemBasePrices.length) {
				itemById = false;
				var arrItemBasePrices = nlapiSearchRecord("item", null,
						[ new nlobjSearchFilter("itemid", null, "is",
								arrItemsIds[j]) ], [ objBasePriceCol,
								objOnlinePriceCol, objSKUCol ]);
			}
			var res = arrItemBasePrices[0];
			nlapiLogExecution("DEBUG", "Fetched base price", res
					.getValue(objBasePriceCol));
			nlapiLogExecution("DEBUG", "Fetched online price", res
					.getValue(objOnlinePriceCol));
			var basePrice = parseFloat(res.getValue(objOnlinePriceCol)
					|| res.getValue(objBasePriceCol));
			var item = objItemsMap[itemById ? res.id : res.getValue(objSKUCol)];
			var itemDisc = relDiscount * item.price;
			if (!isNaN(basePrice) && item.price < basePrice)
				item.discount = basePrice - item.price;
			flDiscount += item.discount * item.quantity;
			item.sku = arrItemBasePrices[0].getValue(objSKUCol);
			item.discount = (item.discount + itemDisc).toFixed(2);
			item.total = (item.total - itemDisc * item.quantity).toFixed(2);
			item.productCategoryName = item.productCategoryId = arrItemBasePrices[0]
					.getValue("category")
					|| 'n/a';
		}

		if (promoCode) {
			var pc = nlapiLoadRecord("promotioncode", promoCode);
			promoCode = pc.getFieldValue("code");
		}
	} catch (e) {
		getErrorMessage(e, "getOrderData");
		response
				.write("/* WARNING: The item discount data based on customer price levels may be inaccurate. */");
	}

	response.write(JSON.stringify({
		"promocode" : promoCode || '',
		"discount" : flDiscount.toFixed(2),
		"items" : arrItems
	}));
}