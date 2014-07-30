function _exceedsQtyLimit(intItemID) {
	var res = nlapiRequestURL("https://forms.netsuite.com/app/site/hosting/scriptlet.nl?script=185&deploy=1&compid=3363929&h=c5de41305bd993c17d13&_promoitemid="
			+ intItemID);
	return res.getBody() == "1";
}

function controlLineQty() {
	var itemID = nlapiGetCurrentLineItemValue('item', 'item');
	if (_exceedsQtyLimit(itemID))
		nlapiSetCurrentLineItemValue('item', 'quantity', 1);
	return true;
}