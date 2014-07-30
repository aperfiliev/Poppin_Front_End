function setObj(resu, pl) {
	var obj = {}, priceAttr = pl != 0 ? 'price' + pl : 'onlineprice';

	for ( var i = 0; i < resu.length; i++) {
		var cItem = resu[i].columns, itId = cItem.internalid.internalid, cPrice = parseFloat(cItem[priceAttr]);
		obj[itId] = {};
		obj[itId].url = cItem.itemurl;
		obj[itId].name = cItem.storedisplayname;
		obj[itId].name2 = cItem.itemid;
		obj[itId].imgD = cItem.custitem_conf_desktop_img;
		obj[itId].imgM = cItem.custitem_conf_mouse_over_img;
		// TODO: Uncomment in production environment:
		// obj[itId].imgM.name = "http://cdn-web.poppin.com" +
		// obj[itId].imgM.name;
		obj[itId].color = cItem.custitem_conf_web_color;
		obj[itId].type = cItem.custitem_conf_item_type;
		obj[itId].order = cItem.custitem_conf_order;
		obj[itId].price = !isNaN(cPrice) ? cPrice.toFixed(2) : '0.00';
		obj[itId].qtyAvailable = cItem.quantityavailable || getKitAvailableQty(itId);
	}
	return obj;
}

function getItemsByColorOrType(req, res) {
	try {
		var pl = req.getParameter('pricelevel'), type = req
				.getParameter('type'), color = req.getParameter('color'), plId = 0, filters = [ new nlobjSearchFilter(
				'custitem_conf_my_desk', null, 'is', 'T') ], columns = [
				new nlobjSearchColumn('itemurl'),
				new nlobjSearchColumn('onlineprice'),
				new nlobjSearchColumn('otherprices'),
				new nlobjSearchColumn('storedisplayname'),
				new nlobjSearchColumn('custitem_conf_desktop_img'),
				new nlobjSearchColumn('custitem_conf_mouse_over_img'),
				new nlobjSearchColumn('custitem_conf_web_color'),
				new nlobjSearchColumn('custitem_conf_item_type'),
				new nlobjSearchColumn('custitem_conf_order').setSort(false),
				new nlobjSearchColumn('itemid'),
				new nlobjSearchColumn('internalid'),
				new nlobjSearchColumn('quantityavailable') ], results = null;

                 filters.push(new nlobjSearchFilter('isonline', null, 'is', 'T'));

		if (type)
			filters.push(new nlobjSearchFilter('custitem_conf_item_type', null,
					'anyof', type));
		else
			filters.push(new nlobjSearchFilter('custitem_conf_web_color', null,
					'anyof', color));

		results = nlapiSearchRecord('item', null, filters, columns);

		if (results) {
			if (pl) {
				var plCols = [ new nlobjSearchColumn('internalid') ], plFilt = [ new nlobjSearchFilter(
						'name', null, 'is', pl) ], plResu = nlapiSearchRecord(
						'pricelevel', null, plFilt, plCols);

				if (plResu && plResu.length)
					plId = plResu[0].getValue('internalid');
			}

			var obj = setObj(JSON.parse(JSON.stringify(results)), plId);
			res.write(JSON.stringify(obj));
		} else {
			res.write('{"error":"No items found for that color"}');
		}
	} catch (e) {
		nlapiLogExecution('ERROR', 'There\'s been an error', e);
		res.write('{"error":"Please, check the script logs."}');
	}
}

function getKitAvailableQty(itemId) {
	nlapiLogExecution("DEBUG","getting kit qty",itemId);
	try {
		var objRequieredItems = {};
		var arrMembersIds = [];
		var kit = nlapiLoadRecord('kititem', itemId);
		var members = kit.getLineItemCount('member');
		nlapiLogExecution("DEBUG", "members", members);
		for ( var i = 1; i <= members; i++) {
			var itemId = kit.getLineItemValue('member', 'item', i);
			nlapiLogExecution("DEBUG", "foundMember", itemId);
			arrMembersIds.push(itemId);
			objRequieredItems[itemId] = kit.getLineItemValue('member',
					'quantity', i);
		}
		nlapiLogExecution("DEBUG", "members ids", arrMembersIds.join(","));
		if (!arrMembersIds.length || arrMembersIds.length < 1)
			return 1;
		var kitMembers = nlapiSearchRecord(
				'item',
				null,
				[ new nlobjSearchFilter('internalid', null, 'is', arrMembersIds) ],
				[ new nlobjSearchColumn('quantityavailable') ]);
		nlapiLogExecution("DEBUG", "debug", arrMembersIds);
		var availableQty = Number.MAX_VALUE;
		if (kitMembers && kitMembers.length) {
			nlapiLogExecution("DEBUG", "debug", "members found");
			if (kitMembers.length < members)
				return 0;
			for ( var i = 0, len = kitMembers.length; i < len; i++) {
				var reqQty = objRequieredItems[kitMembers[i].id];
				nlapiLogExecution("DEBUG", "reqQty", reqQty);
				var itemQty;
				nlapiLogExecution("DEBUG", "recordType", kitMembers[i].recordType);
				if (kitMembers[i].recordType != "kititem")
					itemQty = kitMembers[i].getValue('quantityavailable');
				else
					itemQty = getKitAvailableQty(kitMembers[i].id);
				nlapiLogExecution("DEBUG", "itemQty", itemQty);
				var qty = (itemQty - (itemQty % reqQty)) / reqQty;
				nlapiLogExecution("DEBUG", "qty", qty);
				if (qty < availableQty)
					availableQty = qty;
				nlapiLogExecution("DEBUG", "availableQty", availableQty);
			}
		}
		return availableQty;
	} catch (e) {
		nlapiLogExecution('ERROR', 'getKitAvailableQty', e);
		return 1;
	}
}