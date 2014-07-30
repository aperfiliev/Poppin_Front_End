/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Mar 2014     sforostiuk
 *
 */

function clientPageInit(type){
	nlapiSetFieldValue('custbody10', getTotalQty(), false);
}

function clientFieldChanged(type, name, linenum){
	if ((name == 'custbody5') ) {
		var value = nlapiGetFieldValue('custbody5');
		if(value !== "") {
			var d = new Date(value);
			d.setDate(d.getDate() + 42);
			value = d.format("m/d/Y");
			nlapiSetFieldValue('custbody_expected_in_dc_date', value, false);
		}
	}
}

function clientRecalc(type){
	nlapiSetFieldValue('custbody10', getTotalQty(), false);
}

function getTotalQty(){
	var lineNum = nlapiGetLineItemCount('item');
	var total = 0;
	for(var j = 0; j < lineNum; j++) {
		total = total + parseInt(nlapiGetLineItemValue('item', 'quantity', j+1));
	}
	return total;
}