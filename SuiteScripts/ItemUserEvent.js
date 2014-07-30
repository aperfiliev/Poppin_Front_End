function userEventBeforeLoad(type, form, request) {
	var itemid = form.getField('itemid');
	itemid.setMandatory(false);
	itemid.setDisplayType('disabled');
}
function userEventBeforeSubmit(type) {
	var newRec			= nlapiGetNewRecord();
	
	var isitemtypevalid	= false;
	var upccode			= newRec.getFieldValue('upccode');
	var itemtype		= newRec.getFieldValue('itemtype');
	var matrixtype		= newRec.getFieldValue('matrixtype');
	var itemtypename	= newRec.getFieldValue('itemtypename');
	var itemid			= newRec.getFieldValue('itemid');
	var environment		= nlapiGetContext().getEnvironment();	// Valid values are SANDBOX , PRODUCTION , BETA , INTERNAL.
	var producedBy		= newRec.getFieldValue('custitem35');
	if(environment == 'SANDBOX') {
		producedBy		= newRec.getFieldValue('custitem44');
	}
	var subclass		= newRec.getFieldValue('custitem29');
	var context			= nlapiGetContext().getExecutionContext();
	
	var producedByPlusItemTypePassed = false;
	
	if(matrixtype == 'CHILD' || matrixtype == 'PARENT') {
		isitemtypevalid = true;
	}
	if(itemtype == 'InvtPart' && itemtypename == 'Inventory Item') {
		isitemtypevalid = true;
	}
	if(itemtype == 'NonInvtPart' && (itemtypename == 'Non-inventory Item for Resale' || itemtypename == 'Non-inventory Item for Sale')) {
		isitemtypevalid = true;
	}
	if(itemtype == 'Kit' && itemtypename == 'Kit/Package') {
		isitemtypevalid = true;
	}
	if(itemtype == 'Kit' && itemtypename == 'Kit/Package') //produced by is null assumming that it is OK
		producedByPlusItemTypePassed = true;
	if(itemtype == 'InvtPart' && itemtypename == 'Inventory Item' && producedBy == 1)// produced by poppin
		producedByPlusItemTypePassed = true;
	if(itemtype == 'NonInvtPart' && (itemtypename == 'Non-inventory Item for Resale' || itemtypename == 'Non-inventory Item for Sale') && producedBy == 2 )	//produced by thirdParty
		producedByPlusItemTypePassed = true;
		
	//nlapiLogExecution('DEBUG', 'userEventBeforeSubmit', 'upccode:'+upccode+', itemtype:'+itemtype+', matrixtype:'+matrixtype+', itemtypename:'+itemtypename+', subclass:'+subclass+', isitemtypevalid:'+isitemtypevalid);
	nlapiLogExecution('DEBUG', 'userEventBeforeSubmit', 'upccode:'+upccode+', itemtype:'+itemtype+', matrixtype:'+matrixtype+', itemtypename:'+itemtypename+', subclass:'+subclass+', producedByPlusItemTypePassed:'+producedByPlusItemTypePassed);
	
	/*if((context == 'userinterface' && type == 'create' && isitemtypevalid)
		|| (context == 'csvimport' && type == 'create' && isitemtypevalid)) {
		var newSKU	= generateSKU();
		newRec.setFieldValue('itemid', newSKU);
	}*/
	if((context == 'userinterface' && type == 'create' && isitemtypevalid)
		|| (context == 'csvimport' && type == 'create' && isitemtypevalid)) {
		var newSKU	= generateSKU();
		newRec.setFieldValue('itemid', newSKU);
	}
	
	if((type == 'create' || type == 'edit' || type == 'xedit') && upccode !== '' && upccode !== null) {
		//checkUPC(upccode, subclass, itemtype, itemtypename);
		
		
	}
	/*if((context == 'userinterface' && upccode == '' && isitemtypevalid && producedBy == 1)
		|| (context == 'csvimport' && upccode == null && isitemtypevalid && producedBy == 1)) {
		var newUPC	= generateUPC();
		newRec.setFieldValue('upccode', newUPC);
	}*/
	if((context == 'userinterface' && upccode == '' && producedByPlusItemTypePassed)
		|| (context == 'csvimport' && upccode == null && producedByPlusItemTypePassed)) {
		var newUPC	= generateUPC();
		newRec.setFieldValue('upccode', newUPC);
	}
	
	nlapiLogExecution('DEBUG', 'userEventBeforeSubmit', 'matrixtype = ' + matrixtype);
}
function userEventAfterSubmit(type) {
	
	nlapiLogExecution('DEBUG', 'userEventAfterSubmit', 'userEventAfterSubmit');
	
}
/*function generateSKU() {
	var itemid = new nlobjSearchColumn('formulanumeric', null, 'max');
	itemid.setFormula("case when (LENGTH(TO_NUMBER({itemid})) = 6 and {itemid} != '880002' ) then TO_NUMBER({itemid}) else 0 end");
	var searchresults = nlapiSearchRecord('item', null, null, itemid);
	var SKU = parseInt(searchresults[0].getValue('formulanumeric', null, 'max')) + 1;
	if(SKU == 880002) SKU = 880003;
	return SKU.toString();
}*/
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

function checkUPC(upccode, subclass, itemtype, itemtypename){
	
	//TODO:
	//Out of Scope for UPC:
	//1. If user inputs a UPC Code that is assigned to another item record:
	//1.1. Item Type must be the same for both records
	//1.2. Subclass Level 1 must be the same for both records
	//1.3. If either condition is not met, do not save record and display error message

	var filters = [];
	filters[0] = new nlobjSearchFilter('upccode', null, 'is', upccode, null);
	var searchresults = nlapiSearchRecord('item', null, filters);
	
	var results = JSON.stringify(searchresults[0]);
	
	var i1 = searchresults[0].getValue('recordtype');
	var i2 = searchresults[0].id;
	
	nlapiLogExecution('DEBUG', 'searchresults', 'recordtype:'+i1+', id:'+i2);
	nlapiLogExecution('DEBUG', 'results', results);
}