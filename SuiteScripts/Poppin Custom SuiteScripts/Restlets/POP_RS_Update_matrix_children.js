var GOVERNANCE_TRESHOLD = 100;

function updateMatrixChildrenSKUs(){

	var searchResult = nlapiSearchRecord("item", "customsearch_search_matrix_child_update", null, null);
	
	if(searchResult){
		try {
			var lastSKU = generateSKU();
			var lastUPC = generateUPC();
		} catch (ex){
			nlapiLogExecution('ERROR','Couldn\'t load last generated upc/sku values',ex);
			return {"status" : "FAULT", "reason" : "Couldn't load the sku/upc values."};
		}
		for(var i = 0; i < searchResult.length; i++){
			if (governanceLimitExceed()){
				return {"status" : "LIMIT"};
			}
			nlapiLogExecution('DEBUG','INFO :', "Setting SKU/UPC for item : " + searchResult[i].getValue('internalid'));
			nlapiLogExecution('DEBUG','INFO :', "SKU / UPC : " + lastSKU + " / " + lastUPC);
			var item;
			try {		
				item = nlapiLoadRecord(searchResult[i].getRecordType(), searchResult[i].getValue('internalid'));
			} catch (ex){			
				nlapiLogExecution('ERROR','Couldn\'t load item ' + searchResult[i].getValue('internalid'),ex);
				return {"status" : "FAULT", "reason" : "Couldn't load the item."};
			}
			item.setFieldValue('itemid', lastSKU);
			item.setFieldValue('upccode', lastUPC);
			item.setFieldValue('custitem_requires_matrix_sku_update', "F");
			
			try {		
				nlapiSubmitRecord(item, false, true);
			} catch (ex){			
				nlapiLogExecution('ERROR','Couldn\'t save item ' + item.getId(),ex);
				return {"status" : "FAULT", "reason" : "Couldn't save the item."};
			}
			lastSKU++;
			lastUPC = lastUPC.toString();
			lastUPC = lastUPC.substr(0,11);
			lastUPC = parseInt(lastUPC) + 1;
			lastUPC = lastUPC * 10 + calculateDigit(lastUPC.toString());
			lastUPC = lastUPC.toString();
			lastSKU = lastSKU.toString();
		}
	}	
	return {"status" : "OK"};
}
function generateSKU() {
	var items = new Array();
	
	var regularItemColumn = new nlobjSearchColumn('formulanumeric', null, 'max');
	regularItemColumn.setFormula("case when (LENGTH(TO_NUMBER({itemid})) = 6 and {itemid} != '880002' ) then TO_NUMBER({itemid}) else 0 end");
	
	var matrixChildColumn = new nlobjSearchColumn('formulanumeric', null, 'max');
	matrixChildColumn.setFormula("case when ( LENGTH(TO_NUMBER(SUBSTR({itemid},0,6))) = 6 and SUBSTR({itemid},7,3) = ' : ' and LENGTH(TO_NUMBER(SUBSTR({itemid},10,6))) = 6 ) then TO_NUMBER(SUBSTR({itemid},10,6)) else 0 end");
	items[0] = regularItemColumn;
	items[1] = matrixChildColumn;
	
	var searchresults = nlapiSearchRecord('item', null, null, items);
	//var SKU = parseInt(searchresults[0].getValue('formulanumeric', null, 'max')) + 1;
	var SKU = Math.max(parseInt(searchresults[0].getValue(items[0])), parseInt(searchresults[0].getValue(items[1])))  + 1;
	if(SKU == 880002) SKU = 880003;
	return SKU.toString();
}
function generateUPC() {
	var upccode = new nlobjSearchColumn('formulanumeric', null, 'max');
	upccode.setFormula("case when (LENGTH(TO_NUMBER({upccode})) = 12 and SUBSTR({upccode},0,5) = '84668') then TO_NUMBER(SUBSTR({upccode},6,6)) else 0 end");
	var searchresults = nlapiSearchRecord('item', null, null, upccode);
	var result = 84668000000 + parseInt(searchresults[0].getValue('formulanumeric', null, 'max')) + 1;
	result = result * 10 + calculateDigit(result.toString());
	return result.toString();
}
function calculateDigit(value) {
	var factor = 3;
	var sum = 0;
	for(var i = value.length; i > 0; --i) {
		sum = sum + value.substring(i - 1, i) * factor;
		factor = 4 - factor;
	}
	var result = ((1000 - sum) % 10);
	return result;
}

function governanceLimitExceed(){
	var context = nlapiGetContext();
	if( context.getRemainingUsage() < GOVERNANCE_TRESHOLD )
	{
		return true;
	}
}